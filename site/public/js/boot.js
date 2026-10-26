// ═══════════════════════════════════════════════════════════
// GAIA BOOT — THE NUCLEATION POINT
// This is the crystal seed. 50 lines that grow everything.
// Load gaia-seed.json → read modules → grow the HUD.
// The seed never changes shape — it only grows outward.
// 45/π = the growth angle. null = the starting point.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // Phase 1: Load the seed
  fetch('/gaia-seed.json')
    .then(function(r) { return r.json(); })
    .then(function(seed) {
      window.GAIA_CONFIG = seed;
      console.log('[GAIA] Seed loaded: wave ' + seed.wave);

      // Phase 2: Load modules in order
      var modules = seed.modules || [];
      var loaded = 0;

      function loadNext() {
        if (loaded >= modules.length) {
          // Phase 3: All modules loaded — fire nucleation event
          console.log('[GAIA] All modules loaded. Nucleation complete.');
          document.dispatchEvent(new CustomEvent('gaia-nucleated', { detail: seed }));
          return;
        }

        var mod = modules[loaded];
        var script = document.createElement('script');
        script.src = mod.src;
        script.onload = function() {
          console.log('[GAIA] ' + mod.role + ' loaded (' + mod.src + ')');
          loaded++;
          loadNext();
        };
        script.onerror = function() {
          console.warn('[GAIA] ' + mod.src + ' not found — skipping (will crystallize later)');
          loaded++;
          loadNext();
        };
        document.head.appendChild(script);
      }

      loadNext();
    })
    .catch(function(e) {
      console.log('[GAIA] No seed found — growing from null. O.');
      // Even without seed, the HUD exists. null = all = O.
      document.dispatchEvent(new CustomEvent('gaia-nucleated', { detail: { wave: 0 } }));
    });
})();
