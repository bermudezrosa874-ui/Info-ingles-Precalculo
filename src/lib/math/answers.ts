/**
 * Safe answer checking: a tiny expression parser (no eval) used to accept
 * mathematically equivalent numeric answers and equations.
 */

type Fn = (x: number, y: number) => number;

interface Tok {
  t: 'num' | 'id' | 'op';
  v: string;
}

function normalize(src: string): string {
  return src
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/×|·/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .replace(/\*\*/g, '^')
    .replace(/\s+/g, '');
}

function tokenize(s: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const lit = s.slice(i, j);
      if ((lit.match(/\./g) ?? []).length > 1 || lit === '.') return null;
      out.push({ t: 'num', v: lit });
      i = j;
    } else if (/[a-z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      const word = s.slice(i, j);
      // split greedily into known symbols (handles "xy", "2xsqrt", etc.)
      let k = 0;
      while (k < word.length) {
        if (word.startsWith('sqrt', k)) { out.push({ t: 'id', v: 'sqrt' }); k += 4; }
        else if (word.startsWith('pi', k)) { out.push({ t: 'id', v: 'pi' }); k += 2; }
        else if (word[k] === 'x' || word[k] === 'y') { out.push({ t: 'id', v: word[k] }); k++; }
        else return null;
      }
      i = j;
    } else if ('+-*/^()'.includes(ch)) {
      out.push({ t: 'op', v: ch });
      i++;
    } else return null;
  }
  return out;
}

/** Recursive-descent parser → closure. Returns null on syntax errors. */
function compile(src: string): Fn | null {
  const parsed = tokenize(normalize(src));
  if (!parsed || parsed.length === 0) return null;
  const toks: Tok[] = parsed;
  let p = 0;
  const isOp = (v: string) => p < toks.length && toks[p].t === 'op' && toks[p].v === v;

  function expr(): Fn | null {
    let left: Fn | null = term();
    if (!left) return null;
    while (isOp('+') || isOp('-')) {
      const op = toks[p++].v;
      const right = term();
      if (!right) return null;
      const l: Fn = left;
      left = op === '+' ? (x, y) => l(x, y) + right(x, y) : (x, y) => l(x, y) - right(x, y);
    }
    return left;
  }
  function startsFactor(): boolean {
    if (p >= toks.length) return false;
    const k = toks[p];
    return k.t === 'num' || k.t === 'id' || (k.t === 'op' && k.v === '(');
  }
  function term(): Fn | null {
    let left: Fn | null = unary();
    if (!left) return null;
    while (isOp('*') || isOp('/') || startsFactor()) {
      let op = '*';
      if (isOp('*') || isOp('/')) op = toks[p++].v;
      const right = unary();
      if (!right) return null;
      const l: Fn = left;
      left = op === '*' ? (x, y) => l(x, y) * right(x, y) : (x, y) => l(x, y) / right(x, y);
    }
    return left;
  }
  function unary(): Fn | null {
    if (isOp('-')) {
      p++;
      const f = unary();
      return f ? (x, y) => -f(x, y) : null;
    }
    if (isOp('+')) {
      p++;
      return unary();
    }
    return power();
  }
  function power(): Fn | null {
    const base = atom();
    if (!base) return null;
    if (isOp('^')) {
      p++;
      const exp = unary();
      if (!exp) return null;
      return (x, y) => Math.pow(base(x, y), exp(x, y));
    }
    return base;
  }
  function atom(): Fn | null {
    if (p >= toks.length) return null;
    const k = toks[p];
    if (k.t === 'num') {
      p++;
      const n = parseFloat(k.v);
      return () => n;
    }
    if (k.t === 'id') {
      p++;
      if (k.v === 'x') return (x) => x;
      if (k.v === 'y') return (_x, y) => y;
      if (k.v === 'pi') return () => Math.PI;
      const arg = atom(); // sqrt
      return arg ? (x, y) => Math.sqrt(arg(x, y)) : null;
    }
    if (k.v === '(') {
      p++;
      const f = expr();
      if (!f || !isOp(')')) return null;
      p++;
      return f;
    }
    return null;
  }

  const f = expr();
  return f && p === toks.length ? f : null;
}

/** Parses a plain number: "2", "-0.5", "0,5", "6/3", "sqrt(13)", "√13". */
export function parseNumber(input: string): number | null {
  let s = input.trim();
  if (s === '') return null;
  // Spanish decimal comma, only when there is no dot
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
  const f = compile(s);
  if (!f) return null;
  const v = f(0, 0);
  return Number.isFinite(v) ? v : null;
}

export function numericMatches(input: string, expected: number, tol = 1e-6): boolean {
  const v = parseNumber(input);
  return v !== null && Math.abs(v - expected) <= tol * Math.max(1, Math.abs(expected));
}

/** Compiles "lhs = rhs" as the function lhs − rhs. */
function compileEquation(src: string): Fn | null {
  const parts = src.split('=');
  if (parts.length !== 2) return null;
  const l = compile(parts[0]);
  const r = compile(parts[1]);
  if (!l || !r) return null;
  return (x, y) => l(x, y) - r(x, y);
}

/** True when the text is a syntactically valid equation "lhs = rhs" in x and y. */
export function parsesAsEquation(src: string): boolean {
  return compileEquation(src) !== null;
}

const SAMPLE: Array<[number, number]> = [
  [0, 0], [1, 0], [0, 1], [2, 1], [-1, 3], [3.5, -2], [-2.5, -1.5], [4, 5],
];

/**
 * Two equations are equivalent when their (lhs − rhs) functions are proportional
 * (non-zero constant ratio) on a set of sample points.
 */
export function equationsEquivalent(user: string, target: string): boolean {
  const f = compileEquation(user);
  const g = compileEquation(target);
  if (!f || !g) return false;
  let ratio: number | null = null;
  for (const [x, y] of SAMPLE) {
    const a = f(x, y);
    const b = g(x, y);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    const scale = Math.max(1, Math.abs(a), Math.abs(b));
    if (Math.abs(b) < 1e-9 * scale) {
      if (Math.abs(a) > 1e-7 * scale) return false;
      continue;
    }
    const q = a / b;
    if (ratio === null) ratio = q;
    else if (Math.abs(q - ratio) > 1e-7 * Math.max(1, Math.abs(ratio))) return false;
  }
  return ratio !== null && Math.abs(ratio) > 1e-9;
}
