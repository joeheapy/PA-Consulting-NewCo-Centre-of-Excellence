// Renders an event page. Shared by the site build (scripts/build-events.mjs) and the
// CMS preview function, so a preview always matches the published page.
//
// Input is an event in the shape of a row in the Supabase `events` table:
//   { slug, kind: 'next'|'past', title, kicker?, event_date?: 'YYYY-MM-DD', date_label?,
//     time_text?, location?, format?, blurb?, overview_md?, writeup_md?,
//     agenda?: [{start,end,label}], speakers?: [{name,role}], themes?: [str], insights?: [str],
//     downloads?: [{label, file?}], image?, image_alt?, image_caption?,
//     video?, video_poster?, video_caption?, card_image? }
//
// Every value is HTML-escaped. Markdown is rendered with raw HTML disabled (escaped), links
// limited to safe schemes, and media limited to bucket filenames or http(s)/relative paths.

import { Marked } from "marked";

export const SITE_NAME = "NewCo Community";

const NAV = [
  ["Home", "index.html", "home"],
  ["Events", "events.html", "events"],
  ["About", "about.html", "about"],
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

const VIDEO_EXTS = [".mp4", ".webm", ".mov"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const has = (v) => (Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== "");

export function formatEventDate(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || "");
  if (!m) return "";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** The date as shown on the site: the override label if set, else the formatted date. */
export function displayDate(ev) {
  return has(ev.date_label) ? ev.date_label : formatEventDate(ev.event_date);
}

export function defaultKicker(kind) {
  return kind === "next" ? "Next event" : "Past event";
}

function isVideo(name) {
  const lower = String(name).toLowerCase().split(/[?#]/)[0];
  return VIDEO_EXTS.some((ext) => lower.endsWith(ext));
}

function videoType(name) {
  const lower = String(name).toLowerCase().split(/[?#]/)[0];
  if (lower.endsWith(".mov")) return "video/quicktime";
  return "video/" + lower.slice(lower.lastIndexOf(".") + 1);
}

// Links: http(s), mailto, tel, in-page anchors and relative paths only.
function safeHref(href) {
  const h = String(href || "").trim();
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return null; // any other scheme, e.g. javascript:
  return h;
}

/**
 * Default media resolver: a bare filename lives in uploads/events/; an http(s) URL or a
 * relative path is used as written; anything else (e.g. javascript:, data:) is dropped.
 */
function defaultMediaUrl(root) {
  return (name) => {
    const n = String(name || "").trim();
    if (!n) return "";
    if (/^https?:/i.test(n)) return n;
    if (/^[a-z][a-z0-9+.-]*:/i.test(n)) return "";
    if (n.includes("/")) return n;
    return `${root}uploads/events/${encodeURI(n)}`;
  };
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

function createMarkdown(mediaUrl) {
  const marked = new Marked({ gfm: true, breaks: false });

  const figure = ({ href, title, text }) => {
    const src = mediaUrl(href);
    if (!src) return "";
    const caption = title ? `<figcaption>${esc(title)}</figcaption>` : "";
    const media = isVideo(href)
      ? `<video controls preload="metadata" playsinline aria-label="${esc(text)}"><source src="${esc(src)}" type="${videoType(href)}"></video>`
      : `<img src="${esc(src)}" alt="${esc(text)}" loading="lazy">`;
    return `<figure>${media}${caption}</figure>`;
  };

  marked.use({
    renderer: {
      // Raw HTML in Markdown is shown as text, never interpreted. HTML comments are dropped
      // (legacy files used them for editor notes, which were never visible).
      html({ text }) {
        if (/^\s*<!--[\s\S]*-->\s*$/.test(text)) return "";
        return esc(text);
      },
      link({ href, title, tokens }) {
        const label = this.parser.parseInline(tokens);
        const safe = safeHref(href);
        if (safe == null) return label;
        const t = title ? ` title="${esc(title)}"` : "";
        return `<a href="${esc(safe)}"${t}>${label}</a>`;
      },
      image({ href, title, text }) {
        const src = mediaUrl(href);
        if (!src) return esc(text);
        const t = title ? ` title="${esc(title)}"` : "";
        return `<img alt="${esc(text)}" src="${esc(src)}"${t}>`;
      },
      // An image (or video) alone in its paragraph becomes a full-width figure.
      paragraph({ tokens }) {
        const meaningful = tokens.filter((t) => !(t.type === "text" && !t.raw.trim()) && t.type !== "br");
        if (meaningful.length === 1 && meaningful[0].type === "image") {
          return figure(meaningful[0]) + "\n";
        }
        return `<p>${this.parser.parseInline(tokens)}</p>\n`;
      },
    },
  });

  // marked writes apostrophes as &#39;. Turning them back into ' is safe because every attribute
  // we emit is double-quoted, and it keeps the output identical to the old Python build.
  return (text) =>
    `<div class="pa-article-body">${marked.parse(String(text || "")).replace(/&#39;/g, "'").trimEnd()}</div>`;
}

// ---------------------------------------------------------------------------
// Page shell (header, nav, footer, design-system tokens)
// ---------------------------------------------------------------------------

function navHtml(root, activeKey) {
  return NAV.map(([label, href, key]) => {
    const active = key === activeKey;
    const color = active ? "#FFFFFF" : "var(--pa-grey-02)";
    const weight = active ? 450 : 400;
    const underline = active ? "#EA0027" : "transparent";
    return (
      `<a href="${root}${href}" style="font:${weight} 15px/1 var(--font-primary);color:${color};` +
      `text-decoration:none;border-bottom:2px solid ${underline};cursor:pointer;padding:8px 1px 10px;` +
      `transition:color 0.15s;">${label}</a>`
    );
  }).join("\n      ");
}

/** css: { fonts, colors, typography, spacing } — the PA design-system token stylesheets. */
export function pageShell({ title, activeKey, bodyHtml, css, root = "../", headExtra = "", bodyEnd = "" }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${SITE_NAME}</title>
<style>
${css.fonts}
</style>
<style>
${css.colors}
</style>
<style>
${css.typography}
</style>
<style>
${css.spacing}
</style>
<style>
  body{margin:0;background:#FFFFFF;font:400 16px/1.6 var(--font-companion);color:var(--pa-dark-blue);-webkit-font-smoothing:antialiased;}
  a{color:#EA0027;}
  a:hover{color:#C40021;}
  :focus-visible{outline:3px solid #EA0027;outline-offset:2px;}
  img{max-width:100%;}
  @media (prefers-reduced-motion:reduce){*{transition-duration:0.01ms !important;animation-duration:0.01ms !important;}}
  .pa-article-body{max-width:700px;}
  .pa-article-body p{font:400 17px/1.7 var(--font-companion);color:var(--pa-dark-blue);margin:0 0 18px;}
  .pa-article-body strong{font-weight:600;}
  .pa-article-body em{font-style:italic;}
  .pa-article-body h2{font:450 26px/1.3 var(--font-primary);color:var(--pa-dark-blue);margin:36px 0 16px;}
  .pa-article-body h3{font:450 21px/1.35 var(--font-primary);color:var(--pa-dark-blue);margin:30px 0 14px;}
  .pa-article-body ul,.pa-article-body ol{font:400 17px/1.7 var(--font-companion);color:var(--pa-dark-blue);margin:0 0 18px;padding-left:22px;}
  .pa-article-body li{margin-bottom:8px;}
  .pa-article-body blockquote{border-left:2px solid var(--pa-aqua-01);margin:0 0 18px;padding:2px 0 2px 18px;font:400 17px/1.6 var(--font-companion);color:var(--pa-grey-04);font-style:italic;}
  .pa-article-body blockquote p{margin:0 0 8px;}
  .pa-article-body code{font:400 14px/1 var(--font-ancillary);background:var(--pa-grey-01);padding:2px 5px;border-radius:var(--radius-sm);}
  .pa-article-body pre{background:var(--pa-grey-01);padding:16px 18px;border-radius:var(--radius-sm);overflow-x:auto;}
  .pa-article-body pre code{background:none;padding:0;}
  .pa-article-body hr{border:none;border-top:1px solid var(--pa-grey-01);margin:28px 0;}
  .pa-event-media{display:flex;flex-direction:column;gap:24px;margin:32px 0;}
  .pa-event-media figure{margin:0;}
  .pa-event-media img,.pa-event-media video{width:100%;display:block;border-radius:var(--radius-sm);}
  .pa-event-media figcaption{font:400 13px/1.5 var(--font-companion);color:var(--pa-grey-04);margin-top:8px;}
  .pa-article-body figure{margin:28px 0;}
  .pa-article-body figure img,.pa-article-body figure video{width:100%;display:block;border-radius:var(--radius-sm);}
  .pa-article-body figcaption{font:400 13px/1.5 var(--font-companion);color:var(--pa-grey-04);margin-top:8px;}
</style>${headExtra}
</head>
<body>
<header role="banner" style="position:sticky;top:0;z-index:50;background:var(--pa-dark-blue);border-bottom:1px solid rgba(255,255,255,0.08);">
  <div style="max-width:1240px;margin:0 auto;padding:8px clamp(20px,5vw,48px);min-height:52px;display:flex;align-items:center;gap:20px 28px;flex-wrap:wrap;">
    <a href="${root}index.html" style="display:flex;align-items:baseline;gap:14px;text-decoration:none;padding:0;">
      <img src="${root}uploads/newco-logo-pink.png" alt="NewCo Community" style="height:34px;width:auto;display:block;align-self:center;">
    </a>
    <nav aria-label="Primary" style="display:flex;gap:12px 22px;margin-left:auto;flex-wrap:wrap;">
      ${navHtml(root, activeKey)}
    </nav>
  </div>
</header>
<main id="main-content" role="main">
${bodyHtml}
</main>
<footer role="contentinfo" style="background:var(--pa-dark-blue);border-top:1px solid rgba(255,255,255,0.08);">
  <div style="max-width:1240px;margin:0 auto;padding:40px clamp(20px,5vw,48px) 24px;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:32px;">
      <div>
        <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:12px;">
          <img src="${root}uploads/pa-logo.png" alt="PA Consulting" style="height:30px;width:auto;display:block;align-self:center;">
        </div>
        <p style="font:400 14px/1.7 var(--font-companion);color:var(--pa-grey-02);max-width:320px;margin:0;">A practitioner-led forum for UK government leaders, convened by PA Consulting.</p>
      </div>
      <div>
        <nav aria-label="Footer" style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;">
          ${NAV.map(([label, href]) => `<a href="${root}${href}" style="font:400 14px/1.4 var(--font-companion);color:var(--pa-grey-02);text-decoration:none;padding:0;">${label}</a>`).join("")}
        </nav>
      </div>
      <div>
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">newco.community@paconsulting.com<br>10 Bressenden Place<br>London SW1E 5DN</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:28px;padding-top:16px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;">
      <span style="font:400 12px/1 var(--font-primary);color:var(--pa-grey-02);">© 2026 PA Knowledge Limited. All rights reserved.</span>
      <span style="font:400 12px/1 var(--font-primary);color:var(--pa-grey-02);">Events run under the Chatham House Rule.</span>
    </div>
  </div>
</footer>${bodyEnd}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Event page
// ---------------------------------------------------------------------------

const LABEL = (text, margin = "40px 0 18px") =>
  `<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:${margin};">${text}</div>`;

/**
 * options:
 *   css       — token stylesheets (required), see pageShell
 *   root      — relative path from the page to the site root (default "../")
 *   mediaUrl  — (filename) => URL; default resolves bare names to <root>uploads/events/
 *   headExtra — extra markup for <head> (the CMS preview uses it for a banner style)
 *   bannerHtml— markup inserted at the top of <main> (the CMS preview's "Preview" bar)
 *   adminLink — include cms-link.js (an "Edit this event" link for admins); default true,
 *               the CMS preview turns it off (its CSP allows no scripts)
 */
export function renderEventPage(ev, options) {
  const root = options.root ?? "../";
  const mediaUrl = options.mediaUrl ?? defaultMediaUrl(root);
  const md = createMarkdown(mediaUrl);
  const isNext = ev.kind === "next";
  const title = ev.title || "";

  let mediaHtml = "";
  if (has(ev.image) || has(ev.video)) {
    let imageHtml = "";
    if (has(ev.image)) {
      const cap = has(ev.image_caption) ? `<figcaption>${esc(ev.image_caption)}</figcaption>` : "";
      const alt = has(ev.image_alt) ? ev.image_alt : title;
      imageHtml = `<figure><img src="${esc(mediaUrl(ev.image))}" alt="${esc(alt)}">${cap}</figure>`;
    }
    let videoHtml = "";
    if (has(ev.video)) {
      const poster = has(ev.video_poster) ? ` poster="${esc(mediaUrl(ev.video_poster))}"` : "";
      const cap = has(ev.video_caption) ? `<figcaption>${esc(ev.video_caption)}</figcaption>` : "";
      videoHtml = `<figure><video controls${poster}><source src="${esc(mediaUrl(ev.video))}" type="${videoType(ev.video)}"></video>${cap}</figure>`;
    }
    mediaHtml = `<div class="pa-event-media">${imageHtml}${videoHtml}</div>`;
  }

  // Write-up, themes and insights describe what happened, so they only appear once the event is
  // past. They stay saved while it's upcoming (e.g. a past event re-run as upcoming, or marked
  // upcoming by mistake), and come back if it's switched to past again.
  let themesHtml = "";
  if (!isNext && has(ev.themes)) {
    themesHtml =
      LABEL("Key discussion themes") +
      '<div style="display:flex;flex-direction:column;gap:12px;">' +
      ev.themes.map((t) =>
        '<div style="display:flex;gap:14px;align-items:baseline;"><span aria-hidden="true" style="width:8px;height:8px;background:var(--pa-aqua-04);flex:none;position:relative;top:-1px;"></span>' +
        `<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">${esc(t)}</span></div>`
      ).join("") + "</div>";
  }
  if (!isNext && has(ev.insights)) {
    themesHtml +=
      LABEL("Major insights") +
      '<div style="display:flex;flex-direction:column;gap:16px;">' +
      ev.insights.map((t) =>
        `<div style="border-left:2px solid var(--pa-aqua-01);padding:2px 0 2px 18px;font:400 16px/1.6 var(--font-companion);color:var(--pa-grey-04);font-style:italic;">${esc(t)}</div>`
      ).join("") + "</div>";
  }

  let agendaHtml = "";
  if (has(ev.agenda)) {
    agendaHtml =
      LABEL("Agenda") +
      '<div style="display:flex;flex-direction:column;">' +
      ev.agenda.map((a) =>
        '<div style="display:grid;grid-template-columns:150px 1fr;gap:20px;padding:14px 0;border-bottom:1px solid var(--pa-grey-01);">' +
        `<span style="font:400 13px/1.5 var(--font-primary);color:var(--pa-grey-04);">${esc(a.start)} - ${esc(a.end)}</span>` +
        `<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">${esc(a.label)}</span></div>`
      ).join("") + "</div>";
  }

  let speakersHtml = "";
  if (has(ev.speakers)) {
    speakersHtml =
      LABEL("Speakers") +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:16px;">' +
      ev.speakers.map((s) =>
        '<div style="border:1px solid var(--pa-grey-01);padding:18px 20px;">' +
        `<div style="font:450 16px/1.3 var(--font-primary);color:var(--pa-dark-blue);margin-bottom:6px;">${esc(s.name)}</div>` +
        `<div style="font:400 13px/1.5 var(--font-companion);color:var(--pa-grey-04);">${esc(s.role)}</div></div>`
      ).join("") + "</div>";
  }

  let downloadsHtml = "";
  if (has(ev.downloads)) {
    const rowStyle = "display:flex;justify-content:space-between;align-items:center;gap:20px;border:1px solid var(--pa-grey-01);padding:16px 20px;";
    downloadsHtml =
      LABEL("Materials") +
      '<div style="display:flex;flex-direction:column;gap:12px;">' +
      ev.downloads.map((d) => {
        const inner =
          `<span style="font:400 15px/1.4 var(--font-companion);color:var(--pa-dark-blue);">${esc(d.label)}</span>` +
          `<span style="font:450 14px/1 var(--font-primary);color:var(--pa-grey-03);white-space:nowrap;">PDF</span>`;
        const href = has(d.file) ? mediaUrl(d.file) : "";
        return href
          ? `<a href="${esc(href)}" download style="${rowStyle}text-decoration:none;">${inner}</a>`
          : `<div style="${rowStyle}">${inner}</div>`;
      }).join("") + "</div>";
  }

  const overviewHtml = has(ev.overview_md) ? md(ev.overview_md) : "";
  let writeupHtml = "";
  if (!isNext && has(ev.writeup_md)) {
    writeupHtml =
      '<div style="border-top:1px solid var(--pa-grey-01);margin-top:48px;padding-top:40px;">' +
      LABEL("Write up", "0 0 18px") +
      `${md(ev.writeup_md)}</div>`;
  }

  const mainContent = `
        ${overviewHtml}
        ${mediaHtml}
        ${themesHtml}
        ${agendaHtml}
        ${speakersHtml}
        ${downloadsHtml}
        ${writeupHtml}
    `;

  const inputStyle = "display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;";
  const labelStyle = "display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);";
  const field = (label, name, type, required) => `
              <label style="${labelStyle}">
                <span style="display:block;margin-bottom:6px;">${label}</span>
                <input type="${type}" name="${name}"${required ? " required" : ""} style="${inputStyle}">
              </label>`;

  let contentHtml;
  if (isNext) {
    const sidebar = `
          <div style="background:var(--pa-grey-01);padding:32px 32px 36px;position:sticky;top:96px;">
            <div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:8px;">Express interest</div>
            <div style="font:550 20px/1.3 var(--font-companion);color:var(--pa-dark-blue);margin-bottom:20px;">Tell us you'd like to attend</div>
            <form name="event-registration" method="POST" data-netlify="true" style="display:flex;flex-direction:column;gap:16px;">
              <input type="hidden" name="form-name" value="event-registration">
              <input type="hidden" name="event" value="${esc([title, displayDate(ev)].filter(Boolean).join(" — "))}">
              <input type="hidden" name="attendance" value="In person">${field("Full name", "name", "text", true)}${field("Work email", "email", "email", true)}${field("Department or organisation", "organisation", "text", false)}${field("Role", "role", "text", false)}
              <button type="submit" style="font:450 16px/1 var(--font-primary);padding:11px 20px;border-radius:2px;border:none;background:#EA0027;color:#fff;cursor:pointer;">Express interest</button>
              <div style="font:400 12px/1.5 var(--font-primary);color:var(--pa-grey-04);">Events run under the Chatham House Rule. Places are limited and confirmed by email.</div>
            </form>
          </div>`;
    contentHtml = `
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:64px;align-items:start;">
      <div>${mainContent}</div>
      <div>${sidebar}</div>
    </div>`;
  } else {
    contentHtml = `
    <div style="max-width:840px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      ${mainContent}
    </div>`;
  }

  const photoVideoHtml = isNext ? `
  <section style="background:var(--pa-grey-01);padding:clamp(36px,5vw,48px) 0;">
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      <div class="pa-article-body">
        <h2 style="margin:0 0 12px;">Photography and video</h2>
        <p style="margin:0;">We&rsquo;ll be taking photos and filming at this event for marketing purposes. We may capture you in photos or video footage as you are participating. If you would prefer not to appear in photos or video footage, please opt out in the registration form. If you choose to opt out, we&rsquo;ll give you a different coloured lanyard and make sure you&rsquo;re not identifiable in any of our photos or videos.</p>
      </div>
    </div>
  </section>` : "";

  const heroFact = (label, ...lines) => {
    const shown = lines.filter(has);
    if (!shown.length) return "";
    return (
      "<div>" +
      `<div style="font:400 12px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-aqua-03);margin-bottom:8px;">${label}</div>` +
      `<div style="font:450 17px/1.5 var(--font-primary);color:#FFFFFF;">${shown.map(esc).join("<br>")}</div>` +
      "</div>"
    );
  };
  const heroFacts = heroFact("When", displayDate(ev), ev.time_text) + heroFact("Where", ev.location, ev.format);
  const kicker = has(ev.kicker) ? ev.kicker : defaultKicker(ev.kind);

  const body = `${options.bannerHtml ?? ""}
  <section style="background:var(--pa-dark-blue);padding:56px 0 60px;">
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      <a href="${root}events.html" style="display:inline-block;font:400 13px/1 var(--font-primary);letter-spacing:0.04em;color:var(--pa-grey-02);text-decoration:none;margin-bottom:32px;">← All events</a>
      <div style="font:400 12px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-aqua-03);margin-bottom:18px;">${esc(kicker)}</div>
      <h1 style="font:400 clamp(28px,4.6vw,42px)/1.15 var(--font-primary);color:#FFFFFF;margin:0;max-width:840px;text-wrap:pretty;">${esc(title)}</h1>
      <div style="display:flex;gap:48px;flex-wrap:wrap;margin-top:32px;">
        ${heroFacts}
      </div>
    </div>
  </section>
  <section style="background:#FFFFFF;padding:clamp(40px,6vw,64px) 0 clamp(48px,7.5vw,88px);">
    ${contentHtml}
  </section>
  ${photoVideoHtml}
`;

  const bodyEnd = options.adminLink === false ? "" : `\n<script src="${root}cms-link.js" data-event="${esc(ev.slug)}" defer></script>`;
  return pageShell({ title, activeKey: "events", bodyHtml: body, css: options.css, root, headExtra: options.headExtra ?? "", bodyEnd });
}
