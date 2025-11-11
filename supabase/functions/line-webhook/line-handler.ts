import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { LineWebhookEvent } from './types.ts'
import { sendWelcomeMessage, replyMessage } from './line-client.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

/**
 * Webhookイベント処理のメインハンドラー
 * @param event - LINE Webhookイベント
 */
export async function handleWebhookEvent(event: LineWebhookEvent): Promise<void> {
  console.log(`Handling event type: ${event.type}`)

  try {
    switch (event.type) {
      case 'follow':
        await handleFollow(event)
        break
      case 'unfollow':
        await handleUnfollow(event)
        break
      case 'message':
        await handleMessage(event)
        break
      case 'postback':
        await handlePostback(event)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`Error handling event: ${error}`)
    throw error
  }
}

/**
 * 友だち追加イベント処理
 * @param event - フォローイベント
 */
async function handleFollow(event: LineWebhookEvent): Promise<void> {
  const userId = event.source.userId

  // ユーザー登録
  const { error } = await supabase.from('line_users').upsert({
    line_user_id: userId,
    regions: ['飯田市'], // デフォルト地域
    is_active: true,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'line_user_id'
  })

  if (error) {
    console.error('Failed to register user:', error)
    throw error
  }

  // ウェルカムメッセージ送信
  await sendWelcomeMessage(userId)

  console.log(`User ${userId} followed and registered`)
}

/**
 * ブロック（フォロー解除）イベント処理
 * @param event - アンフォローイベント
 */
async function handleUnfollow(event: LineWebhookEvent): Promise<void> {
  const userId = event.source.userId

  // ユーザーを無効化
  const { error } = await supabase
    .from('line_users')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('line_user_id', userId)

  if (error) {
    console.error('Failed to deactivate user:', error)
    throw error
  }

  console.log(`User ${userId} unfollowed and deactivated`)
}

/**
 * メッセージイベント処理
 * @param event - メッセージイベント
 */
async function handleMessage(event: LineWebhookEvent): Promise<void> {
  if (!event.message || event.message.type !== 'text') {
    return
  }

  const text = event.message.text?.toLowerCase() || ''
  const replyToken = event.replyToken

  if (!replyToken) {
    return
  }

  // 簡単なキーワード応答
  if (text.includes('地域') || text.includes('設定')) {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: '地域を選択してください👇',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '飯田市',
                data: 'action=select_region&region=飯田市'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '高森町',
                data: 'action=select_region&region=高森町'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '阿智村',
                data: 'action=select_region&region=阿智村'
              }
            }
          ]
        }
      }
    ])
  } else if (text.includes('イベント') || text.includes('情報')) {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: '📅 イベント情報を見るにはこちら👇',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'uri',
                label: 'イベント一覧',
                uri: 'https://machi-event.vercel.app/'
              }
            }
          ]
        }
      }
    ])
  } else {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: 'メニューから操作してください😊\n\n「地域」→ 地域設定\n「イベント」→ イベント一覧'
      }
    ])
  }
}

/**
 * Postbackイベント処理（ボタンタップなど）
 * @param event - Postbackイベント
 */
async function handlePostback(event: LineWebhookEvent): Promise<void> {
  if (!event.postback) {
    return
  }

  const data = new URLSearchParams(event.postback.data)
  const action = data.get('action')
  const userId = event.source.userId
  const replyToken = event.replyToken

  if (action === 'select_region') {
    const region = data.get('region')
    if (!region) {
      return
    }

    // ユーザーの地域設定を更新
    const { error } = await supabase
      .from('line_users')
      .update({
        regions: [region],
        updated_at: new Date().toISOString()
      })
      .eq('line_user_id', userId)

    if (error) {
      console.error('Failed to update user region:', error)
      throw error
    }

    // 確認メッセージ送信
    if (replyToken) {
      await replyMessage(replyToken, [
        {
          type: 'text',
          text: `✅ ${region}のイベント情報をお届けします！\n\n毎朝8時に新着イベントを通知します。\nまた、Webサイトから気になるイベントを個別に通知登録することもできます。`
        }
      ])
    }

    console.log(`User ${userId} region set to: ${region}`)
  }
}
