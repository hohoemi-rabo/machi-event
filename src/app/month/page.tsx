'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getRegionColor } from '@/lib/utils/colors'

// 地域リスト
const REGIONS = [
  '飯田市',
  '南信州',
  '高森町',
  '松川町',
  '阿智村',
  '平谷村',
  '根羽村',
  '下条村',
  '売木村',
  '天龍村',
  '泰阜村',
  '喬木村',
  '豊丘村',
  '大鹿村',
]

// 今月の日付範囲を取得
function getMonthRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
  const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  return { startStr, endStr }
}

export default function MonthRegionsPage() {
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegionCounts = async () => {
      const supabase = createClient()
      const { startStr, endStr } = getMonthRange()

      const { data, error } = await supabase
        .from('events')
        .select('region')
        .gte('event_date', startStr)
        .lte('event_date', endStr)

      if (!error && data) {
        // 地域ごとにイベント数をカウント
        const counts: Record<string, number> = {}
        data.forEach((event) => {
          const region = event.region || '不明'
          counts[region] = (counts[region] || 0) + 1
        })
        setRegionCounts(counts)
      }
      setLoading(false)
    }

    fetchRegionCounts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">📆 今月のイベント - 地域を選択</h1>
        <p className="text-gray-600">イベント情報を見たい地域を選んでください</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {REGIONS.map((region) => {
            const regionColor = getRegionColor(region)
            const count = regionCounts[region] || 0

            return (
              <Link
                key={region}
                href={`/month/${encodeURIComponent(region)}`}
                className="block rounded-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden group"
                style={{
                  backgroundColor: regionColor.bg,
                  color: regionColor.text,
                  minHeight: '140px'
                }}
              >
                {/* ホバーエフェクト */}
                <div
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ pointerEvents: 'none' }}
                ></div>

                <div className="relative z-10">
                  {/* 地域名 */}
                  <div className="text-2xl font-bold mb-3">{region}</div>

                  {/* イベント件数 */}
                  <div className="flex items-center justify-center gap-1 text-sm opacity-90">
                    <span>📍</span>
                    <span className="font-semibold">{count}件</span>
                  </div>

                  {/* タップ案内 */}
                  <div className="mt-3 text-xs opacity-75">
                    タップして選択 →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
