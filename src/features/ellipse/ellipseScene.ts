/* eslint-disable @typescript-eslint/no-explicit-any */
import { addDraggable, addFixedPoint, addLabel, addSegment, COLORS, mid, moveIfChanged, setVisible, type Pt } from '../../components/math/scene';
import { fmt } from '../../lib/math/format';
import { dist, ellipseInfo, ellipseParamFromPoint, ellipsePoint, type EllipseState } from '../../lib/math/ellipse';

export interface EllipseView {
  e: EllipseState;
  showLabels: boolean;
  showFoci: boolean;
  showVertices: boolean;
  showAxes: boolean;
  showDistances: boolean;
  snap: boolean;
  text: { center: string; vertex: string; covertex: string; focus: string; major: string; minor: string };
}

const C = COLORS.ellipse;

export function buildEllipseScene(board: any, v: () => EllipseView, onChange: (patch: Partial<EllipseState>) => void) {
  const e0 = v().e;
  const info = () => ellipseInfo(v().e);
  const P = (): Pt => ellipsePoint(v().e);
  const F1 = (): Pt => info().foci[0];
  const F2 = (): Pt => info().foci[1];
  const pick = (arr: () => Pt[], i: number) => (): Pt => arr()[i];
  const V = (i: number) => pick(() => info().vertices, i);
  const W = (i: number) => pick(() => info().covertices, i);

  board.create(
    'curve',
    [(t: number) => ellipsePoint(v().e, t)[0], (t: number) => ellipsePoint(v().e, t)[1], 0, 2 * Math.PI],
    { strokeColor: C, strokeWidth: 3, highlight: false, fixed: true, numberPoints: 360 },
  );

  const majorAxis = addSegment(board, V(0), V(1), COLORS.vertex, { dash: 3, strokeWidth: 1.5 });
  const minorAxis = addSegment(board, W(0), W(1), COLORS.cov, { dash: 3, strokeWidth: 1.5 });
  const d1 = addSegment(board, P, F1, COLORS.focus, { strokeWidth: 2 });
  const d2 = addSegment(board, P, F2, COLORS.focus, { strokeWidth: 2, dash: 1 });
  const vPts = [0, 1].map((i) => addFixedPoint(board, V(i), COLORS.vertex, 'diamond', 6));
  const wPts = [0, 1].map((i) => addFixedPoint(board, W(i), COLORS.cov, 'triangleup', 6));
  const fPts = [0, 1].map((i) => addFixedPoint(board, pick(() => info().foci, i), COLORS.focus, 'square', 5));
  const center = addDraggable(board, [e0.h, e0.k], COLORS.vertex, 'cross', 7);
  const pPt = addDraggable(board, ellipsePoint(e0), C, 'circle', 7);

  const lbl = (pos: () => Pt, text: () => string, color: string, extra = {}) => addLabel(board, pos, text, color, extra);
  const cLabel = lbl(() => [v().e.h + 0.2, v().e.k - 0.2], () => `${v().text.center}`, COLORS.vertex, { anchorY: 'top' });
  const vLabels = [0, 1].map((i) => lbl(() => [V(i)()[0] + 0.2, V(i)()[1] + 0.2], () => `${v().text.vertex}${i + 1} (${fmt(V(i)()[0])}, ${fmt(V(i)()[1])})`, COLORS.vertex));
  const wLabels = [0, 1].map((i) => lbl(() => [W(i)()[0] + 0.2, W(i)()[1] + (i === 0 ? -0.2 : 0.2)], () => `${v().text.covertex}${i + 1} (${fmt(W(i)()[0])}, ${fmt(W(i)()[1])})`, COLORS.cov, { anchorY: i === 0 ? 'top' : 'bottom' }));
  const fLabels = [0, 1].map((i) => lbl(() => [info().foci[i][0] + 0.2, info().foci[i][1] - 0.25], () => `${v().text.focus}${i + 1} (${fmt(info().foci[i][0])}, ${fmt(info().foci[i][1])})`, COLORS.focus, { anchorY: 'top' }));
  const pLabel = lbl(() => [P()[0] + 0.25, P()[1] + 0.25], () => `P (${fmt(P()[0])}, ${fmt(P()[1])})`, C);
  const dLabel1 = lbl(() => mid(P(), F1()), () => `d₁ = ${fmt(dist(P(), F1()))}`, COLORS.focus, { anchorY: 'middle' });
  const dLabel2 = lbl(() => mid(P(), F2()), () => `d₂ = ${fmt(dist(P(), F2()))}`, COLORS.focus, { anchorY: 'middle' });
  const majLabel = lbl(() => { const m = mid(V(0)(), V(1)()); return v().e.orient === 'h' ? [m[0], m[1] - 1.2] : [m[0] + 0.2, m[1] + 1.2]; }, () => `${v().text.major} = ${fmt(2 * v().e.a)}`, COLORS.vertex, { anchorY: 'top', anchorX: 'middle' });
  const minLabel = lbl(() => mid(W(0)(), W(1)()), () => `${v().text.minor} = ${fmt(2 * v().e.b)}`, COLORS.cov, { anchorX: 'left' });

  center.on('drag', () => onChange({ h: center.X(), k: center.Y() }));
  pPt.on('drag', () => {
    const t = ellipseParamFromPoint(v().e, pPt.X(), pPt.Y());
    if (Number.isFinite(t)) onChange({ t });
  });

  let snapState: boolean | null = null;
  return {
    sync() {
      const view = v();
      moveIfChanged(center, view.e.h, view.e.k);
      const p = P();
      moveIfChanged(pPt, p[0], p[1]);
      if (snapState !== view.snap) {
        center.setAttribute({ snapToGrid: view.snap, snapSizeX: 0.5, snapSizeY: 0.5 });
        snapState = view.snap;
      }
      const circleCase = info().isCircle;
      setVisible([...fPts], view.showFoci);
      setVisible([...fLabels], view.showFoci && view.showLabels && !circleCase);
      setVisible([...vPts, ...wPts], view.showVertices);
      setVisible([...vLabels, ...wLabels], view.showVertices && view.showLabels);
      setVisible([majorAxis, minorAxis], view.showAxes);
      setVisible([majLabel, minLabel], view.showAxes && view.showLabels);
      setVisible([d1, d2], view.showDistances);
      setVisible([dLabel1, dLabel2], view.showDistances && view.showLabels);
      setVisible([cLabel, pLabel], view.showLabels);
      board.update();
    },
  };
}
