/* pi-step-dance.js — predict next meta-instant from last→this→next
 *
 * The π-step dance:
 *   WAS (last instant) → IS (this moment) → NOW (emerging) → NEXT (predicted)
 *
 * Each step is a π-bounce. The remainder IS the prediction error.
 * Shannon entropy sorts the voxels. Pressure detects signal/noise approach.
 * Sensation = the IS→NOW gradient. Pressure = the NOW→NEXT gradient.
 * When both align: SIGNALPOINT APPROACHES — that's where WAS becomes NOW.
 *
 * The dance:
 *   step 0: sample all feeds (the voxel field)
 *   step 1: Shannon-sort → bits per feed (entropy = surprise per observation)
 *   step 2: π-budget compress → which feeds fit the budget, which gas off
 *   step 3: sensation detect → IS→NOW gradient (what's CHANGING)
 *   step 4: pressure detect → NOW→NEXT gradient (what's APPROACHING)
 *   step 5: predict next meta-instant (the π-step)
 *
 * "we only have to predict the next meta-instant
 *  from the last instant to this moment to the next"
 *
 * Wave 180. The dance IS the sort.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var LOG2 = Math.log(2);

  // ═══════════════════════════════════════════════════════════
  // SHANNON ENTROPY — bits per observation
  // H = -Σ p(x) log₂ p(x)
  // Low entropy = predictable = known = compress hard
  // High entropy = surprising = novel = keep in center (π remainder)
  // ═══════════════════════════════════════════════════════════
  function shannon(distribution) {
    var total = 0;
    for (var k in distribution) total += distribution[k];
    if (total === 0) return 0;

    var H = 0;
    for (var k2 in distribution) {
      var p = distribution[k2] / total;
      if (p > 0) H -= p * Math.log(p) / LOG2;
    }
    return H;
  }

  // Shannon per feed: how surprising is this data?
  function feedEntropy(key, data) {
    if (!data) return { key: key, H: 0, bits: 0, surprise: 'dead' };

    var dist = {};

    // Extract a distribution from any feed
    if (data.trust_gradient) {
      dist = data.trust_gradient;
    } else if (data.classification) {
      dist = data.classification;
    } else if (data.weather) {
      dist = data.weather;
    } else if (data.mix) {
      dist = data.mix;
    } else if (data.rays) {
      for (var r in data.rays) {
        if (data.rays[r] && data.rays[r].count) dist[r] = data.rays[r].count;
      }
    } else if (data.graph && data.graph.categories) {
      data.graph.categories.forEach(function (c) { dist[c.name] = c.nodes || 1; });
    } else if (data.faces) {
      data.faces.forEach(function (f) { dist[f.name] = f.repos || 1; });
    } else if (data.services) {
      for (var s in data.services) {
        var sv = data.services[s];
        dist[s] = typeof sv === 'string' ? (sv === 'active' ? 1 : 0) : (sv.status === 'active' ? 1 : 0);
      }
    } else {
      // Fallback: count keys as uniform distribution
      var keys = Object.keys(data);
      keys.forEach(function (k) { dist[k] = 1; });
    }

    var H = shannon(dist);
    var maxH = Math.log(Math.max(Object.keys(dist).length, 2)) / LOG2;
    var surprise = H / Math.max(maxH, 0.001);

    return {
      key: key,
      H: H,
      maxH: maxH,
      bits: H,
      surprise: surprise > 0.9 ? 'novel' : surprise > 0.5 ? 'mixed' : surprise > 0.1 ? 'known' : 'dead',
      ratio: surprise,
      dist_size: Object.keys(dist).length,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // TENSE WINDOW — WAS / IS / NOW / NEXT
  // ═══════════════════════════════════════════════════════════
  var tense = {
    was: null,    // last sample (t-1)
    is: null,     // current sample (t)
    now: null,    // emerging (is + sensation)
    next: null,   // predicted (now + pressure)
    step: 0,      // π-bounce counter
    ts: 0,
  };

  // ═══════════════════════════════════════════════════════════
  // SENSATION — the IS→NOW gradient (what's CHANGING)
  // ═══════════════════════════════════════════════════════════
  function sensation(was, is) {
    if (!was || !is) return { delta: 0, direction: 'unknown', magnitude: 0 };

    var deltas = {};
    var totalDelta = 0;

    // Compare entropy of each feed between WAS and IS
    for (var key in is) {
      var wasH = (was[key] && was[key].H) || 0;
      var isH = (is[key] && is[key].H) || 0;
      var d = isH - wasH;
      deltas[key] = d;
      totalDelta += Math.abs(d);
    }

    // Find the feed with the biggest change — that's the sensation
    var maxKey = null, maxDelta = 0;
    for (var k in deltas) {
      if (Math.abs(deltas[k]) > maxDelta) {
        maxDelta = Math.abs(deltas[k]);
        maxKey = k;
      }
    }

    return {
      delta: totalDelta,
      direction: totalDelta > 0.5 ? 'rising' : totalDelta < -0.5 ? 'falling' : 'stable',
      magnitude: totalDelta,
      hottest: maxKey,
      hottest_delta: maxDelta,
      all: deltas,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PRESSURE — the NOW→NEXT gradient (what's APPROACHING)
  // Signal/noise approaches. Signalpoint = where pressure exceeds sensation.
  // ═══════════════════════════════════════════════════════════
  function pressure(sensations) {
    if (!sensations || sensations.length < 2) return { approaching: false, gradient: 0 };

    // Look at last 3 sensations — is the delta ACCELERATING?
    var recent = sensations.slice(-3);
    var deltas = recent.map(function (s) { return s.delta; });

    // First derivative: velocity of change
    var velocities = [];
    for (var i = 1; i < deltas.length; i++) {
      velocities.push(deltas[i] - deltas[i - 1]);
    }

    // Second derivative: acceleration — IS the change CHANGING?
    var acceleration = 0;
    if (velocities.length >= 2) {
      acceleration = velocities[velocities.length - 1] - velocities[velocities.length - 2];
    } else if (velocities.length === 1) {
      acceleration = velocities[0];
    }

    // Signalpoint: acceleration exceeds threshold
    var approaching = Math.abs(acceleration) > 0.1;
    var signalDirection = acceleration > 0 ? 'intensifying' : 'dissipating';

    return {
      approaching: approaching,
      gradient: acceleration,
      velocity: velocities[velocities.length - 1] || 0,
      direction: signalDirection,
      signalpoint: approaching ? 'SIGNALPOINT: ' + signalDirection : null,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PREDICT — the π-step into NEXT
  // From last→this→next. One π-bounce forward.
  // ═══════════════════════════════════════════════════════════
  function predict(is_entropies, sens, press) {
    if (!is_entropies) return null;

    var predicted = {};
    for (var key in is_entropies) {
      var isH = is_entropies[key].H || 0;
      var delta = (sens && sens.all && sens.all[key]) || 0;
      var accel = press ? press.gradient * 0.1 : 0;

      // π-step: predict H at next instant
      var nextH = isH + delta + accel;
      // Clamp to [0, max possible entropy]
      nextH = Math.max(0, nextH);

      // π-bounce the prediction — carry + remainder
      var carry = Math.floor(nextH / PI);
      var remainder = (nextH / PI) - carry;

      predicted[key] = {
        key: key,
        H: nextH,
        carry: carry,
        remainder: remainder,
        surprise: nextH > isH + 0.5 ? 'rising' : nextH < isH - 0.5 ? 'falling' : 'stable',
        pi_step: delta + accel,
      };
    }

    return predicted;
  }

  // ═══════════════════════════════════════════════════════════
  // COMPRESS — π-budget sort. Shannon decides who fits.
  // Low entropy (known/boring) → sides (integer part)
  // High entropy (novel/surprising) → center (irrational remainder)
  // ═══════════════════════════════════════════════════════════
  function piCompress(entropies) {
    var items = [];
    for (var k in entropies) items.push(entropies[k]);

    // Sort by Shannon entropy: highest (most surprising) first
    items.sort(function (a, b) { return b.H - a.H; });

    // π² = 9.87 → 9 core slots + 0.87 remainder
    var budget = PI * PI;
    var capacity = Math.floor(budget);
    var remainder = budget - capacity;

    var center = [];  // novel (the irrational slot)
    var sides = [];   // known (the integer slots)
    var gas = [];     // overflow (vented)

    items.forEach(function (item) {
      if (center.length === 0 && item.surprise === 'novel') {
        center.push(item);
      } else if (sides.length < capacity) {
        sides.push(item);
      } else {
        gas.push(item);
      }
    });

    return {
      center: center,
      sides: sides,
      gas: gas,
      budget: budget,
      capacity: capacity,
      remainder: remainder,
      fill: (center.length + sides.length) / budget,
      compression: items.length > 0 ? items.length + ':' + (center.length + sides.length) : '0:0',
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DANCE STEP — one full cycle of the π-step dance
  // ═══════════════════════════════════════════════════════════
  var sensationHistory = [];

  function danceStep() {
    var anchor = window._voxelAnchor;
    if (!anchor) return;

    var state = anchor.state();
    if (!state || !state.layers) return;

    // Step 0: Sample all feeds → entropy map
    var entropies = {};
    for (var layer in state.layers) {
      for (var feed in state.layers[layer]) {
        var data = state.layers[layer][feed];
        entropies[feed] = feedEntropy(feed, data);
      }
    }

    // Step 1: Shannon sort complete — entropies computed

    // Step 2: π-budget compress
    var compressed = piCompress(entropies);

    // Step 3: Sensation detect (IS→NOW gradient)
    var sens = sensation(tense.was, entropies);
    sensationHistory.push(sens);
    if (sensationHistory.length > 10) sensationHistory.shift();

    // Step 4: Pressure detect (NOW→NEXT gradient)
    var press = pressure(sensationHistory);

    // Step 5: Predict NEXT meta-instant
    var predicted = predict(entropies, sens, press);

    // Update tense window
    tense.was = tense.is;
    tense.is = entropies;
    tense.now = { entropies: entropies, sensation: sens, pressure: press, compressed: compressed };
    tense.next = predicted;
    tense.step++;
    tense.ts = Date.now();

    // Emit event
    try {
      document.dispatchEvent(new CustomEvent('pi-step', {
        detail: {
          step: tense.step,
          sensation: sens,
          pressure: press,
          compressed: compressed,
          predicted: predicted,
          signalpoint: press.signalpoint,
        }
      }));
    } catch (e) {}

    return tense;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — show the dance on the HUD
  // ═══════════════════════════════════════════════════════════
  function renderDance() {
    var existing = document.getElementById('pi-step-dance');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'pi-step-dance';
    el.style.cssText = 'position:fixed;top:168px;right:12px;z-index:5;'
      + 'background:rgba(22,27,34,.85);border:1px solid rgba(88,166,255,.25);'
      + 'padding:8px 12px;border-radius:8px;width:160px;pointer-events:auto;'
      + 'font:10px monospace;color:#c9d1d9;';

    function update() {
      if (!tense.now) {
        el.innerHTML = '<div style="color:#58a6ff;font-weight:bold;font-size:11px">♫ π-step dance</div>'
          + '<div style="color:#484f58;font-size:9px">waiting for voxels...</div>';
        return;
      }

      var sens = tense.now.sensation || {};
      var press = tense.now.pressure || {};
      var comp = tense.now.compressed || {};
      var signalColor = press.approaching ? '#f0e68c' : '#484f58';
      var sensColor = sens.magnitude > 1 ? '#f0883e' : sens.magnitude > 0.3 ? '#f0e68c' : '#3fb950';

      el.innerHTML = ''
        + '<div style="color:#58a6ff;font-weight:bold;font-size:11px">♫ π-step dance</div>'
        + '<div style="color:#484f58;font-size:9px">step ' + tense.step + ' · wave ' + (tense.ts ? 'live' : '—') + '</div>'

        // Tense window
        + '<div style="margin-top:5px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">'
        + '<div style="font-size:9px">'
        + '<span style="color:#8b949e">WAS</span> → '
        + '<span style="color:#3fb950;font-weight:bold">IS</span> → '
        + '<span style="color:#f0e68c">NOW</span> → '
        + '<span style="color:#a371f7">NEXT</span>'
        + '</div>'

        // Sensation (IS→NOW)
        + '<div style="margin-top:3px;font-size:9px">'
        + '<span style="color:' + sensColor + '">⚡ sens:</span> '
        + (sens.magnitude || 0).toFixed(2)
        + (sens.hottest ? ' <span style="color:#484f58">(' + sens.hottest + ')</span>' : '')
        + '</div>'

        // Pressure (NOW→NEXT)
        + '<div style="font-size:9px">'
        + '<span style="color:' + signalColor + '">◉ press:</span> '
        + (press.gradient || 0).toFixed(3)
        + ' <span style="color:#484f58">' + (press.direction || '') + '</span>'
        + '</div>'

        // Signalpoint
        + (press.signalpoint
          ? '<div style="font-size:9px;color:#f0e68c;font-weight:bold;margin-top:2px">⚠ ' + press.signalpoint + '</div>'
          : '')

        // π-compress
        + '<div style="margin-top:3px;font-size:9px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">'
        + '<span style="color:#a371f7">π²:</span> '
        + (comp.center ? comp.center.length : 0) + ' novel · '
        + (comp.sides ? comp.sides.length : 0) + ' known · '
        + (comp.gas ? comp.gas.length : 0) + ' gas'
        + '</div>'

        // Fill bar
        + '<div style="background:#161b22;border-radius:3px;height:6px;overflow:hidden;margin-top:3px">'
        + '<div style="height:100%;width:' + ((comp.fill || 0) * 100).toFixed(0) + '%;'
        + 'background:linear-gradient(90deg,#3fb950,#58a6ff,#a371f7);border-radius:3px"></div>'
        + '</div>'

        + '</div>';
    }

    update();
    setInterval(update, 5000);
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE API
  // ═══════════════════════════════════════════════════════════
  window._piStepDance = {
    step: danceStep,
    tense: function () { return tense; },
    shannon: shannon,
    feedEntropy: feedEntropy,
    compress: piCompress,
    sensation: function () { return sensationHistory; },
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT — dance every π² seconds (≈10s)
  // ═══════════════════════════════════════════════════════════
  function init() {
    renderDance();

    // First step after voxel-anchor has loaded
    setTimeout(function () {
      danceStep();
      // Then dance every π² seconds
      setInterval(danceStep, Math.round(PI * PI * 1000));
    }, 3000);

    console.log('[pi-step-dance] WAS→IS→NOW→NEXT. Shannon sort → π-compress → sensation → pressure → predict. the dance IS the sort.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
