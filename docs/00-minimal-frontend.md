# 00. 最小限のフロントエンド構築

## 概要
バックエンド開発中に動作確認できる、最小限のフロントエンドを構築します。

## 目的
- データベースからイベントを取得して表示
- スクレイピング結果を画面で確認
- バックエンドのデバッグを効率化
- 後から本格的なUIを実装するための土台

## タスク

- [×] Supabaseクライアント設定
- [×] イベント一覧表示（シンプルなテーブル）
- [×] スクレイピングログ表示
- [×] 環境変数設定
- [×] 基本的なレイアウト

## 実装

### 1. Supabaseクライアント設定

```bash
# 依存関係インストール
npm install @supabase/supabase-js @supabase/ssr
```

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

### 2. 環境変数設定

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dpeeozdddgmjsnrgxdpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. シンプルなイベント一覧ページ

```typescript
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })
    .limit(20)

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">エラー</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">イベント一覧（開発用）</h1>

      <div className="mb-4 text-gray-600">
        取得件数: {events?.length || 0}件
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">日付</th>
              <th className="px-4 py-2 border">タイトル</th>
              <th className="px-4 py-2 border">場所</th>
              <th className="px-4 py-2 border">地域</th>
              <th className="px-4 py-2 border">情報元</th>
              <th className="px-4 py-2 border">NEW</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border whitespace-nowrap">
                  {event.event_date}
                </td>
                <td className="px-4 py-2 border">
                  <a
                    href={event.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {event.title}
                  </a>
                </td>
                <td className="px-4 py-2 border">{event.place || '-'}</td>
                <td className="px-4 py-2 border">{event.region}</td>
                <td className="px-4 py-2 border text-sm">{event.source_site}</td>
                <td className="px-4 py-2 border text-center">
                  {event.is_new ? '🆕' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!events || events.length === 0) && (
        <p className="text-gray-500 mt-4">イベントがありません</p>
      )}
    </div>
  )
}
```

### 4. スクレイピングログページ

```typescript
// src/app/logs/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function LogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('scraping_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">スクレイピングログ（開発用）</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">日時</th>
              <th className="px-4 py-2 border">サイト名</th>
              <th className="px-4 py-2 border">ステータス</th>
              <th className="px-4 py-2 border">取得件数</th>
              <th className="px-4 py-2 border">エラー</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border whitespace-nowrap text-sm">
                  {new Date(log.created_at).toLocaleString('ja-JP')}
                </td>
                <td className="px-4 py-2 border">{log.site_name}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'failure' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  {log.events_count}
                </td>
                <td className="px-4 py-2 border text-sm text-red-600">
                  {log.error_message || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 5. シンプルなナビゲーション

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'まちイベ（開発版）',
  description: '南信州イベント情報 - 開発版',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-6">
            <Link href="/" className="hover:text-gray-300">
              イベント一覧
            </Link>
            <Link href="/logs" className="hover:text-gray-300">
              スクレイピングログ
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

### 6. TypeScript型定義（最小限）

```typescript
// src/types/database.ts
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

## 受け入れ基準

- [×] Supabaseに接続できる
- [×] イベント一覧が表示される
- [×] スクレイピングログが表示される
- [×] エラー時にエラーメッセージが表示される
- [×] 環境変数が正しく設定されている

## 使い方

```bash
# 開発サーバー起動
npm run dev

# ブラウザで確認
# http://localhost:3000 - イベント一覧
# http://localhost:3000/logs - スクレイピングログ
```

## 次のステップ

このシンプルなフロントエンドができたら：

1. **01-database-design** → データベース設計
2. **02-database-implementation** → テーブル作成
3. **画面でテーブルが見えることを確認** ✅
4. **03-scraping-core** → スクレイピング基盤
5. **04-scraping-sites** → 22サイト対応
6. **画面でイベントが増えることを確認** ✅
7. **05-error-handling** → エラーハンドリング
8. **ログページでエラーを確認** ✅

## 注意事項

- **このフロントは開発用の簡易版**です
- UIデザインは後から実装（07～12）
- 動作確認とデバッグが目的
- 本番環境では使用しません

## 関連ファイル

- `01-database-design.md` - 次のステップ
- `07-frontend-setup.md` - 本格的なフロントエンド実装（後で）

## 依存関係

- なし（最初に実装）
