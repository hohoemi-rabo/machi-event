import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fetchHTML, isDuplicate, insertEvent, logScrapingResult } from './utils.ts'
import { SampleParser } from './parser.ts'
import { ScrapingResult } from './types.ts'

Deno.serve(async (req: Request) => {
  try {
    // Supabaseクライアント初期化（サービスロールキー使用）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // リクエストボディから対象サイト情報を取得（将来の拡張用）
    const { siteUrl, siteName, region } = await req.json().catch(() => ({
      siteUrl: 'https://example.com/events', // デフォルト値（テスト用）
      siteName: 'サンプルサイト',
      region: '飯田市'
    }))

    console.log(`Starting scraping for: ${siteName}`)

    // スクレイピング実行
    const result = await scrapeWebsite(supabase, siteUrl, siteName, region)

    // ログ記録
    const status = result.success ? 'success' :
                   result.eventsCount > 0 ? 'partial' : 'failure'

    await logScrapingResult(
      supabase,
      siteName,
      status,
      result.eventsCount,
      result.errors.length > 0 ? result.errors.join('; ') : undefined
    )

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
 * Webサイトからイベント情報をスクレイピング
 */
async function scrapeWebsite(
  supabase: any,
  siteUrl: string,
  siteName: string,
  region: string
): Promise<ScrapingResult> {
  const result: ScrapingResult = {
    success: false,
    siteName,
    eventsCount: 0,
    errors: []
  }

  try {
    // HTMLを取得
    const html = await fetchHTML(siteUrl)
    if (!html) {
      result.errors.push('Failed to fetch HTML')
      return result
    }

    // パーサーでイベント情報を抽出
    const parser = new SampleParser(siteName, region)
    const events = parser.parse(html)

    console.log(`Parsed ${events.length} events from ${siteName}`)

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
        } else {
          result.errors.push(`Failed to insert: ${event.title}`)
        }
      } catch (error) {
        result.errors.push(`Error processing event: ${error.message}`)
      }
    }

    result.eventsCount = insertedCount
    result.success = insertedCount > 0 || events.length === 0

    return result
  } catch (error) {
    result.errors.push(`Scraping error: ${error.message}`)
    return result
  }
}
