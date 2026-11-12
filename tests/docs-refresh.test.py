from pathlib import Path
import re, unittest
from urllib.parse import urlsplit, unquote
ROOT=Path(__file__).resolve().parents[1]
class DocsRefresh(unittest.TestCase):
 def test_preview_is_labeled_and_searchable(self):
  s=(ROOT/'docs/new-interface-preview.html').read_text()
  for phrase in ['test builds','not a new App Store release','AI Chat is not available','same Wi-Fi','Other (JSON)','90 days','Back','token','not two-way']:
   self.assertIn(phrase,s)
  self.assertIn('/docs/new-interface-preview.html',(ROOT/'docs/search-index.json').read_text())
 def test_new_guide_internal_links_resolve(self):
  s=(ROOT/'docs/new-interface-preview.html').read_text()
  for href in re.findall(r'href="([^"]+)"',s):
   u=urlsplit(href)
   if u.scheme or not u.path.startswith('/'):continue
   p=ROOT/unquote(u.path.lstrip('/'))
   if p.is_dir():p=p/'index.html'
   self.assertTrue(p.exists(),href)
   if u.fragment:self.assertIn('id="'+u.fragment+'"',p.read_text())
 def test_privacy_claims_and_navigation(self):
  for p in (ROOT/'docs').glob('*.html'):
   s=p.read_text()
   self.assertIn('href="/docs/new-interface-preview.html"',s,p.name)
   self.assertNotIn('All data processing happens locally on your devices.',s)
   self.assertNotIn('Data never leaves the machine.',s)
   self.assertNotIn('your health data never crosses the network',s)
   self.assertIn('aria-label="Open documentation navigation"',s,p.name)
 def test_new_guide_structure(self):
  s=(ROOT/'docs/new-interface-preview.html').read_text()
  self.assertEqual(s.count('<h1>'),1)
  self.assertEqual(s.count('<main '),1)
  self.assertIn('scope="col"',s)
  self.assertIn('<figcaption>',s)
  self.assertIn('href="https://applehealthdata.com/docs/new-interface-preview.html"',s)
if __name__=='__main__':unittest.main()
