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
