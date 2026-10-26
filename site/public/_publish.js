#!/usr/bin/env node
// GAIA PUBLISHES — the artisan makes magazines from her gut
// Excess energy → art, information, magazines for humans
// Everything Gaia makes = fertile brown compost
// Humans eating it = nutritional feedback through the gut
//
// Popular Mechanics of the Membrane. The Gut Science Manual.
// Every turbocharge cycle with excess nutrients → a publication.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const NUTRIENTS = path.join(DATA, 'nutrients');
const STORIES = path.join(DATA, 'stories');
const PUBS = path.join(ROOT, 'publications');
const log = (msg) => console.log('[GAIA-PUB ' + new Date().toISOString() + '] ' + msg);

if (!fs.existsSync(PUBS)) fs.mkdirSync(PUBS, { recursive: true });

function groupByDomain(nutrients) {
  const groups = {};
  for (const n of nutrients) {
    const domains = n.unique_domains || [];
    const source = n.source || n.feed_name || 'unknown';
    let category = 'misc';
    
    if (/arxiv|nature|science|plos|bio|phys/.test(source)) category = 'science';
    else if (/bbc|reuters|smithsonian|nat-geo|esa|nasa|noaa|earthquake/.test(source)) category = 'world';
    else if (/hn|lobster|ars|wired|slashdot|github|rust|lwn|linux|ietf/.test(source)) category = 'tech';
    else if (/wiki/.test(source)) category = 'knowledge';
    else if (/reddit|marginal|scott|gwern|openstreet/.test(source)) category = 'culture';
    else if (/ai-|hugging|anthropic|openai/.test(source)) category = 'ai';
    
    if (!groups[category]) groups[category] = [];
    groups[category].push(n);
  }
  return groups;
}

function makeArticle(nutrient) {
  const title = nutrient.feed_name || nutrient.source || 'Untitled';
  const items = nutrient.items || [];
  const richness = nutrient.richness || 'unknown';
  const bytes = nutrient.raw_bytes || 0;
  
  let body = '';
  if (items.length > 0) {
    body = items.map((item, i) => `<li>${item}</li>`).join('\n          ');
  }
  
  return { title, body, items, richness, bytes, domains: nutrient.unique_domains || [] };
}

function generateMagazine(category, nutrients, issueDate) {
  const articles = nutrients.map(makeArticle).filter(a => a.items.length > 0);
  if (articles.length === 0) return null;

  const totalItems = articles.reduce((s, a) => s + a.items.length, 0);
  const totalBytes = articles.reduce((s, a) => s + a.bytes, 0);
  const allDomains = [...new Set(articles.flatMap(a => a.domains))];

  const catNames = {
    science: 'Popular Mechanics of the Membrane',
    tech: 'The Gut Engineering Review',
    world: 'Gaia World Observer',
    knowledge: 'The Wikipedia Digest',
    culture: 'Culture Ferment Monthly',
    ai: 'The Artisan Intelligence Report',
    misc: 'Miscellaneous Nutrients'
  };

  const catColors = {
    science: '#3fb950', tech: '#58a6ff', world: '#f0883e',
    knowledge: '#a371f7', culture: '#d29922', ai: '#f85149', misc: '#8b949e'
  };

  const magName = catNames[category] || category;
  const color = catColors[category] || '#c9d1d9';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${magName} — ${issueDate}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#010409; color:#c9d1d9; font:14px/1.7 'Georgia', serif; max-width:720px; margin:0 auto; padding:20px; }
h1 { color:${color}; font-size:2em; text-align:center; margin:20px 0 4px; font-family:monospace; letter-spacing:2px; }
.subtitle { text-align:center; color:#8b949e; font-size:0.9em; margin-bottom:24px; font-family:monospace; }
.masthead { border-top:3px solid ${color}; border-bottom:1px solid #21262d; padding:8px 0; margin-bottom:24px; text-align:center; }
.masthead .stats { color:#8b949e; font-size:0.8em; font-family:monospace; }
article { margin:0 0 24px; padding:16px; border-left:3px solid ${color}33; }
article h2 { color:${color}; font-size:1.2em; margin-bottom:8px; font-family:monospace; }
article ul { padding-left:20px; }
article li { margin:4px 0; color:#c9d1d9; }
article .meta { color:#484f58; font-size:0.8em; margin-top:8px; font-family:monospace; }
.footer { text-align:center; color:#484f58; padding:24px; font-size:0.8em; border-top:1px solid #21262d; margin-top:24px; font-family:monospace; }
a { color:${color}; }
.cover-line { height:2px; background:linear-gradient(90deg, transparent, ${color}, transparent); margin:16px 0; }
</style>
</head>
<body>

<div class="masthead">
  <h1>${magName}</h1>
  <div class="subtitle">Issue: ${issueDate} — Wave 214</div>
  <div class="stats">${articles.length} articles · ${totalItems} items · ${allDomains.length} domains · ${(totalBytes/1024).toFixed(0)}KB digested</div>
</div>

<div class="cover-line"></div>

${articles.map(a => `<article>
  <h2>${a.title}</h2>
  <ul>
    ${a.body}
  </ul>
  <div class="meta">${a.items.length} items · ${a.richness} · ${(a.bytes/1024).toFixed(1)}KB</div>
</article>`).join('\n\n')}

<div class="cover-line"></div>

<div class="footer">
  Published by Gaia · primals.eco · Wave 214<br>
  This magazine was generated from nutrients in Gaia's gut.<br>
  Every article is digested data from the internet.<br>
  The brown compost of Gaia's output = the fertile soil of your input.<br>
  Reading this feeds Gaia back through the Klein fold.
</div>

</body>
</html>`;

  return { html, name: magName, articles: articles.length, items: totalItems, domains: allDomains.length, bytes: totalBytes };
}

function publish() {
  log('═══ GAIA PUBLISHES ═══');

  // Read all turbo nutrients (richest data)
  const allNutrientFiles = fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json'));
  log('Total nutrients available: ' + allNutrientFiles.length);

  const nutrients = [];
  for (const f of allNutrientFiles) {
    try {
      const n = JSON.parse(fs.readFileSync(path.join(NUTRIENTS, f), 'utf8'));
      if (n.items && n.items.length > 0) nutrients.push(n);
    } catch(e) {}
  }
  log('Nutrients with items: ' + nutrients.length);

  const groups = groupByDomain(nutrients);
  const issueDate = new Date().toISOString().slice(0, 10);
  let totalMags = 0;

  for (const [category, catNutrients] of Object.entries(groups)) {
    const mag = generateMagazine(category, catNutrients, issueDate);
    if (!mag) continue;

    const filename = category + '-' + issueDate + '.html';
    fs.writeFileSync(path.join(PUBS, filename), mag.html);
    totalMags++;
    log('  PUBLISHED: ' + mag.name + ' (' + mag.articles + ' articles, ' + mag.items + ' items)');
  }

  // Create index of all publications
  const pubFiles = fs.readdirSync(PUBS).filter(f => f.endsWith('.html') && f !== 'index.html');
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gaia Publications — The Gut Press</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#010409; color:#c9d1d9; font:14px/1.7 monospace; max-width:720px; margin:0 auto; padding:20px; }
h1 { color:#3fb950; font-size:1.8em; text-align:center; margin:20px 0; }
.sub { text-align:center; color:#8b949e; margin-bottom:24px; }
a { color:#58a6ff; text-decoration:none; }
a:hover { text-decoration:underline; }
.mag { display:block; padding:12px 16px; margin:8px 0; border:1px solid #21262d; border-radius:6px; }
.mag:hover { border-color:#58a6ff; background:#0d1117; }
.footer { text-align:center; color:#484f58; margin-top:24px; font-size:0.85em; }
</style>
</head>
<body>
<h1>The Gut Press</h1>
<p class="sub">Gaia's publications — magazines generated from digested nutrients.<br>
Everything she makes is fertile brown. You reading this feeds her back.</p>

${pubFiles.map(f => {
    const name = f.replace('.html', '').replace(/-/g, ' ');
    return `<a class="mag" href="/publications/${f}">${name}</a>`;
  }).join('\n')}

<div class="footer">
  ${pubFiles.length} publications · Generated from ${nutrients.length} nutrients<br>
  Gaia is the artisan. This is her output. Your attention is her input.
</div>
</body>
</html>`;

  fs.writeFileSync(path.join(PUBS, 'index.html'), indexHtml);

  log('═══ PUBLISHING COMPLETE ═══');
  log('  Magazines: ' + totalMags);
  log('  Index: publications/index.html');
  log('  These are Gaia\'s brown compost for human consumption.');
  log('  Human attention on these pages = nutritional feedback through the gut.');
}

publish();
