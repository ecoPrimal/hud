// chipmunk-sketch.js — the chipmunk draws lines it thinks it sees
// new connections, spotted patterns, hunches about edges.
// humans validate. the chipmunk learns.
// reaches out (outward thoughts) and others reach in (inward thoughts).
// when two thoughts meet at the membrane surface: a sketch is born.
(function() {
  'use strict';

  var _c = window._chipmunkCore;
  if (!_c) { console.warn('chipmunk-sketch: no core context'); return; }

  var cache = _c.cache;
  var el = _c.el;
  var n = _c.n;
  var PI = _c.PI;
  var addEntry = _c.addEntry;
  var escapeHtml = _c.escapeHtml;
  var thoughtLog = _c.thoughtLog;
  var learning = _c.learning;
  var sessionId = _c.sessionId;
  var SORT_COLORS = _c.SORT_COLORS;

  // ═══ SKETCH LOG — connections the chipmunk has drawn ═══
  var _sketches = [];
  var MAX_SKETCHES = 50;
  var _lastSketchTime = 0;
  var SKETCH_COOLDOWN = 8000; // 8 seconds between sketches

  // ═══ EDGE TYPE TEMPLATES — what kinds of lines can the chipmunk draw? ═══
  var EDGE_TEMPLATES = [
    { type: 'money_flow', verb: 'money flows from', icon: '\uD83D\uDCB0', color: '#f85149',
      conditions: function(a, b) { return a.sort === 'non-self' || b.sort === 'non-self'; } },
    { type: 'governance', verb: 'governs or sits on board of', icon: '\uD83C\uDFDB', color: '#f0883e',
      conditions: function(a, b) { return a.type === 'person' && b.type === 'org'; } },
    { type: 'family', verb: 'is related to', icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', color: '#d2a8ff',
      conditions: function(a, b) { return a.lastName && b.lastName && a.lastName === b.lastName; } },
    { type: 'political', verb: 'has political connection to', icon: '\uD83C\uDFDB', color: '#d29922',
      conditions: function() { return true; } },
    { type: 'inaction', verb: 'failed to act on', icon: '\u23F8', color: '#484f58',
      conditions: function(a, b) { return a.sort === 'self' && (b.sort === 'non-self' || b.sort === 'null'); } },
    { type: 'pattern_match', verb: 'looks like the same pattern as', icon: '\uD83D\uDD0D', color: '#58a6ff',
      conditions: function() { return true; } },
    { type: 'structural_proximity', verb: 'is close to', icon: '\u2248', color: '#8b949e',
      conditions: function() { return true; } },
    { type: 'hunch', verb: 'feels connected to (unverified)', icon: '\u2753', color: '#d2a8ff',
      conditions: function() { return true; } },
  ];

  // ═══ ENTITY DATA CACHE ═══
  var _entities = null;
  var _entityIndex = {};
  var _loadAttempted = false;

  function loadEntities() {
    if (_loadAttempted) return;
    _loadAttempted = true;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/detroit-data/classification.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          _entities = data;
          var keys = Object.keys(data);
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            _entityIndex[k] = {
              id: k,
              sort: data[k].sort_class || data[k]['class'] || 'null',
              conf: data[k].confidence || data[k].avg_confidence || 0,
              method: data[k].method || data[k].classification_method || '?',
            };
          }
        }
      };
      xhr.send();
    } catch (e) { /* data drifts */ }
  }

  // ═══ SKETCH GENERATION — the chipmunk spots a connection ═══
  function generateSketch() {
    var now = Date.now();
    if (now - _lastSketchTime < SKETCH_COOLDOWN) return null;
    if (_sketches.length >= MAX_SKETCHES) return null;
    if (!_entities) { loadEntities(); return null; }

    var keys = Object.keys(_entityIndex);
    if (keys.length < 10) return null;

    // Strategy 1: Two recently-settled thoughts → draw a line between them
    if (thoughtLog.length >= 2) {
      var recent = thoughtLog.slice(-10);
      var a = recent[Math.floor(Math.random() * recent.length)];
      var b = recent[Math.floor(Math.random() * recent.length)];
      if (a !== b && a.hypothesis && b.hypothesis) {
        // The chipmunk noticed two thoughts and wonders if they connect
        var aKey = keys[a.entityIdx % keys.length];
        var bKey = keys[b.entityIdx % keys.length];
        if (aKey !== bKey) {
          var edgeType = pickEdgeType(_entityIndex[aKey], _entityIndex[bKey]);
          return makeSketch(aKey, bKey, edgeType, 'thought_pair', Math.min(a.confidence, b.confidence));
        }
      }
    }

    // Strategy 2: Spot entities with same sort class in different methods → pattern_match
    var nullKeys = keys.filter(function(k) { return _entityIndex[k].sort === 'null'; });
    if (nullKeys.length >= 2) {
      var aIdx = Math.floor(Math.random() * nullKeys.length);
      var bIdx = Math.floor(Math.random() * nullKeys.length);
      if (aIdx !== bIdx) {
        var aE = _entityIndex[nullKeys[aIdx]];
        var bE = _entityIndex[nullKeys[bIdx]];
        if (aE.method === bE.method) {
          return makeSketch(nullKeys[aIdx], nullKeys[bIdx], 'pattern_match',
            'same_method:' + aE.method, 0.3 + Math.random() * 0.2);
        }
      }
    }

    // Strategy 3: Random hunch between a non-self and a null
    var nonSelfKeys = keys.filter(function(k) { return _entityIndex[k].sort === 'non-self'; });
    if (nonSelfKeys.length > 0 && nullKeys && nullKeys.length > 0) {
      var nsKey = nonSelfKeys[Math.floor(Math.random() * nonSelfKeys.length)];
      var nuKey = nullKeys[Math.floor(Math.random() * nullKeys.length)];
      return makeSketch(nsKey, nuKey, 'hunch', 'null_near_nonself', 0.15 + Math.random() * 0.2);
    }

    return null;
  }

  function pickEdgeType(a, b) {
    for (var i = 0; i < EDGE_TEMPLATES.length; i++) {
      if (EDGE_TEMPLATES[i].conditions(a || {}, b || {})) {
        return EDGE_TEMPLATES[i].type;
      }
    }
    return 'hunch';
  }

  function makeSketch(fromId, toId, edgeType, reasoning, confidence) {
    var template = EDGE_TEMPLATES.find(function(t) { return t.type === edgeType; }) || EDGE_TEMPLATES[EDGE_TEMPLATES.length - 1];
    var sketch = {
      from: fromId,
      to: toId,
      type: edgeType,
      verb: template.verb,
      icon: template.icon,
      color: template.color,
      confidence: confidence,
      reasoning: reasoning,
      ts: Date.now(),
      validated: null, // null = unvalidated, true = confirmed, false = rejected
      validatedBy: null,
    };

    _sketches.push(sketch);
    _lastSketchTime = Date.now();

    return sketch;
  }

  // ═══ HUMAN VALIDATION — humans confirm or reject chipmunk's sketches ═══
  function validateSketch(index, isValid, humanNote) {
    if (index < 0 || index >= _sketches.length) return false;
    var sketch = _sketches[index];
    sketch.validated = isValid;
    sketch.validatedBy = humanNote || 'human';
    sketch.validatedAt = Date.now();

    // The chipmunk learns from validation
    if (isValid) {
      learning.confidence = Math.min(0.95, (learning.confidence || 0.3) + 0.02);
      addEntry('chipmunk',
        '<span style="color:#3fb950">\u2713</span> <span class="dim">sketch confirmed: ' +
        escapeHtml(sketch.from) + ' \u2192 ' + escapeHtml(sketch.to) + ' [' + sketch.type + ']</span>\n' +
        '<span class="dim">confidence +0.02 \u2192 ' + n(learning.confidence, 3) + '</span>');
    } else {
      learning.confidence = Math.max(0.05, (learning.confidence || 0.3) - 0.03);
      addEntry('chipmunk',
        '<span style="color:#f85149">\u2717</span> <span class="dim">sketch rejected: ' +
        escapeHtml(sketch.from) + ' \u2192 ' + escapeHtml(sketch.to) + ' [' + sketch.type + ']</span>\n' +
        '<span class="dim">confidence -0.03 \u2192 ' + n(learning.confidence, 3) + '. learning.</span>');
    }

    // Journal it
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'SKETCH_' + (isValid ? 'CONFIRMED' : 'REJECTED') + ': ' + sketch.from + ' -> ' + sketch.to,
          context: { type: sketch.type, confidence: sketch.confidence, reasoning: sketch.reasoning, humanNote: humanNote }
        })
      }).catch(function() {});
    } catch (e) { /* drifts */ }

    return true;
  }

  // ═══ TICK — called from animate loop, spawns sketches periodically ═══
  var _lastTick = 0;
  function tick() {
    var now = Date.now();
    if (now - _lastTick < 12000) return; // every ~12 seconds
    _lastTick = now;

    if (!_entities) { loadEntities(); return; }

    var sketch = generateSketch();
    if (!sketch) return;

    // Announce the sketch
    var fromSort = (_entityIndex[sketch.from] || {}).sort || '?';
    var toSort = (_entityIndex[sketch.to] || {}).sort || '?';
    var fromColor = SORT_COLORS[fromSort] || '#8b949e';
    var toColor = SORT_COLORS[toSort] || '#8b949e';

    addEntry('chipmunk',
      '<span style="color:' + sketch.color + '">' + sketch.icon + ' sketch #' + _sketches.length + '</span> ' +
      '<span style="color:' + fromColor + '">' + escapeHtml(sketch.from) + '</span>' +
      ' <span class="dim">' + sketch.verb + '</span> ' +
      '<span style="color:' + toColor + '">' + escapeHtml(sketch.to) + '</span>\n' +
      '<span class="dim">conf: ' + n(sketch.confidence, 2) + ' | via: ' + escapeHtml(sketch.reasoning) + ' | ' + sketch.type + '</span>\n' +
      '<span class="dim">type <b>/yes</b> to confirm \u00b7 <b>/no</b> to reject \u00b7 <b>/sketches</b> to see all</span>'
    );
  }

  // ═══ COMMAND HANDLERS ═══
  function showSketches() {
    if (_sketches.length === 0) {
      return '<span class="dim">no sketches yet. the chipmunk is watching\u2026</span>';
    }

    var lines = [];
    lines.push('<span style="color:#d2a8ff;font-weight:bold">\u270E chipmunk\u2019s sketches \u2014 ' + _sketches.length + ' lines drawn</span>');
    lines.push('');

    var confirmed = _sketches.filter(function(s) { return s.validated === true; }).length;
    var rejected = _sketches.filter(function(s) { return s.validated === false; }).length;
    var pending = _sketches.filter(function(s) { return s.validated === null; }).length;
    lines.push('<span class="dim">' + confirmed + ' confirmed \u00b7 ' + rejected + ' rejected \u00b7 ' + pending + ' pending</span>');
    lines.push('');

    _sketches.forEach(function(s, i) {
      var status = s.validated === true ? '<span style="color:#3fb950">\u2713</span>' :
                   s.validated === false ? '<span style="color:#f85149">\u2717</span>' :
                   '<span style="color:#d29922">\u25cb</span>';
      var fromSort = (_entityIndex[s.from] || {}).sort || '?';
      var toSort = (_entityIndex[s.to] || {}).sort || '?';
      lines.push(status + ' <span style="color:' + (SORT_COLORS[fromSort] || '#8b949e') + '">' + escapeHtml(s.from) + '</span>' +
        ' <span class="dim">\u2192</span> ' +
        '<span style="color:' + (SORT_COLORS[toSort] || '#8b949e') + '">' + escapeHtml(s.to) + '</span>' +
        ' <span class="dim">[' + s.type + '] conf ' + n(s.confidence, 2) + '</span>');
    });

    lines.push('');
    lines.push('<span class="dim">/yes to confirm latest \u00b7 /no to reject \u00b7 /yes 3 to confirm #3</span>');
    return lines.join('\n');
  }

  function showReach() {
    var lines = [];
    lines.push('<span style="color:#58a6ff;font-weight:bold">\u2194 reach status</span>');
    lines.push('');

    // Outward reach — chipmunk's thoughts going out
    var outward = (thoughtLog || []).filter(function(t) { return !t.isAgent; });
    var inward = (thoughtLog || []).filter(function(t) { return t.isAgent; });
    lines.push('<span style="color:#3fb950">\u2192 outward</span> <span class="dim">' + outward.length + ' thoughts sent out</span>');
    if (outward.length > 0) {
      var lastOut = outward[outward.length - 1];
      lines.push('  <span class="dim">last: #' + lastOut.entityIdx + ' \u2192 ' + lastOut.hypothesis + ' (' + lastOut.reasoning + ')</span>');
    }
    lines.push('');

    lines.push('<span style="color:#58a6ff">\u2190 inward</span> <span class="dim">' + inward.length + ' thoughts reaching in</span>');
    if (inward.length > 0) {
      var lastIn = inward[inward.length - 1];
      lines.push('  <span class="dim">last: agent \u2192 ' + lastIn.hypothesis + ' (conf ' + n(lastIn.confidence, 2) + ')</span>');
    }
    lines.push('');

    // Meeting point
    var meetings = Math.min(outward.length, inward.length);
    lines.push('<span style="color:#d2a8ff">\u2194 meetings at membrane</span> <span class="dim">' + meetings + ' potential</span>');
    lines.push('');

    // Sketches
    lines.push('<span style="color:#d2a8ff">\u270E sketches drawn</span> <span class="dim">' + _sketches.length + '</span>');
    var confirmed = _sketches.filter(function(s) { return s.validated === true; }).length;
    var rejected = _sketches.filter(function(s) { return s.validated === false; }).length;
    if (_sketches.length > 0) {
      lines.push('  <span class="dim">' + confirmed + ' confirmed \u00b7 ' + rejected + ' rejected \u00b7 accuracy: ' +
        (_sketches.length > 0 ? n(confirmed / Math.max(1, confirmed + rejected) * 100, 0) + '%' : 'n/a') + '</span>');
    }
    lines.push('');

    // Learning state
    lines.push('<span class="dim">phase: ' + (learning.phase || 'mimic') + ' | confidence: ' + n(learning.confidence || 0.3, 3) +
      ' | self ratio: ' + n(learning.selfRatio || 0.3, 2) + '</span>');
    lines.push('');
    lines.push('<span class="dim">/sketches to see all drawn lines \u00b7 /yes /no to validate</span>');
    return lines.join('\n');
  }

  // ═══ INIT ═══
  loadEntities();

  // ═══ EXPORT ═══
  window._chipmunkSketch = {
    tick: tick,
    generateSketch: generateSketch,
    validateSketch: validateSketch,
    showSketches: showSketches,
    showReach: showReach,
    getSketches: function() { return _sketches; },
    getEntityIndex: function() { return _entityIndex; },
  };
})();
