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
                    isActive('/')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  📅 今週
                </Link>
              </li>
              <li>
                <Link
                  href="/month"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/month')
                      ? 'text-white font-bold bg-white/20 shadow-lg'
                      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                >
                  📆 今月
                </Link>
              </li>
              <li>
                <Link
                  href="/all"
                  className={`px-3 py-2 rounded-md transition-all duration-300 font-medium ${
                    isActive('/all')
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
            </ul>
            <FontSizeSwitcher />
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
                    isActive('/')
                      ? 'bg-white/30 font-bold shadow-lg'
                      : 'hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  📅 今週
                </Link>
              </li>
              <li>
                <Link
                  href="/month"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/month')
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
                  href="/all"
                  className={`block py-3 px-4 rounded-md transition-all duration-300 text-white ${
                    isActive('/all')
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
            </ul>
            <div className="pt-4 px-4 flex justify-center">
              <FontSizeSwitcher />
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
