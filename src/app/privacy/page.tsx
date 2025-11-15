export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">1. 個人情報の収集について</h2>
          <p>
            当サイト「南信イベナビ」では、サービス提供のために必要最小限の個人情報を収集する場合があります。
            収集する情報は以下の通りです：
          </p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">2. 個人情報の利用目的</h2>
          <p>収集した個人情報は、以下の目的で利用します：</p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>サービスの改善および分析</li>
            <li>お問い合わせへの対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">3. 個人情報の第三者提供</h2>
          <p>
            当サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">4. 個人情報の管理</h2>
          <p>
            当サイトは、個人情報の漏洩、滅失、毀損等を防止するため、適切なセキュリティ対策を実施します。
            個人情報は、Supabase（PostgreSQL）にて安全に管理されます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Cookie（クッキー）の利用</h2>
          <p>
            当サイトでは、サービスの利便性向上のためにCookieを利用する場合があります。
            Cookieの利用を望まない場合は、ブラウザの設定で無効化できます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">6. アクセス解析ツール</h2>
          <p>
            当サイトでは、サービス向上のためにアクセス解析ツールを利用する場合があります。
            これらのツールは、Cookieを使用してアクセス情報を収集しますが、個人を特定する情報は含まれません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">7. プライバシーポリシーの変更</h2>
          <p>
            当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
            変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">8. お問い合わせ</h2>
          <p>
            本プライバシーポリシーに関するお問い合わせは、サイト運営者までご連絡ください。
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            制定日：2025年11月15日
          </p>
        </div>
      </div>
    </div>
  )
}
