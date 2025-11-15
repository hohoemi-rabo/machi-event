'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/event'

// 地域別サイトマッピング
const REGION_SITES: Record<string, string[]> = {
  飯田市: ['飯田市役所', '天龍峡温泉観光協会', '遠山観光協会', '飯田市美術博物館'],
  南信州: ['南信州ナビ'],
  高森町: ['高森町役場'],
  松川町: ['松川町役場'],
  阿智村: [
    '阿智村役場',
    '阿智誘客促進協議会',
    '天空の楽園',
    '阿智☆昼神観光局（地域のお知らせ）',
    '阿智☆昼神観光局（昼神観光局からのお知らせ）',
  ],
  平谷村: ['平谷村役場（新着情報）', '平谷村役場（イベント）'],
  根羽村: ['根羽村役場'],
  下条村: ['下条村観光協会'],
  売木村: ['売木村役場', '売木村商工会'],
  天龍村: [
    '天龍村役場（お知らせ）',
    '天龍村役場（行政情報）',
    '天龍村役場（観光情報）',
  ],
  泰阜村: ['泰阜村役場'],
  喬木村: ['喬木村役場'],
  豊丘村: ['豊丘村役場'],
  大鹿村: ['大鹿村役場（お知らせ）', '大鹿村環境協会'],
}

// 全サイトリスト（23サイト）
const ALL_SITES = Object.values(REGION_SITES).flat()

export default function TestPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('飯田市')
  const [selectedSite, setSelectedSite] = useState<string>('飯田市役所')
  const [loading, setLoading] = useState(true)
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('Error fetching events:', error)
        setLoading(false)
        return
      }

      setEvents(data || [])

      // 各サイトのイベント件数をカウント
      const counts: Record<string, number> = {}
      ALL_SITES.forEach((site) => {
        counts[site] = (data || []).filter((e) => e.source_site === site).length
      })
      setSiteCounts(counts)
      setLoading(false)
    }

    fetchEvents()
  }, [])

  // 地域選択時の処理
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    // その地域の最初のサイトを選択（0件でないサイトを優先）
    const sitesInRegion = REGION_SITES[region]
    const firstSiteWithEvents = sitesInRegion.find(
      (site) => (siteCounts[site] || 0) > 0
    )
    setSelectedSite(firstSiteWithEvents || sitesInRegion[0])
  }

  // 地域ごとのイベント件数合計を計算
  const getRegionCount = (region: string) => {
    return REGION_SITES[region].reduce(
      (sum, site) => sum + (siteCounts[site] || 0),
      0
    )
  }

  const filteredEvents = events.filter((e) => e.source_site === selectedSite)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-red-600">
            テスト - スクレイピング確認ページ
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            全26サイトのスクレイピング状況を確認できます（RSS 8サイト + HTML 18サイト）
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <>
            {/* 第1段階: 地域フィルター */}
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h2 className="text-lg font-semibold mb-4">地域選択（14地域）</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.keys(REGION_SITES).map((region) => {
                  const count = getRegionCount(region)
                  const isSelected = selectedRegion === region

                  // 0件の地域は非表示
                  if (count === 0) return null

                  return (
                    <button
                      key={region}
                      onClick={() => handleRegionSelect(region)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="truncate">{region}</div>
                      <div className="text-xs mt-1">{count}件</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 第2段階: サイトフィルター */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedRegion}のサイト（
                {REGION_SITES[selectedRegion].filter((s) => (siteCounts[s] || 0) > 0).length}
                サイト）
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {REGION_SITES[selectedRegion]
                  .filter((site) => (siteCounts[site] || 0) > 0)
                  .map((site) => {
                    const count = siteCounts[site] || 0
                    const isSelected = selectedSite === site

                    return (
                      <button
                        key={site}
                        onClick={() => setSelectedSite(site)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="truncate">{site}</div>
                        <div className="text-xs mt-1">{count}件</div>
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* イベント一覧テーブル */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold">
                  {selectedSite} のイベント一覧（{filteredEvents.length}件）
                </h2>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  このサイトからスクレイピングされたイベントはありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          開催日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          時間
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          場所
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ソースURL
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {event.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {event.event_date
                              ? new Date(event.event_date).toLocaleDateString('ja-JP')
                              : '日付なし'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {event.event_time || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {event.place || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <a
                              href={event.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              リンク →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* サマリー情報 */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">スクレイピングサマリー</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">総イベント数</div>
                  <div className="text-3xl font-bold text-blue-600">{events.length}件</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">スクレイピング成功サイト</div>
                  <div className="text-3xl font-bold text-green-600">
                    {Object.values(siteCounts).filter((c) => c > 0).length} / 26サイト
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">1サイトあたり平均</div>
                  <div className="text-3xl font-bold text-gray-600">
                    {Object.values(siteCounts).filter((c) => c > 0).length > 0
                      ? Math.round(events.length / Object.values(siteCounts).filter((c) => c > 0).length)
                      : 0}
                    件
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
