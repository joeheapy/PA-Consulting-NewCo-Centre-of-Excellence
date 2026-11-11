// Events list (/admin/).
import { api, el, badge, formatWhen, initHeader, toast, loginUrl } from './cms.js';

const box = document.getElementById('events');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
let events = [];
let filter = 'all';

function flash() {
  // Set by the editor after deleting an event.
  try {
    const msg = sessionStorage.getItem('cms-flash');
    if (msg) { sessionStorage.removeItem('cms-flash'); toast(msg); }
  } catch { /* storage unavailable */ }
}

function row(e) {
  const editHref = '/admin/edit.html?id=' + encodeURIComponent(e.id);
  const isLive = e.status !== 'draft';
  return el('li', { class: 'event-row' },
    el('a', { class: 'event-row__title', href: editHref }, e.title),
    badge(e.status),
    el('div', { class: 'event-row__meta' },
      el('span', {}, e.date || 'No date yet'),
      el('span', {}, e.kind === 'past' ? 'Past event' : 'Upcoming'),
      el('span', {}, `Changed ${formatWhen(e.updated_at)}${e.updated_by && e.updated_by !== 'migration' ? ' by ' + e.updated_by : ''}`)),
    el('div', { class: 'event-row__actions' },
      el('a', { class: 'btn btn-sm', href: editHref, 'aria-label': `Edit ${e.title}` }, 'Edit'),
      el('a', { class: 'btn btn-sm btn-quiet', href: '/.netlify/functions/cms-preview?id=' + encodeURIComponent(e.id), target: '_blank', rel: 'noopener', 'aria-label': `Preview ${e.title} (opens in a new tab)` }, 'Preview'),
      isLive && el('a', { class: 'btn btn-sm btn-quiet', href: `/events/${e.slug}.html`, target: '_blank', rel: 'noopener', 'aria-label': `View the live page for ${e.title} (opens in a new tab)` }, 'View live')));
}

function render() {
  const counts = { all: events.length, draft: 0, published: 0, changed: 0 };
  for (const e of events) counts[e.status]++;
  for (const b of filterButtons) {
    const f = b.dataset.filter;
    b.setAttribute('aria-pressed', String(f === filter));
    b.textContent = `${b.textContent.replace(/\s*\(\d+\)$/, '')} (${counts[f]})`;
  }
  const shown = events.filter((e) => filter === 'all' || e.status === filter || (filter === 'published' && e.status === 'changed'));
  box.setAttribute('aria-busy', 'false');
  if (!events.length) {
    box.replaceChildren(el('div', { class: 'empty' },
      el('p', {}, 'There are no events yet.'),
      el('a', { class: 'btn btn-primary', href: '/admin/edit.html' }, 'Create the first event')));
    return;
  }
  if (!shown.length) {
    box.replaceChildren(el('p', { class: 'muted' }, 'No events match this filter.'));
    return;
  }
  box.replaceChildren(el('ul', { class: 'event-list' }, shown.map(row)));
}

for (const b of filterButtons) b.addEventListener('click', () => { filter = b.dataset.filter; render(); });

try {
  await initHeader();
  flash();
  events = (await api('cms-events')).events;
  render();
} catch (e) {
  box.setAttribute('aria-busy', 'false');
  if (e.status === 401) location.href = loginUrl();
  else box.replaceChildren(el('div', { class: 'notice notice--error', role: 'alert' }, el('p', {}, e.message)));
}
