/* 떠먹는 금융 ③ LLM 호출 한 곳. 고정 장면 하나: 스크롤이 2026-07-02의 커밋 네 개(13:37, 13:40, 13:42, 13:43)를 차례로 민다.
   줄마다 data-at 이 그 줄을 옮긴 단계다. 클라이언트를 만드는 줄 5 → 4 → 1, 공통 지점을 거치지 않는 파일 3 → 2 → 1 → 0.
   좁거나 낮은 화면에서는 붙잡지 않고, 장면이 화면에 들어올 때 같은 순서를 한 번 보여 준다. */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-one-ch]');
  if (!chapter || !Story || Story.still()) return;
  const one = chapter.querySelector('[data-one]');
  const rows = [...one.querySelector('[data-rows]').children].map((li) => ({ li, at: +li.dataset.at }));
  const steps = [...one.querySelector('[data-steps]').children];
  const lines = one.querySelector('[data-n]'), files = one.querySelector('[data-m]');
  const hubLine = one.querySelector('[data-line]');
  const LINES = [5, 5, 4, 1, 1], FILES = [3, 3, 2, 1, 0];
  const AT = [0, 0.18, 0.4, 0.6, 0.8];
  let shown = -1;

  const render = (p) => {
    let i = AT.length - 1;
    while (i > 0 && p < AT[i]) i--;
    if (i === shown) return;
    shown = i;
    one.dataset.step = i;
    rows.forEach((r) => { r.li.classList.toggle('is-done', r.at <= i); r.li.classList.toggle('is-now', r.at === i); });
    steps.forEach((li, n) => { li.classList.toggle('is-on', n === i); li.classList.toggle('is-off', n > i); });
    lines.textContent = LINES[i];
    files.textContent = FILES[i];
    hubLine.textContent = i === 0 ? ':57' : ':90';
  };

  one.classList.add('is-live');
  if (matchMedia('(min-width: 901px) and (min-height: 700px)').matches) {
    Story.pin(chapter, { len: 3.2, render });
    return;
  }
  render(0);
  const clock = { p: 0 };
  Story.onView(one, {
    threshold: 0.12, once: true, flag: false,
    enter: () => Story.gsap.to(clock, { p: 1, duration: 9, ease: 'none', delay: 0.8, onUpdate: () => render(clock.p) }),
  });
})();
