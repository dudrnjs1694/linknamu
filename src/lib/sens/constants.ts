/**
 * 감도 찾기 상수 단일 정의 (기획서 §6-A, §6-G).
 * status: '설정' = 문서에서 정한 값, '추정' = 커뮤니티 근거, '실측' = Phase 0에서 확정한 값.
 * Phase 0 결과가 나오면 이 파일만 고친다.
 */
export type ConstStatus = "설정" | "추정" | "실측";

export interface Const<T> {
  value: T;
  status: ConstStatus;
  source?: string;
  measuredAt?: string;
}

const set = <T>(value: T, source?: string): Const<T> => ({ value, status: "설정", source });
const est = <T>(value: T, source?: string): Const<T> => ({ value, status: "추정", source });

export const SENS = {
  W0: set(10),
  W_END: set(4),
  SHIFT_MAX: set(2),
  TIE_MAX: set(3),
  T_QUICK: set(6),
  T_FULL: set(12),
  T_RE: set(4),
  W_RE: set(5),
  FLICK_N: set(5),
  SETS: set(2),
  A_STEP: set(2),
  V0: est(1.0, "프로 다수 1.0 (blast.tv)"),
  V_STEP: est(0.05, "인벤 수직감도 맞추기 — 입력 단위는 Phase 0 확인"),
  V_MAX: set(4),
  V_SHOTS: set(10),
  N_MEASURE: set(3),
  TOL_SLIDER: set(2, "측정 반복 σ ≤ 5% 전제, Phase 0 확인"),
  LOCK_DAYS: set(7),
  SESSION_LIMIT_MIN: est(30, "훈련장 세션 제한 가정, Phase 0 확인"),
  /** 슬라이더 지수형 가정: +SLIDER_DECADE = ×10 */
  SLIDER_DECADE: est(50, "mouse-sensitivity.com 포럼 #8889"),
  DPI: set(800),
  POLLING_HZ: set(1000),
  SLIDER_MIN: set(1),
  SLIDER_MAX: set(100),
} as const;

export const v = <K extends keyof typeof SENS>(k: K): (typeof SENS)[K]["value"] => SENS[k].value;
