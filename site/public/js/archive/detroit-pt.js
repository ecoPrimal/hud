// detroit-pt.js — petalTongue bridge for detroit.primals.eco
// Reads window.DETROIT_NETWORK, renders 23 panels via grammar-of-graphics.
// Sweep: 467→compressed, tryRender(394) → 6 section helpers + bind().
(function() {
  'use strict';

  var pt = PetalBridge({
    wsUrl: 'wss://hud.primals.eco/ws',
    domain: 'detroit',
    statusEl: 'pt-status',
    maxHeight: 260,
    reconnectMs: 8000,
    rpcTimeoutMs: 10000,
    onConnect: function() { tryRender(); }
  });

  // ── Helper: render binding to panel ──
  function bind(type, id, label, props) {
    props.channel_type = type;
    props.id = id;
    props.label = label;
    pt.renderBinding(props, 'pt-' + id);
  }

  function counts(arr, key) {
    var m = {};
    arr.forEach(function(v) { var k = typeof key === 'function' ? key(v) : v[key]; m[k] = (m[k] || 0) + 1; });
    return m;
  }

  function sorted(obj) {
    return Object.keys(obj).sort(function(a, b) { return obj[b] - obj[a]; });
  }

  // ═══ Section 1: Structure (panels 1-6) ═══
  function renderStructure(data, stats) {
    var tc = counts(data.nodes, 'type');
    bind('donut', 'node-types', 'Network Actors by Type — ' + stats.nodeCount + ' Nodes',
      { categories: sorted(tc), values: sorted(tc).map(function(k) { return tc[k]; }), unit: 'nodes' });

    var fc = stats.flowCounts;
    bind('donut', 'flow-types', 'Edge Flow Types — ' + stats.edgeCount + ' Connections',
      { categories: sorted(fc), values: sorted(fc).map(function(k) { return fc[k]; }), unit: 'edges' });

    var cc = counts(data.nodes, function(n) { return 'Community ' + (n.community != null ? n.community : '?'); });
    bind('donut', 'communities', 'Community Detection — Graph Clusters',
      { categories: sorted(cc), values: sorted(cc).map(function(k) { return cc[k]; }), unit: 'members' });

    var nc = {};
    data.nodes.forEach(function(n) { (n.nexus || []).forEach(function(nx) { nc[nx] = (nc[nx] || 0) + 1; }); });
    bind('bar', 'nexus-types', 'Nexus Coverage — Cross-Sector Nodes',
      { categories: sorted(nc), values: sorted(nc).map(function(k) { return nc[k]; }), unit: 'nodes' });

    var tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
    var tierC = counts(data.nodes, function(n) { return 'Tier ' + n.tier; });
    bind('bar', 'tier-dist', 'Network Tier Structure — Enterprise Hierarchy',
      { categories: tiers, values: tiers.map(function(t) { return tierC[t] || 0; }), unit: 'nodes' });

    var dc = {};
    data.nodes.forEach(function(n) { if (n.dynasty) dc[n.dynasty] = (dc[n.dynasty] || 0) + 1; });
    if (Object.keys(dc).length > 0) {
      bind('bar', 'dynasties', 'Political Dynasties — Family/Faction Clusters',
        { categories: sorted(dc), values: sorted(dc).map(function(k) { return dc[k]; }), unit: 'members' });
    }
  }

  // ═══ Section 2: Topology (panels 7-8) ═══
  function renderTopology(data, net) {
    var degrees = net.degrees();
    if (degrees) {
      var xs = [], ys = [];
      data.nodes.forEach(function(n) { var d = degrees[n.id]; if (d && (d.in + d.out) > 1) { xs.push(d.in); ys.push(d.out); } });
      if (xs.length > 3) {
        bind('scatter', 'degree-scatter', 'Degree Distribution — In vs Out Connections', { x: xs, y: ys, unit: 'nodes' });
      }
    }

    var gf = data.geoFlows || [];
    if (gf.length > 0) {
      var regions = [], flowTypes = ['money', 'power', 'influence', 'position'], geoMap = {};
      gf.forEach(function(g) {
        var r = g.from || g.zone || g.label || '?';
        if (regions.indexOf(r) < 0) regions.push(r);
        if (!geoMap[r]) geoMap[r] = {};
        geoMap[r][g.flow || 'influence'] = (geoMap[r][g.flow || 'influence'] || 0) + (g.count || 1);
      });
      if (regions.length > 1) {
        var gv = [];
        regions.forEach(function(r) { flowTypes.forEach(function(f) { gv.push(geoMap[r] && geoMap[r][f] || 0); }); });
        bind('heatmap', 'geo-flow', 'Geographic × Flow Type — Extraction Geography',
          { x_labels: flowTypes, y_labels: regions, values: gv, unit: 'edges' });
      }
    }
  }

  // ═══ Section 3: Capture (panels 9-12) ═══
  function renderCapture(data, stats, net) {
    var benches = data.benches || [];
    if (benches.length > 0) {
      var totalJ = 0, capturedJ = 0;
      benches.forEach(function(b) { totalJ += b.total || 0; capturedJ += b.captured || 0; });
      bind('gauge', 'bench-capture', 'Bench Capture Ratio — Anderson Disorder',
        { value: totalJ > 0 ? Math.round(capturedJ / totalJ * 1000) / 10 : 0, min: 0, max: 100, unit: '%', normal_range: [0, 15], warning_range: [15, 35] });
    }

    var og = data.ownershipGroups || [];
    if (og.length > 0) {
      bind('bar', 'ownership', 'Ownership Groups — Shell Entity Clusters',
        { categories: og.map(function(g) { return g.label || g.name || 'Group'; }),
          values: og.map(function(g) { return (g.members || g.nodes || []).length; }), unit: 'entities' });
    }

    if (stats.totalDocumentedDollars > 0) {
      var trail = net.moneyTrail();
      if (trail && trail.length > 0) {
        bind('bar', 'money-trail', 'Money Trail — $' + stats.totalDocumentedDollars.toLocaleString() + ' Documented',
          { categories: trail.slice(0, 12).map(function(t) { return (t.from || '?') + ' → ' + (t.to || '?'); }),
            values: trail.slice(0, 12).map(function(t) { return t.amount || 0; }), unit: '$' });
      }
    }

    if (stats.cycleCount > 0) {
      bind('gauge', 'cycles', 'Oversight Cycles — Closed Loops of Failure',
        { value: stats.cycleCount, min: 0, max: 20, unit: 'cycles', normal_range: [0, 2], warning_range: [2, 5] });
    }
  }

  // ═══ Section 4: Anderson Lattice (panels 13-15) ═══
  function renderLattice(data) {
    var benches = data.benches || [], lp = data.latticePaths || {};
    if (benches.length === 0) return;

    if (Object.keys(lp).length > 0) {
      var active = benches.filter(function(b) { return !b.retired; });
      var courtIds = [];
      active.forEach(function(b) { if (courtIds.indexOf(b.court) < 0) courtIds.push(b.court); });

      var caseTypes = Object.keys(lp).sort(function(a, b) {
        var la = lp[a].localizationLength, lb = lp[b].localizationLength;
        return (la === Infinity ? 99 : la) - (lb === Infinity ? 99 : lb);
      });

      var courtLabels = courtIds.map(function(c) { return c.replace('court_', '').replace(/_/g, ' '); });
      var lv = [];
      courtIds.forEach(function(court) {
        caseTypes.forEach(function(ct) {
          var bench = active.find(function(b) { return b.court === court; });
          var cRatio = bench ? (bench.captured / bench.total * 100) : 0;
          lv.push(lp[ct] && lp[ct].courts && lp[ct].courts.indexOf(court) >= 0 ? Math.round(cRatio) : 0);
        });
      });
      bind('heatmap', 'lattice', 'Anderson Lattice — Courts × Case Types (Capture %)',
        { x_labels: caseTypes, y_labels: courtLabels, values: lv, unit: '% captured' });

      var llLabels = [], llVals = [];
      caseTypes.forEach(function(ct) {
        llLabels.push(ct);
        var ll = lp[ct].localizationLength;
        llVals.push(ll === Infinity ? 10 : Math.round(ll * 10) / 10);
      });
      bind('bar', 'localization-length', 'Localization Length — How Far Cases Travel Before Capture',
        { categories: llLabels, values: llVals, unit: 'hops' });
    }

    var courtGauges = [];
    benches.filter(function(b) { return !b.retired; }).forEach(function(b) {
      courtGauges.push({ key: b.court.replace('court_', '').replace(/_/g, ' '),
        value: Math.round(b.captured / b.total * 100), min: 0, max: 100,
        normal_range: [0, 20], warning_range: [50, 100] });
    });
    if (courtGauges.length > 0) {
      bind('faceted_gauge', 'court-capture', 'Per-Court Capture Ratio — Judges Connected to Network',
        { group_by: 'court', gauges: courtGauges, unit: '% captured', columns: 3 });
    }
  }

  // ═══ Section 5: Analytics (panels 16-19) ═══
  function renderAnalytics(data) {
    var te = data.timelineEvents || [];
    if (te.length > 0) {
      var eraCounts = counts(te, function(ev) { return ev.era || 'Unknown'; });
      var eraK = Object.keys(eraCounts);
      bind('bar', 'timeline-eras', 'Timeline — Events per Era (' + te.length + ' total)',
        { categories: eraK.map(function(k) { return k.replace(/^\d{4}.*?:\s*/, ''); }),
          values: eraK.map(function(k) { return eraCounts[k]; }), unit: 'events' });

      var srcCounts = counts(te, function(ev) { return ev.source || 'Unknown'; });
      bind('bar', 'evidence-sources', 'Evidence Sources — Where the Data Comes From',
        { categories: sorted(srcCounts), values: sorted(srcCounts).map(function(k) { return srcCounts[k]; }), unit: 'citations' });
    }

    var multiNexus = data.nodes.filter(function(n) { return (n.nexus || []).length > 1; });
    if (multiNexus.length > 2) {
      var allNexus = ['education', 'political', 'enforcement', 'weaponization', 'legislative'];
      var mnVals = [];
      multiNexus.forEach(function(n) { allNexus.forEach(function(nx) { mnVals.push((n.nexus || []).indexOf(nx) >= 0 ? 100 : 0); }); });
      bind('heatmap', 'multi-nexus', 'Cross-Sector Nodes — Who Spans Multiple Nexus Types',
        { x_labels: allNexus, y_labels: multiNexus.map(function(n) { return n.label; }), values: mnVals, unit: 'membership' });
    }

    var fw = {};
    data.edges.forEach(function(e) { var f = e.flow || 'unknown'; fw[f] = (fw[f] || 0) + (e.weight || 1); });
    if (Object.keys(fw).length > 0) {
      bind('bar', 'flow-weights', 'Connection Strength by Flow Type',
        { categories: sorted(fw), values: sorted(fw).map(function(k) { return fw[k]; }), unit: 'weight' });
    }
  }

  // ═══ Section 6: Synthesis (panels 20-23) ═══
  function renderSynthesis(data, stats) {
    var fgNodes = data.nodes.slice(0, 120).map(function(n) {
      return { id: n.id, label: n.label || n.id, kind: n.type || 'entity', tier: n.tier || null,
               metadata: { community: n.community, dynasty: n.dynasty || null } };
    });
    var nodeSet = {};
    fgNodes.forEach(function(n) { nodeSet[n.id] = true; });
    var fgEdges = data.edges.filter(function(e) { return nodeSet[e.source] && nodeSet[e.target]; })
      .map(function(e) { return { source: e.source, target: e.target, relation: e.type || 'link', weight: e.weight || 1.0, flow: e.flow || '' }; });
    if (fgNodes.length > 2 && fgEdges.length > 1) {
      bind('force_graph', 'network-force', 'Network Force Layout — ' + fgNodes.length + ' Nodes, ' + fgEdges.length + ' Edges',
        { nodes: fgNodes, edges: fgEdges, width: 960, height: 700 });
    }

    var tierNames = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
    var chordFlows = new Array(25).fill(0);
    data.edges.forEach(function(e) {
      var s = data.nodes.find(function(n) { return n.id === e.source; });
      var t = data.nodes.find(function(n) { return n.id === e.target; });
      if (s && t && s.tier >= 1 && s.tier <= 5 && t.tier >= 1 && t.tier <= 5)
        chordFlows[(s.tier - 1) * 5 + (t.tier - 1)] += (e.weight || 1);
    });
    if (chordFlows.reduce(function(a, b) { return a + b; }, 0) > 0) {
      bind('chord', 'tier-chord', 'Inter-Tier Flow — Who Connects to Whom',
        { categories: tierNames, flows: chordFlows, unit: 'weight' });
    }

    var tenseIs = 0, tenseWas = 0, tenseWillBe = 0;
    data.nodes.forEach(function(n) {
      if (n.tier <= 2) tenseIs++; else if (n.tier <= 4) tenseWas++; else tenseWillBe++;
    });
    if (tenseIs + tenseWas + tenseWillBe > 0) {
      bind('donut', 'tense-donut', 'Tense Distribution — Is / Was / Will Be (Paper 48)',
        { slices: [
          { label: 'Is (present)', value: tenseIs, color: '#3fb950' },
          { label: 'Was (recorded)', value: tenseWas, color: '#f0883e' },
          { label: 'Will Be (predicted)', value: tenseWillBe, color: '#bc8cff' }
        ] });
    }

    var alphaComp = Math.max(0, Math.log2(data.nodes.length));
    bind('bar', 'sort-compression', 'Sort Compression — Bits Eliminated Per Sort Level',
      { categories: ['Alphabetic', 'Epitope', 'Tense'],
        values: [+alphaComp.toFixed(1), +(alphaComp - Math.log2(stats.typeCount || 8)).toFixed(1), +(alphaComp - 1.58).toFixed(1)],
        unit: 'bits' });
  }

  // ═══ Dispatcher ═══
  function tryRender() {
    if (!pt.isConnected() || !window.DETROIT_NETWORK) return;
    var net = window.DETROIT_NETWORK;
    var data = net.graphData();
    var stats = net.stats();

    renderStructure(data, stats);
    renderTopology(data, net);
    renderCapture(data, stats, net);
    renderLattice(data);
    renderAnalytics(data);
    renderSynthesis(data, stats);
  }

  // ═══ Mount ═══
  function card(title, sub, id) {
    return '<div class="pt-card"><div class="pt-card-title">' + title + '</div>'
      + '<div class="pt-card-sub">' + sub + '</div>'
      + '<div id="' + id + '" class="pt-viz"></div></div>';
  }

  function mount() {
    var el = document.getElementById('pt-panels');
    if (!el) return;
    el.innerHTML =
      card('Node Types', 'Actor classification', 'pt-node-types') +
      card('Flow Types', 'Edge classification', 'pt-flow-types') +
      card('Communities', 'Graph clusters', 'pt-communities') +
      card('Nexus Coverage', 'Cross-sector nodes', 'pt-nexus-types') +
      card('Tier Structure', 'Enterprise hierarchy', 'pt-tier-dist') +
      card('Dynasties', 'Family/faction clusters', 'pt-dynasties') +
      card('Degree Distribution', 'In vs out connections', 'pt-degree-scatter') +
      card('Geographic Flow', 'Extraction geography', 'pt-geo-flow') +
      card('Bench Capture', 'Anderson disorder', 'pt-bench-capture') +
      card('Ownership Groups', 'Shell entity clusters', 'pt-ownership') +
      card('Money Trail', 'Documented flows', 'pt-money-trail') +
      card('Oversight Cycles', 'Closed loops', 'pt-cycles') +
      card('Anderson Lattice', 'Courts × case types', 'pt-lattice') +
      card('Localization Length', 'Case travel distance', 'pt-localization') +
      card('Court Capture', 'Per-court ratios', 'pt-court-capture') +
      card('Timeline Eras', 'Events per era', 'pt-timeline-eras') +
      card('Evidence Sources', 'Data provenance', 'pt-evidence-sources') +
      card('Cross-Sector Nodes', 'Multi-nexus membership', 'pt-multi-nexus') +
      card('Flow Weights', 'Connection strength', 'pt-flow-weights') +
      card('Network Force', 'Force-directed layout', 'pt-network-force') +
      card('Tier Chord', 'Inter-tier flow', 'pt-tier-chord') +
      card('Tense Distribution', 'Is / Was / Will Be', 'pt-tense-donut') +
      card('Sort Compression', 'Bits per sort level', 'pt-sort-compression') +
      '<div id="pt-status" style="font-size:0.8em;opacity:0.5;margin-top:1em"></div>';
  }

  mount();
  pt.connect();
})();
