// cosmic-surfaces.js v2 — live ecosystem integration layer for cosmic-view
// Fetches live JSON feeds, renders braid arcs between surfaces,
// updates gate status, animates traffic flow, feeds strategy + cards.
// Sends events through signal relay. Loaded after signal-relay.js, cosmic-view.js.
(function() {
  'use strict';

  var cv = window._cosmicView;
  if (!cv) { console.warn('cosmic-surfaces: no cosmic view'); return; }

  var PI = cv.PI, TAU = cv.TAU, NS = cv.NS;
  var D = cv.dims;
  var el = cv.el;

  // ═══ SURFACE REGISTRY ═══
  var SURFACES = {
    hud:         { planet:'sun',     url:'https://hud.primals.eco/',         cat:'MEMBRANE',      c:'#f0e68c', label:'hud' },
    signal:      { planet:'mercury', url:'https://signal.primals.eco/',      cat:'SIGNAL',         c:'#8b949e', label:'signal' },
    hypothesis:  { planet:'venus',   url:'https://hypothesis.primals.eco/',  cat:'SCIENCE',        c:'#f0e68c', label:'hypothesis' },
    detroit:     { planet:'earth',   url:'https://detroit.primals.eco/',     cat:'INVESTIGATION',  c:'#58a6ff', label:'detroit' },
    tuebor:      { planet:'mars',    url:'https://tuebor.primals.eco/',      cat:'IMMUNE',         c:'#e85d3a', label:'tuebor' },
    gorilla:     { planet:'jupiter', url:'https://gorilla.primals.eco/',     cat:'IMMUNE',         c:'#f0883e', label:'gorilla' },
    thesis:      { planet:'saturn',  url:'https://thesis.primals.eco/',      cat:'SCIENCE',        c:'#d29922', label:'thesis' },
    clutch:      { planet:'uranus',  url:'https://clutch.primals.eco/',      cat:'INVESTIGATION',  c:'#79c0ff', label:'clutch' },
    sporeprint:  { planet:'neptune', url:'https://sporeprint.primals.eco/',  cat:'SCIENCE',        c:'#3fb950', label:'sporePrint' },
    barry:       { planet:'moon',    url:'https://barry.primals.eco/',       cat:'INVESTIGATION',  c:'#c9d1d9', label:'barry' },
    esotericWebb:{ planet:'kuiper',  url:'https://webb.primals.eco/',        cat:'CREATIVE',       c:'#a371f7', label:'esotericWebb' },
  };

  var CAT_COLORS = {
    INVESTIGATION:'#e85d3a', MEMBRANE:'#3fb950', IMMUNE:'#f0e68c',
    SIGNAL:'#f0883e', SCIENCE:'#bc8cff', TOPOLOGY:'#58a6ff',
    CREATIVE:'#a371f7', OTHER:'#8b949e',
  };

  // ═══ LIVE DATA STATE ═══
  var _braidData = null;
  var _humanData = null;
  var _dashData = null;
  var _chipmunkData = null;
  var _scanData = null;
  var _topoData = null;
  var _braidArcs = null;
  var _pollTimer = null;
  var _lastPoll = 0;
  var POLL_MS = 15000;

  function fetchJSON(url) {
    return fetch(url, { cache:'no-store' }).then(function(r) { return r.json(); }).catch(function() { return null; });
  }

  function poll() {
    var now = Date.now();
    if (now - _lastPoll < POLL_MS * 0.8) return;
    _lastPoll = now;

    Promise.all([
      fetchJSON('/braid.json'),
      fetchJSON('/human.json'),
      fetchJSON('/dashboard.json'),
      fetchJSON('/chipmunk.json'),
      fetchJSON('/scan_sweep_sort.json'),
      fetchJSON('/topology.json'),
    ]).then(function(results) {
      _braidData = results[0];
      _humanData = results[1];
      _dashData = results[2];
      _chipmunkData = results[3];
      _scanData = results[4];
      _topoData = results[5];
      renderBraidArcs();
      updateGateStatus();
      feedStrategy();
      feedCards();
    });
  }

  // ═══ FEED STRATEGY + CARDS ═══

  function feedStrategy() {
    if (window._cosmicStrategy) {
      window._cosmicStrategy.updateFromFeeds(_humanData, _scanData, _topoData, _braidData, _dashData);
      var wake = (_chipmunkData && _chipmunkData.wake_level) || 1.0;
      var jitte = (_chipmunkData && _chipmunkData.jitte) || {};
      window._cosmicStrategy.updateCommandPoints(
        1 / Math.PI + 0.08,
        jitte.perturbation || 0,
        wake
      );
    }
  }

  function feedCards() {
    if (window._cosmicCards) {
      var m = window._chipmunkMetabolism;
      if (m && m.metabolism) {
        window._cosmicCards.updateMana(m.metabolism.energy);
      }
    }
  }

  // ═══ BRAID ARCS — animated connections between surfaces ═══

  function renderBraidArcs() {
    if (!_braidData || !_braidData.braids) return;
    var svg = cv.getSvg();
    if (!svg) return;
    var layer = cv.getLayerGroup(2);
    if (!layer) return;

    if (_braidArcs) {
      try { layer.removeChild(_braidArcs); } catch(e) {}
    }
    _braidArcs = el('g', { id:'braid-arcs' });

    var surfEls = svg.querySelectorAll('[data-surface]');
    var surfPositions = {};
    for (var i = 0; i < surfEls.length; i++) {
      var sEl = surfEls[i];
      var sName = sEl.getAttribute('data-surface');
      if (surfPositions[sName]) continue;
      if (sEl.tagName === 'circle') {
        var scx = parseFloat(sEl.getAttribute('cx'));
        var scy = parseFloat(sEl.getAttribute('cy'));
        if (!isNaN(scx) && !isNaN(scy) && scx > 0) {
          surfPositions[sName] = { x:scx, y:scy };
        }
      }
    }

    var catToSurfaces = {};
    Object.keys(SURFACES).forEach(function(s) {
      var cat = SURFACES[s].cat;
      if (!catToSurfaces[cat]) catToSurfaces[cat] = [];
      catToSurfaces[cat].push(s);
    });

    _braidData.braids.forEach(function(braid) {
      var fromSurfaces = catToSurfaces[braid.from] || [];
      var toSurfaces = catToSurfaces[braid.to] || [];
      if (fromSurfaces.length === 0 || toSurfaces.length === 0) return;

      var fromSurf = fromSurfaces[0];
      var toSurf = toSurfaces[0];
      var p1 = surfPositions[fromSurf];
      var p2 = surfPositions[toSurf];
      if (!p1 || !p2) return;

      var strength = Math.min(braid.strength || 1, 30);
      var opacity = Math.min(0.5, (strength / 30) * 0.4 + 0.05);
      var width = Math.max(0.3, (strength / 30) * 1.5);
      var arcColor = CAT_COLORS[braid.from] || '#484f58';

      var mx = (p1.x + p2.x) / 2;
      var my = (p1.y + p2.y) / 2;
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var bulge = dist * 0.3;
      var nx = -dy / dist * bulge;
      var ny = dx / dist * bulge;

      var path = el('path', {
        d: 'M ' + p1.x.toFixed(0) + ' ' + p1.y.toFixed(0) +
           ' Q ' + (mx + nx).toFixed(0) + ' ' + (my + ny).toFixed(0) +
           ' ' + p2.x.toFixed(0) + ' ' + p2.y.toFixed(0),
        fill:'none', stroke:arcColor, 'stroke-width':width.toFixed(1),
        opacity:opacity.toFixed(2), 'stroke-linecap':'round',
      });

      if (braid.trend === 'growing') {
        path.appendChild(el('animate', { attributeName:'opacity',
          values: opacity.toFixed(2) + ';' + (opacity * 1.8).toFixed(2) + ';' + opacity.toFixed(2),
          dur:'3s', repeatCount:'indefinite' }));
      }
      if (braid.trend === 'emerging') {
        path.appendChild(el('animate', { attributeName:'stroke-width',
          values: width.toFixed(1) + ';' + (width * 2).toFixed(1) + ';' + width.toFixed(1),
          dur:'2s', repeatCount:'indefinite' }));
      }

      _braidArcs.appendChild(path);

      var label = el('text', { x:(mx+nx*0.5).toFixed(0), y:(my+ny*0.5-3).toFixed(0),
        'text-anchor':'middle', fill:arcColor, 'font-size':'3px',
        'font-family':'monospace', opacity:(opacity*0.6).toFixed(2) });
      label.textContent = braid.from + '\u2192' + braid.to + ' (' + braid.humans_total + ')';
      _braidArcs.appendChild(label);
    });

    layer.appendChild(_braidArcs);
  }

  // ═══ GATE STATUS ═══

  function updateGateStatus() {
    var svg = cv.getSvg();
    if (!svg || !_dashData) return;

    var towerData = _dashData.tower;
    if (!towerData) return;

    var gateStatus = {};
    if (towerData.sites) {
      towerData.sites.forEach(function(site) {
        if (site.gate) gateStatus[site.gate] = site.alive;
      });
    }

    ['eastGate','golgiBody','sporeGate','northGate'].forEach(function(g) {
      var statusEl = svg.querySelector('[data-gate-status="' + g + '"]');
      if (statusEl) {
        var alive = gateStatus[g] !== undefined ? gateStatus[g] : true;
        statusEl.setAttribute('fill', alive ? '#3fb950' : '#f85149');
      }
    });
  }

  // ═══ NAVIGATE — open surface + relay event + claim territory ═══

  function navigate(surfaceName) {
    var surf = SURFACES[surfaceName];
    if (!surf) {
      window.open('https://' + surfaceName + '.primals.eco/', '_blank');
      return;
    }
    window.open(surf.url, '_blank');

    // Send relay event
    if (window._signalRelay) {
      if (window._cosmicFlavor) {
        window._cosmicFlavor.contagion(surfaceName);
      }
      window._signalRelay.send('surface_visit', {
        surface: surfaceName,
        planet: surf.planet,
        category: surf.cat,
        url: surf.url,
      });
    }

    // Auto-claim territory
    if (window._cosmicStrategy) {
      window._cosmicStrategy.claimTerritory(surfaceName);
    }

    if (window._chipmunkExplorer) {
      window._chipmunkExplorer.step('navigate', surfaceName);
    }
    if (window._cosmicGameplay) {
      window._cosmicGameplay.onSurfaceVisit(surfaceName);
    }
  }

  // ═══ SURFACE INFO ═══

  function getSurface(name) {
    var s = SURFACES[name];
    if (!s) return null;
    var info = { name:name, url:s.url, cat:s.cat, color:s.c, planet:s.planet, label:s.label };

    if (_braidData && _braidData.braids) {
      info.braids = _braidData.braids.filter(function(b) {
        return b.from === s.cat || b.to === s.cat;
      });
    }
    if (_humanData && _humanData.energy) {
      info.humans = _humanData.energy.total_sessions || 0;
      info.sn = _humanData.energy.signal_to_noise || 0;
    }
    return info;
  }

  function allSurfaces() {
    var list = [];
    Object.keys(SURFACES).forEach(function(name) { list.push(getSurface(name)); });
    return list;
  }

  function surfaceStatus() {
    var lines = [];
    Object.keys(SURFACES).forEach(function(name) {
      var s = SURFACES[name];
      lines.push(s.label + ' \u2014 ' + s.planet + ' \u2014 ' + s.cat);
    });
    return lines;
  }

  function refresh() {
    _lastPoll = 0;
    poll();
  }

  // ═══ LIFECYCLE ═══

  cv.onZoom(function(z) {
    if (z === 2) poll();
  });

  var _showWrapped = false;
  if (!_showWrapped) {
    _showWrapped = true;
    cv.onZoom(function() {
      if (!_pollTimer) {
        _pollTimer = setInterval(function() {
          if (cv.isVisible()) poll();
        }, POLL_MS);
        poll();
      }
    });
  }

  // ═══ EXPORT ═══

  window._cosmicSurfaces = {
    refresh: refresh,
    getSurface: getSurface,
    allSurfaces: allSurfaces,
    surfaceStatus: surfaceStatus,
    navigate: navigate,
    SURFACES: SURFACES,
    CAT_COLORS: CAT_COLORS,
    braidData: function() { return _braidData; },
    humanData: function() { return _humanData; },
    scanData: function() { return _scanData; },
    topoData: function() { return _topoData; },
  };
})();
