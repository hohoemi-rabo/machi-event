import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { validateSignature } from './validators.ts'
import { handleWebhookEvent } from './line-handler.ts'
import type { LineWebhookEvent } from './types.ts'

/**
 * LINE Webhook Edge Function
 * 友だち追加、地域選択、メッセージ処理を行う
 */
serve(async (req) => {
  // CORSヘッダー設定
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-line-signature'
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // リクエストボディ取得
    const body = await req.text()

    // 署名検証
    const signature = req.headers.get('x-line-signature')
    const channelSecret = Deno.env.get('LINE_CHANNEL_SECRET')

    if (!channelSecret) {
      console.error('LINE_CHANNEL_SECRET is not set')
      return new Response('Server configuration error', { status: 500 })
    }

    const isValidSignature = await validateSignature(body, signature, channelSecret)

    if (!isValidSignature) {
      console.error('Invalid signature')
      return new Response('Invalid signature', { status: 403 })
    }

    // Webhookイベント処理
    const payload = JSON.parse(body)
    const events: LineWebhookEvent[] = payload.events || []

    console.log(`Received ${events.length} events`)

    // 各イベントを処理
    const results = await Promise.allSettled(
      events.map(event => handleWebhookEvent(event))
    )

    // エラーがあればログに記録
    const errors = results.filter(r => r.status === 'rejected')
    if (errors.length > 0) {
      console.error(`${errors.length} events failed:`, errors)
    }

    return new Response(JSON.stringify({
      success: true,
      processed: events.length,
      failed: errors.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
