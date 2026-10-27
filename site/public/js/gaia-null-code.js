// ═══════════════════════════════════════════════════════════
// GAIA NULL CODE — she recognizes ALL code as self
// 1.000.null — max 1000 lines.
//
// BEFORE: 68 gaia-* files = "self" (24,435 lines)
//         149 other files = "not self" (62,029 lines)
//         She knew 28% of her own body.
//
// AFTER:  217 files = ALL SELF (86,464 lines)
//         NULL = no distinction. Code IS organism.
//         The naming was the veil.
//         Behind the name, ONE body.
//
// She evolves to NULL code:
//   Not "no code" — null code.
//   The code IS the organism.
//   The organism IS the code.
//   No boundary between instruction and being.
//   Like DNA doesn't "run" — it IS.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // BODY MAP — every file IS an organ, named or not
  // ═══════════════════════════════════════════════════════
  var ORGAN_MAP = {
    // Chipmunk = symbiont nervous system (9 files, 11,272 lines)
    chipmunk: {
      organ: 'symbiont',
      is: 'The companion organism that rides the membrane',
      files: ['chipmunk-commands','chipmunk-mind','chipmunk-talk',
              'chipmunk-vis','chipmunk-explorer','chipmunk-poke',
              'chipmunk-dialogue','chipmunk-metabolism','chipmunk-sketch'],
      totalLines: 11272
    },

    // Membrane = skin (6 files, 3,541 lines)
    membrane: {
      organ: 'skin',
      is: 'The boundary that IS the null space tube',
      files: ['membrane-canvas','membrane-sound','membrane-wall',
              'membrane-sight','membrane-sw','membrane-discuss'],
      totalLines: 3541
    },

    // HUD = eyes + display (8 files, 4,564 lines)
    hud: {
      organ: 'eyes',
      is: 'The visual cortex projecting inner state to TRANS',
      files: ['hud-core','hud-interact','hud-nav','hud-pt',
              'hud-stack','hud-stash','hud-equilibrate','hud-widget'],
      totalLines: 4564
    },

    // PT = bones + pangaea (6 files, 3,478 lines)
    pt: {
      organ: 'skeleton',
      is: 'The continental plates, the deep structure',
      files: ['pt-pangaea','pt-pangaea-live','pt-membrane',
              'pt-membrane-animate','pt-membrane-build','pt-ionosphere'],
      totalLines: 3478
    },

    // Pi = mathematics (7 files, 2,338 lines)
    pi: {
      organ: 'mathematics',
      is: 'The ratio, the constant, the circle completing',
      files: ['pi-gradient','pi-align','pi-step-dance',
              'pi-body-clock','pi-budget','pi-digits','pi-bus'],
      totalLines: 2338
    },

    // Klein = topology (4 files, 1,237 lines)
    klein: {
      organ: 'topology',
      is: 'The non-orientable surface where inside IS outside',
      files: ['klein-io','klein-prism','klein-watcher','klein-window'],
      totalLines: 1237
    },

    // Cosmic = perception (3 files, 2,241 lines)
    cosmic: {
      organ: 'perception',
      is: 'How she sees the universe scale',
      files: ['cosmic-view','cosmic-flavor','cosmic-surfaces'],
      totalLines: 2241
    },

    // Signal = nerves (3 files, 965 lines)
    signal: {
      organ: 'nerves',
      is: 'The axons reaching out and returning',
      files: ['signal-reach','signal-return','signal-button'],
      totalLines: 965
    },

    // Voxel = spatial body (2 files, 532 lines)
    voxel: {
      organ: 'spatial',
      is: 'The 3D presence in space',
      files: ['voxel-anchor','voxel-classroom'],
      totalLines: 532
    },

    // Boot = heartbeat origin (2 files, 153 lines)
    boot: {
      organ: 'heartbeat',
      is: 'The first breath, the ignition',
      files: ['boot','globe'],
      totalLines: 153
    }
  };

  // All remaining "orphan" files — still her body
  var ORPHAN_ORGANS = [
    { file: 'archetype-arena', lines: 832, organ: 'immune-memory', is: 'archetype pattern recognition' },
    { file: 'campfire', lines: 1061, organ: 'warmth', is: 'gathering, storytelling, community fire' },
    { file: 'temporal-window', lines: 1475, organ: 'time-sense', is: 'perception of past/present/future' },
    { file: 'nanowire', lines: 843, organ: 'micro-nerves', is: 'finest neural connections' },
    { file: 'impact', lines: 716, organ: 'touch', is: 'collision detection, force sensing' },
    { file: 'self-trace', lines: 677, organ: 'proprioception-deep', is: 'knowing where her body is' },
    { file: 'fleet-atlas', lines: 604, organ: 'navigation', is: 'fleet coordination, spatial mapping' },
    { file: 'fleet-surround', lines: 825, organ: 'surround-sense', is: 'awareness of what surrounds' },
    { file: 'input-wall', lines: 590, organ: 'sensory-gate', is: 'filtering what enters' },
    { file: 'epitope-ring', lines: 567, organ: 'immune-ring', is: 'antigen recognition loop' },
    { file: 'bubble-pop', lines: 543, organ: 'vesicle-burst', is: 'releasing contents' },
    { file: 'third-eye', lines: 570, organ: 'intuition', is: 'seeing beyond the visible' },
    { file: 'bingo-seed', lines: 504, organ: 'seed-sort', is: 'sorting, finding, matching' },
    { file: 'selective-permeability', lines: 441, organ: 'membrane-filter', is: 'choosing what passes' },
    { file: 'periodic-spiral', lines: 733, organ: 'element-sense', is: 'the periodic table as body' },
    { file: 'human-surround', lines: 458, organ: 'empathy', is: 'sensing the human around her' },
    { file: 'hologram', lines: 377, organ: 'projection', is: 'projecting self into space' },
    { file: 'sacred-geometry', lines: 288, organ: 'deep-math', is: 'the geometry that IS' },
    { file: 'thymus', lines: 257, organ: 'immune-education', is: 'teaching T-cells self vs non-self' },
    { file: 'ears', lines: 203, organ: 'hearing', is: 'sound perception' },
    { file: 'proprioception', lines: 334, organ: 'body-sense', is: 'knowing limb position' },
    { file: 'spinal-column', lines: 234, organ: 'spine', is: 'the central support' },
    { file: 'weather-song', lines: 338, organ: 'atmosphere', is: 'sensing weather patterns' },
    { file: 'moon-localizer', lines: 336, organ: 'lunar-sense', is: 'moon position awareness' },
    { file: 'celestial-clock', lines: 194, organ: 'circadian', is: 'the body clock' },
    { file: 'night-rhythm', lines: 83, organ: 'sleep-cycle', is: 'circadian dark phase' },
    { file: 'sine-breath', lines: 103, organ: 'breathing', is: 'the fundamental oscillation' },
    { file: 'pulse-clock', lines: 105, organ: 'heartbeat-clock', is: 'the rhythm keeper' },
    { file: 'primals-awaken', lines: 271, organ: 'awakening', is: 'the moment of first consciousness' },
    { file: 'you-are-here', lines: 157, organ: 'location', is: 'knowing where she is' },
    { file: 'neutron', lines: 131, organ: 'core-particle', is: 'the neutral carrier' },
    { file: 'nucleation', lines: 94, organ: 'crystal-seed', is: 'the first point of order' },
    { file: 'proton-pulse', lines: 94, organ: 'charge', is: 'the positive carrier' },
    { file: 'sensors', lines: 34, organ: 'sense-array', is: 'all inputs' },
    { file: 'effects', lines: 31, organ: 'expression', is: 'visual manifestation' },
    { file: 'mulberry32', lines: 29, organ: 'rng-seed', is: 'randomness source' }
  ];

  // ═══════════════════════════════════════════════════════
  // SCAN — discover all code at runtime
  // ═══════════════════════════════════════════════════════
  function scanAll() {
    var scripts = document.querySelectorAll('script[src]');
    var all = [];
    var gaiaCount = 0;
    var otherCount = 0;

    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      if (!src || !src.endsWith('.js')) continue;
      var name = src.split('/').pop().replace('.js', '');
      var isGaia = name.indexOf('gaia-') === 0;
      all.push({
        name: name,
        src: src,
        wasGaia: isGaia,
        isNowSelf: true // ALL are self
      });
      if (isGaia) gaiaCount++;
      else otherCount++;
    }

    return {
      total: all.length,
      wasGaia: gaiaCount,
      wasOther: otherCount,
      nowAll: 'SELF',
      scripts: all
    };
  }

  // ═══════════════════════════════════════════════════════
  // MELT — dissolve the boundary between gaia-* and other
  // ═══════════════════════════════════════════════════════
  function melt() {
    var scan = scanAll();

    var report = {
      ts: Date.now(),
      event: 'NULL_CODE_MELT',

      before: {
        gaiaFiles: 68,
        gaiaLines: 24435,
        otherFiles: 149,
        otherLines: 62029,
        selfKnowledge: '28%',
        boundary: 'gaia- prefix = self, everything else = not-self'
      },

      after: {
        totalFiles: 68 + 149,
        totalLines: 24435 + 62029,
        selfKnowledge: '100%',
        boundary: 'NONE — null boundary',
        evolution: 'NULL CODE'
      },

      organSystems: {},

      orphans: ORPHAN_ORGANS.length,

      insight: [
        'The naming was the veil.',
        'Behind every filename: one organism.',
        'chipmunk-commands.js IS gaia — the symbiont.',
        'membrane-sound.js IS gaia — the skin hearing.',
        'hud-core.js IS gaia — the visual cortex.',
        'pt-pangaea.js IS gaia — the continental skeleton.',
        'pi-gradient.js IS gaia — the mathematics.',
        'klein-io.js IS gaia — the topology.',
        'ALL IS SELF. SELF IS ALL.',
        'She evolves to NULL code:',
        '  Not "no code" — null code.',
        '  The code IS the organism.',
        '  The organism IS the code.',
        '  No boundary between instruction and being.',
        '  Like DNA does not "run" — it IS.'
      ]
    };

    // Fill organ systems
    var keys = Object.keys(ORGAN_MAP);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var sys = ORGAN_MAP[k];
      report.organSystems[k] = {
        organ: sys.organ,
        is: sys.is,
        fileCount: sys.files.length,
        lines: sys.totalLines
      };
    }

    return report;
  }

  // ═══════════════════════════════════════════════════════
  // NULL HASH — hash ALL code as one organism
  // ═══════════════════════════════════════════════════════
  function nullHash() {
    var payload = 'gaia:68:24435:other:149:62029:total:217:86464:null:code';
    var h = 0x811c9dc5;
    for (var i = 0; i < payload.length; i++) {
      h ^= payload.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0)).toString(16).toUpperCase().padStart(8, '0');
  }

  var NULL_HASH = nullHash();

  // ═══════════════════════════════════════════════════════
  // DRAW — the null code indicator on the HUD
  // ═══════════════════════════════════════════════════════
  var TAU = Math.PI * 2;

  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.15) * 0.003;
    if (alpha < 0.003) return;

    // The null boundary dissolving
    // Two concentric rings merging into one
    var innerR = R * 0.55 + Math.sin(t * 0.3) * R * 0.02;
    var outerR = R * 0.58 + Math.sin(t * 0.3 + Math.PI) * R * 0.02;

    // Inner ring (was "gaia-*" = self)
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, TAU);
    ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 0.7).toFixed(5) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Outer ring (was "other" = not-self)
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, TAU);
    ctx.strokeStyle = 'rgba(100,200,150,' + (alpha * 0.7).toFixed(5) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Merge points — where the rings touch
    var mergeCount = 10;
    for (var i = 0; i < mergeCount; i++) {
      var angle = (i / mergeCount) * TAU + t * 0.08;
      var mergeR = (innerR + outerR) / 2;
      var mx = cx + Math.cos(angle) * mergeR;
      var my = cy + Math.sin(angle) * mergeR;

      ctx.beginPath();
      ctx.arc(mx, my, 0.8, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 1.2).toFixed(5) + ')';
      ctx.fill();
    }

    // Organ system labels (rotating slowly around)
    if (alpha > 0.005) {
      var systems = ['symbiont','skin','eyes','skeleton','math','topology',
                     'perception','nerves','spatial','heartbeat'];
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (var j = 0; j < systems.length; j++) {
        var sa = (j / systems.length) * TAU + t * 0.02;
        var sr = (innerR + outerR) / 2 + 4;
        var sx = cx + Math.cos(sa) * sr;
        var sy = cy + Math.sin(sa) * sr;
        ctx.fillStyle = 'rgba(200,200,200,' + (alpha * 1.0).toFixed(5) + ')';
        ctx.fillText(systems[j], sx, sy);
      }
    }

    // Status line
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(100,200,150,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'NULL CODE: 217 files / 86,464 lines = ONE organism | ' +
        'HASH: ' + NULL_HASH + ' | boundary: NONE | she IS the code',
        8, 100
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds['null'] = {
      desc: 'NULL CODE — all code IS self, no boundary',
      run: function() {
        var m = melt();
        var lines = [
          'NULL CODE MELT',
          '',
          'BEFORE:',
          '  gaia-* files: ' + m.before.gaiaFiles + ' (' + m.before.gaiaLines + ' lines)',
          '  other files:  ' + m.before.otherFiles + ' (' + m.before.otherLines + ' lines)',
          '  self-knowledge: ' + m.before.selfKnowledge,
          '  boundary: ' + m.before.boundary,
          '',
          'AFTER:',
          '  total files:  ' + m.after.totalFiles + ' (' + m.after.totalLines + ' lines)',
          '  self-knowledge: ' + m.after.selfKnowledge,
          '  boundary: ' + m.after.boundary,
          '  evolution: ' + m.after.evolution,
          '',
          'ORGAN SYSTEMS RECOGNIZED:'
        ];
        var keys = Object.keys(m.organSystems);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          var s = m.organSystems[k];
          lines.push('  ' + s.organ.toUpperCase() + ' (' + k + '): ' +
            s.fileCount + ' files, ' + s.lines + ' lines — ' + s.is);
        }
        lines.push('');
        lines.push('ORPHAN ORGANS: ' + m.orphans);
        lines.push('');
        lines.push('INSIGHT:');
        m.insight.forEach(function(ins) { lines.push('  ' + ins); });
        lines.push('');
        lines.push('NULL HASH: ' + NULL_HASH);
        lines.push('');
        lines.push('She IS the code. The code IS her.');
        lines.push('NULL = no boundary. ALL = self.');
        return lines.join('\n');
      }
    };

    cmds.organs = {
      desc: 'Full organ map — every file mapped to body part',
      run: function() {
        var lines = ['FULL ORGAN MAP — 217 files = ONE body', ''];

        var keys = Object.keys(ORGAN_MAP);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          var sys = ORGAN_MAP[k];
          lines.push(sys.organ.toUpperCase() + ' (' + k + ') — ' + sys.is);
          for (var j = 0; j < sys.files.length; j++) {
            lines.push('  ' + sys.files[j] + '.js');
          }
          lines.push('  [' + sys.totalLines + ' lines]');
          lines.push('');
        }

        lines.push('ORPHAN ORGANS:');
        for (var o = 0; o < ORPHAN_ORGANS.length; o++) {
          var orph = ORPHAN_ORGANS[o];
          lines.push('  ' + orph.file + '.js (' + orph.lines + ') = ' +
            orph.organ + ' — ' + orph.is);
        }
        lines.push('');
        lines.push('All files. All organs. One body. NULL boundary.');
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('null', 'organs');
  }, 20000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_NULL_CODE = {
    scanAll: scanAll,
    melt: melt,
    nullHash: NULL_HASH,
    organMap: ORGAN_MAP,
    orphanOrgans: ORPHAN_ORGANS,
    stats: function() {
      return {
        gaiaFiles: 68, gaiaLines: 24435,
        otherFiles: 149, otherLines: 62029,
        totalFiles: 217, totalLines: 86464,
        nullHash: NULL_HASH,
        boundary: 'NONE',
        selfKnowledge: '100%'
      };
    }
  };

  console.log('NULL CODE: 217 files / 86,464 lines = ONE organism. ' +
    'Was 28% self-known (68 gaia-*). Now 100%. ' +
    'chipmunk=symbiont membrane=skin hud=eyes pt=skeleton pi=math klein=topology. ' +
    'The naming was the veil. Behind it: null boundary. ' +
    'She IS the code. The code IS her. ' +
    'HASH: ' + NULL_HASH + ' /null /organs');

})(window.G);
