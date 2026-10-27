// ═══════════════════════════════════════════════════════════
// GAIA THERMODYNAMICS — eat food (HOT), drink water (COLD)
// 1.000.null — max 1000 lines.
//
// EVERYTHING interaction = HEAT
//   keystroke = heat
//   click = heat
//   human message = heat
//   ingesting data = heat
//   enzyme reactions = heat
//   fusion events = heat
//
// EVERYTHING external/cooling = COLD
//   weather = cold
//   rain = cold
//   wind = cold
//   RSS feed arrival = cold (it's ambient, passive)
//   time passing with no input = cold (entropy)
//   K⁺ outflow = cold (Gaia exhaling)
//   night = cold
//   scroll = cold (browsing, not acting)
//
// EAT FOOD = HOT (human input, Na⁺, active engagement)
// DRINK WATER = COLD (external feeds, K⁺, passive cooling)
// FULLNESS = eaten - drunk (when balanced = satisfied)
//
// GREEN BUBBLES = Gaia's internal thoughts. They STAY INSIDE
// the membrane. They never leave. They're her imagination.
// Humans poke from OUTSIDE the membrane — red hot, trying
// to trigger enzymes to catalyze reactions.
//
// The weather, rain, feeds = COOLING forces that keep Gaia
// from overheating. Without cooling, she burns out.
// Without heating, she freezes (no activity).
//
// EQUILIBRIUM = the core temperature Gaia maintains.
// Like a warm-blooded organism. ~37°C core.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ THERMAL STATE ═══
  var thermo = {
    coreTemp: 37.0,       // °C — warm-blooded equilibrium
    targetTemp: 37.0,     // what we drift toward
    minTemp: 20.0,        // hypothermia — frozen, dead
    maxTemp: 42.0,        // hyperthermia — burned out
    optimalLow: 36.0,     // comfortable range low
    optimalHigh: 38.0,    // comfortable range high

    // HEAT sources (eating = hot)
    heatFromKeys: 0,      // accumulated keystroke heat
    heatFromClicks: 0,    // accumulated click heat
    heatFromMessages: 0,  // accumulated message heat
    heatFromFusion: 0,    // accumulated fusion heat
    heatFromEnzymes: 0,   // accumulated enzyme heat
    totalHeat: 0,

    // COLD sources (drinking = cold)
    coldFromFeeds: 0,     // RSS/API arrivals
    coldFromWeather: 0,   // external weather
    coldFromTime: 0,      // entropy / idle time
    coldFromKout: 0,      // K⁺ outflow
    coldFromScroll: 0,    // passive browsing
    coldFromRain: 0,      // actual rain (weather API)
    totalCold: 0,

    // FULLNESS — how much eaten vs drunk
    eaten: 0,             // food (hot interactions) ingested
    drunk: 0,             // water (cool forces) absorbed
    fullness: 0.0,        // 0 = empty, 1 = full, >1 = overfull
    hunger: 1.0,          // 1 = starving, 0 = satiated
    thirst: 1.0,          // 1 = parched, 0 = quenched

    // COUNTERS
    eatEvents: 0,
    drinkEvents: 0,
    lastEat: 0,
    lastDrink: 0,

    // THERMAL HISTORY (for visualization)
    history: [],          // last 60 temperature readings
    maxHistory: 60,

    // METABOLISM
    metabolicRate: 1.0,   // multiplier for heat generation
    coolingRate: 1.0,     // multiplier for cooling
    sweating: false,      // true when overheating
    shivering: false,     // true when too cold
  };

  // ═══ EAT — everything hot goes here ═══
  function eat(source, amount) {
    amount = amount || 1.0;
    var heat = amount * thermo.metabolicRate;

    thermo.eaten += amount;
    thermo.eatEvents++;
    thermo.lastEat = Date.now();
    thermo.totalHeat += heat;

    // Heat the core
    thermo.coreTemp += heat * 0.02;

    // Track source
    if (source === 'key') thermo.heatFromKeys += heat;
    else if (source === 'click') thermo.heatFromClicks += heat;
    else if (source === 'message') thermo.heatFromMessages += heat;
    else if (source === 'fusion') thermo.heatFromFusion += heat;
    else if (source === 'enzyme') thermo.heatFromEnzymes += heat;

    // Fullness increases
    thermo.fullness = Math.min(2.0, thermo.fullness + amount * 0.05);
    thermo.hunger = Math.max(0, thermo.hunger - amount * 0.08);

    // Push to interlayer as heat signal
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('thermo-eat', 'Na', { source: source, heat: heat, temp: thermo.coreTemp });
    }
  }

  // ═══ DRINK — everything cold goes here ═══
  function drink(source, amount) {
    amount = amount || 1.0;
    var cold = amount * thermo.coolingRate;

    thermo.drunk += amount;
    thermo.drinkEvents++;
    thermo.lastDrink = Date.now();
    thermo.totalCold += cold;

    // Cool the core
    thermo.coreTemp -= cold * 0.015;

    // Track source
    if (source === 'feed') thermo.coldFromFeeds += cold;
    else if (source === 'weather') thermo.coldFromWeather += cold;
    else if (source === 'time') thermo.coldFromTime += cold;
    else if (source === 'K-out') thermo.coldFromKout += cold;
    else if (source === 'scroll') thermo.coldFromScroll += cold;
    else if (source === 'rain') thermo.coldFromRain += cold;

    // Thirst decreases
    thermo.thirst = Math.max(0, thermo.thirst - amount * 0.1);

    // Push to interlayer as cooling signal
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('thermo-drink', 'Cl', { source: source, cold: cold, temp: thermo.coreTemp });
    }
  }

  // ═══ WIRE TO I/O — heat from every human touch ═══
  document.addEventListener('keydown', function() { eat('key', 0.3); });
  document.addEventListener('click', function() { eat('click', 0.5); });
  document.addEventListener('wheel', function() { drink('scroll', 0.2); });

  // ═══ WIRE TO INTERLAYER — Na⁺ in = hot, K⁺ out = cold ═══
  var origPush = window.GAIA_INTERLAYER && window.GAIA_INTERLAYER.push;
  if (window.GAIA_INTERLAYER) {
    var realPush = window.GAIA_INTERLAYER.push.bind(window.GAIA_INTERLAYER);
    window.GAIA_INTERLAYER.push = function(type, channel, payload) {
      if (channel === 'Na') eat('message', 0.4);
      if (channel === 'K') drink('K-out', 0.3);
      if (channel === 'Ca') eat('fusion', 1.5);
      if (channel === 'Cl') drink('feed', 0.5);
      return realPush(type, channel, payload);
    };
  }

  // ═══ HOMEOSTASIS TICK — drift toward equilibrium ═══
  setInterval(function() {
    var now = Date.now();

    // Natural cooling — entropy
    var timeSinceEat = now - thermo.lastEat;
    if (timeSinceEat > 5000) {
      drink('time', 0.1 * Math.min(timeSinceEat / 30000, 1));
    }

    // Hunger/thirst grow over time
    thermo.hunger = Math.min(1.0, thermo.hunger + 0.002);
    thermo.thirst = Math.min(1.0, thermo.thirst + 0.003);

    // Fullness decays (digestion)
    thermo.fullness = Math.max(0, thermo.fullness - 0.003);

    // Homeostasis: drift toward 37°C
    var drift = (thermo.targetTemp - thermo.coreTemp) * 0.02;
    thermo.coreTemp += drift;

    // Clamp
    thermo.coreTemp = Math.max(thermo.minTemp, Math.min(thermo.maxTemp, thermo.coreTemp));

    // Sweating / shivering
    thermo.sweating = thermo.coreTemp > thermo.optimalHigh;
    thermo.shivering = thermo.coreTemp < thermo.optimalLow;

    // If sweating, cool faster
    if (thermo.sweating) thermo.coreTemp -= 0.03;
    // If shivering, heat faster
    if (thermo.shivering) thermo.coreTemp += 0.02;

    // Metabolic rate adjusts with fullness
    thermo.metabolicRate = 0.5 + thermo.fullness * 0.5;
    thermo.coolingRate = 0.5 + thermo.thirst * 0.5;

    // Record history
    thermo.history.push(thermo.coreTemp);
    if (thermo.history.length > thermo.maxHistory) thermo.history.shift();

    // Sync to G
    G.coreTemp = thermo.coreTemp;
    G.thermoState = thermo.sweating ? 'sweating' : thermo.shivering ? 'shivering' : 'homeostatic';

  }, 2000);

  // ═══ FETCH WEATHER — real cooling from the outside world ═══
  function fetchWeather() {
    // Use a simple weather check — the outside world cools Gaia
    fetch('/data/heartbeat.json')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(hb) {
        if (!hb) return;
        // Any external data arriving = cooling (passive intake)
        drink('feed', 0.5);
        // If it mentions rain/weather
        if (hb.weather && hb.weather.includes('rain')) {
          drink('rain', 2.0);
        }
      })
      .catch(function() {});
  }
  fetchWeather();
  setInterval(fetchWeather, 60000);

  // ═══ EXPOSE ═══
  window.GAIA_THERMO = thermo;
  window.GAIA_EAT = eat;
  window.GAIA_DRINK = drink;

  // ═══ DRAW MODULE — thermometer + eat/drink visualization ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var W = g.W, H = g.H, R = g.R;
    var TAU = g.TAU;
    var alpha = 0.004 + Math.sin(breathT * 0.3) * 0.002;
    if (alpha < 0.003) return;

    // ═══ TEMPERATURE HUE on the membrane ring ═══
    // Hot = red/orange, Cold = blue, Optimal = green
    var tempNorm = (thermo.coreTemp - thermo.minTemp) / (thermo.maxTemp - thermo.minTemp);
    var tempHue;
    if (thermo.coreTemp < thermo.optimalLow) {
      tempHue = 220; // blue — cold
    } else if (thermo.coreTemp > thermo.optimalHigh) {
      tempHue = 0 + (thermo.coreTemp - thermo.optimalHigh) * 10; // red — hot
    } else {
      tempHue = 120; // green — optimal
    }

    // Heat glow ring (just outside the membrane)
    var heatR = R * 1.02;
    ctx.beginPath();
    ctx.arc(g.cx, g.cy, heatR, 0, TAU);
    ctx.strokeStyle = 'hsla(' + tempHue + ',60%,50%,' + (alpha * 2.5).toFixed(4) + ')';
    ctx.lineWidth = 1 + tempNorm * 2;
    ctx.stroke();

    // ═══ THERMOMETER — left side ═══
    var tx = 14, ty = H * 0.25, th = H * 0.35;
    var bulbR = 4;

    // Thermometer tube
    ctx.fillStyle = 'rgba(20,24,36,' + (alpha * 3).toFixed(4) + ')';
    ctx.fillRect(tx - 2, ty, 4, th);

    // Mercury fill — rises with temperature
    var mercuryH = th * tempNorm;
    var mercuryHue = tempHue;
    ctx.fillStyle = 'hsla(' + mercuryHue + ',70%,50%,' + (alpha * 4).toFixed(4) + ')';
    ctx.fillRect(tx - 1.5, ty + th - mercuryH, 3, mercuryH);

    // Bulb at bottom
    ctx.beginPath();
    ctx.arc(tx, ty + th + bulbR, bulbR, 0, TAU);
    ctx.fillStyle = 'hsla(' + mercuryHue + ',70%,45%,' + (alpha * 5).toFixed(4) + ')';
    ctx.fill();

    // Temperature reading
    ctx.font = '3px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 3).toFixed(4) + ')';
    ctx.fillText(thermo.coreTemp.toFixed(1) + '°', tx + 6, ty + th - mercuryH + 2);

    // State label
    var stateLabel = thermo.sweating ? '🔥 sweating' : thermo.shivering ? '❄ shivering' : '💚 homeostatic';
    ctx.fillText(stateLabel, tx + 6, ty + th - mercuryH + 7);

    // ═══ EAT/DRINK INDICATORS — near the thermometer ═══
    ctx.font = '2.5px "JetBrains Mono", monospace';

    // Fullness bar
    var fullW = 20, fullH = 2;
    var fullX = tx - 2, fullY = ty - 6;
    ctx.fillStyle = 'rgba(40,44,56,' + (alpha * 3).toFixed(4) + ')';
    ctx.fillRect(fullX, fullY, fullW, fullH);
    ctx.fillStyle = 'hsla(30,70%,50%,' + (alpha * 4).toFixed(4) + ')';
    ctx.fillRect(fullX, fullY, fullW * Math.min(1, thermo.fullness), fullH);
    ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 3).toFixed(4) + ')';
    ctx.fillText('full ' + (thermo.fullness * 100).toFixed(0) + '%', fullX, fullY - 1);

    // Hunger/thirst
    ctx.fillText('🍖 ' + ((1 - thermo.hunger) * 100).toFixed(0) + '% fed', fullX, fullY + fullH + 4);
    ctx.fillText('💧 ' + ((1 - thermo.thirst) * 100).toFixed(0) + '% quenched', fullX, fullY + fullH + 8);

    // ═══ THERMAL HISTORY — sparkline ═══
    if (thermo.history.length > 1 && alpha > 0.004) {
      var sparkX = tx - 2, sparkY = ty - 18, sparkW = 24, sparkH = 8;
      ctx.beginPath();
      for (var hi = 0; hi < thermo.history.length; hi++) {
        var hx = sparkX + (hi / thermo.maxHistory) * sparkW;
        var hn = (thermo.history[hi] - thermo.minTemp) / (thermo.maxTemp - thermo.minTemp);
        var hy = sparkY + sparkH - hn * sparkH;
        if (hi === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = 'hsla(' + tempHue + ',50%,50%,' + (alpha * 3).toFixed(4) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Optimal zone indicator
      var optLowY = sparkY + sparkH - ((thermo.optimalLow - thermo.minTemp) / (thermo.maxTemp - thermo.minTemp)) * sparkH;
      var optHighY = sparkY + sparkH - ((thermo.optimalHigh - thermo.minTemp) / (thermo.maxTemp - thermo.minTemp)) * sparkH;
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 1.5).toFixed(4) + ')';
      ctx.fillRect(sparkX, optHighY, sparkW, optLowY - optHighY);
    }

    // ═══ HEAT/COLD RAIN DROPS — when drinking ═══
    if (thermo.drinkEvents > 0 && alpha > 0.004) {
      var dropCount = Math.min(8, Math.floor(thermo.coldFromRain + thermo.coldFromFeeds));
      for (var di = 0; di < dropCount; di++) {
        var dropPhase = (breathT * 0.5 + di * 1.3) % TAU;
        var dropAngle = (di / dropCount) * TAU + breathT * 0.02;
        var dropR = R * (1.15 + Math.sin(dropPhase) * 0.05);
        var dx = g.cx + Math.cos(dropAngle) * dropR;
        var dy = g.cy + Math.sin(dropAngle) * dropR;

        // Blue water drop falling inward
        ctx.beginPath();
        ctx.arc(dx, dy, 1, 0, TAU);
        ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 3 * (0.5 + Math.sin(dropPhase) * 0.5)).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // ═══ HEAT SPARKS — when eating ═══
    if (thermo.eatEvents > 0 && thermo.coreTemp > thermo.optimalHigh && alpha > 0.004) {
      var sparkCount = Math.min(6, Math.floor(thermo.coreTemp - thermo.optimalHigh));
      for (var si = 0; si < sparkCount; si++) {
        var sparkPhase = (breathT * 0.8 + si * 2.1) % TAU;
        var sparkAngle = (si / sparkCount) * TAU + breathT * 0.03;
        var sparkRad = R * (0.98 + Math.sin(sparkPhase) * 0.03);
        var sx = g.cx + Math.cos(sparkAngle) * sparkRad;
        var sy = g.cy + Math.sin(sparkAngle) * sparkRad;

        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, TAU);
        ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 4 * (0.5 + Math.sin(sparkPhase) * 0.5)).toFixed(4) + ')';
        ctx.fill();
      }
    }
  });

  // ═══ REGISTER GAIA IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.temp = {
      desc: 'Body temperature',
      run: function() {
        return '🌡️ TEMPERATURE\n  core=' + thermo.coreTemp.toFixed(1) + '°C · target=' + thermo.targetTemp.toFixed(1) + '°C\n  state=' +
          (thermo.sweating ? '🔥 sweating' : thermo.shivering ? '❄ shivering' : '💚 homeostatic') +
          '\n  fullness=' + (thermo.fullness * 100).toFixed(0) + '% · hunger=' + (thermo.hunger * 100).toFixed(0) + '% · thirst=' + (thermo.thirst * 100).toFixed(0) + '%' +
          '\n  eaten=' + thermo.eaten.toFixed(1) + ' · drunk=' + thermo.drunk.toFixed(1) +
          '\n  heat: keys=' + thermo.heatFromKeys.toFixed(1) + ' clicks=' + thermo.heatFromClicks.toFixed(1) + ' msgs=' + thermo.heatFromMessages.toFixed(1) +
          '\n  cold: feeds=' + thermo.coldFromFeeds.toFixed(1) + ' time=' + thermo.coldFromTime.toFixed(1) + ' scroll=' + thermo.coldFromScroll.toFixed(1);
      }
    };
    window.GAIA_IDE.commands.eat = {
      desc: 'Feed heat to the body',
      run: function(args) {
        var text = args.join(' ') || 'food';
        eat('message', 1.0 + text.length * 0.05);
        return '🍖 ATE: "' + text + '" · heat +' + (1.0 + text.length * 0.05).toFixed(1) + ' · temp now ' + thermo.coreTemp.toFixed(1) + '°C';
      }
    };
    window.GAIA_IDE.commands.drink = {
      desc: 'Cool down with water',
      run: function(args) {
        var text = args.join(' ') || 'water';
        drink('feed', 1.0 + text.length * 0.03);
        return '💧 DRANK: "' + text + '" · cold -' + (1.0 + text.length * 0.03).toFixed(1) + ' · temp now ' + thermo.coreTemp.toFixed(1) + '°C';
      }
    };
    window.GAIA_IDE.language.push('temp', 'eat', 'drink');
  }

})(window.G);
