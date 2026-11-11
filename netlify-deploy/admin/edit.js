// Event editor (/admin/edit.html, ?id=<uuid> or ?slug=<slug>; no parameter = new event).
import {
  api, el, badge, formatDate, formatWhen, formatSize, slugify, initHeader, toast, confirmDialog, openDialog,
  listMedia, pickMedia, thumb, loginUrl, imageAdvice, whenImageLoads, typeOf,
} from './cms.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const form = $('#editor');
const messages = $('#messages');
const btnSave = $('#btn-save');
const btnPublish = $('#btn-publish');
const btnPreview = $('#btn-preview');
const btnUnpublish = $('#btn-unpublish');
const btnDelete = $('#btn-delete');

const TEXT_FIELDS = ['title', 'slug', 'kicker', 'event_date', 'date_label', 'time_text', 'location', 'format',
  'blurb', 'image_alt', 'image_caption', 'video_caption', 'overview_md', 'writeup_md'];
const MEDIA_FIELDS = ['image', 'video', 'video_poster', 'card_image'];
const ROWS = {
  agenda: { noun: 'agenda item', cols: '7rem 7rem minmax(0,1fr)', fields: [
    { k: 'start', label: 'Start', ph: '16:00' }, { k: 'end', label: 'End', ph: 'Optional' }, { k: 'label', label: 'What happens', ph: 'e.g. Welcome and introductions' }] },
  speakers: { noun: 'speaker', cols: '1fr 1fr', fields: [
    { k: 'name', label: 'Name' }, { k: 'role', label: 'Role and organisation' }] },
  themes: { noun: 'theme', text: true, fields: [{ k: '', label: 'Theme' }] },
  insights: { noun: 'insight', text: true, fields: [{ k: '', label: 'Insight' }] },
  downloads: { noun: 'material', cols: '1fr', file: true, fields: [{ k: 'label', label: 'Label', ph: 'e.g. Event slides' }] },
};

let current = null;          // the event as the server last returned it (null = not saved yet)
let rows = {};               // row field -> array of values
let media = {};              // media field -> file name or null
let mediaFiles = new Map();  // file name -> library entry (thumbnail etc.)
let mediaLoaded = false;
let snapshot = '';           // the form as last loaded/saved, to detect unsaved changes
let slugTouched = false;
let busy = false;
let leaving = false;

// ---------------------------------------------------------------------------
// Reading and filling the form
// ---------------------------------------------------------------------------

function collect() {
  const ev = {};
  for (const f of TEXT_FIELDS) ev[f] = form.elements[f].value;
  ev.kind = form.elements.kind.value || 'next';
  const so = form.elements.sort_order.value.trim();
  ev.sort_order = so === '' ? 0 : Number(so);
  for (const f of MEDIA_FIELDS) ev[f] = media[f] || null;
  ev.agenda = rows.agenda.map((r) => ({ ...r }));
  ev.speakers = rows.speakers.map((r) => ({ ...r }));
  ev.themes = [...rows.themes];
  ev.insights = [...rows.insights];
  ev.downloads = rows.downloads.map((d) => (d.file ? { label: d.label, file: d.file } : { label: d.label }));
  return ev;
}

function fill(ev) {
  for (const f of TEXT_FIELDS) form.elements[f].value = ev[f] ?? '';
  form.elements.kind.value = ev.kind || 'next';
  form.elements.sort_order.value = ev.sort_order ?? 0;
  for (const f of MEDIA_FIELDS) media[f] = ev[f] || null;
  rows = {
    agenda: (ev.agenda || []).map((r) => ({ start: r.start || '', end: r.end || '', label: r.label || '' })),
    speakers: (ev.speakers || []).map((r) => ({ name: r.name || '', role: r.role || '' })),
    themes: [...(ev.themes || [])],
    insights: [...(ev.insights || [])],
    downloads: (ev.downloads || []).map((d) => ({ label: d.label || '', file: d.file || null })),
  };
  for (const k of Object.keys(ROWS)) renderRows(k);
  for (const f of MEDIA_FIELDS) renderMedia(f);
  const slugLocked = Boolean(current && current.first_published_at);
  form.elements.slug.readOnly = slugLocked;
  $('#slug-hint').textContent = slugLocked
    ? 'This event has been published, so its web address is fixed. Links to it keep working.'
    : 'Made from the title. Lowercase letters, numbers and hyphens. It can’t change after the event is published.';
  slugTouched = slugLocked || (Boolean(ev.slug) && ev.slug !== slugify(ev.title));
  updateHints();
}

const isDirty = () => JSON.stringify(collect()) !== snapshot;
const markSaved = () => { snapshot = JSON.stringify(collect()); };

/** Today's date where the editor is (YYYY-MM-DD). */
function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Warnings when the event type doesn't match the date or the label above the title. */
export function kindWarnings({ kind, event_date: date, kicker }, now = today()) {
  const w = [];
  if (kind === 'next' && date && date < now) {
    w.push(`The date (${formatDate(date)}) has passed, but the event is marked as upcoming, so the site still shows it as the next event with a registration form. If it has happened, change the event type to Past and add a write-up.`);
  } else if (kind === 'past' && date && date > now) {
    w.push(`The event is marked as past, but its date (${formatDate(date)}) is in the future, so it will be listed first among past events. If it hasn’t happened yet, change the event type to Upcoming.`);
  }
  if (kicker && kind === 'past' && /\b(next|upcoming|coming soon|register)\b/i.test(kicker)) {
    w.push(`The label above the title says “${kicker}”. Clear it to use “Past event”, or change it.`);
  } else if (kicker && kind === 'next' && /\b(past|previous|recap|write-?up)\b/i.test(kicker)) {
    w.push(`The label above the title says “${kicker}”. Clear it to use “Next event”, or change it.`);
  }
  return w;
}

function updateHints() {
  const kind = form.elements.kind.value;
  form.elements.kicker.placeholder = kind === 'past' ? 'Past event' : 'Next event';
  form.elements.date_label.placeholder = formatDate(form.elements.event_date.value) || 'e.g. TBC';
  const warnings = kindWarnings({ kind, event_date: form.elements.event_date.value, kicker: form.elements.kicker.value.trim() });
  const box = $('#kind-warnings');
  box.replaceChildren(...warnings.map((t) => el('p', {}, t)));
  box.hidden = !warnings.length;
  for (const n of $$('[data-when-upcoming]')) n.hidden = kind !== 'next';
}

function updateStatus() {
  const status = current ? current.status : 'draft';
  const dirty = isDirty();
  $('#status-badge').replaceChildren(badge(status), dirty ? ' ' : '', dirty ? badge('unsaved') : '');
  let text = current ? `Saved ${formatWhen(current.updated_at)}` : 'Not saved yet';
  if (current && current.published_at) text += ` · Published ${formatWhen(current.published_at)}`;
  $('#status-text').textContent = busy || text;
  btnSave.textContent = status === 'draft' ? 'Save draft' : 'Save changes';
  btnSave.disabled = busy || (Boolean(current) && !dirty);
  btnPublish.textContent = status === 'draft' ? 'Publish' : status === 'published' && !dirty ? 'Published' : 'Publish changes';
  btnPublish.disabled = busy || (status === 'published' && !dirty);
  btnPreview.disabled = Boolean(busy);
  btnUnpublish.hidden = !(current && current.published);
  btnDelete.disabled = Boolean(busy);
  $('#danger-zone').hidden = !current;
  const title = current ? 'Edit event' : 'New event';
  $('#page-title').textContent = title;
  document.title = `${current ? current.title : title} — NewCo Community CMS`;
}

function setBusy(label) {
  busy = label || false;
  updateStatus();
}

function onChange(e) {
  // Editing a field clears its error message.
  const t = e && e.target;
  if (t && t.getAttribute && t.getAttribute('aria-invalid') === 'true') {
    t.removeAttribute('aria-invalid');
    for (const id of (t.getAttribute('aria-describedby') || '').split(' ').filter((x) => x.startsWith('err-'))) document.getElementById(id)?.remove();
    const rest = (t.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && !x.startsWith('err-')).join(' ');
    if (rest) t.setAttribute('aria-describedby', rest); else t.removeAttribute('aria-describedby');
  }
  updateStatus();
}

// ---------------------------------------------------------------------------
// Repeating rows (agenda, speakers, themes, insights, materials)
// ---------------------------------------------------------------------------

function blankRow(def) {
  if (def.text) return '';
  const r = Object.fromEntries(def.fields.map((f) => [f.k, '']));
  if (def.file) r.file = null;
  return r;
}

function renderRows(key, focusId) {
  const def = ROWS[key];
  const box = $(`[data-rows="${key}"]`);
  const list = el('div', { class: 'rows', dataset: { field: key } });
  const items = rows[key];
  items.forEach((r, i) => {
    const n = i + 1;
    const fields = el('div', { class: 'row__fields', style: `--cols:${def.cols || '1fr'}` });
    for (const fd of def.fields) {
      const id = `r-${key}-${i}-${fd.k || 'text'}`;
      const input = el('input', {
        type: 'text', id, value: def.text ? r : r[fd.k], placeholder: fd.ph || '',
        maxlength: def.text ? 500 : 300, dataset: { field: def.text ? `${key}.${i}` : `${key}.${i}.${fd.k}` },
      });
      input.addEventListener('input', () => {
        if (def.text) rows[key][i] = input.value; else rows[key][i][fd.k] = input.value;
        onChange();
      });
      fields.append(el('div', { class: 'field' },
        el('label', { for: id }, fd.label, el('span', { class: 'visually-hidden' }, ` (${def.noun} ${n})`)), input));
    }
    if (def.file) {
      const chooseId = `r-${key}-${i}-file`;
      const choose = el('button', {
        type: 'button', class: 'btn btn-sm', id: chooseId, dataset: { field: `${key}.${i}.file` },
        onclick: async () => {
          const res = await pickMedia({ kind: 'any', title: 'Attach a file', current: r.file });
          if (res) { rows[key][i].file = res.name; renderRows(key, chooseId); onChange(); }
        },
      }, r.file ? 'Replace file' : 'Attach file');
      const remove = r.file && el('button', {
        type: 'button', class: 'btn btn-sm btn-quiet',
        onclick: () => { rows[key][i].file = null; renderRows(key, chooseId); onChange(); },
      }, 'Remove file', el('span', { class: 'visually-hidden' }, ` from ${def.noun} ${n}`));
      fields.append(el('div', { class: 'field' },
        el('span', { class: 'label', style: 'font-size:13px;color:var(--pa-grey-04)' }, 'File'),
        el('div', { class: 'media-row' },
          el('span', { class: 'media-row__name' }, r.file || el('span', { class: 'muted' }, 'No file (listed without a link)')),
          choose, remove)));
    }
    const move = (to, btnId) => {
      const [item] = rows[key].splice(i, 1);
      rows[key].splice(to, 0, item);
      renderRows(key, btnId(to));
      onChange();
    };
    const upId = (j) => `rb-${key}-${j}-up`, downId = (j) => `rb-${key}-${j}-down`;
    const controls = el('div', { class: 'row__controls' },
      el('button', { type: 'button', class: 'icon-btn', id: upId(i), disabled: i === 0, 'aria-label': `Move ${def.noun} ${n} up`, title: 'Move up',
        onclick: () => move(i - 1, (j) => (j === 0 ? downId(j) : upId(j))) }, '↑'),
      el('button', { type: 'button', class: 'icon-btn', id: downId(i), disabled: i === items.length - 1, 'aria-label': `Move ${def.noun} ${n} down`, title: 'Move down',
        onclick: () => move(i + 1, (j) => (j === items.length - 1 ? upId(j) : downId(j))) }, '↓'),
      el('button', { type: 'button', class: 'icon-btn', 'aria-label': `Remove ${def.noun} ${n}`, title: 'Remove',
        onclick: () => {
          rows[key].splice(i, 1);
          const next = rows[key].length ? `r-${key}-${Math.min(i, rows[key].length - 1)}-${def.fields[0].k || 'text'}` : `add-${key}`;
          renderRows(key, next);
          onChange();
        } }, '✕'));
    list.append(el('div', { class: 'row' }, fields, controls));
  });
  if (!items.length) list.append(el('p', { class: 'rows-empty' }, `No ${def.noun}s yet.`));
  const add = el('button', {
    type: 'button', class: 'btn btn-sm', id: `add-${key}`,
    onclick: () => {
      rows[key].push(blankRow(def));
      renderRows(key, `r-${key}-${rows[key].length - 1}-${def.fields[0].k || 'text'}`);
      onChange();
    },
  }, `Add ${def.noun}`);
  box.replaceChildren(list, el('div', {}, add));
  if (focusId) document.getElementById(focusId)?.focus();
}

// ---------------------------------------------------------------------------
// Media fields (main image, video, cover image, card image)
// ---------------------------------------------------------------------------

async function refreshMediaIndex() {
  try {
    const files = await listMedia({ fresh: true });
    mediaFiles = new Map(files.map((f) => [f.name, f]));
    mediaLoaded = true;
  } catch (e) {
    toast(`Couldn’t load the media library: ${e.message}`, { kind: 'error' });
  }
}

const MEDIA_TITLES = { image: 'Choose the main image', video: 'Choose a video', video_poster: 'Choose a cover image for the video', card_image: 'Choose the card image' };

function renderMedia(field, focus) {
  const box = $(`[data-media="${field}"]`);
  const kind = box.dataset.kind;
  const name = media[field];
  const file = name ? mediaFiles.get(name) : null;
  const missing = name && mediaLoaded && !file;
  const choose = el('button', {
    type: 'button', class: 'btn btn-sm', id: `m-${field}`, 'aria-describedby': box.dataset.labelledby,
    onclick: async () => {
      const res = await pickMedia({ kind, title: MEDIA_TITLES[field], current: name });
      if (!res) return;
      media[field] = res.name;
      if (!mediaFiles.has(res.name)) await refreshMediaIndex();
      renderMedia(field, true);
      onChange();
    },
  }, name ? 'Replace' : 'Choose');
  const remove = name && el('button', {
    type: 'button', class: 'btn btn-sm btn-quiet', 'aria-describedby': box.dataset.labelledby,
    onclick: () => { media[field] = null; renderMedia(field, true); onChange(); },
  }, 'Remove');
  const thumbBox = thumb(file || (name ? { name } : null), 'media-field__thumb');
  const details = el('p', { class: 'hint', 'aria-live': 'polite' });
  const advice = el('ul', { class: 'media-advice' });
  box.replaceChildren(el('div', { class: 'media-field', role: 'group', 'aria-labelledby': box.dataset.labelledby, dataset: { field } },
    thumbBox,
    el('div', { class: 'media-field__name' },
      name || el('span', { class: 'muted' }, 'None chosen'),
      details,
      missing && el('p', { class: 'field-error' }, 'This file isn’t in the media library any more. Choose another.')),
    el('div', { class: 'media-field__actions' }, choose, remove)),
    advice);
  // Size and shape advice once the image has loaded (it's the full image, so these are its real pixels).
  if (name && typeOf(name) === 'image') {
    whenImageLoads(thumbBox, (w, h) => {
      details.textContent = `${w} × ${h} pixels${file && file.size ? ` · ${formatSize(file.size)}` : ''}`;
      const tips = imageAdvice(w, h, field === 'card_image' ? 'card' : 'hero');
      advice.replaceChildren(...tips.map((t) => el('li', {}, t)));
    });
  }
  if (focus) document.getElementById(`m-${field}`).focus();
}

// ---------------------------------------------------------------------------
// Markdown editors
// ---------------------------------------------------------------------------

function replaceSelection(ta, text, selStart, selEnd) {
  ta.focus();
  // execCommand keeps the browser's undo history; fall back to setRangeText.
  let ok = false;
  try { ok = document.execCommand('insertText', false, text); } catch { ok = false; }
  if (!ok) {
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (selStart != null) ta.setSelectionRange(selStart, selEnd);
}

function wrap(ta, before, after, placeholder) {
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.slice(s, e) || placeholder;
  replaceSelection(ta, before + sel + after, s + before.length, s + before.length + sel.length);
}

function prefixLines(ta, prefix) {
  const v = ta.value;
  const start = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let end = v.indexOf('\n', ta.selectionEnd);
  if (end === -1) end = v.length;
  const lines = v.slice(start, end).split('\n');
  const out = lines.map((l, i) => (typeof prefix === 'function' ? prefix(i + 1) : prefix) + l.replace(/^(#{1,6} |[-*] |\d+\. |> )/, '')).join('\n');
  ta.setSelectionRange(start, end);
  replaceSelection(ta, out, start, start + out.length);
}

function link(ta) {
  const s = ta.selectionStart, e = ta.selectionEnd;
  const label = ta.value.slice(s, e) || 'link text';
  const text = `[${label}](https://)`;
  const urlAt = s + label.length + 3;
  replaceSelection(ta, text, urlAt, urlAt + 'https://'.length);
}

async function insertMedia(ta) {
  const s = ta.selectionStart, e = ta.selectionEnd;
  const res = await pickMedia({ kind: 'media', withAlt: true, title: 'Insert an image or video' });
  if (!res) { ta.focus(); return; }
  const alt = res.alt.replace(/[[\]\n]/g, ' ').trim();
  const cap = res.caption.replace(/["\n]/g, (c) => (c === '"' ? '”' : ' ')).trim();
  const md = `![${alt}](<${res.name}>${cap ? ` "${cap}"` : ''})`;
  const before = ta.value.slice(0, s);
  const lead = !before || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const after = ta.value.slice(e).startsWith('\n\n') ? '' : '\n\n';
  ta.focus();
  ta.setSelectionRange(s, e);
  replaceSelection(ta, lead + md + after);
  if (!mediaFiles.has(res.name)) refreshMediaIndex();
}

function buildMarkdownEditor(container) {
  const name = container.dataset.md;
  const label = container.dataset.label;
  const id = `f-${name}`;
  const ta = el('textarea', { id, name, class: 'md', spellcheck: 'true', 'aria-label': `${label} (Markdown)`, dataset: { field: name } });
  const tools = [
    ['B', 'Bold', () => wrap(ta, '**', '**', 'bold text'), 'font-weight:700'],
    ['I', 'Italic', () => wrap(ta, '_', '_', 'italic text'), 'font-style:italic'],
    null,
    ['Heading', 'Heading', () => prefixLines(ta, '## ')],
    ['Subheading', 'Subheading', () => prefixLines(ta, '### ')],
    null,
    ['• List', 'Bulleted list', () => prefixLines(ta, '- ')],
    ['1. List', 'Numbered list', () => prefixLines(ta, (n) => `${n}. `)],
    ['Quote', 'Quote', () => prefixLines(ta, '> ')],
    ['Link', 'Link', () => link(ta)],
    null,
    ['Insert image or video', 'Insert image or video', () => insertMedia(ta)],
  ];
  const toolbar = el('div', { class: 'md-toolbar', role: 'toolbar', 'aria-label': `${label} formatting`, 'aria-controls': id },
    tools.map((t) => (t
      ? el('button', { type: 'button', title: t[1], 'aria-label': t[0] === t[1] ? null : t[1], style: t[3] || null, onclick: t[2] }, t[0])
      : el('span', { class: 'sep', 'aria-hidden': 'true' }))));
  ta.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { e.preventDefault(); wrap(ta, '**', '**', 'bold text'); }
    else if (k === 'i') { e.preventDefault(); wrap(ta, '_', '_', 'italic text'); }
    else if (k === 'k') { e.preventDefault(); link(ta); }
  });
  ta.addEventListener('input', onChange);
  container.replaceChildren(el('div', { class: 'md-editor' }, toolbar, ta));
}

// ---------------------------------------------------------------------------
// Errors and notices
// ---------------------------------------------------------------------------

function clearErrors() {
  $$('[data-error-for]').forEach((n) => n.remove());
  $$('[aria-invalid="true"]', form).forEach((n) => {
    n.removeAttribute('aria-invalid');
    const d = (n.getAttribute('aria-describedby') || '').split(' ').filter((x) => !x.startsWith('err-')).join(' ');
    if (d) n.setAttribute('aria-describedby', d); else n.removeAttribute('aria-describedby');
  });
  messages.replaceChildren();
}

function findField(field) {
  if (!field) return null;
  const parts = field.split('.');
  for (let i = parts.length; i > 0; i--) {
    const node = form.querySelector(`[data-field="${CSS.escape(parts.slice(0, i).join('.'))}"]`);
    if (node) return node;
  }
  return null;
}
const focusable = (node) => (node.matches('input, textarea, select, button') ? node : node.querySelector('input, textarea, select, button')) || node;

function showErrors(errors, heading) {
  clearErrors();
  const items = errors.map((err, i) => {
    const node = findField(err.field);
    if (!node) return el('li', {}, err.message);
    const target = focusable(node);
    const errId = `err-${i}`;
    const msg = el('p', { class: 'field-error', id: errId, dataset: { errorFor: err.field } }, err.message);
    // Put the message after the whole control (the slug prefix box, the Markdown editor, a row's input).
    const anchor = node.closest('.prefix, .md-editor') || (node.matches('input, textarea') ? node : null) || node;
    anchor.after(msg);
    if (target.matches('input, textarea, select')) {
      target.setAttribute('aria-invalid', 'true');
      target.setAttribute('aria-describedby', `${target.getAttribute('aria-describedby') || ''} ${errId}`.trim());
    }
    return el('li', {}, el('a', { href: `#${target.id || ''}`, onclick: (e) => { e.preventDefault(); target.focus(); target.scrollIntoView({ block: 'center' }); } }, err.message));
  });
  const box = el('div', { class: 'notice notice--error', role: 'alert', tabindex: '-1' }, el('h2', {}, heading), el('ul', {}, items));
  messages.replaceChildren(box);
  box.focus();
}

function notice(kind, title, text, ...extra) {
  const box = el('div', { class: `notice notice--${kind}`, role: kind === 'error' ? 'alert' : 'status', tabindex: '-1' },
    el('h2', {}, title), text && el('p', {}, text), ...extra);
  messages.replaceChildren(box);
  box.focus();
  return box;
}

function handleError(e, heading) {
  const d = e.data || {};
  if (e.status === 401) {
    notice('warn', 'Your session has ended', 'Nothing was lost on this page, but it wasn’t saved. Sign in again in a new tab, then come back here and try again.',
      el('a', { class: 'btn', href: loginUrl('/admin/'), target: '_blank', rel: 'noopener' }, 'Sign in (opens a new tab)'));
  } else if (d.error === 'conflict') {
    notice('warn', 'This event changed after you opened it', `${d.message || 'It was saved somewhere else after you opened it.'} Your changes haven’t been saved yet.`,
      el('div', { class: 'media-row' },
        d.event && el('button', { type: 'button', class: 'btn', onclick: () => { current = d.event; fill(current); markSaved(); clearErrors(); updateStatus(); toast('Loaded the latest version.'); } }, 'Load their version (discard mine)'),
        d.event && el('button', { type: 'button', class: 'btn', onclick: () => { current = { ...current, updated_at: d.event.updated_at }; clearErrors(); save(); } }, 'Save mine over theirs'),
        !d.event && el('button', { type: 'button', class: 'btn', onclick: () => location.reload() }, 'Reload')));
  } else if (Array.isArray(d.errors) && d.errors.length) {
    showErrors(d.errors, heading);
  } else {
    notice('error', heading, e.message);
  }
}

function buildResult(build, done) {
  const live = current && el('a', { class: 'btn', href: `/events/${current.slug}.html`, target: '_blank', rel: 'noopener' }, 'View the live page (opens a new tab)');
  if (build === 'started') {
    notice('ok', done, 'The live site updates in about 2 minutes.', done.startsWith('Published') ? live : null);
  } else if (build === 'failed') {
    notice('warn', `${done}, but the site didn’t start updating`, 'Your change is saved. Try updating the site again.',
      el('button', { type: 'button', class: 'btn', onclick: rebuild }, 'Update the site'));
  } else if (build === 'not_configured') {
    notice('warn', done, 'This copy of the site has no build hook, so the live site won’t update.');
  } else {
    notice('ok', done, '');
  }
}

async function rebuild() {
  try { const r = await api('cms-publish', { method: 'POST', body: { action: 'rebuild' } }); buildResult(r.build, 'Site update started'); }
  catch (e) { handleError(e, 'The site couldn’t be updated'); }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function rememberFocus() {
  const a = document.activeElement;
  return a && a.id ? { id: a.id, start: a.selectionStart, end: a.selectionEnd } : null;
}
function restoreFocus(f) {
  const n = f && document.getElementById(f.id);
  if (!n) return;
  n.focus({ preventScroll: true });
  if (f.start != null && n.setSelectionRange) try { n.setSelectionRange(f.start, f.end); } catch { /* not a text input */ }
}

async function save({ quiet = false } = {}) {
  if (busy) return false;
  clearErrors();
  const ev = collect();
  if (!ev.title.trim()) {
    showErrors([{ field: 'title', message: 'Add a title before saving.' }], 'This event can’t be saved yet');
    return false;
  }
  setBusy('Saving…');
  const sent = JSON.stringify(ev);
  try {
    const r = current
      ? await api(`cms-events?id=${encodeURIComponent(current.id)}`, { method: 'PUT', body: { event: ev, updated_at: current.updated_at } })
      : await api('cms-events', { method: 'POST', body: { event: ev } });
    const isNew = !current;
    current = r.event;
    if (isNew) history.replaceState(null, '', `?id=${encodeURIComponent(current.id)}`);
    if (JSON.stringify(collect()) === sent) {
      // Show what the server stored (e.g. the generated web address), keeping the cursor.
      const f = rememberFocus();
      fill(current);
      restoreFocus(f);
      markSaved();
    } else {
      snapshot = sent; // the user kept typing while saving; those edits are still unsaved
    }
    if (!quiet) toast(current.status === 'draft' ? 'Draft saved.' : 'Changes saved. They aren’t live until you publish them.');
    return true;
  } catch (e) {
    handleError(e, 'This event couldn’t be saved');
    return false;
  } finally {
    setBusy(false);
  }
}

async function publish() {
  if (busy) return;
  if (!current || isDirty()) { if (!(await save({ quiet: true }))) return; }
  setBusy('Publishing…');
  try {
    const r = await api('cms-publish', { method: 'POST', body: { id: current.id, action: 'publish', updated_at: current.updated_at } });
    current = r.event;
    fill(current);
    markSaved();
    buildResult(r.build, 'Published');
  } catch (e) {
    handleError(e, 'This event can’t be published yet');
  } finally {
    setBusy(false);
  }
}

async function unpublish() {
  const ok = await confirmDialog({
    title: 'Unpublish this event?',
    message: ['The event page and its card will be removed from the site. The event stays here as a draft, so you can publish it again later.'],
    confirmLabel: 'Unpublish',
  });
  if (!ok) return;
  setBusy('Unpublishing…');
  try {
    const r = await api('cms-publish', { method: 'POST', body: { id: current.id, action: 'unpublish' } });
    current = r.event;
    fill(current);
    markSaved();
    buildResult(r.build, 'Unpublished');
  } catch (e) {
    handleError(e, 'This event couldn’t be unpublished');
  } finally {
    setBusy(false);
  }
}

async function remove() {
  const live = Boolean(current.published);
  const ok = await confirmDialog({
    title: 'Delete this event?',
    message: [
      live ? 'It’s on the live site now and will be removed from it.' : 'It isn’t on the live site.',
      'Deleting can’t be undone. Its media files stay in the media library.',
    ],
    confirmLabel: 'Delete event', danger: true, typeToConfirm: current.title,
  });
  if (!ok) return;
  setBusy('Deleting…');
  try {
    const r = await api(`cms-events?id=${encodeURIComponent(current.id)}`, { method: 'DELETE' });
    try {
      sessionStorage.setItem('cms-flash', `Deleted “${current.title}”.` + (r.build === 'started' ? ' The live site updates in about 2 minutes.' : ''));
    } catch { /* storage unavailable */ }
    leaving = true;
    location.href = '/admin/';
  } catch (e) {
    handleError(e, 'This event couldn’t be deleted');
    setBusy(false);
  }
}

async function preview() {
  if (busy) return;
  setBusy('Preparing preview…');
  try {
    const status = isDirty() ? 'unsaved' : current ? current.status : 'draft';
    const html = await api('cms-preview', { method: 'POST', body: { event: collect(), status } });
    const { body, foot, close } = openDialog({ title: 'Preview', className: 'preview-dialog' });
    body.style.cssText = 'padding:0;flex:1;display:flex;';
    // sandbox: no scripts, forms or pop-ups in the preview.
    const frame = el('iframe', { title: 'Preview of the event page', sandbox: '' });
    frame.srcdoc = html;
    body.append(frame);
    foot.append(
      el('p', { class: 'muted small', style: 'margin:0 auto 0 0;align-self:center' }, 'Shows what’s in the editor now, including unsaved changes. Media links expire after 10 minutes.'),
      el('button', { type: 'button', class: 'btn', onclick: close }, 'Close preview'));
  } catch (e) {
    handleError(e, 'The preview couldn’t be shown');
  } finally {
    setBusy(false);
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

btnSave.addEventListener('click', () => save());
btnPublish.addEventListener('click', publish);
btnPreview.addEventListener('click', preview);
btnUnpublish.addEventListener('click', unpublish);
btnDelete.addEventListener('click', remove);
form.addEventListener('submit', (e) => { e.preventDefault(); save(); });
form.addEventListener('input', (e) => {
  if (e.target.name === 'title' && !slugTouched) form.elements.slug.value = slugify(e.target.value);
  if (e.target.name === 'slug') slugTouched = true;
  if (['kind', 'event_date', 'kicker'].includes(e.target.name)) updateHints();
  onChange(e);
});
form.elements.slug.addEventListener('change', () => {
  if (form.elements.slug.readOnly) return;
  form.elements.slug.value = slugify(form.elements.slug.value);
  if (!form.elements.slug.value) slugTouched = false;
  onChange();
});
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!btnSave.disabled) save(); }
});
window.addEventListener('beforeunload', (e) => {
  if (!leaving && snapshot && isDirty()) { e.preventDefault(); e.returnValue = ''; }
});

async function start() {
  try {
    await initHeader();
  } catch {
    return; // initHeader redirects to sign-in or shows why
  }
  $$('[data-md]').forEach(buildMarkdownEditor);
  const params = new URLSearchParams(location.search);
  let id = params.get('id');
  try {
    const mediaReady = refreshMediaIndex();
    if (!id && params.get('slug')) {
      const { events } = await api('cms-events');
      const match = events.find((x) => x.slug === params.get('slug'));
      if (!match) throw Object.assign(new Error(`There’s no event with the web address “${params.get('slug')}”.`), { status: 404 });
      id = match.id;
      history.replaceState(null, '', `?id=${encodeURIComponent(id)}`);
    }
    if (id) {
      current = (await api(`cms-events?id=${encodeURIComponent(id)}`)).event;
      fill(current);
    } else {
      fill({ kind: 'next' });
    }
    markSaved();
    $('#loading').hidden = true;
    form.hidden = false;
    updateStatus();
    await mediaReady;
    for (const f of MEDIA_FIELDS) renderMedia(f);
    if (!id) form.elements.title.focus();
  } catch (e) {
    $('#loading').hidden = true;
    if (e.status === 401) location.href = loginUrl();
    else notice('error', 'This event couldn’t be opened', e.message, el('a', { class: 'btn', href: '/admin/' }, 'Back to all events'));
    btnSave.disabled = btnPublish.disabled = btnPreview.disabled = true;
  }
}

start();
