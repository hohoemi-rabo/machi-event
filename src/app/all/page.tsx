'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/event'
import { getRegionColor, getRegionLightBg } from '@/lib/utils/colors'

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

// 全サイトリスト（26サイト）
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
  const [animatedEventCount, setAnimatedEventCount] = useState(0)
  const [animatedSiteCount, setAnimatedSiteCount] = useState(0)

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

  // アニメーション用のuseEffect
  useEffect(() => {
    if (!loading) {
      // データ読み込み完了後、少し遅延させてからアニメーション開始
      const timer = setTimeout(() => {
        setAnimatedEventCount(events.length)
        setAnimatedSiteCount(Object.values(siteCounts).filter((c) => c > 0).length)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, events.length, siteCounts])

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
          全26サイトのイベント情報を確認できます
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* データ集計 */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-8 mb-6 border border-cyan-500/30">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span>📈</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">データ集計</span>
            </h2>

            <div className="space-y-6">
              {/* 総イベント数バー */}
              <div className="group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-cyan-300 tracking-wider">📊 総イベント数</span>
                  <span className="text-2xl font-black text-white">{events.length} 件</span>
                </div>
                <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${events.length > 0 ? Math.min((animatedEventCount / events.length) * 100, 100) : 0}%`,
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">現在 {events.length} 件取得中</div>
              </div>

              {/* 取得元サイトバー */}
              <div className="group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-emerald-300 tracking-wider">🌐 取得元サイト</span>
                  <span className="text-2xl font-black text-white">
                    {Object.values(siteCounts).filter((c) => c > 0).length} / 26 サイト
                  </span>
                </div>
                <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-emerald-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(animatedSiteCount / 26) * 100}%`,
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                  成功率 {Math.round((animatedSiteCount / 26) * 100)}%
                </div>
              </div>

              {/* 自動スクレイピングステータス */}
              <div className="relative mt-8 rounded-xl p-8 border-2 overflow-hidden group"
                style={{
                  background: latestScrapingLog?.status === 'success'
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.25) 100%)'
                    : latestScrapingLog?.status === 'error'
                    ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(239, 68, 68, 0.25) 100%)'
                    : 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(107, 114, 128, 0.25) 100%)',
                  borderColor: latestScrapingLog?.status === 'success'
                    ? 'rgba(6, 182, 212, 0.6)'
                    : latestScrapingLog?.status === 'error'
                    ? 'rgba(239, 68, 68, 0.6)'
                    : 'rgba(107, 114, 128, 0.6)',
                  boxShadow: latestScrapingLog?.status === 'success'
                    ? '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)'
                    : latestScrapingLog?.status === 'error'
                    ? '0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)'
                    : '0 0 20px rgba(107, 114, 128, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* 背景アニメーション */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative z-10">
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🕷️</div>
                      <div>
                        <div className="text-xs text-cyan-400 font-bold tracking-widest uppercase">自動更新状況</div>
                        <div className="text-sm text-gray-400 font-mono mt-1">Daily Execution</div>
                      </div>
                    </div>
                    {latestScrapingLog && (
                      <div
                        className="px-4 py-2 rounded-lg font-black text-sm tracking-wider"
                        style={{
                          background: latestScrapingLog.status === 'success'
                            ? 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)'
                            : 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                          boxShadow: latestScrapingLog.status === 'success'
                            ? '0 0 20px rgba(6, 182, 212, 0.6)'
                            : '0 0 20px rgba(239, 68, 68, 0.6)'
                        }}
                      >
                        {latestScrapingLog.status === 'success' ? '✅ SUCCESS' : '❌ FAILED'}
                      </div>
                    )}
                  </div>

                  {latestScrapingLog ? (
                    <div className="grid grid-cols-2 gap-6">
                      {/* 経過時間 */}
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="text-xs text-gray-400 font-mono mb-2">ELAPSED TIME</div>
                        <div className="text-2xl font-bold text-white">
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
                      </div>

                      {/* 実行日時 */}
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="text-xs text-gray-400 font-mono mb-2">EXECUTION TIME</div>
                        <div className="text-lg font-mono font-bold text-white">
                          {new Date(latestScrapingLog.created_at).toLocaleString('ja-JP', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {new Date(latestScrapingLog.created_at).getFullYear()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📭</div>
                      <div className="text-xl font-bold text-white/50">NO LOG DATA</div>
                      <div className="text-sm text-gray-500 mt-2">スクレイピングログがありません</div>
                    </div>
                  )}
                </div>
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
                  <thead
                    className="border-b-2"
                    style={{ borderColor: getRegionColor(selectedRegion).bg }}
                  >
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
                        更新日
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
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-opacity-80 transition-colors border-b"
                        style={{
                          backgroundColor: getRegionLightBg(event.region),
                          borderColor: getRegionColor(event.region).bg
                        }}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <a
                            href={event.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                          >
                            {event.title}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {event.updated_at
                            ? new Date(event.updated_at).toLocaleDateString('ja-JP')
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
