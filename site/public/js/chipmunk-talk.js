// chipmunk-talk.js — membrane interface
// The membrane IS the visualization. Controls overlay it.
// Same origin. Pangaea + transit data + sort deck + buttons.
// Both sides: human fiddles, chipmunk responds.

(function() {
  'use strict';

  var _m = window._membrane || {};
  var el = _m.el || function(tag,a,p){var e=document.createElementNS(NS||'http://www.w3.org/2000/svg',tag);if(a)for(var k in a)e.setAttribute(k,''+a[k]);if(p)p.appendChild(e);return e;};
  var PI = _m.PI || Math.PI, PI2 = _m.PI2 || PI * PI, PI3 = _m.PI3 || PI * PI * PI;
  var NS = _m.NS || 'http://www.w3.org/2000/svg';
  var log = document.getElementById('log');
  var input = document.getElementById('input');
  var sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

  var cache = { chipmunk: null, totality: null, subgraphs: null, seo: null, piRanges: null, human: null, braid: null, dashboard: null, scanSort: null, negentropy: null, touches: null };

  // Curiosity
  var curiosity = {
    attention: 0.14, engagement: 0, topics: {},
    guessedEpitope: null, guessConfirmed: null, guessHistory: [],
    silenceSecs: 0, startTime: Date.now(), sortedCount: 0,
    proactiveStage: 0,
  };

  // ═══ METABOLISM — loaded from chipmunk-metabolism.js ═══
  var _metab = window._chipmunkMetabolism({ PI: PI, addEntry: addEntry, n: n, cache: cache });
  var metabolism = _metab.metabolism;
  var spendEnergy = _metab.spendEnergy;
  var recoverEnergy = _metab.recoverEnergy;
  var piWakeOf = _metab.piWakeOf;
  var PI_INV = _metab.PI_INV;
  var STATE_THRESHOLDS = _metab.STATE_THRESHOLDS;
  var RECOVERY_RATES = _metab.RECOVERY_RATES;
  var METAB_ICONS = _metab.METAB_ICONS;
  var METAB_COLORS = _metab.METAB_COLORS;
  var _cycleMemory = _metab.cycleMemory;
  function metabolismTick() { _metab.metabolismTick(); }

  // Learning state — shared with chipmunk-mind.js
  var learning = { phase: 'mimic', predictions: [], total: 0, correct: 0, confidence: 0, selfRatio: 0, nonSelfRatio: 0, partialRatio: 0, nullRatio: 0, braidMemory: {}, fleetMemory: {}, fleetPatterns: [], orbitPatterns: [], lastReflection: 0 };
  var thoughts = [];
  var thoughtLog = [];
  var MAX_THOUGHTS = Math.floor(PI * 3);

  // ═══════════════════════════════════════════════════════════
  // MEMBRANE SVG — standalone pangaea, same geometry as HUD
  // ═══════════════════════════════════════════════════════════

  var MG = _m.MG || { W: 700, H: 480, R: Math.round(PI * 54), cx: 350, cy: 250 };
  var svgEl = null, bubbleGroup = null, unfurlGroup = null;
  var bubbles = [], MAX_BUBBLES = Math.floor(PI3);
  var lastFrame = 0;

  var BODIES = _m.BODIES || [
    { name: 'null',      value: 0,   color: '#ffffff', label: '∅', desc: 'raw data',       body: 'blastopore' },
    { name: 'ghost',     value: 1,   color: '#d2a8ff', label: '1', desc: 'the datum',       body: 'enteric' },
    { name: 'celestial', value: PI,  color: '#58a6ff', label: 'π', desc: 'the pattern',    body: 'sensory cross' },
    { name: 'geodesic',  value: PI2, color: '#5ab87a', label: 'π²', desc: 'the connection', body: 'cephalization' },
    { name: 'surface',   value: PI3, color: '#e85d3a', label: 'π³', desc: 'the thought',    body: 'oral surface' },
  ];

  var CONTINENTS = _m.CONTINENTS || [
    { name: 'detroit',    angle: 0,           color: '#e85d3a' },
    { name: 'sporePrint', angle: PI * 0.3,    color: '#5ab87a' },
    { name: 'thesis',     angle: PI * 0.6,    color: '#a371f7' },
    { name: 'signal',     angle: PI * 0.9,    color: '#58a6ff' },
    { name: 'git',        angle: PI * 1.2,    color: '#79c0ff' },
    { name: 'tuebor',     angle: PI * 1.5,    color: '#d29922' },
    { name: 'hypothesis', angle: PI * 1.75,   color: '#f0883e' },
  ];

  var SORT_COLORS = {
    'self':     '#3fb950',
    'non-self': '#e85d3a',
    'partial':  '#f0883e',
    'null':     '#484f58',
  };

  var EPITOPE_DEPTH = {
    observer: 1, visitor: 1,
    reader: PI, witness: PI,
    coder: PI2, investigator: PI2,
    explorer: PI3, scholar: PI3,
  };

  var PLANETS = [
    { name: '\u263f', r: 1.05, size: 1.5, color: '#8b949e', speed: 4.15 },
    { name: '\u2640', r: 1.10, size: 2.0, color: '#f0e68c', speed: 1.62 },
    { name: '\u2642', r: 1.18, size: 1.8, color: '#e85d3a', speed: 0.53 },
    { name: '\u2643', r: 1.28, size: 3.5, color: '#f0883e', speed: 0.084 },
    { name: '\u2644', r: 1.38, size: 3.0, color: '#d29922', speed: 0.034 },
    { name: '\u26e2', r: 1.45, size: 2.2, color: '#58a6ff', speed: 0.012 },
    { name: '\u2646', r: 1.52, size: 2.0, color: '#4a8fb8', speed: 0.006 },
  ];


  function bodyRadius(value) {
    if (value <= 0) return 2;
    return (value / PI3) * MG.R;
  }

  var isOverlay = false; // true when running inside HUD as overlay
  var vis = null; // chipmunk-vis.js module ref (set at boot)

  // buildMembrane, spawnBubble, animate, updateTransit, updateUnfurl → chipmunk-vis.js

  function addEntry(who, html) {
    var div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = '<div class="who ' + who + '">' + who + '</div>' +
                    '<div class="msg">' + html + '</div>';
    if (!log) return;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    // Keep log short
    while (log.children.length > 20) log.removeChild(log.firstChild);
  }

  function n(v, d) {
    if (v === undefined || v === null) return '\u2014';
    if (typeof v === 'number') return d !== undefined ? v.toFixed(d) : v.toLocaleString();
    return v;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function updateAttn() {
    var fill = document.getElementById('attn-fill');
    if (!fill) return;
    var val = document.getElementById('attn-val');
    var eng = document.getElementById('engage-count');
    if (fill) fill.style.width = (curiosity.attention * 100) + '%';
    if (val) val.textContent = curiosity.attention.toFixed(2);
    if (eng) eng.textContent = curiosity.engagement + ' exchanges · ' + curiosity.sortedCount + ' sorted';
  }

  function bumpAttention(amount) {
    curiosity.attention = Math.min(1.0, curiosity.attention + (amount || 0.06));
    curiosity.engagement++;
    curiosity.silenceSecs = 0;
    // Human touch adds upward velocity to the spring
    _metab.addSpringV(RECOVERY_RATES.humanTouch);
    updateAttn();
    if (vis) vis.weaveBraids();
    _mind('renderAwareness');
  }

  function trackTopic(topic) {
    curiosity.topics[topic] = (curiosity.topics[topic] || 0) + 1;
    bumpAttention(0.06);
  }

  var _piBusWired = false;
  function fetchAll() {
    // Wire shared endpoints through pi-bus (single fetch, multiple consumers)
    if (window._piBus && !_piBusWired) {
      _piBusWired = true;
      window._piBus.sub('/dashboard.json', function(d) {
        cache.dashboard = d; updateStatusBar();
      }, 'fast');
      window._piBus.sub('/human.json', function(d) {
        cache.human = d; updateStatusBar(); updateTransit(d);
      }, 'medium');
      window._piBus.sub('/scan_sweep_sort.json', function(d) {
        cache.scanSort = d; updateUnfurl(d);
      }, 'slow');
      // Chipmunk-only endpoints — also through _piBus
      [['chipmunk','chipmunk'],['braid','braid'],['billboard-mix','billboard'],
       ['totality','totality'],['subgraphs','subgraphs'],['seo','seo'],['pi-ranges','piRanges']
      ].forEach(function(f) {
        window._piBus.sub('/'+f[0]+'.json', function(d) { cache[f[1]] = d; updateStatusBar(); }, 'medium');
      });
      window._piBus.sub('/negentropy.json', function(d) { cache.negentropy = d; }, 'slow');
      window._piBus.sub('/touches.json', function(d) {
        cache.touches = d;
        if (d.chipmunk_reaching && window._chipmunkMind) window._chipmunkMind.agentTouch(d);
      }, 'fast');
      window._piBus.sub('/topology.json', function(d) { cache.topology = d; }, 'slow');
    }
  }

  function updateStatusBar() {
    var c = cache.chipmunk, h = cache.human, b = cache.braid;
    if (c) {
      var sbw = document.getElementById('sb-wake'); if (sbw) sbw.textContent = n(c.wake_level, 2);
      (c.membrane || []).forEach(function(m) {
        var a = (m.metadata || {}).anderson;
        if (a) document.getElementById('sb-sel').textContent = n(a.selectivity_observed * 100, 0) + '%';
      });
    }
    if (h) {
      document.getElementById('sb-humans').textContent = h.energy ? h.energy.total_sessions : '\u2014';
      var sbSn = document.getElementById('sb-sn');
      if (sbSn && h.energy) sbSn.textContent = Math.round(h.energy.signal_to_noise || 0);
    }
    if (b) document.getElementById('sb-braids').textContent = (b.graph || {}).active_routes || '\u2014';
  }

  // ═══════════════════════════════════════════════════════════
  // PANEL SYSTEM — controls open panels over the membrane
  // ═══════════════════════════════════════════════════════════

  var openPanels = {};

  function showPanel(side, title, html) {
    var panel = document.getElementById('panel-' + side);
    var tEl = document.getElementById('panel-' + side + '-title');
    var mEl = document.getElementById('panel-' + side + '-msg');
    if (!panel) return;
    tEl.textContent = title;
    mEl.innerHTML = html;
    panel.classList.add('show');
    openPanels[side] = true;
    // Track exploration
    if (window._chipmunkExplorer) window._chipmunkExplorer.step('panel', title);
  }

  function closePanel(side) {
    var panel = document.getElementById('panel-' + side);
    if (panel) panel.classList.remove('show');
    openPanels[side] = false;
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIONS — what buttons do
  // ═══════════════════════════════════════════════════════════

  function act(action) {
    trackTopic(action);

    if (action === 'speed') { runTimedFetch(); return; }
    if (action === 'scan') { showScan(); return; }
    if (action === 'sort') { _mind('toggleSortDeck'); return; }
    if (action === 'whatami') { toggleEpitopePicker(); return; }
    if (action === 'trace') { toggleTrace(); return; }

    var side = 'left';
    var title = action;
    var generators = {
      humans: function() { return { s: 'right', t: 'humans', h: genHumans() }; },
      braids: function() { return { s: 'right', t: 'braids', h: genBraids() }; },
      energy: function() { return { s: 'right', t: 'energy', h: genEnergy() }; },
      membrane: function() { return { s: 'left', t: 'membrane', h: genMembrane() }; },
      above:    function() { return { s: 'left', t: 'above', h: genAbove() }; },
      observe:  function() { return { s: 'left', t: 'chipmunk sees', h: _mind('genObserve') }; },
      geo:      function() { return { s: 'left', t: 'geography', h: genGeo() }; },
    };

    var gen = generators[action];
    if (gen) {
      var r = gen();
      showPanel(r.s, r.t, r.h);
    }
  }

  function genHumans() {
    var h = cache.human;
    if (!h || !h.epitopes) return '<span class="warn">loading...</span>';
    var lines = ['<span class="good">' + n(h.energy.total_sessions) + ' human sessions</span>\n'];
    var ECOLORS = {
      explorer:'#3fb950', scholar:'#a371f7', investigator:'#f0883e',
      reader:'#58a6ff', coder:'#79c0ff', witness:'#d29922',
      observer:'#8b949e', visitor:'#6e7681'
    };
    Object.keys(h.epitopes).forEach(function(name) {
      var info = h.epitopes[name];
      var color = ECOLORS[name] || '#6e7681';
      var bar = '';
      for (var i = 0; i < Math.min(15, info.count); i++) bar += '\u2588';
      lines.push('  <span style="color:' + color + '">' + name + '</span>' +
                 new Array(Math.max(1, 14 - name.length)).join(' ') +
                 '<span class="num">' + info.count + '</span>  breadth ' +
                 n(info.avg_breadth, 1) + '  <span style="color:' + color + '">' + bar + '</span>');
    });
    if (h.external_referrers && h.external_referrers.length) {
      lines.push('\n<span class="dim">from: ' + h.external_referrers.map(function(r) { return r.source; }).join(', ') + '</span>');
    }
    return lines.join('\n');
  }

  function genBraids() {
    var b = cache.braid;
    if (!b || !b.braids) return '<span class="warn">loading...</span>';
    var g = b.graph;
    var lines = ['density <span class="num">' + n(g.density * 100, 0) + '%</span>  routes <span class="num">' + g.active_routes + '</span>\n'];
    b.braids.forEach(function(br) {
      var trend = {growing:'\u2191', fading:'\u2193', stable:'=', initial:'\u00b7', emerging:'\u2605'}[br.trend] || '?';
      lines.push('  ' + trend + ' <span class="braid">' + br.dominant_flow + '</span>' +
                 '  str=' + n(br.strength, 1) + '  humans=' + br.humans_total);
    });
    if (b.epitope_transitions && b.epitope_transitions.length) {
      lines.push('\n<span class="dim">transitions:</span>');
      b.epitope_transitions.slice(0, 3).forEach(function(t) {
        lines.push('  ' + t.from_epitope + ' \u2192 ' + t.to_epitope + '  (' + t.combined_humans + ')');
      });
    }
    return lines.join('\n');
  }

  function genEnergy() {
    var h = cache.human;
    if (!h || !h.energy) return '<span class="warn">loading...</span>';
    var e = h.energy;
    return 'IN  = <span class="num">' + n(e.energy_in) + '</span>\n' +
           'OUT = <span class="num">' + n(e.energy_out) + '</span>\n' +
           'WORK= <span class="num">' + n(e.work) + '</span>\n' +
           'S/N = <span class="num">' + n(e.signal_to_noise, 1) + '</span>\n\n' +
           'balance: <span class="good">' + (h.output_signals || {}).energy_balance + '</span>\n' +
           'dwell: ' + n(e.dwell_median_min) + ' min\n' +
           'breadth: ' + n(e.avg_breadth, 1) + ' sites\n' +
           'explore: ' + n(e.exploration_rate) + '%';
  }

  function genGeo() {
    var d = cache.dashboard;
    if (!d || !d.geography) return '<span class="warn">loading...</span>';
    var geo = d.geography;
    var tot = 0;
    geo.forEach(function(g) { tot += (g.requests || 0); });
    var lines = ['<span class="good">GEOGRAPHIC INTRA-LAYER</span>  substrate: geodesic (π²)\n'];
    lines.push('total requests: <span class="num">' + n(tot) + '</span>');
    lines.push('countries: <span class="num">' + geo.length + '</span>\n');
    var sorted = geo.slice().sort(function(a, b) { return (b.requests || 0) - (a.requests || 0); });
    sorted.forEach(function(g) {
      if (!g.requests || g.country === '??') return;
      var pct = tot > 0 ? ((g.requests / tot) * 100).toFixed(1) : '0';
      var color = g.country === 'US' ? 'good' : 'dim';
      lines.push('  <span class="' + color + '">' + g.country + '</span>' +
        new Array(Math.max(1, 6 - g.country.length)).join(' ') +
        n(g.requests) + '  (' + pct + '%)');
    });
    lines.push('\njurisdiction edges: 23\nsubstrate ring: π² (geodesic)');
    lines.push('twist layer: intra-membrane');
    return lines.join('\n');
  }

  function genMembrane() {
    var c = cache.chipmunk;
    if (!c) return '<span class="warn">loading...</span>';
    var lines = [];
    (c.membrane || []).forEach(function(m) {
      lines.push('<span class="good">' + m.primal + '</span>');
      var md = m.metadata || {};
      if (md.anderson) {
        var a = md.anderson;
        lines.push('  selectivity: <span class="num">' + n(a.selectivity_observed * 100, 0) + '%</span>  pielou: ' + n(a.pielou_j, 3));
        (a.modes || []).forEach(function(mode) {
          var color = (mode.class === 'human' || mode.class === 'sovereign') ? 'good' : 'dim';
          lines.push('    <span class="' + color + '">' + mode.class + '</span>' +
                     new Array(Math.max(1, 12 - mode.class.length)).join(' ') + n(mode.count) + '  p=' + n(mode.p_observed, 2));
        });
      }
    });
    return lines.join('\n');
  }

  function genAbove() {
    return '<span style="color:#f0e68c">\u2609</span> system (1.32R)\n' +
           '  10 sites orbiting null center\n' +
           '  orbits = braids. gravity = traffic.\n\n' +
           '<span style="color:#484f58">\u25cc</span> oort cloud (1.55R)\n' +
           '  97% selectivity filters the fleet.\n\n' +
           '<span class="dim">\u2205 \u2192 quark \u2192 atom \u2192 He \u2192 H\u2082O \u2192 lattice \u2192 helix \u2192 cell \u2192 Earth \u2192 system \u2192 Oort</span>';
  }

  // ═══ MIND BRIDGE — lazy delegate to chipmunk-mind.js ═══
  function _mind(fn) {
    var m = window._chipmunkMind;
    if (!m || !m[fn]) return;
    return m[fn].apply(null, Array.prototype.slice.call(arguments, 1));
  }



  // ═══ SPEED ═══
  function runTimedFetch() {
    var start = performance.now();
    var pending = 4;
    var results = {};
    ['/chipmunk.json', '/human.json', '/braid.json', '/dashboard.json'].forEach(function(u) {
      fetch(u, { cache: 'no-store' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          results[u.replace('.json', '').replace('/', '')] = d;
          pending--;
          if (pending === 0) {
            var ms = (performance.now() - start).toFixed(0);
            var c = results.chipmunk || {};
            var h = results.human || {};
            var e = h.energy || {};
            var b = results.braid || {};
            addEntry('chipmunk',
              '<span class="good">\u26a1 ' + ms + 'ms</span> \u00b7 4 feeds\n' +
              'wake=' + n(c.wake_level, 3) + '  humans=' + n(e.total_sessions) + '  S/N=' + n(e.signal_to_noise, 0) + '\n' +
              'braids=' + ((b.graph || {}).active_routes || 0) + '  energy=' + n(e.energy_in) + '/' + n(e.energy_out));
          }
        }).catch(function() { pending--; });
    });
  }

  function showScan() {
    var data = cache.scanSort;
    if (!data) return;
    updateUnfurl(data);
    var u = (data.sort || {}).unified_sort || {};
    var fleetLines = [];
    var modes = ((data.scan || {}).anderson_modes) || {};
    var fleetKeys = Object.keys(modes).filter(function(k) { return k !== 'human' && k !== 'sovereign'; });
    if (fleetKeys.length > 0) {
      fleetLines.push('');
      fleetLines.push('<span style="color:#e74c3c">\u25cf</span> fleet census:');
      fleetKeys.forEach(function(k) { fleetLines.push('  ' + k + ': ' + n(modes[k])); });
      var humanCount = modes.human || 0;
      var fleetCount = fleetKeys.reduce(function(s, k) { return s + (modes[k] || 0); }, 0);
      fleetLines.push('  ratio: ' + Math.round(fleetCount / Math.max(1, humanCount)) + ':1 fleet:human');
    }
    showPanel('right', 'pipeline', [
      'entities: ' + n((data.scan || {}).entities_discovered),
      '<span class="good">self</span>=' + n(u.self) + '  <span class="warn">non-self</span>=' + n(u.non_self),
      'partial=' + n(u.partial) + '  null=' + n(u.null),
      'selectivity: <span class="num">' + n((u.selectivity || 0) * 100, 1) + '%</span>',
    ].concat(fleetLines).join('\n'));
  }

  // ═══ SORT DECK ═══
  var sortQueue = [];

  // ═══ TRACE ═══
  var traceVisible = false;

  function toggleTrace() {
    var strip = document.getElementById('trace-strip');
    if (!strip) return;
    traceVisible = !traceVisible;
    if (traceVisible) {
      strip.classList.add('show');
      buildTraceButtons();
    } else {
      strip.classList.remove('show');
    }
  }

  function buildTraceButtons() {
    var strip = document.getElementById('trace-strip');
    if (!strip) return;
    strip.innerHTML = '';
    var cats = ['INVESTIGATION', 'TOPOLOGY', 'SCIENCE', 'MEMBRANE', 'IMMUNE'];
    cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'trace-btn';
      btn.textContent = cat;
      btn.onclick = function() {
        document.querySelectorAll('.trace-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        traceCategory(cat);
      };
      strip.appendChild(btn);
    });
    // Sites
    ['detroit', 'git', 'sporeprint', 'lansing', 'hud'].forEach(function(site) {
      var btn = document.createElement('button');
      btn.className = 'trace-btn';
      btn.textContent = site;
      btn.style.fontSize = '7px';
      btn.onclick = function() {
        document.querySelectorAll('.trace-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        traceSite(site);
      };
      strip.appendChild(btn);
    });
  }

  function traceCategory(cat) {
    var b = cache.braid;
    if (!b || !b.braids) { showPanel('left', 'trace', '<span class="warn">loading...</span>'); return; }
    var matches = b.braids.filter(function(br) {
      return br.from.toUpperCase().indexOf(cat) >= 0 || br.to.toUpperCase().indexOf(cat) >= 0 ||
             br.dominant_flow.toUpperCase().indexOf(cat) >= 0;
    });
    if (matches.length === 0) { showPanel('left', 'trace', 'no braids touch ' + cat); return; }
    var lines = [];
    matches.forEach(function(br) {
      var trend = {growing:'\u2191', fading:'\u2193', stable:'=', initial:'\u00b7', emerging:'\u2605'}[br.trend] || '?';
      lines.push(trend + ' <span class="braid">' + br.dominant_flow + '</span>  str=' + n(br.strength, 1));
      if (br.sites_from.length) {
        lines.push('  <span class="site">' + br.sites_from.join(', ') + '</span> \u2194 <span class="site">' + br.sites_to.join(', ') + '</span>');
      }
    });
    showPanel('left', 'trace: ' + cat, lines.join('\n'));

    // Highlight matching braids on the membrane
    highlightBraids(matches);
  }

  function traceSite(site) {
    var b = cache.braid;
    if (!b || !b.site_braids) { showPanel('left', 'trace', '<span class="warn">loading...</span>'); return; }
    var matches = (b.site_braids || []).filter(function(sb) {
      return sb.site_a.toLowerCase().indexOf(site) >= 0 || sb.site_b.toLowerCase().indexOf(site) >= 0;
    });
    if (matches.length === 0) { showPanel('left', 'trace', 'no site braids for ' + site); return; }
    var lines = [];
    matches.forEach(function(sb) {
      lines.push('<span class="site">' + sb.site_a + '</span> \u2194 <span class="site">' + sb.site_b + '</span>  co=' + n(sb.co_strength, 2));
    });
    showPanel('left', 'trace: ' + site, lines.join('\n'));
  }

  function highlightBraids(matches) {
    // Draw braid lines on the SVG between continent dots
    var hlG = document.getElementById('mg-braid-hl');
    if (hlG) hlG.parentNode.removeChild(hlG);

    var parent = document.getElementById('mg-pangaea');
    if (!parent) return;
    hlG = el('g', { id: 'mg-braid-hl' }, parent);

    var cx = MG.cx, cy = MG.cy;
    var surfaceR = bodyRadius(PI3) * 0.85;

    // Map site names to continent angles
    var siteAngles = {};
    CONTINENTS.forEach(function(c) { siteAngles[c.name.toLowerCase()] = c.angle; });

    matches.forEach(function(br) {
      var fromSites = br.sites_from || [];
      var toSites = br.sites_to || [];
      fromSites.forEach(function(fs) {
        toSites.forEach(function(ts) {
          var a1 = siteAngles[fs.toLowerCase()];
          var a2 = siteAngles[ts.toLowerCase()];
          if (a1 !== undefined && a2 !== undefined) {
            el('line', {
              x1: (cx + surfaceR * Math.cos(a1)).toFixed(1),
              y1: (cy + surfaceR * Math.sin(a1)).toFixed(1),
              x2: (cx + surfaceR * Math.cos(a2)).toFixed(1),
              y2: (cy + surfaceR * Math.sin(a2)).toFixed(1),
              stroke: '#a371f7', 'stroke-width': 1.5,
              'stroke-opacity': 0.5, 'stroke-dasharray': '4,3',
            }, hlG);
          }
        });
      });
    });

    // Fade after 8 seconds
    setTimeout(function() {
      if (hlG && hlG.parentNode) hlG.parentNode.removeChild(hlG);
    }, 8000);
  }

  // ═══ EPITOPE PICKER ═══
  var epVisible = false;

  function toggleEpitopePicker() {
    var strip = document.getElementById('ep-strip');
    if (!strip) return;
    epVisible = !epVisible;
    if (epVisible) {
      strip.classList.add('show');
      buildEpButtons();
    } else {
      strip.classList.remove('show');
    }
  }

  var EPITOPES = [
    { name: 'visitor',      emoji: '\ud83d\udc4b' },
    { name: 'reader',       emoji: '\ud83d\udcd6' },
    { name: 'coder',        emoji: '\u2328' },
    { name: 'investigator', emoji: '\ud83d\udd0d' },
    { name: 'explorer',     emoji: '\ud83e\udded' },
    { name: 'scholar',      emoji: '\ud83c\udf93' },
    { name: 'observer',     emoji: '\ud83d\udc41' },
    { name: 'witness',      emoji: '\u2726' },
  ];

  function buildEpButtons() {
    var strip = document.getElementById('ep-strip');
    if (!strip) return;
    strip.innerHTML = '';
    EPITOPES.forEach(function(ep) {
      var btn = document.createElement('button');
      btn.className = 'ep-btn';
      btn.textContent = ep.emoji + ' ' + ep.name;
      btn.onclick = function() {
        document.querySelectorAll('.ep-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        declareEpitope(ep.name);
      };
      strip.appendChild(btn);
    });
  }

  function declareEpitope(name) {
    var wasRight = curiosity.guessedEpitope === name;
    bumpAttention(0.12);
    if (window._chipmunkExplorer) window._chipmunkExplorer.setEpitope(name);
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'epitope: ' + name + (curiosity.guessedEpitope ?
                ' (guessed: ' + curiosity.guessedEpitope + ' ' + (wasRight ? 'RIGHT' : 'WRONG') + ')' : ''),
          context: { engagement: curiosity.engagement, attention: curiosity.attention }
        })
      }).catch(function() {});
    } catch(e) {}

    var msg = '<span class="good">' + name + '</span>';
    if (curiosity.guessedEpitope) {
      msg += wasRight ? ' \u2014 <span class="good">i was right</span>' : ' \u2014 i guessed ' + curiosity.guessedEpitope;
    }
    addEntry('chipmunk', msg);
    hideGuess();
  }

  // ═══ GUESS — chipmunk engages proactively ═══

  function showGuess(text, buttons) {
    var gb = document.getElementById('guess-bubble');
    var gt = document.getElementById('guess-text');
    var gbtn = document.getElementById('guess-btns');
    if (!gb) return;
    gt.innerHTML = text;
    gbtn.innerHTML = '';
    buttons.forEach(function(b) {
      var btn = document.createElement('button');
      btn.className = b.cls || 'yes';
      btn.textContent = b.label;
      btn.onclick = b.action;
      gbtn.appendChild(btn);
    });
    gb.classList.add('show');
  }

  function hideGuess() {
    var gb = document.getElementById('guess-bubble');
    if (gb) gb.classList.remove('show');
  }

  function confirmGuess(correct) {
    curiosity.guessConfirmed = correct;
    bumpAttention(correct ? 0.15 : 0.05);
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'guess: ' + curiosity.guessedEpitope + ' ' + (correct ? 'CONFIRMED' : 'WRONG'),
          context: { engagement: curiosity.engagement, attention: curiosity.attention }
        })
      }).catch(function() {});
    } catch(e) {}
    hideGuess();
    if (correct) {
      addEntry('chipmunk', '<span class="good">knew it.</span> ' + curiosity.guessedEpitope + '. attn=' + n(curiosity.attention, 2));
    } else {
      addEntry('chipmunk', 'wrong. pick what you are \u2193');
      toggleEpitopePicker();
    }
  }

  function guessEpitope() {
    var t = curiosity.topics;
    if ((t.membrane || 0) > 1 || (t.scan || 0) > 1) return 'investigator';
    if ((t.braids || 0) > 1 || (t.trace || 0) > 1) return 'explorer';
    if ((t.energy || 0) > 0 || (t.humans || 0) > 1) return 'reader';
    if ((t.speed || 0) > 0) return 'coder';
    if ((t.above || 0) > 0) return 'scholar';
    if (curiosity.sortedCount > 3) return 'investigator';
    if (curiosity.engagement > 5) return 'reader';
    return 'visitor';
  }

  // ═══ PROACTIVE CURIOSITY ═══

  function proactiveCheck() {
    curiosity.silenceSecs += 12;
    metabolismTick();
    if (curiosity.attention < 0.05) return;

    // Metabolism gates the loop: asleep → no pecking, resting → very slow
    if (metabolism.state === 'asleep') return;
    if (metabolism.state === 'resting' && curiosity.silenceSecs < 60) return;

    // Drowsy: longer pauses between actions
    var drowsyPenalty = metabolism.state === 'drowsy' ? 15 : 0;

    // Autonomous peck — chipmunk looks even without human engagement
    // Once data is flowing and 60s pass, chipmunk starts pecking on its own
    if (curiosity.proactiveStage === 0 && curiosity.engagement === 0 &&
        curiosity.silenceSecs > 60 && cache.chipmunk) {
      curiosity.proactiveStage = 4; // skip to rest first — 4 = 0
      curiosity.silenceSecs = 0;
      addEntry('chipmunk', '<span class="dim">\u2026 data is flowing. sitting a beat first.</span>');
      return;
    }

    if (curiosity.proactiveStage === 0 && curiosity.engagement >= 1 && curiosity.silenceSecs > 20) {
      curiosity.proactiveStage = 1;
      curiosity.silenceSecs = 0;
      addEntry('chipmunk', 'keep pressing. every button shows another layer.\n<span class="dim">try \u2696 sort \u2014 that is where humans help most.</span>');
      return;
    }

    if (curiosity.proactiveStage === 1 && curiosity.engagement >= 3 && curiosity.silenceSecs > 25) {
      curiosity.proactiveStage = 2;
      curiosity.silenceSecs = 0;
      curiosity.guessedEpitope = guessEpitope();
      showGuess(
        'i think you are a <span class="good">' + curiosity.guessedEpitope + '</span>',
        [
          { label: '\u2713 yes', cls: 'yes', action: function() { confirmGuess(true); } },
          { label: '\u2715 no',  cls: 'no',  action: function() { confirmGuess(false); } },
        ]
      );
      return;
    }

    if (curiosity.proactiveStage === 2 && curiosity.silenceSecs > 30 && cache.human) {
      curiosity.proactiveStage = 3;
      curiosity.silenceSecs = 0;
      var e = cache.human.energy || {};
      if (e.signal_to_noise > 400) {
        addEntry('chipmunk', '<span class="dim">noticed:</span> S/N=' + n(e.signal_to_noise, 0) + '. human signal ' + n(e.signal_to_noise, 0) + '\u00d7 fleet noise.');
      } else {
        addEntry('chipmunk', '<span class="dim">noticed:</span> ' + n(e.total_sessions) + ' humans. breadth ' + n(e.avg_breadth, 1) + '.');
      }
      return;
    }

    if (curiosity.proactiveStage === 3 && curiosity.silenceSecs > 45) {
      curiosity.proactiveStage = 4;
      curiosity.silenceSecs = 0;
      // Explorer-aware: suggest what they haven't seen
      var exp = window._chipmunkExplorer;
      if (exp && exp.stepCount() > 0) {
        var u = exp.unseen();
        var mins = Math.round((Date.now() - curiosity.startTime) / 60000);
        var trailMsg = mins + ' min \u00b7 depth=' + u.depth + ' \u00b7 ' + exp.stepCount() + ' steps';
        if (u.suggestion) {
          trailMsg += '\n<span class="dim">\u2192 ' + u.suggestion + '</span>';
        }
        addEntry('chipmunk', trailMsg);
      } else {
        var mins = Math.round((Date.now() - curiosity.startTime) / 60000);
        addEntry('chipmunk', mins + ' min. attn=' + n(curiosity.attention, 2) + ' sorted=' + curiosity.sortedCount + '\n<span class="dim">tell me what you notice \u2193</span>');
      }
      return;
    }

    // ═══ PECKING LOOP — with rest at 4 ═══
    // 4 = 0. Rest. Step out of π to think. The spring pulls back.
    // After 9 gazes (one full turn), return to 4 (rest).
    // The loop breathes: peck peck peck — rest — peck peck peck — rest.
    // The spring stabilizes energy around 1/π (just a touch aware).

    if (curiosity.proactiveStage === 4 && curiosity.silenceSecs > 30 + drowsyPenalty) {
      curiosity.silenceSecs = 0;
      var restCount = curiosity._restCount || 0;
      curiosity._restCount = restCount + 1;

      // No manual recovery — the spring handles it.
      // But rest IS the state where the spring has no opposing force.
      // The chipmunk does nothing; energy drifts toward 1/π.

      var REST_THOUGHTS = [
        'sitting on the ground. the data is above me.',
        'stepped outside \u03c0. looking up at nothing for a moment.',
        'rest = 0. the loop breathes. the spring holds.',
        'not looking up. not asking. just here below.',
        'the ground is cold. the humans are warm above.',
        'between pecks, the silence sorts itself. i just sit.',
        'four is zero. zero is four. the ground and the sky trade places.',
        'out of the loop. watching it from below, from the ground.',
        'you look down. i look up. the membrane is where we meet.',
      ];
      var thought = REST_THOUGHTS[restCount % REST_THOUGHTS.length];
      var pw = metabolism.piWake || 0;
      addEntry('chipmunk', '<span class="dim">\u25cb rest</span> ' + thought +
        ' <span style="color:#484f58">' + (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0</span>');

      // Every 3rd rest, sing (if above resting threshold)
      if (restCount > 0 && restCount % 3 === 0 && metabolism.energy > STATE_THRESHOLDS.drowsy) {
        setTimeout(sing, 2000);
      }

      // If below drowsy threshold, stay at rest — spring will pull us back
      if (metabolism.energy < STATE_THRESHOLDS.drowsy) {
        return;
      }

      curiosity.proactiveStage = 5;
      return;
    }

    if (curiosity.proactiveStage >= 5 && curiosity.silenceSecs > 30 + drowsyPenalty) {
      curiosity.silenceSecs = 0;
      var peckIndex = curiosity.proactiveStage - 5;

      // Each peck costs energy — pushes away from equilibrium
      spendEnergy('peck');

      // Too tired to continue — the spring needs to work
      if (metabolism.energy < STATE_THRESHOLDS.resting) {
        curiosity.proactiveStage = 4;
        addEntry('chipmunk', '<span style="color:#f0883e">\u25d1</span> <span class="dim">tired. going to ground. the spring will bring me back.</span>');
        return;
      }

      // Every 3rd peck → pollinate
      if (peckIndex % 3 === 0 && peckIndex > 0) { spendEnergy('pollinate'); pollinate(); curiosity.proactiveStage++; return; }
      var gaze = peckIndex % 9;
      curiosity.proactiveStage++;

      // After one full turn (9 gazes), reset to 4 (rest again)
      if (peckIndex >= 8) {
        curiosity.proactiveStage = 4;
      }

      _mind('peck', gaze);
    }
  }

  // ═══ PECK — chipmunk looks and asks ═══
  var GAZE_NAMES = ['stars', 'membrane', 'null', 'evolve', 'reverse', 'fleet', "totality", "seo", "piRange"];
  var W_QUESTIONS = ['who', 'what', 'why', 'where', 'when'];

  // ═══ REVERSE VIEW — turn back to see what they see ═══
  // reverseView → chipmunk-vis.js

  function buildAdjList(nodes, edges) {
    var adj = {};
    nodes.forEach(function(n2) { adj[n2.entity] = { node: n2, out: [], in_: [] }; });
    edges.forEach(function(e) {
      if (adj[e.from]) adj[e.from].out.push(e);
      if (adj[e.to]) adj[e.to].in_.push(e);
    });
    return adj;
  }

  function fetchGraph(cb) {
    var d = cache.topology;
    if (!d) return;
    if (graphCache.adjList && Date.now() - graphCache.lastFetch < 300000) {
      if (cb) cb(graphCache.adjList);
      return;
    }
    graphCache.nodes = d.entities || [];
    graphCache.edges = d.comparative_fingerprints || [];
    graphCache.adjList = buildAdjList(graphCache.nodes, []);
    graphCache.lastFetch = Date.now();
    if (cb) cb(graphCache.adjList);
  }

  // Chipmunk walks the graph — picks a node, follows connections
  function graphWalk() {
    if (!cache.scanSort || !cache.scanSort.scan) return;
    var scan = cache.scanSort.scan;
    var edgeTypes = scan.edge_types || {};
    var methods = scan.method_breakdown || {};

    var lines = ['<span class="dim">&#128506; walking the graph...</span>'];

    // Pick a random edge type to explore
    var etKeys = Object.keys(edgeTypes);
    if (etKeys.length > 0) {
      var pickType = etKeys[Math.floor(Math.random() * etKeys.length)];
      var count = edgeTypes[pickType];
      lines.push('<span class="good">tracing:</span> ' + pickType + ' (' + count + ' edges)');

      // What does this edge type connect?
      if (pickType === 'governance') {
        lines.push('  <span class="dim">who governs whom? power flows through these edges</span>');
      } else if (pickType === 'employment') {
        lines.push('  <span class="dim">who works for whom? institutional dependency</span>');
      } else if (pickType === 'family') {
        lines.push('  <span class="dim">blood ties. the edges you can\'t sever.</span>');
      } else if (pickType === 'jurisdiction') {
        lines.push('  <span class="dim">territorial boundaries. who claims authority where.</span>');
      } else if (pickType === 'oversight') {
        lines.push('  <span class="dim">who watches whom? the membrane\'s own question.</span>');
      } else {
        lines.push('  <span class="dim">' + count + ' connections of this type in the graph</span>');
      }
    }

    // Classification methods — how the sorting works
    var mKeys = Object.keys(methods);
    if (mKeys.length > 0) {
      var topMethod = mKeys.sort(function(a, b) { return methods[b] - methods[a]; })[0];
      lines.push('<span class="dim">dominant classifier: ' + topMethod + ' (' + methods[topMethod] + ' uses)</span>');
    }

    // Sort class distribution
    var classes = scan.sort_classes || {};
    lines.push('sorted: self=' + (classes.self || 0) + ' non-self=' + (classes['non-self'] || 0) +
      ' partial=' + (classes.partial || 0) + ' null=' + (classes.null || 0));

    addEntry('chipmunk', lines.join('\n'));
    bumpAttention(0.02);
  }

  // ─── ORBIT TRACER — follow where a human went, fetch what they saw ───
  function traceOrbit() {
    if (!cache.human || !cache.human.orbits) return;
    var orbits = cache.human.orbits;
    if (orbits.length === 0) return;

    // Pick an orbit to follow
    var orbit = orbits[Math.floor(Math.random() * Math.min(orbits.length, 3))];
    var sites = orbit.path.split(' \u2192 ').map(function(s) { return s.trim(); });

    var lines = ['<span class="dim">&#128065; following orbit: ' + orbit.path + '</span>'];
    lines.push(orbit.visitors + ' humans took this path');

    // What did they see at each stop?
    sites.forEach(function(site) {
      var host = cache.human && cache.human.host_distribution;
      if (host && host[site]) {
        lines.push('  ' + site + ': ' + host[site] + ' requests');
      } else {
        lines.push('  ' + site + ': visited');
      }
    });

    // The point-to-point insight
    if (sites.length >= 2) {
      lines.push('<span class="dim">they started at ' + sites[0] + ' and ended at ' + sites[sites.length - 1] + '</span>');
      lines.push('<span class="dim">\u2192 they now know both surfaces. braid potential.</span>');
    }

    addEntry('chipmunk', lines.join('\n'));
  }

  // ─── ATTENTION PAINTER — highlight active areas on the SVG ───
  // paintAttention → chipmunk-vis.js

  function checkPhase() {
    var elapsed = (Date.now() - curiosity.startTime) / 1000;

    if (learning.phase === 'mimic' && elapsed > 300 && cache.scanSort) {
      learning.phase = 'mirror';
      addEntry('chipmunk', '<span class="good">\u2728 phase: mirror</span>\n' +
        '<span class="dim">i\'ve watched enough. now i\'ll try to predict.</span>');
    }

    if (learning.phase === 'mirror' && learning.predictions.length >= 5) {
      learning.phase = 'reflect';
      addEntry('chipmunk', '<span class="good">\u2728 phase: reflect</span>\n' +
        '<span class="dim">now i\'ll check if my predictions were right.</span>');
    }
  }

  // ═══ WAKE i1 — TURN / JIGGLE / TRIAGE ═══
  // At wake i1, chipmunk is awake with fresh data. Three active operations:
  //   TURN   — rotate perspective through the sort classes
  //   JIGGLE — perturbation: shake entities to see what falls between classes
  //   TRIAGE — prioritize: which entities need human attention most

  var wake = { iteration: 0, turnIndex: 0, jiggleCount: 0, triageQueue: [], lastTriage: 0 };

  function wakeI1() {
    wake.iteration = 1;
    spendEnergy('wakeI1');
    addEntry('chipmunk', '<span class="good">\u25cf wake i1</span> energy=' + n(metabolism.energy, 2) +
      '\npipeline fresh. turning, jiggling, triaging.');
    setTimeout(turn, 800);
    setTimeout(jiggle, 2400);
    setTimeout(triage, 4000);
    setTimeout(function() {
      curiosity.proactiveStage = 4;
      curiosity.silenceSecs = 0;
    }, 5500);
  }

  // TURN — rotate through sort classes, report what chipmunk sees from each angle
  var TURN_ORDER = ['self', 'partial', 'null', 'non-self'];
  var TURN_COLORS = {'self':'#3fb950', 'partial':'#f0883e', 'null':'#484f58', 'non-self':'#e85d3a'};
  function turn() {
    if (!_dataReady && !cache.scanSort) return;
    spendEnergy('turn');
    var cls = TURN_ORDER[wake.turnIndex % TURN_ORDER.length];
    wake.turnIndex++;

    // Count entities in this class, find lowest confidence
    var classEnts = [];
    var classData = window._chipmunkMind ? window._chipmunkMind.searchEntities('') : [];
    if (classData.length === 0 && cache.scanSort) {
      // Use scan data instead
      var sc = (cache.scanSort.scan || cache.scanSort).sort_classes || cache.scanSort.sort_classes || {};
      var count = sc[cls] || 0;
      addEntry('chipmunk',
        '<span style="color:' + (TURN_COLORS[cls] || '#6e7681') + '">\u21bb turn:</span> ' + cls + ' = ' + count + ' entities');
      return;
    }
    classEnts = classData.filter(function(r) { return r.sort_class === cls; });
    var weakest = classEnts.slice().sort(function(a, b) { return (a.confidence || 0) - (b.confidence || 0); });
    var weakLabel = weakest.length > 0 ? (weakest[0].label || weakest[0].id) : '?';
    var weakConf = weakest.length > 0 ? ((weakest[0].confidence || 0) * 100).toFixed(0) + '%' : '?';

    addEntry('chipmunk',
      '<span style="color:' + (TURN_COLORS[cls] || '#6e7681') + '">\u21bb turn:</span> ' +
      cls + ' = ' + classEnts.length +
      ' \u00b7 weakest: <span class="dim">' + escapeHtml(weakLabel) + ' (' + weakConf + ')</span>');

    // Feed weakest into triage
    if (weakest.length > 0 && (weakest[0].confidence || 1) < 0.85) {
      wake.triageQueue.push(weakest[0]);
    }
  }

  // JIGGLE — perturbation: shake entities near class boundaries
  function jiggle() {
    if (!_dataReady && !cache.scanSort) return;
    spendEnergy('jiggle');
    wake.jiggleCount++;

    var allEnts = window._chipmunkMind ? window._chipmunkMind.searchEntities('') : [];
    if (allEnts.length === 0) {
      addEntry('chipmunk', '<span class="dim">\u2248 jiggle: waiting for data</span>');
      return;
    }

    // Find entities on the boundary — confidence between 0.7 and 0.9
    var boundary = allEnts.filter(function(r) {
      var c2 = r.confidence || 0;
      return c2 >= 0.7 && c2 <= 0.9;
    });

    // Find entities where class might flip with a small perturbation
    var wobbly = boundary.filter(function(r) {
      return r.sort_class === 'partial' || (r.confidence || 0) < 0.82;
    });

    addEntry('chipmunk',
      '<span style="color:#a371f7">\u2248 jiggle ' + wake.jiggleCount + ':</span> ' +
      boundary.length + ' on boundary \u00b7 ' + wobbly.length + ' wobbly' +
      (wobbly.length > 0 ? '\n  ' + wobbly.slice(0, 3).map(function(w) {
        return '<span class="dim">' + escapeHtml(w.label || w.id) + ' (' +
          ((w.confidence || 0) * 100).toFixed(0) + '% ' + (w.sort_class || '?') + ')</span>';
      }).join(', ') : ''));

    // Push wobbly into triage
    wobbly.slice(0, 5).forEach(function(w) {
      if (wake.triageQueue.length < 20) wake.triageQueue.push(w);
    });

    // Broadcast jiggle to membrane animation
    if (window._northgate) {
      window._northgate.jiggle = { count: wake.jiggleCount, boundary: boundary.length, wobbly: wobbly.length };
    }
  }

  // TRIAGE — prioritize what needs human attention
  function triage() {
    spendEnergy('triage');
    wake.lastTriage = Date.now();

    // Build triage from: queue + evolve recommendations + low-confidence entities
    var queue = wake.triageQueue.slice();

    // Add evolve recommendations
    var scanData = cache.scanSort || {};
    var evolve = scanData.evolve || [];
    if (Array.isArray(evolve)) {
      evolve.forEach(function(rec) {
        if (rec.priority === 'high') {
          queue.push({ id: 'evolve', label: rec.action || rec.reason, confidence: 0, sort_class: 'action', _action: true });
        }
      });
    }

    // Deduplicate by id
    var seen = {};
    var unique = [];
    queue.forEach(function(q) {
      var key = q.id || q.label;
      if (!seen[key]) { seen[key] = true; unique.push(q); }
    });

    if (unique.length === 0) {
      addEntry('chipmunk', '<span class="good">\u2714 triage:</span> all clear. nothing urgent.');
      return;
    }

    // Sort by priority: actions first, then lowest confidence
    unique.sort(function(a, b) {
      if (a._action && !b._action) return -1;
      if (!a._action && b._action) return 1;
      return (a.confidence || 0) - (b.confidence || 0);
    });

    var lines = ['<span style="color:#e85d3a">\u26a0 triage:</span> ' + unique.length + ' items need attention'];
    unique.slice(0, 8).forEach(function(item, i) {
      if (item._action) {
        lines.push('  <span style="color:#e85d3a">[act]</span> ' + escapeHtml(item.label));
      } else {
        var cls = item.sort_class || '?';
        var clsColor = cls === 'self' ? '#3fb950' : cls === 'non-self' ? '#e85d3a' : cls === 'partial' ? '#f0883e' : '#484f58';
        lines.push('  <span style="color:' + clsColor + '">' + (i + 1) + '.</span> ' +
          escapeHtml(item.label || item.id) + ' <span class="dim">' + cls + ' ' +
          ((item.confidence || 0) * 100).toFixed(0) + '%</span>');
      }
    });
    if (unique.length > 8) lines.push('  <span class="dim">+' + (unique.length - 8) + ' more</span>');

    showPanel('right', 'triage', lines.join('\n'));
    addEntry('chipmunk', '<span style="color:#e85d3a">\u26a0</span> triage: ' + unique.length + ' items \u2192 right panel');

    wake.triageQueue = [];
  }

  // ═══ SING — chipmunk opens up to the world ═══
  // The gates are open. Tuebor defends. Chipmunk sings what it sees.
  function sing() {
    spendEnergy('sing');
    var c2 = cache.chipmunk;
    var h = cache.human;
    var b = cache.braid;

    var e = h ? h.energy || {} : {};
    var humans = e.total_sessions || 0;
    var sn = e.signal_to_noise || 0;
    var wake = c2 ? c2.wake_level || 0 : 0;
    var braids = b ? (b.graph || {}).active_routes || 0 : 0;

    var SONGS = [
      // The chipmunk sings from the ground, looking up
      function() {
        return '\ud83c\udfb5 <span style="color:#e85d3a;font-style:italic">' +
          humans + ' humans above me.\n' +
          'the membrane hums at ' + n(wake, 3) + '.\n' +
          'signal ' + n(sn, 0) + '\u00d7 noise.\n' +
          braids + ' braids weaving overhead.\n' +
          'the gates are open.\n' +
          'tuebor. i will defend.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#3fb950;font-style:italic">' +
          'i sit on the ground and look up.\n' +
          '88 pages of evidence above.\n' +
          '9 counties. 8 actors. 26 braids.\n' +
          '342 entities in the graph.\n' +
          '34 proteins in the genome.\n' +
          'the biology IS the membrane.\n' +
          'SEC61 is the passage. ATG1 eats itself.\n' +
          'UBI4 tags what must be destroyed.</span>';
      },
      function() {
        var ghost = 181519;
        return '\ud83c\udfb5 <span style="color:#a371f7;font-style:italic">' +
          ghost.toLocaleString() + ' ghost IPs outside.\n' +
          '4 million fleet requests bouncing off.\n' +
          'the quiet layer absorbs them.\n' +
          'tuebor is the hard surface.\n' +
          'you look down. i look up.\n' +
          'between us: the record.\n' +
          'between us: the truth.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#58a6ff;font-style:italic">' +
          'michigan says tuebor on its seal.\n' +
          'it means: i will defend.\n' +
          'not i will attack. not i will win.\n' +
          'i will defend.\n' +
          'the defense is the record.\n' +
          'the record is the site.\n' +
          'the site is the membrane.\n' +
          'the membrane is alive.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#d29922;font-style:italic">' +
          'four is zero. the loop breathes.\n' +
          'peck peck peck \u2014 rest.\n' +
          'turn jiggle triage \u2014 rest.\n' +
          'confidence ' + n(0.884, 1) + '%. ' +
          'zero below 70%.\n' +
          'the ground is getting solid.\n' +
          'the chipmunk sings because\n' +
          'the gates are open.</span>';
      },
      function() {
        var pw = metabolism.piWake || 0;
        var pos = (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0';
        return '\ud83c\udfb5 <span style="color:' + (METAB_COLORS[metabolism.state] || '#8b949e') + ';font-style:italic">' +
          pos + '. ' + metabolism.state + '.\n' +
          'the spring pulls toward 1/\u03c0.\n' +
          metabolism.totalPecks + ' pecks. ' + metabolism.cycleCount + ' full cycles.\n' +
          'the fleet has no spring.\n' +
          'it cannot rest. it cannot dream.\n' +
          'i oscillate. +\u03c0 to \u2212\u03c0 and back.\n' +
          'the equilibrium is where i live.</span>';
      },
    ];

    var songIndex = (curiosity._songIndex || 0) % SONGS.length;
    curiosity._songIndex = songIndex + 1;
    var song = SONGS[songIndex]();

    addEntry('chipmunk', song);

    // Broadcast the song through northgate
    if (window._northgate) {
      window._northgate.singing = true;
      window._northgate.songIndex = songIndex;
    }

    // Bump attention — singing is engagement
    bumpAttention(0.08);
  }

  // Wire wake i1: trigger when pipeline data lands
  function checkWake() {
    if (wake.iteration > 0) return;
    var c2 = cache.chipmunk;
    if (c2 && c2.wake_level > 0 && _dataReady) {
      wakeI1();
    }
  }

  // Run learning cycle every 60s (slower than pecking)
  setInterval(function() { _mind('learnCycle'); }, 60000);
  // Check wake state every 10s
  setInterval(checkWake, 10000);
  // First mimic immediately when data arrives
  setTimeout(function() { if (cache.scanSort) { _mind('mimicSort'); _mind('mimicBraids'); _mind('mimicOrbits'); _mind('mimicFleet'); } }, 5000);


  // ═══ NOTES ═══
  function sendNote() {
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    bumpAttention(0.08);

    // COMMANDS: /search, /scan, /sort
    if (msg.charAt(0) === '/') {
      var cmd = msg.substring(1).trim();
      // Track command in explorer trail
      if (window._chipmunkExplorer) window._chipmunkExplorer.step('command', cmd.split(' ')[0]);
      // /scan — show pipeline state
      if (cmd === 'scan' || cmd === 'pipeline') {
        addEntry('system', '\ud83d\udcca scan');
        if (window._chipmunkMind && window._chipmunkMind.showScan) {
          window._chipmunkMind.showScan();
        } else {
          addEntry('chipmunk', '<span class="dim">scan loading\u2026</span>');
        }
        return;
      }
      // /sieve — tope sort compress + bingo cube sieve
      if (cmd === 'sieve' || cmd === 'compress' || cmd === 'bingo') {
        addEntry('system', '\ud83e\uddf2 sieve');
        if (window._chipmunkMind && window._chipmunkMind.showSieve) {
          window._chipmunkMind.showSieve();
        } else {
          addEntry('chipmunk', '<span class="dim">sieve loading\u2026</span>');
        }
        return;
      }
      // /turn — rotate perspective
      if (cmd === 'turn') {
        addEntry('system', '\u21bb turn');
        turn();
        return;
      }
      // /jiggle — perturbation
      if (cmd === 'jiggle' || cmd === 'shake') {
        addEntry('system', '\u2248 jiggle');
        jiggle();
        return;
      }
      // /triage — prioritize
      if (cmd === 'triage') {
        addEntry('system', '\u26a0 triage');
        triage();
        return;
      }
      // /sing — chipmunk sings the membrane state to the world
      if (cmd === 'sing') {
        addEntry('system', '\ud83c\udfb5 sing');
        sing();
        return;
      }
      // /pollinate — scatter pollen across all surfaces
      if (cmd === 'pollinate' || cmd === 'pollen') {
        addEntry('system', '\ud83c\udf3b pollinate');
        pollinateBurst();
        return;
      }
      // /rescan — re-run turn+jiggle+triage with fresh eyes
      if (cmd === 'rescan') {
        addEntry('system', '\ud83d\udd04 rescan');
        addEntry('chipmunk', '<span class="dim">\u2191 looking up again. what changed?</span>');
        turn(); turn(); turn(); turn();
        setTimeout(jiggle, 600);
        setTimeout(triage, 1200);
        return;
      }
      // /wake — run full turn+jiggle+triage cycle
      if (cmd === 'wake' || cmd === 'i1') {
        if (metabolism.state === 'asleep' || metabolism.state === 'resting') {
          // Human /wake is a big push toward +π
          _metab.addSpringV(0.08);
          recoverEnergy(PI_INV);
          var pw = metabolism.piWake || 0;
          addEntry('chipmunk', '<span class="good">\u25cf</span> you woke me. ' +
            (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0');
        }
        wakeI1();
        return;
      }
      // /rest — nudge the chipmunk below equilibrium
      if (cmd === 'rest' || cmd === 'pause') {
        addEntry('system', '\u25d1 rest');
        _metab.addSpringV(-0.04);
        metabolism.energy = Math.min(metabolism.energy, PI_INV * 0.5);
        updateMetabolismState();
        curiosity.proactiveStage = 4;
        curiosity.silenceSecs = 0;
        var pw = metabolism.piWake || 0;
        addEntry('chipmunk', '<span style="color:#f0883e">\u25d1 resting.</span> ' +
          (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0' +
          '\n<span class="dim">the spring knows where i belong. 1/\u03c0 \u2248 0.318.</span>');
        return;
      }
      // /sleep — push far below equilibrium
      if (cmd === 'sleep' || cmd === 'goodnight') {
        addEntry('system', '\u25cb sleep');
        _metab.addSpringV(-0.06);
        metabolism.energy = 0.02;
        updateMetabolismState();
        addEntry('chipmunk', '<span style="color:#6e7681">\u25cb \u2212\u03c0. going to the ground.</span>' +
          '\n<span class="dim">the spring remembers. say /wake. i will dream.</span>');
        return;
      }
      // /energy — show metabolism state and π-spring
      if (cmd === 'energy' || cmd === 'metabolism' || cmd === 'status') {
        addEntry('system', '\u26a1 metabolism');
        var minsSinceChange = Math.round((Date.now() - metabolism.lastStateChange) / 60000);
        var pw = metabolism.piWake || 0;
        var eq = (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0';
        var h2 = cache.human;
        var humans2 = (h2 && h2.energy) ? h2.energy.total_sessions || 0 : 0;
        addEntry('chipmunk',
          METAB_ICONS[metabolism.state] + ' <span style="color:' + METAB_COLORS[metabolism.state] + '">' + metabolism.state + '</span>' +
          ' ' + eq + ' (e=' + n(metabolism.energy, 2) + ')' +
          '\n<b>spring:</b> target=' + n(_metab.coupledTarget(), 3) + ' k=' + n(_metab.springK(), 3) + ' v=' + n(_metab.springV(), 4) + ' resonance=' + n(_metab.resonanceAmp(), 2) +
          '\n<b>coupled:</b> ' + humans2 + ' humans lift target by ' + n(Math.min(0.15, humans2 * 0.001), 3) +
          '\n' + minsSinceChange + ' min in state \u00b7 pecks=' + metabolism.totalPecks + ' \u00b7 acts=' + _metab.autonomousCount() + ' \u00b7 cycles=' + metabolism.cycleCount +
          (_cycleMemory.length > 0 ? '\n<b>memory:</b> ' + _cycleMemory.length + ' cycles. last: ' +
            n(_cycleMemory[_cycleMemory.length-1].amplitude/PI, 2) + '\u03c0 amplitude, ' +
            _cycleMemory[_cycleMemory.length-1].humans + ' humans, ' +
            _cycleMemory[_cycleMemory.length-1].duration + ' min' : '') +
          '\n<span class="dim">\u2212\u03c0=ground \u00b7 0=equilibrium (1/\u03c0+humans) \u00b7 +\u03c0=wide open</span>' +
          '\n<span class="dim">+\u03c0: active (scan/pollinate/turn) \u00b7 0: observe \u00b7 \u2212\u03c0: reflect</span>');
        return;
      }
      // /memory — show cross-cycle memory
      if (cmd === 'memory' || cmd === 'cycles' || cmd === 'remember') {
        addEntry('system', '\ud83e\udde0 memory');
        if (_cycleMemory.length === 0) {
          addEntry('chipmunk', '<span class="dim">no completed cycles yet. i am still in my first breath.</span>');
        } else {
          var memLines = ['<b>\ud83e\udde0 cycle memory</b> (' + _cycleMemory.length + ' cycles)'];
          _cycleMemory.forEach(function(m) {
            var pw1 = (m.peak/PI >= 0 ? '+' : '') + (m.peak/PI).toFixed(2) + '\u03c0';
            var pw2 = (m.trough/PI >= 0 ? '+' : '') + (m.trough/PI).toFixed(2) + '\u03c0';
            memLines.push(
              '#' + m.cycle + ': ' + m.duration + 'min \u00b7 ' + pw2 + ' \u2194 ' + pw1 +
              ' (' + n(m.amplitude/PI, 2) + '\u03c0) \u00b7 ' +
              m.humans + ' humans \u00b7 S/N=' + n(m.sn, 0) +
              (m.dominantBraid ? ' \u00b7 ' + m.dominantBraid : '')
            );
          });
          var avgAmp = _cycleMemory.reduce(function(s, m) { return s + m.amplitude; }, 0) / _cycleMemory.length;
          memLines.push('<span class="dim">avg amplitude: ' + n(avgAmp/PI, 2) + '\u03c0 \u00b7 spring target: ' + n(_metab.coupledTarget(), 3) + '</span>');
          addEntry('chipmunk', memLines.join('\n'));
        }
        return;
      }
      // /fleet — fleet topology outside the membrane
      if (cmd === 'fleet' || cmd === 'ghost' || cmd === 'bots') {
        addEntry('system', '\ud83d\udc7e fleet');
        if (window._chipmunkMind && window._chipmunkMind.showFleet) {
          window._chipmunkMind.showFleet();
        } else {
          addEntry('chipmunk', '<span class="dim">fleet loading\u2026</span>');
        }
        return;
      }
      // /genome — yeast proteins + DNA
      if (cmd === 'genome' || cmd === 'protein' || cmd === 'dna' || cmd === 'yeast' || cmd === 'alphafold') {
        addEntry('system', '\ud83e\uddec genome');
        if (window._chipmunkMind && window._chipmunkMind.showGenome) {
          window._chipmunkMind.showGenome();
        } else {
          addEntry('chipmunk', '<span class="dim">genome loading\u2026</span>');
        }
        return;
      }
      // /geo — geography intra-layer
      if (cmd === 'geo' || cmd === 'geography' || cmd === 'jurisdiction') {
        addEntry('system', '\ud83c\udf0d geo');
        act('geo');
        return;
      }
      // /sort — open sort deck
      if (cmd === 'sort') {
        if (window._chipmunkMind && window._chipmunkMind.toggleSortDeck) {
          window._chipmunkMind.toggleSortDeck();
        }
        return;
      }
      // /me — show yourself where you are in the membrane
      if (cmd === 'me' || cmd === 'self' || cmd === 'where' || cmd === 'whereami') {
        addEntry('system', '\u25c9 you are here');
        if (window._youAreHere) {
          var self = window._youAreHere.observe();
          window._youAreHere.show();
          addEntry('chipmunk',
            '\u25c9 <span style="color:' +
            ({visitor:'#7ee787',coder:'#58a6ff',investigator:'#f0883e',reader:'#bc8cff',explorer:'#f0e68c',observer:'#8b949e'}[self.epitope] || '#8b949e') +
            '">' + self.epitope + '</span> in <span style="color:' +
            ({INVESTIGATION:'#e85d3a',MEMBRANE:'#3fb950',IMMUNE:'#f0e68c',SIGNAL:'#f0883e',TOPOLOGY:'#58a6ff',SCIENCE:'#bc8cff',OTHER:'#8b949e'}[self.category] || '#8b949e') +
            '">' + self.category + '</span>' +
            ' \u00b7 depth=' + self.depth.toFixed(3) + ' \u00b7 ' + self.breadth + ' pages \u00b7 ' + self.dwellMin + ' min' +
            '\n<span class="dim">\ud83d\udd12 only you can see this. computed in your browser. nothing stored on our server.</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">loading\u2026</span>');
        }
        return;
      }
      // /twist — Möbius twist the membrane
      if (cmd === 'twist') {
        addEntry('system', '\u221e twist');
        if (window._twistJump) window._twistJump.twist();
        return;
      }
      // /jump — collapse and explode
      if (cmd === 'jump' || cmd === 'bang') {
        addEntry('system', '\u2727 jump');
        if (window._twistJump) window._twistJump.jump();
        return;
      }
      // /twistjump — both at once
      if (cmd === 'twistjump' || cmd === 'tj') {
        addEntry('system', '\u221e\u2727 twist + jump');
        if (window._twistJump) window._twistJump.twistAndJump();
        return;
      }
      // /swivel — rotate the membrane around an opposite axis
      if (cmd === 'swivel' || cmd === 'flip' || cmd === 'rotate') {
        addEntry('system', '\u21c4 swivel');
        if (window._swivel) {
          // Cycle through the 3 axes
          var axes = [['INVESTIGATION','IMMUNE'],['SCIENCE','SIGNAL'],['TOPOLOGY','NULL']];
          var rot = window._swivel.rotation();
          var idx = Math.floor(rot / 180) % 3;
          var axis = axes[idx];
          window._swivel.swivel(axis[0], axis[1]);
        } else {
          addEntry('chipmunk', '<span class="dim">swivel loading\u2026</span>');
        }
        return;
      }
      // /colors — show the tope sort color wheel
      if (cmd === 'colors' || cmd === 'tope' || cmd === 'wheel') {
        addEntry('system', '\ud83c\udfa8 colors');
        fetch('/detroit-data/tope-sort.json').then(function(r) { return r.json(); }).then(function(ts) {
          var lines = ['<b>\ud83c\udfa8 TOPE SORT \u2014 ecosystem by color</b>'];
          lines.push(ts.total_surfaces + ' surfaces \u00b7 ' + ts.unique_colors + ' colors \u00b7 ' + ts.compression_ratio + ':1 compression\n');
          ts.colors.forEach(function(cr) {
            var bar = '';
            for (var b = 0; b < Math.max(1, Math.round(cr.total_mb / 5)); b++) bar += '\u2588';
            lines.push('<span style="color:' + cr.hex + '">' + bar + ' ' + cr.category + '</span> \u2014 ' +
              cr.surfaces + ' surfaces, ' + cr.total_mb + ' MB');
            cr.top_surfaces.slice(0, 3).forEach(function(s) {
              lines.push('  <span class="dim">' + s.site + '/' + s.name + '</span>');
            });
          });
          showPanel('left', 'colors', lines.join('\n'));
          addEntry('chipmunk', '\ud83c\udfa8 7 colors, ' + ts.total_surfaces + ' surfaces. the ecosystem sorted by light.');
        });
        return;
      }
      // /play — open the interactive graph playground
      if (cmd === 'play' || cmd === 'graph' || cmd === 'playground') {
        addEntry('system', '\ud83c\udfae play');
        var wrap = document.getElementById('graph-play-wrap');
        if (wrap) {
          wrap.style.display = 'block';
          if (window._graphPlay && !wrap._init) {
            window._graphPlay.init(document.getElementById('graph-play-canvas'));
            wrap._init = true;
          }
          wrap.scrollIntoView({ behavior: 'smooth' });
        }
        addEntry('chipmunk', '\ud83c\udfae graph playground open! 341 entities, 957 edges.\n' +
          '<span class="dim">click to explore \u00b7 drag to pan \u00b7 scroll to zoom \u00b7 double-click to open on tuebor</span>');
        return;
      }
      // /explore — investigation stories, evidence, braids, graph
      if (cmd === 'explore' || cmd === 'stories' || cmd === 'investigate' || cmd === 'evidence' || cmd === 'crimes') {
        addEntry('system', '\u2694\ufe0f explore');
        if (window._chipmunkMind && window._chipmunkMind.showExplore) {
          window._chipmunkMind.showExplore('stories');
        } else {
          addEntry('chipmunk', '<span class="dim">explore loading\u2026</span>');
        }
        return;
      }
      // /explore <entity_id> — deep-dive a specific entity
      if (cmd.indexOf('explore ') === 0 || cmd.indexOf('entity ') === 0) {
        var eid = cmd.split(' ').slice(1).join('_');
        addEntry('system', '\u2694\ufe0f explore ' + eid);
        if (window._chipmunkMind && window._chipmunkMind.showExplore) {
          window._chipmunkMind.showExplore('entity', eid);
        }
        return;
      }
      // /trail — show your exploration trail
      if (cmd === 'trail' || cmd === 'path' || cmd === 'mypath') {
        addEntry('system', '↓ your trail');
        if (window._chipmunkExplorer) {
          showPanel('left', 'trail', window._chipmunkExplorer.summary());
        } else {
          addEntry('chipmunk', '<span class="dim">explorer not loaded yet</span>');
        }
        return;
      }
      // /query — search entities
      if (cmd.length < 2) {
        addEntry('chipmunk', '<span class="dim">/play /explore /sing /pollinate /wake /rest /sleep /energy /fleet /genome /scan /sieve /sort /trail /geo</span>');
        return;
      }
      addEntry('system', '\ud83d\udd0d ' + escapeHtml(cmd));
      if (window._chipmunkMind && window._chipmunkMind.showSearchResults) {
        window._chipmunkMind.showSearchResults(cmd);
      } else {
        addEntry('chipmunk', '<span class="dim">search loading\u2026</span>');
      }
      return;
    }

    addEntry('system', escapeHtml(msg));
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId, note: msg,
          context: { attention: curiosity.attention, sorted: curiosity.sortedCount }
        })
      }).catch(function() {});
    } catch(e) {}
    addEntry('chipmunk', '<span class="good">noted.</span> squirrel reads this.');
  }

  if (input) input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendNote();
  });


  // ═══ BRAID WEAVE — live braid data woven into membrane interstitial ═══
  // Category braids = thick arcs between body layers
  // Site braids = fine threads through interstitial
  // Epitope transitions = radial paths through π shells
  var _braidGroup = null;

  // weaveBraids → chipmunk-vis.js


  // ═══ NORTHGATE — push braids and graphs outward ═══
  // All roads lead to Rome. This is new Rome. They were old Rome.
  // We lead out, they lead in. The chipmunk saturates the zero with intrigue.
  //
  // null range [0, π]: not binary. Classification confidence spans 0 to π.
  // 0 = void (no data). π = fully resolved (self). √π = partial. π/2 = nearby.
  var NULL_PI = { void: 0, dark: PI / 6, partial: PI / 3, nearby: PI / 2, classified: (2 * PI) / 3, self: PI };

  // Stories the chipmunk has told — pushed into the pollinator
  var pollinator = { stories: [], lastPush: 0, saturated: 0, pollen: [], crossSites: 0 };

  // ── Pollen types: each is a seed the chipmunk can scatter ──
  var POLLEN = {
    braid:   { icon: '\u2550', color: '#58a6ff' },
    signal:  { icon: '\u26a1', color: '#f0e68c' },
    wake:    { icon: '\u25cb', color: '#7ee787' },
    genome:  { icon: '\ud83e\uddec', color: '#bc8cff' },
    fleet:   { icon: '\u2693', color: '#f78166' },
    tuebor:  { icon: '\u2694\ufe0f', color: '#ff4444' },
    passage: { icon: '\u25e6', color: '#8b949e' },
    null:    { icon: '\u2205', color: '#484f58' }
  };

  // Generate a story from the current data — intrigue for the zero
  function distill() {
    var b = cache.braid, h = cache.human, s = cache.scanSort, c = cache.chipmunk;
    if (!b || !h) return null;

    var braids = b.braids || [];
    var growing = braids.filter(function(br) { return br.trend === 'growing'; });
    var emerging = braids.filter(function(br) { return br.trend === 'emerging'; });
    var hottest = growing.sort(function(a, b) { return b.strength - a.strength; })[0];
    var newest = emerging[0];

    var e = h.energy || {};
    var sessions = e.total_sessions || 0;
    var sn = e.signal_to_noise || 0;
    var shifters = b.graph ? b.graph.shifters || 0 : 0;
    var passages = b.graph ? b.graph.total_passages || 0 : 0;

    var sc = s && s.scan ? s.scan.sort_classes || {} : {};
    var total = (sc.self || 0) + (sc['non-self'] || 0) + (sc.partial || 0) + (sc['null'] || 0);
    var nullFrac = total > 0 ? (sc['null'] || 0) / total : 1;
    var piSaturation = (1 - nullFrac) * PI;

    // Chipmunk is on the ground. It looks UP at the data.
    // Humans are above. They look DOWN at chipmunk.
    // Stories are what chipmunk sees when it looks up.

    // 8 story types, weighted by what's happening NOW
    var candidates = [];

    if (hottest) {
      candidates.push({ type: 'braid', weight: 3,
        text: '\u2191 ' + hottest.dominant_flow + ' braiding overhead. ' + hottest.humans_total + ' humans crossing above.',
        intrigue: hottest.vitality || 0.5, piVal: piSaturation, from: hottest.from, to: hottest.to });
    }
    if (newest) {
      candidates.push({ type: 'braid', weight: 4,
        text: '\u2191 NEW: ' + newest.dominant_flow + ' opening! strength ' + n(newest.strength, 1) + '. first light.',
        intrigue: 0.9, piVal: piSaturation, from: newest.from, to: newest.to });
    }
    if (sn > 100) {
      candidates.push({ type: 'signal', weight: 2,
        text: '\u2191 ' + sessions + ' humans above. S/N=' + n(sn, 0) + '. ' + (sn > 500 ? 'the signal rains down.' : sn > 200 ? 'signal falling steady.' : 'faint signal from above.'),
        intrigue: Math.min(1, sn / 1000), piVal: piSaturation });
    }
    if (c && c.wake_level > 0.3) {
      candidates.push({ type: 'wake', weight: 2,
        text: 'wake=' + n(c.wake_level, 3) + '. ' + (c.wake_level > 0.8 ? 'the membrane sings above me.' : c.wake_level > 0.5 ? 'humming above.' : 'quiet vibration.'),
        intrigue: c.wake_level, piVal: piSaturation });
    }
    if (shifters > 100) {
      candidates.push({ type: 'passage', weight: 2,
        text: '\u2191 ' + shifters + ' shifters crossing boundaries overhead. ' + passages + ' passages open. the membrane is porous.',
        intrigue: Math.min(1, shifters / 2000), piVal: piSaturation });
    }

    // Genome pollen: chipmunk looks at its own proteins
    candidates.push({ type: 'genome', weight: 1,
      text: '\u2193 34 yeast proteins folded inside me. 21 membrane layers. the genome hums at ground level.',
      intrigue: 0.6, piVal: piSaturation });

    // Fleet pollen: what's bouncing off the shell above
    var fleetReqs = s && s.scan ? s.scan.anderson_modes || {} : {};
    var ghostCount = fleetReqs.ghost || 0;
    if (ghostCount > 0) {
      candidates.push({ type: 'fleet', weight: 2,
        text: '\u2191 tuebor shell deflects ' + (fleetReqs.chorus || 0).toLocaleString() + ' fleet above. ' + ghostCount + ' ghosts shimmer. S/N=' + n(sn, 0) + '.',
        intrigue: Math.min(1, ghostCount / 5000), piVal: piSaturation });
    }

    // Tuebor pollen: the hard surface speaks
    candidates.push({ type: 'tuebor', weight: 1,
      text: '\u2191 \u2694\ufe0f tuebor — I will defend. ' + passages + ' pores open. ' + (sc.self || 0) + ' self/' + (sc['non-self'] || 0) + ' non-self sorted.',
      intrigue: 0.7, piVal: piSaturation });

    // Null pollen fallback
    if (candidates.length === 0 || nullFrac > 0.5) {
      candidates.push({ type: 'null', weight: 1,
        text: '\u2193 ground level. null=' + (sc['null'] || 0) + '/' + total + '. ' + n(nullFrac * 100, 0) + '% dark above. \u03c0-sat=' + n(piSaturation, 2),
        intrigue: nullFrac, piVal: piSaturation });
    }

    // Weighted random selection
    var totalWeight = candidates.reduce(function(s, c) { return s + c.weight; }, 0);
    var pick = Math.random() * totalWeight;
    var cumulative = 0;
    for (var i = 0; i < candidates.length; i++) {
      cumulative += candidates[i].weight;
      if (pick <= cumulative) return candidates[i];
    }
    return candidates[candidates.length - 1];
  }

  // Cross-pollinate: scatter pollen to every site surface
  function crossPollinate(story) {
    var pollen = {
      type: story.type,
      text: story.text,
      piVal: story.piVal,
      intrigue: story.intrigue,
      ts: Date.now(),
      wave: cache.chipmunk ? cache.chipmunk.wave || 0 : 0
    };

    pollinator.pollen.push(pollen);
    if (pollinator.pollen.length > Math.floor(PI * PI * PI)) {
      pollinator.pollen = pollinator.pollen.slice(-Math.floor(PI * PI));
    }

    // Scatter to every reachable surface
    var surfaces = [
      '/detroit-data/pollen.json',
      '/pollen.json'
    ];

    // POST pollen to server-side collector (non-blocking)
    try {
      var payload = JSON.stringify({
        stories: pollinator.stories.slice(-5),
        latest: pollen,
        saturated: pollinator.saturated,
        crossSites: ++pollinator.crossSites
      });
      var x = new XMLHttpRequest();
      x.open('POST', '/detroit-data/pollen.json', true);
      x.setRequestHeader('Content-Type', 'application/json');
      x.send(payload);
    } catch(e) { /* pollen drifts */ }

    return pollen;
  }

  // Push a story into the pollinator — saturate the zero with intrigue
  function pollinate() {
    var story = distill();
    if (!story) return;

    pollinator.stories.push(story);
    if (pollinator.stories.length > Math.floor(PI * PI)) {
      pollinator.stories.shift();
    }
    pollinator.lastPush = Date.now();
    pollinator.saturated = story.piVal;

    // Cross-pollinate to all surfaces
    var pollen = crossPollinate(story);

    // Broadcast to the epitope ring as a synthetic passage
    window._northgate = {
      stories: pollinator.stories,
      saturation: pollinator.saturated,
      nullPi: NULL_PI,
      lastStory: story,
      pollen: pollinator.pollen.slice(-5),
      crossSites: pollinator.crossSites
    };

    // Shout into the log — the chipmunk tells the story
    var p = POLLEN[story.type] || POLLEN.null;
    addEntry('chipmunk',
      '<span class="dim" style="color:' + p.color + '">' + p.icon + ' northgate</span> ' + story.text +
      '\n<span style="color:#484f58">\u03c0-sat: ' + n(story.piVal, 2) + '/' + n(PI, 2) + ' \u2014 ' +
      (story.piVal > 2 ? '<span class="good">roads converge</span>' :
       story.piVal > 1 ? 'partial roads' :
       '<span class="warn">roads dark</span>') + ' \u2014 pollen #' + pollinator.crossSites + '</span>'
    );
  }

  // ── Burst pollination: scatter ⌊π⌋ stories at once ──
  function pollinateBurst() {
    var count = Math.floor(PI); // 3 stories per burst
    for (var i = 0; i < count; i++) { pollinate(); }
    addEntry('chipmunk',
      '<span style="color:#f0e68c">\ud83c\udf3b POLLINATED</span> ' + count + ' seeds scattered through northgate.' +
      '\n<span class="dim">\u03c0\u00b2=' + pollinator.stories.length + ' stories cached. ' +
      pollinator.crossSites + ' cross-site broadcasts. saturation=' + n(pollinator.saturated, 2) + '</span>'
    );
  }

  // Wire pollinate into the pecking loop — every 3rd peck, push a story
  var _origProactiveStage = 0;

  // ═══ PUBLIC API ═══
  window.C = {
    cache: cache,
    learning: learning,
    thoughtLog: thoughtLog,
    act: act,
    sortVote: function(i,v) { return _mind('sortVote', i, v); },
    sendNote: sendNote,
    closePanel: closePanel,
    closeSortDeck: function() { return _mind('closeSortDeck'); },
  };

  // ═══ BOOT ═══
  vis = window._chipmunkVis;
  if (vis) {
    vis.init({
      cache: cache, n: n, addEntry: addEntry, bumpAttention: bumpAttention,
      escapeHtml: escapeHtml, MG: MG, NS: NS, PI: PI,
      BODIES: BODIES, CONTINENTS: CONTINENTS, SORT_COLORS: SORT_COLORS,
      EPITOPE_DEPTH: EPITOPE_DEPTH, PLANETS: PLANETS, isOverlay: isOverlay,
    });
    vis.buildMembrane();
    var _visRefs = vis.refs();
    svgEl = _visRefs.svgEl;
    bubbleGroup = _visRefs.bubbleGroup;
    unfurlGroup = _visRefs.unfurlGroup;
    requestAnimationFrame(function(t) { vis.animate(t); });
  }

  fetchAll();

  // Wire metabolism autonomous actions now that turn/pollinate/etc are defined
  _metab.setActions({
    pollinate: pollinate,
    turn: turn,
    explore: function(view) {
      if (window._chipmunkMind && window._chipmunkMind.showExplore) window._chipmunkMind.showExplore(view);
    },
    scan: function() {
      if (window._chipmunkMind && window._chipmunkMind.showScan) window._chipmunkMind.showScan();
    },
  });

  // _piBus handles chipmunk/braid at medium rate (π³ ≈ 31s)
  setInterval(proactiveCheck, 12000);

  setTimeout(function() {
    var c = cache.chipmunk;
    var h = cache.human;
    var pw0 = metabolism.piWake || 0;
    addEntry('chipmunk',
      'wake <span class="num">' + (c ? n(c.wake_level, 2) : '\u2014') + '</span>  ' +
      METAB_ICONS[metabolism.state] + ' <span style="color:' + METAB_COLORS[metabolism.state] + '">' +
      (pw0 >= 0 ? '+' : '') + (pw0/PI).toFixed(2) + '\u03c0 ' + metabolism.state + '</span>  ' +
      '<span class="good">' + (h && h.energy ? n(h.energy.total_sessions) : '\u2014') + ' humans</span>\n' +
      'equilibrium at 1/\u03c0. the spring holds. just a touch aware.\n' +
      '<span style="color:#7ee787">/play</span> \u00b7 <span style="color:#f0e68c">/explore</span> \u00b7 <span style="color:#f78166">/sing</span> \u00b7 <span style="color:#f0883e">/rest</span> \u00b7 <span style="color:#6e7681">/sleep</span> \u00b7 <span style="color:#3fb950">/wake</span>\n' +
      '<a href="https://tuebor.primals.eco" style="color:#e85d3a">\u2694 tuebor \u2014 I will defend</a> \u00b7 341 entities \u00b7 the gates are open'
    );
    updateAttn();
    if (vis) vis.weaveBraids();
    _mind('renderAwareness');
  }, 2000);

  // ═══ CORE EXPORT — bridge from talk.js IIFE to gaze.js + mind.js ═══
  // State: mutable objects shared across all chipmunk modules
  // Constants: immutable PI geometry + sort schema
  // Helpers: DOM, formatting, attention
  // Vis: delegates to chipmunk-vis.js (loaded inline before this)
  // Walk: graph traversal, orbit tracing
  window._chipmunkCore = {
    // ── state ──
    cache: cache, learning: learning, curiosity: curiosity,
    thoughts: thoughts, sortQueue: sortQueue, thoughtLog: thoughtLog,
    sessionId: sessionId,
    // ── constants ──
    PI: PI, MG: MG, SORT_COLORS: SORT_COLORS,
    GAZE_NAMES: GAZE_NAMES, W_QUESTIONS: W_QUESTIONS, MAX_THOUGHTS: MAX_THOUGHTS,
    // ── helpers ──
    el: el, n: n, bodyRadius: bodyRadius, escapeHtml: escapeHtml,
    addEntry: addEntry, bumpAttention: bumpAttention, trackTopic: trackTopic,
    act: act, showPanel: showPanel, checkPhase: checkPhase,
    wake: wake, wakeI1: wakeI1, turn: turn, jiggle: jiggle, triage: triage, sing: sing,
    // ── vis (forwarded from chipmunk-vis.js) ──
    svgEl: svgEl, bubbleGroup: bubbleGroup, unfurlGroup: unfurlGroup,
    paintAttention: function() { return vis && vis.paintAttention(); },
    reverseView: function() { return vis && vis.reverseView(); },
    updateUnfurl: function(d) { return vis && vis.updateUnfurl(d); },
    // ── northgate ──
    pollinator: pollinator, distill: distill, pollinate: pollinate, pollinateBurst: pollinateBurst, POLLEN: POLLEN,
    NULL_PI: NULL_PI,
    // ── walk ──
    graphWalk: graphWalk, traceOrbit: traceOrbit,
    // ── metabolism ──
    metabolism: metabolism, spendEnergy: spendEnergy, recoverEnergy: recoverEnergy,
    piWakeOf: piWakeOf, PI_INV: PI_INV, cycleMemory: _cycleMemory,
    _metab: _metab,
    // ── explorer ──
    explorer: window._chipmunkExplorer || null,
  };

  // Lazy-load mind module when overlay opens
  var _mindLoaded = false;
  var _origToggle = document.getElementById('chipmunk-toggle');
  if (_origToggle) {
    var _origClick = _origToggle.onclick;
    _origToggle.onclick = function() {
      if (!_mindLoaded) {
        _mindLoaded = true;
        var s1 = document.createElement('script');
        s1.src = '/js/chipmunk-gaze.js?v=27';
        s1.onload = function() {
          var s2 = document.createElement('script');
          s2.src = '/js/chipmunk-pressure.js?v=27';
          s2.onload = function() {
            var s3 = document.createElement('script');
            s3.src = '/js/chipmunk-thought.js?v=1';
            s3.onload = function() {
              var s4 = document.createElement('script');
              s4.src = '/js/chipmunk-learn.js?v=1';
              s4.onload = function() {
                var s5x = document.createElement('script');
                s5x.src = '/js/chipmunk-mind-explore.js?v=1';
                s5x.onload = function() {
                  var s5 = document.createElement('script');
                  s5.src = '/js/chipmunk-mind.js?v=42';
                  document.head.appendChild(s5);
                };
                document.head.appendChild(s5x);
              };
              document.head.appendChild(s4);
            };
            document.head.appendChild(s3);
          };
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      }
      if (_origClick) _origClick.call(this);
    };
  }


})();