#!/usr/bin/env node
/**
 * Regenerates sitemap.xml from the HTML files in the site root.
 *
 * A page is included unless it opts out, so new pages (city pages, guides)
 * are picked up automatically and the sitemap can never drift again:
 *   - skipped when it carries <meta name="robots" content="...noindex...">
 *   - skipped when its rel=canonical points at a different page (duplicate)
 *
 * lastmod comes from the file's last git commit, not mtime, so a fresh
 * checkout does not rewrite every date.
 *
 * Usage: node scripts/build-sitemap.js [--check]
 *   --check exits 1 if sitemap.xml is out of date (for CI / pre-deploy)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://getmoved.app';
const OUT = path.join(ROOT, 'sitemap.xml');

// Longest match wins; city pages fall through to the *-movers.html default.
const PRIORITY = [
  [/^index\.html$/, '1.0'],
  [/^(new-york|new-jersey|arizona)-movers\.html$/, '0.9'],
  [/^(free-moving-quote|quick-quote|quote)\.html$/, '0.9'],
  [/^(software|how-it-works)\.html$/, '0.8'],
  [/^(for-movers|pricing|test-ai|guides\/.+)\.html$/, '0.7'],
  [/-movers\.html$/, '0.6'],
  [/^(about|contact|mobile-app|partners|register-as-mover)\.html$/, '0.5'],
  [/^(terms|privacy)\.html$/, '0.3'],
];

const priorityFor = (rel) => (PRIORITY.find(([rx]) => rx.test(rel)) || [null, '0.5'])[1];

function lastmod(rel) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', rel], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    if (out) return out.slice(0, 10);
  } catch {
    /* untracked or no git - fall through */
  }
  return new Date(fs.statSync(path.join(ROOT, rel)).mtime).toISOString().slice(0, 10);
}

function collect(dir = '', depth = 0) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    // Only the site root plus an optional guides/ folder; skip vendor and theme trees.
    if (entry.isDirectory()) {
      if (depth === 0 && entry.name === 'guides') out.push(...collect(rel, depth + 1));
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');

    const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    if (robots && /noindex/i.test(robots[1])) continue;

    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    if (canonical) {
      const own = `${ORIGIN}/${rel === 'index.html' ? '' : rel}`;
      if (canonical[1].replace(/\/$/, '') !== own.replace(/\/$/, '')) continue; // duplicate of another page
    }
    out.push(rel);
  }
  return out;
}

const pages = collect().sort((a, b) => {
  const d = Number(priorityFor(b)) - Number(priorityFor(a));
  return d !== 0 ? d : a.localeCompare(b);
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((rel) => {
    const loc = `${ORIGIN}/${rel === 'index.html' ? '' : rel}`;
    return `  <url><loc>${loc}</loc><lastmod>${lastmod(rel)}</lastmod><priority>${priorityFor(rel)}</priority></url>`;
  }),
  '</urlset>',
  '',
].join('\n');

if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== xml) {
    console.error(`sitemap.xml is out of date - run: node scripts/build-sitemap.js`);
    process.exit(1);
  }
  console.log(`sitemap.xml up to date (${pages.length} URLs)`);
  process.exit(0);
}

fs.writeFileSync(OUT, xml);
console.log(`sitemap.xml written: ${pages.length} URLs`);
