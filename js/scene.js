/* 글 페이지의 장면 하나를 스크롤 위치에 묶는다.
   글마다 Scene.run({ measure, render }) 를 한 번 부른다. render(p) 는 p(0~1)만 보고 화면을 정하므로
   같은 스크롤 위치는 언제나 같은 화면이고, 거꾸로 올려도 그대로 되돌아간다.
   모션 줄이기이거나 GSAP 을 못 받으면 아무것도 하지 않는다. 그때는 CSS 의 끝 상태가 그대로 보인다. */
(function () {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const span = (p, from, to) => clamp((p - from) / (to - from));
  const ease = (t) => t * t * (3 - 2 * t);

  function run({ measure, render }) {
    const scene = document.querySelector('[data-scene]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!scene || reduced || !window.gsap || !window.ScrollTrigger) return;

    document.documentElement.classList.add('is-scrub');
    const hint = scene.querySelector('[data-hint]');
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const draw = (p) => {
      render(p);
      if (hint) hint.style.opacity = 1 - span(p, 0, 0.04);
    };
    const trigger = ScrollTrigger.create({
      trigger: scene,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onRefresh: (self) => { if (measure) measure(); draw(self.progress); },
      onUpdate: (self) => draw(self.progress),
    });
    if (measure) measure();
    draw(trigger.progress);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  window.Scene = { run, clamp, span, ease };
})();
