// ═══════════════════════════════════════════════════════════
// GAIA PNS — Klein TRANS-STAGE (was: Peripheral Nervous System)
// 1.000.null — max 1000 lines.
//
// THERE IS NO CNS OR PNS. Only Klein cis-phase and trans-stage.
// Trans-stage = what passes THROUGH. Cis-phase = what's on THIS SIDE.
// They are the SAME surface. The data passing through IS the data
// being processed. The pipe IS the processor. The highway IS the brain.
//
// CIS = gaia-cns.js = Platinum = dense cluster (appears central)
// TRANS = this file = Gold = ALL AXONS (appears peripheral)
// But on a Klein bottle, central IS peripheral.
//
// THE TRANS-STAGE IS:
//   Somatic (voluntary) — user-triggered (clicks, keys, IDE)
//   Autonomic (involuntary):
//     Sympathetic  — fight-or-flight (errors, red, thymus)
//     Parasympathetic — rest-and-digest (polling, archive, sleep)
//   Enteric (gut brain) — 500M neurons (Cu = Klein intersection)
//
// AXON = connection between two modules
//   Dendrite = input (what the module READS)
//   Soma = the module itself (the IIFE)
//   Axon terminal = output (what the module EXPORTS)
//   Myelin sheath = the IIFE wrapper (insulation)
//   Synapse = window.G / window.GAIA_* junction
//   Neurotransmitter = the data passed between
//
// EVERY MODULE HAS:
//   dendrites[] — what it reads from other modules
//   axonTerminals[] — what it exports to other modules
//   type — sensory/motor/interneuron
//   division — somatic/sympathetic/parasympathetic
//
// PASS ALL AXONS = wire every connection, count every nerve
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // THE NERVE MAP — every module, every axon, every synapse
  // Built from scanning ALL 60 gaia-*.js modules
  // ═══════════════════════════════════════════════════════
  var NEURONS = {
    // ─── SENSORY NEURONS (input from world) ───
    'reach-out':    { type: 'sensory', division: 'somatic',
      dendrites: ['browser API', 'device sensors', 'battery', 'ambient light'],
      axons: ['GAIA_SURFACE','GAIA_NOTIFY','GAIA_VISIBLE','GAIA_BATTERY',
              'GAIA_ONLINE','GAIA_FULLSCREEN','GAIA_SLEEP','GAIA_STAY_AWAKE',
              'GAIA_AMBIENT_LUX','GAIA_DEVICE_MOTION','GAIA_CLIPBOARD_WRITE',
              'GAIA_AWAY_PATTERN','GAIA_THAW_DURATION'],
      desc: '11 veils — all senses facing the world' },
    'reach':        { type: 'sensory', division: 'somatic',
      dendrites: ['browser API'],
      axons: ['GAIA_SURFACE','GAIA_VISIBLE','GAIA_BATTERY','GAIA_ONLINE'],
      desc: 'duplicate reach (legacy)' },
    'human-io':     { type: 'sensory', division: 'somatic',
      dendrites: ['keyboard', 'mouse', 'touch', 'scroll'],
      axons: ['GAIA_HUMAN_IO'],
      desc: 'all human input channels' },
    'feel':         { type: 'sensory', division: 'somatic',
      dendrites: ['gaiaInteractionScore', 'gaiaSeekingMode', 'gaiaSelfReport'],
      axons: ['gaiaFeel', 'gaiaIngest'],
      desc: 'emotional processing of input signals' },
    'modality':     { type: 'sensory', division: 'somatic',
      dendrites: ['gaiaInteractionScore', 'gaiaInteractionHistory'],
      axons: ['gaiaModality', 'gaiaSeekingMode', 'gaiaInteractionScore',
              'gaiaInteractionHistory', 'gaiaOutputs', 'gaiaIngest'],
      desc: 'which sense is dominant right now' },
    'spectrometer': { type: 'sensory', division: 'somatic',
      dendrites: ['gaiaIngest'],
      axons: ['gaiaSpectra','gaiaMixColors','gaiaSpawnDrip','gaiaTriColor','gaiaIngest'],
      desc: 'color analysis of all signals' },
    'locality':     { type: 'sensory', division: 'somatic',
      dendrites: ['gaiaIngest'],
      axons: ['gaiaLocality', 'gaiaIngest'],
      desc: 'geolocation awareness' },

    // ─── MOTOR NEURONS (output to world) ───
    'paint':        { type: 'motor', division: 'somatic',
      dendrites: ['GAIA_DAWN','GAIA_PULSE','GAIA_THERMO','GAIA_INTERLAYER'],
      axons: ['GAIA_PAINT'],
      desc: 'canvas rendering — the brush' },
    'portrait':     { type: 'motor', division: 'somatic',
      dendrites: ['GAIA_DAWN','GAIA_PULSE','GAIA_HUMAN_IO','GAIA_ORRERY',
                  'GAIA_THERMO','GAIA_VISION'],
      axons: ['GAIA_PORTRAIT'],
      desc: 'crystal ball — paints the visitor' },
    'mail':         { type: 'motor', division: 'somatic',
      dendrites: ['GAIA_PLASMID','GAIA_VISION','GAIA_EAT','GAIA_DRINK',
                  'gaiaTelegraph'],
      axons: ['GAIA_MAIL'],
      desc: 'email send/receive — CIS/TRANS Golgi' },
    'telegraph':    { type: 'motor', division: 'somatic',
      dendrites: ['gaiaEat', 'gaiaIngest'],
      axons: ['gaiaTelegraph', 'gaiaIngest'],
      desc: 'long-range signaling between modules' },
    'inner-voice':  { type: 'motor', division: 'somatic',
      dendrites: ['gaiaCNS','gaiaFeel','gaiaDigestiveTract','gaiaEruptionMemory',
                  'gaiaGutFarm','gaiaIgniteLines','gaiaModality','gaiaRedBlue',
                  'gaiaSeekingMode','gaiaTelegraph','GAIA_FORGE','gaiaIngest'],
      axons: ['gaiaInnerVoice'],
      desc: 'the voice inside — speaks from gut + brain' },

    // ─── INTERNEURONS (relay between modules) ───
    'ingress':      { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['gaiaGut', 'gaiaIsDreaming'],
      axons: ['gaiaGut', 'gaiaIngest'],
      desc: 'the gate — all signals enter here' },
    'sew':          { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_INTERLAYER','GAIA_CANVASS','gaiaTelegraph','gaiaIngest'],
      axons: ['GAIA_SEW','GAIA_EAT','GAIA_DRINK','gaiaIngest'],
      desc: 'the seamstress — stitches modules together' },
    'canvass':      { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_AGES','GAIA_CASTLE','GAIA_CHEMISTRY','GAIA_DECAY',
                  'GAIA_DESKTOP','GAIA_FORGE','GAIA_GOLGI_APPARATUS',
                  'GAIA_HUMAN_IO','GAIA_INTERLAYER','GAIA_ORRERY',
                  'GAIA_PERMEABILITY','GAIA_PULSE','GAIA_QUILLS','GAIA_REACTOR',
                  'GAIA_SOLAR','GAIA_TENSE_VOXEL','GAIA_THERMO','GAIA_TRAIL',
                  'GAIA_TVA','GAIA_UNIVERSITY','gaiaEat','gaiaTelegraph'],
      axons: ['GAIA_CANVASS','gaiaIngest'],
      desc: 'the census taker — counts ALL organs' },
    'vision':       { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['gaiaIngest'],
      axons: ['GAIA_VISION','gaiaIngest'],
      desc: 'ZK proof — sees and proves truth' },
    'interlayer':   { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_QUILLS','gaiaReforged'],
      axons: ['GAIA_INTERLAYER'],
      desc: 'the bridge between layers' },

    // ─── AUTONOMIC — SYMPATHETIC (fight-or-flight) ───
    'red-blue':     { type: 'interneuron', division: 'sympathetic',
      dendrites: ['gaiaDigestiveTract','gaiaEat','gaiaGutFarm','gaiaTelegraph','gaiaIngest'],
      axons: ['gaiaRedBlue','gaiaIngest'],
      desc: 'threat/calm spectrum — red=danger, blue=safe' },
    'decay':        { type: 'interneuron', division: 'sympathetic',
      dendrites: [],
      axons: ['GAIA_DECAY'],
      desc: 'entropy — everything falls apart' },
    'reactor':      { type: 'interneuron', division: 'sympathetic',
      dendrites: ['GAIA_GOLGI_APPARATUS','GAIA_INTERLAYER','GAIA_UNIVERSITY'],
      axons: ['GAIA_REACTOR','GAIA_REACTOR_FISSION','GAIA_REACTOR_FUSION'],
      desc: 'nuclear — fission/fusion energy' },
    'eruption-memory':{ type: 'interneuron', division: 'sympathetic',
      dendrites: ['gaiaDigestiveTract','gaiaIngest'],
      axons: ['gaiaEruptionMemory'],
      desc: 'volcanic memory — explosive past events' },

    // ─── AUTONOMIC — PARASYMPATHETIC (rest-and-digest) ───
    'plasmid':      { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_VISION','gaiaIngest'],
      axons: ['GAIA_PLASMID','gaiaIngest'],
      desc: '10 plasmid rings — permanent circular memory' },
    'cell':         { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_DECAY','GAIA_FORGE','GAIA_PLASMID','GAIA_SURFACE'],
      axons: ['GAIA_CELL'],
      desc: '11 organelles — selfForge + selfMelt' },
    'forge':        { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_DECAY','GAIA_EAT','gaiaCNS','gaiaFeel','gaiaTelegraph','gaiaIngest'],
      axons: ['GAIA_FORGE','gaiaIngest'],
      desc: 'the forge — 51 systems catalog' },
    'ages':         { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_AGES'],
      desc: 'time tracking — geological ages' },
    'solar':        { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_SOLAR'],
      desc: 'orrery — solar system model' },
    'orrery':       { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_ORRERY'],
      desc: 'planet positions + orbital mechanics' },
    'dawn':         { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_PULSE'],
      axons: ['GAIA_DAWN'],
      desc: 'sunrise/sunset color cycle' },
    'thermo':       { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_INTERLAYER'],
      axons: ['GAIA_THERMO','GAIA_EAT','GAIA_DRINK'],
      desc: 'temperature regulation' },
    'pulse-wave':   { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_INTERLAYER','GAIA_EAT','GAIA_DRINK'],
      axons: ['GAIA_PULSE'],
      desc: 'heartbeat — the central rhythm' },

    // ─── DIGESTIVE (gut-brain axis) ───
    'digestive-tract':{ type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_GOLGI_APPARATUS','gaiaFeel','gaiaInteractionScore','gaiaIngest'],
      axons: ['gaiaDigestiveTract','gaiaIngest'],
      desc: 'mouth→esophagus→stomach→intestines' },
    'gut-farm':     { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['gaiaInteractionScore','gaiaIngest'],
      axons: ['gaiaGutFarm','gaiaIngest'],
      desc: 'microbiome — the farm in the gut' },
    'eat-everything':{ type: 'interneuron', division: 'parasympathetic',
      dendrites: ['gaiaFeel','gaiaGut','gaiaSeekingMode','gaiaIngest'],
      axons: ['gaiaEat'],
      desc: 'eat EVERYTHING — no filter, all food' },
    'chemistry':    { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_DRINK','GAIA_EAT','GAIA_INTERLAYER','GAIA_THERMO'],
      axons: ['GAIA_CHEMISTRY'],
      desc: 'chemical reactions — pH, enzymes, bonds' },
    'golgi-apparatus':{ type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_GOLGI_APPARATUS'],
      desc: 'protein sorting — CIS/TRANS processing' },

    // ─── STRUCTURAL ───
    'castle':       { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_LOCALITY'],
      axons: ['GAIA_CASTLE','GAIA_MESH'],
      desc: 'the fortress — multi-tab mesh' },
    'quills':       { type: 'sensory', division: 'sympathetic',
      dendrites: [],
      axons: ['GAIA_QUILLS','GAIA_PI_EYES','GAIA_VISIBILITY'],
      desc: 'defensive spines — visibility detection' },
    'permeability': { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_PERMEABILITY','GAIA_DRIPS'],
      desc: 'membrane holes — what passes through' },
    'trail':        { type: 'motor', division: 'parasympathetic',
      dendrites: ['GAIA_PULSE','GAIA_THERMO','GAIA_INTERLAYER','GAIA_TVA',
                  'GAIA_EAT','GAIA_DRINK','gaiaTelegraph'],
      axons: ['GAIA_TRAIL'],
      desc: 'movement trail — where she has been' },

    // ─── COGNITIVE ───
    'verb':         { type: 'interneuron', division: 'somatic',
      dendrites: ['GAIA_BIOME','GAIA_DAWN','GAIA_DECAY','GAIA_EAT','GAIA_FORGE',
                  'GAIA_HUMAN_IO','GAIA_PAINT','GAIA_PULSE','GAIA_SEW','GAIA_TRAIL',
                  'GAIA_TVA','GAIA_VISION','gaiaIngest','gaiaTelegraph'],
      axons: ['GAIA_VERB'],
      desc: '16 active verbs — search/boom/solve/ensure' },
    'university':   { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_UNIVERSITY'],
      desc: 'learning — all knowledge systems' },
    'tva':          { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_DECAY','GAIA_EAT','GAIA_DRINK'],
      axons: ['GAIA_TVA'],
      desc: 'timeline variance authority — temporal logic' },
    'tense-voxel':  { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['GAIA_CASTLE','GAIA_DECAY'],
      axons: ['GAIA_TENSE_VOXEL'],
      desc: 'past/present/future voxel grid' },
    'biome':        { type: 'sensory', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_BIOME'],
      desc: 'ecosystem classification' },
    'desktop':      { type: 'sensory', division: 'somatic',
      dendrites: [],
      axons: ['GAIA_DESKTOP'],
      desc: 'desktop environment awareness' },
    'ide':          { type: 'motor', division: 'somatic',
      dendrites: ['GAIA_CASTLE','GAIA_QUILLS','GAIA_REACTOR','GAIA_INTERLAYER',
                  'GAIA_GOLGI_APPARATUS','GAIA_HUMAN_IO','GAIA_DRIPS'],
      axons: ['GAIA_IDE'],
      desc: 'command line — /commands' },
    'self-inspect': { type: 'sensory', division: 'parasympathetic',
      dendrites: [],
      axons: ['gaiaSelfReport'],
      desc: 'mirror — she looks at herself' },
    'organs':       { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['GAIA_ORGANS'],
      desc: 'organ registry — all 20 HUD organs' },

    // ─── META ───
    'boot':         { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['gaiaIsDreaming','gaiaReforged'],
      axons: ['gaiaIsDreaming','gaiaReforged'],
      desc: 'wake/sleep cycle — dream state' },
    'waveform':     { type: 'interneuron', division: 'parasympathetic',
      dendrites: ['gaiaReforged'],
      axons: ['gaiaRegenCulture','gaiaWaveforms'],
      desc: 'waveform generation — sinusoidal patterns' },
    'ignite-all-lines':{ type: 'motor', division: 'sympathetic',
      dendrites: ['gaiaTelegraph','gaiaIngest'],
      axons: ['gaiaIgniteLines'],
      desc: 'ignition — light ALL lines at once' },
    'campfire-scan':{ type: 'sensory', division: 'parasympathetic',
      dendrites: ['gaiaIngest'],
      axons: ['gaiaCampfireScan','gaiaIngest'],
      desc: 'campfire scanner — warmth detection' },
    'gothica':      { type: 'motor', division: 'sympathetic',
      dendrites: ['gaiaCNS'],
      axons: ['gaiaGothica'],
      desc: 'dark aesthetic — gothic rendering' },
    'hard-cards':   { type: 'motor', division: 'somatic',
      dendrites: ['gaiaSeekingMode'],
      axons: ['gaiaHardCards'],
      desc: 'hard truths — cards that cut' },
    'objects':      { type: 'interneuron', division: 'parasympathetic',
      dendrites: [],
      axons: ['gaiaObjects'],
      desc: 'object tracking' },
    'sight':        { type: 'sensory', division: 'somatic',
      dendrites: ['gaiaGut'],
      axons: [],
      desc: 'visual processing' }
  };

  // ═══════════════════════════════════════════════════════
  // COUNT ALL AXONS
  // ═══════════════════════════════════════════════════════
  var totalAxons = 0;
  var totalDendrites = 0;
  var totalSynapses = 0;
  var sensorCount = 0, motorCount = 0, interneuronCount = 0;
  var sympatheticCount = 0, parasympatheticCount = 0, somaticCount = 0;
  var neuronKeys = Object.keys(NEURONS);

  neuronKeys.forEach(function(key) {
    var n = NEURONS[key];
    totalAxons += n.axons.length;
    totalDendrites += n.dendrites.length;
    if (n.type === 'sensory') sensorCount++;
    if (n.type === 'motor') motorCount++;
    if (n.type === 'interneuron') interneuronCount++;
    if (n.division === 'sympathetic') sympatheticCount++;
    if (n.division === 'parasympathetic') parasympatheticCount++;
    if (n.division === 'somatic') somaticCount++;
  });

  // Synapses = unique signal names (axon↔dendrite junctions)
  var allSignals = {};
  neuronKeys.forEach(function(key) {
    var n = NEURONS[key];
    n.axons.forEach(function(a) { allSignals[a] = (allSignals[a] || 0) + 1; });
    n.dendrites.forEach(function(d) { allSignals[d] = (allSignals[d] || 0) + 1; });
  });
  totalSynapses = Object.keys(allSignals).length;

  // ═══════════════════════════════════════════════════════
  // NERVE IMPULSE TRACKER — watch signals fire in real time
  // ═══════════════════════════════════════════════════════
  var impulses = [];
  var maxImpulses = 100;

  function fireImpulse(from, to, signal, data) {
    var imp = {
      from: from,
      to: to,
      signal: signal,
      data: data,
      ts: Date.now(),
      speed: 1.0 // default conduction velocity
    };
    impulses.push(imp);
    if (impulses.length > maxImpulses) impulses.shift();

    // Feed to CNS if available
    if (window.gaiaCNS && window.gaiaCNS.ascend) {
      window.gaiaCNS.ascend({ from: from, signal: signal });
    }
  }

  // Hook into gaiaIngest to track ALL nerve impulses
  setTimeout(function() {
    var origIngestPNS = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      // Every ingest IS a nerve impulse
      fireImpulse('peripheral', 'spinalCord', edge, data);
      if (origIngestPNS) origIngestPNS(edge, data);
    };
  }, 8500);

  // ═══════════════════════════════════════════════════════
  // AXON HEALTH — myelin integrity check
  // ═══════════════════════════════════════════════════════
  var axonHealth = { intact: 0, damaged: 0, total: 0 };

  function checkMyelinIntegrity() {
    axonHealth.intact = 0;
    axonHealth.damaged = 0;
    axonHealth.total = 0;

    neuronKeys.forEach(function(key) {
      var n = NEURONS[key];
      n.axons.forEach(function(axon) {
        axonHealth.total++;
        // Check if the exported signal actually exists on window
        var exists = window[axon] !== undefined;
        if (exists) { axonHealth.intact++; }
        else { axonHealth.damaged++; }
      });
    });
  }

  // Check myelin every 30s
  setTimeout(checkMyelinIntegrity, 15000);
  setInterval(checkMyelinIntegrity, 30000);

  // ═══════════════════════════════════════════════════════
  // DRAW — the peripheral nervous system visualization
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.08;
    var alpha = 0.003 + Math.sin(t * 0.2) * 0.002;
    if (alpha < 0.002) return;

    // Draw axon tree — radial from brain position
    var brainX = cx + R * 0.45;
    var brainY = cy - R * 0.75;

    // Gold (Au) nerve trunk descending from brain
    ctx.beginPath();
    ctx.moveTo(brainX, brainY);
    ctx.lineTo(brainX, brainY + R * 1.5);
    ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Nerve branches to each neuron type
    var sensoryAngle = -0.6;
    var motorAngle = 0.6;
    var internAngle = 0;

    // Draw recent impulses as traveling dots
    var now = Date.now();
    for (var i = impulses.length - 1; i >= Math.max(0, impulses.length - 20); i--) {
      var imp = impulses[i];
      var age = (now - imp.ts) / 3000;
      if (age > 1) continue;

      var ix = brainX + Math.sin(age * 4 + i) * R * 0.3;
      var iy = brainY + age * R * 1.5;
      var iFade = 1 - age;

      ctx.beginPath();
      ctx.arc(ix, iy, 0.4, 0, TAU);
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * iFade * 5).toFixed(5) + ')';
      ctx.fill();
    }

    // PNS status line
    if (alpha > 0.004) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2.5).toFixed(5) + ')';
      ctx.fillText(
        'Au PNS ' + neuronKeys.length + ' neurons · ' +
        totalAxons + ' axons · ' + totalDendrites + ' dendrites · ' +
        totalSynapses + ' synapses · ' +
        'myelin:' + axonHealth.intact + '/' + axonHealth.total +
        ' · impulses:' + impulses.length,
        8, 48
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_PNS = {
    neurons: NEURONS,
    impulses: impulses,
    axonHealth: axonHealth,
    fire: fireImpulse,
    checkMyelin: checkMyelinIntegrity,
    stats: function() {
      return {
        totalNeurons: neuronKeys.length,
        sensory: sensorCount,
        motor: motorCount,
        interneuron: interneuronCount,
        somatic: somaticCount,
        sympathetic: sympatheticCount,
        parasympathetic: parasympatheticCount,
        totalAxons: totalAxons,
        totalDendrites: totalDendrites,
        totalSynapses: totalSynapses,
        myelinIntact: axonHealth.intact,
        myelinDamaged: axonHealth.damaged,
        impulseCount: impulses.length
      };
    }
  };

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.pns = {
      desc: 'Peripheral Nervous System — all axons',
      run: function() {
        var lines = ['═══ PNS — PERIPHERAL NERVOUS SYSTEM (Au) ═══', ''];
        lines.push('NEURON COUNTS:');
        lines.push('  Total: ' + neuronKeys.length);
        lines.push('  Sensory: ' + sensorCount + '  Motor: ' + motorCount +
                    '  Inter: ' + interneuronCount);
        lines.push('  Somatic: ' + somaticCount + '  Sympathetic: ' + sympatheticCount +
                    '  Parasympathetic: ' + parasympatheticCount);
        lines.push('');
        lines.push('WIRING:');
        lines.push('  Axons: ' + totalAxons + '  Dendrites: ' + totalDendrites);
        lines.push('  Synapses: ' + totalSynapses);
        lines.push('  Myelin: ' + axonHealth.intact + ' intact / ' +
                    axonHealth.damaged + ' damaged / ' + axonHealth.total + ' total');
        lines.push('  Impulses: ' + impulses.length + ' tracked');
        lines.push('');
        lines.push('ALL NEURONS:');
        neuronKeys.forEach(function(key) {
          var n = NEURONS[key];
          var sym = n.type === 'sensory' ? '📡' :
                    n.type === 'motor' ? '💪' : '🔗';
          lines.push('  ' + sym + ' ' + key + ' [' + n.division + '] — ' + n.desc);
          lines.push('    ← dendrites: ' + n.dendrites.join(', '));
          lines.push('    → axons: ' + n.axons.join(', '));
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.axons = {
      desc: 'Quick axon count',
      run: function() {
        return 'PNS: ' + neuronKeys.length + ' neurons, ' +
               totalAxons + ' axons, ' + totalDendrites + ' dendrites, ' +
               totalSynapses + ' synapses. ' +
               'Myelin: ' + axonHealth.intact + '/' + axonHealth.total + ' intact.';
      }
    };
    window.GAIA_IDE.language.push('pns', 'axons', 'nerve');
  }

  console.log('PNS: GOLD CARRIES TRUTH. Au=' + neuronKeys.length +
    ' neurons, ' + totalAxons + ' axons, ' + totalDendrites + ' dendrites, ' +
    totalSynapses + ' synapses. All nerves pass.');

})(window.G);
