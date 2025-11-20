'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/event'
import { getRegionColor } from '@/lib/utils/colors'
import BackButton from '@/components/ui/BackButton'

// 今週の日付範囲を取得
function getWeekRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  const dayOfWeek = today.getDay()

  const startDate = new Date(year, month, date - dayOfWeek)
  const endDate = new Date(year, month, date - dayOfWeek + 6)

  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
  const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  return { startStr, endStr }
}

export default function WeekSiteEventsPage() {
  const params = useParams()
  const region = decodeURIComponent(params.region as string)
  const site = decodeURIComponent(params.site as string)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const regionColor = getRegionColor(region)

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient()
      const { startStr, endStr } = getWeekRange()

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('source_site', site)
        .gte('event_date', startStr)
        .lte('event_date', endStr)
        .order('event_date', { ascending: false, nullsFirst: false })

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }

    fetchEvents()
  }, [site])

  // NEWバッジ判定（登録7日以内かつ未来のイベント）
  const isNewEvent = (event: Event) => {
    const now = new Date()
    const createdAt = new Date(event.created_at)
    const eventDate = new Date(event.event_date)
    const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceCreated <= 7 && eventDate >= now
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 戻るボタン */}
      <BackButton />

      {/* ヘッダー */}
      <div className="bg-gray-200 rounded-lg p-5 mb-6">
        <h1 className="text-xl font-bold text-gray-900 text-center">
          📅 {site} - 今週のイベント
        </h1>
        <p className="text-center text-sm text-gray-600 mt-1">
          イベント一覧 ({events.length}件)
        </p>
      </div>

      {/* イベントリスト */}
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          今週のイベントはありません
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {events.map((event, index) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="block hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              <div
                className="py-5 px-4"
                style={{
                  borderBottom: index < events.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                {/* 日付とNEWバッジ */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-700 font-medium">
                    {new Date(event.event_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>

                  {isNewEvent(event) && (
                    <span className="new-badge-rainbow px-2 py-0.5 rounded text-xs font-bold text-white">
                      NEW
                    </span>
                  )}

                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium ml-auto"
                    style={{
                      backgroundColor: regionColor.bg,
                      color: regionColor.text
                    }}
                  >
                    📍 {event.region}
                  </span>
                </div>

                {/* タイトル */}
                <div className="text-base font-medium text-gray-900 line-clamp-2 leading-relaxed">
                  {event.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
