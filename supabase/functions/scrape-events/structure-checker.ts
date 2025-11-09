import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EventData } from './types.ts'
import { createParsingError } from './error-types.ts'

/**
 * サイト構造変更検知の結果
 */
export interface StructureCheckResult {
  changed: boolean
  reason?: string
  currentCount: number
  expectedCount?: number
  avgCount?: number
}

/**
 * サイト構造変更を検知
 *
 * @param supabase Supabaseクライアント
 * @param siteName サイト名
 * @param events 今回取得したイベント
 * @returns 構造変更検知結果
 */
export async function detectStructureChange(
  supabase: SupabaseClient,
  siteName: string,
  events: EventData[]
): Promise<StructureCheckResult> {
  const currentCount = events.length

  // 過去の成功したスクレイピングのイベント数を取得
  const { data: logs, error } = await supabase
    .from('scraping_logs')
    .select('events_count')
    .eq('site_name', siteName)
    .eq('status', 'success')
    .gt('events_count', 0) // イベント数が0より大きいもののみ
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching scraping logs:', error)
    return { changed: false, currentCount }
  }

  // 履歴が少ない場合は判定しない（新しいサイトの可能性）
  if (!logs || logs.length < 3) {
    console.log(`Insufficient history for ${siteName} (${logs?.length || 0} records)`)
    return { changed: false, currentCount }
  }

  // 平均イベント数を計算
  const avgCount = logs.reduce((sum, log) => sum + log.events_count, 0) / logs.length
  console.log(`${siteName}: Current=${currentCount}, Avg=${avgCount.toFixed(1)}`)

  // チェック1: イベント数が0の場合
  if (currentCount === 0) {
    return {
      changed: true,
      reason: 'No events found - possible structure change or site issue',
      currentCount,
      avgCount
    }
  }

  // チェック2: 取得数が平均の50%未満の場合
  if (currentCount < avgCount * 0.5) {
    return {
      changed: true,
      reason: `Event count dropped significantly (${currentCount} vs avg ${avgCount.toFixed(1)})`,
      currentCount,
      avgCount
    }
  }

  // チェック3: 必須フィールドの検証
  const validationResult = validateEventFields(events)
  if (!validationResult.valid) {
    return {
      changed: true,
      reason: validationResult.reason,
      currentCount,
      avgCount
    }
  }

  // 構造変更なし
  return { changed: false, currentCount, avgCount }
}

/**
 * イベントフィールドの妥当性を検証
 *
 * @param events イベントリスト
 * @returns 検証結果
 */
function validateEventFields(events: EventData[]): { valid: boolean; reason?: string } {
  if (events.length === 0) {
    return { valid: true } // 0件の場合は別のチェックで処理
  }

  // 必須フィールド（title, event_date）の欠落をチェック
  const invalidEvents = events.filter(e => !e.title || !e.event_date)

  // 50%以上のイベントが不正な場合は構造変更の可能性
  const invalidRate = invalidEvents.length / events.length
  if (invalidRate > 0.5) {
    return {
      valid: false,
      reason: `Too many invalid events: ${invalidEvents.length}/${events.length} (${(invalidRate * 100).toFixed(1)}%)`
    }
  }

  // タイトルが異常に短い/長いイベントが多い場合
  const abnormalTitles = events.filter(e => {
    const titleLength = e.title?.length || 0
    return titleLength < 3 || titleLength > 200
  })

  const abnormalRate = abnormalTitles.length / events.length
  if (abnormalRate > 0.5) {
    return {
      valid: false,
      reason: `Too many events with abnormal titles: ${abnormalTitles.length}/${events.length} (${(abnormalRate * 100).toFixed(1)}%)`
    }
  }

  return { valid: true }
}

/**
 * 構造変更のエラーを作成
 *
 * @param siteName サイト名
 * @param result 構造変更検知結果
 * @returns ScrapingError
 */
export function createStructureChangeError(
  siteName: string,
  result: StructureCheckResult
) {
  return createParsingError(
    siteName,
    result.reason || 'Structure change detected'
  )
}
