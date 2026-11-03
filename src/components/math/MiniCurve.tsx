import { useMemo } from 'react';

export type CurveSpec =
  | { type: 'line'; m: number; b: number }
  | { type: 'circle'; r: number }
  | { type: 'ellipse'; a: number; b: number; orient: 'h' | 'v' }
  | { type: 'hyperbola'; a: number; b: number; orient: 'h' | 'v' };

const R = 6; // half-window in math units
const toSvg = (x: number, y: number): [number, number] => [100 + x * (100 / R) * 0.9, 100 - y * (100 / R) * 0.9];

function path(points: Array<[number, number]>): string {
  let d = '';
  let pen = false;
  for (const [x, y] of points) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > R * 1.05 || Math.abs(y) > R * 1.05) {
      pen = false;
      continue;
    }
    const [sx, sy] = toSvg(x, y);
    d += `${pen ? 'L' : 'M'}${sx.toFixed(1)} ${sy.toFixed(1)} `;
    pen = true;
  }
  return d.trim();
}

function paths(spec: CurveSpec): string[] {
  const N = 240;
  if (spec.type === 'line') {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const x = -R + (2 * R * i) / N;
      pts.push([x, spec.m * x + spec.b]);
    }
    return [path(pts)];
  }
  if (spec.type === 'circle') {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const t = (2 * Math.PI * i) / N;
      pts.push([spec.r * Math.cos(t), spec.r * Math.sin(t)]);
    }
    return [path(pts)];
  }
  if (spec.type === 'ellipse') {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const t = (2 * Math.PI * i) / N;
      const [rx, ry] = spec.orient === 'h' ? [spec.a, spec.b] : [spec.b, spec.a];
      pts.push([rx * Math.cos(t), ry * Math.sin(t)]);
    }
    return [path(pts)];
  }
  const out: string[] = [];
  for (const s of [1, -1]) {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const u = -3 + (6 * i) / N;
      const along = s * spec.a * Math.cosh(u);
      const across = spec.b * Math.sinh(u);
      pts.push(spec.orient === 'h' ? [along, across] : [across, along]);
    }
    out.push(path(pts));
  }
  return out;
}

/** Static SVG sketch of a curve computed from its equation (used in the comparison table and graph questions). */
export function MiniCurve({ spec, color, label }: { spec: CurveSpec; color: string; label: string }) {
  const ds = useMemo(() => paths(spec), [spec]);
  return (
    <svg className="mini-curve" viewBox="0 0 200 200" role="img" aria-label={label}>
      <rect x="0" y="0" width="200" height="200" fill="#FFFFFF" />
      <path d="M10 100H190M100 10V190" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <path d="M185 96l5 4-5 4M96 15l4-5 4 5" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <text x="188" y="116" fontSize="11" fill="#475569">x</text>
      <text x="108" y="18" fontSize="11" fill="#475569">y</text>
      {ds.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}
