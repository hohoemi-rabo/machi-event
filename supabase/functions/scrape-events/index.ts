import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isDuplicate, insertEvent, logScrapingResult } from './utils.ts'
import { SITES } from './sites-config.ts'
import { parseRssFeed } from './rss-parser.ts'
import { parseHtmlSite } from './html-parser.ts'
import { EventData } from './types.ts'

interface ScrapeAllResult {
  totalSites: number
  successfulSites: number
  failedSites: number
  totalEvents: number
  newEvents: number
  errors: Array<{ site: string; error: string }>
}

Deno.serve(async (req: Request) => {
  try {
    // Supabaseクライアント初期化（サービスロールキー使用）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting scraping for all sites...')

    // 全28サイトをスクレイピング
    const result = await scrapeAllSites(supabase)

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
})

/**
 * 全サイトをスクレイピング
 */
async function scrapeAllSites(supabase: any): Promise<ScrapeAllResult> {
  const result: ScrapeAllResult = {
    totalSites: SITES.length,
    successfulSites: 0,
    failedSites: 0,
    totalEvents: 0,
    newEvents: 0,
    errors: []
  }

  for (const site of SITES) {
    console.log(`Scraping: ${site.name}`)

    try {
      // サイトタイプに応じてパーサーを選択
      let events: EventData[] = []

      if (site.type === 'rss') {
        events = await parseRssFeed(site.url, site.name, site.region)
      } else {
        events = await parseHtmlSite(site)
      }

      console.log(`Found ${events.length} events from ${site.name}`)

      // 各イベントを処理
      let insertedCount = 0
      for (const event of events) {
        try {
          // 重複チェック
          const duplicate = await isDuplicate(supabase, event)
          if (duplicate) {
            console.log(`Skipping duplicate event: ${event.title}`)
            continue
          }

          // データベースに挿入
          const inserted = await insertEvent(supabase, event)
          if (inserted) {
            insertedCount++
          }
        } catch (error) {
          console.error(`Error processing event: ${error.message}`)
        }
      }

      // 結果を記録
      result.totalEvents += events.length
      result.newEvents += insertedCount

      // ログ記録
      const status = events.length > 0 ? 'success' : 'partial'
      await logScrapingResult(
        supabase,
        site.name,
        status,
        insertedCount,
        events.length === 0 ? 'No events found' : undefined
      )

      result.successfulSites++
    } catch (error) {
      console.error(`Failed to scrape ${site.name}:`, error)

      // エラーログ記録
      await logScrapingResult(
        supabase,
        site.name,
        'failure',
        0,
        error.message
      )

      result.failedSites++
      result.errors.push({
        site: site.name,
        error: error.message
      })
    }
  }

  console.log(`Scraping completed: ${result.successfulSites}/${result.totalSites} sites successful`)
  console.log(`Total events: ${result.totalEvents}, New events: ${result.newEvents}`)

  return result
}
