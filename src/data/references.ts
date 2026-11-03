/**
 * Bibliography (APA 7). Only sources whose link was opened and whose heading was checked are listed.
 */
export type RefId = 'os-linear' | 'os-ellipse' | 'os-hyperbola' | 'os-keyeq' | 'os-circle';

export interface Reference {
  id: RefId;
  /** Author(s) and year, e.g. "Abramson, J. (2021)". */
  authorYear: string;
  /** Title (italic in APA). */
  title: string;
  /** Publisher / container and locator, plain text. */
  detail: string;
  url: string;
}

export const REFERENCES: Reference[] = [
  {
    id: 'os-linear',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Section 2.3, Modeling with Linear Functions.',
    url: 'https://openstax.org/books/precalculus-2e/pages/2-3-modeling-with-linear-functions',
  },
  {
    id: 'os-ellipse',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Section 10.1, The Ellipse.',
    url: 'https://openstax.org/books/precalculus-2e/pages/10-1-the-ellipse',
  },
  {
    id: 'os-hyperbola',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Section 10.2, The Hyperbola.',
    url: 'https://openstax.org/books/precalculus-2e/pages/10-2-the-hyperbola',
  },
  {
    id: 'os-keyeq',
    authorYear: 'Abramson, J. (2021)',
    title: 'Precalculus 2e',
    detail: 'OpenStax. Chapter 10, Key Equations.',
    url: 'https://openstax.org/books/precalculus-2e/pages/10-key-equations',
  },
  {
    id: 'os-circle',
    authorYear: 'OpenStax',
    title: 'Intermediate Algebra 2e',
    detail: 'Section 11.1, Distance and Midpoint Formulas; Circles.',
    url: 'https://openstax.org/books/intermediate-algebra-2e/pages/11-1-distance-and-midpoint-formulas-circles',
  },
];

export const refById = (id: RefId): Reference => REFERENCES.find((r) => r.id === id)!;
