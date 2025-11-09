# 08. イベント一覧ページ実装

## 概要
今日・今週・今月のイベント一覧ページを実装します。

## 目的
- イベント情報をカード形式で表示
- 日付範囲に応じたフィルタリング
- SEO対応のサーバーサイドレンダリング

## タスク

- [×] トップページ（今日のイベント）実装
- [×] 週間イベントページ実装
- [×] 月間イベントページ実装
- [×] イベントカードコンポーネント作成
- [×] 空状態の処理
- [ ] ページネーション実装（将来実装）
- [×] メタデータ設定

## 実装

### トップページ
```typescript
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/events/EventCard'
import { formatDate } from '@/lib/utils/date'

export const metadata = {
  title: '今日のイベント | まちイベ',
  description: '南信州地域の今日開催されるイベント情報'
}

export default async function HomePage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_date', today)
    .order('event_time', { ascending: true })

  if (error) {
    console.error('Failed to fetch events:', error)
    return <div>エラーが発生しました</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        今日のイベント ({formatDate(today)})
      </h1>

      {events.length === 0 ? (
        <p className="text-gray-500">今日のイベントはありません</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 週間イベントページ
```typescript
// src/app/week/page.tsx
import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/events/EventCard'
import { getWeekRange } from '@/lib/utils/date'

export const metadata = {
  title: '今週のイベント | まちイベ'
}

export default async function WeekPage() {
  const supabase = await createClient()
  const { start, end } = getWeekRange()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', start.toISOString().split('T')[0])
    .lte('event_date', end.toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">今週のイベント</h1>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">今週のイベントはありません</p>
      )}
    </div>
  )
}
```

### イベントカードコンポーネント
```typescript
// src/components/events/EventCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Event } from '@/types/event'
import { formatDateShort } from '@/lib/utils/date'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/event/${event.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 h-full">
        {event.image_url && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
        )}

        <div className="flex items-start gap-2 mb-2">
          {event.is_new && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              NEW
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {event.region}
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="text-sm text-gray-600 space-y-1">
          <p>📅 {formatDateShort(event.event_date)}</p>
          {event.event_time && <p>🕐 {event.event_time}</p>}
          {event.place && <p>📍 {event.place}</p>}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          情報元: {event.source_site}
        </p>
      </div>
    </Link>
  )
}
```

## 受け入れ基準
- [×] 3つのページすべてが正しく動作する
- [×] イベントが日付順に表示される
- [×] カードUIが適切に表示される
- [×] 空状態が正しく処理される
- [×] リンクが正しく機能する
- [×] レスポンシブデザインが動作する

## 関連ファイル
- `docs/07-frontend-setup.md` - フロントエンド基盤
- `docs/09-filtering-feature.md` - フィルタリング機能
- `docs/10-event-detail-page.md` - イベント詳細ページ

## 依存関係
- `07-frontend-setup.md` の完了が必要
- `02-database-implementation.md` の完了が必要

## 技術メモ

### ISR（Incremental Static Regeneration）
```typescript
// 1時間ごとに再生成
export const revalidate = 3600

// またはオンデマンドで再検証
import { revalidatePath } from 'next/cache'
revalidatePath('/')
```

## 参考
- Next.js Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
