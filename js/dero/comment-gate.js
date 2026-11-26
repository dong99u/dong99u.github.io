/* ③ 규칙을 검사로. 움직임이 꺼져 있으면 아무것도 하지 않는다(CSS 기본 모습이 끝 상태). */

/* ---------- 편집 훅 장면: 스크롤이 쓰기 → 막힘 → 고쳐서 통과를 민다 ---------- */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-cg-ch]');
  if (!chapter || !Story || Story.still()) return;
  if (chapter.scrollHeight > innerHeight + 1) return;
  const cg = chapter.querySelector('[data-cg]');
  const pick = (name) => cg.querySelector(`[data-${name}]`);
  const el = { before: pick('before'), after: pick('after'), line: pick('new'), typed: pick('typed'), caret: pick('caret'), state: pick('state'), out: pick('out'), ok: pick('ok') };
  const lines = [...pick('steps').children];
  const comment = Array.from(el.typed.textContent);
  const { span, ease } = Story;

  const TYPE = [0.05, 0.33];
  const BLOCK = 0.4;
  const SWAP = [0.7, 0.8];
  const SHAKE_PX = 7;
  const STATES = ['쓰는 중', '막힘', '통과'];
  let typedCount = -1, shown = -1;

  const render = (p) => {
    const step = p >= SWAP[0] ? 2 : p >= BLOCK ? 1 : 0;
    if (step !== shown) {
      shown = step;
      cg.dataset.step = step;
      el.state.textContent = STATES[step];
      lines.forEach((li, n) => { li.classList.toggle('is-on', n === step); li.classList.toggle('is-off', n > step); });
    }

    const count = Math.round(span(p, TYPE[0], TYPE[1]) * comment.length);
    if (count !== typedCount) {
      typedCount = count;
      el.typed.textContent = comment.slice(0, count).join('');
    }
    el.caret.style.opacity = step === 0 ? 1 : 0;

    const hit = span(p, BLOCK, BLOCK + 0.08);
    el.line.style.setProperty('--red', 0.14 * span(p, BLOCK, BLOCK + 0.03));
    el.line.style.transform = `translateX(${Math.sin(hit * Math.PI * 4) * (1 - hit) * SHAKE_PX}px)`;

    const swap = ease(span(p, SWAP[0], SWAP[1]));
    el.before.style.opacity = 1 - swap;
    el.after.style.opacity = swap;

    const told = ease(span(p, BLOCK + 0.01, BLOCK + 0.07));
    el.out.style.opacity = told * (1 - 0.5 * swap);
    el.out.style.transform = `translateY(${(1 - told) * 12}px)`;
    const passed = ease(span(p, SWAP[1] - 0.02, SWAP[1] + 0.04));
    el.ok.style.opacity = passed;
    el.ok.style.transform = `translateY(${(1 - passed) * 10}px)`;
  };

  Story.pin(chapter, { len: 2.5, render });
})();

/* ---------- 막대: 화면에 들어오면 한 번 자란다 ---------- */
(() => {
  const Story = window.Story;
  if (!Story || Story.still()) return;
  const grow = (root, bars, origin) => {
    if (!root || !bars.length) return;
    Story.gsap.set(bars, { scaleX: 0, transformOrigin: origin });
    Story.onView(root, {
      threshold: 0.5, once: true, flag: false,
      enter: () => Story.gsap.to(bars, { scaleX: (i, bar) => bar.dataset.v || 1, duration: 0.9, ease: 'power3.out', stagger: 0.14, delay: 0.25, clearProps: 'transform' }),
    });
  };
  const bars = document.querySelector('[data-bars]');
  if (bars) {
    const fills = [...bars.querySelectorAll('.cg-bars__bar i')];
    fills.forEach((bar) => { bar.dataset.v = getComputedStyle(bar.closest('li')).getPropertyValue('--v').trim(); });
    grow(bars, fills, 'left center');
  }
  const split = document.querySelector('[data-split]');
  if (split) grow(split, [...split.querySelectorAll('.cg-split__bar i')], 'left center');
})();
