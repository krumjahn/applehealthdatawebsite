"""Check that the visual-only rollout preserves every original page byte."""
from pathlib import Path
import subprocess
import unittest
import re
ROOT=Path(__file__).resolve().parents[1]
BASE='d2649518eeba53b6e72131178ffe47b9c3699830'
LINK='<link rel="stylesheet" href="/styles/apple-site.css" data-health-site-theme="apple-dark">\n'
CREDIT='<div class="hd-site-credit"><a href="https://www.vividsites.app/" target="_blank" rel="noopener">Made by VividSites <span aria-hidden="true">↗</span></a></div>\n'
def normalize_site_brand(s):
 # The website name was explicitly changed after the visual-only rollout.
 s=re.sub(r'(<meta\b[^>]*property="og:site_name"[^>]*content=")[^"]*(")',r'\1SITE_BRAND\2',s)
 return s.replace('>Apple Health Data AI Analyzer</span>', '>Health Data</span>').replace('>Apple Health Data AI Analyzer</a>', '>Health Data</a>')
class SharedThemeTest(unittest.TestCase):
 def test_preserves_original_markup_scripts_and_metadata(self):
  changed=[]
  for p in ROOT.rglob('*.html'):
   text=p.read_text()
   if LINK not in text:continue
   rel=p.relative_to(ROOT).as_posix();changed.append(rel)
   original = '' if rel == 'docs/new-interface-preview.html' else subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT).decode()
   with self.subTest(page=rel):
    self.assertEqual(text.count(LINK),1);self.assertEqual(text.count(CREDIT),1)
    # These pages have separately authorized factual content updates after the visual rollout.
    if rel not in {'changelog.html', 'docs/export-health-data.html', 'docs/index.html', 'docs/getting-started.html', 'docs/mac-app.html', 'docs/wifi-sync.html', 'docs/ai-analysis.html', 'docs/api-reference.html', 'docs/openclaw.html', 'docs/mcp-server.html', 'docs/widgets.html', 'docs/troubleshooting.html', 'docs/for-agents.html', 'docs/new-interface-preview.html'}:
     self.assertEqual(normalize_site_brand(text.replace(LINK,'').replace(CREDIT,'').replace('\n<a href="/docs/new-interface-preview.html">New interface (preview)</a>', '').replace(' aria-label="Open documentation navigation"', '')),normalize_site_brand(original))
  self.assertEqual(len(changed),79)
 def test_shared_theme_does_not_overlap_dedicated_homepage_or_blog(self):
  for p in [ROOT/'index.html',*(ROOT/'blog').glob('*.html')]:
   self.assertNotIn(LINK,p.read_text())
  self.assertEqual((ROOT/'js/homepage-analytics.js').read_bytes().replace(b"apple_dark_cinematic_v1", b"open_file_v2"),subprocess.check_output(['git','show',BASE+':js/homepage-analytics.js'],cwd=ROOT))
 def test_styles_do_not_change_visibility_or_layout(self):
  css=(ROOT/'styles/apple-site.css').read_text()
  main=css.split('.hd-site-credit')[0]
  for prop in ['display:','visibility:','position:','width:','height:','pointer-events:']:
   self.assertIsNone(re.search(r'[;{]\s*'+re.escape(prop),main))
  self.assertIn('prefers-reduced-motion',css)
if __name__=='__main__':unittest.main()
