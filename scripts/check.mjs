import { existsSync, readFileSync } from 'node:fs';
import { guides, routes } from '../src/content.mjs';

const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
const expected = routes.filter((route) => route.path !== '/404').length;
if (!existsSync('dist/static/index.html')) throw new Error('missing root index');
if (!existsSync('dist/static/404.html')) throw new Error('missing root 404');
for (const guide of guides) {
  if (!existsSync(`dist/static/guides/${guide.slug}/index.html`)) throw new Error(`missing guide ${guide.slug}`);
  if (!existsSync(`dist/static${guide.alias}/index.html`)) throw new Error(`missing alias ${guide.alias}`);
}
if (manifest.routes.length !== expected) throw new Error(`manifest route mismatch ${manifest.routes.length}/${expected}`);
console.log(`check OK: ${routes.length} routes, ${guides.length} guides, ${manifest.routes.length} manifest pages.`);
