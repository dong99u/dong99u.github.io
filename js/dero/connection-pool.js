(function () {
  const { span, ease } = Scene;
  const pool = document.querySelector('[data-pool]');
  const count = pool.querySelector('[data-n]');
  const result = pool.querySelector('[data-res]');
  const note = pool.querySelector('[data-note]');
  const requests = Array.from(pool.querySelectorAll('[data-req]'), (el) => ({ el, k: Number(el.dataset.req) }));

  // 2026-11-26 재실행에서 잰 세 지점. 그 사이의 동시 요청 수는 재지 않았으므로 그리지 않는다.
  const steps = [
    { at: 0, n: 4, held: '1ms 이하' },
    { at: 0.3, n: 8, held: '1ms 이하' },
    { at: 0.62, n: 16, held: '5초대' },
  ];
  const ENTER = 0.1;
  let shown = -1;

  function render(p) {
    let i = steps.length - 1;
    while (i > 0 && p < steps[i].at) i--;
    const step = steps[i];
    const before = i === 0 ? step.n : steps[i - 1].n;

    if (i !== shown) {
      shown = i;
      pool.dataset.step = i;
      count.textContent = step.n;
      result.textContent = step.held;
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
  }

  Scene.run({ render });
})();
