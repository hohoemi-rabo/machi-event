'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            まちイベ
          </Link>

          {/* デスクトップメニュー */}
          <ul className="hidden md:flex gap-6">
            <li>
              <Link
                href="/"
                className={`transition-colors font-medium ${
                  isActive('/')
                    ? 'text-primary font-bold'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                今週
              </Link>
            </li>
            <li>
              <Link
                href="/month"
                className={`transition-colors font-medium ${
                  isActive('/month')
                    ? 'text-primary font-bold'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                今月
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className={`transition-colors font-medium ${
                  isActive('/events')
                    ? 'text-primary font-bold'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                検索
              </Link>
            </li>
          </ul>

          {/* モバイルメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
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
          <ul className="md:hidden mt-4 space-y-2 border-t pt-4">
            <li>
              <Link
                href="/"
                className={`block py-3 px-4 rounded-md transition-colors ${
                  isActive('/')
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                今週
              </Link>
            </li>
            <li>
              <Link
                href="/month"
                className={`block py-3 px-4 rounded-md transition-colors ${
                  isActive('/month')
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                今月
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className={`block py-3 px-4 rounded-md transition-colors ${
                  isActive('/events')
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                検索
              </Link>
            </li>
          </ul>
        )}
      </nav>
    </header>
  )
}
