/** Number and LaTeX formatting helpers. Internal values keep full precision; only displayed values are rounded. */

export const EPS = 1e-9;

/** Round to `d` decimals, turning -0 into 0. */
export function round(n: number, d = 2): number {
  const f = 10 ** d;
  const r = Math.round((n + Number.EPSILON * Math.sign(n)) * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

/** Trimmed decimal string (never NaN / Infinity). */
export function fmt(n: number, d = 2): string {
  if (!Number.isFinite(n)) return '—';
  return String(round(n, d));
}

/** True when rounding to `d` decimals changes the value noticeably. */
export function isApprox(n: number, d = 2): boolean {
  return Number.isFinite(n) && Math.abs(round(n, d) - n) > 1e-9;
}

/** "≈ " prefix when the shown value is a rounded one. */
export function approxFmt(n: number, d = 2): string {
  return (isApprox(n, d) ? '≈ ' : '') + fmt(n, d);
}

/** LaTeX for a signed constant appended after a term: " + 3" / " - 3". */
export function addConst(c: number, d = 2): string {
  const r = round(c, d);
  if (r === 0) return '';
  return r > 0 ? ` + ${fmt(r, d)}` : ` - ${fmt(-r, d)}`;
}

/** LaTeX for `(v - c)` using the sign of c (v alone when c = 0). */
export function shiftTex(v: string, c: number, d = 2): string {
  const r = round(c, d);
  if (r === 0) return v;
  return r > 0 ? `(${v} - ${fmt(r, d)})` : `(${v} + ${fmt(-r, d)})`;
}

/** LaTeX for `(v - c)^2`, simplified to `v^2` when c = 0. */
export function squareTex(v: string, c: number, d = 2): string {
  const r = round(c, d);
  return r === 0 ? `${v}^2` : `${shiftTex(v, r, d)}^2`;
}

/** Polynomial like "A x + B y + C" with clean signs. Terms are [coefficient, symbol]. */
export function linearTex(terms: Array<[number, string]>, d = 2): string {
  let out = '';
  for (const [coef, sym] of terms) {
    const r = round(coef, d);
    if (r === 0) continue;
    const abs = Math.abs(r);
    const body = sym === '' ? fmt(abs, d) : abs === 1 ? sym : `${fmt(abs, d)}${sym}`;
    if (out === '') out = (r < 0 ? '-' : '') + body;
    else out += (r < 0 ? ' - ' : ' + ') + body;
  }
  return out === '' ? '0' : out;
}

/** Point as LaTeX "(x, y)". */
export function pointTex(x: number, y: number, d = 2): string {
  return `(${fmt(x, d)},\\ ${fmt(y, d)})`;
}

/** Clamp helper that never returns NaN. */
export function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, v));
}
