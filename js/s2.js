/* s2.js · ② 에이전트 루프. 기계는 화면 안에 있을 때만 돈다(DERO.onView). */
(() => {
  const D = document, DERO = window.DERO;
  const sec = D.getElementById('loop');
  if (!sec || !DERO) return;
  const $ = (s, r = sec) => r.querySelector(s);
  const $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const G = DERO.gsap;
  const still = DERO.still, reduced = DERO.reduced;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, parent, text) => {
    const e = D.createElementNS(NS, tag);
    for (const k in at) e.setAttribute(k, at[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const h = (tag, cls, parent, text) => {
    const e = D.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };

  const hero = $('[data-machine]');
  const svg = $('[data-stage]');
  const fx = $('[data-fx]');
  if (!hero || !svg || !fx) return;

  /* ---------- 배치: 넓은 화면, 좁은 화면 ---------- */
  const WIDE = {
    W: 1200, H: 440, tall: false,
    n: {
      sentry: [88, 100, 136, 48], slack: [88, 180, 136, 48], risk: [88, 260, 136, 48],
      intake: [240, 180, 100, 64], triage: [380, 180, 96, 64], repro: [516, 180, 96, 64], fix: [660, 180, 104, 64],
      gate: [850, 92, 144, 60], screen: [850, 180, 144, 60], diff: [850, 268, 144, 60],
      cmp: [1004, 180, 100, 132], merge: [1134, 180, 92, 64],
      review: [660, 394, 150, 48], release: [1134, 394, 100, 48],
    },
    e: {
      s_sentry: 'M156,100 C182,100 166,180 190,180', s_slack: 'M156,180 L190,180', s_risk: 'M156,260 C182,260 166,180 190,180',
      it: 'M290,180 L332,180', tr: 'M428,180 L468,180', rf: 'M564,180 L608,180',
      fg: 'M712,180 C750,180 740,92 778,92', fs: 'M712,180 L778,180', fd: 'M712,180 C750,180 740,268 778,268',
      gc: 'M922,92 C944,92 932,146 954,146', sc: 'M922,180 L954,180', dc: 'M922,268 C944,268 932,214 954,214',
      cm: 'M1054,180 L1088,180',
      back: 'M836,298 C836,338 684,338 684,212',
      risk: 'M640,212 L640,370', rel: 'M1134,212 L1134,370',
    },
    zones: [
      { box: [12, 28, 292, 308], lab: '신호 · 접수' },
      { box: [316, 28, 418, 308], lab: '재현과 수정 · Cursor Automations' },
      { box: [746, 28, 320, 308], lab: '머지 관문 · 코드를 쓰지 않은 검증자 3명' },
      { box: [1078, 28, 110, 308], lab: '머지' },
    ],
    lane: [12, 354, 1176, 78],
    ev: { before: [516, 122], after: [660, 122] },
  };
  const TALL = {
    W: 360, H: 580, tall: true,
    n: {
      sentry: [70, 30, 104, 40], slack: [184, 30, 104, 40], risk: [298, 30, 104, 40],
      intake: [136, 98, 164, 42], triage: [136, 156, 164, 42], repro: [136, 214, 164, 42], fix: [136, 274, 164, 42],
      review: [306, 274, 88, 42],
      gate: [62, 372, 68, 58], screen: [136, 372, 68, 58], diff: [210, 372, 68, 58],
      cmp: [136, 458, 216, 56], merge: [136, 538, 164, 42], release: [306, 538, 88, 42],
    },
    e: {
      s_sentry: 'M70,50 C70,68 110,60 110,77', s_slack: 'M184,50 C184,68 136,60 136,77', s_risk: 'M298,50 C298,70 162,58 162,77',
      it: 'M136,119 L136,135', tr: 'M136,177 L136,193', rf: 'M136,235 L136,253',
      fg: 'M136,295 C136,324 62,316 62,343', fs: 'M136,295 L136,343', fd: 'M136,295 C136,324 210,316 210,343',
      gc: 'M62,401 C62,420 84,412 84,430', sc: 'M136,401 L136,430', dc: 'M210,401 C210,420 188,412 188,430',
      cm: 'M136,486 L136,517',
      back: 'M244,372 C256,372 256,286 218,286',
      risk: 'M218,266 L262,266', rel: 'M218,538 L262,538',
    },
    zones: [
      { rot: [9, 98], lab: '접수' }, { rot: [9, 215], lab: '재현과 수정' }, { rot: [9, 414], lab: '머지 관문' },
    ],
    lane: [256, 212, 100, 354],
    ev: { before: [306, 164], after: [306, 190] },
  };

  const META = {
    sentry: { kind: 'src', name: 'Sentry 오류' },
    slack: { kind: 'src', name: 'Slack 피드백', sub: '#dero-feedback' },
    risk: { kind: 'src', name: '위험한 변경', sub: '사람 검토 대상', human: true },
    intake: { kind: 'st', name: '접수', sub: 'Grok Bot → Linear' },
    triage: { kind: 'st', name: '판정', sub: '보고를 분류' },
    repro: { kind: 'st', name: '재현', sub: '실제 화면에서' },
    fix: { kind: 'st', name: '수정' },
    gate: { kind: 'ver', name: '게이트', role: '검사 재실행' },
    screen: { kind: 'ver', name: '화면', role: '경로 두 번' },
    diff: { kind: 'ver', name: 'diff', role: '근본 원인' },
    cmp: { kind: 'cmp' },
    merge: { kind: 'st', name: '자동 머지', merge: true },
    review: { kind: 'st', name: '위험한 변경 검토', short: '사람 검토', human: true },
    release: { kind: 'st', name: '운영 반영', human: true },
  };
  const EDGE_KIND = { risk: 'human', rel: 'human', back: 'back' };
  const VER = ['gate', 'screen', 'diff'];
  const WORD = { idle: '대기', active: '진행', done: '완료', stop: '멈춤', skip: '건너뜀' };
  const VWORD = { idle: '대기', run: '확인 중', pass: 'PASS', issue: '문제 발견', stale: 'PASS', skip: '건너뜀' };
  const CWORD = { idle: '같을 때만 머지', match: '같다 · 머지한다', stale: '다르다 · 머지 안 함', skip: '건너뜀' };

  /* ---------- 세 가지 신호의 단계 ---------- */
  const base = (src) => ({
    pos: src, who: 'agent', phase: '대기', text: '', note: '', st: {},
    v: { gate: ['idle', ''], screen: ['idle', ''], diff: ['idle', ''] },
    head: '', passAt: '', check: 'idle', ev: { before: false, after: false }, lit: {},
  });
  const go = (s, key, state = 'active') => {
    if (s.pos && s.st[s.pos] === 'active') s.st[s.pos] = 'done';
    s.pos = key;
    if (key) s.st[key] = state;
  };
  const passed = (s) => VER.filter((k) => s.v[k][0] === 'pass' && s.v[k][1] === s.head).length;

  const intake = (edge, text) => ({ move: [edge], fn: (s) => { go(s, 'intake'); s.phase = '접수'; s.text = text; } });
  const triage = { move: ['it'], fn: (s) => { go(s, 'triage'); s.phase = '판정'; s.text = '보고를 분류한다. 고칠 버그로 판정한다.'; } };
  const repro = { move: ['tr'], fn: (s) => { go(s, 'repro'); s.phase = '재현'; s.ev.before = true; s.text = '실제 화면에서 같은 고장을 재현한다. 수정 전 영상을 남긴다.'; } };
  const fix = { move: ['rf'], fn: (s) => { go(s, 'fix'); s.phase = '수정'; s.ev.after = true; s.head = 'A'; s.text = '고치고 PR을 연다. 수정 뒤 정상 영상을 남긴다. PR 최신 커밋은 A다.'; } };
  const fanout = (text) => ({
    move: ['fg', 'fs', 'fd'],
    fn: (s) => { go(s, null); s.check = 'idle'; s.passAt = ''; VER.forEach((k) => { s.v[k] = ['run', s.head]; }); s.phase = '검증 0/3'; s.text = text; },
  });
  const PASS_TEXT = {
    gate: '게이트 검증자가 깨끗한 체크아웃에서 검사를 다시 돌린다.',
    screen: '화면 검증자가 실제 화면에서 경로를 두 번 밟는다.',
    diff: 'diff 검증자가 증상이 아니라 근본 원인을 고쳤는지 읽는다.',
  };
  const pass = (k) => ({
    fx: 'scan:' + k,
    fn: (s) => { s.v[k] = ['pass', s.head]; s.phase = `검증 ${passed(s)}/3`; s.text = `${PASS_TEXT[k]} 커밋 ${s.head}에 PASS.`; },
  });
  const check = {
    move: ['gc', 'sc', 'dc'], fx: 'snap',
    fn: (s) => { go(s, 'cmp'); s.passAt = s.head; s.check = 'match'; s.phase = '커밋 확인'; s.text = `PASS한 커밋 ${s.head}와 PR 최신 커밋 ${s.head}가 같다. 머지할 수 있다.`; },
  };
  const merge = { move: ['cm'], fx: 'merge', fn: (s) => { go(s, 'merge'); s.phase = '자동 머지'; s.text = '자동 머지한다. 영상 두 개가 있으니 이슈가 닫힌다.'; } };
  const release = {
    move: ['rel'], c: 'human',
    fn: (s) => { go(s, 'release'); s.who = 'human'; s.phase = '사람 차례'; s.text = '운영 반영은 사람이 지시한다. 에이전트의 일은 여기까지다.'; },
  };

  const SC = {
    sentry: {
      src: 'sentry', hint: 'Sentry가 잡은 오류 하나를 넣는다. 보고 하나가 칸을 차례로 지난다.',
      steps: [
        intake('s_sentry', 'Sentry 오류를 Grok Bot이 Linear 이슈로 등록한다.'), triage, repro, fix,
        fanout('코드를 쓰지 않은 검증자 3명이 커밋 A를 따로 확인한다.'),
        pass('gate'), pass('screen'), pass('diff'), check, merge, release,
      ],
    },
    slack: {
      src: 'slack', hint: 'Slack #dero-feedback 글 하나를 넣는다. 이 경로에서는 검증자가 한 번 막는다.',
      steps: [
        intake('s_slack', 'Slack #dero-feedback 피드백을 Grok Bot이 Linear 이슈로 등록한다.'), triage, repro, fix,
        fanout('코드를 쓰지 않은 검증자 3명이 커밋 A를 따로 확인한다.'),
        pass('gate'), pass('screen'),
        {
          fx: 'block',
          fn: (s) => {
            s.v.diff = ['issue', 'A']; s.who = 'block'; s.phase = '문제 발견';
            s.text = 'diff 검증자가 문제를 짚는다. 머지하지 않는다.';
            s.note = 'PR #85(2026-11-24)에 있던 일을 본뜬 장면이다.';
          },
        },
        {
          move: ['back'], c: 'block',
          fn: (s) => {
            go(s, 'fix'); s.head = 'B'; s.passAt = 'A'; s.check = 'stale'; s.phase = '다시 수정';
            VER.forEach((k) => { s.v[k] = s.v[k][0] === 'pass' ? ['stale', 'A'] : ['idle', '']; });
            s.text = '같은 브랜치에서 고친다. PR 최신 커밋이 B가 된다. 앞선 PASS는 커밋 A의 것이라 쓸 수 없다.';
          },
        },
        fanout('커밋 B를 처음부터 다시 검증한다.'),
        pass('gate'), pass('screen'), pass('diff'), check, merge, release,
      ],
    },
    risk: {
      src: 'risk', hint: '고치려면 마이그레이션, 인증, 인프라, 결제를 건드려야 하는 보고를 넣는다.',
      steps: [
        intake('s_risk', '보고 하나를 Grok Bot이 Linear 이슈로 등록한다.'), triage, repro,
        {
          move: ['rf'],
          fn: (s) => {
            go(s, 'fix', 'stop'); s.who = 'human'; s.phase = '멈춤';
            VER.forEach((k) => { s.v[k] = ['skip', '']; }); s.check = 'skip'; s.st.merge = 'skip';
            s.text = '고치려면 위험한 경로를 건드려야 한다. 「사람 확인」 표시를 달고 멈춘다. 에이전트는 머지하지 않는다.';
          },
        },
        {
          move: ['risk'], c: 'human',
          fn: (s) => { go(s, 'review'); s.who = 'human'; s.phase = '사람 차례'; s.text = '사람이 검토한다. 에이전트의 일은 여기까지다.'; },
        },
      ],
    },
  };
  Object.values(SC).forEach((sc) => {
    const first = base(sc.src);
    first.text = sc.hint;
    sc.states = [first];
    sc.steps.forEach((step) => {
      const s = JSON.parse(JSON.stringify(sc.states[sc.states.length - 1]));
      s.note = ''; s.who = 'agent';
      step.fn(s);
      (step.move || []).forEach((id) => { s.lit[id] = step.c || 'agent'; });
      sc.states.push(s);
    });
  });

  /* ---------- 배치대로 svg 를 그린다 ---------- */
  const tallMQ = matchMedia('(max-width: 760px)');
  let L = WIDE, scale = 1;
  const E = {}, ND = {}, EV = {}, ZN = [];
  let laneEl = null;
  const ZONE_OF = { sentry: 0, slack: 0, risk: 0, intake: 0, triage: 1, repro: 1, fix: 1, gate: 2, screen: 2, diff: 2, cmp: 2, merge: 3 };

  const build = () => {
    L = tallMQ.matches ? TALL : WIDE;
    svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`);
    svg.classList.toggle('is-tall', L.tall);
    svg.replaceChildren();
    for (const k in E) delete E[k];
    for (const k in ND) delete ND[k];

    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: 's2-dots', width: 20, height: 20, patternUnits: 'userSpaceOnUse' }, defs);
    el('circle', { cx: 1, cy: 1, r: 0.7, fill: 'rgba(255,255,255,.11)' }, pat);
    const gb = el('linearGradient', { id: 's2-gb', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.42 }, gb);
    el('stop', { offset: 0.5, 'stop-color': '#fff', 'stop-opacity': 0.12 }, gb);
    el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0.3 }, gb);
    const sg = el('linearGradient', { id: 's2-scan', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el('stop', { offset: 0, 'stop-color': '#5fe0ff', 'stop-opacity': 0 }, sg);
    el('stop', { offset: 0.8, 'stop-color': '#5fe0ff', 'stop-opacity': 0.55 }, sg);
    el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0.95 }, sg);

    el('rect', { x: 0, y: 0, width: L.W, height: L.H, fill: 'url(#s2-dots)' }, svg);

    const lane = el('g', { class: 'lane', 'data-on': 0 }, svg);
    laneEl = lane;
    const [lx, ly, lw, lh] = L.lane;
    el('rect', { class: 'lane__box', x: lx, y: ly, width: lw, height: lh, rx: 5 }, lane);
    if (L.tall) {
      el('text', { class: 'lane__lab', x: lx + lw / 2, y: ly + 19, 'text-anchor': 'middle' }, lane, '사람 몫');
      el('text', { class: 'lane__sub', x: lx + lw / 2, y: 314, 'text-anchor': 'middle' }, lane, '마이그레이션·인증');
      el('text', { class: 'lane__sub', x: lx + lw / 2, y: 329, 'text-anchor': 'middle' }, lane, '인프라·결제');
      el('text', { class: 'lane__sub', x: lx + lw / 2, y: 484, 'text-anchor': 'middle' }, lane, '운영 반영도');
      el('text', { class: 'lane__sub', x: lx + lw / 2, y: 499, 'text-anchor': 'middle' }, lane, '사람이 지시');
    } else {
      el('text', { class: 'lane__lab', x: lx + 16, y: ly + 30 }, lane, '사람 몫');
      el('text', { class: 'lane__sub', x: lx + 16, y: ly + 52 }, lane, '마이그레이션 · 인증 · 인프라 · 결제 변경은 사람이 검토한다.');
      el('text', { class: 'lane__sub', x: 1064, y: ly + 44, 'text-anchor': 'end' }, lane, '운영 반영도 사람이 지시한다.');
    }

    const zs = el('g', {}, svg);
    ZN.length = 0;
    L.zones.forEach((z) => {
      const zg = el('g', { class: 'z', 'data-on': 0 }, zs);
      ZN.push(zg);
      if (z.box) {
        const [x, y, w, hh] = z.box;
        el('rect', { class: 'z__box', x, y, width: w, height: hh, rx: 5 }, zg);
        el('path', { class: 'z__tick', d: `M${x},${y + 14} V${y + 5} Q${x},${y} ${x + 5},${y} H${x + 42}` }, zg);
        el('text', { class: 'z__lab', x: x + 13, y: y + 20 }, zg, z.lab);
      } else {
        el('text', { class: 'z__lab', x: z.rot[0], y: z.rot[1], 'text-anchor': 'middle', transform: `rotate(-90 ${z.rot[0]} ${z.rot[1]})`, dy: 3 }, zg, z.lab);
      }
    });

    const gE = el('g', {}, svg);
    for (const id in L.e) {
      const d = L.e[id];
      const b = el('path', { class: 'ed__base', d, 'data-kind': EDGE_KIND[id] || '' }, gE);
      const glow = el('path', { class: 'ed__glow', d }, gE);
      const lit = el('path', { class: 'ed__lit', d }, gE);
      const comet = el('path', { class: 'ed__comet', d }, gE);
      const len = b.getTotalLength();
      const tail = Math.min(64, len);
      [lit, glow].forEach((x) => { x.style.strokeDasharray = `${len} ${len}`; x.style.strokeDashoffset = len; });
      comet.style.strokeDasharray = `${tail} ${len + tail + 4}`;
      comet.style.strokeDashoffset = tail;
      E[id] = { base: b, lit, glow, comet, len, tail };
    }

    const gV = el('g', {}, svg);
    for (const k in L.ev) {
      const [x, y] = L.ev[k];
      const g = el('g', { class: 'ev', 'data-on': 0, transform: `translate(${x} ${y})` }, gV);
      el('rect', { class: 'ev__box', x: -46, y: -10, width: 92, height: 20, rx: 10 }, g);
      el('path', { class: 'ev__ico', d: 'M-36,-4 L-29,0 L-36,4 Z' }, g);
      el('text', { class: 'ev__txt', x: 6, y: 3.8, 'text-anchor': 'middle' }, g, k === 'before' ? '수정 전 영상' : '수정 뒤 영상');
      EV[k] = g;
    }

    const gN = el('g', {}, svg);
    for (const id in L.n) {
      const [x, y, w, hh] = L.n[id], m = META[id];
      const g = el('g', { class: `nd nd--${m.kind}${m.merge ? ' nd--merge' : ''}`, 'data-n': id, 'data-state': 'idle', transform: `translate(${x} ${y})` }, gN);
      if (m.human) g.dataset.who = 'human';
      const rec = { g, w, h: hh, x, y };
      const box = () => el('rect', { class: 'nd__box', x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 5, stroke: 'url(#s2-gb)' }, g);

      if (m.kind === 'src') {
        box();
        if (L.tall) {
          el('text', { class: 'nd__name', x: 0, y: 4.5, 'text-anchor': 'middle', style: 'font-size:12.5px' }, g, m.name);
          el('circle', { class: 'nd__port', cx: 0, cy: hh / 2, r: 2.5 }, g);
        } else {
          el('text', { class: 'nd__name', x: -w / 2 + 16, y: m.sub ? -2 : 5 }, g, m.name);
          if (m.sub) el('text', { class: 'nd__sub', x: -w / 2 + 16, y: 14 }, g, m.sub);
          el('circle', { class: 'nd__port', cx: w / 2, cy: 0, r: 2.5 }, g);
        }
        g.addEventListener('click', () => setScenario(id));
      } else if (m.kind === 'st') {
        box();
        const name = L.tall && m.short ? m.short : m.name;
        if (L.tall && w >= 140) {
          el('text', { class: 'nd__name', x: -w / 2 + 14, y: 5, style: 'font-size:14px' }, g, name);
          if (m.sub) el('text', { class: 'nd__sub', x: -w / 2 + 48, y: 4.5 }, g, m.sub);
          rec.st = el('text', { class: 'nd__st', x: w / 2 - 12, y: 4, 'text-anchor': 'end' }, g, '대기');
        } else if (L.tall) {
          el('text', { class: 'nd__name', x: 0, y: -1, 'text-anchor': 'middle', style: 'font-size:12.5px' }, g, name);
          rec.st = el('text', { class: 'nd__st', x: 0, y: 14, 'text-anchor': 'middle', style: 'font-size:9.5px' }, g, '대기');
        } else {
          el('text', { class: 'nd__name', x: 0, y: -2, 'text-anchor': 'middle', style: w < 96 ? 'font-size:13.5px' : '' }, g, name);
          rec.st = el('text', { class: 'nd__st', x: 0, y: 17, 'text-anchor': 'middle' }, g, '대기');
          if (m.sub) el('text', { class: 'nd__sub', x: 0, y: hh / 2 + 16, 'text-anchor': 'middle' }, g, m.sub);
        }
      } else if (m.kind === 'ver') {
        box();
        const cp = el('clipPath', { id: 's2-cp-' + id }, g);
        el('rect', { x: -w / 2 + 1, y: -hh / 2 + 1, width: w - 2, height: hh - 2, rx: 4 }, cp);
        const cg = el('g', { 'clip-path': `url(#s2-cp-${id})` }, g);
        rec.scan = el('rect', { class: 'nd__scan', x: -w / 2 - 44, y: -hh / 2, width: 44, height: hh, fill: 'url(#s2-scan)' }, cg);
        if (L.tall) {
          el('text', { class: 'nd__name', x: 0, y: -9, 'text-anchor': 'middle', style: 'font-size:13.5px' }, g, m.name);
          rec.st = el('text', { class: 'nd__st', x: 0, y: 7, 'text-anchor': 'middle', style: 'font-size:9.5px' }, g, '대기');
          rec.commit = el('text', { class: 'nd__commit', x: 0, y: 21, 'text-anchor': 'middle', style: 'font-size:9.5px' }, g, '');
        } else {
          el('text', { class: 'nd__name', x: -w / 2 + 13, y: -5 }, g, m.name);
          el('text', { class: 'nd__role', x: -w / 2 + 13, y: 14 }, g, m.role);
          rec.st = el('text', { class: 'nd__st', x: w / 2 - 11, y: -6, 'text-anchor': 'end' }, g, '대기');
          rec.commit = el('text', { class: 'nd__commit', x: w / 2 - 11, y: 14, 'text-anchor': 'end' }, g, '');
        }
      } else {
        const V = !L.tall;
        const jaw = (cls, bx, by, bw, bh, lab, lxp, lyp, cyp) => {
          const j = el('g', { class: 'jaw ' + cls }, g);
          el('rect', { class: 'jaw__box', x: bx, y: by, width: bw, height: bh, rx: 4 }, j);
          el('text', { class: 'jaw__lab', x: lxp, y: lyp, 'text-anchor': 'middle' }, j, lab);
          const ch = el('text', { class: 'jaw__ch', x: lxp, y: cyp, 'text-anchor': 'middle', style: V ? '' : 'font-size:20px' }, j, '–');
          return { j, ch };
        };
        if (V) {
          rec.a = jaw('jaw--a', -50, -66, 100, 56, 'PASS한 커밋', 0, -48, -20);
          rec.b = jaw('jaw--b', -50, 10, 100, 56, 'PR 최신 커밋', 0, 28, 56);
          rec.seam = el('line', { class: 'cmp__seam', x1: -44, y1: 0, x2: 44, y2: 0 }, g);
          rec.sign = el('text', { class: 'cmp__sign', x: 0, y: 5, 'text-anchor': 'middle' }, g, '=');
          rec.say = el('text', { class: 'cmp__say', x: 0, y: 84, 'text-anchor': 'middle' }, g, '');
        } else {
          rec.a = jaw('jaw--a', -108, -28, 98, 56, 'PASS한 커밋', -59, -10, 15);
          rec.b = jaw('jaw--b', 10, -28, 98, 56, 'PR 최신 커밋', 59, -10, 15);
          rec.seam = el('line', { class: 'cmp__seam', x1: 0, y1: -22, x2: 0, y2: 22 }, g);
          rec.sign = el('text', { class: 'cmp__sign', x: 0, y: 5, 'text-anchor': 'middle' }, g, '=');
          rec.say = el('text', { class: 'cmp__say', x: 0, y: 42, 'text-anchor': 'middle' }, g, '');
        }
        rec.vertical = V;
      }
      ND[id] = rec;
    }
    measure();
  };

  const measure = () => { scale = svg.getBoundingClientRect().width / L.W || 1; };
  const setJaw = (v) => {
    const c = ND.cmp, d = 10 * v;
    c.a.j.setAttribute('transform', c.vertical ? `translate(0 ${d})` : `translate(${d} 0)`);
    c.b.j.setAttribute('transform', c.vertical ? `translate(0 ${-d})` : `translate(${-d} 0)`);
  };

  /* 위에 얹는 요소 */
  const spot = h('i', 'spot', fx);
  const heads = [0, 1, 2].map(() => h('i', 'pk', fx));
  const placeSpot = (x, y, live) => { spot.classList.toggle('is-live', !!live); spot.style.transform = `translate(${x * scale}px,${y * scale}px)`; };
  const ring = h('div', 'ring', fx);
  h('i', '', ring);
  const ringHit = h('b', '', ring);
  const burst = h('i', 'burst', fx);
  const placeHead = (hd, x, y) => { hd.style.transform = `translate(${x * scale}px,${y * scale}px)`; };
  const placeRing = (id) => {
    if (!id) { ring.classList.remove('on'); return; }
    const n = ND[id];
    ring.style.transform = `translate(${(n.x - n.w / 2) * scale}px,${(n.y - n.h / 2) * scale}px)`;
    ring.style.width = n.w * scale + 'px';
    ring.style.height = n.h * scale + 'px';
    ring.classList.add('on');
  };

  /* ---------- 조작과 상태 ---------- */
  const ui = {
    play: $('[data-play]'), playLabel: $('[data-play-label]'), step: $('[data-step]'), reset: $('[data-reset]'),
    who: $('[data-who-out]'), phase: $('[data-phase]'), now: $('[data-now]'), note: $('[data-note]'), ticks: $('[data-ticks]'),
    deck: $('.deck'),
  };
  let key = 'sentry', i = 0, playing = false, busy = null, timer = null, autoPaused = false, inView = false;
  const cur = () => SC[key].states[i];
  const last = () => SC[key].states.length - 1;
  const WHO = { agent: '에이전트', human: '사람', block: '막힘' };

  const say = () => {
    const s = cur();
    ui.who.dataset.who = s.who; ui.who.textContent = WHO[s.who];
    ui.phase.textContent = s.phase;
    ui.now.textContent = s.text;
    ui.note.hidden = !s.note; ui.note.textContent = s.note;
    $$('button', ui.ticks).forEach((b, n) => {
      b.classList.toggle('is-past', n < i);
      if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    ui.step.disabled = i >= last();
  };
  const syncBtn = () => {
    ui.play.classList.toggle('is-playing', playing);
    ui.playLabel.textContent = playing ? '멈춤' : i >= last() ? '다시 돌리기' : i === 0 ? '돌리기' : '이어서';
  };
  const buildTicks = () => {
    ui.ticks.replaceChildren();
    SC[key].states.forEach((s, n) => {
      const li = h('li', '', ui.ticks), b = h('button', '', li);
      b.type = 'button'; b.dataset.who = s.who; b.title = s.phase;
      b.setAttribute('aria-label', `${n}단계: ${s.phase}`);
      b.addEventListener('click', () => { halt(); i = n; render(true); syncBtn(); });
    });
  };

  const render = (hit) => {
    const sc = SC[key], s = cur();
    measure();
    for (const id in ND) {
      const n = ND[id], m = META[id];
      n.g.removeAttribute('style');
      if (m.kind === 'src') { n.g.dataset.on = id === sc.src ? 1 : 0; continue; }
      if (m.kind === 'ver') {
        const [st, at] = s.v[id];
        n.g.dataset.state = st;
        n.g.setAttribute('transform', `translate(${n.x} ${n.y})`);
        n.st.textContent = VWORD[st];
        n.commit.textContent = at ? `커밋 ${at}` : '';
        n.scan.style.opacity = 0;
        continue;
      }
      if (m.kind === 'cmp') {
        n.g.dataset.state = s.check;
        n.a.ch.textContent = s.passAt || '–'; n.b.ch.textContent = s.head || '–';
        n.a.ch.classList.toggle('has', !!s.passAt); n.b.ch.classList.toggle('has', !!s.head);
        n.sign.textContent = s.check === 'stale' ? '≠' : '=';
        n.say.textContent = CWORD[s.check];
        n.g.setAttribute('transform', `translate(${n.x} ${n.y})`);
        setJaw(s.check === 'match' ? 1 : 0);
        continue;
      }
      const st = s.st[id] || 'idle';
      n.g.dataset.state = st;
      n.st.textContent = m.merge && (st === 'active' || st === 'done') ? '머지됨' : m.human ? (st === 'active' ? '사람 차례' : '대기') : WORD[st];
    }
    for (const k in EV) EV[k].dataset.on = s.ev[k] ? 1 : 0;
    for (const id in E) {
      const e = E[id], c = s.lit[id];
      e.lit.dataset.c = c || ''; e.glow.dataset.c = c || ''; e.comet.dataset.c = c || '';
      e.lit.style.strokeDashoffset = e.glow.style.strokeDashoffset = c ? 0 : e.len;
      e.comet.style.opacity = 0;
    }
    heads.forEach((hd) => { hd.style.opacity = 0; hd.classList.remove('is-rest'); });
    burst.style.opacity = 0;
    ring.dataset.c = s.who === 'human' ? 'human' : '';
    placeRing(s.pos);
    const zi = s.pos in ZONE_OF ? ZONE_OF[s.pos] : s.pos ? -1 : 2;
    ZN.forEach((z, n) => { z.dataset.on = n === zi ? 1 : 0; });
    laneEl.dataset.on = zi === -1 ? 1 : 0;
    const sp = ND[s.pos || 'screen'];
    spot.dataset.c = s.who === 'agent' ? '' : s.who;
    placeSpot(sp.x, sp.y, false);
    if (i === 0) {
      const p = E[sc.steps[0].move[0]].base.getPointAtLength(0);
      heads[0].dataset.c = sc.src === 'risk' ? 'human' : '';
      placeHead(heads[0], p.x, p.y);
      heads[0].classList.add('is-rest');
      heads[0].style.opacity = 1;
    }
    if (hit && !still() && s.pos) G.fromTo(ringHit, { opacity: 0.95, scale: 1.22 }, { opacity: 0, scale: 1, duration: 0.55, ease: 'power2.out' });
    say();
  };

  /* 좁은 화면: 지금 칸이 조작판에 가리지 않게 따라간다. 사용자가 직접 스크롤하면 그만둔다. */
  let follow = true, programmatic = 0;
  const keepInView = () => {
    if (!L.tall || !follow || !inView) return;
    const s = cur(), n = ND[s.pos || 'screen'], r = svg.getBoundingClientRect();
    const y = r.top + n.y * scale, top = 70, bottom = innerHeight - ui.deck.offsetHeight - 70;
    if (y > top && y < bottom) return;
    programmatic = performance.now();
    scrollBy({ top: y - (top + bottom) / 2, behavior: reduced() ? 'auto' : 'smooth' });
  };
  ['wheel', 'touchmove'].forEach((t) => addEventListener(t, () => { if (performance.now() - programmatic > 900 || t === 'touchmove') follow = false; }, { passive: true }));

  const queueNext = (d) => {
    if (!playing) return;
    if (i >= last()) { playing = false; syncBtn(); return; }
    timer = G ? G.delayedCall(d, advance) : setTimeout(advance, d * 1000);
  };
  const clearTimer = () => { if (timer) { if (timer.kill) timer.kill(); else clearTimeout(timer); timer = null; } };
  const halt = () => { playing = false; autoPaused = false; clearTimer(); if (busy) { busy.kill(); busy = null; } };

  const drawEdge = (e, p, hd, lead) => {
    const at = e.len * p;
    e.lit.style.strokeDashoffset = e.glow.style.strokeDashoffset = e.len - at;
    e.comet.style.strokeDashoffset = e.tail - at;
    const pt = e.base.getPointAtLength(at);
    placeHead(hd, pt.x, pt.y);
    if (lead) placeSpot(pt.x, pt.y, true);
  };

  const advance = () => {
    timer = null;
    if (i >= last()) { playing = false; syncBtn(); return; }
    const prev = cur();
    i += 1;
    const step = SC[key].steps[i - 1], s = cur();
    say(); syncBtn(); keepInView();
    if (still()) { render(); queueNext(1.6); return; }

    const tl = G.timeline({ onComplete() { busy = null; queueNext(step.fx === 'merge' ? 1.1 : s.note ? 1.9 : 0.95); } });
    busy = tl;
    tl.add(() => {
      ring.classList.remove('on');
      heads.forEach((hd) => { hd.classList.remove('is-rest'); hd.style.opacity = 0; });
      if (prev.pos && prev.st[prev.pos] === 'active' && META[prev.pos].kind === 'st') {
        ND[prev.pos].g.dataset.state = 'done'; ND[prev.pos].st.textContent = WORD.done;
      }
    });
    if (step.move) {
      const c = step.c || 'agent', lead = step.move.length > 1 ? 1 : 0;
      let end = 0;
      tl.add(() => { spot.dataset.c = c === 'agent' ? '' : c; }, 0.02);
      step.move.forEach((id, k) => {
        const e = E[id], hd = heads[k], o = { p: 0 };
        const dur = Math.min(1, Math.max(0.5, e.len / 240));
        end = Math.max(end, dur);
        tl.add(() => {
          e.lit.dataset.c = c; e.glow.dataset.c = c; e.comet.dataset.c = c; hd.dataset.c = c === 'agent' ? '' : c;
          e.lit.style.strokeDashoffset = e.glow.style.strokeDashoffset = e.len; e.comet.style.opacity = 1; hd.style.opacity = 1;
        }, 0.02);
        tl.to(o, { p: 1, duration: dur, ease: 'power2.inOut', onUpdate: () => drawEdge(e, o.p, hd, k === lead) }, 0.02);
        tl.add(() => { e.comet.style.opacity = 0; hd.style.opacity = 0; }, 0.02 + dur);
      });
      tl.add(() => {}, 0.04 + end);
    }
    if ((step.fx && step.fx.startsWith('scan:')) || step.fx === 'block') {
      const k = step.fx === 'block' ? 'diff' : step.fx.slice(5), n = ND[k], o = { x: 0 };
      tl.add(() => { n.scan.style.opacity = 1; });
      tl.to(o, {
        x: 1, duration: 0.62, ease: 'power1.inOut', repeat: 1,
        onUpdate: () => n.scan.setAttribute('x', -n.w / 2 - 44 + (n.w + 44) * o.x),
      });
      tl.add(() => { n.scan.style.opacity = 0; });
    }
    if (step.fx === 'snap') {
      const o = { v: 0 };
      tl.add(() => {
        const c = ND.cmp;
        c.a.ch.textContent = s.passAt; c.b.ch.textContent = s.head;
        c.a.ch.classList.add('has'); c.b.ch.classList.add('has');
        c.sign.textContent = '='; c.say.textContent = '';
        c.g.dataset.state = 'idle';
      });
      tl.to({}, { duration: 0.38 });
      tl.to(o, { v: 1, duration: 0.2, ease: 'power3.in', onUpdate: () => setJaw(o.v) });
    }
    tl.add(() => render(true));
    if (step.fx === 'snap') {
      const o = { v: 0 }, c = ND.cmp;
      tl.to(o, { v: 1, duration: 0.3, ease: 'power2.out', onUpdate: () => { const k = 1 + 0.07 * Math.sin(o.v * Math.PI); c.g.setAttribute('transform', `translate(${c.x} ${c.y}) scale(${k})`); } });
      tl.add(() => c.g.setAttribute('transform', `translate(${c.x} ${c.y})`));
    }
    if (step.fx === 'block') {
      const n = ND.diff, o = { v: 0 };
      tl.to(o, { v: 1, duration: 0.42, ease: 'none', onUpdate: () => n.g.setAttribute('transform', `translate(${n.x + Math.sin(o.v * Math.PI * 6) * 5 * (1 - o.v)} ${n.y})`) });
    }
    if (step.fx === 'merge') {
      const n = ND.merge;
      tl.set(burst, { x: n.x * scale, y: n.y * scale });
      tl.add(() => { svg.classList.remove('is-flash'); void svg.getBoundingClientRect(); svg.classList.add('is-flash'); });
      tl.fromTo(burst, { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.7, duration: 0.8, ease: 'power2.out', immediateRender: false });
      tl.set(burst, { scale: 0.4 });
    }
  };

  let touched = false;
  const play = () => {
    if (i >= last()) { i = 0; render(); }
    playing = true; syncBtn();
    if (busy) busy.resume(); else { clearTimer(); advance(); }
  };
  const pause = () => { playing = false; clearTimer(); if (busy) busy.pause(); syncBtn(); };
  const setScenario = (k, autoplay = true) => {
    touched = true;
    halt(); follow = true;
    key = k; i = 0;
    $$('[data-sc]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sc === k));
    buildTicks(); render(); syncBtn();
    if (autoplay && !reduced()) {
      playing = true; syncBtn();
      timer = G ? G.delayedCall(0.55, advance) : setTimeout(advance, 550);
    }
  };

  ui.play.addEventListener('click', () => { touched = true; autoPaused = false; follow = true; if (playing) pause(); else play(); });
  ui.step.addEventListener('click', () => {
    touched = true; playing = false; autoPaused = false; follow = true; clearTimer();
    if (busy) { const b = busy; b.paused(false).progress(1); busy = null; } else advance();
    syncBtn();
  });
  ui.reset.addEventListener('click', () => { touched = true; halt(); follow = true; i = 0; render(); play(); });
  $$('[data-sc]').forEach((b) => b.addEventListener('click', () => setScenario(b.dataset.sc)));

  build();
  if (reduced()) i = last();
  buildTicks(); render(); syncBtn();

  tallMQ.addEventListener('change', () => { const was = playing; halt(); build(); render(); if (was) play(); else syncBtn(); });
  new ResizeObserver(() => { measure(); if (!busy) { placeRing(cur().pos); if (i === 0) render(); } }).observe(svg);

  /* 화면 안에 있을 때만 돈다. 벗어나면 멈추고, 돌아오면 잇는다. */
  DERO.onView(hero, {
    threshold: 0.12,
    enter: () => { inView = true; if (autoPaused) { autoPaused = false; play(); } },
    leave: () => { inView = false; if (playing) { pause(); autoPaused = true; } },
  });
  /* 기계가 처음 충분히 보이면 한 번 저절로 돈다. */
  DERO.onView(hero, {
    threshold: 0.5, once: true, flag: false,
    enter: () => {
      if (touched || still() || playing || i !== 0) return;
      playing = true; syncBtn();
      timer = G.delayedCall(0.7, advance);
    },
  });

  $$('[data-run]').forEach((b) => b.addEventListener('click', () => {
    DERO.goto(hero);
    setTimeout(() => setScenario(b.dataset.run), reduced() ? 0 : 500);
  }));

  /* ---------- 결과: 숫자 ---------- */
  const results = $('[data-results]');
  if (results) {
    const roll = $('[data-roll]', results), to = +roll.dataset.roll;
    DERO.onView($('.stat', results), {
      threshold: 0.35, once: true, flag: false,
      enter: () => {
        results.classList.add('in');
        if (still()) return;
        const o = { v: 0 };
        G.to(o, { v: to, duration: 1.3, ease: 'power3.out', onUpdate: () => { roll.textContent = Math.round(o.v).toLocaleString('en-US'); } });
      },
    });
  }
})();
