/** 조준·조준경 프리셋 (기획서 §6-E). 항목 이름은 §1-1 용어표(가정, Phase 0 캡처로 확정). */

export const SCOPE_KEYS = ["targeting", "scoping", "x2", "x3", "x4", "x6", "x8", "x15"] as const;
export type ScopeKey = (typeof SCOPE_KEYS)[number];

/** 인게임 메뉴 이름 (Phase 0 B1 실측, 설정 → 컨트롤 → 감도 → 마우스). 키 순서 = 메뉴 순서 = 복원 카드 순서. */
export const SCOPE_LABEL: Record<ScopeKey, string> = {
  targeting: "조준 감도",
  scoping: "스코프 모드 감도",
  x2: "2배율 스코프 감도",
  x3: "3배율 스코프 감도",
  x4: "4배율 스코프 감도",
  x6: "6배율 스코프 감도",
  x8: "8배율 스코프 감도",
  x15: "15배율 스코프 감도",
};

/** 복원 카드에 쓰는 전체 메뉴 순서 (Phase 0 B1 실측). 통합 스코프 감도는 토글. */
export const MENU_ORDER = [
  { key: "general", label: "일반 상태 감도" },
  { key: "vertical", label: "수직 감도 배수" },
  { key: "targeting", label: "조준 감도" },
  { key: "scoping", label: "스코프 모드 감도" },
  { key: "unified", label: "통합 스코프 감도" },
  { key: "x2", label: "2배율 스코프 감도" },
  { key: "x3", label: "3배율 스코프 감도" },
  { key: "x4", label: "4배율 스코프 감도" },
  { key: "x6", label: "6배율 스코프 감도" },
  { key: "x8", label: "8배율 스코프 감도" },
  { key: "x15", label: "15배율 스코프 감도" },
] as const;

/** 보간 축에서의 배율 (조준은 보간 대상 아님) */
export const ZOOM: Record<Exclude<ScopeKey, "targeting">, number> = {
  scoping: 1, x2: 2, x3: 3, x4: 4, x6: 6, x8: 8, x15: 15,
};

/** 프리셋 A 커뮤니티형: 일반 대비 슬라이더 Δ. 3x = −4는 문서 결정. */
export const PRESET_A: Record<ScopeKey, number> = {
  targeting: -1, scoping: -1, x2: -2, x3: -4, x4: -4, x6: -4, x8: -4, x15: -4,
};

export type ScopeMode = "unified" | "presetA" | "custom";

const clamp = (n: number) => Math.min(100, Math.max(1, n));

/** 모드에 따른 조준·조준경 값. 통일 모드는 전부 일반값. */
export function applyScopeMode(general: number, mode: Exclude<ScopeMode, "custom">): Record<ScopeKey, number> {
  const out = {} as Record<ScopeKey, number>;
  for (const k of SCOPE_KEYS) out[k] = mode === "unified" ? general : clamp(general + PRESET_A[k]);
  return out;
}
