import { EPS, fmt, squareTex } from './format';

export type Orientation = 'h' | 'v';

export interface EllipseState {
  h: number;
  k: number;
  /** Semi-major axis (a >= b). */
  a: number;
  /** Semi-minor axis. */
  b: number;
  orient: Orientation;
  /** Parameter of the moving point P on the curve (rad). */
  t: number;
}

export const ELLIPSE_DEFAULT: EllipseState = { h: 1, k: -2, a: 5, b: 3, orient: 'h', t: Math.PI / 3 };
export const AXIS_MIN = 0.5;
export const AXIS_MAX = 12;

export function ellipseInfo(s: EllipseState) {
  const { h, k, a, b, orient } = s;
  const c = Math.sqrt(Math.max(0, a * a - b * b));
  const horizontal = orient === 'h';
  const e = c / a;
  const isCircle = Math.abs(a - b) < EPS;
  const vertices: Array<[number, number]> = horizontal ? [[h - a, k], [h + a, k]] : [[h, k - a], [h, k + a]];
  const covertices: Array<[number, number]> = horizontal ? [[h, k - b], [h, k + b]] : [[h - b, k], [h + b, k]];
  const foci: Array<[number, number]> = horizontal ? [[h - c, k], [h + c, k]] : [[h, k - c], [h, k + c]];
  return { c, e, isCircle, vertices, covertices, foci, majorLength: 2 * a, minorLength: 2 * b };
}

export function ellipsePoint(s: EllipseState, t = s.t): [number, number] {
  return s.orient === 'h'
    ? [s.h + s.a * Math.cos(t), s.k + s.b * Math.sin(t)]
    : [s.h + s.b * Math.cos(t), s.k + s.a * Math.sin(t)];
}

/** Recovers the parameter t from a (possibly off-curve) point. */
export function ellipseParamFromPoint(s: EllipseState, x: number, y: number): number {
  const u = s.orient === 'h' ? (x - s.h) / s.a : (x - s.h) / s.b;
  const v = s.orient === 'h' ? (y - s.k) / s.b : (y - s.k) / s.a;
  return Math.atan2(v, u);
}

export function dist(p: [number, number], q: [number, number]): number {
  return Math.hypot(p[0] - q[0], p[1] - q[1]);
}

export function ellipseTex(s: EllipseState): string {
  const A = fmt(s.a * s.a, 4);
  const B = fmt(s.b * s.b, 4);
  const X = squareTex('x', s.h);
  const Y = squareTex('y', s.k);
  return s.orient === 'h'
    ? `\\frac{${X}}{${A}} + \\frac{${Y}}{${B}} = 1`
    : `\\frac{${X}}{${B}} + \\frac{${Y}}{${A}} = 1`;
}

/** Enforces a >= b; reports whether the other parameter had to be adjusted. */
export function normalizeAxes(a: number, b: number, changed: 'a' | 'b'): { a: number; b: number; adjusted: boolean } {
  if (a >= b) return { a, b, adjusted: false };
  return changed === 'a' ? { a: b, b, adjusted: true } : { a, b: a, adjusted: true };
}
