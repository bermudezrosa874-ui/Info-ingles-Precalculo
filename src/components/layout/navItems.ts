import { BookOpen, Circle, House, Orbit, PencilLine, Spline, Table2, TrendingUp, type LucideIcon } from 'lucide-react';
import type { MessageKey } from '../../i18n';

export type SectionId = 'home' | 'line' | 'circle' | 'ellipse' | 'hyperbola' | 'comparison' | 'exercises' | 'references';

export interface NavItem {
  id: SectionId;
  labelKey: MessageKey;
  Icon: LucideIcon;
  /** Route of the view (hash router). */
  path: string;
}

/** Single source of truth for sidebar (desktop) and drawer (mobile). */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav.home', Icon: House, path: '/' },
  { id: 'line', labelKey: 'nav.line', Icon: TrendingUp, path: '/line' },
  { id: 'circle', labelKey: 'nav.circle', Icon: Circle, path: '/circle' },
  { id: 'ellipse', labelKey: 'nav.ellipse', Icon: Orbit, path: '/ellipse' },
  { id: 'hyperbola', labelKey: 'nav.hyperbola', Icon: Spline, path: '/hyperbola' },
  { id: 'comparison', labelKey: 'nav.comparison', Icon: Table2, path: '/comparison' },
  { id: 'exercises', labelKey: 'nav.exercises', Icon: PencilLine, path: '/exercises' },
  { id: 'references', labelKey: 'nav.references', Icon: BookOpen, path: '/references' },
];
