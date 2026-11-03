import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { refById, type RefId } from '../../data/references';

/** "Source" links of a unit pointing to the verifiable bibliography entries. */
export function SourceLinks({ ids }: { ids: RefId[] }) {
  const { t } = useI18n();
  return (
    <div className="sources">
      <h3 className="sources__title">{t('ui.sources')}</h3>
      <ul>
        {ids.map((id) => {
          const r = refById(id);
          return (
            <li key={id}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                {r.authorYear}. <em>{r.title}</em>. {r.detail}
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> ({t('ui.opensNewTab')})</span>
              </a>
            </li>
          );
        })}
      </ul>
      <Link className="sources__all" to="/references">{t('ui.allReferences')}</Link>
    </div>
  );
}
