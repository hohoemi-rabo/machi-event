# 12. レスポンシブデザイン対応

## 概要
モバイル、タブレット、デスクトップすべてのデバイスで快適に閲覧できるレスポンシブデザインを実装します。

## タスク

- [×] Tailwind CSSブレークポイント設定
- [×] モバイルナビゲーション実装
- [×] タッチ操作対応
- [×] 画像の最適化（複数サイズ）
- [×] フォントサイズ調整
- [×] 高齢者対応（文字サイズ可変）
- [ ] 実機テスト

## 実装

### レスポンシブナビゲーション
```typescript
// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            まちイベ
          </Link>

          {/* デスクトップメニュー */}
          <ul className="hidden md:flex gap-6">
            <li>
              <Link href="/" className="hover:text-primary">今日</Link>
            </li>
            <li>
              <Link href="/week" className="hover:text-primary">今週</Link>
            </li>
            <li>
              <Link href="/month" className="hover:text-primary">今月</Link>
            </li>
          </ul>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <ul className="md:hidden mt-4 space-y-2">
            <li>
              <Link href="/" className="block py-2 hover:bg-gray-100 px-2 rounded">今日</Link>
            </li>
            <li>
              <Link href="/week" className="block py-2 hover:bg-gray-100 px-2 rounded">今週</Link>
            </li>
            <li>
              <Link href="/month" className="block py-2 hover:bg-gray-100 px-2 rounded">今月</Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  )
}
```

### Tailwind設定拡張
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // sm: '640px',  // デフォルト
        // md: '768px',  // デフォルト
        // lg: '1024px', // デフォルト
        // xl: '1280px', // デフォルト
      },
      fontSize: {
        // 高齢者対応で大きめのフォント
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
      },
      spacing: {
        // タッチ操作しやすいスペース
        'touch': '44px', // 最小タッチサイズ
      },
    },
  },
}
```

### レスポンシブグリッド
```typescript
// イベントカードのグリッド
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {events.map(event => (
    <EventCard key={event.id} event={event} />
  ))}
</div>
```

### 画像最適化
```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
```

### タッチ操作対応
```css
/* globals.css */
/* タッチデバイスでのホバー無効化 */
@media (hover: none) {
  .hover\:scale-105 {
    transform: scale(1);
  }
}

/* タッチターゲットサイズ確保 */
button,
a {
  min-height: 44px;
  min-width: 44px;
}
```

### 文字サイズ可変機能
```typescript
// src/components/ui/FontSizeSwitcher.tsx
'use client'

import { useState, useEffect } from 'react'

export default function FontSizeSwitcher() {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')

  useEffect(() => {
    const saved = localStorage.getItem('fontSize')
    if (saved) setFontSize(saved as 'normal' | 'large')
  }, [])

  const toggleFontSize = () => {
    const newSize = fontSize === 'normal' ? 'large' : 'normal'
    setFontSize(newSize)
    localStorage.setItem('fontSize', newSize)
    document.documentElement.classList.toggle('text-large', newSize === 'large')
  }

  return (
    <button
      onClick={toggleFontSize}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50"
      aria-label="文字サイズ切り替え"
    >
      {fontSize === 'normal' ? '大' : '小'}
    </button>
  )
}
```

```css
/* globals.css */
.text-large {
  font-size: 18px;
}

.text-large h1 {
  font-size: 2.5rem;
}

.text-large h2 {
  font-size: 2rem;
}
```

## 受け入れ基準
- [×] iPhone, Android, タブレット, PCで正しく表示される
- [×] タッチ操作が快適に動作する
- [×] 画像が最適化されている
- [×] モバイルメニューが動作する
- [×] 文字サイズ切り替えが動作する
- [×] 横画面表示にも対応している

## テストデバイス
- iOS Safari (iPhone 12以降)
- Android Chrome (Pixel 6以降)
- iPad Safari
- Chrome/Safari/Edge (デスクトップ)

## 依存関係
- 全ページの実装完了後に実施
- `07-frontend-setup.md` 〜 `11-share-feature.md` の完了が必要
