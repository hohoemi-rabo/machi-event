'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface RegionFilterProps {
  availableRegions?: string[]
}

export default function RegionFilter({ availableRegions }: RegionFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRegion = searchParams.get('region') || ''

  // availableRegionsが渡されていない場合は全地域を表示（後方互換性）
  const regions = availableRegions || [
    '飯田市',
    '高森町',
    '松川町',
    '阿智村',
    '平谷村',
    '泰阜村',
    '喬木村',
    '根羽村',
    '下条村',
    '売木村',
    '天龍村',
    '豊丘村',
    '大鹿村'
  ].sort()

  const handleRegionClick = (region: string) => {
    if (region) {
      router.push(`?region=${region}`)
    } else {
      router.push(window.location.pathname)
    }
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-700 mb-3">地域で絞り込み</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleRegionClick('')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentRegion === ''
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {regions.map(region => (
          <button
            key={region}
            onClick={() => handleRegionClick(region)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              currentRegion === region
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  )
}
