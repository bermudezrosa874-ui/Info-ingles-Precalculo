import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
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
import { dist, type Orientation } from '../../lib/math/ellipse';
import { asymptotesTex, HYPERBOLA_DEFAULT, hyperbolaInfo, hyperbolaPoint, hyperbolaTex, type HyperbolaState } from '../../lib/math/hyperbola';
import { buildHyperbolaScene, type HyperbolaView } from './hyperbolaScene';

const FLAGS_DEFAULT = { grid: true, labels: true, foci: true, vertices: true, asymptotes: true, rectangle: true, axes: true, distances: true, snap: true };
const axisCheck = (v: number) => (Number.isFinite(v) && v >= 0.5 && v <= 12 ? null : 'error.axis');

export function HyperbolaSection() {
  const { t } = useI18n();
  const [h, setH] = useState<HyperbolaState>(HYPERBOLA_DEFAULT);
  const [flags, setFlags] = useState(FLAGS_DEFAULT);
  const [resetSignal, setResetSignal] = useState(0);
  const info = hyperbolaInfo(h);

  const view: HyperbolaView = {
    h,
    showLabels: flags.labels,
    showFoci: flags.foci,
    showVertices: flags.vertices,
    showAsymptotes: flags.asymptotes,
    showRectangle: flags.rectangle,
    showAxes: flags.axes,
    showDistances: flags.distances,
    snap: flags.snap,
    text: {
      center: t('hyperbola.center'),
      vertex: 'V',
      focus: 'F',
      transverse: t('hyperbola.transverse'),
      conjugate: t('hyperbola.conjugate'),
      asymptote: t('hyperbola.asymptoteWord'),
    },
  };
  const viewRef = useRef(view);
  const sceneRef = useRef<ReturnType<typeof buildHyperbolaScene> | null>(null);
  useLayoutEffect(() => {
    viewRef.current = view;
    sceneRef.current?.sync();
  });
  const patch = useCallback((p: Partial<HyperbolaState>) => setH((cur) => ({ ...cur, ...p })), []);
  const onReady = useCallback(
    ({ board }: PlaneContext) => {
      sceneRef.current = buildHyperbolaScene(board, () => viewRef.current, patch);
      sceneRef.current.sync();
      return () => {
        sceneRef.current = null;
      };
    },
    [patch],
  );
  const setFlag = (k: keyof typeof FLAGS_DEFAULT) => (v: boolean) => setFlags((f) => ({ ...f, [k]: v }));

  const P = hyperbolaPoint(h);
  const d1 = dist(P, info.foci[0]);
  const d2 = dist(P, info.foci[1]);

  const steps = [
    { title: t('hyperbola.ex1.t'), body: t('hyperbola.ex1.b'), tex: '\\frac{x^2}{9}-\\frac{y^2}{4}=1,\\quad (h,k)=(0,0)' },
    { title: t('hyperbola.ex2.t'), body: t('hyperbola.ex2.b'), tex: 'a^2=9 \\Rightarrow a=3,\\qquad b^2=4 \\Rightarrow b=2' },
    { title: t('hyperbola.ex3.t'), body: t('hyperbola.ex3.b'), tex: 'c^2=a^2+b^2=9+4=13 \\Rightarrow c=\\sqrt{13}\\approx 3.61' },
    { title: t('hyperbola.ex4.t'), body: t('hyperbola.ex4.b'), tex: 'V:(\\pm 3,\\ 0),\\qquad F:(\\pm\\sqrt{13},\\ 0)' },
    { title: t('hyperbola.ex5.t'), body: t('hyperbola.ex5.b'), tex: 'y=\\pm\\frac{b}{a}x=\\pm\\frac{2}{3}x' },
    { title: t('hyperbola.ex6.t'), body: t('hyperbola.ex6.b'), tex: 'e=\\frac{c}{a}=\\frac{\\sqrt{13}}{3}\\approx 1.20' },
  ];

  return (
    <UnitShell id="hyperbola" eyebrow={t('unit.n', { n: 4 })} title={t('hyperbola.title')} accent={COLORS.hyperbola} accentSoft="#FFF7ED">
      <DefinitionCard
        definition={t('hyperbola.def')}
        intuition={t('hyperbola.intuition')}
        variables={[
          { symbol: '(h,\\ k)', desc: t('hyperbola.var.center') },
          { symbol: 'a', desc: t('hyperbola.var.a') },
          { symbol: 'b', desc: t('hyperbola.var.b') },
          { symbol: 'c', desc: t('hyperbola.var.c') },
          { symbol: 'e', desc: t('hyperbola.var.e') },
        ]}
      />
      <div className="eq-grid">
        <EquationCard title={t('hyperbola.eq.h')} tex="\dfrac{(x-h)^2}{a^2} - \dfrac{(y-k)^2}{b^2} = 1" note={<Tex tex="y-k=\pm\frac{b}{a}(x-h)" />} />
        <EquationCard title={t('hyperbola.eq.v')} tex="\dfrac{(y-k)^2}{a^2} - \dfrac{(x-h)^2}{b^2} = 1" note={<Tex tex="y-k=\pm\frac{a}{b}(x-h)" />} />
        <EquationCard title={t('hyperbola.eq.relations')} tex="c^2 = a^2 + b^2,\quad e = \dfrac{c}{a} > 1" note={<RichText text={t('hyperbola.eq.relationsNote')} />} />
        <EquationCard title={t('hyperbola.eq.property')} tex="\left|PF_1 - PF_2\right| = 2a" note={t('hyperbola.eq.propertyNote')} />
      </div>

      <h3 className="lab-title">{t('ui.lab')}</h3>
      <div className="lab">
        <div className="lab__plane">
          <CartesianPlane ariaLabel={t('hyperbola.plane')} showGrid={flags.grid} onReady={onReady} resetSignal={resetSignal} accent={COLORS.hyperbola} />
        </div>
        <div className="lab__panel">
          <EquationCard title={t('hyperbola.live')} tex={hyperbolaTex(h)} note={<Tex tex={asymptotesTex(h)} />} />
          <ControlGroup title={t('hyperbola.controls')}>
            <SegmentedControl<Orientation>
              label={t('hyperbola.axisOrientation')}
              value={h.orient}
              options={[{ value: 'h', label: t('ui.horizontal') }, { value: 'v', label: t('ui.vertical') }]}
              onChange={(o) => patch({ orient: o })}
            />
            <SliderField label="h" value={h.h} min={-8} max={8} step={0.5} onChange={(v) => patch({ h: v })} validate={inRange(-1000, 1000)} />
            <SliderField label="k" value={h.k} min={-8} max={8} step={0.5} onChange={(v) => patch({ k: v })} validate={inRange(-1000, 1000)} />
            <SliderField label="a" value={h.a} min={0.5} max={8} step={0.1} onChange={(v) => patch({ a: v })} validate={axisCheck} hint={t('hyperbola.aHint')} />
            <SliderField label="b" value={h.b} min={0.5} max={8} step={0.1} onChange={(v) => patch({ b: v })} validate={axisCheck} />
          </ControlGroup>
          <ControlGroup title={t('ui.display')}>
            <div className="toggles">
              <ToggleField label={t('ui.showLabels')} checked={flags.labels} onChange={setFlag('labels')} />
              <ToggleField label={t('ui.showGrid')} checked={flags.grid} onChange={setFlag('grid')} />
              <ToggleField label={t('hyperbola.showAsymptotes')} checked={flags.asymptotes} onChange={setFlag('asymptotes')} />
              <ToggleField label={t('hyperbola.showRectangle')} checked={flags.rectangle} onChange={setFlag('rectangle')} />
              <ToggleField label={t('ellipse.showFoci')} checked={flags.foci} onChange={setFlag('foci')} />
              <ToggleField label={t('ellipse.showVertices')} checked={flags.vertices} onChange={setFlag('vertices')} />
              <ToggleField label={t('hyperbola.showAxes')} checked={flags.axes} onChange={setFlag('axes')} />
              <ToggleField label={t('ellipse.showDistances')} checked={flags.distances} onChange={setFlag('distances')} />
              <ToggleField label={t('ui.snap')} checked={flags.snap} onChange={setFlag('snap')} />
            </div>
          </ControlGroup>
          <ResetButton
            onClick={() => {
              setH(HYPERBOLA_DEFAULT);
              setResetSignal((n) => n + 1);
            }}
          />
        </div>
      </div>

      <Card title={t('ui.properties')}>
        <div className="eq-scroll">
          <Tex block tex={`\\left|PF_1 - PF_2\\right| = \\left|${fmt(d1)} - ${fmt(d2)}\\right| = ${fmt(Math.abs(d1 - d2))} = 2a = ${fmt(2 * h.a)}`} />
        </div>
        <PropertyList
          items={[
            { label: t('hyperbola.center'), value: <Tex tex={pointTex(h.h, h.k)} /> },
            { label: t('ellipse.prop.vertices'), value: <Tex tex={`${pointTex(...info.vertices[0])},\\ ${pointTex(...info.vertices[1])}`} /> },
            { label: t('ellipse.prop.foci'), value: <Tex tex={`${pointTex(...info.foci[0])},\\ ${pointTex(...info.foci[1])}`} /> },
            { label: t('ellipse.prop.c'), value: <Tex tex={`c=\\sqrt{${fmt(h.a * h.a, 4)} + ${fmt(h.b * h.b, 4)}} = ${approxFmt(info.c).replace('≈ ', '\\approx ')}`} /> },
            { label: t('ellipse.prop.e'), value: approxFmt(info.e, 3) },
            { label: t('hyperbola.prop.asymptotes'), value: <Tex tex={asymptotesTex(h)} /> },
            { label: t('hyperbola.prop.branches'), value: t('hyperbola.prop.branchesValue') },
          ]}
        />
      </Card>

      <WorkedExample title={t('hyperbola.example.title')} steps={steps} action={{ label: t('ui.loadExample'), onClick: () => setH({ ...HYPERBOLA_DEFAULT }) }} />

      <PracticeQuestion
        prompt={t('hyperbola.practice.q')}
        inputLabel={t('hyperbola.practice.label')}
        placeholder={t('hyperbola.practice.ph')}
        check={(input) => (parseNumber(input) === null ? 'invalid' : numericMatches(input, 5) ? 'correct' : 'wrong')}
        hint={t('hyperbola.practice.hint')}
        solution={[t('hyperbola.practice.s1'), t('hyperbola.practice.s2'), t('hyperbola.practice.s3')]}
        answerTex="c=\sqrt{a^2+b^2}=\sqrt{16+9}=\sqrt{25}=5"
      />
      <SourceLinks ids={['os-hyperbola', 'os-keyeq']} />
    </UnitShell>
  );
}
