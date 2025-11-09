# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

南信州地域のイベント情報を一元化する情報集約サービス。複数の情報源に散在するイベント情報を自動収集し、ユーザーに「探さなくていい状態」を提供する。

**プロジェクトステージ**: Phase 2進行中（Ticket 00-08完了、フロントエンド基盤・一覧ページ実装済み）

## 技術スタック

- **フレームワーク**: Next.js 15.5.6 (App Router)
- **言語**: TypeScript
- **UI**: React 19.1.0
- **スタイリング**: Tailwind CSS 3.4.17
- **データベース**: Supabase (PostgreSQL)
- **バックエンド**: Supabase Edge Functions
- **ホスティング**: Vercel

## 開発コマンド

```bash
# 開発サーバー起動（http://localhost:3000）
npm run dev

# 本番ビルド
npm run build

# ビルド後サーバー起動
npm start

# ESLint実行
npm run lint
```

## プロジェクト構成

```
src/app/                         # Next.js App Router
  ├── layout.tsx                 # ルートレイアウト（Geistフォント設定）
  ├── page.tsx                   # ホームページ
  └── globals.css                # グローバルスタイル（Tailwind設定）

supabase/functions/              # Supabase Edge Functions
  └── scrape-events/             # スクレイピング機能（11ファイル）
      ├── index.ts               # メインエントリーポイント
      ├── types.ts               # 型定義
      ├── utils.ts               # ユーティリティ関数
      ├── error-types.ts         # カスタムエラークラス
      ├── retry.ts               # リトライロジック
      ├── structure-checker.ts   # 構造変更検知
      ├── alert.ts               # Slack通知
      ├── sites-config.ts        # 28サイト設定
      ├── html-parser.ts         # HTMLパーサー
      ├── rss-parser.ts          # RSSパーサー
      └── date-utils.ts          # 日付パース

docs/                            # チケット管理
  ├── 00-minimal-frontend.md     # Phase 0 ✅
  ├── 01-database-design.md      # Phase 1 ✅
  ├── 02-database-implementation.md ✅
  ├── 03-scraping-core.md        # ✅
  ├── 04-scraping-sites.md       # ✅
  ├── 05-error-handling.md       # ✅
  ├── 06-cron-setup.md           # ⏳ 後回し
  ├── 07-frontend-setup.md       # Phase 2 ✅
  ├── 08-event-list-pages.md     # ✅
  ├── 09-filtering-feature.md    # ⏳ 次のタスク
  └── 10-17-*.md                 # Phase 2-4（未着手）

public/                          # 静的ファイル
```

**パスエイリアス**: `@/` は `src/` にマッピング（`tsconfig.json`で設定）

```typescript
// 使用例
import { Component } from '@/components/Component';
```

## アーキテクチャパターン

サーバーレス構成:
```
フロントエンド (Next.js + Vercel)
    ↓
API層 (Supabase Edge Functions)
    ↓
データベース (Supabase PostgreSQL)
    ↓
スクレイピング (Playwright/Cheerio)
```

## データベース設計

### eventsテーブル
```sql
id: UUID (PK)
title: TEXT NOT NULL
event_date: DATE NOT NULL
event_time: TEXT
place: TEXT
detail: TEXT
source_url: TEXT NOT NULL
source_site: TEXT NOT NULL
region: TEXT DEFAULT '飯田市'
image_url: TEXT
is_new: BOOLEAN DEFAULT true
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### scraping_logsテーブル
```sql
id: UUID (PK)
site_name: TEXT NOT NULL
status: TEXT NOT NULL
events_count: INTEGER
error_message: TEXT
error_type: TEXT
stack_trace: TEXT
created_at: TIMESTAMP
```

### line_usersテーブル（将来実装）
```sql
id: UUID (PK)
line_user_id: TEXT UNIQUE
regions: TEXT[]
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
```

## 画面構成（計画）

| 画面 | URL | 説明 |
|------|-----|------|
| トップページ | `/` | 今日のイベント一覧 |
| 週間イベント | `/week` | 今週のイベント |
| 月間イベント | `/month` | 今月のイベント |
| イベント詳細 | `/event/[id]` | 個別イベント詳細 |
| 地域別 | `/region/[name]` | 地域フィルタリング |

## 主要機能要件

### フェーズ1: 基盤構築 ✅ 完了
- 28サイトからの自動スクレイピング（RSS 7サイト、HTML 21サイト）
- 1日1回深夜帯実行（Cron設定は次フェーズ）
- 重複判定（タイトル＋開催日＋取得元）
- エラーハンドリングとログ記録
- リトライロジック（指数バックオフ）
- 構造変更検知
- Slack通知機能

### フェーズ2: Web UI
- イベント一覧（今日/週/月）
- フィルタリング（地域別、日付範囲、キーワード検索）
- カード型UI
- シェア機能（LINE、X、URLコピー）

### フェーズ3: LINE連携
- LINE公式アカウント統合
- 毎朝8時通知
- 地域別フィルター設定

### フェーズ4: 運用管理
- スクレイピングログ確認
- エラー監視
- 手動イベント追加

## スタイリング設定

### Tailwind CSS
- **カラー変数**: `--background`, `--foreground`（ライト/ダークモード対応）
- **フォント**: Geist Sans（通常）、Geist Mono（コード）
- **ブレークポイント**: モバイルファーストでsm以上でレスポンシブ対応

### ダークモード
- CSS Media Query: `@media (prefers-color-scheme: dark)`
- OS設定に基づく自動切り替え

## Supabase連携

**MCP設定**: `.mcp.json`にアクセストークンを保存（`.gitignore`で除外済み）

**プロジェクト情報**:
- Organization: create-hohoemi
- Project ID: dpeeozdddgmjsnrgxdpz
- Project Name: machi-event
- Region: ap-northeast-1 (東京) ✨
- Status: ACTIVE_HEALTHY
- Database: PostgreSQL 17

**Supabase MCP経由での操作**:
```typescript
// プロジェクト情報確認
mcp__supabase__get_project({ id: "dpeeozdddgmjsnrgxdpz" })

// テーブル一覧
mcp__supabase__list_tables({ project_id: "dpeeozdddgmjsnrgxdpz" })

// マイグレーション実行
mcp__supabase__apply_migration({
  project_id: "dpeeozdddgmjsnrgxdpz",
  name: "migration_name",
  query: "CREATE TABLE ..."
})

// SQL実行
mcp__supabase__execute_sql({
  project_id: "dpeeozdddgmjsnrgxdpz",
  query: "SELECT * FROM events"
})
```

## Supabase Edge Functions アーキテクチャ

**実行環境**: Deno 1.x ランタイム（TypeScript ネイティブサポート）

### ファイル構成（11ファイル）

```
supabase/functions/scrape-events/
├── index.ts              # メインエントリーポイント（182行）
├── types.ts              # TypeScript型定義
├── utils.ts              # ユーティリティ関数（122行）
├── error-types.ts        # カスタムエラークラス
├── retry.ts              # リトライロジック（指数バックオフ）
├── structure-checker.ts  # サイト構造変更検知
├── alert.ts              # Slack通知システム（206行）
├── sites-config.ts       # 28サイト設定（RSS 7 + HTML 21）
├── html-parser.ts        # CheerioベースのHTMLパーサー
├── rss-parser.ts         # RSS 2.0/Atom フィードパーサー
└── date-utils.ts         # 日本語日付パース
```

### 主要モジュールの役割

#### index.ts（メインエントリーポイント）
- Edge Function のHTTPハンドラー
- 全サイトの並列スクレイピング実行
- エラーハンドリングとログ記録
- レスポンス生成

```typescript
Deno.serve(async (req) => {
  const results = await Promise.all(
    sites.map(site => scrapeWithRetry(site))
  )
  return new Response(JSON.stringify(results))
})
```

#### sites-config.ts（28サイト設定）
- サイト情報の一元管理
- RSS/HTML の型区別
- セレクター設定（HTML）
- フィード形式指定（RSS）

```typescript
export const sites: SiteConfig[] = [
  // RSS形式（7サイト）
  { name: "飯田市", type: "rss", url: "...", feedType: "rss2" },

  // HTML形式（21サイト）
  { name: "阿南町", type: "html", url: "...",
    selectors: { container: ".event-list", title: "h2", ... } }
]
```

#### html-parser.ts（HTMLパーサー）
- Cheerio による DOM 操作
- セレクターベースの要素抽出
- エラーハンドリング（要素不在検知）

#### rss-parser.ts（RSSパーサー）
- RSS 2.0 形式対応
- Atom 形式対応
- XML パース

#### date-utils.ts（日本語日付パース）
- 「令和6年12月25日」形式
- 「2024年12月25日」形式
- 「12月25日」形式（年補完）
- 「12/25」形式（年補完）
- ISO 8601形式

#### utils.ts（ユーティリティ）
- `isDuplicate()`: 重複判定（title + event_date + source_site）
- `insertEvent()`: イベント挿入
- `logScrapingResult()`: スクレイピング結果ログ
- `logDetailedError()`: 詳細エラーログ（error_type, stack_trace含む）

## エラーハンドリングシステム

### エラー分類（ErrorType）

```typescript
enum ErrorType {
  NETWORK = 'network',      // ネットワークエラー
  PARSING = 'parsing',      // パースエラー
  DATABASE = 'database',    // データベースエラー
  VALIDATION = 'validation' // バリデーションエラー
}
```

### リトライロジック

**実装**: `retry.ts`

```typescript
// 最大3回リトライ
// 初回: 2秒待機
// 2回目: 4秒待機（2^1 × 2秒）
// 3回目: 8秒待機（2^2 × 2秒）
await retryWithBackoff(
  () => scrapeFromSite(site),
  { maxRetries: 3, initialDelay: 2000 }
)
```

**対象エラー**:
- ネットワークタイムアウト
- 一時的なサーバーエラー（500系）
- DNS解決失敗

**リトライしないエラー**:
- 404 Not Found
- パースエラー（サイト構造変更）
- バリデーションエラー

### 構造変更検知

**実装**: `structure-checker.ts`

```typescript
// 過去10回の平均取得件数の50%未満で異常検知
const avgCount = calculateAverage(last10Results)
if (currentCount < avgCount * 0.5) {
  await sendAlert("Structure change detected")
}
```

**検知条件**:
- 取得件数が過去平均の50%未満
- 連続してパースエラー発生

### Slack通知機能

**実装**: `alert.ts`（206行）

**通知タイミング**:
- 構造変更検知時
- 連続エラー発生時（3回以上）
- データベース接続エラー

**設定**:
```bash
# 環境変数
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**通知内容**:
- サイト名
- エラータイプ
- エラーメッセージ
- 発生時刻
- スタックトレース（オプション）

## デプロイメントワークフロー

### Supabase Dashboard経由（推奨）

1. https://dashboard.supabase.com にアクセス
2. machi-event プロジェクト選択
3. Edge Functions → scrape-events
4. "Deploy new version" をクリック
5. ファイルアップロード
6. 環境変数設定（SLACK_WEBHOOK_URL等）
7. デプロイ実行

### Supabase CLI経由

```bash
# Edge Function デプロイ
supabase functions deploy scrape-events

# 環境変数設定
supabase secrets set SLACK_WEBHOOK_URL=your-webhook-url

# ローカルテスト
supabase functions serve scrape-events
curl http://localhost:54321/functions/v1/scrape-events
```

**注意点**:
- CLI認証エラーが発生する場合は Dashboard 経由を使用
- デプロイ後、Supabase Dashboard でログ確認
- 初回実行は手動で動作確認を推奨

## セキュリティ要件

- HTTPS通信
- SQLインジェクション/XSS対策
- APIキーは環境変数管理（`.env*`は`.gitignore`済み）
- 個人情報収集最小化（LINE IDのみ）

## 非機能要件

- **パフォーマンス**: ページ読み込み3秒以内、同時接続50ユーザー
- **可用性**: 稼働率95%以上
- **互換性**: Chrome/Safari/Edge最新2バージョン、iOS 14+、Android 10+
- **ユーザビリティ**: モバイルファースト、高齢者対応（文字サイズ可変）

## 開発ロードマップ

1. **Phase 1（2-3週間）**: データベース設計、スクレイピング機能、定期実行設定
2. **Phase 2（1-2週間）**: フロントエンド実装、イベント一覧、フィルタリング
3. **Phase 3（1週間）**: LINE Messaging API統合、通知機能
4. **Phase 4（1週間）**: テスト、Vercelデプロイ、運用ドキュメント

## 現在の状態

### Phase 0: 開発準備 ✅
- ✅ Next.jsプロジェクトセットアップ完了
- ✅ Tailwind CSS設定完了
- ✅ TypeScript設定完了
- ✅ Supabase MCP接続確認済み
- ✅ 最小限フロントエンド構築（`00-minimal-frontend.md`）

### Phase 1: 基盤構築 ✅
- ✅ データベース設計・実装（`01-02`）
  - eventsテーブル、scraping_logsテーブル作成
  - RLSポリシー設定完了
- ✅ スクレイピング基盤構築（`03-04`）
  - Edge Functions実装（11ファイル構成）
  - 28サイト対応（RSS 8 + HTML 20）
  - RSS 1.0 (RDF) 形式対応（`<dc:date>`要素）
  - RSS 2.0形式対応（`<pubDate>`要素）
  - 日本語日付パース機能
- ✅ エラーハンドリング強化（`05`）
  - カスタムエラークラス
  - リトライロジック（指数バックオフ）
  - 構造変更検知
  - Slack通知機能
- ✅ Edge Functions デプロイ完了

### Phase 1.5: 定期実行 ⏳ 後回し
- ⏳ Cron設定（`06-cron-setup.md`）

### Phase 2: Web UI 🚧 進行中
- ✅ フロントエンド基盤構築（`07`）
  - Supabase クライアント（SSR対応）
  - TypeScript型定義
  - レイアウトコンポーネント（Header/Footer）
  - 日付ユーティリティ
  - Tailwind カスタムテーマ
- ✅ イベント一覧ページ（`08`）
  - 今日・今週・今月のイベント表示
  - EventCardコンポーネント
  - ISR（1時間ごと再生成）
  - レスポンシブグリッドレイアウト
- ⏳ フィルタリング機能（`09`）← 次のタスク
- ⏳ イベント詳細ページ（`10`）
- ⏳ シェア機能（`11`）
- ⏳ レスポンシブデザイン（`12`）

### Phase 3-4: LINE連携・運用 ⏳ 未着手
- ⏳ LINE連携（`13-14`）
- ⏳ テスト・デプロイ・運用（`15-17`）

## Next.js App Router ベストプラクティス

### Server Components vs Client Components

**基本原則**:
- すべてのコンポーネントはデフォルトでServer Component
- インタラクティブ性（onClick、useState等）が必要な場合のみClient Componentを使用
- `'use client'`ディレクティブでClient Componentを明示

**Server Componentの利点**:
- バンドルサイズの削減（クライアント側JavaScriptが少ない）
- サーバー側でのデータフェッチング（APIキーの安全な利用）
- SEO対応（初期HTMLにコンテンツが含まれる）

```typescript
// Server Component（デフォルト）
export default async function EventList() {
  const events = await getEvents() // サーバー側で実行
  return <div>{events.map(event => ...)}</div>
}

// Client Component（インタラクティブな要素のみ）
'use client'
export default function LikeButton({ eventId }: { eventId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>Like</button>
}
```

### データフェッチングパターン

**Server Componentでの直接フェッチ**:
```typescript
// app/events/page.tsx
async function getEvents() {
  const res = await fetch('https://api.example.com/events', {
    next: { revalidate: 3600 } // 1時間ごとに再検証
  })
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export default async function EventsPage() {
  const events = await getEvents()
  return <EventList events={events} />
}
```

**キャッシング戦略**:
- `cache: 'no-store'` - キャッシュしない（動的データ）
- `next: { revalidate: 60 }` - 60秒ごとに再検証（ISR）
- デフォルト - 永続的にキャッシュ（静的データ）

**Client Componentからのフェッチ**:
```typescript
'use client'
export default function SearchResults() {
  const [results, setResults] = useState([])

  // Route Handler経由でフェッチ
  useEffect(() => {
    fetch('/api/search')
      .then(res => res.json())
      .then(setResults)
  }, [])

  return <div>{results.map(...)}</div>
}
```

### データ受け渡しパターン

**Server → Client へのprops渡し**:
```typescript
// Server Component
import ClientButton from './client-button'

export default async function Page() {
  const data = await fetchData()
  return <ClientButton data={data} /> // propsでデータ渡し
}

// Client Component
'use client'
export default function ClientButton({ data }) {
  return <button onClick={...}>{data.title}</button>
}
```

### レイアウトとネストルーティング

**レイアウトの活用**:
```typescript
// app/layout.tsx - ルートレイアウト
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header /> {/* 全ページ共通 */}
        {children}
        <Footer />
      </body>
    </html>
  )
}

// app/events/layout.tsx - ネストレイアウト
export default function EventsLayout({ children }) {
  return (
    <div>
      <EventsNav /> {/* イベントページ共通 */}
      {children}
    </div>
  )
}
```

### Loading UI と Suspense

**ローディング状態の管理**:
```typescript
// app/events/loading.tsx - 自動的にSuspense境界になる
export default function Loading() {
  return <div>読み込み中...</div>
}

// または手動でSuspense使用
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <EventList />
    </Suspense>
  )
}
```

### エラーハンドリング

**error.tsxでのエラーキャッチ**:
```typescript
// app/events/error.tsx
'use client' // Error componentsはClient Componentである必要がある

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  )
}
```

### パフォーマンス最適化

**並列データフェッチング**:
```typescript
// ❌ 逐次フェッチング（遅い）
const events = await getEvents()
const users = await getUsers()

// ✅ 並列フェッチング（速い）
const [events, users] = await Promise.all([
  getEvents(),
  getUsers()
])
```

**画像最適化**:
```typescript
import Image from 'next/image'

<Image
  src={event.imageUrl}
  alt={event.title}
  width={400}
  height={300}
  priority={false} // Above the foldの画像のみtrue
/>
```

**動的インポート**:
```typescript
// 大きなコンポーネントを遅延ロード
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <p>Loading...</p>,
  ssr: false // クライアント側のみでレンダリング
})
```

### Route Handlers (API Routes)

**API エンドポイントの作成**:
```typescript
// app/api/events/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const events = await fetchEventsFromDB()
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const body = await request.json()
  // イベント作成処理
  return NextResponse.json({ success: true })
}
```

### 環境変数の使用

**サーバー側とクライアント側の区別**:
```typescript
// サーバー側のみ（.env.local）
process.env.DATABASE_URL
process.env.API_SECRET_KEY

// クライアント側でも使用可能（NEXT_PUBLIC_ プレフィックス必須）
process.env.NEXT_PUBLIC_API_URL
```

### このプロジェクトでの適用

1. **イベント一覧ページ**: Server Componentでデータフェッチ、キャッシュ活用
2. **フィルター機能**: Client Componentで実装、URLSearchParamsと連携
3. **詳細ページ**: 動的ルート`[id]`使用、静的生成で高速化
4. **共有機能**: Client Componentでブラウザ APIを使用
5. **LINE通知**: Route Handlerで実装、Supabase連携

## チケット管理とTodo

### 推奨開発フロー

**バックエンド実装と並行してフロントで確認する方式**を推奨します：

```
00. 最小限のフロントエンド構築 ← まずこれ！
  ↓ シンプルなテーブル表示
  ↓
01-02. データベース実装
  ↓ 画面でテーブルが見えることを確認 ✅
  ↓
03-04. スクレイピング実装
  ↓ 画面でイベントが増えることを確認 ✅
  ↓
05-06. エラーハンドリング・Cron
  ↓ ログページでエラーを確認 ✅
  ↓
07-12. 本格的なUI実装
  ↓
13-17. LINE連携・テスト・デプロイ
```

### チケットファイル

`/docs`ディレクトリに機能毎のチケットファイルがあります:

**Phase 0: 開発準備**
- `00-minimal-frontend.md` - 最小限のフロントエンド（開発用・最優先）

**Phase 1: 基盤構築**
- `01-database-design.md` - データベース設計 ✅
- `02-database-implementation.md` - データベース実装 ✅
- `03-scraping-core.md` - スクレイピング基盤構築 ✅
- `04-scraping-sites.md` - 28サイト対応 ✅
- `05-error-handling.md` - エラーハンドリング強化 ✅
- `06-cron-setup.md` - 定期実行（Cron）設定 ⏳

**Phase 2: Web UI**
- `07-frontend-setup.md` - フロントエンド基盤構築
- `08-event-list-pages.md` - イベント一覧ページ実装
- `09-filtering-feature.md` - フィルタリング機能実装
- `10-event-detail-page.md` - イベント詳細ページ実装
- `11-share-feature.md` - シェア機能実装
- `12-responsive-design.md` - レスポンシブデザイン対応

**Phase 3: LINE連携**
- `13-line-integration.md` - LINE連携基盤構築
- `14-notification-feature.md` - LINE通知機能実装

**Phase 4: 運用・保守**
- `15-testing.md` - テスト実施
- `16-deployment.md` - Vercelデプロイ
- `17-operations.md` - 運用・保守

### Todo管理ルール

各チケットファイル内のTodoは以下の形式で管理:

```markdown
## タスク

- [ ] 未完了のタスク
- [×] 完了したタスク
```

**重要なルール**:
1. タスクが完了したら `- [ ]` を `- [×]` に変更する
2. 各チケットの「受け入れ基準」もTodo形式で管理
3. 依存関係を確認してから作業開始
4. 完了したチケットは次のチケットへ進む

**進捗確認**:
```bash
# 全チケットの進捗確認
grep -r "\- \[" docs/

# 完了タスク数の確認
grep -r "\- \[×\]" docs/ | wc -l
```

## 重要な注意事項

### ⚠️ 本番環境への注意
- **town-reviews プロジェクト（xkmirweadwadcikvikdq）は本番稼働中**
  - 絶対に触らない、変更しない、削除しない
  - このプロジェクトは別サービスで現在運用中
  - 作業対象は machi-event プロジェクト（dpeeozdddgmjsnrgxdpz）のみ

### 開発上の注意
- **スクレイピング対象**: 28サイト（飯田市および南信州エリア）
  - RSS形式: 7サイト
  - HTML形式: 21サイト
- **robots.txt遵守**: スクレイピング実装時は必ず確認
- **エラーハンドリング**: サイト構造変更の検知機能を実装済み
- **初期目標**: LINE友だち登録20人、月間アクティブユーザー15人
