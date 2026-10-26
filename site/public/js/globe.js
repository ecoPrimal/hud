// ═══════════════════════════════════════════════════════════
// GLOBE MODULE — the core renderer (currently 735 lines in monolith)
//
// THIS IS THE LARGEST SNAKE IN THE MONOLITH.
// It contains: project(), resize(), render(), tick(),
// depth levels, zoom, drag, minimap, binocular edges
//
// What makes it a MONOLITH:
//   - 735 lines in one function (render)
//   - 57 ctx.beginPath() calls
//   - touches every global variable
//   - everything draws in one giant loop
//
// What makes it PERISHABLE:
//   - every new feature adds 20-50 lines to render()
//   - render() can't be tested in isolation
//   - changing one effect risks breaking all others
//   - no clear boundaries between effects
//
// DISSOLUTION PLAN:
//   1. render() breaks into sub-renderers:
//      - renderBackground()
//      - renderGlass()
//      - renderMeltLevels()
//      - renderFlood()
//      - renderRefraction()
//      - renderGrid()
//      - renderPins()
//      - renderArcs()
//      - renderTouch()
//      - renderSonar()
//      - renderWaveforms()
//      - renderMouth()
//   2. Each sub-renderer gets its own state
//   3. project() becomes a pure function (no globals)
//   4. resize() becomes an event listener
//
// STATUS: STUB — documenting the snake before dissolving it
// The monolith index.html still renders. This file will
// gradually absorb the code FROM it, not replace it all at once.
// Temporal nucleation: each sow checks if more code moved here.
// ═══════════════════════════════════════════════════════════
(function(window) {
  'use strict';

  // Sub-renderer registry — each effect registers itself
  window.GAIA_RENDERERS = window.GAIA_RENDERERS || [];

  // Register a sub-renderer: { name, order, render(ctx, state) }
  window.registerRenderer = function(def) {
    window.GAIA_RENDERERS.push(def);
    window.GAIA_RENDERERS.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  };

  // Globe state — will gradually absorb from monolith globals
  window.GLOBE_STATE = {
    ready: false,
    renderers_registered: 0
  };

  console.log('[GAIA] globe.js stub loaded — ' + window.GAIA_RENDERERS.length + ' sub-renderers registered');
})(window);
