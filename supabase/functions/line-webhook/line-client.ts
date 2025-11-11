import type { LinePushMessage, LineMessageObject, Event } from './types.ts'

const LINE_MESSAGING_API_URL = 'https://api.line.me/v2/bot/message'

/**
 * LINEメッセージ送信
 * @param userId - LINEユーザーID
 * @param messages - 送信するメッセージ配列
 */
export async function sendMessage(
  userId: string,
  messages: LineMessageObject[]
): Promise<void> {
  const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
  if (!accessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const response = await fetch(`${LINE_MESSAGING_API_URL}/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      to: userId,
      messages
    } as LinePushMessage)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send LINE message: ${error}`)
  }
}

/**
 * リプライメッセージ送信
 * @param replyToken - リプライトークン
 * @param messages - 送信するメッセージ配列
 */
export async function replyMessage(
  replyToken: string,
  messages: LineMessageObject[]
): Promise<void> {
  const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
  if (!accessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const response = await fetch(`${LINE_MESSAGING_API_URL}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      replyToken,
      messages
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to reply LINE message: ${error}`)
  }
}

/**
 * ウェルカムメッセージ送信
 * @param userId - LINEユーザーID
 */
export async function sendWelcomeMessage(userId: string): Promise<void> {
  const messages: LineMessageObject[] = [
    {
      type: 'text',
      text: '📣 南信イベナビへようこそ！\n\n南信州地域のイベント情報をお届けします🎉'
    },
    {
      type: 'text',
      text: '🌟 できること:\n\n✅ 毎朝8時に新着イベントをお知らせ\n✅ 気になるイベントを個別に通知登録\n✅ 地域を選んでカスタマイズ\n\nまずは、お住まいの地域を選択してください👇',
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
          },
          {
            type: 'action',
            action: {
              type: 'postback',
              label: 'その他',
              data: 'action=select_region&region=その他'
            }
          }
        ]
      }
    }
  ]

  await sendMessage(userId, messages)
}

/**
 * イベント詳細のFlexメッセージ作成
 * @param event - イベント情報
 * @returns FlexメッセージJSON
 */
export function createEventFlexMessage(event: Event): any {
  return {
    type: 'bubble',
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
          size: 'lg',
          wrap: true
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
                  text: new Date(event.event_date).toLocaleDateString('ja-JP'),
                  size: 'sm',
                  wrap: true,
                  color: '#666666',
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
          action: {
            type: 'uri',
            label: '詳細を見る',
            uri: `https://machi-event.vercel.app/event/${event.id}`
          }
        }
      ]
    }
  }
}
