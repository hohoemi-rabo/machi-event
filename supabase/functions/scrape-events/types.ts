export interface EventData {
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
}

export interface ScrapingResult {
  success: boolean
  siteName: string
  eventsCount: number
  errors: string[]
}

export interface Parser {
  parse(html: string): EventData[]
}
