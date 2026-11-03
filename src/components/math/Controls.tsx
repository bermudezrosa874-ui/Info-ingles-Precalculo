import { useId, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '../../i18n';

export function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export interface SegmentOption<V extends string> {
  value: V;
  label: string;
}

/** Accessible radio-group styled as a segmented control (e.g. horizontal / vertical). */
export function SegmentedControl<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: Array<SegmentOption<V>>;
  onChange: (v: V) => void;
}) {
  const name = useId();
  return (
    <fieldset className="segmented">
      <legend>{label}</legend>
      <div className="segmented__row">
        {options.map((o) => (
          <label key={o.value} className={`segmented__item${o.value === value ? ' is-active' : ''}`}>
            <input type="radio" name={name} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" className="btn btn--ghost" onClick={onClick}>
      <RotateCcw size={16} aria-hidden="true" /> {t('ui.reset')}
    </button>
  );
}

export function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="control-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
