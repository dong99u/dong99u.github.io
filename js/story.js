/* =========================================================================
   story.js · 3판 글 페이지가 함께 쓰는 도구. gsap 3.12.5 + ScrollTrigger 뒤, js/<project>/<slug>.js 앞에 실린다.
   전역은 window.Story 하나다. 장의 규칙과 class 이름은 css/base.css 머리말에 있다.

   ■ 알아서 하는 일 (글 쪽에서 할 일 없음)
     - 진행 표시: .ch[data-ch] 를 읽어 위 막대에 「03 / 11 이름」과 칸 줄을 만든다. 장마다 id="ch-N" 을 단다.
       지금 보는 장에 .is-now 가 붙는다.
     - 등장: 장이 화면에 들어오면 그 장의 바로 아래 자식들이 차례로 떠오른다(ScrollTrigger, 한 번).
       장에 data-rv="off" 를 달면 하지 않는다. Story.pin 으로 붙잡은 장도 하지 않는다.
     - [data-words]   그 글이 스크롤에 맞춰 낱말 단위로 밝아진다(안의 em, a, b 는 그대로 남는다).
     - [data-count="12666"]  화면에 들어오면 0 에서 그 수까지 센다. 글자는 처음부터 끝 값으로 적어 둔다.
     - .fl            포인터를 따라 테두리가 밝아진다.

   ■ 글 쪽에서 부르는 것
     Story.onView(el, opt) → { visible, stop() }
       글의 스크립트는 이것으로 화면 안에 있을 때만 돈다.
       opt.enter(el) / opt.leave(el)  번갈아서만 불린다. 탭이 가려지면 leave, 다시 보이면 enter.
       opt.threshold 기본 0.15(화면보다 큰 요소는 낮게) · opt.margin rootMargin · opt.once · opt.flag(false 면 .is-view 안 붙임)
     Story.pin(장, { len, render(p), measure() }) → ScrollTrigger | null
       장을 화면에 붙잡고 스크롤 len 화면(기본 2)만큼을 p(0~1)로 바꿔 render 에 넘긴다.
       render 는 p 만 보고 화면을 정한다(같은 위치는 같은 화면, 거꾸로 올려도 되돌아간다).
       모션 줄이기이거나 GSAP 이 없으면 아무것도 하지 않고 null 을 돌려준다. 그때는 CSS 의 기본 모습(끝 상태)이 보인다.
       붙잡힌 동안 장 높이는 100svh 다. 내용이 그 안에 들어가야 한다. 좁은 화면에서 안 들어가면 matchMedia 로 걸지 않는다.
     Story.clamp(v) · Story.span(p, from, to) · Story.ease(t)   render 안에서 쓰는 0~1 계산
     Story.gsap / Story.ScrollTrigger   CDN 이 막히면 null
     Story.reduced()   모션 줄이기가 켜져 있으면 true
     Story.still()     움직이면 안 될 때 true(모션 줄이기 또는 gsap 없음). true 면 끝 상태를 바로 그린다.
     Story.light(el)   나중에 만든 .fl 요소에 포인터 조명을 붙인다.
     Story.count(el)   나중에 만든 [data-count] 를 세기 감시에 넣는다.
   ========================================================================= */
(() => {
  const D = document, root = D.documentElement;
  root.classList.add('js');
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const G = window.gsap || null;
  const ST = (G && window.ScrollTrigger) || null;
  const Story = window.Story = {};
  if (ST) { G.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); }

  Story.gsap = G;
  Story.ScrollTrigger = ST;
  Story.reduced = () => reduceMQ.matches;
  Story.still = () => reduceMQ.matches || !ST;
  Story.clamp = (v) => Math.min(1, Math.max(0, v));
  Story.span = (p, from, to) => Story.clamp((p - from) / (to - from));
  Story.ease = (t) => t * t * (3 - 2 * t);
  if (!Story.still()) root.classList.add('motion');

  /* ---------- 화면 진입 감지 ---------- */
  const watchers = new Set();
  Story.onView = (el, opt = {}) => {
    const w = { inside: false, on: false, io: null };
    const api = {
      get visible() { return w.on; },
      stop() { if (w.io) w.io.disconnect(); watchers.delete(w); },
    };
    w.sync = () => {
      const on = w.inside && !D.hidden;
      if (on === w.on) return;
      w.on = on;
      if (opt.flag !== false) el.classList.toggle('is-view', on);
      if (on) {
        if (opt.enter) opt.enter(el);
        if (opt.once) api.stop();
      } else if (opt.leave) opt.leave(el);
    };
    w.io = new IntersectionObserver(([en]) => { w.inside = en.isIntersecting; w.sync(); }, {
      threshold: opt.threshold == null ? 0.15 : opt.threshold, rootMargin: opt.margin || '0px',
    });
    watchers.add(w);
    w.io.observe(el);
    return api;
  };
  D.addEventListener('visibilitychange', () => [...watchers].forEach((w) => w.sync()));

  /* ---------- 고정 장면 ---------- */
  const pinned = new Set();
  Story.pin = (sec, { len = 2, render, measure } = {}) => {
    if (!sec || Story.still()) return null;
    const wrap = D.createElement('div');
    wrap.className = 'pin';
    wrap.style.setProperty('--len', len);
    sec.before(wrap);
    wrap.append(sec);
    sec.classList.add('is-pin');
    pinned.add(sec);
    const draw = (p) => { if (render) render(p); };
    const trigger = ST.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: true,
      onRefresh: (self) => { if (measure) measure(); draw(self.progress); },
      onUpdate: (self) => draw(self.progress),
    });
    if (measure) measure();
    draw(trigger.progress);
    ST.refresh();
    return trigger;
  };

  /* ---------- 진행 표시 ---------- */
  const chapters = [...D.querySelectorAll('.ch')];
  const at = D.querySelector('[data-at]');
  const prog = D.querySelector('[data-prog]');
  const two = (n) => String(n).padStart(2, '0');
  const ticks = chapters.map((ch, n) => {
    if (!ch.id) ch.id = `ch-${n + 1}`;
    if (!prog) return null;
    const li = D.createElement('li'), a = D.createElement('a');
    a.href = `#${ch.id}`;
    a.title = ch.dataset.ch || '';
    a.setAttribute('aria-label', `${n + 1}장 ${ch.dataset.ch || ''}`);
    li.append(a); prog.append(li);
    return a;
  });
  let now = -1, spyFrame = 0;
  const spy = () => {
    spyFrame = 0;
    const line = innerHeight * 0.5;
    let n = 0;
    chapters.forEach((ch, k) => { if ((ch.closest('.pin') || ch).getBoundingClientRect().top <= line) n = k; });
    if (n === now) return;
    now = n;
    chapters.forEach((ch, k) => ch.classList.toggle('is-now', k === n));
    ticks.forEach((a, k) => {
      if (!a) return;
      a.classList.toggle('is-past', k < n);
      if (k === n) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    if (at) at.innerHTML = `<span><b>${two(n + 1)}</b> / ${two(chapters.length)}</span><i>${chapters[n].dataset.ch || ''}</i>`;
  };
  const spySoon = () => { if (!spyFrame) spyFrame = requestAnimationFrame(spy); };
  if (chapters.length) {
    addEventListener('scroll', spySoon, { passive: true });
    addEventListener('resize', spySoon);
    spy();
  }

  /* ---------- 등장, 낱말, 숫자 ---------- */
  const counters = new WeakSet();
  Story.count = (el) => {
    if (!el || counters.has(el)) return;
    counters.add(el);
    const to = +el.dataset.count;
    if (Story.still() || !Number.isFinite(to)) return;
    Story.onView(el, {
      threshold: 0.6, once: true, flag: false,
      enter: () => {
        const o = { v: 0 };
        G.to(o, { v: to, duration: 1.3, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); } });
      },
    });
  };

  const splitWords = (el) => {
    const walker = D.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const out = [];
    nodes.forEach((node) => {
      const frag = D.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.append(tok); return; }
        const s = D.createElement('span');
        s.textContent = tok;
        frag.append(s); out.push(s);
      });
      node.replaceWith(frag);
    });
    return out;
  };

  if (!Story.still()) {
    // 글의 스크립트가 Story.pin 을 건 뒤에 등장을 건다(붙잡힌 장은 등장에서 빠진다).
    addEventListener('DOMContentLoaded', () => {
      chapters.forEach((ch, n) => {
        if (pinned.has(ch) || ch.dataset.rv === 'off') return;
        G.from([...ch.children], {
          autoAlpha: 0, y: 26, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: n === 0 ? 0.1 : 0,
          clearProps: 'opacity,visibility,transform',
          scrollTrigger: { trigger: ch, start: 'top 68%', once: true },
        });
      });
      D.querySelectorAll('[data-words]').forEach((el) => {
        const words = splitWords(el);
        if (!words.length) return;
        G.fromTo(words, { opacity: 0.2 }, {
          opacity: 1, ease: 'none', stagger: 0.6 / words.length, duration: 0.4,
          scrollTrigger: { trigger: el.closest('.ch') || el, start: 'top 62%', end: 'top 8%', scrub: true },
        });
      });
      if (D.fonts && D.fonts.ready) D.fonts.ready.then(() => ST.refresh());
    });
  }
  D.querySelectorAll('[data-count]').forEach(Story.count);

  /* ---------- 포인터 조명 ---------- */
  const capable = matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
  const lit = new Set();
  let point = null, frame = 0;
  const paint = () => {
    frame = 0;
    const reads = [...lit].map((c) => [c, c.getBoundingClientRect(), parseFloat(getComputedStyle(c).getPropertyValue('--fl-r')) || 260]);
    for (const [c, r, rad] of reads) {
      const x = point ? point.x - r.left : 0, y = point ? point.y - r.top : 0;
      const dist = Math.hypot(Math.max(0, -x, x - r.width), Math.max(0, -y, y - r.height));
      const near = !!point && capable.matches && dist < rad;
      if (near) { c.style.setProperty('--lx', x + 'px'); c.style.setProperty('--ly', y + 'px'); }
      c.classList.toggle('near', near);
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  const clear = () => { point = null; schedule(); };
  const fio = new IntersectionObserver((ens) => {
    for (const en of ens) { if (en.isIntersecting) lit.add(en.target); else { lit.delete(en.target); en.target.classList.remove('near'); } }
    schedule();
  });
  Story.light = (el) => {
    if (!el || el.dataset.fl) return;
    el.dataset.fl = '1';
    if (!el.querySelector(':scope > .lamp')) {
      const lamp = D.createElement('span');
      lamp.className = 'lamp'; lamp.setAttribute('aria-hidden', 'true');
      el.prepend(lamp);
    }
    fio.observe(el);
  };
  D.querySelectorAll('.fl').forEach(Story.light);
  D.addEventListener('pointermove', (ev) => {
    if (ev.pointerType === 'touch' || !capable.matches) { if (point) clear(); return; }
    point = { x: ev.clientX, y: ev.clientY }; schedule();
  }, { passive: true });
  D.addEventListener('scroll', () => { if (point) schedule(); }, { capture: true, passive: true });
  root.addEventListener('pointerleave', clear);
  D.addEventListener('pointercancel', clear);
  addEventListener('blur', clear);
})();
