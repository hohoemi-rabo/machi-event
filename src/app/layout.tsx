import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileFooter from "@/components/layout/MobileFooter";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "南信州イベント情報 | 南信イベナビ",
  description: "南信州地域のイベント情報を一元管理。今日、週末、今月のイベントをチェック！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        {/* PC時のみ表示 */}
        <div className="hidden lg:block">
          <Footer />
        </div>
        {/* モバイル・タブレット時のみ表示 */}
        <MobileFooter />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
