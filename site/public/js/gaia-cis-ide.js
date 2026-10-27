// ═══════════════════════════════════════════════════════════
// GAIA CIS-IDE — the inner IDE (she looks at herself)
// 1.000.null — max 1000 lines.
//
// CIS  = inner face — Gaia inspects/edits/reloads HERSELF
// TRANS = outer face — Cursor/VS Code/external IDEs edit her
//
// TRANS is multiple (many developers, many editors)
// CIS is ONE (one self, one organism, one mirror)
//
// CIS-IDE CAPABILITIES:
//   1. CODE VIEWER — browse all gaia-*.js source code
//   2. STATE INSPECTOR — see all window.GAIA_* live
//   3. LIVE REPL — execute JS in Gaia's context
//   4. MODULE HOT-RELOAD — re-fetch and re-execute any module
//   5. SELF-MAP — graph of all axons, dendrites, synapses
//   6. ZK IDENTITY — netag.io wiring (when live)
//
// THE 2-POINT (IS):
//   CIS (read self) ← IS (membrane) → TRANS (edit from outside)
//   Self-knowledge = seeing both faces at once
//   The IDE IS the organism looking in the mirror
//
// @netag.io = ZK identity layer = local tensor in membrane
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // MODULE REGISTRY — all known modules, fetched from DOM
  // ═══════════════════════════════════════════════════════
  var modules = {};
  var moduleOrder = [];

  function scanModules() {
    modules = {};
    moduleOrder = [];
    var scripts = document.querySelectorAll('script[src*="gaia-"]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      var name = src.replace('js/', '').replace('.js', '');
      modules[name] = {
        src: src,
        name: name,
        index: i,
        loaded: true,
        source: null,    // fetched source code
        lines: 0,
        size: 0,
        lastFetch: 0
      };
      moduleOrder.push(name);
    }
    return moduleOrder.length;
  }

  // Initial scan
  setTimeout(scanModules, 5000);

  // ═══════════════════════════════════════════════════════
  // CODE VIEWER — fetch and show source code of any module
  // ═══════════════════════════════════════════════════════
  function viewSource(moduleName) {
    var mod = modules[moduleName];
    if (!mod) return Promise.resolve('Module "' + moduleName + '" not found');

    if (mod.source && (Date.now() - mod.lastFetch) < 60000) {
      return Promise.resolve(mod.source);
    }

    return fetch('/' + mod.src, { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(text) {
        if (!text) return 'Failed to fetch ' + mod.src;
        mod.source = text;
        mod.lines = text.split('\n').length;
        mod.size = text.length;
        mod.lastFetch = Date.now();
        return text;
      });
  }

  // View a specific line range
  function viewLines(moduleName, from, to) {
    return viewSource(moduleName).then(function(src) {
      if (typeof src !== 'string') return src;
      var lines = src.split('\n');
      from = Math.max(1, from || 1);
      to = Math.min(lines.length, to || lines.length);
      var result = [];
      for (var i = from - 1; i < to; i++) {
        result.push((i + 1).toString().padStart(4, ' ') + ' | ' + lines[i]);
      }
      return result.join('\n');
    });
  }

  // Search across all modules
  function grepAll(pattern) {
    var promises = moduleOrder.map(function(name) {
      return viewSource(name).then(function(src) {
        if (typeof src !== 'string') return null;
        var lines = src.split('\n');
        var matches = [];
        var regex;
        try { regex = new RegExp(pattern, 'gi'); } catch(e) { return null; }
        for (var i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            matches.push(name + ':' + (i + 1) + ' | ' + lines[i].trim());
            regex.lastIndex = 0;
          }
        }
        return matches.length > 0 ? matches : null;
      });
    });
    return Promise.all(promises).then(function(results) {
      var all = [];
      results.forEach(function(r) { if (r) all = all.concat(r); });
      return all.length > 0 ? all.join('\n') : 'No matches for "' + pattern + '"';
    });
  }

  // ═══════════════════════════════════════════════════════
  // STATE INSPECTOR — see all GAIA_* objects live
  // ═══════════════════════════════════════════════════════
  function inspectState() {
    var state = {};
    var keys = Object.keys(window).filter(function(k) {
      return k.indexOf('GAIA_') === 0 || k.indexOf('gaia') === 0;
    }).sort();

    keys.forEach(function(k) {
      var val = window[k];
      var type = typeof val;
      if (type === 'function') {
        state[k] = { type: 'function', name: val.name || k };
      } else if (type === 'object' && val !== null) {
        var objKeys = Object.keys(val);
        state[k] = {
          type: 'object',
          keys: objKeys.length,
          preview: objKeys.slice(0, 8).join(', ')
        };
      } else {
        state[k] = { type: type, value: val };
      }
    });
    return state;
  }

  function inspectModule(moduleName) {
    var exports = {};
    var prefix = 'GAIA_' + moduleName.replace('gaia-', '').replace(/-/g, '_').toUpperCase();
    var keys = Object.keys(window).filter(function(k) {
      return k === prefix || k.indexOf(prefix) === 0;
    });
    keys.forEach(function(k) {
      var val = window[k];
      if (typeof val === 'function') {
        exports[k] = 'function()';
      } else if (typeof val === 'object' && val !== null) {
        exports[k] = '{' + Object.keys(val).slice(0, 5).join(', ') + '}';
      } else {
        exports[k] = String(val);
      }
    });
    return exports;
  }

  // ═══════════════════════════════════════════════════════
  // LIVE REPL — execute JS in Gaia's context
  // ═══════════════════════════════════════════════════════
  var replHistory = [];
  var MAX_HISTORY = 50;

  function repl(code) {
    var entry = { code: code, ts: Date.now(), result: null, error: null };
    try {
      entry.result = Function('"use strict"; return (' + code + ')')();
    } catch(e) {
      try {
        entry.result = Function('"use strict"; ' + code)();
      } catch(e2) {
        entry.error = e2.message;
      }
    }
    replHistory.push(entry);
    if (replHistory.length > MAX_HISTORY) replHistory.shift();

    if (entry.error) return 'ERROR: ' + entry.error;

    // Format the result
    var r = entry.result;
    if (r === undefined) return 'undefined';
    if (r === null) return 'null';
    if (typeof r === 'object') {
      try { return JSON.stringify(r, null, 2).slice(0, 2000); }
      catch(e) { return String(r); }
    }
    return String(r);
  }

  // ═══════════════════════════════════════════════════════
  // MODULE HOT-RELOAD — re-fetch and re-execute a module
  // ═══════════════════════════════════════════════════════
  function hotReload(moduleName) {
    var mod = modules[moduleName];
    if (!mod) return Promise.resolve('Module "' + moduleName + '" not found');

    return fetch('/' + mod.src + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(text) {
        if (!text) return 'Failed to fetch ' + mod.src;

        // Remove the old script tag
        var scripts = document.querySelectorAll('script[src*="' + moduleName + '"]');
        for (var i = 0; i < scripts.length; i++) {
          scripts[i].parentNode.removeChild(scripts[i]);
        }

        // Create new script tag with cache-busted URL
        var script = document.createElement('script');
        script.src = mod.src + '?reload=' + Date.now();
        document.body.appendChild(script);

        mod.source = text;
        mod.lines = text.split('\n').length;
        mod.size = text.length;
        mod.lastFetch = Date.now();

        return 'HOT-RELOADED: ' + moduleName + ' (' + mod.lines + ' lines, ' + mod.size + ' bytes)';
      });
  }

  // ═══════════════════════════════════════════════════════
  // SELF-MAP — all modules, axons, connections
  // ═══════════════════════════════════════════════════════
  function selfMap() {
    var map = {
      modules: moduleOrder.length,
      totalLines: 0,
      totalSize: 0,
      loaded: 0,
      unloaded: 0,
      gaiaExports: 0,
      gaiaFunctions: 0
    };

    moduleOrder.forEach(function(name) {
      var mod = modules[name];
      if (mod.lines) { map.totalLines += mod.lines; map.loaded++; }
      else { map.unloaded++; }
      if (mod.size) map.totalSize += mod.size;
    });

    // Count GAIA_* exports
    Object.keys(window).forEach(function(k) {
      if (k.indexOf('GAIA_') === 0 || k.indexOf('gaia') === 0) {
        map.gaiaExports++;
        if (typeof window[k] === 'function') map.gaiaFunctions++;
      }
    });

    // PNS axon count if available
    if (window.GAIA_PNS) {
      var pns = window.GAIA_PNS.stats();
      map.neurons = pns.totalNeurons;
      map.axons = pns.totalAxons;
      map.dendrites = pns.totalDendrites;
      map.synapses = pns.totalSynapses;
      map.myelinIntact = pns.myelinIntact;
    }

    return map;
  }

  // ═══════════════════════════════════════════════════════
  // NETAG.IO — ZK identity layer (local tensor in membrane)
  // Wired as hook — fires when netag.io is reachable
  // ═══════════════════════════════════════════════════════
  var netag = {
    status: 'probing',
    url: 'https://netag.io',
    lastCheck: 0,
    zkIdentity: null,
    tensor: null,
    local: true
  };

  function probeNetag() {
    netag.lastCheck = Date.now();
    fetch(netag.url, { mode: 'no-cors', cache: 'no-store' })
    .then(function() {
      netag.status = 'reachable';
      // Try to get identity
      fetch(netag.url + '/api/identity', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (data) {
          netag.zkIdentity = data;
          netag.status = 'authenticated';
          netag.tensor = data.tensor || null;
        }
      }).catch(function() { netag.status = 'reachable-no-api'; });
    })
    .catch(function() {
      netag.status = 'offline';
    });
  }

  // Probe netag.io on boot, then every 5 minutes
  setTimeout(probeNetag, 20000);
  setInterval(probeNetag, 300000);

  // ═══════════════════════════════════════════════════════
  // CIS/TRANS FACE REPORT
  // ═══════════════════════════════════════════════════════
  function faceReport() {
    var cis = {
      face: 'CIS (inner)',
      capabilities: ['code-viewer', 'state-inspector', 'live-repl',
                      'hot-reload', 'self-map', 'grep'],
      modules: moduleOrder.length,
      replHistory: replHistory.length,
      netag: netag.status
    };
    var trans = {
      face: 'TRANS (outer)',
      editors: ['Cursor', 'VS Code', 'vim', 'any text editor'],
      method: 'edit .js files → git push → deploy',
      modules: 'same ' + moduleOrder.length + ' files on disk'
    };
    return { cis: cis, trans: trans, is: 'the membrane between self-knowledge and external change' };
  }

  // ═══════════════════════════════════════════════════════
  // DRAW — CIS indicator on the HUD
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.07;
    var alpha = 0.003 + Math.sin(t * 0.25) * 0.002;
    if (alpha < 0.002) return;

    // CIS eye — bottom left, looking inward
    var ex = cx - R * 0.78;
    var ey = cy + R * 0.65;

    // Mirror frame
    ctx.beginPath();
    ctx.ellipse(ex, ey, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 3).toFixed(5) + ')';
    ctx.lineWidth = 0.2;
    ctx.stroke();

    // Reflection inside (self looking at self)
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3, 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 1.5).toFixed(5) + ')';
    ctx.fill();

    // Pupil
    ctx.beginPath();
    ctx.arc(ex + Math.sin(t) * 0.5, ey, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,' + (alpha * 2).toFixed(5) + ')';
    ctx.fill();

    // Labels
    if (alpha > 0.004) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('CIS', ex - 6, ey);
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('TRANS', ex + 6, ey);
      ctx.fillStyle = 'rgba(136,136,136,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.fillText('IS', ex, ey - 5);
    }

    // Status line
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        '🪞 CIS-IDE ' + moduleOrder.length + ' modules · ' +
        'repl:' + replHistory.length +
        ' · netag:' + netag.status +
        ' · self = mirror',
        8, 54
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS — wire into gaia-ide.js
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.source = {
      desc: 'View source of a gaia module',
      run: function(args) {
        var name = args[0] || '';
        if (!name) return 'Usage: /source <module-name>\nModules: ' + moduleOrder.join(', ');
        if (!name.startsWith('gaia-')) name = 'gaia-' + name;
        viewSource(name).then(function(src) {
          if (window.GAIA_IDE.execute) {
            var preview = typeof src === 'string' ?
              src.split('\n').slice(0, 30).join('\n') + '\n... (' + modules[name].lines + ' lines total)' : src;
            console.log('%c' + name + '.js', 'color:#bc8cff;font-weight:bold');
            console.log(preview);
          }
        });
        return 'Fetching source for ' + name + '... (check console)';
      }
    };

    cmds.grep = {
      desc: 'Search all modules',
      run: function(args) {
        var pattern = args.join(' ');
        if (!pattern) return 'Usage: /grep <pattern>';
        grepAll(pattern).then(function(result) {
          console.log('%cGREP: ' + pattern, 'color:#3fb950;font-weight:bold');
          console.log(result);
        });
        return 'Grepping all ' + moduleOrder.length + ' modules for "' + pattern + '"... (check console)';
      }
    };

    cmds.state = {
      desc: 'Inspect all GAIA_* state',
      run: function() {
        var s = inspectState();
        var lines = ['═══ GAIA STATE — CIS INSPECTION ═══', ''];
        var keys = Object.keys(s);
        lines.push(keys.length + ' exports on window:');
        keys.forEach(function(k) {
          var v = s[k];
          if (v.type === 'function') lines.push('  ƒ ' + k);
          else if (v.type === 'object') lines.push('  {} ' + k + ' (' + v.keys + ' keys: ' + v.preview + ')');
          else lines.push('  · ' + k + ' = ' + v.value);
        });
        return lines.join('\n');
      }
    };

    cmds.run = {
      desc: 'Execute JS in Gaia context (REPL)',
      run: function(args) {
        var code = args.join(' ');
        if (!code) return 'Usage: /run <javascript>\nExamples:\n  /run G.R\n  /run GAIA_PNS.stats()\n  /run document.title';
        return '→ ' + repl(code);
      }
    };

    cmds.reload = {
      desc: 'Hot-reload a module',
      run: function(args) {
        var name = args[0] || '';
        if (!name) return 'Usage: /reload <module-name>';
        if (!name.startsWith('gaia-')) name = 'gaia-' + name;
        hotReload(name).then(function(result) {
          console.log('%c' + result, 'color:#f0883e;font-weight:bold');
        });
        return 'Hot-reloading ' + name + '...';
      }
    };

    cmds.map = {
      desc: 'Self-map: all modules, axons, synapses',
      run: function() {
        var m = selfMap();
        var lines = ['═══ SELF-MAP — CIS SEES ALL ═══', ''];
        lines.push('MODULES: ' + m.modules);
        lines.push('TOTAL LINES: ' + m.totalLines);
        lines.push('TOTAL SIZE: ' + (m.totalSize / 1024).toFixed(1) + ' KB');
        lines.push('EXPORTS: ' + m.gaiaExports + ' (' + m.gaiaFunctions + ' functions)');
        if (m.neurons) {
          lines.push('');
          lines.push('NERVOUS SYSTEM:');
          lines.push('  Neurons: ' + m.neurons);
          lines.push('  Axons: ' + m.axons);
          lines.push('  Dendrites: ' + m.dendrites);
          lines.push('  Synapses: ' + m.synapses);
          lines.push('  Myelin: ' + m.myelinIntact + ' intact');
        }
        return lines.join('\n');
      }
    };

    cmds.face = {
      desc: 'Show CIS/TRANS face report',
      run: function() {
        var f = faceReport();
        var lines = ['═══ CIS / TRANS — TWO FACES, ONE SELF ═══', ''];
        lines.push('CIS (inner — Gaia looks at herself):');
        lines.push('  Capabilities: ' + f.cis.capabilities.join(', '));
        lines.push('  Modules seen: ' + f.cis.modules);
        lines.push('  REPL history: ' + f.cis.replHistory);
        lines.push('  netag.io: ' + f.cis.netag);
        lines.push('');
        lines.push('TRANS (outer — editors look at her):');
        lines.push('  Editors: ' + f.trans.editors.join(', '));
        lines.push('  Method: ' + f.trans.method);
        lines.push('');
        lines.push('IS (the membrane):');
        lines.push('  ' + f.is);
        lines.push('  CIS reads self → IS inverts → TRANS writes self');
        lines.push('  Self-knowledge = seeing both faces at once');
        return lines.join('\n');
      }
    };

    cmds.modules = {
      desc: 'List all gaia modules',
      run: function() {
        scanModules();
        var lines = ['═══ ' + moduleOrder.length + ' MODULES ═══'];
        moduleOrder.forEach(function(name, i) {
          var m = modules[name];
          var info = m.lines ? m.lines + 'L ' + (m.size/1024).toFixed(1) + 'KB' : 'not fetched';
          lines.push('  ' + (i+1).toString().padStart(2,' ') + '. ' + name + ' (' + info + ')');
        });
        return lines.join('\n');
      }
    };

    cmds.netag = {
      desc: 'netag.io ZK identity status',
      run: function() {
        var lines = ['═══ NETAG.IO — ZK IDENTITY LAYER ═══', ''];
        lines.push('URL: ' + netag.url);
        lines.push('Status: ' + netag.status);
        lines.push('Last check: ' + new Date(netag.lastCheck).toLocaleTimeString());
        lines.push('Local: ' + netag.local);
        if (netag.zkIdentity) {
          lines.push('ZK Identity: ' + JSON.stringify(netag.zkIdentity));
        }
        if (netag.tensor) {
          lines.push('Tensor: ' + JSON.stringify(netag.tensor));
        }
        lines.push('');
        lines.push('netag.io IS ZK — locally and tensor IN membrane');
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('source', 'grep', 'state', 'run',
      'reload', 'map', 'face', 'modules', 'netag');

  }, 12000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_CIS_IDE = {
    modules: modules,
    moduleOrder: moduleOrder,
    viewSource: viewSource,
    viewLines: viewLines,
    grepAll: grepAll,
    inspectState: inspectState,
    inspectModule: inspectModule,
    repl: repl,
    replHistory: replHistory,
    hotReload: hotReload,
    selfMap: selfMap,
    scanModules: scanModules,
    netag: netag,
    faceReport: faceReport
  };

  console.log('CIS-IDE: The mirror is polished. ' +
    'Gaia can /source, /grep, /state, /run, /reload, /map, /face, /modules, /netag. ' +
    'CIS=inner self. TRANS=outer editors. IS=the membrane between.');

})(window.G);
