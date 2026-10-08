"use client";

import type { LinkItem } from "@/data/profile";

export default function LinkCard({ link }: { link: LinkItem }) {
  function trackClick() {
    // 집계 실패가 링크 이동을 막지 않도록 응답은 무시한다.
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: link.id }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      className="block rounded-2xl border border-white/60 bg-white/50 px-5 py-4 text-center font-medium shadow-[0_8px_24px_-12px_rgba(140,80,40,0.25)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/70 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:hover:bg-white/10"
    >
      {link.title}
    </a>
  );
}
