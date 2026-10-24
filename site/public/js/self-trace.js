// self-trace.js — trace our own lists, edges, and properties
// canaries graduate from 0/1 to 000 → pi-sort
// classify: self (green) / ally (blue) / null (gray) / threat (orange)
// NO BOOBYTRAPS IN NULL — null gets a welcome. always.
(function() {
  'use strict';

  var PI = Math.PI;
  var TRACE_KEY = 'self-trace-v1';

  // ═══ OUR PROPERTIES — the edges we self-point at ═══
  var PROPERTIES = {
    crates: [
      { id: 'squirrel-rng', url: 'https://crates.io/crates/squirrel-rng', type: 'crate' },
      { id: 'barraCuda',    url: 'https://crates.io/crates/barraCuda',    type: 'crate' },
    ],
    github: [
      { id: 'ecoPrimal/hud',       url: 'https://github.com/ecoPrimal/hud',       type: 'repo' },
      { id: 'ecoPrimal/squirrel',   url: 'https://github.com/ecoPrimal/squirrel',   type: 'repo' },
      { id: 'ecoPrimals/sporePrint', url: 'https://github.com/ecoPrimals/sporePrint', type: 'repo' },
      { id: 'ecoPrimals/barraCuda', url: 'https://github.com/ecoPrimals/barraCuda', type: 'repo' },
    ],
    zenodo: [
      { id: 'sporePrint-doi', url: 'https://zenodo.org/records/23600707', doi: '10.5281/zenodo.23600707', type: 'doi' },
      { id: 'barraCuda-doi',  url: 'https://zenodo.org/records/23600720', doi: '10.5281/zenodo.23600720', type: 'doi' },
    ],
    sites: [
      { id: 'hud',       url: 'https://hud.primals.eco',       type: 'site' },
      { id: 'primals',   url: 'https://primals.eco',           type: 'site' },
      { id: 'sporeprint', url: 'https://sporeprint.primals.eco', type: 'site' },
      { id: 'detroit',   url: 'https://detroit.primals.eco',   type: 'site' },
      { id: 'clutch',    url: 'https://clutch.primals.eco',    type: 'site' },
      { id: 'live',      url: 'https://live.primals.eco',      type: 'site' },
    ],
    canaries: [
      { id: 'valve',  url: '/valve.html',  target: 'Valve/Steam',      ring: 2 },
      { id: 'steam',  url: '/steam.html',  target: 'Steam community',  ring: 2 },
      { id: 'gaben',  url: '/gaben.html',  target: 'GabeN personally', ring: 2 },
    ],
  };

  // ═══ CANARY CLASSIFICATION — 000 → pi-sort ═══
  // Not 0/1 binary. Graduated. Each visit gets a pi-budget position.
  var CANARY_CLASSES = {
    self:   { color: '#3fb950', label: 'self',   pi: 0,           note: 'our own traffic (Kevin, agents, CI)' },
    ally:   { color: '#58a6ff', label: 'ally',   pi: PI * 0.318,  note: 'friendly visitor — engagement patterns' },
    null_w: { color: '#8b949e', label: 'null',   pi: PI * 0.5,    note: 'unclassified — WELCOME. not a trap.' },
    scout:  { color: '#d29922', label: 'scout',  pi: PI * 0.75,   note: 'investigative — looking, not touching' },
    threat: { color: '#f0883e', label: 'threat', pi: PI,          note: 'hostile scanning — noted, not blocked' },
  };

  // ═══ CLASSIFY A CANARY HIT ═══
  function classifyHit(data) {
    if (!data) return 'null_w';
    var ref = (data.ref || data.referrer || '').toLowerCase();
    var ua = (data.ua || '').toLowerCase();

    // Self detection
    if (ref.includes('primals.eco') || ref.includes('localhost')) return 'self';
    if (ua.includes('cursor') || ua.includes('ecoPrimal')) return 'self';

    // Ally patterns — came from a relevant source with engagement
    if (ref.includes('crates.io')) return 'ally';
    if (ref.includes('github.com')) return 'ally';
    if (ref.includes('zenodo.org')) return 'ally';
    if (ref.includes('rust-lang.org')) return 'ally';
    if (ref.includes('discord.com') || ref.includes('discord.gg')) return 'ally';
    if (ref.includes('reddit.com')) return 'ally';
    if (ref.includes('news.ycombinator.com')) return 'ally';
    if (ref.includes('steampowered.com') || ref.includes('store.steampowered.com')) return 'ally';

    // Scout — direct URL access (typed or bookmarked), no referrer
    if (!ref || ref === '') return 'scout';

    // Threat patterns — but NEVER trap, just note
    if (ua.includes('bot') || ua.includes('spider') || ua.includes('crawl')) return 'threat';
    if (ua.includes('scanner') || ua.includes('exploit')) return 'threat';

    return 'null_w';
  }

  // ═══ SELF-TRACE DASHBOARD ═══
  var traceData = {
    lastCheck: 0,
    crates: {},
    github: {},
    zenodo: {},
    canaryHits: [],
    edges: [],
  };

  // Load saved trace
  try {
    var saved = JSON.parse(localStorage.getItem(TRACE_KEY) || '{}');
    if (saved.lastCheck) traceData = saved;
  } catch(e) {}

  function saveTrace() {
    try { localStorage.setItem(TRACE_KEY, JSON.stringify(traceData)); } catch(e) {}
  }

  // ═══ SELF-TRACE CHECK — poll our own edges ═══
  function selfTraceCheck() {
    traceData.lastCheck = Date.now();
    traceData.edges = [];

    // Check crates.io (CORS-safe via API)
    PROPERTIES.crates.forEach(function(crate) {
      fetch('https://crates.io/api/v1/crates/' + crate.id, {
        headers: { 'User-Agent': 'ecoPrimal-self-trace/1.0' }
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.crate) {
          var prev = traceData.crates[crate.id] || {};
          var delta = prev.downloads ? data.crate.downloads - prev.downloads : 0;
          traceData.crates[crate.id] = {
            downloads: data.crate.downloads,
            recent: data.crate.recent_downloads,
            delta: delta,
            ts: Date.now(),
            pumping: data.crate.recent_downloads > 100,
          };
          if (delta > 0) {
            traceData.edges.push({
              type: 'crate-download',
              id: crate.id,
              delta: delta,
              total: data.crate.downloads,
              ts: Date.now(),
            });
          }
          saveTrace();
          renderTrace();
        }
      }).catch(function() {});
    });

    // Check canary page hits from localStorage log
    try {
      var canaryLog = JSON.parse(localStorage.getItem('canary-log-v1') || '[]');
      traceData.canaryHits = canaryLog.map(function(h) {
        h.classification = classifyHit(h);
        return h;
      });
    } catch(e) {}

    saveTrace();
    renderTrace();
  }

  // ═══ RENDER TRACE PANEL ═══
  function renderTrace() {
    var panel = document.getElementById('self-trace-panel');
    if (!panel) return;

    var html = [];
    html.push('<div class="st-head">self-trace · edges & canaries</div>');

    // Crate stats
    html.push('<div class="st-section">');
    html.push('<div class="st-label">crates.io</div>');
    PROPERTIES.crates.forEach(function(c) {
      var data = traceData.crates[c.id] || {};
      var pump = data.pumping ? ' 🔥' : '';
      var deltaStr = data.delta > 0 ? ' <span style="color:#3fb950">+' + data.delta + '</span>' : '';
      html.push('<div class="st-row">');
      html.push('<a href="' + c.url + '" target="_blank" class="st-link">' + c.id + '</a>');
      html.push('<span class="st-val">' + (data.downloads || '?') + ' dl' + deltaStr + pump + '</span>');
      html.push('</div>');
    });
    html.push('</div>');

    // Canary hits — graduated (not binary)
    html.push('<div class="st-section">');
    html.push('<div class="st-label">canaries · 000 → π sort</div>');
    if (traceData.canaryHits.length === 0) {
      html.push('<div class="st-dim">no trips yet — that IS data</div>');
    } else {
      // Group by classification
      var groups = {};
      traceData.canaryHits.forEach(function(h) {
        var cls = h.classification || 'null_w';
        if (!groups[cls]) groups[cls] = [];
        groups[cls].push(h);
      });
      Object.keys(CANARY_CLASSES).forEach(function(cls) {
        var cc = CANARY_CLASSES[cls];
        var hits = groups[cls] || [];
        if (hits.length === 0) return;
        html.push('<div class="st-row">');
        html.push('<span style="color:' + cc.color + '">● ' + cc.label + '</span>');
        html.push('<span class="st-val">' + hits.length + ' hit' + (hits.length > 1 ? 's' : '') + '</span>');
        html.push('</div>');
      });
    }
    html.push('</div>');

    // Self edges — what's pointing at us
    html.push('<div class="st-section">');
    html.push('<div class="st-label">self edges</div>');
    var allyEdges = [
      { name: 'crates.io → squirrel', status: '14,207 dl', color: '#3fb950', live: true },
      { name: 'crates.io → barraCuda', status: '1,540 dl', color: '#58a6ff', live: true },
      { name: 'zenodo → barraCuda', status: '10 unique views', color: '#58a6ff', live: true },
      { name: 'zenodo → sporePrint', status: '0 views', color: '#6e7681', live: false },
      { name: 'github → stars', status: '0 (ring 3 dead)', color: '#f85149', live: false },
      { name: 'reddit → posts', status: 'NOT POSTED', color: '#f85149', live: false },
      { name: 'HN → posts', status: 'NOT POSTED', color: '#f85149', live: false },
    ];
    allyEdges.forEach(function(e) {
      html.push('<div class="st-row">');
      html.push('<span style="color:' + e.color + '">' + (e.live ? '●' : '○') + ' ' + e.name + '</span>');
      html.push('<span class="st-val">' + e.status + '</span>');
      html.push('</div>');
    });
    html.push('</div>');

    // Pi budget position of the trace
    var totalEdges = Object.keys(traceData.crates).length + traceData.canaryHits.length + allyEdges.filter(function(e){return e.live}).length;
    var piBudget = Math.pow(PI, 2); // π² ≈ 9.87
    var fill = totalEdges / piBudget;
    html.push('<div class="st-foot">');
    html.push('<div class="st-progress"><div class="st-fill" style="width:' + Math.min(fill * 100, 99).toFixed(1) + '%"></div></div>');
    html.push('<span style="color:#6e7681;font-size:7px">π² budget: ' + totalEdges + '/' + Math.floor(piBudget) + ' edges · rem ' + (piBudget - Math.floor(piBudget)).toFixed(3) + '</span>');
    html.push('</div>');

    // Null welcome — NO BOOBYTRAPS
    html.push('<div style="text-align:center;margin-top:4px;font-size:7px;color:#6e7681">');
    html.push('null = welcome · no traps in null · ever');
    html.push('</div>');

    panel.innerHTML = html.join('');
  }

  // ═══ UPGRADED CANARY PAGES — graduate from binary to pi-sort ═══
  // When a canary page loads, it logs the hit WITH classification
  window._canaryTrip = function(canaryId, extraData) {
    var hit = {
      canary: canaryId,
      ts: Date.now(),
      ref: document.referrer || '',
      ua: navigator.userAgent || '',
      extra: extraData || {},
    };
    hit.classification = classifyHit(hit);

    // Log to localStorage
    var log = [];
    try { log = JSON.parse(localStorage.getItem('canary-log-v1') || '[]'); } catch(e) {}
    log.push(hit);
    if (log.length > 100) log = log.slice(-100);
    try { localStorage.setItem('canary-log-v1', JSON.stringify(log)); } catch(e) {}

    // Also fire to the HUD readout if available
    if (window._readout) {
      var cc = CANARY_CLASSES[hit.classification] || CANARY_CLASSES.null_w;
      window._readout.log('canary:' + canaryId, cc.label + ' · ' + (hit.ref || 'direct'), cc.color);
    }

    return hit;
  };

  // ═══ STYLE ═══
  function injectStyle() {
    var s = document.createElement('style');
    s.textContent = [
      '#self-trace-panel{font-family:"SF Mono","Fira Code",monospace;font-size:9px;color:#8b949e;line-height:1.5}',
      '.st-head{color:#e6edf3;font-size:11px;margin-bottom:6px;font-weight:bold}',
      '.st-section{margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #161b22}',
      '.st-label{color:#58a6ff;font-size:8px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px}',
      '.st-row{display:flex;justify-content:space-between;align-items:center;padding:1px 0}',
      '.st-link{color:#58a6ff;text-decoration:none;font-size:9px}',
      '.st-link:hover{text-decoration:underline}',
      '.st-val{color:#8b949e;font-size:8px;text-align:right}',
      '.st-dim{color:#6e7681;font-size:8px;font-style:italic}',
      '.st-foot{margin-top:4px}',
      '.st-progress{height:2px;background:#161b22;border-radius:1px;overflow:hidden;margin-bottom:2px}',
      '.st-fill{height:100%;background:linear-gradient(90deg,#3fb950,#58a6ff,#d2a8ff);transition:width 0.6s}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ═══ TOGGLE BUTTON + PANEL ═══
  function createUI() {
    // Panel
    var panel = document.createElement('div');
    panel.id = 'self-trace-panel';
    panel.style.cssText = 'position:fixed;top:60px;left:var(--rail-l,4px);z-index:6;' +
      'background:rgba(13,17,23,0.94);backdrop-filter:blur(10px);' +
      'border:1px solid rgba(63,185,80,0.15);border-radius:10px;' +
      'padding:10px;width:220px;display:none;pointer-events:auto;max-height:80vh;overflow-y:auto';
    document.body.appendChild(panel);

    // Toggle
    var btn = document.createElement('button');
    btn.id = 'self-trace-toggle';
    btn.innerHTML = '📡';
    btn.title = 'self-trace: edges, canaries, properties';
    btn.style.cssText = 'position:fixed;bottom:12px;left:92px;z-index:5;' +
      'background:rgba(22,27,34,.9);border:1px solid rgba(63,185,80,.35);' +
      'color:#3fb950;padding:6px 10px;border-radius:20px;cursor:pointer;' +
      'font-size:14px;font-family:monospace;';
    btn.onclick = function() {
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        selfTraceCheck();
      } else {
        panel.style.display = 'none';
      }
    };
    if (!document.getElementById('self-trace-toggle')) {
      document.body.appendChild(btn);
    }
  }

  // ═══ EXPOSE ═══
  window._selfTrace = {
    check: selfTraceCheck,
    classify: classifyHit,
    CLASSES: CANARY_CLASSES,
    PROPERTIES: PROPERTIES,
    data: function() { return traceData; },
  };

  // ═══ INIT ═══
  injectStyle();

  function boot() {
    createUI();
    // Auto-check every 5 minutes
    setInterval(function() {
      var panel = document.getElementById('self-trace-panel');
      if (panel && panel.style.display === 'block') selfTraceCheck();
    }, 5 * 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 2500);
  }
})();
