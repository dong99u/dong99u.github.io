/* s1.js · ① 의도 문서 절차. 화면 안에 있을 때만 돈다(DERO.onView).
   그림은 시간 t(0~1) 하나로 정해진다. render(t) 가 점 211개의 자리와 상태를 그린다.
     0 ~ T_ACC      2026-07 → 2026-11-22. 문서가 쌓인다.
     T_ACC ~ 1      폐지 뒤. 점을 상태별로 모아 센다.
   문서마다 쓴 날짜와 멈춘 단계는 기록에 없다. 순서와 속도는 연출이고, 끝 상태의 개수만 기록이다. */
(() => {
  const DERO = window.DERO;
  const root = document.querySelector('#intent [data-field]');
  if (!DERO || !root) return;

  const G = DERO.gsap, still = DERO.still;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const make = (name, attrs, parent, text) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };

  const svg = $('[data-stage]');
  const ui = { play: $('[data-play]'), label: $('[data-play-label]'), range: $('[data-range]'), month: $('[data-month]'), now: $('[data-now]') };

  /* ---------- 기록에 있는 것 ---------- */
  const STEPS = [{ name: '의도' }, { name: '명세' }, { name: '계획', tag: '사람 승인', who: 'human' }, { name: '구현·검증' }, { name: '리뷰' }, { name: '배포 확인' }, { name: '회고' }];
  const COUNTS = [['open', 182], ['shipped', 25], ['closed', 2], ['etc', 2]];
  const N = 211;

  /* ---------- 연출 ---------- */
  const DUR = 13;                 // 전체 재생 시간(초)
  const T_ACC = 0.8;              // 여기까지가 2026-07 ~ 2026-11-22
  const T_SORT = 0.845, SORT_D = 0.1, SORT_LAG = 0.04;
  const ENTER = 0.012, RIDE = 0.09, DROP = 0.035, LAST_BIRTH = 0.655;
  const DAYS = 144, MONTH_AT = [0, 31, 62, 92, 123];   // 07-01 부터 센 날수

  const rand = (() => {
    let a = 211;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  })();
  const order = [];
  COUNTS.forEach(([st, n]) => { for (let k = 0; k < n; k++) order.push(st); });
  for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
  const base = {}; let acc = 0;
  COUNTS.forEach(([st, n]) => { base[st] = acc; acc += n; });
  const docs = order.map((st, i) => ({
    st, i,
    rank: base[st]++,                                   // 상태별로 모았을 때의 자리
    born: ENTER + (i / (N - 1)) * (LAST_BIRTH - ENTER),
    hold: 0.02 + rand() * 0.06,                         // 놓인 뒤 회색이 되기까지
    el: null, ph: '', tf: '',
  }));

  const LAYOUT = {
    wide: { w: 900, h: 388, lineY: 50, x0: 60, dx: 130, labY: 27, tagY: 72, cols: 27, rows: 8, cell: 32, fx: 18, fy: 104, r: 10.5, colMajor: true },
    tall: { w: 360, h: 528, lineY: 60, x0: 24, dx: 52, labY: 42, tagY: 79, cols: 14, rows: 16, cell: 24, fx: 12, fy: 116, r: 8, colMajor: false },
  };
  const tallMQ = matchMedia('(max-width: 700px)');
  let L = LAYOUT.wide, slots = [];

  const build = () => {
    L = tallMQ.matches ? LAYOUT.tall : LAYOUT.wide;
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
    svg.toggleAttribute('data-tall', L === LAYOUT.tall);

    slots = docs.map((_, k) => {
      const c = L.colMajor ? Math.floor(k / L.rows) : k % L.cols;
      const r = L.colMajor ? k % L.rows : Math.floor(k / L.cols);
      return [L.fx + L.cell * (c + 0.5), L.fy + L.cell * (r + 0.5)];
    });

    const xEnd = L.x0 + L.dx * (STEPS.length - 1), fRight = L.fx + L.cols * L.cell, fBottom = L.fy + L.rows * L.cell;
    make('path', { class: 'ln', d: `M${L.x0} ${L.lineY}H${xEnd}` }, svg);
    STEPS.forEach((s, k) => {
      const x = L.x0 + L.dx * k;
      const g = make('g', { class: 'st' }, svg);
      if (s.who) g.dataset.who = s.who;
      make('circle', { class: 'st__node', cx: x, cy: L.lineY, r: s.who ? 5 : 4.5 }, g);
      const lab = make('text', { class: 'st__lab', x, y: L.labY, 'text-anchor': 'middle' }, g);
      if (L === LAYOUT.wide) { make('tspan', { class: 'st__idx' }, lab, `0${k + 1}`); make('tspan', { dx: 6 }, lab, s.name); }
      else lab.textContent = s.name;
      if (s.tag) make('text', { class: 'st__tag', x, y: L.tagY, 'text-anchor': 'middle' }, g, s.tag);
    });

    make('text', { class: 'fld__lab', x: L.fx, y: L.fy - 10 }, svg, L === LAYOUT.wide ? 'intent/ 폴더 · 점 하나가 문서 하나' : 'intent/ 폴더 · 점 = 문서');
    make('text', { class: 'fld__lab fld__lab--end', x: fRight, y: L.fy - 10, 'text-anchor': 'end' }, svg, L === LAYOUT.wide ? '2026-11-22 폐지 · PR #33 · 폴더는 쓰기만 막아 남김' : '11-22 폐지 · PR #33 · 쓰기 막음');
    make('text', { class: 'fld__sum fld__sum--open', x: L.fx, y: fBottom + 18 }, svg, 'open 182');
    make('text', { class: 'fld__sum', x: fRight, y: fBottom + 18, 'text-anchor': 'end' }, svg, 'shipped 25 · closed 2 · 기타 2');

    const gs = make('g', { 'aria-hidden': 'true' }, svg);
    slots.forEach(([x, y]) => make('circle', { class: 'slot', cx: x, cy: y, r: 1.3 }, gs));
    const gd = make('g', { 'aria-hidden': 'true' }, svg);
    docs.forEach((d) => { d.el = make('circle', { class: 'd', r: L.r, 'data-st': d.st }, gd); d.ph = ''; d.tf = ''; });
  };

  /* ---------- 그리기 ---------- */
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const io = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const out = (p) => 1 - Math.pow(1 - p, 3);
  const TEXT = [
    '절차를 팀 기본으로 채택했다. 의도 문서를 먼저 쓰고 일곱 단계를 밟는다.',
    '문서는 계속 쌓였다. 대부분은 상태가 open에서 바뀌지 않았다.',
    '절차를 폐지했다(PR #33). 남은 문서를 상태별로 모아 센다.',
    '211개 중 182개가 open으로 남아 있었다. shipped 25개, closed 2개.',
  ];
  const state = { t: 0 };
  let phase = -1, month = '';

  const render = () => {
    const t = state.t;
    const xEnd = L.x0 + L.dx * (STEPS.length - 1);
    for (const d of docs) {
      let x = L.x0, y = L.lineY, s = 1, ph = 'live';
      let tt = t - d.born;
      if (tt < 0) { s = 0; ph = 'none'; }
      else if (tt < ENTER) s = out(tt / ENTER);
      else {
        tt -= ENTER;
        let fromX = L.x0;
        if (d.st === 'shipped') {
          if (tt < RIDE) { x = L.x0 + (xEnd - L.x0) * (tt / RIDE); tt = -1; }
          else { tt -= RIDE; fromX = xEnd; }
        }
        if (tt >= 0) {
          const [mx, my] = slots[d.i];
          if (tt < DROP) { const p = io(tt / DROP); x = fromX + (mx - fromX) * p; y = L.lineY + (my - L.lineY) * p; }
          else {
            if (d.st !== 'open' || tt - DROP > d.hold) ph = 'done';
            const q = clamp((t - T_SORT - (d.rank / N) * SORT_LAG) / SORT_D);
            if (q > 0) { ph = 'done'; const [sx, sy] = slots[d.rank], e = io(q); x = mx + (sx - mx) * e; y = my + (sy - my) * e; }
            else { x = mx; y = my; }
          }
        }
      }
      const tf = `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`;
      if (tf !== d.tf) { d.tf = tf; d.el.setAttribute('transform', tf); }
      if (ph !== d.ph) { d.ph = ph; d.el.dataset.ph = ph; }
    }

    svg.classList.toggle('is-shut', t >= T_ACC);
    svg.classList.toggle('is-sum', t >= T_SORT + SORT_D);
    root.classList.toggle('is-end', t >= T_SORT + SORT_D);

    const ph = t < 0.3 ? 0 : t < T_ACC ? 1 : t < T_SORT + SORT_D + SORT_LAG ? 2 : 3;
    if (ph !== phase) { phase = ph; ui.now.textContent = TEXT[ph]; }
    let m = '2026-11-22';
    if (t < T_ACC) { const day = (t / T_ACC) * DAYS; let k = 0; while (k < 4 && day >= MONTH_AT[k + 1]) k++; m = `2026-${String(7 + k).padStart(2, '0')}`; }
    if (m !== month) { month = m; ui.month.textContent = m; ui.range.setAttribute('aria-valuetext', t >= T_ACC ? `${m}, 폐지 뒤` : m); }
    const v = Math.round(t * 1000);
    if (+ui.range.value !== v) ui.range.value = v;
    ui.range.style.setProperty('--p', `${(t * 100).toFixed(2)}%`);
  };

  /* ---------- 재생 ---------- */
  let tween = null, playing = false, autoPaused = false, touched = false;
  const sync = () => {
    ui.play.hidden = still();   // 모션 줄이기면 재생 단추를 감춘다. 시간 막대로는 옮길 수 있다.
    ui.play.parentNode.classList.toggle('is-still', ui.play.hidden);
    ui.play.classList.toggle('is-playing', playing);
    ui.label.textContent = playing ? '멈춤' : state.t >= 1 ? '다시 보기' : state.t > 0 ? '이어서' : '돌리기';
  };
  const stop = () => { if (tween) { tween.kill(); tween = null; } playing = false; };
  const play = () => {
    stop();
    if (still()) { state.t = 1; render(); sync(); return; }
    if (state.t >= 1) state.t = 0;
    playing = true;
    tween = G.to(state, { t: 1, duration: DUR * (1 - state.t), ease: 'none', onUpdate: render, onComplete: () => { tween = null; playing = false; sync(); } });
    sync();
  };

  ui.play.addEventListener('click', () => { touched = true; autoPaused = false; if (playing) { stop(); sync(); } else play(); });
  ui.range.addEventListener('input', () => { touched = true; autoPaused = false; stop(); state.t = ui.range.value / 1000; render(); sync(); });

  /* ---------- 상태 하나만 보기 ---------- */
  const keys = $$('[data-iso]');
  let pinned = null, hovered = null;
  const isolate = () => {
    const k = hovered || pinned;
    if (k) svg.dataset.iso = k; else delete svg.dataset.iso;
    keys.forEach((b) => { b.classList.toggle('is-on', b.dataset.iso === k); b.setAttribute('aria-pressed', b.dataset.iso === pinned); });
  };
  keys.forEach((b) => {
    const k = b.dataset.iso;
    b.addEventListener('pointerenter', (ev) => { if (ev.pointerType !== 'touch') { hovered = k; isolate(); } });
    b.addEventListener('pointerleave', () => { hovered = null; isolate(); });
    b.addEventListener('focus', () => { hovered = k; isolate(); });
    b.addEventListener('blur', () => { hovered = null; isolate(); });
    b.addEventListener('click', () => { pinned = pinned === k ? null : k; isolate(); });
  });

  build();
  if (still()) state.t = 1;
  render(); sync();

  tallMQ.addEventListener('change', () => { build(); render(); });

  /* 화면 안에 있을 때만 돈다. 벗어나면 멈추고, 돌아오면 잇는다. */
  const view = DERO.onView(root, {
    threshold: 0.1,
    enter: () => { if (autoPaused) { autoPaused = false; play(); } },
    leave: () => { if (playing) { stop(); autoPaused = true; sync(); } },
  });
  /* 그림이 처음 충분히 보이면 한 번 저절로 돈다. */
  DERO.onView($('.s1-stage'), {
    threshold: 0.55, once: true, flag: false,
    enter: () => { if (!touched && !still() && !playing && state.t === 0) G.delayedCall(0.5, () => { if (view.visible && !touched && !playing && state.t === 0) play(); }); },
  });
})();

/* ---------- 절차 도식 ----------
   문서 하나가 develop 줄을 따라 가며 단계를 차례로 켠다. 가리키면 그 단계의 설명이 아래에 나온다. */
(() => {
  const DERO = window.DERO;
  const root = document.querySelector('#intent [data-flow]');
  if (!DERO || !root) return;
  const G = DERO.gsap, still = DERO.still;
  const $ = (s, r = root) => r.querySelector(s);
  const flow = $('.flow'), list = $('.flow__list'), line = $('.flow__line'), tok = $('.flow__tok'), again = $('[data-again]');
  const nodes = [...root.querySelectorAll('.nd')];
  const read = { who: $('[data-read-who]'), title: $('[data-read-title]'), say: $('[data-read-say]'), file: $('[data-read-file]') };
  const WHO = { agent: '에이전트', human: '사람' };
  const wideMQ = matchMedia('(min-width: 1101px)');

  const show = (n) => {
    nodes.forEach((m) => m.classList.toggle('is-now', m === n));
    const who = n.dataset.who, file = n.querySelector('.nd__file');
    read.who.hidden = !who;
    if (who) { read.who.dataset.who = who; read.who.textContent = WHO[who]; }
    read.title.innerHTML = n.querySelector('.nd__t').innerHTML;
    read.say.innerHTML = n.querySelector('.nd__more').innerHTML;
    read.file.hidden = !file;
    if (file) read.file.innerHTML = file.innerHTML;
  };
  const anchor = (n) => {
    const b = list.getBoundingClientRect(), r = n.getBoundingClientRect();
    const l = line.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: n.dataset.k === 'f' ? r.top - b.top : l.top - b.top + 1 };
  };

  let tl = null, paused = false, touched = false;
  const finish = () => {
    if (tl) { tl.kill(); tl = null; }
    paused = false;
    flow.classList.add('is-all');
    nodes.forEach((n) => n.classList.add('is-on'));
    if (G) G.set(tok, { opacity: 0 });
    again.hidden = still() || !wideMQ.matches;
  };
  const tour = () => {
    finish();
    if (still() || !wideMQ.matches) return;
    again.hidden = true;
    flow.classList.remove('is-all');
    nodes.forEach((n) => n.classList.remove('is-on', 'is-now'));
    const first = anchor(nodes[0]);
    G.set(tok, { x: first.x, y: first.y, opacity: 0, scale: 0.4 });
    tl = G.timeline({ onComplete: () => { tl = null; nodes.forEach((n) => n.classList.remove('is-now')); finish(); } });
    tl.to(tok, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' });
    nodes.forEach((n, k) => {
      if (k) tl.to(tok, { x: () => anchor(n).x, y: () => anchor(n).y, duration: 0.42, ease: 'power2.inOut' });
      tl.call(() => { n.classList.add('is-on'); show(n); });
      tl.to(tok, { scale: 1.5, duration: 0.14, ease: 'power2.out' }).to(tok, { scale: 1, duration: 0.2, ease: 'power2.out' });
      tl.to({}, { duration: 0.42 });
    });
    tl.to(tok, { opacity: 0, duration: 0.3 });
  };

  nodes.forEach((n) => {
    const b = n.querySelector('.nd__box');
    const pick = () => { touched = true; if (tl) finish(); show(n); };
    b.addEventListener('pointerenter', (ev) => { if (ev.pointerType !== 'touch') pick(); });
    b.addEventListener('focus', pick);
    b.addEventListener('click', pick);
  });
  again.addEventListener('click', () => { touched = true; tour(); });
  wideMQ.addEventListener('change', () => { if (tl) finish(); });

  finish();
  DERO.onView(flow, {
    threshold: 0.1,
    enter: () => { if (tl && paused) { paused = false; tl.resume(); } },
    leave: () => { if (tl) { tl.pause(); paused = true; } },
  });
  if (wideMQ.matches) {
    DERO.onView(list, { threshold: 0.6, once: true, flag: false, enter: () => { if (!touched && !still()) tour(); } });
  } else if (!still()) {
    /* 세로 배치에서는 문서가 내려가는 대신, 스크롤해 닿는 단계가 차례로 켜진다. */
    flow.classList.remove('is-all');
    nodes.forEach((n) => { n.classList.remove('is-on'); DERO.onView(n, { threshold: 0.6, once: true, flag: false, enter: () => n.classList.add('is-on') }); });
  }
})();
