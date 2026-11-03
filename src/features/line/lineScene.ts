/* eslint-disable @typescript-eslint/no-explicit-any */
import { addDraggable, addFixedPoint, addLabel, addSegment, COLORS, mid, moveIfChanged, NO_POINT, setVisible, type Pt } from '../../components/math/scene';
import { fmt } from '../../lib/math/format';
import type { LineInfo, LineState } from '../../lib/math/line';

export interface LineView {
  s: LineState;
  info: LineInfo;
  showLabels: boolean;
  showIntercepts: boolean;
  showTriangle: boolean;
  snap: boolean;
  text: { xIntercept: string; yIntercept: string; run: string; rise: string };
}

const C = COLORS.line;

export function buildLineScene(board: any, v: () => LineView, onChange: (s: LineState) => void) {
  const s0 = v().s;
  const p1 = addDraggable(board, [s0.x1, s0.y1], C, 'circle', 7);
  const p2 = addDraggable(board, [s0.x2, s0.y2], C, 'square', 6);
  const line = board.create('line', [p1, p2], { strokeColor: C, strokeWidth: 3, fixed: true, highlight: false });

  const P1 = (): Pt => [v().s.x1, v().s.y1];
  const P2 = (): Pt => [v().s.x2, v().s.y2];
  const corner = (): Pt => [v().s.x2, v().s.y1];

  const xi = addFixedPoint(board, () => (v().info.xIntercept !== null ? [v().info.xIntercept as number, 0] : NO_POINT), COLORS.vertex, 'diamond', 6);
  const yi = addFixedPoint(board, () => (v().info.yIntercept !== null ? [0, v().info.yIntercept as number] : NO_POINT), COLORS.cov, 'triangleup', 6);
  const xiLabel = addLabel(
    board,
    () => (v().info.xIntercept !== null ? [(v().info.xIntercept as number) - 0.2, -0.35] : NO_POINT),
    () => `${v().text.xIntercept} (${fmt(v().info.xIntercept ?? NaN)}, 0)`,
    COLORS.vertex,
    { anchorX: 'right', anchorY: 'top' },
  );
  const yiLabel = addLabel(
    board,
    () => (v().info.yIntercept !== null ? [-0.3, (v().info.yIntercept as number) + 0.2] : NO_POINT),
    () => `${v().text.yIntercept} (0, ${fmt(v().info.yIntercept ?? NaN)})`,
    COLORS.cov,
    { anchorX: 'right' },
  );

  const run = addSegment(board, P1, corner, COLORS.muted, { dash: 2, strokeWidth: 2 });
  const rise = addSegment(board, corner, P2, COLORS.muted, { dash: 2, strokeWidth: 2 });
  const runLabel = addLabel(board, () => { const m = mid(P1(), corner()); return [m[0], m[1] - 0.2]; }, () => `${v().text.run} = ${fmt(v().s.x2 - v().s.x1)}`, COLORS.muted, { anchorY: 'top' });
  const riseLabel = addLabel(board, () => { const m = mid(corner(), P2()); return [m[0] + 0.2, m[1]]; }, () => `${v().text.rise} = ${fmt(v().s.y2 - v().s.y1)}`, COLORS.muted, { anchorY: 'middle' });

  const p1Label = addLabel(board, () => [v().s.x1 + 0.25, v().s.y1 + 0.25], () => `P₁ (${fmt(v().s.x1)}, ${fmt(v().s.y1)})`, C);
  const p2Label = addLabel(board, () => [v().s.x2 + 0.25, v().s.y2 + 0.25], () => `P₂ (${fmt(v().s.x2)}, ${fmt(v().s.y2)})`, C);

  const emit = () => onChange({ x1: p1.X(), y1: p1.Y(), x2: p2.X(), y2: p2.Y() });
  for (const p of [p1, p2]) {
    p.on('drag', emit);
    p.on('up', emit);
  }

  let snapState: boolean | null = null;
  return {
    sync() {
      const view = v();
      moveIfChanged(p1, view.s.x1, view.s.y1);
      moveIfChanged(p2, view.s.x2, view.s.y2);
      if (snapState !== view.snap) {
        for (const p of [p1, p2]) p.setAttribute({ snapToGrid: view.snap, snapSizeX: 0.5, snapSizeY: 0.5 });
        snapState = view.snap;
      }
      setVisible([line], !view.info.degenerate);
      setVisible([xi, yi], view.showIntercepts);
      setVisible([xiLabel, yiLabel], view.showIntercepts && view.showLabels);
      setVisible([run, rise], view.showTriangle && !view.info.degenerate);
      setVisible([runLabel, riseLabel], view.showTriangle && view.showLabels && !view.info.degenerate);
      setVisible([p1Label, p2Label], view.showLabels);
      board.update();
    },
  };
}
