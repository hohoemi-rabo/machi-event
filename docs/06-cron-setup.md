# 06. 定期実行（Cron）設定

## 概要
Supabase Cronを使用して、スクレイピング処理を1日1回自動実行する仕組みを構築します。

## 目的
- 毎日深夜にイベント情報を自動更新
- 手動実行も可能な設計
- 実行状況のモニタリング

## タスク

- [×] Supabase Cron設定 → GitHub Actions使用（代替手段）
- [×] スケジュール定義（深夜2時実行） → 深夜3時に変更（ユーザー要望）
- [×] 手動実行エンドポイント作成 → GitHub Actions workflow_dispatch で実装
- [×] 実行ログの記録 → scraping_logs テーブルで既に実装済み
- [×] 実行状況ダッシュボード（将来） → /all ページにカード実装（相対時刻＋エラー詳細）
- [ ] アラート設定（失敗時） → 未実装（オプション、Slack通知機能は既存）

## 実装

### Cron設定

Supabaseダッシュボードで設定:
```sql
-- pg_cron拡張を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 毎日深夜2時に実行
SELECT cron.schedule(
  'scrape-events-daily',
  '0 2 * * *',  -- 毎日午前2時
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/scrape-events',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    )
  )
  $$
);
```

または、Supabase Edge Functionsのcron設定:
```typescript
// supabase/functions/scrape-events/index.ts
// Deno.cronを使用（推奨）

Deno.cron("scrape events daily", "0 2 * * *", async () => {
  console.log("Starting scheduled scraping...")
  const result = await scrapeAllSites()
  console.log("Scraping completed:", result)
})
```

### 手動実行エンドポイント

```typescript
// supabase/functions/trigger-scraping/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 認証チェック
  const authHeader = req.headers.get('Authorization')
  if (!isAuthorized(authHeader)) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 即座にレスポンスを返し、バックグラウンドで実行
  const result = await scrapeAllSites()

  return new Response(
    JSON.stringify({
      message: 'Scraping started',
      startedAt: new Date().toISOString(),
      result
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### 実行ログ記録

```typescript
interface CronExecutionLog {
  id: string
  execution_type: 'scheduled' | 'manual'
  started_at: string
  completed_at: string
  status: 'success' | 'failure' | 'partial'
  total_sites: number
  successful_sites: number
  failed_sites: number
  total_events: number
  error_summary: string[]
}

async function logCronExecution(
  supabase: SupabaseClient,
  log: CronExecutionLog
): Promise<void> {
  await supabase.from('cron_execution_logs').insert(log)
}
```

### スクレイピング統合処理

```typescript
async function scrapeAllSites(): Promise<ScrapingReport> {
  const startTime = new Date()
  const results = {
    totalSites: SITES.length,
    successfulSites: 0,
    failedSites: 0,
    totalEvents: 0,
    errors: [] as string[]
  }

  // 全サイトを並列でスクレイピング（負荷に注意）
  const scrapePromises = SITES.map(site =>
    scrapeSiteWithErrorHandling(site)
  )

  const siteResults = await Promise.allSettled(scrapePromises)

  for (const result of siteResults) {
    if (result.status === 'fulfilled' && result.value.success) {
      results.successfulSites++
      results.totalEvents += result.value.eventsCount
    } else {
      results.failedSites++
      const error = result.status === 'rejected'
        ? result.reason
        : result.value.error
      results.errors.push(error.message)
    }
  }

  // 実行ログ記録
  await logCronExecution(supabase, {
    execution_type: 'scheduled',
    started_at: startTime.toISOString(),
    completed_at: new Date().toISOString(),
    status: results.failedSites === 0 ? 'success' : 'partial',
    ...results,
    error_summary: results.errors
  })

  // 失敗が多い場合はアラート
  if (results.failedSites > results.totalSites * 0.3) {
    await sendAlert({
      type: 'CRITICAL',
      message: `${results.failedSites} sites failed out of ${results.totalSites}`
    })
  }

  return results
}
```

### 実行状況モニタリング

```typescript
// 最近の実行状況を取得
async function getRecentExecutions(limit: number = 10) {
  const { data, error } = await supabase
    .from('cron_execution_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  return data
}

// 統計情報
async function getExecutionStats() {
  const { data } = await supabase
    .from('cron_execution_logs')
    .select('status, successful_sites, failed_sites, total_events')
    .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 過去30日

  return {
    totalExecutions: data?.length || 0,
    successRate: data ? (data.filter(d => d.status === 'success').length / data.length) * 100 : 0,
    avgEvents: data ? data.reduce((sum, d) => sum + d.total_events, 0) / data.length : 0
  }
}
```

## 受け入れ基準
- [×] Cronが毎日深夜2時に実行される → 深夜3時に変更（.github/workflows/daily-scraping.yml）
- [×] 手動実行エンドポイントが動作する → GitHub Actions workflow_dispatch で実装済み
- [×] 実行ログが正しく記録される → scraping_logs テーブルに記録済み
- [ ] 失敗時にアラートが送信される → 未実装（オプション、手動で /all ページ確認）
- [×] 実行状況がダッシュボードで確認できる → /all ページで確認可能（カード＋エラー詳細）

## 関連ファイル
- `docs/04-scraping-sites.md` - 22サイト対応
- `docs/05-error-handling.md` - エラーハンドリング
- `docs/17-operations.md` - 運用・保守

## 依存関係
- `03-scraping-core.md` の完了が必要
- `04-scraping-sites.md` の完了が必要
- `05-error-handling.md` の完了が推奨

## 技術メモ

### Cron式の説明
```
┌───────────── 分 (0 - 59)
│ ┌───────────── 時 (0 - 23)
│ │ ┌───────────── 日 (1 - 31)
│ │ │ ┌───────────── 月 (1 - 12)
│ │ │ │ ┌───────────── 曜日 (0 - 6) (日曜=0)
│ │ │ │ │
* * * * *

例:
"0 2 * * *"  - 毎日午前2時
"0 */6 * * *" - 6時間ごと
"0 2 * * 1"  - 毎週月曜日午前2時
```

### テスト実行
```bash
# 手動でEdge Functionをトリガー
curl -X POST \
  https://[project-ref].supabase.co/functions/v1/scrape-events \
  -H "Authorization: Bearer [anon-key]"
```

### パフォーマンス考慮事項
- 22サイトを並列実行する場合、同時接続数に注意
- 必要に応じて並列度を制限（例: 5サイトずつ）
- 各サイトへのリクエスト間隔を設定（礼儀正しいクローリング）

```typescript
// 並列度制限の実装例
async function scrapeWithConcurrencyLimit(
  sites: SiteConfig[],
  limit: number = 5
): Promise<ScrapingResult[]> {
  const results: ScrapingResult[] = []

  for (let i = 0; i < sites.length; i += limit) {
    const batch = sites.slice(i, i + limit)
    const batchResults = await Promise.all(
      batch.map(site => scrapeSiteWithErrorHandling(site))
    )
    results.push(...batchResults)

    // バッチ間に1秒待機
    if (i + limit < sites.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}
```

## 参考
- Supabase Cron: https://supabase.com/docs/guides/database/extensions/pg_cron
- Deno Cron: https://deno.land/api@v1.38.0?s=Deno.cron
- Cron Expression: https://crontab.guru/
- GitHub Actions: https://docs.github.com/en/actions

## 実装サマリー（2025年11月13日完了）

### 採用した方式
- **GitHub Actions** を使用（Supabase Cron の代わり）
  - 理由：無料枠が豊富、設定が簡単、既に LINE 通知で使用中
  - ファイル：`.github/workflows/daily-scraping.yml`

### 実行スケジュール
- **スクレイピング**: 毎日深夜3時（03:00 JST = 18:00 UTC）
- **LINE通知**: 毎日朝8時（08:00 JST = 23:00 UTC）

### 実装内容
1. ✅ 自動スクレイピング設定（daily-scraping.yml）
2. ✅ 手動実行機能（workflow_dispatch）
3. ✅ 実行ログ（GitHub Actions ログ + scraping_logs テーブル）
4. ✅ 実行状況ダッシュボード（/all ページ）
   - 相対時刻表示（○時間前）
   - 成功/失敗のステータス
   - エラー詳細表示（失敗時）

### 未実装（オプション）
- ❌ 失敗時の自動アラート（Slack 等への通知）
  - 現状：/all ページで手動確認
  - 将来的に必要なら実装可能
