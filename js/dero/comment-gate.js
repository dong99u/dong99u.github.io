(function () {
  const { span, ease } = Scene;
  const ed = document.querySelector('[data-ed]');
  const pick = (name) => ed.querySelector(`[data-${name}]`);
  const el = { before: pick('before'), after: pick('after'), line: pick('new'), typed: pick('typed'), caret: pick('caret'), blocked: pick('blocked'), passed: pick('passed') };
  const comment = Array.from(el.typed.textContent);

  const TYPE = [0.05, 0.36];
  const BLOCK = 0.42;
  const SWAP = [0.7, 0.8];
  const SHAKE_PX = 7;
  let typedCount = -1;

  function render(p) {
    const count = Math.round(span(p, TYPE[0], TYPE[1]) * comment.length);
    if (count !== typedCount) {
      typedCount = count;
      el.typed.textContent = comment.slice(0, count).join('');
    }

    const blocked = p >= BLOCK;
    el.line.classList.toggle('is-blocked', blocked);
    el.line.style.setProperty('--red', 0.14 * span(p, BLOCK, BLOCK + 0.03));
    const shake = span(p, BLOCK, BLOCK + 0.08);
    el.line.style.transform = `translateX(${Math.sin(shake * Math.PI * 4) * (1 - shake) * SHAKE_PX}px)`;
    el.caret.style.opacity = blocked ? 0 : 1;

    const swap = ease(span(p, SWAP[0], SWAP[1]));
    el.before.style.opacity = 1 - swap;
    el.after.style.opacity = swap;
    el.blocked.style.opacity = span(p, BLOCK + 0.01, BLOCK + 0.05) * (1 - 0.55 * swap);
    el.passed.style.opacity = span(p, SWAP[1] - 0.02, SWAP[1] + 0.03);
  }

  Scene.run({ render });
})();
