/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Small helpers to build JSXGraph scenes whose geometry is computed from a
 * mutable "view" (closures re-evaluated by board.update()). Points whose
 * coordinates are NaN are simply not drawn, so degenerate cases never leak NaN.
 */
export type Pt = [number, number];

export const NO_POINT: Pt = [NaN, NaN];

export function addDraggable(board: any, xy: Pt, color: string, face = 'circle', size = 6): any {
  return board.create('point', xy, {
    name: '',
    withLabel: false,
    face,
    size,
    strokeColor: '#ffffff',
    fillColor: color,
    highlightFillColor: color,
    highlightStrokeColor: '#12355B',
    strokeWidth: 2,
    showInfobox: false,
  });
}

export function addFixedPoint(board: any, pos: () => Pt, color: string, face = 'circle', size = 4): any {
  return board.create('point', [() => pos()[0], () => pos()[1]], {
    name: '',
    withLabel: false,
    fixed: true,
    face,
    size,
    strokeColor: color,
    fillColor: color,
    highlight: false,
    showInfobox: false,
  });
}

export function addLabel(board: any, pos: () => Pt, text: () => string, color: string, extra: Record<string, unknown> = {}): any {
  return board.create('text', [() => pos()[0], () => pos()[1], text], {
    color,
    fontSize: 13,
    fixed: true,
    highlight: false,
    anchorX: 'left',
    anchorY: 'bottom',
    cssClass: 'jxg-label',
    highlightCssClass: 'jxg-label',
    ...extra,
  });
}

export function addSegment(board: any, a: () => Pt, b: () => Pt, color: string, extra: Record<string, unknown> = {}): any {
  return board.create(
    'segment',
    [
      [() => a()[0], () => a()[1]],
      [() => b()[0], () => b()[1]],
    ],
    {
      strokeColor: color,
      strokeWidth: 2,
      fixed: true,
      highlight: false,
      firstArrow: false,
      lastArrow: false,
      ...extra,
    },
  );
}

export function addLine(board: any, p: () => Pt, q: () => Pt, color: string, extra: Record<string, unknown> = {}): any {
  return board.create(
    'line',
    [
      [() => p()[0], () => p()[1]],
      [() => q()[0], () => q()[1]],
    ],
    { strokeColor: color, strokeWidth: 2, fixed: true, highlight: false, straightFirst: true, straightLast: true, ...extra },
  );
}

/** Shows/hides a list of elements, remembering the last state to avoid redundant redraws. */
export function setVisible(els: any[], visible: boolean): void {
  for (const el of els) {
    if (el.__vis !== visible) {
      el.setAttribute({ visible });
      el.__vis = visible;
    }
  }
}

/** Moves a free point only when the target differs (avoids fighting an active drag). */
export function moveIfChanged(p: any, x: number, y: number): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  if (Math.abs(p.X() - x) > 1e-9 || Math.abs(p.Y() - y) > 1e-9) p.moveTo([x, y]);
}

export function mid(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export const COLORS = {
  line: '#2563EB',
  circle: '#0F766E',
  ellipse: '#7C3AED',
  hyperbola: '#C2410C',
  ink: '#172033',
  muted: '#475569',
  focus: '#DC2626',
  vertex: '#12355B',
  cov: '#0E7490',
  asym: '#64748B',
} as const;
