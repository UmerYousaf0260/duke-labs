// ========================
// Custom Cursor
// ========================
const cursorDot = document.querySelector('.cursor-equi');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  }
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorDot) {
    cursorDot.style.left = ringX + 'px';
    cursorDot.style.top = ringY + 'px';
  }
  requestAnimationFrame(animateRing);
}
animateRing();

// ========================
// Theme Toggle (Light/Dark)
// ========================
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function updateThemeToggle() {
  if (!themeToggle) return;
  const isLight = getTheme() === 'light';
  themeToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  themeToggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
}

function setTheme(theme, { persist = true } = {}) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.themeTransition = 'true';
  document.documentElement.dataset.theme = next;

  if (persist) {
    try { localStorage.setItem('theme', next); } catch {}
  }

  updateThemeToggle();

  window.setTimeout(() => {
    delete document.documentElement.dataset.themeTransition;
  }, 300);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
  });
  updateThemeToggle();
}

if (themeMedia) {
  themeMedia.addEventListener('change', () => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch {}
    if (!saved) setTheme(themeMedia.matches ? 'light' : 'dark', { persist: false });
  });
}

// ========================
// Mobile Menu Toggle
// ========================
const mobileMenuToggle = document.querySelector('[data-mobile-menu]');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (mobileMenuToggle && mobileNav) {
  mobileMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = mobileMenuToggle.classList.contains('active');
    
    if (!isActive) {
      mobileMenuToggle.classList.add('active');
      mobileNav.classList.add('active');
      mobileNav.classList.add('dropdown-enter');
    } else {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.add('dropdown-exit');
      setTimeout(() => {
        mobileNav.classList.remove('active', 'dropdown-enter', 'dropdown-exit');
      }, 300);
    }
    
    mobileMenuToggle.setAttribute('aria-expanded', !isActive);
  });

  // Close menu when clicking on a link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.add('dropdown-exit');
      setTimeout(() => {
        mobileNav.classList.remove('active', 'dropdown-enter', 'dropdown-exit');
      }, 300);
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenuToggle.classList.contains('active')) {
      if (!e.target.closest('[data-mobile-menu]') && !e.target.closest('.mobile-nav')) {
        mobileMenuToggle.classList.remove('active');
        mobileNav.classList.add('dropdown-exit');
        setTimeout(() => {
          mobileNav.classList.remove('active', 'dropdown-enter', 'dropdown-exit');
        }, 300);
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// ========================
// Smooth Scroll
// ========================
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// ========================
// Scroll Reveal Observer
// ========================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
);

// ========================
// Load All Content from JSON
// ========================
async function loadPageContent() {
  try {
    const response = await fetch('./data/data.json');
    const data = await response.json();
    
    loadHeroSection(data.hero);
    loadAboutSection(data.about);
    loadServicesSection(data.services);
    loadWorkSection(data.work);
    loadContactSection(data.contact);
    loadFooter(data.footer);
    
  } catch (error) {
    console.error('Error loading page content:', error);
  }
}

// Load Hero Section
function loadHeroSection(heroData) {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.innerHTML = `${heroData.title}<br><span class="title-outline">${heroData.titleHighlight}</span>`;
  }

  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.textContent = heroData.subtitle;
  }

  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) {
    const badgeDot = heroBadge.querySelector('.badge-dot');
    if (badgeDot) {
      heroBadge.innerHTML = `<span class="badge-dot"></span>${heroData.badge}`;
    }
  }

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    heroStats.innerHTML = heroData.stats.map((stat, i) => {
      if (i > 0) return `<div class="stat-div"></div><div class="stat"><span class="stat-num" data-target="${stat.number}">0</span><span class="stat-label">${stat.label}</span></div>`;
      return `<div class="stat"><span class="stat-num" data-target="${stat.number}">0</span><span class="stat-label">${stat.label}</span></div>`;
    }).join('');
    
    // Animate counters when stats come into view
    const statsElements = heroStats.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    statsElements.forEach(el => observer.observe(el));
  }
}

// Counter animation function
function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const duration = 2000; // 2 seconds
  const start = Date.now();
  
  function updateCounter() {
    const now = Date.now();
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.floor(progress * target);
    element.textContent = current + (element.dataset.target.includes('+') ? '+' : '');
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = element.dataset.target;
    }
  }
  
  updateCounter();
}

// Load About Section
function loadAboutSection(aboutData) {
  const aboutTag = document.querySelector('.about-section .section-tag');
  if (aboutTag) aboutTag.textContent = aboutData.tag;

  const aboutTitle = document.querySelector('.about-section .section-title');
  if (aboutTitle) aboutTitle.textContent = aboutData.title;

  const aboutSubtitle = document.querySelector('.about-section .section-subtitle');
  if (aboutSubtitle) aboutSubtitle.textContent = aboutData.subtitle;

  const aboutGrid = document.querySelector('.about-grid');
  if (aboutGrid) {
    aboutGrid.innerHTML = aboutData.cards.map(card => `
      <div class="about-card fade-in">
        <div class="about-icon">
          <i data-feather="zap"></i>
        </div>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      </div>
    `).join('');
    
    document.querySelectorAll('.about-card').forEach(el => {
      revealObserver.observe(el);
    });
    if (window.feather && typeof window.feather.replace === 'function') {
      window.feather.replace({ 'stroke-width': 2, width: 24, height: 24 });
    }
  }
}

// Load Services Section
function loadServicesSection(servicesData) {
  const serviceTag = document.querySelector('.services-section .section-tag');
  if (serviceTag) serviceTag.textContent = servicesData.tag;

  const serviceTitle = document.querySelector('.services-section .section-title');
  if (serviceTitle) serviceTitle.textContent = servicesData.title;

  const serviceSubtitle = document.querySelector('.services-section .section-subtitle');
  if (serviceSubtitle) serviceSubtitle.textContent = servicesData.subtitle;

  const servicesGrid = document.querySelector('.services-grid');
  if (servicesGrid) {
    // helper to select feather icon name by our icon key
    function getServiceIcon(name) {
      switch (name) {
        case 'web-dev':
          return 'globe';
        case 'app-dev':
          return 'smartphone';
        case 'ai-dev':
          return 'cpu';
        case 'ui-ux':
          return 'layout';
        case 'game-dev':
          return 'play';
        case 'analytics':
          return 'bar-chart-2';
        default:
          return 'circle';
      }
    }

    servicesGrid.innerHTML = servicesData.cards.map(card => `
      <div class="service-card fade-in">
        <div class="service-icon ${card.icon}">
          <i data-feather="${getServiceIcon(card.icon)}"></i>
        </div>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <div class="service-tags">
          ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');

    // replace any data-feather placeholders with SVGs (feather library loaded in index.html)
    if (window.feather && typeof window.feather.replace === 'function') {
      // default sizing/stroke
      window.feather.replace({ 'stroke-width': 1.8, width: 28, height: 28 });
    }

    document.querySelectorAll('.service-card').forEach(el => {
      revealObserver.observe(el);
    });
  }
}

// ========================
// Work Section — Bento Card Builder
// ========================

// Feather SVG paths (inline, no external dep issues)
const FEATHER_SVGS = {
  'globe':       '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'smartphone':  '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  'cpu':         '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  'layout':      '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  'play-circle': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  'layers':      '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  'code':        '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'arrow-up-right': '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
};

function makeSVG(name, cls = '') {
  const paths = FEATHER_SVGS[name] || FEATHER_SVGS['code'];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${paths}</svg>`;
}

/**
 * Bento Layout Engine
 * -------------------
 * The 12-column grid is filled row-by-row using repeating ROW TEMPLATES.
 * Each template defines exactly how many cards fill one row and what
 * CSS class (col-span) each slot gets. All templates must sum to 12 cols.
 *
 * Row templates (sum = 12 cols each):
 *   A  [8 + 4]         → 1 wide hero  + 1 normal
 *   B  [4 + 4 + 4]     → 3 normals
 *   C  [4 + 8]         → 1 normal     + 1 wide hero  (mirror of A)
 *   D  [4 + 4 + 4]     → 3 normals    (same as B, used as filler)
 *
 * The sequence A → B → C → D repeats, giving a varied but predictable rhythm.
 * When fewer cards are left than a template needs, we fall back to B (equal split).
 */
const BENTO_ROW_TEMPLATES = [
  // [cssClass, colSpan, rowSpan]
  /* A */ [['bento-hero', 8, 5], ['bento-sq',  4, 5]],
  /* B */ [['',           4, 4], ['',          4, 4], ['',         4, 4]],
  /* C */ [['bento-sq',   4, 5], ['bento-hero',8, 5]],
  /* D */ [['',           4, 4], ['',          4, 4], ['',         4, 4]],
];

/**
 * Assign a bento CSS class to every project based on its position in the
 * repeating row sequence. Returns an array of class strings, one per project.
 */
function assignBentoClasses(count) {
  const classes = [];
  let i = 0;
  let templateIndex = 0;

  while (i < count) {
    const template = BENTO_ROW_TEMPLATES[templateIndex % BENTO_ROW_TEMPLATES.length];
    const slotsNeeded = template.length;
    const slotsAvailable = count - i;

    if (slotsAvailable >= slotsNeeded) {
      // Full template row — assign each slot its designated class
      template.forEach(([cls]) => classes.push(cls));
      i += slotsNeeded;
    } else {
      // Partial last row — fill remaining cards equally (4-col each)
      for (let r = 0; r < slotsAvailable; r++) classes.push('');
      i += slotsAvailable;
    }

    templateIndex++;
  }

  return classes;
}

function buildWorkCard(project, index, bentoClass) {
  const cat      = project.category || 'all';
  const iconName = project.icon || 'code';
  const gradient = project.gradient || 'linear-gradient(135deg,#374151 0%,#111827 100%)';
  const tags         = (project.tags || []).slice(0, 3);
  const num          = String(index + 1).padStart(2, '0');
  const year         = project.year || '2024';
  const dataCategory = cat;

  return `
    <div class="work-card ${bentoClass} fade-in" data-category="${dataCategory}" role="article">
      <div class="work-visual">
        <div class="work-visual-bg" style="--card-gradient: ${gradient};"></div>
        <div class="work-orb work-orb-1"></div>
        <div class="work-orb work-orb-2"></div>
        <div class="work-icon-wrap">
          ${makeSVG(iconName)}
        </div>
        <span class="work-num">${num}</span>
      </div>
      <div class="work-body">
        <div class="work-card-meta">
          <span class="work-card-year">${year}</span>
          <span class="work-card-dot"></span>
          <span class="work-card-type" style="display:none;">None</span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${tags.length ? `<div class="work-tags">${tags.map(t => `<span class="work-tag">${t}</span>`).join('')}</div>` : ''}
      </div>
      <div class="work-card-footer">
        <a href="${project.link || '#'}" class="work-link" target="_blank" rel="noopener noreferrer">
          View Project ${makeSVG('arrow-up-right')}
        </a>
        <span class="work-link-dot"></span>
      </div>
    </div>`;
}

// Load Work Section
function loadWorkSection(workData) {
  const workTag = document.querySelector('.work-section .section-tag');
  if (workTag) workTag.textContent = workData.tag;

  const workTitle = document.querySelector('.work-section .section-title');
  if (workTitle) workTitle.textContent = workData.title;

  const workSubtitle = document.querySelector('.work-section .section-subtitle');
  if (workSubtitle) workSubtitle.textContent = workData.subtitle;

  const workGrid = document.querySelector('.work-grid');
  if (workGrid) {
    const bentoClasses = assignBentoClasses(workData.projects.length);
    workGrid.innerHTML = workData.projects.map((project, i) => buildWorkCard(project, i, bentoClasses[i])).join('');

    document.querySelectorAll('.work-card').forEach(el => revealObserver.observe(el));

    // 3D tilt effect on mouse move
    initWorkCardTilt();

    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const initialFilter = activeFilterBtn ? activeFilterBtn.dataset.filter || 'all' : 'all';
    enforceWorkLimit(undefined, 'work.html', initialFilter);
  }
}

// Subtle 3D tilt on hover
function initWorkCardTilt() {
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        perspective(700px)
        rotateX(${-y * 6}deg)
        rotateY(${x * 6}deg)
        translateY(-6px)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Enforce a maximum visible work cards and add a "Show more" button
function enforceWorkLimit(max = Infinity, morePage = 'work.html', filter = 'all') {
  const workGrid = document.querySelector('.work-grid');
  if (!workGrid) return;

  const cards = Array.from(workGrid.querySelectorAll('.work-card'));

  // remove any existing "show more" button (legacy)
  const existing = document.getElementById('work-show-more');
  if (existing) existing.remove();

  cards.forEach((card, i) => {
    const cardCategory = card.dataset.category || 'default';

    let shouldShow = false;
    if (filter === 'all') {
      shouldShow = true;
    } else if (filter === 'top') {
      shouldShow = cardCategory === 'top';
    } else {
      shouldShow = cardCategory === filter;
    }

    if (shouldShow) {
      card.style.display = '';
      card.classList.remove('filter-hidden');
      card.setAttribute('aria-hidden', 'false');
      card.style.animationDelay = `${i * 40}ms`;
    } else {
      card.style.display = 'none';
      card.classList.add('filter-hidden');
      card.setAttribute('aria-hidden', 'true');
    }
  });
}

// Load Contact Section
function loadContactSection(contactData) {
  const contactTag = document.querySelector('.contact-section .section-tag');
  if (contactTag) contactTag.textContent = contactData.tag;

  const contactTitle = document.querySelector('.contact-section .section-title');
  if (contactTitle) {
    contactTitle.innerHTML = `${contactData.title}<br>${contactData.titleSecond}`;
  }

  const contactSubtitle = document.querySelector('.contact-subtitle');
  if (contactSubtitle) contactSubtitle.textContent = contactData.subtitle;

  // Update contact info
  const contactItems = document.querySelectorAll('.contact-item');
  if (contactItems.length >= 3) {
    contactItems[0].querySelector('.contact-value').textContent = contactData.email;
    contactItems[1].querySelector('.contact-value').textContent = contactData.phone;
    contactItems[2].querySelector('.contact-value').textContent = contactData.location;
  }
}

// Load Footer
function loadFooter(footerData) {
  const footerText = document.querySelector('.footer-text');
  if (footerText) {
    footerText.innerHTML = `${footerData.copyright}`;
  }
}

// Load content when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPageContent);
} else {
  loadPageContent();
}

// ========================
// Render Social Links (if element exists)
// ========================
const socialLinksDiv = document.getElementById('social-links');
if (socialLinksDiv) {
  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/Ali-Yousaf/' },
    { name: 'Fiverr', url: 'https://www.fiverr.com/ali_yousaf121?public_mode=true' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/ali-yousaf-duke/' },
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UC7KITlQNDJzdMbTiUMZ_K3A' },
    { name: 'Itch.io', url: 'https://monsterduke.itch.io/' },
    { name: 'Instagram', url: 'https://www.instagram.com/dukelabs1/' }
  ];

  socialLinks.forEach(s => {
    const link = document.createElement('a');
    link.className = 'social-link fade-in';
    link.href = s.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `<span class="social-name">${s.name}</span>`;
    socialLinksDiv.appendChild(link);
    setTimeout(() => revealObserver.observe(link), 50);
  });
}

// ========================
// Work Section Filter
// ========================
function initializeWorkFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      enforceWorkLimit(undefined, undefined, filter);
    });
  });

  // Apply the default active filter (if any) on load
  const activeBtn = document.querySelector('.filter-btn.active');
  const initialFilter = activeBtn ? (activeBtn.dataset.filter || 'all') : 'all';
  enforceWorkLimit(undefined, undefined, initialFilter);
}

// Initialize filters after a short delay to ensure DOM is updated
setTimeout(initializeWorkFilters, 100);

// ========================
// Scroll-triggered fade-in for all fade-in elements
// ========================
function initializeFadeInObserver() {
  document.querySelectorAll('.fade-in').forEach(el => {
    revealObserver.observe(el);
  });
}

// Initialize fade-in after content loads
setTimeout(initializeFadeInObserver, 100);

// ========================
// Contact Form Submission
// ========================
function initializeContactForm() {
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    // Initialize EmailJS (replace 'YOUR_USER_ID' with your EmailJS user/public key)
    try {
      if (window.emailjs && typeof window.emailjs.init === 'function') {
        window.emailjs.init('YOUR_EMAILJS_USER_ID');
      }
    } catch (err) {
      console.warn('EmailJS init failed', err);
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const resultDiv = document.getElementById('contact-result');
      if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.className = '';
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const templateParams = {
        user_name: contactForm.elements['user_name']?.value || '',
        user_email: contactForm.elements['user_email']?.value || '',
        message: contactForm.elements['message']?.value || ''
      };

      // If EmailJS is configured, send via EmailJS, otherwise just show the message locally
      if (window.emailjs && typeof window.emailjs.send === 'function') {
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS identifiers
        window.emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
          .then(() => {
            if (resultDiv) {
              resultDiv.textContent = 'Thanks — your message has been sent. We\'ll reply shortly.';
              resultDiv.className = 'contact-success';
              resultDiv.style.display = '';
            } else {
              alert('Thanks — your message has been sent.');
            }
            contactForm.reset();
          }, (error) => {
            console.error('EmailJS error:', error);
            if (resultDiv) {
              resultDiv.textContent = 'Sorry — there was an error sending your message. Please try again later.';
              resultDiv.className = 'contact-error';
              resultDiv.style.display = '';
            } else {
              alert('Sending failed — please try again later.');
            }
          })
          .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
          });
      } else {
        // No EmailJS configured — show demo message and log to console
        console.log('Form submitted (local only):', templateParams);
        if (resultDiv) {
          resultDiv.textContent = 'Thanks — your message has been received (demo mode).';
          resultDiv.className = 'contact-success';
          resultDiv.style.display = '';
        } else {
          alert('Thanks — your message has been received (demo mode).');
        }
        contactForm.reset();
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

// Initialize contact form after content loads
setTimeout(initializeContactForm, 100);
