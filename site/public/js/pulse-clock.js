// pulse-clock.js — the membrane's heartbeat clock
// Everything syncs to this. Not fixed timers. PULSE.
// RPM is requests-per-minute — mapped to visible beat rate (Hz).
// Each surface has its own heartbeat. This is the aggregate.
(function() {
  'use strict';

  var state = {
    rpm: 100,
    trend: 'unknown',
    context: 'unknown',
    reach: 'unknown',
    interval: 60,
    human: 0,
    bot: 0,
    beatHz: 1.0,
    direction: 'unknown',
    in_pulse: 0,
    out_pulse: 0,
    in_ratio: 0,
    out_ratio: 0
  };

  var beatListeners = [];
  var lastFetch = 0;

  // Map RPM (requests-per-minute) to visible beat rate (Hz)
  // Humans see ~0.2–3 Hz as pulsing. Faster = flickering.
  function rpmToHz(rpm) {
    if (rpm <= 0) return 0.15;
    if (rpm < 1)  return 0.2;
    if (rpm < 5)  return 0.4;
    if (rpm < 20) return 0.7;
    if (rpm < 50) return 1.2;
    if (rpm < 200) return 1.8;
    if (rpm < 1000) return 2.3;
    return 3.0;
  }

  function fetchPulse() {
    var now = Date.now();
    if (now - lastFetch < 10000) return;
    lastFetch = now;

    fetch('/neutron.json', {cache: 'no-store'})
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(n) {
        if (!n) return;
        var b = n.breathing || {};
        var c = n.context || {};
        state.rpm = b.rpm || 100;
        state.trend = b.trend || 'steady';
        state.context = c.context || 'unknown';
        state.reach = c.reach || 'unknown';
        state.interval = b.interval_seconds || 60;
        state.human = c.human_count || 0;
        state.bot = c.bot_count || 0;
        state.beatHz = rpmToHz(state.rpm);
        var dir = n.direction || {};
        state.direction = dir.state || 'unknown';
        state.in_pulse = dir.in_pulse || 0;
        state.out_pulse = dir.out_pulse || 0;
        state.in_ratio = dir.in_ratio || 0;
        state.out_ratio = dir.out_ratio || 0;

        beatListeners.forEach(function(fn) {
          try { fn(state); } catch(e) {}
        });
      })
      .catch(function() {});
  }

  // Adaptive interval — scales with actual RPM
  function computeInterval(speed) {
    var base;
    switch(speed) {
      case 'fast':    base = 8000; break;
      case 'normal':  base = 15000; break;
      case 'slow':    base = 30000; break;
      case 'glacial': base = 120000; break;
      default:        base = 15000;
    }

    var scale;
    if (state.rpm > 2000)      scale = 0.5;
    else if (state.rpm > 500)  scale = 0.8;
    else if (state.rpm > 100)  scale = 1.0;
    else                       scale = 2.0;

    if (state.trend === 'rising')  scale *= 0.8;
    if (state.trend === 'falling') scale *= 1.3;

    return Math.max(3000, Math.min(300000, Math.round(base * scale)));
  }

  function adaptiveInterval(fn, speed) {
    var timerId;
    function tick() {
      fn();
      clearTimeout(timerId);
      timerId = setTimeout(tick, computeInterval(speed));
    }
    timerId = setTimeout(tick, computeInterval(speed));
    return { clear: function() { clearTimeout(timerId); } };
  }

  fetchPulse();
  setInterval(fetchPulse, 30000);

  window.PulseClock = {
    get state() { return state; },
    interval: computeInterval,
    adaptive: adaptiveInterval,
    onBeat: function(fn) { beatListeners.push(fn); },
    fetch: fetchPulse,
    rpmToHz: rpmToHz
  };
})();
