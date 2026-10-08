import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'dist/static');
const evidence = process.env.STYLE_SHOT_DIR || '/tmp/meridian-modern-evidence';
const server = createServer((req, res) => {
  let file = join(root, new URL(req.url, 'http://local').pathname);
  if (!extname(file)) file = join(file, 'index.html');
  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = join(root, '404.html');
    res.statusCode = 404;
  }
  res.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  res.end(readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
mkdirSync(evidence, { recursive: true });
try {
  for (const width of [1440, 390, 1505]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : width === 1505 ? 1045 : 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [name, path] of [['home', '/'], ['guide', '/guides/cormorant-bay'], ['planner', '/planner?guide=saltline-reach'], ['build', '/build']]) {
      await page.goto(`http://127.0.0.1:${server.address().port}${path}`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1);
      const metrics = await page.evaluate(() => {
        const title = document.querySelector('h1');
        const titleStyle = getComputedStyle(title);
        const bodyStyle = getComputedStyle(document.body);
        return { titleSize: parseFloat(titleStyle.fontSize), titleLineHeight: parseFloat(titleStyle.lineHeight), titleHeight: title.getBoundingClientRect().height, bodySize: parseFloat(bodyStyle.fontSize), overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth };
      });
      assert.ok(metrics.titleSize <= (width === 390 ? 34 : 48), `${name}: title exceeds the shared readable scale`);
      assert.ok(metrics.titleLineHeight >= metrics.titleSize, `${name}: title lines must not overlap`);
      assert.ok(metrics.titleHeight < 170, `${name}: title must not consume the product viewport`);
      assert.equal(metrics.bodySize, 16);
      assert.equal(metrics.overflow, false, `${name}: horizontal overflow`);
      assert.ok((await page.locator('.brand').boundingBox()).height >= 44, `${name}: home brand target`);
      const plots = page.locator('.route-map:visible');
      if (name !== 'build') assert.ok(await plots.count() > 0, `${name}: visible real route graphic`);
      for (const plot of await plots.all()) {
        const labels = await plot.locator('text').evaluateAll(nodes => nodes.map(node => ({ height: node.getBoundingClientRect().height, text: node.textContent })));
        assert.ok(labels.every(label => label.height >= 12), `${name}: chart labels must remain readable after SVG scaling ${JSON.stringify(labels)}`);
      }
      if (name !== 'home') assert.equal(await page.locator('nav [aria-current]').count(), 1, `${name}: current navigation context`);
      await page.screenshot({ path: join(evidence, `${name}-${width}.png`), fullPage: false });
      if (name === 'home') {
        const guides = await page.locator('.grid').boundingBox();
        if (width > 1000) assert.ok(guides.y < 560, 'guides must start inside the first product viewport');
        const action = await page.getByRole('link', { name: 'Open planner' }).boundingBox();
        assert.ok(action.height >= 44 && action.height <= 52, 'primary action uses the shared control height');
        await page.getByRole('link', { name: 'Open planner' }).focus();
        assert.ok(await page.getByRole('link', { name: 'Open planner' }).evaluate(node => getComputedStyle(node).outlineStyle !== 'none'));
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('Meridian modern visual regression: home/guide/planner/build, 1440/390/native-reference width, bounded type, first-screen guides, controls/focus and console PASS');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
