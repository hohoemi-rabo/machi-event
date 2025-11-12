import Link from 'next/link'
import Image from 'next/image'
import type { Event } from '@/types/event'
import { formatDateShort } from '@/lib/utils/date'
import { getRegionColor, getRegionLightBg } from '@/lib/utils/colors'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const regionColor = getRegionColor(event.region)
  const lightBg = getRegionLightBg(event.region)

  // 未来のイベント かつ 登録から7日以内かを判定
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(event.event_date)
  eventDate.setHours(0, 0, 0, 0)
  const createdAt = new Date(event.created_at)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const isNew = eventDate >= today && createdAt > sevenDaysAgo

  return (
    <Link href={`/event/${event.id}`} className="block">
      <div
        className="rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 h-full border border-gray-100"
        style={{ backgroundColor: lightBg }}
      >
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

        <div className="flex items-start justify-between mb-2">
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: regionColor.bg,
              color: regionColor.text
            }}
          >
            {event.region}
          </span>
          {isNew && (
            <span
              className="text-white text-xs px-2 py-1 rounded font-bold new-badge-rainbow"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
              }}
            >
              NEW
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900">
          {event.title}
        </h3>

        <div className="text-sm text-gray-600 space-y-1">
          <p>📅 {formatDateShort(event.event_date)}</p>
          {event.event_time && <p>🕐 {event.event_time}</p>}
          {event.place && <p className="line-clamp-1">📍 {event.place}</p>}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          情報元: {event.source_site}
        </p>
      </div>
    </Link>
  )
}
