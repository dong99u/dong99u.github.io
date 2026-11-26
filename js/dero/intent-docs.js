(function () {
  const { span, ease, clamp } = Scene;
  const root = document.querySelector('[data-intent]');
  const doc = root.querySelector('[data-doc]');
  const svg = root.querySelector('.pile__dots');
  const line = root.querySelector('[data-line]');
  const key = root.querySelector('[data-key]');
  const days = Number(svg.dataset.days);
  const dots = Array.from(svg.querySelectorAll('.dot'), (el) => ({
    el,
    hole: el.nextElementSibling && el.nextElementSibling.classList.contains('hole') ? el.nextElementSibling : null,
    open: el.dataset.s === '0',
    start: Number(el.dataset.d) - 1 + Number(el.dataset.k) / Number(el.dataset.c),
    rate: Number(el.dataset.c),
  }));

  const SHRINK = [0.08, 0.34];
  const STACK = [0.34, 0.84];
  const SETTLE = [0.87, 0.97];
  const OPEN_GREY = 0.22;
  let to = { x: 0, y: 0, sx: 1, sy: 1 };

  function measure() {
    doc.style.transform = 'none';
    const from = doc.getBoundingClientRect();
    const first = dots[0].el.getBoundingClientRect();
    to = { x: first.left - from.left, y: first.top - from.top, sx: first.width / from.width, sy: first.height / from.height };
  }

  function render(p) {
    const s = ease(span(p, SHRINK[0], SHRINK[1]));
    doc.style.transform = `translate(${to.x * s}px, ${to.y * s}px) scale(${1 + (to.sx - 1) * s}, ${1 + (to.sy - 1) * s})`;
    doc.style.opacity = 1 - span(p, SHRINK[1] - 0.02, SHRINK[1] + 0.015);

    const head = span(p, STACK[0], STACK[1]) * days;
    const settle = ease(span(p, SETTLE[0], SETTLE[1]));
    for (const d of dots) {
      const shown = clamp((head - d.start) * d.rate);
      d.el.style.opacity = shown * (d.open ? 1 - (1 - OPEN_GREY) * settle : 1);
      if (d.hole) d.hole.style.opacity = shown * settle;
    }
    line.style.transform = `scaleX(${head / days})`;
    key.style.opacity = settle;
  }

  Scene.run({ measure, render });
})();
