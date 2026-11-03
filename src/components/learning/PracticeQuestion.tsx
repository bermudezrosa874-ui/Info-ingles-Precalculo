import { useId, useState } from 'react';
import { CheckCircle2, Lightbulb, ListChecks, RotateCcw, XCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import { RichText, Tex } from '../math/Tex';
import { Card } from './UnitShell';

export type CheckResult = 'correct' | 'wrong' | 'invalid';

interface PracticeQuestionProps {
  prompt: string;
  inputLabel: string;
  placeholder: string;
  check: (input: string) => CheckResult;
  hint: string;
  /** Procedure shown on demand (rich text lines). */
  solution: string[];
  /** Final answer in LaTeX, shown with the procedure. */
  answerTex: string;
}

/** Self-correcting exercise: verifiable answer, repeatable attempts, hint on error, optional procedure. */
export function PracticeQuestion({ prompt, inputLabel, placeholder, check, hint, solution, answerTex }: PracticeQuestionProps) {
  const { t } = useI18n();
  const id = useId();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<CheckResult | 'empty' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const submit = () => {
    if (value.trim() === '') return setResult('empty');
    const r = check(value);
    setResult(r);
    if (r !== 'invalid') setAttempts((n) => n + 1);
  };
  const retry = () => {
    setValue('');
    setResult(null);
    setShowSolution(false);
  };

  return (
    <Card title={t('ui.practice')} className="practice">
      <p className="practice__prompt"><RichText text={prompt} /></p>
      <form
        className="practice__form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={`${id}-in`} className="sr-only">{inputLabel}</label>
        <input
          id={`${id}-in`}
          className="practice__input"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          aria-describedby={`${id}-fb`}
          onChange={(e) => {
            setValue(e.target.value);
            if (result) setResult(null);
          }}
        />
        <button type="submit" className="btn">{t('ui.check')}</button>
        <button type="button" className="btn btn--ghost" onClick={retry}>
          <RotateCcw size={16} aria-hidden="true" /> {t('ui.tryAgain')}
        </button>
      </form>

      <div id={`${id}-fb`} className="practice__feedback" role="status" aria-live="polite">
        {result === 'correct' && (
          <p className="feedback feedback--ok"><CheckCircle2 size={20} aria-hidden="true" /> {t('practice.correct')}</p>
        )}
        {result === 'wrong' && (
          <div className="feedback feedback--bad">
            <p><XCircle size={20} aria-hidden="true" /> {t('practice.wrong')}</p>
            <p className="feedback__hint"><Lightbulb size={16} aria-hidden="true" /> <strong>{t('ui.hint')}:</strong> <RichText text={hint} /></p>
          </div>
        )}
        {result === 'invalid' && <p className="feedback feedback--warn">{t('practice.invalid')}</p>}
        {result === 'empty' && <p className="feedback feedback--warn">{t('practice.empty')}</p>}
        {attempts > 0 && <p className="practice__attempts">{t('practice.attempts', { n: attempts })}</p>}
      </div>

      <button type="button" className="btn btn--link" aria-expanded={showSolution} onClick={() => setShowSolution((v) => !v)}>
        <ListChecks size={16} aria-hidden="true" /> {showSolution ? t('ui.hideSolution') : t('ui.showSolution')}
      </button>
      {showSolution && (
        <div className="practice__solution">
          <ol>
            {solution.map((s, i) => (
              <li key={i}><RichText text={s} /></li>
            ))}
          </ol>
          <Tex tex={answerTex} block />
        </div>
      )}
    </Card>
  );
}
