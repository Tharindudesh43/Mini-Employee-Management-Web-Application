const NAV_OFFSET_PX = 120;

const navbar = document.querySelector('.navbar');
const links = [...document.querySelectorAll('.navbar__links a[data-section]')];
const sections = links.map((link) => document.getElementById(link.dataset.section));

let frameRequested = false;

function getCurrentSectionId() {
  const reachedBottom =
    window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (reachedBottom) return sections[sections.length - 1].id;

  let current = sections[0].id;
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= NAV_OFFSET_PX) current = section.id;
  });
  return current;
}

function update() {
  frameRequested = false;
  navbar.classList.toggle('is-scrolled', window.scrollY > 4);

  const currentId = getCurrentSectionId();
  links.forEach((link) => {
    if (link.dataset.section === currentId) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function scheduleUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(update);
}

export function initNavigation() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  new ResizeObserver(scheduleUpdate).observe(document.body);
  update();
}
