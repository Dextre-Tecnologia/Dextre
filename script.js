
(() => {
  'use strict';

   /* ----------------------------------------------------------
     1. NAVBAR — scroll-based background + active link highlight
     ---------------------------------------------------------- */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  function onScroll() {
    // Sticky background
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on visible section
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load


  /* ----------------------------------------------------------
     2. HAMBURGER MENU
     ---------------------------------------------------------- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinksMenu = document.getElementById('nav-links');
  const navOverlay   = document.getElementById('nav-overlay');

  function openMenu() {
    hamburgerBtn.classList.add('is-open');
    navLinksMenu.classList.add('is-open');
    navOverlay.classList.add('is-visible');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburgerBtn.classList.remove('is-open');
    navLinksMenu.classList.remove('is-open');
    navOverlay.classList.remove('is-visible');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }

  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', e => {
      e.preventDefault();
      const shouldOpen = !dropdown.classList.contains('is-open');

      dropdowns.forEach(other => {
        other.classList.remove('is-open');
        const otherToggle = other.querySelector('.dropdown-toggle');
        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
      });

      dropdown.classList.toggle('is-open', shouldOpen);
      toggle.setAttribute('aria-expanded', String(shouldOpen));
    });

    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 860) {
        dropdown.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 860) {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    menu.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', () => {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (navLinksMenu.classList.contains('is-open')) closeMenu();
      });
    });
  });

  document.addEventListener('click', e => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on overlay click
  navOverlay.addEventListener('click', closeMenu);

  // Close on nav link click (mobile)
  navLinksMenu.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinksMenu.classList.contains('is-open')) closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinksMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ----------------------------------------------------------
     3. SCROLL REVEAL — IntersectionObserver
     ---------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.card, .stat-card, .about-content, .hero-content, .hero-visual, .contact-form, .section-header'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     4. STAGGERED CARD ANIMATION
     ---------------------------------------------------------- */
  const cardObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.card, .stat-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('visible');
            }, index * 90);
          });
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  document.querySelectorAll('.cards-grid, .about-stats').forEach(grid => {
    cardObserver.observe(grid);
  });

  /* ----------------------------------------------------------
     5. CONTACT FORM — validation & feedback
     ---------------------------------------------------------- */
  const form          = document.getElementById('contact-form');
  const submitBtn     = document.getElementById('contact-submit-btn');
  const successMsg    = document.getElementById('form-success');

  const fields = {
    name:    { el: document.getElementById('input-name'),    err: document.getElementById('error-name') },
    email:   { el: document.getElementById('input-email'),   err: document.getElementById('error-email') },
    message: { el: document.getElementById('input-message'), err: document.getElementById('error-message') },
  };

  function validateField(name, el, errEl) {
    let error = '';

    if (name === 'name') {
      if (el.value.trim().length < 3) error = 'Por favor, insira seu nome completo.';
    }

    if (name === 'email') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(el.value.trim())) error = 'Insira um e-mail válido.';
    }

    if (name === 'message') {
      if (el.value.trim().length < 10) error = 'Mensagem muito curta (mínimo 10 caracteres).';
    }

    errEl.textContent = error;
    el.classList.toggle('is-invalid', !!error);
    return !error;
  }

  // Real-time validation on blur
  Object.entries(fields).forEach(([name, { el, err }]) => {
    if (!el || !err) return; // Skip if element doesn't exist
    el.addEventListener('blur', () => validateField(name, el, err));
    el.addEventListener('input', () => {
      if (el.classList.contains('is-invalid')) validateField(name, el, err);
    });
  });

  if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    Object.entries(fields).forEach(([name, { el, err }]) => {
      if (!validateField(name, el, err)) valid = false;
    });

    if (!valid) return;

    // Simulate sending (replace with real fetch/API call)
    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      Object.values(fields).forEach(({ el, err }) => {
        el.classList.remove('is-invalid');
        err.textContent = '';
      });
      successMsg.textContent = '✦ Mensagem enviada com sucesso! Entraremos em contato em breve.';
      submitBtn.textContent = 'Enviar mensagem';
      submitBtn.disabled = false;

      setTimeout(() => { successMsg.textContent = ''; }, 6000);
    }, 1400);
  });
  } // End of if (form)

  /* ----------------------------------------------------------
     6. FOOTER YEAR
     ---------------------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
