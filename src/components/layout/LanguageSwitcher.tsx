import { Languages } from 'lucide-react';
import { useI18n, type Lang } from '../../i18n';

const OPTIONS: Array<{ lang: Lang; short: string; name: string }> = [
  { lang: 'en', short: 'EN', name: 'English' },
  { lang: 'es', short: 'ES', name: 'Español' },
];

/** EN | ES selector. State lives in the i18n provider and is intentionally not persisted. */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className={`lang-switch${compact ? ' lang-switch--compact' : ''}`} role="group" aria-label={t('lang.label')}>
      {!compact && <Languages size={16} aria-hidden="true" className="lang-switch__icon" />}
      {OPTIONS.map((o) => (
        <button
          key={o.lang}
          type="button"
          lang={o.lang}
          className={`lang-switch__btn${lang === o.lang ? ' is-active' : ''}`}
          aria-pressed={lang === o.lang}
          aria-label={o.name}
          title={o.name}
          onClick={() => setLang(o.lang)}
        >
          {o.short}
        </button>
      ))}
    </div>
  );
}
