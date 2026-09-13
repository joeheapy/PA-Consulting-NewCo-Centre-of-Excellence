import re, base64, sys

ROOT = "."
SRC = f"{ROOT}/NewCo Community Microsite.dc.html"
DS = f"{ROOT}/_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4"
OUT = f"{ROOT}/netlify-deploy/index.html"

html = open(SRC, encoding="utf-8").read()

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

logo_svg = open(f"{ROOT}/uploads/PA logo.svg", "rb").read()
logo_b64 = "data:image/svg+xml;base64," + base64.b64encode(logo_svg).decode("ascii")

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
before = '<script src="./support.js"></script>'
assert html.count(before) == 1, f"support.js ref count={html.count(before)}"
html = html.replace(before, f'<script src="{js_data_uri(support_js)}"></script>')

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
assert html.count(link_block) == 1, "helmet link block not found verbatim"

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
html = html.replace(link_block, inlined)

# 3. PA logo -> base64 data URI (appears twice: header + footer)
before_logo = '<img src="uploads/PA logo.svg" alt="PA Consulting"'
count = html.count(before_logo)
assert count == 2, f"expected 2 logo refs, found {count}"
html = html.replace(before_logo, f'<img src="{logo_b64}" alt="PA Consulting"')

open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html), "bytes")
