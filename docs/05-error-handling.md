# 05. エラーハンドリング強化

## 概要
スクレイピング処理の信頼性を高めるため、包括的なエラーハンドリング機能を実装します。

## 目的
- スクレイピング失敗時の適切な処理
- エラーの可視化と通知
- 自動リトライ機能の実装
- サイト構造変更の早期検知

## タスク

- [ ] エラー分類と定義
- [ ] リトライロジック実装
- [ ] エラーログ詳細化
- [ ] アラート通知機能（メール/Slack）
- [ ] サイト構造変更検知
- [ ] フォールバック処理実装
- [ ] エラーダッシュボード設計

## エラー分類

### 1. ネットワークエラー
- タイムアウト
- 接続失敗
- DNS解決失敗

### 2. パースエラー
- HTML構造変更
- セレクタ不一致
- データ形式エラー

### 3. データベースエラー
- 接続失敗
- 書き込みエラー
- 制約違反

### 4. 検証エラー
- 必須フィールド欠落
- 不正な日付形式
- 重複データ

## 実装

### エラークラス定義
```typescript
class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly siteName: string,
    public readonly errorType: ErrorType,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'ScrapingError'
  }
}

enum ErrorType {
  NETWORK = 'network',
  PARSING = 'parsing',
  DATABASE = 'database',
  VALIDATION = 'validation'
}
```

### リトライロジック
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1 || !isRetryable(error)) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, i) // 指数バックオフ
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Max retries reached')
}

function isRetryable(error: Error): boolean {
  // ネットワークエラーやタイムアウトはリトライ可能
  return error instanceof ScrapingError && error.retryable
}
```

### エラーログ記録
```typescript
async function logDetailedError(
  supabase: SupabaseClient,
  error: ScrapingError
): Promise<void> {
  await supabase.from('scraping_logs').insert({
    site_name: error.siteName,
    status: 'failure',
    error_message: error.message,
    error_type: error.errorType,
    stack_trace: error.stack,
    events_count: 0,
    created_at: new Date().toISOString()
  })
}
```

### サイト構造変更検知
```typescript
interface StructureCheck {
  siteName: string
  expectedMinEvents: number
  requiredFields: string[]
}

async function detectStructureChange(
  siteName: string,
  events: Event[]
): Promise<boolean> {
  // 過去の平均取得数を取得
  const { data: logs } = await supabase
    .from('scraping_logs')
    .select('events_count')
    .eq('site_name', siteName)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!logs || logs.length === 0) return false

  const avgCount = logs.reduce((sum, log) => sum + log.events_count, 0) / logs.length

  // 取得数が平均の50%未満なら構造変更の可能性
  if (events.length < avgCount * 0.5) {
    await sendStructureChangeAlert(siteName, events.length, avgCount)
    return true
  }

  return false
}
```

### アラート通知
```typescript
async function sendAlert(alert: Alert): Promise<void> {
  // メール通知
  await sendEmail({
    to: Deno.env.get('ADMIN_EMAIL'),
    subject: `[machi-event] ${alert.type}: ${alert.siteName}`,
    body: alert.message
  })

  // Slack通知（オプション）
  if (Deno.env.get('SLACK_WEBHOOK_URL')) {
    await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ${alert.siteName}: ${alert.message}`
      })
    })
  }
}
```

### エラーハンドリング統合
```typescript
async function scrapeSiteWithErrorHandling(
  site: SiteConfig
): Promise<ScrapingResult> {
  try {
    // リトライ付きでスクレイピング実行
    const events = await retryWithBackoff(
      () => scrapeSite(site),
      3,
      2000
    )

    // 構造変更チェック
    const structureChanged = await detectStructureChange(site.name, events)

    if (structureChanged) {
      return {
        success: false,
        siteName: site.name,
        eventsCount: 0,
        error: new ScrapingError(
          'Possible structure change detected',
          site.name,
          ErrorType.PARSING,
          false
        )
      }
    }

    // 正常終了
    return {
      success: true,
      siteName: site.name,
      eventsCount: events.length,
      events
    }

  } catch (error) {
    const scrapingError = error instanceof ScrapingError
      ? error
      : new ScrapingError(
          error.message,
          site.name,
          ErrorType.NETWORK,
          true
        )

    await logDetailedError(supabase, scrapingError)
    await sendAlert({
      type: 'ERROR',
      siteName: site.name,
      message: scrapingError.message
    })

    return {
      success: false,
      siteName: site.name,
      eventsCount: 0,
      error: scrapingError
    }
  }
}
```

## 受け入れ基準
- [ ] すべてのエラータイプが適切に分類される
- [ ] リトライロジックが正しく動作する
- [ ] エラーログに十分な情報が記録される
- [ ] アラート通知が動作する
- [ ] サイト構造変更が検知される
- [ ] エラー発生時も他サイトのスクレイピングは継続する

## 関連ファイル
- `docs/03-scraping-core.md` - スクレイピング基盤
- `docs/04-scraping-sites.md` - 22サイト対応
- `docs/17-operations.md` - 運用・保守

## 依存関係
- `03-scraping-core.md` の完了が必要
- `04-scraping-sites.md` と並行して実装可能

## 技術メモ

### タイムアウト設定
```typescript
async function fetchWithTimeout(
  url: string,
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ScrapingError(
        'Request timeout',
        url,
        ErrorType.NETWORK,
        true
      )
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
```

## 参考
- Error Handling Best Practices: https://deno.land/manual/examples/error_handling
- Exponential Backoff: https://en.wikipedia.org/wiki/Exponential_backoff
