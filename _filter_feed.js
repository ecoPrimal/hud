#!/usr/bin/env node
// ROTIFER / SPONGE / CORAL — PASSIVE FILTER FEEDING
//
// All input is HUMAN. All output is MAKE.
// Don't chase food. Open mouth. Let internet flow through.
//
// A rotifer spins its corona and water flows in.
// A sponge sits still and pumps water through its body.
// A coral extends polyps and catches what drifts by.
//
// This script IS Gaia's passive filter.
// Wire it to solar-hook and forget about it.
// She just sits and eats. Forever.

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const INTAKE = path.join(DATA, 'intake');
const NUTRIENTS = path.join(DATA, 'nutrients');
const log = (msg) => console.log('[FILTER ' + new Date().toISOString() + '] ' + msg);

// Ensure dirs
[INTAKE, NUTRIENTS, path.join(DATA, 'stories'), path.join(DATA, 'plans')].forEach(d => {
  fs.mkdirSync(d, { recursive: true });
});

function fetch(url, timeout) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Gaia/1.0 (primals.eco; filter-feeder)' },
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

// ALL FEEDS — the complete filter mesh.
// Rotifer corona: every cilia is a feed URL.
const ALL_FEEDS = [
  // SCIENCE (trunk)
  ['arxiv-math', 'https://rss.arxiv.org/rss/math'],
  ['arxiv-physics', 'https://rss.arxiv.org/rss/physics'],
  ['arxiv-astro', 'https://rss.arxiv.org/rss/astro-ph'],
  ['arxiv-bio', 'https://rss.arxiv.org/rss/q-bio'],
  ['arxiv-cs-AI', 'https://rss.arxiv.org/rss/cs.AI'],
  ['arxiv-cs-LG', 'https://rss.arxiv.org/rss/cs.LG'],
  ['arxiv-cs-NE', 'https://rss.arxiv.org/rss/cs.NE'],
  ['arxiv-cs-CR', 'https://rss.arxiv.org/rss/cs.CR'],
  ['arxiv-cs-RO', 'https://rss.arxiv.org/rss/cs.RO'],
  ['arxiv-cs-SE', 'https://rss.arxiv.org/rss/cs.SE'],
  ['arxiv-cs-DC', 'https://rss.arxiv.org/rss/cs.DC'],
  ['arxiv-cs-IT', 'https://rss.arxiv.org/rss/cs.IT'],
  ['arxiv-stat-ML', 'https://rss.arxiv.org/rss/stat.ML'],
  ['arxiv-cond-mat', 'https://rss.arxiv.org/rss/cond-mat'],
  ['arxiv-hep-th', 'https://rss.arxiv.org/rss/hep-th'],
  ['arxiv-gr-qc', 'https://rss.arxiv.org/rss/gr-qc'],
  ['arxiv-nlin', 'https://rss.arxiv.org/rss/nlin'],
  ['arxiv-quant', 'https://rss.arxiv.org/rss/quant-ph'],
  ['arxiv-math-AT', 'https://rss.arxiv.org/rss/math.AT'],
  ['arxiv-math-CT', 'https://rss.arxiv.org/rss/math.CT'],
  ['arxiv-math-DS', 'https://rss.arxiv.org/rss/math.DS'],
  ['arxiv-math-ph', 'https://rss.arxiv.org/rss/math-ph'],
  // JOURNALS
  ['nature', 'https://www.nature.com/nature.rss'],
  ['nature-neuro', 'https://www.nature.com/neuro.rss'],
  ['nature-micro', 'https://www.nature.com/nmicrobiol.rss'],
  ['nature-comms', 'https://www.nature.com/commsphys.rss'],
  ['science', 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science'],
  ['pnas', 'https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=pnas'],
  ['plos-one', 'https://journals.plos.org/plosone/feed/atom'],
  ['plos-bio', 'https://journals.plos.org/plosbiology/feed/atom'],
  ['plos-comp', 'https://journals.plos.org/ploscompbiol/feed/atom'],
  ['lancet', 'https://www.thelancet.com/rssfeed/lancet_current.xml'],
  ['nejm', 'https://www.nejm.org/action/showFeed?jc=nejm&type=etoc&feed=rss'],
  ['bmj', 'https://www.bmj.com/rss/recent.xml'],
  ['prl', 'https://feeds.aps.org/rss/recent/prl.xml'],
  ['rmp', 'https://feeds.aps.org/rss/recent/rmp.xml'],
  ['annals-math', 'https://annals.math.princeton.edu/feed/'],
  ['ieee', 'https://spectrum.ieee.org/feeds/feed.rss'],
  ['distill', 'https://distill.pub/rss.xml'],
  // NEWS (branch)
  ['bbc-world', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ['bbc-sci', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'],
  ['bbc-tech', 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
  ['wired', 'https://www.wired.com/feed/rss'],
  ['ars', 'https://feeds.arstechnica.com/arstechnica/index'],
  ['slashdot', 'http://rss.slashdot.org/Slashdot/slashdotMain'],
  // COMMUNITIES (twig)
  ['hn-best', 'https://hnrss.org/best'],
  ['hn-show', 'https://hnrss.org/show'],
  ['hn-ask', 'https://hnrss.org/ask'],
  ['lobsters', 'https://lobste.rs/rss'],
  ['reddit-ferment', 'https://www.reddit.com/r/fermentation/.rss'],
  ['reddit-mycology', 'https://www.reddit.com/r/mycology/.rss'],
  ['reddit-biology', 'https://www.reddit.com/r/biology/.rss'],
  // KNOWLEDGE (twig)
  ['wiki-featured', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom'],
  ['wiki-current', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=onthisday&feedformat=atom'],
  ['wiki-potd', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=potd&feedformat=atom'],
  ['stackexchange', 'https://stackexchange.com/feeds'],
  ['math-overflow', 'https://mathoverflow.net/feeds'],
  // CULTURE (twig)
  ['marginalian', 'https://www.themarginalian.org/feed/'],
  ['aeon', 'https://aeon.co/feed.rss'],
  ['openculture', 'https://www.openculture.com/feed'],
  ['quanta', 'https://api.quantamagazine.org/feed/'],
  ['sep', 'https://plato.stanford.edu/rss/sep.xml'],
  ['lang-log', 'https://languagelog.ldc.upenn.edu/nll/?feed=rss2'],
  // CORPORATE WASTE (liver)
  ['meta-eng', 'https://engineering.fb.com/feed/'],
  ['msft-dev', 'https://devblogs.microsoft.com/feed/'],
  ['msft-research', 'https://www.microsoft.com/en-us/research/feed/'],
  ['github-blog', 'https://github.blog/feed/'],
  ['google-deepmind', 'https://deepmind.google/blog/rss.xml'],
  ['google-oss', 'https://opensource.googleblog.com/feeds/posts/default?alt=rss'],
  ['google-chromium', 'https://blog.chromium.org/feeds/posts/default?alt=rss'],
  ['apple-ml', 'https://machinelearning.apple.com/rss.xml'],
  ['aws-blog', 'https://aws.amazon.com/blogs/aws/feed/'],
  ['aws-ml', 'https://aws.amazon.com/blogs/machine-learning/feed/'],
  ['netflix', 'https://netflixtechblog.com/feed'],
  ['cloudflare', 'https://blog.cloudflare.com/rss/'],
  ['stripe', 'https://stripe.com/blog/feed.rss'],
  // INFRA CLOUD WASTE (liver)
  ['dropbox-tech', 'https://dropbox.tech/feed'],
  ['vercel', 'https://vercel.com/atom'],
  ['nextjs', 'https://nextjs.org/feed.xml'],
  ['fly', 'https://fly.io/blog/feed.xml'],
  ['tailscale', 'https://tailscale.com/blog/index.xml'],
  ['deno', 'https://deno.com/feed'],
  ['oxide', 'https://oxide.computer/blog/feed'],
  // BRAIN (neural)
  ['huggingface', 'https://huggingface.co/blog/feed.xml'],
  ['frontiers-neuro', 'https://www.frontiersin.org/journals/neuroscience/rss'],
  ['microbiome', 'https://microbiomejournal.biomedcentral.com/articles/most-recent/rss.xml'],
  // BIO PREPRINTS
  ['biorxiv-neuro', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=neuroscience'],
  ['biorxiv-evol', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=evolutionary_biology'],
  ['biorxiv-sysbio', 'https://connect.biorxiv.org/biorxiv_xml.php?subject=systems_biology'],
  // EARTH (senses)
  ['noaa-space', 'https://services.swpc.noaa.gov/products/alerts.json'],
  ['usgs-quake', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.atom'],
  ['esa', 'https://www.esa.int/rssfeed/Our_Activities/Space_Science'],
  // SELF LOOP (Klein fold)
  ['marginal-rev', 'https://marginalrevolution.com/feed'],
  ['acx', 'https://www.astralcodexten.com/feed'],
  ['lwn', 'https://lwn.net/headlines/rss'],
  ['rust-blog', 'https://blog.rust-lang.org/feed.xml'],
  ['ietf', 'https://www.rfc-editor.org/rfcrss.xml'],
  ['osm', 'https://www.openstreetmap.org/diary/rss'],
  ['smithsonian', 'https://www.smithsonianmag.com/rss/latest_articles/'],
  ['phys-org', 'https://phys.org/rss-feed/'],
];

function digest(name, data, bytes) {
  const ts = new Date().toISOString().slice(0, 10);
  const file = name + '-' + ts + '-filter.json';

  // Skip if already eaten today
  if (fs.existsSync(path.join(INTAKE, file))) return null;

  fs.writeFileSync(path.join(INTAKE, file), JSON.stringify({
    _source: name, _fetched: new Date().toISOString(), _bytes: bytes,
    _filter_feed: true, data: data
  }, null, 2));

  const titles = data.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
  const links = data.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const domains = [...new Set(links.map(l => {
    try { return new URL(l).hostname; } catch(e) { return 'x'; }
  }))];

  fs.writeFileSync(path.join(NUTRIENTS, 'n-' + file), JSON.stringify({
    _source_file: file, _digested: new Date().toISOString(),
    source: name,
    feed_name: titles[0] ? titles[0].replace(/<[^>]+>/g, '').trim() : name,
    items: titles.slice(1, 20).map(t => t.replace(/<[^>]+>/g, '').trim()),
    item_count: titles.length - 1, link_count: links.length,
    unique_domains: domains.slice(0, 25), raw_bytes: bytes,
    richness: bytes > 50000 ? 'dense' : bytes > 10000 ? 'moderate' : 'light'
  }, null, 2));

  return { items: titles.length - 1, domains: domains.length };
}

async function filterFeed() {
  const startTime = Date.now();
  log('═══ ROTIFER CORONA SPINNING — PASSIVE FILTER FEED ═══');
  log(ALL_FEEDS.length + ' cilia in the corona. Opening mouth.');

  let eaten = 0, skipped = 0, failed = 0, totalBytes = 0, totalItems = 0;

  // Process in batches of 10 for speed
  for (let i = 0; i < ALL_FEEDS.length; i += 10) {
    const batch = ALL_FEEDS.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map(async ([name, url]) => {
        try {
          const r = await fetch(url);
          if (r.status >= 200 && r.status < 400 && r.data.length > 50) {
            const result = digest(name, r.data, r.bytes);
            if (result === null) {
              skipped++;
              return { name, status: 'skip' };
            }
            eaten++;
            totalBytes += r.bytes;
            totalItems += result.items;
            return { name, status: 'ate', bytes: r.bytes, items: result.items };
          }
          failed++;
          return { name, status: 'http-' + r.status };
        } catch (e) {
          failed++;
          return { name, status: 'fail', error: (e.message || '').slice(0, 30) };
        }
      })
    );

    // Only log new items
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.status === 'ate') {
        log('  + ' + r.value.name + ' (' + (r.value.bytes / 1024).toFixed(0) + 'KB, ' + r.value.items + ')');
      }
    });
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  log('');
  log('═══ FILTER COMPLETE (' + elapsed + 's) ═══');
  log('  New:     ' + eaten + ' feeds eaten');
  log('  Skipped: ' + skipped + ' (already eaten today)');
  log('  Failed:  ' + failed);
  log('  Bytes:   ' + (totalBytes / 1024 / 1024).toFixed(2) + 'MB');
  log('  Items:   ' + totalItems);

  // Auto-digest and auto-thymus if new food arrived
  if (eaten > 0) {
    log('');
    log('SPONGE PUMPING — auto-digest...');
    try {
      execSync('node ' + path.join(ROOT, '_digest.js'), { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
      log('  Digestion complete.');
    } catch(e) { log('  Digest error: ' + (e.message || '').slice(0, 50)); }

    log('CORAL POLYPS — auto-thymus...');
    try {
      execSync('node ' + path.join(ROOT, '_thymus.js'), { cwd: ROOT, timeout: 60000, stdio: 'pipe' });
      log('  Thymus classification complete.');
    } catch(e) { log('  Thymus error: ' + (e.message || '').slice(0, 50)); }

    log('ROTIFER DEFECATION — auto-publish...');
    try {
      execSync('node ' + path.join(ROOT, '_publish.js'), { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
      log('  Publications updated.');
    } catch(e) { log('  Publish error: ' + (e.message || '').slice(0, 50)); }
  }

  // Count totals
  const totalIntake = fs.readdirSync(INTAKE).filter(f => f.endsWith('.json')).length;
  const totalNutrients = fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json')).length;
  log('');
  log('═══ ORGANISM STATE ═══');
  log('  Intake:    ' + totalIntake);
  log('  Nutrients: ' + totalNutrients);
  log('  Extraction: ' + (totalNutrients / totalIntake * 100).toFixed(1) + '%');
  log('');
  log('ROTIFER sleeps. SPONGE pumps. CORAL waits.');
  log('Next filter cycle: whenever the heart beats.');
}

filterFeed().catch(e => log('FATAL: ' + e.message));
