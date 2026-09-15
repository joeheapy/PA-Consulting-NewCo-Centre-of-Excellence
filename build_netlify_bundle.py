import re, base64, sys, os, shutil

ROOT = "."
SRC = f"{ROOT}/NewCo Community Microsite.dc.html"
DS = f"{ROOT}/_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4"
OUT_DIR = f"{ROOT}/netlify-deploy"

# page key (matches the app's internal S.page value) -> (output filename, <title>)
PAGES = {
    "home":     ("index.html",               "Home"),
    "events":   ("events.html",              "Events"),
    "hub":      ("emerging-practices.html",  "Emerging practices"),
    "insights": ("case-studies.html",        "Case studies"),
    "voices":   ("community-voices.html",    "Community voices"),
    "about":    ("about.html",               "About"),
}
SITE_NAME = "NewCo Community"

def read(path):
    return open(path, encoding="utf-8").read()

def js_data_uri(js_text):
    b64 = base64.b64encode(js_text.encode("utf-8")).decode("ascii")
    return f"data:text/javascript;base64,{b64}"

support_js = read(f"{ROOT}/support.js")
image_slot_js = read(f"{ROOT}/image-slot.js")
fonts_css = read(f"{DS}/tokens/fonts.css")
colors_css = read(f"{DS}/tokens/colors.css")
typography_css = read(f"{DS}/tokens/typography.css")
spacing_css = read(f"{DS}/tokens/spacing.css")
ds_bundle_js = read(f"{DS}/_ds_bundle.js")

base_html = read(SRC)

# IMPORTANT: this page's own template runtime (support.js) walks the DOM and scans
# every text node for "{{...}}" mustache syntax. support.js's own source contains the
# literal substring "{{" (it's the code that implements that syntax), and _ds_bundle.js
# is large generated code that can't be guaranteed free of it either. Inlining either as
# literal <script>TEXT</script> puts that text where the walker scans it, and it tries to
# compile bogus "expressions" out of unrelated code -> SyntaxError at render time.
# Fix: reference scripts via a data: URI in `src` instead, so the DOM node's textContent
# stays empty (exactly like the original <script src="..."> did) while the whole file
# remains a single, fully self-contained artifact with zero network requests.

# 1. support.js
before_support = '<script src="./support.js"></script>'
assert base_html.count(before_support) == 1, f"support.js ref count={base_html.count(before_support)}"
base_html = base_html.replace(before_support, f'<script src="{js_data_uri(support_js)}"></script>')

# 2. helmet CSS links -> inline <style> (fine: none of these token files contain "{{",
#    verified separately, so inlining as literal text is safe). Google Fonts @import in
#    fonts.css stays as the one intentional external CDN dependency. Drop the styles.css
#    link entirely: it only re-@imports the four token files by relative path, which
#    won't resolve once bundled -- redundant with inlining them directly anyway.
#    _ds_bundle.js and image-slot.js -> data: URI `src` (same reasoning as support.js).
link_block = '''  <link rel="stylesheet" href="_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/tokens/fonts.css">
  <link rel="stylesheet" href="_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/tokens/colors.css">
  <link rel="stylesheet" href="_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/tokens/typography.css">
  <link rel="stylesheet" href="_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/tokens/spacing.css">
  <link rel="stylesheet" href="_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/styles.css">
  <script src="_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/_ds_bundle.js"></script>
  <script src="./image-slot.js"></script>'''
assert base_html.count(link_block) == 1, "helmet link block not found verbatim"

inlined = f'''  <style>
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
  <script src="{js_data_uri(ds_bundle_js)}"></script>
  <script src="{js_data_uri(image_slot_js)}"></script>'''
base_html = base_html.replace(link_block, inlined)

# 3. PA logo: the source already references the real file at "uploads/pa-logo.png"
# (a plain relative path, no inlining) -- just copy that file into the deploy folder
# so it actually resolves at the same relative location for the 6 root-level pages.
assert base_html.count('<img src="uploads/pa-logo.png" alt="PA Consulting"') == 2, \
    "expected 2 logo refs to uploads/pa-logo.png"

# 4. Multi-page split: one physical file per top-nav page, each booting straight to its
#    own page via the existing `defaultPage` prop (no client-side-only routing anymore).
default_page_marker = 'defaultPage&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;default&quot;:&quot;home&quot;'
assert base_html.count(default_page_marker) == 1, "defaultPage prop marker not found"

head_marker = '<meta name="viewport" content="width=device-width, initial-scale=1">'
assert base_html.count(head_marker) == 1, "viewport meta not found"

os.makedirs(f"{OUT_DIR}/uploads", exist_ok=True)
shutil.copy(f"{ROOT}/uploads/pa-logo.png", f"{OUT_DIR}/uploads/pa-logo.png")

for page_key, (filename, title) in PAGES.items():
    html = base_html.replace(
        default_page_marker,
        default_page_marker.replace("&quot;home&quot;", f"&quot;{page_key}&quot;")
    )
    html = html.replace(head_marker, f'{head_marker}\n<title>{title} — {SITE_NAME}</title>')
    out_path = f"{OUT_DIR}/{filename}"
    open(out_path, "w", encoding="utf-8").write(html)
    print("wrote", out_path, len(html), "bytes")
