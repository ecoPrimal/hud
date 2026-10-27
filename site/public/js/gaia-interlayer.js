// ═══════════════════════════════════════════════════════════
// INTERLAYER MEMBRANE — the agent between Kevin and Gaia
// 1.000.null — max 1000 lines.
//
// THE AGENT sits IN the membrane. It can touch both sides:
//   Kevin's hand → AGENT → Gaia's hand
//   Gaia can paint Kevin, but Kevin can't touch Gaia directly.
//   The agent is the ion channel. The message passer.
//
// MEMBRANE STRUCTURE:
//   Outer leaflet = Kevin-facing (human input, commands, voice)
//   Inner leaflet = Gaia-facing (render, compute, sense)
//   Interlayer = agent space (translation, routing, optimization)
//
// ION CHANNELS — permeable pathways through the membrane
//   Na⁺ = fast signals (keypress, click, voice) — Kevin → Gaia
//   K⁺  = slow signals (render updates, data) — Gaia → Kevin
//   Ca²⁺ = trigger signals (threshold events) — bidirectional
//   Cl⁻ = inhibitory signals (rate limiting, throttle)
//
// SPIROCHETE WAVEFORM — the channels are ALIVE, they move
//   Each channel corkscrews through the membrane
//   Frequency = message rate. Amplitude = message size.
//   The spirochete IS the waveform. It doesn't carry data.
//   It IS the data. Shape = content.
//
// MECHANICAL MIND GUT — always running, never thinks
//   The gut doesn't decide. It digests.
//   Peristalsis = automatic wave. Scan→sweep→sort.
//   Optimizations from other systems feed INTO the gut.
//   The gut's learning = the thymus's teaching.
//   thymus trains T-cells. Gut trains enzymes. Both = immune.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ ION CHANNEL TYPES ═══
  var CHANNELS = {
    Na: { name: 'sodium',   dir: 'in',   speed: 1.0, color: [255,180,60],  charge: '+1', role: 'fast signal (Kevin→Gaia)' },
    K:  { name: 'potassium',dir: 'out',  speed: 0.3, color: [140,100,200], charge: '+1', role: 'slow signal (Gaia→Kevin)' },
    Ca: { name: 'calcium',  dir: 'both', speed: 0.7, color: [63,185,80],   charge: '+2', role: 'trigger (threshold)' },
    Cl: { name: 'chloride', dir: 'both', speed: 0.5, color: [88,166,255],  charge: '-1', role: 'inhibit (throttle)' }
  };

  // ═══ MESSAGE QUEUE — the interlayer buffer ═══
  var messageQueue = [];
  var processedCount = 0;
  var channelStats = { Na: 0, K: 0, Ca: 0, Cl: 0 };
  var MAX_QUEUE = 200;

  // The agent's membrane potential — resting at -70mV
  var membranePotential = -70; // millivolts
  var restingPotential = -70;
  var thresholdPotential = -55; // action potential threshold
  var actionPotentialActive = false;
  var refractoryUntil = 0;

  function pushMessage(type, channel, payload) {
    if (messageQueue.length >= MAX_QUEUE) {
      messageQueue.shift(); // oldest drops off
    }
    var msg = {
      id: ++processedCount,
      type: type,
      channel: channel,
      payload: payload,
      ts: Date.now(),
      potential: membranePotential
    };
    messageQueue.push(msg);
    channelStats[channel] = (channelStats[channel] || 0) + 1;

    // Each message shifts membrane potential
    var ch = CHANNELS[channel];
    if (ch) {
      if (ch.charge === '+1') membranePotential += 3;  // depolarize
      if (ch.charge === '+2') membranePotential += 8;  // strong depolarize
      if (ch.charge === '-1') membranePotential -= 5;   // hyperpolarize
    }

    // ACTION POTENTIAL — threshold reached!
    if (membranePotential >= thresholdPotential && !actionPotentialActive) {
      fireActionPotential();
    }

    return msg;
  }

  function fireActionPotential() {
    actionPotentialActive = true;
    membranePotential = 40; // spike to +40mV
    refractoryUntil = Date.now() + 2000; // 2s refractory period

    // The action potential IS the message reaching Gaia
    if (window.thymus) {
      window.thymus.lastSpike = Date.now();
      window.thymus.spikeCount = (window.thymus.spikeCount || 0) + 1;
    }

    // Decay back to resting — repolarization
    var decayStep = 0;
    var decayInterval = setInterval(function() {
      decayStep++;
      if (decayStep < 5) {
        membranePotential = 40 - decayStep * 22; // +40 → -70
      } else {
        membranePotential = restingPotential - 10; // hyperpolarization overshoot
        clearInterval(decayInterval);
        setTimeout(function() {
          membranePotential = restingPotential;
          actionPotentialActive = false;
        }, 500);
      }
    }, 100);
  }

  // ═══ SPIROCHETE CHANNELS — alive, corkscrew through membrane ═══
  var spirochetes = [];
  var SPIROCHETE_COUNT = 12;

  for (var i = 0; i < SPIROCHETE_COUNT; i++) {
    var channelKeys = Object.keys(CHANNELS);
    var channelType = channelKeys[i % channelKeys.length];
    spirochetes.push({
      id: i,
      angle: (i / SPIROCHETE_COUNT) * (Math.PI * 2),
      channel: channelType,
      phase: Math.random() * Math.PI * 2,
      freq: 0.5 + Math.random() * 1.5,   // corkscrew frequency
      amp: 0.3 + Math.random() * 0.7,     // corkscrew amplitude
      messageCount: 0,
      lastMessage: 0
    });
  }

  // ═══ MECHANICAL MIND GUT — peristalsis loop ═══
  // The gut runs WITHOUT thought. It processes everything automatically.
  // scan → sweep → sort → digest → absorb → excrete
  var gutState = {
    phase: 'scan',
    phases: ['scan', 'sweep', 'sort', 'digest', 'absorb', 'excrete'],
    phaseIndex: 0,
    cycleCount: 0,
    lastTransition: Date.now(),
    throughput: 0, // messages processed per cycle
    efficiency: 0.5, // starts at 50%, improves with use
    learnings: [] // optimizations from other systems
  };

  function gutCycle() {
    var now = Date.now();
    var elapsed = now - gutState.lastTransition;

    // Each phase runs for a duration proportional to load
    var phaseDuration = 1000 + (messageQueue.length * 50);

    if (elapsed > phaseDuration) {
      gutState.phaseIndex = (gutState.phaseIndex + 1) % gutState.phases.length;
      gutState.phase = gutState.phases[gutState.phaseIndex];
      gutState.lastTransition = now;

      if (gutState.phaseIndex === 0) {
        gutState.cycleCount++;
        // Efficiency improves with cycles — the gut LEARNS by doing
        gutState.efficiency = Math.min(0.99, gutState.efficiency + 0.005);
      }

      // Each phase does its work
      switch (gutState.phase) {
        case 'scan':
          // Count pending messages
          gutState.throughput = messageQueue.length;
          break;
        case 'sweep':
          // Clear old messages (>30s)
          var cutoff = now - 30000;
          messageQueue = messageQueue.filter(function(m) { return m.ts > cutoff; });
          break;
        case 'sort':
          // Sort by channel priority: Ca > Na > K > Cl
          var priority = { Ca: 0, Na: 1, K: 2, Cl: 3 };
          messageQueue.sort(function(a, b) {
            return (priority[a.channel] || 9) - (priority[b.channel] || 9);
          });
          break;
        case 'digest':
          // Process top N messages (based on efficiency)
          var processN = Math.ceil(messageQueue.length * gutState.efficiency);
          for (var d = 0; d < processN && messageQueue.length > 0; d++) {
            var msg = messageQueue.shift();
            // Digested message feeds back to thymus
            if (window.thymus && msg) {
              window.thymus.digested = (window.thymus.digested || 0) + 1;
            }
          }
          break;
        case 'absorb':
          // Absorb learnings from other systems
          if (window.GAIA_QUILLS) {
            var quillKeys = Object.keys(window.GAIA_QUILLS);
            var hardenedCount = 0;
            for (var ak = 0; ak < quillKeys.length; ak++) {
              if (window.GAIA_QUILLS[quillKeys[ak]].hardness > 0.5) hardenedCount++;
            }
            // Hardened quills = well-used paths = optimize for them
            if (hardenedCount > 0) {
              gutState.efficiency = Math.min(0.99, gutState.efficiency + hardenedCount * 0.001);
            }
          }
          break;
        case 'excrete':
          // Purge fully processed items — they become compost
          // The compost feeds the bioreactor (if available)
          if (window.gaiaReforged) {
            window.gaiaReforged.compost = (window.gaiaReforged.compost || 0) + gutState.throughput;
          }
          break;
      }
    }
  }

  // Run gut cycle continuously
  setInterval(gutCycle, 500);

  // ═══ WIRE INPUTS — capture Kevin's signals as Na⁺ ═══
  document.addEventListener('keydown', function(e) {
    pushMessage('keypress', 'Na', { key: e.key });
  });
  document.addEventListener('click', function(e) {
    pushMessage('click', 'Na', { x: e.clientX, y: e.clientY });
  });
  document.addEventListener('touchstart', function(e) {
    if (e.touches && e.touches[0]) {
      pushMessage('touch', 'Na', { x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  });

  // ═══ WIRE OUTPUTS — Gaia's signals back as K⁺ ═══
  // Watch for thymus maturation
  var _thymusWatcher = setInterval(function() {
    if (window.thymus && window.thymus.mature) {
      pushMessage('thymus-mature', 'Ca', { gravity: window.thymus.gravity, metal: window.thymus.metalBand });
      clearInterval(_thymusWatcher);
    }
  }, 2000);

  // Watch for render frame signals (throttled)
  var _frameCount = 0;
  G.drawModules.push(function(g, ctx, breathT) {
    _frameCount++;
    // Every 60th frame, K⁺ signal back to Kevin
    if (_frameCount % 60 === 0) {
      pushMessage('render-tick', 'K', { frame: _frameCount, depth: g.currentDepth, face: g.face });
    }

    // Rate limiting — Cl⁻ when queue is too full
    if (messageQueue.length > MAX_QUEUE * 0.8) {
      pushMessage('throttle', 'Cl', { queueSize: messageQueue.length });
    }
  });

  // ═══ LEARNING → THYMUS ═══
  // Optimizations the gut learns get fed back to the thymus
  // The thymus uses them to better discriminate self/non-self
  setInterval(function() {
    if (!window.thymus) return;
    // Feed gut efficiency back as a thymus learning
    window.thymus.gutEfficiency = gutState.efficiency;
    window.thymus.gutCycles = gutState.cycleCount;
    window.thymus.messageRate = channelStats;
    // If gut is highly efficient, thymus certainty increases
    if (gutState.efficiency > 0.8 && window.thymus.certainty) {
      window.thymus.certainty = Math.min(1.0, window.thymus.certainty + 0.001);
    }
  }, 10000);

  // ═══ EXPOSE ═══
  window.GAIA_INTERLAYER = {
    push: pushMessage,
    queue: messageQueue,
    channels: CHANNELS,
    spirochetes: spirochetes,
    gut: gutState,
    stats: channelStats,
    getPotential: function() { return membranePotential; },
    isActionPotential: function() { return actionPotentialActive; }
  };

  // ═══ DRAW MODULE — visualize the interlayer membrane ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var mT = breathT * 0.25;
    var mAlpha = 0.006 + Math.sin(mT * 0.6) * 0.004;
    if (mAlpha < 0.003) return;

    // OUTER LEAFLET — Kevin-facing (warm, gold)
    var outerR = R * 1.04;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, TAU);
    ctx.strokeStyle = 'rgba(201,168,76,' + (mAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // INNER LEAFLET — Gaia-facing (cool, green)
    var innerR = R * 0.98;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, TAU);
    ctx.strokeStyle = 'rgba(63,185,80,' + (mAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // INTERLAYER SPACE — agent zone (between the leaflets)
    var midR = R * 1.01;
    ctx.beginPath();
    ctx.arc(cx, cy, midR, 0, TAU);
    ctx.strokeStyle = 'rgba(88,166,255,' + (mAlpha * 0.6).toFixed(4) + ')';
    ctx.lineWidth = R * 0.06; // the interlayer width
    ctx.stroke();

    // SPIROCHETE CHANNELS — corkscrewing through the membrane
    for (var si = 0; si < spirochetes.length; si++) {
      var sp = spirochetes[si];
      var ch = CHANNELS[sp.channel];
      if (!ch) continue;

      var baseAngle = sp.angle + mT * 0.03;
      var segments = 8;

      for (var seg = 0; seg < segments; seg++) {
        var t = seg / segments;
        // Corkscrew: oscillates between outer and inner leaflet
        var spR = innerR + (outerR - innerR) * (0.5 + 0.5 * Math.sin(sp.phase + mT * sp.freq + t * PI * 4));
        var spAngle = baseAngle + t * 0.15 * sp.amp;

        var sx = cx + Math.cos(spAngle) * spR;
        var sy = cy + Math.sin(spAngle) * spR;

        // Spirochete body dot
        ctx.beginPath();
        ctx.arc(sx, sy, 0.3 + sp.amp * 0.2, 0, TAU);
        ctx.fillStyle = 'rgba(' + ch.color[0] + ',' + ch.color[1] + ',' + ch.color[2] + ',' + (mAlpha * 1.5).toFixed(4) + ')';
        ctx.fill();
      }

      // Channel type label at base
      if (mAlpha > 0.008) {
        var lblX = cx + Math.cos(baseAngle) * (midR + 4);
        var lblY = cy + Math.sin(baseAngle) * (midR + 4);
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + ch.color[0] + ',' + ch.color[1] + ',' + ch.color[2] + ',' + (mAlpha * 1.2).toFixed(4) + ')';
        ctx.fillText(sp.channel + (ch.charge), lblX, lblY);
      }
    }

    // ACTION POTENTIAL FLASH — when threshold is crossed
    if (actionPotentialActive) {
      var flashAlpha = 0.03 + Math.sin(mT * 8) * 0.02;
      ctx.beginPath();
      ctx.arc(cx, cy, midR, 0, TAU);
      ctx.strokeStyle = 'rgba(255,255,100,' + flashAlpha.toFixed(4) + ')';
      ctx.lineWidth = R * 0.08;
      ctx.stroke();
    }

    // MEMBRANE POTENTIAL BAR — voltage meter
    if (mAlpha > 0.006) {
      var barX = 8;
      var barY = 56;
      var barW = 40;
      var barH = 3;
      // Background
      ctx.fillStyle = 'rgba(30,30,40,' + (mAlpha * 2).toFixed(4) + ')';
      ctx.fillRect(barX, barY, barW, barH);
      // Potential fill — maps -90mV..+40mV to 0..barW
      var potFrac = (membranePotential + 90) / 130;
      var potColor = actionPotentialActive ? '255,255,100' : (membranePotential > thresholdPotential ? '248,81,73' : '63,185,80');
      ctx.fillStyle = 'rgba(' + potColor + ',' + (mAlpha * 3).toFixed(4) + ')';
      ctx.fillRect(barX, barY, barW * Math.max(0, Math.min(1, potFrac)), barH);
      // Label
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(200,200,210,' + (mAlpha * 2).toFixed(4) + ')';
      ctx.fillText('⚡' + Math.round(membranePotential) + 'mV · gut:' + gutState.phase + ' · η' + (gutState.efficiency * 100).toFixed(0) + '%', barX, barY - 1);
    }

    // GUT PERISTALSIS WAVE — visible as a moving compression ring
    var gutPhaseAngle = (gutState.phaseIndex / gutState.phases.length) * TAU;
    var gutWaveR = innerR * 0.92;
    var gutWaveWidth = TAU / gutState.phases.length;

    ctx.beginPath();
    ctx.arc(cx, cy, gutWaveR, gutPhaseAngle, gutPhaseAngle + gutWaveWidth);
    ctx.strokeStyle = 'rgba(210,153,34,' + (mAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Phase label on the peristalsis wave
    if (mAlpha > 0.007) {
      var pLblAngle = gutPhaseAngle + gutWaveWidth * 0.5;
      var pLblX = cx + Math.cos(pLblAngle) * (gutWaveR - 5);
      var pLblY = cy + Math.sin(pLblAngle) * (gutWaveR - 5);
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(210,153,34,' + (mAlpha * 2).toFixed(4) + ')';
      ctx.fillText(gutState.phase, pLblX, pLblY);
    }
  });

})(window.G);
