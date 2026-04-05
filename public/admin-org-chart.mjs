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

function rowTemplate(image, caption) {
  const uploadCol = offlineMode
    ? ''
    : `
      <div>
        <label class="block text-[11px] font-medium text-slate-600">Upload PNG</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" class="page-file mt-1 text-xs" />
      </div>`;

  const wrap = document.createElement('div');
  wrap.className = 'rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2';
  wrap.innerHTML = `
    <div class="flex flex-wrap gap-2 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-[11px] font-medium text-slate-600">Image URL</label>
        <input type="text" class="page-image mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value="${escapeAttr(image)}" placeholder="/assets/org-chart-1.png" />
      </div>
      <div class="w-40">
        <label class="block text-[11px] font-medium text-slate-600">Caption</label>
        <input type="text" class="page-caption mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value="${escapeAttr(caption)}" placeholder="Page 1" />
      </div>
      ${uploadCol}
      <button type="button" class="remove-row rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700 hover:bg-red-50">Remove</button>
    </div>
  `;
  const fileInput = wrap.querySelector('.page-file');
  const urlInput = wrap.querySelector('.page-image');
  fileInput?.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    if (!f || !storage) {
      if (!storage) setStatus('Storage not configured (add storageBucket to firebase-config).', true);
      return;
    }
    setStatus('Uploading…');
    try {
      const path = `org-chart/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const r = ref(storage, path);
      await uploadBytes(r, f);
      const url = await getDownloadURL(r);
      urlInput.value = url;
      setStatus('Upload complete. Click Save to publish.');
    } catch (e) {
      setStatus(String(e?.message || e), true);
    }
  });
  wrap.querySelector('.remove-row')?.addEventListener('click', () => {
    wrap.remove();
  });
  return wrap;
}

function escapeAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function getFormData() {
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
      'Offline: maglagay ng URL ng larawan (hal. /assets/org-chart-1.png). I-replace ang PNG sa public/assets sa parehong file name, tapos i-download ang JSON at i-deploy.';
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
