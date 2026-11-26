/* ⑧ 남긴 큐. 고정 장면 하나: 스크롤 위치가 날짜(2026-07-31 → 08-06)다.
   08-06 에 닿으면 전제 문장에 줄이 가고, 결정 3·4·5·6·8 에 「개정」이 붙고, 유실 원인 문구가 바뀌고, +5 −4 가 뜬다.
   좁거나 낮은 화면에서는 붙잡지 않고, 장면이 화면에 들어올 때 같은 순서를 한 번 보여 준다. */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-adr-ch]');
  if (!chapter || !Story || Story.still()) return;
  const adr = chapter.querySelector('[data-adr]');
  const date = adr.querySelector('[data-date]');
  const what = adr.querySelector('[data-what]');
  const days = [...adr.querySelector('[data-days]').children];
  const revised = [...adr.querySelectorAll('[data-rev] em')];
  const kept = adr.querySelector('[data-kept] em');
  const quote = adr.querySelector('[data-premise] .adr__quote');
  const gone = adr.querySelector('[data-gone]');
  const oldReason = adr.querySelector('[data-old]');
  const newReason = adr.querySelector('[data-new]');
  const still = adr.querySelector('[data-still]');
  const diff = adr.querySelector('[data-diff]');
  const { span, ease } = Story;

  const DATES = ['2026-07-31', '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06'];
  const WHAT = [
    '설계 문서가 Redis 큐를 골랐다', '설계 문서가 Redis 큐를 골랐다',
    '큐와 스레드 1개짜리 워커를 구현했다', '큐와 스레드 1개짜리 워커를 구현했다', '큐와 스레드 1개짜리 워커를 구현했다', '큐와 스레드 1개짜리 워커를 구현했다',
    '노트북 기획을 파기하고 생성기를 외부 API로 확정했다',
  ];
  const ARRIVE = 0.46;
  let shown = -1, struck = null;
  const show = (el, t) => { el.style.opacity = t; el.style.transform = `translateY(${(1 - t) * 6}px)`; };

  const render = (p) => {
    const day = Math.min(6, Math.floor(span(p, 0.03, ARRIVE) * 6 + 0.0001));
    if (day !== shown) {
      shown = day;
      date.textContent = DATES[day];
      what.textContent = WHAT[day];
      days.forEach((li, n) => { li.classList.toggle('is-on', n === day); li.classList.toggle('is-past', n < day); });
    }
    const after = p >= ARRIVE + 0.05;
    if (after !== struck) {
      struck = after;
      quote.classList.toggle('is-before', !after);
    }
    show(gone, ease(span(p, ARRIVE + 0.05, ARRIVE + 0.1)));
    revised.forEach((em, k) => show(em, ease(span(p, 0.6 + k * 0.035, 0.63 + k * 0.035))));
    show(kept, ease(span(p, 0.79, 0.83)));
    const swapped = p >= 0.86;
    oldReason.classList.toggle('is-before', !swapped);
    show(newReason, ease(span(p, 0.86, 0.9)));
    show(still, ease(span(p, 0.88, 0.92)));
    show(diff, ease(span(p, 0.94, 0.98)));
  };

  adr.classList.add('is-live');
  if (matchMedia('(min-width: 901px) and (min-height: 760px)').matches) {
    Story.pin(chapter, { len: 3.4, render });
    return;
  }
  render(0);
  const clock = { p: 0 };
  Story.onView(adr, {
    threshold: 0.12, once: true, flag: false,
    enter: () => Story.gsap.to(clock, { p: 1, duration: 7, ease: 'none', delay: 0.4, onUpdate: () => render(clock.p) }),
  });
})();
