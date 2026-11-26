(function () {
  const { span, ease } = Scene;
  const gram = document.querySelector('[data-gram]');
  const pick = (name) => gram.querySelector(`[data-${name}]`);
  const el = { v1: pick('v1'), v2: pick('v2'), match: pick('match'), link: pick('link'), q: pick('q'), s: pick('s'), r1: pick('r1'), r0: pick('r0') };
  const oneLetter = gram.querySelectorAll('[data-one]');

  // 스크롤 위치 = min_gram 값. SWAP 에서 1이 2로 바뀌고, DROP 에서 한 글자 조각이 빠지며 선이 끊긴다.
  const SWAP = [0.34, 0.46];
  const DROP = [0.46, 0.6];
  const COUNT = [0.6, 0.66];
  const GHOST = 0.16;
  const PAD = 5;
  let from = { x: 0, y: 0 };
  let to = { x: 0, y: 0 };

  function measure() {
    const box = el.match.getBoundingClientRect();
    const q = el.q.getBoundingClientRect();
    const s = el.s.getBoundingClientRect();
    from = { x: q.left + q.width / 2 - box.left, y: q.bottom - box.top + PAD };
    to = { x: s.left + s.width / 2 - box.left, y: s.top - box.top - PAD };
    el.link.setAttribute('x1', from.x);
    el.link.setAttribute('y1', from.y);
  }

  function render(p) {
    const swap = ease(span(p, SWAP[0], SWAP[1]));
    el.v1.style.opacity = 1 - swap;
    el.v2.style.opacity = swap;

    const drop = ease(span(p, DROP[0], DROP[1]));
    oneLetter.forEach((tok) => { tok.style.opacity = 1 - (1 - GHOST) * drop; });
    el.link.setAttribute('x2', from.x + (to.x - from.x) * (1 - drop));
    el.link.setAttribute('y2', from.y + (to.y - from.y) * (1 - drop));
    el.link.style.opacity = drop < 1 ? 1 : 0;
    gram.dataset.min = drop < 1 ? 1 : 2;

    const zero = span(p, COUNT[0], COUNT[1]);
    el.r1.style.opacity = 1 - zero;
    el.r0.style.opacity = zero;
  }

  Scene.run({ measure, render });
})();
