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
 * XML文字列からイベント情報を抽出（正規表現ベース）
 */
function parseRssXml(
  xml: string,
  siteName: string,
  region: string
): EventData[] {
  const events: EventData[] = []

  // RSS 2.0 / RSS 1.0 (RDF) の <item> 要素を抽出
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)

  for (const match of itemMatches) {
    try {
      const itemXml = match[1]

      // タイトル抽出
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const title = titleMatch ? decodeXmlEntities(titleMatch[1].trim()) : ''

      // リンク抽出
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
      const link = linkMatch ? linkMatch[1].trim() : ''

      // 説明抽出
      const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i)
      const description = descMatch ? stripCdata(descMatch[1].trim()) : ''

      // pubDate抽出（RSS 2.0）
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : ''

      // dc:date抽出（RSS 1.0）
      const dcDateMatch = itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)
      const dcDate = dcDateMatch ? dcDateMatch[1].trim() : ''

      if (!title) {
        continue // タイトルがない場合はスキップ
      }

      // 日付の優先順位: dc:date (RSS 1.0) → pubDate (RSS 2.0) → コンテンツから抽出
      let eventDate = null

      if (dcDate) {
        eventDate = parseDateFromIso8601(dcDate) // dc:dateはISO 8601形式
      } else if (pubDate) {
        eventDate = parseDateFromRfc822(pubDate) // pubDateはRFC 822形式
      }

      if (!eventDate) {
        eventDate = extractDateFromText(title + ' ' + description)
      }

      if (!eventDate) {
        continue // 日付が取得できない場合はスキップ
      }

      events.push({
        title,
        event_date: eventDate,
        detail: description || undefined,
        source_url: link || '',
        source_site: siteName,
        region,
        is_new: true
      })
    } catch (error) {
      console.error('Error parsing RSS item:', error)
    }
  }

  // Atom形式の <entry> 要素も対応
  const entryMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi)

  for (const match of entryMatches) {
    try {
      const entryXml = match[1]

      // タイトル抽出
      const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const title = titleMatch ? decodeXmlEntities(titleMatch[1].trim()) : ''

      // リンク抽出
      const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["']/i)
      const link = linkMatch ? linkMatch[1] : ''

      // summary抽出
      const summaryMatch = entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)
      const summary = summaryMatch ? stripCdata(summaryMatch[1].trim()) : ''

      // updated抽出
      const updatedMatch = entryXml.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)
      const updated = updatedMatch ? updatedMatch[1].trim() : ''

      if (!title) {
        continue
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
  }

  return events
}

/**
 * CDATA セクションを除去
 */
function stripCdata(text: string): string {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}

/**
 * XML エンティティをデコード
 */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
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
 * 注: タイムゾーンを考慮してローカル日付を使用
 */
function parseDateFromIso8601(dateStr: string): string | null {
  try {
    // ISO 8601形式の日付文字列から日付部分（YYYY-MM-DD）を直接抽出
    // 例: "2025-11-14T00:00:00+09:00" → "2025-11-14"
    // タイムゾーン変換による日付のずれを防ぐ
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      return `${year}-${month}-${day}`
    }

    // マッチしない場合はDateオブジェクトを使用（フォールバック）
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
 * テキストから日付を抽出
 */
function extractDateFromText(text: string): string | null {
  return parseDateString(text)
}
