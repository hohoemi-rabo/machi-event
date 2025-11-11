import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date'
import { getRegionColor, getRegionLightBg } from '@/lib/utils/colors'
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

  const regionColor = getRegionColor(event.region)
  const lightBg = getRegionLightBg(event.region)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center font-medium mb-6 transition-all hover:opacity-80 px-4 py-2 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #B19CD9 0%, #9370DB 50%, #8B5CF6 100%)',
          color: '#FFFFFF'
        }}
      >
        ← 一覧に戻る
      </Link>

      <div
        className="rounded-xl shadow-xl p-8 max-w-4xl mx-auto border-2"
        style={{
          backgroundColor: lightBg,
          borderColor: regionColor.bg
        }}
      >
        {event.image_url && (
          <div className="relative w-full h-96 mb-6">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <span
            className="text-sm px-3 py-2 rounded-lg font-medium shadow-md"
            style={{
              backgroundColor: regionColor.bg,
              color: regionColor.text
            }}
          >
            {event.region}
          </span>
          {event.is_new && (
            <span
              className="text-white text-sm px-3 py-2 rounded-lg font-bold new-badge-rainbow shadow-md"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
              }}
            >
              NEW
            </span>
          )}
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
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              📝 詳細情報
            </h2>
            <div className="bg-white/80 rounded-lg p-4 shadow-sm">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{event.detail}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white px-8 py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
            }}
          >
            🔗 公式サイトで詳細を見る →
          </a>
        </div>

        <ShareButtons event={event} />

        <p
          className="text-sm mt-8 pt-6 border-t-2 font-medium"
          style={{
            borderColor: regionColor.bg,
            color: regionColor.bg
          }}
        >
          📌 情報元: {event.source_site}
        </p>
      </div>

      {relatedEvents && relatedEvents.length > 0 && (
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            🔄 関連イベント
          </h2>
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
