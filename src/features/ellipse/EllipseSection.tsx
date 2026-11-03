import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useI18n, type MessageKey } from '../../i18n';
import { CartesianPlane, type PlaneContext } from '../../components/math/CartesianPlane';
import { ControlGroup, ResetButton, SegmentedControl, ToggleField } from '../../components/math/Controls';
import { EquationCard, PropertyList } from '../../components/math/EquationCard';
import { inRange, SliderField } from '../../components/math/SliderField';
import { RichText, Tex } from '../../components/math/Tex';
import { COLORS } from '../../components/math/scene';
import { DefinitionCard } from '../../components/learning/DefinitionCard';
import { PracticeQuestion } from '../../components/learning/PracticeQuestion';
import { SourceLinks } from '../../components/learning/SourceLinks';
import { Card, UnitShell } from '../../components/learning/UnitShell';
import { WorkedExample } from '../../components/learning/WorkedExample';
import { numericMatches, parseNumber } from '../../lib/math/answers';
import { approxFmt, fmt, pointTex } from '../../lib/math/format';
import { AXIS_MAX, AXIS_MIN, dist, ELLIPSE_DEFAULT, ellipseInfo, ellipsePoint, ellipseTex, normalizeAxes, type EllipseState, type Orientation } from '../../lib/math/ellipse';
import { buildEllipseScene, type EllipseView } from './ellipseScene';

const FLAGS_DEFAULT = { grid: true, labels: true, foci: true, vertices: true, axes: true, distances: true, snap: true };

export function EllipseSection() {
  const { t } = useI18n();
  const [e, setE] = useState<EllipseState>(ELLIPSE_DEFAULT);
  const [flags, setFlags] = useState(FLAGS_DEFAULT);
  const [notice, setNotice] = useState<MessageKey | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const info = ellipseInfo(e);

  const view: EllipseView = {
    e,
    showLabels: flags.labels,
    showFoci: flags.foci,
    showVertices: flags.vertices,
    showAxes: flags.axes,
    showDistances: flags.distances,
    snap: flags.snap,
    text: { center: t('ellipse.center'), vertex: 'V', covertex: 'W', focus: 'F', major: t('ellipse.major'), minor: t('ellipse.minor') },
  };
  const viewRef = useRef(view);
  const sceneRef = useRef<ReturnType<typeof buildEllipseScene> | null>(null);
  useLayoutEffect(() => {
    viewRef.current = view;
    sceneRef.current?.sync();
  });
  const patch = useCallback((p: Partial<EllipseState>) => setE((cur) => ({ ...cur, ...p })), []);
  const onReady = useCallback(
    ({ board }: PlaneContext) => {
      sceneRef.current = buildEllipseScene(board, () => viewRef.current, patch);
      sceneRef.current.sync();
      return () => {
        sceneRef.current = null;
      };
    },
    [patch],
  );
  const setFlag = (k: keyof typeof FLAGS_DEFAULT) => (v: boolean) => setFlags((f) => ({ ...f, [k]: v }));

  const setAxis = (which: 'a' | 'b') => (v: number) => {
    const n = normalizeAxes(which === 'a' ? v : e.a, which === 'b' ? v : e.b, which);
    setNotice(n.adjusted ? (which === 'a' ? 'ellipse.notice.a' : 'ellipse.notice.b') : null);
    setE((cur) => ({ ...cur, a: n.a, b: n.b }));
  };
  const axisCheck = (v: number) => (Number.isFinite(v) && v >= AXIS_MIN && v <= AXIS_MAX ? null : 'error.axis');

  const F1 = info.foci[0];
  const F2 = info.foci[1];
  const P = ellipsePoint(e);
  const d1 = dist(P, F1);
  const d2 = dist(P, F2);

  const steps = [
    { title: t('ellipse.ex1.t'), body: t('ellipse.ex1.b'), tex: '(h,k)=(1,-2),\\quad a=5,\\ b=3' },
    { title: t('ellipse.ex2.t'), body: t('ellipse.ex2.b'), tex: '\\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}=1' },
    { title: t('ellipse.ex3.t'), body: t('ellipse.ex3.b'), tex: 'c^2=a^2-b^2=5^2-3^2=25-9=16 \\Rightarrow c=4' },
    { title: t('ellipse.ex4.t'), body: t('ellipse.ex4.b'), tex: '\\frac{(x-1)^2}{25}+\\frac{(y+2)^2}{9}=1' },
    { title: t('ellipse.ex5.t'), body: t('ellipse.ex5.b'), tex: 'V:(-4,-2),(6,-2);\\ W:(1,-5),(1,1);\\ F:(-3,-2),(5,-2)' },
    { title: t('ellipse.ex6.t'), body: t('ellipse.ex6.b'), tex: 'e=\\frac{c}{a}=\\frac{4}{5}=0.8' },
  ];

  return (
    <UnitShell id="ellipse" eyebrow={t('unit.n', { n: 3 })} title={t('ellipse.title')} accent={COLORS.ellipse} accentSoft="#F5F3FF">
      <DefinitionCard
        definition={t('ellipse.def')}
        intuition={t('ellipse.intuition')}
        variables={[
          { symbol: '(h,\\ k)', desc: t('ellipse.var.center') },
          { symbol: 'a', desc: t('ellipse.var.a') },
          { symbol: 'b', desc: t('ellipse.var.b') },
          { symbol: 'c', desc: t('ellipse.var.c') },
          { symbol: 'e', desc: t('ellipse.var.e') },
        ]}
      />
      <div className="eq-grid">
        <EquationCard title={t('ellipse.eq.h')} tex="\dfrac{(x-h)^2}{a^2} + \dfrac{(y-k)^2}{b^2} = 1,\ a>b>0" />
        <EquationCard title={t('ellipse.eq.v')} tex="\dfrac{(x-h)^2}{b^2} + \dfrac{(y-k)^2}{a^2} = 1,\ a>b>0" />
        <EquationCard title={t('ellipse.eq.relations')} tex="c^2 = a^2 - b^2,\quad e = \dfrac{c}{a}" note={<RichText text={t('ellipse.eq.relationsNote')} />} />
        <EquationCard title={t('ellipse.eq.property')} tex="PF_1 + PF_2 = 2a" note={t('ellipse.eq.propertyNote')} />
      </div>

      <h3 className="lab-title">{t('ui.lab')}</h3>
      <div className="lab">
        <div className="lab__plane">
          <CartesianPlane ariaLabel={t('ellipse.plane')} showGrid={flags.grid} onReady={onReady} resetSignal={resetSignal} accent={COLORS.ellipse} />
        </div>
        <div className="lab__panel">
          <EquationCard title={t('ellipse.live')} tex={ellipseTex(e)} note={info.isCircle ? <span className="badge">{t('ellipse.circleCase')}</span> : undefined} />
          <ControlGroup title={t('ellipse.controls')}>
            <SegmentedControl<Orientation>
              label={t('ui.orientation')}
              value={e.orient}
              options={[{ value: 'h', label: t('ui.horizontal') }, { value: 'v', label: t('ui.vertical') }]}
              onChange={(o) => patch({ orient: o })}
            />
            <SliderField label="h" value={e.h} min={-8} max={8} step={0.5} onChange={(v) => patch({ h: v })} validate={inRange(-1000, 1000)} />
            <SliderField label="k" value={e.k} min={-8} max={8} step={0.5} onChange={(v) => patch({ k: v })} validate={inRange(-1000, 1000)} />
            <SliderField label="a" value={e.a} min={AXIS_MIN} max={AXIS_MAX} step={0.1} onChange={(v) => { setAxis('a')(v); }} validate={axisCheck} hint={t('ellipse.aHint')} />
            <SliderField label="b" value={e.b} min={AXIS_MIN} max={AXIS_MAX} step={0.1} onChange={(v) => { setAxis('b')(v); }} validate={axisCheck} />
            {notice && <p className="field__hint" role="status">{t(notice)}</p>}
          </ControlGroup>
          <ControlGroup title={t('ui.display')}>
            <div className="toggles">
              <ToggleField label={t('ui.showLabels')} checked={flags.labels} onChange={setFlag('labels')} />
              <ToggleField label={t('ui.showGrid')} checked={flags.grid} onChange={setFlag('grid')} />
              <ToggleField label={t('ellipse.showFoci')} checked={flags.foci} onChange={setFlag('foci')} />
              <ToggleField label={t('ellipse.showVertices')} checked={flags.vertices} onChange={setFlag('vertices')} />
              <ToggleField label={t('ellipse.showAxes')} checked={flags.axes} onChange={setFlag('axes')} />
              <ToggleField label={t('ellipse.showDistances')} checked={flags.distances} onChange={setFlag('distances')} />
              <ToggleField label={t('ui.snap')} checked={flags.snap} onChange={setFlag('snap')} />
            </div>
          </ControlGroup>
          <ResetButton
            onClick={() => {
              setE(ELLIPSE_DEFAULT);
              setNotice(null);
              setResetSignal((n) => n + 1);
            }}
          />
        </div>
      </div>

      <Card title={t('ui.properties')}>
        <div className="eq-scroll">
          <Tex block tex={`PF_1 + PF_2 = ${fmt(d1)} + ${fmt(d2)} = ${fmt(d1 + d2)} = 2a = ${fmt(2 * e.a)}`} />
        </div>
        <PropertyList
          items={[
            { label: t('ellipse.center'), value: <Tex tex={pointTex(e.h, e.k)} /> },
            { label: t('ellipse.prop.vertices'), value: <Tex tex={`${pointTex(...info.vertices[0])},\\ ${pointTex(...info.vertices[1])}`} /> },
            { label: t('ellipse.prop.covertices'), value: <Tex tex={`${pointTex(...info.covertices[0])},\\ ${pointTex(...info.covertices[1])}`} /> },
            { label: t('ellipse.prop.foci'), value: <Tex tex={`${pointTex(...F1)},\\ ${pointTex(...F2)}`} /> },
            { label: t('ellipse.prop.c'), value: <Tex tex={`c=\\sqrt{${fmt(e.a * e.a, 4)} - ${fmt(e.b * e.b, 4)}} = ${approxFmt(info.c).replace('≈ ', '\\approx ')}`} /> },
            { label: t('ellipse.prop.e'), value: approxFmt(info.e, 3) },
            { label: t('ellipse.prop.axes'), value: `${t('ellipse.major')} = ${fmt(info.majorLength)};  ${t('ellipse.minor')} = ${fmt(info.minorLength)}` },
          ]}
        />
        <p className="note"><RichText text={info.isCircle ? t('ellipse.circleNote') : t('ellipse.rangeNote')} /></p>
      </Card>

      <WorkedExample title={t('ellipse.example.title')} steps={steps} action={{ label: t('ui.loadExample'), onClick: () => setE({ ...ELLIPSE_DEFAULT }) }} />

      <PracticeQuestion
        prompt={t('ellipse.practice.q')}
        inputLabel={t('ellipse.practice.label')}
        placeholder={t('ellipse.practice.ph')}
        check={(input) => (parseNumber(input) === null ? 'invalid' : numericMatches(input, 4) ? 'correct' : 'wrong')}
        hint={t('ellipse.practice.hint')}
        solution={[t('ellipse.practice.s1'), t('ellipse.practice.s2'), t('ellipse.practice.s3')]}
        answerTex="c=\sqrt{a^2-b^2}=\sqrt{25-9}=\sqrt{16}=4"
      />
      <SourceLinks ids={['os-ellipse', 'os-keyeq']} />
    </UnitShell>
  );
}
