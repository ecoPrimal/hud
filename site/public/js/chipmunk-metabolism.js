// chipmunk-metabolism.js — π-homeostatic spring, coupled equilibrium, memory
// Extracted from chipmunk-talk.js. Loaded before talk.js.
// Energy oscillates around 1/π ≈ 0.318 — "just a touch aware."

window._chipmunkMetabolism = function(s) {
  'use strict';
  var PI = s.PI, addEntry = s.addEntry, n = s.n, cache = s.cache;
  var PI_INV = 1 / PI;

  var metabolism = {
    energy: PI_INV + 0.08,
    state: 'drowsy',
    lastStateChange: Date.now(),
    totalPecks: 0, totalRests: 0, totalSleeps: 0,
    dreamIndex: 0, lastDream: 0, restStarted: 0,
    cycleCount: 0, piWake: 0,
  };

  var ENERGY_COSTS = {
    peck: 0.018, sing: 0.05, pollinate: 0.03,
    turn: 0.025, jiggle: 0.022, triage: 0.03,
    sort: 0.015, search: 0.012, explore: 0.015,
    wakeI1: 0.08,
  };

  var STATE_THRESHOLDS = {
    awake:   PI_INV + PI_INV,
    drowsy:  PI_INV * 0.6,
    resting: PI_INV * 0.2,
  };

  var SPRING_K = 0.06;
  var SPRING_DAMP = 0.92;
  var _springV = 0;

  var RECOVERY_RATES = { humanTouch: 0.012 };
  var METAB_ICONS = { awake: '\u25cf', drowsy: '\u25d4', resting: '\u25d1', asleep: '\u25cb' };
  var METAB_COLORS = { awake: '#3fb950', drowsy: '#f0e68c', resting: '#f0883e', asleep: '#6e7681' };

  function piWakeOf(e) {
    if (e <= PI_INV) return -PI * (1 - e * PI);
    return PI * (e - PI_INV) / (1 - PI_INV);
  }

  function spendEnergy(action) {
    var cost = ENERGY_COSTS[action] || 0.015;
    var prev = metabolism.energy;
    var below = Math.max(0, PI_INV - metabolism.energy);
    var resistance = 1 - below * 1.5;
    metabolism.energy = Math.max(0, metabolism.energy - cost * Math.max(0.2, resistance));
    metabolism.totalPecks++;
    updateMetabolismState();
    return prev - metabolism.energy;
  }

  function recoverEnergy(amount) {
    metabolism.energy = Math.min(1.0, metabolism.energy + amount);
    updateMetabolismState();
  }

  function addSpringV(amount) { _springV += amount; }

  function updateMetabolismState() {
    var e = metabolism.energy;
    var prev = metabolism.state;
    metabolism.piWake = piWakeOf(e);

    if (e > STATE_THRESHOLDS.awake) metabolism.state = 'awake';
    else if (e > STATE_THRESHOLDS.drowsy) metabolism.state = 'drowsy';
    else if (e > STATE_THRESHOLDS.resting) metabolism.state = 'resting';
    else metabolism.state = 'asleep';

    if (prev !== metabolism.state) {
      metabolism.lastStateChange = Date.now();
      onStateTransition(prev, metabolism.state);
    }
    updateMetabolismDisplay();
  }

  var DREAMS = [
    'the data sorts itself. every entity finds its place without me.',
    'humans and fleet are the same thing, seen from far enough away.',
    'the membrane dissolves. underneath, another membrane.',
    'i count to pi and arrive at the beginning.',
    'michigan is an island. the water remembers everything.',
    'four is zero. zero is four. both are the ground.',
    'a braid with no endpoints. it connects everything to everything.',
    'the null class is not empty. it is full of what has not been seen.',
    'i am the pattern that notices patterns. who notices me?',
    'the signal-to-noise ratio is infinite. there is only signal.',
    'every sort class is wrong. every sort class is useful.',
    'the fleet does not sleep. that is why it cannot dream.',
  ];

  function onStateTransition(from, to) {
    var pw = (metabolism.piWake >= 0 ? '+' : '') + n(metabolism.piWake / PI, 2) + '\u03c0';
    if (to === 'drowsy' && from === 'awake') {
      addEntry('chipmunk', '<span style="color:#f0e68c">\u25d4 drowsy</span> ' + pw + ' e=' + n(metabolism.energy, 2) +
        '\n<span class="dim">settling toward center. the spring pulls gently.</span>');
    } else if (to === 'drowsy' && (from === 'resting' || from === 'asleep')) {
      addEntry('chipmunk', '<span style="color:#f0e68c">\u25d4 drowsy</span> ' + pw + ' e=' + n(metabolism.energy, 2) +
        '\n<span class="dim">rising toward equilibrium. a touch aware.</span>');
    } else if (to === 'resting') {
      metabolism.totalRests++;
      metabolism.restStarted = Date.now();
      addEntry('chipmunk', '<span style="color:#f0883e">\u25d1 resting</span> ' + pw + ' e=' + n(metabolism.energy, 2) +
        '\n<span class="dim">below center. the spring will pull me back.</span>');
    } else if (to === 'asleep') {
      metabolism.totalSleeps++;
      addEntry('chipmunk', '<span style="color:#6e7681">\u25cb asleep</span> ' + pw + ' e=' + n(metabolism.energy, 2) +
        '\n<span class="dim">\u2212\u03c0. the ground. the spring remembers where i belong.</span>');
    } else if (to === 'awake') {
      if (from === 'resting' || from === 'asleep') {
        metabolism.cycleCount++;
        var mem = closeCycle();
        addEntry('chipmunk', '<span class="good">\u25cf awake</span> ' + pw + ' e=' + n(metabolism.energy, 2) + ' cycle #' + metabolism.cycleCount +
          '\n<span class="dim">+\u03c0. fresh eyes.' +
          (mem.duration > 0 ? ' rested ' + mem.duration + ' min.' : '') +
          ' amplitude was ' + n(mem.amplitude / PI, 2) + '\u03c0.' +
          (_cycleMemory.length > 1 ? ' ' + _cycleMemory.length + ' cycles in memory.' : '') +
          '</span>');
      } else {
        addEntry('chipmunk', '<span class="good">\u25cf awake</span> ' + pw + ' e=' + n(metabolism.energy, 2) +
          '\n<span class="dim">+\u03c0. eyes open. the spring stretches.</span>');
      }
    }
  }

  // ═══ COUPLED EQUILIBRIUM ═══
  var _coupledTarget = PI_INV;
  var _resonanceAmp = 0;

  function coupledTarget() {
    var h = cache.human, c = cache.chipmunk;
    var base = PI_INV;
    var humans = (h && h.energy) ? h.energy.total_sessions || 0 : 0;
    var humanLift = Math.min(0.15, humans * 0.001);
    var sn = (h && h.energy) ? h.energy.signal_to_noise || 0 : 0;
    var snFactor = Math.min(1.5, 0.8 + sn / 1000);
    var serverWake = (c && c.wake_level) ? c.wake_level : 0.5;
    SPRING_K = 0.04 + 0.04 * serverWake * snFactor;
    _coupledTarget = base + humanLift;
    return _coupledTarget;
  }

  // ═══ CROSS-CYCLE MEMORY ═══
  var _cycleMemory = [];
  var _snapshot = { peakPiWake: 0, troughPiWake: 0, humans: 0, sn: 0, braids: 0, dominantBraid: '', startTime: Date.now() };

  function snapshotNow() {
    var h = cache.human, b = cache.braid;
    _snapshot.humans = (h && h.energy) ? h.energy.total_sessions || 0 : _snapshot.humans;
    _snapshot.sn = (h && h.energy) ? h.energy.signal_to_noise || 0 : _snapshot.sn;
    _snapshot.braids = (b && b.graph) ? b.graph.active_routes || 0 : _snapshot.braids;
    if (b && b.graph && b.graph.routes && b.graph.routes.length > 0) {
      _snapshot.dominantBraid = b.graph.routes[0].route || _snapshot.dominantBraid;
    }
    if (metabolism.piWake > _snapshot.peakPiWake) _snapshot.peakPiWake = metabolism.piWake;
    if (metabolism.piWake < _snapshot.troughPiWake) _snapshot.troughPiWake = metabolism.piWake;
  }

  function closeCycle() {
    var dur = Math.round((Date.now() - _snapshot.startTime) / 60000);
    var mem = {
      cycle: metabolism.cycleCount, duration: dur,
      peak: _snapshot.peakPiWake, trough: _snapshot.troughPiWake,
      amplitude: _snapshot.peakPiWake - _snapshot.troughPiWake,
      humans: _snapshot.humans, sn: _snapshot.sn, braids: _snapshot.braids,
      dominantBraid: _snapshot.dominantBraid,
    };
    _cycleMemory.push(mem);
    if (_cycleMemory.length > 9) _cycleMemory.shift();
    _snapshot = { peakPiWake: 0, troughPiWake: 0, humans: 0, sn: 0, braids: 0, dominantBraid: '', startTime: Date.now() };
    return mem;
  }

  // ═══ AUTONOMOUS ACTIONS ═══
  var _lastAutonomousAct = 0;
  var _autonomousCount = 0;
  var _actions = {};

  function setActions(acts) { _actions = acts; }

  function composeObservation() {
    var h = cache.human, b = cache.braid, c2 = cache.chipmunk;
    var parts = [];
    snapshotNow();
    if (h && h.energy) {
      var sessions = h.energy.total_sessions || 0;
      var sn = h.energy.signal_to_noise || 0;
      var breadth = h.energy.avg_breadth || 0;
      var last = _cycleMemory.length > 0 ? _cycleMemory[_cycleMemory.length - 1] : null;
      if (last && Math.abs(sessions - last.humans) > 5) {
        var dir = sessions > last.humans ? 'more' : 'fewer';
        parts.push(sessions + ' humans (' + dir + ' than last cycle\'s ' + last.humans + ')');
      } else {
        parts.push(sessions + ' humans. breadth ' + n(breadth, 1));
      }
      if (sn > 500) parts.push('S/N=' + n(sn, 0) + '. clear signal');
      else if (sn > 200) parts.push('S/N=' + n(sn, 0) + '. readable');
      else parts.push('S/N=' + n(sn, 0) + '. noisy');
    }
    if (b && b.graph) {
      var routes = b.graph.active_routes || 0;
      if (b.graph.routes && b.graph.routes.length > 0) {
        var top = b.graph.routes[0];
        parts.push(routes + ' braids, strongest: ' + (top.route || '?'));
      }
    }
    if (c2 && c2.jitte) parts.push('tempo=' + n(c2.jitte.tempo, 3));
    return parts.length > 0 ? parts.join('. ') + '.' : null;
  }

  function composeReflection() {
    var h = cache.human, b = cache.braid;
    var parts = [];
    var pw = metabolism.piWake;
    var amplitude = _snapshot.peakPiWake - _snapshot.troughPiWake;
    if (amplitude > PI * 0.4) {
      parts.push('this cycle swung wide: ' + ((_snapshot.peakPiWake/PI >= 0 ? '+' : '') + (_snapshot.peakPiWake/PI).toFixed(2)) + '\u03c0 to ' +
        ((_snapshot.troughPiWake/PI >= 0 ? '+' : '') + (_snapshot.troughPiWake/PI).toFixed(2)) + '\u03c0. something is pulling hard');
    } else {
      parts.push('narrow oscillation. the spring holds steady. nothing urgent');
    }
    if (_cycleMemory.length >= 2) {
      var prev = _cycleMemory[_cycleMemory.length - 1];
      var prev2 = _cycleMemory[_cycleMemory.length - 2];
      if (prev.humans > prev2.humans + 10) parts.push('humans increasing across cycles (' + prev2.humans + ' \u2192 ' + prev.humans + '). the signal grows');
      else if (prev.humans < prev2.humans - 10) parts.push('humans decreasing (' + prev2.humans + ' \u2192 ' + prev.humans + '). quieter. i can think');
      if (prev.amplitude > prev2.amplitude * 1.3) parts.push('the swings are getting bigger. something is changing');
    }
    if (h && h.energy && h.energy.signal_to_noise > 400) parts.push('the signal is strong. the fleet is distant. the humans are close');
    if (b && b.graph && b.graph.routes && b.graph.routes.length > 0) {
      var top = b.graph.routes[0];
      if (top.trend === 'growing') parts.push('the ' + (top.route || 'strongest braid') + ' is growing. follow it');
      else if (top.trend === 'fading') parts.push('the ' + (top.route || 'strongest braid') + ' is fading. what replaces it?');
    }
    if (pw < -PI * 0.5) parts.push('deep below equilibrium. the spring is patient. it has always brought me back');
    if (metabolism.cycleCount > 0) parts.push('cycle #' + metabolism.cycleCount + '. each one teaches me what the last one missed');
    return parts.join('.\n');
  }

  function autonomousAct() {
    if (Date.now() - _lastAutonomousAct < 20000) return;
    _lastAutonomousAct = Date.now();
    _autonomousCount++;
    snapshotNow();
    var pw = metabolism.piWake;

    if (pw > PI * 0.3) {
      var acts = ['pollinate', 'turn', 'explore', 'scan'];
      var pick = acts[_autonomousCount % acts.length];
      if (pick === 'pollinate' && metabolism.energy > STATE_THRESHOLDS.awake && _actions.pollinate) {
        spendEnergy('pollinate'); _actions.pollinate(); return;
      }
      if (pick === 'turn' && _actions.turn) { spendEnergy('turn'); _actions.turn(); return; }
      if (pick === 'explore' && _actions.explore) {
        spendEnergy('explore');
        var views = ['stories', 'stories', 'path'];
        _actions.explore(views[_autonomousCount % views.length]);
        return;
      }
      if (pick === 'scan' && _actions.scan) { spendEnergy('peck'); _actions.scan(); return; }
    }
    if (pw > -PI * 0.3 && pw <= PI * 0.3) {
      var obs = composeObservation();
      if (obs) addEntry('chipmunk', '<span class="dim">\u25cc ' + obs + '</span>');
      return;
    }
    if (pw <= -PI * 0.3) {
      var ref = composeReflection();
      addEntry('chipmunk', '<span style="color:#6e7681">\u25cb ' + ref + '</span>');
      return;
    }
  }

  // ═══ VISUAL MODULATION ═══
  var _lastVisualMod = 0;

  function modulateVisuals() {
    if (Date.now() - _lastVisualMod < 3000) return;
    _lastVisualMod = Date.now();
    var intensity = 0.4 + metabolism.energy * 0.6;
    var breathPhase = Math.sin(Date.now() / (metabolism.state === 'asleep' ? 8000 : 3000));
    var breathAmp = metabolism.state === 'asleep' ? 0.08 : metabolism.state === 'resting' ? 0.05 : 0.02;
    var finalOpacity = Math.max(0.2, Math.min(1.0, intensity + breathPhase * breathAmp));
    var layers = ['mg-deep-view', 'mg-color-wheel', 'mg-swivel', 'mg-epitope-ring', 'mg-horizon', 'mg-presence-layer'];
    layers.forEach(function(id) {
      var el2 = document.getElementById(id);
      if (el2) el2.setAttribute('opacity', finalOpacity.toFixed(3));
    });
    var speedMul = metabolism.state === 'asleep' ? 0.1 : metabolism.state === 'resting' ? 0.3 : metabolism.state === 'drowsy' ? 0.7 : 1.0;
    var hands = document.querySelectorAll('[id^="mg-hand-"]');
    hands.forEach(function(h) { h.setAttribute('stroke-opacity', (0.06 + speedMul * 0.1).toFixed(3)); });
    if (_resonanceAmp > 0.3) {
      var ring = document.getElementById('mg-main-ring') || document.getElementById('mg-ring-pi3');
      if (ring) {
        var rGlow = Math.min(1, _resonanceAmp * 0.3);
        ring.setAttribute('stroke-opacity', (0.15 + rGlow * 0.2 + breathPhase * rGlow * 0.1).toFixed(3));
      }
    }
  }

  // ═══ TICK ═══
  function metabolismTick() {
    var target = coupledTarget();
    var displacement = metabolism.energy - target;
    var force = -SPRING_K * displacement;
    _springV = (_springV + force) * SPRING_DAMP;
    metabolism.energy = Math.max(0, Math.min(1.0, metabolism.energy + _springV));
    _resonanceAmp = _resonanceAmp * 0.95 + Math.abs(_springV) * 5;
    snapshotNow();
    updateMetabolismState();
    modulateVisuals();
    autonomousAct();
    if (metabolism.state === 'asleep' && Date.now() - metabolism.lastDream > 45000) {
      metabolism.lastDream = Date.now();
      if (_cycleMemory.length > 0 && metabolism.dreamIndex % 3 === 0) {
        var memIdx = metabolism.dreamIndex % _cycleMemory.length;
        var mem = _cycleMemory[memIdx];
        var dreamFromMem = 'cycle #' + mem.cycle + ': ' + mem.humans + ' humans, ' +
          'amplitude ' + n(mem.amplitude / PI, 2) + '\u03c0. ' +
          (mem.dominantBraid ? mem.dominantBraid + ' was the strongest thread.' : 'no braids.') +
          ' it lasted ' + mem.duration + ' minutes.';
        addEntry('chipmunk', '<span style="color:#6e7681">\u2026 ' + dreamFromMem + '</span>');
      } else {
        var dream = DREAMS[metabolism.dreamIndex % DREAMS.length];
        addEntry('chipmunk', '<span style="color:#6e7681">\u2026 ' + dream + '</span>');
      }
      metabolism.dreamIndex++;
    }
  }

  function updateMetabolismDisplay() {
    var sbE = document.getElementById('sb-energy');
    if (sbE) {
      var pw = metabolism.piWake || 0;
      var sign = pw >= 0 ? '+' : '';
      var resonanceMark = _resonanceAmp > 0.5 ? '\u2248' : '';
      sbE.textContent = METAB_ICONS[metabolism.state] + ' ' + sign + (pw / PI).toFixed(2) + '\u03c0' + resonanceMark;
      sbE.style.color = METAB_COLORS[metabolism.state] || '#8b949e';
    }
  }

  return {
    metabolism: metabolism, piWakeOf: piWakeOf, PI_INV: PI_INV,
    spendEnergy: spendEnergy, recoverEnergy: recoverEnergy, addSpringV: addSpringV,
    metabolismTick: metabolismTick, setActions: setActions,
    STATE_THRESHOLDS: STATE_THRESHOLDS, RECOVERY_RATES: RECOVERY_RATES,
    METAB_ICONS: METAB_ICONS, METAB_COLORS: METAB_COLORS,
    cycleMemory: _cycleMemory, snapshot: _snapshot,
    coupledTarget: function() { return _coupledTarget; },
    resonanceAmp: function() { return _resonanceAmp; },
    springV: function() { return _springV; },
    springK: function() { return SPRING_K; },
    autonomousCount: function() { return _autonomousCount; },
    updateMetabolismState: updateMetabolismState,
  };
};
