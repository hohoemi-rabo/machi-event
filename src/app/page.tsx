import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/events/EventCard'
import RegionFilter from '@/components/events/RegionFilter'
import { getWeekRange } from '@/lib/utils/date'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '今週のイベント | まちイベ',
  description: '南信州地域の今週開催されるイベント情報'
}

// 1時間ごとに再生成
export const revalidate = 3600

interface HomePageProps {
  searchParams: Promise<{
    region?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient()
  const { start, end } = getWeekRange()
  const params = await searchParams

  // クエリビルド
  let query = supabase
    .from('events')
    .select('*')
    .gte('event_date', start.toISOString().split('T')[0])
    .lte('event_date', end.toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  // 地域フィルター
  if (params.region) {
    query = query.eq('region', params.region)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">今週のイベント</h1>
      <p className="text-gray-600 mb-6">
        {start.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} 〜{' '}
        {end.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
      </p>

      {/* 地域フィルター */}
      <RegionFilter />

      {/* イベント一覧 */}
      {!events || events.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            {params.region
              ? `${params.region}の今週のイベントはありません`
              : '今週のイベントはありません'}
          </p>
          <p className="text-gray-400 text-sm mt-2">月間イベントもチェックしてみてください</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {params.region ? `${params.region}：` : ''}
            {events.length}件のイベント
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
