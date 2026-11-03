import type { ReactNode } from 'react';
import { RichText, Tex } from './Tex';

/** A highlighted LaTeX equation with a caption. Long equations scroll horizontally on small screens. */
export function EquationCard({ title, tex, note }: { title: string; tex: string; note?: ReactNode }) {
  return (
    <div className="equation-card">
      <div className="equation-card__title">{title}</div>
      <div className="equation-card__eq" tabIndex={0} role="group" aria-label={title}>
        <Tex tex={tex} block />
      </div>
      {note && <div className="equation-card__note">{typeof note === 'string' ? <RichText text={note} /> : note}</div>}
    </div>
  );
}

/** Definition list of named values, e.g. center, radius, foci. */
export function PropertyList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="props">
      {items.map((it, i) => (
        <div className="props__row" key={i}>
          <dt>{it.label}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
