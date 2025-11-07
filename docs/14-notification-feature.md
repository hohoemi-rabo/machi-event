# 14. LINE通知機能実装

## 概要
毎朝8時に新着イベントをLINE通知する機能を実装します。

## 目的
- 定期的な通知配信
- ユーザーの地域設定に基づくフィルタリング
- 適切なメッセージフォーマット
- 通知履歴の記録

## タスク

- [ ] 通知用Edge Function作成
- [ ] Cron設定（毎朝8時）
- [ ] 新着イベント取得ロジック実装
- [ ] 地域別フィルタリング実装
- [ ] メッセージフォーマット作成
- [ ] 通知履歴記録
- [ ] エラーハンドリング

## 実装

### 通知Edge Function
```typescript
// supabase/functions/send-line-notifications/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendMessage } from '../line-webhook/line-client.ts'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // アクティブなLINEユーザー取得
  const { data: users } = await supabase
    .from('line_users')
    .select('*')
    .eq('is_active', true)

  let successCount = 0
  let failureCount = 0

  for (const user of users || []) {
    try {
      // ユーザーの地域に合わせた新着イベント取得
      const events = await getNewEventsForUser(supabase, user)

      if (events.length > 0) {
        await sendEventNotification(user.line_user_id, events)
        successCount++
      }
    } catch (error) {
      console.error(`Failed to notify user ${user.line_user_id}:`, error)
      failureCount++
    }
  }

  // 通知履歴記録
  await supabase.from('notification_logs').insert({
    notification_type: 'daily_events',
    total_users: users?.length || 0,
    success_count: successCount,
    failure_count: failureCount
  })

  return new Response(
    JSON.stringify({ successCount, failureCount }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### 新着イベント取得
```typescript
async function getNewEventsForUser(
  supabase: SupabaseClient,
  user: any
): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  const weekLater = new Date()
  weekLater.setDate(weekLater.getDate() + 7)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .in('region', user.regions)
    .eq('is_new', true) // 新着のみ
    .gte('event_date', today)
    .lte('event_date', weekLater.toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(5) // 最大5件

  return events || []
}
```

### メッセージフォーマット
```typescript
async function sendEventNotification(
  userId: string,
  events: Event[]
): Promise<void> {
  const messages = []

  // ヘッダーメッセージ
  messages.push({
    type: 'text',
    text: `🎉 今週の新着イベント（${events.length}件）`
  })

  // Flex Messageでイベント表示
  for (const event of events.slice(0, 5)) {
    messages.push({
      type: 'flex',
      altText: event.title,
      contents: createEventFlexMessage(event)
    })
  }

  // もっと見るリンク
  if (events.length > 5) {
    messages.push({
      type: 'text',
      text: `他${events.length - 5}件のイベントがあります`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'uri',
              label: 'もっと見る',
              uri: 'https://machi-event.vercel.app/week'
            }
          }
        ]
      }
    })
  }

  await sendMessage(userId, messages)
}
```

### Flex Message作成
```typescript
function createEventFlexMessage(event: Event) {
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
                  text: formatDate(event.event_date),
                  size: 'sm',
                  wrap: true,
                  color: '#666666',
                  flex: 1
                }
              ]
            },
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
```

### Cron設定
```typescript
// Deno.cronで毎朝8時に実行
Deno.cron("send daily notifications", "0 8 * * *", async () => {
  console.log("Sending daily LINE notifications...")

  await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-line-notifications`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      }
    }
  )
})
```

### 通知ログテーブル
```sql
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  total_users INTEGER NOT NULL,
  success_count INTEGER NOT NULL,
  failure_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### is_newフラグのリセット
```typescript
// 通知後、is_newフラグをfalseに更新
async function resetNewFlags(supabase: SupabaseClient) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  await supabase
    .from('events')
    .update({ is_new: false })
    .eq('is_new', true)
    .lt('created_at', yesterday.toISOString())
}
```

## 受け入れ基準
- [ ] 毎朝8時に通知が配信される
- [ ] ユーザーの地域設定に基づいてフィルタリングされる
- [ ] 最大5件のイベントが表示される
- [ ] Flex Messageが正しく表示される
- [ ] 通知履歴が記録される
- [ ] エラー時も処理が継続する

## 関連ファイル
- `docs/13-line-integration.md` - LINE連携基盤
- `supabase/functions/send-line-notifications/`

## 依存関係
- `13-line-integration.md` の完了が必要
- `04-scraping-sites.md` の完了が必要（イベントデータ）

## 技術メモ

### テスト送信
```bash
# 手動でEdge Functionをトリガー
curl -X POST \
  https://[project-ref].supabase.co/functions/v1/send-line-notifications \
  -H "Authorization: Bearer [service-role-key]"
```

### 配信数制限
LINE Messaging APIの無料プランでは月間500通まで。
有効ユーザーが増えた場合は有料プランへの移行を検討。

## 参考
- LINE Flex Message: https://developers.line.biz/ja/docs/messaging-api/using-flex-messages/
- Supabase Cron: https://supabase.com/docs/guides/functions/cron-jobs
