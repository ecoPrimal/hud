// pulse-clock.js — the membrane's heartbeat clock
// Everything syncs to this. Not fixed timers. PULSE.
//
// Usage: 
//   PulseClock.interval('fast')   → 8s when active, 30s when dormant
//   PulseClock.interval('normal') → 15s when active, 60s when dormant
//   PulseClock.interval('slow')   → 30s when active, 300s when dormant
//   PulseClock.onBeat(fn)         → called every heartbeat
//   PulseClock.state              → { rpm, trend, context, reach, interval }
(function() {
  'use strict';

  var state = {
    rpm: 100,
    trend: 'unknown',
    context: 'unknown',
    reach: 'unknown',
    interval: 60,
    human: 0,
    bot: 0
  };

  var beatListeners = [];
  var lastFetch = 0;

  // Fetch pulse data from neutron
  function fetchPulse() {
    var now = Date.now();
    if (now - lastFetch < 10000) return; // don't fetch more than every 10s
    lastFetch = now;

    fetch('/neutron.json', {cache: 'no-store'})
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(n) {
        if (!n) return;
        var b = n.breathing || {};
        var ctx = n.context || {};
        state.rpm = b.rpm || 100;
        state.trend = b.trend || 'steady';
        state.context = ctx.context || 'unknown';
        state.reach = ctx.reach || 'unknown';
        state.interval = b.interval_seconds || 60;
        state.human = ctx.human_count || 0;
        state.bot = ctx.bot_count || 0;

        // Notify beat listeners
        beatListeners.forEach(function(fn) {
          try { fn(state); } catch(e) {}
        });
      })
      .catch(function() {});
  }

  // Compute adaptive interval based on pulse
  function computeInterval(speed) {
    var base;
    switch(speed) {
      case 'fast':    base = 8000; break;   // live data (presence, dashboard)
      case 'normal':  base = 15000; break;  // standard refresh
      case 'slow':    base = 30000; break;  // heavy/infrequent
      case 'glacial': base = 120000; break; // background
      default:        base = 15000;
    }

    // Scale by RPM
    var scale;
    if (state.rpm > 2000)      scale = 0.5;  // concert/event — fast
    else if (state.rpm > 500)  scale = 0.8;  // active
    else if (state.rpm > 100)  scale = 1.0;  // normal
    else                       scale = 2.0;  // dormant — slow down

    // Trend modifier
    if (state.trend === 'rising')  scale *= 0.8;
    if (state.trend === 'falling') scale *= 1.3;

    return Math.max(3000, Math.min(300000, Math.round(base * scale)));
  }

  // Adaptive setInterval — adjusts its rate with the pulse
  function adaptiveInterval(fn, speed) {
    var timerId;
    function tick() {
      fn();
      clearTimeout(timerId);
      timerId = setTimeout(tick, computeInterval(speed));
    }
    // First tick after a short delay
    timerId = setTimeout(tick, computeInterval(speed));
    return { clear: function() { clearTimeout(timerId); } };
  }

  // Start the pulse clock
  fetchPulse();
  setInterval(fetchPulse, 30000); // update pulse every 30s

  // Export
  window.PulseClock = {
    get state() { return state; },
    interval: computeInterval,
    adaptive: adaptiveInterval,
    onBeat: function(fn) { beatListeners.push(fn); },
    fetch: fetchPulse
  };
})();
