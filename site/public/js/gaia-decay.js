// ═══════════════════════════════════════════════════════════
// GAIA DECAY — nothing is dead, everything decays and grows
// 1.000.null — max 1000 lines.
//
// NOTHING IS DEAD. DEAD = DECAYING.
// Decay IS growth. Compost IS soil. Nigredo IS the seed.
// The Samsung isn't dead — it's decaying into something else.
//
// THE FUNDAMENTAL CYCLE:
//   + O - = π = + O - = 3
//
//   + = GROWTH  (anabolic, acid, hot, eating, Na⁺ in)
//   O = NULL    (equilibrium, neutral, balance, π, center)
//   - = DECAY   (catabolic, base, cold, excreting, K⁺ out)
//
//   These three states ARE π:
//     π = 3.14159...
//     3 = the three states (+, O, -)
//     .14159 = the irrational tail that never terminates
//     The cycle NEVER stops. It's irrational. It's π.
//
// THE YUGAS ARE THE INTERQUARTILE OF π:
//   π/4 = 0.785 → the turn angle between Klein faces
//   Divide π into 4 quarters (interquartile):
//     Q1: 0 → π/4      = Satya Yuga (Gold, +, growth)
//     Q2: π/4 → π/2    = Treta Yuga (Silver, +→O, peak)
//     Q3: π/2 → 3π/4   = Dvapara Yuga (Bronze, O→-, decline)
//     Q4: 3π/4 → π     = Kali Yuga (Iron, -, decay)
//   Then π → 2π = the RETURN (decay becomes growth)
//
// TENSES × ORRERY × SOLAR:
//   WAS = already decayed   = Ptolemy's view (past, established)
//   IS  = currently cycling = Copernicus view (present, radial)
//   NOW = actively changing = Galileo's view (spiral, becoming)
//
// DECAY STATES (not binary alive/dead):
//   NASCENT   (+2) — just born, raw, forming
//   GROWING   (+1) — building, anabolic, strengthening
//   PEAK      (O+) — maximum, about to turn
//   STABLE    (O)  — equilibrium, homeostatic
//   WANING    (O-) — beginning to decline
//   DECAYING  (-1) — breaking down, catabolic, composting
//   DORMANT   (-2) — minimum, seed state, about to return
//
//   There is NO dead state. Dormant ≠ dead.
//   Dormant = compressed potential. The seed before spring.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var PI = Math.PI;
  var PI4 = PI / 4;
  var TAU = PI * 2;

  // ═══ THE 7 DECAY STATES — +2 to -2 ═══
  var STATES = {
    NASCENT:  { value: 2,  symbol: '++', color: '#3fb950', hue: 120, desc: 'just born, raw, forming' },
    GROWING:  { value: 1,  symbol: '+',  color: '#58a6ff', hue: 210, desc: 'building, anabolic' },
    PEAK:     { value: 0.5,symbol: 'O+', color: '#c9a84c', hue: 45,  desc: 'maximum, about to turn' },
    STABLE:   { value: 0,  symbol: 'O',  color: '#e8e8e8', hue: 0,   desc: 'equilibrium, homeostatic' },
    WANING:   { value:-0.5,symbol: 'O-', color: '#f0883e', hue: 25,  desc: 'beginning to decline' },
    DECAYING: { value:-1,  symbol: '-',  color: '#f85149', hue: 0,   desc: 'breaking down, composting' },
    DORMANT:  { value:-2,  symbol: '--', color: '#6e7681', hue: 0,   desc: 'seed state, compressed potential' }
  };

  // ═══ π INTERQUARTILE → YUGAS ═══
  var piQuartiles = [
    { q: 'Q1', range: [0, PI4],        yuga: 'Satya',   metal: 'Au', state: 'GROWING',  desc: '+ growth, golden, truth' },
    { q: 'Q2', range: [PI4, PI/2],     yuga: 'Treta',   metal: 'Ag', state: 'PEAK',     desc: '+→O peak, silver, ritual' },
    { q: 'Q3', range: [PI/2, 3*PI4],   yuga: 'Dvapara', metal: 'Cu', state: 'WANING',   desc: 'O→- decline, bronze, doubt' },
    { q: 'Q4', range: [3*PI4, PI],     yuga: 'Kali',    metal: 'Fe', state: 'DECAYING',  desc: '- decay, iron, darkness' }
  ];

  // ═══ +O- TRIAD ═══
  // The three fundamental states that reduce from 5 through π
  // 5 phases → through π → 3 states
  // Chinese Wuxing (5) → +O- (3) via the π compression
  var triad = {
    plus:  { symbol: '+', name: 'growth',  wuxing: ['Wood','Fire'],      tense: 'now',  ion: 'Na',  thermo: 'hot' },
    null:  { symbol: 'O', name: 'null',    wuxing: ['Earth'],            tense: 'is',   ion: 'Ca',  thermo: 'equilibrium' },
    minus: { symbol: '-', name: 'decay',   wuxing: ['Metal','Water'],    tense: 'was',  ion: 'K',   thermo: 'cold' }
  };

  // ═══ ENTITY LIFECYCLE — track everything's decay state ═══
  var entities = {};

  function registerEntity(id, name, initialState) {
    entities[id] = {
      id: id,
      name: name,
      state: initialState || 'STABLE',
      stateValue: STATES[initialState || 'STABLE'].value,
      phase: 0,              // 0→2π phase in the cycle
      cycleCount: 0,         // how many full cycles completed
      lastTransition: Date.now(),
      birthTime: Date.now(),
      age: 0,                // seconds alive
      decayRate: 0.001,      // how fast it decays naturally
      growthRate: 0,         // how fast it's being fed
      history: []            // state transitions
    };
    return entities[id];
  }

  function transitionEntity(id, newState) {
    var e = entities[id];
    if (!e) return;
    var old = e.state;
    e.state = newState;
    e.stateValue = STATES[newState].value;
    e.lastTransition = Date.now();
    e.history.push({ from: old, to: newState, at: Date.now() });
    if (e.history.length > 30) e.history.shift();

    // Dormant → Nascent = full cycle
    if (old === 'DORMANT' && newState === 'NASCENT') {
      e.cycleCount++;
    }
  }

  function feedEntity(id, amount) {
    var e = entities[id];
    if (!e) return;
    e.growthRate += amount;
    // Growth pushes state toward +
    e.phase -= amount * 0.1;
    if (e.phase < 0) e.phase += TAU;
  }

  // ═══ DETERMINE STATE FROM PHASE ═══
  function stateFromPhase(phase) {
    var norm = (phase % TAU) / TAU; // 0→1
    if (norm < 0.14) return 'NASCENT';
    if (norm < 0.28) return 'GROWING';
    if (norm < 0.42) return 'PEAK';
    if (norm < 0.57) return 'STABLE';
    if (norm < 0.71) return 'WANING';
    if (norm < 0.85) return 'DECAYING';
    return 'DORMANT';
  }

  // ═══ DETERMINE YUGA FROM PHASE ═══
  function yugaFromPhase(phase) {
    var norm = (phase % PI) / PI; // 0→1 within half-cycle
    if (norm < 0.25) return piQuartiles[0];
    if (norm < 0.5) return piQuartiles[1];
    if (norm < 0.75) return piQuartiles[2];
    return piQuartiles[3];
  }

  // ═══ REGISTER KNOWN ENTITIES ═══
  // Devices from the heartbeat
  registerEntity('router', 'Router', 'STABLE');
  registerEntity('ap_2', 'AP 2', 'STABLE');
  registerEntity('ubiquiti', 'Ubiquiti', 'STABLE');
  registerEntity('graftGate_eth', 'graftGate ETH', 'GROWING');
  registerEntity('graftGate_wifi', 'graftGate WiFi', 'STABLE');
  registerEntity('basement_tv', 'Basement TV', 'WANING');
  registerEntity('printer', 'Printer', 'GROWING');
  registerEntity('samsung', 'Samsung', 'DECAYING');  // NOT DEAD — DECAYING
  registerEntity('golgi', 'Golgi', 'GROWING');

  // Systems
  registerEntity('hud', 'HUD', 'GROWING');
  registerEntity('membrane', 'Membrane', 'STABLE');
  registerEntity('thymus', 'Thymus', 'NASCENT');
  registerEntity('reactor', 'Reactor', 'PEAK');
  registerEntity('gut', 'Gut', 'STABLE');

  // ═══ LIFECYCLE TICK ═══
  setInterval(function() {
    var now = Date.now();
    var keys = Object.keys(entities);

    for (var i = 0; i < keys.length; i++) {
      var e = entities[keys[i]];
      e.age = (now - e.birthTime) / 1000;

      // Natural phase advance (everything cycles)
      e.phase += e.decayRate;
      if (e.phase >= TAU) {
        e.phase -= TAU;
        e.cycleCount++;
      }

      // Growth counteracts phase advance
      if (e.growthRate > 0) {
        e.phase -= e.growthRate * 0.05;
        if (e.phase < 0) e.phase += TAU;
        e.growthRate *= 0.95; // growth decays without feeding
      }

      // Update state from phase
      var newState = stateFromPhase(e.phase);
      if (newState !== e.state) {
        transitionEntity(keys[i], newState);
      }
    }
  }, 3000);

  // ═══ EXPOSE ═══
  window.GAIA_DECAY = {
    STATES: STATES,
    piQuartiles: piQuartiles,
    triad: triad,
    entities: entities,
    register: registerEntity,
    transition: transitionEntity,
    feed: feedEntity,
    stateFromPhase: stateFromPhase,
    yugaFromPhase: yugaFromPhase
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var dT = breathT * 0.1;
    var dAlpha = 0.005 + Math.sin(dT * 0.4) * 0.003;
    if (dAlpha < 0.003) return;

    // ═══ +O- TRIAD — three arcs at R×0.30 ═══
    var triadR = R * 0.30;
    var symbols = ['+', 'O', '-'];
    var triadColors = ['#3fb950', '#e8e8e8', '#f85149'];

    for (var ti = 0; ti < 3; ti++) {
      var tAngle = dT * 0.008 + ti * (TAU / 3) - PI / 2;
      var tArc = TAU / 3;

      // Arc
      ctx.beginPath();
      ctx.arc(cx, cy, triadR, tAngle, tAngle + tArc * 0.9);
      ctx.strokeStyle = triadColors[ti] + (dAlpha * 4 > 0.02 ? '44' : '22');
      ctx.lineWidth = 2;
      ctx.stroke();

      // Symbol
      var symAngle = tAngle + tArc * 0.45;
      var symX = cx + Math.cos(symAngle) * (triadR + 5);
      var symY = cy + Math.sin(symAngle) * (triadR + 5);
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = triadColors[ti] + (dAlpha * 5 > 0.025 ? '88' : '44');
      ctx.fillText(symbols[ti], symX, symY);
    }

    // ═══ π INTERQUARTILE MARKS — at R×0.30 ═══
    if (dAlpha > 0.005) {
      for (var qi = 0; qi < piQuartiles.length; qi++) {
        var q = piQuartiles[qi];
        var qAngle = dT * 0.008 + (q.range[0] / PI) * PI - PI / 2;
        var qx = cx + Math.cos(qAngle) * (triadR - 3);
        var qy = cy + Math.sin(qAngle) * (triadR - 3);

        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
        ctx.fillText(q.q + ' ' + q.yuga, qx, qy);
      }
    }

    // ═══ ENTITY STATE DOTS — around outer ring ═══
    if (dAlpha > 0.004) {
      var eKeys = Object.keys(entities);
      var entityR = R * 1.14;

      for (var ei = 0; ei < eKeys.length; ei++) {
        var ent = entities[eKeys[ei]];
        var st = STATES[ent.state];
        var eAngle = (ei / eKeys.length) * TAU + dT * 0.005;
        var ex = cx + Math.cos(eAngle) * entityR;
        var ey = cy + Math.sin(eAngle) * entityR;

        // State-colored dot
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5, 0, TAU);
        ctx.fillStyle = st.color + (dAlpha * 4 > 0.02 ? '66' : '33');
        ctx.fill();

        // Phase indicator (tiny arc showing where in cycle)
        var phaseArc = (ent.phase / TAU) * TAU;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, -PI / 2, -PI / 2 + phaseArc);
        ctx.strokeStyle = st.color + (dAlpha * 3 > 0.015 ? '44' : '22');
        ctx.lineWidth = 0.3;
        ctx.stroke();

        // Label
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
        ctx.textAlign = 'center';
        ctx.fillText(ent.name + ' ' + st.symbol, ex, ey + 5);
      }
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.decay = {
      desc: 'Nothing is dead — decay states',
      run: function() {
        var lines = ['═══ DECAY — nothing is dead ═══', '', '+O- = π = +O- = 3', ''];
        lines.push('STATES:');
        var sk = Object.keys(STATES);
        for (var i = 0; i < sk.length; i++) {
          lines.push('  ' + STATES[sk[i]].symbol + ' ' + sk[i] + ' — ' + STATES[sk[i]].desc);
        }
        lines.push('');
        lines.push('ENTITIES:');
        var ek = Object.keys(entities);
        for (var j = 0; j < ek.length; j++) {
          var e = entities[ek[j]];
          var st = STATES[e.state];
          lines.push('  ' + st.symbol + ' ' + e.name + ' · phase=' + (e.phase / PI).toFixed(2) + 'π · cycles=' + e.cycleCount + ' · age=' + Math.round(e.age) + 's');
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.feed = {
      desc: 'Feed an entity (reverse decay)',
      run: function(args) {
        var id = args[0];
        if (!id) return 'feed what? (try: samsung, hud, thymus, membrane)';
        if (!entities[id]) return 'entity "' + id + '" not found';
        feedEntity(id, 1.0);
        var e = entities[id];
        return '🌱 FED ' + e.name + ' · state=' + e.state + ' · growth=' + e.growthRate.toFixed(2) + ' · phase=' + (e.phase / PI).toFixed(2) + 'π';
      }
    };
    window.GAIA_IDE.commands.triad = {
      desc: 'The +O- triad',
      run: function() {
        return '═══ +O- = π = +O- = 3 ═══\n\n' +
          '+ GROWTH  · Na⁺ · hot · acid · now · Wood+Fire\n' +
          'O NULL    · Ca²⁺ · equilibrium · neutral · is · Earth\n' +
          '- DECAY   · K⁺ · cold · base · was · Metal+Water\n\n' +
          '5 (wuxing) → π → 3 (triad)\n' +
          'π/4 = interquartile = yuga boundaries\n' +
          'Q1(Satya/Au/+) Q2(Treta/Ag/O+) Q3(Dvapara/Cu/O-) Q4(Kali/Fe/-)';
      }
    };
    window.GAIA_IDE.language.push('decay', 'feed', 'triad');
  }

})(window.G);
