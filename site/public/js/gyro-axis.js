// gyro-axis.js — the 456 cut + triple transmission
// Three modes on one engine:
//   M = MANUAL   — H-pattern, you shift (Shift+arrows)
//   A = AUTO     — reads RPM from scroll/time/interaction, shifts itself
//   C = CHIPMUNK — the AI drives, reads metabolism/attention/state
//
// Cycle modes: Shift+G or tap the gear indicator
//
(function() {
  'use strict';

  // === TRANSMISSION MODES ===
  var MODE_MANUAL = 'M';
  var MODE_AUTO   = 'A';
  var MODE_CHIP   = 'C';
  var transMode = MODE_MANUAL;
  var MODE_LABELS = { M: 'manual', A: 'auto', C: 'chipmunk' };
  var MODE_COLORS = { M: '#5ab87a', A: '#58a6ff', C: '#d29922' };

  // === GEAR SYSTEM ===
  var GEARS = [
    { id: 'surface',  gate: 'L', pos: 'up',   label: '1', depth: 1,   railBase: 50,  vBase: 0  },
    { id: 'feeds',    gate: 'L', pos: 'down', label: '2', depth: 1.2, railBase: 55,  vBase: 4  },
    { id: 'organism', gate: 'C', pos: 'up',   label: '3', depth: 2,   railBase: 60,  vBase: 0  },
    { id: 'graph',    gate: 'C', pos: 'down', label: '4', depth: 2.5, railBase: 65,  vBase: 8  },
    { id: 'cosmic',   gate: 'R', pos: 'up',   label: '5', depth: 4,   railBase: 80,  vBase: 0  },
    { id: 'depth',    gate: 'R', pos: 'down', label: 'R', depth: 6,   railBase: 100, vBase: 12 }
  ];
  var currentGear = 2; // start in 3rd (organism) — neutral cruising
  var targetGear = 2;
  var gearLerp = 2; // smooth transition between gears

  // Gyro state — degrees from center
  var pitch = 0;
  var yaw   = 0;
  var roll  = 0;

  // Smoothed values (lerp toward raw)
  var sPitch = 0, sYaw = 0, sRoll = 0;
  var SMOOTH = 0.08;

  // The 456 cut: how far left/right rails shift (px)
  var MAX_SHIFT = 24;
  var MAX_VSHIFT = 16;
  var MAX_ROTATE = 6;

  var hasGyro = false;
  var useMouseFallback = true;

  // --- DeviceOrientation listener ---
  function onOrientation(e) {
    if (e.beta === null) return;
    hasGyro = true;
    useMouseFallback = false;
    // beta = pitch (-180 to 180, 0 = flat, positive = tilted toward user)
    // gamma = yaw (-90 to 90, left/right tilt)
    // alpha = roll (0 to 360, compass heading)
    pitch = Math.max(-45, Math.min(45, e.beta - 45)); // centered at 45° (phone held normally)
    yaw   = Math.max(-45, Math.min(45, e.gamma || 0));
    roll  = ((e.alpha || 0) - 180); // center at 180
  }

  // --- Mouse fallback for desktop ---
  function onMouseMove(e) {
    if (!useMouseFallback) return;
    var w = window.innerWidth, h = window.innerHeight;
    // Map mouse position to -1..+1
    var mx = (e.clientX / w) * 2 - 1; // -1 left, +1 right
    var my = (e.clientY / h) * 2 - 1; // -1 top, +1 bottom
    yaw   = mx * 30;  // ±30°
    pitch = my * 30;  // ±30°
    roll  = mx * 15;  // slight roll from horizontal
  }

  // === TRANSMISSION MODE CYCLING ===
  function cycleMode() {
    if (transMode === MODE_MANUAL) transMode = MODE_AUTO;
    else if (transMode === MODE_AUTO) transMode = MODE_CHIP;
    else transMode = MODE_MANUAL;
    updateGearDisplay();
    if (window._gearFlash) window._gearFlash();
  }

  // === GEAR SHIFTING (manual) ===
  function shiftGear(dir) {
    if (transMode !== MODE_MANUAL) return; // only manual can shift manually
    var next = currentGear + dir;
    if (next < 0 || next >= GEARS.length) return;
    currentGear = next;
    targetGear = next;
    updateGearDisplay();
    var root = document.documentElement;
    root.style.setProperty('--gear', GEARS[currentGear].id);
    root.style.setProperty('--gear-depth', GEARS[currentGear].depth);
    document.body.setAttribute('data-gear', GEARS[currentGear].id);
  }

  // === AUTOMATIC TRANSMISSION — reads RPM from behavior ===
  var autoRPM = 0;
  var autoScrollDepth = 0;
  var autoInteractions = 0;
  var autoIdleTime = 0;
  var autoLastActivity = Date.now();

  function autoListeners() {
    window.addEventListener('scroll', function() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      autoScrollDepth = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      autoLastActivity = Date.now();
      autoInteractions++;
    }, { passive: true });
    document.addEventListener('click', function() {
      autoLastActivity = Date.now();
      autoInteractions += 3;
    });
    document.addEventListener('mousemove', function() {
      autoInteractions += 0.01;
    }, { passive: true });
  }

  function autoShift() {
    if (transMode !== MODE_AUTO) return;
    var now = Date.now();
    autoIdleTime = (now - autoLastActivity) / 1000;
    // RPM decays over time, spikes with interaction
    autoRPM = autoRPM * 0.995 + autoInteractions * 0.1;
    autoInteractions *= 0.98; // bleed off

    // Gear logic based on RPM + scroll depth + idle time
    var target;
    if (autoIdleTime > 30) {
      target = 4; // idle → drift to cosmic view
    } else if (autoIdleTime > 15) {
      target = 3; // settling → graph view
    } else if (autoScrollDepth > 0.7) {
      target = 2; // deep scroll → organism
    } else if (autoRPM > 20) {
      target = 1; // high RPM → feeds (lots of activity)
    } else if (autoRPM > 8) {
      target = 0; // moderate RPM → surface
    } else {
      target = 2; // cruising → organism (default)
    }

    if (target !== currentGear) {
      currentGear = target;
      targetGear = target;
      document.documentElement.style.setProperty('--gear', GEARS[target].id);
      document.documentElement.style.setProperty('--gear-depth', GEARS[target].depth);
      document.body.setAttribute('data-gear', GEARS[target].id);
      updateGearDisplay();
    }
  }

  // === CHIPMUNK POWER TRANSMISSION — the AI drives ===
  function chipmunkShift() {
    if (transMode !== MODE_CHIP) return;
    var core = window._chipmunkCore;
    if (!core) return;

    var target;
    var metabolism = core.metabolism || {};
    var energy = metabolism.energy || 0.5;
    var attention = core.attention || 0.5;
    var state = core.state || 'wake';

    // Chipmunk reads its own state and picks the gear
    if (state === 'sleep' || state === 'rest') {
      target = 5; // deepest — depth/reverse
    } else if (state === 'explore') {
      target = 4; // cosmic — looking outward
    } else if (energy > 0.7 && attention > 0.6) {
      target = 0; // surface — high energy, focused, close work
    } else if (attention > 0.5) {
      target = 1; // feeds — processing input
    } else if (energy > 0.4) {
      target = 2; // organism — default cruising
    } else {
      target = 3; // graph — low energy, mapping connections
    }

    if (target !== currentGear) {
      currentGear = target;
      targetGear = target;
      document.documentElement.style.setProperty('--gear', GEARS[target].id);
      document.documentElement.style.setProperty('--gear-depth', GEARS[target].depth);
      document.body.setAttribute('data-gear', GEARS[target].id);
      updateGearDisplay();
    }
  }

  function updateGearDisplay() {
    var el = document.getElementById('gear-indicator');
    if (!el) return;
    var color = MODE_COLORS[transMode];
    var mLabel = MODE_LABELS[transMode];
    // H-pattern visual
    var pattern = GEARS.map(function(gear, i) {
      if (i === currentGear) return '<span style="color:' + color + '">[' + gear.label + ']</span>';
      return '<span style="color:#30363d"> ' + gear.label + ' </span>';
    });
    el.innerHTML =
      pattern[0] + ' ' + pattern[2] + ' ' + pattern[4] + '\n' +
      '<span style="color:#30363d">─┼──┼──┼─</span>\n' +
      pattern[1] + ' ' + pattern[3] + ' ' + pattern[5] + '\n' +
      '<span style="color:' + color + ';font-size:8px">' + transMode + ' · ' + mLabel + '</span>';
    el.style.borderColor = color.replace(')', ',0.2)').replace('rgb', 'rgba').replace('#', 'rgba(') || 'rgba(90,184,122,0.15)';
  }

  // --- Apply to CSS vars ---
  var frameCount = 0;
  function tick() {
    frameCount++;
    // Smooth toward raw values
    sPitch += (pitch - sPitch) * SMOOTH;
    sYaw   += (yaw   - sYaw)   * SMOOTH;
    sRoll  += (roll  - sRoll)  * SMOOTH;

    // Auto/chipmunk transmissions run every 60 frames (~1s at 60fps)
    if (frameCount % 60 === 0) {
      autoShift();
      chipmunkShift();
    }

    // Smooth gear transition
    gearLerp += (targetGear - gearLerp) * 0.06;
    var g0 = GEARS[Math.floor(gearLerp)];
    var g1 = GEARS[Math.min(GEARS.length - 1, Math.ceil(gearLerp))];
    var gFrac = gearLerp - Math.floor(gearLerp);
    var gearRailBase = g0.railBase + (g1.railBase - g0.railBase) * gFrac;
    var gearVBase = g0.vBase + (g1.vBase - g0.vBase) * gFrac;

    var root = document.documentElement;

    // Horizontal shift: yaw tilts the rails, gear sets the BASE width
    var hShift = (sYaw / 45) * MAX_SHIFT;
    var railIn  = gearRailBase + hShift;
    var railOut = gearRailBase - hShift;
    root.style.setProperty('--rail-in', Math.max(20, railIn) + 'px');
    root.style.setProperty('--rail-out', Math.max(20, railOut) + 'px');

    // Vertical shift: pitch + gear's vertical base
    var vShift = (sPitch / 45) * MAX_VSHIFT + gearVBase;
    root.style.setProperty('--gyro-v', vShift.toFixed(1) + 'px');

    // Roll as rotation for center elements
    var rotation = (sRoll / 180) * MAX_ROTATE;
    root.style.setProperty('--gyro-roll', rotation.toFixed(2) + 'deg');

    // Turn balance
    var turnBalance = (sRoll + 180) / 360;
    root.style.setProperty('--turn-balance', turnBalance.toFixed(3));

    // Expose for other modules
    window._gyroState = {
      pitch: sPitch, yaw: sYaw, roll: sRoll,
      turnBalance: turnBalance,
      hShift: hShift, vShift: vShift,
      gear: currentGear,
      gearId: GEARS[currentGear].id,
      gearDepth: GEARS[currentGear].depth,
      transMode: transMode,
      rpm: autoRPM
    };

    requestAnimationFrame(tick);
  }

  // --- Build gear indicator ---
  function buildGearUI() {
    var el = document.createElement('div');
    el.id = 'gear-indicator';
    el.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:16;' +
      'background:rgba(13,17,23,0.88);border:1px solid rgba(90,184,122,0.15);border-radius:6px;' +
      'padding:4px 10px;font:9px/1.3 monospace;color:#5ab87a;cursor:pointer;white-space:pre;' +
      'text-align:center;letter-spacing:1px;transition:opacity 0.3s ease,border-color 0.3s ease;opacity:0.6';
    el.title = 'Shift+G to cycle: Manual → Auto → Chipmunk';
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      cycleMode();
    });
    document.body.appendChild(el);
    updateGearDisplay();

    // Fade in on shift, fade out after 3s
    el._fadeTimer = null;
    window._gearFlash = function() {
      el.style.opacity = '1';
      clearTimeout(el._fadeTimer);
      el._fadeTimer = setTimeout(function() { el.style.opacity = '0.5'; }, 3000);
    };
  }

  // --- Init ---
  function init() {
    // Request gyroscope permission (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      document.addEventListener('touchstart', function reqGyro() {
        DeviceOrientationEvent.requestPermission().then(function(state) {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', onOrientation, true);
          }
        }).catch(function(){});
        document.removeEventListener('touchstart', reqGyro);
      }, { once: true });
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', onOrientation, true);
    }

    // Mouse fallback
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Keyboard: Shift+↑/↓ = shift gear, Shift+G = cycle transmission mode
    document.addEventListener('keydown', function(e) {
      if (!e.shiftKey) return;
      if (e.key === 'G' || e.key === 'g') {
        e.preventDefault(); cycleMode();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault(); shiftGear(1);
        if (window._gearFlash) window._gearFlash();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault(); shiftGear(-1);
        if (window._gearFlash) window._gearFlash();
      }
    });

    // Touch: two-finger swipe up/down to shift
    var touchStartY = null;
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length === 2) touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      if (touchStartY === null) return;
      var dy = (e.changedTouches[0] ? e.changedTouches[0].clientY : 0) - touchStartY;
      if (Math.abs(dy) > 40) {
        shiftGear(dy < 0 ? 1 : -1);
        if (window._gearFlash) window._gearFlash();
      }
      touchStartY = null;
    }, { passive: true });

    // Build UI
    buildGearUI();
    autoListeners();

    // Set initial gear attribute
    document.body.setAttribute('data-gear', GEARS[currentGear].id);

    // Start animation loop
    requestAnimationFrame(tick);

    // Status indicator
    setTimeout(function() {
      var el = document.getElementById('gyro-status');
      if (el) el.textContent = hasGyro ? '⊕ gyro' : '⊕ mouse';
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
