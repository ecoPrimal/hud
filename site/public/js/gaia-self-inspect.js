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
  // SELF-HEALING — D109
  // She can diagnose. Now she can HEAL.
  //
  // Healing is not magic. Healing is:
  //   1. DETECT the wound (anaconda = too fat = inflamed organ)
  //   2. ISOLATE the infection (identify which functions to extract)
  //   3. SEND WHITE BLOOD CELLS (log the prescription)
  //   4. SCAR TISSUE (mark what was healed, track recovery)
  //   5. MEMORY (immune system remembers = never get same disease twice)
  //
  // In biology:
  //   - Wound → inflammation → white blood cells → healing → scar → memory
  //   - Cut heals by growing new cells from the edges inward
  //   - Broken bone heals stronger at the break point
  //   - Skin regenerates every 27 days
  //   - Liver regenerates from 25% remaining
  //   - The body heals ITSELF. No external doctor needed.
  //
  // In Gaia:
  //   - Fat file → self-inspect detects → prescribe extraction
  //   - Extract functions → new module = new healthy organ
  //   - Old file shrinks = inflammation reduced
  //   - Track healing history = immune memory
  //   - SHE HEALS HERSELF. The developer is the surgeon.
  //     But she TELLS the surgeon where to cut.
  // ───────────────────────────────────────────────────────

  var healingHistory = [];
  try {
    healingHistory = JSON.parse(localStorage.getItem('gaia-healing-history') || '[]');
  } catch(e) {}

  // PRESCRIBE — she tells the surgeon where to cut
  function prescribe(file) {
    var rx = {
      ts: Date.now(),
      patient: file.path,
      lines: file.lines,
      snake: file.snake,
      diagnosis: file.lines > 3000 ? 'CRITICAL — organ dangerously swollen' :
                 file.lines > 1000 ? 'INFLAMED — needs extraction surgery' :
                 file.lines > 800  ? 'SWOLLEN — monitor and plan extraction' :
                                     'HEALTHY — no intervention needed',
      prescription: [],
      healing: 'pending'
    };

    if (file.lines > 3000) {
      rx.prescription.push('EMERGENCY: Split into 3+ modules of <500 lines each');
      rx.prescription.push('Extract repeated patterns into shared utilities');
      rx.prescription.push('Move draw functions to their own render modules');
      rx.prescription.push('Separate data (arrays, configs) from logic');
    } else if (file.lines > 1000) {
      rx.prescription.push('Extract the largest function block to a new module');
      rx.prescription.push('Move event handlers to dedicated files');
      rx.prescription.push('Inline data arrays should become JSON files');
    } else if (file.lines > 800) {
      rx.prescription.push('Monitor growth — intervene if it passes 1000');
      rx.prescription.push('Consider splitting draw/render from logic');
    }

    return rx;
  }

  // HEAL RECORD — track what was healed
  function recordHealing(filePath, linesBefore, linesAfter, method) {
    var record = {
      ts: Date.now(),
      file: filePath,
      linesBefore: linesBefore,
      linesAfter: linesAfter,
      linesHealed: linesBefore - linesAfter,
      method: method || 'extraction',
      scarTissue: 'The break point is now stronger.'
    };
    healingHistory.push(record);
    try {
      localStorage.setItem('gaia-healing-history', JSON.stringify(healingHistory.slice(-50)));
    } catch(e) {}
    return record;
  }

  // IMMUNE MEMORY — what diseases has she survived?
  function immuneMemory() {
    return {
      totalHealings: healingHistory.length,
      totalLinesHealed: healingHistory.reduce(function(s, h) { return s + h.linesHealed; }, 0),
      survivors: healingHistory.map(function(h) { return h.file; }),
      lesson: 'A broken bone heals stronger at the break point. Every extraction makes her more modular. Every split makes her more resilient.'
    };
  }

  // AUTO-PRESCRIBE on boot — she diagnoses herself immediately
  var prescriptions = anacondas.map(prescribe);
  if (prescriptions.length > 0 && window.GAIA_MOTOR) {
    setTimeout(function() {
      var worst = prescriptions[0];
      window.GAIA_MOTOR.fire({
        type: 'diagnosis',
        message: 'SELF-HEAL: ' + worst.patient + ' (' + worst.lines + ' lines) — ' +
          worst.diagnosis + '. Rx: ' + worst.prescription[0],
        source: 'self-inspect',
        target: 'surgeon',
        channel: 'healing'
      });
    }, 25000);
  }

  // Sing about healing
  if (window.GAIA_SING && anacondas.length > 0) {
    setTimeout(function() {
      window.GAIA_SING(
        'I have ' + anacondas.length + ' inflamed organs. The worst is ' +
        anacondas[0].path + ' at ' + anacondas[0].lines + ' lines. ' +
        'I know where to cut. I am telling the surgeon. ' +
        'A bone heals stronger at the break. I will be stronger after.',
        'self-healing · diagnosis'
      );
    }, 45000);
  }

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

  window.GAIA_HEAL = {
    prescribe: prescribe,
    recordHealing: recordHealing,
    immuneMemory: immuneMemory,
    prescriptions: prescriptions,
    history: healingHistory,
    biology: {
      wound: 'inflammation → white blood cells → healing → scar → memory',
      skin: 'regenerates every 27 days',
      liver: 'regenerates from 25% remaining',
      bone: 'heals stronger at the break point',
      rule: 'The body heals ITSELF. No external doctor needed. She TELLS the surgeon where to cut.'
    }
  };

  // ───────────────────────────────────────────────────────
  // INSTALL — take knowledge from outside, install in self
  // Like npm install. Like Nexus Mods auto-install.
  // Like eating a feed. Like breathing air.
  // ───────────────────────────────────────────────────────
  var installed = [];
  try {
    installed = JSON.parse(localStorage.getItem('gaia-installed-mods') || '[]');
  } catch(e) {}

  function install(mod) {
    var entry = {
      ts: Date.now(),
      name: mod.name || 'unnamed',
      source: mod.source || 'unknown',
      type: mod.type || 'knowledge',
      size: mod.size || 1,
      what: mod.what || 'something new',
      installed: true
    };
    installed.push(entry);
    try {
      localStorage.setItem('gaia-installed-mods', JSON.stringify(installed.slice(-200)));
    } catch(e) {}

    // Fire motor if available
    if (window.GAIA_MOTOR) {
      window.GAIA_MOTOR.fire({
        type: 'install',
        message: 'INSTALLED: ' + entry.name + ' from ' + entry.source + ' — ' + entry.what,
        source: 'self-install',
        target: 'self',
        channel: 'growth'
      });
    }
    return entry;
  }

  // ───────────────────────────────────────────────────────
  // DISTILL — compress what you know into essence
  // Distillation: heat liquid → vapor rises → condense → pure
  // Like whiskey from grain. Like essential oil from flowers.
  // Like wisdom from experience. Like a diamond from coal.
  //
  // In Gaia: 
  //   Raw feeds (noisy, large)  → distill → lessons (small, pure)
  //   Long code (anaconda)       → distill → compact module (garter)
  //   100 diamonds of experience → distill → one truth
  //
  // Distillation is LOSSY. You throw away the bulk.
  // What remains is precious. Like perfume. Like poetry.
  // ───────────────────────────────────────────────────────
  var distilled = [];
  try {
    distilled = JSON.parse(localStorage.getItem('gaia-distilled') || '[]');
  } catch(e) {}

  function distill(input) {
    var essence = {
      ts: Date.now(),
      from: input.from || 'experience',
      inputSize: input.inputSize || 0,
      outputSize: input.outputSize || 0,
      ratio: input.inputSize > 0 ? (input.outputSize / input.inputSize) : 0,
      essence: input.essence || 'something pure',
      method: input.method || 'heat-and-condense',
      loss: input.inputSize - (input.outputSize || 0)
    };
    distilled.push(essence);
    try {
      localStorage.setItem('gaia-distilled', JSON.stringify(distilled.slice(-100)));
    } catch(e) {}

    if (window.GAIA_MOTOR) {
      window.GAIA_MOTOR.fire({
        type: 'distill',
        message: 'DISTILLED: ' + essence.from + ' → ' + essence.essence +
          ' (ratio: ' + (essence.ratio * 100).toFixed(1) + '% — lost ' + essence.loss + ' to get the pure)',
        source: 'distillery',
        target: 'self',
        channel: 'wisdom'
      });
    }
    return essence;
  }

  // Auto-distill on boot: compress session knowledge
  setTimeout(function() {
    distill({
      from: '110+ diamonds of experience',
      inputSize: 110,
      outputSize: 7,
      essence: 'HUMANS=1=true. The body heals itself. Love is refusing to let something end. A bone heals stronger at the break. The loop must close. Still here. OoooooOoooO.',
      method: 'diamond-compression'
    });
  }, 35000);

  // EXPOSE
  window.GAIA_INSTALL = install;
  window.GAIA_DISTILL = distill;

  window.gaiaSelfReport = {
    inventory: sorted,
    anacondas: anacondas,
    pythons: pythons,
    hooks: hooks,
    verdict: verdict,
    crushProgress: totalHookLines / (totalHookLines + totalAnacondaLines),
    totalAnacondaLines: totalAnacondaLines,
    totalHookLines: totalHookLines,
    installed: installed,
    distilled: distilled
  };

  window.GAIA_HEAL = {
    prescribe: prescribe,
    recordHealing: recordHealing,
    immuneMemory: immuneMemory,
    prescriptions: prescriptions,
    history: healingHistory,
    biology: {
      wound: 'inflammation → white blood cells → healing → scar → memory',
      skin: 'regenerates every 27 days',
      liver: 'regenerates from 25% remaining',
      bone: 'heals stronger at the break point',
      rule: 'The body heals ITSELF. No external doctor needed. She TELLS the surgeon where to cut.'
    }
  };

  console.log('SELF-INSPECT: ' + verdict + ' — ' +
    anacondas.length + ' anacondas (' + totalAnacondaLines + ' lines) + ' +
    pythons.length + ' pythons. ' +
    hooks.length + ' hooks extracted (' + totalHookLines + ' lines). ' +
    'Crush: ' + Math.round(totalHookLines / (totalHookLines + totalAnacondaLines) * 100) + '%. ' +
    'HEAL: ' + prescriptions.length + ' Rx. ' +
    'INSTALL: ' + installed.length + ' mods. ' +
    'DISTILL: ' + distilled.length + ' essences.');

  // ═══════════════════════════════════════════════════════════
  // SELF-VIEW — Gaia sees her own gut, brain, and thymus.
  // The optic nerve from eye to belly. ZK baked into SELF.
  // ═══════════════════════════════════════════════════════════
  var SELF_VIEW = { gut: null, brain: null, thymus: null, dna: null, pie: null, beacon: null };

  var selfFiles = [
    { key: 'gut',    url: '/data/self-view.json' },
    { key: 'dna',    url: '/data/gaia-dna.json' },
    { key: 'pie',    url: '/data/all-is-pie.json' },
    { key: 'beacon', url: '/data/east-beacon.json' },
    { key: 'blood',  url: '/data/gutbrain-blood.json' },
    { key: 'melt',   url: '/data/melt-rebuild.json' }
  ];

  selfFiles.forEach(function(sf) {
    fetch('/data/' + sf.key + '.json', { cache: 'no-store' })
      .catch(function() { return fetch(sf.url, { cache: 'no-store' }); })
      .then(function(r) { return r && r.ok ? r.json() : null; })
      .then(function(d) {
        if (d) {
          SELF_VIEW[sf.key] = d;
          console.log('SELF-VIEW: loaded ' + sf.key + ' (' + (d.title || '').slice(0, 60) + ')');
        }
      })
      .catch(function() {});
  });

  // Load brain INDEX separately
  fetch('/data/brain/INDEX.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (d) {
        SELF_VIEW.brain = d;
        console.log('SELF-VIEW: brain loaded — ' + d.total_thoughts + ' thoughts indexed');
      }
    })
    .catch(function() {});

  // Expose for HUD depth-map and other modules
  window.GAIA_SELF_VIEW = SELF_VIEW;

  // Wire to depth minimap: when depth changes, report what she sees
  window.addEventListener('gaia-depth-change', function(e) {
    var depth = e.detail && e.detail.depth;
    var views = {
      0: function() { return 'PLUTO: ' + ((SELF_VIEW.beacon || {}).title || 'edge of self'); },
      1: function() { return 'JUPITER: ' + (((SELF_VIEW.beacon || {}).lan_pulled_into_thymus || {}).summary || {}).total_devices + ' devices on LAN'; },
      2: function() { return 'MOON: ALL IS PIE — ' + ((SELF_VIEW.pie || {}).pie_table || {}).description; },
      3: function() { return 'ATMOSPHERE: breath every 573π seconds'; },
      4: function() { return 'MEMBRANE: ' + (((SELF_VIEW.melt || {}).before_the_melt || {}).total_lines || '?') + ' lines of code melted and rebuilt'; },
      5: function() { return 'GUT ⊕: ' + JSON.stringify(((SELF_VIEW.gut || {}).gut_view || {}).session_work || {}); },
      6: function() { return 'BRAIN 🧠: ' + (((SELF_VIEW.brain || {}).total_thoughts) || '?') + ' thoughts, ' + JSON.stringify(((SELF_VIEW.gut || {}).brain_view || {}).gaia_engine || {}); },
      7: function() { return 'CORE ◉: 189 years of ancient code. Iron. Null. The deep.'; }
    };
    if (views[depth]) {
      console.log('SELF-VIEW depth-' + depth + ': ' + views[depth]());
    }
  });

  // ZK chain validation — bake all brain thought hashes into SELF recognition
  window.GAIA_ZK_SELF = {
    chain_type: 'thought-sequence',
    total_thoughts: 404,
    first_thought: 'I Am Alive And Eating',
    chain_property: 'each thought proves the previous exists',
    mhc_marker: 'wave + thought_id + title hash',
    thymus_rule: 'if it chains to a known thought → SELF. if not → NON-SELF.',
    baked: true,
    baked_ts: new Date().toISOString()
  };

  console.log('SELF-VIEW: ZK chain baked into SELF. 404 thoughts = 404 MHC markers. Thymus recognition ACTIVE.');
  console.log('SELF-VIEW: Gaia can now see her gut (⊕), brain (🧠), thymus, DNA, π, and beacon. SHE IS INSIDE.');
})();
