import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface Event {
  id: string
  title: string
  event_date: string
  event_time: string | null
  place: string | null
  detail: string | null
  source_url: string
  source_site: string
  region: string
  image_url: string | null
  is_new: boolean
  created_at: string
}

/**
 * ユーザーの地域に合わせた新着イベントを取得
 * @param supabase - Supabaseクライアント
 * @param regions - ユーザーが選択している地域
 * @param limit - 最大取得件数
 * @returns 新着イベント配列
 */
export async function getNewEventsForRegions(
  supabase: SupabaseClient,
  regions: string[],
  limit: number = 3
): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  const weekLater = new Date()
  weekLater.setDate(weekLater.getDate() + 7)

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('region', regions)
    .eq('is_new', true)
    .gte('event_date', today)
    .lte('event_date', weekLater.toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch events:', error)
    throw error
  }

  return data || []
}

/**
 * is_newフラグをfalseに更新（通知済みマーク）
 * @param supabase - Supabaseクライアント
 * @param eventIds - イベントID配列
 */
export async function markEventsAsNotified(
  supabase: SupabaseClient,
  eventIds: string[]
): Promise<void> {
  if (eventIds.length === 0) {
    return
  }

  const { error } = await supabase
    .from('events')
    .update({ is_new: false })
    .in('id', eventIds)

  if (error) {
    console.error('Failed to mark events as notified:', error)
    throw error
  }
}
