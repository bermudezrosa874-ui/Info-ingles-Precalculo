import { useEffect, useId, useState } from 'react';
import { useI18n, type MessageKey } from '../../i18n';
import { parseNumber } from '../../lib/math/answers';
import { fmt } from '../../lib/math/format';

/** Validator factory: value must be finite and within [lo, hi]. */
export const inRange =
  (lo: number, hi: number) =>
  (v: number): MessageKey | null =>
    Number.isFinite(v) && v >= lo && v <= hi ? null : 'error.range';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Returns an i18n key describing why a typed value is invalid, or null when valid. */
  validate?: (v: number) => MessageKey | null;
  disabled?: boolean;
  /** Small text shown under the control (already translated). */
  hint?: string;
  decimals?: number;
}

/**
 * Slider + numeric field bound to one value. Typing never produces NaN: invalid text
 * keeps the last valid value and shows a translated message.
 */
export function SliderField({ label, value, min, max, step = 0.1, onChange, validate, disabled, hint, decimals = 2 }: SliderFieldProps) {
  const { t } = useI18n();
  const id = useId();
  const [text, setText] = useState(fmt(value, decimals));
  const [error, setError] = useState<MessageKey | null>(null);

  // Keep the text box in sync when the value changes elsewhere (slider, drag, reset).
  useEffect(() => {
    const parsed = parseNumber(text);
    if (parsed === null || Math.abs(parsed - value) > 1e-9) {
      setText(fmt(value, decimals));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals]);

  const commit = (raw: string) => {
    setText(raw);
    const v = parseNumber(raw);
    if (v === null) return setError('error.number');
    const problem = validate?.(v) ?? null;
    if (problem) return setError(problem);
    setError(null);
    onChange(v);
  };

  const sliderValue = Math.min(max, Math.max(min, value));
  return (
    <div className={`field${disabled ? ' field--disabled' : ''}`}>
      <div className="field__row">
        <label htmlFor={`${id}-n`} className="field__label">{label}</label>
        <input
          id={`${id}-n`}
          className={`field__number${error ? ' is-invalid' : ''}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => {
            if (error) {
              setText(fmt(value, decimals));
              setError(null);
            }
          }}
        />
      </div>
      <input
        className="field__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
      />
      {error && <p id={`${id}-e`} role="alert" className="field__error">{t(error)}</p>}
      {!error && hint && <p id={`${id}-h`} className="field__hint">{hint}</p>}
    </div>
  );
}
