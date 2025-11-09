import { createClient } from '@/lib/supabase/server'

export default async function LogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('scraping_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">スクレイピングログ（開発用）</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="px-4 py-2 border">日時</th>
              <th className="px-4 py-2 border">サイト名</th>
              <th className="px-4 py-2 border">ステータス</th>
              <th className="px-4 py-2 border">取得件数</th>
              <th className="px-4 py-2 border">エラー</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border whitespace-nowrap text-sm">
                  {new Date(log.created_at).toLocaleString('ja-JP')}
                </td>
                <td className="px-4 py-2 border">{log.site_name}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' :
                    log.status === 'failure' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  {log.events_count}
                </td>
                <td className="px-4 py-2 border text-sm text-red-600">
                  {log.error_message || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
