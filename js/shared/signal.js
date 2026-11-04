// ═══════════════════════════════════════════════════════════
// SIGNAL — Collapsed from signal-button + signal-reach +
//   signal-return + signal-relay
// signal.primals.eco — core human signaling system
//
// Ties into campfire stories and beacons.
// Signal IS the nerve. Water IS the flow. Campfire IS the gathering.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var listeners = {};  // event → [callbacks]
  var beacons = [];    // active beacons
  var signalLog = [];  // last N signals for debugging

  // Emit a signal (the nerve fires)
  function emit(name, data) {
    var sig = { name: name, data: data, ts: Date.now() };
    signalLog.push(sig);
    if (signalLog.length > 200) signalLog.shift();

    var cbs = listeners[name];
    if (!cbs) return 0;
    var count = 0;
    for (var i = 0; i < cbs.length; i++) {
      try { cbs[i](data, sig); count++; } catch(e) {
        console.warn('[signal] error in listener for', name, e);
      }
    }
    return count;
  }

  // Listen for a signal (the dendrite receives)
  function on(name, cb) {
    if (!listeners[name]) listeners[name] = [];
    listeners[name].push(cb);
    return function off() {
      var idx = listeners[name].indexOf(cb);
      if (idx >= 0) listeners[name].splice(idx, 1);
    };
  }

  // One-time listener
  function once(name, cb) {
    var unsub = on(name, function(data, sig) {
      unsub();
      cb(data, sig);
    });
    return unsub;
  }

  // Reach — send signal outward (to other modules, to the world)
  function reach(target, data) {
    return emit('reach:' + target, data);
  }

  // Return — signal comes back (echo, acknowledgment)
  function returnSignal(source, data) {
    return emit('return:' + source, data);
  }

  // Relay — pass signal through without modification
  function relay(from, to, data) {
    emit('relay:' + from + '→' + to, data);
    return emit(to, data);
  }

  // Button press — human interaction signal
  function button(id, data) {
    return emit('button:' + id, data || { pressed: true });
  }

  // Beacon — persistent signal (for campfire)
  function beacon(name, data) {
    var b = { name: name, data: data, ts: Date.now(), active: true };
    beacons.push(b);
    emit('beacon:' + name, data);
    return function extinguish() {
      b.active = false;
      emit('beacon:extinguish:' + name, data);
    };
  }

  // Get active beacons
  function activeBeacons() {
    return beacons.filter(function(b) { return b.active; });
  }

  // Recent signals
  function recent(n) { return signalLog.slice(-(n || 20)); }

  window.GAIA_SIGNAL = {
    emit: emit,
    on: on,
    once: once,
    reach: reach,
    return: returnSignal,
    relay: relay,
    button: button,
    beacon: beacon,
    activeBeacons: activeBeacons,
    recent: recent,
    listeners: listeners
  };

})(window.G || (window.G = {}));
