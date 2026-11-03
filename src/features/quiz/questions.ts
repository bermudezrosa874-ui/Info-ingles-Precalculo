import type { MessageKey } from '../../i18n';
import type { CurveSpec } from '../../components/math/MiniCurve';

export type Topic = 'line' | 'circle' | 'ellipse' | 'hyperbola';

export interface QuizOption {
  id: string;
  /** LaTeX shown for the option (language independent). */
  tex: string;
}

export interface QuizQuestion {
  id: string;
  topic: Topic;
  kind: 'mcq' | 'numeric' | 'graph';
  prompt: MessageKey;
  explanation: MessageKey;
  options?: QuizOption[];
  /** Option id (mcq/graph) or expected number (numeric). */
  correct: string | number;
  graph?: CurveSpec;
}

const opt = (...tex: string[]): QuizOption[] => tex.map((t, i) => ({ id: String.fromCharCode(97 + i), tex: t }));

/** 10 questions: 2 line, 2 circle, 3 ellipse, 3 hyperbola; multiple choice, calculation and graph recognition. */
export const QUESTIONS: QuizQuestion[] = [
  { id: 'q1', topic: 'line', kind: 'numeric', prompt: 'quiz.q1.p', explanation: 'quiz.q1.e', correct: 2 },
  {
    id: 'q2', topic: 'line', kind: 'mcq', prompt: 'quiz.q2.p', explanation: 'quiz.q2.e',
    options: opt('x = 3', 'y = 3', 'y = 4x', 'y = 3x + 1'), correct: 'a',
  },
  {
    id: 'q3', topic: 'circle', kind: 'mcq', prompt: 'quiz.q3.p', explanation: 'quiz.q3.e',
    options: opt('C(-1,\\ 4),\\ r = 5', 'C(1,\\ -4),\\ r = 5', 'C(-1,\\ 4),\\ r = 25', 'C(1,\\ -4),\\ r = 25'), correct: 'a',
  },
  { id: 'q4', topic: 'circle', kind: 'numeric', prompt: 'quiz.q4.p', explanation: 'quiz.q4.e', correct: 5 },
  {
    id: 'q5', topic: 'ellipse', kind: 'mcq', prompt: 'quiz.q5.p', explanation: 'quiz.q5.e',
    options: opt('(\\pm 4,\\ 0)', '(\\pm 5,\\ 0)', '(0,\\ \\pm 4)', '(\\pm 3,\\ 0)'), correct: 'a',
  },
  { id: 'q6', topic: 'ellipse', kind: 'numeric', prompt: 'quiz.q6.p', explanation: 'quiz.q6.e', correct: 12 },
  {
    id: 'q7', topic: 'hyperbola', kind: 'mcq', prompt: 'quiz.q7.p', explanation: 'quiz.q7.e',
    options: opt('x^2 + y^2 = 9', '\\frac{x^2}{9} + \\frac{y^2}{4} = 1', '\\frac{x^2}{9} - \\frac{y^2}{4} = 1', 'y = 2x + 1'), correct: 'c',
  },
  {
    id: 'q8', topic: 'hyperbola', kind: 'mcq', prompt: 'quiz.q8.p', explanation: 'quiz.q8.e',
    options: opt('y = \\pm\\frac{2}{3}x', 'y = \\pm\\frac{3}{2}x', 'y = \\pm 2x', 'y = \\pm 3x'), correct: 'a',
  },
  {
    id: 'q9', topic: 'ellipse', kind: 'graph', prompt: 'quiz.q9.p', explanation: 'quiz.q9.e',
    graph: { type: 'ellipse', a: 5, b: 3, orient: 'h' },
    options: opt('\\frac{x^2}{25} + \\frac{y^2}{9} = 1', '\\frac{x^2}{9} + \\frac{y^2}{25} = 1', '\\frac{x^2}{25} - \\frac{y^2}{9} = 1', 'x^2 + y^2 = 25'), correct: 'a',
  },
  {
    id: 'q10', topic: 'hyperbola', kind: 'graph', prompt: 'quiz.q10.p', explanation: 'quiz.q10.e',
    graph: { type: 'hyperbola', a: 2, b: 3, orient: 'v' },
    options: opt('\\frac{x^2}{4} - \\frac{y^2}{9} = 1', '\\frac{y^2}{4} - \\frac{x^2}{9} = 1', '\\frac{y^2}{4} + \\frac{x^2}{9} = 1', '\\frac{x^2}{9} + \\frac{y^2}{4} = 1'), correct: 'b',
  },
];

export function isAnswerCorrect(q: QuizQuestion, answer: string | undefined, numericMatches: (input: string, expected: number) => boolean): boolean {
  if (answer === undefined || answer === '') return false;
  if (q.kind === 'numeric') return numericMatches(answer, q.correct as number);
  return answer === q.correct;
}
