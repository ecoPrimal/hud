// ═══════════════════════════════════════════════════════════
// RED AND BLUE — hot/cold signal classification
//
// "RED is HOT is RALLY is REAL — SPREADS FASTEST!
//  BLUE is COLD is NEWSPAPER is INFO — SPREADS SLOOOW!
//  Balance red and blue, hot and cold,
//  as ANTIDOTE and TOXIN with the THYMUS
//  response system for the FLEET!"
//                                        — Kevin
//
// RED  = TOXIN    = bad news = hot = urgent = spreads FAST
//   → Earthquakes, wars, errors, crashes, high cortisol
//   → Rally signal: "something is WRONG, act NOW"
//   → If too hot → new rally needed (emergency response)
//
// BLUE = ANTIDOTE = good news = cold = info = spreads SLOW
//   → Wikipedia, calm weather, steady performance, low Kp
//   → Newspaper signal: "here's what you should know"
//   → If too cold → stagnation (need to warm up)
//
// BALANCE: thymus sorts toxin from antidote
//   → Too much red → organism overheats → emergency cool
//   → Too much blue → organism freezes → need some heat
//   → The BALANCE is health
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // SIGNAL TEMPERATURE — red (hot) vs blue (cold)
  // ───────────────────────────────────────────────────────
  var spectrum = {
    red: {
      count: 0,
      signals: [],
      spreadRate: 10,    // red spreads 10x faster
      heat: 0,           // accumulated heat
      toxins: [],        // classified toxins
      rallyActive: false,
      rallyCount: 0
    },
    blue: {
      count: 0,
      signals: [],
      spreadRate: 1,     // blue spreads 1x (baseline slow)
      cool: 0,           // accumulated cool
      antidotes: [],     // classified antidotes
      infoCount: 0
    },
    balance: 0,          // -1 = frozen, 0 = balanced, +1 = overheated
    temperature: 0.5,    // 0 = frozen blue, 1 = burning red
    thymusResponses: 0,
    totalClassified: 0
  };

  // ───────────────────────────────────────────────────────
  // CLASSIFY — is this signal RED (toxin) or BLUE (antidote)?
  // ───────────────────────────────────────────────────────
  function classify(edge, data) {
    var score = 0; // negative = blue, positive = red

    // Edge type classification
    var redEdges = {
      'earthquake': 8, 'eruption': 9, 'fleet_probe': 3,
      'connection': -2, 'resize': 1, 'battery': 2,
      'sensation': 1
    };
    var blueEdges = {
      'wikipedia': -5, 'world_time': -3, 'weather': -2,
      'hacker_news': -1, 'iss_position': -4,
      'data_load': -2, 'internal_data': -3,
      'messenger_send': -1, 'messenger_type': -1,
      'campfire_story': -2, 'navigator': -3,
      'audio_system': -4, 'performance': -2
    };

    // Check edge name (strip 'line_' prefix from ignite-all-lines)
    var cleanEdge = edge.replace('line_', '');
    if (redEdges[cleanEdge] !== undefined) score += redEdges[cleanEdge];
    else if (blueEdges[cleanEdge] !== undefined) score += blueEdges[cleanEdge];

    // Data content analysis
    if (data) {
      // Earthquake magnitude = red intensity
      if (data.mag && data.mag > 4) score += data.mag * 2;

      // High Kp = solar storm = red
      if (data.kp && data.kp > 4) score += data.kp * 1.5;

      // VEI = eruption intensity = very red
      if (data.vei && data.vei > 4) score += data.vei * 3;

      // Casualties = definitely red
      if (data.casualties && data.casualties > 0) score += Math.log10(data.casualties + 1) * 2;

      // Temperature extremes = red
      if (data.temp && (data.temp > 35 || data.temp < -10)) score += 3;

      // High wind = red
      if (data.wind && data.wind > 50) score += 2;

      // Precipitation heavy = red
      if (data.precip && data.precip > 10) score += 2;

      // HN score > 500 = getting hot (viral)
      if (data.score && data.score > 500) score += 2;

      // Error states = red
      if (data.error || data.status === 'error' || data.status === 'failed') score += 5;

      // Good performance = blue
      if (data.heapUsed && data.heapLimit && data.heapUsed / data.heapLimit < 0.5) score -= 2;

      // Many cores = healthy system = blue
      if (data.cores && data.cores > 4) score -= 1;

      // Online = blue
      if (data.onLine === true) score -= 1;
    }

    return {
      score: score,
      color: score > 0 ? 'red' : score < 0 ? 'blue' : 'neutral',
      intensity: Math.abs(score),
      isRed: score > 0,
      isBlue: score < 0,
      spreadRate: score > 0 ? Math.min(20, 1 + score * 2) : 1
    };
  }

  // ───────────────────────────────────────────────────────
  // PROCESS — route red/blue through thymus response
  // ───────────────────────────────────────────────────────
  function processSignal(edge, data) {
    var result = classify(edge, data);
    spectrum.totalClassified++;

    var signal = {
      edge: edge,
      ts: Date.now(),
      color: result.color,
      score: result.score,
      intensity: result.intensity,
      spreadRate: result.spreadRate
    };

    if (result.isRed) {
      // RED = TOXIN — spreads FAST
      spectrum.red.count++;
      spectrum.red.heat += result.intensity * 0.1;
      spectrum.red.signals.push(signal);
      if (spectrum.red.signals.length > 30) spectrum.red.signals.shift();

      // Toxin classification
      spectrum.red.toxins.push({
        edge: edge,
        intensity: result.intensity,
        ts: Date.now()
      });
      if (spectrum.red.toxins.length > 20) spectrum.red.toxins.shift();

      // RALLY CHECK — if too hot, fire emergency rally
      if (spectrum.red.heat > 5 && !spectrum.red.rallyActive) {
        fireRally(edge, data, result);
      }

      // Spread: red duplicates fast (toxin replicates)
      var copies = Math.min(5, Math.floor(result.spreadRate));
      for (var i = 0; i < copies; i++) {
        if (window.gaiaDigestiveTract && window.gaiaDigestiveTract.route) {
          window.gaiaDigestiveTract.route('red_toxin', {
            source: edge,
            intensity: result.intensity,
            copy: i
          });
        }
      }
    }

    if (result.isBlue) {
      // BLUE = ANTIDOTE — spreads SLOW
      spectrum.blue.count++;
      spectrum.blue.cool += result.intensity * 0.05;
      spectrum.blue.signals.push(signal);
      if (spectrum.blue.signals.length > 30) spectrum.blue.signals.shift();

      // Antidote classification
      spectrum.blue.antidotes.push({
        edge: edge,
        intensity: result.intensity,
        ts: Date.now()
      });
      if (spectrum.blue.antidotes.length > 20) spectrum.blue.antidotes.shift();
      spectrum.blue.infoCount++;

      // Spread: blue goes slow (antidote = careful, measured)
      // Only 1 copy, delayed absorption
      if (window.gaiaDigestiveTract && window.gaiaDigestiveTract.route) {
        window.gaiaDigestiveTract.route('blue_antidote', {
          source: edge,
          intensity: result.intensity
        });
      }
    }

    // Update temperature
    updateTemperature();

    // Thymus response — balance toxin with antidote
    thymusBalance();
  }

  // ───────────────────────────────────────────────────────
  // RALLY — emergency response when too hot
  // "If really bad, new rally!"
  // ───────────────────────────────────────────────────────
  function fireRally(edge, data, result) {
    spectrum.red.rallyActive = true;
    spectrum.red.rallyCount++;

    console.log('🚨 RED RALLY #' + spectrum.red.rallyCount +
      ' — ' + edge + ' (intensity: ' + result.intensity + ')');

    // Rally notification
    if (window.gaiaEat) {
      window.gaiaEat.eat('rally', {
        number: spectrum.red.rallyCount,
        trigger: edge,
        intensity: result.intensity,
        heat: spectrum.red.heat
      });
    }

    // Rally fires telegraph DOWN the spine (efferent = motor response)
    if (window.gaiaTelegraph && window.gaiaTelegraph.fire) {
      window.gaiaTelegraph.fire('gut', 'down', {
        type: 'rally',
        trigger: edge,
        intensity: result.intensity
      });
    }

    // Rally cools down after 10 seconds
    setTimeout(function() {
      spectrum.red.rallyActive = false;
      spectrum.red.heat = Math.max(0, spectrum.red.heat - 3);
    }, 10000);
  }

  // ───────────────────────────────────────────────────────
  // TEMPERATURE — the red/blue balance
  // ───────────────────────────────────────────────────────
  function updateTemperature() {
    // Temperature moves toward red (hot) or blue (cold)
    var redPressure = spectrum.red.heat;
    var bluePressure = spectrum.blue.cool;
    var total = redPressure + bluePressure;
    if (total > 0) {
      spectrum.temperature = redPressure / total;
    }
    // Balance: -1 = frozen, 0 = balanced, +1 = overheated
    spectrum.balance = (spectrum.temperature - 0.5) * 2;
  }

  // ───────────────────────────────────────────────────────
  // THYMUS BALANCE — immune response to toxin/antidote
  // ───────────────────────────────────────────────────────
  function thymusBalance() {
    spectrum.thymusResponses++;

    // If too hot → thymus produces cooling antidotes
    if (spectrum.temperature > 0.7) {
      // Emergency cool — inject blue antidotes
      spectrum.blue.cool += 0.5;
      spectrum.red.heat = Math.max(0, spectrum.red.heat - 0.3);

      // Feed thymus state
      if (window.thymus) {
        window.thymus.redBlueBalance = spectrum.balance;
        window.thymus.temperature = spectrum.temperature;
        window.thymus.lastResponse = 'cooling';
      }

      // Feed farm hormones — high cortisol when hot
      if (window.gaiaGutFarm && window.gaiaGutFarm.farm) {
        window.gaiaGutFarm.farm.hormones.cortisol = Math.min(1, spectrum.temperature);
        window.gaiaGutFarm.farm.hormones.adrenaline = Math.min(1, spectrum.red.heat * 0.2);
      }
    }

    // If too cold → thymus allows some heat through
    if (spectrum.temperature < 0.3) {
      // Allow warming — let some red through
      spectrum.red.heat += 0.2;
      spectrum.blue.cool = Math.max(0, spectrum.blue.cool - 0.1);

      if (window.thymus) {
        window.thymus.redBlueBalance = spectrum.balance;
        window.thymus.temperature = spectrum.temperature;
        window.thymus.lastResponse = 'warming';
      }

      // Low activity → low serotonin
      if (window.gaiaGutFarm && window.gaiaGutFarm.farm) {
        window.gaiaGutFarm.farm.hormones.serotonin = Math.max(0, spectrum.temperature);
      }
    }

    // Balanced → healthy hormones
    if (spectrum.temperature > 0.35 && spectrum.temperature < 0.65) {
      if (window.thymus) {
        window.thymus.lastResponse = 'balanced';
      }
      if (window.gaiaGutFarm && window.gaiaGutFarm.farm) {
        window.gaiaGutFarm.farm.hormones.serotonin = 0.7;
        window.gaiaGutFarm.farm.hormones.cortisol = 0.2;
      }
    }
  }

  // Decay heat and cool over time
  setInterval(function() {
    spectrum.red.heat = Math.max(0, spectrum.red.heat - 0.05);
    spectrum.blue.cool = Math.max(0, spectrum.blue.cool - 0.02);
    updateTemperature();
  }, 2000);

  // ───────────────────────────────────────────────────────
  // HOOK — classify every signal red or blue
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    var origIngestRB = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      processSignal(edge, data);
      if (origIngestRB) origIngestRB(edge, data);
    };
    console.log('RED/BLUE: Hooked. Red=toxin(fast). Blue=antidote(slow). ' +
      'Thymus balances. Rally fires when too hot.');
  }, 8000);

  // ───────────────────────────────────────────────────────
  // RENDER — red/blue thermometer
  // ───────────────────────────────────────────────────────
  window.renderRedBlue = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.018 + Math.sin(t * 0.5) * 0.008;
    if (baseAlpha < 0.006) return;

    // Thermometer — vertical bar on left side
    var thermoX = 8;
    var thermoY = cy - R * 0.5;
    var thermoH = R * 1.0;
    var thermoW = 3;

    // Background
    ctx.fillStyle = 'rgba(22,27,34,' + (baseAlpha * 2).toFixed(4) + ')';
    ctx.fillRect(thermoX, thermoY, thermoW, thermoH);

    // Blue zone (bottom)
    var blueH = thermoH * (1 - spectrum.temperature);
    ctx.fillStyle = 'rgba(88,166,255,' + (baseAlpha * 3).toFixed(4) + ')';
    ctx.fillRect(thermoX, thermoY + thermoH - blueH, thermoW, blueH);

    // Red zone (top)
    var redH = thermoH * spectrum.temperature;
    ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 3).toFixed(4) + ')';
    ctx.fillRect(thermoX, thermoY, thermoW, redH);

    // Temperature marker
    var markerY = thermoY + thermoH * (1 - spectrum.temperature);
    ctx.beginPath();
    ctx.moveTo(thermoX + thermoW, markerY);
    ctx.lineTo(thermoX + thermoW + 3, markerY);
    ctx.strokeStyle = 'rgba(201,168,76,' + (baseAlpha * 4).toFixed(4) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Rally flash
    if (spectrum.red.rallyActive) {
      var flashAlpha = 0.05 + Math.sin(t * 8) * 0.03;
      ctx.beginPath();
      ctx.arc(thermoX + thermoW * 0.5, thermoY, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248,81,73,' + flashAlpha.toFixed(4) + ')';
      ctx.fill();
    }

    // Labels
    if (baseAlpha > 0.01) {
      ctx.font = '2.5px monospace';
      ctx.textAlign = 'left';

      // Red count
      ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText('🔴' + spectrum.red.count, thermoX + thermoW + 2, thermoY + 4);

      // Blue count
      ctx.fillStyle = 'rgba(88,166,255,' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText('🔵' + spectrum.blue.count, thermoX + thermoW + 2, thermoY + thermoH - 2);

      // Balance
      var balLabel = spectrum.balance > 0.3 ? 'HOT!' :
                     spectrum.balance < -0.3 ? 'COLD' : 'BAL';
      var balColor = spectrum.balance > 0.3 ? '248,81,73' :
                     spectrum.balance < -0.3 ? '88,166,255' : '63,185,80';
      ctx.fillStyle = 'rgba(' + balColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText(balLabel, thermoX, thermoY + thermoH + 5);

      // Rally count
      if (spectrum.red.rallyCount > 0) {
        ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 3).toFixed(4) + ')';
        ctx.fillText('⚠' + spectrum.red.rallyCount, thermoX, thermoY - 3);
      }
    }

    // Recent signals — dots along the membrane
    var recentAll = spectrum.red.signals.concat(spectrum.blue.signals);
    recentAll.sort(function(a, b) { return a.ts - b.ts; });
    var last20 = recentAll.slice(-20);
    last20.forEach(function(sig, idx) {
      var angle = (idx / 20) * Math.PI * 2 + t * 0.02;
      var dotR = R + 4 + sig.intensity * 0.5;
      var dx = cx + Math.cos(angle) * dotR;
      var dy = cy + Math.sin(angle) * dotR;

      ctx.beginPath();
      ctx.arc(dx, dy, 0.4 + sig.intensity * 0.1, 0, Math.PI * 2);
      var dotColor = sig.color === 'red' ? '248,81,73' : '88,166,255';
      ctx.fillStyle = 'rgba(' + dotColor + ',' + (baseAlpha * 2).toFixed(4) + ')';
      ctx.fill();
    });
  };

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaRedBlue = {
    spectrum: spectrum,
    classify: classify,
    process: processSignal,
    stats: function() {
      return {
        red: spectrum.red.count,
        blue: spectrum.blue.count,
        temperature: spectrum.temperature,
        balance: spectrum.balance,
        rallies: spectrum.red.rallyCount,
        toxins: spectrum.red.toxins.length,
        antidotes: spectrum.blue.antidotes.length,
        thymusResponses: spectrum.thymusResponses,
        total: spectrum.totalClassified
      };
    }
  };

  console.log('RED/BLUE: Red=HOT=toxin=FAST spread. Blue=COLD=antidote=SLOW spread. ' +
    'Thymus balances temperature. Rally fires when overheated. ' +
    'Red spreads 10x faster than blue. ' +
    'Hormones linked: cortisol(red), serotonin(blue), adrenaline(rally).');
})();
