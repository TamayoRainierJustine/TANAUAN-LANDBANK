import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import config from '/firebase-config.js';

const defaultPages = [
  { image: '/assets/org-chart-1.png', caption: 'Page 1' },
  { image: '/assets/org-chart-2.png', caption: 'Page 2' },
  { image: '/assets/org-chart-3.png', caption: 'Page 3' },
  { image: '/assets/org-chart-4.png', caption: 'Page 4' },
];

function isFirebaseReady() {
  return config && typeof config.apiKey === 'string' && config.apiKey.length > 0;
}

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

function renderGoogleSlides(orgChartSlidesWrap, orgChartSlidesInner, orgChartSlidesCaption, embedUrl, captionText) {
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

function renderOrgChartPages(orgChartGallery, pages) {
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

function applyOrgChartConfig(
  orgChartGallery,
  orgChartSlidesWrap,
  orgChartSlidesInner,
  orgChartSlidesCaption,
  data
) {
  const pages =
    data && Array.isArray(data.pages) && data.pages.length ? data.pages : defaultPages;
  const showPng = data == null || data.showPngGallery !== false;
  const slidesUrl =
    data && typeof data.googleSlidesEmbedUrl === 'string'
      ? data.googleSlidesEmbedUrl.trim()
      : '';

  if (slidesUrl) {
    renderGoogleSlides(
      orgChartSlidesWrap,
      orgChartSlidesInner,
      orgChartSlidesCaption,
      slidesUrl,
      data && typeof data.googleSlidesCaption === 'string' ? data.googleSlidesCaption : ''
    );
  } else if (orgChartSlidesWrap) {
    orgChartSlidesWrap.classList.add('hidden');
  }

  if (showPng) {
    orgChartGallery.classList.remove('hidden');
    renderOrgChartPages(orgChartGallery, pages);
  } else {
    orgChartGallery.classList.add('hidden');
    orgChartGallery.innerHTML = '';
  }
}

async function loadFromJson() {
  const res = await fetch('/org-chart-pages.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('json');
  return res.json();
}

function run() {
  const orgChartGallery = document.getElementById('org-chart-gallery');
  if (!orgChartGallery) return;

  const orgChartSlidesWrap = document.getElementById('org-chart-slides-wrap');
  const orgChartSlidesInner = document.getElementById('org-chart-slides-inner');
  const orgChartSlidesCaption = document.getElementById('org-chart-slides-caption');

  const apply = (data) =>
    applyOrgChartConfig(
      orgChartGallery,
      orgChartSlidesWrap,
      orgChartSlidesInner,
      orgChartSlidesCaption,
      data
    );

  const fallbackJson = () => {
    loadFromJson()
      .then((data) => apply(data))
      .catch(() => apply(null));
  };

  if (!isFirebaseReady()) {
    fallbackJson();
    return;
  }

  try {
    const app = initializeApp(config);
    const db = getFirestore(app);
    const dref = doc(db, 'siteConfig', 'orgChart');
    onSnapshot(
      dref,
      (snap) => {
        if (snap.exists()) {
          apply(snap.data());
        } else {
          fallbackJson();
        }
      },
      () => fallbackJson()
    );
  } catch {
    fallbackJson();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
