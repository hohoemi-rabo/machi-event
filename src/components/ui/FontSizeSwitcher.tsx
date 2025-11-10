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
      className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition-colors font-medium text-sm"
      aria-label={fontSize === 'normal' ? '文字を大きくする' : '文字を小さくする'}
      title={fontSize === 'normal' ? '文字を大きくする' : '文字を小さくする'}
    >
      {fontSize === 'normal' ? '文字大きく' : '文字小さく'}
    </button>
  )
}
