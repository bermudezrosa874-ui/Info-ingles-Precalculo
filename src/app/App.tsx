import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Sidebar } from '../components/layout/Sidebar';
import { NAV_ITEMS, type SectionId } from '../components/layout/navItems';
import { useI18n } from '../i18n';
import { CircleSection } from '../features/circle/CircleSection';
import { ComparisonSection } from '../features/comparison/ComparisonSection';
import { EllipseSection } from '../features/ellipse/EllipseSection';
import { HomeSection } from '../features/home/HomeSection';
import { HyperbolaSection } from '../features/hyperbola/HyperbolaSection';
import { LineSection } from '../features/line/LineSection';
import { QuizSection, type QuizState } from '../features/quiz/QuizSection';
import { ReferencesSection } from '../features/references/ReferencesSection';

const DESKTOP_QUERY = '(min-width: 1024px)';

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

/** The active menu item is derived from the current route, so menu and view can never disagree. */
function useActiveSection(): SectionId {
  const { pathname } = useLocation();
  return NAV_ITEMS.find((n) => n.path === pathname)?.id ?? 'home';
}

/** One independent view: remounted (and animated) on every route change. */
function View({ children }: { children: ReactNode }) {
  return <div className="view">{children}</div>;
}

export function App() {
  const { t } = useI18n();
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();
  const navigateTo = useNavigate();
  const { pathname } = useLocation();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);
  const [quiz, setQuiz] = useState<QuizState>({ answers: {}, submitted: false });

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  // New view → start at the top and move focus to its heading (accessibility).
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>('#main h1, #main h2')?.focus({ preventScroll: true });
  }, [pathname]);

  const navigate = useCallback(
    (id: SectionId) => {
      const item = NAV_ITEMS.find((n) => n.id === id);
      if (item) navigateTo(item.path);
    },
    [navigateTo],
  );

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => burgerRef.current?.focus());
  }, []);

  return (
    <div className={`app ${isDesktop ? 'app--desktop' : 'app--mobile'}`}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        {t('nav.skip')}
      </a>
      {isDesktop ? (
        <Sidebar active={active} onNavigate={navigate} />
      ) : (
        <>
          <MobileHeader ref={burgerRef} open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
          <MobileDrawer open={menuOpen} active={active} onClose={closeMenu} onNavigate={navigate} />
        </>
      )}
      <main id="main" tabIndex={-1} className="content">
        <Routes>
          <Route path="/" element={<View key="home"><HomeSection onNavigate={navigate} /></View>} />
          <Route path="/line" element={<View key="line"><LineSection /></View>} />
          <Route path="/circle" element={<View key="circle"><CircleSection /></View>} />
          <Route path="/ellipse" element={<View key="ellipse"><EllipseSection /></View>} />
          <Route path="/hyperbola" element={<View key="hyperbola"><HyperbolaSection /></View>} />
          <Route path="/comparison" element={<View key="comparison"><ComparisonSection /></View>} />
          <Route path="/exercises" element={<View key="exercises"><QuizSection state={quiz} setState={setQuiz} /></View>} />
          <Route path="/references" element={<View key="references"><ReferencesSection /></View>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="footer">
          <p>{t('footer.text')}</p>
        </footer>
      </main>
    </div>
  );
}
