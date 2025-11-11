import type { Event } from './event-fetcher.ts'

export interface LineMessageObject {
  type: 'text' | 'flex'
  text?: string
  altText?: string
  contents?: any
  quickReply?: {
    items: Array<{
      type: 'action'
      action: {
        type: 'uri' | 'postback' | 'message'
        label: string
        uri?: string
        data?: string
        text?: string
      }
    }>
  }
}

/**
 * 新着イベント通知メッセージ作成
 * @param events - イベント配列
 * @returns LINEメッセージオブジェクト配列
 */
export function buildDailyNotificationMessages(events: Event[]): LineMessageObject[] {
  if (events.length === 0) {
    return []
  }

  const messages: LineMessageObject[] = []

  // ヘッダーメッセージ
  messages.push({
    type: 'text',
    text: `🎉 今日の新着イベント（${events.length}件）\n\n${events[0].region}エリアのイベント情報です！`
  })

  // 各イベントをFlexメッセージで表示
  for (const event of events) {
    messages.push({
      type: 'flex',
      altText: event.title,
      contents: createEventBubble(event)
    })
  }

  // もっと見るリンク
  messages.push({
    type: 'text',
    text: '他のイベントも見てみよう👇',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'uri',
            label: '📅 今週のイベント',
            uri: 'https://machi-event.vercel.app/'
          }
        },
        {
          type: 'action',
          action: {
            type: 'uri',
            label: '📆 今月のイベント',
            uri: 'https://machi-event.vercel.app/month'
          }
        }
      ]
    }
  })

  return messages
}

/**
 * イベントのFlexメッセージ（バブル）作成
 * @param event - イベント情報
 * @returns FlexメッセージJSON
 */
function createEventBubble(event: Event): any {
  const contents: any[] = [
    {
      type: 'text',
      text: event.title,
      weight: 'bold',
      size: 'lg',
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
      margin: 'md',
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
              text: new Date(event.event_date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              size: 'sm',
              wrap: true,
              color: '#666666',
              flex: 1
            }
          ]
        }
      ]
    }
  ]

  // 時間があれば追加
  if (event.event_time) {
    contents[2].contents.push({
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
    })
  }

  // 場所があれば追加
  if (event.place) {
    contents[2].contents.push({
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
    })
  }

  return {
    type: 'bubble',
    size: 'kilo',
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
      contents
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#3B82F6',
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
