import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isDuplicate, insertEvent, logScrapingResult, logDetailedError } from './utils.ts'
import { SITES, SiteConfig } from './sites-config.ts'
import { parseRssFeed } from './rss-parser.ts'
import { parseHtmlSite } from './html-parser.ts'
import { EventData } from './types.ts'
import { toScrapingError } from './error-types.ts'
import { retryWithBackoff } from './retry.ts'
import { detectStructureChange, createStructureChangeError } from './structure-checker.ts'
import { sendErrorAlert, sendStructureChangeAlert } from './alert.ts'

interface ScrapeAllResult {
  totalSites: number
  successfulSites: number
  failedSites: number
  totalEvents: number
  newEvents: number
  structureChanges: number
  errors: Array<{ site: string; error: string; errorType?: string }>
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
 * 全サイトをスクレイピング（並列処理版）
 */
async function scrapeAllSites(supabase: any): Promise<ScrapeAllResult> {
  const result: ScrapeAllResult = {
    totalSites: SITES.length,
    successfulSites: 0,
    failedSites: 0,
    totalEvents: 0,
    newEvents: 0,
    structureChanges: 0,
    errors: []
  }

  console.log(`\n=== Starting parallel scraping for ${SITES.length} sites ===`)

  // スクレイピング前に全イベントデータを削除（全削除→再登録方式）
  console.log('🗑️ Deleting all existing events...')
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // 全件削除（ダミー条件）

  if (deleteError) {
    console.error('❌ Failed to delete events:', deleteError)
  } else {
    console.log(`✅ Deleted all existing events`)
  }

  // 全サイトを並列処理
  const results = await Promise.allSettled(
    SITES.map(site => scrapeSingleSite(supabase, site))
  )

  // 結果を集計
  for (const siteResult of results) {
    if (siteResult.status === 'fulfilled') {
      const data = siteResult.value
      result.totalEvents += data.totalEvents
      result.newEvents += data.newEvents

      if (data.success) {
        result.successfulSites++
      } else {
        result.failedSites++
        if (data.structureChange) {
          result.structureChanges++
        }
        if (data.error) {
          result.errors.push(data.error)
        }
      }
    } else {
      // Promise自体が失敗した場合（通常は発生しない）
      result.failedSites++
      result.errors.push({
        site: 'Unknown',
        error: siteResult.reason?.message || 'Unknown error',
        errorType: 'unknown'
      })
    }
  }

  console.log(`\n=== Scraping Summary ===`)
  console.log(`Total sites: ${result.totalSites}`)
  console.log(`Successful: ${result.successfulSites}`)
  console.log(`Failed: ${result.failedSites}`)
  console.log(`Structure changes: ${result.structureChanges}`)
  console.log(`Total events: ${result.totalEvents}`)
  console.log(`New events: ${result.newEvents}`)

  return result
}

/**
 * 単一サイトのスクレイピング処理
 */
async function scrapeSingleSite(supabase: any, site: SiteConfig) {
  console.log(`\n[${site.name}] Starting scraping...`)

  try {
    // リトライ付きでスクレイピング実行
    const events = await retryWithBackoff(
      async () => {
        if (site.type === 'rss') {
          return await parseRssFeed(site.url, site.name, site.region)
        } else {
          return await parseHtmlSite(site)
        }
      },
      3,  // 最大3回リトライ
      2000 // 2秒から開始
    )

    console.log(`[${site.name}] Found ${events.length} events`)

    // サイト構造変更検知
    const structureCheck = await detectStructureChange(supabase, site.name, events)

    if (structureCheck.changed) {
      console.warn(`[${site.name}] ⚠️ Structure change detected: ${structureCheck.reason}`)

      // 構造変更アラート送信
      await sendStructureChangeAlert(site.name, structureCheck)

      // 構造変更エラーとしてログ記録
      const structureError = createStructureChangeError(site.name, structureCheck)
      await logDetailedError(supabase, structureError)

      return {
        success: false,
        structureChange: true,
        totalEvents: events.length,
        newEvents: 0,
        error: {
          site: site.name,
          error: structureCheck.reason || 'Structure change detected',
          errorType: 'parsing'
        }
      }
    }

    // 各イベントを処理
    let insertedCount = 0
    for (const event of events) {
      try {
        // 重複チェック
        const duplicate = await isDuplicate(supabase, event)
        if (duplicate) {
          continue
        }

        // データベースに挿入
        const inserted = await insertEvent(supabase, event)
        if (inserted) {
          insertedCount++
        }
      } catch (error) {
        console.error(`[${site.name}] Error processing event:`, error)
      }
    }

    // 成功ログ記録
    const status = events.length > 0 ? 'success' : 'partial'
    await logScrapingResult(
      supabase,
      site.name,
      status,
      insertedCount,
      events.length === 0 ? 'No events found' : undefined
    )

    console.log(`[${site.name}] ✓ Success: ${insertedCount} new events added`)

    return {
      success: true,
      structureChange: false,
      totalEvents: events.length,
      newEvents: insertedCount,
      error: null
    }

  } catch (error) {
    console.error(`[${site.name}] ✗ Failed:`, error)

    // エラーをScrapingErrorに変換
    const scrapingError = toScrapingError(error, site.name)

    // 詳細エラーログ記録
    await logDetailedError(supabase, scrapingError)

    // エラーアラート送信（criticalなエラーのみ）
    if (!scrapingError.isRetryable()) {
      await sendErrorAlert(scrapingError)
    }

    return {
      success: false,
      structureChange: false,
      totalEvents: 0,
      newEvents: 0,
      error: {
        site: site.name,
        error: scrapingError.message,
        errorType: scrapingError.errorType
      }
    }
  }
}
