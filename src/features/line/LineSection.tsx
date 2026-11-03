import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { CartesianPlane, type PlaneContext } from '../../components/math/CartesianPlane';
import { ControlGroup, ResetButton, ToggleField } from '../../components/math/Controls';
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
import { approxFmt, fmt } from '../../lib/math/format';
import {
  analyzeLine,
  generalFormTex,
  LINE_DEFAULT,
  LINE_RANGE,
  lineFromSlopeIntercept,
  slopeInterceptTex,
  type LineState,
} from '../../lib/math/line';
import { buildLineScene, type LineView } from './lineScene';

const FLAGS_DEFAULT = { grid: true, labels: true, snap: true, intercepts: true, triangle: true };
const par = (n: number) => (n < 0 ? `(${fmt(n)})` : fmt(n));

export function LineSection() {
  const { t } = useI18n();
  const [s, setS] = useState<LineState>(LINE_DEFAULT);
  const [flags, setFlags] = useState(FLAGS_DEFAULT);
  const [resetSignal, setResetSignal] = useState(0);
  const info = useMemo(() => analyzeLine(s), [s]);

  const view: LineView = {
    s,
    info,
    showLabels: flags.labels,
    showIntercepts: flags.intercepts,
    showTriangle: flags.triangle,
    snap: flags.snap,
    text: { xIntercept: t('line.xIntercept'), yIntercept: t('line.yIntercept'), run: 'Δx', rise: 'Δy' },
  };
  const viewRef = useRef(view);
  const sceneRef = useRef<ReturnType<typeof buildLineScene> | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    viewRef.current = view;
    sceneRef.current?.sync();
  });

  const onReady = useCallback(({ board }: PlaneContext) => {
    sceneRef.current = buildLineScene(board, () => viewRef.current, setS);
    sceneRef.current.sync();
    setReady(true);
    return () => {
      sceneRef.current = null;
    };
  }, []);
  void ready;

  const setFlag = (k: keyof typeof FLAGS_DEFAULT) => (v: boolean) => setFlags((f) => ({ ...f, [k]: v }));
  const m = info.m ?? 0;
  const b = info.b ?? 0;
  const coord = (k: keyof LineState) => (v: number) => setS((cur) => ({ ...cur, [k]: v }));
  const setSlope = (v: number) => setS((cur) => lineFromSlopeIntercept(cur, v, analyzeLine(cur).b ?? 0));
  const setIntercept = (v: number) => setS((cur) => lineFromSlopeIntercept(cur, analyzeLine(cur).m ?? 0, v));

  const slopeTex = (() => {
    if (info.degenerate) return '';
    const dy = `${fmt(s.y2)} - ${par(s.y1)}`;
    const dx = `${fmt(s.x2)} - ${par(s.x1)}`;
    if (info.vertical) return `m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${dy}}{${dx}} = \\frac{${fmt(s.y2 - s.y1)}}{0}\\ \\text{(${t('line.undefined')})}`;
    return `m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${dy}}{${dx}} = ${approxFmt(m).replace('≈ ', '\\approx ')}`;
  })();

  const direction = info.degenerate
    ? t('line.dirNone')
    : info.vertical
      ? t('line.dirVertical')
      : info.horizontal
        ? t('line.dirHorizontal')
        : m > 0
          ? t('line.dirUp')
          : t('line.dirDown');

  const presets: Array<{ label: string; s: LineState }> = [
    { label: 'y = 2x + 1', s: { x1: 0, y1: 1, x2: 1, y2: 3 } },
    { label: t('line.presetVertical'), s: { x1: 3, y1: -2, x2: 3, y2: 4 } },
    { label: t('line.presetHorizontal'), s: { x1: -3, y1: -2, x2: 4, y2: -2 } },
    { label: t('line.presetOrigin'), s: { x1: 0, y1: 0, x2: 2, y2: -3 } },
  ];

  const steps = [
    { title: t('line.ex1.t'), body: t('line.ex1.b'), tex: 'm = 2,\\quad b = 1' },
    { title: t('line.ex2.t'), body: t('line.ex2.b'), tex: 'y = mx + b' },
    { title: t('line.ex3.t'), body: t('line.ex3.b'), tex: 'y = 2x + 1' },
    { title: t('line.ex4.t'), body: t('line.ex4.b'), tex: 'x=0 \\Rightarrow y=1;\\quad x=1 \\Rightarrow y=3;\\quad x=2 \\Rightarrow y=5' },
    { title: t('line.ex5.t'), body: t('line.ex5.b'), tex: '(0,1),\\ (1,3),\\ (2,5)' },
    { title: t('line.ex6.t'), body: t('line.ex6.b') },
  ];

  return (
    <UnitShell id="line" eyebrow={t('unit.n', { n: 1 })} title={t('line.title')} accent={COLORS.line} accentSoft="#EFF6FF">
      <DefinitionCard
        definition={t('line.def')}
        intuition={t('line.intuition')}
        variables={[
          { symbol: 'm', desc: t('line.var.m') },
          { symbol: 'b', desc: t('line.var.b') },
          { symbol: 'A,\\ B,\\ C', desc: t('line.var.abc') },
          { symbol: 'k', desc: t('line.var.k') },
        ]}
      />

      <div className="eq-grid">
        <EquationCard title={t('line.eq.slopeIntercept')} tex="y = mx + b" note={t('line.eq.slopeInterceptNote')} />
        <EquationCard title={t('line.eq.twoPoints')} tex="m = \dfrac{y_2 - y_1}{x_2 - x_1},\ x_2 \neq x_1" note={t('line.eq.twoPointsNote')} />
        <EquationCard title={t('line.eq.general')} tex="Ax + By + C = 0" note={t('line.eq.generalNote')} />
        <EquationCard title={t('line.eq.vertical')} tex="x = k" note={t('line.eq.verticalNote')} />
      </div>

      <h3 className="lab-title">{t('ui.lab')}</h3>
      <div className="lab">
        <div className="lab__plane">
          <CartesianPlane ariaLabel={t('line.plane')} showGrid={flags.grid} onReady={onReady} resetSignal={resetSignal} accent={COLORS.line} />
        </div>
        <div className="lab__panel">
          <EquationCard
            title={t('line.live')}
            tex={info.degenerate ? '\\text{—}' : slopeInterceptTex(info, s.x1)}
            note={info.degenerate ? <span className="warn">{t('line.degenerate')}</span> : <Tex tex={generalFormTex(info)} />}
          />
          <ControlGroup title={t('line.controls.slopeB')}>
            <SliderField label="m" value={m} min={LINE_RANGE.mMin} max={LINE_RANGE.mMax} step={0.1} onChange={setSlope} validate={inRange(-1000, 1000)} hint={info.vertical ? t('line.hintVertical') : undefined} />
            <SliderField label="b" value={b} min={LINE_RANGE.bMin} max={LINE_RANGE.bMax} step={0.1} onChange={setIntercept} validate={inRange(-1000, 1000)} />
          </ControlGroup>
          <ControlGroup title={t('line.controls.points')}>
            <div className="field-grid">
              <SliderField label="x₁" value={s.x1} min={-10} max={10} step={0.5} onChange={coord('x1')} validate={inRange(-1000, 1000)} />
              <SliderField label="y₁" value={s.y1} min={-10} max={10} step={0.5} onChange={coord('y1')} validate={inRange(-1000, 1000)} />
              <SliderField label="x₂" value={s.x2} min={-10} max={10} step={0.5} onChange={coord('x2')} validate={inRange(-1000, 1000)} />
              <SliderField label="y₂" value={s.y2} min={-10} max={10} step={0.5} onChange={coord('y2')} validate={inRange(-1000, 1000)} />
            </div>
          </ControlGroup>
          <ControlGroup title={t('ui.presets')}>
            <div className="btn-row">
              {presets.map((p) => (
                <button key={p.label} type="button" className="btn btn--chip" onClick={() => setS(p.s)}>{p.label}</button>
              ))}
            </div>
          </ControlGroup>
          <ControlGroup title={t('ui.display')}>
            <div className="toggles">
              <ToggleField label={t('ui.showLabels')} checked={flags.labels} onChange={setFlag('labels')} />
              <ToggleField label={t('ui.showGrid')} checked={flags.grid} onChange={setFlag('grid')} />
              <ToggleField label={t('line.showIntercepts')} checked={flags.intercepts} onChange={setFlag('intercepts')} />
              <ToggleField label={t('line.showTriangle')} checked={flags.triangle} onChange={setFlag('triangle')} />
              <ToggleField label={t('ui.snap')} checked={flags.snap} onChange={setFlag('snap')} />
            </div>
          </ControlGroup>
          <ResetButton
            onClick={() => {
              setS(LINE_DEFAULT);
              setResetSignal((n) => n + 1);
            }}
          />
        </div>
      </div>

      <Card title={t('ui.properties')}>
        {!info.degenerate && (
          <div className="eq-scroll"><Tex tex={slopeTex} block /></div>
        )}
        <PropertyList
          items={[
            { label: t('line.prop.slope'), value: info.m === null ? t('line.undefined') : approxFmt(info.m) },
            { label: t('line.prop.yInt'), value: info.degenerate ? '—' : info.yIntercept === null ? t('line.none') : `(0, ${fmt(info.yIntercept)})` },
            { label: t('line.prop.xInt'), value: info.degenerate ? '—' : info.xIntercept === null ? t('line.none') : `(${fmt(info.xIntercept)}, 0)` },
            { label: t('line.prop.direction'), value: direction },
          ]}
        />
      </Card>

      <WorkedExample
        title={t('line.example.title')}
        steps={steps}
        action={{ label: t('ui.loadExample'), onClick: () => setS({ x1: 0, y1: 1, x2: 1, y2: 3 }) }}
      />

      <PracticeQuestion
        prompt={t('line.practice.q')}
        inputLabel={t('line.practice.label')}
        placeholder={t('line.practice.ph')}
        check={(input) => (parseNumber(input) === null ? 'invalid' : numericMatches(input, 2) ? 'correct' : 'wrong')}
        hint={t('line.practice.hint')}
        solution={[t('line.practice.s1'), t('line.practice.s2'), t('line.practice.s3'), t('line.practice.s4')]}
        answerTex="m = \dfrac{6-2}{3-1} = \dfrac{4}{2} = 2"
      />

      <SourceLinks ids={['os-linear']} />
      <p className="note"><RichText text={t('line.sourceNote')} /></p>
    </UnitShell>
  );
}
