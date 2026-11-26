/* ⑥ 검색 설정 한 줄. 조각 장은 화면에 들어올 때 조각이 짧은 것부터 켜지고,
   동작 장은 붙잡혀서 스크롤 위치가 min_gram 값(1 → 2)이 된다. 값은 2026-11-26 로컬 재현의 것이다. */
(() => {
  const Story = window.Story;
  if (!Story) return;

  const cut = document.querySelector('[data-cut]');
  if (cut && !Story.still()) {
    const pieces = [...cut.querySelectorAll('.cut__pieces')].map((ol) => [...ol.children]);
    const order = pieces[0].flatMap((li, n) => pieces.map((col) => col[n]));
    Story.gsap.set(order, { opacity: 0.2 });
    Story.onView(cut, {
      threshold: 0.5, once: true, flag: false,
      enter: () => Story.gsap.to(order, { opacity: 1, duration: 0.45, stagger: 0.13, ease: 'power2.out', delay: 0.3 }),
    });
  }

  const chapter = document.querySelector('[data-gram-ch]');
  if (!chapter) return;
  const gram = chapter.querySelector('[data-gram]');
  const pick = (name) => gram.querySelector(`[data-${name}]`);
  const el = { v1: pick('v1'), v2: pick('v2'), match: pick('match'), link: pick('link'), q: pick('q'), s: pick('s'), r1: pick('r1'), r0: pick('r0'), arrow: pick('arrow') };
  const oneLetter = gram.querySelectorAll('[data-one]');
  const { span, ease } = Story;

  // SWAP 에서 값이 1에서 2로 넘어가고, DROP 에서 한 글자 조각이 빠지며 선이 끊기고, COUNT 에서 0건이 된다.
  const SWAP = [0.26, 0.4];
  const DROP = [0.4, 0.58];
  const COUNT = [0.58, 0.68];
  const DIM = 0.28;
  const GHOST = 0.2;
  const PAD = 5;
  let from = { x: 0, y: 0 };
  let to = { x: 0, y: 0 };

  const measure = () => {
    const box = el.match.getBoundingClientRect();
    const q = el.q.getBoundingClientRect();
    const s = el.s.getBoundingClientRect();
    from = { x: q.left + q.width / 2 - box.left, y: q.bottom - box.top + PAD };
    to = { x: s.left + s.width / 2 - box.left, y: s.top - box.top - PAD };
    el.link.setAttribute('x1', from.x);
    el.link.setAttribute('y1', from.y);
  };

  const render = (p) => {
    const swap = ease(span(p, SWAP[0], SWAP[1]));
    el.v1.style.opacity = 1 - (1 - DIM) * swap;
    el.v2.style.opacity = DIM + (1 - DIM) * swap;

    const drop = ease(span(p, DROP[0], DROP[1]));
    oneLetter.forEach((tok) => { tok.style.opacity = 1 - (1 - GHOST) * drop; });
    el.link.setAttribute('x2', from.x + (to.x - from.x) * (1 - drop));
    el.link.setAttribute('y2', from.y + (to.y - from.y) * (1 - drop));
    el.link.style.opacity = drop < 1 ? 1 : 0;
    gram.dataset.min = drop < 1 ? 1 : 2;

    const zero = ease(span(p, COUNT[0], COUNT[1]));
    el.r1.style.opacity = 1 - (1 - DIM) * zero;
    el.arrow.style.opacity = zero;
    el.r0.style.opacity = zero;
  };

  Story.pin(chapter, { len: 2, render, measure });
})();
