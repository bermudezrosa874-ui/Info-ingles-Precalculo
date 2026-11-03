/* eslint-disable @typescript-eslint/no-explicit-any */
import { addDraggable, addFixedPoint, addLabel, addLine, addSegment, COLORS, mid, moveIfChanged, setVisible, type Pt } from '../../components/math/scene';
import { fmt } from '../../lib/math/format';
import { dist } from '../../lib/math/ellipse';
import { hyperbolaInfo, hyperbolaParamFromPoint, hyperbolaPoint, type HyperbolaState } from '../../lib/math/hyperbola';

export interface HyperbolaView {
  h: HyperbolaState;
  showLabels: boolean;
  showFoci: boolean;
  showVertices: boolean;
  showAsymptotes: boolean;
  showRectangle: boolean;
  showAxes: boolean;
  showDistances: boolean;
  snap: boolean;
  text: { center: string; vertex: string; focus: string; transverse: string; conjugate: string; asymptote: string };
}

const C = COLORS.hyperbola;

export function buildHyperbolaScene(board: any, v: () => HyperbolaView, onChange: (patch: Partial<HyperbolaState>) => void) {
  const h0 = v().h;
  const info = () => hyperbolaInfo(v().h);
  const CT = (): Pt => [v().h.h, v().h.k];
  const P = (): Pt => hyperbolaPoint(v().h);
  const F = (i: number) => (): Pt => info().foci[i];
  const Vx = (i: number) => (): Pt => info().vertices[i];
  const dir = (): Pt => (v().h.orient === 'h' ? [v().h.a, v().h.b] : [v().h.b, v().h.a]);
  const conj = (i: number) => (): Pt => {
    const { h, k, b, orient } = v().h;
    const sgn = i === 0 ? -1 : 1;
    return orient === 'h' ? [h, k + sgn * b] : [h + sgn * b, k];
  };
  const U = () => Math.acosh(Math.max(1.0001, 80 / v().h.a));

  // Two separate branches (never joined).
  for (const s of [1, -1] as const) {
    board.create(
      'curve',
      [(u: number) => hyperbolaPoint(v().h, u, s)[0], (u: number) => hyperbolaPoint(v().h, u, s)[1], () => -U(), () => U()],
      { strokeColor: C, strokeWidth: 3, highlight: false, fixed: true, numberPoints: 500 },
    );
  }

  const rectSegs = [0, 1, 2, 3].map((i) =>
    addSegment(board, () => info().rect[i], () => info().rect[(i + 1) % 4], COLORS.muted, { dash: 2, strokeWidth: 1.5 }),
  );
  const asym1 = addLine(board, CT, () => [v().h.h + dir()[0], v().h.k + dir()[1]], COLORS.asym, { dash: 2, strokeWidth: 2 });
  const asym2 = addLine(board, CT, () => [v().h.h + dir()[0], v().h.k - dir()[1]], COLORS.asym, { dash: 2, strokeWidth: 2 });
  const transverse = addSegment(board, Vx(0), Vx(1), COLORS.vertex, { dash: 3, strokeWidth: 1.5 });
  const conjugate = addSegment(board, conj(0), conj(1), COLORS.cov, { dash: 3, strokeWidth: 1.5 });
  const d1 = addSegment(board, P, F(0), COLORS.focus, { strokeWidth: 2 });
  const d2 = addSegment(board, P, F(1), COLORS.focus, { strokeWidth: 2, dash: 1 });

  const vPts = [0, 1].map((i) => addFixedPoint(board, Vx(i), COLORS.vertex, 'diamond', 6));
  const fPts = [0, 1].map((i) => addFixedPoint(board, F(i), COLORS.focus, 'square', 5));
  const center = addDraggable(board, [h0.h, h0.k], COLORS.vertex, 'cross', 7);
  const pPt = addDraggable(board, hyperbolaPoint(h0), C, 'circle', 7);

  const lbl = (pos: () => Pt, text: () => string, color: string, extra = {}) => addLabel(board, pos, text, color, extra);
  const cLabel = lbl(() => [v().h.h + 0.2, v().h.k + 0.2], () => v().text.center, COLORS.vertex);
  const vLabels = [0, 1].map((i) => lbl(() => [Vx(i)()[0], Vx(i)()[1] - 0.25], () => `${v().text.vertex}${i + 1} (${fmt(Vx(i)()[0])}, ${fmt(Vx(i)()[1])})`, COLORS.vertex, { anchorX: 'middle', anchorY: 'top' }));
  const fLabels = [0, 1].map((i) => lbl(() => [F(i)()[0], F(i)()[1] + 0.3], () => `${v().text.focus}${i + 1} (${fmt(F(i)()[0])}, ${fmt(F(i)()[1])})`, COLORS.focus, { anchorX: 'middle' }));
  const pLabel = lbl(() => [P()[0] + 0.25, P()[1] + 0.25], () => `P (${fmt(P()[0])}, ${fmt(P()[1])})`, C);
  const dl1 = lbl(() => mid(P(), F(0)()), () => `d₁ = ${fmt(dist(P(), F(0)()))}`, COLORS.focus, { anchorY: 'middle' });
  const dl2 = lbl(() => mid(P(), F(1)()), () => `d₂ = ${fmt(dist(P(), F(1)()))}`, COLORS.focus, { anchorY: 'middle' });
  const axLabels = [
    lbl(() => { const m = mid(Vx(0)(), Vx(1)()); return [m[0], m[1] - 1.2]; }, () => `${v().text.transverse} = ${fmt(2 * v().h.a)}`, COLORS.vertex, { anchorY: 'top', anchorX: 'middle' }),
    lbl(() => [conj(1)()[0] + 0.2, conj(1)()[1] + 0.1], () => `${v().text.conjugate} = ${fmt(2 * v().h.b)}`, COLORS.cov, { anchorX: 'left' }),
  ];
  const asymLabel = lbl(() => [v().h.h + 2.2 * dir()[0] * 0.6, v().h.k + 2.2 * dir()[1] * 0.6], () => v().text.asymptote, COLORS.asym, { anchorY: 'bottom' });

  center.on('drag', () => onChange({ h: center.X(), k: center.Y() }));
  pPt.on('drag', () => {
    const { u, s } = hyperbolaParamFromPoint(v().h, pPt.X(), pPt.Y(), v().h.s);
    if (Number.isFinite(u)) onChange({ u, s });
  });

  let snapState: boolean | null = null;
  return {
    sync() {
      const view = v();
      moveIfChanged(center, view.h.h, view.h.k);
      const p = P();
      moveIfChanged(pPt, p[0], p[1]);
      if (snapState !== view.snap) {
        center.setAttribute({ snapToGrid: view.snap, snapSizeX: 0.5, snapSizeY: 0.5 });
        snapState = view.snap;
      }
      setVisible(fPts, view.showFoci);
      setVisible(fLabels, view.showFoci && view.showLabels);
      setVisible(vPts, view.showVertices);
      setVisible(vLabels, view.showVertices && view.showLabels);
      setVisible([asym1, asym2], view.showAsymptotes);
      setVisible([asymLabel], view.showAsymptotes && view.showLabels);
      setVisible(rectSegs, view.showRectangle);
      setVisible([transverse, conjugate], view.showAxes);
      setVisible(axLabels, view.showAxes && view.showLabels);
      setVisible([d1, d2], view.showDistances);
      setVisible([dl1, dl2], view.showDistances && view.showLabels);
      setVisible([cLabel, pLabel], view.showLabels);
      board.update();
    },
  };
}
