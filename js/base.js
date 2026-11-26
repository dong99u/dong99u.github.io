/* =========================================================================
   base.js · 네 섹션이 함께 쓰는 도구. 이 파일은 뼈대 담당만 고친다.
   gsap 3.12.5 뒤, s1~s4.js 앞에 실린다. 전역은 window.DERO 하나다.

   DERO.onView(el, opt) → { visible, stop() }
     섹션 JS 는 이것으로 화면 안에 있을 때만 돈다.
     opt.enter(el)   화면에 들어왔을 때. 탭이 다시 보일 때도 불린다.
     opt.leave(el)   화면을 벗어났을 때. 탭이 가려질 때도 불린다.
     opt.threshold   요소 넓이 중 보여야 하는 비율. 기본 0.15.
                     화면보다 큰 요소는 높은 값에 닿지 못하니 낮게 준다.
     opt.margin      IntersectionObserver rootMargin. 기본 '0px'.
     opt.once        true 면 처음 enter 한 번만 부르고 끝낸다.
     opt.flag        false 면 el 에 .is-view class 를 붙이지 않는다. 기본 true.
     enter 와 leave 는 번갈아서만 불린다. 처음 상태는 「밖」이다.

   DERO.gsap         gsap. CDN 이 막히면 null.
   DERO.reduced()    모션 줄이기가 켜져 있으면 true.
   DERO.still()      움직이면 안 될 때 true(모션 줄이기 또는 gsap 없음).
                     true 면 끝 상태를 바로 그린다.
   DERO.motion       { fast: .12, ui: .18, move: .35, slow: .6, ease: 'power2.out',
                       easeInOut: 'power2.inOut' }  gsap 용. base.css 의 --t-* 와 같다.
   DERO.light(el)    나중에 만든 .fl 요소에 포인터 조명을 붙인다.
   DERO.reveal(root) 나중에 만든 .rv 요소를 등장 감시에 넣는다. root 기본은 document.
   DERO.goto(el)     요소로 스크롤한다(모션 줄이기면 바로 이동).

   알아서 하는 일: 내비의 현재 섹션 표시([data-sec] 를 읽는다), .fl 조명,
   .rv 등장, #해시로 들어왔을 때 위 섹션이 늦게 자라도 자리를 다시 맞추기.
   ========================================================================= */
(() => {
  const D = document, root = D.documentElement;
  root.classList.add('js');
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const G = window.gsap || null;
  const DERO = window.DERO = window.DERO || {};

  DERO.gsap = G;
  DERO.reduced = () => reduceMQ.matches;
  DERO.still = () => reduceMQ.matches || !G;
  DERO.motion = { fast: 0.12, ui: 0.18, move: 0.35, slow: 0.6, ease: 'power2.out', easeInOut: 'power2.inOut' };
  DERO.goto = (el) => { if (el) el.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' }); };

  /* ---------- 화면 진입 감지 ---------- */
  const watchers = new Set();
  DERO.onView = (el, opt = {}) => {
    const w = { el, opt, inside: false, on: false, io: null };
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

  /* ---------- 내비: 현재 섹션 ---------- */
  const secs = [...D.querySelectorAll('[data-sec][id]')];
  const links = new Map([...D.querySelectorAll('.top__item[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
  let spyFrame = 0, currentId = null;
  const spy = () => {
    spyFrame = 0;
    const line = innerHeight * 0.4;
    let id = null;
    for (const s of secs) if (s.getBoundingClientRect().top <= line) id = s.id;
    if (id === currentId) return;
    currentId = id;
    links.forEach((a, key) => { if (key === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  };
  const spySoon = () => { if (!spyFrame) spyFrame = requestAnimationFrame(spy); };
  addEventListener('scroll', spySoon, { passive: true });
  addEventListener('resize', spySoon);
  spy();

  /* ---------- #해시 자리 다시 맞추기 ---------- */
  let touched = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, () => { touched = true; }, { passive: true, once: true }));
  const anchor = () => {
    if (touched || location.hash.length < 2) return;
    const el = D.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!el) return;
    const top = el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop || 0);
    if (Math.abs(top) > 2) scrollBy({ top, behavior: 'instant' });
    spySoon();
  };
  requestAnimationFrame(anchor);
  addEventListener('load', () => { anchor(); setTimeout(anchor, 300); });
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(anchor);

  /* ---------- 등장 ---------- */
  const rio = new IntersectionObserver((ens) => ens.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); rio.unobserve(en.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  DERO.reveal = (scope = D) => scope.querySelectorAll('.rv:not(.in)').forEach((n) => rio.observe(n));
  DERO.reveal();

  /* ---------- 포인터 조명 ---------- */
  const capable = matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
  const visible = new Set();
  let point = null, frame = 0;
  const paint = () => {
    frame = 0;
    const reads = [...visible].map((c) => [c, c.getBoundingClientRect(), parseFloat(getComputedStyle(c).getPropertyValue('--fl-r')) || 260]);
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
    for (const en of ens) { if (en.isIntersecting) visible.add(en.target); else { visible.delete(en.target); en.target.classList.remove('near'); } }
    schedule();
  });
  DERO.light = (el) => {
    if (!el || el.dataset.fl) return;
    el.dataset.fl = '1';
    if (!el.querySelector(':scope > .lamp')) {
      const lamp = D.createElement('span');
      lamp.className = 'lamp'; lamp.setAttribute('aria-hidden', 'true');
      el.prepend(lamp);
    }
    fio.observe(el);
  };
  D.querySelectorAll('.fl').forEach(DERO.light);
  D.addEventListener('pointermove', (ev) => {
    if (ev.pointerType === 'touch' || !capable.matches) { if (point) clear(); return; }
    point = { x: ev.clientX, y: ev.clientY }; schedule();
  }, { passive: true });
  D.addEventListener('scroll', () => { if (point) schedule(); }, { capture: true, passive: true });
  root.addEventListener('pointerleave', clear);
  D.addEventListener('pointercancel', clear);
  addEventListener('blur', clear);
})();
