(function () {
  const { span, ease } = Scene;
  const scale = document.querySelector('[data-scale]');
  const beam = scale.querySelector('[data-beam]');
  const lines = scale.querySelectorAll('[data-lines]');
  const tokens = scale.querySelectorAll('[data-tok]');

  // 줄 수로는 99줄 쪽이 조금, 토큰으로는 69줄 쪽이 크게 내려간다.
  const TILT_LINES = 3;
  const TILT_TOKENS = -9;
  const SWING = [0.2, 0.8];
  const UNIT = [0.44, 0.56];

  function render(p) {
    const t = ease(span(p, SWING[0], SWING[1]));
    beam.style.transform = `rotate(${TILT_LINES + (TILT_TOKENS - TILT_LINES) * t}deg)`;

    const u = span(p, UNIT[0], UNIT[1]);
    lines.forEach((el) => { el.style.opacity = 1 - u; });
    tokens.forEach((el) => { el.style.opacity = u; });
  }

  Scene.run({ render });
})();
