import Link from 'next/link'
import Image from 'next/image'
import type { Event } from '@/types/event'
import { formatDateShort } from '@/lib/utils/date'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/event/${event.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 h-full border border-gray-100">
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
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              NEW
            </span>
          )}
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
            {event.region}
          </span>
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
