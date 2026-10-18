/**
 * 폰 localStorage 저장 (기획서 §7). 단일 키 sens:state.
 * iOS Safari는 7일간 사이트 상호작용이 없으면 스토리지를 지울 수 있으므로
 * JSON 내보내기/붙여넣기 복구가 필수다(홈 화면 앱은 예외).
 */
import { emptyState, validateState, type SensStateV1 } from "./schema";

export const STORAGE_KEY = "sens:state";

export function loadState(storage: Pick<Storage, "getItem"> | undefined): SensStateV1 | null {
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const r = validateState(JSON.parse(raw));
    return r.ok ? r.state : null;
  } catch {
    return null;
  }
}

export function saveState(storage: Pick<Storage, "setItem"> | undefined, state: SensStateV1): void {
  storage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const exportState = (state: SensStateV1): string => JSON.stringify(state, null, 2);

export function importState(text: string): ReturnType<typeof validateState> {
  try {
    return validateState(JSON.parse(text));
  } catch {
    return { ok: false, error: "JSON 형식이 아님" };
  }
}

export const newSeed = (): number => Math.floor(Math.random() * 2 ** 31);
export const freshState = (): SensStateV1 => emptyState(newSeed());

/** 잠금 해제까지 남은 일수(0이면 재평가 가능) */
export function daysUntilUnlock(lockedUntil: string | undefined, now = new Date()): number {
  if (!lockedUntil) return 0;
  const ms = Date.parse(lockedUntil) - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}
