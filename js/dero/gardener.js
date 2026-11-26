/* ⑦ 정원사. 고정 장면 하나: 스크롤이 「번진다 → 2026-11-22 뚜껑 → 11-25 PR #88 → 11-26 PR #89」로 민다. */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-weed-ch]');
  if (!chapter || !Story || Story.still()) return;
  const weed = chapter.querySelector('[data-weed]');
  const count = weed.querySelector('[data-n]');
  const files = weed.querySelector('[data-f]');
  const lid = weed.querySelector('[data-lid]');
  const lidLine = lid.querySelector('i'), lidText = lid.querySelector('span');
  const attempt = weed.querySelector('[data-try]');
  const msgs = [...weed.querySelector('[data-msgs]').children];
  const lines = [...weed.querySelector('[data-steps]').children];
  const cells = [...weed.querySelectorAll('[data-cells] > i:not([data-try])')].map((el) => ({
    el, dots: [...el.children], out: Number(el.dataset.out) || 0,
  }));
  const dots = cells.flatMap((c) => c.dots.map((el) => ({ el, cell: c })));
  const { span, ease } = Story;

  // 2026-11-22 허용 목록은 파일 15개 18곳이다. 그 전에 번지는 순서는 꾸민 것이다.
  const TOTAL = dots.length, FILES = cells.length;
  const AT = [0, 0.3, 0.55, 0.78];
  let shown = -1;

  const render = (p) => {
    let i = AT.length - 1;
    while (i > 0 && p < AT[i]) i--;
    if (i !== shown) {
      shown = i;
      weed.dataset.step = i;
      msgs.forEach((li, n) => li.classList.toggle('is-on', n === i));
      lines.forEach((li, n) => { li.classList.toggle('is-on', n === i); li.classList.toggle('is-off', n > i); });
    }

    const grown = i > 0 ? TOTAL : Math.max(1, Math.round(1 + span(p, 0.03, 0.25) * (TOTAL - 1)));
    const out = [0, ease(span(p, AT[2], AT[2] + 0.07)), ease(span(p, AT[3], AT[3] + 0.07))];
    dots.forEach((d, k) => {
      const on = k < grown ? 1 - out[d.cell.out] : 0;
      d.el.style.opacity = on;
      d.el.style.transform = `scale(${0.4 + 0.6 * on})`;
    });
    let fileCount = 0;
    cells.forEach((c) => {
      const cleared = out[c.out] > 0.5;
      c.el.style.boxShadow = c.out && !cleared ? 'none' : '';
      c.el.style.background = c.out && !cleared ? 'rgba(255, 255, 255, .09)' : '';
      if (!cleared && dots.some((d, k) => d.cell === c && k < grown)) fileCount++;
    });
    count.textContent = i > 0 ? TOTAL - (out[1] > 0.5) - (out[2] > 0.5) : grown;
    files.textContent = i > 0 ? FILES - (out[1] > 0.5) - (out[2] > 0.5) : fileCount;

    const closed = ease(span(p, AT[1], AT[1] + 0.06));
    lidLine.style.transform = `scaleX(${closed})`;
    lidText.style.opacity = closed;
    attempt.style.opacity = i === 1 ? ease(span(p, AT[1] + 0.08, AT[1] + 0.13)) * (1 - span(p, AT[2] - 0.04, AT[2])) : 0;
  };

  weed.classList.add('is-live');
  Story.pin(chapter, { len: 3.4, render });
})();
