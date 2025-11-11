'use client'

import { useState } from 'react'

interface NotifyButtonProps {
  eventId: string
  eventTitle: string
}

export default function NotifyButton({ eventId, eventTitle }: NotifyButtonProps) {
  const [isNotifying, setIsNotifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleNotify = async () => {
    setIsNotifying(true)
    setMessage(null)

    try {
      // LINE公式アカウントへのリンク
      // TODO: 実際のLINE公式アカウントIDに置き換える
      const lineAddFriendUrl = 'https://line.me/R/ti/p/@YOUR_LINE_ID'

      // LINE公式アカウント追加ページを開く
      window.open(lineAddFriendUrl, '_blank')

      setMessage('LINE公式アカウントを友だち追加してください')

      // TODO: 将来的にLIFFアプリで実装
      // - LINE友だち追加後にユーザーIDを取得
      // - APIに通知登録リクエストを送信
      // await fetch('/api/notifications', {
      //   method: 'POST',
      //   body: JSON.stringify({ line_user_id, event_id: eventId })
      // })

    } catch (error) {
      console.error('Error setting up notification:', error)
      setMessage('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsNotifying(false)
    }
  }

  return (
    <div className="my-6">
      <button
        onClick={handleNotify}
        disabled={isNotifying}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #06C755 0%, #00B900 100%)',
          color: '#FFFFFF'
        }}
      >
        🔔 このイベントを通知する
      </button>

      {message && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">{message}</p>
          <p className="text-xs text-green-600 mt-2">
            ※ 友だち追加後、再度このボタンをタップしてください
          </p>
        </div>
      )}

      <p className="text-sm text-gray-600 mt-3">
        💡 開催前日の朝8時にLINEで通知が届きます
      </p>
    </div>
  )
}
