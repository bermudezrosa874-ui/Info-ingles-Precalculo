import { EPS, fmt, linearTex, round, squareTex } from './format';

export interface CircleState {
  h: number;
  k: number;
  r: number;
  /** Angle (rad) of the point P on the curve. */
  theta: number;
}

export const CIRCLE_DEFAULT: CircleState = { h: 2, k: -1, r: 3, theta: Math.PI / 4 };
export const R_MIN = 0.1;
export const R_MAX = 20;

export function isValidRadius(r: number): boolean {
  return Number.isFinite(r) && r > 0 && r <= R_MAX;
}

export function circleInfo(s: CircleState) {
  const { h, k, r } = s;
  return {
    D: -2 * h,
    E: -2 * k,
    F: h * h + k * k - r * r,
    diameter: 2 * r,
    circumference: 2 * Math.PI * r,
    area: Math.PI * r * r,
  };
}

export function standardTex(h: number, k: number, r: number): string {
  return `${squareTex('x', h)} + ${squareTex('y', k)} = ${fmt(r * r, 4)}`;
}

export function generalTex(h: number, k: number, r: number): string {
  const { D, E, F } = circleInfo({ h, k, r, theta: 0 });
  return `${linearTex([[1, 'x^2'], [1, 'y^2'], [D, 'x'], [E, 'y'], [F, '']])} = 0`;
}

export function pointOnCircle(s: CircleState): [number, number] {
  return [s.h + s.r * Math.cos(s.theta), s.k + s.r * Math.sin(s.theta)];
}

export type GeneralCircleResult =
  | { kind: 'circle'; h: number; k: number; r: number; q: number }
  | { kind: 'point'; h: number; k: number }
  | { kind: 'empty'; q: number };

/** Classifies x² + y² + Dx + Ey + F = 0 using q = (D² + E²)/4 − F. */
export function circleFromGeneral(D: number, E: number, F: number): GeneralCircleResult {
  const q = (D * D + E * E) / 4 - F;
  const h = -D / 2;
  const k = -E / 2;
  if (Math.abs(q) < EPS) return { kind: 'point', h, k };
  if (q < 0) return { kind: 'empty', q };
  return { kind: 'circle', h, k, r: Math.sqrt(q), q: round(q, 6) };
}
