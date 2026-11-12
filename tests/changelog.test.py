from pathlib import Path
import json,re,subprocess,unittest
ROOT=Path(__file__).resolve().parents[1]
class ChangelogTest(unittest.TestCase):
 def test_all_verified_releases_render_once(self):
  data=json.loads((ROOT/'docs/measurement/changelog-source-2026-11-12.json').read_text())
  text=(ROOT/'changelog.html').read_text()
  self.assertEqual(len(data['releases']),28)
  for r in data['releases']:
   self.assertEqual(text.count('data-release="'+r['platform']+'-'+r['version']+'"'),1)
   self.assertTrue(r['official_release_notes'])
   self.assertLessEqual(r['date_utc'],data['verified_on'])
  dates=[r['date_utc'] for r in data['releases']]
  self.assertEqual(dates,sorted(dates,reverse=True))
  self.assertIn('iPhone 1.113',text);self.assertIn('Mac 2.012',text)
  self.assertNotIn('Showing 29 updates',text)
 def test_preserves_archived_timeline(self):
  old=subprocess.check_output(['git','show','2a529aa:changelog.html'],cwd=ROOT).decode()
  new=(ROOT/'changelog.html').read_text()
  marker='        <div class="day">'
  self.assertEqual(old[old.index(marker):],new[new.index(marker):])
 def test_discloses_sources_and_date_basis(self):
  text=(ROOT/'changelog.html').read_text()
  self.assertIn('Dates use UTC',text)
  self.assertIn('platform=iphone',text);self.assertIn('platform=mac',text)
  self.assertIn('Pro features require',text)
if __name__=='__main__':unittest.main()
