export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          <p className="text-sm">
            南信州地域のイベント情報を一元管理
          </p>
          <p className="text-xs mt-2">
            © {currentYear} まちイベ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
