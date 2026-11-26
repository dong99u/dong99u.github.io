(function () {
  const { span, ease } = Scene;
  const gate = document.querySelector('[data-gate]');
  const pick = (name) => gate.querySelector(`[data-${name}]`);
  const el = { seen: pick('seen'), verdict: pick('verdict'), sign: pick('sign'), latest: pick('latest'), bow: pick('bow'), lock: pick('lock'), cap: pick('cap') };

  // PR #85 의 실제 순서. at = 그 단계가 시작되는 스크롤 위치, enter = 그 단계에서 새로 들어오는 것.
  const steps = [
    { at: 0, seen: '—', verdict: '', sign: '≠', latest: 'e34aced1', lock: '', cap: '커밋 e34aced1로 PR이 열린다', enter: [] },
    { at: 0.22, seen: 'e34aced1', verdict: 'ISSUES', sign: '=', latest: 'e34aced1', lock: '잠김', cap: 'diff 검증자가 문제를 짚는다', enter: ['seen', 'verdict'] },
    { at: 0.48, seen: 'e34aced1', verdict: 'ISSUES', sign: '≠', latest: '69627aca', lock: '잠김', cap: '고친 커밋 69627aca가 올라온다', enter: ['latest'] },
    { at: 0.74, seen: '69627aca', verdict: 'PASS', sign: '=', latest: '69627aca', lock: '머지', cap: '69627aca를 다시 검증해 PASS, 머지', enter: ['seen', 'verdict'] },
  ];
  const ENTER = 0.07;
  const moving = ['seen', 'verdict', 'latest'];
  let shown = -1;

  function render(p) {
    let i = steps.length - 1;
    while (i > 0 && p < steps[i].at) i--;
    const step = steps[i];

    if (i !== shown) {
      shown = i;
      gate.dataset.step = i;
      el.seen.textContent = step.seen;
      el.verdict.textContent = step.verdict;
      el.sign.textContent = step.sign;
      el.latest.textContent = step.latest;
      el.lock.textContent = step.lock;
      el.cap.innerHTML = `<b>${i + 1}/${steps.length}</b>${step.cap}`;
    }

    const t = i === 0 ? 1 : ease(span(p, step.at, step.at + ENTER));
    for (const name of moving) {
      const on = step.enter.includes(name) ? t : 1;
      el[name].style.opacity = on;
      el[name].style.transform = `translateY(${(1 - on) * 14}px)`;
    }
    const open = i === steps.length - 1 ? t : 0;
    el.bow.style.transform = `translateY(${-3 * open}px) rotate(${30 * open}deg)`;
  }

  Scene.run({ render });
})();
