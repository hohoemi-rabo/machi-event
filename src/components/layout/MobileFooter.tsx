'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MobileFooter() {
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-lg lg:hidden z-50">
      <div className="flex">
        {/* ホームボタン */}
        <Link
          href="/regions"
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-300"
        >
          <span className="text-2xl mb-1">🏠</span>
          <span className="text-sm font-medium text-gray-700">ホーム</span>
        </Link>

        {/* 戻るボタン */}
        <button
          onClick={() => router.back()}
          className="flex-1 flex flex-col items-center justify-center py-4 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <span className="text-2xl mb-1">⬅️</span>
          <span className="text-sm font-medium text-gray-700">戻る</span>
        </button>
      </div>
    </div>
  )
}
