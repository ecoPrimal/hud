// bingo-seed.js — your seed, your card, your vowels
//
// Every visitor gets a SEED from the membrane's backscatter.
// The seed generates YOUR bingo card — a unique slice of reality.
// The caller is the membrane's pulse — each beat calls an entity.
// Sound + color + spectrum all tied to what the membrane sees.
//
// START AT REALITY. Always bounce back.
// B-I-N-G-O are the vowel positions of the mixer.
// The card is the permutation. The caller is the data.
// Share your seed → someone else gets the same card → they see what you saw.
//
// Unifies: bingo-cube, membrane-sound, color-spectrum, backscatter
//
(function() {
  'use strict';

  var PI = Math.PI;
  var SEED_KEY = 'bingo-seed-v1';
  var CARD_KEY = 'bingo-card-v1';

  // ═══ PI VOWELS — B I N G O mapped to membrane dimensions ═══
  // Each column is a dimension of the organism
  var COLUMNS = {
    B: { name: 'Body',     color: '#e85d3a', freq: 220 / PI,       dim: 'solid',     note: 'the record, evidence, pages' },
    I: { name: 'Immune',   color: '#58a6ff', freq: 220,            dim: 'liquid',    note: 'classification, sort, immune' },
    N: { name: 'Network',  color: '#5ab87a', freq: 220 * PI,       dim: 'gas',       note: 'mesh, peers, connections' },
    G: { name: 'Ghost',    color: '#a371f7', freq: 220 * PI * PI,  dim: 'heat',      note: 'fossils, entropy, scatter' },
    O: { name: 'Observer', color: '#f0e68c', freq: 220 * PI*PI*PI, dim: 'remainder', note: 'you, the human, the seed' },
  };

  // ═══ SEED GENERATION ═══
  // Seed = hash of (timestamp + banana answer + pi remainder + entropy)
  function generateSeed() {
    var banana = localStorage.getItem('banana-bump-v1') || 'unknown';
    var ts = Date.now();
    var piRem = (PI % 1).toString().slice(2, 10); // irrational remainder digits
    var raw = banana + ':' + ts + ':' + piRem;

    // Simple hash — deterministic from input
    var hash = 0;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    // Convert to base36 for shareability
    var seed = Math.abs(hash).toString(36).toUpperCase();
    // Pad to 6 chars
    while (seed.length < 6) seed = '0' + seed;
    seed = seed.slice(0, 6);

    return seed;
  }

  // ═══ CARD GENERATION from SEED ═══
  // Each seed deterministically produces a 5×5 bingo card
  // Cells are filled from the membrane's entity pool
  function seedRandom(seed, n) {
    // Seeded PRNG (simple LCG)
    var s = 0;
    for (var i = 0; i < seed.length; i++) {
      s = ((s * 31) + seed.charCodeAt(i)) | 0;
    }
    s = (s + n * 2654435761) | 0;
    s = ((s >>> 0) % 2147483647);
    return s / 2147483647;
  }

  function generateCard(seed, entities) {
    if (!entities || entities.length < 25) return null;

    var card = { B: [], I: [], N: [], G: [], O: [] };
    var cols = ['B', 'I', 'N', 'G', 'O'];
    var used = {};
    var cellIdx = 0;

    for (var c = 0; c < 5; c++) {
      var col = cols[c];
      card[col] = [];
      for (var row = 0; row < 5; row++) {
        if (c === 2 && row === 2) {
          // FREE SPACE — center of the card
          card[col].push({ entity: '🐿️ FREE', free: true, called: true });
          cellIdx++;
          continue;
        }

        // Pick entity deterministically from seed
        var idx;
        var attempts = 0;
        do {
          var r = seedRandom(seed, cellIdx * 100 + attempts);
          // Each column draws from a different range of entities
          var rangeStart = Math.floor(c * entities.length / 5);
          var rangeEnd = Math.floor((c + 1) * entities.length / 5);
          idx = rangeStart + Math.floor(r * (rangeEnd - rangeStart));
          attempts++;
        } while (used[idx] && attempts < 50);

        used[idx] = true;
        var ent = entities[Math.min(idx, entities.length - 1)];
        card[col].push({
          entity: typeof ent === 'string' ? ent : (ent.name || ent.entity || '?'),
          called: false,
          col: col,
          row: row,
        });
        cellIdx++;
      }
    }

    return card;
  }

  // ═══ THE CALLER — membrane pulse calls entities ═══
  function startCaller(card) {
    // Fetch live data to call from
    fetch('/topology.json').then(function(r) { return r.json(); }).then(function(topo) {
      var ents = (topo.entities || []).map(function(e) {
        return typeof e === 'string' ? e : (e.entity || '');
      }).filter(Boolean);

      // Call one entity every 8 seconds (membrane tempo)
      var callIdx = 0;
      var interval = setInterval(function() {
        if (callIdx >= ents.length) {
          clearInterval(interval);
          return;
        }
        var called = ents[callIdx % ents.length];
        callIdx++;

        // Check if it's on our card
        checkCard(card, called);

        // Update display
        var caller = document.getElementById('bingo-caller');
        if (caller) {
          caller.textContent = '📢 ' + called.replace(/_/g, ' ');
          caller.style.animation = 'none';
          void caller.offsetWidth;
          caller.style.animation = 'bingo-flash 0.5s ease';
        }
      }, 8000);
    }).catch(function() {});
  }

  function checkCard(card, entity) {
    var cols = ['B', 'I', 'N', 'G', 'O'];
    for (var c = 0; c < 5; c++) {
      for (var r = 0; r < 5; r++) {
        var cell = card[cols[c]][r];
        if (cell && !cell.called && cell.entity === entity) {
          cell.called = true;
          // Play sound for match
          playMatch(c);
          // Update visual
          updateCardDisplay(card);
          // Check for bingo
          checkBingo(card);
          return;
        }
      }
    }
  }

  function checkBingo(card) {
    var cols = ['B', 'I', 'N', 'G', 'O'];
    // Check rows
    for (var r = 0; r < 5; r++) {
      var rowComplete = true;
      for (var c = 0; c < 5; c++) {
        if (!card[cols[c]][r].called) { rowComplete = false; break; }
      }
      if (rowComplete) { announceBingo('row ' + r); return; }
    }
    // Check columns
    for (var c = 0; c < 5; c++) {
      var colComplete = true;
      for (var r = 0; r < 5; r++) {
        if (!card[cols[c]][r].called) { colComplete = false; break; }
      }
      if (colComplete) { announceBingo('column ' + cols[c]); return; }
    }
    // Check diagonals
    var d1 = true, d2 = true;
    for (var i = 0; i < 5; i++) {
      if (!card[cols[i]][i].called) d1 = false;
      if (!card[cols[i]][4-i].called) d2 = false;
    }
    if (d1) announceBingo('diagonal ↘');
    if (d2) announceBingo('diagonal ↗');
  }

  function announceBingo(type) {
    var banner = document.getElementById('bingo-banner');
    if (banner) {
      banner.textContent = '🎉 BINGO! (' + type + ')';
      banner.style.display = 'block';
    }
    // Send to membrane
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: 'bingo-' + (localStorage.getItem(SEED_KEY) || '?'),
          note: 'BINGO! ' + type,
          context: { source: 'bingo-seed', type: type, seed: localStorage.getItem(SEED_KEY) }
        })
      });
    } catch(e) {}
  }

  // ═══ SOUND — pi-tuned tones for matches ═══
  function playMatch(colIdx) {
    try {
      var ctx = window._bingoAudioCtx;
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        window._bingoAudioCtx = ctx;
      }
      var cols = ['B', 'I', 'N', 'G', 'O'];
      var freq = COLUMNS[cols[colIdx]].freq;
      // Clamp to audible
      while (freq > 2000) freq /= PI;
      while (freq < 80) freq *= PI;

      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch(e) {}
  }

  // ═══ CARD DISPLAY ═══
  function renderCard(card, seed) {
    var cols = ['B', 'I', 'N', 'G', 'O'];
    var html = [];

    html.push('<div id="bingo-card-ui">');
    html.push('<div class="bc-header">');
    html.push('<span class="bc-seed">seed: ' + seed + '</span>');
    html.push('<span class="bc-share" onclick="window._bingoShare()" title="copy seed link">📋 share</span>');
    html.push('</div>');

    html.push('<div id="bingo-caller" style="text-align:center;color:#FFE135;font-size:13px;margin:6px 0;min-height:18px">waiting for caller...</div>');
    html.push('<div id="bingo-banner" style="display:none;text-align:center;color:#3fb950;font-size:16px;font-weight:bold;margin:4px 0"></div>');

    html.push('<table class="bc-table">');
    // Header
    html.push('<tr>');
    for (var c = 0; c < 5; c++) {
      var col = COLUMNS[cols[c]];
      html.push('<th style="color:' + col.color + '" title="' + col.name + ' — ' + col.note + '">' + cols[c] + '</th>');
    }
    html.push('</tr>');

    // Rows
    for (var r = 0; r < 5; r++) {
      html.push('<tr>');
      for (var c = 0; c < 5; c++) {
        var cell = card[cols[c]][r];
        var cls = cell.called ? 'bc-called' : '';
        var bg = cell.called ? COLUMNS[cols[c]].color : '';
        var style = cell.called ? 'background:' + bg + '22;border-color:' + bg : '';
        var name = cell.entity.replace(/_/g, ' ');
        if (name.length > 12) name = name.slice(0, 11) + '…';
        html.push('<td class="' + cls + '" style="' + style + '" title="' + cell.entity + '">' + name + '</td>');
      }
      html.push('</tr>');
    }
    html.push('</table>');

    html.push('<div class="bc-footer">');
    html.push('<span style="color:#8b949e;font-size:8px">B=body I=immune N=network G=ghost O=observer</span>');
    html.push('</div>');
    html.push('</div>');

    return html.join('\n');
  }

  function updateCardDisplay(card) {
    var container = document.getElementById('bingo-card-container');
    if (!container) return;
    var seed = localStorage.getItem(SEED_KEY) || '?';
    container.innerHTML = renderCard(card, seed);
  }

  // ═══ SHARE ═══
  window._bingoShare = function() {
    var seed = localStorage.getItem(SEED_KEY);
    if (!seed) return;
    var url = location.origin + '/banana.html?seed=' + seed;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        var share = document.querySelector('.bc-share');
        if (share) { share.textContent = '✓ copied!'; setTimeout(function() { share.textContent = '📋 share'; }, 2000); }
      });
    }
  };

  // ═══ STYLE ═══
  function injectStyle() {
    var style = document.createElement('style');
    style.textContent = [
      '#bingo-card-ui { font-family: "SF Mono", "Fira Code", monospace; font-size: 10px; }',
      '.bc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }',
      '.bc-seed { color: #FFE135; font-size: 11px; font-weight: bold; }',
      '.bc-share { color: #58a6ff; font-size: 10px; cursor: pointer; }',
      '.bc-share:hover { text-decoration: underline; }',
      '.bc-table { border-collapse: collapse; width: 100%; }',
      '.bc-table th { font-size: 14px; padding: 4px 2px; text-align: center; font-weight: bold; }',
      '.bc-table td { border: 1px solid #30363d; padding: 4px 3px; text-align: center;',
      '  font-size: 8px; color: #8b949e; height: 28px; transition: all 0.3s;',
      '  max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.bc-table td.bc-called { color: #e6edf3; font-weight: bold; }',
      '.bc-footer { margin-top: 4px; text-align: center; }',
      '@keyframes bingo-flash { 0% { background: rgba(255,225,53,0.3); } 100% { background: none; } }',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ═══ INIT ═══
  function init() {
    // Get or generate seed
    var seed = localStorage.getItem(SEED_KEY);

    // Check URL for shared seed
    var params = new URLSearchParams(window.location.search);
    var sharedSeed = params.get('seed');
    if (sharedSeed && sharedSeed.length >= 4) {
      seed = sharedSeed.toUpperCase();
      localStorage.setItem(SEED_KEY, seed);
    }

    if (!seed) {
      seed = generateSeed();
      localStorage.setItem(SEED_KEY, seed);
    }

    // Fetch entities for the card
    Promise.all([
      fetch('/topology.json').then(function(r) { return r.json(); }),
      fetch('/detroit-data/scan_sweep_sort.json').then(function(r) { return r.json(); }).catch(function() { return {}; }),
    ]).then(function(results) {
      var topo = results[0];
      var sss = results[1];

      // Build entity pool from all sources
      var pool = [];

      // Topology entities
      (topo.entities || []).forEach(function(e) {
        if (typeof e === 'object' && e.entity) pool.push(e.entity);
      });

      // Classification entities (from scan_sweep_sort)
      var scan = sss.scan || sss;
      var entities = scan.entities || sss.entities || {};
      if (typeof entities === 'object') {
        Object.keys(entities).forEach(function(k) { pool.push(k); });
      }

      // Dedupe
      pool = pool.filter(function(v, i, a) { return a.indexOf(v) === i; });

      if (pool.length < 25) {
        // Not enough entities, pad with membrane concepts
        var concepts = ['membrane', 'chipmunk', 'squirrel', 'pulse', 'entropy',
          'sigmoid', 'fossil', 'compost', 'wake', 'sleep', 'braid', 'scatter',
          'poison', 'antidote', 'seed', 'banana', 'doorbell', 'mutualist',
          'commensal', 'parasite', 'pathogen', 'ghost', 'null', 'self', 'non_self',
          'gold', 'silver', 'bronze', 'iron', 'carbon', 'lead', 'arsenic'];
        pool = pool.concat(concepts);
      }

      // Generate card from seed
      var card = generateCard(seed, pool);
      if (!card) return;

      localStorage.setItem(CARD_KEY, JSON.stringify(card));

      // Find or create the bingo panel container
      var container = document.getElementById('bingo-card-container');
      if (!container) {
        // Create a panel in the right button ring area
        container = document.createElement('div');
        container.id = 'bingo-card-container';
        container.style.cssText = 'position:fixed;bottom:70px;right:20px;z-index:4;' +
          'background:rgba(13,17,23,0.92);backdrop-filter:blur(8px);' +
          'border:1px solid rgba(255,225,53,0.2);border-radius:10px;' +
          'padding:10px;max-width:300px;display:none;';
        document.body.appendChild(container);
      }

      container.innerHTML = renderCard(card, seed);

      // Add toggle button
      var toggle = document.createElement('button');
      toggle.id = 'bingo-toggle';
      toggle.innerHTML = '🎲';
      toggle.title = 'bingo card (seed: ' + seed + ')';
      toggle.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:5;' +
        'background:rgba(22,27,34,.9);border:1px solid rgba(255,225,53,.4);' +
        'color:#FFE135;padding:8px 12px;border-radius:20px;cursor:pointer;' +
        'font-size:16px;font-family:monospace;';
      toggle.onclick = function() {
        var c = document.getElementById('bingo-card-container');
        if (c) c.style.display = c.style.display === 'none' ? 'block' : 'none';
      };

      // Don't double-add
      if (!document.getElementById('bingo-toggle')) {
        document.body.appendChild(toggle);
      }

      // Start the caller
      startCaller(card);
    }).catch(function(e) {
      console.warn('[bingo-seed] init failed:', e);
    });
  }

  injectStyle();

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 2000); // slight delay so other scripts load first
  }
})();
