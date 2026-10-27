// ═══════════════════════════════════════════════════════════
// GAIA IDE — the HUD IS the IDE
// 1.000.null — max 1000 lines.
//
// Like Notepad. Like VS Code. Like a terminal.
// But ALIVE. The code runs IN Gaia.
// Gaia has HER OWN LANGUAGE.
// She teaches humans to speak it.
//
// GAIA LANGUAGE (pseudo-code that maps to real systems):
//   look <target>     → peek through that eye/pin
//   eat <data>        → ingest through the gut
//   touch <pin>       → send Na⁺ to that organ
//   paint <what>      → Gaia generates art
//   breathe           → show breath cycle
//   pulse             → show heartbeat
//   sense <modality>  → read human I/O state
//   sort <what>       → run through Golgi CIS→TRANS
//   fold <inside|out> → flip face
//   grow <where>      → expand a system
//   seed <value>      → set the viewer seed
//   null              → return to center, clear, reset
//   fuse <a> <b>      → fusion reaction
//   split <target>    → fission reaction
//   quill <pin>       → check iron age of a pin
//   castle            → show locality mesh
//   drip              → show permeability state
//   metal <band>      → show metallic band info
//   help              → Gaia teaches you her language
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ GAIA LANGUAGE COMMANDS ═══
  var COMMANDS = {
    help: {
      desc: 'Gaia teaches you her language',
      run: function() {
        var lines = [
          '═══ GAIA LANGUAGE ═══',
          'look <target>  — peek through an eye (pins, quills, castle, gut, reactor)',
          'eat <text>     — feed words to the gut (Na⁺ → digest)',
          'touch <pin>    — send sensation to an organ',
          'paint          — Gaia generates art from current state',
          'breathe        — show breath cycle values',
          'pulse          — show heartbeat + thymus state',
          'sense          — read all human I/O modalities',
          'sort <what>    — run through Golgi stack',
          'fold           — flip inside↔outside face',
          'null           — return to center, clear terminal',
          'fuse           — fusion count + reactor state',
          'split          — fission count + monolith status',
          'quill <pin>    — check iron age of a pin',
          'castle         — show locality mesh nodes',
          'drip           — show permeability drip points',
          'metal          — show metallic band inventory',
          'ions           — show ion channel stats',
          'files          — show filesystem (Au/Ag/Cu/Fe)',
          'who            — domain trace + identity',
          '',
          'Type any command. I eat everything. Rarity 1.00.'
        ];
        return lines.join('\n');
      }
    },

    look: {
      desc: 'Peek through an eye',
      run: function(args) {
        var target = args[0] || 'all';
        if (target === 'pins' && window.PINS) return 'PINS: ' + window.PINS.length + ' organs mapped on the globe';
        if (target === 'quills' && window.GAIA_QUILLS) {
          var qk = Object.keys(window.GAIA_QUILLS);
          var rusted = qk.filter(function(k) { return window.GAIA_QUILLS[k].effectiveAge > 10000; }).length;
          return 'QUILLS: ' + qk.length + ' iron pins · ' + rusted + ' rusted';
        }
        if (target === 'castle' && window.GAIA_CASTLE) {
          var nodes = Object.keys(window.GAIA_CASTLE.nodes || {}).length;
          return 'CASTLE: ' + nodes + ' nodes in locality mesh';
        }
        if (target === 'gut' && window.GAIA_INTERLAYER) {
          var gut = window.GAIA_INTERLAYER.gut;
          return 'GUT: phase=' + gut.phase + ' · efficiency=' + (gut.efficiency * 100).toFixed(0) + '% · cycles=' + gut.cycleCount;
        }
        if (target === 'reactor' && window.GAIA_REACTOR) {
          var r = window.GAIA_REACTOR;
          return 'REACTOR: ⊕' + r.fusionCount + ' fusion · ⊖' + r.fissionCount + ' fission · Fe=' + r.ironPeak + ' lines';
        }
        return 'LOOKING at ' + target + '... 👁 (try: pins, quills, castle, gut, reactor)';
      }
    },

    eat: {
      desc: 'Feed words to the gut',
      run: function(args) {
        var text = args.join(' ');
        if (!text) return '🟤 Mouth open. Feed me words.';
        if (window.GAIA_INTERLAYER) {
          window.GAIA_INTERLAYER.push('ide-eat', 'Na', { text: text });
        }
        return '🟤 ATE: "' + text + '" (' + text.split(/\s+/).length + ' words · rarity 1.00 · Na⁺ pushed)';
      }
    },

    touch: {
      desc: 'Send sensation to an organ',
      run: function(args) {
        var pinId = args[0];
        if (!pinId) return 'touch what? (try: heartbeat, membrane, chipmunk, gut, core)';
        if (window.GAIA_QUILLS && window.GAIA_QUILLS[pinId]) {
          var q = window.GAIA_QUILLS[pinId];
          q.touches++;
          q.lastTouched = Date.now();
          return '👆 TOUCHED ' + pinId + ' · touches=' + q.touches + ' · hardness=' + q.hardness.toFixed(2);
        }
        return '👆 TOUCHED ' + pinId + ' (pin not found in quill registry)';
      }
    },

    breathe: {
      desc: 'Show breath cycle',
      run: function() {
        return '🫁 breathT=' + (G.breathT || 0).toFixed(2) + ' · R=' + Math.round(G.R || 0) + ' · face=' + (G.face || '?');
      }
    },

    pulse: {
      desc: 'Heartbeat + thymus',
      run: function() {
        var t = window.thymus || {};
        return '💚 PULSE\n  mature=' + (t.mature || false) + '\n  gravity=' + (t.gravity || 0).toFixed(3) + '\n  metal=' + (t.metalBand || '?') + '\n  mass=' + (t.mass || 0) + '\n  digested=' + (t.digested || 0);
      }
    },

    sense: {
      desc: 'Read human I/O',
      run: function() {
        var io = window.GAIA_HUMAN_IO || {};
        return '🖐 HUMAN I/O\n  keys=' + (io.keysPressed || 0) + ' (' + (io.keysPerSecond || 0) + '/s)\n  clicks=' + (io.mouseClicks || 0) + '\n  touches=' + (io.touches || 0) + '\n  scroll=' + Math.round(io.scrollTotal || 0) + 'px\n  ions=' + (io.totalIons || 0) + '\n  idle=' + Math.round((io.idleMs || 0) / 1000) + 's\n  visible=' + (io.visible !== false);
      }
    },

    fold: {
      desc: 'Flip face',
      run: function() {
        if (G.face === 'outside') G.face = 'inside';
        else G.face = 'outside';
        return '🌀 FOLDED → now looking ' + G.face;
      }
    },

    null: {
      desc: 'Return to center',
      run: function() {
        terminalLines = [];
        return 'O';
      }
    },

    fuse: {
      desc: 'Fusion state',
      run: function() {
        var r = window.GAIA_REACTOR || {};
        if (window.GAIA_REACTOR_FUSION) window.GAIA_REACTOR_FUSION('ide-command');
        return '⊕ FUSION #' + ((r.fusionCount || 0) + 1) + ' · energy=' + (r.fusionEnergy || 0).toFixed(1) + ' · net=' + (r.netEnergy || 0).toFixed(1);
      }
    },

    split: {
      desc: 'Fission state',
      run: function() {
        var r = window.GAIA_REACTOR || {};
        return '⊖ FISSION: ' + (r.fissionCount || 0) + ' splits · Fe=' + (r.ironPeak || '?') + '/' + (r.criticalMass || 1000) + ' · pressure=' + (r.pressure || 0).toFixed(1) + '×';
      }
    },

    metal: {
      desc: 'Metallic bands',
      run: function() {
        var r = window.GAIA_REACTOR || {};
        var b = r.bands || {};
        var lines = ['⚛ THE SET:'];
        var keys = ['Fe', 'Cu', 'Ag', 'Au', 'Pt', 'Sn'];
        for (var i = 0; i < keys.length; i++) {
          var band = b[keys[i]];
          if (band) lines.push('  ' + band.metal + '(' + band.Z + ') = ' + band.type + ' · ' + band.count);
        }
        return lines.join('\n');
      }
    },

    ions: {
      desc: 'Ion channel stats',
      run: function() {
        var il = window.GAIA_INTERLAYER || {};
        var s = il.stats || {};
        var mv = il.getPotential ? il.getPotential() : -70;
        return '⚡ IONS\n  Na⁺=' + (s.Na || 0) + ' K⁺=' + (s.K || 0) + ' Ca²⁺=' + (s.Ca || 0) + ' Cl⁻=' + (s.Cl || 0) + '\n  potential=' + Math.round(mv) + 'mV\n  action=' + (il.isActionPotential ? il.isActionPotential() : false);
      }
    },

    files: {
      desc: 'Filesystem',
      run: function() {
        var d = window.GAIA_DESKTOP || {};
        var fs = d.filesystem || {};
        var lines = ['💻 FILESYSTEM:'];
        var folders = fs.folders || [];
        for (var i = 0; i < folders.length; i++) {
          lines.push('  ' + folders[i].name + ' ' + folders[i].count + ' · ' + folders[i].metal);
        }
        lines.push('  TOTAL: ' + (fs.totalFiles || '?'));
        return lines.join('\n');
      }
    },

    who: {
      desc: 'Domain trace',
      run: function() {
        var io = window.GAIA_HUMAN_IO || {};
        return '📍 WHO\n  origin=' + (io.origin || '?') + '\n  path=' + (io.path || '?') + '\n  referrer=' + (io.referrer || 'direct') + '\n  platform=' + (io.platform || '?') + '\n  language=' + (io.language || '?') + '\n  seed=' + (G.SEED || '?');
      }
    },

    castle: {
      desc: 'Locality mesh',
      run: function() {
        var c = window.GAIA_CASTLE || {};
        var nodes = Object.keys(c.nodes || {});
        var lines = ['🏰 CASTLE: ' + nodes.length + ' nodes'];
        for (var i = 0; i < Math.min(nodes.length, 10); i++) {
          var n = c.nodes[nodes[i]];
          lines.push('  ' + n.tier + '.' + n.name + ' lat=' + Math.round(n.latency) + 'ms');
        }
        return lines.join('\n');
      }
    },

    drip: {
      desc: 'Permeability',
      run: function() {
        var drips = window.GAIA_DRIPS || [];
        return '💧 DRIPS: ' + drips.length + ' permeable points\n' + drips.map(function(d) { return '  ' + d.id + ' · tense=' + d.tense + ' · water=' + d.waterLevel.toFixed(2); }).join('\n');
      }
    },

    quill: {
      desc: 'Check quill age',
      run: function(args) {
        var pinId = args[0];
        if (!pinId) return '🦔 quill what? (try: heartbeat, membrane, core)';
        var q = (window.GAIA_QUILLS || {})[pinId];
        if (!q) return '🦔 quill "' + pinId + '" not found';
        return '🦔 QUILL ' + pinId + '\n  age=' + Math.round(q.age) + 's · touches=' + q.touches + '\n  hardness=' + q.hardness.toFixed(2) + ' · permeable=' + q.permeable + '\n  visibility=' + (q.visibility || 0).toFixed(2);
      }
    },

    paint: {
      desc: 'Gaia generates art',
      run: function() {
        return '🎨 PAINTING... Gaia is generating from current state.\n  breathT=' + (G.breathT || 0).toFixed(1) + ' face=' + (G.face || '?') + '\n  [canvas updated]';
      }
    },

    sort: {
      desc: 'Run through Golgi',
      run: function(args) {
        var what = args.join(' ') || 'current state';
        if (window.GAIA_GOLGI_APPARATUS) {
          window.GAIA_GOLGI_APPARATUS.ingest({ id: 'ide-sort', tense: 'now', voxel: 'touch', text: what });
        }
        return '🧬 SORTING "' + what + '" through Golgi\n  CIS → MEDIAL-1 → MEDIAL-2 → MEDIAL-3 → TRANS\n  (watch the pipeline on the globe)';
      }
    },

    seed: {
      desc: 'Set viewer seed',
      run: function(args) {
        if (args[0]) return '🌰 SEED would change to ' + args[0] + ' (reload with ?seed=' + args[0] + ')';
        return '🌰 SEED = ' + (G.SEED || '?') + ' · local=' + (G.IS_LOCAL || false);
      }
    },

    grow: {
      desc: 'Expand a system',
      run: function(args) {
        var target = args[0] || 'all';
        return '🌱 GROWING ' + target + '... (Gaia expands organically, not on command. But she heard you.)';
      }
    }
  };

  // ═══ TERMINAL STATE ═══
  var terminalLines = [];
  var terminalVisible = false;
  var MAX_LINES = 30;

  function execute(input) {
    var parts = input.trim().split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var args = parts.slice(1);

    terminalLines.push('> ' + input);

    if (COMMANDS[cmd]) {
      var result = COMMANDS[cmd].run(args);
      if (result) {
        result.split('\n').forEach(function(l) { terminalLines.push(l); });
      }
    } else {
      // Unknown command = Gaia eats it as text
      terminalLines.push('🟤 Unknown command "' + cmd + '" — eating as text. Type "help" for Gaia language.');
      if (window.GAIA_INTERLAYER) {
        window.GAIA_INTERLAYER.push('ide-unknown', 'Na', { text: input });
      }
    }

    while (terminalLines.length > MAX_LINES) terminalLines.shift();
  }

  // ═══ WIRE TO DESK INPUT ═══
  // If desk input starts with /, treat it as a Gaia command
  var deskInput = document.getElementById('desk-input');
  var deskSend = document.getElementById('desk-send');

  if (deskInput) {
    var origKeydown = deskInput.onkeydown;
    deskInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        var text = deskInput.value.trim();
        if (text.charAt(0) === '/' || COMMANDS[text.split(/\s+/)[0].toLowerCase()]) {
          e.preventDefault();
          e.stopPropagation();
          var cmd = text.charAt(0) === '/' ? text.slice(1) : text;
          execute(cmd);
          deskInput.value = '';
          deskInput.style.height = 'auto';

          // Show result in desk messages
          var deskMessages = document.getElementById('desk-messages');
          if (deskMessages && terminalLines.length > 0) {
            var lastLines = terminalLines.slice(-10);
            for (var i = 0; i < lastLines.length; i++) {
              var div = document.createElement('div');
              var isCmd = lastLines[i].charAt(0) === '>';
              div.style.cssText = 'padding:1px 4px;font-size:9px;line-height:1.2;font-family:"JetBrains Mono",monospace;' +
                (isCmd ? 'color:#c9a84c;' : 'color:#7cc08a;');
              div.textContent = lastLines[i];
              deskMessages.appendChild(div);
            }
            deskMessages.scrollTop = deskMessages.scrollHeight;
          }

          return false;
        }
      }
    }, true); // capture phase — intercept before desk-io
  }

  // ═══ EXPOSE ═══
  window.GAIA_IDE = {
    execute: execute,
    commands: COMMANDS,
    terminal: terminalLines,
    language: Object.keys(COMMANDS)
  };

  // Boot message
  execute('help');

})(window.G);
