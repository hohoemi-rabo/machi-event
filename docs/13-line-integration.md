# 13. LINE連携基盤構築

## 概要
LINE Messaging APIを使用して、LINE公式アカウントとの連携基盤を構築します。

## 目的
- LINE公式アカウント作成
- Messaging API設定
- Webhook設定
- 友だち登録処理
- ユーザー設定管理

## タスク

- [ ] LINE公式アカウント作成
- [ ] LINE Messaging API設定
- [ ] Webhook用Edge Function作成
- [ ] 友だち登録/ブロック処理実装
- [ ] ユーザー設定テーブル実装
- [ ] 地域選択機能実装
- [ ] リッチメニュー設定

## 実装

### LINE Developers設定
1. LINE Developersコンソールにアクセス
2. プロバイダー作成
3. Messaging APIチャネル作成
4. Webhook URL設定: `https://[project-ref].supabase.co/functions/v1/line-webhook`
5. アクセストークン取得

### 環境変数設定
```bash
# .env.local
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token
LINE_CHANNEL_SECRET=your-channel-secret
```

### Webhook Edge Function
```typescript
// supabase/functions/line-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateSignature, handleWebhook } from './line-handler.ts'

serve(async (req) => {
  // 署名検証
  const signature = req.headers.get('x-line-signature')
  const body = await req.text()

  if (!validateSignature(body, signature, Deno.env.get('LINE_CHANNEL_SECRET')!)) {
    return new Response('Invalid signature', { status: 403 })
  }

  const events = JSON.parse(body).events

  for (const event of events) {
    await handleWebhook(event)
  }

  return new Response('OK', { status: 200 })
})
```

### Webhook処理ハンドラー
```typescript
// supabase/functions/line-webhook/line-handler.ts
import { createHmac } from 'node:crypto'

export function validateSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  const hash = createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64')
  return hash === signature
}

export async function handleWebhook(event: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'follow':
      await handleFollow(event.source.userId)
      break
    case 'unfollow':
      await handleUnfollow(event.source.userId)
      break
    case 'message':
      await handleMessage(event)
      break
    case 'postback':
      await handlePostback(event)
      break
  }
}

async function handleFollow(userId: string) {
  // ユーザー登録
  await supabase.from('line_users').insert({
    line_user_id: userId,
    regions: ['飯田市'],
    is_active: true
  })

  // ウェルカムメッセージ送信
  await sendWelcomeMessage(userId)
}

async function handleUnfollow(userId: string) {
  // ユーザー無効化
  await supabase
    .from('line_users')
    .update({ is_active: false })
    .eq('line_user_id', userId)
}
```

### LINE メッセージ送信
```typescript
// supabase/functions/line-webhook/line-client.ts
export async function sendMessage(
  userId: string,
  messages: any[]
): Promise<void> {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')}`
    },
    body: JSON.stringify({
      to: userId,
      messages
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to send message: ${await response.text()}`)
  }
}

export async function sendWelcomeMessage(userId: string): Promise<void> {
  await sendMessage(userId, [
    {
      type: 'text',
      text: 'まちイベへようこそ！\n南信州地域のイベント情報をお届けします🎉'
    },
    {
      type: 'text',
      text: '毎朝8時に新着イベントをお知らせします。\n地域を選択してください：',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '飯田市',
              data: 'region=飯田市'
            }
          },
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '下伊那郡',
              data: 'region=下伊那郡'
            }
          },
          {
            type: 'action',
            action: {
              type: 'postback',
              label: '上伊那郡',
              data: 'region=上伊那郡'
            }
          }
        ]
      }
    }
  ])
}
```

### Postback処理（地域選択）
```typescript
async function handlePostback(event: any) {
  const data = new URLSearchParams(event.postback.data)
  const region = data.get('region')

  if (region) {
    await supabase
      .from('line_users')
      .update({ regions: [region] })
      .eq('line_user_id', event.source.userId)

    await sendMessage(event.source.userId, [
      {
        type: 'text',
        text: `${region}のイベント情報をお届けします！`
      }
    ])
  }
}
```

### リッチメニュー設定
```typescript
// LINE APIでリッチメニューを作成
const richMenu = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: 'まちイベメニュー',
  chatBarText: 'メニュー',
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: 'uri', uri: 'https://machi-event.vercel.app/' }
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: { type: 'uri', uri: 'https://machi-event.vercel.app/week' }
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: { type: 'uri', uri: 'https://machi-event.vercel.app/month' }
    },
    {
      bounds: { x: 0, y: 843, width: 2500, height: 843 },
      action: { type: 'postback', data: 'action=settings' }
    }
  ]
}
```

## 受け入れ基準
- [ ] LINE公式アカウントが作成されている
- [ ] Webhook設定が完了している
- [ ] 友だち追加で登録される
- [ ] ブロックでユーザーが無効化される
- [ ] 地域選択が機能する
- [ ] リッチメニューが表示される

## 関連ファイル
- `docs/14-notification-feature.md` - 通知機能
- `supabase/functions/line-webhook/`

## 依存関係
- `02-database-implementation.md` の完了が必要（line_usersテーブル）

## 参考
- LINE Messaging API: https://developers.line.biz/ja/docs/messaging-api/
- LINE Rich Menu: https://developers.line.biz/ja/docs/messaging-api/using-rich-menus/
