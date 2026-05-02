document.addEventListener('DOMContentLoaded', () => {
(function markActiveNav() {
  const links = document.querySelectorAll('.site-nav a');
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });
})();

const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.section-header, .hero-content, .about-text, .about-photo, ' +
  '.clients-category, .review-card, .service-card, .advantage-card, ' +
  '.vacancy-item, .benefit-card, .stat-item, .contact-info-card, .contact-form-card'
).forEach(el => {
  el.classList.add('animate');
  revealObserver.observe(el);
});

if (window.innerWidth > 768) {
  document.querySelectorAll('.hero-title span, .clients-hero-title span').forEach(el => {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';

    let charIndex = 0;

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split('').forEach(char => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.transitionDelay = `${charIndex * 0.028}s`;
          el.appendChild(span);
          charIndex++;
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(document.createElement('br'));
      }
    });

    el.classList.add('split-text');
    setTimeout(() => el.classList.add('show'), 250);
  });
}

document.querySelectorAll('.depth').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${y * -9}deg) rotateY(${x * 9}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
  });
});

function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const from = 0;

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  el.textContent = '0';
  counterObserver.observe(el);
});

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

(function checkToastMessage() {
  const params = new URLSearchParams(window.location.search);
  const msg = params.get('msg');

  const messages = {
    message_sent: 'Сообщение успешно отправлено! Мы свяжемся с вами.',
    order_sent: 'Заявка отправлена! Мы перезвоним в течение 30 минут.',
    resume_sent: 'Отклик отправлен! Спасибо за интерес к вакансии.'
  };

  if (msg && messages[msg]) {
    showToast(messages[msg]);

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.delete('msg');
      window.history.replaceState({}, document.title, url.toString());
    }
  }
})();

document.querySelectorAll('.service-card, .benefit-card').forEach(card => {

  card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';

  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-6px)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });

  card.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(249,115,22,0.18);
      top: ${e.clientY - rect.top - size/2}px;
      left: ${e.clientX - rect.left - size/2}px;
      transform: scale(0);
      animation: ripple-anim 0.6s ease-out forwards;
      pointer-events: none;
    `;

    if (getComputedStyle(this).position === 'static') {
      this.style.position = 'relative';
    }

    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 650);
  });

});

if (!document.getElementById('ripple-style')) {
  const style = document.createElement('style');
  style.id = 'ripple-style';
  style.textContent = `
    @keyframes ripple-anim {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

const burgerBtn = document.querySelector('.burger-btn');
const siteNav   = document.querySelector('.site-nav');

if (burgerBtn && siteNav) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('open');
    siteNav.classList.toggle('nav-open');
  });

  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('open');
      siteNav.classList.remove('nav-open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!siteNav.contains(e.target) && !burgerBtn.contains(e.target)) {
      burgerBtn.classList.remove('open');
      siteNav.classList.remove('nav-open');
    }
  });
}

const serviceModal = document.getElementById('serviceModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalPriceBlock = document.getElementById('modalPriceBlock');
const modalServiceId = document.getElementById('modal-service-id');
const modalServiceName = document.getElementById('modal-service-name');
const serviceModalForm = document.getElementById('serviceModalForm');

function openServiceModal(name, desc, price, serviceId) {
  if (!serviceModal) return;

  modalTitle.textContent = name;
  modalDesc.textContent  = desc;

  if (price) {
    modalPrice.textContent = price;
    if (modalPriceBlock) modalPriceBlock.style.display = '';
  } else {
    if (modalPriceBlock) modalPriceBlock.style.display = 'none';
  }

  if (modalServiceName) modalServiceName.value = name;
  if (modalServiceId) modalServiceId.value = serviceId || '';

  serviceModal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
  if (!serviceModal) return;
  serviceModal.classList.remove('modal-open');
  document.body.style.overflow = '';
}

if (serviceModal) {
  document.querySelectorAll('.service-card[data-service]').forEach(card => {
    card.addEventListener('click', () => {
      const name  = card.dataset.service || '';
      const desc  = card.dataset.desc   || '';
      const price = card.dataset.price  || '';
      const serviceId = card.dataset.serviceId || '';
      openServiceModal(name, desc, price, serviceId);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeServiceModal);
  }

  serviceModal.addEventListener('click', (e) => {
    if (e.target === serviceModal) closeServiceModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeServiceModal();
  });

  if (serviceModalForm) {
    serviceModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(serviceModalForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/service-orders/ajax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          closeServiceModal();
          showToast('✓ Заявка отправлена! Мы перезвоним в течение 30 минут.');
          serviceModalForm.reset();
        } else {
          showToast('Произошла ошибка. Попробуйте позже.');
        }
      } catch (err) {
        console.error('Ошибка отправки заявки:', err);
        showToast('Не удалось отправить заявку. Проверьте соединение.');
      }
    });
  }
}

document.querySelectorAll('.vacancy-accordion').forEach(accordion => {
  const trigger = accordion.querySelector('.vacancy-trigger');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    const isOpen = accordion.classList.contains('is-open');

    document.querySelectorAll('.vacancy-accordion.is-open').forEach(open => {
      open.classList.remove('is-open');
    });

    if (!isOpen) {
      accordion.classList.add('is-open');
    }
  });
});

document.querySelectorAll('.vacancy-apply-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const vacancyName = btn.dataset.vacancy || '';
    const vacancyId = btn.dataset.vacancyId || '';
    const select = document.getElementById('resumeVacancySelect');
    const hiddenTitle = document.getElementById('hiddenVacancyTitle');
    const formEl = document.getElementById('resumeForm');

    if (select) {
      let found = false;
      for (let opt of select.options) {
        if (opt.value === vacancyId || opt.text === vacancyName) {
          select.value = opt.value;
          found = true;
          break;
        }
      }
      if (!found && vacancyName) {
        const newOption = new Option(vacancyName, vacancyId, true, true);
        select.add(newOption);
      }
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (hiddenTitle) {
      hiddenTitle.value = vacancyName;
    }

    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const resumeSelect = document.getElementById('resumeVacancySelect');
const hiddenTitle = document.getElementById('hiddenVacancyTitle');
if (resumeSelect && hiddenTitle) {
  resumeSelect.addEventListener('change', () => {
    const selectedOption = resumeSelect.options[resumeSelect.selectedIndex];
    hiddenTitle.value = selectedOption ? selectedOption.text : '';
  });
}

const resumeFileInput = document.getElementById('resumeFileInput');
if (resumeFileInput) {
  resumeFileInput.addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name;
    const span = document.querySelector('.resume-file-name');
    if (span && fileName) {
      span.textContent = fileName;
    }
  });
}

const catalogModal   = document.getElementById('catalogModal');
const catalogClose   = document.getElementById('catalogClose');

function openCatalogModal() {
  if (!catalogModal) return;
  catalogModal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeCatalogModal() {
  if (!catalogModal) return;
  catalogModal.classList.remove('modal-open');
  document.body.style.overflow = '';
}

if (catalogModal) {
  document.querySelectorAll('.catalog-card, [data-open-catalog]').forEach(card => {
    card.addEventListener('click', () => {
      openCatalogModal();
    });
  });

  if (catalogClose) {
    catalogClose.addEventListener('click', closeCatalogModal);
  }

  catalogModal.addEventListener('click', (e) => {
    if (e.target === catalogModal) closeCatalogModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && catalogModal.classList.contains('modal-open')) {
      closeCatalogModal();
    }
  });

  catalogModal.querySelectorAll('.catalog-item-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const name      = btn.dataset.service   || '';
      const desc      = btn.dataset.desc      || '';
      const price     = btn.dataset.price     || '';
      const serviceId = btn.dataset.serviceId || '';

      closeCatalogModal();
      
      setTimeout(() => {
        openServiceModal(name, desc, price, serviceId);
      }, 280);
    });
  });

}

});