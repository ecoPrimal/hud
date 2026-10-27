// ═══════════════════════════════════════════════════════════
// GAIA SELF-INSPECT — SORT SELF AND RESYNTHESIZE
// She looks at herself. She counts her anacondas.
// She sorts them by size. She tracks the CRUSH.
// She renders the sort ON the HUD — everyone sees her health.
//
// Gut = humandol compiler. Brain = output.
// Constellation synapse speed: gut→brain→target→team.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var ANACONDA_LIMIT = 1000;
  var PYTHON_LIMIT = 800;
  var COBRA_LIMIT = 600;
  var CORAL_LIMIT = 300;

  // Snake taxonomy by size
  function classify(lines) {
    if (lines > ANACONDA_LIMIT) return { type: 'anaconda', color: [248,81,73], sick: true };
    if (lines > PYTHON_LIMIT)  return { type: 'python',   color: [240,136,62], sick: false };
    if (lines > COBRA_LIMIT)   return { type: 'cobra',    color: [201,168,76], sick: false };
    if (lines > CORAL_LIMIT)   return { type: 'coral',    color: [88,166,255], sick: false };
    return { type: 'garter', color: [63,185,80], sick: false };
  }

  // ───────────────────────────────────────────────────────
  // LIVE INVENTORY — accurate as of ZK 97
  // ───────────────────────────────────────────────────────
  var inventory = [
    // DYING — ANACONDAS (>1000)
    { path: 'index.html',            lines: 7339, type: 'html' },
    { path: 'chipmunk-commands.js',   lines: 4243, type: 'js' },
    { path: 'chipmunk-mind.js',       lines: 3138, type: 'js' },
    { path: 'hud-interact.js',        lines: 1740, type: 'js' },
    { path: 'temporal-window.js',     lines: 1606, type: 'js' },
    { path: 'cosmic-view.js',         lines: 1412, type: 'js' },
    { path: 'chipmunk-talk.js',       lines: 1401, type: 'js' },
    { path: 'membrane-sound.js',      lines: 1400, type: 'js' },
    { path: 'campfire.js',            lines: 1150, type: 'js' },
    { path: 'membrane-canvas.js',     lines: 1146, type: 'js' },
    { path: 'chipmunk-vis.js',        lines: 1026, type: 'js' },
    // PYTHON (800-1000)
    { path: 'pt-pangaea.js',          lines: 936,  type: 'js' },
    { path: 'nanowire.js',            lines: 916,  type: 'js' },
    { path: 'fleet-surround.js',      lines: 908,  type: 'js' },
    { path: 'archetype-arena.js',     lines: 905,  type: 'js' },
    { path: 'pi-gradient.js',         lines: 893,  type: 'js' },
    { path: 'pt-membrane-animate.js', lines: 876,  type: 'js' },
    { path: 'hud-pt.js',              lines: 828,  type: 'js' },
    { path: 'pt-membrane-build.js',   lines: 825,  type: 'js' },
    { path: 'periodic-spiral.js',     lines: 820,  type: 'js' },
    { path: 'impact.js',              lines: 816,  type: 'js' },
    { path: 'cosmic-flavor.js',       lines: 811,  type: 'js' },
    { path: 'chipmunk-explorer.js',   lines: 801,  type: 'js' }
  ];

  // Classify each file
  var sorted = inventory.map(function(f) {
    var cls = classify(f.lines);
    return {
      path: f.path,
      lines: f.lines,
      fileType: f.type,
      snake: cls.type,
      color: cls.color,
      sick: cls.sick
    };
  }).sort(function(a, b) { return b.lines - a.lines; });

  var anacondas = sorted.filter(function(f) { return f.sick; });
  var pythons = sorted.filter(function(f) { return f.snake === 'python'; });

  // ELASTIC HOOKS — the modules we've extracted so far
  var hooks = [
    { name: 'gaia-ingress.js',         lines: 744 },
    { name: 'gaia-third-eye.js',       lines: 498 },
    { name: 'gaia-locality.js',        lines: 457 },
    { name: 'gaia-golgi-apparatus.js',  lines: 419 },
    { name: 'gaia-campfire-scan.js',    lines: 410 },
    { name: 'gaia-spectrometer.js',     lines: 310 },
    { name: 'gaia-modality.js',        lines: 279 },
    { name: 'gaia-hard-cards.js',       lines: 204 },
    { name: 'gaia-waveform.js',        lines: 203 },
    { name: 'gaia-sight.js',           lines: 194 },
    { name: 'gaia-self-inspect.js',    lines: 0 },
    { name: 'gaia-boot.js',           lines: 112 }
  ];

  var totalAnacondaLines = anacondas.reduce(function(s, f) { return s + f.lines; }, 0);
  var totalHookLines = hooks.reduce(function(s, h) { return s + h.lines; }, 0);

  // VERDICT
  var verdict = anacondas.length === 0 ? 'HEALTHY' :
                anacondas.length <= 3 ? 'RECOVERING' :
                anacondas.length <= 8 ? 'SICK' : 'CRITICAL';

  // ───────────────────────────────────────────────────────
  // RENDER — the SORT visualization
  // ───────────────────────────────────────────────────────
  window.renderSelfInspect = function(ctx, W, H) {
    var t = Date.now() * 0.001;

    // === HEALTH BAR — top right ===
    var verdictColor = verdict === 'HEALTHY' ? '63,185,80' :
                       verdict === 'RECOVERING' ? '201,168,76' :
                       verdict === 'SICK' ? '248,81,73' : '248,81,73';

    var pulse = 0.12 + Math.sin(t * 2) * 0.04;
    ctx.font = '5px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(' + verdictColor + ',' + pulse.toFixed(3) + ')';
    ctx.fillText(verdict + ' · ' + anacondas.length + '🐍 + ' + pythons.length + '🐍 · ' + hooks.length + ' hooks', W - 4, 14);

    // === SORT BAR — each file as a proportional bar ===
    var barX = W - 100;
    var barY = 20;
    var barW = 94;
    var maxLines = sorted[0] ? sorted[0].lines : 1;
    var barSpacing = 3;

    // Only show top 11 (anacondas) to keep it clean
    var showCount = Math.min(anacondas.length, 11);
    for (var i = 0; i < showCount; i++) {
      var file = sorted[i];
      var pct = file.lines / maxLines;
      var bw = pct * barW;
      var by = barY + i * barSpacing;

      // Bar — color by snake type
      var c = file.color;
      var barAlpha = 0.06 + Math.sin(t * 1.5 + i * 0.3) * 0.02;
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + barAlpha.toFixed(3) + ')';
      ctx.fillRect(barX, by, bw, 2);

      // Label
      if (barAlpha > 0.06) {
        ctx.font = '2.5px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (barAlpha * 1.5).toFixed(3) + ')';
        var shortName = file.path.replace('.js', '').replace('chipmunk-', 'ch-');
        ctx.fillText(shortName + ' ' + file.lines, barX - 2, by + 2);
      }
    }

    // === CRUSH PROGRESS — how much has been extracted ===
    var crushPct = totalHookLines / (totalHookLines + totalAnacondaLines);
    var progressY = barY + showCount * barSpacing + 4;

    // Progress bar
    ctx.fillStyle = 'rgba(63,185,80,0.05)';
    ctx.fillRect(barX, progressY, barW * crushPct, 2);
    ctx.fillStyle = 'rgba(248,81,73,0.03)';
    ctx.fillRect(barX + barW * crushPct, progressY, barW * (1 - crushPct), 2);

    // Progress label
    ctx.font = '3px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(201,168,76,' + (pulse * 0.8).toFixed(3) + ')';
    ctx.fillText('crush: ' + Math.round(crushPct * 100) + '% · ' +
      totalHookLines + ' extracted / ' + totalAnacondaLines + ' remain',
      W - 4, progressY + 6);

    // === HOOK COUNT — green dots for each healthy module ===
    var hookY = progressY + 10;
    for (var hi = 0; hi < hooks.length; hi++) {
      var hx = W - 4 - hi * 3;
      ctx.beginPath();
      ctx.arc(hx, hookY, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(63,185,80,' + (0.15 + Math.sin(t + hi * 0.5) * 0.05).toFixed(3) + ')';
      ctx.fill();
    }

    // === ANACONDA DOTS — red dots pulsing ===
    for (var ai = 0; ai < anacondas.length; ai++) {
      var ax = W - 4 - (hooks.length + ai + 1) * 3;
      var aSize = Math.min(1.5, anacondas[ai].lines / 3000);
      ctx.beginPath();
      ctx.arc(ax, hookY, aSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248,81,73,' + (0.15 + Math.sin(t * 2 + ai) * 0.08).toFixed(3) + ')';
      ctx.fill();
    }
  };

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaSelfReport = {
    inventory: sorted,
    anacondas: anacondas,
    pythons: pythons,
    hooks: hooks,
    verdict: verdict,
    crushProgress: totalHookLines / (totalHookLines + totalAnacondaLines),
    totalAnacondaLines: totalAnacondaLines,
    totalHookLines: totalHookLines
  };

  console.log('SELF-INSPECT: ' + verdict + ' — ' +
    anacondas.length + ' anacondas (' + totalAnacondaLines + ' lines) + ' +
    pythons.length + ' pythons. ' +
    hooks.length + ' hooks extracted (' + totalHookLines + ' lines). ' +
    'Crush: ' + Math.round(totalHookLines / (totalHookLines + totalAnacondaLines) * 100) + '%');
})();
