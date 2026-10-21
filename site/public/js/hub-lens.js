// hub-lens.js v1 — the HUD is a hub. flat from the side. optics inside.
//
// A lens is flat from the side but has:
//   CONVEX — the outward curve (what visitors see — public surfaces)
//   CONCAVE — the inward curve (what the membrane sees — internal feeds)
//   MIRRORS — reflection (Klein fold — output becomes input)
//   PRISMS — refraction (π-bus splits feeds into light, sound, color channels)
//
// The hub routes everything through itself. All feeds, all sorts, all rings.
// Voxel sort: 3D grid (Attention × Curiosity × Interaction) → bingo cube
// π ring: circular topology → ring-sort-geo, epitope-ring, footer-ring
//
// This file is the optical routing table. It doesn't render — it routes.
// It tells each subsystem what channel they're on and what focal length to use.
//
// Kevin Mok / Tamison / ecoPrimal / attsi
// ORCID 0009-0004-2141-0321
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;
  var PHI = (1 + Math.sqrt(5)) / 2;  // golden ratio — for focal length

  // ═══════════════════════════════════════════════════════════
  // THE LENS — optical properties of the HUD hub
  // ═══════════════════════════════════════════════════════════

  var LENS = {
    // Focal lengths — how far each surface focuses
    focal: {
      convex:  PI,          // outward: full π reach (public)
      concave: 1 / PI,     // inward: 1/π reach (internal — close focus)
      mirror:  0,           // reflection: zero distance (Klein fold — self)
      prism:   PHI          // refraction: golden ratio (splits at natural proportion)
    },

    // Aperture — how wide each surface opens
    aperture: {
      convex:  TAU,         // full circle (the public sees everything)
      concave: PI,          // half circle (internal sees half — the other half is reflected)
      mirror:  PI / 2,     // quarter turn (the fold point)
      prism:   PI / 3      // 60° — minimum angle for total internal reflection in glass
    },

    // Channels — what each optical element routes
    channels: {
      light:  'membrane-sight',   // visual tracing
      sound:  'membrane-sound',   // π-just intonation
      color:  'pi-gradient',      // dimensional color ladder
      sort:   'ring-sort-geo',    // topo-sorting rings
      voxel:  'bingo-compress',   // 3D sieve
      fold:   'klein-io',         // Klein bottle I/O
      ring:   'epitope-ring',     // the classification ring
      circuit:'mobius-circuit',    // the investigation loop
      eye:    'third-eye',        // the nose-as-sensor
      bus:    'pi-bus',           // the shared data bus
      weather:'weather-song'      // NOAA Klein fold → color + sound
    }
  };

  // ═══════════════════════════════════════════════════════════
  // SURFACES — convex (out) vs concave (in)
  // The same data, seen from two sides of the lens
  // ═══════════════════════════════════════════════════════════

  // Convex surface: what visitors see (public-facing)
  var CONVEX = {
    feeds: [
      '/topology.json',     // the shape of the system
      '/dashboard.json',    // summary for HUD
      '/neutron.json',      // breathing rhythm
      '/chipmunk.json'      // the greeter
    ],
    render: ['membrane-sight', 'pi-gradient', 'ring-sort-geo'],
    description: 'the outward curve — what light hits first'
  };

  // Concave surface: what the membrane sees (internal)
  var CONCAVE = {
    feeds: [
      '/state.json',        // full system state (π-ratio, gas)
      '/energy.json',       // process-level RSS
      '/entropy.json',      // connection states
      '/pulse.json',        // alive/rss/load
      '/feed-health.json',  // meta-feed (feeds about feeds)
      '/membrane.json'      // membrane vitals
    ],
    render: ['klein-io', 'membrane-sound', 'bingo-compress'],
    description: 'the inward curve — what the membrane reflects on'
  };

  // ═══════════════════════════════════════════════════════════
  // PRISM — splits white light (raw data) into spectrum (channels)
  // Each feed enters the prism and exits as light + sound + color
  // ═══════════════════════════════════════════════════════════

  // Map data properties to optical channels
  var PRISM = {
    // light channel: things you SEE (geometry, position, topology)
    light: function(data) {
      return {
        services:   data.services_alive || data.alive || 0,
        connections: data.connections || 0,
        feeds:      data.feeds_total || data.total_feeds || 0,
        surface:    data.surface || data.topology || 'unknown'
      };
    },
    // sound channel: things you HEAR (rhythm, breathing, tempo)
    sound: function(data) {
      var breathing = data.breathing || {};
      return {
        rpm:        breathing.rpm || data.rpm || 0,
        remainder:  breathing.remainder || data.remainder || 0.68169,
        rhythm:     breathing.rhythm || 0.68169,
        load:       data.load || '0',
        tempo:      data.interval_seconds || 120
      };
    },
    // color channel: things you SENSE (ratio, range, temperature)
    color: function(data) {
      var pi = data.pi || {};
      var gas = data.gas || {};
      return {
        pi_ratio:   pi.ratio || data.pi_ratio || 0,
        pi_range:   pi.range || data.pi_range || 0,
        gas_ratio:  gas.gas_ratio || data.gas_ratio || 1,
        rss_mb:     (data.membrane || data).rss_mb || 0,
        temperature: data.temp_c || 0
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // MIRROR — the Klein fold. Output → reflection → input.
  // The mirror has no focal length — it returns everything to self.
  // ═══════════════════════════════════════════════════════════

  var MIRROR = {
    reflect: function(data) {
      // The Klein fold: take output, mark it as reflected, return as input
      if (!data || typeof data !== 'object') return data;
      var reflected = {};
      for (var k in data) {
        if (data.hasOwnProperty(k)) reflected[k] = data[k];
      }
      reflected._reflected = true;
      reflected._mirror_ts = new Date().toISOString();
      return reflected;
    },
    // Check if data has already been through the mirror
    isReflected: function(data) {
      return data && data._reflected === true;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // VOXEL SORT — 3D grid, π-ring is the orbit
  // Each feed occupies a voxel: [surface, channel, freshness]
  //   x = surface (convex=0, concave=1)
  //   y = channel (light=0, sound=1, color=2)
  //   z = freshness (0=fresh, 1=warm, 2=stale, 3=gas)
  // ═══════════════════════════════════════════════════════════

  function voxelSort(feeds) {
    var voxels = [];
    var now = Date.now();

    for (var i = 0; i < feeds.length; i++) {
      var f = feeds[i];
      var age = f.ts ? (now - new Date(f.ts).getTime()) / 1000 : 99999;

      // x: surface
      var x = f._surface === 'convex' ? 0 : 1;

      // y: channel (which prism output?)
      var y = 0; // default light
      if (f._channel === 'sound') y = 1;
      if (f._channel === 'color') y = 2;

      // z: freshness tier (π-timed)
      var z = 0; // fresh (< π² seconds ≈ 10s)
      if (age > PI * PI) z = 1;           // warm (10s - 31s)
      if (age > PI * PI * PI) z = 2;      // stale (31s - 97s)
      if (age > PI * PI * PI * PI) z = 3; // gas (> 97s)

      voxels.push({
        feed: f,
        voxel: [x, y, z],
        age: age,
        // π-ring position: angle based on index, radius based on freshness
        angle: (i / feeds.length) * TAU,
        radius: LENS.focal.convex - (z * (1 / PI))
      });
    }

    // Sort by z (freshness) then y (channel) then x (surface)
    voxels.sort(function(a, b) {
      if (a.voxel[2] !== b.voxel[2]) return a.voxel[2] - b.voxel[2];
      if (a.voxel[1] !== b.voxel[1]) return a.voxel[1] - b.voxel[1];
      return a.voxel[0] - b.voxel[0];
    });

    return voxels;
  }

  // ═══════════════════════════════════════════════════════════
  // π RING — the circular routing topology
  // Every feed has an angle. The ring IS the sort.
  // ═══════════════════════════════════════════════════════════

  function piRing(voxels) {
    var ring = {
      total: voxels.length,
      sectors: {
        light: { feeds: [], angle_start: 0, angle_end: TAU / 3 },
        sound: { feeds: [], angle_start: TAU / 3, angle_end: 2 * TAU / 3 },
        color: { feeds: [], angle_start: 2 * TAU / 3, angle_end: TAU }
      },
      gas_count: 0,
      pi_circumference: TAU  // the ring itself IS 2π
    };

    for (var i = 0; i < voxels.length; i++) {
      var v = voxels[i];
      if (v.voxel[2] === 3) ring.gas_count++; // count gas

      // Route to sector by channel
      var channel = v.voxel[1] === 0 ? 'light' : (v.voxel[1] === 1 ? 'sound' : 'color');
      ring.sectors[channel].feeds.push(v);
    }

    return ring;
  }

  // ═══════════════════════════════════════════════════════════
  // THE HUB — route everything through the lens
  // ═══════════════════════════════════════════════════════════

  function route() {
    var state = {};

    // Get Klein fold state (if available)
    if (typeof window.__kleinState === 'function') {
      state.klein = window.__kleinState();
    }

    // Get proton mass (if available)
    if (typeof window.__getProtonMass === 'function') {
      state.proton = window.__getProtonMass();
    }

    // Build feed list from klein state
    var feeds = [];
    if (state.klein) {
      // The klein state IS the reflected data — it came through the mirror
      var k = MIRROR.reflect(state.klein);

      // Split through prism
      var light = PRISM.light(k);
      light._surface = 'convex'; light._channel = 'light'; light.ts = k.last_fold;
      feeds.push(light);

      var sound = PRISM.sound(k);
      sound._surface = 'concave'; sound._channel = 'sound'; sound.ts = k.last_fold;
      feeds.push(sound);

      var color = PRISM.color(k);
      color._surface = 'concave'; color._channel = 'color'; color.ts = k.last_fold;
      feeds.push(color);
    }

    // Voxel sort all feeds
    var voxels = voxelSort(feeds);

    // Arrange in π ring
    var ring = piRing(voxels);

    // Store the hub state
    state.lens = LENS;
    state.voxels = voxels.length;
    state.ring = {
      total: ring.total,
      light: ring.sectors.light.feeds.length,
      sound: ring.sectors.sound.feeds.length,
      color: ring.sectors.color.feeds.length,
      gas: ring.gas_count
    };
    state.routed_at = new Date().toISOString();

    // Dispatch to subsystems (if they're listening)
    if (window._piBus && window._piBus.publish) {
      window._piBus.publish('hub-lens', state);
    }

    // Emit to membrane-sight (light channel)
    if (window._membraneSight && window._membraneSight.updateFromHub) {
      window._membraneSight.updateFromHub(ring.sectors.light);
    }

    // Emit to membrane-sound (sound channel)
    if (window._membraneSound && window._membraneSound.updateFromHub) {
      window._membraneSound.updateFromHub(ring.sectors.sound);
    }

    // Emit to weather-song (outside rhythm → color + sound)
    if (window._weatherSong && window._weatherSong.score) {
      state.weather = window._weatherSong.score();
    }

    return state;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — the lens view itself (optional HUD element)
  // Flat from the side: a thin line. But zoom in: curves + optics.
  // ═══════════════════════════════════════════════════════════

  function renderLensWidget() {
    var el = document.getElementById('hub-lens');
    if (!el) return;

    var state = route();
    var klein = state.klein || {};
    var piR = klein.pi_ratio || 0;
    var gas = klein.gas_ratio || 1;
    var svcs = klein.services_alive || 0;

    // Gas color: green → yellow → red
    var gasColor = gas < 0.1 ? '#3fb950' : gas < 0.5 ? '#d29922' : '#f85149';
    // Pi color: blue gradient based on ratio
    var piHue = Math.round(200 + piR * 60); // 200 (deep blue) → 260 (purple) as ratio grows

    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;font-family:monospace;font-size:11px;color:#8b949e">' +
        // The lens: flat from the side (a thin vertical line)
        '<div style="position:relative;width:6px;height:48px;background:linear-gradient(180deg,hsl(' + piHue + ',70%,50%),transparent);border-radius:3px;overflow:visible" title="hub-lens: flat from the side">' +
          // Convex curve (outward bulge on right)
          '<div style="position:absolute;right:-8px;top:4px;width:12px;height:18px;border:1px solid hsl(' + piHue + ',70%,40%);border-left:none;border-radius:0 50% 50% 0;opacity:.6" title="convex: public surface"></div>' +
          // Concave curve (inward dip on left)
          '<div style="position:absolute;left:-8px;top:26px;width:12px;height:18px;border:1px solid ' + gasColor + ';border-right:none;border-radius:50% 0 0 50%;opacity:.6" title="concave: internal surface"></div>' +
        '</div>' +
        // Labels
        '<div>' +
          '<div style="color:hsl(' + piHue + ',70%,60%)">π ' + piR.toFixed(3) + ' → ' + (piR * PI).toFixed(2) + '</div>' +
          '<div style="color:' + gasColor + '">gas ' + gas.toFixed(4) + '</div>' +
          '<div>' + svcs + '/10 svcs</div>' +
          (state.ring ? '<div>ring: ' + state.ring.light + '☀ ' + state.ring.sound + '♪ ' + state.ring.color + '◉</div>' : '') +
        '</div>' +
      '</div>';
  }

  // ═══ EXPOSE ═══
  window._hubLens = {
    LENS: LENS,
    CONVEX: CONVEX,
    CONCAVE: CONCAVE,
    PRISM: PRISM,
    MIRROR: MIRROR,
    voxelSort: voxelSort,
    piRing: piRing,
    route: route,
    render: renderLensWidget
  };

  // Route on load, then every π² seconds (synced with pi-bus fast rate)
  setTimeout(function() {
    route();
    renderLensWidget();
  }, 500);

  setInterval(function() {
    route();
    renderLensWidget();
  }, Math.round(PI * PI * 1000)); // ~9.87 seconds
})();
