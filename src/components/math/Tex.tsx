import { memo, useMemo, Fragment } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface TexProps {
  tex: string;
  block?: boolean;
  className?: string;
}

/** Renders LaTeX with KaTeX (offline, bundled). Falls back to the raw source on errors. */
export const Tex = memo(function Tex({ tex, block = false, className }: TexProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: block, strict: 'ignore' });
    } catch {
      return tex.replace(/</g, '&lt;');
    }
  }, [tex, block]);
  return <span className={className ?? (block ? 'tex-block' : 'tex-inline')} dangerouslySetInnerHTML={{ __html: html }} />;
});

/**
 * Text with inline math between $...$ and **bold** segments.
 * Dictionary strings use this so translations can embed formulas without changing them.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 2) return <Tex key={i} tex={p.slice(1, -1)} />;
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
