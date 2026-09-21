# Requires the "Markdown" package (see requirements.txt). Local setup, once:
#   python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
# Then run this script with .venv/bin/python.
import os
import markdown as md

ROOT = "."
DS = f"{ROOT}/_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4"
CONTENT_DIR = f"{ROOT}/content"
OUT_DIR = f"{ROOT}/netlify-deploy"
SITE_NAME = "NewCo Community"
LOGO_HREF = "../uploads/pa-logo.png"
MD_EXTENSIONS = ["extra", "sane_lists"]

def read(path):
    return open(path, encoding="utf-8").read()

fonts_css = read(f"{DS}/tokens/fonts.css")
colors_css = read(f"{DS}/tokens/colors.css")
typography_css = read(f"{DS}/tokens/typography.css")
spacing_css = read(f"{DS}/tokens/spacing.css")

NAV = [
    ("Home", "index.html", "home"),
    ("Events", "events.html", "events"),
    ("Emerging practices", "emerging-practices.html", "hub"),
    ("Case studies", "case-studies.html", "insights"),
    ("Community voices", "community-voices.html", "voices"),
    ("About", "about.html", "about"),
]

def nav_html(active_key):
    items = []
    for label, href, key in NAV:
        active = key == active_key
        color = "#FFFFFF" if active else "var(--pa-grey-02)"
        weight = 450 if active else 400
        underline = "#EA0027" if active else "transparent"
        items.append(
            f'<a href="../{href}" style="font:{weight} 15px/1 var(--font-primary);color:{color};'
            f'text-decoration:none;border-bottom:2px solid {underline};cursor:pointer;padding:8px 1px 10px;'
            f'transition:color 0.15s;">{label}</a>'
        )
    return "\n      ".join(items)

def page_shell(title, active_key, body_html):
    return f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — {SITE_NAME}</title>
<style>
{fonts_css}
</style>
<style>
{colors_css}
</style>
<style>
{typography_css}
</style>
<style>
{spacing_css}
</style>
<style>
  body{{margin:0;background:#FFFFFF;font:400 16px/1.6 var(--font-companion);color:var(--pa-dark-blue);-webkit-font-smoothing:antialiased;}}
  a{{color:#EA0027;}}
  a:hover{{color:#C40021;}}
  :focus-visible{{outline:3px solid #EA0027;outline-offset:2px;}}
  img{{max-width:100%;}}
  @media (prefers-reduced-motion:reduce){{*{{transition-duration:0.01ms !important;animation-duration:0.01ms !important;}}}}
  .pa-article-body{{max-width:700px;}}
  .pa-article-body p{{font:400 17px/1.7 var(--font-companion);color:var(--pa-dark-blue);margin:0 0 18px;}}
  .pa-article-body strong{{font-weight:600;}}
  .pa-article-body em{{font-style:italic;}}
  .pa-article-body h2{{font:450 26px/1.3 var(--font-primary);color:var(--pa-dark-blue);margin:36px 0 16px;}}
  .pa-article-body h3{{font:450 21px/1.35 var(--font-primary);color:var(--pa-dark-blue);margin:30px 0 14px;}}
  .pa-article-body ul,.pa-article-body ol{{font:400 17px/1.7 var(--font-companion);color:var(--pa-dark-blue);margin:0 0 18px;padding-left:22px;}}
  .pa-article-body li{{margin-bottom:8px;}}
  .pa-article-body blockquote{{border-left:2px solid var(--pa-aqua-01);margin:0 0 18px;padding:2px 0 2px 18px;font:400 17px/1.6 var(--font-companion);color:var(--pa-grey-04);font-style:italic;}}
  .pa-article-body blockquote p{{margin:0 0 8px;}}
  .pa-article-body code{{font:400 14px/1 var(--font-ancillary);background:var(--pa-grey-01);padding:2px 5px;border-radius:var(--radius-sm);}}
  .pa-article-body pre{{background:var(--pa-grey-01);padding:16px 18px;border-radius:var(--radius-sm);overflow-x:auto;}}
  .pa-article-body pre code{{background:none;padding:0;}}
  .pa-article-body hr{{border:none;border-top:1px solid var(--pa-grey-01);margin:28px 0;}}
</style>
</head>
<body>
<header role="banner" style="position:sticky;top:0;z-index:50;background:var(--pa-dark-blue);border-bottom:1px solid rgba(255,255,255,0.08);">
  <div style="max-width:1240px;margin:0 auto;padding:8px clamp(20px,5vw,48px);min-height:52px;display:flex;align-items:center;gap:20px 28px;flex-wrap:wrap;">
    <a href="../index.html" style="display:flex;align-items:baseline;gap:14px;text-decoration:none;padding:0;">
      <img src="{LOGO_HREF}" alt="PA Consulting" style="height:34px;width:auto;display:block;align-self:center;">
    </a>
    <nav aria-label="Primary" style="display:flex;gap:12px 22px;margin-left:auto;flex-wrap:wrap;">
      {nav_html(active_key)}
    </nav>
  </div>
</header>
<main id="main-content" role="main">
{body_html}
</main>
<footer role="contentinfo" style="background:var(--pa-dark-blue);border-top:1px solid rgba(255,255,255,0.08);">
  <div style="max-width:1240px;margin:0 auto;padding:40px clamp(20px,5vw,48px) 24px;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:32px;">
      <div>
        <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:12px;">
          <img src="{LOGO_HREF}" alt="PA Consulting" style="height:30px;width:auto;display:block;align-self:center;">
        </div>
        <p style="font:400 14px/1.7 var(--font-companion);color:var(--pa-grey-02);max-width:320px;margin:0;">A practitioner-led forum for UK government leaders, convened by PA Consulting.</p>
      </div>
      <div>
        <nav aria-label="Footer" style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;">
          {"".join(f'<a href="../{href}" style="font:400 14px/1.4 var(--font-companion);color:var(--pa-grey-02);text-decoration:none;padding:0;">{label}</a>' for label, href, key in NAV)}
        </nav>
      </div>
      <div>
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">newco.community@paconsulting.com<br>10 Bressenden Place<br>London SW1E 5DN</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:28px;padding-top:16px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;">
      <span style="font:400 12px/1 var(--font-primary);color:var(--pa-grey-02);">© 2027 PA Knowledge Limited. All rights reserved.</span>
      <span style="font:400 12px/1 var(--font-primary);color:var(--pa-grey-02);">Events run under the Chatham House Rule.</span>
    </div>
  </div>
</footer>
</body>
</html>
'''

def eyebrow(text):
    return f'<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:20px;">{text}</div>'

def back_link(label, href):
    return (f'<a href="{href}" style="display:inline-block;font:400 13px/1 var(--font-primary);'
            f'letter-spacing:0.04em;color:var(--pa-grey-02);text-decoration:none;margin-bottom:32px;">← {label}</a>')

def parse_frontmatter(text):
    """Split a '---\\nkey: value\\n...\\n---\\nbody' file into (dict, body_str)."""
    if not text.startswith("---"):
        raise ValueError("missing frontmatter delimiter")
    parts = text.split("---", 2)
    if len(parts) != 3:
        raise ValueError("expected exactly two '---' delimiters")
    _, fm_block, body = parts
    meta = {}
    for line in fm_block.strip().splitlines():
        if not line.strip():
            continue
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, body.strip("\n")

def render_markdown(text):
    html = md.markdown(text, extensions=MD_EXTENSIONS)
    return f'<div class="pa-article-body">{html}</div>'

# ---------------------------------------------------------------------------
# ARTICLE TEMPLATE: emerging-practices / case-studies (simple article layout)
# ---------------------------------------------------------------------------

def simple_article(section_label, section_href, title, meta_line, body_html):
    return f'''
  <section style="background:var(--pa-grey-01);padding:clamp(44px,6.5vw,72px) 0 clamp(36px,5vw,56px);">
    <div style="max-width:840px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      {back_link("All " + section_label.lower(), section_href)}
      {eyebrow(section_label)}
      <h1 style="font:400 clamp(28px,4.6vw,42px)/1.15 var(--font-primary);color:var(--pa-dark-blue);margin:0;text-wrap:pretty;">{title}</h1>
      <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-04);margin-top:22px;">{meta_line}</div>
    </div>
  </section>
  <section style="background:#FFFFFF;padding:clamp(40px,6vw,64px) 0 clamp(48px,7.5vw,88px);">
    <div style="max-width:840px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      {body_html}
      <div style="border-top:1px solid var(--pa-grey-01);margin-top:36px;padding-top:24px;">
        {back_link("Back to " + section_label, section_href)}
      </div>
    </div>
  </section>
'''

# ---------------------------------------------------------------------------
# DATA
# ---------------------------------------------------------------------------

STAGE_ORDER = [
    ("Establishing",   "01 / ESTABLISHING",                   "Establishing a NewCo"),
    ("Incubating",     "02 / INCUBATING",                      "Incubating a NewCo"),
    ("Scaling",        "03 / SCALING",                         "Scaling a NewCo"),
    ("Reintegration",  "04 / REINTEGRATION AND TRANSITION",    "Reintegration and transition"),
]

def load_markdown_dir(path):
    """Return [(meta_dict, body_str), ...] for every .md file in path, sorted by filename."""
    entries = []
    for fname in sorted(os.listdir(path)):
        if not fname.endswith(".md"):
            continue
        meta, body = parse_frontmatter(read(f"{path}/{fname}"))
        entries.append((meta, body))
    return entries

def load_stages():
    buckets = {tab: {"tab": tab, "num": num, "title": title, "items": []}
               for tab, num, title in STAGE_ORDER}
    raw = {tab: [] for tab, _, _ in STAGE_ORDER}
    for meta, body in load_markdown_dir(f"{CONTENT_DIR}/emerging-practices"):
        tab = meta["stage_tab"]
        if tab not in buckets:
            raise ValueError(f"unknown stage_tab {tab!r} in {meta.get('slug')}")
        raw[tab].append((int(meta.get("order", 0)), meta, body))
    for tab, _, _ in STAGE_ORDER:
        for _, meta, body in sorted(raw[tab], key=lambda t: t[0]):
            buckets[tab]["items"].append({
                "slug": meta["slug"], "title": meta["title"], "read": meta["read"],
                "body": render_markdown(body),
            })
    return [buckets[tab] for tab, _, _ in STAGE_ORDER]

def load_insights():
    return [
        {"slug": m["slug"], "theme": m["theme"], "title": m["title"], "author": m["author"],
         "role": m["role"], "date": m["date"], "read": m["read"], "body": render_markdown(body)}
        for m, body in load_markdown_dir(f"{CONTENT_DIR}/case-studies")
    ]

STAGES = load_stages()
INSIGHTS = load_insights()

def parse_list_field(value):
    return [v.strip() for v in value.split(";") if v.strip()]

def parse_speakers_field(value):
    speakers = []
    for chunk in parse_list_field(value):
        name, _, role = chunk.partition("|")
        speakers.append({"name": name.strip(), "role": role.strip()})
    return speakers

def parse_agenda_field(value):
    # "16:00 - 16:30 Arrival and registration" -> {"start", "end", "label"}
    agenda = []
    for chunk in parse_list_field(value):
        start, _, rest = chunk.partition(" - ")
        end, _, label = rest.partition(" ")
        agenda.append({"start": start.strip(), "end": end.strip(), "label": label.strip()})
    return agenda

def load_events():
    next_events, past = [], []
    for meta, body in load_markdown_dir(f"{CONTENT_DIR}/events"):
        ev = {
            "slug": meta["slug"], "kicker": meta["kicker"], "date": meta["date"],
            "time": meta["time"], "loc": meta["loc"], "format": meta["format"],
            "title": meta["title"], "blurb": meta["blurb"],
            "overview_html": render_markdown(body),
            "agenda": parse_agenda_field(meta["agenda"]),
            "speakers": parse_speakers_field(meta["speakers"]),
        }
        if meta.get("themes"):
            ev["themes"] = parse_list_field(meta["themes"])
        if meta.get("insights"):
            ev["insights"] = parse_list_field(meta["insights"])
        if meta.get("downloads"):
            ev["downloads"] = parse_list_field(meta["downloads"])
        (next_events if meta["kind"] == "next" else past).append(ev)
    return next_events, past

NEXT, PAST = load_events()

# ---------------------------------------------------------------------------
# RENDER: events (rich detail layout, matching the app's former isEvent view)
# ---------------------------------------------------------------------------

def render_event_page(ev, is_next):
    themes_html = ""
    if ev.get("themes"):
        themes_html = (
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Key discussion themes</div>'
            '<div style="display:flex;flex-direction:column;gap:12px;">'
            + "".join(
                f'<div style="display:flex;gap:14px;align-items:baseline;"><span aria-hidden="true" style="width:8px;height:8px;background:var(--pa-aqua-04);flex:none;position:relative;top:-1px;"></span>'
                f'<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">{t}</span></div>'
                for t in ev["themes"]
            ) + "</div>"
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Major insights</div>'
            '<div style="display:flex;flex-direction:column;gap:16px;">'
            + "".join(
                f'<div style="border-left:2px solid var(--pa-aqua-01);padding:2px 0 2px 18px;font:400 16px/1.6 var(--font-companion);color:var(--pa-grey-04);font-style:italic;">{t}</div>'
                for t in ev["insights"]
            ) + "</div>"
        )
    agenda_html = ""
    if ev.get("agenda"):
        agenda_html = (
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Agenda</div>'
            '<div style="display:flex;flex-direction:column;">'
            + "".join(
                f'<div style="display:grid;grid-template-columns:150px 1fr;gap:20px;padding:14px 0;border-bottom:1px solid var(--pa-grey-01);">'
                f'<span style="font:400 13px/1.5 var(--font-primary);color:var(--pa-grey-04);">{a["start"]} - {a["end"]}</span>'
                f'<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">{a["label"]}</span></div>'
                for a in ev["agenda"]
            ) + "</div>"
        )
    speakers_html = (
        '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Speakers</div>'
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:16px;">'
        + "".join(
            f'<div style="border:1px solid var(--pa-grey-01);padding:18px 20px;">'
            f'<div style="font:450 16px/1.3 var(--font-primary);color:var(--pa-dark-blue);margin-bottom:6px;">{s["name"]}</div>'
            f'<div style="font:400 13px/1.5 var(--font-companion);color:var(--pa-grey-04);">{s["role"]}</div></div>'
            for s in ev["speakers"]
        ) + "</div>"
    )
    downloads_html = ""
    if ev.get("downloads"):
        downloads_html = (
            '<div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin:40px 0 18px;">Materials</div>'
            '<div style="display:flex;flex-direction:column;gap:12px;">'
            + "".join(
                f'<div style="display:flex;justify-content:space-between;align-items:center;gap:20px;border:1px solid var(--pa-grey-01);padding:16px 20px;">'
                f'<span style="font:400 15px/1.4 var(--font-companion);color:var(--pa-dark-blue);">{d}</span>'
                f'<span style="font:450 14px/1 var(--font-primary);color:var(--pa-grey-03);white-space:nowrap;">PDF</span></div>'
                for d in ev["downloads"]
            ) + "</div>"
        )

    main_content = f'''
        {ev["overview_html"]}
        {themes_html}
        {agenda_html}
        {speakers_html}
        {downloads_html}
    '''

    if is_next:
        sidebar = f'''
          <div style="background:var(--pa-grey-01);padding:32px 32px 36px;position:sticky;top:96px;">
            <div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:8px;">Express interest</div>
            <div style="font:550 20px/1.3 var(--font-companion);color:var(--pa-dark-blue);margin-bottom:20px;">Tell us you'd like to attend</div>
            <form name="event-registration" method="POST" data-netlify="true" style="display:flex;flex-direction:column;gap:16px;">
              <input type="hidden" name="form-name" value="event-registration">
              <input type="hidden" name="attendance" value="In person">
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Full name</span>
                <input type="text" name="name" required style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Work email</span>
                <input type="email" name="email" required style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Department or organisation</span>
                <input type="text" name="organisation" style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <label style="display:block;font:450 14px/1.3 var(--font-primary);color:var(--pa-dark-blue);">
                <span style="display:block;margin-bottom:6px;">Role</span>
                <input type="text" name="role" style="display:block;width:100%;box-sizing:border-box;font:400 16px/1.4 var(--font-companion);color:var(--pa-dark-blue);padding:10px 12px;border:1px solid var(--pa-grey-03);border-radius:2px;">
              </label>
              <button type="submit" style="font:450 16px/1 var(--font-primary);padding:11px 20px;border-radius:2px;border:none;background:#EA0027;color:#fff;cursor:pointer;">Express interest</button>
              <div style="font:400 12px/1.5 var(--font-primary);color:var(--pa-grey-04);">Events run under the Chatham House Rule. Places are limited and confirmed by email.</div>
            </form>
          </div>'''
        content_html = f'''
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:64px;align-items:start;">
      <div>{main_content}</div>
      <div>{sidebar}</div>
    </div>'''
    else:
        content_html = f'''
    <div style="max-width:840px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      {main_content}
    </div>'''

    body = f'''
  <section style="background:var(--pa-dark-blue);padding:56px 0 60px;">
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);">
      <a href="../events.html" style="display:inline-block;font:400 13px/1 var(--font-primary);letter-spacing:0.04em;color:var(--pa-grey-02);text-decoration:none;margin-bottom:32px;">← All events</a>
      <div style="font:400 12px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-aqua-03);margin-bottom:18px;">{ev["kicker"]}</div>
      <h1 style="font:400 clamp(28px,4.6vw,42px)/1.15 var(--font-primary);color:#FFFFFF;margin:0;max-width:840px;text-wrap:pretty;">{ev["title"]}</h1>
      <div style="display:flex;gap:36px;flex-wrap:wrap;margin-top:28px;">
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">{ev["date"]}<br>{ev["time"]}</div>
        <div style="font:400 13px/1.6 var(--font-primary);color:var(--pa-grey-02);">{ev["loc"]}<br>{ev["format"]}</div>
      </div>
    </div>
  </section>
  <section style="background:#FFFFFF;padding:clamp(40px,6vw,64px) 0 clamp(48px,7.5vw,88px);">
    {content_html}
  </section>
'''
    return page_shell(ev["title"], "events", body)

# ---------------------------------------------------------------------------
# BUILD
# ---------------------------------------------------------------------------

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(content)
    print("wrote", path, len(content), "bytes")

for ev in NEXT:
    html = render_event_page(ev, is_next=True)
    write(f"{OUT_DIR}/events/{ev['slug']}.html", html)

for ev in PAST:
    html = render_event_page(ev, is_next=False)
    write(f"{OUT_DIR}/events/{ev['slug']}.html", html)

for stage in STAGES:
    for item in stage["items"]:
        meta = f'{stage["title"]} · {item["read"]}'
        html = page_shell(
            item["title"], "hub",
            simple_article("Emerging practices", "../emerging-practices.html", item["title"], meta, item["body"])
        )
        write(f"{OUT_DIR}/emerging-practices/{item['slug']}.html", html)

for ins in INSIGHTS:
    meta = f'{ins["author"]} · {ins["role"]} · {ins["date"]} · {ins["read"]}'
    html = page_shell(
        ins["title"], "insights",
        simple_article("Case studies", "../case-studies.html", ins["title"], meta, ins["body"])
    )
    write(f"{OUT_DIR}/case-studies/{ins['slug']}.html", html)

print("done:", len(NEXT) + len(PAST), "events,",
      sum(len(s["items"]) for s in STAGES), "practices,", len(INSIGHTS), "case studies")
