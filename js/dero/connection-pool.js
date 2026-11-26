/* ⑤ 연결 풀. 두 부분이다: 연결 풀 그림(요청이 연결을 차례로 빌린다), 재현 장면(고정 장면). */

/* ---------- 연결 풀 그림: 빌린 연결 세 개가 차례로 켜진다 ---------- */
(() => {
  const Story = window.Story, fig = document.querySelector('[data-poolfig]');
  if (!fig || !Story || Story.still()) return;
  const held = [...fig.querySelectorAll('.poolfig__slots b')];
  Story.gsap.set(held, { opacity: 0 });
  Story.onView(fig, {
    threshold: 0.6, once: true, flag: false,
    enter: () => Story.gsap.to(held, { opacity: 1, duration: 0.45, stagger: 0.25, ease: 'power2.out', delay: 0.5 }),
  });
})();

/* ---------- 재현 장면: 스크롤이 동시 요청 수를 4 → 8 → 16 으로 민다 ---------- */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-pool-ch]');
  if (!chapter || !Story) return;
  const pool = chapter.querySelector('[data-pool]');
  const count = pool.querySelector('[data-n]');
  const result = pool.querySelector('[data-res]');
  const note = pool.querySelector('[data-note]');
  const lines = [...pool.querySelector('[data-steps]').children];
  const requests = Array.from(pool.querySelectorAll('[data-req]'), (el) => ({ el, k: Number(el.dataset.req) }));
  const { span, ease } = Story;

  // 2026-11-26 재실행에서 잰 세 지점. 그 사이의 동시 요청 수는 재지 않았으므로 그리지 않는다.
  const steps = [
    { at: 0, n: 4, held: '1ms 이하' },
    { at: 0.3, n: 8, held: '1ms 이하' },
    { at: 0.62, n: 16, held: '5초대' },
  ];
  const ENTER = 0.1;
  let shown = -1;

  const render = (p) => {
    let i = steps.length - 1;
    while (i > 0 && p < steps[i].at) i--;
    const step = steps[i];
    const before = i === 0 ? step.n : steps[i - 1].n;

    if (i !== shown) {
      shown = i;
      pool.dataset.step = i;
      count.textContent = step.n;
      result.textContent = step.held;
      lines.forEach((li, n) => { li.classList.toggle('is-on', n === i); li.classList.toggle('is-off', n > i); });
    }

    const t = i === 0 ? 1 : ease(span(p, step.at, step.at + ENTER));
    for (const r of requests) {
      const on = r.k <= before ? 1 : r.k <= step.n ? t : 0;
      r.el.style.opacity = on;
      r.el.style.transform = `scale(${0.4 + 0.6 * on})`;
    }
    const slow = step.held !== steps[0].held;
    note.style.opacity = slow ? t : 0;
    result.style.opacity = slow ? t : 1;
  };

  Story.pin(chapter, { len: 2.5, render });
})();
