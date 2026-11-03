import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../i18n';
import { BrandBlock } from './Sidebar';
import { NAV_ITEMS, type SectionId } from './navItems';

interface MobileDrawerProps {
  open: boolean;
  active: SectionId;
  /** Closes the drawer. `restoreFocus` is false when a navigation moves focus elsewhere. */
  onClose: (restoreFocus: boolean) => void;
  onNavigate: (id: SectionId) => void;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

/** Modal slide-in menu with focus trap, Escape and backdrop-click closing. */
export function MobileDrawer({ open, active, onClose, onNavigate }: MobileDrawerProps) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(true);
      } else if (e.key === 'Tab' && panelRef.current) {
        const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="drawer" data-testid="mobile-drawer">
      <button type="button" className="drawer__backdrop" tabIndex={-1} aria-label={t('nav.closeMenu')} onClick={() => onClose(true)} />
      <div id="mobile-drawer" ref={panelRef} className="drawer__panel" role="dialog" aria-modal="true" aria-label={t('nav.aria')}>
        <div className="drawer__top">
          <BrandBlock />
          <button ref={closeRef} type="button" className="icon-btn icon-btn--lg" aria-label={t('nav.closeMenu')} onClick={() => onClose(true)}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={t('nav.aria')}>
          <ul>
            {NAV_ITEMS.map(({ id, labelKey, Icon, path }) => (
              <li key={id}>
                <a
                  href={`#${path}`}
                  className={`nav-link${active === id ? ' is-active' : ''}`}
                  aria-current={active === id ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose(false);
                    onNavigate(id);
                  }}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span>{t(labelKey)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
