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
  'Update this file via the staff web editor or replace it in the repository, then deploy.';

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

function revokeRowBlobPreview(wrap) {
  const u = wrap._previewBlobUrl;
  if (u) {
    try {
      URL.revokeObjectURL(u);
    } catch (_) {}
    wrap._previewBlobUrl = undefined;
  }
}

function showInstantImagePreview(wrap, file) {
  revokeRowBlobPreview(wrap);
  const blobUrl = URL.createObjectURL(file);
  wrap._previewBlobUrl = blobUrl;
  const img = wrap.querySelector('.page-preview');
  const placeholder = wrap.querySelector('.drop-placeholder');
  if (img) {
    img.src = blobUrl;
    img.classList.remove('hidden');
    img.alt = 'Preview';
    placeholder?.classList.add('hidden');
  }
}

async function processImageFile(wrap, file) {
  if (!file || !/^image\/(png|jpeg|webp)$/i.test(file.type)) {
    setStatus('Only PNG, JPG, or WebP images are accepted.', true);
    return;
  }
  const ta = wrap.querySelector('.page-image');
  if (!ta) return;

  showInstantImagePreview(wrap, file);

  if (storage && !offlineMode) {
    setStatus('Uploading…');
    try {
      const path = `org-chart/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      revokeRowBlobPreview(wrap);
      ta.value = url;
      wrap.querySelector('.url-mode')?.classList.add('hidden');
      wrap.querySelector('.drop-shell')?.classList.remove('hidden');
      updateImagePreview(wrap);
      setStatus('Upload complete. Click Save to publish.');
    } catch (e) {
      revokeRowBlobPreview(wrap);
      setStatus(String(e?.message || e), true);
      updateImagePreview(wrap);
    }
    return;
  }

  setStatus('Processing image…');
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result === 'string') {
      revokeRowBlobPreview(wrap);
      ta.value = result;
      wrap.querySelector('.url-mode')?.classList.add('hidden');
      wrap.querySelector('.drop-shell')?.classList.remove('hidden');
      const img = wrap.querySelector('.page-preview');
      if (img) {
        img.src = result;
        img.classList.remove('hidden');
      }
      wrap.querySelector('.drop-placeholder')?.classList.add('hidden');
      updateImagePreview(wrap);
      setStatus(
        offlineMode
          ? 'Image embedded as a data URL. Download the JSON file and deploy. Large images produce a large JSON file.'
          : ''
      );
    }
  };
  reader.onerror = () => {
    revokeRowBlobPreview(wrap);
    setStatus('Could not read the selected file.', true);
    updateImagePreview(wrap);
  };
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
      toggleUrl.textContent = on ? 'Back to drag and drop' : 'Enter image URL instead';
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
        <label class="block text-[11px] font-medium text-slate-600">Image (PNG / JPG)</label>
        <div
          class="drop-shell mt-2 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 transition-colors hover:border-emerald-400 hover:bg-emerald-50/30"
          role="button"
          tabindex="0"
          aria-label="Drop a PNG or JPG image here"
        >
          <input type="file" class="page-file-input sr-only" accept="image/png,image/jpeg,image/webp" />
          <div class="drop-placeholder flex min-h-[100px] flex-col items-center justify-center gap-2 text-center">
            <svg class="h-10 w-10 text-emerald-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-slate-700">
              <span class="font-medium text-emerald-800">Drag and drop</span> a PNG or JPG here, or
              <button type="button" class="browse-btn font-semibold text-emerald-700 underline decoration-emerald-600/40 underline-offset-2 hover:text-emerald-900">browse files</button>
            </p>
            <p class="text-[11px] text-slate-500">Accepted: .png, .jpg, .jpeg, .webp</p>
          </div>
          <img class="page-preview mx-auto mt-2 hidden max-h-40 max-w-full rounded-lg object-contain shadow-md" alt="" />
        </div>
        <textarea class="page-image sr-only" rows="1" aria-label="Image URL or embedded data"></textarea>
        <button type="button" class="toggle-url mt-2 text-xs font-medium text-emerald-700 underline hover:text-emerald-900">
          Enter image URL instead
        </button>
        <div class="url-mode mt-2 hidden">
          <input
            type="text"
            class="page-image-url w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="/assets/org-chart-1.png or https://…"
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
  wrap.querySelector('.remove-row')?.addEventListener('click', () => {
    revokeRowBlobPreview(wrap);
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
    setStatus('Add at least one page with an image.', true);
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
    'Downloaded org-chart-pages.json. Replace the file under public/ in your project, then commit and deploy.'
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
  const editorPanel = document.getElementById('editor-panel');
  editorPanel?.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (!t.closest('#btn-add-page')) return;
    e.preventDefault();
    e.stopPropagation();
    const pe = document.getElementById('pages-editor');
    if (!pe) return;
    try {
      pe.appendChild(rowTemplate('', ''));
      setStatus('New page added.');
    } catch (err) {
      console.error(err);
      setStatus(err instanceof Error ? err.message : 'Could not add a new page.', true);
    }
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
  showEl('login-panel', false);
  showEl('editor-panel', true);
  const lo = document.getElementById('btn-logout');
  if (lo) lo.classList.add('hidden');
  const saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.textContent = 'Download org-chart-pages.json';
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
