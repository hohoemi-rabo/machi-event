'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EventCard from '@/components/events/EventCard'
import type { Event } from '@/types/event'
import { getRegionColor } from '@/lib/utils/colors'

// LIFFリダイレクト処理を別コンポーネントに分離
function LiffRedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleLiffRedirect = async () => {
      const code = searchParams.get('code')

      // LINEログイン後のリダイレクトの場合
      if (code) {
        console.log('[LIFF] Authentication code detected, initializing LIFF...')

        try {
          const liffId = process.env.NEXT_PUBLIC_LIFF_ID
          console.log('[LIFF] LIFF ID:', liffId ? 'Found' : 'Not found')

          if (liffId) {
            // LIFFを初期化して認証コードを処理
            await import('@line/liff').then(async ({ default: liff }) => {
              await liff.init({ liffId })
              console.log('[LIFF] Initialized, login status:', liff.isLoggedIn())
            })
          } else {
            console.warn('[LIFF] LIFF ID not found in environment variables')
          }
        } catch (error) {
          console.error('[LIFF] Initialization failed:', error)
        }

        // localStorageから戻り先URLを取得
        const returnUrl = localStorage.getItem('return_url') || '/'
        console.log('[LIFF Redirect] Redirecting to:', returnUrl)
        localStorage.removeItem('return_url')

        // LIFF初期化の成否に関わらず、元のページにリダイレクト
        router.replace(returnUrl)
      }
    }

    handleLiffRedirect()
  }, [searchParams, router])

  return null
}

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

// 今週の日付範囲を取得（YYYY-MM-DD形式の文字列で返す）
function getWeekRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  const dayOfWeek = today.getDay() // 0=日曜、6=土曜

  // 今週の日曜日を計算
  const startDate = new Date(year, month, date - dayOfWeek)
  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`

  // 今週の土曜日を計算
  const endDate = new Date(year, month, date - dayOfWeek + 6)
  const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  return {
    start: startDate,
    end: endDate,
    startStr,
    endStr
  }
}

export default function HomePage() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('飯田市')
  const [selectedSite, setSelectedSite] = useState<string>('飯田市役所')
  const [loading, setLoading] = useState(true)
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchEvents = async () => {
      const { startStr, endStr } = getWeekRange()

      console.log('=== 今週のイベント取得 ===')
      console.log('開始日:', startStr)
      console.log('終了日:', endStr)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', startStr)
        .lte('event_date', endStr)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true })

      console.log('取得件数:', data?.length || 0)
      console.log('南信州ナビのデータ:', data?.filter(e => e.source_site === '南信州ナビ'))

      if (error) {
        console.error('Error fetching events:', error)
        setLoading(false)
        return
      }

      setAllEvents(data || [])

      // 各サイトのイベント件数をカウント（今週のイベントのみ）
      const counts: Record<string, number> = {}
      const allSites = Object.values(REGION_SITES).flat()
      allSites.forEach((site) => {
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

  // 選択したサイトの今週のイベントのみフィルタリング
  const filteredEvents = allEvents.filter((e) => e.source_site === selectedSite)

  // 表示用の日付範囲
  const { start: weekStart, end: weekEnd } = getWeekRange()

  return (
    <>
      {/* LIFFリダイレクト処理 */}
      <Suspense fallback={null}>
        <LiffRedirectHandler />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">今週のイベント</h1>
        <p className="text-gray-600">
          {weekStart.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} 〜{' '}
          {weekEnd.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <>
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

          {/* イベント一覧（カード形式） */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedSite} のイベント（{filteredEvents.length}件）
            </h2>

            {filteredEvents.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-lg">このサイトの今週のイベントはありません</p>
                <p className="text-gray-400 text-sm mt-2">月間イベントもチェックしてみてください</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </>
  )
}
