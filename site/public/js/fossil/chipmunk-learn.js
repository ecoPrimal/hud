/* chipmunk-learn.js — learning engine
 * Extracted from chipmunk-mind.js. Three phases:
 * mimic (watch data) → mirror (predict) → reflect (evaluate).
 */
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) return;

  var cache      = _c.cache;
  var learning   = _c.learning;
  var n          = _c.n;
  var addEntry   = _c.addEntry;
  var checkPhase = _c.checkPhase;
  var sortQueue  = _c.sortQueue;
  var curiosity  = _c.curiosity;
  var sessionId  = _c.sessionId;

  // --- mimicSort (L2420) ---
  function mimicSort() {
    if (!cache.scanSort || !cache.scanSort.sort) return;
    var u = cache.scanSort.sort.unified_sort || {};

    // Build a ratio model: what fraction are self vs non-self?
    var total = u.total || 1;
    learning.selfRatio = (u.self || 0) / total;
    learning.nonSelfRatio = (u.non_self || 0) / total;
    learning.partialRatio = (u.partial || 0) / total;
    learning.nullRatio = (u.null || 0) / total;
  }

  // --- mimicBraids (L2433) ---
  function mimicBraids() {
    if (!cache.braid || !cache.braid.braids) return;
    cache.braid.braids.forEach(function(b) {
      var key = b.from + ':' + b.to;
      var prev = learning.braidMemory[key];
      learning.braidMemory[key] = {
        strength: b.strength,
        trend: b.trend,
        delta: b.delta,
        ts: Date.now(),
        prev: prev ? prev.strength : null,
      };
    });
  }

  // --- mimicOrbits (L2449) ---
  function mimicOrbits() {
    if (!cache.human || !cache.human.orbits) return;
    learning.orbitPatterns = cache.human.orbits.map(function(o) {
      return { path: o.path, visitors: o.visitors };
    });
  }

  // --- mimicFleet (L2458) ---
  function mimicFleet() {
    var d = cache.dashboard;
    if (!d) return;
    var anderson = d.anderson_selectivity || {};
    var modes = anderson.modes || [];

    modes.forEach(function(m) {
      if (m.class === 'human' || m.class === 'sovereign') return;
      var key = 'fleet:' + m.class;
      var prev = learning.fleetMemory[key];
      learning.fleetMemory[key] = {
        count: m.count,
        p_obs: m.p_observed,
        p_pred: m.p_predicted,
        ts: Date.now(),
        prev_count: prev ? prev.count : null,
        delta: prev ? m.count - prev.count : 0,
      };
    });

    // Learn fleet behavioral signatures
    var timing = d.timing || {};
    learning.fleetMemory._timing = {
      cv: timing.cv || 0,
      interval_ms: timing.avg_interval_ms || 0,
      confidence: timing.machine_confidence || 'UNKNOWN',
    };

    // Track the ratio — this is the core non-self signature
    var fleetTotal = 0, humanTotal = 0;
    modes.forEach(function(m) {
      if (m.class === 'human') humanTotal = m.count;
      else if (m.class !== 'sovereign') fleetTotal += m.count;
    });
    learning.fleetMemory._ratio = fleetTotal / Math.max(1, humanTotal);

    // Record a fleet pattern if something interesting happened
    var patterns = learning.fleetPatterns;
    if (patterns.length > 20) patterns.shift(); // keep last 20

    // Detect new stealth entities
    var stealth = modes.find(function(m) { return m.class === 'stealth'; });
    if (stealth && stealth.count > 0) {
      var prevStealth = learning.fleetMemory['fleet:stealth'];
      if (prevStealth && prevStealth.prev_count !== null && stealth.count !== prevStealth.prev_count) {
        patterns.push({
          type: 'stealth_change',
          from: prevStealth.prev_count,
          to: stealth.count,
          ts: Date.now(),
        });
      }
    }

    // Detect ghost population shifts
    var ghost = modes.find(function(m) { return m.class === 'ghost'; });
    if (ghost) {
      var prevGhost = learning.fleetMemory['fleet:ghost'];
      if (prevGhost && prevGhost.prev_count !== null) {
        var ghostDelta = Math.abs(ghost.count - prevGhost.prev_count);
        if (ghostDelta > 100) {
          patterns.push({
            type: 'ghost_shift',
            delta: ghost.count - prevGhost.prev_count,
            count: ghost.count,
            ts: Date.now(),
          });
        }
      }
    }
  }

  // --- mirrorFleet (L2531) ---
  function mirrorFleet() {
    if (learning.phase === 'mimic') return;
    var mem = learning.fleetMemory;
    if (!mem._timing) return;

    // Predict: will ghost count go up or down next cycle?
    var ghost = mem['fleet:ghost'];
    if (ghost && ghost.prev_count !== null) {
      var direction = ghost.count > ghost.prev_count ? 'up' : ghost.count < ghost.prev_count ? 'down' : 'stable';
      var prediction = {
        entity: 'fleet:ghost',
        type: 'fleet_direction',
        predicted: direction,
        count_at_prediction: ghost.count,
        ts: Date.now(),
      };
      learning.predictions.push(prediction);
      if (learning.predictions.length > 50) learning.predictions.shift();
    }

    // Predict: is the fleet-to-human ratio increasing or stable?
    if (mem._ratio) {
      var prevRatio = mem._prevRatio || mem._ratio;
      var ratioDir = mem._ratio > prevRatio * 1.05 ? 'increasing' : mem._ratio < prevRatio * 0.95 ? 'decreasing' : 'stable';
      learning.predictions.push({
        entity: 'fleet:ratio',
        type: 'fleet_ratio_trend',
        predicted: ratioDir,
        ratio: mem._ratio,
        ts: Date.now(),
      });
      mem._prevRatio = mem._ratio;
    }
  }

  // --- mirrorSort (L2567) ---
  function mirrorSort() {
    if (learning.phase === 'mimic') return; // not ready yet
    if (!sortQueue || sortQueue.length === 0) return;

    // Pick the next unsorted item
    var item = sortQueue[0];
    if (!item) return;

    // Use learned ratios to guess
    var r = Math.random();
    var guess;
    if (r < learning.selfRatio) guess = 'self';
    else if (r < learning.selfRatio + learning.nonSelfRatio) guess = 'non-self';
    else if (r < learning.selfRatio + learning.nonSelfRatio + learning.partialRatio) guess = 'partial';
    else guess = 'skip';

    // Don't actually vote — just predict and wait for human
    learning.predictions.push({
      entity: item.entity,
      guess: guess,
      ts: Date.now()
    });

    addEntry('chipmunk', '<span class="dim">&#129300;</span> i think <span class="good">' +
      item.entity + '</span> is <span class="num">' + guess + '</span>' +
      '\n<span class="dim">confidence: ' + n(learning.confidence * 100, 0) + '%</span>');

    // Journal the prediction
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'PREDICT: ' + item.entity + ' \u2192 ' + guess,
          context: {
            phase: learning.phase,
            confidence: learning.confidence,
            selfRatio: learning.selfRatio,
            attention: curiosity.attention
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // --- mirrorBraids (L2614) ---
  function mirrorBraids() {
    if (learning.phase === 'mimic') return;

    var changes = [];
    var mem = learning.braidMemory;
    Object.keys(mem).forEach(function(key) {
      var b = mem[key];
      if (b.prev !== null && b.prev !== b.strength) {
        var delta = b.strength - b.prev;
        if (Math.abs(delta) > 0.5) {
          changes.push({
            braid: key,
            delta: delta,
            direction: delta > 0 ? 'growing' : 'fading'
          });
        }
      }
    });

    if (changes.length > 0) {
      var lines = ['<span class="dim">&#128269; braid changes detected:</span>'];
      changes.slice(0, 3).forEach(function(c) {
        var icon = c.direction === 'growing' ? '\u2191' : '\u2193';
        lines.push('  ' + icon + ' ' + c.braid.replace(':', ' \u2194 ') +
          ' (' + (c.delta > 0 ? '+' : '') + n(c.delta, 1) + ')');
      });
      addEntry('chipmunk', lines.join('\n'));
    }
  }

  // --- reflect (L2645) ---
  function reflect() {
    if (learning.phase !== 'reflect') return;
    if (Date.now() - learning.lastReflection < 120000) return; // every 2 min max
    learning.lastReflection = Date.now();

    var lines = ['<span class="dim">&#128694; reflecting...</span>'];

    // Check prediction accuracy
    if (learning.total > 0) {
      var accuracy = learning.correct / learning.total;
      learning.confidence = accuracy;
      lines.push('predictions: ' + learning.correct + '/' + learning.total +
        ' (' + n(accuracy * 100, 0) + '% accurate)');

      if (accuracy > 0.7) {
        lines.push('<span class="good">getting better at sorting</span>');
      } else if (accuracy < 0.4) {
        lines.push('<span class="warn">still learning \u2014 need more data</span>');
      }
    }

    // Braid pattern detection
    var growing = 0, fading = 0, stable = 0;
    Object.keys(learning.braidMemory).forEach(function(key) {
      var b = learning.braidMemory[key];
      if (b.trend === 'growing') growing++;
      else if (b.trend === 'fading') fading++;
      else stable++;
    });
    lines.push('braids: ' + growing + ' growing, ' + fading + ' fading, ' + stable + ' stable');

    // Phase assessment — should we advance?
    if (learning.phase === 'reflect' && learning.total >= 10 && learning.confidence > 0.6) {
      lines.push('<span class="good">\u2713 i can sort on my own now</span>');
    }

    addEntry('chipmunk', lines.join('\n'));

    // Journal reflection
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'REFLECT: phase=' + learning.phase +
            ' accuracy=' + n(learning.confidence, 2) +
            ' predictions=' + learning.total,
          context: {
            phase: learning.phase,
            confidence: learning.confidence,
            growing: growing, fading: fading, stable: stable
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // --- learnCycle (L2723) ---
  function learnCycle() {
    mimicSort();
    mimicBraids();
    mimicOrbits();
    mimicFleet();
    checkPhase();

    if (learning.phase === 'mirror') {
      mirrorSort();
      mirrorBraids();
      mirrorFleet();
    }

    if (learning.phase === 'reflect') {
      reflect();
    }
  }


  // ═══ EXPORT ═══
  window._chipmunkLearn = {
    mimicSort: mimicSort,
    mimicBraids: mimicBraids,
    mimicOrbits: mimicOrbits,
    mimicFleet: mimicFleet,
    mirrorFleet: mirrorFleet,
    mirrorSort: mirrorSort,
    mirrorBraids: mirrorBraids,
    reflect: reflect,
    learnCycle: learnCycle
  };
})();
