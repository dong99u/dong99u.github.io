/* s3.js · ③ 규칙을 검사로. 시연은 화면 안에 있을 때만 돈다(DERO.onView). */
(() => {
  const D = document, DERO = window.DERO;
  const sec = D.getElementById('rules');
  if (!sec || !DERO) return;
  const $ = (s, r = sec) => r.querySelector(s);
  const $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const G = DERO.gsap;
  const still = DERO.still, reduced = DERO.reduced;
  const NS = 'http://www.w3.org/2000/svg';
  const h = (tag, cls, parent, text) => {
    const e = D.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };

  const hero = $('[data-machine]');
  const stage = $('[data-stage]');
  const linesEl = $('[data-lines]');
  const wires = $('[data-wires]');
  const fx = $('[data-fx]');
  if (!hero || !stage || !linesEl || !wires || !fx) return;

  /* ---------- 내용 ---------- */
  /* take: 시연에서 이 규칙과 함께 지워지는 줄 수(규칙 줄 포함). 합이 47이라 69 → 22 가 된다.
     줄마다의 값은 기록에 없다. 그래서 중간 숫자에는 이름을 붙이지 않는다. */
  const RULES = {
    comment: { label: '새 주석이 CI에서야 걸림', tag: '편집 훅으로', take: 12,
      say: '새 주석이 CI에서야 걸렸다(11번). 같은 검사를 에이전트 편집 훅에서도 실행한다. 편집 훅은 에이전트가 파일을 고칠 때 도는 검사다.' },
    gate: { label: '앱 테스트가 PR 게이트 밖', tag: 'PR 게이트로', take: 12,
      say: '앱 테스트가 PR 게이트 밖이라 develop이 깨졌다(5번). 바뀐 파일 관련 테스트와 경계 테스트를 PR 게이트에 넣었다.' },
    timer: { label: '「한 프레임 기다리기」 타이머 땜질', tag: 'lint로', take: 12,
      say: '「한 프레임 기다리기」 타이머 땜질이 되풀이됐다(8번). 새로 늘면 실패하는 lint를 뒀다.' },
    effect: { label: 'useEffect가 만든 버그', tag: 'lint 규칙으로', take: 11,
      say: 'useEffect가 버그를 만들었다(2번). lint 규칙 exhaustive-deps를 error로 뒀다.' },
    po: { label: 'PO가 싫어한 디자인 되돌리기', tag: '사람 몫', take: 0,
      say: 'PO가 싫어한 디자인을 되돌리는 일(8번 이상)은 옮기지 않았다. 판단이라 기계로 못 막는다. 사람 몫으로 남는다.' },
  };
  const MOVES = ['comment', 'gate', 'timer', 'effect'];
  const FROM = 69, TO = 22;
  const DOC = [6, 'comment', 12, 'gate', 13, 'timer', 11, 'effect', 10, 'po', 12];
  const IDLE = '실수 유형을 하나 고르면 그 규칙이 문서에서 나와 막는 곳으로 간다.';
  const DONE = '넷을 옮겼다. 강제 장치가 생긴 규칙을 지워 문서는 69줄에서 22줄이 됐다(PR #37, 2026-11-22).';

  /* ---------- 문서 줄 만들기 ---------- */
  const rows = {}, bars = {};
  {
    let n = 0, owner = null, left = 0;
    for (const part of DOC) {
      if (typeof part === 'string') {
        const li = h('li', 's3-rule' + (part === 'po' ? ' s3-rule--stay' : ''), linesEl);
        li.dataset.rule = part; li.dataset.state = 'in';
        const b = h('button', '', li); b.type = 'button'; b.dataset.pick = part;
        h('span', 's3-rule__txt', b, RULES[part].label);
        h('em', 's3-rule__tag', b, RULES[part].tag);
        if (part === 'po') h('p', 's3-rule__why', li, '옮기지 않는다. 판단이라 기계로 못 막는다.');
        rows[part] = li; bars[part] = [];
        owner = part; left = RULES[part].take - 1;
        continue;
      }
      for (let k = 0; k < part; k++, n++) {
        const li = h('li', 's3-ln', linesEl);
        li.setAttribute('aria-hidden', 'true');
        const w = n % 7 === 3 ? 0.24 : 0.4 + ((n * 37) % 11) / 11 * 0.58;
        li.style.setProperty('--w', w.toFixed(3));
        if (owner && left > 0) { bars[owner].push(li); left--; }
      }
    }
  }

  const ui = {
    picks: $$('.s3-pick [data-pick]'),
    slots: $('.s3-slots'),
    slot: Object.fromEntries($$('[data-slot]').map((e) => [e.dataset.slot, e])),
    count: $('[data-count]'), n: $('[data-count-n]'), thumb: $('[data-count-thumb]'), cap: $('[data-count-cap]'),
    all: $('[data-all]'), reset: $('[data-reset]'),
    who: $('[data-who-out]'), phase: $('[data-phase]'), now: $('[data-now]'),
  };

  /* ---------- 상태 ---------- */
  const moved = new Set();
  let stay = false, sel = null;
  let busy = null, timer = null, queue = [], touched = false;
  const total = () => FROM - [...moved].reduce((s, k) => s + RULES[k].take, 0);
  const frac = (v) => (FROM - v) / (FROM - TO);

  /* ---------- 자리 재기 ---------- */
  const rel = (el) => {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { left: r.left - s.left, top: r.top - s.top, right: r.right - s.left, bottom: r.bottom - s.top, cy: (r.top + r.bottom) / 2 - s.top };
  };
  const geom = (key) => {
    const a = rel($('button', rows[key])), slot = rel(ui.slot[key]), b = rel($('.s3-slot__socket', ui.slot[key]));
    const side = slot.left > a.right + 8;
    let d;
    if (side) {
      const dx = slot.left - a.right;
      d = `M${a.right},${a.cy} C${a.right + dx * 0.5},${a.cy} ${slot.left - dx * 0.5},${b.cy} ${slot.left},${b.cy}`;
    } else {
      const gx = Math.max(6, a.left - 22);
      d = `M${a.left},${a.cy} L${gx},${a.cy} L${gx},${b.cy} L${slot.left},${b.cy}`;
    }
    return { a, b, side, d, end: [slot.left, b.cy], start: side ? [a.right, a.cy] : [a.left, a.cy] };
  };
  const wire = (key, g) => {
    const grp = D.createElementNS(NS, 'g');
    grp.dataset.wire = key;
    const p = D.createElementNS(NS, 'path');
    p.setAttribute('class', 's3-wire'); p.setAttribute('d', g.d);
    grp.appendChild(p);
    for (const [x, y] of [g.start, g.end]) {
      const c = D.createElementNS(NS, 'circle');
      c.setAttribute('class', 's3-wire__end'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 2.5);
      grp.appendChild(c);
    }
    wires.appendChild(grp);
    return { grp, p, dots: [...grp.querySelectorAll('circle')] };
  };

  /* ---------- 끝 상태를 바로 그린다 ---------- */
  const setCount = (v) => {
    const at = v >= FROM ? 'start' : v <= TO ? 'end' : 'mid';
    ui.n.textContent = Math.round(v);
    ui.count.dataset.at = at;
    ui.cap.textContent = at === 'end' ? 'PR #37 · 2026-11-22' : '옮기기 전';
  };
  const setThumb = (v) => { if (G) G.set(ui.thumb, { xPercent: (frac(v) - 1) * 100 }); else ui.thumb.style.transform = `translateX(${(frac(v) - 1) * 100}%)`; };
  const text = () => {
    const human = sel === 'po';
    ui.who.dataset.who = human ? 'human' : 'agent';
    ui.who.textContent = human ? '사람 몫' : '기계가 막는다';
    ui.phase.textContent = `옮긴 규칙 ${moved.size} / ${MOVES.length}`;
    ui.now.textContent = !sel ? IDLE : (sel !== 'po' && moved.size === MOVES.length && !busy) ? DONE : RULES[sel].say;
    ui.picks.forEach((b) => {
      const k = b.dataset.pick;
      b.setAttribute('aria-pressed', k === sel);
      b.classList.toggle('is-done', k === 'po' ? stay : moved.has(k));
    });
    ui.all.disabled = moved.size === MOVES.length && stay;
    ui.reset.disabled = !moved.size && !stay && !sel;
  };
  const render = () => {
    fx.textContent = ''; wires.textContent = '';
    if (G) { G.set(linesEl.children, { clearProps: 'opacity' }); G.set($$('.s3-slot__ring'), { clearProps: 'opacity,transform' }); }
    for (const k of MOVES) {
      const on = moved.has(k);
      rows[k].dataset.state = on ? 'gone' : 'in';
      rows[k].classList.toggle('is-sel', on && sel === k);
      bars[k].forEach((b) => { if (on) b.dataset.gone = '1'; else delete b.dataset.gone; });
      ui.slot[k].dataset.on = on ? '1' : '0';
      ui.slot[k].classList.toggle('is-sel', on && sel === k);
      if (on) wire(k, geom(k)).p.classList.toggle('is-sel', sel === k);
    }
    rows.po.dataset.state = stay ? 'stay' : 'in';
    ui.slots.classList.toggle('has-on', moved.size > 0);
    ui.slots.classList.remove('is-shut');
    setCount(total()); setThumb(total());
    text();
  };

  /* ---------- 움직임 ---------- */
  const done = () => { busy = null; render(); next(); };
  const chipAt = (key, g, human) => {
    const chip = h('span', 's3-chip', fx, RULES[key].label);
    if (human) chip.dataset.who = 'human';
    G.set(chip, { x: g.a.left, y: g.a.top, opacity: 0 });
    return chip;
  };

  const playMove = (key) => {
    const g = geom(key), from = total();
    moved.add(key);
    const to = total();
    const li = rows[key], slot = ui.slot[key];
    const chip = chipAt(key, g);
    const w = wire(key, g);
    const len = w.p.getTotalLength();
    w.p.classList.add('is-live');
    G.set(w.p, { strokeDasharray: len, strokeDashoffset: len });
    G.set(w.dots, { opacity: 0 });
    const x0 = g.a.left, y0 = g.a.top - 6, x1 = g.b.left, y1 = g.b.top;
    const dx = x1 - x0;
    const fly = { t: 0 }, cnt = { v: from };
    const place = () => {
      const t = fly.t, u = 1 - t;
      let x, y;
      if (g.side) {
        x = u * u * u * x0 + 3 * u * u * t * (x0 + dx * 0.5) + 3 * u * t * t * (x1 - dx * 0.5) + t * t * t * x1;
        y = u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t * t * t * y1;
      } else { x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; }
      G.set(chip, { x, y });
    };
    text();
    busy = G.timeline({ onComplete: done })
      .set(chip, { opacity: 1 })
      .call(() => { li.dataset.state = 'lift'; })
      .to(chip, { y: y0, scale: 1.05, duration: 0.24, ease: 'power2.out' })
      .set(w.dots[0], { opacity: 1 })
      .call(() => { li.dataset.state = 'gone'; })
      .to(fly, { t: 1, duration: 0.85, ease: 'power2.inOut', onUpdate: place })
      .to(w.p, { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' }, '<')
      .to(chip, { scale: 1, duration: 0.25, ease: 'power2.out' }, '>-0.25')
      .call(() => { slot.dataset.on = '1'; ui.slots.classList.add('has-on'); ui.count.dataset.at = to <= TO ? 'end' : 'mid'; })
      .set(w.dots[1], { opacity: 1 })
      .to(chip, { opacity: 0, duration: 0.16 })
      .fromTo($('.s3-slot__ring', slot), { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.045, duration: 0.7, ease: 'power2.out', immediateRender: false }, '<')
      .to(bars[key], { opacity: 0.12, duration: 0.22, stagger: 0.04, ease: 'power1.out' }, '<')
      .to(cnt, { v: to, duration: 0.75, ease: 'power2.out', onUpdate: () => { ui.n.textContent = Math.round(cnt.v); } }, '<')
      .to(ui.thumb, { xPercent: (frac(to) - 1) * 100, duration: 0.75, ease: 'power2.out' }, '<')
      .to({}, { duration: 0.15 });
  };

  const playStay = () => {
    const key = 'po', li = rows.po;
    const btn = $('button', li);
    const a = rel(btn);
    const side = rel(ui.slots).left > a.right + 8;
    const chip = chipAt(key, { a }, true);
    text();
    busy = G.timeline({ onComplete: () => { stay = true; done(); } })
      .set(chip, { opacity: 1 })
      .call(() => { li.dataset.state = 'lift'; ui.slots.classList.add('is-shut'); })
      .to(chip, { y: a.top - 6, scale: 1.05, duration: 0.24, ease: 'power2.out' })
      .to(chip, side ? { x: a.left + 46, duration: 0.34, ease: 'power2.out' } : { y: a.top + 16, duration: 0.34, ease: 'power2.out' })
      .to(chip, { x: a.left, y: a.top, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, '+=0.12')
      .call(() => { li.dataset.state = 'stay'; })
      .to(chip, { opacity: 0, duration: 0.2 }, '+=0.1')
      .to({}, { duration: 0.3 });
  };

  const stopTimer = () => { if (timer) { timer.kill(); timer = null; } };
  const finish = () => {
    stopTimer(); queue = [];
    if (busy) { const b = busy; b.paused(false).progress(1); }
  };
  const run = (key) => {
    sel = key;
    if (key === 'po') {
      if (still()) { stay = true; render(); next(); } else { stay = false; rows.po.dataset.state = 'in'; playStay(); }
      return;
    }
    if (moved.has(key)) { render(); next(); return; }
    if (still()) { moved.add(key); render(); next(); } else playMove(key);
  };
  function next() {
    if (!queue.length) return;
    const key = queue.shift();
    if (still()) { run(key); return; }
    /* 넷을 다 옮긴 뒤에는 끝 문장을 읽을 틈을 둔다. */
    timer = G.delayedCall(key === 'po' ? 1.5 : 0.3, () => { timer = null; run(key); });
    if (!inView) timer.pause();
  }

  /* 고른 곳이 화면 밖이면 시연을 먼저 화면에 들인다. */
  const bring = () => {
    const r = stage.getBoundingClientRect(), top = parseFloat(getComputedStyle(D.documentElement).getPropertyValue('--nav-h')) || 46;
    const seen = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, top));
    if (seen >= Math.min(r.height, innerHeight - top) * 0.72) return 0;
    const fits = r.height <= innerHeight - top - 16;
    stage.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: fits ? 'center' : 'start' });
    return reduced() ? 0 : 480;
  };
  let wait = 0;
  const pick = (keys, scroll) => {
    touched = true;
    clearTimeout(wait);
    finish();
    const delay = scroll ? bring() : 0;
    const go = () => { queue = keys.slice(1); run(keys[0]); };
    if (delay) wait = setTimeout(go, delay); else go();
  };

  sec.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-pick]');
    if (b && sec.contains(b)) pick([b.dataset.pick], !!b.closest('.s3-pick'));
  });
  ui.all.addEventListener('click', () => {
    const rest = MOVES.filter((k) => !moved.has(k));
    if (!stay) rest.push('po');
    if (rest.length) pick(rest, true);
  });
  ui.reset.addEventListener('click', () => {
    touched = true; clearTimeout(wait); finish();
    moved.clear(); stay = false; sel = null;
    render();
  });

  render();

  let rw = stage.clientWidth;
  new ResizeObserver(() => {
    if (stage.clientWidth === rw && !moved.size) return;
    rw = stage.clientWidth;
    if (busy) { const q = queue; finish(); queue = q; next(); } else render();
  }).observe(stage);

  /* 화면 안에 있을 때만 돈다. 벗어나면 멈추고, 돌아오면 잇는다. */
  let inView = false;
  DERO.onView(hero, {
    threshold: 0.12,
    enter: () => { inView = true; if (busy) busy.resume(); if (timer) timer.resume(); },
    leave: () => { inView = false; if (busy) busy.pause(); if (timer) timer.pause(); },
  });
  /* 시연이 처음 충분히 보이면 첫 규칙 하나가 저절로 옮겨 간다. */
  DERO.onView(stage, {
    threshold: 0.6, once: true, flag: false,
    enter: () => {
      if (touched || still() || busy || moved.size) return;
      timer = G.delayedCall(0.7, () => { timer = null; if (!touched) run('comment'); });
    },
  });
})();
