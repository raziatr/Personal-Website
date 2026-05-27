function updateProgress() {
  const doc = document.documentElement;
  const scrolled = doc.scrollTop || document.body.scrollTop;
  const total = doc.scrollHeight - doc.clientHeight;
  const pct = total > 0 ? (scrolled / total) * 100 : 0;
  document.getElementById('progress').style.width = pct + '%';
}

/* ─────────────────────────────────────────
   2. NAVBAR: scroll class + logo color
───────────────────────────────────────── */
const nav = document.getElementById('nav');
function updateNav() {
  const y = window.scrollY;
  if (y > 20) {
    nav.classList.add('scrolled');
    nav.classList.remove('top');
  } else {
    nav.classList.remove('scrolled');
    nav.classList.add('top');
  }
}

/* ─────────────────────────────────────────
   3. BACK TO TOP
───────────────────────────────────────── */
const btt = document.getElementById('btt');
function updateBtt() {
  btt.classList.toggle('show', window.scrollY > 500);
}

/* ─────────────────────────────────────────
   4. SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

/* ─────────────────────────────────────────
   5. COUNTER ANIMATION (hero stats)
───────────────────────────────────────── */
function animateCount(el, target, prefix = '', suffix = '', duration = 1200) {
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4); // ease out quart
    const current = target * ease;
    el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
  };
  requestAnimationFrame(step);
}

// Observe the hero stats section
const heroStats = document.querySelector('.hero-stats');
const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('[data-count]').forEach(el => {
      const val = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      animateCount(el, val, prefix, suffix);
    });
    statsObserver.disconnect();
  }
}, { threshold: 0.5 });
if (heroStats) statsObserver.observe(heroStats);

/* ─────────────────────────────────────────
   6. TAB SYSTEM with animated indicator
───────────────────────────────────────── */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabIndicator = document.getElementById('tabIndicator');
const tabPanelsEl = document.getElementById('tabPanels');
let activePanel = document.querySelector('.tab-panel.active');

function moveIndicator(btn) {
  if (!tabIndicator) return;
  tabIndicator.style.left = btn.offsetLeft + 'px';
  tabIndicator.style.width = btn.offsetWidth + 'px';
}

// Init indicator position
if (tabBtns[0]) {
  requestAnimationFrame(() => moveIndicator(tabBtns[0]));
  window.addEventListener('resize', () => {
    const active = document.querySelector('.tab-btn.active');
    if (active) moveIndicator(active);
  });
}

// Set panels container height dynamically
function setPanelHeight() {
  const active = document.querySelector('.tab-panel.active');
  if (active && tabPanelsEl) tabPanelsEl.style.height = active.offsetHeight + 'px';
}
window.addEventListener('resize', setPanelHeight);
setTimeout(setPanelHeight, 100);

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = 'tab-' + btn.dataset.tab;
    const targetPanel = document.getElementById(targetId);
    if (!targetPanel || targetPanel.classList.contains('active')) return;

    // Update buttons
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moveIndicator(btn);

    // Animate out
    if (activePanel) {
      activePanel.classList.add('exit');
      activePanel.classList.remove('active');
      
      /* --- PERBAIKAN BUG KOSONG DI SINI --- */
      /* Menghapus paksa style posisi agar tab lama tidak menumpuk ke bawah */
      activePanel.style.position = ''; 
      
      setTimeout(() => activePanel.classList.remove('exit'), 400);
    }

    // Animate in
    targetPanel.style.transform = 'translateX(20px)';
    targetPanel.style.opacity = '0';
    targetPanel.style.position = 'relative';
    targetPanel.classList.add('active');
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetPanel.style.transform = '';
        targetPanel.style.opacity = '';
      });
    });
    
    activePanel = targetPanel;
    setTimeout(setPanelHeight, 50);
  });
});
/* ─────────────────────────────────────────
   7. ADVISOR CAROUSEL (drag + buttons)
───────────────────────────────────────── */
const carousel = document.getElementById('carousel');
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('carPrev');
const nextBtn = document.getElementById('carNext');

let carX = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartCarX = 0;
const TILE_W = 320 + 20; // tile width + gap

function getMaxX() {
  return -(track.scrollWidth - carousel.offsetWidth - 24);
}

function setCarX(x, animate = true) {
  const max = getMaxX();
  carX = Math.max(Math.min(x, 0), max);
  track.style.transition = animate ? 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' : 'none';
  track.style.transform = `translateX(${carX}px)`;
  updateCarBtns();
}

function updateCarBtns() {
  const max = getMaxX();
  prevBtn.disabled = carX >= 0;
  nextBtn.disabled = carX <= max;
}

prevBtn.addEventListener('click', () => setCarX(carX + TILE_W));
nextBtn.addEventListener('click', () => setCarX(carX - TILE_W));

// Mouse drag
carousel.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartCarX = carX;
  carousel.classList.add('dragging');
  track.style.transition = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const diff = e.clientX - dragStartX;
  setCarX(dragStartCarX + diff, false);
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  carousel.classList.remove('dragging');
  // Snap to nearest tile
  const snapped = Math.round(carX / TILE_W) * TILE_W;
  setCarX(snapped, true);
});

// Touch drag
carousel.addEventListener('touchstart', e => {
  dragStartX = e.touches[0].clientX;
  dragStartCarX = carX;
  track.style.transition = 'none';
}, { passive: true });

carousel.addEventListener('touchmove', e => {
  const diff = e.touches[0].clientX - dragStartX;
  setCarX(dragStartCarX + diff, false);
}, { passive: true });

carousel.addEventListener('touchend', () => {
  const snapped = Math.round(carX / TILE_W) * TILE_W;
  setCarX(snapped, true);
});

window.addEventListener('resize', () => updateCarBtns());
updateCarBtns();

/* ─────────────────────────────────────────
   8. RIPPLE EFFECT on buttons
───────────────────────────────────────── */
function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Attach ripple to all .btn elements
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', addRipple);
});

/* ─────────────────────────────────────────
   9. MOBILE MENU
───────────────────────────────────────── */
const ham = document.getElementById('ham');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

ham.addEventListener('click', () => {
  menuOpen = !menuOpen;
  ham.classList.toggle('open', menuOpen);
  mobileMenu.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});

// Close on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    ham.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─────────────────────────────────────────
   10. MODAL SYSTEM
───────────────────────────────────────── */
function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(e, id) {
  if (e.target === e.currentTarget) closeModalById(id);
}
function closeModalById(id) {
  document.getElementById(id).classList.remove('open');
  // Only restore scroll if no other modal is open
  if (!document.querySelector('.overlay.open')) {
    document.body.style.overflow = '';
  }
}

// ESC key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

/* ─────────────────────────────────────────
   11. PARALLAX on hero visual
───────────────────────────────────────── */
const heroImgBox = document.querySelector('.hero-img-box');
function parallaxHero() {
  if (!heroImgBox) return;
  const scrollY = window.scrollY;
  heroImgBox.style.transform = `translateY(${scrollY * 0.12}px)`;
}

/* ─────────────────────────────────────────
   12. SMOOTH SCROLL for anchor links
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─────────────────────────────────────────
   13. BULL + FLATIRON SVG animate on scroll
───────────────────────────────────────── */
const bullSvg = document.getElementById('bullSvg');
const flatSvg = document.getElementById('flatSvg');

const svgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.3 });

if (bullSvg) svgObserver.observe(bullSvg);
if (flatSvg) svgObserver.observe(flatSvg);

/* ─────────────────────────────────────────
   14. HOVER TILT on story & blog cards
───────────────────────────────────────── */
function tiltEffect(cards) {
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.25s, box-shadow 0.25s';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear, border-color 0.25s, box-shadow 0.25s';
    });
  });
}

tiltEffect(document.querySelectorAll('.story-card'));
tiltEffect(document.querySelectorAll('.blog-card'));

/* ─────────────────────────────────────────
   15. MAGNETIC BUTTONS (subtle)
───────────────────────────────────────── */
document.querySelectorAll('.btn-dark-lg, .btn-outline-lg, .btn-white-lg').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    btn.style.transform = `translate(${x}px, ${y}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.18s, color 0.18s, box-shadow 0.18s';
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'transform 0.1s linear, background 0.18s, color 0.18s, box-shadow 0.18s';
  });
});

/* ─────────────────────────────────────────
   16. MAIN SCROLL HANDLER
───────────────────────────────────────── */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateProgress();
      updateNav();
      updateBtt();
      parallaxHero();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ─────────────────────────────────────────
   17. INIT
───────────────────────────────────────── */
updateNav();
updateProgress();
updateBtt();

/* ─────────────────────────────────────────
   17. INIT
───────────────────────────────────────── */
updateNav();
updateProgress();
updateBtt();

// Script khusus untuk Tab Experiences
document.addEventListener('DOMContentLoaded', () => {
  const expBtns = document.querySelectorAll('.exp-btn');
  const expIndicator = document.getElementById('expTabIndicator');
  const expPanelsContainer = document.getElementById('expPanelsContainer');
  let activeExpPanel = document.querySelector('.exp-panel.active');

  function moveExpIndicator(btn) {
    if (!expIndicator) return;
    expIndicator.style.left = btn.offsetLeft + 'px';
    expIndicator.style.width = btn.offsetWidth + 'px';
  }

  if (expBtns[0]) {
    setTimeout(() => moveExpIndicator(expBtns[0]), 100);
    window.addEventListener('resize', () => {
      const active = document.querySelector('.exp-btn.active');
      if (active) moveExpIndicator(active);
    });
  }

  function setExpHeight() {
    const active = document.querySelector('.exp-panel.active');
    if (active && expPanelsContainer) {
      expPanelsContainer.style.height = active.offsetHeight + 'px';
    }
  }
  window.addEventListener('resize', setExpHeight);
  setTimeout(setExpHeight, 200);

  expBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = 'exp-' + btn.dataset.tab;
      const targetPanel = document.getElementById(targetId);
      if (!targetPanel || targetPanel.classList.contains('active')) return;

      expBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      moveExpIndicator(btn);

      if (activeExpPanel) {
        activeExpPanel.classList.add('exit');
        activeExpPanel.classList.remove('active');
        activeExpPanel.style.position = ''; // Reset CSS
        setTimeout(() => activeExpPanel.classList.remove('exit'), 400);
      }

      targetPanel.style.transform = 'translateX(20px)';
      targetPanel.style.opacity = '0';
      targetPanel.style.position = 'relative';
      targetPanel.classList.add('active');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targetPanel.style.transform = '';
          targetPanel.style.opacity = '';
        });
      });
      
      activeExpPanel = targetPanel;
      setTimeout(setExpHeight, 50);
    });
  });
});