import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'dist/static');
if (!existsSync(root)) throw new Error('dist/static missing; run npm run build first');
mkdirSync('.screenshots', { recursive: true });

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = join(root, decodeURIComponent(url.pathname));
  if (!extname(file)) file = join(file, 'index.html');
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, '404.html');
  res.setHeader('content-type', contentType(file));
  res.statusCode = file.endsWith('404.html') && !url.pathname.startsWith('/404') ? 404 : 200;
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

try {
  await check('desktop routes and direct guides load without console errors', async () => {
    const page = await browser.newPage({ viewport: { width: 1360, height: 920 } });
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    for (const path of ['/', '/guides', '/guides/cormorant-bay', '/bay', '/planner', '/build']) {
      const res = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      if (res.status() !== 200) throw new Error(`${path} status ${res.status()}`);
      if (await page.locator('h1').count() !== 1) throw new Error(`${path} h1 count`);
      if (path === '/') await page.screenshot({ path: '.screenshots/meridian-desktop.png', fullPage: true });
    }
    if (errors.length) throw new Error(errors.join(' | '));
    await page.close();
  });

  await check('planner reorders, switches timezone and exports JSON', async () => {
    const page = await browser.newPage();
    await page.goto(`${base}/planner`, { waitUntil: 'networkidle' });
    const first = await page.locator('.stop h3').first().textContent();
    await page.locator('button[aria-label*="later"]').first().click();
    const moved = await page.locator('.stop h3').nth(1).textContent();
    if (moved !== first) throw new Error(`stop did not move: ${first} -> ${moved}`);
    await page.locator('select').selectOption('Europe/Lisbon');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    const text = await page.locator('#json-export').inputValue();
    const parsed = JSON.parse(text);
    if (parsed.timezone !== 'Europe/Lisbon' || parsed.stops.length < 4) throw new Error(`bad export ${text}`);
    await page.close();
  });

  await check('corrupt storage recovers to a valid plan', async () => {
    const page = await browser.newPage();
    await page.addInitScript(() => localStorage.setItem('meridian-plan', '{"broken":true}'));
    await page.goto(`${base}/planner`, { waitUntil: 'networkidle' });
    if (await page.locator('.stop').count() < 4) throw new Error('sample route did not recover');
    await page.close();
  });

  await check('planner works when storage is denied', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 820 }, isMobile: true });
    await page.addInitScript(() => {
      const denied = () => { throw new DOMException('denied', 'SecurityError'); };
      Storage.prototype.getItem = denied;
      Storage.prototype.setItem = denied;
    });
    await page.goto(`${base}/planner`, { waitUntil: 'networkidle' });
    if (await page.locator('.stop').count() < 4) throw new Error('planner did not mount with storage denied');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    if (!(await page.locator('#json-export').inputValue()).includes('Meridian sample route')) throw new Error('export failed with storage denied');
    if (await page.locator('.storage-note').evaluate((node) => node.hidden)) throw new Error('storage boundary not visible');
    await page.screenshot({ path: '.screenshots/meridian-mobile.png', fullPage: true });
    await page.close();
  });

  await check('unknown path returns genuine 404', async () => {
    const res = await fetch(`${base}/unmarked-channel`);
    const html = await res.text();
    if (res.status !== 404) throw new Error(`status ${res.status}`);
    if (!html.includes('not on the chart')) throw new Error('404 copy missing');
  });
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

function contentType(file) {
  if (file.endsWith('.css')) return 'text/css';
  if (file.endsWith('.js')) return 'text/javascript';
  return 'text/html; charset=utf-8';
}
