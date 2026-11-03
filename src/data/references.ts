/**
 * Bibliography (APA 7). Only sources provided in the project brief are listed.
 * `status`:
 *  - 'verified'  → page opened and heading checked
 *  - 'pending'   → provided by the student, record/URL still to be checked against the original registry
 * Descriptions are translated through the i18n dictionary.
 */
export type RefId = 'os-linear' | 'os-ellipse' | 'os-hyperbola' | 'os-keyeq' | 'os-circle' | 'rondon' | 'oteyza' | 'ortiz';

export interface Reference {
  id: RefId;
  /** Author(s) and year, e.g. "Abramson, J. (2021)". */
  authorYear: string;
  /** Title (italic in APA). */
  title: string;
  /** Publisher / container and locator, plain text. */
  detail: string;
  url: string;
  status: 'verified' | 'pending';
  kind: 'open' | 'complementary';
}

export const REFERENCES: Reference[] = [
  {
    id: 'os-linear',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Section 2.3, Modeling with Linear Functions.',
    url: 'https://openstax.org/books/precalculus-2e/pages/2-3-modeling-with-linear-functions',
    status: 'verified',
    kind: 'open',
  },
  {
    id: 'os-ellipse',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Section 10.1, The Ellipse.',
    url: 'https://openstax.org/books/precalculus-2e/pages/10-1-the-ellipse',
    status: 'verified',
    kind: 'open',
  },
  {
    id: 'os-hyperbola',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Section 10.2, The Hyperbola.',
    url: 'https://openstax.org/books/precalculus-2e/pages/10-2-the-hyperbola',
    status: 'verified',
    kind: 'open',
  },
  {
    id: 'os-keyeq',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Chapter 10, Key Equations.',
    url: 'https://openstax.org/books/precalculus-2e/pages/10-key-equations',
    status: 'verified',
    kind: 'open',
  },
  {
    id: 'os-circle',
    authorYear: 'OpenStax',
    title: 'Intermediate Algebra 2e',
    detail: 'Section 11.1, Distance and Midpoint Formulas; Circles.',
    url: 'https://openstax.org/books/intermediate-algebra-2e/pages/11-1-distance-and-midpoint-formulas-circles',
    status: 'verified',
    kind: 'open',
  },
  {
    id: 'rondon',
    authorYear: 'Rondón, J. (2017)',
    title: 'Álgebra, Trigonometría y Geometría Analítica',
    detail: 'Universidad Nacional Abierta y a Distancia. Pp. 285–347.',
    url: '',
    status: 'pending',
    kind: 'complementary',
  },
  {
    id: 'oteyza',
    authorYear: 'Oteyza de Oteyza, E. D., Carrillo Hoyo, A. M., Hernández Garciadiego, C., Ramírez, A., & Lam Osnaya, E. (2015)',
    title: 'Geometría analítica y trigonometría',
    detail: 'Pearson Educación. Pp. 157–407.',
    url: '',
    status: 'pending',
    kind: 'complementary',
  },
  {
    id: 'ortiz',
    authorYear: 'Ortiz, C. F. J. (2014)',
    title: 'Matemáticas 3 (2.ª ed.)',
    detail: 'Larousse – Grupo Editorial Patria. Pp. 48–140.',
    url: '',
    status: 'pending',
    kind: 'complementary',
  },
];

export const refById = (id: RefId): Reference => REFERENCES.find((r) => r.id === id)!;
