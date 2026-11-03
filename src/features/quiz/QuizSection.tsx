import { useRef, type Dispatch, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useI18n, type MessageKey } from '../../i18n';
import { MiniCurve } from '../../components/math/MiniCurve';
import { RichText, Tex } from '../../components/math/Tex';
import { COLORS } from '../../components/math/scene';
import { UnitShell } from '../../components/learning/UnitShell';
import { numericMatches } from '../../lib/math/answers';
import { isAnswerCorrect, QUESTIONS, type QuizQuestion, type Topic } from './questions';

const TOPIC_KEY: Record<Topic, MessageKey> = { line: 'nav.line', circle: 'nav.circle', ellipse: 'nav.ellipse', hyperbola: 'nav.hyperbola' };
const TOPIC_COLOR: Record<Topic, string> = { line: COLORS.line, circle: COLORS.circle, ellipse: COLORS.ellipse, hyperbola: COLORS.hyperbola };

function Question({ q, index, answer, onAnswer, submitted }: { q: QuizQuestion; index: number; answer: string; onAnswer: (v: string) => void; submitted: boolean }) {
  const { t } = useI18n();
  const ok = submitted && isAnswerCorrect(q, answer, numericMatches);
  return (
    <fieldset className={`quiz-q${submitted ? (ok ? ' is-ok' : ' is-bad') : ''}`} style={{ ['--topic' as string]: TOPIC_COLOR[q.topic] }}>
      <legend>
        <span className="quiz-q__num">{index + 1}</span>
        <span className="quiz-q__topic">{t(TOPIC_KEY[q.topic])}</span>
      </legend>
      <p className="quiz-q__prompt"><RichText text={t(q.prompt)} /></p>
      {q.graph && <MiniCurve spec={q.graph} color={TOPIC_COLOR[q.topic]} label={t('quiz.graphAlt')} />}
      {q.kind === 'numeric' ? (
        <div className="quiz-q__numeric">
          <label className="sr-only" htmlFor={`${q.id}-n`}>{t('quiz.numberLabel', { n: index + 1 })}</label>
          <input id={`${q.id}-n`} className="practice__input" type="text" inputMode="decimal" autoComplete="off" placeholder={t('quiz.numberPh')} value={answer} disabled={submitted} onChange={(e) => onAnswer(e.target.value)} />
        </div>
      ) : (
        <div className="quiz-q__options" role="radiogroup" aria-label={t('quiz.optionsLabel', { n: index + 1 })}>
          {q.options!.map((o) => (
            <label key={o.id} className={`quiz-opt${answer === o.id ? ' is-selected' : ''}${submitted && o.id === q.correct ? ' is-correct' : ''}`}>
              <input type="radio" name={q.id} value={o.id} checked={answer === o.id} disabled={submitted} onChange={() => onAnswer(o.id)} />
              <Tex tex={o.tex} />
            </label>
          ))}
        </div>
      )}
      {submitted && (
        <div className="quiz-q__fb" role="status">
          <p className={ok ? 'feedback feedback--ok' : 'feedback feedback--bad'}>
            {ok ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />} {ok ? t('quiz.correct') : t('quiz.incorrect')}
          </p>
          <p><RichText text={t(q.explanation)} /></p>
        </div>
      )}
    </fieldset>
  );
}

export interface QuizState {
  answers: Record<string, string>;
  submitted: boolean;
}

/** Progress lives in App so it survives switching views during the session (never persisted). */
export function QuizSection({ state, setState }: { state: QuizState; setState: Dispatch<SetStateAction<QuizState>> }) {
  const { t } = useI18n();
  const { answers, submitted } = state;
  const setAnswers = (fn: (a: Record<string, string>) => Record<string, string>) => setState((s) => ({ ...s, answers: fn(s.answers) }));
  const setSubmitted = (v: boolean) => setState((s) => ({ ...s, submitted: v }));
  const summaryRef = useRef<HTMLDivElement>(null);

  const results = QUESTIONS.map((q) => isAnswerCorrect(q, answers[q.id], numericMatches));
  const score = results.filter(Boolean).length;
  const pct = Math.round((score / QUESTIONS.length) * 100);
  const review = Array.from(new Set(QUESTIONS.filter((_, i) => !results[i]).map((q) => q.topic)));
  const unanswered = QUESTIONS.filter((q) => !answers[q.id]).length;

  return (
    <UnitShell id="exercises" eyebrow={t('quiz.eyebrow')} title={t('quiz.title')} accent={COLORS.vertex} accentSoft="#EFF6FF">
      <p className="lead">{t('quiz.intro', { n: QUESTIONS.length })}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          requestAnimationFrame(() => summaryRef.current?.focus());
        }}
      >
        <div className="quiz-list">
          {QUESTIONS.map((q, i) => (
            <Question key={q.id} q={q} index={i} answer={answers[q.id] ?? ''} submitted={submitted} onAnswer={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
          ))}
        </div>
        {!submitted && (
          <div className="quiz-actions">
            <button type="submit" className="btn btn--lg">{t('quiz.submit')}</button>
            {unanswered > 0 && <span className="field__hint">{t('quiz.unanswered', { n: unanswered })}</span>}
          </div>
        )}
      </form>

      {submitted && (
        <div ref={summaryRef} tabIndex={-1} className="quiz-summary card card--accent" role="region" aria-label={t('quiz.results')}>
          <h3>{t('quiz.results')}</h3>
          <p className="quiz-summary__score">{t('quiz.score', { score, total: QUESTIONS.length, pct })}</p>
          <p>{t('quiz.counts', { ok: score, bad: QUESTIONS.length - score })}</p>
          {review.length === 0 ? (
            <p className="feedback feedback--ok"><CheckCircle2 size={18} aria-hidden="true" /> {t('quiz.allGood')}</p>
          ) : (
            <p>
              <strong>{t('quiz.review')}:</strong>{' '}
              {review.map((tp) => (
                <Link key={tp} className="chip" to={`/${tp}`}>
                  {t(TOPIC_KEY[tp])}
                </Link>
              ))}
            </p>
          )}
          <button type="button" className="btn" onClick={() => { setState({ answers: {}, submitted: false }); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
            <RotateCcw size={16} aria-hidden="true" /> {t('quiz.tryAgain')}
          </button>
        </div>
      )}
    </UnitShell>
  );
}
