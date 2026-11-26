/* 떠먹는 금융 ② 보내고, 확인하고, 기록. 고정 장면 하나: 스크롤이 「기사 3건 → send → flush → 다음 실행」으로 민다.
   같은 기사 A·B·C(꾸민 예시, B 전달 실패)를 수정 전 순서와 수정 후 순서로 나란히 보낸다.
   좁거나 낮은 화면에서는 붙잡지 않고, 장면이 화면에 들어올 때 같은 순서를 한 번 보여 준다. */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-send-ch]');
  if (!chapter || !Story || Story.still()) return;
  const send = chapter.querySelector('[data-send]');
  const steps = [...send.querySelector('[data-steps]').children];
  const lanes = [...send.querySelectorAll('[data-lane]')].map((el) => ({
    old: el.dataset.lane === 'old',
    arts: [...el.querySelector('[data-arts]').children].map((li) => ({ li, em: li.querySelector('em'), ok: li.dataset.r === 'ok' })),
    book: [...el.querySelector('[data-book]').children].map((li) => ({ li, em: li.querySelector('em'), end: li.querySelector('em').textContent })),
  }));
  const AT = [0, 0.22, 0.48, 0.76];
  let shown = -1;

  const render = (p) => {
    let i = AT.length - 1;
    while (i > 0 && p < AT[i]) i--;
    if (i === shown) return;
    shown = i;
    send.dataset.step = i;
    steps.forEach((li, n) => { li.classList.toggle('is-on', n === i); li.classList.toggle('is-off', n > i); });
    lanes.forEach((lane) => {
      lane.arts.forEach((a) => {
        a.em.textContent = i === 0 ? '대기' : i === 1 ? '버퍼에 있음' : a.ok ? '전달됨' : '전달 실패';
        a.li.dataset.s = i < 2 ? '' : a.ok ? 'ok' : 'fail';
      });
      // 수정 전은 send 때(1) 세 건을 모두 적는다. 수정 후는 flush 뒤(2)에 전달된 것만 적는다.
      const written = lane.old ? i >= 1 : i >= 2;
      lane.book.forEach((b, n) => {
        const blank = !written;
        b.li.classList.toggle('is-blank', blank);
        b.em.textContent = blank ? '빈칸' : b.end;
        if (lane.old && n === 1) b.li.toggleAttribute('data-wrong', i >= 2);
      });
    });
  };

  send.classList.add('is-live');
  if (matchMedia('(min-width: 901px) and (min-height: 700px)').matches) {
    Story.pin(chapter, { len: 3, render });
    return;
  }
  render(0);
  const clock = { p: 0 };
  Story.onView(send, {
    threshold: 0.12, once: true, flag: false,
    enter: () => Story.gsap.to(clock, { p: 1, duration: 9, ease: 'none', delay: 0.8, onUpdate: () => render(clock.p) }),
  });
})();
