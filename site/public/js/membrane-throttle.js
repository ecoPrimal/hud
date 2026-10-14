// membrane-throttle.js v1 — the membrane breathes slower on weaker devices
// detects mobile/slow browsers and throttles animations + polling
// MUST load before pi-bus.js and all other scripts
(function(){
  "use strict";

  // detect device capability
  var isMobile = /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(navigator.userAgent);
  var cores = navigator.hardwareConcurrency || 2;
  var isWeak = isMobile || cores <= 2;
  var isVeryWeak = isMobile && cores <= 4;
  var memoryGB = navigator.deviceMemory || 4;
  var isLowMemory = memoryGB <= 2;

  // capability tier: full, reduced, minimal
  var tier = "full";
  if (isVeryWeak || isLowMemory) tier = "minimal";
  else if (isWeak) tier = "reduced";

  // frame budget tracking
  var frameCount = 0;
  var lastFrameTime = 0;
  var avgFrameTime = 16; // start at 60fps assumption
  var isJanking = false;
  var jankCount = 0;

  // throttle requestAnimationFrame globally
  var _origRAF = window.requestAnimationFrame;
  var _origCAF = window.cancelAnimationFrame;
  var _rafQueue = [];
  var _rafId = 0;
  var _skipFrame = false;

  // on minimal tier: skip every other frame
  // on reduced tier: skip every 3rd frame
  var skipPattern = tier === "minimal" ? 2 : (tier === "reduced" ? 3 : 0);

  if (skipPattern > 0) {
    window.requestAnimationFrame = function(cb) {
      _rafId++;
      var id = _rafId;
      var wrapped = function(ts) {
        frameCount++;
        // measure frame time
        if (lastFrameTime) {
          var dt = ts - lastFrameTime;
          avgFrameTime = avgFrameTime * 0.9 + dt * 0.1;
          if (dt > 50) { jankCount++; isJanking = true; }
          else { isJanking = false; }
        }
        lastFrameTime = ts;

        // skip frames on weak devices
        if (frameCount % skipPattern !== 0) {
          // re-queue instead of calling callback
          _origRAF.call(window, wrapped);
          return;
        }
        try { cb(ts); } catch(e) {}
      };
      return _origRAF.call(window, wrapped);
    };
  }

  // pause all animations when page is hidden
  var _visibleCallbacks = [];
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      // page hidden — pause everything
      window._membraneThrottle._paused = true;
    } else {
      window._membraneThrottle._paused = false;
      // resume callbacks
      for (var i = 0; i < _visibleCallbacks.length; i++) {
        try { _visibleCallbacks[i](); } catch(e) {}
      }
    }
  });

  // throttle piBus rates based on tier
  var rateMultiplier = tier === "minimal" ? 3 : (tier === "reduced" ? 2 : 1);

  // expose for pi-bus.js to read
  window._membraneThrottle = {
    tier: tier,
    isMobile: isMobile,
    cores: cores,
    memoryGB: memoryGB,
    rateMultiplier: rateMultiplier,
    skipPattern: skipPattern,
    _paused: false,
    stats: function() {
      return {
        tier: tier,
        avgFrameMs: Math.round(avgFrameTime * 10) / 10,
        fps: Math.round(1000 / avgFrameTime),
        jankCount: jankCount,
        isJanking: isJanking,
        frameCount: frameCount
      };
    },
    onVisible: function(cb) { _visibleCallbacks.push(cb); },
    shouldAnimate: function() {
      // skip animation entirely if page hidden or too janky
      if (window._membraneThrottle._paused) return false;
      if (tier === "minimal" && jankCount > 20) return false;
      return true;
    }
  };

  // log tier on load
  console.log("[membrane-throttle] tier=" + tier + " cores=" + cores + " mem=" + memoryGB + "GB mobile=" + isMobile + " rateX=" + rateMultiplier);
})();
