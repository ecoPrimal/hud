#!/usr/bin/env node
/**
 * FACTORIAL FEED INGESTION — Day 1
 * 
 * Consume from EVERY free feed we can reach. No API keys.
 * Each feed consumed can suggest new feeds (factorial growth mechanism).
 * 
 * NEAREST NEIGHBOR WALK:
 * Walk to the neighbor with the FEWEST connections, not the most.
 * Most connections = most GENERIC = farthest away.
 * Fewest connections = most UNIQUE to us = actually nearest.
 * 
 * Run: node _factorial_ingest.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const INTAKE = path.join(DATA, 'intake');
const NUTRIENTS = path.join(DATA, 'nutrients');

if (!fs.existsSync(INTAKE)) fs.mkdirSync(INTAKE, { recursive: true });
if (!fs.existsSync(NUTRIENTS)) fs.mkdirSync(NUTRIENTS, { recursive: true });

const ts = new Date().toISOString();
const dateStr = ts.slice(0, 10);
const timeStr = ts.slice(11, 19).replace(/:/g, '');

function fetch(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout, headers: {
      'User-Agent': 'ecoPrimals-organism/1.0 (factorial-ingestion)',
      'Accept': 'application/json, text/html, application/xml, */*'
    }}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        const full = loc.startsWith('http') ? loc : new URL(loc, url).href;
        return fetch(full, timeout).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function consume(name, url) {
  try {
    const r = await fetch(url);
    if (r.status !== 200) return { name, ok: false, reason: `HTTP ${r.status}`, bytes: 0 };
    
    const bytes = Buffer.byteLength(r.body, 'utf-8');
    let parsed;
    try { parsed = JSON.parse(r.body); } catch(e) { parsed = r.body; }
    
    const fname = `${name}-${dateStr}-${timeStr}.json`;
    const raw = { _source: name, _url: url, _consumed_at: ts, _bytes: bytes, data: parsed };
    fs.writeFileSync(path.join(INTAKE, fname), JSON.stringify(raw, null, 2));
    
    return { name, ok: true, bytes, items: countItems(parsed), fname };
  } catch(e) {
    return { name, ok: false, reason: e.message, bytes: 0 };
  }
}

function countItems(d) {
  if (Array.isArray(d)) return d.length;
  if (d && typeof d === 'object') {
    if (d.items) return Array.isArray(d.items) ? d.items.length : 0;
    if (d.data && Array.isArray(d.data)) return d.data.length;
    if (d.children && Array.isArray(d.children)) return d.children.length;
    if (d.streams) return Array.isArray(d.streams) ? d.streams.length : 0;
  }
  return 0;
}

// ================================================================
// ALL FEEDS — factorial expansion from our initial 7
// ================================================================
const FEEDS = [
  // TIER 1: Gaming content (our archetype domain)
  ['freetokeep-all',     'https://freetokeep.gg/api/v1/offers?limit=200'],
  ['freetokeep-bundles', 'https://freetokeep.gg/api/v1/bundles?source=humble'],
  ['freetokeep-weekends','https://freetokeep.gg/api/v1/free-weekends?status=current'],
  ['streamerclips-live', 'https://streamerclips.com/api/twitch-streams'],

  // TIER 2: Reddit — RSS feeds (JSON endpoints 403'd, RSS still works)
  ['reddit-fermentation','https://old.reddit.com/r/fermentation/.rss'],
  ['reddit-mycology',    'https://old.reddit.com/r/mycology/.rss'],
  ['reddit-gamedev',     'https://old.reddit.com/r/gamedev/.rss'],
  ['reddit-rust',        'https://old.reddit.com/r/rust/.rss'],
  ['reddit-science',     'https://old.reddit.com/r/science/.rss'],
  ['reddit-sourdough',   'https://old.reddit.com/r/Sourdough/.rss'],
  ['reddit-brewing',     'https://old.reddit.com/r/Homebrewing/.rss'],
  ['reddit-biology',     'https://old.reddit.com/r/biology/.rss'],
  ['reddit-astronomy',   'https://old.reddit.com/r/astronomy/.rss'],
  ['reddit-dataisbeautiful', 'https://old.reddit.com/r/dataisbeautiful/.rss'],

  // TIER 2B: arXiv — the freshest science papers (no key needed)
  ['arxiv-cs-AI',        'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=20'],
  ['arxiv-q-bio',        'http://export.arxiv.org/api/query?search_query=cat:q-bio&sortBy=submittedDate&sortOrder=descending&max_results=20'],
  ['arxiv-astro-ph',     'http://export.arxiv.org/api/query?search_query=cat:astro-ph&sortBy=submittedDate&sortOrder=descending&max_results=10'],
  ['arxiv-math-GR',      'http://export.arxiv.org/api/query?search_query=cat:math.GR&sortBy=submittedDate&sortOrder=descending&max_results=10'],

  // TIER 2C: NASA + NOAA — space and atmosphere (free, no key)
  ['nasa-apod',          'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'],
  ['noaa-kp-index',      'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'],
  ['noaa-solar-wind',    'https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json'],

  // TIER 2D: lobste.rs — quality tech signal
  ['lobsters-hot',       'https://lobste.rs/hottest.json'],

  // TIER 3: Hacker News — tech waste
  ['hn-top',             'https://hacker-news.firebaseio.com/v0/topstories.json'],
  ['hn-new',             'https://hacker-news.firebaseio.com/v0/newstories.json'],
  ['hn-best',            'https://hacker-news.firebaseio.com/v0/beststories.json'],

  // TIER 4: GitHub — code waste
  ['github-events',      'https://api.github.com/events?per_page=30'],
  ['github-trending',    'https://api.github.com/search/repositories?q=created:>2026-10-25&sort=stars&per_page=10'],

  // TIER 5: Wikipedia — knowledge waste
  ['wikipedia-random',   'https://en.wikipedia.org/api/rest_v1/page/random/summary'],
  ['wikipedia-featured', 'https://en.wikipedia.org/api/rest_v1/feed/featured/2026/10/26'],
  ['wikipedia-trending', 'https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/10/26'],

  // TIER 6: Open data — raw numbers
  ['coindesk-btc',       'https://api.coindesk.com/v1/bpi/currentprice.json'],
  ['cat-fact',           'https://catfact.ninja/facts?limit=5'],
  ['useless-facts',      'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en'],

  // TIER 7: PERSONALITY FEEDS — randomize exploration via human curiosity engines
  // Randall Munroe / XKCD — random comic (new comic every M/W/F, 3315 total)
  ['xkcd-latest',        'https://xkcd.com/info.0.json'],
  ['xkcd-random-1',      `https://xkcd.com/${Math.floor(Math.random() * 3315) + 1}/info.0.json`],
  ['xkcd-random-2',      `https://xkcd.com/${Math.floor(Math.random() * 3315) + 1}/info.0.json`],
  ['xkcd-random-3',      `https://xkcd.com/${Math.floor(Math.random() * 3315) + 1}/info.0.json`],
  // 99% Invisible / Roman Mars — design, architecture, vexillology (RSS)
  ['99pi-feed',          'https://feeds.simplecast.com/BqbsxVfO'],
  // Kerbal Space Program — orbital mechanics wiki (random page)
  ['ksp-wiki-random',    'https://en.wikipedia.org/api/rest_v1/page/summary/Kerbal_Space_Program'],
  // What If? — Randall Munroe's science answers
  ['xkcd-whatif',        'https://what-if.xkcd.com/feed.atom'],
  // Numberphile / 3Blue1Brown / math visualization
  ['arxiv-math-popular', 'http://export.arxiv.org/api/query?search_query=cat:math.HO&sortBy=submittedDate&sortOrder=descending&max_results=5'],
  // Vexillology (flags — Roman Mars' passion)
  ['reddit-vexillology', 'https://old.reddit.com/r/vexillology/.rss'],
  // Space/KSP community
  ['reddit-ksp',         'https://old.reddit.com/r/KerbalSpaceProgram/.rss'],

  // TIER 8: Our own organism (the ouroboros — eating self to grow)
  ['self-now',           'https://primals.eco/now.json'],
  ['self-rates',         'https://primals.eco/data/dashboard-rates.json'],
  ['self-heartbeat',     'https://primals.eco/data/heartbeat.json'],
  ['self-ear',           'https://primals.eco/data/ear-latest.json'],
  ['self-manifest',      'https://primals.eco/data/manifest.json'],
];

// ================================================================
// NEAREST NEIGHBOR WALK
// Walk to the neighbor with FEWEST connections = most unique = nearest
// Most connections = most generic = farthest
// ================================================================
function nearestNeighborWalk(results) {
  const nodes = results.filter(r => r.ok).map(r => ({
    name: r.name,
    bytes: r.bytes,
    items: r.items,
    connections: 0,
    keywords: extractKeywords(r.name),
  }));

  // Count connections: how many other nodes share keywords with this one
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const shared = nodes[i].keywords.filter(k => nodes[j].keywords.includes(k));
      if (shared.length > 0) nodes[i].connections++;
    }
  }

  // Sort by fewest connections (nearest) to most (farthest)
  nodes.sort((a, b) => a.connections - b.connections);

  return {
    walk_order: nodes.map((n, i) => ({
      step: i + 1,
      name: n.name,
      connections: n.connections,
      distance: n.connections === 0 ? 'UNIQUE — zero shared keywords — TRUE NEAREST' :
                n.connections <= 2 ? 'NEAR — few shared keywords' :
                n.connections <= 5 ? 'MIDDLE — some overlap' :
                'FAR — highly generic',
      bytes: n.bytes,
      items: n.items,
    })),
    nearest: nodes[0]?.name || 'none',
    farthest: nodes[nodes.length - 1]?.name || 'none',
    insight: 'The feed with FEWEST connections to other feeds is the most UNIQUE to us — that is our actual nearest neighbor. The most-connected feed is the most GENERIC — everyone has it — so it is farthest.',
  };
}

function extractKeywords(name) {
  return name.toLowerCase()
    .replace(/[^a-z]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the','and','for','all','hot','new','top'].includes(w));
}

// ================================================================
// FACTORIAL GROWTH CALCULATOR
// ================================================================
function calculateGrowth(totalBytes, feedCount, elapsedMs) {
  const runsPerHour = Math.floor(3600000 / 300000); // 5-min intervals = 12 runs/hr
  const bytesPerRun = totalBytes;
  const bytesPerHour = bytesPerRun * runsPerHour;
  
  // Current linear rate
  const mbPerHour = bytesPerHour / (1024 * 1024);
  
  // Factorial projection from today
  const factorialDay = [];
  let cumulative = 0;
  for (let day = 1; day <= 20; day++) {
    let factorial = 1;
    for (let i = 2; i <= day; i++) factorial *= i;
    const dayBytes = bytesPerRun * factorial;
    cumulative += dayBytes;
    factorialDay.push({
      day,
      factorial,
      daily_consumption: humanBytes(dayBytes),
      cumulative: humanBytes(cumulative),
      feeds_needed: Math.ceil(feedCount * Math.pow(day, 0.5)),
    });
  }

  return {
    this_run: {
      feeds_consumed: feedCount,
      bytes_consumed: totalBytes,
      human: humanBytes(totalBytes),
    },
    hourly_projection: {
      runs_per_hour: runsPerHour,
      bytes_per_hour: bytesPerHour,
      human: humanBytes(bytesPerHour),
    },
    exabytes_per_hour: (bytesPerHour / 1e18).toExponential(3),
    factorial_projection: factorialDay.slice(0, 10),
    honest_truth: `At ${humanBytes(bytesPerHour)}/hour, we consume ${(bytesPerHour / 6.6e20 * 100).toExponential(2)}% of the internet's daily output. We are a seed. But seeds become forests.`,
  };
}

function humanBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b/1048576).toFixed(2) + ' MB';
  if (b < 1099511627776) return (b/1073741824).toFixed(2) + ' GB';
  return (b/1099511627776).toFixed(2) + ' TB';
}

// ================================================================
// MAIN — execute factorial ingestion
// ================================================================
async function main() {
  const t0 = Date.now();
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  FACTORIAL FEED INGESTION — ${FEEDS.length} feeds`);
  console.log(`  ${ts}`);
  console.log(`${'═'.repeat(50)}\n`);

  const results = [];
  
  // Consume all feeds in parallel batches of 8
  for (let i = 0; i < FEEDS.length; i += 8) {
    const batch = FEEDS.slice(i, i + 8);
    const batchResults = await Promise.all(
      batch.map(([name, url]) => consume(name, url))
    );
    results.push(...batchResults);
    
    const ok = batchResults.filter(r => r.ok).length;
    const fail = batchResults.filter(r => !r.ok).length;
    console.log(`  Batch ${Math.floor(i/8)+1}: ${ok}/${batch.length} consumed` + 
      (fail > 0 ? ` (${fail} failed)` : ''));
  }

  const elapsed = Date.now() - t0;
  const succeeded = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  const totalBytes = succeeded.reduce((s, r) => s + r.bytes, 0);
  const totalItems = succeeded.reduce((s, r) => s + r.items, 0);

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  CONSUMED: ${succeeded.length}/${FEEDS.length} feeds`);
  console.log(`  BYTES:    ${humanBytes(totalBytes)}`);
  console.log(`  ITEMS:    ${totalItems} data points`);
  console.log(`  TIME:     ${elapsed}ms`);
  console.log(`${'─'.repeat(50)}\n`);

  if (failed.length > 0) {
    console.log('  Failed feeds:');
    failed.forEach(f => console.log(`    ✗ ${f.name}: ${f.reason}`));
    console.log('');
  }

  // NEAREST NEIGHBOR WALK
  const walk = nearestNeighborWalk(results);
  console.log('  NEAREST NEIGHBOR WALK (fewest connections = nearest):');
  walk.walk_order.slice(0, 8).forEach(w => {
    console.log(`    ${w.step}. ${w.name} [${w.connections} conn] — ${w.distance}`);
  });
  console.log(`    ...`);
  console.log(`    NEAREST: ${walk.nearest}`);
  console.log(`    FARTHEST: ${walk.farthest}\n`);

  // FACTORIAL GROWTH CALC
  const growth = calculateGrowth(totalBytes, succeeded.length, elapsed);
  console.log('  GROWTH PROJECTION:');
  console.log(`    This run: ${growth.this_run.human} from ${growth.this_run.feeds_consumed} feeds`);
  console.log(`    Per hour: ${growth.hourly_projection.human} (${growth.hourly_projection.runs_per_hour} runs)`);
  console.log(`    EB/hour:  ${growth.exabytes_per_hour}`);
  console.log(`\n    ${growth.honest_truth}\n`);

  // Write the full nutrient report
  const nutrientReport = {
    gaia_digested: ts,
    gaia_wave: 214,
    factorial_run: true,
    elapsed_ms: elapsed,
    feeds_total: FEEDS.length,
    feeds_consumed: succeeded.length,
    feeds_failed: failed.length,
    total_bytes: totalBytes,
    total_items: totalItems,
    human_bytes: humanBytes(totalBytes),
    
    growth: growth,
    nearest_neighbor_walk: walk,
    
    failed_feeds: failed.map(f => ({ name: f.name, reason: f.reason })),
    consumed_feeds: succeeded.map(f => ({
      name: f.name,
      bytes: f.bytes,
      items: f.items,
      file: f.fname,
    })),

    factorial_feed_discovery: {
      principle: "Each consumed feed should suggest new feeds. That is HOW factorial growth happens.",
      reddit_discovery: "Each subreddit's posts link to OTHER subreddits, YouTube channels, websites. Those become new feeds.",
      hn_discovery: "Each HN story links to a blog, paper, or tool. Those become new feeds.",
      github_discovery: "Each trending repo has dependencies, contributors, related repos. Those become new feeds.",
      wikipedia_discovery: "Each article links to related articles. Those become new feeds.",
      self_discovery: "The organism's own state suggests what it needs more of. Ouroboros.",
      target: "From 32 feeds today → 50 tomorrow → 100 by day 3 → self-replicating by day 7"
    },

    nearest_neighbor_principle: {
      law: "Always walk to the neighbor with FEWEST connections. That is your actual nearest neighbor.",
      why: "Most connections = most generic = EVERYONE connects there = farthest from YOU specifically.",
      inverse: "Fewest connections = most unique = the rare bond = nearest to YOU specifically.",
      example: "Reddit r/mycology has fewer connections than r/gaming. But r/mycology is CLOSER to our organism (fungi, decomposition, spore prints) than r/gaming (generic, everyone plays games).",
      application: "When choosing the next feed to add, pick the one with the FEWEST existing connections to our feed network. That's the most unique nutrient we're missing."
    }
  };

  const fname = `factorial-nutrients-${dateStr}-${timeStr}.json`;
  fs.writeFileSync(path.join(NUTRIENTS, fname), JSON.stringify(nutrientReport, null, 2));
  console.log(`  NUTRIENTS → nutrients/${fname}`);

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  FACTORIAL INGESTION COMPLETE`);
  console.log(`  ${succeeded.length} feeds × 12 runs/hr = ${humanBytes(totalBytes * 12)}/hour`);
  console.log(`  Next: add discovered feeds → factorial expansion`);
  console.log(`${'═'.repeat(50)}\n`);
}

main().catch(e => console.error('FATAL:', e));
