# 04. 22サイト スクレイピング対応

## 概要
南信州地域の22サイトからイベント情報を自動収集する個別パーサーを実装します。

## 目的
- 各サイトの構造に合わせたパーサーを作成
- リスト形式（80%）とテーブル形式（20%）に対応
- 安定的なデータ収集を実現

## タスク

- [×] 対象28サイトのリストアップと分類
- [×] サイト構造調査（HTML構造、セレクタ特定）
- [×] HTMLパーサー実装（21サイト）
- [×] RSS対応パーサー実装（7サイト）
- [×] 各サイトのrobots.txt確認
- [×] 統合テスト実施

## 対象サイト分類

### リスト形式（約80%）
```typescript
const LIST_SITES = [
  {
    name: '飯田市公式イベント',
    url: 'https://...',
    selector: '.event-list .event-item',
    fields: {
      title: '.event-title',
      date: '.event-date',
      place: '.event-place'
    }
  },
  // ... 他16-17サイト
]
```

### テーブル形式（約20%）
```typescript
const TABLE_SITES = [
  {
    name: '文化会館スケジュール',
    url: 'https://...',
    selector: 'table.schedule tbody tr',
    fields: {
      title: 'td:nth-child(2)',
      date: 'td:nth-child(1)',
      place: 'td:nth-child(3)'
    }
  },
  // ... 他3-4サイト
]
```

### RSS対応
```typescript
const RSS_SITES = [
  {
    name: '商工会議所ニュース',
    url: 'https://.../feed.xml',
    type: 'rss'
  }
]
```

## 実装パターン

### リストパーサー
```typescript
async function parseListSite(config: SiteConfig): Promise<Event[]> {
  const $ = await fetchAndParse(config.url)
  const events: Event[] = []

  $(config.selector).each((_, element) => {
    const title = $(element).find(config.fields.title).text().trim()
    const dateStr = $(element).find(config.fields.date).text().trim()
    const place = $(element).find(config.fields.place).text().trim()
    const url = $(element).find('a').attr('href')

    events.push({
      title,
      event_date: parseDate(dateStr),
      place,
      source_url: url,
      source_site: config.name,
      region: '飯田市'
    })
  })

  return events
}
```

### テーブルパーサー
```typescript
async function parseTableSite(config: SiteConfig): Promise<Event[]> {
  const $ = await fetchAndParse(config.url)
  const events: Event[] = []

  $(config.selector).each((_, row) => {
    const $row = $(row)
    const title = $row.find(config.fields.title).text().trim()
    const dateStr = $row.find(config.fields.date).text().trim()

    if (title && dateStr) {
      events.push({
        title,
        event_date: parseDate(dateStr),
        source_url: config.url,
        source_site: config.name
      })
    }
  })

  return events
}
```

### RSSパーサー
```typescript
async function parseRssSite(config: SiteConfig): Promise<Event[]> {
  const response = await fetch(config.url)
  const xml = await response.text()
  // XML解析してイベント情報を抽出
  return parseRssXml(xml, config.name)
}
```

## 日付パース処理

```typescript
function parseDate(dateStr: string): string {
  // 様々な日付形式に対応
  // "2025年11月7日" → "2025-11-07"
  // "11/7(木)" → "2025-11-07"
  // "令和7年11月7日" → "2025-11-07"

  const patterns = [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/,
    /(\d{1,2})\/(\d{1,2})/,
    /令和(\d+)年(\d{1,2})月(\d{1,2})日/
  ]

  // パターンマッチングして正規化
  // ...
}
```

## エラーハンドリング

```typescript
async function scrapeAllSites(): Promise<ScrapingReport> {
  const results = {
    successful: 0,
    failed: 0,
    totalEvents: 0,
    errors: [] as string[]
  }

  for (const site of ALL_SITES) {
    try {
      const events = await scrapeSite(site)
      await saveEvents(events)
      results.successful++
      results.totalEvents += events.length
    } catch (error) {
      results.failed++
      results.errors.push(`${site.name}: ${error.message}`)
      await logError(site.name, error)
    }
  }

  return results
}
```

## 受け入れ基準
- [×] 28サイトすべてのパーサーが実装されている
- [×] 各サイトから正しくデータが取得できる
- [×] 日付が正しく正規化される
- [×] エラーが適切にハンドリングされる
- [×] robots.txt遵守が確認されている
- [×] 統合テストが通過する

## 関連ファイル
- `docs/03-scraping-core.md` - スクレイピング基盤
- `docs/05-error-handling.md` - エラーハンドリング
- `supabase/functions/scrape-events/parsers/` - パーサー実装

## 依存関係
- `03-scraping-core.md` の完了が必要

## 技術メモ

### サイト構造変更の検知
```typescript
function validateStructure(events: Event[]): boolean {
  // イベント数が0または極端に少ない場合は構造変更の可能性
  if (events.length === 0) {
    throw new Error('No events found - possible site structure change')
  }

  // 必須フィールドの検証
  const invalidEvents = events.filter(e => !e.title || !e.event_date)
  if (invalidEvents.length > events.length * 0.5) {
    throw new Error('Too many invalid events - possible parsing issue')
  }

  return true
}
```

## 参考
- Cheerio Selectors: https://cheerio.js.org/docs/basics/selecting
- RSS Spec: https://www.rssboard.org/rss-specification
