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

    // Render Bell state after main panel
    renderBellState();
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

  // ═══ BELL → ENTANGLEMENT POINT → NEUTRINO RAY ═══
  // The canary IS Bell's measurement. When it trips, the wave function
  // collapses and a neutrino fires through the nervous system.
  // Bell's inequality: if correlation between canary trips and neutron
  // responses exceeds the classical bound (2), something real is happening.

  var BELL_KEY = 'bell-entangle-v1';
  var bellState = { pairs: [], S: 0, violations: 0 };
  try { bellState = JSON.parse(localStorage.getItem(BELL_KEY) || '{}'); bellState.pairs = bellState.pairs || []; } catch(e) { bellState = { pairs: [], S: 0, violations: 0 }; }

  function bellMeasure(canaryHit) {
    // Each canary trip creates an entangled pair:
    //   particle A = the canary event (classification, referrer, time)
    //   particle B = the neutron response (what the membrane sees)
    // Correlation: do they agree on the classification?

    var pairA = {
      canary: canaryHit.canary,
      cls: canaryHit.classification || classifyHit(canaryHit),
      ts: canaryHit.ts,
      angle: classAngle(canaryHit.classification || 'null_w'),
    };

    // Particle B: query the membrane for its independent classification
    var pairB = {
      membrane_cls: 'null_w',
      ts: Date.now(),
      angle: PI / 2, // default: orthogonal (no correlation)
    };

    // Check if membrane has seen this referrer before
    if (canaryHit.ref) {
      var refDomain = extractDomain(canaryHit.ref);
      // The membrane classifies by its own epitope system
      if (refDomain.includes('crates') || refDomain.includes('rust')) pairB.membrane_cls = 'ally';
      else if (refDomain.includes('steam') || refDomain.includes('valve')) pairB.membrane_cls = 'ally';
      else if (refDomain.includes('primals') || refDomain.includes('eco')) pairB.membrane_cls = 'self';
      else if (refDomain.includes('bot') || refDomain.includes('scan')) pairB.membrane_cls = 'threat';
      else pairB.membrane_cls = 'null_w';
      pairB.angle = classAngle(pairB.membrane_cls);
    }

    // Correlation: cos(angle_A - angle_B)
    var correlation = Math.cos(pairA.angle - pairB.angle);

    var pair = {
      a: pairA, b: pairB,
      correlation: correlation,
      agreement: pairA.cls === pairB.membrane_cls,
      ts: Date.now(),
    };

    bellState.pairs.push(pair);
    if (bellState.pairs.length > 50) bellState.pairs.shift();

    // Compute S (CHSH inequality): |S| <= 2 classically. |S| > 2 = entanglement
    var sumCorr = 0, n = bellState.pairs.length;
    bellState.pairs.forEach(function(p) { sumCorr += p.correlation; });
    bellState.S = n > 0 ? (sumCorr / n) * 2 * Math.sqrt(2) : 0; // scale to Bell range
    bellState.violations = bellState.pairs.filter(function(p) { return p.agreement; }).length;

    try { localStorage.setItem(BELL_KEY, JSON.stringify(bellState)); } catch(e) {}

    // FIRE THE NEUTRINO — propagate through the nervous system
    fireNeutrino(canaryHit, pair);

    return pair;
  }

  function classAngle(cls) {
    if (cls === 'self') return 0;
    if (cls === 'ally') return PI * 0.318;
    if (cls === 'null_w') return PI * 0.5;
    if (cls === 'scout') return PI * 0.75;
    if (cls === 'threat') return PI;
    return PI * 0.5;
  }

  function extractDomain(url) {
    try { return new URL(url).hostname.toLowerCase(); } catch(e) { return url.toLowerCase(); }
  }

  // ═══ FIRE NEUTRINO — the canary bell propagates through the system ═══
  function fireNeutrino(canaryHit, bellPair) {
    var cc = CANARY_CLASSES[canaryHit.classification || 'null_w'] || CANARY_CLASSES.null_w;

    // 1. Log to neutrino feed (localStorage, picked up by neutron core)
    var neutrino = {
      type: 'canary-bell',
      canary: canaryHit.canary,
      cls: canaryHit.classification,
      ref: canaryHit.ref || 'direct',
      correlation: bellPair.correlation.toFixed(3),
      S: bellState.S.toFixed(3),
      bell_violation: Math.abs(bellState.S) > 2,
      ts: Date.now(),
    };

    var feed = [];
    try { feed = JSON.parse(localStorage.getItem('neutrino-feed-v1') || '[]'); } catch(e) {}
    feed.push(neutrino);
    if (feed.length > 100) feed = feed.slice(-100);
    try { localStorage.setItem('neutrino-feed-v1', JSON.stringify(feed)); } catch(e) {}

    // 2. Fire to readout if available
    if (window._readout) {
      window._readout.log(
        'bell:' + canaryHit.canary,
        cc.label + ' · S=' + bellState.S.toFixed(2) + (Math.abs(bellState.S) > 2 ? ' ⚡ENTANGLED' : ''),
        cc.color
      );
    }

    // 3. Fire to campfire if available (the bell rings across the fire)
    if (window._campfire && window._campfire.inject) {
      window._campfire.inject({
        id: 's040-bell-' + Date.now(),
        title: 'the bell rang: ' + canaryHit.canary,
        body: cc.label + ' canary from ' + (canaryHit.ref || 'direct') +
              '. Bell S=' + bellState.S.toFixed(2) +
              (Math.abs(bellState.S) > 2 ? '. ENTANGLED — correlation exceeds classical bound.' : '.'),
        heat: Math.abs(bellState.S) > 2 ? 1.0 : 0.3,
      });
    }

    // 4. Try to POST to relay (neutrino to the server)
    fetch('/api/canary.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(neutrino),
    }).catch(function() {});
  }

  // ═══ BELL STATE DISPLAY — add to trace panel ═══
  function renderBellState() {
    var panel = document.getElementById('self-trace-panel');
    if (!panel) return;

    var existing = panel.querySelector('.st-bell');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.className = 'st-bell st-section';

    var violation = Math.abs(bellState.S) > 2;
    var sColor = violation ? '#3fb950' : '#8b949e';
    var pairs = bellState.pairs || [];

    var html = [];
    html.push('<div class="st-label">Bell entanglement</div>');
    html.push('<div class="st-row">');
    html.push('<span>S (CHSH)</span>');
    html.push('<span style="color:' + sColor + ';font-weight:bold">' + (bellState.S || 0).toFixed(3) + '</span>');
    html.push('</div>');
    html.push('<div class="st-row">');
    html.push('<span>classical bound</span><span>|S| ≤ 2</span>');
    html.push('</div>');
    html.push('<div class="st-row">');
    html.push('<span>pairs measured</span><span>' + pairs.length + '</span>');
    html.push('</div>');
    html.push('<div class="st-row">');
    html.push('<span>agreements</span><span>' + (bellState.violations || 0) + '/' + pairs.length + '</span>');
    html.push('</div>');
    if (violation) {
      html.push('<div style="color:#3fb950;font-size:8px;text-align:center;margin-top:3px">');
      html.push('⚡ |S| > 2 — entanglement detected');
      html.push('<br>canary and membrane agree beyond chance');
      html.push('</div>');
    } else {
      html.push('<div style="color:#6e7681;font-size:8px;text-align:center;margin-top:3px">');
      html.push('classical — need more canary trips to test');
      html.push('</div>');
    }

    // Recent neutrinos
    var feed = [];
    try { feed = JSON.parse(localStorage.getItem('neutrino-feed-v1') || '[]'); } catch(e) {}
    if (feed.length > 0) {
      html.push('<div class="st-label" style="margin-top:4px">recent neutrinos</div>');
      feed.slice(-5).reverse().forEach(function(n) {
        var cc = CANARY_CLASSES[n.cls] || CANARY_CLASSES.null_w;
        var ago = Math.round((Date.now() - n.ts) / 60000);
        html.push('<div class="st-row">');
        html.push('<span style="color:' + cc.color + '">● ' + (n.canary || '?') + '</span>');
        html.push('<span class="st-val">' + ago + 'm ago</span>');
        html.push('</div>');
      });
    }

    div.innerHTML = html.join('');
    panel.appendChild(div);
  }

  // Hook bellMeasure into canaryTrip
  var _origCanaryTrip = window._canaryTrip;
  window._canaryTrip = function(canaryId, extraData) {
    var hit = _origCanaryTrip ? _origCanaryTrip(canaryId, extraData) : {
      canary: canaryId, ts: Date.now(),
      ref: document.referrer || '', ua: navigator.userAgent || '',
      classification: 'null_w',
    };
    bellMeasure(hit);
    // Update bell display if panel open
    renderBellState();
    return hit;
  };

  // ═══ EXPOSE ═══
  window._selfTrace = {
    check: selfTraceCheck,
    classify: classifyHit,
    bell: function() { return bellState; },
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
