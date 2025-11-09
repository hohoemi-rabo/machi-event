# 11. シェア機能実装

## 概要
LINE、X（Twitter）、URLコピーでイベント情報を共有する機能を実装します。

## タスク

- [×] ShareButtonsコンポーネント作成
- [×] LINE共有実装
- [×] X（Twitter）共有実装
- [×] URLコピー機能実装
- [×] コピー完了通知表示

## 実装

### ShareButtonsコンポーネント
```typescript
// src/components/events/ShareButtons.tsx
'use client'

import { useState } from 'react'
import type { Event } from '@/types/event'

interface ShareButtonsProps {
  event: Event
}

export default function ShareButtons({ event }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/${event.id}`
    : ''

  const shareText = `${event.title} | まちイベ`

  const handleLineShare = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
      `${shareText}\n${shareUrl}`
    )}`
    window.open(lineUrl, '_blank')
  }

  const handleXShare = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(xUrl, '_blank', 'width=550,height=420')
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-3">このイベントを共有</h3>
      <div className="flex gap-3">
        <button
          onClick={handleLineShare}
          className="flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg hover:opacity-90"
          aria-label="LINEで共有"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINE
        </button>

        <button
          onClick={handleXShare}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
          aria-label="Xで共有"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </button>

        <button
          onClick={handleCopyUrl}
          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          aria-label="URLをコピー"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'コピーしました！' : 'URLコピー'}
        </button>
      </div>
    </div>
  )
}
```

### Web Share API対応（モバイル用）
```typescript
'use client'

export default function ShareButtons({ event }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && navigator.share

  const handleWebShare = async () => {
    if (!canShare) return

    try {
      await navigator.share({
        title: event.title,
        text: `${event.title} | まちイベ`,
        url: `${window.location.origin}/event/${event.id}`
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err)
      }
    }
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-3">このイベントを共有</h3>

      {canShare ? (
        <button
          onClick={handleWebShare}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          共有する
        </button>
      ) : (
        <div className="flex gap-3">
          {/* 既存のボタン */}
        </div>
      )}
    </div>
  )
}
```

## 受け入れ基準
- [×] LINE共有が動作する
- [×] X（Twitter）共有が動作する
- [×] URLコピーが動作する
- [×] コピー完了通知が表示される
- [×] モバイルでWeb Share APIが使用される

## 依存関係
- `10-event-detail-page.md` と並行実装可能
