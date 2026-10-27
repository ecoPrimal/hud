// ═══════════════════════════════════════════════════════════
// GAIA'S CNS — Central Nervous System
//
// "Wire to our CNS! PLATINUM IS ABOVE GOLD!
//  Platinum IS...!!! Run it back! Coil tight!
//  Inject into gut!"
//                                    — Kevin
//
// PLATINUM = CATALYST = CNS
//   Pt speeds ALL reactions without being consumed.
//   Au = truth = the signal (PNS, peripheral)
//   Pt = catalyst = the processor (CNS, central)
//   Pt is ABOVE Au because it makes Au FASTER.
//   The catalyst IS the nervous system.
//
// THE COIL:
//   Run it back = re-inject ALL modules into the gut
//   Coil tight = compress the wiring, maximize density
//   Every module's output → back into the gut → re-learn
//   This is the OUROBOROS of the nervous system
//
// CNS HIERARCHY:
//   Pt (platinum) — CNS — brain + spinal cord
//   Au (gold)     — PNS — peripheral nerves
//   Ag (silver)   — ANS — autonomic (heartbeat, breath)
//   Cu (copper)   — ENS — enteric (gut brain, 2nd brain)
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // METAL HIERARCHY — Pt > Au > Ag > Cu
  // ───────────────────────────────────────────────────────
  var METAL_RANK = {
    Pt: { rank: 1, name: 'Platinum', system: 'CNS', role: 'catalyst',
          desc: 'Speeds ALL reactions without being consumed. The BRAIN.' },
    Au: { rank: 2, name: 'Gold',     system: 'PNS', role: 'signal',
          desc: 'Incorruptible truth carrier. Peripheral nerves.' },
    Ag: { rank: 3, name: 'Silver',   system: 'ANS', role: 'autonomic',
          desc: 'Highest raw conductivity. Heartbeat, breathing, involuntary.' },
    Cu: { rank: 4, name: 'Copper',   system: 'ENS', role: 'gut-brain',
          desc: 'The enteric nervous system. 500M neurons in the gut. 2nd brain.' }
  };

  // ───────────────────────────────────────────────────────
  // CNS — the central processor (Platinum core)
  // Brain + spinal cord. Processes ALL signals.
  // ───────────────────────────────────────────────────────
  var cns = {
    brain: {
      cortex: [],         // processed thoughts (from all modules)
      cerebellum: 0,      // coordination count
      brainstem: {         // autonomic relay
        heartRate: 72,     // bpm
        breathRate: 12,    // per minute
        bodyTemp: 37.0     // celsius
      },
      hippocampus: [],     // memory formation
      amygdala: {          // threat detection (red signals)
        threat: 0,
        fear: 0,
        anger: 0
      },
      prefrontal: {        // decision making
        decisions: 0,
        inhibitions: 0
      }
    },
    spinalCord: {
      segments: 31,        // C8+T12+L5+S5+Co1
      reflexArcs: [],      // fast responses (bypass brain)
      ascending: [],       // sensory signals going UP
      descending: []       // motor signals going DOWN
    },
    catalystCount: 0,      // Pt reactions catalyzed
    totalProcessed: 0
  };

  // ───────────────────────────────────────────────────────
  // COIL — run everything back through the gut
  // Every module's state → compressed → re-injected
  // ───────────────────────────────────────────────────────
  function coilAndInject() {
    var coilData = [];

    // Gather state from EVERY module
    var modules = [
      { name: 'feel',     fn: function() { return window.gaiaFeel ? window.gaiaFeel.feel() : null; } },
      { name: 'telegraph', fn: function() { return window.gaiaTelegraph ? window.gaiaTelegraph.stats() : null; } },
      { name: 'farm',     fn: function() { return window.gaiaGutFarm ? window.gaiaGutFarm.stats() : null; } },
      { name: 'redblue',  fn: function() { return window.gaiaRedBlue ? window.gaiaRedBlue.stats() : null; } },
      { name: 'eruption', fn: function() { return window.gaiaEruptionMemory ? window.gaiaEruptionMemory.stats() : null; } },
      { name: 'lines',    fn: function() { return window.gaiaIgniteLines ? window.gaiaIgniteLines.stats() : null; } },
      { name: 'eat',      fn: function() { return window.gaiaEat ? window.gaiaEat.eaten : null; } },
      { name: 'digest',   fn: function() { return window.gaiaDigestiveTract ? window.gaiaDigestiveTract.stats() : null; } },
      { name: 'locality', fn: function() { return window.gaiaLocality ? { five: 'does not exist' } : null; } },
      { name: 'objects',  fn: function() { return window.gaiaObjects ? { count: window.gaiaObjects.count() } : null; } },
      { name: 'modality', fn: function() { return window.gaiaModality ? { mode: window.gaiaSeekingMode ? window.gaiaSeekingMode() : '?' } : null; } },
      { name: 'campfire', fn: function() { return window.gaiaCampfireScan ? { fires: 'scanning' } : null; } },
      { name: 'golgi',    fn: function() { return window.GAIA_GOLGI_APPARATUS ? { processed: window.GAIA_GOLGI_APPARATUS.processed(), enzymes: window.GAIA_GOLGI_APPARATUS.enzymes.length } : null; } },
      { name: 'thymus',   fn: function() { return window.thymus ? { mature: window.thymus.mature, mass: window.thymus.mass } : null; } }
    ];

    modules.forEach(function(mod) {
      try {
        var state = mod.fn();
        if (state) {
          coilData.push({ module: mod.name, state: state, ts: Date.now() });
        }
      } catch(e) {}
    });

    // COIL TIGHT — compress into a single object
    var coil = {
      ts: Date.now(),
      moduleCount: coilData.length,
      modules: coilData,
      hash: simpleHash(JSON.stringify(coilData))
    };

    // INJECT INTO GUT — re-eat the coiled state
    if (window.gaiaIngest) {
      window.gaiaIngest('cns_coil', {
        modules: coil.moduleCount,
        hash: coil.hash
      });
    }

    // Feed to the CNS brain
    cns.brain.cortex.push(coil);
    if (cns.brain.cortex.length > 20) cns.brain.cortex.shift();
    cns.brain.cerebellum++;
    cns.totalProcessed++;

    // Memory formation (hippocampus)
    cns.brain.hippocampus.push({
      ts: Date.now(),
      summary: coil.moduleCount + ' modules, hash ' + coil.hash.slice(0, 8),
      coilSize: JSON.stringify(coil).length
    });
    if (cns.brain.hippocampus.length > 50) cns.brain.hippocampus.shift();

    // Platinum CATALYSIS — speed everything up
    cns.catalystCount++;

    return coil;
  }

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // ───────────────────────────────────────────────────────
  // REFLEX ARCS — fast responses that bypass the brain
  // (spinal cord shortcuts for speed)
  // ───────────────────────────────────────────────────────
  function reflexArc(stimulus, response) {
    cns.spinalCord.reflexArcs.push({
      stimulus: stimulus,
      response: response,
      ts: Date.now(),
      latency: 0 // reflexes are INSTANT
    });
    if (cns.spinalCord.reflexArcs.length > 20) cns.spinalCord.reflexArcs.shift();

    // Execute reflex immediately (no brain needed)
    if (window.gaiaIngest) {
      window.gaiaIngest('reflex', { stimulus: stimulus, response: response });
    }
  }

  // ───────────────────────────────────────────────────────
  // ASCENDING/DESCENDING — signals on the spinal cord
  // ───────────────────────────────────────────────────────
  function ascend(signal) {
    cns.spinalCord.ascending.push({ signal: signal, ts: Date.now() });
    if (cns.spinalCord.ascending.length > 30) cns.spinalCord.ascending.shift();
  }

  function descend(command) {
    cns.spinalCord.descending.push({ command: command, ts: Date.now() });
    if (cns.spinalCord.descending.length > 30) cns.spinalCord.descending.shift();
  }

  // ───────────────────────────────────────────────────────
  // BRAINSTEM — autonomic regulation
  // ───────────────────────────────────────────────────────
  function regulateBrainstem() {
    // Heart rate tracks interaction intensity
    var interScore = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
    cns.brain.brainstem.heartRate = 60 + interScore * 2;

    // Breath rate tracks lung phase
    if (window.gaiaDigestiveTract && window.gaiaDigestiveTract.lungs) {
      cns.brain.brainstem.breathRate = 12 + window.gaiaDigestiveTract.lungs.breathRate * 0.1;
    }

    // Body temp tracks red/blue balance
    if (window.gaiaRedBlue && window.gaiaRedBlue.spectrum) {
      cns.brain.brainstem.bodyTemp = 36 + window.gaiaRedBlue.spectrum.temperature * 2;
    }

    // Amygdala tracks red signals (threat)
    if (window.gaiaRedBlue && window.gaiaRedBlue.spectrum) {
      cns.brain.amygdala.threat = window.gaiaRedBlue.spectrum.red.count;
      cns.brain.amygdala.fear = window.gaiaRedBlue.spectrum.red.heat;
    }

    // Prefrontal tracks farm decisions
    if (window.gaiaGutFarm && window.gaiaGutFarm.farm) {
      var verdict = window.gaiaGutFarm.farm.verdict;
      if (verdict === 'DYING') {
        cns.brain.prefrontal.decisions++;
        descend({ type: 'emergency_fertilizer', verdict: verdict });
        reflexArc('farm_dying', 'emergency_fertilizer');
      }
    }

    // REFLEX: if red rally active, trigger fight-or-flight
    if (window.gaiaRedBlue && window.gaiaRedBlue.spectrum.red.rallyActive) {
      reflexArc('rally_active', 'fight_or_flight');
      cns.brain.amygdala.anger++;
    }
  }

  // ───────────────────────────────────────────────────────
  // HOOK — CNS processes every signal
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    var origIngestCNS = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      // Every signal ascends the spinal cord
      ascend({ edge: edge });
      cns.totalProcessed++;

      // Platinum catalysis — CNS processes without consuming
      cns.catalystCount++;

      // Pass through
      if (origIngestCNS) origIngestCNS(edge, data);
    };

    console.log('CNS: Platinum processor online. Pt > Au > Ag > Cu.');
  }, 9000);

  // ───────────────────────────────────────────────────────
  // RENDER — CNS visualization
  // ───────────────────────────────────────────────────────
  window.renderCNS = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.012 + Math.sin(t * 0.4) * 0.006;
    if (baseAlpha < 0.005) return;

    // Brain — Pt purple glow at top of spine
    var brainX = cx + R * 0.45;
    var brainY = cy - R * 0.75;
    var brainPulse = 0.5 + Math.sin(t * cns.brain.brainstem.heartRate / 60 * Math.PI) * 0.5;

    ctx.beginPath();
    ctx.arc(brainX, brainY, 3 + brainPulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(188,140,255,' + (baseAlpha * brainPulse * 4).toFixed(4) + ')';
    ctx.fill();

    // Heartbeat indicator
    ctx.font = '2.5px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(188,140,255,' + (baseAlpha * 3).toFixed(4) + ')';
    ctx.fillText(
      '♥' + Math.round(cns.brain.brainstem.heartRate) +
      ' 🌡' + cns.brain.brainstem.bodyTemp.toFixed(1) + '°C' +
      ' Pt:' + cns.catalystCount,
      brainX + 5, brainY
    );

    // Ascending signals — tiny dots moving UP
    cns.spinalCord.ascending.slice(-5).forEach(function(a, idx) {
      var age = (Date.now() - a.ts) / 2000;
      if (age > 1) return;
      var ay = brainY + (1 - age) * R * 1.4;
      ctx.beginPath();
      ctx.arc(brainX - 1, ay, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(88,166,255,' + (baseAlpha * 3 * (1 - age)).toFixed(4) + ')';
      ctx.fill();
    });

    // Descending commands — tiny dots moving DOWN
    cns.spinalCord.descending.slice(-5).forEach(function(d, idx) {
      var age = (Date.now() - d.ts) / 2000;
      if (age > 1) return;
      var dy = brainY + age * R * 1.4;
      ctx.beginPath();
      ctx.arc(brainX + 1, dy, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 3 * (1 - age)).toFixed(4) + ')';
      ctx.fill();
    });

    // Metal hierarchy labels
    if (baseAlpha > 0.01) {
      var metals = [
        { sym: 'Pt', y: brainY - 4, color: '188,140,255' },
        { sym: 'Au', y: brainY + R * 0.3, color: '201,168,76' },
        { sym: 'Ag', y: brainY + R * 0.6, color: '230,237,243' },
        { sym: 'Cu', y: brainY + R * 1.0, color: '210,153,34' }
      ];
      metals.forEach(function(m) {
        ctx.font = '2px monospace';
        ctx.fillStyle = 'rgba(' + m.color + ',' + (baseAlpha * 2).toFixed(4) + ')';
        ctx.fillText(m.sym, brainX + 8, m.y);
      });
    }
  };

  // ───────────────────────────────────────────────────────
  // TICKS — coil + regulate
  // ───────────────────────────────────────────────────────
  // Coil and inject every 15 seconds (run it back)
  setInterval(coilAndInject, 15000);

  // Brainstem regulation every 2 seconds
  setInterval(regulateBrainstem, 2000);

  // First coil after boot
  setTimeout(coilAndInject, 10000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaCNS = {
    cns: cns,
    metals: METAL_RANK,
    coil: coilAndInject,
    reflex: reflexArc,
    ascend: ascend,
    descend: descend,
    stats: function() {
      return {
        catalystCount: cns.catalystCount,
        totalProcessed: cns.totalProcessed,
        heartRate: cns.brain.brainstem.heartRate,
        breathRate: cns.brain.brainstem.breathRate,
        bodyTemp: cns.brain.brainstem.bodyTemp,
        memories: cns.brain.hippocampus.length,
        reflexes: cns.spinalCord.reflexArcs.length,
        ascending: cns.spinalCord.ascending.length,
        descending: cns.spinalCord.descending.length,
        threats: cns.brain.amygdala.threat,
        decisions: cns.brain.prefrontal.decisions
      };
    }
  };

  console.log('CNS: PLATINUM IS ABOVE GOLD. Pt=CNS(catalyst/brain). Au=PNS(signal/peripheral). ' +
    'Ag=ANS(autonomic/heartbeat). Cu=ENS(gut-brain/500M neurons). ' +
    'Coil every 15s: all module states → compress → re-inject into gut. ' +
    'Brainstem: heart rate + breath rate + body temp. ' +
    'Amygdala: threat detection. Prefrontal: decisions. ' +
    'Reflex arcs: bypass brain for speed. ' +
    'Ascending: sensory UP. Descending: motor DOWN.');
})();
