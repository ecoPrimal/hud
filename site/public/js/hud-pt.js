// hud-pt.js — petalTongue thin binding for hud.primals.eco
// Dimensional Cost Layout: C(n) = π^(n/2)
// Epitope Sort: panels cluster by data availability + behavioral affinity
// Visualization engines extracted to pt-membrane.js + pt-ionosphere.js
(function() {
  'use strict';

  var PI = Math.PI;

  // V(D)J = π^(3/2)·e^(iφ) — immune recombination as observation
  // V·J = π (2D, without diversity). V·D·J = π^(3/2) (3D, with diversity).
  // π^(n/2) = n-ball volume numerator. (D) is optional — it adds diversity.
  function dimCost(n) { return Math.pow(PI, n / 2); }

  var PANELS = [
    {id: 'summary-kpis',     title: 'Live Signal',               sub: 'RPS, fleet IPs, human IPs, fleet %, machine confidence.',
     dim: 2, eq: 'C(2) = \u03c0 \u2248 3.14',    cat: 'fire',   full: true},
    {id: 'bingo',            title: 'Bingo Cube',                 sub: 'Attention \u00d7 Curiosity \u00d7 Interaction.',
     dim: 3, eq: 'C(3) = \u03c0^1.5 \u2248 5.57', cat: 'membrane'},
    {id: 'fp-scatter',       title: 'Fingerprint Space',          sub: 'UA pool \u00d7 IP count \u00d7 behavioral shape.',
     dim: 3, eq: 'C(3) = \u03c0^1.5 \u2248 5.57', cat: 'membrane'},
    {id: 'organism-profile',  title: 'Organism Profile',          sub: 'Per-organism IPs \u00d7 UA pool \u00d7 blame%. Each facet = one fingerprint cluster.',
     dim: 3, eq: 'C(3) = \u03c0^1.5 \u2248 5.57', cat: 'membrane', full: true},
    {id: 'epitope-summary',  title: 'Epitope Summary',            sub: 'Organism detection counts.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'membrane'},
    {id: 'entity-pop',       title: 'Entity Population',          sub: 'Request volume by classified entity.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'collision',        title: 'Collision Detection',         sub: 'Coordination patterns.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'immune'},
    {id: 'asn',              title: 'ASN Infrastructure',          sub: 'Where traffic originates.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'paths',            title: 'Path Classification',         sub: 'What the fleet targets.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'offenders',        title: 'Top Offenders',               sub: 'Highest-volume sources.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'targets',          title: 'Target Repos',                sub: 'Which repos targeted.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'geo',              title: 'Geographic Distribution',     sub: 'Requests per country.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'subnets',          title: 'Network Blocks',              sub: 'Subnet concentration.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire'},
    {id: 'honesty',          title: 'Fleet Honesty',               sub: 'Proportion of honest traffic.',
     dim: 1, eq: 'C(1) = \u221a\u03c0 \u2248 1.77',   cat: 'immune'},
    {id: 'timing-cv',        title: 'Timing CV',                   sub: 'Coefficient of variation.',
     dim: 1, eq: 'C(1) = \u221a\u03c0',           cat: 'immune'},
    {id: 'timing-interval',  title: 'Timing Interval',             sub: 'Mean ms between requests.',
     dim: 1, eq: 'C(1) = \u221a\u03c0',           cat: 'immune'},
    {id: 'epitope-mx',       title: 'Epitope Matrix',              sub: 'Organisms \u00d7 features.',
     dim: 4, eq: 'C(4) = \u03c0\u00b2 \u2248 9.87',   cat: 'membrane'},
    {id: 'geo-mx',           title: 'Geographic \u00d7 Entity',         sub: 'Country \u00d7 entity type.',
     dim: 4, eq: 'C(4) = \u03c0\u00b2',           cat: 'fire'},
    {id: 'comparative',      title: 'Comparative Fingerprints',    sub: 'Entity \u00d7 feature matrix.',
     dim: 4, eq: 'C(4) = \u03c0\u00b2',           cat: 'membrane'},
    {id: 'entity-matrix',    title: 'Entity Behavioral Matrix',    sub: 'Full comparison across all entities.',
     dim: 4, eq: 'C(4) = \u03c0\u00b2',           cat: 'membrane', full: true},
    {id: 'relay-selectivity', title: 'Anderson Selectivity',       sub: 'S = max(P) \u2212 min(P) \u2014 live.',
     dim: 1, eq: 'C(1) = \u221a\u03c0',           cat: 'immune'},
    {id: 'relay-permeability',title: 'Per-Mode Permeability',      sub: 'Observed P per transport mode.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'immune'},
    {id: 'entity-gauges',    title: 'Entity Timing Gauges',        sub: 'Per-entity timing CV. Low CV = machine.',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'immune', full: true},
    {id: 'entity-detail',    title: 'Entity Behavioral Profile',   sub: 'Per-entity Chrome Lag, Blame%, RPS.',
     dim: 3, eq: 'C(3) = \u03c0^1.5',        cat: 'membrane', full: true},
    {id: 'organism-lang',    title: 'Accept-Language',              sub: 'Human vs machine tell \u2014 donut.',
     dim: 1, eq: 'C(1) = \u221a\u03c0',           cat: 'membrane'},
    {id: 'signal-data',     title: 'Signal Data \u2014 i\u00b2',     sub: 'Total \u00b7 Range \u00b7 \u03c3 \u00b7 Distribution. All IS-tense (live measurement).',
     dim: 2, eq: 'C(2) = \u03c0',            cat: 'fire',   full: true},
    {id: 'entity-tense',    title: 'Entity Tense \u00b1\u03c3',     sub: 'Fleet=IS (\u00b1\u03c3/\u221an). Honest=WAS (known). No band on past.',
     dim: 3, eq: 'C(3) = \u03c0^1.5',        cat: 'immune', full: true},
    {id: 'pi-sort',         title: '\u03c0 Sort \u2014 Digits Are Not Digits', sub: 'Each dim = uncertainty band [C(n\u22121), C(n)]. Width \u00d7\u221a\u03c0 each step. 4 = the gap between 3 and 5.',
     dim: 2, eq: 'C(n) = \u03c0^(n/2)',      cat: 'membrane', full: true},
  ];

  function epitopeSort(panels, aliveSet) {
    return panels.slice().sort(function(a, b) {
      var aAlive = aliveSet.has(a.id) ? 1 : 0;
      var bAlive = aliveSet.has(b.id) ? 1 : 0;
      if (aAlive !== bAlive) return bAlive - aAlive;
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
    membrane.render();
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

  function fetchAndRender() {
    var dashP = fetch('/dashboard.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    var topoP = fetch('/topology.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    Promise.all([dashP, topoP]).then(function(res) {
      membrane.ingest(res[0], res[1]);
      pushToAnimationEngine(res[0], res[1]);
      if (pt.isConnected()) { renderPanels(res[0], res[1]); pt.requestMetrics(); }
      var geo = res[0].geography || [];
      iono.updateGeo(geo);
    }).catch(function() {});
  }

  // ═══════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════
  mount();
  membrane.build();
  buildEpitopeIndex();
  iono.build(null);
  requestAnimationFrame(membrane.animate);
  requestAnimationFrame(iono.animate);
  pt.connect();
  setTimeout(fetchAndRender, 2000);
  setInterval(fetchAndRender, 15000);
})();
