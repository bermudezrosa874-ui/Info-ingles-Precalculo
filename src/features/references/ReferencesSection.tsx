import { useI18n } from '../../i18n';
import { REFERENCES } from '../../data/references';
import { COLORS } from '../../components/math/scene';
import { UnitShell } from '../../components/learning/UnitShell';

/** Plain APA 7 list with hanging indent; every entry has a working link. */
export function ReferencesSection() {
  const { t } = useI18n();
  return (
    <UnitShell id="references" title={t('ref.title')} accent={COLORS.vertex} accentSoft="#EFF6FF">
      <ul className="ref-list">
        {REFERENCES.map((r) => (
          <li key={r.id} className="ref">
            {r.authorYear}. <em>{r.title}</em>. {r.detail}{' '}
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              {r.url}
              <span className="sr-only"> ({t('ui.opensNewTab')})</span>
            </a>
          </li>
        ))}
      </ul>
    </UnitShell>
  );
}
