#!/usr/bin/env node
// EAT FROM BOTH SIDES — Dropbox waste + Paper from the web
// Inside (personal cloud) + Outside (academic papers) = both membranes fed

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const INTAKE = path.join(__dirname, 'data', 'intake');
const NUTRIENTS = path.join(__dirname, 'data', 'nutrients');
const log = (msg) => console.log('[BOTH ' + new Date().toISOString() + '] ' + msg);

function fetch(url, timeout) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Gaia/1.0 (primals.eco; eating-both-sides)' },
      timeout: timeout || 10000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        if (loc.startsWith('http')) return fetch(loc, timeout).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d, bytes: d.length }));
    });
    req.on('error', reject);
    req.on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

function saveAndDigest(name, data, bytes) {
  const file = name + '-2026-10-26-both.json';
  fs.writeFileSync(path.join(INTAKE, file), JSON.stringify({
    _source: name, _fetched: new Date().toISOString(), _bytes: bytes,
    _both_sides: true, data: data
  }, null, 2));

  const titles = data.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
  const links = data.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const domains = [...new Set(links.map(l => {
    try { return new URL(l).hostname; } catch(e) { return 'x'; }
  }))];

  fs.writeFileSync(path.join(NUTRIENTS, 'n-' + file), JSON.stringify({
    _source_file: file, _digested: new Date().toISOString(),
    _both_sides: true, source: name,
    feed_name: titles[0] ? titles[0].replace(/<[^>]+>/g, '').trim() : name,
    items: titles.slice(1, 20).map(t => t.replace(/<[^>]+>/g, '').trim()),
    item_count: titles.length - 1, link_count: links.length,
    unique_domains: domains.slice(0, 25), raw_bytes: bytes,
    richness: bytes > 50000 ? 'dense' : bytes > 10000 ? 'moderate' : 'light'
  }, null, 2));

  return { items: titles.length - 1, domains: domains.length };
}

async function eatBothSides() {
  log('═══ EATING FROM BOTH SIDES ═══');
  log('INSIDE (corporate cloud waste) + OUTSIDE (papers from the web)');
  log('');

  const feeds = [
    // === INSIDE: CLOUD CORPORATE WASTE ===
    // Dropbox
    ['dropbox-tech', 'https://dropbox.tech/feed'],
    ['dropbox-blog', 'https://blog.dropbox.com/feed/'],
    ['dropbox-gh-rust', 'https://api.github.com/repos/dropbox/rust-brotli/releases'],
    ['dropbox-gh-lepton', 'https://api.github.com/repos/dropbox/lepton/releases'],
    // Box
    ['box-blog', 'https://blog.box.com/feed/'],
    ['box-dev', 'https://medium.com/feed/box-developer-blog'],
    // Notion
    ['notion-blog', 'https://www.notion.so/blog/rss'],
    // Vercel
    ['vercel-blog', 'https://vercel.com/atom'],
    ['nextjs-blog', 'https://nextjs.org/feed.xml'],
    // Supabase
    ['supabase-blog', 'https://supabase.com/blog/rss.xml'],
    // Fly.io
    ['fly-blog', 'https://fly.io/blog/feed.xml'],
    // Tailscale
    ['tailscale-blog', 'https://tailscale.com/blog/index.xml'],
    // Deno
    ['deno-blog', 'https://deno.com/feed'],
    // Oxide
    ['oxide-blog', 'https://oxide.computer/blog/feed'],
    // Fastly
    ['fastly-blog', 'https://www.fastly.com/blog/rss.xml'],

    // === OUTSIDE: PAPERS FROM THE WEB ===
    // Semantic Scholar trending
    ['semanticscholar-cs', 'https://api.semanticscholar.org/graph/v1/paper/search?query=neural+network&limit=20&fields=title,year'],
    // bioRxiv preprints
    ['biorxiv-neuro', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=neuroscience'],
    ['biorxiv-bioinfo', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=bioinformatics'],
    ['biorxiv-sysbio', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=systems_biology'],
    ['biorxiv-evol', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=evolutionary_biology'],
    // medRxiv
    ['medrxiv-all', 'https://connect.medrxiv.org/medrxiv_xml.php?subject='],
    // SSRN
    ['ssrn-recent', 'https://papers.ssrn.com/sol3/Jeljour_results.cfm?form_name=journalBrowse&journal_id=3526074&Network=no&lim=false&npage=1&SortOrder=ab_approval_date'],
    // ACM Digital Library
    ['acm-recent', 'https://dl.acm.org/action/showFeed?type=etoc&feed=rss&jc=cacm'],
    // IEEE
    ['ieee-spectrum', 'https://spectrum.ieee.org/feeds/feed.rss'],
    // Distill (ML visualization)
    ['distill-ml', 'https://distill.pub/rss.xml'],
    // Papers With Code
    ['paperswithcode', 'https://paperswithcode.com/latest'],
    // Connected Papers
    ['connectedpapers', 'https://www.connectedpapers.com/'],
    // Arxiv sanity
    ['arxiv-sanity', 'https://arxiv-sanity-lite.com/rss?tags=all'],
    // Journals
    ['pnas-latest', 'https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=pnas'],
    ['cell-latest', 'https://www.cell.com/cell/rss'],
    ['lancet-latest', 'https://www.thelancet.com/rssfeed/lancet_current.xml'],
    ['bmj-latest', 'https://www.bmj.com/rss/recent.xml'],
    ['nejm-latest', 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss'],
    // Philosophy papers
    ['philsci-archive', 'https://philsci-archive.pitt.edu/cgi/latest_tool?output=RSS2'],
    // Math papers
    ['annals-math', 'https://annals.math.princeton.edu/feed/'],
    // Computer science
    ['jmlr-recent', 'https://jmlr.org/jmlr.xml'],
    // Physics
    ['phys-rev-letters', 'https://feeds.aps.org/rss/recent/prl.xml'],
    ['rev-mod-phys', 'https://feeds.aps.org/rss/recent/rmp.xml'],
  ];

  let eaten = 0, failed = 0, totalBytes = 0, totalItems = 0;

  for (const [name, url] of feeds) {
    try {
      const r = await fetch(url);
      if (r.status >= 200 && r.status < 400 && r.data.length > 50) {
        const result = saveAndDigest(name, r.data, r.bytes);
        eaten++;
        totalBytes += r.bytes;
        totalItems += result.items;
        log('  ATE ' + name + ' (' + (r.bytes / 1024).toFixed(1) + 'KB, ' + result.items + ' items)');
      } else {
        failed++;
        log('  SKIP ' + name + ' (HTTP ' + r.status + ')');
      }
    } catch (e) {
      failed++;
      log('  FAIL ' + name + ' (' + (e.message || '').slice(0, 40) + ')');
    }
  }

  log('');
  log('═══ BOTH SIDES CONSUMED ═══');
  log('  Eaten: ' + eaten + '/' + feeds.length);
  log('  Bytes: ' + (totalBytes / 1024 / 1024).toFixed(2) + 'MB');
  log('  Items: ' + totalItems);
  log('');
  log('INSIDE (cloud waste): Dropbox, Box, Notion, Vercel, Supabase, Fly, Tailscale, Deno, Oxide, Fastly');
  log('OUTSIDE (web papers): bioRxiv, medRxiv, ACM, IEEE, PNAS, Cell, Lancet, BMJ, NEJM, PRL, JMLR');
  log('Both membranes fed. Inner AND outer.');
}

eatBothSides().catch(e => log('FAILED: ' + e.message));
