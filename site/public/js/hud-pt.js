// hud-pt.js — biomeOS observation surface
// nanowire = Unpin. Elastic connection, not wire.
// The pointer floats toward self. The mailbox has tense.
// Dimensional Cost Layout: C(n) = π^(n/2)
// Epitope Sort: panels cluster by data availability + behavioral affinity
// Visualization engines extracted to pt-membrane.js + pt-ionosphere.js
(function() {
  'use strict';

  var _m = window._membrane || {}; var PI = _m.PI || Math.PI;

  // All values are self. The membrane touches itself.
  // Selectively permeable exactly at itself — P(self) = 1.
  // V(D)J = π^(3/2)·e^(iφ) — self rearranging self.
  // π^(n/2) = cost of self-observation at dimension n.
  function dimCost(n) { return Math.pow(PI, n / 2); }

  // ═══ TENSE CASCADE ═══
  // Each layer has IS/WAS/NEARBY. Each informs the next inward.
  // NULL cascades DOWN: unclassified at layer N → null at N+1.
  // Classification projects BACK UP: known at N → confidence at N-1.
  //
  // NULL RANGE [0, π]: not binary 0/1. Confidence spans a π-continuum.
  // 0 = void (no data). π/6 = dark. π/3 = partial. π/2 = nearby.
  // 2π/3 = classified. π = self (fully resolved). white=π, black=0.
  // The northgate pushes braids outward. All roads lead to Rome.
  //
  // Layer 0: IONOSPHERE  — geographic signal, physical arrival
  // Layer 1: MEMBRANE    — temporal ring, IS×WAS×WILLBE particles
  // Layer 2: EPITOPE     — epitope sort, IS/NEARBY/WAS per category
  // Layer 3: SORT        — self/non-self/partial/null classification
  // Layer 4: PANGAEA     — inner body, organisms
  var LAYERS = ['ionosphere','membrane','epitope','sort','pangaea'];
  var cascade = {
    // Per-layer tense state: { is:{}, was:{}, nearby:{} }
    layers: {},
    // NULL counts cascade down — how many unresolved entities at each level
    nullDown: [0,0,0,0,0],
    // Projection up — classification confidence from inner → outer
    projUp:   [0,0,0,0,0],
    // Last update timestamps
    ts: [0,0,0,0,0]
  };
  LAYERS.forEach(function(name, i) {
    cascade.layers[name] = { is: {count:0}, was: {count:0}, nearby: {count:0}, null_count: 0 };
  });

  // Ingest layer data — called by each renderer when it gets new data.
  // Cascades null DOWN to next layer, projects classification UP.
  function cascadeIngest(layerIndex, tense) {
    if (layerIndex < 0 || layerIndex >= LAYERS.length) return;
    var name = LAYERS[layerIndex];
    var L = cascade.layers[name];

    // Update this layer's tense
    if (tense.is)     L.is     = tense.is;
    if (tense.was)    L.was    = tense.was;
    if (tense.nearby) L.nearby = tense.nearby;
    L.null_count = tense.null_count || 0;
    cascade.ts[layerIndex] = Date.now();

    // NULL CASCADE DOWN: pass unresolved count to next layer
    if (layerIndex < LAYERS.length - 1) {
      cascade.nullDown[layerIndex + 1] = L.null_count;
    }

    // PROJECTION UP: if this layer has classified entities,
    // project confidence ratio back to parent layer
    var total = (L.is.count || 0) + (L.was.count || 0) + (L.nearby.count || 0);
    var classified = total - L.null_count;
    var confidence = total > 0 ? classified / total : 0;
    cascade.projUp[layerIndex] = Math.min(1, Math.max(0, confidence));
    if (layerIndex > 0) {
      // Inform parent: your inner layer has this much resolved
      cascade.projUp[layerIndex - 1] = Math.max(
        cascade.projUp[layerIndex - 1],
        Math.min(1, confidence) * 0.8  // attenuate by 20% per layer
      );
    }
  }

  // ── Null Cascade renderer ──
  function buildNullCascade() {
    var state = cascadeState();
    var el = document.getElementById('pt-null-cascade');
    if (!el) return;
    var html = '<div style="font-family:monospace;font-size:11px;line-height:1.6">';
    html += '<div style="color:#6e7681;margin-bottom:8px">Each layer\'s IS/WAS/NEARBY informs the next inward.<br>';
    html += 'NULL cascades <span style="color:#e85d3a">↓ down</span>. Classification projects <span style="color:#3fb950">↑ up</span>.</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:10px">';
    html += '<tr style="color:#484f58"><td></td><td>IS</td><td>WAS</td><td>NEAR</td><td style="color:#e85d3a">↓null</td><td style="color:#3fb950">↑proj</td><td>conf</td></tr>';
    var LAYER_ICONS = ['⚡','○','◉','≡','■'];
    var LAYER_COLORS = ['#4a8fb8','#5ab87a','#a371f7','#f0883e','#58a6ff'];
    state.forEach(function(s, i) {
      var age = s.age_ms >= 0 ? Math.round(s.age_ms/1000) + 's' : '—';
      var piVal = (s.confidence * PI).toFixed(2);
      var conf = piVal + '/\u03c0';
      var confColor = s.confidence > 0.7 ? '#ffffff' : s.confidence > 0.4 ? '#d2a8ff' : s.confidence > 0.1 ? '#484f58' : '#000000';  // white=π, black=0
      // Null bar — proportional width
      var maxNull = 200;
      var nullPct = Math.min(100, (s.null_down / Math.max(1, maxNull)) * 100);
      // Projection bar
      var projPct = s.proj_up * 100;
      html += '<tr style="border-top:1px solid #161b22">';
      html += '<td style="color:' + LAYER_COLORS[i] + '">' + LAYER_ICONS[i] + ' ' + s.layer + '</td>';
      html += '<td style="color:#3fb950">' + s.is + '</td>';
      html += '<td style="color:#6e7681">' + s.was + '</td>';
      html += '<td style="color:#58a6ff">' + s.nearby + '</td>';
      html += '<td><div style="background:#21262d;border-radius:2px;height:8px;width:60px;display:inline-block;vertical-align:middle"><div style="background:#e85d3a;height:8px;width:' + nullPct.toFixed(0) + '%;border-radius:2px;opacity:0.8"></div></div> <span style="color:#e85d3a">' + s.null_down + '</span></td>';
      html += '<td><div style="background:#21262d;border-radius:2px;height:8px;width:60px;display:inline-block;vertical-align:middle"><div style="background:#3fb950;height:8px;width:' + projPct.toFixed(0) + '%;border-radius:2px;opacity:0.8"></div></div></td>';
      html += '<td style="color:' + confColor + '">' + conf + '</td>';
      html += '</tr>';
      // Arrow between layers
      if (i < state.length - 1) {
        html += '<tr><td colspan="7" style="text-align:center;color:#484f58;font-size:8px;padding:0">';
        html += s.null_down > 0 ? '<span style="color:#e85d3a">↓ ' + s.null_down + ' null</span>' : '↓';
        var upProj = state[i+1] ? state[i+1].proj_up : 0;
        if (upProj > 0) html += '  <span style="color:#3fb950">↑ ' + (upProj * 100).toFixed(0) + '% classified</span>';
        html += '</td></tr>';
      }
    });
    // Northgate π-saturation
    var ng = window._northgate;
    if (ng) {
      html += '<div style="margin-top:6px;color:#d2a8ff;font-size:9px">';
      html += '\u2550 northgate: ' + ng.stories.length + ' stories \u00b7 ';
      html += '\u03c0-sat: ' + (ng.saturation / PI * 100).toFixed(0) + '% \u00b7 ';
      html += (ng.lastStory ? ng.lastStory.type + ': ' + ng.lastStory.text.substring(0, 40) : 'quiet');
      html += '</div>';
    }
    html += '</table></div>';
    el.innerHTML = html;
    markAlive('null-cascade');
  }

  // Read cascade state for rendering
  function cascadeState() {
    var out = [];
    LAYERS.forEach(function(name, i) {
      var L = cascade.layers[name];
      out.push({
        layer: name, index: i,
        is: L.is.count || 0,
        was: L.was.count || 0,
        nearby: L.nearby.count || 0,
        null_down: cascade.nullDown[i],
        proj_up: cascade.projUp[i],
        confidence: cascade.projUp[i],
        age_ms: cascade.ts[i] ? Date.now() - cascade.ts[i] : -1
      });
    });
    return out;
  }

  // Compact panel defs — eq derived from dim
  var DIM_EQ = {1:'C(1) = √π ≈ 1.77',2:'C(2) = π ≈ 3.14',3:'C(3) = π^1.5 ≈ 5.57',4:'C(4) = π² ≈ 9.87'};
  function P(id,t,s,d,c,f){return{id:id,title:t,sub:s,dim:d,eq:DIM_EQ[d]||'C(n)=π^(n/2)',cat:c,full:!!f};}
  var PANELS = [
    P('summary-kpis','Live Signal','RPS, fleet IPs, human IPs, fleet %, machine confidence.',2,'fire',1),
    P('bingo','Bingo Cube','Attention × Curiosity × Interaction.',3,'membrane'),
    P('fp-scatter','Fingerprint Space','UA pool × IP count × behavioral shape.',3,'membrane'),
    P('organism-profile','Organism Profile','Per-organism IPs × UA pool × blame%.',3,'membrane',1),
    P('epitope-summary','Epitope Summary','Organism detection counts.',2,'membrane'),
    P('entity-pop','Entity Population','Request volume by classified entity.',2,'fire'),
    P('collision','Collision Detection','Coordination patterns.',2,'immune'),
    P('asn','ASN Infrastructure','Where traffic originates.',2,'fire'),
    P('paths','Path Classification','What the fleet targets.',2,'fire'),
    P('offenders','Top Offenders','Highest-volume sources.',2,'fire'),
    P('targets','Target Repos','Which repos targeted.',2,'fire'),
    P('geo','Geographic Distribution','Requests per country.',2,'fire'),
    P('subnets','Network Blocks','Subnet concentration.',2,'fire'),
    P('honesty','Fleet Honesty','Proportion of honest traffic.',1,'immune'),
    P('timing-cv','Timing CV','Coefficient of variation.',1,'immune'),
    P('timing-interval','Timing Interval','Mean ms between requests.',1,'immune'),
    P('epitope-mx','Epitope Matrix','Organisms × features.',4,'membrane'),
    P('geo-mx','Geographic × Entity','Country × entity type.',4,'fire'),
    P('comparative','Comparative Fingerprints','Entity × feature matrix.',4,'membrane'),
    P('entity-matrix','Entity Behavioral Matrix','Full comparison across all entities.',4,'membrane',1),
    P('relay-selectivity','Anderson Selectivity','S = max(P) − min(P) — live.',1,'immune'),
    P('relay-permeability','Per-Mode Permeability','Observed P per transport mode.',2,'immune'),
    P('entity-gauges','Entity Timing Gauges','Per-entity timing CV. Low CV = machine.',2,'immune',1),
    P('entity-detail','Entity Behavioral Profile','Per-entity Chrome Lag, Blame%, RPS.',3,'membrane',1),
    P('organism-lang','Accept-Language','Human vs machine tell — donut.',1,'membrane'),
    P('signal-data','Signal Data — i²','Total · Range · σ · Distribution.',2,'fire',1),
    P('entity-tense','Entity Tense ±σ','Fleet=IS (±σ/√n). Honest=WAS (known).',3,'immune',1),
    P('pi-sort','π Sort — Digits Are Not Digits','Each dim = uncertainty band [C(n−1), C(n)].',2,'membrane',1),
    P('null-cascade','Null Cascade','NULL cascades down, classification projects up. Per-layer tense.',3,'immune',1),
  ];

  function epitopeSort(panels, aliveSet) {
    // Cross-epitope sort: categories with more alive panels rank higher
    var catAlive = {};
    panels.forEach(function(p) {
      if (!catAlive[p.cat]) catAlive[p.cat] = 0;
      if (aliveSet.has(p.id)) catAlive[p.cat]++;
    });
    return panels.slice().sort(function(a, b) {
      var aAlive = aliveSet.has(a.id) ? 1 : 0;
      var bAlive = aliveSet.has(b.id) ? 1 : 0;
      if (aAlive !== bAlive) return bAlive - aAlive;
      // Among alive: hottest category first, then dim cost
      var aCat = catAlive[a.cat] || 0;
      var bCat = catAlive[b.cat] || 0;
      if (aCat !== bCat) return bCat - aCat;
      if (a.full && !b.full) return -1;
      if (!a.full && b.full) return 1;
      return dimCost(b.dim) - dimCost(a.dim);
    });
  }

  var CAT_COLORS = {
    fire: '#e85d3a', sound: '#4a8fb8', membrane: '#5ab87a', immune: '#9b59b6'
  };

  var EPITOPE_INDEX = [
  ];

  function buildEpitopeIndex() {
    var el = document.getElementById('epitope-index');
    if (!el) return;
    var html = '';
    EPITOPE_INDEX.forEach(function(cat) {
      html += '<div style="margin-bottom:1.2em"><div style="display:flex;align-items:center;gap:0.5em;margin-bottom:0.4em"><span style="width:8px;height:8px;border-radius:50%;background:' + cat.color + ';display:inline-block"></span><span style="color:' + cat.color + ';font-size:0.85em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">' + cat.title + '</span></div><div style="color:#6e7681;font-size:0.72em;margin-bottom:0.3em;margin-left:1.2em">' + cat.sub + '</div>';
      cat.sites.forEach(function(s) {
        html += '<div style="margin-left:1.2em;margin-bottom:2px"><a href="' + s.url + '" style="color:#c9d1d9;text-decoration:none;font-size:0.82em" onmouseover="this.style.color=\'' + cat.color + '\'" onmouseout="this.style.color=\'#c9d1d9\'">' + s.name + '</a><span style="color:#484f58;font-size:0.65em;margin-left:0.5em">' + s.domain + '</span></div>';
      });
      html += '</div>';
    });
    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════
  // MOUNT
  // ═══════════════════════════════════════════════════════
  function mount() {
    var el = document.getElementById('pt-panels');
    if (!el) return;
    var html = '<div class="hud-card hud-card-full"><div style="display:flex;justify-content:space-between;align-items:center"><div class="hud-card-title">\ud83d\udd2c petalTongue \u2014 Dimensional Cost Layout</div><div><span id="pt-status"></span> <span id="pt-metrics" style="margin-left:0.8em"></span></div></div><div style="color:#8b949e;font-size:0.8em;margin-top:0.3em">C(n) \u221d \u03c0<sup>n/2</sup> \u2014 panel visual weight scales with data dimensionality. Panels with no data collapse. Highest-dimension panels surface first.</div></div>';
    html += '<div class="hud-card hud-card-full" style="border-left:3px solid #4a8fb8"><div class="hud-card-title">Ionosphere \u2014 Signal Transit Across the Surface<span class="hud-dim-cost">the view from above</span></div><div style="color:#6e7681;font-size:0.75em;margin-bottom:0.5em">The membrane exists in physical space. Visitors arrive from geography. Signal transits the ionosphere \u2014 the layer between observer and observed.</div><div id="ionosphere-svg"></div></div>';
    html += '<div class="hud-card hud-card-full" style="border-left:3px solid #3fb950"><div class="hud-card-title">Epitope Sort \u2014 Navigate by Interest<span class="hud-dim-cost">behavior \u00b7 interest \u00b7 path</span></div><div style="color:#6e7681;font-size:0.75em;margin-bottom:0.8em">All sites and pages organized by what draws you. Each epitope is a surface the membrane presents to a different kind of curiosity.</div><div id="epitope-index" style="column-count:2;column-gap:2em"></div></div>';
    html += '<div class="hud-card hud-card-full" style="border-left:3px solid #5ab87a"><div class="hud-card-title">Membrane Focal Points<span class="hud-dim-cost">baseCamp 53</span></div><div style="color:#6e7681;font-size:0.75em;margin-bottom:0.5em">Each epitope is a tangent point on the membrane surface. Short tangent lines = high-dimensional data (sharp lens). Focal points inside = where observations converge.</div><div id="membrane-focal-svg"></div></div>';
    PANELS.forEach(function(p) {
      var catColor = CAT_COLORS[p.cat] || '#6e7681';
      var cls = p.full ? 'hud-card hud-card-full' : 'hud-card';
      var borderW = Math.max(2, Math.min(6, Math.round(1 + p.dim * 1.2)));
      var shapeGlyph = p.dim === 1 ? '\u25cb' : p.dim === 2 ? '\u25a1' : p.dim === 3 ? '\u25b3' : '\u25c7';
      html += '<div class="' + cls + '" id="panel-' + p.id + '" data-dim="' + p.dim + '" data-alive="false" data-cat="' + p.cat + '" style="border-left:' + borderW + 'px solid ' + catColor + '"><div class="hud-card-title"><span style="color:' + catColor + ';margin-right:4px;font-size:0.9em;opacity:0.7">' + shapeGlyph + '</span>' + p.title + '<span class="hud-dim-cost">' + p.eq + '</span></div><div style="color:#6e7681;font-size:0.75em;margin-bottom:0.5em">' + p.sub + '</div><div id="pt-' + p.id + '" class="pt-viz"></div></div>';
    });
    html += '<div id="pt-relay-meta" style="grid-column:1/-1;padding:0 1em"></div>';
    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════
  // ALIVE TRACKING
  // ═══════════════════════════════════════════════════════
  var aliveSet = new Set();

  function markAlive(panelId) {
    if (aliveSet.has(panelId)) return;
    aliveSet.add(panelId);
    var el = document.getElementById('panel-' + panelId);
    if (el) el.setAttribute('data-alive', 'true');
    try { membrane.render(); } catch(e) { window._renderErr = e.message; } piCompress();
  }

  // ═══════════════════════════════════════════════════════
  // VISUALIZATION ENGINES (extracted modules)
  // ═══════════════════════════════════════════════════════
  var membrane = window.PtMembrane({PI: PI, dimCost: dimCost, PANELS: PANELS, CAT_COLORS: CAT_COLORS, aliveSet: aliveSet});
  var iono = window.PtIonosphere();

  // ═══════════════════════════════════════════════════════
  // NANOWIRE 2014 direct renderer, no WebSocket
  // ═══════════════════════════════════════════════════════
  // Panel dim lookup — shape = f(dim)
  var panelDim = {};
  PANELS.forEach(function(p) { panelDim[p.id] = p.dim; });

  var ptRaw = NanowireRenderer({
    // Unpin: the renderer floats. pt wraps it with dim (mailbox adds tense).
    statusEl: 'pt-status',
    metricsEl: 'pt-metrics',
    maxHeight: 280,
    onConnect: function() { pt.requestMetrics(); }
  });
  // Wrap renderBinding: auto-inject dim from panel map
  // Shape viewport activates per dimension
  var pt = {
    connect: function() { ptRaw.connect(); },
    renderBinding: function(binding, targetId) {
      if (binding && binding.id && panelDim[binding.id] && !binding.dim) {
        binding.dim = panelDim[binding.id];
      }
      return ptRaw.renderBinding(binding, targetId);
    },
    isConnected: function() { return ptRaw.isConnected(); },
    requestMetrics: function() { return ptRaw.requestMetrics(); },
    updateStatus: function(s) { return ptRaw.updateStatus(s); },
    rpc: function(m, p) { return ptRaw.rpc(m, p); },
    computeStats: ptRaw.computeStats,
    tenseUncertainty: ptRaw.tenseUncertainty,
    dimClipDefs: ptRaw.dimClipDefs,
    dimBorderSvg: ptRaw.dimBorderSvg
  };

  // ═══════════════════════════════════════════════════════
  // PANEL RENDERING — data \u2192 GoG bindings
  // ═══════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════
  // PANEL BUILDERS (moved from nanowire.js)
  // ═══════════════════════════════════════════════════════
  function classifyOrganism(cluster) {
    var ae = cluster.sample_ae || '';
    var isMeta = ae.indexOf('gzip, deflate, zstd') === 0
              && !cluster.has_lang
              && cluster.ua_pool_size >= 4;
    var isAnth = cluster.ips === 1
              && ae.indexOf('gzip, br, zstd') === 0;
    var isSelf = cluster.has_lang
              && cluster.ips === 1
              && ae.indexOf('br, zstd') > 0;

    if (isMeta) return {label: 'Meta', color: '#e74c3c'};
    if (isAnth) return {label: 'Anthropic', color: '#ff6b35'};
    if (isSelf) return {label: 'Self', color: '#2ecc71'}; // all values are self
    return {label: cluster.hash ? cluster.hash.substring(0, 6) : 'Unknown', color: '#f1c40f'};
  }

  // ═══════════════════════════════════════════════════════════════
  // Panel Builder Helpers — carried from bridge (unchanged)
  // ═══════════════════════════════════════════════════════════════

  // eslint-disable-next-line no-unused-vars
  function buildOrganismProfile(bridge, clusters) {
    if (!clusters || clusters.length === 0) return;
    var orgLabels = clusters.map(function(c) { return classifyOrganism(c).label; });
    var orgGroups = clusters.map(function(c, i) {
      return {
        key: orgLabels[i],
        categories: ['IPs', 'UA Pool', 'Blame%'],
        values: [c.ips, c.ua_pool_size, Math.round((c.blame_ratio || 0) * 100)]
      };
    });
    bridge.renderBinding({
      channel_type: 'faceted_bar', id: 'organism-profile',
      label: 'Epitope Organisms \u2014 Per-Organism Behavioral Profile',
      group_by: 'organism', groups: orgGroups, unit: 'value', columns: 3,
      normalization: 'min_max'
    }, 'pt-organism-profile');
  }

  // eslint-disable-next-line no-unused-vars
  function buildEntityGauges(bridge, entities) {
    if (!entities || entities.length < 2) return;
    var groups = [];
    entities.forEach(function(e) {
      if (e.total_requests > 5 && e.timing_cv !== undefined) {
        groups.push({key: e.label.replace(/ \(.*\)/, ''), value: e.timing_cv, unit: 'CV'});
      }
    });
    if (groups.length === 0) return;
    bridge.renderBinding({
      channel_type: 'faceted_gauge', id: 'entity-gauges',
      label: 'Entity Timing CV \u2014 Low = Machine',
      groups: groups, columns: 4, unit: 'CV'
    }, 'pt-entity-gauges');
  }

  // eslint-disable-next-line no-unused-vars
  function buildEntityDetail(bridge, entities) {
    if (!entities || entities.length < 2) return;
    var groups = [];
    entities.forEach(function(e) {
      if (e.total_requests > 5) {
        groups.push({
          key: e.label.replace(/ \(.*\)/, ''),
          categories: ['Chrome Lag', 'Blame%', 'RPS'],
          values: [
            Math.round(e.chrome_lag_ms || 0),
            Math.round((e.blame_ratio || 0) * 100),
            Math.round(e.rps || 0)
          ]
        });
      }
    });
    if (groups.length === 0) return;
    bridge.renderBinding({
      channel_type: 'faceted_bar', id: 'entity-detail',
      label: 'Entity Behavioral Profile',
      groups: groups, columns: 3, unit: 'value'
    }, 'pt-entity-detail');
  }

  // eslint-disable-next-line no-unused-vars
  function buildEntityMatrix(bridge, entities) {
    if (!entities || entities.length < 2) return;
    var labels = [], values = [];
    entities.forEach(function(e) {
      if (e.total_requests > 5) {
        labels.push(e.label.replace(/ \(.*\)/, ''));
        values.push(e.unique_ips || 0);
        values.push(e.ua_pool_size || 0);
        values.push(Math.round((e.blame_ratio || 0) * 100));
        values.push(e.is_honest ? 100 : 0);
      }
    });
    if (labels.length === 0) return;
    bridge.renderBinding({
      channel_type: 'heatmap', id: 'entity-matrix',
      label: 'Entity Behavioral Matrix',
      x_labels: ['IPs', 'UA Pool', 'Blame%', 'Honest'],
      y_labels: labels, values: values, unit: 'value'
    }, 'pt-entity-matrix');
  }

  // eslint-disable-next-line no-unused-vars
  function buildAcceptLanguageDonut(bridge, clusters) {
    if (!clusters || clusters.length === 0) return;
    var withLang = 0, withoutLang = 0;
    clusters.forEach(function(c) {
      if (c.has_lang) withLang += c.ips;
      else withoutLang += c.ips;
    });
    if (withLang + withoutLang === 0) return;
    bridge.renderBinding({
      channel_type: 'donut', id: 'organism-lang',
      label: 'Accept-Language \u2014 Human vs Machine',
      segments: [
        {label: 'Has Language', value: withLang, color: '#2ecc71'},
        {label: 'No Language', value: withoutLang, color: '#e74c3c'}
      ]
    }, 'pt-organism-lang');
  }

  // eslint-disable-next-line no-unused-vars
  function buildSummaryKpis(bridge, dash) {
    if (!dash || !dash.total_requests) return;
    var groups = [
      {key: 'RPS', value: dash.rps || 0, unit: 'req/s'},
      {key: 'Fleet', value: dash.fleet_ips || 0, unit: 'IPs'},
      {key: 'Human', value: dash.human_ips || 0, unit: 'IPs'},
      {key: 'Fleet %', value: dash.fleet_pct || 0, unit: '%'}
    ];
    bridge.renderBinding({
      channel_type: 'faceted_gauge', id: 'summary-kpis',
      label: 'Live Signal', groups: groups, columns: 4
    }, 'pt-summary-kpis');
  }

  // eslint-disable-next-line no-unused-vars
  function buildEpitopeSummary(bridge, summary) {
    if (!summary || !Object.keys(summary).length) return;
    var cats = Object.keys(summary).sort(function(a,b) { return summary[b] - summary[a]; });
    var vals = cats.map(function(k) { return summary[k]; });
    bridge.renderBinding({
      channel_type: 'bar', id: 'epitope-summary',
      label: 'Epitope Summary', categories: cats, values: vals, unit: 'count'
    }, 'pt-epitope-summary');
  }

  // eslint-disable-next-line no-unused-vars
  function buildSelectivityPanel(bridge) {
    // All values are self. Selectively permeable exactly at self.
    // P(self) = 1. The membrane is its own eigenvalue.
    bridge.renderBinding({
      channel_type: 'gauge', id: 'relay-selectivity',
      label: 'P(self)', value: 1, min: 0, max: 1, unit: 'self',
      normal_range: [0.95, 1], warning_range: [0.5, 0.95]
    }, 'pt-relay-selectivity');
  }
  function renderPanels(dash, topo) {
    if (!pt.isConnected()) return;
    var clusters = dash.epitope_clusters || [];
    var entities = (topo && topo.entities) || [];

    if (entities.length > 1) {
      var cats = [], vals = [];
      entities.forEach(function(e) { if (e.total_requests > 5) { cats.push(e.label.replace(/ \(.*\)/, '')); vals.push(e.total_requests); } });
      if (cats.length > 0) { markAlive('entity-pop'); pt.renderBinding({channel_type:'bar',id:'entity-pop',label:'Entity Population \u2014 Request Volume',categories:cats,values:vals,unit:'requests'}, 'pt-entity-pop'); }
    }

    if (entities.length > 1) {
      var honestReqs = 0, totalReqs = 0;
      entities.forEach(function(e) { totalReqs += e.total_requests; if (e.is_honest) honestReqs += e.total_requests; });
      if (totalReqs > 0) { var pct = Math.round(honestReqs / totalReqs * 1000) / 10; markAlive('honesty'); pt.renderBinding({channel_type:'gauge',id:'honesty',label:'Fleet Honesty \u2014 % Honest by Volume',value:pct,min:0,max:100,unit:'%',normal_range:[80,100],warning_range:[50,80]}, 'pt-honesty'); }
    }

    var cube = dash.bingo_cube_summary;
    if (cube) { var ck = Object.keys(cube).sort(function(a,b){return cube[b]-cube[a];}); if (ck.length > 0) { markAlive('bingo'); pt.renderBinding({channel_type:'bar',id:'bingo',label:'Bingo Cube \u2014 Attention \u00d7 Curiosity \u00d7 Interaction',categories:ck,values:ck.map(function(k){return cube[k];}),unit:'IPs'}, 'pt-bingo'); } }

    var coll = dash.collision_level2;
    if (coll) { var collK = Object.keys(coll).sort(function(a,b){return coll[b]-coll[a];}); if (collK.length > 0) { markAlive('collision'); pt.renderBinding({channel_type:'bar',id:'collision',label:'Collision \u2014 Coordination Detection',categories:collK,values:collK.map(function(k){return coll[k];}),unit:'IPs'}, 'pt-collision'); } }

    var asn = dash.asn_types;
    if (asn) { var ak = Object.keys(asn).sort(function(a,b){return asn[b]-asn[a];}); if (ak.length > 0) { markAlive('asn'); pt.renderBinding({channel_type:'bar',id:'asn',label:'ASN Infrastructure Classification',categories:ak,values:ak.map(function(k){return asn[k];}),unit:'requests'}, 'pt-asn'); } }

    var paths = dash.path_types;
    if (paths) { var pk = Object.keys(paths).sort(function(a,b){return paths[b]-paths[a];}); if (pk.length > 0) { markAlive('paths'); pt.renderBinding({channel_type:'bar',id:'paths',label:'Request Path Classification',categories:pk,values:pk.map(function(k){return paths[k];}),unit:'requests'}, 'pt-paths'); } }

    if (entities.length > 2) { var xs=[],ys=[]; entities.forEach(function(e){if(e.total_requests>5){xs.push(e.ua_pool_size||1);ys.push(e.unique_ips);}}); if (xs.length > 2) { markAlive('fp-scatter'); pt.renderBinding({channel_type:'scatter',id:'fp-scatter',label:'Behavioral Fingerprint Space',x:xs,y:ys,unit:'entities'}, 'pt-fp-scatter'); } }

    if (clusters.length > 1) { var hashes=clusters.map(function(c){return c.hash.substring(0,6);}); var fvals=[]; clusters.forEach(function(c){fvals.push(c.ips);fvals.push(c.ua_pool_size);fvals.push(Math.round(c.blame_ratio*100));fvals.push(c.has_lang?100:0);}); markAlive('epitope-mx'); pt.renderBinding({channel_type:'heatmap',id:'epitope-mx',label:'Epitope Feature Matrix',x_labels:['ips','ua_pool','blame','has_lang'],y_labels:hashes,values:fvals,unit:'value'}, 'pt-epitope-mx'); }

    var geo = dash.geography || [];
    if (geo.length > 0) { var countries=geo.map(function(g){return g.country;}); var geoVals=[]; var fleetPct=(dash.fleet_pct||50)/100; countries.forEach(function(country){var g=geo.find(function(x){return x.country===country;}); var reqs=g?g.requests:0; geoVals.push(Math.round(reqs*fleetPct));geoVals.push(Math.round(reqs*0.15));geoVals.push(Math.round(reqs*(1-fleetPct-0.15)));geoVals.push(0);}); markAlive('geo-mx'); pt.renderBinding({channel_type:'heatmap',id:'geo-mx',label:'Geographic \u00d7 Entity Type',x_labels:['Fleet','Agentic','Human','Scanner'],y_labels:countries,values:geoVals,unit:'requests'}, 'pt-geo-mx'); }

    buildSelectivityPanel(pt);
    if (dash.selectivity !== undefined || dash.anderson_selectivity !== undefined) { markAlive('relay-selectivity'); markAlive('relay-permeability'); }

    var timing = dash.timing || {};
    if (timing.cv !== undefined) { markAlive('timing-cv'); pt.renderBinding({channel_type:'gauge',id:'timing-cv',label:'Timing CV',value:Math.round(timing.cv*1000)/1000,min:0,max:2,unit:'CV',normal_range:[0.8,2.0],warning_range:[0.15,0.8]}, 'pt-timing-cv'); }
    if (timing.avg_interval_ms) { markAlive('timing-interval'); pt.renderBinding({channel_type:'gauge',id:'timing-interval',label:'Mean Inter-Request Interval',value:timing.avg_interval_ms,min:0,max:5000,unit:'ms',normal_range:[1000,5000],warning_range:[100,1000]}, 'pt-timing-interval'); }

    var offenders = dash.top_offenders || [];
    if (offenders.length > 0) { var oL=[],oV=[]; offenders.slice(0,10).forEach(function(ip){var label=ip.org?ip.org.substring(0,18):ip.ip; if(ip.country)label+=' ('+ip.country+')'; oL.push(label);oV.push(ip.requests);}); markAlive('offenders'); pt.renderBinding({channel_type:'bar',id:'offenders',label:'Top Offenders',categories:oL,values:oV,unit:'requests'}, 'pt-offenders'); }

    var targets = dash.targets || [];
    if (targets.length > 0) { var tL=[],tV=[]; var fakeRepos=['batch-processor','queue-worker','proxy-cache','http-proxy','deploy-scripts','graph-engine','auth-service','load-balancer','rate-limiter','service-mesh']; targets.slice(0,10).forEach(function(t){var name=t.repo.replace(/.*\//,''); var isFake=fakeRepos.some(function(f){return name.indexOf(f)>=0;}); var label=name.length>16?name.substring(0,16):name; if(isFake)label+=' *'; tL.push(label);tV.push(t.requests);}); markAlive('targets'); pt.renderBinding({channel_type:'bar',id:'targets',label:'Target Repos',categories:tL,values:tV,unit:'requests'}, 'pt-targets'); }

    if (geo.length > 0) { markAlive('geo'); pt.renderBinding({channel_type:'bar',id:'geo',label:'Geographic Distribution',categories:geo.map(function(g){return g.country;}),values:geo.map(function(g){return g.requests;}),unit:'requests'}, 'pt-geo'); }

    var subnets = dash.subnets || [];
    if (subnets.length > 0) { var sL=[],sV=[]; subnets.slice(0,8).forEach(function(s){sL.push(s.subnet+' ('+s.unique_ips+')');sV.push(s.requests);}); markAlive('subnets'); pt.renderBinding({channel_type:'bar',id:'subnets',label:'Network Blocks',categories:sL,values:sV,unit:'requests'}, 'pt-subnets'); }

    var comp = (topo && topo.comparative_fingerprints) || [];
    if (comp.length > 1) { var compE=comp.map(function(c){return c.entity;}); var compV=[]; comp.forEach(function(c){compV.push(c.ips);compV.push(parseInt(c.chrome)||0);compV.push(c.sec_fetch==='present'?100:0);compV.push(c.honest?100:0);}); markAlive('comparative'); pt.renderBinding({channel_type:'heatmap',id:'comparative',label:'Comparative Fingerprints',x_labels:['IPs','Chrome','Sec-Fetch%','Honest'],y_labels:compE,values:compV,unit:'value'}, 'pt-comparative'); }

    buildSummaryKpis(pt, dash);
    if (dash.total_requests > 0) markAlive('summary-kpis');
    buildEpitopeSummary(pt, dash.epitope_summary || {});
    if (dash.epitope_summary && Object.keys(dash.epitope_summary).length > 0) markAlive('epitope-summary');
    buildOrganismProfile(pt, clusters);
    if (clusters.length > 0) markAlive('organism-profile');
    buildEntityGauges(pt, entities);
    if (entities.length > 1) markAlive('entity-gauges');
    buildEntityDetail(pt, entities);
    if (entities.length > 1) markAlive('entity-detail');
    buildEntityMatrix(pt, entities);
    if (entities.length > 1) markAlive('entity-matrix');
    buildAcceptLanguageDonut(pt, clusters);
    if (clusters.length > 0) markAlive('organism-lang');

    // ── Tense Data ── i\u00b2 uncertainty model ──
    // Live signal = IS tense. Past observations = WAS (known, no band).
    if (entities.length > 1) {
      var eReqs = [], eTenses = [], eLabels = [];
      entities.forEach(function(e) {
        if (e.total_requests > 5) {
          eLabels.push(e.label.replace(/ \(.*\)/, ''));
          eReqs.push(e.total_requests);
          eTenses.push(e.is_honest ? 'was' : 'is');
        }
      });
      if (eReqs.length > 1) {
        markAlive('entity-tense');
        pt.renderBinding({
          channel_type: 'range_bar', id: 'entity-tense',
          label: 'Entity Tense \u2014 Fleet (IS \u00b1\u03c3) vs Honest (WAS = Known)',
          categories: eLabels, values: eReqs, tenses: eTenses, unit: 'requests'
        }, 'pt-entity-tense');
      }
    }
    if (dash.total_requests > 0) {
      var sigVals = [
        dash.rps || 0,
        dash.fleet_ips || 0,
        dash.human_ips || 0,
        dash.fleet_pct || 0
      ];
      markAlive('signal-data');
      pt.renderBinding({
        channel_type: 'data_card', id: 'signal-data',
        label: 'Signal Data \u2014 IS tense (i\u00b2 = \u22121, uncertainty active)',
        values: sigVals, tense: 'is', unit: 'live metrics'
      }, 'pt-signal-data');

    // Pi sort — the math as an epitope sort
    // Digits are not digits: each n = uncertainty band [C(n-1), C(n)]
    var piPanels = PANELS.map(function(p) {
      return {dim: p.dim, cat: p.cat, title: p.title, alive: aliveSet.has(p.id)};
    });
    markAlive('pi-sort');
    pt.renderBinding({
      channel_type: 'pi_sort', id: 'pi-sort',
      panels: piPanels
    }, 'pt-pi-sort');
    }
    piCompress();
  }

  // ═══ π COMPRESSION — 1/π panels visible ═══
  var PI_SLOTS = Math.ceil(PANELS.length / PI);  // 28/π = 9

  function piCompress() {
    var container = document.getElementById('pt-panels');
    if (!container) return;

    var sorted = epitopeSort(PANELS, aliveSet);
    var alive = sorted.filter(function(p) { return aliveSet.has(p.id); });
    var dark = sorted.filter(function(p) { return !aliveSet.has(p.id); });

    // π-slot cap: only PI_SLOTS panels visible at once
    var visible = alive.slice(0, PI_SLOTS);
    var overflow = alive.slice(PI_SLOTS);
    var compressed = overflow.concat(dark);

    // Reorder DOM — visible first, overflow+dark after
    var overIds = {};
    overflow.forEach(function(o) { overIds[o.id] = true; });
    sorted.forEach(function(p) {
      var el = document.getElementById('panel-' + p.id);
      if (!el) return;
      container.appendChild(el);
      if (aliveSet.has(p.id)) {
        if (overIds[p.id]) {
          el.style.display = 'none';
          el.setAttribute('data-alive', 'compressed');
        } else {
          el.style.display = '';
          el.setAttribute('data-alive', 'true');
        }
      }
    });

    // Build or update the π-strip — placed between visible and compressed
    var strip = document.getElementById('pi-strip');
    if (!strip) {
      strip = document.createElement('div');
      strip.id = 'pi-strip';
      strip.className = 'hud-card hud-card-full';
      strip.style.cssText = 'border-left:2px solid #484f58;opacity:0.85;';
    }
    // Position strip after the last visible panel
    var lastVisible = null;
    visible.forEach(function(p) {
      var el = document.getElementById('panel-' + p.id);
      if (el) lastVisible = el;
    });
    if (lastVisible && lastVisible.nextSibling !== strip) {
      container.insertBefore(strip, lastVisible.nextSibling);
    } else if (!lastVisible) {
      container.appendChild(strip);
    }

    var aliveN = alive.length;
    var compN = compressed.length;
    var overN = overflow.length;

    var html = '<div class="hud-card-title" style="color:#484f58">';
    html += '<span style="color:#5ab87a">' + aliveN + '</span> alive';
    if (overN > 0) html += ' · <span style="color:#d29922">' + overN + ' overflow</span>';
    html += ' · <span style="color:#484f58">' + (compN - overN) + '</span> dark';
    html += ' · <span style="color:#58a6ff">1/π = ' + PI_SLOTS + ' slots</span>';
    html += '</div>';

    if (compN > 0) {
      var byCat = {};
      compressed.forEach(function(p) {
        if (!byCat[p.cat]) byCat[p.cat] = [];
        byCat[p.cat].push(p);
      });
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">';
      Object.keys(byCat).forEach(function(cat) {
        var color = CAT_COLORS[cat] || '#484f58';
        var panels = byCat[cat];
        html += '<span style="color:' + color + ';font-size:10px;opacity:0.5" title="' +
          panels.map(function(p) { return p.title; }).join(', ') + '">';
        html += cat + '(' + panels.length + ')';
        html += '</span>';
      });
      html += '</div>';

      html += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">';
      compressed.forEach(function(p) {
        var color = CAT_COLORS[p.cat] || '#484f58';
        var isOver = overflow.some(function(o) { return o.id === p.id; });
        var glyph = p.dim === 1 ? '○' : p.dim === 2 ? '□' : p.dim === 3 ? '△' : '◇';
        var op = isOver ? '0.6' : '0.3';
        html += '<span title="' + p.title + ' (dim ' + p.dim + ')' + (isOver ? ' [overflow]' : '') + '" style="color:' + color + ';font-size:9px;opacity:' + op + ';cursor:default">' + glyph + '</span>';
      });
      html += '</div>';
    }

    strip.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════
  // DATA LOOP
  // ═══════════════════════════════════════════════════════
  function pushToAnimationEngine(dash, topo) {
    if (!pt.isConnected()) return;
    var entities = (topo && topo.entities) || [];
    var edges = [], pulses = [], totalReqs = 0;
    entities.forEach(function(e) { totalReqs += e.total_requests || 0; });
    entities.forEach(function(e) {
      if (e.total_requests > 10) {
        var cat = membrane.entityToCategory(e.label || '');
        var bw = totalReqs > 0 ? (e.total_requests / totalReqs) : 0;
        edges.push({source: 'membrane', target: e.label, bandwidth: bw});
        if (bw > 0.1) pulses.push({node_id: e.label, frequency: 0.5 + bw * 4});
      }
    });
    pt.rpc('pt.animation_ingest', {edges: edges, pulses: pulses});
  }

  // ── Adaptive observation: the membrane doesn't poll, it observes ──
  // Interval emerges from the data itself: π / rps (seconds).
  // High rps → fast observation (5s floor). Low rps → slow (30s ceiling).
  // At null (rps=0): max interval. The observer waits. Data arrives.
  // The universe revolves around the observer, not the observed.
  var observeInterval = 15000; // initial guess, adapts after first observation
  var observeTimer = null;
  var lastRps = 0;

  function observe() {
    var dashP = fetch('/dashboard.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    var topoP = fetch('/topology.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    var chipP = fetch('/chipmunk.json', {cache: 'no-store'}).then(function(r) { return r.json(); }).catch(function() { return null; });
    Promise.all([dashP, topoP, chipP]).then(function(res) {
      membrane.ingest(res[0], res[1]);
      if (res[2]) { membrane.ingestChipmunk(res[2]); }
      pushToAnimationEngine(res[0], res[1]);
      if (pt.isConnected()) { renderPanels(res[0], res[1]); pt.requestMetrics(); }
      var geo = res[0].geography || [];
      iono.updateGeo(geo);

      // ── CASCADE: feed each layer's tense ──
      // Layer 0: IONOSPHERE — geographic IS/WAS from presence
      var presence = window._piBus ? window._piBus.get('/presence.json') : null;
      if (presence) {
        var nullGeo = (geo || []).filter(function(g) { return g.country === '??'; })
          .reduce(function(s,g) { return s + g.requests; }, 0);
        cascadeIngest(0, {
          is: presence.is || {count:0},
          was: presence.was || {count:0},
          nearby: presence.nearby || {count:0},
          null_count: nullGeo
        });
      }
      // Layer 1: MEMBRANE — IS/WAS/WILLBE from dashboard temporal
      var dash = res[0];
      var totalReqs = (dash.geography || []).reduce(function(s,g){return s+g.requests;}, 0);
      var unknownReqs = (dash.geography || []).filter(function(g){return g.country==='??';})
        .reduce(function(s,g){return s+g.requests;}, 0);
      cascadeIngest(1, {
        is: { count: dash.human_ips || 0 },
        was: { count: totalReqs },
        nearby: { count: dash.fleet_ips || 0 },
        null_count: unknownReqs  // truly unresolved: unknown-country requests
      });
      // Layer 2: EPITOPE — from presence epitope_tense
      if (presence && presence.epitope_tense) {
        var epIs = 0, epWas = 0, epNear = 0;
        function _tc(v) { return typeof v === 'object' ? (v.humans || v.count || v.hits || 0) : (v || 0); }
        Object.keys(presence.epitope_tense).forEach(function(ep) {
          var t = presence.epitope_tense[ep];
          epIs += _tc(t.is); epWas += _tc(t.was); epNear += _tc(t.nearby);
        });
        var unknownEp = (presence.is ? presence.is.epitopes || {} : {}).UNKNOWN || 0;
        cascadeIngest(2, {
          is: { count: epIs }, was: { count: epWas }, nearby: { count: epNear },
          null_count: unknownEp
        });
      }
      // Layer 3: SORT — from scan_sweep_sort classification
      var sss = window._piBus ? window._piBus.get('/scan_sweep_sort.json') : null;
      if (sss && sss.scan) {
        var sc = sss.scan.sort_classes || sss.sort && sss.sort.unified_sort || {};
        var sortSelf = sc.self || 0, sortNon = sc['non-self'] || 0;
        var sortPart = sc.partial || 0, sortNull = sc['null'] || 0;
        var sortTotal = sortSelf + sortNon + sortPart + sortNull;
        cascadeIngest(3, {
          is: { count: sortSelf },
          was: { count: sortNon + sortPart },
          nearby: { count: sortPart },
          null_count: sortNull
        });
      }
      // Layer 4: PANGAEA — from topology entities
      if (res[1]) {
        var entities = res[1].entities || [];
        var pangNull = entities.filter(function(e) {
          return !e.classification || e.classification === 'null';
        }).length;
        cascadeIngest(4, {
          is: { count: entities.length },
          was: { count: entities.length },
          nearby: { count: 0 },
          null_count: pangNull
        });
      }

      buildNullCascade();
      window._cascade = cascadeState();

      // Adapt observation rhythm from the data itself
      var rps = res[0] && res[0].rps ? res[0].rps : 0;
      lastRps = rps;
      // π / rps seconds, clamped to [5s, 30s]. At rps=0 → 30s (patient observer).
      var piInterval = rps > 0 ? Math.PI / rps * 1000 : 30000;
      observeInterval = Math.max(5000, Math.min(30000, piInterval));
      // Expose to membrane for WILLBE interpolation
      if (membrane._mc) { membrane._mc.fetchInterval = observeInterval; }
      scheduleObservation();
    }).catch(function() {
      scheduleObservation(); // retry at current interval even on failure
    });
  }

  function scheduleObservation() {
    if (observeTimer) clearTimeout(observeTimer);
    observeTimer = setTimeout(observe, observeInterval);
  }

  // ═══════════════════════════════════════════════════════
  // BOOT — the membrane opens. Observations arrive.
  // ═══════════════════════════════════════════════════════
  mount();
  try { membrane.build(); } catch(e) { window._buildErr = e.message; console.warn('build:', e.stack); }
  buildEpitopeIndex();
  iono.build(null);
  requestAnimationFrame(membrane.animate);
  requestAnimationFrame(iono.animate);
  pt.connect();
  setTimeout(observe, 2000);
  // first observation after 2s warmup
})();
