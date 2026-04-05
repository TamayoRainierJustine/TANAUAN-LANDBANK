import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
import config from '/firebase-config.js';

const DOC_PATH = ['siteConfig', 'orgChart'];

/** @type {boolean} */
let offlineMode = false;
let staffInstructionsBackup =
  'I-edit ang JSON na ito o gamitin ang web editor. I-deploy ang site pagkatapos.';

function isFirebaseReady() {
  return config && typeof config.apiKey === 'string' && config.apiKey.length > 0;
}

function showEl(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden', !on);
}

function setStatus(msg, isErr) {
  const el = document.getElementById('admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.className = `text-sm ${isErr ? 'text-red-600' : 'text-emerald-800'}`;
}

let app;
let auth;
let db;
let storage;

function initFirebase() {
  if (!isFirebaseReady()) return false;
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  if (config.storageBucket) {
    storage = getStorage(app);
  }
  return true;
}

function updateImagePreview(wrap) {
  const ta = wrap.querySelector('.page-image');
  const img = wrap.querySelector('.page-preview');
  const placeholder = wrap.querySelector('.drop-placeholder');
  if (!ta || !img) return;
  const v = ta.value.trim();
  if (!v) {
    img.classList.add('hidden');
    img.removeAttribute('src');
    if (placeholder) placeholder.classList.remove('hidden');
    return;
  }
  if (placeholder) placeholder.classList.add('hidden');
  img.classList.remove('hidden');
  img.alt = 'Preview';
  img.src = v;
  img.onerror = () => {
    img.classList.add('hidden');
    if (placeholder) placeholder.classList.remove('hidden');
  };
}

async function processImageFile(wrap, file) {
  if (!file || !/^image\/(png|jpeg|webp)$/i.test(file.type)) {
    setStatus('PNG, JPG, o WebP lang ang tinatanggap.', true);
    return;
  }
  const ta = wrap.querySelector('.page-image');
  if (!ta) return;

  if (storage && !offlineMode) {
    setStatus('Ini-upload…');
    try {
      const path = `org-chart/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      ta.value = url;
      wrap.querySelector('.url-mode')?.classList.add('hidden');
      wrap.querySelector('.drop-shell')?.classList.remove('hidden');
      updateImagePreview(wrap);
      setStatus('Tapos na ang upload. I-save para ma-publish.');
    } catch (e) {
      setStatus(String(e?.message || e), true);
    }
    return;
  }

  setStatus('Binabasa ang larawan…');
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === 'string') {
      ta.value = result;
      wrap.querySelector('.url-mode')?.classList.add('hidden');
      wrap.querySelector('.drop-shell')?.classList.remove('hidden');
      updateImagePreview(wrap);
      setStatus(
        offlineMode
          ? 'Naka-embed na ang larawan sa JSON (data URL). I-download ang JSON at i-deploy. Malaking file = malaking JSON.'
          : ''
      );
    }
  };
  reader.onerror = () => setStatus('Hindi mabasa ang file.', true);
  reader.readAsDataURL(file);
}

function wireImageRow(wrap) {
  const dropShell = wrap.querySelector('.drop-shell');
  const fileInput = wrap.querySelector('.page-file-input');
  const browseBtn = wrap.querySelector('.browse-btn');
  const ta = wrap.querySelector('.page-image');
  const urlInput = wrap.querySelector('.page-image-url');
  const urlMode = wrap.querySelector('.url-mode');
  const toggleUrl = wrap.querySelector('.toggle-url');

  function setUrlMode(on) {
    if (!urlMode || !dropShell) return;
    urlMode.classList.toggle('hidden', !on);
    dropShell.classList.toggle('hidden', on);
    if (toggleUrl) {
      toggleUrl.textContent = on ? 'Bumalik sa drag & drop' : 'Gamitin ang URL imbes na file';
    }
    if (on && ta && urlInput) {
      urlInput.value = ta.value;
      urlInput.focus();
    } else if (!on && ta && urlInput) {
      ta.value = urlInput.value;
      updateImagePreview(wrap);
    }
  }

  toggleUrl?.addEventListener('click', () => {
    const urlVisible = urlMode && !urlMode.classList.contains('hidden');
    setUrlMode(!urlVisible);
  });

  urlInput?.addEventListener('input', () => {
    if (ta) ta.value = urlInput.value;
    updateImagePreview(wrap);
  });

  const zone = dropShell;
  if (!zone || !fileInput) return;

  ;['dragenter', 'dragover'].forEach((ev) => {
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('border-emerald-500', 'bg-emerald-50/80');
    });
  });
  ;['dragleave', 'drop'].forEach((ev) => {
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('border-emerald-500', 'bg-emerald-50/80');
    });
  });
  zone.addEventListener('drop', (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (f) processImageFile(wrap, f);
  });
  zone.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('.browse-btn')) return;
    fileInput.click();
  });
  browseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (f) processImageFile(wrap, f);
    fileInput.value = '';
  });
}

function rowTemplate(image, caption) {
  const wrap = document.createElement('div');
  wrap.className = 'rounded-xl border border-slate-200 bg-slate-50 p-4';
  wrap.innerHTML = `
    <div class="flex flex-wrap gap-4 items-start">
      <div class="flex-1 min-w-[260px]">
        <label class="block text-[11px] font-medium text-slate-600">Larawan (PNG / JPG)</label>
        <div
          class="drop-shell mt-2 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 transition-colors hover:border-emerald-400 hover:bg-emerald-50/30"
          role="button"
          tabindex="0"
          aria-label="I-drag ang PNG o JPG dito"
        >
          <input type="file" class="page-file-input sr-only" accept="image/png,image/jpeg,image/webp" />
          <div class="drop-placeholder flex min-h-[100px] flex-col items-center justify-center gap-2 text-center">
            <svg class="h-10 w-10 text-emerald-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-slate-700">
              <span class="font-medium text-emerald-800">I-drag dito</span> ang PNG o JPG, o
              <button type="button" class="browse-btn font-semibold text-emerald-700 underline decoration-emerald-600/40 underline-offset-2 hover:text-emerald-900">pumili ng file</button>
            </p>
            <p class="text-[11px] text-slate-500">Tinatanggap: .png, .jpg, .jpeg, .webp</p>
          </div>
          <img class="page-preview mx-auto mt-2 hidden max-h-40 max-w-full rounded-lg object-contain shadow-md" alt="" />
        </div>
        <textarea class="page-image fixed left-0 top-0 -z-10 h-px w-px opacity-0" rows="1" aria-hidden="true"></textarea>
        <button type="button" class="toggle-url mt-2 text-xs font-medium text-emerald-700 underline hover:text-emerald-900">
          Gamitin ang URL imbes na file
        </button>
        <div class="url-mode mt-2 hidden">
          <input
            type="text"
            class="page-image-url w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="/assets/org-chart-1.png o https://..."
          />
        </div>
      </div>
      <div class="w-full sm:w-40">
        <label class="block text-[11px] font-medium text-slate-600">Caption</label>
        <input type="text" class="page-caption mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value="${escapeAttr(caption)}" placeholder="Page 1" />
      </div>
      <div class="flex items-end">
        <button type="button" class="remove-row rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700 hover:bg-red-50">Remove</button>
      </div>
    </div>
  `;
  const ta = wrap.querySelector('.page-image');
  if (ta) ta.value = typeof image === 'string' ? image : '';
  wireImageRow(wrap);
  updateImagePreview(wrap);
  if (image && typeof image === 'string' && image.length > 0 && !image.startsWith('data:')) {
    const urlInput = wrap.querySelector('.page-image-url');
    if (urlInput) urlInput.value = image;
  }
  wrap.querySelector('.remove-row')?.addEventListener('click', () => wrap.remove());
  return wrap;
}

function escapeAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function getFormData() {
  document.querySelectorAll('#pages-editor > div').forEach((wrap) => {
    const um = wrap.querySelector('.url-mode');
    const ui = wrap.querySelector('.page-image-url');
    const ta = wrap.querySelector('.page-image');
    if (um && !um.classList.contains('hidden') && ui && ta) ta.value = ui.value;
  });
  const root = document.getElementById('pages-editor');
  const rows = root?.querySelectorAll(':scope > div') || [];
  const pages = [];
  rows.forEach((row) => {
    const image = row.querySelector('.page-image')?.value?.trim() || '';
    const caption = row.querySelector('.page-caption')?.value?.trim() || '';
    if (image) pages.push({ image, caption: caption || 'Page' });
  });
  const pngEl = document.getElementById('field-show-png');
  return {
    pages,
    googleSlidesEmbedUrl: document.getElementById('field-slides-url')?.value?.trim() || '',
    googleSlidesCaption: document.getElementById('field-slides-caption')?.value?.trim() || '',
    showPngGallery: pngEl ? pngEl.checked : true,
  };
}

function fillForm(data) {
  const root = document.getElementById('pages-editor');
  if (!root) return;
  root.innerHTML = '';
  const pages = Array.isArray(data.pages) && data.pages.length ? data.pages : [{ image: '/assets/org-chart-1.png', caption: 'Page 1' }];
  pages.forEach((p) => {
    root.appendChild(rowTemplate(p.image, p.caption));
  });
  const u = document.getElementById('field-slides-url');
  const c = document.getElementById('field-slides-caption');
  const ch = document.getElementById('field-show-png');
  if (u) u.value = data.googleSlidesEmbedUrl || '';
  if (c) c.value = data.googleSlidesCaption || '';
  if (ch) ch.checked = data.showPngGallery !== false;
}

async function loadInitialForm() {
  if (!db) return;
  const dref = doc(db, DOC_PATH[0], DOC_PATH[1]);
  const snap = await getDoc(dref);
  if (snap.exists()) {
    fillForm(snap.data());
    return;
  }
  const res = await fetch('/org-chart-pages.json', { cache: 'no-store' });
  if (res.ok) {
    const j = await res.json();
    fillForm(j);
  } else {
    fillForm({ pages: [{ image: '/assets/org-chart-1.png', caption: 'Page 1' }] });
  }
}

async function loadOfflineForm() {
  try {
    const res = await fetch('/org-chart-pages.json', { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      if (typeof j.staffInstructions === 'string') staffInstructionsBackup = j.staffInstructions;
      fillForm(j);
    } else {
      fillForm({ pages: [{ image: '/assets/org-chart-1.png', caption: 'Page 1' }] });
    }
  } catch {
    fillForm({ pages: [{ image: '/assets/org-chart-1.png', caption: 'Page 1' }] });
  }
}

function saveOfflineDoc() {
  setStatus('Preparing file…');
  const payload = getFormData();
  if (!payload.pages.length) {
    setStatus('Magdagdag ng kahit isang pahina na may Image URL.', true);
    return;
  }
  const out = {
    googleSlidesEmbedUrl: payload.googleSlidesEmbedUrl,
    showPngGallery: payload.showPngGallery,
    pages: payload.pages,
    staffInstructions: staffInstructionsBackup,
    googleSlidesCaption: payload.googleSlidesCaption || '',
  };

  const json = JSON.stringify(out, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'org-chart-pages.json';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  setStatus(
    'Na-download ang org-chart-pages.json. Ilagay ito sa folder na public/ (palitan ang luma), tapos i-commit at i-deploy ang site.'
  );
}

async function saveDoc() {
  if (!db) return;
  setStatus('Saving…');
  const payload = getFormData();
  if (!payload.pages.length) {
    setStatus('Add at least one page with an image URL.', true);
    return;
  }
  try {
    const dref = doc(db, DOC_PATH[0], DOC_PATH[1]);
    await setDoc(dref, payload, { merge: true });
    setStatus('Saved. The public page will update automatically.');
  } catch (e) {
    setStatus(String(e?.message || e), true);
  }
}

function wireUi() {
  document.getElementById('btn-add-page')?.addEventListener('click', () => {
    document.getElementById('pages-editor')?.appendChild(rowTemplate('', ''));
  });

  document.getElementById('btn-save')?.addEventListener('click', () => {
    if (offlineMode) saveOfflineDoc();
    else saveDoc();
  });

  if (!offlineMode) {
    document.getElementById('btn-logout')?.addEventListener('click', () => signOut(auth));
  }
}

function wireLogin() {
  document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value || '';
    if (!email || !password) return;
    setStatus('Signing in…');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus('');
    } catch (err) {
      setStatus(err?.message || String(err), true);
    }
  });
}

function applyOfflineUi() {
  showEl('firebase-info', true);
  showEl('login-panel', false);
  showEl('editor-panel', true);
  const lo = document.getElementById('btn-logout');
  if (lo) lo.classList.add('hidden');
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.textContent = 'I-download ang org-chart-pages.json';
  const hint = document.getElementById('pages-hint');
  if (hint) {
    hint.textContent =
      'I-drag ang PNG/JPG sa box, o gamitin ang URL. Offline: ang drag ay naka-embed sa JSON (data URL); malaking larawan = malaking file. I-download ang JSON pagkatapos at i-deploy.';
  }
}

function main() {
  if (!initFirebase()) {
    offlineMode = true;
    applyOfflineUi();
    wireUi();
    loadOfflineForm().then(() => setStatus(''));
    return;
  }

  offlineMode = false;
  showEl('firebase-info', false);
  wireUi();
  wireLogin();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      showEl('login-panel', false);
      showEl('editor-panel', true);
      setStatus('Loading…');
      try {
        await loadInitialForm();
        setStatus('');
      } catch (e) {
        setStatus(String(e?.message || e), true);
      }
    } else {
      showEl('login-panel', true);
      showEl('editor-panel', false);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
