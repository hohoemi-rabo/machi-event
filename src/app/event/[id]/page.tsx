import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import ShareButtons from '@/components/events/ShareButtons'
import EventCard from '@/components/events/EventCard'
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

  // 関連イベント（同じ地域の近い日付）
  const { data: relatedEvents } = await supabase
    .from('events')
    .select('*')
    .eq('region', event.region)
    .neq('id', event.id)
    .gte('event_date', event.event_date)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
    .limit(3)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-6 transition-colors"
      >
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
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded font-medium">
              NEW
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded font-medium">
            {event.region}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">{event.title}</h1>

        <div className="space-y-3 mb-6 text-gray-700">
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">詳細</h2>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{event.detail}</p>
          </div>
        )}

        <div className="mb-6">
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            公式サイトで詳細を見る →
          </a>
        </div>

        <ShareButtons event={event} />

        <p className="text-sm text-gray-500 mt-6 pt-6 border-t">
          情報元: {event.source_site}
        </p>
      </div>

      {relatedEvents && relatedEvents.length > 0 && (
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">関連イベント</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((relatedEvent) => (
              <EventCard key={relatedEvent.id} event={relatedEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
