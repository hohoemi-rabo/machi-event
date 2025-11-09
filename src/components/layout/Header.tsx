import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            まちイベ
          </Link>

          <ul className="flex gap-6">
            <li>
              <Link
                href="/"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                今週
              </Link>
            </li>
            <li>
              <Link
                href="/month"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                今月
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                検索
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
