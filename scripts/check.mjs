import { existsSync } from 'node:fs';
import { guides, routes } from '../src/content.mjs';
import { validateVuraStaticManifest } from './vura-static-check.mjs';

const expected = routes.length;
if (!existsSync('dist/static/index.html')) throw new Error('missing root index');
if (!existsSync('dist/static/404.html')) throw new Error('missing root 404');
for (const guide of guides) {
  if (!existsSync(`dist/static/guides/${guide.slug}/index.html`)) throw new Error(`missing guide ${guide.slug}`);
  if (!existsSync(`dist/static${guide.alias}/index.html`)) throw new Error(`missing alias ${guide.alias}`);
}
const manifestPages = validateVuraStaticManifest(expected);
console.log(`check OK: ${routes.length} routes, ${guides.length} guides, ${manifestPages} canonical Vura manifest pages validated.`);
