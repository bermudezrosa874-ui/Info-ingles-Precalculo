import type { CSSProperties, ReactNode } from 'react';

interface UnitShellProps {
  id: string;
  eyebrow?: string;
  title: string;
  /** Accent colour of the unit (CSS colour). */
  accent: string;
  accentSoft: string;
  children: ReactNode;
}

/** Common wrapper of each unit: coloured identity, focusable heading (navigation target). */
export function UnitShell({ id, eyebrow, title, accent, accentSoft, children }: UnitShellProps) {
  const style = { ['--accent' as string]: accent, ['--accent-soft' as string]: accentSoft } as CSSProperties;
  return (
    <section id={id} className="unit" style={style} aria-labelledby={`${id}-title`}>
      <header className="unit__header">
        {eyebrow && <span className="unit__eyebrow">{eyebrow}</span>}
        <h2 id={`${id}-title`} className="unit__title" tabIndex={-1}>
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`.trim()}>
      {title && <h3 className="card__title">{title}</h3>}
      {children}
    </div>
  );
}
