// ═══════════════════════════════════════════════════════════
// RENDER REGISTRY — Collapsed from render(36) + tick(12) +
//   resize(12) + draw(10) + animate(9)
// Neural API collapse: 79 duplicate render functions → ONE loop
//
// This IS the globe.js dissolution plan executed:
//   window.GAIA_RENDERERS registry
//   window.registerRenderer(name, fn)
//   ONE requestAnimationFrame loop drives ALL renderers
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var renderers = {};  // name → { render, tick, resize, priority }
  var renderOrder = [];
  var running = false;
  var frameCount = 0;
  var lastTime = 0;
  var dt = 0;

  // Register a renderer
  function registerRenderer(name, hooks) {
    renderers[name] = {
      render: hooks.render || null,
      tick: hooks.tick || null,
      resize: hooks.resize || null,
      priority: hooks.priority || 100,
      active: true
    };
    renderOrder.push(name);
    renderOrder.sort(function(a, b) {
      return (renderers[a].priority || 100) - (renderers[b].priority || 100);
    });
  }

  // The ONE render loop
  function frame(time) {
    if (!running) return;
    dt = time - lastTime;
    lastTime = time;
    frameCount++;

    for (var i = 0; i < renderOrder.length; i++) {
      var name = renderOrder[i];
      var r = renderers[name];
      if (!r || !r.active) continue;

      // tick at reduced rate (every 2 frames)
      if (r.tick && frameCount % 2 === 0) {
        try { r.tick(dt, frameCount); } catch(e) { console.warn('[render] tick error:', name, e); }
      }

      // render every frame
      if (r.render) {
        try { r.render(dt, frameCount, time); } catch(e) { console.warn('[render] error:', name, e); }
      }
    }

    requestAnimationFrame(frame);
  }

  // Start the loop
  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }

  // Stop the loop
  function stop() { running = false; }

  // Handle resize for all
  function onResize() {
    for (var i = 0; i < renderOrder.length; i++) {
      var r = renderers[renderOrder[i]];
      if (r && r.resize && r.active) {
        try { r.resize(); } catch(e) {}
      }
    }
  }
  window.addEventListener('resize', onResize);

  // Enable/disable a renderer
  function enable(name) { if (renderers[name]) renderers[name].active = true; }
  function disable(name) { if (renderers[name]) renderers[name].active = false; }

  // Stats
  function stats() {
    return {
      renderers: renderOrder.length,
      active: renderOrder.filter(function(n) { return renderers[n].active; }).length,
      fps: dt > 0 ? Math.round(1000 / dt) : 0,
      frames: frameCount
    };
  }

  // Expose — this IS window.GAIA_RENDERERS from globe.js dissolution plan
  window.GAIA_RENDERERS = renderers;
  window.registerRenderer = registerRenderer;
  window.GAIA_RENDER_LOOP = {
    register: registerRenderer,
    start: start,
    stop: stop,
    enable: enable,
    disable: disable,
    stats: stats,
    renderers: renderers
  };

})(window.G || (window.G = {}));
