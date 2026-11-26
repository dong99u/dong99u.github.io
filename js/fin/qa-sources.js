/* 떠먹는 금융 ① 답과 출처. 고정 장면 하나: 스크롤이 「검색 5건 → ① 점수 바닥 → ② 1등 대비 85% → ③ 답변 확인」으로 민다.
   모습은 css 가 data-step 으로 정한다. 좁거나 낮은 화면에서는 붙잡지 않고, 장면이 화면에 들어올 때 같은 순서를 한 번 보여 준다. */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-gate-ch]');
  if (!chapter || !Story || Story.still()) return;
  const gate = chapter.querySelector('[data-gate]');
  const msgs = [...gate.querySelector('[data-msgs]').children];
  const steps = [...gate.querySelector('[data-steps]').children];
  const AT = [0, 0.24, 0.5, 0.76];
  let shown = -1;

  const render = (p) => {
    let i = AT.length - 1;
    while (i > 0 && p < AT[i]) i--;
    if (i === shown) return;
    shown = i;
    gate.dataset.step = i;
    msgs.forEach((li, n) => li.classList.toggle('is-on', n === i));
    steps.forEach((li, n) => { li.classList.toggle('is-on', n === i); li.classList.toggle('is-off', n > i); });
  };

  gate.classList.add('is-live');
  if (matchMedia('(min-width: 901px) and (min-height: 700px)').matches) {
    Story.pin(chapter, { len: 3, render });
    return;
  }
  render(0);
  const clock = { p: 0 };
  Story.onView(gate, {
    threshold: 0.12, once: true, flag: false,
    enter: () => Story.gsap.to(clock, {
      p: 1, duration: 8, ease: 'none', delay: 0.8,
      onUpdate: () => render(clock.p), onComplete: () => gate.classList.add('is-done'),
    }),
  });
})();
