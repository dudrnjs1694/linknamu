import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "링크나무",
  description: "내 모든 링크를 한 페이지에 모아 하나의 URL로 공유하세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// 첫 페인트 전에 저장된 테마(또는 시스템 설정)를 적용해 깜빡임을 막는다.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-[#FDEBDD] to-[#F9D5C0] font-sans text-stone-800 antialiased transition-colors dark:from-[#1E1915] dark:via-[#241D18] dark:to-[#2E241E] dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
