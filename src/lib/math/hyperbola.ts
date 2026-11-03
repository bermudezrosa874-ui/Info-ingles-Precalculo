import { fmt, squareTex } from './format';
import type { Orientation } from './ellipse';

export interface HyperbolaState {
  h: number;
  k: number;
  /** Semi-transverse axis (distance center → vertex). */
  a: number;
  /** Semi-conjugate axis. */
  b: number;
  orient: Orientation;
  /** Hyperbolic parameter of P along its branch. */
  u: number;
  /** Branch of P: +1 (right/upper) or −1 (left/lower). */
  s: 1 | -1;
}

export const HYPERBOLA_DEFAULT: HyperbolaState = { h: 0, k: 0, a: 3, b: 2, orient: 'h', u: 0.9, s: 1 };

export function hyperbolaInfo(st: HyperbolaState) {
  const { h, k, a, b, orient } = st;
  const c = Math.sqrt(a * a + b * b);
  const horizontal = orient === 'h';
  const vertices: Array<[number, number]> = horizontal ? [[h - a, k], [h + a, k]] : [[h, k - a], [h, k + a]];
  const foci: Array<[number, number]> = horizontal ? [[h - c, k], [h + c, k]] : [[h, k - c], [h, k + c]];
  /** Slope magnitude of the asymptotes y − k = ±m (x − h). */
  const slope = horizontal ? b / a : a / b;
  /** Corners of the auxiliary rectangle. */
  const rect: Array<[number, number]> = horizontal
    ? [[h - a, k - b], [h + a, k - b], [h + a, k + b], [h - a, k + b]]
    : [[h - b, k - a], [h + b, k - a], [h + b, k + a], [h - b, k + a]];
  return { c, e: c / a, vertices, foci, slope, rect };
}

/** Point on a branch: s selects the branch, u moves along it. */
export function hyperbolaPoint(st: HyperbolaState, u = st.u, s: 1 | -1 = st.s): [number, number] {
  const along = s * st.a * Math.cosh(u);
  const across = st.b * Math.sinh(u);
  return st.orient === 'h' ? [st.h + along, st.k + across] : [st.h + across, st.k + along];
}

/** Recovers (u, s) from a (possibly off-curve) point; keeps `prevS` when ambiguous. */
export function hyperbolaParamFromPoint(st: HyperbolaState, x: number, y: number, prevS: 1 | -1): { u: number; s: 1 | -1 } {
  const along = st.orient === 'h' ? x - st.h : y - st.k;
  const across = st.orient === 'h' ? y - st.k : x - st.h;
  const s: 1 | -1 = Math.abs(along) < 1e-9 ? prevS : along > 0 ? 1 : -1;
  return { u: Math.asinh(across / st.b), s };
}

export function hyperbolaTex(st: HyperbolaState): string {
  const A = fmt(st.a * st.a, 4);
  const B = fmt(st.b * st.b, 4);
  const X = squareTex('x', st.h);
  const Y = squareTex('y', st.k);
  return st.orient === 'h'
    ? `\\frac{${X}}{${A}} - \\frac{${Y}}{${B}} = 1`
    : `\\frac{${Y}}{${A}} - \\frac{${X}}{${B}} = 1`;
}

/** Asymptote equations as LaTeX: y − k = ±(m)(x − h). */
export function asymptotesTex(st: HyperbolaState): string {
  const num = st.orient === 'h' ? st.b : st.a;
  const den = st.orient === 'h' ? st.a : st.b;
  const yk = st.k === 0 ? 'y' : st.k > 0 ? `y - ${fmt(st.k)}` : `y + ${fmt(-st.k)}`;
  const xh = st.h === 0 ? 'x' : st.h > 0 ? `(x - ${fmt(st.h)})` : `(x + ${fmt(-st.h)})`;
  return `${yk} = \\pm \\frac{${fmt(num, 3)}}{${fmt(den, 3)}}${xh}`;
}
