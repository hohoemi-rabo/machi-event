# 09. フィルタリング機能実装

## 概要
地域別、日付範囲、キーワードでイベントをフィルタリングする機能を実装します。

## タスク

- [×] 地域別フィルターコンポーネント作成
- [×] 日付範囲フィルター実装
- [×] キーワード検索機能実装
- [×] フィルター状態管理
- [×] URLパラメータとの連携
- [×] フィルタークリア機能

## 実装

### フィルターコンポーネント
```typescript
// src/components/events/EventFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const REGIONS = ['飯田市', '下伊那郡', '上伊那郡']

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    region: searchParams.get('region') || '',
    keyword: searchParams.get('keyword') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  })

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.region) params.set('region', filters.region)
    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.region}
          onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">すべての地域</option>
          {REGIONS.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="キーワード検索"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={applyFilters}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          検索
        </button>
        <button
          onClick={() => router.push(window.location.pathname)}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          クリア
        </button>
      </div>
    </div>
  )
}
```

### フィルタリング付きページ
```typescript
// src/app/events/page.tsx
import { createClient } from '@/lib/supabase/server'
import EventFilters from '@/components/events/EventFilters'
import EventCard from '@/components/events/EventCard'

interface SearchParams {
  region?: string
  keyword?: string
  dateFrom?: string
  dateTo?: string
}

export default async function EventsPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  let query = supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  // 地域フィルター
  if (searchParams.region) {
    query = query.eq('region', searchParams.region)
  }

  // キーワード検索
  if (searchParams.keyword) {
    query = query.or(
      `title.ilike.%${searchParams.keyword}%,detail.ilike.%${searchParams.keyword}%`
    )
  }

  // 日付範囲
  if (searchParams.dateFrom) {
    query = query.gte('event_date', searchParams.dateFrom)
  }
  if (searchParams.dateTo) {
    query = query.lte('event_date', searchParams.dateTo)
  }

  const { data: events } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">イベント検索</h1>

      <EventFilters />

      {events && events.length > 0 ? (
        <>
          <p className="text-gray-600 mb-4">{events.length}件のイベント</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">条件に一致するイベントがありません</p>
      )}
    </div>
  )
}
```

## 受け入れ基準
- [×] 地域フィルターが動作する
- [×] キーワード検索が動作する
- [×] 日付範囲フィルターが動作する
- [×] URLパラメータが正しく反映される
- [×] フィルタークリアが動作する

## 依存関係
- `08-event-list-pages.md` の完了が必要
