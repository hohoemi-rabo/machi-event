export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="mt-auto shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #B19CD9 0%, #9370DB 50%, #8B5CF6 100%)'
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <p className="text-sm font-medium drop-shadow-md">
            🎉 南信州地域のイベント情報を一元管理 🎉
          </p>
          <p className="text-xs mt-3 opacity-90">
            © {currentYear} 南信イベナビ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
