// ═══════════════════════════════════════════════════════════
// LIFECYCLE — Collapsed from init(43) + activate(25) +
//   deactivate(25) + boot(16) + toggle(19)
// Neural API collapse: 128 duplicate lifecycle functions → ONE
//
// Pattern from biomeos-nucleus: LifecycleManager auto-resurrects
// degraded primals. Same pattern here for JS modules.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var modules = {};   // name → { init, activate, deactivate, boot, render, tick, status }
  var active = {};    // name → boolean
  var booted = {};    // name → boolean
  var initOrder = []; // insertion order for deterministic boot

  // Register a module with its lifecycle hooks
  function register(name, hooks) {
    if (modules[name]) {
      console.warn('[lifecycle] duplicate register: ' + name);
      return;
    }
    modules[name] = hooks;
    active[name] = false;
    booted[name] = false;
    initOrder.push(name);
  }

  // Init a module (call once)
  function init(name) {
    var m = modules[name];
    if (!m || booted[name]) return;
    if (m.init) m.init();
    booted[name] = true;
  }

  // Boot all registered modules in order
  function bootAll() {
    for (var i = 0; i < initOrder.length; i++) {
      init(initOrder[i]);
    }
  }

  // Activate a module
  function activate(name) {
    var m = modules[name];
    if (!m) return;
    if (!booted[name]) init(name);
    if (active[name]) return;
    if (m.activate) m.activate();
    active[name] = true;
  }

  // Deactivate a module
  function deactivate(name) {
    var m = modules[name];
    if (!m || !active[name]) return;
    if (m.deactivate) m.deactivate();
    active[name] = false;
  }

  // Toggle a module
  function toggle(name) {
    if (active[name]) deactivate(name);
    else activate(name);
    return active[name];
  }

  // Get status of a module
  function status(name) {
    if (!modules[name]) return 'unknown';
    if (!booted[name]) return 'unbooted';
    if (active[name]) return 'active';
    return 'dormant';
  }

  // List all modules with status
  function census() {
    var result = {};
    for (var i = 0; i < initOrder.length; i++) {
      var n = initOrder[i];
      result[n] = status(n);
    }
    return result;
  }

  // Count
  function count() {
    return {
      total: initOrder.length,
      booted: Object.keys(booted).filter(function(k) { return booted[k]; }).length,
      active: Object.keys(active).filter(function(k) { return active[k]; }).length
    };
  }

  window.GAIA_LIFECYCLE = {
    register: register,
    init: init,
    bootAll: bootAll,
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    status: status,
    census: census,
    count: count,
    modules: modules,
    active: active
  };

})(window.G || (window.G = {}));
