/* ============================================================
   STICK'N'BITE — Shared JavaScript
   ============================================================ */

/* --- Sticky nav scroll effect --- */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Mobile hamburger menu --- */
const hamburger   = document.querySelector('.hamburger');
const mobileNav   = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  // Close when a link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

/* --- Mark active nav link --- */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* --- Pre-select package from URL (?package=Basic|Classic|Premium) --- */
const packageSelect = document.getElementById('package');
if (packageSelect) {
  const wanted = new URLSearchParams(window.location.search).get('package');
  if (wanted) {
    const match = Array.from(packageSelect.options).find(opt =>
      opt.text.toLowerCase().startsWith(wanted.toLowerCase())
    );
    if (match) match.selected = true;
  }
}

/* --- Quote form submission (Make.com webhook) --- */
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = quoteForm.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const form = Object.fromEntries(new FormData(quoteForm));
    const params = new URLSearchParams(window.location.search);
    const data = {
      ...form,
      name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
      guests: form.guestCount || '',
      barCatering: form.barInterest ? 'Yes, please' : 'No',
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || ''
    };

    try {
      await fetch('https://hook.us2.make.com/qckfhoei6utvr1ps1pp7fv7qhw95bb6v', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      quoteForm.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    } catch {
      btn.textContent = 'Request Your Quote →';
      btn.disabled = false;
      alert('Something went wrong. Please email us at contact@sticknbite.com');
    }
  });
}

/* --- Gallery: category filter + lightbox --- */
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  const items    = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
  const emptyMsg = document.getElementById('galleryEmpty');
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbCap    = document.getElementById('lbCaption');
  const lbCount  = document.getElementById('lbCount');
  let shown = items.slice();
  let index = 0;
  let lastFocused = null;

  /* Filtering */
  document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      document.querySelectorAll('.gallery-filter').forEach(b => b.classList.toggle('active', b === btn));
      items.forEach(el => {
        el.classList.toggle('is-hidden', cat !== 'all' && el.dataset.category !== cat);
      });
      shown = items.filter(el => !el.classList.contains('is-hidden'));
      emptyMsg.hidden = shown.length > 0;
    });
  });

  /* Lightbox */
  const render = () => {
    const el = shown[index];
    lbImg.src = el.dataset.full;
    lbImg.alt = el.querySelector('img').alt;
    lbCap.textContent = el.dataset.caption || '';
    lbCount.textContent = (index + 1) + ' / ' + shown.length;
  };
  const open = (el) => {
    index = shown.indexOf(el);
    if (index < 0) return;
    lastFocused = document.activeElement;
    render();
    lb.classList.add('open');
    document.body.classList.add('lightbox-open');
    document.getElementById('lbClose').focus();
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    lbImg.src = '';
    if (lastFocused) lastFocused.focus();
  };
  const step = (n) => {
    index = (index + n + shown.length) % shown.length;
    render();
  };

  items.forEach(el => el.addEventListener('click', () => open(el)));
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => step(-1));
  document.getElementById('lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/* --- Smooth fade-in on scroll --- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.why-card, .menu-card, .testimonial-card, .event-card, .menu-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
