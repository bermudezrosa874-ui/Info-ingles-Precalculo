/* eslint-disable @typescript-eslint/no-explicit-any */
import { addDraggable, addLabel, addSegment, COLORS, moveIfChanged, setVisible, type Pt } from '../../components/math/scene';
import { fmt } from '../../lib/math/format';
import { pointOnCircle, type CircleState } from '../../lib/math/circle';

export interface CircleView {
  c: CircleState;
  showLabels: boolean;
  showDiameter: boolean;
  snap: boolean;
  text: { center: string; radius: string; diameter: string; point: string };
}

const C = COLORS.circle;

export function buildCircleScene(board: any, v: () => CircleView, onChange: (patch: Partial<CircleState>) => void) {
  const c0 = v().c;
  const centerPt = addDraggable(board, [c0.h, c0.k], COLORS.vertex, 'cross', 7);
  const P = (): Pt => pointOnCircle(v().c);
  const Q = (): Pt => [2 * v().c.h - P()[0], 2 * v().c.k - P()[1]];
  const CT = (): Pt => [v().c.h, v().c.k];

  const circle = board.create('circle', [[() => v().c.h, () => v().c.k], () => v().c.r], {
    strokeColor: C,
    strokeWidth: 3,
    fillColor: C,
    fillOpacity: 0.06,
    fixed: true,
    highlight: false,
    hasInnerPoints: false,
  });
  const diameter = addSegment(board, P, Q, COLORS.muted, { dash: 2 });
  addSegment(board, CT, P, COLORS.focus, { strokeWidth: 3 });
  const pPoint = addDraggable(board, pointOnCircle(c0), C, 'circle', 7);
  const centerLabel = addLabel(board, () => [v().c.h + 0.25, v().c.k - 0.2], () => `${v().text.center} (${fmt(v().c.h)}, ${fmt(v().c.k)})`, COLORS.vertex, { anchorY: 'top' });
  const radiusLabel = addLabel(board, () => [(v().c.h + P()[0]) / 2 + 0.15, (v().c.k + P()[1]) / 2 + 0.15], () => `${v().text.radius} r = ${fmt(v().c.r)}`, COLORS.focus);
  const diameterLabel = addLabel(board, () => [(P()[0] + Q()[0]) / 2 - 0.2, (P()[1] + Q()[1]) / 2 - 0.2], () => `${v().text.diameter} = ${fmt(2 * v().c.r)}`, COLORS.muted, { anchorX: 'right', anchorY: 'top' });
  const pLabel = addLabel(board, () => [P()[0] + 0.25, P()[1] + 0.25], () => `${v().text.point} (${fmt(P()[0])}, ${fmt(P()[1])})`, C);
  void circle;

  centerPt.on('drag', () => onChange({ h: centerPt.X(), k: centerPt.Y() }));
  pPoint.on('drag', () => {
    const { h, k } = v().c;
    const theta = Math.atan2(pPoint.Y() - k, pPoint.X() - h);
    if (Number.isFinite(theta)) onChange({ theta });
  });

  let snapState: boolean | null = null;
  return {
    sync() {
      const view = v();
      moveIfChanged(centerPt, view.c.h, view.c.k);
      const p = P();
      moveIfChanged(pPoint, p[0], p[1]);
      if (snapState !== view.snap) {
        centerPt.setAttribute({ snapToGrid: view.snap, snapSizeX: 0.5, snapSizeY: 0.5 });
        snapState = view.snap;
      }
      setVisible([diameter], view.showDiameter);
      setVisible([diameterLabel], view.showDiameter && view.showLabels);
      setVisible([centerLabel, radiusLabel, pLabel], view.showLabels);
      board.update();
    },
  };
}
