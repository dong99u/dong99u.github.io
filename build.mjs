// node build.mjs
// registry.mjs 의 목록에서 메인(index.html), 프로젝트 페이지(<project>/index.html),
// 글 페이지(<project>/<slug>/index.html)를 만든다. 이 세 가지 index.html 은 모두 생성물이다.
// 글 페이지는 partial 이 장(<section class="ch …">)으로 쓰여 있으면 3판(css/base.css 머리말의 규칙),
// 아니면 2판 틀로 나온다.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { owner, projects, entries } from './registry.mjs';

const at = (p) => fileURLToPath(new URL(p, import.meta.url));
const read = (p) => readFileSync(at(p), 'utf8').trimEnd();
const fill = (text, slots) => Object.entries(slots).reduce((out, [key, value]) => out.replaceAll(key, String(value)), text);
const GSAP = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5';

const head = read('partials/_head.html');
const bar = read('partials/_bar.html');
const foot = read('partials/_foot.html');

function page(file, { root, title, description, styles = [], scripts = [], body }) {
  const links = styles.map((href) => `<link rel="stylesheet" href="${root}${href}">`).join('\n');
  const tags = scripts.map((src) => `<script src="${src.startsWith('https:') ? src : root + src}"></script>`).join('\n');
  const html = [
    fill(head, { '{{root}}': root, '{{title}}': title, '{{description}}': description, '{{styles}}': links }),
    body,
    fill(foot, { '{{scripts}}': tags }),
  ].join('\n') + '\n';
  mkdirSync(at(file.replace(/[^/]*$/, '') || './'), { recursive: true });
  writeFileSync(at(file), html);
  return file;
}

const entryList = (list, hrefOf) => `<ul class="list">\n${list.map((e) =>
  `  <li><a href="${hrefOf(e)}"><span class="list__lab">${e.label}</span><span class="list__name">${e.name}</span><span class="list__say">${e.sentence}</span></a></li>`).join('\n')}\n</ul>`;

// ①의 점은 intent-docs.json 에서 센다. ④의 문서 두 장은 줄 수만큼 줄을 그린다.
function dataSlots() {
  const docs = JSON.parse(read('intent-docs.json'));
  const count = (s) => docs.filter(([, status]) => status === s).length;
  const days = Math.max(...docs.map(([day]) => day));
  const perDay = new Map();
  for (const [day] of docs) perDay.set(day, (perDay.get(day) ?? 0) + 1);
  const rows = Math.max(...perDay.values());
  const CELL = 10;
  const seen = new Map();
  const dots = docs.map(([day, status]) => {
    const k = seen.get(day) ?? 0;
    seen.set(day, k + 1);
    const cx = (day - 1) * CELL + CELL / 2;
    const cy = rows * CELL - (k * CELL + CELL / 2);
    const hole = status === 2 ? `<circle class="hole" cx="${cx}" cy="${cy}" r="2"/>` : '';
    return `<circle class="dot" data-s="${status}" data-d="${day}" data-k="${k}" data-c="${perDay.get(day)}" cx="${cx}" cy="${cy}" r="3.7"/>${hole}`;
  });

  function sheet(lineCount, width, seed, lengthOf) {
    let state = seed;
    const rand = () => (state = (state * 1103515245 + 12345) % 2147483648) / 2147483648;
    const out = [];
    for (let i = 0; i < lineCount; i++) {
      const w = lengthOf(rand(), rand(), width);
      if (w > 0) out.push(`<rect x="0" y="${i + 0.25}" width="${w.toFixed(1)}" height="0.5"/>`);
    }
    return `<svg viewBox="-5 -4 ${width + 10} ${lineCount + 8}" preserveAspectRatio="none">${out.join('')}</svg>`;
  }

  return {
    '<!--@intent-dots-->': `<svg class="pile__dots" data-days="${days}" viewBox="0 0 ${days * CELL} ${rows * CELL}" role="img" aria-label="작성 날짜순으로 쌓은 의도 문서 ${docs.length}개. open ${count(0)}개, shipped ${count(1)}개, closed ${count(2)}개.">${dots.join('')}</svg>`,
    '<!--@sheet-69-->': sheet(69, 150, 7, (a, b, w) => (a < 0.14 ? 0 : a < 0.36 ? 8 + b * 34 : w * (0.72 + b * 0.28))),
    '<!--@sheet-99-->': sheet(99, 30, 11, (a, b, w) => (a < 0.14 ? 0 : w * (0.3 + b * 0.7))),
    '{{open}}': count(0),
    '{{shipped}}': count(1),
    '{{closed}}': count(2),
  };
}

const slots = dataSlots();
const made = [];

const redirects = Object.fromEntries(entries.filter((e) => e.oldHash).map((e) => [e.oldHash, `${e.project}/${e.slug}/`]));
made.push(page('index.html', {
  root: '',
  title: owner.name,
  description: `${owner.name}. ${owner.line}.`,
  body: [
    `<script>(function(){var to=${JSON.stringify(redirects)}[location.hash.slice(1)];if(to)location.replace(to);})();</script>`,
    `<main class="home">`,
    `<h1 class="home__name">${owner.name}</h1>`,
    `<p class="home__line">${owner.line}</p>`,
    ...projects.map((p) => [
      `<h2 class="home__project"><a href="${p.slug}/">${p.name}</a></h2>`,
      entryList(entries.filter((e) => e.project === p.slug), (e) => `${e.project}/${e.slug}/`),
    ].join('\n')),
    `</main>`,
  ].join('\n'),
}));

for (const p of projects) {
  const mine = entries.filter((e) => e.project === p.slug);
  made.push(page(`${p.slug}/index.html`, {
    root: '../',
    title: `${owner.name} · ${p.name}`,
    description: p.line,
    body: [
      fill(bar, { '{{left}}': `<a href="../">${owner.name}</a>`, '{{mid}}': '', '{{right}}': '' }),
      `<main class="home">`,
      `<h1 class="home__name">${p.name}</h1>`,
      `<p class="home__line">${p.line}</p>`,
      entryList(mine, (e) => `${e.slug}/`),
      `</main>`,
    ].join('\n'),
  }));

  mine.forEach((e, i) => {
    const key = `${e.project}/${e.slug}`;
    const partial = fill(read(`partials/${key}.html`), slots);
    const prev = mine[i - 1];
    const next = mine[i + 1];
    const step = (to, text) => (to ? `<a href="../${to.slug}/" aria-label="${text}: ${to.name}">${text}</a>` : `<span aria-hidden="true">${text}</span>`);
    const left = `<a href="../../">${owner.name}</a><a href="../">${p.name}</a>`;
    const right = `${step(prev, '이전')}${step(next, '다음')}`;
    const own = (dir, ext) => (existsSync(at(`${dir}/${key}.${ext}`)) ? [`${dir}/${key}.${ext}`] : []);
    const lib = [`${GSAP}/gsap.min.js`, `${GSAP}/ScrollTrigger.min.js`];

    // 3판: partial 이 장(<section class="ch …">)으로 쓰여 있으면 머리 장과 「다음 글」 장을 붙여 만든다.
    if (/<section[^>]*class="ch[\s"]/.test(partial)) {
      const [chapters, refs = ''] = partial.split('<!--@refs-->');
      const last = next
        ? `<a class="next frame fl" href="../${next.slug}/">\n<p class="next__lab"><b>${next.label}</b>${next.name}</p>\n<p class="next__say">${next.sentence}</p>\n<p class="next__go">다음 글 읽기</p>\n</a>`
        : `<a class="next frame fl" href="../">\n<p class="next__lab"><b>${p.name}</b>목록</p>\n<p class="next__say">${p.line}</p>\n<p class="next__go">목록으로</p>\n</a>`;
      made.push(page(`${key}/index.html`, {
        root: '../../',
        title: `${owner.name} · ${e.name}`,
        description: e.sentence,
        styles: own('css', 'css'),
        scripts: [...lib, 'js/story.js', ...own('js', 'js')],
        body: [
          fill(bar, { '{{left}}': left, '{{mid}}': '<p class="bar__at" data-at aria-live="off"></p>', '{{right}}': right }),
          `<ol class="prog" data-prog aria-label="장"></ol>`,
          `<main class="story">`,
          `<section class="ch ch--head" data-ch="머리">`,
          `<p class="ch__label"><b>${e.label}</b>${e.name}</p>`,
          `<h1 class="ch__say${e.sentence.length > 70 ? ' ch__say--long' : ''}">${e.sentence}</h1>`,
          e.when ? `<p class="ch__when">${e.when}</p>` : '',
          `<p class="ch__hint" aria-hidden="true">스크롤</p>`,
          `</section>`,
          chapters.trim(),
          `<section class="ch ch--next" data-ch="다음 글">`,
          `<h2 class="vh">다음 글</h2>`,
          last,
          refs.trim() ? `<div class="refs">\n${refs.trim()}\n</div>` : '',
          `</section>`,
          `</main>`,
        ].filter(Boolean).join('\n'),
      }));
      return;
    }

    // 2판 틀. 아직 장으로 옮기지 않은 글. css/legacy.css 와 js/scene.js 로 예전 모습 그대로 나온다.
    const [proof, after = ''] = partial.split('<!--@after-->');
    made.push(page(`${key}/index.html`, {
      root: '../../',
      title: `${owner.name} · ${e.name}`,
      description: e.sentence,
      styles: ['css/legacy.css', ...own('css', 'css')],
      scripts: [...lib, 'js/scene.js', ...own('js', 'js')],
      body: [
        fill(bar, { '{{left}}': left, '{{mid}}': '', '{{right}}': right }),
        `<main>`,
        `<section class="scene" data-scene style="--len:${e.scroll}">`,
        `<div class="scene__stage">`,
        `<h1 class="say">${e.sentence}</h1>`,
        `<div class="proof">`,
        proof.trim(),
        `</div>`,
        `<p class="scene__hint" data-hint aria-hidden="true">스크롤 ↓</p>`,
        `</div>`,
        `</section>`,
        `<div class="after">`,
        after.trim(),
        `</div>`,
        `</main>`,
      ].join('\n'),
    }));
  });
}

console.log(made.join('\n'));
