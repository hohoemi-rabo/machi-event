import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { EventData } from './types.ts'
import { SiteConfig } from './sites-config.ts'
import { parseDateString, parseTimeString } from './date-utils.ts'

/**
 * HTMLサイトからイベント情報を抽出（汎用パーサー）
 */
export async function parseHtmlSite(config: SiteConfig): Promise<EventData[]> {
  try {
    const response = await fetch(config.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MachiEventBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    return parseHtml(html, config)
  } catch (error) {
    console.error(`Failed to parse HTML site ${config.url}:`, error)
    return []
  }
}

/**
 * HTML文字列からイベント情報を抽出
 */
function parseHtml(html: string, config: SiteConfig): EventData[] {
  const $ = load(html)
  const events: EventData[] = []

  // セレクタが指定されている場合はそれを使用
  if (config.selector && config.fields) {
    $(config.selector).each((_, element) => {
      try {
        const title = $(element).find(config.fields!.title || '').text().trim() ||
                     $(element).text().trim()
        const dateText = $(element).find(config.fields!.date || '').text().trim()
        const place = $(element).find(config.fields!.place || '').text().trim()
        const link = $(element).find(config.fields!.link || 'a').attr('href') || ''

        if (!title) {
          return // タイトルがない場合はスキップ
        }

        // 日付フィールドが指定されている場合は、そこから取得した日付のみを使用
        // タイトルから日付を抽出しない（誤検出を防ぐため）
        const eventDate = dateText ? parseDateString(dateText) : null
        if (!eventDate) {
          return // 日付が取得できない場合はスキップ
        }

        // 相対URLを絶対URLに変換
        const absoluteUrl = makeAbsoluteUrl(link, config.url)

        events.push({
          title,
          event_date: eventDate,
          event_time: parseTimeString(dateText) || undefined,
          place: place || undefined,
          source_url: absoluteUrl,
          source_site: config.name,
          region: config.region,
          is_new: true
        })
      } catch (error) {
        console.error('Error parsing HTML element:', error)
      }
    })
  } else {
    // セレクタが指定されていない場合は汎用的な抽出を試みる
    events.push(...extractEventsGeneric($, config))
  }

  return events
}

/**
 * 汎用的なイベント抽出（セレクタ指定なし）
 * 一般的なパターンに基づいて抽出を試みる
 */
function extractEventsGeneric($: any, config: SiteConfig): EventData[] {
  const events: EventData[] = []

  // パターン1: article要素
  $('article').each((_, element) => {
    const event = extractEventFromElement($, $(element), config)
    if (event) events.push(event)
  })

  // パターン2: class名に"event", "news", "post"を含む要素
  $('[class*="event"], [class*="news"], [class*="post"]').each((_, element) => {
    const event = extractEventFromElement($, $(element), config)
    if (event) events.push(event)
  })

  // パターン3: リスト要素（ul > li）
  $('ul li').each((_, element) => {
    const event = extractEventFromElement($, $(element), config)
    if (event) events.push(event)
  })

  return events
}

/**
 * 要素からイベント情報を抽出
 */
function extractEventFromElement($: any, element: any, config: SiteConfig): EventData | null {
  try {
    // タイトル抽出（h1-h6, strong, .title など）
    const title = element.find('h1, h2, h3, h4, h5, h6, strong, .title').first().text().trim() ||
                 element.find('a').first().text().trim() ||
                 element.text().trim()

    if (!title || title.length > 200) {
      return null // タイトルが長すぎる場合はスキップ
    }

    // リンク抽出
    const link = element.find('a').first().attr('href') || ''

    // 日付抽出（タイトルまたは要素全体から）
    const fullText = element.text()
    const eventDate = parseDateString(fullText)

    if (!eventDate) {
      return null
    }

    const absoluteUrl = makeAbsoluteUrl(link, config.url)

    return {
      title,
      event_date: eventDate,
      event_time: parseTimeString(fullText) || undefined,
      source_url: absoluteUrl,
      source_site: config.name,
      region: config.region,
      is_new: true
    }
  } catch (error) {
    return null
  }
}

/**
 * 相対URLを絶対URLに変換
 */
function makeAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) {
    return baseUrl
  }

  // 既に絶対URLの場合
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  try {
    const base = new URL(baseUrl)

    // ルート相対パス (/で始まる)
    if (url.startsWith('/')) {
      return `${base.origin}${url}`
    }

    // 相対パス
    const basePath = base.pathname.endsWith('/') ? base.pathname : base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1)
    return `${base.origin}${basePath}${url}`
  } catch (error) {
    return baseUrl
  }
}
