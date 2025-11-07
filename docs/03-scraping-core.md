# 03. スクレイピング基盤構築

## 概要
Supabase Edge Functionsを使用して、Webサイトからイベント情報を自動収集する基盤を構築します。

## 目的
- スクレイピングの共通ロジックを実装
- エラーハンドリング機能を組み込み
- テスト可能な構造を設計

## タスク

- [ ] Edge Function環境構築
- [ ] スクレイピング共通モジュール作成
- [ ] HTMLパーサー実装（Cheerio）
- [ ] 重複判定ロジック実装
- [ ] データベース挿入処理実装
- [ ] エラーログ記録実装
- [ ] ユニットテスト作成

## 技術スタック

### スクレイピングライブラリ
- **Cheerio**: 静的HTMLの解析（軽量で高速）
- **Playwright**: 動的サイト対応（将来的に追加）

### Edge Function構造
```typescript
// supabase/functions/scrape-events/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ScrapingResult {
  success: boolean
  eventsCount: number
  errors: string[]
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // スクレイピング処理
  const result = await scrapeEvents()

  // ログ記録
  await logScrapingResult(supabase, result)

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## 実装内容

### 1. 共通スクレイピング関数
```typescript
async function scrapeWebsite(url: string, parser: Parser): Promise<Event[]> {
  try {
    const response = await fetch(url)
    const html = await response.text()
    return parser.parse(html)
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error)
    return []
  }
}
```

### 2. 重複判定ロジック
```typescript
async function isDuplicate(
  supabase: SupabaseClient,
  event: EventData
): Promise<boolean> {
  const { data } = await supabase
    .from('events')
    .select('id')
    .eq('title', event.title)
    .eq('event_date', event.event_date)
    .eq('source_site', event.source_site)
    .single()

  return data !== null
}
```

### 3. エラーログ記録
```typescript
async function logScrapingError(
  supabase: SupabaseClient,
  siteName: string,
  errorMessage: string
): Promise<void> {
  await supabase.from('scraping_logs').insert({
    site_name: siteName,
    status: 'failure',
    error_message: errorMessage,
    events_count: 0
  })
}
```

## 受け入れ基準
- [ ] Edge Functionが正常にデプロイできる
- [ ] 基本的なHTMLスクレイピングが動作する
- [ ] 重複判定が正しく機能する
- [ ] エラーがログに記録される
- [ ] ユニットテストが通過する

## 関連ファイル
- `docs/04-scraping-sites.md` - 22サイト対応
- `docs/05-error-handling.md` - エラーハンドリング
- `supabase/functions/scrape-events/` - 実装ディレクトリ

## 依存関係
- `02-database-implementation.md` の完了が必要

## 技術メモ

### Edge Function デプロイ
```typescript
// Supabase MCPでデプロイ
mcp__supabase__deploy_edge_function({
  project_id: "dpeeozdddgmjsnrgxdpz",
  name: "scrape-events",
  files: [
    { name: "index.ts", content: "..." }
  ]
})
```

### robots.txt遵守
各サイトのrobots.txtを確認し、クローリング可能かチェック:
```typescript
async function checkRobotsTxt(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`${domain}/robots.txt`)
    const text = await response.text()
    // User-agent: * の Disallow を確認
    return !text.includes('Disallow: /')
  } catch {
    return true // robots.txtがない場合は許可とみなす
  }
}
```

## 参考
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Cheerio Docs: https://cheerio.js.org/
- Deno Deploy: https://deno.com/deploy/docs
