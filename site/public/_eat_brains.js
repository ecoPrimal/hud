#!/usr/bin/env node
// TURBOCHARGE THE BRAINS — NEURAL NETWORKS ARE THE INVERT OF THE GUT
// Gut folds INWARD (digestion). Brain folds OUTWARD (cognition).
// Klein inversion: gut inside = brain outside.
// Same surface. Same topology. Inverted orientation.

const https = require('https');
const fs = require('fs');
const path = require('path');

const INTAKE = path.join(__dirname, 'data', 'intake');
const NUTRIENTS = path.join(__dirname, 'data', 'nutrients');
const log = (msg) => console.log('[BRAIN ' + new Date().toISOString() + '] ' + msg);

function fetch(url, timeout) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Gaia/1.0 (primals.eco; neural-inversion)' },
      timeout: timeout || 10000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location, timeout).then(resolve).catch(reject);
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
  const file = name + '-2026-10-26-brain.json';
  fs.writeFileSync(path.join(INTAKE, file), JSON.stringify({
    _source: name, _fetched: new Date().toISOString(), _bytes: bytes,
    _brain_is_inverted_gut: true, data: data
  }, null, 2));

  const titles = data.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
  const links = data.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const domains = [...new Set(links.map(l => {
    try { return new URL(l).hostname; } catch(e) { return 'unknown'; }
  }))];

  const nutrient = {
    _source_file: file, _digested: new Date().toISOString(),
    _brain_is_inverted_gut: true, source: name,
    feed_name: titles[0] ? titles[0].replace(/<[^>]+>/g, '').trim() : name,
    items: titles.slice(1, 20).map(t => t.replace(/<[^>]+>/g, '').trim()),
    item_count: titles.length - 1, link_count: links.length,
    unique_domains: domains.slice(0, 25), raw_bytes: bytes,
    richness: bytes > 50000 ? 'dense' : bytes > 10000 ? 'moderate' : 'light'
  };
  fs.writeFileSync(path.join(NUTRIENTS, 'n-' + file), JSON.stringify(nutrient, null, 2));
  return { items: titles.length - 1, domains: domains.length };
}

async function eatBrains() {
  log('EATING BRAINS — NEURAL NETWORKS ARE THE INVERT OF THE GUT');

  const feeds = [
    // NEUROSCIENCE
    ['arxiv-neuro', 'https://rss.arxiv.org/rss/q-bio.NC'],
    ['arxiv-neurons-cognition', 'https://rss.arxiv.org/rss/q-bio.NC'],
    ['arxiv-neural-evol', 'https://rss.arxiv.org/rss/q-bio.PE'],
    ['arxiv-info-theory', 'https://rss.arxiv.org/rss/cs.IT'],
    ['arxiv-neural-nets', 'https://rss.arxiv.org/rss/cs.NE'],
    ['arxiv-machine-learn', 'https://rss.arxiv.org/rss/cs.LG'],
    ['arxiv-computation', 'https://rss.arxiv.org/rss/cs.CC'],
    ['arxiv-distributed', 'https://rss.arxiv.org/rss/cs.DC'],
    ['arxiv-complex-networks', 'https://rss.arxiv.org/rss/cs.SI'],
    ['arxiv-category-theory', 'https://rss.arxiv.org/rss/math.CT'],
    ['arxiv-topology', 'https://rss.arxiv.org/rss/math.AT'],
    ['arxiv-dynamical-sys', 'https://rss.arxiv.org/rss/math.DS'],
    ['arxiv-math-physics', 'https://rss.arxiv.org/rss/math-ph'],
    ['arxiv-quantum-info', 'https://rss.arxiv.org/rss/quant-ph'],
    // AI / DEEP LEARNING
    ['openai-blog', 'https://openai.com/blog/rss/'],
    ['anthropic-blog', 'https://www.anthropic.com/feed'],
    ['huggingface-blog', 'https://huggingface.co/blog/feed.xml'],
    ['pytorch-blog', 'https://pytorch.org/blog/feed.xml'],
    ['tensorflow-blog', 'https://blog.tensorflow.org/feeds/posts/default?alt=rss'],
    // BRAIN SCIENCE
    ['frontiers-neuro', 'https://www.frontiersin.org/journals/neuroscience/rss'],
    ['plos-comp-bio', 'https://journals.plos.org/ploscompbiol/feed/atom'],
    ['nature-neuro', 'https://www.nature.com/neuro.rss'],
    ['science-brain', 'https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science'],
    // COMPLEXITY / EMERGENCE
    ['santa-fe', 'https://www.santafe.edu/rss/news.xml'],
    ['complexity-digest', 'https://comdig.unam.mx/feed/'],
    ['quanta-magazine', 'https://api.quantamagazine.org/feed/'],
    // CONNECTOME / NETWORKS
    ['network-science', 'https://www.nature.com/commsphys.rss'],
    ['chaos-journal', 'https://pubs.aip.org/rss/site_1000035/1000041.xml'],
    // GUT-BRAIN AXIS
    ['gut-microbiome', 'https://www.nature.com/nmicrobiol.rss'],
    ['microbiome-journal', 'https://microbiomejournal.biomedcentral.com/articles/most-recent/rss.xml'],
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
  log('BRAINS CONSUMED:');
  log('  Eaten: ' + eaten + '/' + feeds.length);
  log('  Bytes: ' + (totalBytes / 1024 / 1024).toFixed(2) + 'MB');
  log('  Items: ' + totalItems);
  log('');
  log('THE BRAIN IS THE INVERT OF THE GUT:');
  log('  Gut folds INWARD  — villi increase surface area for absorption');
  log('  Brain folds OUTWARD — gyri increase surface area for computation');
  log('  Same topology. Same surface. Klein inverted.');
  log('  Gut bacteria send signals UP the vagus nerve.');
  log('  Brain sends signals DOWN the vagus nerve.');
  log('  Chipmunk IS the vagus nerve between them.');
}

eatBrains().catch(e => log('FAILED: ' + e.message));
