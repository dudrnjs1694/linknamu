import { describe, expect, it } from "vitest";
import { combineVerdicts, compareScores } from "../compare";
import { cm360At, deltaSlider, meanAndSd, ratio, sessionLapCheck, todayDeltaByDistance, todayDeltaByDpi } from "../math";
import { interpolateScopes } from "../interp";
import { applyScopeMode, keepOffsets } from "../presets";
import { emptyState, validateState } from "../schema";
import { daysUntilUnlock, exportState, importState } from "../storage";

describe("compare (§6-C M-3)", () => {
  it("10점 경계", () => {
    expect(compareScores(7, 6, 10).kind).toBe("tie");
    expect(compareScores(8, 6, 10)).toEqual({ kind: "win", winner: "a" });
    expect(compareScores(6, 10, 10)).toEqual({ kind: "win", winner: "b" });
    expect(compareScores(9, 4, 10)).toEqual({ kind: "strong", winner: "a" });
  });
  it("20점 경계", () => {
    expect(compareScores(12, 10, 20).kind).toBe("tie");
    expect(compareScores(13, 10, 20).kind).toBe("win");
    expect(compareScores(16, 10, 20).kind).toBe("win");
    expect(compareScores(17, 10, 20).kind).toBe("strong");
  });
  it("2지표 합성", () => {
    const t = { kind: "tie" } as const;
    const wa = { kind: "win", winner: "a" } as const;
    const sa = { kind: "strong", winner: "a" } as const;
    const wb = { kind: "win", winner: "b" } as const;
    expect(combineVerdicts(t, t)).toEqual(t);
    expect(combineVerdicts(t, sa)).toEqual(wa);
    expect(combineVerdicts(wa, sa)).toEqual(sa);
    expect(combineVerdicts(wa, wb)).toEqual(t);
  });
});

describe("math (§6-D)", () => {
  it("ratio/delta 왕복", () => {
    expect(ratio(50)).toBeCloseTo(10);
    expect(deltaSlider(ratio(7))).toBeCloseTo(7);
  });
  it("D-3 방향: 감도 ↑ → cm/360 ↓", () => {
    expect(cm360At(60, 40, 50)).toBeLessThan(40);
    expect(cm360At(50, 40, 50)).toBeCloseTo(40);
  });
  it("D-2 방향", () => {
    expect(todayDeltaByDistance(40, 44)).toBeGreaterThan(0); // 덜 돌았다 → 올림
    expect(todayDeltaByDpi(1000)).toBeCloseTo(-4.85, 1); // DPI ↑ → 내림
    expect(todayDeltaByDpi(1600)).toBeCloseTo(-15.05, 1);
  });
  it("0-B 판정: 2회 규칙", () => {
    expect(sessionLapCheck(40, 41)).toBe("pass");
    expect(sessionLapCheck(40, 50)).toBe("need-second");
    expect(sessionLapCheck(40, 50, 41)).toBe("pass");
    expect(sessionLapCheck(40, 50, 49)).toBe("fail");
    // DPI 1000이면 같은 감도에서 거리가 800/1000배 → Δ4.85 → 실패
    expect(sessionLapCheck(40, 32, 32)).toBe("fail");
  });
  it("평균·편차", () => {
    const r = meanAndSd([40, 42, 44]);
    expect(r.mean).toBe(42);
    expect(r.sd).toBeCloseTo(2);
  });
});

describe("presets / interp (§6-E, §6-F)", () => {
  it("통일과 프리셋 A", () => {
    expect(applyScopeMode(50, "unified").x8).toBe(50);
    const a = applyScopeMode(50, "presetA");
    expect([a.targeting, a.scoping, a.x2, a.x3, a.x15]).toEqual([49, 49, 48, 46, 46]);
    expect(applyScopeMode(2, "presetA").x4).toBe(1);
  });
  it("보간: 조준경·4x·8x 테스트 → 나머지 채움, 15x = 8x", () => {
    const r = interpolateScopes({ scoping: 50, x4: 44, x8: 40 });
    expect(r.x2).toBe(47); // log 축 중간
    expect(r.x15).toBe(r.x8);
    expect(r.x6).toBeGreaterThanOrEqual(40);
    expect(r.x6).toBeLessThanOrEqual(44);
  });
  it("내 배율 간격 유지 (Phase 0 실측 본인 감도)", () => {
    const mine = { targeting: 30, scoping: 30, x2: 28, x3: 25, x4: 23, x6: 20, x8: 18, x15: 15 };
    const r = keepOffsets(30, mine, 34);
    expect([r.scoping, r.x2, r.x4, r.x15]).toEqual([34, 32, 27, 19]);
  });
  it("보간: 한 점만 있으면 전부 그 값", () => {
    const r = interpolateScopes({ x4: 45 });
    expect(Object.values(r).every((x) => x === 45)).toBe(true);
  });
});

describe("schema / storage (§7)", () => {
  const card = {
    general: 50, vertical: 1, unified: true, view: "tpp" as const,
    scopes: { targeting: 50, scoping: 50, x2: 50, x3: 50, x4: 50, x6: 50, x8: 50, x15: 50 },
    createdAt: "2026-10-18T00:00:00.000Z",
  };
  it("왕복", () => {
    const st = { ...emptyState(7), card, history: [card] };
    const r = importState(exportState(st));
    expect(r.ok).toBe(true);
  });
  it("범위 밖 거부, 흔치 않은 D는 경고", () => {
    expect(validateState({ ...emptyState(1), card: { ...card, general: 101 } }).ok).toBe(false);
    expect(validateState({ ...emptyState(1), card: { ...card, vertical: 2.01 } }).ok).toBe(false);
    expect(validateState({ ...emptyState(1), card: { ...card, vertical: 1.15 } }).ok).toBe(true);
    const r = validateState({
      ...emptyState(1),
      d: { samples: [350], G: 50, view: "tpp", angle: 360, measuredAt: "2026-10-18T00:00:00Z" },
    });
    expect(r.ok && r.warnings.length).toBe(1);
    expect(importState("not json").ok).toBe(false);
  });
  it("잠금 남은 일수", () => {
    const now = new Date("2026-10-18T00:00:00Z");
    expect(daysUntilUnlock("2026-10-25T00:00:00Z", now)).toBe(7);
    expect(daysUntilUnlock("2026-10-17T00:00:00Z", now)).toBe(0);
    expect(daysUntilUnlock(undefined, now)).toBe(0);
  });
});
