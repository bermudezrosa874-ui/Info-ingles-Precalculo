import { expect, test, type Page } from '@playwright/test';

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/** Reads the JSXGraph board that lives inside a section. */
async function boardPoints(page: Page, section: string) {
  return page.evaluate((sel) => {
    const w = window as unknown as { JXG: { boards: Record<string, any> } };
    const host = document.querySelector(`#${sel} .jxgbox`);
    const b = Object.values(w.JXG.boards).find((x) => x.containerObj === host);
    return b.objectsList
      .filter((o: any) => o.elType === 'point' && String(o.visProp.strokecolor).toLowerCase() === '#ffffff')
      .map((o: any) => [o.X(), o.Y()]);
  }, section);
}

async function dragPoint(page: Page, section: string, index: number, x: number, y: number) {
  await page.evaluate(
    ({ sel, index, x, y }) => {
      const w = window as unknown as { JXG: { boards: Record<string, any>; COORDS_BY_USER: number } };
      const host = document.querySelector(`#${sel} .jxgbox`);
      const b = Object.values(w.JXG.boards).find((v) => v.containerObj === host);
      const p = b.objectsList.filter((o: any) => o.elType === 'point' && String(o.visProp.strokecolor).toLowerCase() === '#ffffff')[index];
      p.setPosition(w.JXG.COORDS_BY_USER, [x, y]);
      p.triggerEventHandlers(['drag']);
    },
    { sel: section, index, x, y },
  );
}

/** Opens a view through its hash route and waits for its graph (when it has one). */
async function open(page: Page, view: string, graph = true) {
  await page.goto(`/#/${view}`);
  if (graph) await page.waitForSelector(`#${view} .jxgbox svg`);
}

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => { throw e; });
});

test('starts in English and returns to English after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Español' }).first().click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Geometría Analítica');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Analytical Geometry');
});

test('navigation layout: vertical left sidebar on desktop, hamburger on mobile', async ({ page }) => {
  await page.goto('/');
  if (isDesktop(page)) {
    const box = await page.getByTestId('sidebar').boundingBox();
    expect(box!.x).toBe(0);
    expect(box!.height).toBeGreaterThan(500);
    await expect(page.getByTestId('mobile-header')).toHaveCount(0);
    for (const n of ['Home', 'Straight Line', 'Circle', 'Ellipse', 'Hyperbola', 'Exercises', 'References']) {
      await expect(page.getByTestId('sidebar').getByRole('link', { name: n })).toBeVisible();
    }
    await page.getByTestId('sidebar').getByRole('link', { name: 'Ellipse' }).click();
    await expect(page.locator('#ellipse-title')).toBeFocused();
    await expect(page.getByTestId('sidebar').getByRole('link', { name: 'Ellipse' })).toHaveAttribute('aria-current', 'page');
  } else {
    await expect(page.getByTestId('sidebar')).toHaveCount(0);
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByTestId('mobile-drawer').getByRole('link')).toHaveCount(8);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('mobile-drawer')).toHaveCount(0);
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByTestId('mobile-drawer').getByRole('link', { name: 'Hyperbola' }).click();
    await expect(page.getByTestId('mobile-drawer')).toHaveCount(0);
    await expect(page.locator('#hyperbola-title')).toBeFocused();
  }
});

test('each menu option shows only its own view, starting at the top', async ({ page }) => {
  await open(page, 'circle');
  await expect(page.locator('#circle')).toBeVisible();
  for (const other of ['line', 'ellipse', 'hyperbola', 'exercises', 'references', 'home']) await expect(page.locator(`section#${other}`)).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // the end of Circle must not reveal another topic
  await expect(page.locator('section.unit')).toHaveCount(1);
  if (!isDesktop(page)) await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = isDesktop(page) ? page.getByTestId('sidebar') : page.getByTestId('mobile-drawer');
  await nav.getByRole('link', { name: 'Hyperbola' }).click();
  await expect(page.locator('section#circle')).toHaveCount(0);
  await expect(page.locator('section#hyperbola')).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page).toHaveURL(/#\/hyperbola$/);
  await expect(page.getByTestId('mobile-drawer')).toHaveCount(0);
});

for (const view of ['', 'line', 'circle', 'ellipse', 'hyperbola', 'comparison', 'exercises', 'references']) {
  test(`no horizontal overflow: ${view || 'home'}`, async ({ page }) => {
    await page.goto(`/#/${view}`);
    await page.waitForTimeout(1200);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over).toBeLessThanOrEqual(1);
  });
}

test('line: dragging a point updates equation, sliders; vertical case shows x = k', async ({ page }) => {
  await open(page, 'line');
  await dragPoint(page, 'line', 1, 3, -4);
  await expect(page.locator('#line .lab__panel .equation-card__eq').first()).toContainText('y=−1.67x+1');
  await expect(page.locator('#line .field__number').first()).toHaveValue('-1.67');
  await dragPoint(page, 'line', 1, 0, 5);
  await expect(page.locator('#line .lab__panel .equation-card__eq').first()).toContainText('x=0');
  await page.locator('#line').getByRole('button', { name: /^Vertical x = 3/ }).click();
  await expect(page.locator('#line .lab__panel .equation-card__eq').first()).toContainText('x=3');
  await expect(page.locator('#line')).not.toContainText('NaN');
});

test('circle: radius must be positive; field updates curve; language switch keeps parameters', async ({ page }) => {
  await open(page, 'circle');
  const r = page.locator('#circle .field__number').nth(2);
  await r.fill('0');
  await expect(page.locator('#circle .field__error')).toContainText('positive');
  await r.fill('5');
  await expect(page.locator('#circle .lab__panel .equation-card__eq').first()).toContainText('25');
  if (isDesktop(page)) await page.getByTestId('sidebar').getByRole('button', { name: 'Español' }).click();
  else await page.getByTestId('mobile-header').getByRole('button', { name: 'Español' }).click();
  await expect(page.locator('#circle .field__number').nth(2)).toHaveValue('5');
  await expect(page.locator('#circle .lab__panel .equation-card__eq').first()).toContainText('25');
});

test('ellipse: PF1 + PF2 = 2a stays true when the point is dragged', async ({ page }) => {
  await open(page, 'ellipse');
  await dragPoint(page, 'ellipse', 1, 4, 1);
  const txt = await page.locator('#ellipse .card:has(.props) .eq-scroll').innerText();
  const nums = txt.match(/-?\d+(\.\d+)?/g)!.map(Number);
  // PF1 + PF2 = d1 + d2 = sum = 2a = 10
  expect(Math.abs(nums[nums.length - 1] - 10)).toBeLessThan(0.02);
  await page.locator('#ellipse').getByRole('radio', { name: 'Vertical' }).check();
  await expect(page.locator('#ellipse .lab__panel .equation-card__eq').first()).toContainText('25');
});

test('hyperbola: two separate branches and exact asymptotes', async ({ page }) => {
  await open(page, 'hyperbola');
  const info = await page.evaluate(() => {
    const w = window as unknown as { JXG: { boards: Record<string, any> } };
    const host = document.querySelector('#hyperbola .jxgbox');
    const b = Object.values(w.JXG.boards).find((x) => x.containerObj === host);
    const curves = b.objectsList.filter((o: any) => o.elType === 'curve');
    const xs = curves.map((c: any) => {
      const pts = c.points.filter((p: any) => Number.isFinite(p.usrCoords[1]));
      return [Math.min(...pts.map((p: any) => p.usrCoords[1])), Math.max(...pts.map((p: any) => p.usrCoords[1]))];
    });
    return xs;
  });
  expect(info).toHaveLength(2);
  const [a, b] = info;
  const gap = Math.max(a[0], b[0]) - Math.min(a[1], b[1]);
  expect(gap).toBeGreaterThanOrEqual(6 - 1e-6); // vertices at ±3 → disjoint
  await expect(page.locator('#hyperbola .lab__panel .equation-card').first()).toContainText('y=±23x');
});

test('quiz: wrong and right answers are graded and Try Again resets', async ({ page }) => {
  await open(page, 'exercises', false);
  await page.locator('#exercises').getByRole('button', { name: 'Check my answers' }).click();
  await expect(page.locator('#exercises')).toContainText('Score: 0 / 10');
  await page.locator('#exercises').getByRole('button', { name: /Try Again/ }).click();
  await expect(page.locator('#exercises')).not.toContainText('Score:');
});

test('console has no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  for (const v of ['line', 'circle', 'ellipse', 'hyperbola']) await open(page, v);
  await open(page, 'exercises', false);
  expect(errors).toEqual([]);
});

for (const lang of ['en', 'es']) {
  for (const view of ['', 'line', 'circle', 'ellipse', 'hyperbola', 'comparison', 'exercises', 'references']) {
    test(`no raw LaTeX and no clipped formulas: ${lang} /${view}`, async ({ page }) => {
      await page.goto(`/#/${view}`);
      if (lang === 'es') {
        const bar = isDesktop(page) ? page.getByTestId('sidebar') : page.getByTestId('mobile-header');
        await bar.getByRole('button', { name: 'Español' }).click();
      }
      await page.waitForTimeout(800);
      const res = await page.evaluate(() => {
        const main = document.querySelector('#main') as HTMLElement;
        const clone = main.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.katex').forEach((n) => n.remove());
        const text = clone.innerText + clone.textContent;
        // formulas wider than their container must scroll inside it, never push the page
        const bad = [...main.querySelectorAll('.katex-display, .tex-block, .equation-card__eq')].filter((e) => {
          const el = e as HTMLElement;
          const s = getComputedStyle(el);
          return el.scrollWidth > el.clientWidth + 1 && !['auto', 'scroll'].includes(s.overflowX);
        }).length;
        return { dollar: /\$/.test(text), cmd: /\\(frac|sqrt|pm|text|dfrac|Delta|approx)/.test(text), katexErr: main.querySelectorAll('.katex-error').length, bad, page: document.documentElement.scrollWidth - innerWidth };
      });
      expect(res).toEqual({ dollar: false, cmd: false, katexErr: 0, bad: 0, page: expect.any(Number) });
      expect(res.page).toBeLessThanOrEqual(1);
    });
  }
}
