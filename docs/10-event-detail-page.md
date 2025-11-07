# 10. イベント詳細ページ実装

## 概要
個別イベントの詳細情報を表示するページを実装します。

## タスク

- [ ] 動的ルート設定
- [ ] イベント詳細取得
- [ ] 詳細レイアウト実装
- [ ] 外部リンクボタン
- [ ] 関連イベント表示
- [ ] メタデータ動的生成（SEO）

## 実装

### 詳細ページ
```typescript
// src/app/event/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import ShareButtons from '@/components/events/ShareButtons'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) return {}

  return {
    title: `${event.title} | まちイベ`,
    description: event.detail || `${event.title}の詳細情報`
  }
}

export default async function EventDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !event) {
    notFound()
  }

  // 関連イベント（同じ地域の近い日付）
  const { data: relatedEvents } = await supabase
    .from('events')
    .select('*')
    .eq('region', event.region)
    .neq('id', event.id)
    .gte('event_date', event.event_date)
    .limit(3)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 block">
        ← 一覧に戻る
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        {event.image_url && (
          <div className="relative w-full h-96 mb-6">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {event.is_new && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded">
              NEW
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
            {event.region}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-6">{event.title}</h1>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span className="text-lg">{formatDate(event.event_date)}</span>
          </div>
          {event.event_time && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              <span className="text-lg">{event.event_time}</span>
            </div>
          )}
          {event.place && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="text-lg">{event.place}</span>
            </div>
          )}
        </div>

        {event.detail && (
          <div className="prose max-w-none mb-6">
            <h2 className="text-xl font-semibold mb-3">詳細</h2>
            <p className="whitespace-pre-wrap">{event.detail}</p>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            詳細を見る
          </a>
        </div>

        <ShareButtons event={event} />

        <p className="text-sm text-gray-500 mt-6">
          情報元: {event.source_site}
        </p>
      </div>

      {relatedEvents && relatedEvents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">関連イベント</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map(relatedEvent => (
              <EventCard key={relatedEvent.id} event={relatedEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## 受け入れ基準
- [ ] イベント詳細が正しく表示される
- [ ] 外部リンクが機能する
- [ ] 関連イベントが表示される
- [ ] メタデータが動的に生成される
- [ ] 404ページが適切に表示される

## 依存関係
- `08-event-list-pages.md` の完了が必要
- `11-share-feature.md` と並行実装可能
