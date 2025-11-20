'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import FontSizeSwitcher from '@/components/ui/FontSizeSwitcher'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header
      className="shadow-md sticky top-0 z-50"
      style={{
        background: 'linear-gradient(135deg, #B19CD9 0%, #9370DB 50%, #8B5CF6 100%)'
      }}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-white hover:opacity-90 transition-opacity drop-shadow-md"
          >
            📣 南信イベナビ
          </Link>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex gap-6">
              <li>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/') || pathname?.startsWith('/week')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  🏠 ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/month"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/month') || pathname?.startsWith('/month')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  📆 今月
                </Link>
              </li>
              <li>
                <Link
                  href="/regions"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    pathname?.startsWith('/regions')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  📋 全イベント
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/search')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  🔍 検索
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/status')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  📊 更新状況
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/contact')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  ✉️ お問い合わせ
                </Link>
              </li>
            </ul>
            <div className="flex items-center gap-3">
              <FontSizeSwitcher />
              <div className="w-px h-6 bg-white/30"></div>
              {/* SNS Links */}
              <a
                href="https://www.instagram.com/masayuki.kiwami/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://x.com/masayuki_kiwami"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-white/20 transition-colors text-white"
            aria-label="メニュー"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 border-t border-white/30 pt-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/') || pathname?.startsWith('/week')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/month"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/month') || pathname?.startsWith('/month')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  📆 今月
                </Link>
              </li>
              <li>
                <Link
                  href="/regions"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    pathname?.startsWith('/regions')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  📋 全イベント
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/search')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔍 検索
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/status')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  📊 更新状況
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/contact')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ✉️ お問い合わせ
                </Link>
              </li>
            </ul>
            <div className="pt-4 px-4 space-y-4">
              <div className="flex justify-center">
                <FontSizeSwitcher />
              </div>
              <div className="border-t border-white/30 pt-4">
                <div className="flex justify-center gap-4">
                  <a
                    href="https://www.instagram.com/masayuki.kiwami/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-md hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://x.com/masayuki_kiwami"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-md hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    aria-label="X (Twitter)"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
