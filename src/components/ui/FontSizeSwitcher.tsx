'use client'

import { useState, useEffect } from 'react'

export default function FontSizeSwitcher() {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // localStorageから設定を読み込み
    const saved = localStorage.getItem('fontSize')
    if (saved === 'large') {
      setFontSize('large')
      document.documentElement.classList.add('text-large')
    }
  }, [])

  const toggleFontSize = () => {
    const newSize = fontSize === 'normal' ? 'large' : 'normal'
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)

    if (newSize === 'large') {
      document.documentElement.classList.add('text-large')
    } else {
      document.documentElement.classList.remove('text-large')
    }
  }

  // SSRでは表示しない（ハイドレーションエラー回避）
  if (!mounted) return null

  return (
    <button
      onClick={toggleFontSize}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      aria-label={fontSize === 'normal' ? '文字を大きくする' : '文字を小さくする'}
      title={fontSize === 'normal' ? '文字を大きくする' : '文字を小さくする'}
    >
      <div className="flex flex-col items-center">
        <span className="text-base font-bold">
          {fontSize === 'normal' ? '大' : '小'}
        </span>
        <span className="text-xs">
          {fontSize === 'normal' ? 'A+' : 'A-'}
        </span>
      </div>
    </button>
  )
}
