'use client'

import type { Event } from '@/types/event'

interface ShareButtonsProps {
  event: Event
}

export default function ShareButtons({ event }: ShareButtonsProps) {
  // Ticket 11で本格実装予定
  // 将来的にeventを使ってシェアURLを生成
  void event

  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">シェア</h3>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          disabled
        >
          LINE
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          disabled
        >
          X (Twitter)
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          disabled
        >
          URLコピー
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">※ Ticket 11で実装予定</p>
    </div>
  )
}
