// ═══════════════════════════════════════════════════════════
// COLLAPSE BRIDGE — Auto-registers existing modules with
// GAIA_LIFECYCLE and GAIA_RENDER_LOOP at runtime.
//
// 25 modules share identical activate/deactivate/toggle.
// 37 modules define init(). 35 define render(). 
// This bridge discovers them and wires them in.
// The Neural API pattern: discover at runtime, not hardcode.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var LC = window.GAIA_LIFECYCLE;
  var RL = window.GAIA_RENDER_LOOP;
  var SG = window.GAIA_SIGNAL;
  if (!LC) return;

  // Known window._ exports from old-eon modules
  var MODULES = [
    '_bubblePop', '_complexityScale', '_deepzoom', '_focalTunnel',
    '_membraneSight', '_membraneSound', '_membraneCanvas', '_meshRing',
    '_mobiusCircuit', '_periodicSpiral', '_piGradient', '_scatterFriends',
    '_signalReach', '_signalReturn', '_sortPlayground', '_stepBack',
    '_symbolOverlay', '_temporalWindow', '_thirdEye', '_totalityTunnel',
    '_trailMark', '_tueborZones', '_whistleBack', '_fleetSurround',
    '_humanSurround', '_campfire', '_primals', '_edgeTriad',
    '_proprioception', '_youAreHere', '_desktopGlobe'
  ];

  function bridge() {
    var bridged = 0;
    for (var i = 0; i < MODULES.length; i++) {
      var key = MODULES[i];
      var mod = window[key];
      if (!mod) continue;

      var name = key.replace(/^_/, '').replace(/([A-Z])/g, '-$1').toLowerCase();

      LC.register(name, {
        init: mod.init || null,
        activate: mod.activate || null,
        deactivate: mod.deactivate || null
      });

      if (mod.render || mod.tick || mod.draw) {
        RL.register(name, {
          render: mod.render || mod.draw || null,
          tick: mod.tick || null,
          resize: mod.resize || null,
          priority: 50
        });
      }
      bridged++;
    }

    if (SG) SG.emit('bridge:complete', { bridged: bridged });
    return bridged;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bridge);
  } else {
    setTimeout(bridge, 50);
  }

  window.GAIA_BRIDGE = { bridge: bridge, modules: MODULES };
})();
