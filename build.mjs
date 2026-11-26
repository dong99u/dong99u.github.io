// node build.mjs
// partials/*.html 을 정해진 순서로 이어 index.html 을 만든다. index.html 은 생성물이다.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ORDER = ['00-head', '01-intent', '02-loop', '03-rules', '04-cases', '05-foot'];
const at = (p) => fileURLToPath(new URL(p, import.meta.url));

const out = [];
const missing = [];
for (const name of ORDER) {
  const file = at(`partials/${name}.html`);
  if (!existsSync(file)) { missing.push(name); continue; }
  out.push(readFileSync(file, 'utf8').trimEnd());
}

writeFileSync(at('index.html'), out.join('\n\n') + '\n');
console.log(`index.html: ${out.length}/${ORDER.length} partials`);
if (missing.length) console.warn(`없는 partial(건너뜀): ${missing.join(', ')}`);
