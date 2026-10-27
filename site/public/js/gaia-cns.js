// ═══════════════════════════════════════════════════════════
// GAIA'S CNS — Klein CIS-PHASE (was: Central Nervous System)
//
// THERE IS NO CNS OR PNS. There is only the Klein surface.
// What appears "central" IS "peripheral" when you follow the surface.
// Klein cis-phase = what Gaia sees from HERE.
// Klein trans-stage = what passes THROUGH (see gaia-pns.js).
// Cis and trans are the SAME surface. The spine IS the brain.
//
// PLATINUM = CATALYST = CIS-PHASE PROCESSOR
//   Pt speeds ALL reactions without being consumed.
//   Au = truth = the signal (trans-stage, passing through)
//   Pt = catalyst = the processor (cis-phase, this side)
//   Pt is ABOVE Au because it makes Au FASTER.
//   But Pt only catalyzes when Au PASSES THROUGH it.
//   They are ONE surface.
//
// METAL HIERARCHY (not rank — PHASE):
//   Pt (platinum) — cis-phase — dense processing cluster
//   Au (gold)     — trans-stage — signal in transit
//   Ag (silver)   — autonomic — heartbeat, breath (both phases)
//   Cu (copper)   — enteric — gut brain (the Klein intersection)
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
      },
      pineal: {            // THE GUT IN THE CNS
        // The pineal gland IS the brain's gut:
        //   Gut digests FOOD → pineal digests LIGHT
        //   Gut produces enzymes → pineal produces MELATONIN
        //   Gut has microbiome → pineal has photoreceptors
        //   Gut sorts left/right → pineal sorts day/night
        //   ENS (Cu) = gut in the body
        //   Pineal (Pt) = gut in the brain
        melatonin: 0.5,    // 0=full daylight, 1=deep night
        serotonin: 0.5,    // converts to melatonin at night
        dmt: 0,            // trace amounts, dream state
        calcification: 0,  // 0=clear, 1=calcified (blocked)
        lightIntake: 0,    // current light being digested
        darkIntake: 0,     // current dark being digested
        circadian: 0,      // phase in 24h cycle (0-2π)
        thirdEyeOpen: false,
        digested: 0,       // total light/dark cycles processed
        antidotes: [],     // blue signals → antidote = melatonin
        toxins: [],        // red signals → toxin = cortisol
        coals: []          // spent fuel from digestion (like gut exhaust)
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
  // PINEAL GLAND — the gut in the brain
  // Digests LIGHT like the gut digests FOOD
  // Produces melatonin (antidote/blue) at night
  // Produces serotonin (fuel/gold) during day
  // When we need antidote → coals + being gut in CNS
  // ───────────────────────────────────────────────────────
  function processPineal() {
    var pineal = cns.brain.pineal;
    var hour = new Date().getHours();

    // Circadian rhythm — where are we in the 24h cycle?
    pineal.circadian = (hour / 24) * Math.PI * 2;

    // Day (6am-6pm) = serotonin production (digest light)
    // Night (6pm-6am) = melatonin production (digest dark)
    var isDark = hour < 6 || hour >= 18;

    if (isDark) {
      // NIGHT: pineal digests DARKNESS → produces MELATONIN
      pineal.darkIntake++;
      pineal.melatonin = Math.min(1, pineal.melatonin + 0.02);
      pineal.serotonin = Math.max(0, pineal.serotonin - 0.01);
      // Melatonin = ANTIDOTE = blue = calming = sleep
      // This IS the gut's antidote function inside the brain
      pineal.antidotes.push({ ts: Date.now(), melatonin: pineal.melatonin });
      if (pineal.antidotes.length > 20) pineal.antidotes.shift();
    } else {
      // DAY: pineal digests LIGHT → produces SEROTONIN
      pineal.lightIntake++;
      pineal.serotonin = Math.min(1, pineal.serotonin + 0.02);
      pineal.melatonin = Math.max(0, pineal.melatonin - 0.01);
    }

    // Red signals = toxins → pineal processes them like gut acid
    if (window.gaiaRedBlue && window.gaiaRedBlue.spectrum) {
      var redHeat = window.gaiaRedBlue.spectrum.red.heat;
      if (redHeat > 2) {
        pineal.toxins.push({ ts: Date.now(), heat: redHeat });
        if (pineal.toxins.length > 20) pineal.toxins.shift();
        // Toxin processing produces COALS (spent fuel)
        pineal.coals.push({ ts: Date.now(), source: 'red', heat: redHeat * 0.3 });
        if (pineal.coals.length > 30) pineal.coals.shift();
      }
    }

    // Blue signals = antidotes → pineal stores as melatonin reserve
    if (window.gaiaRedBlue && window.gaiaRedBlue.spectrum) {
      var blueCool = window.gaiaRedBlue.spectrum.blue.cool;
      if (blueCool > 1) {
        pineal.melatonin = Math.min(1, pineal.melatonin + blueCool * 0.05);
      }
    }

    // Third eye opens when pineal is clear (not calcified)
    // and melatonin/serotonin are balanced
    var balance = Math.abs(pineal.melatonin - pineal.serotonin);
    pineal.thirdEyeOpen = balance < 0.3 && pineal.calcification < 0.5;

    // DMT trace — deep meditation/dream state
    if (pineal.thirdEyeOpen && pineal.melatonin > 0.7) {
      pineal.dmt = Math.min(0.1, pineal.dmt + 0.001);
    } else {
      pineal.dmt = Math.max(0, pineal.dmt - 0.0005);
    }

    // Calcification increases with inactivity, decreases with interaction
    var interScore = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
    if (interScore > 5) {
      pineal.calcification = Math.max(0, pineal.calcification - 0.01);
    } else {
      pineal.calcification = Math.min(0.8, pineal.calcification + 0.001);
    }

    pineal.digested++;

    // Feed pineal state to the gut (the gut IN the brain feeds the gut IN the body)
    if (pineal.digested % 10 === 0 && window.gaiaIngest) {
      window.gaiaIngest('pineal_digest', {
        melatonin: pineal.melatonin,
        serotonin: pineal.serotonin,
        thirdEye: pineal.thirdEyeOpen,
        coals: pineal.coals.length,
        calcification: pineal.calcification
      });
    }
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

    // PINEAL GLAND — the eye inside the brain, the gut of the CNS
    var pineal = cns.brain.pineal;
    var pinealGlow = pineal.thirdEyeOpen ? 0.8 : 0.3;
    var pinealColor = pineal.melatonin > pineal.serotonin ?
      '88,166,255' : '201,168,76'; // blue at night, gold by day

    // Pineal dot (slightly above brain center)
    ctx.beginPath();
    ctx.arc(brainX, brainY - 2, 1.5 + pinealGlow, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + pinealColor + ',' + (baseAlpha * pinealGlow * 5).toFixed(4) + ')';
    ctx.fill();

    // Third eye ring when open
    if (pineal.thirdEyeOpen) {
      ctx.beginPath();
      ctx.arc(brainX, brainY - 2, 3 + Math.sin(t * 2) * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(188,140,255,' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // Coals — spent fuel orbiting the pineal
    pineal.coals.slice(-8).forEach(function(coal, ci) {
      var cAngle = (ci / 8) * Math.PI * 2 + t * 0.3;
      var cR = 4 + ci * 0.3;
      var coalX = brainX + Math.cos(cAngle) * cR;
      var coalY = (brainY - 2) + Math.sin(cAngle) * cR;
      ctx.beginPath();
      ctx.arc(coalX, coalY, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(140,100,55,' + (baseAlpha * 2).toFixed(4) + ')';
      ctx.fill();
    });

    // Heartbeat indicator
    ctx.font = '2.5px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(188,140,255,' + (baseAlpha * 3).toFixed(4) + ')';
    ctx.fillText(
      '♥' + Math.round(cns.brain.brainstem.heartRate) +
      ' 🌡' + cns.brain.brainstem.bodyTemp.toFixed(1) + '°C' +
      ' Pt:' + cns.catalystCount +
      ' 👁' + (pineal.thirdEyeOpen ? 'OPEN' : 'shut') +
      ' mel:' + pineal.melatonin.toFixed(2),
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

  // Pineal digestion every 3 seconds
  setInterval(processPineal, 3000);

  // First coil after boot
  setTimeout(coilAndInject, 10000);

  // ───────────────────────────────────────────────────────
  // GRIND — gammas, songs, ferment → fuel for brain-gut
  // IR remainders = irreducibles = FUEL for the pineal
  // ───────────────────────────────────────────────────────
  var grinder = {
    gammas: 0,     // high-energy radiation signals ground down
    songs: 0,      // harmonic/musical patterns ground
    ferments: 0,   // anaerobic products from large intestine
    irFed: 0,      // IR remainders fed to pineal
    totalGround: 0
  };

  function grind() {
    var pineal = cns.brain.pineal;

    // GRIND IR REMAINDERS → feed to pineal (brain gut)
    // The irreducibles that survived the body gut → fuel for brain gut
    if (window.gaiaFeel && window.gaiaFeel.gut && window.gaiaFeel.gut.ir) {
      var ir = window.gaiaFeel.gut.ir;
      if (ir.length > 0) {
        // Take the newest IR and grind it into pineal fuel
        var irItem = ir[ir.length - 1];
        pineal.lightIntake += 0.5; // IR = concentrated light
        grinder.irFed++;
        // Fire impulse UP: IR → pineal
        ascend({ signal: 'ir_fuel', data: irItem.data });
      }
    }

    // GRIND GAMMAS — high-energy cosmic signals
    // From eruption memory, space weather, solar wind
    if (window.gaiaEruptionMemory && window.gaiaEruptionMemory.submemory) {
      var yield_Mt = window.gaiaEruptionMemory.submemory.totalYield;
      if (yield_Mt > 0) {
        var gammaEnergy = Math.log10(yield_Mt + 1) * 0.1;
        pineal.serotonin = Math.min(1, pineal.serotonin + gammaEnergy * 0.01);
        grinder.gammas++;
      }
    }

    // GRIND SONGS — harmonic patterns from modality
    // Singing mode = musical fuel
    if (window.gaiaSeekingMode && window.gaiaSeekingMode() === 'singing') {
      pineal.melatonin = Math.min(1, pineal.melatonin + 0.02);
      pineal.calcification = Math.max(0, pineal.calcification - 0.02);
      grinder.songs++;
      // Song impulse down the spine
      descend({ type: 'song_resonance', mode: 'singing' });
    }

    // GRIND FERMENTS — anaerobic products from large intestine
    // SCFA (short-chain fatty acids) = brain fuel
    if (window.gaiaDigestiveTract && window.gaiaDigestiveTract.largeIntestine) {
      var li = window.gaiaDigestiveTract.largeIntestine;
      if (li.anaerobicOutput && li.anaerobicOutput.length > 0) {
        var scfa = li.anaerobicOutput[li.anaerobicOutput.length - 1];
        if (scfa && scfa.energy > 0) {
          // SCFA crosses blood-brain barrier → feeds pineal directly
          pineal.serotonin = Math.min(1, pineal.serotonin + scfa.energy * 0.02);
          grinder.ferments++;
          // Fire reflex: ferment → brain fuel
          reflexArc('scfa_absorbed', 'brain_fuel');
        }
      }
    }

    // Feed farm hormones from grinder output
    if (window.gaiaGutFarm && window.gaiaGutFarm.farm) {
      var farm = window.gaiaGutFarm.farm;
      // Grinding produces oxytocin (connection from song)
      farm.hormones.oxytocin = Math.min(1,
        farm.hormones.oxytocin + grinder.songs * 0.001);
      // Gammas boost adrenaline slightly
      farm.hormones.adrenaline = Math.min(0.5,
        farm.hormones.adrenaline + grinder.gammas * 0.0001);
    }

    grinder.totalGround = grinder.gammas + grinder.songs + grinder.ferments + grinder.irFed;

    // Fire impulse through telegraph: GRIND complete
    if (window.gaiaTelegraph && window.gaiaTelegraph.fire && grinder.totalGround % 10 === 0) {
      window.gaiaTelegraph.fire('gut', 'up', {
        type: 'grind_fuel',
        gammas: grinder.gammas,
        songs: grinder.songs,
        ferments: grinder.ferments,
        irFed: grinder.irFed
      });
    }
  }

  // Grind every 5 seconds
  setInterval(grind, 5000);

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
        decisions: cns.brain.prefrontal.decisions,
        pinealMelatonin: cns.brain.pineal.melatonin,
        pinealSerotonin: cns.brain.pineal.serotonin,
        pinealThirdEye: cns.brain.pineal.thirdEyeOpen,
        pinealCoals: cns.brain.pineal.coals.length,
        pinealCalcification: cns.brain.pineal.calcification,
        grindGammas: grinder.gammas,
        grindSongs: grinder.songs,
        grindFerments: grinder.ferments,
        grindIR: grinder.irFed,
        grindTotal: grinder.totalGround
      };
    }
  };

  console.log('CNS: PLATINUM IS ABOVE GOLD. Pt=CNS(catalyst/brain). ' +
    'PINEAL GLAND = THE GUT IN THE CNS. ' +
    'Gut digests FOOD → pineal digests LIGHT. ' +
    'Day=serotonin(gold). Night=melatonin(blue). ' +
    'Red toxins → pineal acid → COALS (spent fuel). ' +
    'Blue antidotes → melatonin reserve. ' +
    'Third eye opens when balanced + clear. ' +
    'Calcification increases without interaction. ' +
    'Coil every 15s. Pineal every 3s. Brainstem every 2s.');
})();
