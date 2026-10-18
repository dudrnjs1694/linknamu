/**
 * 일반 감도 탐색 — 챔피언–도전자 방식 (기획서 §6-B).
 *
 * 설계: 상태를 직접 들고 다니지 않고, "제출된 점수 목록"을 처음부터 재생해 상태를 만든다.
 * - 폰에 저장할 것은 params + seed + answers 뿐이다.
 * - undo는 answers의 마지막 항목을 빼는 것이다.
 * - 같은 슬라이더 값은 두 번 측정하지 않는다(TEST 재사용 규칙). 그래서 answers는 값→점수 맵으로 충분하다.
 */
import { compareScores, type MaxScore } from "./compare";

export interface SearchParams {
  S: number;
  W0: number;
  W_END: number;
  SHIFT_MAX: number;
  TIE_MAX: number;
  T_MAX: number;
  MAXSCORE: 10 | 20;
  KEEP_ON_TIE: boolean;
  min?: number;
  max?: number;
}

/** 무작위 선택 지점. 테스트에서는 고정 정책을, 실제로는 시드 난수를 주입한다. */
export interface Chooser {
  /** init에서 두 끝값을 어떤 순서로 테스트할지 */
  initOrder(lo: number, hi: number): [number, number];
  /** 두 끝값 점수가 같을 때 어느 쪽을 도전자 x로 쓸지 */
  tieEndpoint(lo: number, hi: number): number;
  /** 챔피언 양쪽 구간 길이가 같을 때 어느 구간의 중점을 쓸지 */
  equalSegment(): "lower" | "upper";
}

export interface Answer {
  value: number;
  score: number;
}

export type LogEntry =
  | { t: "test"; value: number; score: number; reused: boolean }
  | { t: "compare"; champ: number; x: number; verdict: string; rule: string }
  | { t: "shift"; dir: 1 | -1; lo: number; hi: number }
  | { t: "done"; reason: "width" | "tests" | "ties" | "collapsed" };

export interface SearchState {
  lo: number;
  hi: number;
  champ: number;
  shiftDir: -1 | 0 | 1;
  shifts: number;
  tieCount: number;
  tests: number;
  scores: Record<number, number>;
  done: boolean;
  /** done이 아니면 다음에 측정해야 할 슬라이더 값 */
  need: number | null;
  /** done이면 결과(= champ) */
  result: number | null;
  log: LogEntry[];
}

class NeedScore {
  constructor(public value: number) {}
}

const roundHalfUp = (n: number) => Math.floor(n + 0.5);

export function validateParams(p: SearchParams): void {
  if (p.W_END < 2) throw new Error("W_END는 2 이상이어야 한다 (도전자가 끝값과 겹치지 않도록)");
  if (p.W0 < 1) throw new Error("W0는 1 이상이어야 한다");
  if (p.T_MAX < 1) throw new Error("T_MAX는 1 이상이어야 한다");
}

/** 제출된 점수로 탐색을 재생한다. 점수가 부족하면 need에 다음 측정값을 담아 멈춘다. */
export function runSearch(p: SearchParams, answers: Answer[], ch: Chooser): SearchState {
  validateParams(p);
  const min = p.min ?? 1;
  const max = p.max ?? 100;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const given = new Map<number, number>();
  for (const a of answers) {
    if (given.has(a.value)) throw new Error(`같은 값 ${a.value}에 점수가 두 번 제출됨`);
    given.set(a.value, a.score);
  }

  const st: SearchState = {
    lo: 0, hi: 0, champ: p.S, shiftDir: 0, shifts: 0, tieCount: 0, tests: 0,
    scores: {}, done: false, need: null, result: null, log: [],
  };

  const TEST = (value: number): number => {
    if (value in st.scores) {
      st.log.push({ t: "test", value, score: st.scores[value], reused: true });
      return st.scores[value];
    }
    const s = given.get(value);
    if (s === undefined) throw new NeedScore(value);
    st.scores[value] = s;
    st.tests += 1;
    st.log.push({ t: "test", value, score: s, reused: false });
    return s;
  };

  const canShift = (d: 1 | -1): boolean =>
    st.shifts < p.SHIFT_MAX &&
    (st.shiftDir === 0 || st.shiftDir === d) &&
    (d > 0 ? clamp(st.hi + 2 * p.W0) > st.hi : clamp(st.lo - 2 * p.W0) < st.lo);

  const SHIFT = (d: 1 | -1): number => {
    if (d > 0) {
      st.lo = roundHalfUp((st.lo + st.hi) / 2);
      st.hi = clamp(st.hi + 2 * p.W0);
    } else {
      st.hi = roundHalfUp((st.lo + st.hi) / 2);
      st.lo = clamp(st.lo - 2 * p.W0);
    }
    st.shiftDir = d;
    st.shifts += 1;
    st.log.push({ t: "shift", dir: d, lo: st.lo, hi: st.hi });
    const x = d > 0 ? st.hi : st.lo;
    TEST(x);
    return x;
  };

  /** 비교 행 (§6-B). 모든 비교는 champ vs x. SHIFT가 일어나면 새 x로 다시 비교한다. */
  const compare = (x: number): void => {
    for (;;) {
      const cs = st.scores[st.champ];
      const xs = st.scores[x];
      const v = compareScores(xs, cs, p.MAXSCORE as MaxScore);
      const isEnd = (n: number) => n === st.lo || n === st.hi;
      const dirX: 1 | -1 = x > st.champ ? 1 : -1;
      const verdict = v.kind === "tie" ? "tie" : `${v.kind}(${v.winner === "a" ? "x" : "champ"})`;

      if (v.kind === "strong" && v.winner === "a" && isEnd(x) && canShift(dirX)) {
        st.log.push({ t: "compare", champ: st.champ, x, verdict, rule: "R1 strong(x) SHIFT" });
        st.champ = x;
        x = SHIFT(dirX);
        continue;
      }
      if (v.kind !== "tie" && v.winner === "a") {
        st.log.push({ t: "compare", champ: st.champ, x, verdict, rule: "R2 win(x)" });
        if (x > st.champ) st.lo = st.champ;
        else st.hi = st.champ;
        st.champ = x;
        return;
      }
      if (v.kind !== "tie" && v.winner === "b") {
        const champDir: 1 | -1 = st.champ === st.hi ? 1 : -1;
        const expand = isEnd(st.champ) && !isEnd(x) && canShift(champDir);
        st.log.push({ t: "compare", champ: st.champ, x, verdict, rule: expand ? "R3 확장" : "R4 win(champ)" });
        if (x > st.champ) st.hi = x;
        else st.lo = x;
        if (expand) {
          x = SHIFT(champDir);
          continue;
        }
        return;
      }
      // tie
      st.log.push({ t: "compare", champ: st.champ, x, verdict, rule: "R5 tie" });
      st.lo = Math.min(st.champ, x);
      st.hi = Math.max(st.champ, x);
      if (!p.KEEP_ON_TIE && xs > cs) st.champ = x;
      st.tieCount += 1;
      return;
    }
  };

  try {
    // init
    st.lo = clamp(p.S - p.W0);
    st.hi = clamp(p.S + p.W0);
    st.champ = p.S;
    TEST(p.S);
    if (st.lo === st.hi) {
      st.done = true;
      st.log.push({ t: "done", reason: "collapsed" });
    } else {
      const [a, b] = ch.initOrder(st.lo, st.hi);
      TEST(a);
      TEST(b);
      const sl = st.scores[st.lo];
      const sh = st.scores[st.hi];
      const x = sl === sh ? ch.tieEndpoint(st.lo, st.hi) : sl > sh ? st.lo : st.hi;
      compare(x);
    }

    // 탐색 회차
    while (!st.done) {
      const w = st.hi - st.lo;
      if (w <= p.W_END || st.tests >= p.T_MAX || st.tieCount >= p.TIE_MAX) {
        st.done = true;
        st.log.push({
          t: "done",
          reason: w <= p.W_END ? "width" : st.tests >= p.T_MAX ? "tests" : "ties",
        });
        break;
      }
      const left = st.champ - st.lo;
      const right = st.hi - st.champ;
      const useUpper = right > left || (right === left && ch.equalSegment() === "upper");
      const x = useUpper ? roundHalfUp((st.champ + st.hi) / 2) : roundHalfUp((st.lo + st.champ) / 2);
      TEST(x);
      compare(x);
    }
    st.result = st.champ;
  } catch (e) {
    if (e instanceof NeedScore) {
      st.need = e.value;
      return st;
    }
    throw e;
  }
  return st;
}

/** 기획서 §6-B vitest 예시가 쓰는 고정 정책: lo 먼저, 동점 끝값은 hi, 구간 길이 동률은 상위. */
export const fixedChooser: Chooser = {
  initOrder: (lo, hi) => [lo, hi],
  tieEndpoint: (_lo, hi) => hi,
  equalSegment: () => "upper",
};

/** 시드 난수 선택기 (mulberry32). 시드를 상태에 저장하면 재생·undo 시 같은 순서가 나온다. */
export function seededChooser(seed: number): Chooser {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // 재생 시 호출 순서가 같으므로 같은 결과가 나온다.
  return {
    initOrder: (lo, hi) => (rand() < 0.5 ? [lo, hi] : [hi, lo]),
    tieEndpoint: (lo, hi) => (rand() < 0.5 ? lo : hi),
    equalSegment: () => (rand() < 0.5 ? "lower" : "upper"),
  };
}

/** 모드별 파라미터 (§6-G). */
export function quickParams(S: number): SearchParams {
  return { S, W0: 10, W_END: 4, SHIFT_MAX: 2, TIE_MAX: 3, T_MAX: 6, MAXSCORE: 10, KEEP_ON_TIE: false };
}
export function fullParams(S: number): SearchParams {
  return { S, W0: 10, W_END: 4, SHIFT_MAX: 2, TIE_MAX: 3, T_MAX: 12, MAXSCORE: 20, KEEP_ON_TIE: false };
}
export function reevalParams(G: number): SearchParams {
  return { S: G, W0: 5, W_END: 4, SHIFT_MAX: 0, TIE_MAX: 3, T_MAX: 4, MAXSCORE: 20, KEEP_ON_TIE: true };
}
