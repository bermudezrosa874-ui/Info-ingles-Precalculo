import { useI18n } from '../../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NAV_ITEMS, type SectionId } from './navItems';

export function BrandBlock() {
  const { t } = useI18n();
  return (
    <div className="brand">
      <div className="brand__mark" aria-hidden="true">UNAD</div>
      <div className="brand__text">
        <span className="brand__title">{t('brand.title')}</span>
        <span className="brand__sub">{t('brand.course')}</span>
      </div>
    </div>
  );
}

interface SidebarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}

/** Persistent vertical navigation for screens >= 1024 px. */
export function Sidebar({ active, onNavigate }: SidebarProps) {
  const { t } = useI18n();
  return (
    <aside className="sidebar" data-testid="sidebar">
      <BrandBlock />
      <nav aria-label={t('nav.aria')} className="sidebar__nav">
        <ul>
          {NAV_ITEMS.map(({ id, labelKey, Icon, path }) => (
            <li key={id}>
              <a
                href={`#${path}`}
                className={`nav-link${active === id ? ' is-active' : ''}`}
                aria-current={active === id ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(id);
                }}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{t(labelKey)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar__footer">
        <LanguageSwitcher />
        <p className="sidebar__inst">{t('brand.institution')}</p>
      </div>
    </aside>
  );
}
