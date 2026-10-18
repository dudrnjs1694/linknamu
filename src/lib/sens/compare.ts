/** 지표와 비교 규칙 (기획서 §6-C M-3). */

export type MaxScore = 10 | 20 | 40;

/** tie: 차 ≤ tieMax, strong: 차 ≥ strongMin, 그 사이는 win. 40점은 확인 라운드용(20점 표 × 2). */
export const THRESHOLDS: Record<MaxScore, { tieMax: number; strongMin: number }> = {
  10: { tieMax: 1, strongMin: 5 },
  20: { tieMax: 2, strongMin: 7 },
  40: { tieMax: 4, strongMin: 14 },
};

export type Verdict =
  | { kind: "tie" }
  | { kind: "win" | "strong"; winner: "a" | "b" };

/** a와 b의 점수를 비교한다. */
export function compareScores(a: number, b: number, max: MaxScore): Verdict {
  const t = THRESHOLDS[max];
  const diff = Math.abs(a - b);
  if (diff <= t.tieMax) return { kind: "tie" };
  return { kind: diff >= t.strongMin ? "strong" : "win", winner: a > b ? "a" : "b" };
}

/**
 * 2지표 합성 (P1). 같은 방향은 강한 쪽을 따르되 strong+win → strong,
 * tie+win/strong → win, 방향 반대 → tie.
 */
export function combineVerdicts(p: Verdict, q: Verdict): Verdict {
  if (p.kind === "tie" && q.kind === "tie") return { kind: "tie" };
  if (p.kind === "tie" || q.kind === "tie") {
    const one = (p.kind === "tie" ? q : p) as Exclude<Verdict, { kind: "tie" }>;
    return { kind: "win", winner: one.winner };
  }
  if (p.winner !== q.winner) return { kind: "tie" };
  const strong = p.kind === "strong" || q.kind === "strong";
  return { kind: strong ? "strong" : "win", winner: p.winner };
}
