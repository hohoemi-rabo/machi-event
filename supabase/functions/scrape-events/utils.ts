import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EventData } from './types.ts'
import { ScrapingError } from './error-types.ts'

/**
 * 重複判定: 同じタイトル、日付、情報元のイベントが既に存在するかチェック
 */
export async function isDuplicate(
  supabase: SupabaseClient,
  event: EventData
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('title', event.title)
      .eq('event_date', event.event_date)
      .eq('source_site', event.source_site)
      .maybeSingle()

    if (error) {
      console.error('Error checking duplicate:', error)
      return false
    }

    return data !== null
  } catch (error) {
    console.error('Exception in isDuplicate:', error)
    return false
  }
}

/**
 * イベントをデータベースに挿入
 */
export async function insertEvent(
  supabase: SupabaseClient,
  event: EventData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('events')
      .insert(event)

    if (error) {
      console.error('Error inserting event:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception in insertEvent:', error)
    return false
  }
}

/**
 * スクレイピングログを記録（エラー詳細対応版）
 */
export async function logScrapingResult(
  supabase: SupabaseClient,
  siteName: string,
  status: 'success' | 'failure' | 'partial',
  eventsCount: number,
  errorMessage?: string,
  errorType?: string,
  stackTrace?: string
): Promise<void> {
  try {
    await supabase.from('scraping_logs').insert({
      site_name: siteName,
      status,
      events_count: eventsCount,
      error_message: errorMessage || null,
      error_type: errorType || null,
      stack_trace: stackTrace || null
    })
  } catch (error) {
    console.error('Error logging scraping result:', error)
  }
}

/**
 * エラーログを詳細記録
 */
export async function logDetailedError(
  supabase: SupabaseClient,
  error: ScrapingError
): Promise<void> {
  await logScrapingResult(
    supabase,
    error.siteName,
    'failure',
    0,
    error.message,
    error.errorType,
    error.stack
  )
}

/**
 * WebサイトからHTMLを取得
 */
export async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MachiEventBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.text()
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    return null
  }
}
