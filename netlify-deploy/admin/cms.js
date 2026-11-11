// Shared code for the Events CMS pages: API calls, small DOM helpers, toasts, dialogs and the
// media library (picker + uploads). Plain ES modules, no framework.

const FN = '/.netlify/functions/';

const ERROR_TEXT = {
  signed_out: 'Your session has ended. Sign in again to continue.',
  forbidden: "Your account doesn't have admin access.",
  bad_origin: 'That request was blocked for security reasons. Reload the page and try again.',
  not_found: "That event doesn't exist any more. Someone may have deleted it.",
  server_error: 'Something went wrong on the server. Try again in a moment.',
  method_not_allowed: 'That action isn’t supported.',
};

/** Calls a CMS function. Throws an Error with .status and .data (the JSON body) when it fails. */
export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(FN + path, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const e = new Error("Couldn't reach the server. Check your connection and try again.");
    e.status = 0;
    throw e;
  }
  const isJson = (res.headers.get('content-type') || '').includes('json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    const e = new Error((data && data.message) || ERROR_TEXT[data && data.error] || `Something went wrong (${res.status}).`);
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

export function loginUrl(returnTo = location.pathname + location.search) {
  return '/login.html?returnTo=' + encodeURIComponent(returnTo);
}

/** Builds an element. attrs: properties/attributes (on* = listeners); children: nodes or text. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'text') node.textContent = v;
    else if (k in node && typeof v !== 'string') node[k] = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) node.append(c.nodeType ? c : String(c));
  return node;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "2026-10-14" -> "14 October 2026" (the same format the site uses). */
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
}
export function formatWhen(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function formatSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function slugify(title) {
  return String(title || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
}

export const STATUS = {
  draft: 'Draft',
  published: 'Published',
  changed: 'Unpublished changes',
  unsaved: 'Unsaved changes',
};
export const badge = (status) => el('span', { class: `badge badge--${status}` }, STATUS[status] || status);

// ---------------------------------------------------------------------------
// Header + toasts
// ---------------------------------------------------------------------------

/** Shows who's signed in, and sends people without access to the login page. */
export async function initHeader() {
  const who = document.getElementById('cms-who');
  try {
    const s = await api('cms-session');
    if (who) who.textContent = `Signed in as ${s.email}`;
    return s;
  } catch (e) {
    if (e.status === 401) location.href = loginUrl();
    else if (who) who.textContent = e.message;
    throw e;
  }
}

let toastBox;
/** A short message at the bottom of the screen. Announced to screen readers. */
export function toast(message, { kind = 'info', action, timeout = 6000 } = {}) {
  if (!toastBox) {
    toastBox = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    document.body.append(toastBox);
  }
  const t = el('div', { class: `toast${kind === 'error' ? ' toast--error' : ''}` }, el('span', {}, message));
  const close = () => t.remove();
  if (action) t.append(el('button', { type: 'button', onclick: () => { close(); action.onClick(); } }, action.label));
  t.append(el('button', { type: 'button', 'aria-label': 'Dismiss', onclick: close }, '✕'));
  toastBox.append(t);
  if (timeout) setTimeout(close, kind === 'error' ? timeout * 2 : timeout);
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

/** A modal dialog shell. Returns { dialog, body, foot, close }. Removed from the page when closed. */
export function openDialog({ title, className = '' }) {
  const titleId = 'dlg-' + Math.random().toString(36).slice(2);
  const body = el('div', { class: 'dialog__body' });
  const foot = el('div', { class: 'dialog__foot' });
  const dialog = el('dialog', { class: className, 'aria-labelledby': titleId },
    el('div', { class: 'dialog' },
      el('div', { class: 'dialog__head' },
        el('h2', { id: titleId }, title),
        el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close', onclick: () => dialog.close() }, '✕')),
      body, foot));
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  return { dialog, body, foot, close: () => dialog.close() };
}

/**
 * Asks the user to confirm. With `typeToConfirm`, the confirm button only works once that
 * exact text has been typed (used for deleting). Resolves true/false.
 */
export function confirmDialog({ title, message, confirmLabel, danger = false, typeToConfirm }) {
  return new Promise((resolve) => {
    let ok = false;
    const { dialog, body, foot, close } = openDialog({ title, className: 'confirm-dialog' });
    for (const p of [].concat(message)) body.append(el('p', { style: 'margin:0' }, p));
    const confirm = el('button', { type: 'button', class: danger ? 'btn btn-danger' : 'btn btn-primary', onclick: () => { ok = true; close(); } }, confirmLabel);
    if (typeToConfirm) {
      const id = 'confirm-' + Math.random().toString(36).slice(2);
      const input = el('input', { id, type: 'text', autocomplete: 'off', spellcheck: 'false' });
      body.append(el('div', { class: 'field' }, el('label', { for: id }, `Type “${typeToConfirm}” to confirm`), input));
      const sync = () => { confirm.disabled = input.value.trim() !== typeToConfirm.trim(); };
      input.addEventListener('input', sync);
      sync();
      setTimeout(() => input.focus());
    }
    foot.append(el('button', { type: 'button', class: 'btn', onclick: close }, 'Cancel'), confirm);
    dialog.addEventListener('close', () => resolve(ok));
  });
}

// ---------------------------------------------------------------------------
// Media library
// ---------------------------------------------------------------------------

export const MAX_BYTES = 50 * 1024 * 1024;
const EXTS = {
  image: ['jpg', 'jpeg', 'png', 'webp'],
  video: ['mp4', 'webm', 'mov'],
  pdf: ['pdf'],
};
export const extOf = (name) => String(name || '').split('.').pop().toLowerCase();
export function typeOf(name) {
  const ext = extOf(name);
  return Object.keys(EXTS).find((t) => EXTS[t].includes(ext)) || 'other';
}
/** Which file types a picker accepts: 'image', 'video', 'media' (image or video) or 'any'. */
const ACCEPTS = { image: ['image'], video: ['video'], media: ['image', 'video'], any: ['image', 'video', 'pdf'] };
const acceptAttr = (kind) => ACCEPTS[kind].flatMap((t) => EXTS[t].map((e) => '.' + e)).join(',');

let mediaCache = null;
/** The bucket's files: [{ name, size, type, updated_at, used_by, thumb_url }]. Thumbnail links last 10 minutes. */
export async function listMedia({ fresh = false } = {}) {
  if (!mediaCache || fresh) mediaCache = (await api('cms-media')).files;
  return mediaCache;
}
export async function deleteMedia(name) {
  await api('cms-media?name=' + encodeURIComponent(name), { method: 'DELETE' });
  mediaCache = null;
}

/**
 * Uploads a file straight to Supabase Storage through a one-time signed URL. Returns the name
 * it was stored under (made unique, e.g. "photo-2.jpg"). onProgress gets 0..1.
 */
export async function uploadFile(file, onProgress) {
  if (file.size > MAX_BYTES) throw new Error(`“${file.name}” is ${formatSize(file.size)}. Files must be 50 MB or smaller.`);
  if (typeOf(file.name) === 'other') throw new Error(`“${file.name}” can't be uploaded. Use JPG, PNG, WebP, MP4, WebM, MOV or PDF files.`);
  const ticket = await api('cms-media', { method: 'POST', body: { name: file.name, size: file.size } });
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', ticket.upload_url);
    xhr.setRequestHeader('Content-Type', ticket.content_type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`The upload failed (${xhr.status}). Try again.`)));
    xhr.onerror = () => reject(new Error('The upload failed. Check your connection and try again.'));
    xhr.send(file);
  });
  mediaCache = null;
  return ticket.name;
}

/** A thumbnail for a file: the image itself, or a label for videos and PDFs. */
export function thumb(file, className) {
  const box = el('div', { class: className, 'aria-hidden': 'true' });
  if (file && file.thumb_url) box.append(el('img', { src: file.thumb_url, alt: '', loading: 'lazy' }));
  else box.textContent = file ? extOf(file.name).toUpperCase() : '—';
  return box;
}

/** "Used by: Event A (live), Event B" for a file. */
export function usageText(file) {
  if (!file.used_by.length) return 'Not used by any event';
  return 'Used by ' + file.used_by.map((u) => u.title + (u.live ? ' (live)' : '')).join(', ');
}

/** An upload button: a visually styled label around a hidden file input. */
export function uploadButton({ kind = 'any', label = 'Upload a file', multiple = false, onFiles }) {
  const id = 'up-' + Math.random().toString(36).slice(2);
  const input = el('input', { id, type: 'file', class: 'visually-hidden', accept: acceptAttr(kind), multiple });
  input.addEventListener('change', () => { if (input.files.length) onFiles([...input.files]); input.value = ''; });
  const lbl = el('label', { for: id, class: 'btn btn-sm', tabindex: '-1' }, label);
  // Keyboard users focus the (hidden) input; mirror its focus on the label.
  input.addEventListener('focus', () => lbl.style.outline = '3px solid var(--pa-red-accessible)');
  input.addEventListener('blur', () => lbl.style.outline = '');
  return el('span', {}, input, lbl);
}

/** Shows upload progress for a list of files, uploading them one by one. Returns stored names. */
export async function uploadWithProgress(files, container) {
  const names = [];
  for (const file of files) {
    const bar = el('progress', { max: 1, value: 0 });
    const row = el('div', { class: 'upload-progress' }, el('span', { class: 'small' }, `Uploading ${file.name}…`), bar);
    container.append(row);
    try {
      names.push(await uploadFile(file, (p) => { bar.value = p; }));
      row.remove();
    } catch (e) {
      row.replaceWith(el('div', { class: 'notice notice--error', role: 'alert' }, el('p', {}, e.message)));
    }
  }
  return names;
}

/**
 * The media picker. kind: 'image' | 'video' | 'media' | 'any'. With withAlt, it also asks for a
 * description (alt text, required) and a caption, for media inserted into Markdown.
 * Resolves { name, alt, caption } or null if cancelled.
 */
export function pickMedia({ kind = 'image', title = 'Choose a file', current = null, withAlt = false } = {}) {
  return new Promise(async (resolve) => {
    let result = null;
    const { dialog, body, foot, close } = openDialog({ title });
    dialog.addEventListener('close', () => resolve(result));

    const search = el('input', { type: 'search', placeholder: 'Search by file name', 'aria-label': 'Search files' });
    const progress = el('div', { class: 'upload-progress-list' });
    const grid = el('ul', { class: 'media-grid', role: 'radiogroup', 'aria-label': 'Files' });
    const status = el('p', { class: 'muted small', 'aria-live': 'polite' }, 'Loading files…');
    const tools = el('div', { class: 'media-tools' },
      uploadButton({ kind, label: 'Upload new', multiple: false, onFiles: async (files) => {
        const [name] = await uploadWithProgress(files, progress);
        if (name) { selected = name; await refresh(true); toast(`Uploaded ${name}`); }
      } }),
      search);
    body.append(tools, progress, status, grid);

    let altInput, capInput;
    if (withAlt) {
      altInput = el('input', { id: 'pick-alt', type: 'text', required: true });
      capInput = el('input', { id: 'pick-cap', type: 'text' });
      body.append(el('div', { class: 'grid-2' },
        el('div', { class: 'field' }, el('label', { for: 'pick-alt' }, 'Description', el('span', { class: 'req' }, 'required')),
          el('p', { class: 'hint' }, 'What the image or video shows, for people who can’t see it.'), altInput),
        el('div', { class: 'field' }, el('label', { for: 'pick-cap' }, 'Caption'), el('p', { class: 'hint' }, 'Optional. Shown under it.'), capInput)));
    }
    const error = el('p', { class: 'field-error', role: 'alert', hidden: true });
    const use = el('button', { type: 'button', class: 'btn btn-primary', disabled: true }, 'Use this file');
    foot.append(error, el('button', { type: 'button', class: 'btn', onclick: close }, 'Cancel'), use);

    let selected = current;
    let files = [];
    const allowed = ACCEPTS[kind];
    function render() {
      const q = search.value.trim().toLowerCase();
      const shown = files.filter((f) => allowed.includes(typeOf(f.name)) && (!q || f.name.toLowerCase().includes(q)));
      grid.replaceChildren(...shown.map((f) => {
        const input = el('input', { type: 'radio', name: 'pick', value: f.name, checked: f.name === selected, 'aria-label': f.name });
        input.addEventListener('change', () => { selected = f.name; use.disabled = false; });
        return el('li', {}, el('label', { class: 'media-card media-card--pick' },
          input, thumb(f, 'media-card__thumb'),
          el('span', { class: 'media-card__info' },
            el('span', { class: 'media-card__name' }, f.name),
            el('span', { class: 'muted' }, formatSize(f.size)))));
      }));
      status.textContent = shown.length ? '' : files.length ? 'No files match.' : 'No files yet. Upload one to get started.';
      use.disabled = !selected || !shown.some((f) => f.name === selected);
      const checked = grid.querySelector('input:checked');
      if (checked) checked.scrollIntoView({ block: 'nearest' });
    }
    async function refresh(fresh) {
      try { files = await listMedia({ fresh }); render(); }
      catch (e) { status.textContent = e.message; }
    }
    search.addEventListener('input', render);
    grid.addEventListener('dblclick', (e) => { if (e.target.closest('.media-card')) use.click(); });
    use.addEventListener('click', () => {
      if (withAlt && !altInput.value.trim()) {
        error.textContent = 'Add a description.'; error.hidden = false;
        altInput.setAttribute('aria-invalid', 'true'); altInput.focus();
        return;
      }
      result = { name: selected, alt: withAlt ? altInput.value.trim() : '', caption: withAlt ? capInput.value.trim() : '' };
      close();
    });
    await refresh(true);
  });
}
