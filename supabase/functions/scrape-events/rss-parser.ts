import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { EventData } from './types.ts'
import { parseDateString } from './date-utils.ts'

/**
 * RSSフィードからイベント情報を抽出
 */
export async function parseRssFeed(
  url: string,
  siteName: string,
  region: string
): Promise<EventData[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MachiEventBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xml = await response.text()
    return parseRssXml(xml, siteName, region)
  } catch (error) {
    console.error(`Failed to parse RSS feed ${url}:`, error)
    return []
  }
}

/**
 * XML文字列からイベント情報を抽出
 */
function parseRssXml(
  xml: string,
  siteName: string,
  region: string
): EventData[] {
  const $ = load(xml, { xmlMode: true })
  const events: EventData[] = []

  // RSS 2.0 形式
  $('item').each((_, element) => {
    try {
      const title = $(element).find('title').text().trim()
      const link = $(element).find('link').text().trim()
      const description = $(element).find('description').text().trim()
      const pubDate = $(element).find('pubDate').text().trim()

      if (!title) {
        return // タイトルがない場合はスキップ
      }

      // pubDateから日付を抽出（RFC 822形式）
      // 例: "Mon, 07 Nov 2025 10:00:00 +0900"
      const eventDate = parseDateFromRfc822(pubDate)
      if (!eventDate) {
        // pubDateから日付が取得できない場合、タイトルや説明文から抽出を試みる
        const dateFromContent = extractDateFromText(title + ' ' + description)
        if (!dateFromContent) {
          return // 日付が取得できない場合はスキップ
        }
      }

      events.push({
        title,
        event_date: eventDate || extractDateFromText(title + ' ' + description) || new Date().toISOString().split('T')[0],
        detail: description || undefined,
        source_url: link || '',
        source_site: siteName,
        region,
        is_new: true
      })
    } catch (error) {
      console.error('Error parsing RSS item:', error)
    }
  })

  // Atom形式も対応
  $('entry').each((_, element) => {
    try {
      const title = $(element).find('title').text().trim()
      const link = $(element).find('link').attr('href') || ''
      const summary = $(element).find('summary').text().trim()
      const updated = $(element).find('updated').text().trim()

      if (!title) {
        return
      }

      const eventDate = parseDateFromIso8601(updated) ||
                       extractDateFromText(title + ' ' + summary) ||
                       new Date().toISOString().split('T')[0]

      events.push({
        title,
        event_date: eventDate,
        detail: summary || undefined,
        source_url: link,
        source_site: siteName,
        region,
        is_new: true
      })
    } catch (error) {
      console.error('Error parsing Atom entry:', error)
    }
  })

  return events
}

/**
 * RFC 822形式の日付をYYYY-MM-DD形式に変換
 * 例: "Mon, 07 Nov 2025 10:00:00 +0900" → "2025-11-07"
 */
function parseDateFromRfc822(dateStr: string): string | null {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return null
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch {
    return null
  }
}

/**
 * ISO 8601形式の日付をYYYY-MM-DD形式に変換
 * 例: "2025-11-07T10:00:00Z" → "2025-11-07"
 */
function parseDateFromIso8601(dateStr: string): string | null {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return null
    }

    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

/**
 * テキストから日付を抽出
 */
function extractDateFromText(text: string): string | null {
  return parseDateString(text)
}
