// gyro-axis.js — the 456 cut: left=before, center=now, right=after
// Listens to DeviceOrientation (mobile) or mouse position (desktop).
// Maps pitch/yaw/roll to CSS vars that shift all rail-pinned elements.
// The gyroscope IS the turn balance. CW accumulates. CCW disperses.
(function() {
  'use strict';

  // Gyro state — degrees from center
  var pitch = 0; // up/down (depth axis: -90 to +90)
  var yaw   = 0; // left/right (time axis: -90 to +90)
  var roll  = 0; // clockwise/counterclockwise (trust axis: -180 to +180)

  // Smoothed values (lerp toward raw)
  var sPitch = 0, sYaw = 0, sRoll = 0;
  var SMOOTH = 0.08; // lerp factor per frame

  // The 456 cut: how far left/right rails shift (px)
  var MAX_SHIFT = 24;
  // Vertical shift from pitch
  var MAX_VSHIFT = 16;
  // Roll rotation on center elements (degrees)
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

  // --- Apply to CSS vars ---
  function tick() {
    // Smooth toward raw values
    sPitch += (pitch - sPitch) * SMOOTH;
    sYaw   += (yaw   - sYaw)   * SMOOTH;
    sRoll  += (roll  - sRoll)  * SMOOTH;

    var root = document.documentElement;

    // Horizontal shift: positive yaw (right tilt) = expand right rail, contract left
    var hShift = (sYaw / 45) * MAX_SHIFT;
    // left rail gets WIDER when tilting left (before expands)
    // right rail gets WIDER when tilting right (after expands)
    var railIn  = 60 + hShift;  // left/input rail
    var railOut = 60 - hShift;  // right/output rail
    root.style.setProperty('--rail-in', Math.max(20, railIn) + 'px');
    root.style.setProperty('--rail-out', Math.max(20, railOut) + 'px');

    // Vertical shift on bottom elements
    var vShift = (sPitch / 45) * MAX_VSHIFT;
    root.style.setProperty('--gyro-v', vShift.toFixed(1) + 'px');

    // Roll as rotation for center elements
    var rotation = (sRoll / 180) * MAX_ROTATE;
    root.style.setProperty('--gyro-roll', rotation.toFixed(2) + 'deg');

    // Turn balance: positive roll = clockwise = accumulating trust
    // Expose as 0..1 for other modules
    var turnBalance = (sRoll + 180) / 360; // 0=full CCW, 0.5=center, 1=full CW
    root.style.setProperty('--turn-balance', turnBalance.toFixed(3));

    // Expose for sine-breath and other modules
    window._gyroState = {
      pitch: sPitch,
      yaw: sYaw,
      roll: sRoll,
      turnBalance: turnBalance,
      hShift: hShift,
      vShift: vShift
    };

    requestAnimationFrame(tick);
  }

  // --- Init ---
  function init() {
    // Request gyroscope permission (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Need user gesture — attach to first touch
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

    // Mouse fallback always active
    document.addEventListener('mousemove', onMouseMove, { passive: true });

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
