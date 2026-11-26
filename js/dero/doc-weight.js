/* ④ 줄 수와 토큰. 저울(스크롤 고정 장면), 후보 목록(직접 조작), 화면 폭 네 가지(화면에 들어오면 한 번 돈다).
   스크립트가 아무것도 하지 않아도 CSS 의 기본 모습이 끝 상태다. */

/* ---------- 저울: 단위가 줄 수에서 토큰으로 바뀌면 반대로 기운다 ---------- */
(() => {
  const Story = window.Story, chapter = document.querySelector('[data-scale-ch]');
  if (!chapter || !Story) return;
  const scale = chapter.querySelector('[data-scale]');
  const beam = scale.querySelector('[data-beam]');
  const buttons = [...scale.querySelectorAll('[data-u]')];
  const { span, ease } = Story;

  // 줄 수로는 99줄 쪽이 조금, 토큰으로는 69줄 쪽이 크게 내려간다.
  const TILT_LINES = 3, TILT_TOKENS = -9;
  const SWING = [0.22, 0.78];

  const setUnit = (unit) => {
    if (scale.dataset.unit === unit) return;
    scale.dataset.unit = unit;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.u === unit)));
  };
  const render = (p) => {
    const t = ease(span(p, SWING[0], SWING[1]));
    beam.style.transform = `rotate(${TILT_LINES + (TILT_TOKENS - TILT_LINES) * t}deg)`;
    setUnit(p < 0.5 ? 'lines' : 'tok');
  };

  const trigger = Story.pin(chapter, { len: 2, render });
  buttons.forEach((b) => b.addEventListener('click', () => {
    if (!trigger) { setUnit(b.dataset.u); return; }
    const at = b.dataset.u === 'lines' ? 0.04 : 0.96;
    scrollTo({ top: trigger.start + (trigger.end - trigger.start) * at, behavior: 'smooth' });
  }));
})();

/* ---------- 후보 목록: 새 규칙은 왼쪽에 쌓이고, 승인한 것만 오른쪽으로 간다 ---------- */
(() => {
  const queue = document.querySelector('[data-queue]');
  if (!queue) return;
  const cand = queue.querySelector('[data-cand]'), live = queue.querySelector('[data-live]');
  const add = queue.querySelector('[data-add]'), reset = queue.querySelector('[data-reset]'), now = queue.querySelector('[data-now]');
  const first = { cand: cand.innerHTML, live: live.innerHTML, now: now.textContent };
  const NAMES = ['D', 'E', 'F'];
  let next = 0;

  const arm = (li) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = '승인';
    b.setAttribute('aria-label', `규칙 ${li.dataset.rule} 승인`);
    b.addEventListener('click', () => {
      b.remove();
      li.dataset.who = 'human';
      li.insertAdjacentHTML('beforeend', '<em>승인됨</em>');
      li.classList.add('is-new');
      live.append(li);
      now.textContent = `규칙 ${li.dataset.rule}를 승인했다. 이제 에이전트가 매번 읽는다.`;
    });
    li.append(b);
  };
  const start = () => {
    cand.innerHTML = first.cand;
    live.innerHTML = first.live;
    now.textContent = first.now;
    next = 0;
    add.disabled = false;
    [...cand.children].forEach(arm);
  };

  add.addEventListener('click', () => {
    const name = NAMES[next++];
    const li = document.createElement('li');
    li.dataset.rule = name;
    li.className = 'is-new';
    li.innerHTML = `<span>규칙 ${name}</span>`;
    arm(li);
    cand.append(li);
    now.textContent = `규칙 ${name}가 후보 목록에 들어갔다. 승인하기 전에는 에이전트가 읽지 않는다.`;
    if (next >= NAMES.length) add.disabled = true;
  });
  reset.addEventListener('click', start);
  start();
})();

/* ---------- 화면 폭 네 가지: 390 → 768 → 1280 → 1600 을 두 번 밟고 PASS 한 건 ---------- */
(() => {
  const Story = window.Story, box = document.querySelector('[data-widths]');
  if (!box || !Story || Story.still()) return;
  const screens = [...box.querySelectorAll('.widths__row li')];
  const runs = [...box.querySelectorAll('.widths__runs li')];
  const replay = box.querySelector('[data-replay]');
  const STEP = 700;
  let timer = 0, played = false;

  const end = () => {
    clearTimeout(timer);
    box.classList.remove('is-run');
    screens.forEach((li) => li.classList.remove('is-at'));
    runs.forEach((li) => li.classList.remove('is-on'));
  };
  const play = () => {
    end();
    played = true;
    box.classList.add('is-run');
    let step = 0;
    const tick = () => {
      if (step >= screens.length * 2) { end(); return; }
      const round = Math.floor(step / screens.length), k = step % screens.length;
      screens.forEach((li, n) => li.classList.toggle('is-at', n === k));
      runs.forEach((li, n) => li.classList.toggle('is-on', n <= round));
      step += 1;
      timer = setTimeout(tick, STEP);
    };
    tick();
  };

  replay.addEventListener('click', play);
  Story.onView(box, { threshold: 0.6, flag: false, enter: () => { if (!played) play(); }, leave: end });
})();
