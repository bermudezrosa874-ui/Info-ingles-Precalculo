import { useState } from 'react';
import { ChevronLeft, ChevronRight, LineChart } from 'lucide-react';
import { useI18n } from '../../i18n';
import { RichText, Tex } from '../math/Tex';
import { Card } from './UnitShell';

export interface ExampleStep {
  title: string;
  body: string;
  tex?: string;
}

interface WorkedExampleProps {
  title: string;
  steps: ExampleStep[];
  /** Optional button that loads the example into the interactive graph. */
  action?: { label: string; onClick: () => void };
}

/** Guided step-by-step example with Previous / Next controls. */
export function WorkedExample({ title, steps, action }: WorkedExampleProps) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const step = steps[i];
  return (
    <Card title={title} className="worked">
      <div className="worked__progress" aria-hidden="true">
        {steps.map((_, k) => (
          <span key={k} className={`dot${k === i ? ' is-current' : ''}${k < i ? ' is-done' : ''}`} />
        ))}
      </div>
      <div className="worked__step" aria-live="polite">
        <p className="worked__count">{t('ui.stepOf', { n: i + 1, total: steps.length })}</p>
        <h4 className="worked__title">{step.title}</h4>
        <p><RichText text={step.body} /></p>
        {step.tex && (
          <div className="worked__tex">
            <Tex tex={step.tex} block />
          </div>
        )}
      </div>
      <div className="worked__nav">
        <button type="button" className="btn btn--ghost" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
          <ChevronLeft size={18} aria-hidden="true" /> {t('ui.previous')}
        </button>
        <button type="button" className="btn" onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))} disabled={i === steps.length - 1}>
          {t('ui.next')} <ChevronRight size={18} aria-hidden="true" />
        </button>
        {action && (
          <button type="button" className="btn btn--ghost worked__action" onClick={action.onClick}>
            <LineChart size={16} aria-hidden="true" /> {action.label}
          </button>
        )}
      </div>
    </Card>
  );
}
