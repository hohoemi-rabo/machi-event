import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_MESSAGING_API_URL = 'https://api.line.me/v2/bot/message'

interface EventNotification {
  id: string
  line_user_id: string
  event_id: string
  notify_date: string
  is_sent: boolean
  created_at: string
}

interface Event {
  id: string
  title: string
  event_date: string
  event_time: string | null
  place: string | null
  detail: string | null
  source_url: string
  region: string
  image_url: string | null
}

/**
 * 個別イベント通知Edge Function
 * 開催前日の朝8時に登録されたイベントを通知
 */
serve(async (req) => {
  console.log('Starting event reminder job...')

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
    const today = new Date().toISOString().split('T')[0]

    // 今日通知すべきイベント登録を取得
    const { data: notifications, error: notificationsError } = await supabase
      .from('event_notifications')
      .select(`
        *,
        events (*)
      `)
      .eq('notify_date', today)
      .eq('is_sent', false)

    if (notificationsError) {
      console.error('Failed to fetch notifications:', notificationsError)
      throw notificationsError
    }

    if (!notifications || notifications.length === 0) {
      console.log('No event reminders to send today')
      return new Response(JSON.stringify({
        success: true,
        message: 'No reminders to send'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${notifications.length} reminders to send`)

    let successCount = 0
    let failureCount = 0

    // 各通知を送信
    for (const notification of notifications) {
      try {
        const event = notification.events as any

        if (!event) {
          console.warn(`Event not found for notification ${notification.id}`)
          failureCount++
          continue
        }

        // リマインダーメッセージ作成
        const messages = buildReminderMessages(event)

        // LINE メッセージ送信
        const response = await fetch(`${LINE_MESSAGING_API_URL}/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            to: notification.line_user_id,
            messages
          })
        })

        if (!response.ok) {
          const error = await response.text()
          console.error(`Failed to send reminder to ${notification.line_user_id}:`, error)
          failureCount++
        } else {
          // 送信済みフラグを更新
          await supabase
            .from('event_notifications')
            .update({ is_sent: true })
            .eq('id', notification.id)

          console.log(`Successfully sent reminder for event ${event.id} to ${notification.line_user_id}`)
          successCount++
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        failureCount++
      }
    }

    // 通知履歴を記録
    await supabase.from('notification_logs').insert({
      notification_type: 'event_reminders',
      total_users: notifications.length,
      success_count: successCount,
      failure_count: failureCount
    })

    console.log(`Event reminder job completed: ${successCount} success, ${failureCount} failed`)

    return new Response(JSON.stringify({
      success: true,
      total_reminders: notifications.length,
      success_count: successCount,
      failure_count: failureCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in event reminder job:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

/**
 * リマインダーメッセージ構築
 * @param event - イベント情報
 * @returns LINEメッセージオブジェクト配列
 */
function buildReminderMessages(event: Event): any[] {
  const eventDate = new Date(event.event_date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString()
  const dateText = isTomorrow ? '明日' : eventDate.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric'
  })

  return [
    {
      type: 'text',
      text: `📅 ${dateText}はこのイベントです！\n\n忘れずにチェックしてくださいね🎉`
    },
    {
      type: 'flex',
      altText: event.title,
      contents: {
        type: 'bubble',
        size: 'mega',
        hero: event.image_url ? {
          type: 'image',
          url: event.image_url,
          size: 'full',
          aspectRatio: '20:13',
          aspectMode: 'cover'
        } : undefined,
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: event.title,
              weight: 'bold',
              size: 'xl',
              wrap: true,
              color: '#1E3A8A'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'lg',
              spacing: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '📅',
                      size: 'sm',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: eventDate.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      }),
                      size: 'sm',
                      wrap: true,
                      color: '#DC143C',
                      weight: 'bold',
                      flex: 1
                    }
                  ]
                },
                event.event_time ? {
                  type: 'box',
                  layout: 'baseline',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '🕐',
                      size: 'sm',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: event.event_time,
                      size: 'sm',
                      wrap: true,
                      color: '#666666',
                      flex: 1
                    }
                  ]
                } : undefined,
                event.place ? {
                  type: 'box',
                  layout: 'baseline',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '📍',
                      size: 'sm',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: event.place,
                      size: 'sm',
                      wrap: true,
                      color: '#666666',
                      flex: 1
                    }
                  ]
                } : undefined
              ].filter(Boolean)
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#DC143C',
              action: {
                type: 'uri',
                label: '詳細を確認する',
                uri: `https://machi-event.vercel.app/event/${event.id}`
              }
            }
          ]
        }
      }
    }
  ]
}
