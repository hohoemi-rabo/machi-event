// LINE Webhook Event Types
export interface LineWebhookEvent {
  type: 'message' | 'follow' | 'unfollow' | 'postback' | 'join' | 'leave'
  timestamp: number
  source: {
    type: 'user' | 'group' | 'room'
    userId: string
    groupId?: string
    roomId?: string
  }
  replyToken?: string
  message?: LineMessage
  postback?: {
    data: string
    params?: Record<string, any>
  }
}

export interface LineMessage {
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'
  id: string
  text?: string
}

export interface LineUser {
  id: string
  line_user_id: string
  regions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LinePushMessage {
  to: string
  messages: LineMessageObject[]
}

export interface LineMessageObject {
  type: 'text' | 'flex' | 'template'
  text?: string
  altText?: string
  contents?: any
  template?: any
  quickReply?: {
    items: LineQuickReplyItem[]
  }
}

export interface LineQuickReplyItem {
  type: 'action'
  action: {
    type: 'postback' | 'message' | 'uri'
    label: string
    data?: string
    text?: string
    uri?: string
  }
}

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
  updated_at: string
}
