// hud-stash.js v1 — save, load, bookmark, share, note, search
// Users take things home. The chipmunk remembers. The membrane is searchable.
// Everything persists. Everything is shareable. Everything is findable.
(function() {
  'use strict';

  var STORAGE_KEY = 'biomeOS_stash';
  var BOOKMARKS_KEY = 'biomeOS_bookmarks';
  var NOTES_KEY = 'biomeOS_notes';
  var HISTORY_KEY = 'biomeOS_history';
  var LEARNING_KEY = 'biomeOS_learning';

  // ═══ PERSISTENCE ENGINE ═══

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }

  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }

  // ═══ STATE SNAPSHOT — capture current HUD state ═══

  function captureState() {
    var state = {
      ts: Date.now(),
      url: location.href,
    };

    // Chipmunk state
    var cc = window._chipmunkCore;
    if (cc) {
      state.chipmunk = {
        wakeLevel: cc.cache && cc.cache.chipmunk ? cc.cache.chipmunk.wake_level : 0,
        tempo: cc.cache && cc.cache.chipmunk ? cc.cache.chipmunk.tempo : 0,
        attention: cc.curiosity ? cc.curiosity.attention : 0,
        sortedCount: cc.curiosity ? cc.curiosity.sortedCount : 0,
        piBody: cc.cache && cc.cache.chipmunk ? cc.cache.chipmunk.pi_body : '',
      };
    }

    // Temporal window
    var tw = window._temporalWindow;
    if (tw && tw.isActive()) {
      state.temporal = {
        active: true,
        epoch: tw.currentEpoch().id,
        epochName: tw.currentEpoch().name,
      };
    }

    // Cosmic view
    if (window._cosmicView) {
      state.cosmic = {
        active: typeof window._cosmicView.isActive === 'function' ? window._cosmicView.isActive() : false,
      };
    }

    // Cosmic gameplay
    if (window._cosmicGameplay) {
      var gs = window._cosmicGameplay.state();
      state.gameplay = {
        scene: gs.scene,
        discoveries: gs.discoveries,
        layers: gs.layers,
        surfaces: gs.surfaces,
      };
    }

    // Cosmic cards
    if (window._cosmicCards && window._cosmicCards.hand) {
      state.cards = {
        handSize: window._cosmicCards.hand().length,
        deckSize: window._cosmicCards.deckSize ? window._cosmicCards.deckSize() : 0,
      };
    }

    // Fleet surround
    if (window._fleetSurround) {
      state.surround = {
        active: window._fleetSurround.isActive(),
      };
    }

    // Dashboard data summary
    if (cc && cc.cache && cc.cache.dashboard) {
      var d = cc.cache.dashboard;
      state.dashboard = {
        rps: d.rps,
        fleetIps: d.fleet_ips,
        humanIps: d.human_ips,
        fleetPct: d.fleet_pct,
        selectivity: d.selectivity,
        opacity: d.opacity,
      };
    }

    // Human presence
    if (cc && cc.cache && cc.cache.human && cc.cache.human.energy) {
      state.humans = {
        total: cc.cache.human.energy.total_sessions,
        sn: cc.cache.human.energy.signal_to_noise,
        breadth: cc.cache.human.energy.avg_breadth,
      };
    }

    return state;
  }

  // ═══ RESTORE STATE ═══

  function restoreState(state) {
    var restored = [];

    // Temporal window
    if (state.temporal && state.temporal.active && state.temporal.epoch) {
      var tw = window._temporalWindow;
      if (tw) {
        if (!tw.isActive()) tw.activate();
        var epochs = tw.epochs();
        for (var i = 0; i < epochs.length; i++) {
          if (epochs[i].id === state.temporal.epoch) {
            // Need to set _currentEpoch — expose via API or use keyboard
            restored.push('temporal → ' + state.temporal.epochName);
            break;
          }
        }
      }
    }

    // Cosmic gameplay
    if (state.gameplay && state.gameplay.scene && window._cosmicGameplay) {
      window._cosmicGameplay.goToScene(state.gameplay.scene);
      restored.push('scene → ' + state.gameplay.scene);
    }

    return restored;
  }

  // ═══ BOOKMARKS ═══

  function getBookmarks() {
    return readJSON(BOOKMARKS_KEY, []);
  }

  function addBookmark(name, note) {
    var bookmarks = getBookmarks();
    var state = captureState();
    state.name = name || ('bookmark-' + (bookmarks.length + 1));
    state.note = note || '';
    state.created = new Date().toISOString();

    // Replace if same name exists
    bookmarks = bookmarks.filter(function(b) { return b.name !== state.name; });
    bookmarks.push(state);

    // Keep max 50
    if (bookmarks.length > 50) bookmarks = bookmarks.slice(-50);
    writeJSON(BOOKMARKS_KEY, bookmarks);
    return state;
  }

  function removeBookmark(name) {
    var bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(function(b) { return b.name !== name; });
    writeJSON(BOOKMARKS_KEY, bookmarks);
  }

  function renderBookmarks() {
    var bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
      return '<span class="dim">no bookmarks yet. /bookmark [name] to save your place.</span>';
    }
    var lines = ['<span class="good">\u{1F516} ' + bookmarks.length + ' bookmarks</span>'];
    bookmarks.forEach(function(b, i) {
      var age = Math.round((Date.now() - b.ts) / 60000);
      var ageStr = age < 60 ? age + 'm ago' : Math.round(age / 60) + 'h ago';
      var ctx = [];
      if (b.temporal) ctx.push('\u23f1 ' + b.temporal.epochName);
      if (b.gameplay) ctx.push('\u{1F3AE} ' + b.gameplay.scene);
      if (b.humans) ctx.push('\u{1F464} ' + b.humans.total + ' humans');
      lines.push(
        '<span style="color:#58a6ff;cursor:pointer" onclick="window._hudStash.goto(\'' + b.name.replace(/'/g, "\\'") + '\')">' +
        (i + 1) + '. <b>' + escapeHtml(b.name) + '</b></span>' +
        (b.note ? ' — <span class="dim">' + escapeHtml(b.note) + '</span>' : '') +
        ' <span style="color:#484f58">' + ageStr + '</span>' +
        (ctx.length > 0 ? ' · <span class="dim">' + ctx.join(' · ') + '</span>' : '')
      );
    });
    lines.push('<span class="dim">/goto [name] to return · /unbookmark [name] to remove</span>');
    return lines.join('\n');
  }

  // ═══ NOTES ═══

  function getNotes() {
    return readJSON(NOTES_KEY, []);
  }

  function addNote(text, context) {
    var notes = getNotes();
    notes.push({
      text: text,
      ts: Date.now(),
      created: new Date().toISOString(),
      context: context || {},
    });
    if (notes.length > 200) notes = notes.slice(-200);
    writeJSON(NOTES_KEY, notes);
    return notes[notes.length - 1];
  }

  function renderNotes(limit) {
    var notes = getNotes();
    if (notes.length === 0) {
      return '<span class="dim">no notes yet. type anything without / to add a note.</span>';
    }
    var show = notes.slice(-(limit || 10));
    var lines = ['<span class="good">\u{1F4DD} ' + notes.length + ' notes</span>'];
    show.forEach(function(n) {
      var age = Math.round((Date.now() - n.ts) / 60000);
      var ageStr = age < 60 ? age + 'm ago' : age < 1440 ? Math.round(age / 60) + 'h ago' : Math.round(age / 1440) + 'd ago';
      var ctx = [];
      if (n.context.epoch) ctx.push('\u23f1 ' + n.context.epoch);
      if (n.context.scene) ctx.push('\u{1F3AE} ' + n.context.scene);
      lines.push(
        '<span style="color:#c9d1d9">' + escapeHtml(n.text) + '</span>' +
        ' <span style="color:#484f58">' + ageStr + '</span>' +
        (ctx.length > 0 ? ' · <span class="dim">' + ctx.join(' · ') + '</span>' : '')
      );
    });
    if (notes.length > (limit || 10)) {
      lines.push('<span class="dim">' + (notes.length - (limit || 10)) + ' older notes. /notes all to see everything.</span>');
    }
    return lines.join('\n');
  }

  // ═══ COMMAND HISTORY ═══

  function getHistory() {
    return readJSON(HISTORY_KEY, []);
  }

  function addHistory(cmd) {
    var history = getHistory();
    history.push({ cmd: cmd, ts: Date.now() });
    if (history.length > 500) history = history.slice(-500);
    writeJSON(HISTORY_KEY, history);
  }

  function getUntriedCommands() {
    var history = getHistory();
    var tried = {};
    history.forEach(function(h) { tried[h.cmd] = true; });
    var allCmds = [
      'play', 'draw', 'deck', 'spin', 'sort', 'wall', 'atlas', 'fleet',
      'surround', 'twist', 'jump', 'deep', 'dark', 'back', 'tunnel', 'tube',
      'canvas', 'paint', 'zones', 'sweep', 'time', 'rewind', 'bounce',
      'dinosaurs', 'trex', 'pangaea', 'fish', 'mammal', 'cambrian',
      'return', 'listen', 'trail', 'sound', 'mute', 'seq', 'bessel',
      'karplus', 'binaural', 'formant', 'ring', 'reach', 'map', 'probe',
      'compress', 'expand', 'pop', 'bingo', 'humans', 'presence',
      'strategy', 'battle', 'relay', 'cosmos', 'explore', 'scene',
      'flavor', 'aura', 'contagion', 'spectrum', 'wobble', 'tint',
      'share', 'bookmark', 'notes', 'search',
    ];
    return allCmds.filter(function(c) { return !tried[c]; });
  }

  // ═══ SHARE — screenshot + shareable link ═══

  function shareScreenshot(callback) {
    // Find any active canvas overlay
    var canvasEl = null;
    var overlays = [
      'temporal-window-overlay',
      'membrane-canvas-overlay',
      'cosmic-view-overlay',
      'focal-tunnel-overlay',
      'totality-tunnel-overlay',
    ];
    for (var i = 0; i < overlays.length; i++) {
      var ov = document.getElementById(overlays[i]);
      if (ov) {
        canvasEl = ov.querySelector('canvas');
        if (canvasEl) break;
      }
    }

    // Also check for the main chipmunk membrane SVG
    if (!canvasEl) {
      var memSvg = document.querySelector('#chipmunk-overlay svg');
      if (memSvg) {
        // SVG — serialize to blob
        var svgData = new XMLSerializer().serializeToString(memSvg);
        var blob = new Blob([svgData], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        downloadBlob(url, 'biomeOS-membrane-' + dateStamp() + '.svg');
        callback('svg', url);
        return;
      }
    }

    if (!canvasEl) {
      callback('none', null);
      return;
    }

    try {
      var dataUrl = canvasEl.toDataURL('image/png');
      downloadBlob(dataUrl, 'biomeOS-' + dateStamp() + '.png');
      callback('png', dataUrl);
    } catch(e) {
      callback('error', e.message);
    }
  }

  function shareLink() {
    var state = captureState();
    // Trim to essentials for URL
    var slim = {};
    if (state.temporal) slim.t = state.temporal.epoch;
    if (state.gameplay) slim.g = state.gameplay.scene;
    if (state.surround && state.surround.active) slim.s = 1;
    try {
      var hash = btoa(JSON.stringify(slim));
      return location.origin + location.pathname + '#stash=' + hash;
    } catch(e) {
      return location.href;
    }
  }

  function shareEmbed(width, height) {
    var link = shareLink();
    return '<iframe src="' + link + '" width="' + (width || 800) + '" height="' + (height || 500) + '" frameborder="0" style="border:1px solid #21262d;border-radius:8px"></iframe>';
  }

  // ═══ UNIFIED SEARCH ═══

  // Search index — built lazily, searches across everything
  var _searchIndex = null;

  function buildSearchIndex() {
    _searchIndex = [];

    // 1. Commands
    var cmds = [
      { cmd: 'play', desc: 'open the investigation graph playground' },
      { cmd: 'explore', desc: 'explore entities in the investigation' },
      { cmd: 'draw', desc: 'draw a card from your cosmic deck' },
      { cmd: 'deck', desc: 'view your card hand' },
      { cmd: 'sound', desc: 'activate membrane sound — π-just intonation' },
      { cmd: 'sing', desc: 'chipmunk sings a song' },
      { cmd: 'canvas', desc: 'draw on the membrane canvas' },
      { cmd: 'time', desc: 'open temporal window — 23 epochs from now to Big Bang' },
      { cmd: 'rewind', desc: 'rewind through all epochs of time' },
      { cmd: 'bounce', desc: 'bounce between now and the beginning forever' },
      { cmd: 'dinosaurs', desc: 'jump to T-Rex epoch — 68 million years ago' },
      { cmd: 'trex', desc: 'T-Rex — brown, feathery, 40-foot hawk' },
      { cmd: 'pangaea', desc: 'Pangaea — all land was one, michigan at equator' },
      { cmd: 'fish', desc: 'Tiktaalik — the fish that leaped out of water' },
      { cmd: 'mammal', desc: 'first mammals — Morganucodon, Wales, 225Ma' },
      { cmd: 'cambrian', desc: 'Cambrian explosion — eyes evolved, arms race' },
      { cmd: 'cosmos', desc: 'cosmic view — chipmunk to oort cloud' },
      { cmd: 'fleet', desc: 'fleet map — bots around the world' },
      { cmd: 'atlas', desc: 'data center atlas — VPS nodes globally' },
      { cmd: 'surround', desc: 'surround view — fleet and humans as ring' },
      { cmd: 'wall', desc: 'membrane wall — topo-sort along boundary' },
      { cmd: 'twist', desc: 'twist the perspective — flip inside/outside' },
      { cmd: 'deep', desc: 'deep twist ceremony — 8 phases, golden flash, PURPLE' },
      { cmd: 'back', desc: 'step back — see from outside the membrane' },
      { cmd: 'tunnel', desc: 'focal tunnel — look through the membrane tube' },
      { cmd: 'totality', desc: 'totality tunnel — membrane around the tube, π⁻³ to π³' },
      { cmd: 'return', desc: 'signal return — SELF or nothing or U' },
      { cmd: 'listen', desc: 'snap to attention — hear the whistle' },
      { cmd: 'trail', desc: 'your trail — footprints through this session' },
      { cmd: 'zones', desc: 'tuebor zones — michigan to solar system' },
      { cmd: 'reach', desc: 'geographic awareness — world map, signal routing' },
      { cmd: 'map', desc: 'world map and signal reach' },
      { cmd: 'humans', desc: 'human presence — who is here right now' },
      { cmd: 'presence', desc: 'live presence — human dots, passage arcs' },
      { cmd: 'sort', desc: 'epitope sort — classify entities' },
      { cmd: 'strategy', desc: 'strategy map — investigation as territory' },
      { cmd: 'battle', desc: 'battle an entity with your cards' },
      { cmd: 'flavor', desc: 'strangeness spectrum — green to purple' },
      { cmd: 'aura', desc: 'flavor aura — glowing entity halo' },
      { cmd: 'scene', desc: 'adventure scene — the investigation as a game' },
      { cmd: 'energy', desc: 'chipmunk energy and metabolism status' },
      { cmd: 'memory', desc: 'what the chipmunk remembers' },
      { cmd: 'wake', desc: 'wake the chipmunk up' },
      { cmd: 'rest', desc: 'let the chipmunk rest' },
      { cmd: 'bessel', desc: 'Bessel membrane vibration modes' },
      { cmd: 'karplus', desc: 'Karplus-Strong plucked string synthesis' },
      { cmd: 'binaural', desc: 'binaural beats — frequency difference between ears' },
      { cmd: 'formant', desc: 'vowel formant synthesis — the chipmunk speaks' },
      { cmd: 'compress', desc: 'bingo cube compression' },
      { cmd: 'share', desc: 'share current view as screenshot or link' },
      { cmd: 'bookmark', desc: 'bookmark this moment to return later' },
      { cmd: 'notes', desc: 'view your notes' },
      { cmd: 'search', desc: 'search across everything' },
      { cmd: 'save', desc: 'save current session state' },
      { cmd: 'load', desc: 'load a saved session' },
    ];
    cmds.forEach(function(c) {
      _searchIndex.push({
        type: 'command',
        id: c.cmd,
        title: '/' + c.cmd,
        desc: c.desc,
        action: '/' + c.cmd,
      });
    });

    // 2. Temporal epochs
    if (window._temporalWindow && window._temporalWindow.epochs) {
      var epochs = window._temporalWindow.epochs();
      epochs.forEach(function(e) {
        _searchIndex.push({
          type: 'epoch',
          id: e.id,
          title: e.glyph + ' ' + e.name,
          desc: e.desc + ' ' + e.detail,
          action: '/' + (e.id === 'trex' ? 'trex' : e.id === 'tiktaalik' ? 'fish' : e.id === 'first_mammal' ? 'mammal' : e.id === 'pangaea' ? 'pangaea' : e.id === 'cambrian' ? 'cambrian' : 'time'),
        });
      });
    }

    // 3. Investigation entities (from explorer)
    if (window._chipmunkExplorer && window._chipmunkExplorer.entities) {
      try {
        var entities = window._chipmunkExplorer.entities();
        if (entities && entities.length) {
          entities.slice(0, 200).forEach(function(ent) {
            _searchIndex.push({
              type: 'entity',
              id: ent.id || ent.name,
              title: ent.name || ent.id,
              desc: (ent.type || '') + ' · ' + (ent.edges || 0) + ' edges' + (ent.confidence ? ' · ' + ent.confidence + '% confidence' : ''),
              action: '/explore ' + (ent.id || ent.name),
            });
          });
        }
      } catch(e) {}
    }

    // 4. Surfaces
    var surfaces = [
      { id: 'tuebor', name: '⚔ tuebor', desc: 'I will defend. The investigation evidence.' },
      { id: 'detroit', name: '📋 detroit', desc: 'Evidence database. Court filings. Convictions.' },
      { id: 'signal', name: '📡 signal', desc: 'Observatory. Traffic patterns. Signal routing.' },
      { id: 'hypothesis', name: '🔬 hypothesis', desc: 'Research hypotheses. What the data suggests.' },
      { id: 'thesis', name: '📚 thesis', desc: 'Research papers. Methodology. Analysis.' },
      { id: 'clutch', name: '🔍 clutch', desc: 'Investigation tool. Follow the connections.' },
      { id: 'sporeprint', name: '🧫 sporePrint', desc: 'Science catalogue. Methodology docs.' },
      { id: 'gorilla', name: '🦍 gorilla', desc: 'Verification. Independent checking.' },
      { id: 'hud', name: '🖥 hud', desc: 'This. The observation surface. You are here.' },
    ];
    surfaces.forEach(function(s) {
      _searchIndex.push({
        type: 'surface',
        id: s.id,
        title: s.name,
        desc: s.desc,
        action: 'https://' + s.id + '.primals.eco',
      });
    });

    // 5. Live data keywords
    var cc = window._chipmunkCore;
    if (cc && cc.cache) {
      if (cc.cache.dashboard) {
        var dash = cc.cache.dashboard;
        _searchIndex.push({
          type: 'live',
          id: 'dashboard-rps',
          title: 'Dashboard — ' + (dash.rps || 0).toFixed(1) + ' req/s',
          desc: 'Fleet: ' + (dash.fleet_ips || 0) + ' IPs · Human: ' + (dash.human_ips || 0) + ' IPs · ' + (dash.fleet_pct || 0).toFixed(0) + '% fleet',
          action: '/scan',
        });
        if (dash.selectivity !== undefined) {
          _searchIndex.push({
            type: 'live',
            id: 'membrane-selectivity',
            title: 'Membrane selectivity ' + (dash.selectivity || 0).toFixed(0) + '%',
            desc: 'Opacity ' + (dash.opacity || 0).toFixed(1) + '% · Anderson modes active · the membrane filters',
            action: '/wall',
          });
        }
      }
      if (cc.cache.braid && cc.cache.braid.braids) {
        var braids = cc.cache.braid.braids;
        var growing = braids.filter(function(b) { return b.trend === 'growing'; });
        if (growing.length > 0) {
          _searchIndex.push({
            type: 'live',
            id: 'braids-growing',
            title: growing.length + ' growing braids',
            desc: growing.slice(0, 3).map(function(b) { return b.from + ' → ' + b.to; }).join(', '),
            action: '/braids',
          });
        }
      }
      if (cc.cache.human && cc.cache.human.energy) {
        var he = cc.cache.human.energy;
        _searchIndex.push({
          type: 'live',
          id: 'humans-now',
          title: (he.total_sessions || 0) + ' humans on the membrane',
          desc: 'S/N ' + (he.signal_to_noise || 0).toFixed(0) + ' · breadth ' + (he.avg_breadth || 0).toFixed(1) + ' · multi-host ' + (he.multi_host_sessions || 0),
          action: '/humans',
        });
      }
    }

    // 6. Bookmarks
    getBookmarks().forEach(function(b) {
      _searchIndex.push({
        type: 'bookmark',
        id: b.name,
        title: '\u{1F516} ' + b.name,
        desc: (b.note || 'saved ' + b.created) + (b.temporal ? ' · ' + b.temporal.epochName : ''),
        action: '/goto ' + b.name,
      });
    });

    return _searchIndex;
  }

  function search(query) {
    if (!_searchIndex) buildSearchIndex();
    var q = query.toLowerCase().trim();
    if (!q) return [];

    var results = [];
    var terms = q.split(/\s+/);

    _searchIndex.forEach(function(item) {
      var text = (item.title + ' ' + item.desc).toLowerCase();
      var score = 0;
      var allMatch = true;
      terms.forEach(function(term) {
        if (text.indexOf(term) >= 0) {
          score += 10;
          // Boost title matches
          if (item.title.toLowerCase().indexOf(term) >= 0) score += 20;
          // Boost exact match
          if (item.id === q || item.title.toLowerCase() === q) score += 50;
        } else {
          allMatch = false;
        }
      });
      if (allMatch && score > 0) {
        results.push({ item: item, score: score });
      }
    });

    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 20).map(function(r) { return r.item; });
  }

  function renderSearch(query) {
    var results = search(query);
    if (results.length === 0) {
      return '<span class="dim">no results for "' + escapeHtml(query) + '"</span>';
    }

    var typeColors = {
      command: '#3fb950',
      epoch: '#e85d3a',
      entity: '#58a6ff',
      surface: '#d2a8ff',
      bookmark: '#f0e68c',
    };

    var lines = ['<span class="good">\u{1F50D} ' + results.length + ' results for "' + escapeHtml(query) + '"</span>'];
    results.forEach(function(r) {
      var color = typeColors[r.type] || '#c9d1d9';
      var actionAttr = '';
      if (r.action && r.action.charAt(0) === '/') {
        actionAttr = ' onclick="document.querySelector(\'#chipmunk-input\').value=\'' + r.action.replace(/'/g, "\\'") + '\';document.querySelector(\'#chipmunk-input\').dispatchEvent(new KeyboardEvent(\'keydown\',{key:\'Enter\'}))" style="cursor:pointer;color:' + color + '"';
      } else if (r.action && r.action.indexOf('http') === 0) {
        actionAttr = ' onclick="window.open(\'' + r.action + '\',\'_blank\')" style="cursor:pointer;color:' + color + '"';
      }
      lines.push(
        '<span' + actionAttr + '>' +
        '<span style="color:' + color + ';font-weight:bold">' + escapeHtml(r.title) + '</span>' +
        ' <span style="color:#484f58;font-size:0.85em">[' + r.type + ']</span>' +
        '\n  <span class="dim">' + escapeHtml(r.desc).substring(0, 120) + '</span>' +
        '</span>'
      );
    });
    return lines.join('\n');
  }

  // ═══ CHIPMUNK LEARNING PERSISTENCE ═══

  function saveLearning() {
    var cc = window._chipmunkCore;
    if (!cc || !cc.learning) return;
    var learn = cc.learning;
    writeJSON(LEARNING_KEY, {
      ts: Date.now(),
      selfRatio: learn.selfRatio,
      nonSelfRatio: learn.nonSelfRatio,
      partialRatio: learn.partialRatio,
      nullRatio: learn.nullRatio,
      braidMemory: learn.braidMemory || {},
      orbitPatterns: learn.orbitPatterns || [],
      sortedTypes: learn.sortedTypes || {},
      observations: learn.observations || 0,
    });
  }

  function restoreLearning() {
    var cc = window._chipmunkCore;
    if (!cc || !cc.learning) return false;
    var saved = readJSON(LEARNING_KEY, null);
    if (!saved) return false;

    cc.learning.selfRatio = saved.selfRatio || 0;
    cc.learning.nonSelfRatio = saved.nonSelfRatio || 0;
    cc.learning.partialRatio = saved.partialRatio || 0;
    cc.learning.nullRatio = saved.nullRatio || 0;
    if (saved.braidMemory) cc.learning.braidMemory = saved.braidMemory;
    if (saved.orbitPatterns) cc.learning.orbitPatterns = saved.orbitPatterns;
    if (saved.sortedTypes) cc.learning.sortedTypes = saved.sortedTypes;
    cc.learning.observations = saved.observations || 0;
    return true;
  }

  // ═══ AUTO-SAVE — periodically persist learning ═══

  function startAutoSave() {
    setInterval(function() {
      saveLearning();
    }, 30000); // Every 30 seconds
  }

  // ═══ URL HASH RESTORE ═══

  function checkHashRestore() {
    var hash = location.hash;
    if (hash && hash.indexOf('#stash=') === 0) {
      try {
        var data = JSON.parse(atob(hash.substring(7)));
        // Delay to let systems initialize
        setTimeout(function() {
          if (data.t && window._temporalWindow) {
            window._temporalWindow.activate();
            // Navigate to epoch
            var epochs = window._temporalWindow.epochs();
            for (var i = 0; i < epochs.length; i++) {
              if (epochs[i].id === data.t) break;
            }
          }
          if (data.g && window._cosmicGameplay) {
            window._cosmicGameplay.goToScene(data.g);
          }
        }, 2000);
      } catch(e) {}
    }
  }

  // ═══ SUGGESTION ENGINE — what haven't you tried? ═══

  function getSuggestion() {
    var untried = getUntriedCommands();
    if (untried.length === 0) return null;

    // Weighted suggestions — favor more interesting ones
    var interesting = ['deep', 'time', 'bounce', 'canvas', 'cosmos', 'tunnel', 'listen', 'dinosaurs', 'pangaea', 'fish'];
    var pick = interesting.filter(function(c) { return untried.indexOf(c) >= 0; });
    if (pick.length > 0) {
      return pick[Math.floor(Math.random() * pick.length)];
    }
    return untried[Math.floor(Math.random() * untried.length)];
  }

  function renderSuggestion() {
    var cmd = getSuggestion();
    if (!cmd) return '<span class="dim">you\'ve tried everything. remarkable.</span>';

    // Find description
    if (!_searchIndex) buildSearchIndex();
    var desc = '';
    for (var i = 0; i < _searchIndex.length; i++) {
      if (_searchIndex[i].id === cmd && _searchIndex[i].type === 'command') {
        desc = _searchIndex[i].desc;
        break;
      }
    }
    var untried = getUntriedCommands();
    return '<span style="color:#d2a8ff">\u2728 have you tried <b>/' + cmd + '</b>?</span>' +
      (desc ? '\n<span class="dim">' + desc + '</span>' : '') +
      '\n<span style="color:#484f58">' + untried.length + ' commands still unexplored</span>';
  }

  // ═══ HELPERS ═══

  function dateStamp() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      '_' + pad2(d.getHours()) + pad2(d.getMinutes());
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function downloadBlob(dataUrl, filename) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { document.body.removeChild(a); }, 100);
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ═══ INIT ═══

  // Restore learning from previous session
  setTimeout(function() {
    var restored = restoreLearning();
    if (restored) {
      console.log('[stash] learning restored from previous session');
    }
    checkHashRestore();
    startAutoSave();
    // Rebuild search index after systems load
    setTimeout(buildSearchIndex, 5000);
  }, 3000);

  // ═══ PUBLIC API ═══

  window._hudStash = {
    // State
    capture: captureState,
    restore: restoreState,

    // Bookmarks
    bookmark: addBookmark,
    bookmarks: getBookmarks,
    renderBookmarks: renderBookmarks,
    removeBookmark: removeBookmark,
    goto: function(name) {
      var bookmarks = getBookmarks();
      var found = bookmarks.filter(function(b) { return b.name === name; })[0];
      if (found) {
        var restored = restoreState(found);
        return { found: true, restored: restored, bookmark: found };
      }
      return { found: false };
    },

    // Notes
    addNote: addNote,
    notes: getNotes,
    renderNotes: renderNotes,

    // Share
    screenshot: shareScreenshot,
    shareLink: shareLink,
    shareEmbed: shareEmbed,

    // Search
    search: search,
    renderSearch: renderSearch,
    rebuildIndex: buildSearchIndex,

    // History
    addHistory: addHistory,
    getHistory: getHistory,
    getUntriedCommands: getUntriedCommands,

    // Suggestions
    suggest: getSuggestion,
    renderSuggestion: renderSuggestion,

    // Learning
    saveLearning: saveLearning,
    restoreLearning: restoreLearning,
  };
})();
