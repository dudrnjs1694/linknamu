/** 변환 (기획서 §6-D). 슬라이더 지수형은 "추정"이므로 상대 변환에만 쓴다. */
import { v } from "./constants";

const DECADE = v("SLIDER_DECADE");

/** D-1: 슬라이더 Δ만큼 바꿨을 때 감도 배수 */
export const ratio = (delta: number): number => Math.pow(10, delta / DECADE);

/** D-1: 감도를 m배로 만들 슬라이더 Δ */
export const deltaSlider = (m: number): number => DECADE * Math.log10(m);

/** D-3: D(일반값 G에서 잰 cm/360)로부터 슬라이더 X의 cm/360 추정. X ↑ → cm/360 ↓ */
export const cm360At = (X: number, D: number, G: number): number => D / ratio(X - G);

/** D-2(예비): 오늘 실측 1바퀴 거리 D′로 같은 cm/360을 유지하는 Δ. D′ > D(덜 돌았다) → 올림 */
export const todayDeltaByDistance = (D: number, Dprime: number): number => deltaSlider(Dprime / D);

/** D-2(예비): 오늘 DPI로 800 기준 cm/360을 유지하는 Δ. DPI ↑ → 내림 */
export const todayDeltaByDpi = (dpiToday: number, dpiBase = v("DPI")): number =>
  deltaSlider(dpiBase / dpiToday);

/** 0-B 1바퀴 검증 한 번: |50·log10(D′/D)| ≤ TOL */
export const lapWithinTolerance = (D: number, Dprime: number, tol = v("TOL_SLIDER")): boolean =>
  Math.abs(deltaSlider(Dprime / D)) <= tol;

/**
 * 0-B 판정: 1회 끌기로 통과하면 통과. 불통과면 2회째를 재서 둘 다 불통과일 때만 실패.
 * second가 없고 first가 불통과면 "need-second".
 */
export function sessionLapCheck(
  D: number,
  first: number,
  second?: number,
  tol = v("TOL_SLIDER"),
): "pass" | "fail" | "need-second" {
  if (lapWithinTolerance(D, first, tol)) return "pass";
  if (second === undefined) return "need-second";
  return lapWithinTolerance(D, second, tol) ? "pass" : "fail";
}

/** 측정값 평균·표본 표준편차 (Step 3 D 측정) */
export function meanAndSd(xs: number[]): { mean: number; sd: number; relSd: number } {
  if (xs.length === 0) throw new Error("측정값이 없다");
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  const sd =
    xs.length < 2 ? 0 : Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1));
  return { mean, sd, relSd: sd / mean };
}
