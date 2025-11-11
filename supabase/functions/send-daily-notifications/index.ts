import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getNewEventsForRegions } from './event-fetcher.ts'
import { buildDailyNotificationMessages } from './message-builder.ts'

const LINE_MESSAGING_API_URL = 'https://api.line.me/v2/bot/message'

/**
 * LINE定期通知Edge Function
 * 毎朝8時にアクティブなユーザーへ新着イベントを通知
 */
serve(async (req) => {
  console.log('Starting daily notification job...')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
  if (!accessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not set')
    return new Response('Server configuration error', { status: 500 })
  }

  try {
    // アクティブなLINEユーザー取得
    const { data: users, error: usersError } = await supabase
      .from('line_users')
      .select('*')
      .eq('is_active', true)

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      throw usersError
    }

    if (!users || users.length === 0) {
      console.log('No active users found')
      return new Response(JSON.stringify({
        success: true,
        message: 'No active users to notify'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${users.length} active users`)

    let successCount = 0
    let failureCount = 0
    const notifiedEventIds: string[] = []

    // 各ユーザーに通知
    for (const user of users) {
      try {
        // ユーザーの地域に合わせた新着イベント取得
        const events = await getNewEventsForRegions(
          supabase,
          user.regions || ['飯田市'],
          3 // 最大3件
        )

        if (events.length === 0) {
          console.log(`No new events for user ${user.line_user_id}`)
          continue
        }

        // メッセージ構築
        const messages = buildDailyNotificationMessages(events)

        if (messages.length === 0) {
          continue
        }

        // LINE メッセージ送信
        const response = await fetch(`${LINE_MESSAGING_API_URL}/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            to: user.line_user_id,
            messages
          })
        })

        if (!response.ok) {
          const error = await response.text()
          console.error(`Failed to send message to ${user.line_user_id}:`, error)
          failureCount++
        } else {
          console.log(`Successfully sent notification to ${user.line_user_id}`)
          successCount++

          // 通知したイベントIDを記録
          events.forEach(e => {
            if (!notifiedEventIds.includes(e.id)) {
              notifiedEventIds.push(e.id)
            }
          })
        }

      } catch (error) {
        console.error(`Error processing user ${user.line_user_id}:`, error)
        failureCount++
      }
    }

    // 通知履歴を記録
    await supabase.from('notification_logs').insert({
      notification_type: 'daily_events',
      total_users: users.length,
      success_count: successCount,
      failure_count: failureCount
    })

    console.log(`Notification job completed: ${successCount} success, ${failureCount} failed`)

    return new Response(JSON.stringify({
      success: true,
      total_users: users.length,
      success_count: successCount,
      failure_count: failureCount,
      notified_events: notifiedEventIds.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in daily notification job:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Cron設定: 毎朝8時に実行（日本時間 = UTC+9なので23時）
// 注意: Supabase Deno.cronは現在ベータ版です
// 実際の運用ではSupabase Cron Jobsまたは外部Cronサービスを使用してください
