/* voxel-anchor.js — pull all live JSON through the geodesic & triad, anchor to HUD
 *
 * The geodesic circle and tetrahedric overlay already exist (edge-triad.js,
 * geodesic-arithmetic.js). This script:
 *   1. Aggregates ALL live feeds into one sorted state object
 *   2. Pipes that state through the geodesic primitives (point, balance, wedge, arc)
 *   3. Feeds the triad (in/out/edge) with real data
 *   4. Anchors everything to the visitor's hyperlocal position
 *   5. Exposes window._voxelAnchor for any HUD module to read the unified state
 *
 * Every locale sees from their position on the geodesic.
 * The ring (Saturn) is the surface. The hologram is the planet within.
 * The triad backscatters the sort. The geodesic carries the bounce.
 *
 * Wave 180. The voxel IS the sort anchor.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2;

  // ═══════════════════════════════════════════════════════════════
  // ALL FEEDS — the complete membrane data surface
  // ═══════════════════════════════════════════════════════════════
  var FEEDS = {
    // Core state
    now:           { url: '/now.json',              rate: 'fast',   layer: 'membrane' },
    dashboard:     { url: '/dashboard.json',        rate: 'fast',   layer: 'membrane' },
    chipmunk:      { url: '/chipmunk.json',         rate: 'fast',   layer: 'pangaea' },
    membrane:      { url: '/membrane.json',         rate: 'medium', layer: 'membrane' },

    // Human / fleet
    human:         { url: '/human.json',            rate: 'fast',   layer: 'ionosphere' },
    presence:      { url: '/presence.json',         rate: 'fast',   layer: 'ionosphere' },
    fleetSort:     { url: '/fleet-sort.json',       rate: 'medium', layer: 'ionosphere' },

    // Sort & negentropy
    negentropy:    { url: '/negentropy.json',        rate: 'medium', layer: 'sort' },
    negentropyC:   { url: '/api/negentropy-court.json', rate: 'slow', layer: 'sort' },
    scanSweep:     { url: '/scan_sweep_sort.json',  rate: 'medium', layer: 'epitope' },

    // Triad & geodesic
    triad:         { url: '/triad.json',            rate: 'fast',   layer: 'sort' },
    backscatter:   { url: '/backscatter.json',      rate: 'medium', layer: 'sort' },
    amphiphile:    { url: '/amphiphile.json',       rate: 'slow',   layer: 'membrane' },

    // Topology & braids
    topology:      { url: '/topology.json',         rate: 'medium', layer: 'pangaea' },
    braid:         { url: '/braid.json',            rate: 'fast',   layer: 'pangaea' },
    totality:      { url: '/totality.json',         rate: 'slow',   layer: 'pangaea' },

    // Energy & temperature
    energy:        { url: '/energy.json',           rate: 'medium', layer: 'membrane' },
    temperature:   { url: '/temperature.json',      rate: 'medium', layer: 'membrane' },
    systemLayers:  { url: '/system-layers.json',    rate: 'slow',   layer: 'sort' },

    // Space weather & neutron
    spaceWeather:  { url: '/space-weather.json',    rate: 'slow',   layer: 'ionosphere' },
    neutron:       { url: '/neutron.json',          rate: 'medium', layer: 'pangaea' },
  };

  // ═══════════════════════════════════════════════════════════════
  // UNIFIED STATE — all feeds merged, sorted by layer
  // ═══════════════════════════════════════════════════════════════
  var state = {
    ts: 0,
    wave: 0,
    layers: {
      ionosphere: {},  // outermost — weather, fleet, geography
      membrane:   {},  // boundary — selectivity, fold rate, energy
      epitope:    {},  // sort surface — classification
      sort:       {},  // negentropy court — trust gradient
      pangaea:    {},  // innermost — organisms, topology, braids
    },
    // Geodesic position — where THIS visitor is on the circle
    geodesic: {
      base: PI,
      position: 0,       // radians on the geodesic circle
      carry: 0,          // how many full rotations
      remainder: 0,      // the irrational remainder (always non-zero for π)
    },
    // Triad state — fed to edge-triad.js
    triad: {
      in_count: 0,       // snowflakes (humans)
      out_count: 0,      // rain (fleet)
      edge_count: 0,     // fog+lightning (ambiguous)
      mix: {},
    },
    // Trust gradient — bearDog hierarchy
    trust: {
      human: 0,
      agentic: 0,
      bot: 0,
      null: 0,
    },
    // Feeds loaded count
    loaded: 0,
    total: Object.keys(FEEDS).length,
  };

  // ═══════════════════════════════════════════════════════════════
  // SUBSCRIBE TO ALL FEEDS via pi-bus
  // ═══════════════════════════════════════════════════════════════
  function boot() {
    var bus = window._piBus;
    if (!bus) {
      // Fallback: poll manually if pi-bus not available
      Object.keys(FEEDS).forEach(function (key) {
        var f = FEEDS[key];
        fetch(f.url, { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (d) { ingest(key, d); })
          .catch(function () {});
      });
      return;
    }

    // Subscribe through pi-bus — shared, throttle-aware, π-timed
    Object.keys(FEEDS).forEach(function (key) {
      var f = FEEDS[key];
      bus.sub(f.url, function (d) { ingest(key, d); }, f.rate);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // INGEST — merge feed data into unified state
  // ═══════════════════════════════════════════════════════════════
  function ingest(key, data) {
    if (!data) return;
    var feed = FEEDS[key];
    if (!feed) return;

    state.layers[feed.layer][key] = data;
    state.loaded++;
    state.ts = Date.now();

    // Extract wave
    if (data.wave) state.wave = Math.max(state.wave, data.wave);

    // Extract trust gradient
    if (data.trust_gradient) {
      state.trust = data.trust_gradient;
    }

    // Extract triad data
    if (key === 'human') {
      state.triad.in_count = data.unique_ips || 0;
      state.triad.out_count = (data.fleet && data.fleet.total_requests) || 0;
    }
    if (key === 'backscatter') {
      state.triad.edge_count = (data.rays && data.rays.edge && data.rays.edge.count) || 0;
    }
    if (key === 'triad' && data.mix) {
      state.triad.mix = data.mix;
    }

    // Update geodesic position based on accumulated data
    updateGeodesic();

    // Emit event for any listener
    try {
      document.dispatchEvent(new CustomEvent('voxel-update', { detail: { key: key, state: state } }));
    } catch (e) {}
  }

  // ═══════════════════════════════════════════════════════════════
  // GEODESIC — compute visitor position on the π circle
  // ═══════════════════════════════════════════════════════════════
  function updateGeodesic() {
    // Position = hash of visitor's accumulated interactions + wave
    var presses = 0;
    if (window._humanityButton) presses = window._humanityButton.count();
    var count = state.wave + presses;

    // π-bounce: divide by π, keep remainder
    var carry = Math.floor(count / PI);
    var remainder = (count / PI) - carry;
    var digit = count - carry * PI;

    state.geodesic.position = (digit / PI) * 2 * PI; // radians on circle
    state.geodesic.carry = carry;
    state.geodesic.remainder = remainder;

    // Feed geodesic-arithmetic if available
    if (window.__geodesicArithmetic) {
      var ga = window.__geodesicArithmetic;
      var pb = ga.piBounce(count);
      state.geodesic.carry = pb.carry;
      state.geodesic.remainder = pb.remainder;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HYPERLOCAL ANCHOR — what the visitor sees from THEIR position
  // ═══════════════════════════════════════════════════════════════
  function hyperlocal() {
    var pos = state.geodesic.position;
    var TAU = 2 * PI;

    // Which face of the Saturn ring are they looking at?
    var faceAngle = pos % TAU;
    var faceIndex = Math.floor((faceAngle / TAU) * 8);
    var faces = ['security', 'discovery', 'evidence', 'science', 'compute', 'surface', 'culture', 'infra'];
    var face = faces[faceIndex] || 'security';

    // Which layer are they at? (depth from geodesic remainder)
    var layers = ['ionosphere', 'membrane', 'epitope', 'sort', 'pangaea'];
    var layerIndex = Math.floor(state.geodesic.remainder * 5) % 5;
    var layer = layers[layerIndex];

    // Which triad vertex is nearest?
    var triadAngle = faceAngle % (TAU / 3);
    var vertex = triadAngle < TAU / 9 ? 'in' : triadAngle < 2 * TAU / 9 ? 'edge' : 'out';

    // Trust level of visitor (default = human until proven otherwise)
    var trust = 'human';

    return {
      face: face,
      layer: layer,
      vertex: vertex,
      trust: trust,
      position: pos,
      carry: state.geodesic.carry,
      remainder: state.geodesic.remainder,
      note: 'you are at face:' + face + ' layer:' + layer + ' vertex:' + vertex + ' — carry ' + state.geodesic.carry + ', remainder ' + state.geodesic.remainder.toFixed(6),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HUD STATUS WIDGET — shows the unified state on the HUD
  // ═══════════════════════════════════════════════════════════════
  function renderWidget() {
    var existing = document.getElementById('voxel-status');
    if (existing) existing.remove();

    var widget = document.createElement('div');
    widget.id = 'voxel-status';
    widget.style.cssText = 'position:fixed;bottom:168px;left:12px;z-index:5;'
      + 'background:rgba(22,27,34,.85);border:1px solid rgba(170,136,255,.25);'
      + 'padding:8px 12px;border-radius:8px;width:148px;pointer-events:auto;'
      + 'font:10px monospace;color:#c9d1d9;';

    function update() {
      var hl = hyperlocal();
      var feedsLoaded = 0;
      Object.keys(FEEDS).forEach(function (k) {
        var f = FEEDS[k];
        if (state.layers[f.layer] && state.layers[f.layer][k]) feedsLoaded++;
      });

      var trustColors = { human: '#3fb950', agentic: '#a371f7', bot: '#f0883e', null: '#f85149' };

      widget.innerHTML = ''
        + '<div style="color:#aa88ff;font-weight:bold;font-size:11px;margin-bottom:4px">◎ voxel anchor</div>'
        + '<div style="color:#8b949e;font-size:9px">feeds: ' + feedsLoaded + '/' + Object.keys(FEEDS).length + ' · wave ' + state.wave + '</div>'
        + '<div style="margin-top:4px;font-size:9px">'
        + '<span style="color:#f0e68c">face:</span> ' + hl.face + '<br>'
        + '<span style="color:#58a6ff">layer:</span> ' + hl.layer + '<br>'
        + '<span style="color:#aa88ff">vertex:</span> ' + hl.vertex + '<br>'
        + '<span style="color:#3fb950">carry:</span> ' + hl.carry + '<br>'
        + '<span style="color:#f0883e">π-rem:</span> ' + hl.remainder.toFixed(4)
        + '</div>'
        + '<div style="margin-top:4px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px;font-size:9px">'
        + '<span style="color:' + (trustColors.human) + '">❄ ' + (state.trust.human || '—') + '</span> '
        + '<span style="color:' + (trustColors.agentic) + '">🤖 ' + (state.trust.agentic || '—') + '</span><br>'
        + '<span style="color:' + (trustColors.bot) + '">🌧 ' + (state.trust.bot || '—') + '</span> '
        + '<span style="color:' + (trustColors.null) + '">🌫 ' + (state.trust.null || '—') + '</span>'
        + '</div>'
        + '<div style="margin-top:3px;color:#484f58;font-size:8px">'
        + 'geodesic base π · ' + (hl.trust) + ' trust'
        + '</div>';
    }

    update();
    setInterval(update, 10000);
    document.body.appendChild(widget);
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPOSE API
  // ═══════════════════════════════════════════════════════════════
  window._voxelAnchor = {
    state: function () { return state; },
    hyperlocal: hyperlocal,
    feeds: FEEDS,
    ingest: ingest,
  };

  // Boot after DOM ready
  function init() {
    boot();
    setTimeout(renderWidget, 2000);
    console.log('[voxel-anchor] ALL feeds subscribed. geodesic base π. trust gradient active.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
