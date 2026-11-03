import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { en } from '../../src/i18n/en';
import { es } from '../../src/i18n/es';
import { I18nProvider } from '../../src/i18n';
import { PracticeQuestion } from '../../src/components/learning/PracticeQuestion';
import { QuizSection, type QuizState } from '../../src/features/quiz/QuizSection';
import { QUESTIONS } from '../../src/features/quiz/questions';
import { numericMatches, parseNumber } from '../../src/lib/math/answers';
import { App } from '../../src/app/App';

function Shell({ children, at = '/', lang = 'en' }: { children: ReactNode; at?: string; lang?: 'en' | 'es' }) {
  return (
    <MemoryRouter initialEntries={[at]}>
      <I18nProvider initial={lang}>{children}</I18nProvider>
    </MemoryRouter>
  );
}

function QuizHarness() {
  const [state, setState] = useState<QuizState>({ answers: {}, submitted: false });
  return <QuizSection state={state} setState={setState} />;
}

// JSXGraph needs a real browser; the plane is covered by the Playwright tests.
vi.mock('../../src/components/math/CartesianPlane', () => ({ CartesianPlane: () => <div data-testid="plane" /> }));

function setViewport(width: number) {
  window.matchMedia = ((q: string) => ({
    matches: q.includes('min-width: 1024px') ? width >= 1024 : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

describe('dictionaries', () => {
  it('Spanish has exactly the English keys and no empty strings', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    for (const [k, v] of Object.entries(es)) expect(v.trim(), k).not.toBe('');
  });
  it('placeholders match between languages', () => {
    const ph = (s: string) => (s.match(/\{[a-z]+\}/gi) ?? []).filter((m) => /^\{(n|total|score|pct|ok|bad|q|h|k|r)\}$/.test(m)).sort().join();
    for (const k of Object.keys(en) as Array<keyof typeof en>) expect(ph(es[k]), k).toBe(ph(en[k]));
  });
});

describe('language and navigation', () => {
  it('always starts in English, even if the browser prefers Spanish, and translates on demand', async () => {
    Object.defineProperty(navigator, 'language', { value: 'es-CO', configurable: true });
    localStorage.setItem('lang', 'es');
    setViewport(1440);
    render(
      <Shell>
        <App />
      </Shell>,
    );
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Analytical Geometry: Interactive Infographic');
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    for (const label of ['Home', 'Straight Line', 'Circle', 'Ellipse', 'Hyperbola', 'Exercises', 'References']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
    await userEvent.click(within(screen.getByTestId('sidebar')).getByRole('button', { name: 'Español' }));
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Geometría Analítica: Infografía Interactiva');
    expect(within(screen.getByRole('navigation', { name: 'Navegación principal' })).getByRole('link', { name: 'Circunferencia' })).toBeInTheDocument();
  });

  it('desktop shows the sidebar and no mobile header; mobile shows the hamburger menu with every route', async () => {
    setViewport(1440);
    const d = render(
      <Shell>
        <App />
      </Shell>,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-header')).toBeNull();
    d.unmount();

    setViewport(390);
    render(
      <Shell>
        <App />
      </Shell>,
    );
    expect(screen.queryByTestId('sidebar')).toBeNull();
    const burger = screen.getByRole('button', { name: 'Open menu' });
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(burger);
    const drawer = screen.getByTestId('mobile-drawer');
    expect(within(drawer).getAllByRole('link')).toHaveLength(8);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByTestId('mobile-drawer')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(within(screen.getByTestId('mobile-drawer')).getByRole('link', { name: 'Hyperbola' }));
    expect(screen.queryByTestId('mobile-drawer')).toBeNull();
  });
});

describe('view navigation', () => {
  it('shows only the selected view and swaps it when another item is chosen', async () => {
    setViewport(1440);
    render(
      <Shell at="/circle">
        <App />
      </Shell>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Circle' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Hyperbola' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 2, name: 'Ellipse' })).toBeNull();
    const nav = screen.getByTestId('sidebar');
    expect(within(nav).getByRole('link', { name: 'Circle' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(within(nav).getByRole('link', { name: 'Hyperbola' }));
    expect(screen.queryByRole('heading', { level: 2, name: 'Circle' })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Hyperbola' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Hyperbola' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Circle' })).not.toHaveAttribute('aria-current');
  });
});

describe('practice question', () => {
  it('grades, hints on error and allows retry', async () => {
    render(
      <I18nProvider>
        <PracticeQuestion
          prompt="Find $m$"
          inputLabel="Slope"
          placeholder="m"
          check={(i) => (parseNumber(i) === null ? 'invalid' : numericMatches(i, 2) ? 'correct' : 'wrong')}
          hint="Use the formula"
          solution={['step']}
          answerTex="m=2"
        />
      </I18nProvider>,
    );
    const input = screen.getByLabelText('Slope');
    await userEvent.type(input, '3');
    await userEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
    expect(screen.getByText(/Use the formula/)).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, '6/3');
    await userEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText(/could not read/)).toBeInTheDocument();
  });
});

describe('quiz', () => {
  it('has at least 8 questions, 2+ per topic', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(8);
    for (const t of ['line', 'circle', 'ellipse', 'hyperbola']) expect(QUESTIONS.filter((q) => q.topic === t).length).toBeGreaterThanOrEqual(2);
  });
  it('scores answers, lists topics to review and resets', async () => {
    render(
      <Shell>
        <QuizHarness />
      </Shell>,
    );
    // answer every numeric question correctly and every choice question with the first option
    for (const q of QUESTIONS) {
      if (q.kind === 'numeric') await userEvent.type(document.getElementById(`${q.id}-n`) as HTMLElement, String(q.correct));
      else await userEvent.click(document.querySelector(`input[name="${q.id}"][value="${q.correct}"]`) as HTMLElement);
    }
    await userEvent.click(screen.getByRole('button', { name: 'Check my answers' }));
    expect(screen.getByText(/Score: 10 \/ 10 \(100%\)/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Try Again/ }));
    expect(screen.queryByText(/Score:/)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Check my answers' }));
    expect(screen.getByText(/Score: 0 \/ 10 \(0%\)/)).toBeInTheDocument();
    expect(screen.getByText(/Topics to review/)).toBeInTheDocument();
  });
});

describe('math rendering: no raw LaTeX is ever visible', () => {
  const routes = ['/', '/line', '/circle', '/ellipse', '/hyperbola', '/comparison', '/exercises', '/references'];
  for (const lang of ['en', 'es'] as const) {
    for (const at of routes) {
      it(`${lang} ${at}`, () => {
        setViewport(1440);
        const { container, unmount } = render(
          <Shell at={at} lang={lang}>
            <App />
          </Shell>,
        );
        // KaTeX output (incl. its MathML copy) is excluded: only text outside formulas is checked.
        const clone = container.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.katex, .tex-block, .tex-inline').forEach((n) => n.remove());
        const text = clone.textContent ?? '';
        expect(text).not.toMatch(/\$/);
        expect(text).not.toMatch(/\\(frac|sqrt|pm|le|neq|approx|text|dfrac|Delta|pi)\b/);
        expect(text).not.toMatch(/\^\d|_\{|\*\*/);
        // KaTeX must not have produced parse errors
        expect(container.querySelectorAll('.katex-error')).toHaveLength(0);
        unmount();
      });
    }
  }
});

describe('references', () => {
  for (const lang of ['en', 'es'] as const) {
    it(`${lang}: one title, a clean APA list of linked sources, no labels or notes`, () => {
      setViewport(1440);
      const { container } = render(
        <Shell at="/references" lang={lang}>
          <App />
        </Shell>,
      );
      const main = container.querySelector('section#references') as HTMLElement;
      expect(main.querySelectorAll('h2, h3')).toHaveLength(1);
      expect(main.querySelector('h2')).toHaveTextContent(lang === 'en' ? 'References' : 'Referencias');
      const items = main.querySelectorAll('.ref-list > li');
      expect(items.length).toBeGreaterThanOrEqual(5);
      items.forEach((li) => expect(li.querySelector('a[href^="http"]')).not.toBeNull());
      expect(main.querySelectorAll('.badge')).toHaveLength(0);
      expect(main.textContent).not.toMatch(/verif|pending|pendiente|comprob|checked|abiert|open source|OpenStax content|estudiante|student|Cita de libro/i);
      // the section ends with the last reference: nothing but the footer follows the list
      expect(main.querySelectorAll(':scope > p, .note')).toHaveLength(0);
    });
  }
});
