# 07. フロントエンド基盤構築

## 概要
Next.js App Routerを使用したフロントエンド開発の基盤を構築します。

## 目的
- 共通コンポーネントの作成
- Supabaseクライアント設定
- 共通レイアウトの実装
- ユーティリティ関数の整備

## タスク

- [×] Supabase JSクライアント設定
- [×] 共通レイアウト実装（Header、Footer）
- [×] ナビゲーションコンポーネント作成
- [×] Loadingコンポーネント作成
- [ ] Errorコンポーネント作成（次フェーズで対応）
- [×] 日付フォーマット関数実装
- [×] 環境変数設定
- [×] TypeScript型定義作成

## 実装

### Supabaseクライアント設定

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### 型定義

```typescript
// src/types/event.ts
export interface Event {
  id: string
  title: string
  event_date: string
  event_time?: string
  place?: string
  detail?: string
  source_url: string
  source_site: string
  region: string
  image_url?: string
  is_new: boolean
  created_at: string
  updated_at: string
}

export interface ScrapingLog {
  id: string
  site_name: string
  status: 'success' | 'failure' | 'partial'
  events_count: number
  error_message?: string
  created_at: string
}
```

### 共通レイアウト

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '南信州イベント情報 | まちイベ',
  description: '南信州地域のイベント情報を一元管理。今日、週末、今月のイベントをチェック！',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Headerコンポーネント

```typescript
// src/components/layout/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            まちイベ
          </Link>

          <ul className="flex gap-6">
            <li>
              <Link href="/" className="hover:text-primary">
                今日
              </Link>
            </li>
            <li>
              <Link href="/week" className="hover:text-primary">
                今週
              </Link>
            </li>
            <li>
              <Link href="/month" className="hover:text-primary">
                今月
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
```

### ユーティリティ関数

```typescript
// src/lib/utils/date.ts
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function getWeekRange(): { start: Date; end: Date } {
  const today = new Date()
  const end = new Date(today)
  end.setDate(today.getDate() + 7)
  return { start: today, end }
}

export function getMonthRange(): { start: Date; end: Date } {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { start: today, end }
}
```

### Loadingコンポーネント

```typescript
// src/components/ui/Loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
```

### 環境変数

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dpeeozdddgmjsnrgxdpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 受け入れ基準
- [×] Supabaseクライアントが正しく設定されている
- [×] 共通レイアウトが全ページに適用される
- [×] ナビゲーションが動作する
- [×] TypeScript型定義が完備されている
- [×] ユーティリティ関数が動作する
- [×] 環境変数が適切に設定されている

## 関連ファイル
- `docs/08-event-list-pages.md` - イベント一覧ページ
- `src/app/layout.tsx`
- `src/lib/supabase/`
- `src/components/layout/`

## 依存関係
- `02-database-implementation.md` の完了が必要（Supabaseプロジェクト）

## 技術メモ

### Supabase JSクライアントインストール
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Tailwind設定拡張
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },
  },
}
```

## 参考
- Supabase JS Client: https://supabase.com/docs/reference/javascript
- Next.js App Router: https://nextjs.org/docs/app
