"""Check that the visual-only rollout preserves every original page byte."""
from pathlib import Path
import subprocess
import unittest
import re
ROOT=Path(__file__).resolve().parents[1]
BASE='d2649518eeba53b6e72131178ffe47b9c3699830'
LINK='<link rel="stylesheet" href="/styles/apple-site.css" data-health-site-theme="apple-dark">\n'
CREDIT='<div class="hd-site-credit"><a href="https://www.vividsites.app/" target="_blank" rel="noopener">Made by VividSites <span aria-hidden="true">↗</span></a></div>\n'
class SharedThemeTest(unittest.TestCase):
 def test_preserves_original_markup_scripts_and_metadata(self):
  changed=[]
  for p in ROOT.rglob('*.html'):
   text=p.read_text()
   if LINK not in text:continue
   rel=p.relative_to(ROOT).as_posix();changed.append(rel)
   original=subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT).decode()
   with self.subTest(page=rel):
    self.assertEqual(text.count(LINK),1);self.assertEqual(text.count(CREDIT),1)
    self.assertEqual(text.replace(LINK,'').replace(CREDIT,''),original)
  self.assertEqual(len(changed),78)
 def test_shared_theme_does_not_overlap_dedicated_homepage_or_blog(self):
  for p in [ROOT/'index.html',*(ROOT/'blog').glob('*.html')]:
   self.assertNotIn(LINK,p.read_text())
  self.assertEqual((ROOT/'js/homepage-analytics.js').read_bytes(),subprocess.check_output(['git','show',BASE+':js/homepage-analytics.js'],cwd=ROOT))
 def test_styles_do_not_change_visibility_or_layout(self):
  css=(ROOT/'styles/apple-site.css').read_text()
  main=css.split('.hd-site-credit')[0]
  for prop in ['display:','visibility:','position:','width:','height:','pointer-events:']:
   self.assertIsNone(re.search(r'[;{]\s*'+re.escape(prop),main))
  self.assertIn('prefers-reduced-motion',css)
if __name__=='__main__':unittest.main()
