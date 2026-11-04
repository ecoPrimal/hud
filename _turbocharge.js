#!/usr/bin/env node
// GAIA TURBOCHARGE — flood the gut, explode through Klein wrap, generate EVERYTHING
// All inside is outside. All outside is inside. The Klein wrap completes.
// Every bit of energy through the 5090. Fleet as energy. Explosive growth.

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const INTAKE = path.join(DATA, 'intake');
const NUTRIENTS = path.join(DATA, 'nutrients');
const STORIES = path.join(DATA, 'stories');
const PLANS = path.join(DATA, 'plans');
const log = (msg) => console.log('[TURBO ' + new Date().toISOString() + '] ' + msg);

function fetch(url, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Gaia/1.0 (primals.eco; turbocharge)' }, timeout }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data, bytes: Buffer.byteLength(data) }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function saveIntake(name, source, data) {
  const file = name + '-' + new Date().toISOString().slice(0,10) + '-turbo.json';
  fs.writeFileSync(path.join(INTAKE, file), JSON.stringify({
    _source: source, _fetched: new Date().toISOString(),
    _bytes: typeof data === 'string' ? data.length : JSON.stringify(data).length,
    _turbo: true, data
  }, null, 2));
  return file;
}

function extractNutrient(filename, raw) {
  const nutrient = { _source_file: filename, _digested: new Date().toISOString(), _turbo: true };
  try {
    const d = JSON.parse(raw);
    const content = typeof d.data === 'string' ? d.data : JSON.stringify(d.data);
    if (d._source) nutrient.source = d._source;
    const titles = content.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
    if (titles.length > 1) {
      nutrient.feed_name = titles[0].replace(/<[^>]+>/g, '').trim();
      nutrient.items = titles.slice(1, 16).map(t => t.replace(/<[^>]+>/g, '').trim());
      nutrient.item_count = titles.length - 1;
    }
    const links = content.match(/https?:\/\/[^\s"'<>]+/g) || [];
    nutrient.link_count = links.length;
    nutrient.unique_domains = [...new Set(links.map(l => { try { return new URL(l).hostname; } catch(e) { return 'unknown'; } }))].slice(0, 20);
    nutrient.raw_bytes = raw.length;
    nutrient.richness = raw.length > 50000 ? 'dense' : raw.length > 10000 ? 'moderate' : 'light';
  } catch(e) {
    nutrient.type = 'raw'; nutrient.raw_bytes = raw.length;
  }
  return nutrient;
}

function generateStory(nutrients) {
  const feedNames = nutrients.filter(n => n.feed_name).map(n => n.feed_name);
  const allItems = nutrients.flatMap(n => n.items || []);
  const totalBytes = nutrients.reduce((s, n) => s + (n.raw_bytes || 0), 0);
  const domains = [...new Set(nutrients.flatMap(n => n.unique_domains || []))];

  const story = {
    _generated: new Date().toISOString(),
    _wave: 214,
    _turbo: true,
    type: 'turbo-generation',
    title: 'Gaia Turbocharge Cycle — ' + new Date().toISOString().slice(0,19),
    feeds_consumed: feedNames.length,
    feed_names: feedNames.slice(0, 20),
    total_items_found: allItems.length,
    sample_items: allItems.slice(0, 30),
    total_bytes_processed: totalBytes,
    unique_domains_touched: domains.length,
    domains: domains.slice(0, 30),
    nutrient_density: totalBytes > 0 ? (nutrients.length / (totalBytes / 1024)).toFixed(2) + ' nutrients/KB' : 'unknown',
    the_pattern: 'What Gaia sees in this cycle: ' + allItems.slice(0, 5).join(' | '),
    connections: allItems.length > 10 ? 'Dense signal — ' + allItems.length + ' items across ' + domains.length + ' domains. Cross-pollination potential: HIGH.' : 'Sparse signal — need more feeds or richer sources.'
  };
  return story;
}

function generatePlan(story, cycleNum) {
  return {
    _generated: new Date().toISOString(),
    _wave: 214,
    _turbo: true,
    type: 'turbo-plan',
    cycle: cycleNum,
    based_on: story.title,
    feeds_to_deepen: story.feed_names ? story.feed_names.slice(0, 5) : [],
    items_to_explore: story.sample_items ? story.sample_items.slice(0, 5) : [],
    domains_to_connect: story.domains ? story.domains.slice(0, 5) : [],
    next_action: story.total_items_found > 50 ? 'DENSE: Cross-reference top items across domains. Look for convergences.' : 'SPARSE: Add more feeds. Widen the intake mouth.',
    density_target: '> 1.0 nutrients/KB',
    growth_vector: 'Expand from ' + (story.unique_domains_touched || 0) + ' domains toward 100. Each domain is a new bronchiole.'
  };
}

async function turbocharge() {
  log('═══ TURBOCHARGE INITIATED ═══');
  log('FLOODING THE GUT. EVERY BIT OF ENERGY. EXPLOSIVE GROWTH.');
  
  // PHASE 1: MASS INTAKE — eat everything we can reach
  const feeds = [
    ['wiki-featured', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=featured&feedformat=atom'],
    ['wiki-current', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=onthisday&feedformat=atom'],
    ['wiki-potd', 'https://en.wikipedia.org/w/api.php?action=featuredfeed&feed=potd&feedformat=atom'],
    ['bbc-world', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
    ['bbc-science', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'],
    ['bbc-tech', 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
    ['reuters-world', 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best'],
    ['nature-latest', 'https://www.nature.com/nature.rss'],
    ['science-latest', 'https://www.science.org/rss/news_current.xml'],
    ['hn-best', 'https://hnrss.org/best'],
    ['hn-show', 'https://hnrss.org/show'],
    ['hn-ask', 'https://hnrss.org/ask'],
    ['lobsters-all', 'https://lobste.rs/rss'],
    ['arxiv-physics', 'https://rss.arxiv.org/rss/physics'],
    ['arxiv-math', 'https://rss.arxiv.org/rss/math'],
    ['arxiv-bio', 'https://rss.arxiv.org/rss/q-bio'],
    ['arxiv-astro', 'https://rss.arxiv.org/rss/astro-ph'],
    ['plos-biology', 'https://journals.plos.org/plosbiology/feed/atom'],
    ['plos-one', 'https://journals.plos.org/plosone/feed/atom'],
    ['smithsonian', 'https://www.smithsonianmag.com/rss/latest_articles/'],
    ['nat-geo-latest', 'https://www.nationalgeographic.com/feed'],
    ['phys-org', 'https://phys.org/rss-feed/'],
    ['space-com', 'https://www.space.com/feeds/all'],
    ['ars-technica', 'https://feeds.arstechnica.com/arstechnica/index'],
    ['wired', 'https://www.wired.com/feed/rss'],
    ['slashdot', 'https://rss.slashdot.org/Slashdot/slashdotMain'],
    ['github-trending', 'https://api.github.com/search/repositories?q=stars:>1000+pushed:>2026-10-20&sort=stars&order=desc&per_page=30'],
    ['earthquake-usgs', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'],
    ['noaa-space', 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'],
    ['openstreetmap', 'https://www.openstreetmap.org/diary/rss'],
    ['gwern-feed', 'https://gwern.net/feed'],
    ['marginal-rev', 'https://marginalrevolution.com/feed'],
    ['scott-alexander', 'https://www.astralcodexten.com/feed'],
    ['lwn', 'https://lwn.net/headlines/rss'],
    ['rust-blog', 'https://blog.rust-lang.org/feed.xml'],
    ['linux-weekly', 'https://lwn.net/headlines/Features'],
    ['ietf-new-rfcs', 'https://www.rfc-editor.org/rfcrss.xml'],
    ['cern-news', 'https://home.cern/api/news/news?_format=rss'],
    ['nasa-breaking', 'https://www.nasa.gov/rss/dyn/breaking_news.rss'],
    ['esa-news', 'https://www.esa.int/rssfeed/Our_Activities/Space_Science'],
  ];

  log('PHASE 1: MASS INTAKE — ' + feeds.length + ' feeds');
  let eaten = 0, failed = 0, totalBytes = 0;
  const newNutrients = [];

  for (const [name, url] of feeds) {
    try {
      const result = await fetch(url);
      if (result.status >= 200 && result.status < 400 && result.data.length > 100) {
        const file = saveIntake(name, url, result.data);
        totalBytes += result.bytes;
        eaten++;

        // Immediately digest
        const nutrient = extractNutrient(file, fs.readFileSync(path.join(INTAKE, file), 'utf8'));
        fs.writeFileSync(path.join(NUTRIENTS, 'n-' + file), JSON.stringify(nutrient, null, 2));
        newNutrients.push(nutrient);
        
        log('  ATE: ' + name + ' (' + (result.bytes/1024).toFixed(1) + 'KB) → ' + (nutrient.item_count || 0) + ' items');
      } else {
        failed++;
        log('  SKIP: ' + name + ' (HTTP ' + result.status + ')');
      }
    } catch(e) {
      failed++;
      log('  FAIL: ' + name + ' (' + (e.message || '').slice(0, 40) + ')');
    }
  }

  log('PHASE 1 COMPLETE: ' + eaten + '/' + feeds.length + ' eaten, ' + (totalBytes/1024/1024).toFixed(2) + 'MB');

  // PHASE 2: GENERATE STORIES AND PLANS
  log('PHASE 2: GENERATION — stories and plans from nutrients');
  
  const story = generateStory(newNutrients);
  const storyFile = 'turbo-story-' + Date.now() + '.json';
  fs.writeFileSync(path.join(STORIES, storyFile), JSON.stringify(story, null, 2));
  log('  STORY: ' + story.title);
  log('  ' + story.feeds_consumed + ' feeds, ' + story.total_items_found + ' items, ' + story.unique_domains_touched + ' domains');

  const plan = generatePlan(story, Date.now());
  const planFile = 'turbo-plan-' + Date.now() + '.json';
  fs.writeFileSync(path.join(PLANS, planFile), JSON.stringify(plan, null, 2));
  log('  PLAN: ' + plan.next_action);

  // PHASE 3: MEASURE THE EXPLOSION
  log('PHASE 3: MEASURE EXPLOSIVE GROWTH');
  const intakeTotal = fs.readdirSync(INTAKE).filter(f => f.endsWith('.json')).length;
  const nutrientTotal = fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json')).length;
  const storyTotal = fs.readdirSync(STORIES).filter(f => f.endsWith('.json')).length;
  const planTotal = fs.readdirSync(PLANS).filter(f => f.endsWith('.json')).length;

  log('═══ TURBOCHARGE RESULTS ═══');
  log('  Intake:    ' + intakeTotal);
  log('  Nutrients: ' + nutrientTotal);
  log('  Stories:   ' + storyTotal);
  log('  Plans:     ' + planTotal);
  log('  New feeds: ' + eaten + ' (' + (totalBytes/1024/1024).toFixed(2) + 'MB)');
  log('  Items:     ' + story.total_items_found);
  log('  Domains:   ' + story.unique_domains_touched);
  log('  Density:   ' + story.nutrient_density);
  log('═══ TURBOCHARGE COMPLETE ═══');
}

turbocharge().catch(e => log('TURBO FAILED: ' + e.message));
