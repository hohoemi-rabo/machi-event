import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { EventData, Parser } from './types.ts'

/**
 * サンプルパーサー（テスト用）
 * 実際のサイト対応は04-scraping-sites.mdで実装
 */
export class SampleParser implements Parser {
  private sourceSite: string
  private region: string

  constructor(sourceSite: string, region: string = '飯田市') {
    this.sourceSite = sourceSite
    this.region = region
  }

  parse(html: string): EventData[] {
    const $ = load(html)
    const events: EventData[] = []

    // サンプル実装: 実際のサイト構造に合わせて修正が必要
    // ここでは基本的なパターンを示す

    // 例: リスト形式のイベント
    $('.event-item').each((_, element) => {
      try {
        const title = $(element).find('.event-title').text().trim()
        const dateText = $(element).find('.event-date').text().trim()
        const place = $(element).find('.event-place').text().trim()
        const detail = $(element).find('.event-detail').text().trim()
        const link = $(element).find('a').attr('href')

        if (!title || !dateText) {
          return // スキップ
        }

        // 日付をYYYY-MM-DD形式に変換（簡易実装）
        const eventDate = this.parseDate(dateText)
        if (!eventDate) {
          return // 日付が解析できない場合はスキップ
        }

        events.push({
          title,
          event_date: eventDate,
          place: place || undefined,
          detail: detail || undefined,
          source_url: link || '',
          source_site: this.sourceSite,
          region: this.region,
          is_new: true
        })
      } catch (error) {
        console.error('Error parsing event item:', error)
      }
    })

    return events
  }

  /**
   * 日付文字列を YYYY-MM-DD 形式に変換
   * 例: "2025年11月15日" → "2025-11-15"
   */
  private parseDate(dateText: string): string | null {
    try {
      // "YYYY年MM月DD日" 形式
      const match = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
      if (match) {
        const year = match[1]
        const month = match[2].padStart(2, '0')
        const day = match[3].padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // "MM/DD" 形式（当年として処理）
      const match2 = dateText.match(/(\d{1,2})\/(\d{1,2})/)
      if (match2) {
        const year = new Date().getFullYear()
        const month = match2[1].padStart(2, '0')
        const day = match2[2].padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      return null
    } catch (error) {
      console.error('Error parsing date:', error)
      return null
    }
  }
}
