document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('loanAmount');
  const rateInput = document.getElementById('interestRate');
  const termInput = document.getElementById('loanTerm');
  const resetBtn = document.getElementById('calcReset');

  const monthlyEl = document.getElementById('resultMonthly');
  const totalEl = document.getElementById('resultTotal');
  const interestEl = document.getElementById('resultInterest');
  const hintEl = document.getElementById('calcHint');

  // Loan calculator wiring (if present on page)
  if (amountInput && rateInput && termInput) {
    function formatCurrency(value) {
      if (!isFinite(value)) return '—';
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
      }).format(value);
    }

    function computeMonthlyPayment(principal, annualRatePercent, years) {
      const n = years * 12;
      const r = annualRatePercent / 100 / 12;

      if (n <= 0) return NaN;
      if (r === 0) return principal / n;

      const factor = Math.pow(1 + r, n);
      return (principal * r * factor) / (factor - 1);
    }

    function recalc() {
      const principal = parseFloat(amountInput.value || '0');
      const rate = parseFloat(rateInput.value || '0');
      const years = parseFloat(termInput.value || '0');

      if (!principal || !rate || !years) {
        if (monthlyEl) monthlyEl.textContent = '—';
        if (totalEl) totalEl.textContent = '—';
        if (interestEl) interestEl.textContent = '—';
        if (hintEl)
          hintEl.textContent = 'Start by entering loan amount, interest rate, and term.';
        return;
      }

      const monthly = computeMonthlyPayment(principal, rate, years);
      const total = monthly * years * 12;
      const interest = total - principal;

      if (monthlyEl) monthlyEl.textContent = formatCurrency(monthly);
      if (totalEl) totalEl.textContent = formatCurrency(total);
      if (interestEl) interestEl.textContent = formatCurrency(interest);
      if (hintEl)
        hintEl.textContent =
          'These values are estimates only and for illustration purposes.';
    }

    ['input', 'change'].forEach((evt) => {
      amountInput.addEventListener(evt, recalc);
      rateInput.addEventListener(evt, recalc);
      termInput.addEventListener(evt, recalc);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        amountInput.value = '';
        rateInput.value = '';
        termInput.value = '';
        recalc();
      });
    }

    recalc();
  }

  // Interactive loan program cards
  const loanCards = document.querySelectorAll('[data-loan-card]');
  const loanDetailTitle = document.getElementById('loanDetailTitle');
  const loanDetailBody = document.getElementById('loanDetailBody');

  const loanDetails = {
    home: {
      title: 'Home Loan – Key Requirements',
      body:
        'Basic documents include: completed Application Form, Customer Information Sheet (CIS), optional Personal Data Sheet, Data Privacy Consent Form, 1x1 photo, civil status documents (Marriage Certificate / Birth Certificate / CENOMAR), proof of billing from at least two utility or service companies, and two valid government-issued IDs. ' +
        'For income evaluation: locally employed clients submit latest BIR-stamped ITR, Certificate of Income and Employment with employer email, latest three months payslips, SALN for government employees, and authority allowing LandBank to verify employment and income. ' +
        'For OFWs: employment contract, latest three months payslips, and Special Power of Attorney / Irrevocable SPA using LandBank or developer formats. ' +
        'For self-employed: SEC or DTI registration, Mayor’s Permit, BIR-filed financial statements for the last three years, and lease contracts if applicable. ' +
        'Collateral requirements include photocopy of TCT/CCT and tax declarations, certified lot plan, certified location and vicinity map, current real estate tax receipts and tax clearance, condominium documents if applicable, and photos of the offered collateral, plus supporting items such as Contract to Sell or reservation documents, latest Statements of Account, proof of other income, OR/CR of vehicles, and building plans, permits, and bills of materials for construction or renovation loans.',
    },
    business: {
      title: 'Small Business Loan – Fuel for entrepreneurs',
      body:
        'Provides working capital or expansion funds for MSMEs, enabling you to invest in equipment, ' +
        'inventory, and day-to-day operations while preserving cash flow.',
    },
    auto: {
      title: 'Auto Loan – Drive with confidence',
      body:
        'Lets you acquire a brand-new or selected pre-owned vehicle through structured amortization, ' +
        'aligning repayments with your income schedule.',
    },
  };

  if (loanCards.length && loanDetailTitle && loanDetailBody) {
    loanCards.forEach((card) => {
      card.addEventListener('click', () => {
        loanCards.forEach((c) =>
          c.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-emerald-50'),
        );
        card.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'ring-offset-emerald-50');

        const key = card.getAttribute('data-loan-card');
        if (!key || !loanDetails[key]) return;

        const detail = loanDetails[key];
        loanDetailTitle.textContent = detail.title;
        loanDetailBody.textContent = detail.body;
      });
    });
  }

  // FAQ accordion
  const faqButtons = document.querySelectorAll('[data-accordion-toggle]');

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-accordion-toggle');
      if (!targetId) return;

      const content = document.getElementById(targetId);
      if (!content) return;

      const isOpen = !content.classList.contains('hidden');

      // close all
      faqButtons.forEach((btn) => {
        const id = btn.getAttribute('data-accordion-toggle');
        if (!id) return;
        const el = document.getElementById(id);
        if (el && el !== content) {
          el.classList.add('hidden');
        }
      });

      // toggle current
      content.classList.toggle('hidden', isOpen);
    });
  });

  // Back to top button (homepage)
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() {
      if (window.scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleBackToTop();
  }

  // Active nav link on scroll (homepage)
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('section[id], footer[id]');
  if (navLinks.length && sections.length) {
    function updateActiveNav() {
      const scrollY = window.scrollY + 80;
      let current = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + height) current = sec.id;
      });
      navLinks.forEach((link) => {
        if (link.getAttribute('data-section') === current) {
          link.classList.add('nav-active');
        } else {
          link.classList.remove('nav-active');
        }
      });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  // Scroll-triggered fade-in for cards
  const animated = document.querySelectorAll('.animate-on-scroll');
  if (animated.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );
    animated.forEach((el) => observer.observe(el));
  }

  const orgChartGallery = document.getElementById('org-chart-gallery');
  const orgChartSlidesWrap = document.getElementById('org-chart-slides-wrap');
  const orgChartSlidesInner = document.getElementById('org-chart-slides-inner');
  const orgChartSlidesCaption = document.getElementById('org-chart-slides-caption');

  if (orgChartGallery) {
    const defaultPages = [
      { image: '/assets/org-chart-1.png', caption: 'Page 1' },
      { image: '/assets/org-chart-2.png', caption: 'Page 2' },
      { image: '/assets/org-chart-3.png', caption: 'Page 3' },
      { image: '/assets/org-chart-4.png', caption: 'Page 4' },
    ];

    function isAllowedGoogleSlidesEmbed(url) {
      try {
        const u = new URL(url);
        return (
          u.protocol === 'https:' &&
          u.hostname === 'docs.google.com' &&
          u.pathname.includes('/presentation/')
        );
      } catch {
        return false;
      }
    }

    function renderGoogleSlides(embedUrl, captionText) {
      if (!orgChartSlidesWrap || !orgChartSlidesInner) return;
      orgChartSlidesInner.innerHTML = '';
      if (!embedUrl || !isAllowedGoogleSlidesEmbed(embedUrl)) {
        orgChartSlidesWrap.classList.add('hidden');
        return;
      }
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.title = 'Organization chart (Google Slides)';
      iframe.className = 'absolute inset-0 h-full w-full border-0';
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      iframe.setAttribute('allowfullscreen', '');
      orgChartSlidesInner.appendChild(iframe);
      orgChartSlidesWrap.classList.remove('hidden');
      if (orgChartSlidesCaption && captionText) {
        orgChartSlidesCaption.textContent = captionText;
        orgChartSlidesCaption.classList.remove('hidden');
      } else if (orgChartSlidesCaption) {
        orgChartSlidesCaption.classList.add('hidden');
      }
    }

    function renderOrgChartPages(pages) {
      orgChartGallery.innerHTML = '';
      pages.forEach((p, i) => {
        const src = p.image;
        const caption = p.caption || `Page ${i + 1}`;
        const a = document.createElement('a');
        a.href = src;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'group block';
        const figure = document.createElement('figure');
        figure.className = 'overflow-hidden rounded-2xl border border-slate-200 bg-slate-50';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Organizational chart — ${caption}`;
        img.className = 'w-full h-auto object-contain transition group-hover:scale-[1.01]';
        img.loading = 'lazy';
        figure.appendChild(img);
        const cap = document.createElement('p');
        cap.className = 'mt-2 text-center text-xs font-medium text-slate-700';
        cap.textContent = caption;
        a.appendChild(figure);
        a.appendChild(cap);
        orgChartGallery.appendChild(a);
      });
    }

    function applyOrgChartConfig(data) {
      const pages =
        data && Array.isArray(data.pages) && data.pages.length ? data.pages : defaultPages;
      const showPng = data == null || data.showPngGallery !== false;
      const slidesUrl =
        data && typeof data.googleSlidesEmbedUrl === 'string'
          ? data.googleSlidesEmbedUrl.trim()
          : '';

      if (slidesUrl) {
        renderGoogleSlides(
          slidesUrl,
          data && typeof data.googleSlidesCaption === 'string' ? data.googleSlidesCaption : ''
        );
      } else if (orgChartSlidesWrap) {
        orgChartSlidesWrap.classList.add('hidden');
      }

      if (showPng) {
        orgChartGallery.classList.remove('hidden');
        renderOrgChartPages(pages);
      } else {
        orgChartGallery.classList.add('hidden');
        orgChartGallery.innerHTML = '';
      }
    }

    fetch('/org-chart-pages.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => applyOrgChartConfig(data))
      .catch(() => applyOrgChartConfig(null));
  }
}); 
