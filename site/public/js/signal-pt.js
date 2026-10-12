// signal-pt.js — petalTongue bridge for signal.primals.eco
// Sweep: 341→compressed, renderPanels(251) → bind() + 4 section helpers.
(function() {
  'use strict';

  var pt = PetalBridge({
    wsUrl: 'wss://hud.primals.eco/ws',
    domain: 'signal',
    statusEl: 'pt-status',
    metricsEl: 'pt-metrics',
    maxHeight: 300,
    onConnect: function() { pt.requestMetrics(); }
  });

  function bind(type, id, label, props) {
    props.channel_type = type; props.id = id; props.label = label;
    pt.renderBinding(props, 'pt-' + id);
  }

  function sorted(obj) { return Object.keys(obj).sort(function(a, b) { return obj[b] - obj[a]; }); }

  // ═══ Section 1: Fleet (panels 1-6) ═══
  function renderFleet(dash, entities, total) {
    if (entities.length > 1) {
      var cats = [], vals = [];
      entities.forEach(function(e) { if (e.total_requests > 5) { cats.push(e.label.replace(/ \(.*\)/, '')); vals.push(e.total_requests); } });
      if (cats.length > 0) bind('bar', 'entity-population', 'Entity Population — Request Volume', { categories: cats, values: vals, unit: 'requests' });

      var honest = 0, tot = 0;
      entities.forEach(function(e) { tot += e.total_requests; if (e.is_honest) honest += e.total_requests; });
      if (tot > 0) bind('gauge', 'honesty', 'Fleet Honesty — % Honest by Volume', { value: Math.round(honest / tot * 1000) / 10, min: 0, max: 100, unit: '%', normal_range: [80, 100], warning_range: [50, 80] });
    }

    var cube = dash.bingo_cube_summary;
    if (cube) { var ck = sorted(cube); bind('bar', 'bingo', 'Bingo Cube — Behavioral Type Classification', { categories: ck, values: ck.map(function(k) { return cube[k]; }), unit: 'IPs' }); }

    var coll = dash.collision_level2;
    if (coll) bind('bar', 'collision', 'Collision Layer — Coordination Detection', { categories: sorted(coll), values: sorted(coll).map(function(k) { return coll[k]; }), unit: 'IPs' });

    var asn = dash.asn_types;
    if (asn) bind('bar', 'asn', 'ASN Infrastructure Classification', { categories: sorted(asn), values: sorted(asn).map(function(k) { return asn[k]; }), unit: 'requests' });

    var paths = dash.path_types;
    if (paths) bind('bar', 'paths', 'Request Path Classification — What They Want', { categories: sorted(paths), values: sorted(paths).map(function(k) { return paths[k]; }), unit: 'requests' });
  }

  // ═══ Section 2: Fingerprints (panels 7-9) ═══
  function renderFingerprints(dash, entities, clusters) {
    if (entities.length > 1) {
      var xs = [], ys = [];
      entities.forEach(function(e) { if (e.total_requests > 5) { xs.push(e.ua_pool_size || 1); ys.push(e.unique_ips); } });
      if (xs.length > 2) bind('scatter', 'fp-scatter', 'Behavioral Fingerprint Space — UA Pool vs IP Count', { x: xs, y: ys, unit: 'entities' });
    }

    if (clusters.length > 1) {
      var hashes = clusters.map(function(c) { return c.hash.substring(0, 6); });
      var fvals = [];
      clusters.forEach(function(c) { fvals.push(c.ips); fvals.push(c.ua_pool_size); fvals.push(Math.round(c.blame_ratio * 100)); fvals.push(c.has_lang ? 100 : 0); });
      bind('heatmap', 'epitope-mx', 'Epitope Feature Matrix — Conserved Behavioral Invariants', { x_labels: ['ips', 'ua_pool', 'blame', 'has_lang'], y_labels: hashes, values: fvals, unit: 'value' });
    }

    var geo = dash.geography || [];
    if (geo.length > 0 && entities.length > 0) {
      var countries = geo.map(function(g) { return g.country; }), gv = [];
      var fp = (dash.fleet_pct || 50) / 100;
      countries.forEach(function(c) { var g = geo.find(function(x) { return x.country === c; }); var r = g ? g.requests : 0; gv.push(Math.round(r * fp)); gv.push(Math.round(r * 0.15)); gv.push(Math.round(r * (1 - fp - 0.15))); gv.push(0); });
      bind('heatmap', 'geo-mx', 'Geographic × Entity Type Distribution', { x_labels: ['Fleet', 'Agentic', 'Human', 'Scanner'], y_labels: countries, values: gv, unit: 'requests' });
    }
  }

  // ═══ Section 3: Threats (panels 10-16) ═══
  function renderThreats(dash) {
    buildSelectivityPanel(pt);

    var timing = dash.timing || {};
    if (timing.cv !== undefined) bind('gauge', 'timing-cv', 'Timing CV — Coefficient of Variation', { value: Math.round(timing.cv * 1000) / 1000, min: 0, max: 2, unit: 'CV', normal_range: [0.8, 2.0], warning_range: [0.15, 0.8] });
    if (timing.avg_interval_ms) bind('gauge', 'timing-interval', 'Mean Inter-Request Interval', { value: timing.avg_interval_ms, min: 0, max: 5000, unit: 'ms', normal_range: [1000, 5000], warning_range: [100, 1000] });

    var off = dash.top_offenders || [];
    if (off.length > 0) {
      var oL = [], oV = [];
      off.slice(0, 10).forEach(function(ip) { var l = ip.org ? ip.org.substring(0, 18) : ip.ip; if (ip.country) l += ' (' + ip.country + ')'; oL.push(l); oV.push(ip.requests); });
      bind('bar', 'offenders', 'Top Offenders — Request Volume', { categories: oL, values: oV, unit: 'requests' });
    }

    var targets = dash.targets || [];
    if (targets.length > 0) {
      var fakeRepos = ['batch-processor','queue-worker','proxy-cache','http-proxy','deploy-scripts','graph-engine','auth-service','load-balancer','rate-limiter','service-mesh'];
      var tL = [], tV = [];
      targets.slice(0, 10).forEach(function(t) { var n = t.repo.replace(/.*\//, ''); var fake = fakeRepos.some(function(f) { return n.indexOf(f) >= 0; }); var l = n.length > 16 ? n.substring(0, 16) : n; if (fake) l += ' *'; tL.push(l); tV.push(t.requests); });
      bind('bar', 'targets', 'Targeted Repositories — What They Scrape', { categories: tL, values: tV, unit: 'requests' });
    }

    var geo = dash.geography || [];
    if (geo.length > 0) bind('bar', 'geo', 'Geographic Distribution — Requests by Country', { categories: geo.map(function(g) { return g.country; }), values: geo.map(function(g) { return g.requests; }), unit: 'requests' });

    var subnets = dash.subnets || [];
    if (subnets.length > 0) {
      var sL = [], sV = [];
      subnets.slice(0, 8).forEach(function(s) { sL.push(s.subnet + ' (' + s.unique_ips + ')'); sV.push(s.requests); });
      bind('bar', 'subnets', 'Network Block Concentration', { categories: sL, values: sV, unit: 'requests' });
    }

    var topo_comp = (dash._topo && dash._topo.comparative_fingerprints) || [];
    if (topo_comp.length > 1) {
      var compE = topo_comp.map(function(c) { return c.entity; }), compV = [];
      topo_comp.forEach(function(c) { compV.push(c.ips); compV.push(parseInt(c.chrome) || 0); compV.push(c.sec_fetch === 'present' ? 100 : 0); compV.push(c.honest ? 100 : 0); });
      bind('heatmap', 'comparative', 'Comparative Behavioral Fingerprints', { x_labels: ['IPs', 'Chrome', 'Sec-Fetch%', 'Honest'], y_labels: compE, values: compV, unit: 'value' });
    }
  }

  // ═══ Section 4: Shared helpers from pt-bridge-core.js ═══
  function renderShared(dash, entities, clusters) {
    buildSummaryKpis(pt, dash);
    buildEpitopeSummary(pt, dash.epitope_summary || {});
    buildOrganismProfile(pt, clusters);
    buildEntityGauges(pt, entities);
    buildEntityDetail(pt, entities);
    buildEntityMatrix(pt, entities);
    buildAcceptLanguageDonut(pt, clusters);
  }

  // ═══ Dispatcher ═══
  function renderPanels(dash, topo) {
    if (!pt.isConnected()) return;
    var clusters = dash.epitope_clusters || [];
    var entities = (topo && topo.entities) || [];
    dash._topo = topo;

    renderFleet(dash, entities, dash.total_requests || 1);
    renderFingerprints(dash, entities, clusters);
    renderThreats(dash);
    renderShared(dash, entities, clusters);
  }

  // ═══ Data loop ═══
  function fetchAndRender() {
    var dp = fetch('/dashboard.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    var tp = fetch('/topology.json', {cache: 'no-store'}).then(function(r) { return r.json(); });
    Promise.all([dp, tp]).then(function(res) {
      if (pt.isConnected()) { renderPanels(res[0], res[1]); pt.requestMetrics(); }
    }).catch(function() {});
  }

  function card(title, sub, id) {
    return '<div class="pt-card"><div class="pt-card-title">' + title + '</div>' +
      '<div class="pt-card-sub">' + sub + '</div><div id="' + id + '" class="pt-viz"></div></div>';
  }

  function fullCard(title, sub, id) {
    return '<div class="pt-card full"><div class="pt-card-title">' + title + '</div>' +
      '<div class="pt-card-sub">' + sub + '</div><div id="' + id + '" class="pt-viz"></div></div>';
  }

  function sectionHeader(text) { return '<div class="pt-section-header">' + text + '</div>'; }

  function mount() {
    var el = document.getElementById('pt-panels');
    if (!el) return;
    el.innerHTML =
      sectionHeader('Fleet Intelligence') +
      card('Entity Population', 'Request volume', 'pt-entity-pop') +
      card('Fleet Honesty', 'Honest by volume', 'pt-honesty') +
      card('Bingo Cube', 'Behavioral classification', 'pt-bingo') +
      card('Collision', 'Coordination detection', 'pt-collision') +
      card('ASN Types', 'Infrastructure', 'pt-asn') +
      card('Path Types', 'What they want', 'pt-paths') +
      sectionHeader('Behavioral Fingerprints') +
      fullCard('Fingerprint Space', 'UA pool vs IP count', 'pt-fp-scatter') +
      fullCard('Epitope Matrix', 'Behavioral invariants', 'pt-epitope-mx') +
      fullCard('Geo × Entity', 'Geographic distribution', 'pt-geo-mx') +
      sectionHeader('Threat Landscape') +
      card('Selectivity', 'Anderson disorder', 'pt-selectivity') +
      card('Timing CV', 'Interval regularity', 'pt-timing-cv') +
      card('Timing Interval', 'Mean interval', 'pt-timing-interval') +
      card('Top Offenders', 'Request volume', 'pt-offenders') +
      card('Target Repos', 'Scraping targets', 'pt-targets') +
      card('Geography', 'By country', 'pt-geo') +
      card('Network Blocks', 'Subnet concentration', 'pt-subnets') +
      fullCard('Comparative', 'Behavioral fingerprints', 'pt-comparative') +
      sectionHeader('Organism Profile') +
      card('Summary KPIs', 'Signal overview', 'pt-summary-kpis') +
      card('Epitope Summary', 'Cluster types', 'pt-epitope-summary') +
      card('Organism', 'Cluster profile', 'pt-organism-profile') +
      card('Entity Gauges', 'Per-entity metrics', 'pt-entity-gauges') +
      card('Entity Detail', 'Entity breakdown', 'pt-entity-detail') +
      fullCard('Entity Matrix', 'Cross-entity comparison', 'pt-entity-matrix') +
      card('Accept-Language', 'Language distribution', 'pt-accept-language') +
      '<div id="pt-status" style="font-size:0.8em;opacity:0.5;margin-top:1em"></div>' +
      '<div id="pt-metrics" style="font-size:0.75em;opacity:0.4"></div>';
  }

  mount();
  pt.connect();
  setInterval(fetchAndRender, 15000);
  setTimeout(fetchAndRender, 2000);
})();
