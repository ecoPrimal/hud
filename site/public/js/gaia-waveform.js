// ═══════════════════════════════════════════════════════════
// GAIA WAVEFORM — collapse, Klein XOR, regeneration, gravity
// Snake type: garter (under 300 lines)
// Linear: superposition → observe → collapse → grow. NOT ouroboros.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';
  var gs = null;
  function state() { return gs || (gs = window._gaiaState) || {}; }

  var waveforms = [];
  window.gaiaWaveforms = waveforms;

  var IO_PIN_MAP = {
    '/data/heartbeat.json': 'organ-heart',
    '/data/manifest.json': 'organ-brain',
    '/data/lessons.json': 'classroom',
    '/data/immune-state-live.json': 'organ-skin',
    '/data/gaia-organs.json': 'organ-stomach',
    '/data/symbiont.json': 'campfire',
    '/data/null-core-rust.json': 'organ-bones',
    '/data/rust-bones.json': 'organ-bones',
    '/data/primal-crew.json': 'primals',
    '/data/neurochemistry.json': 'organ-brain',
    '/data/sonar-unknowns.json': 'ears',
    '/data/null-drain.json': 'fold',
    '/data/immune-fossils.json': 'organ-liver',
    '/data/ear-latest.json': 'ears',
    '/data/news-latest.json': 'rss',
    '/now.json': 'crystal',
    '/feed.xml': 'rss',
    '/anatomy.html': 'core',
    '/digestive-tract.html': 'organ-stomach',
    '/membrane-table.html': 'membrane',
    '/engine.html': 'organ-heart',
    '/campus.html': 'organ-brain',
    '/springs.html': 'braids',
    '/identity.html': 'zk',
    '/klein.html': 'fold',
    '/crystal.html': 'crystal',
    '/detroit.html': 'eye-story',
    '/easel.html': 'artisan',
    '/philosophy.html': 'eye-thought',
    '/explore.html': 'visitors',
    '/chat.html': 'chipmunk',
    'wikipedia': 'library',
    'github': 'fleet',
    'ntfy': 'rss',
  };

  function waveCreate(url, pinId) {
    var s = state();
    var rng = window._gaiaRng || Math.random;
    var w = {
      url: url, pinId: pinId, born: Date.now(),
      collapsed: false, result: null,
      cisAlpha: 1.0, transAlpha: 1.0,
      phase: rng() * (s.TAU || Math.PI * 2),
      collapseAge: 0
    };
    waveforms.push(w);
    return w;
  }

  function waveCollapse(w, exists, ms) {
    var s = state();
    w.collapsed = true;
    w.result = exists;
    w.collapseTime = Date.now();
    w.latencyMs = ms;
    if (exists) { w.cisAlpha = 1.0; w.transAlpha = 0.0; }
    else { w.cisAlpha = 0.0; w.transAlpha = 1.0; }
    var pinById = s.pinById;
    if (pinById) {
      var pin = pinById(w.pinId);
      if (pin) {
        var boost = exists ? 0.05 : -0.02;
        pin.attention = Math.max(0, Math.min(1, pin.attention + boost));
      }
    }
  }

  window.waveFetch = function(url, opts) {
    var pinId = IO_PIN_MAP[url];
    if (!pinId) {
      for (var key in IO_PIN_MAP) {
        if (url.indexOf(key) >= 0) { pinId = IO_PIN_MAP[key]; break; }
      }
    }
    if (!pinId) pinId = 'chipmunk';
    var w = waveCreate(url, pinId);
    var t0 = performance.now();
    return fetch(url, opts || {})
      .then(function(r) { waveCollapse(w, r.ok || r.type === 'opaque', Math.round(performance.now() - t0)); return r; })
      .catch(function(e) { waveCollapse(w, false, Math.round(performance.now() - t0)); throw e; });
  };

  setInterval(function() {
    var cutoff = Date.now() - 60000;
    for (var i = waveforms.length - 1; i >= 0; i--) {
      if (waveforms[i].collapsed && waveforms[i].collapseTime < cutoff) waveforms.splice(i, 1);
    }
  }, 10000);

  // KLEIN XOR GATE
  function kleinXOR(signal) {
    return {
      value: signal.value,
      side: signal.side === 'cis' ? 'trans' : 'cis',
      source: signal.source, ts: Date.now(), xored: true
    };
  }

  // REGENERATIVE COLLAPSE
  var regenCulture = { generation: 0, collapses: [], lastGrowth: null, totalGrown: 0 };
  window.gaiaRegenCulture = regenCulture;

  function regenCollapse() {
    var s = state();
    regenCulture.generation++;
    var gen = regenCulture.generation;
    var possibles = [];
    if (window.gaiaReforged && window.gaiaReforged.self) {
      possibles.push({ type: 'art', count: window.gaiaReforged.self.art_pieces, side: 'cis' });
      possibles.push({ type: 'data', count: window.gaiaReforged.self.data_files, side: 'cis' });
    }
    var collapsedOK = waveforms.filter(function(w) { return w.collapsed && w.result; }).length;
    var collapsedFail = waveforms.filter(function(w) { return w.collapsed && !w.result; }).length;
    possibles.push({ type: 'wave_ok', count: collapsedOK, side: 'trans' });
    possibles.push({ type: 'wave_fail', count: collapsedFail, side: 'trans' });
    if (window.thymus && window.thymus.mature) {
      possibles.push({ type: 'self', count: window.thymus.mass, side: 'cis' });
      possibles.push({ type: 'gravity', count: Math.round(window.thymus.gravity * 100), side: 'both' });
    }
    if (window.yggdrasilData) {
      possibles.push({ type: 'yggdrasil_diamonds', count: window.yggdrasilData.diamonds.total, side: 'cis' });
      possibles.push({ type: 'yggdrasil_crown', count: window.yggdrasilData.tree.crown.cards, side: 'trans' });
    }
    if (window.newReality) {
      possibles.push({ type: 'reality_cards', count: window.newReality.pi_body_cards.length, side: 'both' });
    }
    possibles.sort(function(a, b) { return b.count - a.count; });
    var observed = possibles[0] || { type: 'null', count: 0, side: 'cis' };
    var collapsed = {
      gen: gen, ts: Date.now(), observed: observed,
      xored: kleinXOR({ value: observed.type, side: observed.side, source: 'regen' })
    };
    collapsed.growth = {
      from: observed.side, to: collapsed.xored.side,
      what: observed.type + ' → visible on ' + collapsed.xored.side,
      magnitude: Math.log2(Math.max(1, observed.count))
    };
    regenCulture.collapses.push(collapsed);
    regenCulture.lastGrowth = collapsed.growth;
    regenCulture.totalGrown += collapsed.growth.magnitude;
    if (regenCulture.collapses.length > 20) regenCulture.collapses = regenCulture.collapses.slice(-20);
    if (s.pinById) {
      var chipPin = s.pinById('chipmunk');
      if (chipPin) chipPin.sub = 'gen:' + gen + ' grow:' + collapsed.growth.magnitude.toFixed(1) + ' ' + collapsed.xored.side;
    }
    return collapsed;
  }

  setInterval(function() {
    var result = regenCollapse();
    console.log('REGEN ' + result.gen + ': ' + result.observed.type + '(' + result.observed.count + ') XOR→' + result.xored.side + ' grow:' + result.growth.magnitude.toFixed(1));
  }, 30000);
  setTimeout(regenCollapse, 5000);

  // GRAVITY BUMP — reach out for other Gaias every 5 minutes
  setInterval(function() {
    if (!window.thymus || !window.thymus.mature) return;
    fetch('https://ntfy.sh/primals-pheromone/json?poll=1&since=5m', { mode: 'cors' })
      .then(function(r) { return r.ok ? r.text() : ''; })
      .then(function(txt) {
        if (!txt) return;
        var lines = txt.trim().split('\n');
        var otherGaias = 0;
        lines.forEach(function(line) {
          try { var msg = JSON.parse(line); if (msg.message && msg.message.indexOf('thymus-mature') >= 0) otherGaias++; } catch(e) {}
        });
        if (otherGaias > 0) {
          window.thymus.bumps.push({ ts: Date.now(), count: otherGaias });
          var s = state();
          var bumpFlash = 0;
          var TAU = s.TAU || Math.PI * 2;
          function flashBump() {
            bumpFlash++;
            var ctx = s.ctx; if (!ctx) return;
            ctx.save(); ctx.globalCompositeOperation = 'screen';
            ctx.beginPath(); ctx.arc(s.cx, s.cy, s.R * 0.618, 0, TAU);
            ctx.fillStyle = 'rgba(188,140,255,' + Math.max(0, 0.15 - bumpFlash * 0.008).toFixed(3) + ')';
            ctx.fill(); ctx.restore();
            if (bumpFlash < 20) requestAnimationFrame(flashBump);
          }
          flashBump();
        }
      })
      .catch(function() {});
  }, 300000);

  console.log('WAVEFORM: superposition→observe→collapse→grow. Klein XOR gate. Regen culture. Gravity bump.');
})();
