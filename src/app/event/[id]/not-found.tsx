import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          イベントが見つかりません
        </h1>
        <p className="text-gray-600 mb-8">
          お探しのイベントは存在しないか、削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
