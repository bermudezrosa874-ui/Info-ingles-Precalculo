import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Circle, Orbit, Spline, TrendingUp } from 'lucide-react';
import { useI18n } from '../../i18n';
import { COVER } from '../../app/config';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import type { SectionId } from '../../components/layout/navItems';
import { CartesianPlane, type PlaneContext } from '../../components/math/CartesianPlane';
import { EquationCard } from '../../components/math/EquationCard';
import { Tex } from '../../components/math/Tex';
import { addDraggable, addFixedPoint, addLabel, addSegment, COLORS, moveIfChanged, setVisible } from '../../components/math/scene';
import { Card } from '../../components/learning/UnitShell';
import { fmt } from '../../lib/math/format';

interface HomeView {
  x: number;
  y: number;
  text: { origin: string; xAxis: string; yAxis: string; point: string };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildHomeScene(board: any, v: () => HomeView, onChange: (x: number, y: number) => void) {
  const p = addDraggable(board, [v().x, v().y], COLORS.line, 'circle', 8);
  p.setAttribute({ snapToGrid: true, snapSizeX: 1, snapSizeY: 1 });
  const origin = addFixedPoint(board, () => [0, 0], COLORS.vertex, 'cross', 6);
  const projX = addSegment(board, () => [v().x, 0], () => [v().x, v().y], COLORS.muted, { dash: 2 });
  const projY = addSegment(board, () => [0, v().y], () => [v().x, v().y], COLORS.muted, { dash: 2 });
  addLabel(board, () => [0.3, -0.5], () => `${v().text.origin} (0, 0)`, COLORS.vertex, { anchorY: 'top' });
  addLabel(board, () => [6.2, 0.5], () => v().text.xAxis, COLORS.muted);
  addLabel(board, () => [0.3, 9.2], () => v().text.yAxis, COLORS.muted);
  addLabel(board, () => [v().x + 0.3, v().y + 0.3], () => `${v().text.point} (${fmt(v().x)}, ${fmt(v().y)})`, COLORS.line);
  void origin;
  p.on('drag', () => onChange(p.X(), p.Y()));
  return {
    sync() {
      moveIfChanged(p, v().x, v().y);
      setVisible([projX, projY], true);
      board.update();
    },
  };
}

export function HomeSection({ onNavigate }: { onNavigate: (id: SectionId) => void }) {
  const { t, lang } = useI18n();
  const [pt, setPt] = useState({ x: 3, y: 2 });
  const view: HomeView = { ...pt, text: { origin: t('home.origin'), xAxis: t('home.xAxis'), yAxis: t('home.yAxis'), point: 'P' } };
  const viewRef = useRef(view);
  const sceneRef = useRef<ReturnType<typeof buildHomeScene> | null>(null);
  useLayoutEffect(() => {
    viewRef.current = view;
    sceneRef.current?.sync();
  });
  const onReady = useCallback(({ board }: PlaneContext) => {
    sceneRef.current = buildHomeScene(board, () => viewRef.current, (x, y) => setPt({ x, y }));
    sceneRef.current.sync();
    return () => {
      sceneRef.current = null;
    };
  }, []);

  const quadrant = pt.x === 0 && pt.y === 0 ? t('home.q0') : pt.x === 0 || pt.y === 0 ? t('home.qAxis') : pt.x > 0 && pt.y > 0 ? t('home.q1') : pt.x < 0 && pt.y > 0 ? t('home.q2') : pt.x < 0 ? t('home.q3') : t('home.q4');

  const cards: Array<{ id: SectionId; Icon: typeof Circle; color: string; title: string; text: string; tex: string }> = [
    { id: 'line', Icon: TrendingUp, color: COLORS.line, title: t('nav.line'), text: t('home.card.line'), tex: 'y = mx + b' },
    { id: 'circle', Icon: Circle, color: COLORS.circle, title: t('nav.circle'), text: t('home.card.circle'), tex: '(x-h)^2+(y-k)^2=r^2' },
    { id: 'ellipse', Icon: Orbit, color: COLORS.ellipse, title: t('nav.ellipse'), text: t('home.card.ellipse'), tex: '\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1' },
    { id: 'hyperbola', Icon: Spline, color: COLORS.hyperbola, title: t('nav.hyperbola'), text: t('home.card.hyperbola'), tex: '\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1' },
  ];

  return (
    <section id="home" className="unit home" aria-labelledby="home-title">
      <div className="hero">
        <div className="hero__top">
          <span className="hero__uni">{t('cover.university')}</span>
          <LanguageSwitcher />
        </div>
        <h1 id="home-title" tabIndex={-1} className="hero__title">{t('cover.title')}</h1>
        <p className="hero__desc">{t('cover.desc')}</p>
        <dl className="hero__meta">
          <div><dt>{t('cover.course')}</dt><dd>{t('cover.courseName')}</dd></div>
          <div><dt>{t('cover.author')}</dt><dd>{COVER.author}</dd></div>
          <div><dt>{t('cover.date')}</dt><dd>{t('cover.dateValue')}</dd></div>
          {COVER.additionalName.show && (
            <div><dt>{COVER.additionalName.role[lang] || t('cover.additional')}</dt><dd>{COVER.additionalName.name}</dd></div>
          )}
        </dl>
        <button type="button" className="btn btn--lg hero__cta" onClick={() => onNavigate('line')}>
          {t('cover.explore')} <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="home__intro lab">
        <div className="lab__plane">
          <CartesianPlane ariaLabel={t('home.plane')} boundingBox={[-8, 8, 8, -8]} showGrid onReady={onReady} small accent={COLORS.line} />
        </div>
        <div className="lab__panel">
          <h2 className="lab-title">{t('home.cartesian')}</h2>
          <p>{t('home.cartesianText')}</p>
          <EquationCard title={t('home.pointTitle')} tex={`P = (${fmt(pt.x)},\\ ${fmt(pt.y)})`} note={<>{quadrant}</>} />
          <div className="btn-row">
            <button type="button" className="btn btn--chip" onClick={() => setPt((p) => ({ ...p, x: Math.min(8, p.x + 1) }))}>x + 1</button>
            <button type="button" className="btn btn--chip" onClick={() => setPt((p) => ({ ...p, x: Math.max(-8, p.x - 1) }))}>x − 1</button>
            <button type="button" className="btn btn--chip" onClick={() => setPt((p) => ({ ...p, y: Math.min(8, p.y + 1) }))}>y + 1</button>
            <button type="button" className="btn btn--chip" onClick={() => setPt((p) => ({ ...p, y: Math.max(-8, p.y - 1) }))}>y − 1</button>
          </div>
        </div>
      </div>

      <h2 className="lab-title">{t('home.units')}</h2>
      <div className="unit-cards">
        {cards.map(({ id, Icon, color, title, text, tex }) => (
          <button key={id} type="button" className="unit-card" style={{ ['--accent' as string]: color }} onClick={() => onNavigate(id)}>
            <Icon size={28} aria-hidden="true" />
            <span className="unit-card__title">{title}</span>
            <span className="unit-card__text">{text}</span>
            <span className="unit-card__tex"><Tex tex={tex} /></span>
            <span className="unit-card__go">{t('home.open')} <ArrowRight size={16} aria-hidden="true" /></span>
          </button>
        ))}
      </div>

      <Card title={t('home.guide')}>
        <ul className="guide">
          <li>{t('home.guide.sliders')}</li>
          <li>{t('home.guide.drag')}</li>
          <li>{t('home.guide.fields')}</li>
          <li>{t('home.guide.zoom')}</li>
          <li>{t('home.guide.toggles')}</li>
          <li>{t('home.guide.keyboard')}</li>
        </ul>
      </Card>
    </section>
  );
}
