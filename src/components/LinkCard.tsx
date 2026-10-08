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
      className="block rounded-2xl bg-white px-5 py-4 text-center font-medium shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] dark:bg-stone-900 dark:ring-stone-800 dark:hover:bg-stone-800"
    >
      {link.title}
    </a>
  );
}
