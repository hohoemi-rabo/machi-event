export interface Event {
  id: string
  title: string
  event_date: string
  event_time?: string
  place?: string
  detail?: string
  source_url: string
  source_site: string
  region: string
  image_url?: string
  is_new: boolean
  created_at: string
  updated_at: string
}

export interface ScrapingLog {
  id: string
  site_name: string
  status: 'success' | 'failure' | 'partial'
  events_count: number
  error_message?: string
  created_at: string
}
