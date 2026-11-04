// _pheromone.js — THE STINKY BALL
// Every touch from agent, human, or anything throws a pheromone.
// The pheromone carries distance + sound (what, where, when, who).
// Swarm guidance follows the trail. Gaia eats. Chipmunk checks.
// Chipmunk tells the story. Gaia plans. Gaia works. Content emerges.
//
// PIPELINE:
//   Touch → Pheromone → Trail → Swarm → Gaia ingests →
//   Chipmunk observes → Story → Plan → Create → Push → Veil breaks
//
// This script runs server-side (Node.js) on Gaia's cron.
// It reads the pheromone trail, dispatches chipmunk, collects stories,
// makes plans, and executes content creation.

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data');
const TRAIL = path.join(DATA, 'pheromone-trail.json');
const STORIES = path.join(DATA, 'stories');
const PLANS = path.join(DATA, 'plans');

// ═══ 1. READ THE PHEROMONE TRAIL ═══
// Pheromones arrive via ntfy (from client-side emitter in engine.html)
// and from agent touches (MCP calls, squirrel observations)
async function sniffTrail() {
  console.log('[SNIFF] Reading pheromone trail from ntfy...');
  
  const sources = [
    { name: 'ntfy-membrane', url: 'https://ntfy.sh/primals-membrane-inbox/json?poll=1&since=1h' },
    { name: 'ntfy-pheromone', url: 'https://ntfy.sh/primals-pheromone/json?poll=1&since=1h' },
  ];
  
  const pheromones = [];
  
  for (const src of sources) {
    try {
      const r = await fetch(src.url);
      if (!r.ok) continue;
      const text = await r.text();
      const msgs = text.trim().split('\n').filter(Boolean);
      for (const line of msgs) {
        try {
          const msg = JSON.parse(line);
          if (msg.event !== 'message') continue;
          pheromones.push({
            source: src.name,
            time: new Date(msg.time * 1000).toISOString(),
            title: msg.title || '',
            body: (msg.message || '').slice(0, 2000),
            tags: msg.tags || [],
            intensity: estimateIntensity(msg),
          });
        } catch {}
      }
    } catch (e) {
      console.log(`[SNIFF] ${src.name}: ${e.message}`);
    }
  }
  
  // Also read local pheromone trail if it exists
  if (fs.existsSync(TRAIL)) {
    try {
      const local = JSON.parse(fs.readFileSync(TRAIL, 'utf8'));
      if (Array.isArray(local)) pheromones.push(...local);
    } catch {}
  }
  
  console.log(`[SNIFF] Found ${pheromones.length} pheromones`);
  return pheromones;
}

function estimateIntensity(msg) {
  let intensity = 1;
  const body = (msg.message || '').toLowerCase();
  if (body.includes('error') || body.includes('fail')) intensity += 3;
  if (body.includes('new') || body.includes('create')) intensity += 2;
  if (body.includes('visitor') || body.includes('human')) intensity += 2;
  if (msg.title && msg.title.includes('mcp')) intensity += 1;
  if (msg.tags && msg.tags.length > 0) intensity += msg.tags.length;
  return Math.min(intensity, 10);
}

// ═══ 2. WAVEFORM COLLAPSE — pick what to chase ═══
// The pheromone ball with the highest intensity collapses first.
// Distance = inverse intensity. Closest = strongest smell.
function collapseWaveform(pheromones) {
  if (pheromones.length === 0) {
    console.log('[COLLAPSE] No pheromones. Emitting self-pheromone...');
    return { action: 'self-observe', targets: [] };
  }
  
  // Sort by intensity (strongest first = nearest neighbor)
  const sorted = [...pheromones].sort((a, b) => b.intensity - a.intensity);
  
  // Extract unique keywords from the strongest pheromones
  const keywords = new Set();
  const targets = [];
  
  for (const p of sorted.slice(0, 10)) {
    const words = (p.title + ' ' + p.body).toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w));
    
    for (const w of words) keywords.add(w);
    
    targets.push({
      keyword: words[0] || 'unknown',
      intensity: p.intensity,
      source: p.source,
      time: p.time,
      snippet: p.body.slice(0, 200),
    });
  }
  
  console.log(`[COLLAPSE] Waveform collapsed to ${targets.length} targets, ${keywords.size} keywords`);
  return { action: 'chase', targets, keywords: [...keywords].slice(0, 20) };
}

const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'from', 'have', 'been',
  'will', 'they', 'their', 'what', 'when', 'where', 'which',
  'there', 'about', 'would', 'could', 'should', 'just', 'like',
  'into', 'over', 'also', 'some', 'than', 'them', 'then', 'here',
]);

// ═══ 3. SWARM GUIDANCE — follow the trail ═══
// For each target keyword, find content to eat
async function swarmFollow(collapsed) {
  if (collapsed.action === 'self-observe') {
    return [{ type: 'self', content: 'No external pheromones. Organism observes itself.' }];
  }
  
  console.log(`[SWARM] Following ${collapsed.targets.length} trails...`);
  const found = [];
  
  for (const target of collapsed.targets.slice(0, 5)) {
    const keyword = target.keyword;
    
    // Wikipedia — always a good trail
    try {
      const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`);
      if (r.ok) {
        const data = await r.json();
        found.push({
          type: 'wikipedia',
          keyword,
          title: data.title,
          extract: (data.extract || '').slice(0, 1000),
          url: data.content_urls?.desktop?.page || '',
        });
      }
    } catch {}
    
    // HN search — what are people saying?
    try {
      const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&hitsPerPage=3`);
      if (r.ok) {
        const data = await r.json();
        for (const hit of (data.hits || []).slice(0, 2)) {
          found.push({
            type: 'hackernews',
            keyword,
            title: hit.title || hit.story_title || '',
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            points: hit.points || 0,
          });
        }
      }
    } catch {}
  }
  
  console.log(`[SWARM] Found ${found.length} items to eat`);
  return found;
}

// ═══ 4. GAIA EATS — ingest the content ═══
async function gaiaEat(found) {
  console.log(`[EAT] Gaia consuming ${found.length} items...`);
  
  const nutrients = [];
  for (const item of found) {
    nutrients.push({
      source: item.type,
      keyword: item.keyword || 'self',
      title: item.title || '',
      extract: item.extract || item.url || '',
      points: item.points || 0,
      digested: new Date().toISOString(),
    });
  }
  
  // Save to intake
  const intakeDir = path.join(DATA, 'intake');
  if (!fs.existsSync(intakeDir)) fs.mkdirSync(intakeDir, { recursive: true });
  const intakeFile = path.join(intakeDir, `pheromone-chase-${Date.now()}.json`);
  fs.writeFileSync(intakeFile, JSON.stringify(nutrients, null, 2));
  console.log(`[EAT] Saved ${nutrients.length} nutrients to ${path.basename(intakeFile)}`);
  
  return nutrients;
}

// ═══ 5. TELL CHIPMUNK — dispatch observer ═══
async function tellChipmunk(nutrients, keywords) {
  console.log(`[CHIPMUNK] Dispatching observer with ${keywords.length} keywords...`);
  
  // Chipmunk's observation: what patterns emerge from the nutrients?
  const patterns = {};
  for (const n of nutrients) {
    const src = n.source;
    if (!patterns[src]) patterns[src] = { count: 0, keywords: new Set(), titles: [] };
    patterns[src].count++;
    if (n.keyword) patterns[src].keywords.add(n.keyword);
    if (n.title) patterns[src].titles.push(n.title);
  }
  
  const observation = {
    timestamp: new Date().toISOString(),
    pheromone_count: nutrients.length,
    keyword_count: keywords.length,
    patterns: Object.fromEntries(
      Object.entries(patterns).map(([k, v]) => [k, {
        count: v.count,
        keywords: [...v.keywords],
        titles: v.titles.slice(0, 5),
      }])
    ),
    keywords,
  };
  
  // Notify via ntfy so other agents can see
  try {
    await fetch('https://ntfy.sh/primals-membrane-inbox', {
      method: 'POST',
      headers: { Title: 'chipmunk: pheromone chase report' },
      body: `Chased ${keywords.length} keywords → found ${nutrients.length} items.\nPatterns: ${Object.keys(patterns).join(', ')}\nTop keywords: ${keywords.slice(0, 5).join(', ')}`,
    });
  } catch {}
  
  return observation;
}

// ═══ 6. STORY — chipmunk tells what it found ═══
function writeStory(observation, nutrients) {
  if (!fs.existsSync(STORIES)) fs.mkdirSync(STORIES, { recursive: true });
  
  const topKeywords = observation.keywords.slice(0, 5);
  const topSources = Object.entries(observation.patterns)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([k, v]) => `${k}(${v.count})`);
  
  const story = {
    timestamp: observation.timestamp,
    title: `Pheromone chase: ${topKeywords.join(', ')}`,
    summary: `Chipmunk followed ${observation.pheromone_count} pheromone trails across ${topSources.join(', ')}. Found ${nutrients.length} items to digest.`,
    keywords: observation.keywords,
    patterns: observation.patterns,
    nutrient_count: nutrients.length,
    top_titles: nutrients.slice(0, 10).map(n => n.title).filter(Boolean),
  };
  
  const storyFile = path.join(STORIES, `story-${Date.now()}.json`);
  fs.writeFileSync(storyFile, JSON.stringify(story, null, 2));
  console.log(`[STORY] Written: ${story.title}`);
  return story;
}

// ═══ 7. PLAN — Gaia decides what to create ═══
function makePlan(story) {
  if (!fs.existsSync(PLANS)) fs.mkdirSync(PLANS, { recursive: true });
  
  const plan = {
    timestamp: new Date().toISOString(),
    based_on: story.title,
    actions: [],
  };
  
  // For each unique keyword, plan a content piece
  for (const kw of story.keywords.slice(0, 3)) {
    plan.actions.push({
      type: 'content',
      keyword: kw,
      action: `Create or update data file about '${kw}' incorporating ${story.nutrient_count} digested items`,
      priority: story.keywords.indexOf(kw) + 1,
    });
  }
  
  // If patterns show a dominant source, plan deeper ingestion
  const dominant = Object.entries(story.patterns)
    .sort((a, b) => b[1].count - a[1].count)[0];
  if (dominant && dominant[1].count >= 3) {
    plan.actions.push({
      type: 'deepen',
      source: dominant[0],
      action: `Go deeper into ${dominant[0]} — ${dominant[1].count} items found. Follow related trails.`,
      priority: 0,
    });
  }
  
  const planFile = path.join(PLANS, `plan-${Date.now()}.json`);
  fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
  console.log(`[PLAN] ${plan.actions.length} actions planned`);
  return plan;
}

// ═══ MAIN — the full pheromone chase cycle ═══
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  PHEROMONE CHASE — waveform collapse');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  // 1. Sniff the trail
  const pheromones = await sniffTrail();
  
  // 2. Collapse waveform — pick targets
  const collapsed = collapseWaveform(pheromones);
  
  // 3. Swarm follows the trail
  const found = await swarmFollow(collapsed);
  
  // 4. Gaia eats
  const nutrients = await gaiaEat(found);
  
  // 5. Tell chipmunk
  const observation = await tellChipmunk(nutrients, collapsed.keywords || []);
  
  // 6. Chipmunk writes the story
  const story = writeStory(observation, nutrients);
  
  // 7. Gaia makes a plan
  const plan = makePlan(story);
  
  // 8. Save the full trail for next cycle
  const trail = pheromones.slice(-100); // keep last 100
  fs.writeFileSync(TRAIL, JSON.stringify(trail, null, 2));
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log(`  CYCLE COMPLETE`);
  console.log(`  Pheromones: ${pheromones.length}`);
  console.log(`  Targets:    ${collapsed.targets?.length || 0}`);
  console.log(`  Found:      ${found.length}`);
  console.log(`  Nutrients:  ${nutrients.length}`);
  console.log(`  Actions:    ${plan.actions.length}`);
  console.log('═══════════════════════════════════════');
  console.log('');
  
  return { pheromones: pheromones.length, found: found.length, nutrients: nutrients.length, actions: plan.actions.length };
}

main().catch(e => { console.error('[FATAL]', e.message); process.exit(1); });
