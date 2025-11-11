import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * イベント通知登録API
 * POST /api/notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { line_user_id, event_id } = body

    if (!line_user_id || !event_id) {
      return NextResponse.json(
        { error: 'line_user_id and event_id are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // イベント情報を取得
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_date')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // 開催日の前日を通知日に設定
    const eventDate = new Date(event.event_date)
    const notifyDate = new Date(eventDate)
    notifyDate.setDate(notifyDate.getDate() - 1)

    // 通知登録
    const { data, error } = await supabase
      .from('event_notifications')
      .insert({
        line_user_id,
        event_id,
        notify_date: notifyDate.toISOString().split('T')[0],
        is_sent: false
      })
      .select()
      .single()

    if (error) {
      // すでに登録済みの場合
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Already registered for this event' },
          { status: 200 }
        )
      }

      console.error('Failed to register notification:', error)
      return NextResponse.json(
        { error: 'Failed to register notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Notification registered successfully'
    })

  } catch (error) {
    console.error('Error in notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * イベント通知削除API
 * DELETE /api/notifications?line_user_id=xxx&event_id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const line_user_id = searchParams.get('line_user_id')
    const event_id = searchParams.get('event_id')

    if (!line_user_id || !event_id) {
      return NextResponse.json(
        { error: 'line_user_id and event_id are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('event_notifications')
      .delete()
      .eq('line_user_id', line_user_id)
      .eq('event_id', event_id)

    if (error) {
      console.error('Failed to delete notification:', error)
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })

  } catch (error) {
    console.error('Error in notification delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * イベント通知確認API
 * GET /api/notifications?line_user_id=xxx&event_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const line_user_id = searchParams.get('line_user_id')
    const event_id = searchParams.get('event_id')

    if (!line_user_id || !event_id) {
      return NextResponse.json(
        { error: 'line_user_id and event_id are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('event_notifications')
      .select('*')
      .eq('line_user_id', line_user_id)
      .eq('event_id', event_id)
      .maybeSingle()

    if (error) {
      console.error('Failed to check notification:', error)
      return NextResponse.json(
        { error: 'Failed to check notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      registered: !!data,
      data
    })

  } catch (error) {
    console.error('Error in notification check API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
