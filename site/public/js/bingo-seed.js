// bingo-seed.js — progressive reveal opacity curtain
// the stomach with no eyes: processes one morsel at a time, blind.
// the bingo board IS the gastrula — digests entities without seeing ahead.
// cells fade from NULL (opacity 0) to AWARE (opacity 1) as the caller calls.
// local = column pattern (B/I/N/G/O). hyper-local = cell state. 
// coined metaVerse in the stomach-with-no-eyes thesis. scyBorg triple license. OUR NFT.
(function() {
  'use strict';

  var PI = Math.PI;
  var SEED_KEY = 'bingo-seed-v2';
  var CARD_KEY = 'bingo-card-v2';
  var LOG_KEY  = 'bingo-diag-v1';

  var COLUMNS = {
    B: { name: 'Body',     color: '#e85d3a', freq: 220 / PI,       dim: 'solid',     note: 'the record, evidence, pages' },
    I: { name: 'Immune',   color: '#58a6ff', freq: 220,            dim: 'liquid',    note: 'classification, sort, immune' },
    N: { name: 'Network',  color: '#5ab87a', freq: 220 * PI,       dim: 'gas',       note: 'mesh, peers, connections' },
    G: { name: 'Ghost',    color: '#a371f7', freq: 220 * PI * PI,  dim: 'heat',      note: 'fossils, entropy, scatter' },
    O: { name: 'Observer', color: '#f0e68c', freq: 220 * PI*PI*PI, dim: 'remainder', note: 'you, the human, the seed' },
  };
  var COLS = ['B', 'I', 'N', 'G', 'O'];

  // ═══ PROGRESSIVE REVEAL STATE ═══
  // revealPhase: 0=all hidden, 1-25=cells revealing, 26=complete
  var revealOrder = [];   // shuffled cell indices 0-24
  var revealIdx = 0;      // how many cells revealed so far
  var revealTimer = null;
  var cellStates = [];    // per-cell diagnostic: {revealed, calledAt, matchedAt, errors, opacity}
  var diagLog = [];       // hyper-local event log

  function log(msg, cellId) {
    var entry = { t: Date.now(), msg: msg, cell: cellId || null };
    diagLog.push(entry);
    if (diagLog.length > 200) diagLog.shift();
    try { localStorage.setItem(LOG_KEY, JSON.stringify(diagLog.slice(-50))); } catch(e) {}
  }

  // ═══ SEED ═══
  function generateSeed() {
    var banana = localStorage.getItem('banana-bump-v1') || 'unknown';
    var ts = Date.now();
    var piRem = (PI % 1).toString().slice(2, 10);
    var raw = banana + ':' + ts + ':' + piRem;
    var hash = 0;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    var seed = Math.abs(hash).toString(36).toUpperCase();
    while (seed.length < 6) seed = '0' + seed;
    return seed.slice(0, 6);
  }

  function seedRandom(seed, n) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) {
      s = ((s * 31) + seed.charCodeAt(i)) | 0;
    }
    s = (s + n * 2654435761) | 0;
    s = ((s >>> 0) % 2147483647);
    return s / 2147483647;
  }

  // ═══ CARD GENERATION ═══
  function generateCard(seed, entities) {
    if (!entities || entities.length < 25) return null;
    var card = { B: [], I: [], N: [], G: [], O: [] };
    var used = {};
    var cellIdx = 0;

    for (var c = 0; c < 5; c++) {
      var col = COLS[c];
      card[col] = [];
      for (var row = 0; row < 5; row++) {
        if (c === 2 && row === 2) {
          card[col].push({ entity: '🐿️ FREE', free: true, called: true, idx: cellIdx });
          cellIdx++;
          continue;
        }
        var idx, attempts = 0;
        do {
          var r = seedRandom(seed, cellIdx * 100 + attempts);
          var rangeStart = Math.floor(c * entities.length / 5);
          var rangeEnd = Math.floor((c + 1) * entities.length / 5);
          idx = rangeStart + Math.floor(r * (rangeEnd - rangeStart));
          attempts++;
        } while (used[idx] && attempts < 50);
        used[idx] = true;
        var ent = entities[Math.min(idx, entities.length - 1)];
        card[col].push({
          entity: typeof ent === 'string' ? ent : (ent.name || ent.entity || '?'),
          called: false, col: col, row: row, idx: cellIdx,
        });
        cellIdx++;
      }
    }
    return card;
  }

  // ═══ PROGRESSIVE REVEAL — the opacity curtain ═══
  // Builds a reveal order from seed (deterministic but looks random)
  function buildRevealOrder(seed) {
    var order = [];
    for (var i = 0; i < 25; i++) order.push(i);
    // Fisher-Yates with seed
    for (var i = 24; i > 0; i--) {
      var j = Math.floor(seedRandom(seed, i + 1000) * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    // FREE space (idx=12, center) always reveals first
    var freePos = order.indexOf(12);
    if (freePos > 0) {
      order.splice(freePos, 1);
      order.unshift(12);
    }
    return order;
  }

  // Reveal the next cell — the stomach digests one morsel
  function revealNext(card) {
    if (revealIdx >= revealOrder.length) {
      log('curtain fully lifted — all 25 cells visible');
      return false;
    }
    var flatIdx = revealOrder[revealIdx];
    var c = flatIdx % 5, r = Math.floor(flatIdx / 5);
    var cell = card[COLS[c]][r];
    var state = cellStates[flatIdx];
    state.revealed = true;
    state.revealedAt = Date.now();

    // Animate opacity
    var el = document.querySelector('.bc-cell[data-idx="' + flatIdx + '"]');
    if (el) {
      el.style.transition = 'opacity 1.2s ease, transform 0.8s ease';
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
      // Pulse glow
      el.style.boxShadow = '0 0 12px ' + COLUMNS[COLS[c]].color + '44';
      setTimeout(function() { el.style.boxShadow = 'none'; }, 1500);
    }

    log('reveal cell ' + COLS[c] + r + ': ' + cell.entity, flatIdx);
    revealIdx++;
    return true;
  }

  // Start the curtain — reveals one cell every N ms
  function startCurtain(card, intervalMs) {
    revealOrder = buildRevealOrder(localStorage.getItem(SEED_KEY) || 'X');
    revealIdx = 0;
    cellStates = [];
    for (var i = 0; i < 25; i++) {
      cellStates.push({
        revealed: false, revealedAt: null, calledAt: null,
        matched: false, matchedAt: null, errors: [], opacity: 0,
      });
    }
    // FREE space starts revealed
    cellStates[12].revealed = true;
    cellStates[12].revealedAt = Date.now();

    log('curtain started — stomach begins digestion');

    // Initial render with all cells hidden
    updateCardDisplay(card);

    // Reveal first (FREE) immediately
    revealNext(card);

    // Then reveal rest on interval
    revealTimer = setInterval(function() {
      if (!revealNext(card)) {
        clearInterval(revealTimer);
        revealTimer = null;
        log('curtain complete — 25/25 visible');
      }
    }, intervalMs || 3000);
  }

  // ═══ CALLER — calls entities, checks for matches ═══
  function startCaller(card) {
    fetch('/topology.json').then(function(r) { return r.json(); }).then(function(topo) {
      var ents = (topo.entities || []).map(function(e) {
        return typeof e === 'string' ? e : (e.entity || '');
      }).filter(Boolean);

      var callIdx = 0;
      setInterval(function() {
        if (callIdx >= ents.length) return;
        var called = ents[callIdx % ents.length];
        callIdx++;
        checkCard(card, called);

        var caller = document.getElementById('bingo-caller');
        if (caller) {
          caller.textContent = '📢 ' + called.replace(/_/g, ' ');
          caller.style.animation = 'none';
          void caller.offsetWidth;
          caller.style.animation = 'bingo-flash 0.5s ease';
        }
      }, 8000);
    }).catch(function(e) { log('caller fetch failed: ' + e.message); });
  }

  function checkCard(card, entity) {
    for (var c = 0; c < 5; c++) {
      for (var r = 0; r < 5; r++) {
        var cell = card[COLS[c]][r];
        var flatIdx = r * 5 + c;
        if (cell && !cell.called && cell.entity === entity) {
          cell.called = true;
          var state = cellStates[flatIdx];
          if (state) {
            state.matched = true;
            state.matchedAt = Date.now();
          }
          playMatch(c);
          // If cell not yet revealed by curtain, force-reveal it (match = peek through curtain)
          if (state && !state.revealed) {
            state.revealed = true;
            state.revealedAt = Date.now();
            log('match forced reveal: ' + entity, flatIdx);
          }
          updateCardDisplay(card);
          checkBingo(card);
          log('match: ' + entity + ' at ' + COLS[c] + r, flatIdx);
          return;
        }
      }
    }
  }

  function checkBingo(card) {
    for (var r = 0; r < 5; r++) {
      var ok = true;
      for (var c = 0; c < 5; c++) { if (!card[COLS[c]][r].called) { ok = false; break; } }
      if (ok) { announceBingo('row ' + r); return; }
    }
    for (var c = 0; c < 5; c++) {
      var ok = true;
      for (var r = 0; r < 5; r++) { if (!card[COLS[c]][r].called) { ok = false; break; } }
      if (ok) { announceBingo('column ' + COLS[c]); return; }
    }
    var d1 = true, d2 = true;
    for (var i = 0; i < 5; i++) {
      if (!card[COLS[i]][i].called) d1 = false;
      if (!card[COLS[i]][4-i].called) d2 = false;
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
    log('BINGO: ' + type);
  }

  // ═══ SOUND ═══
  function playMatch(colIdx) {
    try {
      var ctx = window._bingoAudioCtx;
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); window._bingoAudioCtx = ctx; }
      var freq = COLUMNS[COLS[colIdx]].freq;
      while (freq > 2000) freq /= PI;
      while (freq < 80) freq *= PI;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.7);
    } catch(e) {}
  }

  // ═══ HYPER-LOCAL DIAGNOSTICS ═══
  // Click a cell to see its state
  function showCellDiag(flatIdx, card) {
    var c = flatIdx % 5, r = Math.floor(flatIdx / 5);
    var cell = card[COLS[c]][r];
    var state = cellStates[flatIdx] || {};
    var diag = document.getElementById('bingo-diag');
    if (!diag) {
      diag = document.createElement('div');
      diag.id = 'bingo-diag';
      diag.style.cssText = 'position:absolute;bottom:100%;left:0;right:0;background:rgba(1,4,9,0.95);' +
        'border:1px solid #30363d;border-radius:6px;padding:8px;font-size:9px;color:#8b949e;' +
        'margin-bottom:4px;pointer-events:auto;z-index:10;';
      var container = document.getElementById('bingo-card-container');
      if (container) { container.style.position = 'relative'; container.appendChild(diag); }
    }

    var revealDelay = state.revealedAt ? ((state.revealedAt - (cellStates[12] || {}).revealedAt) / 1000).toFixed(1) + 's' : '—';
    var matchDelay = state.matchedAt && state.revealedAt ? ((state.matchedAt - state.revealedAt) / 1000).toFixed(1) + 's' : '—';
    var locality = COLS[c] + r + ' (' + COLUMNS[COLS[c]].name + ', row ' + r + ')';
    var status = !state.revealed ? '⬛ NULL (curtained)' :
                 state.matched ? '🟢 MATCHED' :
                 cell.called ? '🟡 CALLED' :
                 '🔵 REVEALED (waiting)';

    diag.innerHTML = [
      '<div style="color:#e6edf3;font-size:11px;margin-bottom:4px">🔍 ' + cell.entity.replace(/_/g, ' ') + '</div>',
      '<div>📍 <span style="color:#58a6ff">local:</span> col ' + COLS[c] + ' · <span style="color:#d29922">hyper:</span> ' + locality + '</div>',
      '<div>👁 status: ' + status + '</div>',
      '<div>⏱ reveal: ' + revealDelay + ' · match: ' + matchDelay + '</div>',
      '<div>🔢 reveal order: #' + (revealOrder.indexOf(flatIdx) + 1) + '/25</div>',
      state.errors.length ? '<div style="color:#f85149">⚠ ' + state.errors.join(', ') + '</div>' : '',
      '<div style="margin-top:4px;color:#6e7681;cursor:pointer" onclick="this.parentNode.style.display=\'none\'">✕ close</div>',
    ].join('');
    diag.style.display = 'block';
  }

  // ═══ RENDER — opacity curtain display ═══
  function renderCard(card, seed) {
    var html = [];
    html.push('<div id="bingo-card-ui">');

    // Header
    html.push('<div class="bc-header">');
    html.push('<span class="bc-seed">seed: ' + seed + '</span>');
    html.push('<span class="bc-reveal-ct">' + revealIdx + '/25</span>');
    html.push('<span class="bc-share" onclick="window._bingoShare()" title="copy seed link">📋</span>');
    html.push('</div>');

    // Caller
    html.push('<div id="bingo-caller" style="text-align:center;color:#FFE135;font-size:11px;margin:4px 0;min-height:16px">digesting…</div>');
    html.push('<div id="bingo-banner" style="display:none;text-align:center;color:#3fb950;font-size:14px;font-weight:bold;margin:2px 0"></div>');

    // Progress bar — the digestion track
    var pct = Math.round((revealIdx / 25) * 100);
    html.push('<div class="bc-progress"><div class="bc-progress-fill" style="width:' + pct + '%"></div></div>');

    // Table
    html.push('<table class="bc-table">');
    html.push('<tr>');
    for (var c = 0; c < 5; c++) {
      var col = COLUMNS[COLS[c]];
      html.push('<th style="color:' + col.color + '" title="' + col.name + ' — ' + col.note + '">' + COLS[c] + '</th>');
    }
    html.push('</tr>');

    for (var r = 0; r < 5; r++) {
      html.push('<tr>');
      for (var c = 0; c < 5; c++) {
        var cell = card[COLS[c]][r];
        var flatIdx = r * 5 + c;
        var state = cellStates[flatIdx] || {};
        var isRevealed = state.revealed;
        var isCalled = cell.called;
        var colInfo = COLUMNS[COLS[c]];

        // Opacity curtain: unrevealed cells are invisible
        var opacity = isRevealed ? 1 : 0;
        var transform = isRevealed ? 'scale(1)' : 'scale(0.85)';
        var bg = isCalled ? colInfo.color + '22' : 'transparent';
        var border = isCalled ? colInfo.color : (isRevealed ? '#30363d' : 'transparent');
        var textColor = isCalled ? '#e6edf3' : (isRevealed ? '#8b949e' : 'transparent');
        var cursor = isRevealed ? 'pointer' : 'default';

        var name = cell.entity.replace(/_/g, ' ');
        if (name.length > 11) name = name.slice(0, 10) + '…';

        // Status dot (hyper-local indicator)
        var dot = '';
        if (!isRevealed) dot = '<span class="bc-dot" style="background:#21262d" title="curtained"></span>';
        else if (state.matched) dot = '<span class="bc-dot" style="background:#3fb950" title="matched"></span>';
        else if (isCalled) dot = '<span class="bc-dot" style="background:#d29922" title="called"></span>';
        else dot = '<span class="bc-dot" style="background:#30363d" title="waiting"></span>';

        html.push('<td class="bc-cell' + (isCalled ? ' bc-called' : '') + '" ' +
          'data-idx="' + flatIdx + '" ' +
          'style="opacity:' + opacity + ';transform:' + transform + ';' +
          'background:' + bg + ';border-color:' + border + ';' +
          'color:' + textColor + ';cursor:' + cursor + '" ' +
          'title="' + (isRevealed ? cell.entity : '???') + '">' +
          dot + (isRevealed ? name : '·') + '</td>');
      }
      html.push('</tr>');
    }
    html.push('</table>');

    // Footer — metaVerse provenance
    html.push('<div class="bc-footer">');
    html.push('<span style="color:#6e7681;font-size:7px">B=body I=immune N=network G=ghost O=observer</span>');
    html.push('<span style="color:#6e7681;font-size:7px;display:block;margin-top:2px">');
    html.push('metaVerse · stomach with no eyes · scyBorg NFT');
    html.push('</span>');
    html.push('</div>');

    html.push('</div>');
    return html.join('\n');
  }

  function updateCardDisplay(card) {
    var container = document.getElementById('bingo-card-container');
    if (!container) return;
    var seed = localStorage.getItem(SEED_KEY) || '?';
    container.innerHTML = renderCard(card, seed);

    // Re-attach click handlers for hyper-local diagnostics
    var cells = container.querySelectorAll('.bc-cell');
    cells.forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = parseInt(el.getAttribute('data-idx'));
        if (cellStates[idx] && cellStates[idx].revealed) {
          showCellDiag(idx, card);
        }
      });
    });
  }

  // ═══ SHARE ═══
  window._bingoShare = function() {
    var seed = localStorage.getItem(SEED_KEY);
    if (!seed) return;
    var url = location.origin + '/banana.html?seed=' + seed;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        var share = document.querySelector('.bc-share');
        if (share) { share.textContent = '✓'; setTimeout(function() { share.textContent = '📋'; }, 2000); }
      });
    }
  };

  // ═══ STYLE ═══
  function injectStyle() {
    var s = document.createElement('style');
    s.textContent = [
      '#bingo-card-ui{font-family:"SF Mono","Fira Code",monospace;font-size:10px}',
      '.bc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}',
      '.bc-seed{color:#FFE135;font-size:10px;font-weight:bold}',
      '.bc-reveal-ct{color:#8b949e;font-size:9px}',
      '.bc-share{color:#58a6ff;font-size:11px;cursor:pointer}',
      '.bc-share:hover{text-decoration:underline}',

      '.bc-progress{height:2px;background:#21262d;border-radius:1px;margin:3px 0;overflow:hidden}',
      '.bc-progress-fill{height:100%;background:linear-gradient(90deg,#e85d3a,#58a6ff,#5ab87a,#a371f7,#f0e68c);' +
        'transition:width 1.2s ease;border-radius:1px}',

      '.bc-table{border-collapse:collapse;width:100%}',
      '.bc-table th{font-size:12px;padding:3px 2px;text-align:center;font-weight:bold}',
      '.bc-table td.bc-cell{border:1px solid #30363d;padding:3px 2px;text-align:center;' +
        'font-size:8px;height:26px;transition:opacity 1.2s ease,transform 0.8s ease,' +
        'background 0.4s ease,box-shadow 0.6s ease;' +
        'max-width:54px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;position:relative}',
      '.bc-cell.bc-called{color:#e6edf3;font-weight:bold}',

      '.bc-dot{display:inline-block;width:4px;height:4px;border-radius:50%;margin-right:2px;vertical-align:middle}',

      '.bc-footer{margin-top:3px;text-align:center}',
      '@keyframes bingo-flash{0%{background:rgba(255,225,53,0.3)}100%{background:none}}',

      '#bingo-diag{line-height:1.5}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ═══ INIT ═══
  function init() {
    var seed = localStorage.getItem(SEED_KEY);

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

    log('bingo init — seed: ' + seed);

    Promise.all([
      fetch('/topology.json').then(function(r) { return r.json(); }),
      fetch('/detroit-data/scan_sweep_sort.json').then(function(r) { return r.json(); }).catch(function() { return {}; }),
    ]).then(function(results) {
      var topo = results[0];
      var sss = results[1];
      var pool = [];

      (topo.entities || []).forEach(function(e) {
        if (typeof e === 'object' && e.entity) pool.push(e.entity);
      });
      var scan = sss.scan || sss;
      var entities = scan.entities || sss.entities || {};
      if (typeof entities === 'object') {
        Object.keys(entities).forEach(function(k) { pool.push(k); });
      }
      pool = pool.filter(function(v, i, a) { return a.indexOf(v) === i; });

      if (pool.length < 25) {
        var pad = ['membrane','chipmunk','squirrel','pulse','entropy',
          'sigmoid','fossil','compost','wake','sleep','braid','scatter',
          'poison','antidote','seed','banana','doorbell','mutualist',
          'commensal','parasite','pathogen','ghost','null','self','non_self',
          'gold','silver','bronze','iron','carbon','lead','arsenic'];
        pool = pool.concat(pad);
      }

      var card = generateCard(seed, pool);
      if (!card) { log('card generation failed — not enough entities'); return; }
      localStorage.setItem(CARD_KEY, JSON.stringify(card));

      // Container
      var container = document.getElementById('bingo-card-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'bingo-card-container';
        container.style.cssText = 'position:fixed;bottom:70px;right:var(--rail-r,20px);z-index:4;' +
          'background:rgba(13,17,23,0.94);backdrop-filter:blur(10px);' +
          'border:1px solid rgba(255,225,53,0.15);border-radius:10px;' +
          'padding:8px;max-width:280px;display:none;';
        document.body.appendChild(container);
      }

      // Toggle button
      if (!document.getElementById('bingo-toggle')) {
        var toggle = document.createElement('button');
        toggle.id = 'bingo-toggle';
        toggle.innerHTML = '🎲';
        toggle.title = 'bingo card (seed: ' + seed + ')';
        toggle.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:5;' +
          'background:rgba(22,27,34,.9);border:1px solid rgba(255,225,53,.35);' +
          'color:#FFE135;padding:6px 10px;border-radius:20px;cursor:pointer;' +
          'font-size:14px;font-family:monospace;';
        toggle.onclick = function() {
          var c = document.getElementById('bingo-card-container');
          if (!c) return;
          if (c.style.display === 'none') {
            c.style.display = 'block';
            // Start curtain if not started
            if (!revealTimer && revealIdx === 0) {
              startCurtain(card, 2500);
              startCaller(card);
            }
          } else {
            c.style.display = 'none';
          }
        };
        document.body.appendChild(toggle);
      }

      log('bingo ready — ' + pool.length + ' entities in pool');
    }).catch(function(e) {
      log('bingo init failed: ' + (e.message || e));
    });
  }

  injectStyle();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 2200);
  }
})();
