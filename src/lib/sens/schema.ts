/**
 * 저장 상태 스키마와 검증 (기획서 §7). 외부 라이브러리 없이 손으로 검증한다.
 * JSON 불러오기(iOS 스토리지 삭제 후 복구)에서 쓴다.
 */
import type { Answer, SearchParams } from "./bisect";
import type { ScopeKey } from "./presets";

export const STATE_VERSION = 1;

export interface DMeasure {
  /** cm/360 측정값들 */
  samples: number[];
  /** D를 잰 일반값 */
  G: number;
  view: "tpp" | "fpp";
  fov?: number;
  angle: 360 | 180;
  measuredAt: string;
}

export interface RestoreCard {
  general: number;
  vertical: number;
  scopes: Record<ScopeKey, number>;
  unified: boolean;
  view: "tpp" | "fpp";
  fov?: number;
  gameVersion?: string;
  createdAt: string;
}

export interface SensStateV1 {
  version: 1;
  seed: number;
  search?: { params: SearchParams; answers: Answer[] };
  d?: DMeasure;
  card?: RestoreCard;
  lockedUntil?: string;
  history: RestoreCard[];
}

export type ValidationResult = { ok: true; state: SensStateV1; warnings: string[] } | { ok: false; error: string };

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isInt = (x: unknown, lo: number, hi: number) => Number.isInteger(x) && (x as number) >= lo && (x as number) <= hi;
const isIso = (x: unknown) => typeof x === "string" && !Number.isNaN(Date.parse(x));

function checkCard(c: unknown, path: string): string | null {
  if (!isObj(c)) return `${path}: 객체가 아님`;
  if (!isInt(c.general, 1, 100)) return `${path}.general: 1~100 정수가 아님`;
  // 인게임 수직 감도 배수 범위 0~2 (Phase 0 B4 실측)
  if (typeof c.vertical !== "number" || c.vertical < 0 || c.vertical > 2) return `${path}.vertical: 0~2 범위 밖`;
  if (!isObj(c.scopes)) return `${path}.scopes: 객체가 아님`;
  for (const [k, val] of Object.entries(c.scopes)) if (!isInt(val, 1, 100)) return `${path}.scopes.${k}: 1~100 정수가 아님`;
  if (c.view !== "tpp" && c.view !== "fpp") return `${path}.view: tpp/fpp가 아님`;
  if (!isIso(c.createdAt)) return `${path}.createdAt: 날짜가 아님`;
  return null;
}

/** 구버전 상태를 현재 버전으로 올린다. 지금은 v1뿐이다. */
export function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  return raw;
}

export function validateState(input: unknown): ValidationResult {
  if (!isObj(input)) return { ok: false, error: "최상위가 객체가 아님" };
  const raw = migrate(input);
  if (raw.version !== STATE_VERSION) return { ok: false, error: `지원하지 않는 버전 ${String(raw.version)}` };
  if (!Number.isInteger(raw.seed)) return { ok: false, error: "seed가 정수가 아님" };
  const warnings: string[] = [];

  if (raw.search !== undefined) {
    if (!isObj(raw.search) || !isObj(raw.search.params) || !Array.isArray(raw.search.answers))
      return { ok: false, error: "search 형식 오류" };
    if (!isInt(raw.search.params.S, 1, 100)) return { ok: false, error: "search.params.S 범위 밖" };
    for (const a of raw.search.answers) {
      if (!isObj(a) || !isInt(a.value, 1, 100) || !isInt(a.score, 0, 20))
        return { ok: false, error: "search.answers 항목 오류" };
    }
  }
  if (raw.d !== undefined) {
    const d = raw.d;
    if (!isObj(d) || !Array.isArray(d.samples) || d.samples.length === 0) return { ok: false, error: "d.samples 오류" };
    for (const s of d.samples) {
      if (typeof s !== "number" || s < 1 || s > 1000) return { ok: false, error: "d.samples 값이 1~1000cm 밖" };
      if (s < 5 || s > 300) warnings.push(`D 측정값 ${s}cm는 흔치 않은 범위(5~300cm 밖)`);
    }
    if (!isInt(d.G, 1, 100)) return { ok: false, error: "d.G 범위 밖" };
    if (d.angle !== 360 && d.angle !== 180) return { ok: false, error: "d.angle은 360 또는 180" };
    if (!isIso(d.measuredAt)) return { ok: false, error: "d.measuredAt 날짜 아님" };
  }
  if (raw.card !== undefined) {
    const err = checkCard(raw.card, "card");
    if (err) return { ok: false, error: err };
  }
  if (raw.lockedUntil !== undefined && !isIso(raw.lockedUntil)) return { ok: false, error: "lockedUntil 날짜 아님" };
  if (!Array.isArray(raw.history)) return { ok: false, error: "history가 배열이 아님" };
  for (let i = 0; i < raw.history.length; i++) {
    const err = checkCard(raw.history[i], `history[${i}]`);
    if (err) return { ok: false, error: err };
  }
  return { ok: true, state: raw as unknown as SensStateV1, warnings };
}

export function emptyState(seed: number): SensStateV1 {
  return { version: 1, seed, history: [] };
}
