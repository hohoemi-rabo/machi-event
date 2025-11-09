'use client'

import { useState, useEffect } from 'react'
import type { Event } from '@/types/event'

interface ShareButtonsProps {
  event: Event
}

export default function ShareButtons({ event }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [copiedInstagram, setCopiedInstagram] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // クライアントサイドでのみWeb Share APIの使用可否を判定
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanShare(true)
    }
  }, [])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/${event.id}`
    : ''

  const shareText = `${event.title} | まちイベ`

  // Web Share API（モバイル優先）
  const handleWebShare = async () => {
    if (!canShare) return

    try {
      await navigator.share({
        title: event.title,
        text: shareText,
        url: shareUrl
      })
    } catch (err) {
      // AbortErrorはユーザーがキャンセルした場合なので無視
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to share:', err)
      }
    }
  }

  // LINE共有
  const handleLineShare = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
      `${shareText}\n${shareUrl}`
    )}`
    window.open(lineUrl, '_blank', 'noopener,noreferrer')
  }

  // X（Twitter）共有
  const handleXShare = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(xUrl, '_blank', 'width=550,height=420,noopener,noreferrer')
  }

  // Instagram共有（URLコピー方式）
  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedInstagram(true)
      setTimeout(() => setCopiedInstagram(false), 3000)
    } catch (err) {
      console.error('Failed to copy for Instagram:', err)
      // フォールバック
      fallbackCopyUrlForInstagram()
    }
  }

  const fallbackCopyUrlForInstagram = () => {
    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      setCopiedInstagram(true)
      setTimeout(() => setCopiedInstagram(false), 3000)
    } catch (err) {
      console.error('Fallback copy for Instagram failed:', err)
    }
    document.body.removeChild(textArea)
  }

  // URLコピー
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // フォールバック: 古いブラウザ対応
      fallbackCopyUrl()
    }
  }

  // フォールバック: execCommandを使ったコピー
  const fallbackCopyUrl = () => {
    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Fallback copy failed:', err)
    }
    document.body.removeChild(textArea)
  }

  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">このイベントを共有</h3>

      {canShare ? (
        // モバイル: Web Share API
        <div className="space-y-3">
          <button
            onClick={handleWebShare}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            共有する
          </button>
          <div className="text-center text-sm text-gray-500">または</div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLineShare}
              className="flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              aria-label="LINEで共有"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE
            </button>

            <button
              onClick={handleXShare}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              aria-label="Xで共有"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>

            <button
              onClick={handleInstagramShare}
              className="flex items-center gap-2 bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              aria-label="Instagramで共有"
              title="URLをコピーしてInstagramアプリに貼り付けてください"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              {copiedInstagram ? 'コピーしました！' : 'Instagram'}
            </button>

            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              aria-label="URLをコピー"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'コピーしました！' : 'URLコピー'}
            </button>
          </div>
          {copiedInstagram && (
            <p className="text-sm text-gray-600 mt-2">
              URLをコピーしました。Instagramアプリで投稿やストーリーに貼り付けてください。
            </p>
          )}
        </div>
      ) : (
        // PC: 個別ボタン
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLineShare}
            className="flex items-center gap-2 bg-[#06C755] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            aria-label="LINEで共有"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINE
          </button>

          <button
            onClick={handleXShare}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            aria-label="Xで共有"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </button>

          <button
            onClick={handleInstagramShare}
            className="flex items-center gap-2 bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            aria-label="Instagramで共有"
            title="URLをコピーしてInstagramアプリに貼り付けてください"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            {copiedInstagram ? 'コピーしました！' : 'Instagram'}
          </button>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            aria-label="URLをコピー"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'コピーしました！' : 'URLコピー'}
          </button>
        </div>
      )}
      {copiedInstagram && (
        <p className="text-sm text-gray-600 mt-3">
          URLをコピーしました。Instagramアプリで投稿やストーリーに貼り付けてください。
        </p>
      )}
    </div>
  )
}
