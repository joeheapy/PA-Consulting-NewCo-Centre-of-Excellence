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

UPCOMING = [
    {"id": "ev1", "slug": "establishing-a-government-newco", "kicker": "Upcoming event · Registration open", "date": "17 September 2027", "time": "16:00–19:00 BST",
     "loc": "PA Consulting, 10 Bressenden Place, London", "format": "In person only",
     "title": "Establishing a government NewCo: when separation is the right answer",
     "blurb": "A working session on the diagnostic case for structural separation — and the traps departments fall into when the answer should have been no.",
     "overview": ["Structural separation is a powerful response to legacy technology, fragmented accountability and constrained capability — but it is not a universal solution. This session examines the diagnostic criteria that should drive the decision, drawing on live experience from departments that chose separation, and from those that chose not to.",
                  "Participants will work through the NewCo Readiness Assessment in facilitated roundtables, applying it to their own context. The session closes with an open discussion on building the business case for separation with HM Treasury and departmental boards."],
     "speakers": [{"name": "Sarah Okafor", "role": "Transformation Director, central government department"},
                  {"name": "James Whitfield", "role": "Government transformation expert, PA Consulting"},
                  {"name": "Priya Nair", "role": "Former Chief Operating Officer, government NewCo"}],
     "agenda": [{"t": "16:00", "s": "Arrival and registration"}, {"t": "16:30", "s": "Keynote — the case for separation, and against it"},
                {"t": "17:00", "s": "Panel — diagnostic criteria in practice"}, {"t": "17:45", "s": "Roundtables — applying the readiness assessment"},
                {"t": "18:30", "s": "Drinks and open discussion"}]},
    {"id": "ev2", "slug": "designing-governance-and-accountability", "kicker": "Upcoming event · Registration open", "date": "12 November 2027", "time": "09:00–12:30 GMT",
     "loc": "PA Consulting, 10 Bressenden Place, London", "format": "In person only",
     "title": "Designing governance and accountability for NewCos",
     "blurb": "How to give a NewCo genuine decision rights without losing the accountability Parliament expects.",
     "overview": ["The hardest design problem in any NewCo is governance: enough autonomy to move at pace, enough accountability to satisfy Parliament, the National Audit Office and the parent department. Get it wrong in either direction and the NewCo becomes either a runaway or a puppet.",
                  "This roundtable brings together SROs, accounting officers and governance specialists to compare models in use across government — board composition, delegation frameworks, funding gateways and escalation routes — and to work through the governance layer of the NewCo Operating Model Canvas."],
     "speakers": [{"name": "Eleanor Hughes", "role": "Senior Responsible Owner, major transformation programme"},
                  {"name": "David Achebe", "role": "Governance and accountability expert, PA Consulting"}],
     "agenda": [{"t": "09:00", "s": "Arrival and coffee"}, {"t": "09:30", "s": "Framing — the autonomy–accountability trade-off"},
                {"t": "10:15", "s": "Roundtables — governance models in use today"}, {"t": "11:30", "s": "Working session — the Operating Model Canvas, governance layer"},
                {"t": "12:15", "s": "Close and next steps"}]},
]

PAST = [
    {"id": "pe1", "slug": "building-a-digital-office", "kicker": "Past event · 14 May 2027", "date": "14 May 2027", "time": "16:00–19:00 BST", "loc": "PA Consulting, London", "format": "In person only",
     "stats": "46 attendees · 15 departments", "glance": "46 attendees\n15 departments",
     "title": "Building a Digital Office inside a NewCo",
     "blurb": "What a Digital Office is for, where it sits, and why so many become bottlenecks.",
     "overview": ["A Digital Office should be the engine room of a NewCo — setting technical direction, owning standards and unblocking delivery. In practice, many become approval bottlenecks that recreate the bureaucracy the NewCo was built to escape. This session compared Digital Office patterns from four live transformations.",
                  "The strongest consensus of the evening: a Digital Office succeeds when it behaves as a service to delivery teams, with its authority earned through usefulness rather than granted through mandate."],
     "themes": ["Digital Office as a service, not a control function", "Standards that enable rather than gate — “paved roads, not toll booths”",
                "Recruiting technical leadership into government pay structures", "The relationship between the Digital Office and the parent department’s CDO function"],
     "insights": ["“Every approval step you add is a bet that your judgement is better than your delivery teams’. Make that bet rarely.” — panel contribution",
                  "Three of four organisations represented had restructured their Digital Office within eighteen months of establishing it — plan for evolution, not permanence.",
                  "Departments that co-located Digital Office staff with delivery teams reported materially faster architectural decisions."],
     "speakers": [{"name": "Marcus Bell", "role": "Digital Office lead, major delivery department"},
                  {"name": "Aisha Rahman", "role": "Digital office design expert, PA Consulting"},
                  {"name": "Tom Askew", "role": "Enterprise architect, government NewCo"}],
     "downloads": ["Session summary (PDF, 12 pp)", "Digital Office patterns deck (PDF, 24 pp)"]},
    {"id": "pe2", "slug": "operating-model-incubation", "kicker": "Past event · 5 March 2027", "date": "5 March 2027", "time": "09:00–12:30 GMT", "loc": "PA Consulting, London", "format": "In person only",
     "stats": "38 attendees · 12 departments", "glance": "38 attendees\n12 departments\n2 published insights\nIncubation Roadmap v2 released",
     "title": "Operating model incubation: from programme to business",
     "blurb": "The awkward adolescence between programme mobilisation and a functioning organisation.",
     "overview": ["Most NewCos begin life as programmes — funded, governed and staffed like programmes. The transition to a functioning business, with its own operating model, is where many stall. This session worked through the five stages of the Incubation Roadmap: mobilise, establish, validate, scale, transition.",
                  "Discussion centred on the “validate” stage — proving the operating model on a real service before scaling it — which most attendees identified as the stage their organisations had skipped, and later regretted skipping."],
     "themes": ["Programme funding rhythms versus business funding needs", "Validating the operating model on a real service before scaling",
                "When to stop hiring contractors and start building permanent capability", "Measuring outcomes rather than delivery milestones"],
     "insights": ["Attendees consistently reported that incubation took twice as long as their business cases assumed — eighteen to twenty-four months, not nine to twelve.",
                  "“The moment you scale an unvalidated operating model, you are scaling your problems.” — roundtable contribution",
                  "Version 2 of the Incubation Roadmap, incorporating the session’s feedback, was published in April 2027."],
     "speakers": [{"name": "Priya Nair", "role": "Former Chief Operating Officer, government NewCo"},
                  {"name": "Rachel Donnelly", "role": "Operating model expert, PA Consulting"}],
     "downloads": ["Session summary (PDF, 10 pp)", "Incubation Roadmap v2 (PDF, 16 pp)"]},
    {"id": "pe3", "slug": "lessons-from-live-transformations", "kicker": "Past event · 22 January 2027 · Launch event", "date": "22 January 2027", "time": "16:00–19:30 GMT", "loc": "PA Consulting, London", "format": "In person only",
     "stats": "52 attendees · 17 departments", "glance": "52 attendees\n17 departments\nCommunity launched\n4 published insights",
     "title": "Lessons from live transformations",
     "blurb": "The community’s launch event: candid accounts from three transformations in flight.",
     "overview": ["The community’s launch event brought together fifty-two senior leaders from seventeen departments to hear candid, unattributable accounts from three transformations in flight — one thriving, one recovering, one recently wound down.",
                  "The evening established the community’s founding premise: NewCo-style delivery models are spreading across government faster than the lessons about how to run them. The event set the programme for the year and shaped the structure of the knowledge hub."],
     "themes": ["Why departments are turning to NewCo-style models now", "What the wound-down transformation would have done differently",
                "The skills government struggles to buy — and how NewCos change that", "What this community should be, and should never become"],
     "insights": ["“We didn’t fail because the model was wrong. We failed because we treated the model as the strategy.” — speaker contribution",
                  "Attendees voted governance design and reintegration planning as the two topics the community should tackle first.",
                  "Seventeen departments represented at launch; the community’s target is twenty-five by the end of 2027."],
     "speakers": [{"name": "Three senior leaders", "role": "Speaking unattributably, under the Chatham House Rule"},
                  {"name": "Helen Carver", "role": "Head of government transformation, PA Consulting"}],
     "downloads": ["Launch summary (PDF, 8 pp)"]},
]

# ---------------------------------------------------------------------------
# RENDER: events (rich detail layout, matching the app's former isEvent view)
# ---------------------------------------------------------------------------

def render_event_page(ev, is_upcoming):
    overview_html = "".join(
        f'<p style="font:400 17px/1.7 var(--font-companion);color:var(--pa-dark-blue);margin:0 0 18px;">{p}</p>'
        for p in ev["overview"]
    )
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
                f'<div style="display:grid;grid-template-columns:90px 1fr;gap:20px;padding:14px 0;border-bottom:1px solid var(--pa-grey-01);">'
                f'<span style="font:400 13px/1.5 var(--font-primary);color:var(--pa-grey-04);">{a["t"]}</span>'
                f'<span style="font:400 16px/1.5 var(--font-companion);color:var(--pa-dark-blue);">{a["s"]}</span></div>'
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

    if is_upcoming:
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
    else:
        sidebar = f'''
          <div style="background:var(--pa-grey-01);padding:32px;">
            <div style="font:400 13px/1 var(--font-primary);letter-spacing:0.08em;text-transform:uppercase;color:var(--pa-grey-04);margin-bottom:16px;">At a glance</div>
            <div style="font:400 14px/2 var(--font-primary);color:var(--pa-dark-blue);white-space:pre-line;">{ev["glance"]}</div>
            <div style="border-top:1px solid var(--pa-grey-02);margin:20px 0;"></div>
            <a href="establishing-a-government-newco.html" style="display:inline-block;font:450 14px/1 var(--font-primary);color:#EA0027;text-decoration:underline;text-underline-offset:3px;">See the next event →</a>
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
    <div style="max-width:1240px;margin:0 auto;padding:0 clamp(20px,5vw,48px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:64px;align-items:start;">
      <div>
        {overview_html}
        {themes_html}
        {agenda_html}
        {speakers_html}
        {downloads_html}
      </div>
      <div>{sidebar}</div>
    </div>
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

for ev in UPCOMING:
    html = render_event_page(ev, is_upcoming=True)
    write(f"{OUT_DIR}/events/{ev['slug']}.html", html)

for ev in PAST:
    html = render_event_page(ev, is_upcoming=False)
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

print("done:", len(UPCOMING) + len(PAST), "events,",
      sum(len(s["items"]) for s in STAGES), "practices,", len(INSIGHTS), "case studies")
