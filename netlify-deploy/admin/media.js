// Media library (/admin/media.html): upload, browse and delete files.
import { el, initHeader, listMedia, deleteMedia, uploadButton, uploadWithProgress, thumb, usageText, formatSize, formatWhen, confirmDialog, toast, whenImageLoads } from './cms.js';

const grid = document.getElementById('media');
const status = document.getElementById('media-status');
const search = document.getElementById('search');
const unusedOnly = document.getElementById('unused');
let files = [];

function card(f) {
  const inUse = f.used_by.length > 0;
  const del = el('button', {
    type: 'button', class: 'btn btn-sm btn-danger', 'aria-disabled': inUse ? 'true' : null,
    'aria-label': `Delete ${f.name}`,
    onclick: async () => {
      if (inUse) { toast(`${f.name} can’t be deleted: ${usageText(f).toLowerCase()}. Remove it from those events first.`); return; }
      const ok = await confirmDialog({ title: 'Delete this file?', message: [`“${f.name}” will be permanently deleted. This can’t be undone.`], confirmLabel: 'Delete file', danger: true });
      if (!ok) return;
      try { await deleteMedia(f.name); toast(`Deleted ${f.name}`); await load(); }
      catch (e) { toast(e.message, { kind: 'error' }); }
    },
  }, 'Delete');
  const links = f.used_by.map((u) => el('a', { href: '/admin/edit.html?id=' + encodeURIComponent(u.id) }, u.title + (u.live ? ' (live)' : '')));
  const meta = el('span', { class: 'muted' }, `${formatSize(f.size)} · ${formatWhen(f.updated_at)}`);
  const t = thumb(f, 'media-card__thumb');
  whenImageLoads(t, (w, h) => { meta.textContent = `${w} × ${h} px · ${meta.textContent}`; });
  return el('li', {}, el('div', { class: 'media-card' },
    t,
    el('div', { class: 'media-card__info' },
      el('span', { class: 'media-card__name' }, f.name),
      meta,
      el('span', { class: 'muted' }, inUse ? ['Used by ', ...links.flatMap((a, i) => (i ? [', ', a] : [a]))] : 'Not used by any event')),
    el('div', { class: 'media-card__actions' }, del)));
}

function render() {
  const q = search.value.trim().toLowerCase();
  const shown = files.filter((f) => (!q || f.name.toLowerCase().includes(q)) && (!unusedOnly.checked || !f.used_by.length));
  grid.replaceChildren(...shown.map(card));
  status.textContent = files.length ? `${shown.length} of ${files.length} files` : 'No files yet.';
}

async function load() {
  try { files = await listMedia({ fresh: true }); render(); }
  catch (e) { status.textContent = e.message; }
}

search.addEventListener('input', render);
unusedOnly.addEventListener('change', render);
document.getElementById('upload').append(uploadButton({
  kind: 'any', label: 'Upload files', multiple: true,
  onFiles: async (list) => {
    const names = await uploadWithProgress(list, document.getElementById('progress'));
    if (names.length) { toast(`Uploaded ${names.join(', ')}`); await load(); }
  },
}));

try { await initHeader(); await load(); } catch { /* initHeader handles it */ }
