import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })
    .limit(20)

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">エラー</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">イベント一覧（開発用）</h1>

      <div className="mb-4 text-gray-600">
        取得件数: {events?.length || 0}件
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="px-4 py-2 border">日付</th>
              <th className="px-4 py-2 border">タイトル</th>
              <th className="px-4 py-2 border">場所</th>
              <th className="px-4 py-2 border">地域</th>
              <th className="px-4 py-2 border">情報元</th>
              <th className="px-4 py-2 border">NEW</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border whitespace-nowrap">
                  {event.event_date}
                </td>
                <td className="px-4 py-2 border">
                  <a
                    href={event.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {event.title}
                  </a>
                </td>
                <td className="px-4 py-2 border">{event.place || '-'}</td>
                <td className="px-4 py-2 border">{event.region}</td>
                <td className="px-4 py-2 border text-sm">{event.source_site}</td>
                <td className="px-4 py-2 border text-center">
                  {event.is_new ? '🆕' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!events || events.length === 0) && (
        <p className="text-gray-500 mt-4">イベントがありません</p>
      )}
    </div>
  )
}
