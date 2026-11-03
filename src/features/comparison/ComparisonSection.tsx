import { useI18n, type MessageKey } from '../../i18n';
import { MiniCurve, type CurveSpec } from '../../components/math/MiniCurve';
import { RichText, Tex } from '../../components/math/Tex';
import { COLORS } from '../../components/math/scene';
import { UnitShell } from '../../components/learning/UnitShell';

interface Row {
  key: 'line' | 'circle' | 'ellipse' | 'hyperbola';
  color: string;
  spec: CurveSpec;
  tex: string;
}

const ROWS: Row[] = [
  { key: 'line', color: COLORS.line, spec: { type: 'line', m: 0.75, b: 1 }, tex: 'y = mx + b \\quad (Ax+By+C=0)' },
  { key: 'circle', color: COLORS.circle, spec: { type: 'circle', r: 3.5 }, tex: '(x-h)^2 + (y-k)^2 = r^2' },
  { key: 'ellipse', color: COLORS.ellipse, spec: { type: 'ellipse', a: 5, b: 3, orient: 'h' }, tex: '\\frac{(x-h)^2}{a^2} + \\frac{(y-k)^2}{b^2} = 1' },
  { key: 'hyperbola', color: COLORS.hyperbola, spec: { type: 'hyperbola', a: 2.5, b: 1.8, orient: 'h' }, tex: '\\frac{(x-h)^2}{a^2} - \\frac{(y-k)^2}{b^2} = 1' },
];

export function ComparisonSection() {
  const { t } = useI18n();
  const k = (row: Row, f: 'name' | 'def' | 'props' | 'elems') => t(`cmp.${row.key}.${f}` as MessageKey);
  return (
    <UnitShell id="comparison" eyebrow={t('cmp.eyebrow')} title={t('cmp.title')} accent={COLORS.vertex} accentSoft="#EFF6FF">
      <p className="lead">{t('cmp.intro')}</p>
      <div className="table-wrap" role="region" aria-label={t('cmp.title')} tabIndex={0}>
        <table className="cmp-table">
          <thead>
            <tr>
              <th scope="col">{t('cmp.col.figure')}</th>
              <th scope="col">{t('cmp.col.def')}</th>
              <th scope="col">{t('cmp.col.eq')}</th>
              <th scope="col">{t('cmp.col.props')}</th>
              <th scope="col">{t('cmp.col.elems')}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key} style={{ ['--row' as string]: r.color }}>
                <th scope="row" data-label={t('cmp.col.figure')}>
                  <MiniCurve spec={r.spec} color={r.color} label={k(r, 'name')} />
                  <span className="cmp-name">{k(r, 'name')}</span>
                </th>
                <td data-label={t('cmp.col.def')}><RichText text={k(r, 'def')} /></td>
                <td data-label={t('cmp.col.eq')}><Tex tex={r.tex} /></td>
                <td data-label={t('cmp.col.props')}><RichText text={k(r, 'props')} /></td>
                <td data-label={t('cmp.col.elems')}><RichText text={k(r, 'elems')} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-hint">{t('cmp.scrollHint')}</p>
      <blockquote className="conclusion">
        <h3>{t('cmp.conclusionTitle')}</h3>
        <p>{t('cmp.conclusion')}</p>
      </blockquote>
    </UnitShell>
  );
}
