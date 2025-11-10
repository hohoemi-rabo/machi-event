'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

// 実際のサイト設定から取得した地域リスト（フィルターボタンと同じ順序）
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
  '大鹿村'
]

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    region: searchParams.get('region') || '',
    keyword: searchParams.get('keyword') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  })

  // searchParamsが変更されたらフィルター状態を更新
  useEffect(() => {
    setFilters({
      region: searchParams.get('region') || '',
      keyword: searchParams.get('keyword') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || ''
    })
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.region) params.set('region', filters.region)
    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      region: '',
      keyword: '',
      dateFrom: '',
      dateTo: ''
    })
    router.push(window.location.pathname)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 地域フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            地域
          </label>
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべての地域</option>
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* キーワード検索 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            キーワード
          </label>
          <input
            type="text"
            placeholder="タイトルや詳細で検索"
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 開始日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 終了日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={applyFilters}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors font-medium"
        >
          検索
        </button>
        <button
          onClick={clearFilters}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors font-medium"
        >
          クリア
        </button>
      </div>
    </div>
  )
}
