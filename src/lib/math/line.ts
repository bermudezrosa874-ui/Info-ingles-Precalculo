import { EPS, addConst, fmt, linearTex, round } from './format';

export interface LineState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LineInfo {
  /** Both defining points coincide: no unique line. */
  degenerate: boolean;
  vertical: boolean;
  horizontal: boolean;
  /** Slope; null for vertical or degenerate lines. */
  m: number | null;
  /** y-intercept; null when the line has none (vertical) or is degenerate. */
  b: number | null;
  /** General form coefficients Ax + By + C = 0. */
  A: number;
  B: number;
  C: number;
  /** x-intercept; null when none exists (horizontal) or degenerate. */
  xIntercept: number | null;
  yIntercept: number | null;
}

export const LINE_DEFAULT: LineState = { x1: 0, y1: 1, x2: 1, y2: 3 };
export const LINE_RANGE = { mMin: -5, mMax: 5, bMin: -10, bMax: 10 };

export function analyzeLine(s: LineState): LineInfo {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const degenerate = Math.abs(dx) < EPS && Math.abs(dy) < EPS;
  const vertical = !degenerate && Math.abs(dx) < EPS;
  const horizontal = !degenerate && Math.abs(dy) < EPS;
  const A = dy;
  const B = -dx;
  const C = dx * s.y1 - dy * s.x1;
  if (degenerate) {
    return { degenerate, vertical: false, horizontal: false, m: null, b: null, A: 0, B: 0, C: 0, xIntercept: null, yIntercept: null };
  }
  if (vertical) {
    return { degenerate, vertical, horizontal: false, m: null, b: null, A, B, C, xIntercept: s.x1, yIntercept: null };
  }
  const m = dy / dx;
  const b = s.y1 - m * s.x1;
  const xIntercept = Math.abs(m) < EPS ? null : -b / m;
  return { degenerate, vertical, horizontal, m, b, A, B, C, xIntercept, yIntercept: b };
}

/** New state with slope m and y-intercept b, keeping the x positions of the two points. */
export function lineFromSlopeIntercept(s: LineState, m: number, b: number): LineState {
  const x1 = s.x1;
  let x2 = s.x2;
  if (Math.abs(x2 - x1) < EPS) x2 = x1 + 1; // leaving the vertical case
  return { x1, y1: m * x1 + b, x2, y2: m * x2 + b };
}

/** LaTeX of the slope-intercept (or vertical) equation. */
export function slopeInterceptTex(i: LineInfo, xVertical: number): string {
  if (i.degenerate) return '';
  if (i.vertical) return `x = ${fmt(xVertical)}`;
  const m = round(i.m ?? 0);
  const b = i.b ?? 0;
  let mx = '';
  if (m === 1) mx = 'x';
  else if (m === -1) mx = '-x';
  else if (m !== 0) mx = `${fmt(m)}x`;
  if (mx === '') return `y = ${fmt(b)}`;
  return `y = ${mx}${addConst(b)}`;
}

export function generalFormTex(i: LineInfo): string {
  if (i.degenerate) return '';
  return `${linearTex([[i.A, 'x'], [i.B, 'y'], [i.C, '']])} = 0`;
}

/** Slope between two points, or null when x2 = x1 (never divides by zero). */
export function slopeBetween(x1: number, y1: number, x2: number, y2: number): number | null {
  if (Math.abs(x2 - x1) < EPS) return null;
  return (y2 - y1) / (x2 - x1);
}
