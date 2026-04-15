#!/usr/bin/env node
// Generates docs/search-index.json from all doc HTML files.
// Run: node docs/build-search-index.js

const fs = require('fs');
const path = require('path');

const docsDir = __dirname;
const outputFile = path.join(docsDir, 'search-index.json');

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractMeta(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? stripTags(m[1]) : '';
}

function extractAttr(html, selector, attr) {
  const re = new RegExp(`<meta[^>]+name="${selector}"[^>]+content="([^"]*)"`, 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.html') && f !== 'build-search-index.js');

const index = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(docsDir, file), 'utf8');

  // Page title
  const title = extractMeta(raw, 'title').replace(' — Health Data Export Docs', '').replace(' — Health Data Export & AI Analyzer', '');

  // URL path
  const url = file === 'index.html' ? '/docs/' : `/docs/${file}`;

  // Extract all headings and their following content as sections
  const sectionRe = /<h([23])[^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[123]|<\/div>|$)/gi;
  let match;
  const sections = [];

  while ((match = sectionRe.exec(raw)) !== null) {
    const heading = stripTags(match[2]);
    // Grab up to 200 chars of text content after the heading
    const bodyHtml = match[3];
    // Strip script/style blocks
    const cleanBody = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const bodyText = stripTags(cleanBody).slice(0, 200);
    if (heading && heading.length > 1) {
      sections.push({ heading, snippet: bodyText });
    }
  }

  // Also grab intro text (first <p> in doc-content)
  const introMatch = raw.match(/class="doc-content"[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  const intro = introMatch ? stripTags(introMatch[1]).slice(0, 200) : '';

  index.push({ title, url, intro, sections });
}

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log(`Built search index: ${index.length} pages, written to search-index.json`);
