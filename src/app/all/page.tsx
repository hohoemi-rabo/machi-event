'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/event'
import { getRegionColor, getRegionLightBg } from '@/lib/utils/colors'

// 地域別サイトマッピング
const REGION_SITES: Record<string, string[]> = {
  飯田市: ['飯田市役所', '天龍峡温泉観光協会', '遠山観光協会'],
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

// 全サイトリスト（25サイト）
const ALL_SITES = Object.values(REGION_SITES).flat()

interface ScrapingLog {
  id: string
  site_name: string
  status: string
  events_count: number | null
  error_message: string | null
  created_at: string
}

export default function AllEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('飯田市')
  const [selectedSite, setSelectedSite] = useState<string>('飯田市役所')
  const [loading, setLoading] = useState(true)
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({})
  const [latestScrapingLog, setLatestScrapingLog] = useState<ScrapingLog | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // イベントデータを取得
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false, nullsFirst: false })

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
        setLoading(false)
        return
      }

      setEvents(eventsData || [])

      // 各サイトのイベント件数をカウント
      const counts: Record<string, number> = {}
      ALL_SITES.forEach((site) => {
        counts[site] = (eventsData || []).filter((e) => e.source_site === site).length
      })
      setSiteCounts(counts)

      // 最新のスクレイピングログを取得
      const { data: logData, error: logError } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!logError && logData) {
        setLatestScrapingLog(logData)
      }

      setLoading(false)
    }

    fetchData()
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
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">全イベント</h1>
        <p className="text-gray-600">
          全23サイトのイベント情報を確認できます（RSS 8サイト + HTML 15サイト）
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* データ集計 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">📊 データ集計</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
                }}
              >
                <div className="text-sm text-white/90 font-medium mb-2">📊 総イベント数</div>
                <div className="text-4xl font-bold text-white">{events.length}件</div>
              </div>
              <div
                className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                }}
              >
                <div className="text-sm text-white/90 font-medium mb-2">🌐 取得元サイト</div>
                <div className="text-4xl font-bold text-white">
                  {Object.values(siteCounts).filter((c) => c > 0).length} / 23
                </div>
              </div>
              <div
                className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
                }}
              >
                <div className="text-sm text-white/90 font-medium mb-2">📈 平均収集数</div>
                <div className="text-4xl font-bold text-white">
                  {Object.values(siteCounts).filter((c) => c > 0).length > 0
                    ? Math.round(events.length / Object.values(siteCounts).filter((c) => c > 0).length)
                    : 0}
                  件
                </div>
              </div>
              {/* 自動スクレイピング実行状況 */}
              <div
                className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: latestScrapingLog?.status === 'success'
                    ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                    : latestScrapingLog?.status === 'error'
                    ? 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)'
                    : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)'
                }}
              >
                <div className="text-sm text-white/90 font-medium mb-2">🕷️ 自動スクレイピング</div>
                {latestScrapingLog ? (
                  <>
                    <div className="text-3xl font-bold text-white mb-1">
                      {latestScrapingLog.status === 'success' ? '✅ 成功' : '❌ 失敗'}
                    </div>
                    <div className="text-sm text-white/90 mb-1">
                      {(() => {
                        const now = new Date()
                        const logTime = new Date(latestScrapingLog.created_at)
                        const diffMs = now.getTime() - logTime.getTime()
                        const diffMins = Math.floor(diffMs / 60000)
                        const diffHours = Math.floor(diffMs / 3600000)
                        const diffDays = Math.floor(diffMs / 86400000)

                        if (diffMins < 60) {
                          return `${diffMins}分前`
                        } else if (diffHours < 24) {
                          return `${diffHours}時間前`
                        } else {
                          return `${diffDays}日前`
                        }
                      })()}
                    </div>
                    <div className="text-xs text-white/70">
                      {new Date(latestScrapingLog.created_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-lg text-white">ログなし</div>
                )}
              </div>
            </div>
          </div>

          {/* スクレイピングエラー詳細（失敗時のみ表示） */}
          {latestScrapingLog && latestScrapingLog.status === 'error' && latestScrapingLog.error_message && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-red-800 flex items-center gap-2">
                ⚠️ スクレイピングエラー詳細
              </h2>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="mb-3">
                  <span className="text-sm font-semibold text-gray-700">対象サイト:</span>
                  <span className="ml-2 text-gray-900">{latestScrapingLog.site_name}</span>
                </div>
                <div className="mb-3">
                  <span className="text-sm font-semibold text-gray-700">発生日時:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(latestScrapingLog.created_at).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">エラーメッセージ:</div>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <pre className="text-sm text-red-800 whitespace-pre-wrap break-words font-mono">
                      {latestScrapingLog.error_message}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 第1段階: 地域フィルター */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">地域選択</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.keys(REGION_SITES).map((region) => {
                const count = getRegionCount(region)
                const isSelected = selectedRegion === region
                const regionColor = getRegionColor(region)

                return (
                  <button
                    key={region}
                    onClick={() => handleRegionSelect(region)}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: isSelected ? regionColor.bg : '#F3F4F6',
                      color: isSelected ? regionColor.text : '#374151',
                      opacity: isSelected ? 1 : 0.8,
                      '--hover-bg': regionColor.bg,
                      '--hover-text': regionColor.text,
                    } as React.CSSProperties & { '--hover-bg': string; '--hover-text': string }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = regionColor.bg
                        e.currentTarget.style.color = regionColor.text
                        e.currentTarget.style.opacity = '0.9'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#F3F4F6'
                        e.currentTarget.style.color = '#374151'
                        e.currentTarget.style.opacity = '0.8'
                      }
                    }}
                  >
                    <div className="truncate">{region} [{count}]</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 第2段階: サイトフィルター */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedRegion}のサイト（
              {REGION_SITES[selectedRegion].length}
              サイト）
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {REGION_SITES[selectedRegion].map((site) => {
                const count = siteCounts[site] || 0
                const isSelected = selectedSite === site
                const regionColor = getRegionColor(selectedRegion)

                return (
                  <button
                    key={site}
                    onClick={() => setSelectedSite(site)}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all hover:shadow-md"
                    style={{
                      backgroundColor: isSelected ? regionColor.bg : '#F3F4F6',
                      color: isSelected ? regionColor.text : '#374151',
                    }}
                  >
                    <div className="truncate">{site} [{count}]</div>
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
                  <thead className="border-b">
                    <tr
                      style={{
                        backgroundColor: getRegionColor(selectedRegion).bg,
                        color: getRegionColor(selectedRegion).text,
                      }}
                    >
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        タイトル
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        開催日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        地域
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        場所
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        ソースURL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-opacity-80 transition-colors"
                        style={{
                          backgroundColor: getRegionLightBg(event.region)
                        }}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {event.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {event.event_date
                            ? new Date(event.event_date).toLocaleDateString('ja-JP')
                            : '日付なし'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {event.region || '-'}
                        </td>
                        {/* <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {event.event_time || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {event.place || '-'}
                        </td> */}
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
        </>
      )}
    </div>
  )
}
