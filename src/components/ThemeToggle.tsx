"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // 저장이 막힌 환경(시크릿 모드 등)에서도 토글은 동작하도록 무시한다.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-stone-200 transition hover:scale-105 dark:bg-stone-900 dark:ring-stone-800"
    >
      <span aria-hidden>{dark ? "☀️" : "🌙"}</span>
    </button>
  );
}
