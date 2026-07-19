#!/usr/bin/env python3
"""Tag every /go/website.html App Store CTA with a per-page+location campaign token.

Rewrites href="/go/website.html" -> href="/go/website.html?c=<slug>_<cta-location>"
so the redirect page can forward the token as the App Store ct= parameter.
Idempotent: links that already carry ?c= are left untouched.
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


def tag_file(path: Path) -> list[tuple[str, str]]:
    rel = str(path.relative_to(ROOT))
    slug = page_slug(rel)
    html = path.read_text(encoding="utf-8")
    changes: list[tuple[str, str]] = []

    def repl(m: re.Match) -> str:
        tag = m.group(0)
        if 'href="/go/website.html"' not in tag:
            return tag
        loc_m = re.search(r'data-cta-location="([^"]*)"', tag)
        location = loc_m.group(1) if loc_m else None
        token = make_token(slug, location)
        changes.append((location or "(no location)", token))
        return tag.replace('href="/go/website.html"', f'href="/go/website.html?c={token}"')

    new_html = re.sub(r"<a\b[^>]*>", repl, html)
    if new_html != html:
        path.write_text(new_html, encoding="utf-8")
    return changes


def main() -> None:
    files = [
        p
        for p in ROOT.rglob("*.html")
        if ".claude" not in p.parts and ".playwright-mcp" not in p.parts and "go" not in p.parts
    ]
    total = 0
    for path in sorted(files):
        changes = tag_file(path)
        if changes:
            rel = path.relative_to(ROOT)
            for location, token in changes:
                print(f"{rel}: {location} -> ?c={token}")
            total += len(changes)
    print(f"\n{total} CTA links tagged.")


if __name__ == "__main__":
    sys.exit(main())
