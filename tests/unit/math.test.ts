import { describe, expect, it } from 'vitest';
import { equationsEquivalent, numericMatches, parseNumber, parsesAsEquation } from '../../src/lib/math/answers';
import { circleFromGeneral, circleInfo, isValidRadius, standardTex } from '../../src/lib/math/circle';
import { dist, ellipseInfo, ellipsePoint, ellipseTex, normalizeAxes, type EllipseState } from '../../src/lib/math/ellipse';
import { fmt } from '../../src/lib/math/format';
import { asymptotesTex, hyperbolaInfo, hyperbolaPoint, hyperbolaTex, type HyperbolaState } from '../../src/lib/math/hyperbola';
import { analyzeLine, generalFormTex, lineFromSlopeIntercept, slopeBetween, slopeInterceptTex } from '../../src/lib/math/line';

describe('line', () => {
  it('y = 2x + 1 through (0,1) and (1,3)', () => {
    const i = analyzeLine({ x1: 0, y1: 1, x2: 1, y2: 3 });
    expect(i.m).toBe(2);
    expect(i.b).toBe(1);
    expect(slopeInterceptTex(i, 0)).toBe('y = 2x + 1');
    expect(i.xIntercept).toBeCloseTo(-0.5);
  });
  it('slope of (1,2),(3,6) is 2', () => expect(slopeBetween(1, 2, 3, 6)).toBe(2));
  it('vertical line never divides by zero', () => {
    const i = analyzeLine({ x1: 3, y1: -2, x2: 3, y2: 4 });
    expect(i.vertical).toBe(true);
    expect(i.m).toBeNull();
    expect(slopeBetween(3, 1, 3, 5)).toBeNull();
    expect(slopeInterceptTex(i, 3)).toBe('x = 3');
    expect(generalFormTex(i)).not.toMatch(/NaN|Infinity/);
  });
  it('coincident points are degenerate', () => expect(analyzeLine({ x1: 1, y1: 1, x2: 1, y2: 1 }).degenerate).toBe(true));
  it('slider update keeps points consistent', () => {
    const s = lineFromSlopeIntercept({ x1: 0, y1: 1, x2: 1, y2: 3 }, -1, 4);
    const i = analyzeLine(s);
    expect(i.m).toBeCloseTo(-1);
    expect(i.b).toBeCloseTo(4);
  });
  it('leaving the vertical case separates the x coordinates', () => {
    const s = lineFromSlopeIntercept({ x1: 3, y1: 0, x2: 3, y2: 5 }, 1, 0);
    expect(s.x2).not.toBe(s.x1);
  });
});

describe('circle', () => {
  it('standard form for center (2,-1), r=3', () => expect(standardTex(2, -1, 3)).toBe('(x - 2)^2 + (y + 1)^2 = 9'));
  it('general-form coefficients', () => {
    const i = circleInfo({ h: 2, k: -1, r: 3, theta: 0 });
    expect([i.D, i.E, i.F]).toEqual([-4, 2, -4]);
  });
  it('classifies the general form', () => {
    const r = circleFromGeneral(-6, 4, -12);
    expect(r.kind).toBe('circle');
    if (r.kind === 'circle') expect([r.h, r.k, r.r]).toEqual([3, -2, 5]);
    expect(circleFromGeneral(0, 0, 0).kind).toBe('point');
    expect(circleFromGeneral(0, 0, 4).kind).toBe('empty');
  });
  it('radius must be positive and finite', () => {
    expect(isValidRadius(0)).toBe(false);
    expect(isValidRadius(-2)).toBe(false);
    expect(isValidRadius(NaN)).toBe(false);
    expect(isValidRadius(Infinity)).toBe(false);
    expect(isValidRadius(2.5)).toBe(true);
  });
});

describe('ellipse', () => {
  const e: EllipseState = { h: 1, k: -2, a: 5, b: 3, orient: 'h', t: 1 };
  it('example elements', () => {
    const i = ellipseInfo(e);
    expect(i.c).toBe(4);
    expect(i.e).toBeCloseTo(0.8);
    expect(i.vertices).toEqual([[-4, -2], [6, -2]]);
    expect(i.covertices).toEqual([[1, -5], [1, 1]]);
    expect(i.foci).toEqual([[-3, -2], [5, -2]]);
    expect(ellipseTex(e)).toBe('\\frac{(x - 1)^2}{25} + \\frac{(y + 2)^2}{9} = 1');
  });
  it('PF1 + PF2 = 2a for every point (both orientations)', () => {
    for (const orient of ['h', 'v'] as const) {
      const s = { ...e, orient };
      const i = ellipseInfo(s);
      for (let t = 0; t < 6.3; t += 0.37) {
        const p = ellipsePoint(s, t);
        expect(dist(p, i.foci[0]) + dist(p, i.foci[1])).toBeCloseTo(2 * s.a, 9);
      }
    }
  });
  it('vertical orientation moves the elements to the y direction', () => {
    const i = ellipseInfo({ ...e, orient: 'v' });
    expect(i.foci).toEqual([[1, -6], [1, 2]]);
    expect(i.vertices).toEqual([[1, -7], [1, 3]]);
  });
  it('a = b is the circle case', () => {
    const i = ellipseInfo({ ...e, a: 3, b: 3 });
    expect(i.isCircle).toBe(true);
    expect(i.c).toBe(0);
    expect(i.e).toBe(0);
  });
  it('keeps a >= b', () => {
    expect(normalizeAxes(2, 4, 'a')).toEqual({ a: 4, b: 4, adjusted: true });
    expect(normalizeAxes(4, 6, 'b')).toEqual({ a: 4, b: 4, adjusted: true });
    expect(normalizeAxes(5, 3, 'a').adjusted).toBe(false);
  });
});

describe('hyperbola', () => {
  const h: HyperbolaState = { h: 0, k: 0, a: 3, b: 2, orient: 'h', u: 0.7, s: 1 };
  it('example elements', () => {
    const i = hyperbolaInfo(h);
    expect(i.c).toBeCloseTo(Math.sqrt(13));
    expect(i.vertices).toEqual([[-3, 0], [3, 0]]);
    expect(i.slope).toBeCloseTo(2 / 3);
    expect(hyperbolaTex(h)).toBe('\\frac{x^2}{9} - \\frac{y^2}{4} = 1');
    expect(asymptotesTex(h)).toContain('\\pm');
  });
  it('|PF1 - PF2| = 2a on both branches and both orientations', () => {
    for (const orient of ['h', 'v'] as const) {
      for (const s of [1, -1] as const) {
        const st = { ...h, orient, s };
        const i = hyperbolaInfo(st);
        for (let u = -2; u <= 2; u += 0.4) {
          const p = hyperbolaPoint(st, u, s);
          expect(Math.abs(dist(p, i.foci[0]) - dist(p, i.foci[1]))).toBeCloseTo(2 * st.a, 8);
        }
      }
    }
  });
  it('branches stay separate (|x - h| >= a)', () => {
    for (let u = -3; u <= 3; u += 0.5) expect(Math.abs(hyperbolaPoint(h, u, 1)[0])).toBeGreaterThanOrEqual(h.a - 1e-9);
  });
  it('vertical asymptote slope is a/b', () => expect(hyperbolaInfo({ ...h, orient: 'v' }).slope).toBeCloseTo(1.5));
  it('exercise: x²/16 − y²/9 = 1 gives c = 5', () => expect(hyperbolaInfo({ ...h, a: 4, b: 3 }).c).toBe(5));
});

describe('answers', () => {
  it('parses numbers', () => {
    expect(parseNumber('2')).toBe(2);
    expect(parseNumber('6/3')).toBe(2);
    expect(parseNumber('0,5')).toBe(0.5);
    expect(parseNumber('−3')).toBe(-3);
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('1/0')).toBeNull();
    expect(parseNumber('')).toBeNull();
  });
  it('numeric tolerance', () => {
    expect(numericMatches('4.0000001', 4)).toBe(true);
    expect(numericMatches('4.1', 4)).toBe(false);
  });
  it('accepts equivalent circle equations', () => {
    const target = '(x-3)^2+(y+2)^2=16';
    expect(equationsEquivalent('(x-3)^2 + (y+2)^2 = 16', target)).toBe(true);
    expect(equationsEquivalent('(x−3)²+(y+2)²=16', target)).toBe(true);
    expect(equationsEquivalent('x^2+y^2-6x+4y-3=0', target)).toBe(true);
    expect(equationsEquivalent('16=(x-3)^2+(y+2)^2', target)).toBe(true);
    expect(equationsEquivalent('(x+3)^2+(y+2)^2=16', target)).toBe(false);
    expect(equationsEquivalent('(x-3)^2+(y+2)^2=4', target)).toBe(false);
    expect(equationsEquivalent('(x-3)^2+(y-2)^2=16', target)).toBe(false);
  });
  it('rejects malformed equations without throwing', () => {
    expect(parsesAsEquation('hello')).toBe(false);
    expect(parsesAsEquation('(x-3)^2+')).toBe(false);
    expect(equationsEquivalent('(x-3', 'x=1')).toBe(false);
  });
});

describe('format', () => {
  it('never renders NaN / Infinity / negative zero', () => {
    expect(fmt(NaN)).toBe('—');
    expect(fmt(Infinity)).toBe('—');
    expect(fmt(-0.001)).toBe('0');
    expect(fmt(2.5)).toBe('2.5');
  });
});
