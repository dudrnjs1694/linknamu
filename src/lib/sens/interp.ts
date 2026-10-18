/** 배율 보간 (기획서 §6-F). 축 log10(배율), 조준경 = 1x. 15x = 8x와 같은 슬라이더 값. */
import { ZOOM, type ScopeKey } from "./presets";

type ZoomKey = Exclude<ScopeKey, "targeting">;
const ORDER: ZoomKey[] = ["scoping", "x2", "x3", "x4", "x6", "x8", "x15"];

/**
 * tested: 실제로 테스트한 배율 값(최소 1개). 반환: 7개 배율 전체.
 * 테스트한 점 사이는 선형 보간 후 반올림, 바깥은 가장 가까운 테스트 점 값.
 */
export function interpolateScopes(tested: Partial<Record<ZoomKey, number>>): Record<ZoomKey, number> {
  const pts = ORDER.filter((k) => k !== "x15" && tested[k] !== undefined).map((k) => ({
    k,
    x: Math.log10(ZOOM[k]),
    y: tested[k] as number,
  }));
  if (pts.length === 0) throw new Error("테스트한 배율이 하나도 없다");
  const out = {} as Record<ZoomKey, number>;
  for (const k of ORDER) {
    if (k === "x15") continue;
    if (tested[k] !== undefined) {
      out[k] = tested[k] as number;
      continue;
    }
    const x = Math.log10(ZOOM[k]);
    const left = [...pts].reverse().find((p) => p.x <= x);
    const right = pts.find((p) => p.x >= x);
    if (!left) out[k] = right!.y;
    else if (!right) out[k] = left.y;
    else out[k] = Math.floor(left.y + ((right.y - left.y) * (x - left.x)) / (right.x - left.x) + 0.5);
  }
  out.x15 = out.x8;
  return out;
}
