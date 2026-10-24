// chipmunk-mind-explore.js — fleet topology, genome, explore, scan, sieve
// Split from chipmunk-mind.js to keep modules ≤1000 lines.
// Reads shared state from window._chipmunkCore.
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) { console.warn('chipmunk-mind-explore: no core context'); return; }

  var cache = _c.cache;
  var addEntry = _c.addEntry;
  var showPanel = _c.showPanel;

  // Shared scan data — set externally by mind.js warmSearchData
  var _scanData = null;
  function setScanData(d) { _scanData = d; }

  // ═══ FLEET TOPOLOGY — who's outside the membrane ═══
  function showFleet() {
    fetch('/detroit-data/fleet.json').then(function(r) { return r.json(); }).then(function(ft) {
      var lines = ['<b>\u2193 FLEET — outside the membrane</b>'];
      lines.push('ratio: <span class="warn">' + ft.summary.ratio + '</span> fleet:human');
      lines.push('selectivity: <span class="good">' + ft.summary.selectivity + '</span>');
      lines.push('genuine humans: <span class="good">' + ft.summary.genuine_humans + '</span>');
      lines.push('ghost IPs: <span class="warn">' + ft.summary.ghost_ips.toLocaleString() + '</span>\n');

      lines.push('<span style="color:#e85d3a">\u25cf FLEET (non-self)</span>');
      var fleetKeys = Object.keys(ft.fleet || {});
      fleetKeys.forEach(function(k) {
        var f2 = ft.fleet[k];
        var honest = f2.honest ? '<span class="good">honest</span>' : '<span class="warn">dishonest</span>';
        lines.push('  <b>' + f2.label + '</b> ' + (f2.requests/1000000).toFixed(1) + 'M reqs \u00b7 ' +
          f2.ips + ' IPs/' + f2.subnets + ' subnets \u00b7 ' + honest);
        lines.push('    <span class="dim">' + f2.behavior + '</span>');
      });

      lines.push('\n<span style="color:#d2a8ff">\u25cf GHOST CLOUD</span>');
      var ghost = ft.human_side.ghost_proxy;
      if (ghost) {
        lines.push('  ' + (ghost.requests/1000).toFixed(0) + 'K reqs through <span class="warn">' +
          ghost.ips.toLocaleString() + ' IPs</span> / ' + ghost.subnets.toLocaleString() + ' subnets');
        lines.push('  <span class="dim">' + ghost.behavior + '</span>');
      }

      lines.push('\n<span style="color:#3fb950">\u25cf HUMAN</span>');
      var hum = ft.human_side.genuine_browser;
      if (hum) {
        lines.push('  ' + (hum.requests/1000).toFixed(0) + 'K reqs \u00b7 ' + hum.ips + ' IPs \u00b7 Chrome lag ' + hum.chrome_lag);
        lines.push('  <span class="dim">' + hum.behavior + '</span>');
        var os = hum.os || {};
        lines.push('  OS: Linux=' + (os.Linux||0).toLocaleString() + ' Win=' + (os.Windows||0).toLocaleString() + ' Mac=' + ((os.macOS||0)).toLocaleString());
      }

      lines.push('\n<span style="color:#58a6ff">\u25cf SOVEREIGN (search engines)</span>');
      var se = ft.search_engines || {};
      Object.keys(se).forEach(function(k) {
        var s2 = se[k];
        lines.push('  ' + s2.label + ': ' + s2.requests + ' reqs \u00b7 ' + s2.ips + ' IPs');
      });

      showPanel('right', 'fleet', lines.join('\n'));
      addEntry('chipmunk', '\u2193 fleet outside: ' + ft.summary.ratio + ' ratio \u00b7 ' +
        ft.summary.genuine_humans + ' humans \u00b7 ' + ft.summary.ghost_ips.toLocaleString() + ' ghost IPs');
    }).catch(function() {
      showPanel('right', 'fleet', '<span class="warn">fleet data unavailable</span>');
    });
  }

  // ═══ GENOME — yeast proteins + DNA layer ═══
  function showGenome() {
    fetch('/detroit-data/genome.json').then(function(r) { return r.json(); }).then(function(gen) {
      var lines = ['<b>\u2191 GENOME — looking up at the biology</b>'];
      lines.push('<span class="dim">' + gen.organism + '</span>');
      lines.push(gen.genome_size_mb + ' Mb \u00b7 ' + gen.chromosomes + ' chromosomes \u00b7 ' + gen.genes + ' genes');
      lines.push(gen.proteins_fetched + ' proteins from AlphaFold\n');

      var layers = gen.layers || {};
      var layerOrder = ['outer_membrane','ER_membrane','mitochondrial_membrane','nuclear_membrane',
        'membrane_synthesis','transport','golgi','protein_folding','signaling','metabolism','ribosome','chromatin'];
      var LAYER_COLORS = {
        'outer_membrane':'#e85d3a','ER_membrane':'#f0883e','mitochondrial_membrane':'#3fb950',
        'nuclear_membrane':'#a371f7','membrane_synthesis':'#d29922','transport':'#58a6ff',
        'golgi':'#5ab87a','protein_folding':'#79c0ff','signaling':'#f1c40f',
        'metabolism':'#e74c3c','ribosome':'#6e7681','chromatin':'#d2a8ff'
      };

      layerOrder.forEach(function(layer) {
        var prots = layers[layer];
        if (!prots) return;
        var color = LAYER_COLORS[layer] || '#6e7681';
        lines.push('<span style="color:' + color + '">\u25cf ' + layer.replace(/_/g, ' ') + '</span>');
        prots.forEach(function(p) {
          var conf = p.pLDDT >= 90 ? 'good' : p.pLDDT >= 70 ? 'num' : 'warn';
          lines.push('  <b>' + p.gene + '</b> <span class="' + conf + '">' + p.pLDDT.toFixed(1) + '</span> \u00b7 ' +
            p.role + ' \u00b7 ' + p.length + ' aa');
        });
      });

      fetch('/detroit-data/ncbi.json').then(function(r2) { return r2.json(); }).then(function(ncbi) {
        if (ncbi.genes && ncbi.genes.length) {
          lines.push('\n<span class="dim">\u{1F9EC} DNA — NCBI Gene</span>');
          ncbi.genes.forEach(function(g2) {
            lines.push('  <b>' + g2.gene + '</b> chr' + g2.chromosome + ' \u2014 ' + g2.description);
          });
        }
        showPanel('left', 'genome', lines.join('\n'));
      }).catch(function() {
        showPanel('left', 'genome', lines.join('\n'));
      });

      var analogies = gen.membrane_analogies || {};
      var aKeys = Object.keys(analogies);
      if (aKeys.length) {
        lines.push('\n<span class="dim">\u2550 membrane \u2194 biology</span>');
        aKeys.slice(0, 8).forEach(function(gene) {
          lines.push('  <b>' + gene + '</b>: ' + analogies[gene]);
        });
        if (aKeys.length > 8) lines.push('  <span class="dim">+' + (aKeys.length - 8) + ' more</span>');
      }

      addEntry('chipmunk', '\u2191 looking up at the genome. ' + gen.proteins_fetched + ' proteins. ' +
        Object.keys(layers).length + ' membrane layers.');
    }).catch(function() {
      showPanel('left', 'genome', '<span class="warn">genome data not loaded</span>');
    });
  }

  // ═══ EXPLORE — tie stories, crimes, braids, graphs together for humans ═══
  var _exploreData = null;

  function showExplore(view, entityId) {
    if (!_exploreData) {
      fetch('/detroit-data/explore.json').then(function(r) { return r.json(); }).then(function(ex) {
        _exploreData = ex;
        showExplore(view, entityId);
      }).catch(function() {
        showPanel('left', 'explore', '<span class="warn">explore data unavailable</span>');
      });
      return;
    }
    var ex = _exploreData;
    var lines = [];

    if (view === 'entity' && entityId) {
      var ent = null;
      for (var i = 0; i < ex.entities.length; i++) {
        if (ex.entities[i].id === entityId) { ent = ex.entities[i]; break; }
      }
      if (!ent) { addEntry('chipmunk', '<span class="warn">entity not found: ' + entityId + '</span>'); return; }

      var classColor = ent.sort_class === 'non-self' ? '#e85d3a' : ent.sort_class === 'self' ? '#3fb950' : ent.sort_class === 'partial' ? '#d29922' : '#6e7681';
      lines.push('<b style="font-size:13px">' + ent.label + '</b>');
      lines.push('<span style="color:' + classColor + '">' + ent.sort_class + '</span> \u00b7 tier ' + ent.tier + ' \u00b7 conf=' + (ent.confidence * 100).toFixed(1) + '% \u00b7 ' + ent.edges + ' edges');
      if (ent.legal_type) lines.push('\u2696\ufe0f ' + ent.legal_type);
      lines.push('');

      var lk = ent.links;
      if (lk.braid) lines.push('\u2550 <a href="' + lk.braid + '" target="_blank" style="color:#58a6ff">Data Braid</a>');
      if (lk.actor) lines.push('\ud83d\udc64 <a href="' + lk.actor + '" target="_blank" style="color:#58a6ff">Actor Profile</a>');
      if (lk.evidence) {
        lines.push('\n<span style="color:#f78166">\ud83d\udcce EVIDENCE</span>');
        lk.evidence.forEach(function(u) {
          var slug = u.split('/evidence/')[1].replace(/\/$/, '');
          lines.push('  <a href="' + u + '" target="_blank" style="color:#f78166">' + slug.replace(/-/g, ' ') + '</a>');
        });
      }
      if (lk.analysis) {
        lines.push('\n<span style="color:#bc8cff">\ud83d\udd0d ANALYSIS</span>');
        lk.analysis.forEach(function(u) {
          var slug = u.split('/analysis/')[1].replace(/\/$/, '');
          lines.push('  <a href="' + u + '" target="_blank" style="color:#bc8cff">' + slug.replace(/-/g, ' ') + '</a>');
        });
      }
      if (lk.investigate) {
        lines.push('\n<span style="color:#d29922">\ud83d\udcdd INVESTIGATE</span>');
        lk.investigate.forEach(function(u) {
          var slug = u.split('/investigate/')[1].replace(/\/$/, '');
          lines.push('  <a href="' + u + '" target="_blank" style="color:#d29922">' + slug.replace(/-/g, ' ') + '</a>');
        });
      }
      if (lk.county) {
        var cslug = lk.county.split('/counties/')[1].replace(/\/$/, '');
        lines.push('\n\ud83c\udfdb\ufe0f <a href="' + lk.county + '" target="_blank" style="color:#58a6ff">County: ' + cslug + '</a>');
      }

      if (ent.connections.length) {
        lines.push('\n<span style="color:#8b949e">\u2500\u2500 CONNECTIONS</span>');
        ent.connections.forEach(function(conn) {
          var cclass = '';
          for (var j = 0; j < ex.entities.length; j++) {
            if (ex.entities[j].id === conn.id) { cclass = ex.entities[j].sort_class; break; }
          }
          var cc = cclass === 'non-self' ? '#e85d3a' : cclass === 'self' ? '#3fb950' : cclass === 'partial' ? '#d29922' : '#6e7681';
          lines.push('  <span class="explore-link" data-eid="' + conn.id + '" style="color:' + cc + ';cursor:pointer;text-decoration:underline">' +
            conn.label + '</span> <span class="dim">(' + conn.type + ', tier ' + conn.tier + ')</span>');
        });
      }

      showPanel('left', 'explore', lines.join('\n'));
      addEntry('chipmunk', '\u2191 exploring <b>' + ent.label + '</b> \u2014 ' + ent.edges + ' edges, ' +
        Object.keys(ent.links).length + ' tuebor links');

    } else if (view === 'path' && entityId) {
      var pathDef = null;
      for (var p = 0; p < ex.paths.length; p++) {
        if (ex.paths[p].id === entityId) { pathDef = ex.paths[p]; break; }
      }
      if (!pathDef) return;

      lines.push('<b style="font-size:13px">' + pathDef.label + '</b>');
      lines.push(pathDef.count + ' edges of type "' + pathDef.edge_type + '"\n');

      var inPath = [];
      ex.entities.forEach(function(ent2) {
        ent2.connections.forEach(function(conn) {
          if (conn.type === pathDef.edge_type) {
            if (inPath.indexOf(ent2.id) === -1) inPath.push(ent2.id);
          }
        });
      });

      inPath.slice(0, 20).forEach(function(eid2) {
        var e2 = null;
        for (var k = 0; k < ex.entities.length; k++) {
          if (ex.entities[k].id === eid2) { e2 = ex.entities[k]; break; }
        }
        if (!e2) return;
        var cc = e2.sort_class === 'non-self' ? '#e85d3a' : e2.sort_class === 'self' ? '#3fb950' : e2.sort_class === 'partial' ? '#d29922' : '#6e7681';
        var link = e2.links.braid || e2.links.actor || '';
        var name = link ? '<a href="' + link + '" target="_blank" style="color:' + cc + '">' + e2.label + '</a>' :
          '<span class="explore-link" data-eid="' + e2.id + '" style="color:' + cc + ';cursor:pointer;text-decoration:underline">' + e2.label + '</span>';
        lines.push(name + ' <span class="dim">(tier ' + e2.tier + ', ' + e2.edges + ' edges)</span>');
      });
      if (inPath.length > 20) lines.push('<span class="dim">+' + (inPath.length - 20) + ' more</span>');

      showPanel('left', 'explore', lines.join('\n'));

    } else {
      lines.push('<b style="font-size:14px">\u2694\ufe0f EXPLORE — tuebor evidence network</b>');
      lines.push('<span class="dim">' + ex.meta.total_entities + ' entities \u00b7 ' + ex.meta.total_edges + ' edges \u00b7 ' +
        ex.meta.entities_with_tuebor_links + ' with documentation</span>');
      lines.push('<span class="dim">' + ex.meta.evidence_count + ' evidence \u00b7 ' + ex.meta.analysis_count + ' analyses \u00b7 ' +
        ex.meta.braid_count + ' braids \u00b7 ' + ex.meta.actor_count + ' actors \u00b7 ' + ex.meta.county_count + ' counties</span>\n');

      lines.push('<span style="color:#f0e68c">\u2500\u2500 INVESTIGATION STORIES</span>');
      ex.stories.forEach(function(s) {
        lines.push(s.icon + ' <a href="' + s.url + '" target="_blank" style="color:#58a6ff"><b>' + s.title + '</b></a>');
        lines.push('  <span class="dim">' + s.subtitle + '</span>');
        var pathNames = s.path.map(function(pid) {
          for (var m = 0; m < ex.entities.length; m++) {
            if (ex.entities[m].id === pid) return ex.entities[m].label;
          }
          return pid;
        });
        lines.push('  <span style="color:#484f58">' + pathNames.join(' \u2192 ') + '</span>');
      });

      lines.push('\n<span style="color:#7ee787">\u2500\u2500 INVESTIGATION ROUTES</span>');
      ex.paths.forEach(function(p) {
        lines.push('  <span class="explore-path" data-pid="' + p.id + '" style="cursor:pointer;color:#7ee787;text-decoration:underline">' +
          p.label + '</span> <span class="dim">(' + p.count + ' edges)</span>');
      });

      var topEnts = ex.entities.slice().sort(function(a, b) { return b.edges - a.edges; }).slice(0, 12);
      lines.push('\n<span style="color:#f78166">\u2500\u2500 MOST CONNECTED</span>');
      topEnts.forEach(function(te) {
        var cc = te.sort_class === 'non-self' ? '#e85d3a' : te.sort_class === 'self' ? '#3fb950' : te.sort_class === 'partial' ? '#d29922' : '#6e7681';
        var lt = te.legal_type ? ' [\u2696 ' + te.legal_type + ']' : '';
        lines.push('  <span class="explore-link" data-eid="' + te.id + '" style="color:' + cc + ';cursor:pointer;text-decoration:underline">' +
          te.label + '</span> <span class="dim">' + te.edges + ' edges' + lt + '</span>');
      });

      showPanel('left', 'explore', lines.join('\n'));
      addEntry('chipmunk', '\u2694\ufe0f explore: ' + ex.meta.total_entities + ' entities, ' + ex.stories.length + ' stories, ' +
        ex.meta.evidence_count + ' evidence, ' + ex.meta.analysis_count + ' analyses. click to follow.');
    }

    setTimeout(function() {
      var links = document.querySelectorAll('.explore-link');
      links.forEach(function(el) {
        el.onclick = function() { showExplore('entity', el.getAttribute('data-eid')); };
      });
      var paths = document.querySelectorAll('.explore-path');
      paths.forEach(function(el) {
        el.onclick = function() { showExplore('path', el.getAttribute('data-pid')); };
      });
    }, 100);
  }

  // ═══ SCAN SUMMARY — show pipeline state in chipmunk panel ═══
  function showScan() {
    var s = _scanData || cache.scanSort;
    if (!s) {
      fetch('/detroit-data/scan.json').then(function(r) { return r.json(); }).then(function(d) {
        _scanData = d;
        showScan();
      }).catch(function() {
        showPanel('left', 'scan', '<span class="warn">scan data unavailable</span>');
      });
      return;
    }

    var sc = s.scan || s;
    var ents = sc.entities_discovered || 0;
    var edges = sc.edges_discovered || 0;
    var classes = sc.sort_classes || {};
    var sort = s.sort || {};
    var sweep = s.sweep || {};
    var foss = s.fossilize || {};
    var evolve = s.evolve || [];

    var lines = ['<b>SCAN \u2192 SWEEP \u2192 SORT</b>'];
    lines.push('');
    lines.push('<span class="good">\u25cf SCAN</span> ' + ents + ' entities \u00b7 ' + edges + ' edges');
    lines.push('  <span style="color:#3fb950">\u2713 self: ' + (classes.self || 0) + '</span>' +
      '  <span style="color:#e85d3a">\u2715 non-self: ' + (classes['non-self'] || 0) + '</span>' +
      '  <span style="color:#f0883e">\u25d0 partial: ' + (classes.partial || 0) + '</span>' +
      '  <span class="dim">null: ' + (classes['null'] || 0) + '</span>');

    var ets = sc.edge_types || {};
    var etKeys = Object.keys(ets).sort(function(a, b) { return ets[b] - ets[a]; });
    if (etKeys.length) lines.push('  edges: ' + etKeys.slice(0, 5).map(function(k) { return k + '=' + ets[k]; }).join(', '));

    var tiers = sc.tiers || {};
    var tierKeys = Object.keys(tiers).sort();
    if (tierKeys.length) lines.push('  tiers: ' + tierKeys.map(function(k) { return 'T' + k + '=' + tiers[k]; }).join(' '));

    var lt = sc.legal_types || {};
    var ltKeys = Object.keys(lt);
    if (ltKeys.length) {
      lines.push('');
      lines.push('<span style="color:#d29922">\u25cf LAWYER SORT</span> ' + ltKeys.length + ' legal types');
      ltKeys.sort(function(a, b) { return lt[b] - lt[a]; }).forEach(function(k) {
        lines.push('  <span style="color:#d29922">\u2696</span> ' + k.replace(/_/g, ' ') + ': ' + lt[k]);
      });
    }

    if (sweep.hierarchy || sweep.jurisdiction_chain) {
      lines.push('');
      lines.push('<span style="color:#a371f7">\u25cf SWEEP</span>');
      if (sweep.hierarchy) lines.push('  hierarchy: ' + sweep.hierarchy);
      if (sweep.jurisdiction_chain) lines.push('  chain: ' + sweep.jurisdiction_chain.join(' \u2192 '));
      if (sweep.tuebor) lines.push('  tuebor: tier ' + sweep.tuebor.tier + ' \u00b7 ' + sweep.tuebor.edges + ' edges \u00b7 ' + sweep.tuebor['class']);
      if (sweep.lawyer_sort) lines.push('  lawyer sort: ' + sweep.lawyer_sort.entities_sorted + ' entities \u00b7 ' + sweep.lawyer_sort.types + ' types');
    }

    if (sort.total) {
      lines.push('');
      lines.push('<span style="color:#f0883e">\u25cf SORT</span> ' + sort.total + ' total');
      lines.push('  selectivity: <span class="num">' + ((sort.selectivity || 0) * 100).toFixed(1) + '%</span>' +
        ' \u00b7 quality: <span class="num">' + ((sort.quality || 0) * 100).toFixed(1) + '%</span>');
    }

    if (foss.observations) {
      lines.push('');
      lines.push('<span class="dim">\u25cf FOSSILIZE</span>');
      var obs = foss.observations;
      Object.keys(obs).forEach(function(k) {
        lines.push('  <span class="dim">' + k + ':</span> ' + obs[k]);
      });
    }

    if (Array.isArray(evolve) && evolve.length) {
      lines.push('');
      lines.push('<span style="color:#7ee787">\u25cf EVOLVE</span> ' + evolve.length + ' recommendations');
      evolve.forEach(function(rec) {
        var pColor = rec.priority === 'high' ? '#e85d3a' : rec.priority === 'medium' ? '#f0883e' : '#484f58';
        lines.push('  <span style="color:' + pColor + '">[' + rec.priority + ']</span> ' + (rec.action || rec.reason || ''));
      });
    }

    showPanel('left', 'scan', lines.join('\n'));
    addEntry('chipmunk', 'scan: ' + ents + ' entities \u00b7 selectivity: ' + ((sort.selectivity || 0) * 100).toFixed(0) + '% \u00b7 quality: ' + ((sort.quality || 0) * 100).toFixed(0) + '%');
  }

  // ═══ SIEVE — tope sort compress + bingo cube sieve ═══
  function showSieve() {
    fetch('/detroit-data/compressed.json').then(function(r) { return r.json(); }).then(function(d) {
      var lines = ['<b>TOPE SORT \u2192 COMPRESS \u2192 SIEVE</b>'];

      lines.push('<span class="dim">' + d.input.entities + ' entities \u00b7 ' + d.input.edges + ' edges</span>');

      lines.push('');
      lines.push('<span class="good">\u25cf COMPRESS</span> ' + d.compress.clusters + ' clusters (ratio ' + d.compress.ratio + ':1)');
      (d.simplify.summary || []).forEach(function(s) {
        var cls = s.sort_class;
        var clsColor = cls === 'self' ? '#3fb950' : cls === 'non-self' ? '#e85d3a' : cls === 'partial' ? '#f0883e' : '#484f58';
        lines.push('  <span style="color:' + clsColor + '">' + cls + '</span>: ' +
          s.total_entities + ' \u2192 ' + s.clusters + ' clusters \u00b7 conf=' + s.avg_confidence);
        if (s.discriminating_edges && s.discriminating_edges.length > 0) {
          var discs = s.discriminating_edges.slice(0, 3).map(function(de) {
            return de.edge_type + '(' + de.ratio + 'x)';
          }).join(', ');
          lines.push('    <span class="dim">discriminators: ' + discs + '</span>');
        }
        var types = Object.keys(s.node_types || {}).map(function(t) { return t + '=' + s.node_types[t]; }).join(', ');
        lines.push('    <span class="dim">' + types + '</span>');
      });

      lines.push('');
      lines.push('<span style="color:#a371f7">\u25cf BINGO SIEVE</span> subcube reveal thresholds');
      (d.bingo_sieve.results || []).forEach(function(r) {
        var inSelf = (r.in_classes || {}).self || 0;
        var inPartial = (r.in_classes || {}).partial || 0;
        var inNull = (r.in_classes || {})['null'] || 0;
        var inNon = (r.in_classes || {})['non-self'] || 0;
        lines.push('  <b>x=' + r.threshold + '</b> (' + r.label + '): <span class="good">' + r.falls_in + ' in</span> / <span class="dim">' + r.falls_out + ' out</span>');
        lines.push('    in: <span style="color:#3fb950">self=' + inSelf + '</span> <span style="color:#f0883e">partial=' + inPartial + '</span> <span class="dim">null=' + inNull + '</span> <span style="color:#e85d3a">non-self=' + inNon + '</span> conf=' + r.in_avg_confidence);
      });

      var piSieve = (d.bingo_sieve.results || []).find(function(r) { return r.label === '1/pi'; });
      if (piSieve) {
        lines.push('');
        lines.push('<span style="color:#a371f7">\u03c0-sieve:</span> ' + piSieve.falls_in + '/' + d.input.entities + ' pass through (top ' + (piSieve.threshold * 100).toFixed(1) + '%)');
      }

      showPanel('left', 'sieve', lines.join('\n'));
      addEntry('chipmunk', d.compress.clusters + ' clusters from ' + d.input.entities + ' entities \u00b7 bingo sieve at 4 thresholds');
    }).catch(function(e) {
      showPanel('left', 'sieve', '<span class="warn">sieve data unavailable: ' + e.message + '</span>');
    });
  }

  window._chipmunkMindExplore = {
    showFleet: showFleet,
    showGenome: showGenome,
    showExplore: showExplore,
    showScan: showScan,
    showSieve: showSieve,
    setScanData: setScanData,
  };
})();
