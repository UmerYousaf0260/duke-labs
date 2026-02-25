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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>
        </div>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      </div>
    `).join('');
    
    document.querySelectorAll('.about-card').forEach(el => {
      revealObserver.observe(el);
    });
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
    servicesGrid.innerHTML = servicesData.cards.map(card => `
      <div class="service-card fade-in">
        <div class="service-icon ${card.icon}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <div class="service-tags">
          ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.service-card').forEach(el => {
      revealObserver.observe(el);
    });
  }
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
    workGrid.innerHTML = workData.projects.map(project => `
      <div class="work-card fade-in" data-category="${project.category}">
        <div class="work-image" style="background: ${project.gradient};">
          <div class="work-category">${project.category.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="#" class="work-link">View Project →</a>
      </div>
    `).join('');
    
    document.querySelectorAll('.work-card').forEach(el => {
      revealObserver.observe(el);
    });
  }
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
  const workCards = document.querySelectorAll('.work-card');

  // Initialize all cards as visible
  workCards.forEach(card => card.classList.remove('filter-hidden', 'filter-exit', 'filter-enter', 'filter-enter-active'));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const toShow = [];
      const toHide = [];

      workCards.forEach(card => {
        const matches = filter === 'all' || card.dataset.category === filter;
        (matches ? toShow : toHide).push(card);
      });

      // Step 1: fade out ALL visible cards simultaneously
      workCards.forEach(card => {
        card.classList.remove('filter-enter', 'filter-enter-active');
        card.classList.add('filter-exit');
      });

      // Step 2: after exit animation, hide non-matching and show matching
      setTimeout(() => {
        toHide.forEach(card => {
          card.classList.add('filter-hidden');
          card.classList.remove('filter-exit');
        });

        toShow.forEach((card, i) => {
          card.classList.remove('filter-hidden', 'filter-exit');
          card.classList.add('filter-enter');

          // Stagger each card's entrance
          setTimeout(() => {
            card.classList.add('filter-enter-active');
            setTimeout(() => card.classList.remove('filter-enter', 'filter-enter-active'), 350);
          }, i * 60);
        });
      }, 200);
    });
  });
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
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Form submitted:', {
        name: contactForm.elements[0].value,
        email: contactForm.elements[1].value,
        message: contactForm.elements[2].value
      });
      alert('Thank you for your message! We\'ll get back to you soon.');
      contactForm.reset();
    });
  }
}

// Initialize contact form after content loads
setTimeout(initializeContactForm, 100);
