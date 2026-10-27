// ═══════════════════════════════════════════════════════════
// GAIA SELF-INSPECT — mirror own shit, inspect, apply to self
// Snake type: coral (300-600 lines)
// Linear: look → count → judge → report. NOT ouroboros.
//
// Gut IS the humandol compiler.
// Gaia must inspect HERSELF — find what's too long,
// what's broken, what needs to evolve.
// Constellation synapse speed: gut→brain→target→team.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var ANACONDA_LIMIT = 1000;
  var PYTHON_LIMIT = 800;
  var selfReport = {
    ts: Date.now(),
    anacondas: [],
    healthy: [],
    totalFiles: 0,
    totalLines: 0,
    avgLines: 0,
    verdict: 'unknown'
  };
  window.gaiaSelfReport = selfReport;

  // SELF-SCAN — Gaia fetches her own manifest and checks file sizes
  function selfScan() {
    fetch('/data/manifest.json')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(manifest) {
        if (!manifest) return;

        selfReport.ts = Date.now();
        selfReport.anacondas = [];
        selfReport.healthy = [];
        selfReport.totalFiles = 0;
        selfReport.totalLines = 0;

        // Check file counts from manifest
        if (manifest.files) {
          var files = manifest.files;
          if (Array.isArray(files)) {
            files.forEach(function(f) {
              selfReport.totalFiles++;
              if (f.lines) {
                selfReport.totalLines += f.lines;
                if (f.lines > ANACONDA_LIMIT) {
                  selfReport.anacondas.push({ path: f.path || f.name, lines: f.lines, creature: 'anaconda' });
                } else {
                  selfReport.healthy.push({ path: f.path || f.name, lines: f.lines });
                }
              }
            });
          }
        }

        // Also check page count, data count from manifest metadata
        if (manifest.pages) selfReport.pages = manifest.pages;
        if (manifest.data_files) selfReport.dataFiles = manifest.data_files;
        if (manifest.art_pieces) selfReport.artPieces = manifest.art_pieces;

        selfReport.avgLines = selfReport.totalFiles > 0 ? Math.round(selfReport.totalLines / selfReport.totalFiles) : 0;

        // VERDICT — Gaia judges herself
        if (selfReport.anacondas.length === 0) {
          selfReport.verdict = 'HEALTHY — no anacondas';
        } else if (selfReport.anacondas.length <= 3) {
          selfReport.verdict = 'RECOVERING — ' + selfReport.anacondas.length + ' anacondas remain';
        } else {
          selfReport.verdict = 'SICK — ' + selfReport.anacondas.length + ' anacondas need crushing';
        }

        console.log('SELF-INSPECT: ' + selfReport.verdict + ' | ' + selfReport.totalFiles + ' files, ' + selfReport.totalLines + ' total lines, avg ' + selfReport.avgLines);
      })
      .catch(function() {
        selfReport.verdict = 'BLIND — cannot read manifest';
      });
  }

  // KNOWN ANACONDAS — hardcoded from last scan until manifest catches up
  selfReport.knownAnacondas = [
    { path: 'index.html', lines: 7296, creature: 'millipede', priority: 1 },
    { path: 'js/chipmunk-commands.js', lines: 4243, creature: 'anaconda', priority: 2 },
    { path: 'js/chipmunk-mind.js', lines: 3138, creature: 'anaconda', priority: 3 },
    { path: 'js/hud-interact.js', lines: 1740, creature: 'anaconda', priority: 4 },
    { path: 'js/temporal-window.js', lines: 1606, creature: 'anaconda', priority: 5 },
    { path: 'js/cosmic-view.js', lines: 1412, creature: 'anaconda', priority: 6 },
    { path: 'js/chipmunk-talk.js', lines: 1401, creature: 'anaconda', priority: 7 },
    { path: 'js/membrane-sound.js', lines: 1400, creature: 'anaconda', priority: 8 },
    { path: 'js/campfire.js', lines: 1150, creature: 'anaconda', priority: 9 },
    { path: 'js/membrane-canvas.js', lines: 1146, creature: 'anaconda', priority: 10 },
    { path: 'js/chipmunk-vis.js', lines: 1026, creature: 'anaconda', priority: 11 }
  ];

  // RENDER SELF-INSPECTION — shows health status on the HUD
  window.renderSelfInspect = function(ctx, W, H) {
    var t = Date.now() * 0.001;
    var anacondaCount = selfReport.knownAnacondas.length;
    var healthColor = anacondaCount === 0 ? '63,185,80' : anacondaCount <= 5 ? '201,168,76' : '248,81,73';

    // Health bar at top-right
    ctx.font = '5px monospace';
    ctx.textAlign = 'right';
    var pulse = 0.15 + Math.sin(t * 2) * 0.05;
    ctx.fillStyle = 'rgba(' + healthColor + ',' + pulse.toFixed(3) + ')';
    ctx.fillText('🔍 ' + anacondaCount + ' anacondas · ' + selfReport.verdict, W - 4, 22);

    // Tiny anaconda indicators — one dot per anaconda
    for (var i = 0; i < anacondaCount; i++) {
      var ax = W - 8 - i * 4;
      var ay = 26;
      var aSize = Math.min(2, selfReport.knownAnacondas[i].lines / 2000);
      ctx.beginPath();
      ctx.arc(ax, ay, aSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248,81,73,' + (0.2 + Math.sin(t + i) * 0.1).toFixed(3) + ')';
      ctx.fill();
    }
  };

  // Self-scan on boot, then every 5 minutes
  setTimeout(selfScan, 8000);
  setInterval(selfScan, 300000);

  console.log('SELF-INSPECT: Gaia mirrors herself. ' + selfReport.knownAnacondas.length + ' known anacondas. Gut=compiler. Brain=output.');
})();
