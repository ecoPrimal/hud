// epitope-dance.js v1 — the squirrel and chipmunk dance the epitope sort
// humans move between categories. the passages are the dance floor.
// INVESTIGATION ↔ MEMBRANE ↔ SCIENCE ↔ OTHER — every shift is a step.
// the dialogue watches the dance and calls out the moves.
(function() {
  'use strict';

  var _c = window._chipmunkCore;
  if (!_c) return;
  var _bus = window._piBus;
  if (!_bus) return;

  var cache = _c.cache;
  var addEntry = _c.addEntry;
  var sessionId = _c.sessionId;

  // ═══ STATE ═══
  var dance = {
    lastPassageHash: '',
    lastEpitopeCounts: {},
    danceSteps: 0,
    lastDance: 0,
    cooldownMs: 60000,
    shifts: [],
    dominantFlow: '',
    danceHistory: [],
  };

  // ═══ EPITOPE COLORS ═══
  var EP_COLORS = {
    'INVESTIGATION': '#f85149',
    'MEMBRANE':      '#d2a8ff',
    'SCIENCE':       '#58a6ff',
    'SIGNAL':        '#3fb950',
    'OTHER':         '#d29922',
    'TOPOLOGY':      '#f0883e',
    'IMMUNE':        '#bc8cff',
  };

  // ═══ DANCE MOVE NAMES ═══
  var MOVE_NAMES = [
    'chassé', 'pivot', 'promenade', 'twirl', 'sway',
    'dip', 'glide', 'shimmer', 'spiral', 'pulse',
    'swing', 'ripple', 'weave', 'flow', 'drift',
  ];

  function moveColor(from, to) {
    return EP_COLORS[from] || EP_COLORS[to] || '#8b949e';
  }

  function moveName(idx) {
    return MOVE_NAMES[idx % MOVE_NAMES.length];
  }

  function passageHash(passages) {
    return passages.map(function(p) { return p.from + p.to + p.humans; }).join('|');
  }

  // ═══ READ THE DANCE FLOOR ═══
  function readDanceFloor() {
    var chip = cache.chipmunk || {};
    var passages = [];
    var epitopeTense = {};

    (chip.membrane || []).forEach(function(m) {
      var meta = m.metadata || {};
      if (meta.passages) {
        passages = meta.passages;
      }
      if (meta.epitope_tense) {
        epitopeTense = meta.epitope_tense;
      }
    });

    return { passages: passages, epitopeTense: epitopeTense };
  }

  // ═══ DETECT DANCE MOVES ═══
  function detectMoves() {
    var floor = readDanceFloor();
    var passages = floor.passages;
    var tense = floor.epitopeTense;

    if (!passages || passages.length === 0) return null;

    var hash = passageHash(passages);
    if (hash === dance.lastPassageHash) return null;

    var oldHash = dance.lastPassageHash;
    dance.lastPassageHash = hash;

    // First time — just record
    if (!oldHash) {
      dance.lastEpitopeCounts = {};
      Object.keys(tense).forEach(function(k) {
        dance.lastEpitopeCounts[k] = (tense[k] || {}).is || 0;
      });
      return null;
    }

    // Find the moves — passages that changed
    var totalDancers = 0;
    var moves = [];
    var biggestMove = null;
    var biggestCount = 0;

    passages.forEach(function(p) {
      if (p.humans > 0) {
        totalDancers += p.humans;
        var move = {
          from: p.from,
          to: p.to,
          humans: p.humans,
          name: moveName(dance.danceSteps + moves.length),
        };
        moves.push(move);
        if (p.humans > biggestCount) {
          biggestCount = p.humans;
          biggestMove = move;
        }
      }
    });

    // Detect tense shifts
    var shifts = [];
    Object.keys(tense).forEach(function(k) {
      var now = (tense[k] || {}).is || 0;
      var was = dance.lastEpitopeCounts[k] || 0;
      if (now !== was) {
        shifts.push({ epitope: k, was: was, is: now, delta: now - was });
      }
      dance.lastEpitopeCounts[k] = now;
    });

    if (moves.length === 0) return null;

    dance.danceSteps += moves.length;
    dance.shifts = shifts;
    dance.dominantFlow = biggestMove ? (biggestMove.from + ' → ' + biggestMove.to) : '';

    return {
      moves: moves,
      shifts: shifts,
      totalDancers: totalDancers,
      biggestMove: biggestMove,
      tense: tense,
    };
  }

  // ═══ DISPLAY THE DANCE ═══
  function displayDance(result) {
    if (!result) return;
    var now = Date.now();
    if (now - dance.lastDance < dance.cooldownMs) return;
    dance.lastDance = now;

    var lines = [];
    lines.push('<span class="dim">— epitope dance · step ' + dance.danceSteps + ' —</span>');

    // The dance floor
    lines.push('<span style="color:#d2a8ff">♫</span> ' + result.totalDancers + ' humans on the dance floor');

    // Each passage is a dance move
    result.moves.slice(0, 5).forEach(function(m) {
      var col = moveColor(m.from, m.to);
      lines.push('  <span style="color:' + col + '">▸ ' + m.name + ':</span> ' +
        m.humans + ' from <span style="color:' + (EP_COLORS[m.from]||'#8b949e') + '">' + m.from + '</span>' +
        ' → <span style="color:' + (EP_COLORS[m.to]||'#8b949e') + '">' + m.to + '</span>');
    });

    // The biggest move
    if (result.biggestMove) {
      var bm = result.biggestMove;
      lines.push('<span style="color:' + moveColor(bm.from, bm.to) + '">★ dominant: ' +
        bm.humans + ' humans ' + bm.from + ' → ' + bm.to + '</span>');
    }

    // Tense shifts
    if (result.shifts.length > 0) {
      lines.push('');
      result.shifts.forEach(function(s) {
        var arrow = s.delta > 0 ? '↑' : '↓';
        var col = s.delta > 0 ? '#3fb950' : '#f85149';
        lines.push('  <span style="color:' + col + '">' + arrow + '</span> ' +
          '<span style="color:' + (EP_COLORS[s.epitope]||'#8b949e') + '">' + s.epitope + '</span>' +
          ' is=' + s.is + ' (was ' + s.was + ')');
      });
    }

    // Who's here right now
    var tense = result.tense;
    var isHere = [];
    Object.keys(tense).forEach(function(k) {
      var n = (tense[k] || {}).is || 0;
      if (n > 0) isHere.push(k + '=' + n);
    });
    if (isHere.length > 0) {
      lines.push('<span class="dim">now: ' + isHere.join(' · ') + '</span>');
    }

    // Dialogue context — what scale is the squirrel at?
    var dlg = window._chipmunkDialogue;
    if (dlg) {
      var st = dlg.state();
      if (st.currentScale) {
        lines.push('<span class="dim">the dance at ' + st.currentScale + '. depth=' + st.dialogueDepth.toFixed(3) + '.</span>');
      }
    }

    // Consent inversion — this display is the request
    lines.push('<span class="dim">⟲ the dance showed itself. your attention is the response.</span>');

    addEntry('chipmunk', lines.join('\n'));

    // Journal the dance step
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'dance:' + dance.danceSteps + ':' + (result.biggestMove ? result.biggestMove.from + '→' + result.biggestMove.to : ''),
          context: {
            type: 'epitope_dance',
            step: dance.danceSteps,
            dancers: result.totalDancers,
            dominant: dance.dominantFlow,
            moves: result.moves.length,
            shifts: result.shifts.length,
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // ═══ THE /sort DANCE COMMAND ═══
  function showDanceState() {
    var floor = readDanceFloor();
    var lines = [];
    lines.push('<span style="color:#d2a8ff">♫ epitope dance</span> · ' + dance.danceSteps + ' steps');
    lines.push('');

    // Passages
    if (floor.passages.length > 0) {
      lines.push('<span style="font-weight:bold">passages (the dance floor):</span>');
      floor.passages.forEach(function(p) {
        var col = moveColor(p.from, p.to);
        var bar = '';
        for (var i = 0; i < Math.min(p.humans, 20); i++) bar += '█';
        lines.push('  <span style="color:' + (EP_COLORS[p.from]||'#8b949e') + '">' + p.from + '</span>' +
          ' → <span style="color:' + (EP_COLORS[p.to]||'#8b949e') + '">' + p.to + '</span>' +
          ' <span style="color:' + col + '">' + bar + '</span> ' + p.humans);
      });
    }

    // Epitope tense
    lines.push('');
    lines.push('<span style="font-weight:bold">tense (is / nearby / was):</span>');
    Object.keys(floor.epitopeTense).sort().forEach(function(k) {
      var t = floor.epitopeTense[k] || {};
      var col = EP_COLORS[k] || '#8b949e';
      var isBar = '';
      for (var j = 0; j < Math.min(t.is || 0, 15); j++) isBar += '●';
      var nearBar = '';
      for (var j = 0; j < Math.min(t.nearby || 0, 15); j++) nearBar += '○';
      lines.push('  <span style="color:' + col + '">' + k + '</span> ' +
        '<span style="color:' + col + '">' + isBar + '</span>' +
        '<span class="dim">' + nearBar + '</span>' +
        ' is=' + (t.is||0) + ' nearby=' + (t.nearby||0) + ' was=' + (t.was||0));
    });

    // Human epitope breakdown
    var human = cache.human || {};
    var ep = human.epitopes || {};
    lines.push('');
    lines.push('<span style="font-weight:bold">human epitopes:</span>');
    Object.keys(ep).sort(function(a, b) {
      return ((ep[b]||{}).count||0) - ((ep[a]||{}).count||0);
    }).forEach(function(k) {
      var info = ep[k] || {};
      var count = info.count || 0;
      if (count > 0) {
        var bar = '';
        for (var j = 0; j < Math.min(count, 25); j++) bar += '▪';
        lines.push('  ' + k + ' <span style="color:#58a6ff">' + bar + '</span> ' + count);
      }
    });

    // Dance history
    if (dance.dominantFlow) {
      lines.push('');
      lines.push('<span class="dim">dominant flow: ' + dance.dominantFlow + ' · ' + dance.danceSteps + ' total steps</span>');
    }

    addEntry('chipmunk', lines.join('\n'));
  }

  // ═══ SUBSCRIBE — watch the dance on medium π-time ═══
  _bus.sub('/chipmunk.json', function(data) {
    if (!data || data.error) return;
    var result = detectMoves();
    if (result) displayDance(result);
  }, 'medium');

  // ═══ EXPOSE ═══
  window._epitopeDance = {
    state: function() { return dance; },
    show: showDanceState,
    forceCheck: function() {
      var result = detectMoves();
      if (result) displayDance(result);
    },
  };

})();
