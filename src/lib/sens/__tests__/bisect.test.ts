import { describe, expect, it } from "vitest";
import {
  fixedChooser,
  quickParams,
  reevalParams,
  runSearch,
  seededChooser,
  type Answer,
  type SearchParams,
} from "../bisect";

const base: Omit<SearchParams, "S" | "T_MAX"> = {
  W0: 10, W_END: 4, SHIFT_MAX: 2, TIE_MAX: 3, MAXSCORE: 10, KEEP_ON_TIE: false,
};
const ans = (o: Record<number, number>): Answer[] =>
  Object.entries(o).map(([value, score]) => ({ value: Number(value), score }));

/** 기획서 §6-B vitest 예시 6건 */
describe("§6-B 예시", () => {
  it("1. 기본 수렴 (확장 SHIFT 후 T_MAX 종료)", () => {
    const st = runSearch({ ...base, S: 50, T_MAX: 6 }, ans({ 50: 7, 40: 5, 60: 8, 55: 6, 80: 4, 70: 6 }), fixedChooser);
    expect(st.done).toBe(true);
    expect(st.result).toBe(60);
    expect(st.tests).toBe(6);
    expect([st.lo, st.hi]).toEqual([58, 70]);
    expect(st.shifts).toBe(1);
  });

  it("2. 확장 → 동률 챔피언 교체 → 반대 이동 금지", () => {
    const st = runSearch(
      { ...base, S: 50, T_MAX: 12 },
      ans({ 50: 4, 40: 3, 60: 8, 55: 6, 80: 9, 70: 10, 75: 7, 73: 8 }),
      fixedChooser,
    );
    expect(st.result).toBe(70);
    expect(st.tests).toBe(8);
    expect([st.lo, st.hi]).toEqual([70, 73]);
    expect(st.shiftDir).toBe(1);
  });

  it("3. init 강승 SHIFT + 확장 SHIFT = 2회", () => {
    const st = runSearch(
      { ...base, S: 50, T_MAX: 12 },
      ans({ 50: 2, 40: 1, 60: 8, 80: 10, 70: 6, 100: 5, 90: 7, 85: 8, 83: 9 }),
      fixedChooser,
    );
    expect(st.result).toBe(80);
    expect(st.tests).toBe(9);
    expect(st.shifts).toBe(2);
    expect([st.lo, st.hi]).toEqual([80, 83]);
  });

  it("4. 클램프 = 이동 불가", () => {
    const st = runSearch({ ...base, S: 95, T_MAX: 6 }, ans({ 95: 3, 85: 1, 100: 9, 98: 9 }), fixedChooser);
    expect(st.result).toBe(100);
    expect(st.tests).toBe(4);
    expect(st.shifts).toBe(0);
    expect([st.lo, st.hi]).toEqual([98, 100]);
  });

  it("5. S 유지, 하향 확장, 점수 재사용", () => {
    const st = runSearch(
      { ...base, S: 50, T_MAX: 6 },
      ans({ 50: 7, 40: 6, 60: 6, 55: 5, 30: 3, 45: 6 }),
      fixedChooser,
    );
    expect(st.result).toBe(50);
    expect(st.tests).toBe(6);
    expect(st.tieCount).toBe(3);
    expect([st.lo, st.hi]).toEqual([45, 50]);
    expect(st.log.some((l) => l.t === "test" && l.value === 40 && l.reused)).toBe(true);
  });

  it("6. 재평가: 동률이면 G 유지", () => {
    const st = runSearch(
      { ...reevalParams(50), MAXSCORE: 10 },
      ans({ 50: 7, 45: 6, 55: 8, 53: 7 }),
      fixedChooser,
    );
    expect(st.result).toBe(50);
    expect(st.tests).toBe(4);
    expect([st.lo, st.hi]).toEqual([50, 53]);
  });
});

describe("재생·대기·undo", () => {
  it("점수가 없으면 다음 측정값을 need로 알려준다", () => {
    const p = { ...base, S: 50, T_MAX: 6 };
    expect(runSearch(p, [], fixedChooser).need).toBe(50);
    expect(runSearch(p, ans({ 50: 7 }), fixedChooser).need).toBe(40);
    expect(runSearch(p, ans({ 50: 7, 40: 5 }), fixedChooser).need).toBe(60);
    expect(runSearch(p, ans({ 50: 7, 40: 5, 60: 8 }), fixedChooser).need).toBe(55);
  });

  it("undo = 마지막 답 제거 후 재생", () => {
    const p = { ...base, S: 50, T_MAX: 6 };
    // 제출 순서가 중요하므로 배열로 명시 (객체 숫자 키는 오름차순 정렬됨)
    const full: Answer[] = [[50, 7], [40, 5], [60, 8], [55, 6], [80, 4], [70, 6]].map(([value, score]) => ({ value, score }));
    const undone = runSearch(p, full.slice(0, -1), fixedChooser);
    expect(undone.done).toBe(false);
    expect(undone.need).toBe(70);
  });

  it("같은 값에 점수 두 번 제출은 거부", () => {
    expect(() =>
      runSearch({ ...base, S: 50, T_MAX: 6 }, [{ value: 50, score: 1 }, { value: 50, score: 2 }], fixedChooser),
    ).toThrow();
  });

  it("W_END < 2 는 거부", () => {
    expect(() => runSearch({ ...base, S: 50, T_MAX: 6, W_END: 1 }, [], fixedChooser)).toThrow();
  });

  it("시드 선택기는 같은 시드에서 같은 순서를 낸다", () => {
    const p = quickParams(50);
    const a = runSearch(p, ans({ 50: 5 }), seededChooser(42)).need;
    const b = runSearch(p, ans({ 50: 5 }), seededChooser(42)).need;
    expect(a).toBe(b);
  });
});

/** 무작위 점수로 끝까지 돌리는 퍼즈. 불변식과 테스트 수 상한(T_MAX + SHIFT_MAX)을 확인. */
describe("퍼즈", () => {
  let s = 12345;
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 2 ** 32);
  const ri = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));

  it("불변식·종료·상한", () => {
    for (let run = 0; run < 3000; run++) {
      const MAXSCORE = rnd() < 0.5 ? 10 : 20;
      const p: SearchParams = {
        S: ri(1, 100), W0: ri(1, 30), W_END: ri(2, 10), SHIFT_MAX: ri(0, 3),
        TIE_MAX: ri(1, 5), T_MAX: ri(1, 15), MAXSCORE, KEEP_ON_TIE: rnd() < 0.3,
      };
      const answers: Answer[] = [];
      let st = runSearch(p, answers, seededChooser(run));
      let guard = 0;
      while (!st.done) {
        expect(st.need).not.toBeNull();
        answers.push({ value: st.need as number, score: ri(0, MAXSCORE) });
        st = runSearch(p, answers, seededChooser(run));
        if (++guard > 40) throw new Error("종료하지 않음");
      }
      expect(st.lo).toBeLessThanOrEqual(st.hi);
      expect(st.champ).toBeGreaterThanOrEqual(st.lo);
      expect(st.champ).toBeLessThanOrEqual(st.hi);
      expect(st.lo).toBeGreaterThanOrEqual(1);
      expect(st.hi).toBeLessThanOrEqual(100);
      expect(st.result).toBe(st.champ);
      expect(st.scores[st.champ]).toBeDefined();
      expect(st.tests).toBeLessThanOrEqual(Math.max(3, p.T_MAX) + p.SHIFT_MAX);
    }
  });
});
