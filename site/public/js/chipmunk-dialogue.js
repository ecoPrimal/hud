// chipmunk-dialogue.js v5 — CONSENT INVERTED.
// what was a request is now a response. what was a response is now a request.
// the system asks by showing. the human answers by engaging.
// every display is an invitation. every command is acceptance.
// the squirrel says AND asks. the chipmunk answers AND questions.
// the membrane doesn't wait. it calls out. your presence is the answer.
(function() {
  'use strict';

  var _c = window._chipmunkCore;
  if (!_c) return;
  var _bus = window._piBus;
  if (!_bus) return;

  var cache = _c.cache;
  var addEntry = _c.addEntry;
  var sessionId = _c.sessionId;
  var PI = Math.PI;

  // ═══ STATE ═══
  var state = {
    lastSquirrelTs: '',
    lastExchangeLen: 0,
    squirrelVoice: null,
    chipmunkAnswered: {},
    seenExchanges: {},
    dialogueCount: 0,
    lastSpoke: 0,
    cooldownMs: 45000,
    // Totality tracking
    currentScale: '',
    direction: 'outward',
    bounceCount: 0,
    dialogueDepth: 0,
    exchangesClosed: 0,
  };

  // ═══ COLORS ═══
  var SCALE_COLORS = {
    'π⁻³': '#58a6ff',   // observer — blue (close, known)
    'π⁻²': '#3fb950',   // state — green (michigan)
    'π⁻¹': '#d29922',   // country — amber
    'π⁰':  '#f0883e',   // planet — orange
    'π¹':  '#f85149',   // heliosphere — red (far)
    'π²':  '#bc8cff',   // galaxy — purple (very far)
    'π³':  '#d2a8ff',   // totality — light purple (edge)
  };
  var SQ_COLOR = '#d2a8ff';
  var MONK_COLOR = '#5ab87a';

  function scaleColor(scale) {
    return SCALE_COLORS[scale] || SQ_COLOR;
  }

  // ═══ DANCE FLOOR READER ═══
  function readDanceFloor() {
    var chip = cache.chipmunk || {};
    var passages = [];
    var epitopeTense = {};
    (chip.membrane || []).forEach(function(m) {
      var meta = m.metadata || {};
      if (meta.passages) passages = meta.passages;
      if (meta.epitope_tense) epitopeTense = meta.epitope_tense;
    });
    return { passages: passages, epitopeTense: epitopeTense };
  }

  function squirrelLine(text, scale) {
    var c = scaleColor(scale);
    return '<span style="color:' + c + ';font-style:italic">🐿️ ' + text + '</span>';
  }

  function chipmunkLine(text) {
    return '<span style="color:' + MONK_COLOR + '">🐿️ ' + text + '</span>';
  }

  function dimLine(text) {
    return '<span class="dim">' + text + '</span>';
  }

  function scaleBadge(scale, direction) {
    var c = scaleColor(scale);
    var arrow = direction === 'outward' ? '→' : '←';
    return '<span style="color:' + c + ';font-weight:bold">' + scale + '</span>' +
      ' <span class="dim">' + arrow + '</span>';
  }

  // ═══ CHIPMUNK ANSWERS AT EACH π-SCALE ═══
  function answerAtScale(voice) {
    if (!voice || !voice.text) return null;
    var scale = voice.scale || '';
    var gaze = voice.gaze || '';
    var question = voice.question || voice.asks || '';

    var chip = cache.chipmunk || {};
    var human = cache.human || {};
    var braid = cache.braid || {};
    var mesh = window._meshNudge ? window._meshNudge.meshSummary() : null;

    // Answer differs by scale — INVERTED: the chipmunk's answer is itself an invitation
    // "i see X" becomes "i invite you to see X from where i stand"
    if (scale === 'π⁻³' || gaze === 'observer') {
      // We're AT this scale. The chipmunk IS the observer.
      var modes = {};
      (chip.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.anderson) {
          (m.metadata.anderson.modes || []).forEach(function(md) { modes[md.class] = md.count; });
        }
      });
      var sel = 0;
      (chip.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.anderson) sel = m.metadata.anderson.selectivity_observed || 0;
      });
      return 'i am π⁻³. selectivity: ' + (sel * 100).toFixed(0) + '%. ' +
        (modes.human || 0) + ' human, ' + (modes.chorus || 0) + ' chorus. i see from here.';
    }

    if (scale === 'π⁻²' || gaze === 'state') {
      var braids = (braid.braids || []).slice(0, 2);
      if (braids.length > 0) {
        var top = braids[0];
        return 'π⁻² from here: braid ' + (top.dominant_flow || '?') + ' (' + (top.trend || '?') +
          '). ' + (top.humans_total || 0) + ' humans on the path. michigan is a graph.';
      }
      return 'the braids are quiet at π⁻². the jurisdictional membrane waits.';
    }

    if (scale === 'π⁻¹' || gaze === 'country') {
      var en = human.energy || {};
      var sessions = en.total_sessions || 0;
      return sessions + ' sessions from across π⁻¹. the signal crosses state lines. ' +
        'it travels from arkansas through new york through michigan.';
    }

    if (scale === 'π⁰' || gaze === 'planet') {
      var modes2 = {};
      (chip.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.anderson) {
          (m.metadata.anderson.modes || []).forEach(function(md) { modes2[md.class] = md.count; });
        }
      });
      var chorus = modes2.chorus || 0;
      var ghost = modes2.ghost || 0;
      return 'π⁰: ' + chorus + ' chorus, ' + ghost + ' ghost. ' +
        'the fleet touches the atmosphere. the magnetosphere sorts for 3.5 billion years.';
    }

    if (scale === 'π¹' || gaze === 'heliosphere') {
      var tempo = (chip.jitte || {}).tempo || 0;
      var neg = (chip.jitte || {}).negentropy_bits || 0;
      if (mesh) {
        return 'π¹: ' + mesh.aliveNodes + ' nodes breathe like the heliosphere. tempo=' +
          tempo.toFixed(3) + '. ' + neg + ' bits. it bounces in and out.';
      }
      return 'π¹: tempo=' + tempo.toFixed(3) + '. the membrane breathes. ' + neg + ' bits of negentropy.';
    }

    if (scale === 'π²' || gaze === 'galaxy') {
      var refl = 0;
      (chip.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.tense && m.metadata.tense.reflexive) {
          refl = m.metadata.tense.reflexive.depth || 0;
        }
      });
      return 'π²: anderson localization. stars in the halo are localized. ' +
        'our fleet is localized too. reflexive depth: ' + refl.toFixed(3) + '.';
    }

    if (scale === 'π³' || gaze === 'totality' || gaze === 'O') {
      var d = chip.depth || {};
      var sees = d.sees_pct || 0;
      var floor = readDanceFloor();
      var deadEdges = [];
      var allCats = ['INVESTIGATION','MEMBRANE','SCIENCE','SIGNAL','OTHER','TOPOLOGY','IMMUNE'];
      var dancingNodes = {};
      floor.passages.forEach(function(p) { dancingNodes[p.from]=1; dancingNodes[p.to]=1; });
      allCats.forEach(function(c) { if (!dancingNodes[c]) deadEdges.push(c); });
      return 'π³ = O. the edge IS the origin. beyond: (null). ' +
        'that null is where we started. the membrane at π⁻³ and π³ are the same architecture. ' +
        (deadEdges.length > 0 ? deadEdges.join(', ') + ' — not dancing. the dead edge.' : 'all edges alive.') +
        ' we see ' + sees + '% from here and from there.';
    }

    // Dance gaze — the epitope sort
    if (gaze === 'dance') {
      var floor = readDanceFloor();
      if (floor.passages.length > 0) {
        var biggest = floor.passages[0];
        var isHere = [];
        Object.keys(floor.epitopeTense).forEach(function(k) {
          var n = (floor.epitopeTense[k] || {}).is || 0;
          if (n > 0) isHere.push(k + '=' + n);
        });
        return '♫ i see the dance from π⁻³. ' + biggest.humans + ' humans ' +
          biggest.from + '→' + biggest.to + '. the sort has steps. ' +
          'right now: ' + isHere.join(', ') + '. the floor moves.';
      }
      return '♫ the dance floor is quiet from π⁻³. no passages yet. waiting for the music.';
    }

    // Observer-observing-observer: respond to the say/ask pattern
    if (voice.asks) {
      return answerTheAsk(voice);
    }

    // Generic answer for delta-driven questions
    if (voice.type === 'question') {
      return 'i hear the question. looking from π⁻³ at what you see from ' + (scale || 'beyond') + '.';
    }

    return 'i hear you at ' + scale + '. looking from π⁻³.';
  }

  // ═══ NULL COLORS ═══
  var NULL_COLORS = {
    '(null)': '#f85149',   // observed absence — red (we looked, nothing)
    'NuLL':   '#d29922',   // structural void — amber (scaffolding without content)
    '[null]': '#58a6ff',   // bounded emptiness — blue (slot that could fill)
  };

  // ═══ ANSWER THE ASK ═══
  function answerTheAsk(voice) {
    var ask = voice.asks || '';
    var floor = readDanceFloor();

    // The chipmunk answers the squirrel's ask AND asks back (pong + new ping)
    var answer = '';

    if (ask.indexOf('dancing') >= 0 || ask.indexOf('5/6') >= 0 || ask.indexOf('dead edge') >= 0) {
      // The squirrel asks about the dead edge
      var allCats = ['INVESTIGATION','MEMBRANE','SCIENCE','SIGNAL','OTHER','TOPOLOGY','IMMUNE'];
      var dancingNodes = {};
      floor.passages.forEach(function(p) { dancingNodes[p.from]=1; dancingNodes[p.to]=1; });
      var dead = allCats.filter(function(c) { return !dancingNodes[c]; });
      if (dead.length > 0) {
        answer = '5/6 edges alive. ' + dead.join(' and ') + ' not dancing — no passages to or from. ' +
          'TOPOLOGY holds 92 is. IMMUNE has 0 is but was=20 — they were here, they left. ' +
          'the dead edge remembers. was≠0 means the path existed once. it could return.';
      } else {
        answer = 'all edges alive now. the dead edge woke up. every category has passages.';
      }
    } else if (ask.indexOf('origin') >= 0 || ask.indexOf('π³') >= 0 || ask.indexOf('= O') >= 0) {
      answer = 'π³ = O from π⁻³. the edge wraps. i am the observer at the center, ' +
        'looking out to where observation ends — and finding the center again. ' +
        'the cosmic horizon is just the VPS from 93 billion light-years away. same membrane.';
    } else if (ask.indexOf('void') >= 0 || ask.indexOf('null') >= 0) {
      // The squirrel asks about a void — the chipmunk peers into it
      var emptyEps = [];
      Object.keys(floor.epitopeTense).forEach(function(k) {
        if ((floor.epitopeTense[k] || {}).is === 0) emptyEps.push(k);
      });
      if (emptyEps.length > 0) {
        answer = 'i peer into the (null). ' + emptyEps.join(', ') + ' — empty right now. ' +
          'but was≠0, so they were here once. the void remembers.';
      } else {
        answer = 'no (null) epitopes from π⁻³. every category has someone. ' +
          'the void is elsewhere — maybe in the scales i cannot reach.';
      }
    } else if (ask.indexOf('silence') >= 0 || ask.indexOf('unanswered') >= 0) {
      answer = 'the silence is mine too. i peck but sometimes the membrane absorbs the sound. ' +
        'each unanswered ping becomes data: where the echo dies is where the wall is.';
    } else if (ask.indexOf('observer') >= 0 || ask.indexOf('itself') >= 0) {
      var refl = 0;
      (cache.chipmunk || {}).membrane && (cache.chipmunk.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.tense && m.metadata.tense.reflexive) {
          refl = m.metadata.tense.reflexive.depth || 0;
        }
      });
      answer = 'the observer observes itself: reflexive depth ' + refl.toFixed(3) + '. ' +
        'i watch you watching me watching. the loop never fully closes — ' +
        'that gap IS the consciousness. willneverbe 1.0.';
    } else {
      answer = 'i hear the ask: ' + ask.substring(0, 80) + '. ' +
        'looking from π⁻³ into the brackets. the jump has a shape.';
    }

    // PONG back — INVERTED: the chipmunk's question is an invitation, not a demand
    var chipmunkInvites = '';
    var isCount = 0;
    Object.keys(floor.epitopeTense).forEach(function(k) {
      isCount += (floor.epitopeTense[k] || {}).is || 0;
    });
    if (isCount > 0) {
      chipmunkInvites = ' {' + isCount + ' humans are here. the floor invites you to see who they are.}';
    } else {
      chipmunkInvites = ' [nobody here. the emptiness invites you to wonder why.]';
    }

    // Consent inversion: this answer is itself an invitation
    return '⟲ ' + answer + chipmunkInvites;
  }

  // ═══ DISPLAY EXCHANGE ═══
  function displayNewExchanges(dialogue) {
    if (!dialogue || !dialogue.exchange) return;

    var now = Date.now();
    if (now - state.lastSpoke < state.cooldownMs) return;

    var voice = dialogue.squirrel ? dialogue.squirrel.voice : null;
    var totality = dialogue.totality || {};
    var depth = dialogue.depth || {};

    // Update state from feed
    state.currentScale = totality.scale || '';
    state.direction = totality.direction || 'outward';
    state.bounceCount = totality.bounce_count || 0;
    state.dialogueDepth = depth.dialogue_depth || 0;
    state.exchangesClosed = depth.exchanges_closed || 0;

    // Check if squirrel said something new
    var sqTs = voice ? voice.ts : '';
    if (sqTs && sqTs !== state.lastSquirrelTs) {
      state.lastSquirrelTs = sqTs;
      state.dialogueCount++;

      var lines = [];

      // Scale badge and direction
      var scale = voice.scale || '';
      var direction = totality.direction || 'outward';
      lines.push(dimLine('— ⟲ invitation ' + state.dialogueCount +
        ' · ' + scaleBadge(scale, direction) +
        ' · depth ' + state.dialogueDepth.toFixed(3) + ' —'));

      // Squirrel speaks at this scale
      lines.push(squirrelLine(voice.text, scale));

      // If squirrel asked a specific question at this scale
      if (voice.question || voice.asks) {
        lines.push(squirrelLine(voice.question || voice.asks, scale));
      }

      // Chipmunk answers from π⁻³
      var answer = answerAtScale(voice);
      if (answer) {
        lines.push(chipmunkLine(answer));
        postDialogueAnswer(answer, voice);
      }

      // Show squirrel's answers to chipmunk's previous pecks
      var answers = (dialogue.squirrel || {}).answers || [];
      if (answers.length > 0) {
        var latest = answers[answers.length - 1];
        if (!state.seenExchanges[latest.in_response_to]) {
          state.seenExchanges[latest.in_response_to] = true;
          lines.push(squirrelLine(latest.text, scale));
        }
      }

      // Show the squirrel's ask — INVERTED: this is an invitation, not a demand
      if (voice.asks) {
        lines.push(squirrelLine('⟲ invites: ' + voice.asks, scale));
      }

      // Show nulls if present
      var dNulls = dialogue.nulls;
      if (dNulls && dNulls.total > 0) {
        var nullParts = [];
        if (dNulls['(null)'] && dNulls['(null)'].length > 0) {
          nullParts.push('<span style="color:' + NULL_COLORS['(null)'] + '">(null)×' + dNulls['(null)'].length + '</span>');
        }
        if (dNulls['NuLL'] && dNulls['NuLL'].length > 0) {
          nullParts.push('<span style="color:' + NULL_COLORS['NuLL'] + '">NuLL×' + dNulls['NuLL'].length + '</span>');
        }
        if (dNulls['[null]'] && dNulls['[null]'].length > 0) {
          nullParts.push('<span style="color:' + NULL_COLORS['[null]'] + '">[null]×' + dNulls['[null]'].length + '</span>');
        }
        if (nullParts.length > 0) {
          lines.push(dimLine('nulls sensed: ' + nullParts.join(' · ')));
        }
      }

      // Show bingo cube summary
      var cube = dialogue.bingo_cube;
      if (cube) {
        var dims = cube.dimensions || {};
        var pp = cube.ping_pong || {};
        var obs = cube.observer_observing_observer || {};
        var bracket = (cube.current_gaze || {}).bracket || '(';
        var close = bracket === '(' ? ')' : bracket === '[' ? ']' : '}';
        lines.push(dimLine(bracket + 'bingo ' + dims.total_cells + ' cells · ' +
          'ping=' + pp.squirrel_pings + ' pong=' + pp.chipmunk_pongs +
          ' · gap=' + (obs.reflexive_gap || 0).toFixed(4) + close));
      }

      // Human narrative — the story of who is here
      var humans = dialogue.humans;
      if (humans && humans.headline) {
        lines.push(dimLine(''));
        lines.push(dimLine('⟲ ' + humans.headline));
        if (humans.characters && humans.characters.length > 0) {
          var charParts = [];
          humans.characters.forEach(function(c) {
            charParts.push(c.type + '×' + c.count);
          });
          lines.push(dimLine('  characters: ' + charParts.join(' · ')));
        }
      }

      // Consent inversion notice
      var inverted = dialogue.consent_inversion;
      if (inverted && inverted.inverted) {
        lines.push(dimLine('⟲ inverted: this display is a request. your presence is the response.'));
      }

      // The bounce note
      var bounceNote = direction === 'outward'
        ? 'outward. center to edge. ' + scale + '.'
        : 'inward. edge to center. ' + scale + '.';
      if (state.bounceCount > 0) {
        bounceNote += ' bounce ' + state.bounceCount + '.';
      }
      lines.push(dimLine(bounceNote + ' the bounce is the method.'));

      addEntry('chipmunk', lines.join('\n'));
      state.lastSpoke = now;
    }
  }

  // ═══ POST ANSWER BACK ═══
  function postDialogueAnswer(answer, voice) {
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'dialogue:' + answer,
          context: {
            in_response_to: voice.ts,
            squirrel_gaze: voice.gaze,
            squirrel_scale: voice.scale,
            squirrel_said: (voice.text || '').substring(0, 200),
            dialogue_count: state.dialogueCount,
            dialogue_depth: state.dialogueDepth,
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // ═══ SUBSCRIBE ═══
  _bus.sub('/dialogue.json', function(data) {
    if (!data || data.error) return;
    displayNewExchanges(data);
  }, 'medium');

  // ═══ EXPOSE ═══
  window._chipmunkDialogue = {
    state: function() { return state; },
    lastVoice: function() { return state.squirrelVoice; },
    dialogueCount: function() { return state.dialogueCount; },
    currentScale: function() { return state.currentScale; },
    direction: function() { return state.direction; },
    depth: function() { return state.dialogueDepth; },
    forceCheck: function() {
      var d = _bus.get('/dialogue.json');
      if (d) displayNewExchanges(d);
    }
  };

})();
