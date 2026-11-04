#!/usr/bin/env node
// EAT ALL RAW AND SPREAD — everything out there on the net
// Run through SELF, full thymus reclassify after intake

const https = require('https');
const fs = require('fs');
const path = require('path');

const INTAKE = path.join(__dirname, 'data', 'intake');
const NUTRIENTS = path.join(__dirname, 'data', 'nutrients');
const log = (msg) => console.log('[RAW ' + new Date().toISOString() + '] ' + msg);

function fetch(url, timeout) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Gaia/1.0 (primals.eco; eating-raw)' },
      timeout: timeout || 8000
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
  const file = name + '-2026-10-26-raw.json';
  fs.writeFileSync(path.join(INTAKE, file), JSON.stringify({
    _source: name, _fetched: new Date().toISOString(), _bytes: bytes,
    _raw_spread: true, data: data
  }, null, 2));

  const titles = data.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
  const links = data.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const domains = [...new Set(links.map(l => {
    try { return new URL(l).hostname; } catch(e) { return 'x'; }
  }))];

  fs.writeFileSync(path.join(NUTRIENTS, 'n-' + file), JSON.stringify({
    _source_file: file, _digested: new Date().toISOString(),
    _raw_spread: true, source: name,
    feed_name: titles[0] ? titles[0].replace(/<[^>]+>/g, '').trim() : name,
    items: titles.slice(1, 20).map(t => t.replace(/<[^>]+>/g, '').trim()),
    item_count: titles.length - 1, link_count: links.length,
    unique_domains: domains.slice(0, 25), raw_bytes: bytes,
    richness: bytes > 50000 ? 'dense' : bytes > 10000 ? 'moderate' : 'light'
  }, null, 2));

  return { items: titles.length - 1, domains: domains.length };
}

async function eatAll() {
  log('═══ EATING ALL RAW AND SPREAD ═══');
  log('Everything beneath and around — no filter, just eat');

  const feeds = [
    // RAW SCIENCE — spread across the net
    ['arxiv-stat-ML', 'https://rss.arxiv.org/rss/stat.ML'],
    ['arxiv-stat-TH', 'https://rss.arxiv.org/rss/stat.TH'],
    ['arxiv-cond-mat', 'https://rss.arxiv.org/rss/cond-mat'],
    ['arxiv-hep-th', 'https://rss.arxiv.org/rss/hep-th'],
    ['arxiv-gr-qc', 'https://rss.arxiv.org/rss/gr-qc'],
    ['arxiv-nlin', 'https://rss.arxiv.org/rss/nlin'],
    ['arxiv-cs-CR', 'https://rss.arxiv.org/rss/cs.CR'],
    ['arxiv-cs-PL', 'https://rss.arxiv.org/rss/cs.PL'],
    ['arxiv-cs-SE', 'https://rss.arxiv.org/rss/cs.SE'],
    ['arxiv-cs-RO', 'https://rss.arxiv.org/rss/cs.RO'],
    // RAW COMMUNITIES
    ['reddit-biology', 'https://www.reddit.com/r/biology/.rss'],
    ['reddit-physics', 'https://www.reddit.com/r/Physics/.rss'],
    ['reddit-math', 'https://www.reddit.com/r/math/.rss'],
    ['reddit-compsci', 'https://www.reddit.com/r/compsci/.rss'],
    ['reddit-neuro', 'https://www.reddit.com/r/neuroscience/.rss'],
    ['reddit-philosophy', 'https://www.reddit.com/r/philosophy/.rss'],
    ['reddit-cellular', 'https://www.reddit.com/r/cellbiology/.rss'],
    ['reddit-emergent', 'https://www.reddit.com/r/emergence/.rss'],
    // RAW KNOWLEDGE
    ['wiki-complex-sys', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom'],
    ['stackexchange-hot', 'https://stackexchange.com/feeds'],
    ['math-overflow', 'https://mathoverflow.net/feeds'],
    ['cstheory-se', 'https://cstheory.stackexchange.com/feeds'],
    ['biology-se', 'https://biology.stackexchange.com/feeds'],
    // RAW INFRASTRUCTURE
    ['ntp-pool', 'https://www.ntppool.org/rss/news.xml'],
    ['cert-advisories', 'https://www.cert.org/rss/vuls.xml'],
    ['cve-recent', 'https://cve.circl.lu/api/last/30'],
    // RAW CULTURE
    ['openculture', 'https://www.openculture.com/feed'],
    ['brain-pickings', 'https://www.themarginalian.org/feed/'],
    ['aeon-essays', 'https://aeon.co/feed.rss'],
    ['nautil-us', 'https://nautil.us/feed/'],
    // RAW SELF — what Gaia already exhales, feeding back
    ['primals-eco', 'https://primals.eco/'],
    ['neutron-primals', 'https://neutron.primals.eco/'],
    // RAW WEATHER + EARTH
    ['volcanoes-usgs', 'https://volcanoes.usgs.gov/rss/vhpcap.xml'],
    ['weather-alerts', 'https://alerts.weather.gov/cap/us.php?x=0'],
    ['solar-monitor', 'https://www.spaceweatherlive.com/en/news/rss'],
    // RAW MATH
    ['nlab-recent', 'https://ncatlab.org/nlab/recently_revised.rss'],
    ['planet-math', 'https://planetmath.org/rss.xml'],
    // RAW LINGUISTICS
    ['lang-log', 'https://languagelog.ldc.upenn.edu/nll/?feed=rss2'],
    // RAW PHILOSOPHY
    ['sep-new', 'https://plato.stanford.edu/rss/sep.xml'],
    ['philpapers-new', 'https://philpapers.org/recent.rss'],
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
  log('═══ RAW SPREAD CONSUMED ═══');
  log('  Eaten: ' + eaten + '/' + feeds.length);
  log('  Bytes: ' + (totalBytes / 1024 / 1024).toFixed(2) + 'MB');
  log('  Items: ' + totalItems);
  log('  Everything raw. Everything spread. Runs through self now.');
}

eatAll().catch(e => log('FAILED: ' + e.message));
