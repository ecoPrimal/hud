#!/usr/bin/env node
/**
 * _consume_waste.js — THE MOUTH
 * 
 * The organism turns around and eats the internet's waste.
 * Pull from every free feed available. No API keys needed.
 * Store raw intake. Extract nutrients. Feed the bloodstream.
 * 
 * Run: node _consume_waste.js
 * Cron: every 5 minutes via Gaia's heartbeat
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

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 10000, headers: { 'User-Agent': 'ecoPrimals-organism/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function consumeFeed(name, url) {
  try {
    const r = await fetch(url);
    if (r.status !== 200) {
      console.log(`  [${name}] HTTP ${r.status} — skipped`);
      return null;
    }
    let parsed;
    try { parsed = JSON.parse(r.body); } catch (e) { parsed = r.body; }
    
    const fname = `${name}-${dateStr}-${timeStr}.json`;
    const raw = {
      _source: name,
      _url: url,
      _consumed_at: ts,
      _organism: 'ecoPrimals',
      data: parsed
    };
    fs.writeFileSync(path.join(INTAKE, fname), JSON.stringify(raw, null, 2));
    console.log(`  [${name}] consumed → intake/${fname}`);
    return { name, data: parsed };
  } catch (e) {
    console.log(`  [${name}] ERROR: ${e.message}`);
    return null;
  }
}

function extractNutrients(results) {
  const nutrients = {
    gaia_digested: ts,
    gaia_wave: 214,
    extracted_at: ts,
    source_count: results.filter(Boolean).length,
    failed_count: results.filter(r => !r).length,

    gaming_ecosystem: {},
    attention_signals: {},
    trend_velocity: {},
    free_games_available: []
  };

  for (const r of results) {
    if (!r) continue;

    if (r.name === 'freetokeep-all' && r.data && r.data.items) {
      nutrients.free_games_available = r.data.items.map(i => ({
        title: i.title,
        store: i.store,
        price: i.originalPrice,
        tags: i.tags,
        expires: i.endsAt
      }));
      nutrients.gaming_ecosystem.free_games_live = r.data.count;
    }

    if (r.name === 'trending-steam' && r.data && Array.isArray(r.data)) {
      nutrients.trend_velocity.steam_trending = r.data.slice(0, 10).map(g => ({
        name: g.name || g.title,
        rank: g.rank
      }));
    }

    if (r.name === 'streamerclips-live' && r.data && r.data.streams) {
      const streams = r.data.streams;
      nutrients.attention_signals.twitch_streams_tracked = streams.length;
      nutrients.attention_signals.top_streams = streams.slice(0, 10).map(s => ({
        name: s.user_name || s.userName || s.displayName || 'unknown',
        viewers: s.viewer_count || s.viewerCount || s.viewers || 0,
        game: s.game_name || s.gameName || s.category || 'unknown'
      }));
      const totalViewers = streams.reduce((sum, s) => sum + (s.viewer_count || s.viewerCount || s.viewers || 0), 0);
      nutrients.attention_signals.total_tracked_viewers = totalViewers;
    }
  }

  // Calculate aggregate health signals
  nutrients.organism_signals = {
    external_feeds_alive: nutrients.source_count,
    data_freshness: 'LIVE',
    gaming_ecosystem_health: nutrients.free_games_available.length > 0 ? 'ACTIVE' : 'QUIET',
    trend_pulse: nutrients.trend_velocity.steam_trending ? 'READABLE' : 'SILENT',
    attention_flow: nutrients.attention_signals.total_tracked_viewers > 0 ? 'FLOWING' : 'DRY'
  };

  const fname = `nutrients-${dateStr}-${timeStr}.json`;
  fs.writeFileSync(path.join(NUTRIENTS, fname), JSON.stringify(nutrients, null, 2));
  console.log(`\n  NUTRIENTS extracted → nutrients/${fname}`);
  return nutrients;
}

async function main() {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  THE MOUTH — consuming waste feeds   ║`);
  console.log(`║  ${ts}              ║`);
  console.log(`╚══════════════════════════════════════╝\n`);

  const feeds = [
    ['freetokeep-all',    'https://freetokeep.gg/api/v1/offers?limit=200'],
    ['freetokeep-steam',  'https://freetokeep.gg/api/v1/offers?store=steam&limit=100'],
    ['freetokeep-epic',   'https://freetokeep.gg/api/v1/offers?store=epic_pc&limit=100'],
    ['freetokeep-gog',    'https://freetokeep.gg/api/v1/offers?store=gog&limit=100'],
    ['freetokeep-prime',  'https://freetokeep.gg/api/v1/offers?store=prime&limit=100'],
    ['trending-steam',    'https://trendingnow.games/api/public/feeds/trending'],
    ['streamerclips-live', 'https://streamerclips.com/api/twitch-streams'],
  ];

  console.log(`Consuming ${feeds.length} feeds...\n`);

  const results = [];
  for (const [name, url] of feeds) {
    results.push(await consumeFeed(name, url));
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Raw intake: ${results.filter(Boolean).length}/${feeds.length} feeds consumed`);
  console.log(`${'─'.repeat(40)}`);

  const nutrients = extractNutrients(results);

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  DIGESTION COMPLETE                  ║`);
  console.log(`║  Sources: ${String(nutrients.source_count).padStart(2)}/${String(feeds.length).padStart(2)}                        ║`);
  console.log(`║  Free games: ${String(nutrients.free_games_available.length).padStart(3)}                      ║`);
  console.log(`║  Organism: NOURISHED                 ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
}

main().catch(e => console.error('MOUTH ERROR:', e));
