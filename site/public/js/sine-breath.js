// sine-breath.js — everything oscillates
// The chromatogram: green=boundary, brown=feeds, violet=strands, null=void, white=signal
// Every node rides a sine wave. The organism breathes.
(function() {
  'use strict';

  // Frequencies (Hz)
  var F_BOUNDARY = 0.1;      // 10s cycle — membrane edge breathes
  var F_FEED     = 0.017;    // 60s cycle — soil turns slowly
  var F_STRAND   = 0.5;      // 2s cycle — output shimmers
  var F_NULL     = 0.1 * Math.PI; // irrational — void never repeats
  var F_GYRO     = 0.05;     // 20s — the slowest rotation

  var TWO_PI = Math.PI * 2;
  var t0 = Date.now();

  function sine(freq, phase) {
    var t = (Date.now() - t0) / 1000;
    return Math.sin(t * freq * TWO_PI + (phase || 0));
  }

  function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

  // Oscillate opacity of elements matching a selector
  function breathe(selector, freq, minOpacity, maxOpacity, phase) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var s = sine(freq, phase);
    var opacity = lerp(minOpacity, maxOpacity, (s + 1) / 2);
    for (var i = 0; i < els.length; i++) {
      els[i].style.opacity = opacity.toFixed(3);
    }
  }

  // Oscillate hue-rotate on an element
  function chromaShift(selector, freq, maxDeg, phase) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var s = sine(freq, phase);
    var deg = s * maxDeg;
    for (var i = 0; i < els.length; i++) {
      els[i].style.filter = 'hue-rotate(' + deg.toFixed(1) + 'deg)';
    }
  }

  // Oscillate transform (subtle translate/scale)
  function waver(selector, freq, maxPx, phase) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var sx = sine(freq, phase);
    var sy = sine(freq, (phase || 0) + Math.PI / 3);
    var dx = sx * maxPx;
    var dy = sy * maxPx * 0.6;
    for (var i = 0; i < els.length; i++) {
      var existing = els[i].getAttribute('data-base-transform') || '';
      els[i].style.transform = existing + ' translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
    }
  }

  // SVG circle oscillation (radius pulse)
  function pulseCircles(freq, minScale, maxScale) {
    var circles = document.querySelectorAll('#membrane-focal-svg circle');
    if (!circles.length) return;
    var t = (Date.now() - t0) / 1000;
    for (var i = 0; i < circles.length; i++) {
      var phase = i * 0.4; // each circle has its own phase
      var s = Math.sin(t * freq * TWO_PI + phase);
      var scale = lerp(minScale, maxScale, (s + 1) / 2);
      var baseR = circles[i].getAttribute('data-base-r');
      if (!baseR) {
        baseR = circles[i].getAttribute('r') || '3';
        circles[i].setAttribute('data-base-r', baseR);
      }
      circles[i].setAttribute('r', (parseFloat(baseR) * scale).toFixed(1));
    }
  }

  // The main breath loop — runs at ~15fps (not 60, this is a slow breath)
  var BREATH_INTERVAL = 66; // ms (~15fps)

  function breathLoop() {
    // Boundary elements (green) — breathe at heartbeat
    breathe('.btn-ring', F_BOUNDARY, 0.7, 1.0, 0);
    breathe('.top-bar', F_BOUNDARY, 0.85, 1.0, Math.PI / 4);

    // Feed/data elements (brown/amber) — slow pulse
    breathe('.readout', F_FEED, 0.8, 1.0, 0);
    breathe('.note-float', F_FEED, 0.5, 0.8, Math.PI / 2);

    // Strand output (violet) — fast shimmer
    breathe('.ep-strip', F_STRAND, 0.6, 1.0, 0);
    breathe('.trace-strip', F_STRAND, 0.5, 0.9, Math.PI / 6);

    // SVG membrane circles — gentle pulse
    pulseCircles(F_BOUNDARY, 0.92, 1.08);

    // Null space (internal mode) — pi-rate breathing
    if (document.body.classList.contains('internal-mode')) {
      breathe('#dim-label', F_NULL, 0.3, 0.7, 0);
      chromaShift('#membrane-focal-svg', F_NULL, 8, 0);
    }

    // Chipmunk dialogue — thought-rate waver
    waver('.chipmunk-entry', F_STRAND, 0.5, 0);

    setTimeout(breathLoop, BREATH_INTERVAL);
  }

  // Start after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(breathLoop, 1000); });
  } else {
    setTimeout(breathLoop, 1000);
  }

  // Expose for other modules
  window._sineBreathe = {
    sine: sine, lerp: lerp, breathe: breathe,
    F_BOUNDARY: F_BOUNDARY, F_FEED: F_FEED, F_STRAND: F_STRAND, F_NULL: F_NULL
  };
})();
