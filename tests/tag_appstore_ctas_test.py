"""Rewrites for scripts/tag-appstore-ctas.py. No site files are modified."""
import importlib.util
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "tag_appstore_ctas", ROOT / "scripts" / "tag-appstore-ctas.py"
)
tag = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(tag)

TOKEN_RE = re.compile(r"^[a-z0-9_]{1,40}$")


def tokens(html: str) -> list[str]:
    return re.findall(r'href="/go/website\.html\?c=([^"]+)"', html)


class TagAppStoreCtasTest(unittest.TestCase):
    def test_single_direct_link_uses_page_slug(self):
        html = '<p><a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170">Download on the App Store</a></p>'
        new, changes = tag.rewrite_html(html, "export-oura-data/index.html")
        self.assertEqual(changes[0][1], "/go/website.html?c=export_oura_data")
        self.assertIn(">Download on the App Store</a>", new)
        self.assertNotIn("id6749297170", new)

    def test_competitor_jsonld_and_other_app_stay_direct(self):
        html = """
        <script type="application/ld+json">
          {"url": "https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170"}
        </script>
        <a href="https://apps.apple.com/us/app/health-export-csv/id1477944755">Health Export CSV</a>
        <a href="https://apps.apple.com/us/app/health-sync-for-openclaw/id6759522298" target="_blank" rel="noopener noreferrer">Health Sync</a>
        <meta http-equiv="refresh" content="0; url=https://apps.apple.com/us/app/health-data-ai-analyzer/id6749297170?ct=website&mt=8">
        """
        new, changes = tag.rewrite_html(html, "blog/best-apple-health-export-apps.html")
        self.assertEqual(changes, [])
        self.assertEqual(new, html)

    def test_blank_target_gets_noopener_existing_rel_kept(self):
        html = """
        <nav><a href="https://apps.apple.com/app/id6749297170" target="_blank">Download App</a></nav>
        <a href="https://apps.apple.com/us/app/health-data-export/id6749297170" target="_blank" rel="noopener noreferrer">Download</a>
        """
        new, changes = tag.rewrite_html(html, "blog/openclaw-apple-health-export.html")
        self.assertIn('href="/go/website.html?c=blog_openclaw_ah_export_nav" target="_blank" rel="noopener"', new)
        self.assertIn('rel="noopener noreferrer"', new)
        self.assertTrue(all(TOKEN_RE.match(c[1].split("c=")[1]) for c in changes))

    def test_mobile_menu_does_not_swallow_later_cta(self):
        html = """
        <nav>
          <a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170" target="_blank">Download App</a>
          <div id="mobile-menu"><div><a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170" target="_blank">Download App</a></div></div>
        </nav>
        <div id="dashboard">
          <h2>Build your own dashboard</h2>
          <a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170" target="_blank" class="font-semibold px-5 py-2.5">Get the App</a>
        </div>
        """
        new, _ = tag.rewrite_html(html, "dashboard/index.html")
        self.assertEqual(tokens(new), ["dashboard_nav", "dashboard_menu", "dashboard_cta"])

    def test_method_and_step_locations(self):
        html = """
        <aside><nav><a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170" target="_blank">Download App</a></nav></aside>
        <main>
          <h2>Method 1: Using the Health Data Export App</h2>
          <h3>How to export</h3>
          <p><a href="https://apps.apple.com/us/app/health-data-export-ai-analyzer/id6749297170">download it from the App Store</a></p>
        </main>
        """
        new, _ = tag.rewrite_html(html, "docs/export-health-data.html")
        self.assertEqual(tokens(new), ["docs_export_health_data_nav", "docs_export_health_data_method1"])

    def test_idempotent_and_untagged_go_links(self):
        html = '<a href="/go/website.html" data-cta-location="method1">Download</a>'
        once, _ = tag.rewrite_html(html, "export-apple-health-data/index.html")
        twice, changes = tag.rewrite_html(once, "export-apple-health-data/index.html")
        self.assertEqual(once, twice)
        self.assertEqual(changes, [])
        self.assertIn("/go/website.html?c=export_guide_method1", once)

    def test_go_pages_are_skipped(self):
        files = {str(p.relative_to(tag.ROOT)) for p in tag.html_files()}
        self.assertNotIn("go/website.html", files)
        self.assertTrue(all(not p.startswith("go/") for p in files))

    def test_token_length_cap(self):
        self.assertLessEqual(len(tag.make_token("docs_export_health_data", "method1")), 40)
        self.assertLessEqual(len(tag.make_token("blog_openclaw_ah_export", "cta_footer")), 40)

    def test_truncated_inline_suffixes_stay_unique(self):
        # blog_private_health_data_analysis is 33 chars. _inline fits in 40;
        # _inline_2 / _inline_3 do not, and a blind [:40] makes them identical.
        html = """
        <p><a href="https://apps.apple.com/us/app/id6749297170">first analyzer note</a></p>
        <p><a href="https://apps.apple.com/us/app/id6749297170">second analyzer note</a></p>
        <p><a href="https://apps.apple.com/us/app/id6749297170">third analyzer note</a></p>
        """
        new, _ = tag.rewrite_html(html, "blog/private-health-data-analysis.html")
        got = tokens(new)
        self.assertEqual(
            got,
            [
                "blog_private_health_data_analysis_inline",
                "blog_private_health_data_analysis_inli_2",
                "blog_private_health_data_analysis_inli_3",
            ],
        )
        self.assertEqual(len(set(got)), 3)
        for token in got:
            self.assertRegex(token, r"^[a-z0-9_]{1,40}$")

    def test_preexisting_token_collision_retries_with_reserved_suffix(self):
        taken = tag.make_token("blog_private_health_data_analysis", "inline")
        html = f"""
        <a href="/go/website.html?c={taken}">tagged</a>
        <p><a href="https://apps.apple.com/us/app/id6749297170">one</a></p>
        <p><a href="https://apps.apple.com/us/app/id6749297170">two</a></p>
        """
        new, _ = tag.rewrite_html(html, "blog/private-health-data-analysis.html")
        got = tokens(new)
        self.assertEqual(got[0], taken)
        self.assertEqual(len(got), 3)
        self.assertEqual(len(set(got)), 3)
        for token in got:
            self.assertLessEqual(len(token), 40)

    def test_homepage_store_ctas_keep_distinct_ahd_home_tags(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        rewritten, changes = tag.rewrite_html(html, "index.html")
        self.assertEqual(changes, [])
        self.assertEqual(rewritten, html)
        got = tokens(html)
        self.assertEqual(
            got,
            ["ahd_home_nav", "ahd_home_hero", "ahd_home_offer", "ahd_home_closing"],
        )
        self.assertEqual(len(set(got)), len(got))
        for token in got:
            self.assertRegex(token, r"^ahd_home_[a-z0-9_]{1,31}$")
            self.assertLessEqual(len(token), 40)

    def test_collision_retry_fails_when_truncation_makes_no_progress(self):
        stuck = "a" * 40
        real = tag.make_token

        def fake(slug, location=None):
            return stuck

        tag.make_token = fake
        try:
            with self.assertRaises(RuntimeError) as ctx:
                tag.allocate_token("blog_private_health_data_analysis", "inline", {stuck})
        finally:
            tag.make_token = real
        self.assertIn("no progress", str(ctx.exception).lower())
        self.assertIn(stuck, str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
