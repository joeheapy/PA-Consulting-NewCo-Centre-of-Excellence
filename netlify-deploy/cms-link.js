// Shows admins a link to the Events CMS on every page ("Edit this event" on event pages).
// The nc_admin cookie is only a display hint set at login; /admin/ and the CMS functions
// check the real session, so a member who sets it just sees a link that returns 403.
(function () {
  if (!/(?:^|;\s*)nc_admin=1(?:;|$)/.test(document.cookie)) return;
  var slug = document.currentScript && document.currentScript.getAttribute('data-event');
  var a = document.createElement('a');
  a.href = slug ? '/admin/edit.html?slug=' + encodeURIComponent(slug) : '/admin/';
  a.textContent = slug ? 'Edit this event' : 'Events CMS';
  a.setAttribute('style', [
    'position:fixed', 'right:16px', 'bottom:16px', 'z-index:1000',
    'padding:10px 16px', 'border-radius:999px',
    'background:#00172D', 'color:#FFFFFF', 'border:1px solid #A2B3C9',
    "font:500 14px/1 'Hanken Grotesk',system-ui,sans-serif", 'text-decoration:none',
    'box-shadow:0 8px 40px rgba(0,23,45,.18)',
  ].join(';'));
  function add() { document.body.appendChild(a); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
})();
