'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getRegionColor } from '@/lib/utils/colors'
import BackButton from '@/components/ui/BackButton'

// 地域別サイトマッピング
const REGION_SITES: Record<string, string[]> = {
  飯田市: ['飯田市役所', '天龍峡温泉観光協会', '遠山観光協会', '飯田市美術博物館', '喜久水酒造'],
  南信州: ['南信州ナビ'],
  高森町: ['高森町役場'],
  松川町: ['松川町役場'],
  阿智村: [
    '阿智村役場',
    '阿智誘客促進協議会',
    '天空の楽園',
    '阿智☆昼神観光局(地域のお知らせ)',
    '阿智☆昼神観光局(昼神観光局からのお知らせ)',
  ],
  平谷村: ['平谷村役場(新着情報)', '平谷村役場(イベント)'],
  根羽村: ['根羽村役場'],
  下条村: ['下条村観光協会'],
  売木村: ['売木村役場', '売木村商工会'],
  天龍村: [
    '天龍村役場(お知らせ)',
    '天龍村役場(行政情報)',
    '天龍村役場(観光情報)',
  ],
  泰阜村: ['泰阜村役場'],
  喬木村: ['喬木村役場'],
  豊丘村: ['豊丘村役場'],
  大鹿村: ['大鹿村役場(お知らせ)', '大鹿村環境協会'],
}

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

export default function MonthRegionSitesPage() {
  const params = useParams()
  const region = decodeURIComponent(params.region as string)
  const sites = REGION_SITES[region] || []
  const regionColor = getRegionColor(region)
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSiteCounts = async () => {
      const supabase = createClient()
      const { startStr, endStr } = getMonthRange()

      const { data, error } = await supabase
        .from('events')
        .select('source_site')
        .gte('event_date', startStr)
        .lte('event_date', endStr)

      if (!error && data) {
        // サイトごとにイベント数をカウント
        const counts: Record<string, number> = {}
        data.forEach((event) => {
          const site = event.source_site || '不明'
          counts[site] = (counts[site] || 0) + 1
        })
        setSiteCounts(counts)
      }
      setLoading(false)
    }

    fetchSiteCounts()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 戻るボタン */}
      <BackButton />

      {/* ヘッダー */}
      <div
        className="rounded-lg p-6 mb-8"
        style={{
          backgroundColor: regionColor.bg,
          color: regionColor.text
        }}
      >
        <h1 className="text-3xl font-bold text-center">📆 {region} - 今月のイベント</h1>
        <p className="text-center mt-2 text-sm opacity-90">
          イベント情報を見たいサイトを選んでください
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* サイト一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {sites.map((site) => {
              const count = siteCounts[site] || 0

              return (
                <Link
                  key={site}
                  href={`/month/${encodeURIComponent(region)}/${encodeURIComponent(site)}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-2xl p-6 transition-all duration-300 hover:-translate-y-2 border-2 relative overflow-hidden group"
                  style={{
                    borderColor: regionColor.bg
                  }}
                >
                  {/* ホバーエフェクト */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      backgroundColor: regionColor.bg,
                      opacity: 0.05,
                      pointerEvents: 'none'
                    }}
                  ></div>

                  <div className="relative z-10">
                    {/* サイト名 */}
                    <div className="text-lg font-bold mb-3 text-gray-900 min-h-[56px] flex items-center">
                      {site}
                    </div>

                    {/* イベント件数 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span>📰</span>
                        <span className="font-semibold text-gray-700">{count}件</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        タップして選択 →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
