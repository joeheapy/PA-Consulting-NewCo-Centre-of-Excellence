import re, base64, sys, os, shutil

ROOT = "."
SRC = f"{ROOT}/NewCo Community Microsite.dc.html"
DS_HREF = "_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4"
DS = f"{ROOT}/{DS_HREF}"
OUT_DIR = f"{ROOT}/netlify-deploy"

# page key (matches the app's internal S.page value) -> (output filename, <title>)
PAGES = {
    "home":     ("index.html",               "Home"),
    "events":   ("events.html",              "Events"),
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

# NOTE: the source .dc.html is sometimes reformatted by external tooling (the Design
# Canvas editor / a save-time formatter) -- attributes get split one-per-line, tags
# gain/lose a self-closing " />", and the data-props JSON attribute has switched
# between single-quoted-with-literal-quotes and double-quoted-with-&quot; encoding
# before. The matching below is regex-based and whitespace/self-closing tolerant
# specifically so a future reformat doesn't silently break this script the way an
# exact-string match would. `[^>]*` already spans newlines (it's a negated character
# class, not `.`), so it matches multi-line attribute lists without needing re.DOTALL.

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
support_re = re.compile(r'<script[^>]*src="\./support\.js"[^>]*></script>')
assert len(support_re.findall(base_html)) == 1, "support.js <script> tag not found"
base_html = support_re.sub(f'<script src="{js_data_uri(support_js)}"></script>', base_html, count=1)

# 2. helmet CSS links -> inline <style> (fine: none of these token files contain "{{",
#    verified separately, so inlining as literal text is safe). Google Fonts @import in
#    fonts.css stays as the one intentional external CDN dependency. Drop the styles.css
#    link entirely: it only re-@imports the four token files by relative path, which
#    won't resolve once bundled -- redundant with inlining them directly anyway.
#    _ds_bundle.js and image-slot.js -> data: URI `src` (same reasoning as support.js).
link_section_re = re.compile(
    r'<link[^>]*href="' + re.escape(f'{DS_HREF}/tokens/fonts.css') + r'"[^>]*>\s*'
    r'<link[^>]*href="' + re.escape(f'{DS_HREF}/tokens/colors.css') + r'"[^>]*>\s*'
    r'<link[^>]*href="' + re.escape(f'{DS_HREF}/tokens/typography.css') + r'"[^>]*>\s*'
    r'<link[^>]*href="' + re.escape(f'{DS_HREF}/tokens/spacing.css') + r'"[^>]*>\s*'
    r'<link[^>]*href="' + re.escape(f'{DS_HREF}/styles.css') + r'"[^>]*>\s*'
    r'<script[^>]*src="' + re.escape(f'{DS_HREF}/_ds_bundle.js') + r'"[^>]*></script>\s*'
    r'<script[^>]*src="\./image-slot\.js"[^>]*></script>'
)
assert len(link_section_re.findall(base_html)) == 1, "helmet link/script section not found"

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
base_html = link_section_re.sub(lambda m: inlined, base_html, count=1)

# 3. Logos: the source references real files by plain relative path (no inlining) --
# the NewCo wordmark in the header and the PA logo in the footer. Just copy both files
# into the deploy folder so they resolve at the same relative location for the
# root-level pages.
nav_logo_re = re.compile(r'<img[^>]*src="uploads/newco-logo-pink\.png"[^>]*>')
assert len(nav_logo_re.findall(base_html)) == 1, "expected 1 header logo ref to uploads/newco-logo-pink.png"
pa_logo_re = re.compile(r'<img[^>]*src="uploads/pa-logo\.png"[^>]*>')
assert len(pa_logo_re.findall(base_html)) == 1, "expected 1 footer logo ref to uploads/pa-logo.png"

# 4. Multi-page split: one physical file per top-nav page, each booting straight to its
#    own page via the existing `defaultPage` prop (no client-side-only routing anymore).
#    The data-props attribute's JSON has been seen both double-quoted-with-&quot; and
#    single-quoted-with-literal-quotes -- try both encodings.
default_page_candidates = [
    'defaultPage":{"editor":"enum","default":"home"',
    'defaultPage&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;default&quot;:&quot;home&quot;',
]
default_page_marker = next((m for m in default_page_candidates if base_html.count(m) == 1), None)
assert default_page_marker, "defaultPage prop marker not found in either quoting style"
home_token = '"home"' if '"home"' in default_page_marker else '&quot;home&quot;'

head_marker_re = re.compile(r'<meta\s+name="viewport"[^>]*>')
head_matches = head_marker_re.findall(base_html)
assert len(head_matches) == 1, "viewport meta not found"
head_marker = head_matches[0]

os.makedirs(f"{OUT_DIR}/uploads", exist_ok=True)
shutil.copy(f"{ROOT}/uploads/pa-logo.png", f"{OUT_DIR}/uploads/pa-logo.png")
shutil.copy(f"{ROOT}/uploads/newco-logo-pink.png", f"{OUT_DIR}/uploads/newco-logo-pink.png")

# Event media (images/videos) referenced by filename from event frontmatter -- copy the
# whole folder wholesale so any file dropped in it ships, without the build script
# needing to know about individual filenames.
if os.path.isdir(f"{ROOT}/uploads/events"):
    shutil.copytree(f"{ROOT}/uploads/events", f"{OUT_DIR}/uploads/events", dirs_exist_ok=True)

for page_key, (filename, title) in PAGES.items():
    html = base_html.replace(
        default_page_marker,
        default_page_marker.replace(home_token, home_token.replace("home", page_key))
    )
    html = html.replace(head_marker, f'{head_marker}\n<title>{title} — {SITE_NAME}</title>')
    out_path = f"{OUT_DIR}/{filename}"
    open(out_path, "w", encoding="utf-8").write(html)
    print("wrote", out_path, len(html), "bytes")
