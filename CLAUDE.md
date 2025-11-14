# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

南信州地域のイベント情報を一元化する情報集約サービス。複数の情報源に散在するイベント情報を自動収集し、ユーザーに「探さなくていい状態」を提供する。

**プロジェクトステージ**: Phase 1-3完了（自動スクレイピング・Web UI・LINE連携）。Version 48: 全削除→再登録方式実装、並列処理で全23サイト正常動作。LINE通知一時無効化。

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
src/
  ├── app/                       # Next.js App Router
  │   ├── layout.tsx             # ルートレイアウト（ScrollToTopButton含む、Noto Sans JP）
  │   ├── page.tsx               # トップページ（今週のイベント、2段階フィルター、地域色ホバー）
  │   ├── globals.css            # グローバルスタイル（NEWバッジアニメーション、文字サイズ可変）
  │   ├── month/page.tsx         # 今月のイベント（2段階フィルター、地域色ホバー）
  │   ├── all/page.tsx           # 全イベントページ（テーブル形式、地域色適用、ヘッダー色連動）
  │   ├── search/page.tsx        # イベント検索ページ（旧 events/）
  │   ├── event/[id]/
  │   │   ├── page.tsx           # イベント詳細ページ（NotifyButton一時無効化）
  │   │   └── not-found.tsx      # 404ページ
  │   ├── api/
  │   │   └── notifications/
  │   │       └── route.ts       # 通知登録API（POST/GET/DELETE）
  │   ├── logs/page.tsx          # スクレイピングログ
  │   └── test/page.tsx          # テストページ（スクレイピング確認用）
  │
  ├── components/
  │   ├── layout/
  │   │   ├── Header.tsx         # ヘッダー（紫グラデーション、ナビアイコン、白グロー効果）
  │   │   └── Footer.tsx         # フッター（紫グラデーション）
  │   ├── events/
  │   │   ├── EventCard.tsx      # イベントカード（地域色背景、NEWバッジ虹色・右端配置）
  │   │   ├── EventFilters.tsx   # フィルター（検索ページ用、ドロップダウン）
  │   │   ├── RegionFilter.tsx   # 地域フィルター（トップページ用）
  │   │   ├── ShareButtons.tsx   # シェアボタン（LINE/X/Instagram/URL）
  │   │   └── NotifyButton.tsx   # LINE通知登録ボタン（実装済み・現在一時無効化）
  │   └── ui/
  │       ├── FontSizeSwitcher.tsx # 文字サイズ切り替え（金色ボタン、ヘッダー内）
  │       └── ScrollToTopButton.tsx # ページトップスクロールボタン（右下固定）
  │
  ├── lib/
  │   ├── supabase/
  │   │   ├── client.ts          # Supabaseクライアント（クライアント用）
  │   │   └── server.ts          # Supabaseクライアント（サーバー用）
  │   └── utils/
  │       └── date.ts            # 日付ユーティリティ
  │
  └── types/
      └── event.ts               # イベント型定義

supabase/functions/              # Supabase Edge Functions
  ├── scrape-events/             # スクレイピング機能（11ファイル）
  │   ├── index.ts               # メインエントリーポイント
  │   ├── types.ts               # 型定義
  │   ├── utils.ts               # ユーティリティ関数
  │   ├── error-types.ts         # カスタムエラークラス
  │   ├── retry.ts               # リトライロジック
  │   ├── structure-checker.ts   # 構造変更検知
  │   ├── alert.ts               # Slack通知
  │   ├── sites-config.ts        # 23サイト設定（RSS 8 + HTML 15）
  │   ├── html-parser.ts         # HTMLパーサー
  │   ├── rss-parser.ts          # 正規表現ベースRSSパーサー（cheerio依存なし、RSS 1.0/2.0/Atom対応）
  │   └── date-utils.ts          # 日付パース
  │
  ├── line-webhook/              # LINE Webhook（5ファイル、Version 8）
  │   ├── index.ts               # Webhookエントリーポイント（署名検証）
  │   ├── types.ts               # LINE型定義
  │   ├── validators.ts          # HMAC-SHA256署名検証（Web Crypto API）
  │   ├── line-client.ts         # LINEメッセージ送信（プッシュ・リプライ）
  │   └── line-handler.ts        # イベントハンドラー（follow/unfollow/message/postback）
  │
  ├── send-daily-notifications/  # 定期通知（3ファイル）
  │   ├── index.ts               # 毎朝8時新着イベント送信
  │   ├── event-fetcher.ts       # ユーザー地域のイベント取得（最大3件）
  │   └── message-builder.ts     # Flexメッセージ生成
  │
  └── send-event-reminders/      # 個別通知（1ファイル）
      └── index.ts               # 開催前日リマインダー送信

docs/                            # チケット管理
  ├── 00-minimal-frontend.md     # Phase 0 ✅
  ├── 01-database-design.md      # Phase 1 ✅
  ├── 02-database-implementation.md ✅
  ├── 03-scraping-core.md        # ✅
  ├── 04-scraping-sites.md       # ✅
  ├── 05-error-handling.md       # ✅
  ├── 06-cron-setup.md           # ✅ 完了（GitHub Actions）
  ├── 07-frontend-setup.md       # Phase 2 ✅
  ├── 08-event-list-pages.md     # ✅
  ├── 09-filtering-feature.md    # ✅
  ├── 10-event-detail-page.md    # ✅
  ├── 11-share-feature.md        # ✅
  ├── 12-responsive-design.md    # ✅
  └── 13-17-*.md                 # Phase 3-4（未着手）

.github/workflows/               # GitHub Actions
  ├── daily-scraping.yml         # 毎朝3時の自動スクレイピング（Cron）
  └── daily-notifications.yml    # 毎朝8時の自動通知（Cron）

next.config.ts                   # Next.js設定（画像最適化含む）
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

### line_usersテーブル ✅ 実装済み
```sql
id: UUID (PK)
line_user_id: TEXT UNIQUE NOT NULL
regions: TEXT[] DEFAULT ARRAY['飯田市']
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP DEFAULT NOW()
updated_at: TIMESTAMP DEFAULT NOW()
```

### event_notificationsテーブル ✅ 実装済み
```sql
id: UUID (PK)
line_user_id: TEXT NOT NULL
event_id: UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE
notify_date: DATE NOT NULL
is_sent: BOOLEAN DEFAULT false
created_at: TIMESTAMP DEFAULT NOW()
UNIQUE(line_user_id, event_id)

-- RLSポリシー（2025年11月13日設定）
SELECT: Allow public read access
INSERT: Allow public insert access
DELETE: Allow public delete access
```

### notification_logsテーブル ✅ 実装済み
```sql
id: UUID (PK)
notification_type: TEXT NOT NULL  -- 'daily_events' or 'event_reminders'
total_users: INTEGER NOT NULL
success_count: INTEGER NOT NULL
failure_count: INTEGER NOT NULL
created_at: TIMESTAMP DEFAULT NOW()
```

## 画面構成

| 画面 | URL | 説明 |
|------|-----|------|
| トップページ | `/` | 今週のイベント一覧（2段階フィルター：地域→サイト） |
| 月間イベント | `/month` | 今月のイベント一覧（2段階フィルター：地域→サイト） |
| 全イベント | `/all` | 全イベント一覧（テーブル形式、スクレイピングサマリー付き） |
| イベント検索 | `/search` | 地域・日付・キーワード検索（旧 /events） |
| イベント詳細 | `/event/[id]` | 個別イベント詳細（関連イベント表示） |
| テストページ | `/test` | スクレイピング確認用（開発用） |

## 主要機能要件

### フェーズ1: 基盤構築 ✅ 完全完了
- **23サイトからの自動スクレイピング（RSS 8サイト、HTML 15サイト - 全設定完了）**
- 1日1回深夜帯実行（Cron設定完了、GitHub Actions）
  - **自動スクレイピング**: 毎朝3:00 AM JST（18:00 UTC）実行
  - GitHub Actions Secrets: SUPABASE_ANON_KEY 設定済み
- **全削除→再登録方式**（Version 48で実装）
  - スクレイピング前に全イベントデータを自動削除
  - RSSから消えたイベントも自動削除される
  - 重複データ・古いデータの蓄積を完全防止
  - LINE通知機能は一時無効化（NotifyButtonコメントアウト）
- エラーハンドリングとログ記録
- リトライロジック（指数バックオフ）
- 構造変更検知
- Slack通知機能
- 日本語日付パース（YYYY.MM.DD形式含む7パターン対応）
- データベース: **571件**のイベント（2025年11月14日時点）
- Edge Functions: **Version 48** デプロイ済み（2025年11月14日）
  - **Version 46**: RSSタイムゾーンバグ修正（ISO 8601日付の1日ずれ解消）
  - **Version 47**: 並列処理実装（Promise.allSettled、タイムアウト504エラー解消）
  - **Version 48**: 全削除→再登録方式実装
  - cheerio依存削除、正規表現ベースのRSSパーサー実装（Version 45）
  - 飯田市役所RSS URL更新（life3-16.xml → list1.xml）
- 地域設定: 「その他」→「南信州」に変更（南信州ナビ用）

### フェーズ2: Web UI ✅ 完全完了
- イベント一覧（今週/今月/全イベント）
  - **2段階フィルター**: 地域選択 → サイト選択（トップ・今月ページ）
  - カード型UI（トップ・今月ページ、地域色背景）
  - テーブル型UI（全イベントページ、行・ヘッダーに地域色適用）
- フィルタリング機能
  - 地域別（14地域、「南信州」含む）
  - 地域ボタンホバー効果（フワッと地域色に変化）
  - 日付範囲フィルター
  - キーワード検索
  - URL連携（/search ページ）
- **地域色ベースのデザイン統一**
  - 14地域それぞれに固有の色設定（Crimson, Gold, Lavender等）
  - イベントカード背景に地域色（12%透明度）
  - テーブル行背景に地域色（12%透明度）
  - テーブルヘッダーに選択地域色を適用
  - サイトフィルターボタンに地域色を適用
- **UIコンポーネント強化**
  - NEWバッジ: 虹色グラデーション（赤→黄→緑→青）+ レインボーアニメーション、右端配置
  - ヘッダー/フッター: 紫グラデーション（Lavender → Purple → Violet）
  - ナビメニュー: 白グロー効果（ホバー時）
  - フォント: Noto Sans JP導入（日本語最適化）
  - FontSizeSwitcher: 金色ボタン（🔤アイコン）
  - ナビアイコン: 📅今週、📆今月、📋全イベント、🔍検索
  - ロゴ: 📣メガホン
- シェア機能（LINE、X、Instagram、URLコピー）
- レスポンシブデザイン（モバイル対応）
- 文字サイズ切り替え（ヘッダー内、高齢者対応）
- **スクロールトップボタン**（右下固定、300px以上スクロールで表示）
- イベント詳細ページ（関連イベント表示）
- テストページ（スクレイピング確認用）
- ページリネーム: /events → /search

### フェーズ3: LINE連携 ✅ 基本実装完了（2025年11月13日）
- ✅ LINE公式アカウント統合（Webhook設定完了）
- ✅ Webhook Edge Function実装（Version 8）
  - 友だち追加/ブロック処理
  - メッセージ応答（地域選択、イベント情報案内）
  - Postback処理（地域設定ボタン）
  - HMAC-SHA256署名検証（Web Crypto API）
- ✅ 定期通知Edge Function実装
  - 毎朝8時に新着イベント送信（最大3件）
  - ユーザー地域に合わせたフィルタリング
  - Flexメッセージ形式
- ✅ 個別イベント通知Edge Function実装
  - 開催前日の朝8時にリマインダー送信
  - event_notificationsテーブル連携
- ✅ 通知登録API実装（POST/GET/DELETE）
  - `/api/notifications` エンドポイント
  - 詳細なエラーメッセージ返却（デバッグ用）
- ✅ NotifyButtonコンポーネント実装（**現在一時無効化**）
  - LIFF SDK統合（@line/liff）
  - localStorage ベースの認証フロー
  - Android/iPhone 動作確認済み
  - イベント詳細ページでコメントアウト（全削除→再登録方式を優先）
- ✅ **LIFF実装完了**
  - LINE Login チャネル作成・本番公開
  - LIFF ID: 2008483961-A2bmZD0X
  - エンドポイントURL: https://machi-event.vercel.app/
  - localStorage で return_url と pending_notification を管理
  - トップページで認証コード処理後、元のページにリダイレクト
- ✅ **RLSポリシー設定完了**
  - SELECT: 公開読み取り許可
  - INSERT: 通知登録許可
  - DELETE: 通知削除許可
- ✅ 地域選択機能動作確認（line_usersテーブルにデータ保存確認済み）
- ✅ **Cron設定完了**（GitHub Actions）
  - 毎朝3時JST: 自動スクレイピング（daily-scraping.yml）
  - 毎朝8時JST: LINE通知送信（daily-notifications.yml）
  - send-daily-notifications（新着イベント通知、最大3件、30日以内）
  - send-event-reminders（開催前日リマインダー）

**現在の運用方針：**
- 🔄 **全削除→再登録方式を優先**（Version 48で実装）
  - LINE通知機能（NotifyButton）は一時無効化
  - RSSから消えたイベントも自動削除される
  - データの正確性を最優先

**オプション機能：**
- ⏳ LINE通知機能の再有効化（NotifyButtonコメント解除で即座に復活可能）
- ⏳ 地域選択の拡張（現在3地域のみ → 14地域対応）
- ⏳ リッチメニュー設定

### フェーズ4: 運用管理
- スクレイピングログ確認
- エラー監視
- 手動イベント追加

## スタイリング設定

### Tailwind CSS
- **カラー変数**: `--background`, `--foreground`（ライト/ダークモード対応）
- **フォント**: Noto Sans JP（日本語）、Geist Sans（通常）、Geist Mono（コード）
- **ブレークポイント**: モバイルファーストでsm以上でレスポンシブ対応

### デザインシステム
- **ヘッダー/フッター**: 紫グラデーション（Lavender → Purple → Violet）
- **地域色**: 14地域それぞれに固有の色（Crimson, Gold, Lavender等）
- **NEWバッジ**: 虹色グラデーション（赤→黄→緑→青）+ レインボーアニメーション
- **ホバー効果**: 地域ボタン（地域色へフェード）、ナビメニュー（白グロー）
- **アニメーション**: `@keyframes rainbow-flow`（3秒周期で虹色が流れる）

### カスタムアニメーション（globals.css）
```css
@keyframes rainbow-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.new-badge-rainbow {
  background: linear-gradient(90deg, #FF6B6B, #FFD93D, #6BCF7F, #4D96FF, #FF6B6B);
  background-size: 300% 100%;
  animation: rainbow-flow 3s ease infinite;
}
```

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
├── sites-config.ts       # 28サイト設定（RSS 8 + HTML 20）
├── html-parser.ts        # CheerioベースのHTMLパーサー
├── rss-parser.ts         # RSS 2.0/Atom フィードパーサー
└── date-utils.ts         # 日本語日付パース
```

### 主要モジュールの役割

#### index.ts（メインエントリーポイント）
- Edge Function のHTTPハンドラー
- **スクレイピング前に全イベント自動削除**（Version 48）
- **全サイトの並列スクレイピング実行**（Version 47、Promise.allSettled使用）
- エラーハンドリングとログ記録
- レスポンス生成

```typescript
Deno.serve(async (req) => {
  // 全イベント削除
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 並列スクレイピング
  const results = await Promise.allSettled(
    sites.map(site => scrapeSingleSite(supabase, site))
  )
  return new Response(JSON.stringify(results))
})
```

#### sites-config.ts（23サイト設定）
- サイト情報の一元管理（RSS 8 + HTML 15）
- RSS/HTML の型区別
- セレクター設定（HTML）
- フィード形式指定（RSS）

```typescript
export const SITES: SiteConfig[] = [
  // RSS形式（8サイト）
  { name: "飯田市役所", type: "rss", url: "...", region: "飯田市" },

  // HTML形式（15サイト）
  { name: "南信州ナビ", type: "html", url: "...", region: "南信州",  // 広域対応
    selector: ".xo-event-list dl", fields: { title: "dd .title", ... } }
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
**パターン優先順位**（年付き日付を優先）:
1. 「2025年11月7日」（YYYY年MM月DD日）
2. 「令和7年11月7日」（和暦）
3. 「2025-11-07」（YYYY-MM-DD）
4. 「2025/11/07」（YYYY/MM/DD）
5. 「2025.08.22」（YYYY.MM.DD）← 重要
6. 「11月7日」「11/7」（年なし、年補完）
7. 「11.7」（年なし、ドット区切り）

**重要**: 年付き形式を年なし形式より優先することで、タイトル内の「7月22日」より「2025.07.22」が優先的にマッチする

#### utils.ts（ユーティリティ）
- `isDuplicate()`: 重複判定（title + event_date + source_site）
  - **注**: Version 48で全削除→再登録方式に変更されたため、現在は使用されていない
  - 参考: Version 37で修正（`.maybeSingle()` → `.limit(1)`）
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

## HTMLスクレイピングのトラブルシューティング

### よくある問題と解決策

#### 1. タイトルから日付が誤抽出される
**問題**: 「7月22日（火）ナイトツアー運休のお知らせ 2025.07.22」から「7月22日」が先にマッチして誤った年（2026年）になる

**解決策**:
- html-parser.ts で `dateText` のみから日付抽出（タイトルから抽出しない）
```typescript
// ✅ 修正後
const eventDate = dateText ? parseDateString(dateText) : null

// ❌ 修正前
const eventDate = parseDateString(dateText || title)  // タイトルも使ってしまう
```

#### 2. 年付き日付より年なし日付が優先される
**問題**: date-utils.ts でパターンマッチの順序が不適切で、「11月7日」が「2025.11.07」より先にマッチ

**解決策**: 年付き日付形式を年なし形式より前に配置
```typescript
// ✅ 正しい順序
1. YYYY年MM月DD日
2. 令和X年MM月DD日
3. YYYY-MM-DD
4. YYYY/MM/DD
5. YYYY.MM.DD  ← 年付き優先
6. MM月DD日    ← 年なしは後回し
7. MM.DD
```

#### 3. 古いデータと新しいデータが重複する
**問題**: コード修正後、正しい日付のデータと誤った日付のデータが両方残る
- 例: 「7月22日 ナイトツアー運休」が2025-07-22と2026-07-22の2件存在

**原因**: 重複判定が「タイトル + 日付 + ソースサイト」で行われるため、日付が違うと別イベントとして扱われる

**解決策**: コード修正後は該当サイトのデータを削除してから再スクレイピング
```sql
-- 該当サイトのデータを全削除
DELETE FROM events WHERE source_site = 'サイト名';

-- または特定のレコードのみ削除
DELETE FROM events WHERE id = 'レコードID';
```

#### 4. URL変更後に古いURLのデータが残る
**問題**: sites-config.ts でURLを変更したが、古いURLのデータがDBに残る
- 例: nightfes2025/news/ から information/news/ に変更

**解決策**: 古いURLのデータを削除
```sql
DELETE FROM events
WHERE source_site = 'サイト名'
AND source_url LIKE '%古いURL%';
```

#### 5. 重複データの一括削除
**問題**: Version 37以前のバグで重複データが蓄積
- 例: 同じイベントが10件登録されている

**解決策**: 最新のデータを残して古い重複を削除
```sql
-- 重複データを削除（最新の1件を残して古いものを削除）
DELETE FROM events
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY title, event_date, source_site
        ORDER BY created_at DESC
      ) as rn
    FROM events
  ) t
  WHERE rn > 1
);

-- 削除後の確認
SELECT
  title,
  event_date,
  source_site,
  COUNT(*) as count
FROM events
GROUP BY title, event_date, source_site
HAVING COUNT(*) > 1;
```

**実績**: 2025年11月10日に9件の重複データを削除（飯田市役所）

#### 6. DOMParserエラー（Version 45で解決済み） ✅
**問題**: 突然すべてのRSSサイトで「ReferenceError: DOMParser is not defined」エラーが発生
- 原因: cheerioライブラリの`xmlMode`が内部でDOMParser（ブラウザAPI）を使用しようとした
- Denoランタイムの更新により、以前動いていたコードが突然動かなくなった

**解決策**: cheerio依存を完全に削除し、正規表現ベースのXMLパーサーを実装
```typescript
// rss-parser.ts（Version 45）
// cheerioを使わず、正規表現でXMLをパース
const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)
for (const match of itemMatches) {
  const itemXml = match[1]
  const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  // ...
}
```

**教訓**: 外部ライブラリへの依存を最小限にすることで、環境の変化に強いコードになる

#### 7. フロントエンドのタイムゾーン問題 ✅
**問題**: トップページ・今月ページで表示範囲が1日ずれる
- 例: 今週は11/9〜11/15のはずが、11/8〜11/15として取得される
- 原因: `toISOString()`がUTCに変換するため、JSTとの9時間差で日付がずれる

**解決策**: ローカルタイムゾーンで日付を計算し、YYYY-MM-DD形式の文字列を生成
```typescript
// page.tsx / month/page.tsx（修正後）
function getWeekRange() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const date = today.getDate()
  const dayOfWeek = today.getDay()

  const startDate = new Date(year, month, date - dayOfWeek)
  const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`

  return { start: startDate, end: endDate, startStr, endStr }
}
```

**追加修正**: useEffectの無限ループも解消
- 依存配列から`start`/`end`を削除し、空配列`[]`に変更
- レンダリングのたびに新しいDateオブジェクトが作成されて無限ループになっていた

### HTMLサイト設定の推奨フロー

1. **HTMLページ構造の確認**: ユーザーが実際のHTML構造を提供
2. **sites-config.ts 設定**: セレクタ（selector）とフィールド（title, date, link）を設定
3. **date-utils.ts 確認**: 日付形式が対応済みか確認、未対応なら追加
4. **全11ファイルをデプロイ**: Task subagent を使用
5. **Supabase Dashboard で Invoke**: 手動実行でテスト
6. **http://localhost:3000/test で確認**: 結果を目視確認
7. **問題があれば修正 → 古いデータ削除 → 再デプロイ**

### HTMLサイト設定例

```typescript
// 南信州ナビ
{
  name: '南信州ナビ',
  url: 'https://msnav.com/events/',
  region: '南信州',  // 広域エリア対応
  type: 'html',
  selector: '.xo-event-list dl',  // 親セレクタ + 繰り返し要素
  fields: {
    title: 'dd .title',            // タイトル要素
    date: 'dt .event-date',        // 日付要素（dateTextとして抽出）
    link: 'dd .title a'            // リンク要素
  }
}
```

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

### Phase 1: 基盤構築 ✅ 完全完了
- ✅ データベース設計・実装（`01-02`）
  - eventsテーブル、scraping_logsテーブル作成
  - RLSポリシー設定完了
  - 現在**571件**のイベントデータ（2025年11月14日時点）
  - **全削除→再登録方式**により常に最新状態を維持
- ✅ スクレイピング基盤構築（`03-04`）
  - Edge Functions実装（11ファイル構成）
  - **23サイト全設定完了（RSS 8 + HTML 15）**
  - RSS 1.0 (RDF) 形式対応（`<dc:date>`要素）
  - RSS 2.0形式対応（`<pubDate>`要素）
  - 日本語日付パース機能（7パターン、年付き優先、YYYY.MM.DD対応）
  - **HTMLサイト15/15完了**:
    - ✅ 南信州ナビ（region='南信州'）、阿智誘客促進協議会、天空の楽園
    - ✅ 阿智☆昼神観光局（地域/昼神観光局）
    - ✅ 根羽村役場、下条村観光協会
    - ✅ 売木村役場、売木村商工会
    - ✅ 天龍村役場（お知らせ/行政情報/観光情報）
    - ✅ 豊丘村役場
    - ✅ 大鹿村役場（お知らせ）、大鹿村環境協会
- ✅ エラーハンドリング強化（`05`）
  - カスタムエラークラス
  - リトライロジック（指数バックオフ）
  - 構造変更検知
  - Slack通知機能
- ✅ Edge Functions デプロイ完了（**Version 48** - 最新）
  - **Version 46**: RSSタイムゾーンバグ修正（2025年11月14日）
  - **Version 47**: 並列処理実装、504タイムアウトエラー解消（2025年11月14日）
  - **Version 48**: 全削除→再登録方式実装（2025年11月14日）
- ✅ テストページ実装（http://localhost:3000/test）
  - 23サイト全体のスクレイピング状況確認
  - 2段階フィルター機能
  - スクレイピングサマリー表示

### Phase 1.5: 定期実行 ✅ 完了
- ✅ Cron設定（`06-cron-setup.md`）
  - **自動スクレイピング**: GitHub Actions で毎朝3時JST（18:00 UTC）実行
    - SUPABASE_ANON_KEY 設定済み（GitHub Secrets）
  - **LINE通知**: GitHub Actions で毎朝8時JST（23:00 UTC）実行
    - send-daily-notifications（新着イベント通知）
    - send-event-reminders（開催前日リマインダー）

### Phase 2: Web UI ✅ 完全完了
- ✅ フロントエンド基盤構築（`07`）
  - Supabase クライアント（SSR対応）
  - TypeScript型定義
  - レイアウトコンポーネント（Header/Footer、紫グラデーション）
  - 日付ユーティリティ
  - Tailwind カスタムテーマ
  - Noto Sans JP フォント導入
- ✅ イベント一覧ページ（`08`）
  - **2段階フィルターUI実装**（地域→サイト選択）
  - 今週・今月のイベント表示（Client Component化）
  - 全イベントページ追加（/all、テーブル形式）
    - テーブル行に地域色適用（12%透明度）
    - テーブルヘッダーに選択地域色適用
  - EventCardコンポーネント（カード型UI、地域色背景）
    - NEWバッジ: 虹色グラデーション、右端配置
  - レスポンシブグリッドレイアウト
  - スクレイピングサマリー表示（/allページ）
- ✅ フィルタリング機能（`09`）
  - 2段階フィルター（トップ・今月ページ）
  - 地域フィルター（ボタン形式、14地域対応、「南信州」含む）
    - 地域ボタンホバー効果（フワッと地域色に変化）
    - サイトフィルターボタンに地域色適用
    - 件数表示: 角括弧形式 [12]
  - 検索ページ（/search、旧/events）
    - 地域ドロップダウン（bg-white, text-gray-900で視認性向上）
    - キーワード検索
    - 日付範囲フィルター
    - URLパラメータ連携
    - 地域順序統一（フィルターボタンと同じ順序）
  - Next.js 15 async searchParams 対応
- ✅ イベント詳細ページ（`10`）
  - 動的ルート `/event/[id]`
  - イベント詳細表示（タイトル、日時、場所、詳細）
  - 外部リンクボタン
  - 関連イベント表示（同地域・近い日付、最大3件）
  - 動的メタデータ生成（SEO対応）
  - 404ページ
- ✅ シェア機能（`11`）
  - LINE共有（URL Scheme）
  - X（Twitter）共有（Web Intent API）
  - Instagram共有（URLコピー方式）
  - URLコピー（Clipboard API + フォールバック）
  - Web Share API対応（モバイル）
  - コピー完了通知（2-3秒表示）
- ✅ レスポンシブデザイン（`12`）
  - モバイルナビゲーション（ハンバーガーメニュー）
  - 画像最適化設定（AVIF/WebP対応）
  - タッチ操作対応（最小44x44pxタッチターゲット）
  - 文字サイズ切り替え機能（金色ボタン、🔤アイコン、ヘッダー内配置）
  - **ScrollToTopButton実装**（右下固定、300px以上スクロールで表示）
  - レスポンシブグリッド（モバイル1列、タブレット2列、PC3列）
  - ヘッダー固定（sticky top-0 z-50）
  - ナビメニュー: 白グロー効果（ホバー時）
  - ナビアイコン: 📅今週、📆今月、📋全イベント、🔍検索
  - ロゴアイコン: 📣メガホン

### Phase 3: LINE連携 ✅ 完全完了（2025年11月13日）
- ✅ LINE公式アカウント作成・Webhook設定
- ✅ LINE Developers 設定・トークン取得
- ✅ データベース拡張
  - line_users テーブル（地域設定保存）
  - event_notifications テーブル（個別通知登録）
  - notification_logs テーブル（通知履歴）
  - RLSポリシー設定（SELECT/INSERT/DELETE）
- ✅ Webhook Edge Function実装（Version 8）
  - 友だち追加/ブロック処理
  - 地域選択（Flexメッセージ、Postback処理）
  - HMAC-SHA256署名検証
- ✅ 定期通知Edge Function実装
  - send-daily-notifications（毎朝8時、最大3件）
  - send-event-reminders（開催前日リマインダー）
- ✅ LIFF実装（個別イベント通知）
  - LINE Login チャネル作成・本番公開
  - LIFF SDK統合（@line/liff）
  - NotifyButton コンポーネント実装（**現在一時無効化**）
  - localStorage ベースの認証フロー
  - 通知登録API（/api/notifications）
  - Android/iPhone 動作確認済み
- ✅ GitHub Actions Cron設定（毎朝8時JST）
- ✅ NEWバッジロジック修正（未来イベント＋登録7日以内）

**現在の状態：**
- 🔄 **NotifyButton一時無効化**（全削除→再登録方式を優先）
  - イベント詳細ページでコメントアウト済み
  - 必要時にコメント解除で即座に復活可能

**残タスク（オプション）：**
- ⏳ 地域選択の拡張（現在3地域 → 14地域対応）
- ⏳ リッチメニュー設定

### Phase 4: 運用・保守 ⏳ 一部実施中
- ✅ Vercel本番デプロイ（https://machi-event.vercel.app/）
- ✅ スクレイピングログ確認機能（/logs）
- ⏳ エラー監視（Sentry等の導入検討）
- ⏳ 手動イベント追加機能（管理画面）

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
- **スクレイピング対象**: 23サイト（飯田市および南信州エリア）
  - RSS形式: 8サイト（全設定完了）
  - HTML形式: 15サイト（全設定完了）
  - 現在**571件**のイベントデータ（2025年11月14日時点）
  - Edge Functions: **Version 48** デプロイ済み（2025年11月14日）
  - **Version 46**: RSSタイムゾーンバグ修正（ISO 8601日付の1日ずれ解消）
  - **Version 47**: 並列処理実装（Promise.allSettled、504タイムアウトエラー解消）
  - **Version 48**: 全削除→再登録方式実装（RSSから消えたイベントも自動削除）
- **スクレイピング方式**: 全削除→再登録
  - スクレイピング前に全イベントデータを自動削除
  - 重複データ・古いデータの蓄積を完全防止
  - RSSから消えたイベントも自動削除される
  - LINE通知機能は一時無効化（NotifyButtonコメントアウト）
- **地域設定**: 14地域対応（「南信州」含む）
  - 南信州ナビ: region='南信州'（広域対応）
  - その他サイト: 各市町村名
- **robots.txt遵守**: スクレイピング実装時は必ず確認
- **エラーハンドリング**: サイト構造変更の検知機能を実装済み
- **並列処理**: Promise.allSettledで全23サイトを同時スクレイピング
  - タイムアウト（504）エラーを解消
  - 実行時間の大幅短縮
  - 一部サイトの失敗が他のサイトに影響しない
- **HTMLサイト設定フロー**: HTML構造確認 → セレクタ設定 → デプロイ → テストページで検証
- **日付パース重要事項**: 年付き形式（YYYY.MM.DD等）を年なし形式より優先してマッチ
- **テストページ**: http://localhost:3000/test で全サイトのスクレイピング状況確認可能
- **タイムゾーン問題**: `toISOString()`は使わず、ローカルタイムゾーンで日付計算（フロントエンド・バックエンド共通）
  - RSSパーサー: ISO 8601日付を正規表現で直接抽出（Version 46で修正）
- **RSS URL変更**: 自治体サイトのRSS URLが変更されることがあるため、定期的に確認が必要
  - 飯田市役所: 2025年11月にURL変更（life3-16.xml → list1.xml）
- **環境変化への対応**: Denoランタイムの更新により既存コードが動かなくなることがある
  - 外部ライブラリへの依存を最小限に抑えることが重要
  - DOMParserエラー（Version 45で解決）がその一例
- **GitHub Actions**: 自動実行設定完了
  - 毎朝3時JST: 自動スクレイピング（daily-scraping.yml）
  - 毎朝8時JST: LINE通知送信（daily-notifications.yml）
  - SUPABASE_ANON_KEY設定済み（GitHub Secrets）
- **UI実装**:
  - 2段階フィルター（地域→サイト）
  - 地域色ベースのデザイン統一（14地域固有色）
  - NEWバッジ: 虹色グラデーション、右端配置、レインボーアニメーション
  - ヘッダー/フッター: 紫グラデーション（Lavender → Purple → Violet）
  - 地域ボタン: ホバー時に地域色へフェード
  - ナビメニュー: 白グロー効果（ホバー時）
  - テーブル行・ヘッダー: 地域色適用
  - スクロールトップボタン（右下固定）
  - 文字サイズ切り替え（金色ボタン、ヘッダー内）
  - Noto Sans JP フォント（日本語最適化）
  - ナビアイコン: 📅📆📋🔍、ロゴ: 📣
- **初期目標**: LINE友だち登録20人、月間アクティブユーザー15人
