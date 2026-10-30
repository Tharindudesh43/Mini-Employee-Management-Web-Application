const SHOW_AFTER_PX = 300;

const button = document.getElementById('back-to-top');
let frameRequested = false;

function update() {
  frameRequested = false;
  button.classList.toggle('is-visible', window.scrollY > SHOW_AFTER_PX);
}

function scheduleUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(update);
}

export function initBackToTop() {
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('main').focus({ preventScroll: true });
  });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  update();
}
