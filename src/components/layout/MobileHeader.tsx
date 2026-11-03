import { forwardRef } from 'react';
import { Menu } from 'lucide-react';
import { useI18n } from '../../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface MobileHeaderProps {
  open: boolean;
  onToggle: () => void;
}

/** Compact top bar for screens < 1024 px: project name, EN/ES and the hamburger button. */
export const MobileHeader = forwardRef<HTMLButtonElement, MobileHeaderProps>(function MobileHeader({ open, onToggle }, ref) {
  const { t } = useI18n();
  return (
    <header className="mobile-header" data-testid="mobile-header">
      <span className="mobile-header__title">{t('brand.short')}</span>
      <LanguageSwitcher compact />
      <button
        ref={ref}
        type="button"
        className="icon-btn icon-btn--lg"
        aria-label={t('nav.openMenu')}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={onToggle}
      >
        <Menu size={24} aria-hidden="true" />
      </button>
    </header>
  );
});
