// PDF 포트폴리오 만들기: pages/ 의 A4 장표(캔버스에서 받은 .dc.html)를 pages/order.json 의 순서대로 이어 한 파일로 인쇄한다.
// 실행: npx -y -p playwright sh -c 'NODE_PATH=$(dirname $(dirname $(which playwright))) node pdf/build.mjs'
// 결과: pdf/portfolio.html (인쇄용 한 장짜리 HTML), pdf/박동규_포트폴리오.pdf
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const order = JSON.parse(readFileSync(join(here, 'pages/order.json'), 'utf8')).order;
const assets = Object.fromEntries(readdirSync(join(here, 'assets')).map((f) => [f.split('.')[0], f]));
const fonts = new Set();
const pages = order.map((name, i) => {
  const src = readFileSync(join(here, 'pages', name), 'utf8');
  const inner = src.slice(src.indexOf('<x-dc>') + 6, src.indexOf('</x-dc>'));
  const helmet = inner.slice(inner.indexOf('<helmet>') + 8, inner.indexOf('</helmet>'));
  for (const m of helmet.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/g)) fonts.add(m[1]);
  const css = (helmet.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
  const body = inner.slice(inner.indexOf('</helmet>') + 9).replace(/\/_blob\/([0-9a-f]+)/g, (all, id) => {
    if (!assets[id]) throw new Error(`${name}: 그림 ${id} 가 assets/ 에 없다`);
    return 'assets/' + assets[id];
  });
  return `<section class="pg pg-${i + 1}"><style>.pg-${i + 1}{${css}}</style>${body}</section>`;
});
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>박동규 포트폴리오</title>
${[...fonts].map((f) => `<link rel="stylesheet" href="${f}">`).join('\n')}
<style>
@page { size: 794px 1123px; margin: 0; }
html, body { margin: 0; background: #fff; }
.pg { width: 794px; height: 1123px; overflow: hidden; break-after: page; }
.pg:last-child { break-after: auto; }
@media screen { body { background: #e9ebef; } .pg { margin: 24px auto; box-shadow: 0 2px 16px rgba(0, 0, 0, .12); } }
</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>
`;
writeFileSync(join(here, 'portfolio.html'), html);

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.goto('file://' + join(here, 'portfolio.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.getAttribute('src')));
if (broken.length) throw new Error('안 뜬 그림: ' + broken.join(', '));
const over = await page.evaluate(() => [...document.querySelectorAll('.pg')].map((p, i) => [i + 1, p.firstElementChild?.nextElementSibling?.scrollHeight ?? 0]).filter(([, h]) => h > 1123));
await page.pdf({ path: join(here, '박동규_포트폴리오.pdf'), width: '794px', height: '1123px', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
for (let i = 0; i < order.length; i++) await page.locator('.pg').nth(i).screenshot({ path: join(here, '..', '.shots', `pdf-${String(i + 1).padStart(2, '0')}.png`) });
await browser.close();
console.log(`${order.length}쪽`, over.length ? '넘친 쪽: ' + JSON.stringify(over) : '넘친 쪽 없음');
