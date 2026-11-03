import { ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n';
import { REFERENCES, type Reference } from '../../data/references';
import { COLORS } from '../../components/math/scene';
import { UnitShell } from '../../components/learning/UnitShell';

function Entry({ r }: { r: Reference }) {
  const { t } = useI18n();
  return (
    <li className="ref">
      <p className="ref__apa">
        {r.authorYear}. <em>{r.title}</em>. {r.detail}{' '}
        {r.url && (
          <a href={r.url} target="_blank" rel="noopener noreferrer">
            {r.url}
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only"> ({t('ui.opensNewTab')})</span>
          </a>
        )}
      </p>
      <p className="ref__meta">
        <span className={`badge ${r.status === 'verified' ? 'badge--ok' : 'badge--pending'}`}>
          {r.status === 'verified' ? t('ref.verified') : t('ref.pending')}
        </span>
        {!r.url && <span className="badge">{t('ref.noLink')}</span>}
      </p>
    </li>
  );
}

export function ReferencesSection() {
  const { t } = useI18n();
  return (
    <UnitShell id="references" eyebrow={t('ref.eyebrow')} title={t('ref.title')} accent={COLORS.vertex} accentSoft="#EFF6FF">
      <p className="lead">{t('ref.intro')}</p>
      <h3 className="lab-title">{t('ref.open')}</h3>
      <ul className="ref-list">{REFERENCES.filter((r) => r.kind === 'open').map((r) => <Entry key={r.id} r={r} />)}</ul>
      <h3 className="lab-title">{t('ref.complementary')}</h3>
      <ul className="ref-list">{REFERENCES.filter((r) => r.kind === 'complementary').map((r) => <Entry key={r.id} r={r} />)}</ul>
      <p className="note">{t('ref.license')}</p>
      <p className="note">{t('ref.method')}</p>
    </UnitShell>
  );
}
