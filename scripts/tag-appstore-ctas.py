#!/usr/bin/env python3
"""Tag App Store CTAs so /go/website.html can forward a campaign token.

Two idempotent passes:

1. href="/go/website.html" -> href="/go/website.html?c=<slug>_<cta-location>"
   Links that already carry ?c= are left untouched.

2. Direct anchors to our own app (id6749297170, iPhone and Mac share this
   listing) are rewritten to /go/website.html?c=<token>. Competitor apps,
   the /go redirect pages, and non-anchor URLs (JSON-LD, meta, canonical)
   are not touched. A page with one direct CTA uses the page slug; extra
   CTAs on the same page get a location suffix so they do not collapse.

target="_blank" links that have no rel get rel="noopener". Existing rel
values are preserved (noopener is appended only when missing).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Hand-picked slugs for the highest-traffic pages (match the growth plan's naming);
# everything else derives its slug from the file path.
SLUG_OVERRIDES = {
    "index.html": "homepage",
    "convert-tool/index.html": "convert_tool",
    "export-apple-health-data/index.html": "export_guide",
    "export-csv-data/index.html": "seo_export_csv",
    "blog/best-apple-health-export-apps.html": "blog_best_export_apps",
}

MAX_TOKEN_LEN = 40  # Apple ct= token limit
OWN_APP_ID = "6749297170"

ANCHOR_RE = re.compile(r"<a\b[^>]*>", re.I)
OWN_HREF_RE = re.compile(
    r"href\s*=\s*(?P<q>[\"'])"
    r"(?P<url>https://apps\.apple\.com/(?:[a-z]{2}/)?app/(?:[a-z0-9-]+/)?"
    r"id"
    + OWN_APP_ID
    + r"(?:\?[^\"']*)?)"
    r"(?P=q)",
    re.I,
)
STRUCTURAL_RE = re.compile(r"<(/?)(nav|header|aside|footer|main)\b", re.I)
HEADING_RE = re.compile(r"<h([1-3])\b[^>]*>(.*?)</h\1>", re.I | re.S)
BUTTON_RE = re.compile(r"\b(py-[0-9]|px-[0-9]|rounded-full)\b")
BUTTON_STYLE_RE = re.compile(r"display\s*:\s*inline-block", re.I)
DOWNLOAD_TEXT_RE = re.compile(
    r"download(\s+on|\s+from)?\s+(the\s+)?app\s+store|get\s+the\s+app|download\s+app",
    re.I,
)
SKIP_PARTS = {".claude", ".playwright-mcp", "go"}


def page_slug(rel_path: str) -> str:
    if rel_path in SLUG_OVERRIDES:
        return SLUG_OVERRIDES[rel_path]
    slug = rel_path
    slug = re.sub(r"/index\.html$", "", slug)
    slug = re.sub(r"\.html$", "", slug)
    slug = slug.replace("apple-health", "ah")  # keep tokens under Apple's 40-char cap
    slug = re.sub(r"[^a-z0-9]+", "_", slug.lower()).strip("_")
    return slug or "homepage"


def make_token(slug: str, location: str | None) -> str:
    token = f"{slug}_{location}" if location else slug
    token = re.sub(r"[^a-z0-9_]+", "_", token.lower())
    token = re.sub(r"_+", "_", token).strip("_")
    return token[:MAX_TOKEN_LEN].rstrip("_")


def containers_at(html: str, pos: int) -> list[str]:
    stack: list[str] = []
    for match in STRUCTURAL_RE.finditer(html, 0, pos):
        name = match.group(2).lower()
        if match.group(1):
            for i in range(len(stack) - 1, -1, -1):
                if stack[i] == name:
                    del stack[i:]
                    break
        else:
            stack.append(name)
    return stack


def inside_id(html: str, pos: int, element_id: str) -> bool:
    """True when pos is still inside the element that carries id=.

    Stop at that element's own close. Later sibling tags with the same
    name must not keep the element "open".
    """
    marker = f'id="{element_id}"'
    idx = html.rfind(marker, 0, pos)
    if idx == -1:
        return False
    tag_start = html.rfind("<", 0, idx)
    if tag_start == -1:
        return False
    name_m = re.match(r"<([a-zA-Z0-9]+)\b", html[tag_start:])
    if not name_m:
        return False
    name = name_m.group(1)
    depth = 0
    for match in re.finditer(rf"</?{name}\b[^>]*>", html[tag_start:pos], re.I):
        token = match.group(0)
        if token.startswith("</"):
            depth -= 1
            if depth <= 0:
                return False
        elif not token.rstrip().endswith("/>"):
            depth += 1
    return depth > 0


def after_main(html: str, pos: int) -> bool:
    close = html.rfind("</main>", 0, pos)
    if close == -1:
        return False
    return close > html.rfind("<main", 0, pos)


def before_first_h2(html: str, pos: int) -> bool:
    main_open = html.rfind("<main", 0, pos)
    start = main_open if main_open != -1 else html.rfind("<body", 0, pos)
    if start == -1:
        start = 0
    return re.search(r"<h2\b", html[start:pos], re.I) is None


def heading_text(raw: str) -> str:
    text = re.sub(r"<[^>]+>", "", raw)
    return re.sub(r"\s+", " ", text).strip()


def location_from_context(html: str, pos: int) -> str | None:
    """stepN / methodN from the nearest heading, else a step-number marker."""
    for match in reversed(list(HEADING_RE.finditer(html, 0, pos))):
        text = heading_text(match.group(2))
        step = re.search(r"\bstep\s*(\d+)\b", text, re.I)
        if step:
            return f"step{step.group(1)}"
        method = re.search(r"\bmethod\s*(\d+)\b", text, re.I)
        if method:
            return f"method{method.group(1)}"
        if match.group(1) == "2":
            break
    window_start = max(0, pos - 2500)
    marks = list(re.finditer(r'class="step-number"[^>]*>\s*(\d+)\s*<', html[window_start:pos]))
    if not marks:
        return None
    between = html[window_start + marks[-1].end() : pos]
    if re.search(r"<h2\b", between, re.I):
        return None
    return f"step{marks[-1].group(1)}"


def anchor_text(html: str, end_pos: int) -> str:
    match = re.match(r"(.*?)</a>", html[end_pos:], re.I | re.S)
    if not match:
        return ""
    text = re.sub(r"<[^>]+>", "", match.group(1))
    return re.sub(r"\s+", " ", text).strip()


def is_button(tag: str, text: str) -> bool:
    if BUTTON_RE.search(tag) and ("font-bold" in tag or "font-semibold" in tag or DOWNLOAD_TEXT_RE.search(text)):
        return True
    return bool(BUTTON_STYLE_RE.search(tag) and DOWNLOAD_TEXT_RE.search(text))


def infer_location(html: str, pos: int, tag: str, text: str) -> str:
    loc_m = re.search(r'data-cta-location=(["\'])([^"\']+)\1', tag)
    if loc_m:
        loc = re.sub(r"[^a-z0-9]+", "_", loc_m.group(2).lower()).strip("_")
        return loc or "cta"
    if inside_id(html, pos, "mobile-menu"):
        return "menu"
    containers = containers_at(html, pos)
    if any(name in containers for name in ("nav", "header", "aside")):
        return "nav"
    if "footer" in containers or after_main(html, pos):
        return "footer"
    if is_button(tag, text):
        return "hero" if before_first_h2(html, pos) else "cta"
    return location_from_context(html, pos) or "inline"


def uniquify(loc: str, used: set[str]) -> str:
    if loc not in used:
        used.add(loc)
        return loc
    if loc == "cta" and "cta_footer" not in used:
        used.add("cta_footer")
        return "cta_footer"
    n = 2
    while f"{loc}_{n}" in used:
        n += 1
    name = f"{loc}_{n}"
    used.add(name)
    return name


def ensure_noopener(tag: str) -> str:
    if not re.search(r"""target\s*=\s*(['"])_blank\1""", tag, re.I):
        return tag
    rel = re.search(r"""\brel\s*=\s*(['"])([^'"]*)\1""", tag, re.I)
    if rel:
        if "noopener" in rel.group(2).split():
            return tag
        return tag[: rel.start(2)] + (rel.group(2) + " noopener").strip() + tag[rel.end(2) :]
    return tag[:-1] + ' rel="noopener">'


def rewrite_own_app_anchors(html: str, slug: str) -> tuple[str, list[tuple[str, str]]]:
    matches = []
    for match in ANCHOR_RE.finditer(html):
        tag = match.group(0)
        href_m = OWN_HREF_RE.search(tag)
        if not href_m:
            continue
        matches.append((match.start(), match.end(), tag, href_m.group("url"), anchor_text(html, match.end())))

    if not matches:
        return html, []

    multi = len(matches) > 1
    used: set[str] = set()
    existing = set(re.findall(r"/go/website\.html\?c=([a-z0-9_]+)", html))
    replacements: list[tuple[int, int, str]] = []
    changes: list[tuple[str, str]] = []

    for start, end, tag, old_url, text in matches:
        location = uniquify(infer_location(html, start, tag, text), used) if multi else None
        token = make_token(slug, location)
        n = 2
        while token in existing:
            token = make_token(slug, f"{location or 'cta'}_{n}")
            n += 1
        existing.add(token)
        new_tag = OWN_HREF_RE.sub(
            lambda m, token=token: f"href={m.group('q')}/go/website.html?c={token}{m.group('q')}",
            tag,
            count=1,
        )
        new_tag = ensure_noopener(new_tag)
        replacements.append((start, end, new_tag))
        new_href = re.search(r'href=(["\'])([^"\']+)\1', new_tag).group(2)
        changes.append((old_url, new_href))

    for start, end, new_tag in reversed(replacements):
        html = html[:start] + new_tag + html[end:]
    return html, changes


def tag_untagged_go_links(html: str, slug: str) -> tuple[str, list[tuple[str, str]]]:
    changes: list[tuple[str, str]] = []

    def repl(match: re.Match) -> str:
        tag = match.group(0)
        if 'href="/go/website.html"' not in tag:
            return tag
        loc_m = re.search(r'data-cta-location="([^"]*)"', tag)
        location = loc_m.group(1) if loc_m else None
        token = make_token(slug, location)
        new_tag = tag.replace('href="/go/website.html"', f'href="/go/website.html?c={token}"')
        changes.append(("/go/website.html", f"/go/website.html?c={token}"))
        return new_tag

    return ANCHOR_RE.sub(repl, html), changes


def rewrite_html(html: str, rel_path: str) -> tuple[str, list[tuple[str, str]]]:
    slug = page_slug(rel_path)
    html, go_changes = tag_untagged_go_links(html, slug)
    html, direct_changes = rewrite_own_app_anchors(html, slug)
    return html, go_changes + direct_changes


def html_files() -> list[Path]:
    return [
        p
        for p in ROOT.rglob("*.html")
        if not (set(p.parts) & SKIP_PARTS)
    ]


def tag_file(path: Path) -> list[tuple[str, str]]:
    rel = str(path.relative_to(ROOT))
    html = path.read_text(encoding="utf-8")
    new_html, changes = rewrite_html(html, rel)
    if new_html != html:
        path.write_text(new_html, encoding="utf-8")
    return changes


def main(argv: list[str] | None = None) -> int:
    dry_run = "--dry-run" in (argv if argv is not None else sys.argv[1:])
    total = 0
    for path in sorted(html_files()):
        rel = str(path.relative_to(ROOT))
        html = path.read_text(encoding="utf-8")
        new_html, changes = rewrite_html(html, rel)
        if not changes:
            continue
        for old, new in changes:
            print(f"{rel}: {old} -> {new}")
        total += len(changes)
        if not dry_run and new_html != html:
            path.write_text(new_html, encoding="utf-8")
    print(f"\n{total} CTA links tagged.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
