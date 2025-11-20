import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { getRegionColor } from '@/lib/utils/colors'
import BackButton from '@/components/ui/BackButton'
import type { Metadata } from 'next'

// 1時間ごとに再生成
export const revalidate = 3600

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    return {
      title: 'イベントが見つかりません | 南信イベナビ'
    }
  }

  return {
    title: `${event.title} | 南信イベナビ`,
    description: event.detail || `${event.title}の詳細情報`
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  const regionColor = getRegionColor(event.region)

  // NEWバッジ判定（未来のイベント かつ 登録から7日以内）
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(event.event_date)
  eventDate.setHours(0, 0, 0, 0)
  const createdAt = new Date(event.created_at)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const isNew = eventDate >= today && createdAt > sevenDaysAgo

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 戻るボタン */}
      <BackButton />

      {/* ヘッダー */}
      <div className="bg-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: regionColor.bg,
              color: regionColor.text
            }}
          >
            📍 {event.region}
          </span>
          {isNew && (
            <span className="new-badge-rainbow px-2 py-1 rounded text-xs font-bold text-white">
              NEW
            </span>
          )}
        </div>

        {/* 日付とタイトル */}
        <div className="mb-3">
          <p className="text-base text-gray-700 font-medium mb-2">
            {formatDate(event.event_date)}
            {event.event_time && ` ${event.event_time}`}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 leading-relaxed">
            {event.title}
          </h1>
        </div>

        {event.place && (
          <p className="text-sm text-gray-700">
            📍 場所: {event.place}
          </p>
        )}
      </div>

      {/* 画像 */}
      {event.image_url && (
        <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 本文 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {event.detail ? (
          <p className="whitespace-pre-wrap text-gray-900 leading-loose text-base">
            {event.detail}
          </p>
        ) : (
          <p className="text-gray-500 text-center py-4">
            詳細情報はありません
          </p>
        )}
      </div>

      {/* 公式サイトリンク */}
      <div className="mb-6">
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-4 rounded-lg font-medium transition-colors"
        >
          🔗 公式サイトで詳細を見る
        </a>
      </div>

      {/* 情報元 */}
      <div className="text-sm text-gray-600 text-center border-t pt-4">
        情報元: {event.source_site}
      </div>
    </div>
  )
}
