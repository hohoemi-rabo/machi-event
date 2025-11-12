'use client'

import { useState, useEffect } from 'react'
import liff from '@line/liff'

interface NotifyButtonProps {
  eventId: string
  eventTitle: string
}

export default function NotifyButton({ eventId, eventTitle }: NotifyButtonProps) {
  const [isReady, setIsReady] = useState(false)
  const [isNotifying, setIsNotifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // LIFF初期化
    const initializeLiff = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID
        if (!liffId) {
          console.error('LIFF ID is not set')
          setErrorMessage('LIFF IDが設定されていません')
          return
        }

        await liff.init({ liffId })
        setIsReady(true)

        // ログイン後に自動的に通知登録を実行
        if (liff.isLoggedIn()) {
          const pendingNotification = localStorage.getItem('pending_notification')
          if (pendingNotification === eventId) {
            localStorage.removeItem('pending_notification')
            // 自動的に通知登録を実行
            await registerNotification()
          }
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error)
        setErrorMessage('LIFF初期化エラー')
      }
    }

    initializeLiff()
  }, [])

  // 通知登録処理を分離
  const registerNotification = async () => {
    setIsNotifying(true)
    setMessage(null)
    setErrorMessage(null)

    try {
      // ユーザープロフィール取得
      const profile = await liff.getProfile()
      const lineUserId = profile.userId

      // 通知登録API呼び出し
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          line_user_id: lineUserId,
          event_id: eventId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '通知登録に失敗しました')
      }

      const data = await response.json()
      setMessage('✅ 通知設定が完了しました！開催前日の朝8時にLINEで通知が届きます。')

    } catch (error) {
      console.error('Error setting up notification:', error)
      setErrorMessage(error instanceof Error ? error.message : 'エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsNotifying(false)
    }
  }

  const handleNotify = async () => {
    if (!isReady) {
      setErrorMessage('LIFFの準備ができていません')
      return
    }

    // LINEログイン確認
    if (!liff.isLoggedIn()) {
      // ログイン後に通知登録を実行するためにイベントIDを保存
      localStorage.setItem('pending_notification', eventId)
      liff.login()
      return
    }

    // 既にログイン済みの場合は直接実行
    await registerNotification()
  }

  return (
    <div className="my-6">
      <button
        onClick={handleNotify}
        disabled={isNotifying || !isReady}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #06C755 0%, #00B900 100%)',
          color: '#FFFFFF'
        }}
      >
        {isNotifying ? '通知設定中...' : '🔔 このイベントを通知する'}
      </button>

      {message && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <p className="text-sm text-gray-600 mt-3">
        💡 開催前日の朝8時にLINEで通知が届きます
      </p>
    </div>
  )
}
