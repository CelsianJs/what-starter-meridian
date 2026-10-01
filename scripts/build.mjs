import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { renderRoute, publicRoutes } from '../src/server/render.mjs';

const siteUrl = resolveSiteUrl();
const staticRoot = 'dist/static';
rmSync(staticRoot, { recursive: true, force: true });
mkdirSync(staticRoot, { recursive: true });

const viteManifest = JSON.parse(readText('dist/client/.vite/manifest.json'));
const clientEntry = viteManifest['src/client/main.jsx'];
const assetName = clientEntry.file.split('/').pop();
mkdirSync(join(staticRoot, 'assets'), { recursive: true });
cpSync('dist/client/assets', join(staticRoot, 'assets'), { recursive: true });
copyFileSync('src/styles.css', join(staticRoot, 'site.css'));

const routes = publicRoutes();
for (const route of routes) {
  const html = renderRoute(route, siteUrl).replace('/assets/main.js', `/assets/${assetName}`);
  const file = route === '/' ? 'index.html' : join(route.slice(1), 'index.html');
  writeFile(file, html);
}
copyFileSync(join(staticRoot, '404', 'index.html'), join(staticRoot, '404.html'));
writeFileSync(join(staticRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(join(staticRoot, 'sitemap.xml'), sitemap(routes, siteUrl));
writeFileSync('dist/manifest.json', JSON.stringify({
  version: 1,
  type: 'static',
  routes: routes.filter((route) => route !== '/404'),
  notFoundPage: '404.html',
  assets: readdirSync(join(staticRoot, 'assets')).map((file) => `assets/${file}`),
}, null, 2));

function writeFile(file, text) {
  const target = join(staticRoot, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function resolveSiteUrl() {
  const raw = process.env.SITE_URL || 'http://localhost:4173';
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an http(s) origin without path, query or hash');
  }
  return url.origin;
}

function sitemap(paths, origin) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.filter((path) => path !== '/404').map((path) => `  <url><loc>${new URL(path, origin)}</loc></url>`).join('\n')}\n</urlset>\n`;
}
