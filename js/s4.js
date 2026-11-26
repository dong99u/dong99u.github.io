/* s4.js · ④ 장치로 막은 사례 둘. 각 장치는 화면 안에 있을 때만 돈다(DERO.onView). */
(() => {
  const D = document, DERO = window.DERO;
  const sec = D.getElementById('cases');
  if (!sec || !DERO) return;
  const $ = (s, r = sec) => r.querySelector(s);
  const $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const reduced = DERO.reduced;

  /* ---------- 사례 A: 저울 둘 ---------- */
  const scales = $('[data-scales]');
  if (scales) {
    const live = $('[data-scales-live]', scales);
    const SAY = {
      heavy: '70줄 문서를 골랐다. 줄 수 저울에서는 100줄 문서보다 가볍고 줄 수 기준을 통과했다. 토큰 저울에서는 17,597토큰으로 더 무겁다.',
      light: '100줄 문서를 골랐다. 줄 수 저울에서는 더 무겁고 줄 수 기준을 어긴 유일한 파일이다. 토큰 저울에서는 약 4,000토큰(계산값)으로 더 가볍다.',
    };
    const pick = (doc) => {
      scales.dataset.doc = doc;
      $$('.seg button', scales).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.doc === doc)));
      if (live) live.textContent = SAY[doc];
    };
    $$('.seg button', scales).forEach((b) => b.addEventListener('click', () => pick(b.dataset.doc)));
    /* 저울의 다른 쪽 접시를 눌러도 문서가 바뀐다 */
    $$('.s4-pan--r', scales).forEach((p) => {
      p.style.cursor = 'pointer';
      p.addEventListener('click', () => pick(scales.dataset.doc === 'heavy' ? 'light' : 'heavy'));
    });
    DERO.onView(scales, {
      threshold: 0.35, flag: false,
      enter: () => scales.classList.add('is-on'),
      leave: () => scales.classList.remove('is-on'),
    });
  }

  /* ---------- 사례 A: 후보 목록과 승인 ---------- */
  const gate = $('[data-gate]');
  if (gate) {
    const cand = $('[data-cand]', gate), liveList = $('[data-live]', gate);
    const now = $('[data-gate-now]', gate), addBtn = $('[data-add]', gate);
    const first = { cand: cand.innerHTML, live: liveList.innerHTML, now: now.textContent };
    const NAMES = ['D', 'E', 'F', 'G'];
    let made = 0;

    const items = () => $$('li', gate);
    /* 자리 바꿈을 transform 으로만 잇는다 */
    const flip = (change) => {
      const before = new Map(items().map((li) => [li, li.getBoundingClientRect()]));
      change();
      if (reduced()) return;
      items().forEach((li) => {
        const a = before.get(li);
        if (!a) return;
        const b = li.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) return;
        li.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2, .7, .2, 1)' });
      });
    };
    const arm = (li) => {
      if (li.querySelector('.s4-ok')) return;
      const b = D.createElement('button');
      b.type = 'button'; b.className = 's4-ok'; b.textContent = '승인';
      b.setAttribute('aria-label', `규칙 ${li.dataset.rule} 승인`);
      li.appendChild(b);
    };
    const sync = () => {
      const waiting = cand.children.length;
      addBtn.disabled = made >= NAMES.length || waiting >= 4;
      let none = $('.s4-col__none', gate);
      if (!waiting && !none) {
        none = D.createElement('p'); none.className = 's4-col__none'; none.textContent = '기다리는 후보가 없다.';
        cand.after(none);
      } else if (waiting && none) none.remove();
    };
    const approve = (li) => {
      const name = li.dataset.rule;
      flip(() => {
        li.querySelector('.s4-ok').remove();
        li.dataset.who = 'human';
        li.classList.remove('is-drop');
        const tag = D.createElement('em'); tag.textContent = '승인됨';
        li.appendChild(tag);
        liveList.appendChild(li);
      });
      now.textContent = `사람이 규칙 ${name}를 승인했다. 이제 에이전트가 매번 읽는다. 승인하지 않은 후보는 읽히지 않는다.`;
      sync();
      (addBtn.disabled ? $('[data-gate-reset]', gate) : addBtn).focus({ preventScroll: true });
    };
    const add = () => {
      if (made >= NAMES.length) return;
      const name = NAMES[made++];
      const li = D.createElement('li');
      li.dataset.rule = name; li.className = 'is-drop';
      const s = D.createElement('span'); s.textContent = `규칙 ${name}`;
      li.appendChild(s); arm(li);
      flip(() => cand.appendChild(li));
      now.textContent = `규칙 ${name}가 후보 목록에 들어갔다. 에이전트는 아직 읽지 않는다.`;
      sync();
    };
    const reset = () => {
      cand.innerHTML = first.cand; liveList.innerHTML = first.live; now.textContent = first.now;
      made = 0;
      $$('li', cand).forEach(arm);
      sync();
    };
    gate.addEventListener('click', (ev) => {
      const ok = ev.target.closest('.s4-ok');
      if (ok) approve(ok.closest('li'));
    });
    addBtn.addEventListener('click', add);
    $('[data-gate-reset]', gate).addEventListener('click', reset);
    $$('li', cand).forEach(arm);
    sync();
    DERO.onView(gate, { threshold: 0.2 });   /* .is-view 가 읽는 선 애니메이션을 켜고 끈다 */
  }

  /* ---------- 사례 B: 네 가지 폭으로 확인 ---------- */
  const check = $('[data-check]');
  const svg = $('[data-vp]');
  if (!check || !svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, parent, text) => {
    const e = D.createElementNS(NS, tag);
    for (const k in at) e.setAttribute(k, at[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const WIDTHS = [390, 768, 1280, 1600];
  const narrow = matchMedia('(max-width: 760px)');
  /* 도식이라 틀 폭은 실제 비율보다 덜 벌어지게 잡았다 */
  const geo = () => (narrow.matches
    ? { VW: 360, VH: 300, top: 54, H: 232, map: [104, 176, 288, 344] }
    : { VW: 760, VH: 300, top: 54, H: 232, map: [170, 330, 540, 700] });

  const defs = el('defs', {}, svg);
  const grad = el('linearGradient', { id: 's4-scan-g', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#5fe0ff', 'stop-opacity': 0 }, grad);
  el('stop', { offset: 1, 'stop-color': '#5fe0ff', 'stop-opacity': 0.3 }, grad);
  const label = el('text', { class: 's4-w', 'text-anchor': 'middle', y: 30 }, svg);
  const labelN = el('tspan', { class: 's4-w__n' }, label, '1280');
  el('tspan', { class: 's4-w__u', dx: 5 }, label, 'px');
  const dim = el('rect', { class: 's4-w__line', width: 1, height: 1 }, svg);
  const frame = el('rect', { class: 's4-fr', width: 1, height: 1 }, svg);
  const KINDS = ['nav', 'hero', 'card', 'card', 'card', 'side'];
  const blocks = KINDS.map((k) => el('rect', { class: `s4-blk s4-blk--${k}`, width: 1, height: 1 }, svg));
  const scan = el('g', { class: 's4-sc' }, svg);
  el('rect', { class: 's4-sc__band', width: 1, height: 30 }, scan);
  el('rect', { class: 's4-sc__line', y: 30, width: 1, height: 1.5 }, scan);

  const put = (node, x, y, w, h) => { node.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})`; };
  /* 폭마다 다른 배치. 틀 왼쪽 위를 0,0 으로 본 [x, y, w, h] 여섯 개(nav, hero, 카드 셋, 옆 칸) */
  const layout = (k, W, H) => {
    const p = W < 130 ? 6 : 9, g = W < 130 ? 5 : 7, nh = 9;
    const bx = p, by = p + nh + g, bw = W - p * 2, bh = H - by - p;
    const nav = [p, p, bw, nh];
    if (k === 0) {
      const hh = bh * 0.3, rh = (bh - hh - g * 4) / 4;
      const row = (n) => [bx, by + hh + g + n * (rh + g), bw, rh];
      return [nav, [bx, by, bw, hh], row(0), row(1), row(2), row(3)];
    }
    if (k === 1) {
      const hh = bh * 0.38, rh = (bh - hh - g * 2) / 2, half = (bw - g) / 2;
      const y1 = by + hh + g, y2 = y1 + rh + g, x2 = bx + half + g;
      return [nav, [bx, by, bw, hh], [bx, y1, half, rh], [x2, y1, half, rh], [bx, y2, half, rh], [x2, y2, half, rh]];
    }
    const sw = k === 2 ? (bw - g) * 0.32 : bw * 0.17;
    const mx = k === 2 ? bx : bx + sw + g, mw = bw - sw - g;
    const hh = bh * 0.54, ch = bh - hh - g;
    const cw = ((k === 2 ? bw : mw) - g * 2) / 3, cx = k === 2 ? bx : mx;
    const card = (n) => [cx + n * (cw + g), by + hh + g, cw, ch];
    const side = k === 2 ? [bx + mw + g, by, sw, hh] : [bx, by, sw, bh];
    return [nav, [mx, by, mw, hh], card(0), card(1), card(2), side];
  };

  const board = $('[data-board]', check);
  const cells = $$('tbody td', board);
  const wBtns = $$('thead button', board);
  const playBtn = $('[data-play]', check), playLab = $('[data-play-label]', check);
  const nowEl = $('[data-now]', check), phaseEl = $('[data-phase]', check), stamp = $('[data-stamp]', check);
  const LAST = WIDTHS.length * 2;
  let G = geo(), shown = 2, step = 0, token = 0, playing = false, held = false, touched = false;

  const show = (k) => {
    shown = k;
    const W = G.map[k], x0 = (G.VW - W) / 2;
    svg.setAttribute('viewBox', `0 0 ${G.VW} ${G.VH}`);
    label.setAttribute('x', G.VW / 2);
    labelN.textContent = WIDTHS[k];
    put(dim, x0, 40, W, 1);
    put(frame, x0, G.top, W, G.H);
    layout(k, W, G.H).forEach(([x, y, w, h], n) => put(blocks[n], x0 + x, G.top + y, w, h));
    wBtns.forEach((b, n) => b.setAttribute('aria-pressed', String(n === k)));
  };
  const say = (phase, text) => { phaseEl.textContent = phase; nowEl.textContent = text; };
  const mark = (ok) => { svg.classList.toggle('is-ok', ok); stamp.classList.toggle('on', ok); };
  const again = (node, cls) => { node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); };
  const paint = () => {
    cells.forEach((c, n) => { c.dataset.on = n < step ? '1' : '0'; c.classList.toggle('is-now', playing && n === step); });
    playBtn.classList.toggle('is-playing', playing);
    playLab.textContent = playing ? '멈춤' : step >= LAST ? '다시 돌리기' : step ? '이어서' : '돌리기';
  };
  const sweep = (k, ms) => {
    const W = G.map[k], x0 = (G.VW - W) / 2;
    const at = (y) => `translate(${x0}px, ${y}px) scale(${W}, 1)`;
    scan.animate([
      { transform: at(G.top - 30), opacity: 0 },
      { transform: at(G.top), opacity: 1, offset: 0.14 },
      { transform: at(G.top + G.H - 31), opacity: 1, offset: 0.92 },
      { transform: at(G.top + G.H - 31), opacity: 0 },
    ], { duration: ms, easing: 'linear' });
  };
  const wait = (ms, t) => new Promise((done) => setTimeout(() => done(t === token), ms));
  const finish = () => {
    step = LAST; playing = false; mark(true); paint();
    say('화면 검증자', '네 가지 폭에서 홈 여정을 2회 돌려 모두 PASS했다.');
  };
  const play = async () => {
    const t = ++token;
    if (step >= LAST) step = 0;
    playing = true; held = false;
    for (; step < LAST;) {
      const r = step >> 2, k = step & 3, w = WIDTHS[k];
      mark(false); paint(); show(k);
      say(`${r + 1}회차 · 폭 ${w}`, `화면을 폭 ${w}으로 연다. 배치가 바뀐다.`);
      if (!(await wait(620, t))) return;
      say(`${r + 1}회차 · 폭 ${w}`, '위에서 아래로 훑어 의도대로 보이는지 확인한다.');
      sweep(k, 760);
      if (!(await wait(780, t))) return;
      step += 1; mark(true); paint();
      again(cells[step - 1], 'pop'); again(stamp, 'pop');
      say(`${r + 1}회차 · 폭 ${w}`, `폭 ${w} PASS.`);
      if (!(await wait(step === 4 ? 900 : 480, t))) return;
    }
    finish();
  };
  const stop = () => { token += 1; playing = false; held = false; scan.getAnimations().forEach((a) => a.cancel()); paint(); };

  playBtn.addEventListener('click', () => {
    touched = true;
    if (playing) { stop(); say('멈춤', '멈췄다. 이어서 돌릴 수 있다.'); return; }
    if (reduced()) { finish(); return; }
    play();
  });
  wBtns.forEach((b) => b.addEventListener('click', () => {
    touched = true;
    const k = +b.dataset.w;
    if (playing) stop();
    mark(false); show(k);
    say('배치 보기', `폭 ${WIDTHS[k]}의 배치다.`);
  }));
  narrow.addEventListener('change', () => { G = geo(); show(shown); });

  /* 처음 상태. 모션 줄이기면 끝난 모습을 바로 그린다 */
  show(2);
  if (reduced()) finish();
  else { step = 0; paint(); say('대기', '돌리기를 누르면 화면 검증자가 폭 네 가지를 차례로 확인한다.'); }

  DERO.onView($('.s4-vp', check), {
    threshold: 0.45,
    enter: () => {
      if (held) { play(); return; }
      if (!touched && !playing && step === 0 && !reduced()) play();
    },
    leave: () => { if (playing) { stop(); held = true; } },
  });
})();
