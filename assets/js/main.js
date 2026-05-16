document.addEventListener('DOMContentLoaded', () => {

  /* ======= THEME ======= */
  const html      = document.documentElement;
  const themeBtn  = document.getElementById('theme-btn');
  const saved     = localStorage.getItem('otd_theme') ||
                    (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀' : '☾';
    localStorage.setItem('otd_theme', t);
  }

  setTheme(saved);
  themeBtn?.addEventListener('click', () =>
    setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  /* ======= CURSOR ======= */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');

  if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function animCursor() {
      if (dot) {
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
      }
      // Lag ring
      rx += (mx - rx) * .14;
      ry += (my - ry) * .14;
      if (ring) {
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
      }
      requestAnimationFrame(animCursor);
    }
    animCursor();

    // Hover expand
    document.querySelectorAll('a, button, .proj-card, .hl-card, .sk-pill').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (ring) { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.opacity = '.4'; }
      });
      el.addEventListener('mouseleave', () => {
        if (ring) { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '.6'; }
      });
    });
  }

  /* ======= NAVBAR ======= */
  const header = document.getElementById('site-header');
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', scrollY > 40);
    // Active nav
    const sections = document.querySelectorAll('section[id], div[id="top"]');
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 120) current = s.id;
    });
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.mob-link').forEach(a => {
    a.addEventListener('click', () => {
      burger?.classList.remove('open');
      mobileNav?.classList.remove('open');
    });
  });

  /* ======= TYPEWRITER ======= */
  const twEl = document.getElementById('typewriter');
  if (twEl) {
    const sets = {
      en: ['scalable Flutter apps', 'data-driven solutions', 'AI-powered systems', 'beautiful mobile UIs', 'intelligent automations'],
      ar: ['تطبيقات فلاتر قابلة للتوسع', 'حلولاً مدفوعة بالبيانات', 'أنظمة مدعومة بالذكاء الاصطناعي', 'واجهات موبايل جميلة', 'أتمتة ذكية']
    };
    let pi = 0, ci = 0, deleting = false;

    function type() {
      const lang    = localStorage.getItem('otd_lang') || 'en';
      const phrases = sets[lang] || sets.en;
      const cur     = phrases[pi % phrases.length];

      twEl.textContent = deleting
        ? cur.substring(0, --ci)
        : cur.substring(0, ++ci);

      let speed = deleting ? 50 : 90;
      if (!deleting && ci === cur.length) { speed = 1800; deleting = true; }
      else if (deleting && ci === 0)      { deleting = false; pi++; speed = 350; }

      setTimeout(type, speed);
    }
    type();
  }

  /* ======= COUNTER ANIMATION ======= */
  function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('.stat-n[data-count]');
  if (counters.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target, +e.target.dataset.count);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .5 });
    counters.forEach(c => obs.observe(c));
  }

  /* ======= SKILL BARS ======= */
  const fills = document.querySelectorAll('.sbar-fill');
  if (fills.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.width = e.target.dataset.pct + '%';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .3 });
    fills.forEach(f => obs.observe(f));
  }

  /* ======= PROJECT FILTER ======= */
  document.querySelectorAll('.fchip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.f;
      document.querySelectorAll('.proj-card').forEach(card => {
        const cats = card.dataset.cat || '';
        const show = f === 'all' || cats.includes(f);
        card.style.display    = show ? '' : 'none';
        card.style.opacity    = show ? '1' : '0';
      });
    });
  });

  /* ======= GSAP SCROLL ANIMATIONS ======= */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    gsap.timeline({ delay: .1 })
      .from('#hero-chip', { opacity: 0, y: 20, duration: .6, ease: 'power3.out' })
      .from('.hero-line', { opacity: 0, y: 50, stagger: .12, duration: .7, ease: 'power3.out' }, '-=.2')
      .from('.hero-typewriter', { opacity: 0, y: 20, duration: .5, ease: 'power3.out' }, '-=.2')
      .from('.hero-desc', { opacity: 0, y: 20, duration: .5, ease: 'power3.out' }, '-=.2')
      .from('.hero-btns > *', { opacity: 0, y: 16, stagger: .1, duration: .4, ease: 'power3.out' }, '-=.2')
      .from('.hero-socials > *', { opacity: 0, y: 12, stagger: .06, duration: .4, ease: 'power3.out' }, '-=.2')
      .from('#profile-card', { opacity: 0, x: 60, duration: .8, ease: 'power3.out' }, '-=.8')
      .from('.float-tag', { opacity: 0, scale: .8, stagger: .15, duration: .5, ease: 'back.out(1.7)' }, '-=.4')
      .from('.scroll-hint', { opacity: 0, y: 10, duration: .5, ease: 'power2.out' }, '-=.2');

    // Scroll-triggered sections
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 44 },
        {
          opacity: 1, y: 0, duration: .75, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    document.querySelectorAll('[data-gsap="fade-right"]').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -44 },
        {
          opacity: 1, x: 0, duration: .8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    document.querySelectorAll('[data-gsap="fade-left"]').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: 44 },
        {
          opacity: 1, x: 0, duration: .8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // Project cards stagger
    gsap.fromTo('.proj-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, stagger: .1, duration: .65, ease: 'power3.out',
        scrollTrigger: { trigger: '#proj-grid', start: 'top 85%', once: true }
      });

    // Skills cloud stagger
    gsap.fromTo('.sk-pill',
      { opacity: 0, scale: .85 },
      {
        opacity: 1, scale: 1, stagger: .03, duration: .4, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.skills-cloud', start: 'top 88%', once: true }
      });

    // Highlight cards stagger
    gsap.fromTo('.hl-card',
      { opacity: 0, x: 30 },
      {
        opacity: 1, x: 0, stagger: .12, duration: .6, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-highlights', start: 'top 85%', once: true }
      });

    // Profile card floating
    gsap.to('#profile-card', {
      y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1
    });

  } else {
    // Fallback: just show everything if GSAP fails to load
    document.querySelectorAll('[data-gsap]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ======= SMOOTH SCROLL (mobile) ======= */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
