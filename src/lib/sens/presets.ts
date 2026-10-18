/** 조준·조준경 프리셋 (기획서 §6-E). 항목 이름은 §1-1 용어표(가정, Phase 0 캡처로 확정). */

export const SCOPE_KEYS = ["targeting", "scoping", "x2", "x3", "x4", "x6", "x8", "x15"] as const;
export type ScopeKey = (typeof SCOPE_KEYS)[number];

export const SCOPE_LABEL: Record<ScopeKey, string> = {
  targeting: "조준",
  scoping: "조준경",
  x2: "2배율",
  x3: "3배율",
  x4: "4배율",
  x6: "6배율",
  x8: "8배율",
  x15: "15배율",
};

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
