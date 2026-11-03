import { useCallback, useLayoutEffect, useRef, useState } from 'react';
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
import { equationsEquivalent, parsesAsEquation } from '../../lib/math/answers';
import { CIRCLE_DEFAULT, circleFromGeneral, circleInfo, generalTex, isValidRadius, standardTex, type CircleState } from '../../lib/math/circle';
import { approxFmt, fmt, linearTex } from '../../lib/math/format';
import { buildCircleScene, type CircleView } from './circleScene';

const FLAGS_DEFAULT = { grid: true, labels: true, diameter: true, snap: true };

function GeneralFormTool({ onLoad }: { onLoad: (h: number, k: number, r: number) => void }) {
  const { t } = useI18n();
  const [D, setD] = useState(-6);
  const [E, setE] = useState(4);
  const [F, setF] = useState(-12);
  const res = circleFromGeneral(D, E, F);
  const eq = `${linearTex([[1, 'x^2'], [1, 'y^2'], [D, 'x'], [E, 'y'], [F, '']])} = 0`;
  return (
    <Card title={t('circle.tool.title')}>
      <p className="note">{t('circle.tool.intro')}</p>
      <div className="field-grid">
        <SliderField label="D" value={D} min={-12} max={12} step={1} onChange={setD} validate={inRange(-1000, 1000)} />
        <SliderField label="E" value={E} min={-12} max={12} step={1} onChange={setE} validate={inRange(-1000, 1000)} />
        <SliderField label="F" value={F} min={-40} max={40} step={1} onChange={setF} validate={inRange(-10000, 10000)} />
      </div>
      <Tex tex={eq} block />
      <p className="tool-result" role="status">
        {res.kind === 'circle' && <RichText text={t('circle.tool.circle', { q: fmt(res.q, 4), h: fmt(res.h), k: fmt(res.k), r: approxFmt(res.r) })} />}
        {res.kind === 'point' && <RichText text={t('circle.tool.point', { h: fmt(res.h), k: fmt(res.k) })} />}
        {res.kind === 'empty' && <RichText text={t('circle.tool.empty', { q: fmt(res.q, 4) })} />}
      </p>
      {res.kind === 'circle' && (
        <button type="button" className="btn btn--ghost" onClick={() => onLoad(res.h, res.k, res.r)}>{t('ui.loadGraph')}</button>
      )}
    </Card>
  );
}

export function CircleSection() {
  const { t } = useI18n();
  const [c, setC] = useState<CircleState>(CIRCLE_DEFAULT);
  const [flags, setFlags] = useState(FLAGS_DEFAULT);
  const [resetSignal, setResetSignal] = useState(0);
  const info = circleInfo(c);

  const view: CircleView = {
    c,
    showLabels: flags.labels,
    showDiameter: flags.diameter,
    snap: flags.snap,
    text: { center: t('circle.center'), radius: t('circle.radiusWord'), diameter: t('circle.diameterWord'), point: 'P' },
  };
  const viewRef = useRef(view);
  const sceneRef = useRef<ReturnType<typeof buildCircleScene> | null>(null);
  useLayoutEffect(() => {
    viewRef.current = view;
    sceneRef.current?.sync();
  });
  const patch = useCallback((p: Partial<CircleState>) => setC((cur) => ({ ...cur, ...p })), []);
  const onReady = useCallback(
    ({ board }: PlaneContext) => {
      sceneRef.current = buildCircleScene(board, () => viewRef.current, patch);
      sceneRef.current.sync();
      return () => {
        sceneRef.current = null;
      };
    },
    [patch],
  );
  const setFlag = (k: keyof typeof FLAGS_DEFAULT) => (v: boolean) => setFlags((f) => ({ ...f, [k]: v }));
  const radiusCheck = (v: number) => (isValidRadius(v) ? null : 'error.radius');

  const steps = [
    { title: t('circle.ex1.t'), body: t('circle.ex1.b'), tex: '(h,k) = (2,-1),\\quad r = 3' },
    { title: t('circle.ex2.t'), body: t('circle.ex2.b'), tex: '(x-h)^2 + (y-k)^2 = r^2' },
    { title: t('circle.ex3.t'), body: t('circle.ex3.b'), tex: '(x-2)^2 + (y-(-1))^2 = 3^2' },
    { title: t('circle.ex4.t'), body: t('circle.ex4.b'), tex: '(x-2)^2 + (y+1)^2 = 9' },
    { title: t('circle.ex5.t'), body: t('circle.ex5.b'), tex: '(5-2)^2 + (-1+1)^2 = 9 + 0 = 9 \\checkmark' },
    { title: t('circle.ex6.t'), body: t('circle.ex6.b') },
  ];

  return (
    <UnitShell id="circle" eyebrow={t('unit.n', { n: 2 })} title={t('circle.title')} accent={COLORS.circle} accentSoft="#F0FDFA">
      <DefinitionCard
        definition={t('circle.def')}
        intuition={t('circle.intuition')}
        variables={[
          { symbol: '(h,\\ k)', desc: t('circle.var.center') },
          { symbol: 'r', desc: t('circle.var.r') },
          { symbol: '2r', desc: t('circle.var.d') },
          { symbol: 'D,\\ E,\\ F', desc: t('circle.var.def') },
        ]}
      />
      <div className="eq-grid">
        <EquationCard title={t('circle.eq.standard')} tex="(x-h)^2 + (y-k)^2 = r^2,\ r>0" />
        <EquationCard title={t('circle.eq.origin')} tex="x^2 + y^2 = r^2" />
        <EquationCard title={t('circle.eq.general')} tex="x^2 + y^2 + Dx + Ey + F = 0" note={<RichText text={t('circle.eq.generalNote')} />} />
        <EquationCard title={t('circle.eq.measures')} tex="L = 2\pi r,\quad A = \pi r^2" note={t('circle.eq.measuresNote')} />
      </div>

      <h3 className="lab-title">{t('ui.lab')}</h3>
      <div className="lab">
        <div className="lab__plane">
          <CartesianPlane ariaLabel={t('circle.plane')} showGrid={flags.grid} onReady={onReady} resetSignal={resetSignal} accent={COLORS.circle} />
        </div>
        <div className="lab__panel">
          <EquationCard title={t('circle.live')} tex={standardTex(c.h, c.k, c.r)} note={<Tex tex={generalTex(c.h, c.k, c.r)} />} />
          <ControlGroup title={t('circle.controls')}>
            <SliderField label="h" value={c.h} min={-8} max={8} step={0.5} onChange={(v) => patch({ h: v })} validate={inRange(-1000, 1000)} />
            <SliderField label="k" value={c.k} min={-8} max={8} step={0.5} onChange={(v) => patch({ k: v })} validate={inRange(-1000, 1000)} />
            <SliderField label="r" value={c.r} min={0.5} max={10} step={0.1} onChange={(v) => patch({ r: v })} validate={radiusCheck} hint={t('circle.rHint')} />
          </ControlGroup>
          <ControlGroup title={t('ui.display')}>
            <div className="toggles">
              <ToggleField label={t('ui.showLabels')} checked={flags.labels} onChange={setFlag('labels')} />
              <ToggleField label={t('ui.showGrid')} checked={flags.grid} onChange={setFlag('grid')} />
              <ToggleField label={t('circle.showDiameter')} checked={flags.diameter} onChange={setFlag('diameter')} />
              <ToggleField label={t('ui.snap')} checked={flags.snap} onChange={setFlag('snap')} />
            </div>
          </ControlGroup>
          <ResetButton
            onClick={() => {
              setC(CIRCLE_DEFAULT);
              setResetSignal((n) => n + 1);
            }}
          />
        </div>
      </div>

      <Card title={t('ui.properties')}>
        <PropertyList
          items={[
            { label: t('circle.center'), value: <Tex tex={`(${fmt(c.h)},\\ ${fmt(c.k)})`} /> },
            { label: t('circle.radiusWord'), value: fmt(c.r) },
            { label: t('circle.diameterWord'), value: fmt(info.diameter) },
            { label: t('circle.prop.general'), value: <Tex tex={`D=${fmt(info.D)},\\ E=${fmt(info.E)},\\ F=${fmt(info.F, 4)}`} /> },
            { label: t('circle.prop.circumference'), value: approxFmt(info.circumference) },
            { label: t('circle.prop.area'), value: approxFmt(info.area) },
          ]}
        />
        <p className="note"><RichText text={t('circle.curveVsDisk')} /></p>
      </Card>

      <GeneralFormTool onLoad={(h, k, r) => setC((cur) => ({ ...cur, h, k, r: Math.min(10, Math.max(0.5, r)) }))} />

      <WorkedExample title={t('circle.example.title')} steps={steps} action={{ label: t('ui.loadExample'), onClick: () => setC({ ...CIRCLE_DEFAULT }) }} />

      <PracticeQuestion
        prompt={t('circle.practice.q')}
        inputLabel={t('circle.practice.label')}
        placeholder={t('circle.practice.ph')}
        check={(input) => (!parsesAsEquation(input) ? 'invalid' : equationsEquivalent(input, '(x-3)^2+(y+2)^2=16') ? 'correct' : 'wrong')}
        hint={t('circle.practice.hint')}
        solution={[t('circle.practice.s1'), t('circle.practice.s2'), t('circle.practice.s3')]}
        answerTex="(x-3)^2 + (y+2)^2 = 16"
      />
      <SourceLinks ids={['os-circle', 'os-keyeq']} />
    </UnitShell>
  );
}
