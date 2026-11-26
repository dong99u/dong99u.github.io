/* ① 의도 문서. 절차 장과 쌓임 장을 스크롤이 민다(Story.pin).
   모션 줄이기이거나 GSAP 이 없으면 붙잡지 않는다. 그때는 CSS 의 끝 상태가 보이고, 누르는 조작만 남는다. */

/* ---------- 절차: 스크롤이 아홉 자리를 차례로 지난다 ---------- */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-flow-ch]');
  if (!chapter || !Story) return;
  const flow = chapter.querySelector('[data-flow]');
  const pick = (name) => flow.querySelector(`[data-${name}]`);
  const out = { who: pick('read-who'), n: pick('read-n'), title: pick('read-title'), say: pick('read-say'), file: pick('read-file'), line: pick('line') };
  const WHO = { agent: '에이전트', human: '사람' };

  const steps = [...flow.querySelectorAll('.flow__step')].map((li) => {
    const button = li.querySelector('button');
    const no = li.closest('.flow__stage').querySelector('.flow__no');
    return {
      li, button,
      who: li.dataset.who || '',
      stage: [...no.childNodes].filter((n) => n.nodeName !== 'SPAN').map((n) => n.textContent).join(' ').trim(),
      title: button.textContent,
      say: li.querySelector('.flow__more').innerHTML,
      file: button.dataset.file,
    };
  });
  const whole = { n: out.n.textContent, title: out.title.textContent, say: out.say.innerHTML, file: out.file.innerHTML };
  const END = steps.length;
  let shown = END;

  // i = 0 ~ END-1 은 그 자리, END 는 전체(끝 상태).
  const show = (i) => {
    shown = i;
    const all = i === END, step = steps[i];
    flow.classList.toggle('is-live', !all);
    steps.forEach((s, k) => {
      s.li.classList.toggle('is-on', k === i);
      s.li.classList.toggle('is-past', k < i);
      s.button.setAttribute('aria-pressed', k === i);
    });
    out.line.style.transform = all ? '' : `scaleX(${(i + 1) / END})`;
    out.who.hidden = all || !step.who;
    if (!all && step.who) { out.who.dataset.who = step.who; out.who.textContent = WHO[step.who]; }
    out.n.textContent = all ? whole.n : `${i + 1} / ${END} · ${step.stage}`;
    out.title.textContent = all ? whole.title : step.title;
    out.say.innerHTML = all ? whole.say : step.say;
    if (all) out.file.innerHTML = whole.file;
    else if (step.file) { out.file.textContent = '만든 것'; const b = document.createElement('b'); b.textContent = step.file; out.file.append(b); }
    else out.file.textContent = '';
  };

  steps.forEach((s, k) => s.button.addEventListener('click', () => show(shown === k ? END : k)));

  // 스크롤 자리 하나가 화면 하나다. 마지막 구간은 전체를 다시 보여 준다.
  let at = -1;
  const render = (p) => {
    const i = Math.min(END, Math.floor(Story.span(p, 0.02, 0.98) * (END + 1)));
    if (i === at) return;
    at = i;
    show(i);
  };
  // 붙잡힌 장은 100svh 안에 들어가야 한다. 좁은 화면은 단계가 세로로 쌓여 더 높아야 한다. 안 맞으면 붙잡지 않고 누르는 조작만 둔다.
  const roomy = matchMedia('(min-width: 901px) and (min-height: 640px), (max-width: 900px) and (min-height: 840px)');
  if (roomy.matches) Story.pin(chapter, { len: 4, render });
})();

/* ---------- 쌓임: 점 209개가 실제 날짜순으로 놓인다 ---------- */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-pile-ch]');
  if (!chapter || !Story) return;
  const pile = chapter.querySelector('[data-pile]');
  const svg = pile.querySelector('.pile__dots');
  const out = { date: pile.querySelector('[data-date]'), n: pile.querySelector('[data-n]'), line: pile.querySelector('[data-line]') };
  const keys = [...pile.querySelectorAll('[data-iso]')];
  const { span, ease, clamp } = Story;
  const days = Number(svg.dataset.days);
  const dots = Array.from(svg.querySelectorAll('.dot'), (el) => ({
    el,
    hole: el.nextElementSibling && el.nextElementSibling.classList.contains('hole') ? el.nextElementSibling : null,
    status: el.dataset.s,
    day: Number(el.dataset.d),
    start: Number(el.dataset.d) - 1 + Number(el.dataset.k) / Number(el.dataset.c),
    rate: Number(el.dataset.c),
  }));

  const DAY0 = Date.UTC(2026, 9, 3);       // 도입일. 점의 day 는 여기서 센 날수다(1 = 10-04, 50 = 11-22).
  const dateOf = (day) => new Date(DAY0 + day * 864e5).toISOString().slice(0, 10);
  const STACK = [0.04, 0.8], SETTLE = [0.84, 0.95];
  const OPEN_GREY = 0.22, OTHER = 0.07;
  let head = days, settle = 1, iso = null;

  const paint = () => {
    let count = 0;
    for (const d of dots) {
      const on = clamp((head - d.start) * d.rate);
      if (on > 0) count++;
      const tone = iso === null ? (d.status === '0' ? 1 - (1 - OPEN_GREY) * settle : 1) : (d.status === iso ? 1 : OTHER);
      d.el.style.opacity = on * tone;
      if (d.hole) d.hole.style.opacity = on * settle;
    }
    out.line.style.transform = `scaleX(${head / days})`;
    out.date.textContent = dateOf(Math.min(days, Math.max(1, Math.ceil(head))));
    out.n.textContent = count;
  };

  keys.forEach((button) => button.addEventListener('click', () => {
    iso = iso === button.dataset.iso ? null : button.dataset.iso;
    keys.forEach((b) => b.setAttribute('aria-pressed', b.dataset.iso === iso));
    paint();
  }));

  const render = (p) => {
    head = span(p, STACK[0], STACK[1]) * days;
    settle = ease(span(p, SETTLE[0], SETTLE[1]));
    paint();
  };
  Story.pin(chapter, { len: 3, render });
})();
