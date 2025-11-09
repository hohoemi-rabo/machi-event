import { createClient } from '@/lib/supabase/server'
import EventFilters from '@/components/events/EventFilters'
import EventCard from '@/components/events/EventCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'イベント検索 | まちイベ',
  description: '南信州地域のイベント情報を地域・日付・キーワードで検索'
}

// 1時間ごとに再生成
export const revalidate = 3600

interface SearchParams {
  region?: string
  keyword?: string
  dateFrom?: string
  dateTo?: string
}

export default async function EventsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // クエリビルド
  let query = supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  // 地域フィルター
  if (params.region) {
    query = query.eq('region', params.region)
  }

  // キーワード検索（タイトルまたは詳細に含まれる）
  if (params.keyword) {
    query = query.or(
      `title.ilike.%${params.keyword}%,detail.ilike.%${params.keyword}%`
    )
  }

  // 日付範囲フィルター
  if (params.dateFrom) {
    query = query.gte('event_date', params.dateFrom)
  }
  if (params.dateTo) {
    query = query.lte('event_date', params.dateTo)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Failed to fetch events:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-red-600">エラーが発生しました</h1>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  // フィルター条件の表示用テキスト生成
  const getFilterSummary = () => {
    const filters = []
    if (params.region) filters.push(`地域: ${params.region}`)
    if (params.keyword) filters.push(`キーワード: ${params.keyword}`)
    if (params.dateFrom && params.dateTo) {
      filters.push(`期間: ${params.dateFrom} 〜 ${params.dateTo}`)
    } else if (params.dateFrom) {
      filters.push(`${params.dateFrom}以降`)
    } else if (params.dateTo) {
      filters.push(`${params.dateTo}まで`)
    }
    return filters.length > 0 ? filters.join(' / ') : 'すべてのイベント'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">イベント検索</h1>
      <p className="text-gray-600 mb-6">南信州地域のイベント情報を検索できます</p>

      {/* フィルターコンポーネント */}
      <EventFilters />

      {/* 検索結果 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {getFilterSummary()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {events && events.length > 0
            ? `${events.length}件のイベントが見つかりました`
            : '条件に一致するイベントがありません'}
        </p>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">条件に一致するイベントがありません</p>
          <p className="text-gray-400 text-sm mt-2">別の条件で検索してみてください</p>
        </div>
      )}
    </div>
  )
}
