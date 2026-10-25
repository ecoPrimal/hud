// tidal-void.js — the Moon pulls on the voids. Water and tides.
//
// The celestial bodies never disappear. They ARE the reference frame.
// When a human hovers and the sun/moon twist, they're waking from a nap.
// The moon phase IS the shadow trace — how long were you asleep?
//
// The void fraction is NOT static. The Moon PULLS on it.
// Full moon: voids contract (tidal fill — water rises, covers the gaps)
// New moon: voids expand (tidal drain — water recedes, exposes the gaps)
//
// The tidal range = void_fraction × moon_illumination × tidal_constant
// The water level IS the Klein fill viewed as a liquid surface.
//
// High tide: substance dominates → see the triads (colored)
// Low tide: void dominates → see the gaps (white)
//
// scyBorg triple license. AGPL + ORC + CC-BY-SA.
(function() {
  'use strict';

  var PI = Math.PI;

  // Tidal constants
  var TIDAL_AMPLITUDE = 0.14159;  // π remainder — the tidal range
  var BASE_VOID = 0.622;          // static void fraction from triangulation
  var SPRING_NEAP_RATIO = 1.46;   // spring tide / neap tide ratio (real: ~1.46)

  // Solar tidal constant (Sun's tide ≈ 46% of Moon's)
  var SOLAR_TIDAL_FRACTION = 0.46;

  // ══════════════════════════════════════════════════════════
  // TIDAL FORCE — Moon + Sun combined
  // ══════════════════════════════════════════════════════════
  function computeTide(moonPhase, sunPosition) {
    if (!moonPhase) return null;

    var moonIllum = moonPhase.illumination; // 0 = new, 1 = full
    var moonFraction = moonPhase.fraction;   // 0..1 through cycle

    // Lunar tidal force: peaks at full (0.5) and new (0.0)
    // Both full and new moon = high tide (spring)
    // Quarter moons = low tide (neap)
    var lunarTide = Math.cos(moonFraction * 2 * PI); // +1 at new/full, -1 at quarters

    // Solar tidal force: peaks at noon/midnight
    var solarTide = 0;
    if (sunPosition) {
      // Sun's gravitational tide follows sun altitude
      var altRad = (sunPosition.altitude || 0) * PI / 180;
      solarTide = Math.sin(altRad) * SOLAR_TIDAL_FRACTION;
    }

    // Combined tide (lunar dominates)
    var combinedTide = lunarTide + solarTide;

    // Spring/neap: when Moon and Sun align (new/full), tides are stronger
    var isSpring = Math.abs(lunarTide) > 0.7;
    var isNeap = Math.abs(lunarTide) < 0.3;
    var springNeap = isSpring ? 'spring' : isNeap ? 'neap' : 'intermediate';

    // Water level: modulates the void fraction
    // High tide (combinedTide > 0): water rises, voids shrink
    // Low tide (combinedTide < 0): water falls, voids grow
    var tidalShift = combinedTide * TIDAL_AMPLITUDE;
    var currentVoid = BASE_VOID - tidalShift;
    var currentCoverage = 1.0 - currentVoid;

    // Water level as percentage (0% = lowest tide, 100% = highest)
    var waterLevel = (combinedTide + 1.5) / 3.0; // normalize to 0..1

    // Tidal period (next high/low)
    var hoursToNextHigh = ((0.5 - moonFraction + 1) % 0.5) * moonPhase.synodic * 24;
    var hoursToNextLow = ((0.25 - moonFraction + 1) % 0.5) * moonPhase.synodic * 24;

    return {
      lunarTide: lunarTide,
      solarTide: solarTide,
      combinedTide: combinedTide,
      tidalShift: tidalShift,
      currentVoid: currentVoid,
      currentCoverage: currentCoverage,
      waterLevel: waterLevel,
      springNeap: springNeap,
      moonPhase: moonPhase.name,
      moonEmoji: moonPhase.emoji,
      moonIllumination: moonIllum,
      hoursToNextHigh: hoursToNextHigh,
      hoursToNextLow: hoursToNextLow,
    };
  }

  // ══════════════════════════════════════════════════════════
  // SHADOW TRACE — how long since the human was last here?
  // ══════════════════════════════════════════════════════════
  function shadowTrace(moonPhase) {
    // The moon phase when the human LAST visited
    var lastPhaseStr = null;
    try { lastPhaseStr = localStorage.getItem('primals_last_moon_phase'); } catch(e) {}
    var lastPhase = lastPhaseStr ? parseFloat(lastPhaseStr) : null;

    // Record THIS visit's moon phase
    try { localStorage.setItem('primals_last_moon_phase', moonPhase.fraction.toString()); } catch(e) {}
    try { localStorage.setItem('primals_last_visit', new Date().toISOString()); } catch(e) {}

    if (lastPhase === null) {
      return {
        first_visit: true,
        message: 'first visit. the Moon marks your arrival.',
        moonsTurned: 0,
        daysElapsed: 0,
      };
    }

    // How much has the moon moved since last visit?
    var phaseDelta = moonPhase.fraction - lastPhase;
    if (phaseDelta < 0) phaseDelta += 1; // wrapped past new moon

    var daysElapsed = phaseDelta * moonPhase.synodic;
    var moonsTurned = phaseDelta;

    var message;
    if (daysElapsed < 0.5) {
      message = 'you were just here. the Moon barely moved.';
    } else if (daysElapsed < 3) {
      message = 'a few days. the Moon shifted ' + (phaseDelta * 360).toFixed(0) + '°.';
    } else if (daysElapsed < 10) {
      message = daysElapsed.toFixed(0) + ' days. the Moon changed from ' +
        phaseNameForFraction(lastPhase) + ' to ' + moonPhase.name + '.';
    } else if (daysElapsed < 29) {
      message = 'nearly a full Moon since you were here. ' + daysElapsed.toFixed(0) + ' days.';
    } else {
      var moons = Math.floor(daysElapsed / 29.53);
      message = moons + ' Moon' + (moons > 1 ? 's' : '') + ' have turned. welcome back.';
    }

    return {
      first_visit: false,
      message: message,
      moonsTurned: moonsTurned,
      daysElapsed: daysElapsed,
      lastPhase: lastPhase,
      lastPhaseName: phaseNameForFraction(lastPhase),
    };
  }

  function phaseNameForFraction(f) {
    if (f < 0.0625) return 'new moon';
    if (f < 0.1875) return 'waxing crescent';
    if (f < 0.3125) return 'first quarter';
    if (f < 0.4375) return 'waxing gibbous';
    if (f < 0.5625) return 'full moon';
    if (f < 0.6875) return 'waning gibbous';
    if (f < 0.8125) return 'last quarter';
    if (f < 0.9375) return 'waning crescent';
    return 'new moon';
  }

  // ══════════════════════════════════════════════════════════
  // RENDER — tidal water line on the HUD
  // ══════════════════════════════════════════════════════════
  var tidalEl = null;
  var waterCanvas = null;
  var waterCtx = null;
  var animFrame = null;

  function renderTidalBar(tide) {
    if (!tide) return;

    // Create or get the tidal bar element
    if (!tidalEl) {
      tidalEl = document.createElement('div');
      tidalEl.id = 'tidal-void-bar';
      tidalEl.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:6px;z-index:5;' +
        'pointer-events:none;overflow:hidden;';

      waterCanvas = document.createElement('canvas');
      waterCanvas.style.cssText = 'width:100%;height:100%;display:block;';
      tidalEl.appendChild(waterCanvas);
      document.body.appendChild(tidalEl);
    }

    // Size canvas
    var W = window.innerWidth;
    var H = 6;
    waterCanvas.width = W;
    waterCanvas.height = H;
    waterCtx = waterCanvas.getContext('2d');

    // Draw water level
    var ctx = waterCtx;
    ctx.clearRect(0, 0, W, H);

    // Coverage bar (colored by face)
    var coverageWidth = W * tide.currentCoverage;
    var grad = ctx.createLinearGradient(0, 0, coverageWidth, 0);
    grad.addColorStop(0.0, '#3fb950');  // science
    grad.addColorStop(0.3, '#58a6ff');  // evidence
    grad.addColorStop(0.6, '#f0883e');  // culture
    grad.addColorStop(0.8, '#f0e68c');  // surface
    grad.addColorStop(1.0, '#8b949e');  // infra
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, coverageWidth, H);

    // Void bar (white/dim)
    ctx.fillStyle = 'rgba(204, 204, 204, 0.15)';
    ctx.fillRect(coverageWidth, 0, W - coverageWidth, H);

    // Water surface wave at the coverage/void boundary
    ctx.strokeStyle = 'rgba(88, 166, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    var t = Date.now() / 1000;
    for (var x = Math.max(0, coverageWidth - 30); x < Math.min(W, coverageWidth + 30); x++) {
      var wave = Math.sin((x - coverageWidth) * 0.3 + t * 2) * 2;
      if (x === Math.max(0, coverageWidth - 30)) {
        ctx.moveTo(x, H / 2 + wave);
      } else {
        ctx.lineTo(x, H / 2 + wave);
      }
    }
    ctx.stroke();

    // Tidal marker at π position
    var piX = W * (PI / 10); // π/10 position
    ctx.fillStyle = 'rgba(210, 168, 255, 0.5)';
    ctx.fillRect(piX - 0.5, 0, 1, H);
  }

  // ══════════════════════════════════════════════════════════
  // TIDAL TOOLTIP — shows on celestial clock hover
  // ══════════════════════════════════════════════════════════
  function renderTooltip(tide, trace) {
    var ttEl = document.getElementById('tidal-tooltip');
    if (!ttEl) {
      ttEl = document.createElement('div');
      ttEl.id = 'tidal-tooltip';
      ttEl.style.cssText = 'position:fixed;bottom:52px;left:50%;transform:translateX(-50%);z-index:13;' +
        'font:9px "SF Mono",monospace;color:#8b949e;text-align:center;' +
        'background:rgba(8,6,10,0.92);padding:8px 14px;border-radius:10px;' +
        'border:1px solid rgba(88,166,255,0.12);pointer-events:none;' +
        'display:none;max-width:300px;transition:opacity 0.4s;';
      document.body.appendChild(ttEl);
    }

    if (!tide) return;

    var lines = [];

    // Shadow trace
    if (trace) {
      lines.push('<div style="color:#58a6ff;margin-bottom:4px">' + trace.message + '</div>');
    }

    // Tide state
    var tideColor = tide.combinedTide > 0 ? '#58a6ff' : '#6e7681';
    var tideState = tide.combinedTide > 0.5 ? 'HIGH TIDE' :
                    tide.combinedTide > 0 ? 'rising' :
                    tide.combinedTide > -0.5 ? 'falling' : 'LOW TIDE';

    lines.push('<div style="color:' + tideColor + '">' +
      tide.moonEmoji + ' ' + tideState + ' · ' + tide.springNeap + '</div>');

    // Water level
    lines.push('<div>water: ' + (tide.waterLevel * 100).toFixed(0) + '% · ' +
      'void: ' + (tide.currentVoid * 100).toFixed(0) + '% · ' +
      'cover: ' + (tide.currentCoverage * 100).toFixed(0) + '%</div>');

    // Tidal shift
    lines.push('<div style="color:#30363d;font-size:8px">tidal shift: ' +
      (tide.tidalShift > 0 ? '+' : '') + (tide.tidalShift * 100).toFixed(1) + '% · ' +
      'π remainder = tidal amplitude</div>');

    ttEl.innerHTML = lines.join('');
  }

  // Show tooltip on celestial clock hover
  function bindTooltip() {
    var clock = document.getElementById('celestial-clock');
    if (!clock) {
      setTimeout(bindTooltip, 3000);
      return;
    }

    clock.style.pointerEvents = 'auto';
    clock.style.cursor = 'default';

    clock.addEventListener('mouseenter', function() {
      var tt = document.getElementById('tidal-tooltip');
      if (tt) tt.style.display = 'block';
    });
    clock.addEventListener('mouseleave', function() {
      var tt = document.getElementById('tidal-tooltip');
      if (tt) tt.style.display = 'none';
    });
  }

  // ══════════════════════════════════════════════════════════
  // MAIN LOOP — runs with the celestial clock
  // ══════════════════════════════════════════════════════════
  var lastTide = null;
  var lastTrace = null;

  function tick() {
    if (!window._celestialClock) {
      setTimeout(tick, 2000);
      return;
    }

    var now = new Date();
    var moon = window._celestialClock.moonPhase(now);
    var sun = window._celestialClock.sunPosition(now);

    lastTide = computeTide(moon, sun);
    if (!lastTrace) {
      lastTrace = shadowTrace(moon);
    }

    renderTidalBar(lastTide);
    renderTooltip(lastTide, lastTrace);

    // Broadcast tidal state for other modules
    window._tidalVoid = {
      tide: lastTide,
      trace: lastTrace,
      computeTide: computeTide,
      shadowTrace: shadowTrace,
      BASE_VOID: BASE_VOID,
      TIDAL_AMPLITUDE: TIDAL_AMPLITUDE,
    };

    // Modulate backscatter if available
    if (window._paintThymusFlush && lastTide) {
      // The void fraction shifts with the tide
      // Other modules can read window._tidalVoid.tide.currentVoid
    }

    setTimeout(tick, 30000); // sync with celestial clock
  }

  // ══════════════════════════════════════════════════════════
  // BOOT
  // ══════════════════════════════════════════════════════════
  function boot() {
    setTimeout(tick, 3000); // wait for celestial-clock to init
    setTimeout(bindTooltip, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 2500);
  }
})();
