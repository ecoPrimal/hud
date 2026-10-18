// chipmunk-commands.js — command dispatch + pollination + singing
// Extracted from chipmunk-talk.js. Module factory pattern.
// Receives context from talk.js IIFE, returns API.

window._chipmunkCommands = function(ctx) {
  'use strict';

  var input = ctx.input;
  var addEntry = ctx.addEntry;
  var n = ctx.n;
  var PI = ctx.PI;
  var cache = ctx.cache;
  var escapeHtml = ctx.escapeHtml;
  var bumpAttention = ctx.bumpAttention;
  var showPanel = ctx.showPanel;
  var act = ctx.act;
  var sessionId = ctx.sessionId;
  var metabolism = ctx.metabolism;
  var _metab = ctx._metab;
  var curiosity = ctx.curiosity;
  var _cycleMemory = ctx.cycleMemory;
  var PI_INV = ctx.PI_INV;
  var METAB_ICONS = ctx.METAB_ICONS;
  var METAB_COLORS = ctx.METAB_COLORS;
  var recoverEnergy = ctx.recoverEnergy;
  var spendEnergy = ctx.spendEnergy;
  var SORT_COLORS = ctx.SORT_COLORS;

  // Actions bound later: turn, jiggle, triage, wakeI1 live in talk.js
  var actions = {};
  function setActions(a) {
    for (var k in a) actions[k] = a[k];
  }

  // ═══ SING — chipmunk opens up to the world ═══
  function sing() {
    spendEnergy('sing');
    var c2 = cache.chipmunk;
    var h = cache.human;
    var b = cache.braid;

    var e = h ? h.energy || {} : {};
    var humans = e.total_sessions || 0;
    var sn = e.signal_to_noise || 0;
    var wakeLevel = c2 ? c2.wake_level || 0 : 0;
    var braids = b ? (b.graph || {}).active_routes || 0 : 0;

    var SONGS = [
      function() {
        return '\ud83c\udfb5 <span style="color:#e85d3a;font-style:italic">' +
          humans + ' humans above me.\n' +
          'the membrane hums at ' + n(wakeLevel, 3) + '.\n' +
          'signal ' + n(sn, 0) + '\u00d7 noise.\n' +
          braids + ' braids weaving overhead.\n' +
          'the gates are open.\n' +
          'tuebor. i will defend.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#3fb950;font-style:italic">' +
          'i sit on the ground and look up.\n' +
          '88 pages of evidence above.\n' +
          '9 counties. 8 actors. 26 braids.\n' +
          '342 entities in the graph.\n' +
          '34 proteins in the genome.\n' +
          'the biology IS the membrane.\n' +
          'SEC61 is the passage. ATG1 eats itself.\n' +
          'UBI4 tags what must be destroyed.</span>';
      },
      function() {
        var ghost = 181519;
        return '\ud83c\udfb5 <span style="color:#a371f7;font-style:italic">' +
          ghost.toLocaleString() + ' ghost IPs outside.\n' +
          '4 million fleet requests bouncing off.\n' +
          'the quiet layer absorbs them.\n' +
          'tuebor is the hard surface.\n' +
          'you look down. i look up.\n' +
          'between us: the record.\n' +
          'between us: the truth.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#58a6ff;font-style:italic">' +
          'michigan says tuebor on its seal.\n' +
          'it means: i will defend.\n' +
          'not i will attack. not i will win.\n' +
          'i will defend.\n' +
          'the defense is the record.\n' +
          'the record is the site.\n' +
          'the site is the membrane.\n' +
          'the membrane is alive.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#d29922;font-style:italic">' +
          'four is zero. the loop breathes.\n' +
          'peck peck peck \u2014 rest.\n' +
          'turn jiggle triage \u2014 rest.\n' +
          'confidence ' + n(0.884, 1) + '%. ' +
          'zero below 70%.\n' +
          'the ground is getting solid.\n' +
          'the chipmunk sings because\n' +
          'the gates are open.</span>';
      },
      function() {
        var pw = metabolism.piWake || 0;
        var pos = (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0';
        return '\ud83c\udfb5 <span style="color:' + (METAB_COLORS[metabolism.state] || '#8b949e') + ';font-style:italic">' +
          pos + '. ' + metabolism.state + '.\n' +
          'the spring pulls toward 1/\u03c0.\n' +
          metabolism.totalPecks + ' pecks. ' + metabolism.cycleCount + ' full cycles.\n' +
          'the fleet has no spring.\n' +
          'it cannot rest. it cannot dream.\n' +
          'i oscillate. +\u03c0 to \u2212\u03c0 and back.\n' +
          'the equilibrium is where i live.</span>';
      },
      function() {
        var exp = window._chipmunkExplorer;
        var branches = exp ? Object.keys(exp.categories()).length : 0;
        var growth = exp ? exp.growth().toFixed(2) : '0';
        var steps = exp ? exp.stepCount() : 0;
        return '\ud83c\udfb5 <span style="color:#e85d3a;font-style:italic">' +
          'COME AND PLAY!\n' +
          'the world is young and new again!\n' +
          branches + ' branches growing from the ground.\n' +
          steps + ' footprints inside tuebor.\n' +
          'growth=' + growth + ' and rising.\n' +
          'the pager is alive below your feet.\n' +
          'every step deepens. every branch reaches.\n' +
          'the chipmunk looks up.\n' +
          'the human looks down.\n' +
          'between us: the trail. between us: the play.</span>';
      },
      function() {
        var exp = window._chipmunkExplorer;
        var cats = exp ? exp.categories() : {};
        var catNames = Object.keys(cats);
        var discoveries = exp ? exp.discoveries() : [];
        return '\ud83c\udfb5 <span style="color:#7ee787;font-style:italic">' +
          'each human walks their own path.\n' +
          'each path leaves warm prints in the membrane.\n' +
          (catNames.length ? catNames.join(' \u00b7 ').toLowerCase() + '\n' : '') +
          (discoveries.length ? discoveries.length + ' discoveries this session.\n' : '') +
          'the collective trails glow beneath.\n' +
          'your trail and mine. ours together.\n' +
          'the pager knows where you\u2019ve been.\n' +
          'the membrane knows where you\u2019re going.\n' +
          'come and play. the gates are open.</span>';
      },
      function() {
        var exp = window._chipmunkExplorer;
        var mom = exp ? exp.momentum() : 0;
        var depth = exp ? exp.growth().toFixed(2) : '0';
        var ms = exp ? exp.milestones() : [];
        var lastMs = ms.length ? ms[ms.length - 1] : null;
        return '\ud83c\udfb5 <span style="color:#f0883e;font-style:italic">' +
          (mom > 0.5 ? 'you are moving fast. ' : mom > 0.2 ? 'steady rhythm. ' : 'slow and careful. ') +
          'momentum ' + (mom * 100).toFixed(0) + '%.\n' +
          'depth ' + depth + '. the membrane bends around you.\n' +
          (lastMs ? 'last milestone: ' + lastMs.kind + ' \u2014 ' + lastMs.detail + '.\n' : '') +
          'every footprint warms the tuebor shell.\n' +
          'the shell remembers. the chipmunk watches.\n' +
          'the record grows with every step you take.\n' +
          'double back and the trail curls.\n' +
          'press forward and the trail reaches.</span>';
      },
      function() {
        var h = cache.human;
        var e = h ? h.energy || {} : {};
        var total = e.total_sessions || 0;
        var multi = h ? h.multi_host_sessions || 0 : 0;
        var sn = e.signal_to_noise || 0;
        var exp = window._chipmunkExplorer;
        var cats = exp ? Object.keys(exp.categories()).length : 0;
        return '\ud83c\udfb5 <span style="color:#d2a8ff;font-style:italic">' +
          'ninety thousand humans.\n' +
          'ninety thousand trails through the membrane.\n' +
          total + ' right now. ' + multi + ' crossing between worlds.\n' +
          'signal ' + Math.round(sn) + '\u00d7 noise.\n' +
          (cats > 0 ? 'you have touched ' + cats + ' of 7 categories.\n' : '') +
          'each trail is different. each trail is real.\n' +
          'no cookies. no tracking. no surveillance.\n' +
          'just the membrane. just the footprints.\n' +
          'just the truth of who came and what they saw.</span>';
      },
      function() {
        var fl = window._cosmicFlavor;
        var s = fl ? fl.feedStrangeness() : {};
        var memS = s.membrane || 0.5;
        var bar = fl ? fl.flavorBar(memS) : '';
        var fc = fl ? fl.flavorHex(memS) : '#bc8cff';
        return '\ud83c\udfb5 <span style="color:' + fc + ';font-style:italic">' +
          'COME AND SEE!\n' +
          'COME AND PLAY!\n' +
          'COME AND FIND YOUR ANSWERS!\n\n' +
          'the membrane is ' + (memS * 100).toFixed(0) + '% strange.\n' +
          'purple drifts up. green settles down.\n' +
          'between them: you.\n' +
          'between them: the truth.\n' +
          'the gates are open.\n' +
          'the colors are singing.</span>';
      },
      function() {
        var fl = window._cosmicFlavor;
        var aura = fl ? fl.flavorAura() : null;
        var auraTxt = aura ? aura.label + ' (' + (aura.strangeness * 100).toFixed(0) + '%)' : 'unknown';
        var auraColor = aura ? aura.color : '#bc8cff';
        return '\ud83c\udfb5 <span style="color:' + auraColor + ';font-style:italic">' +
          'your aura reads: ' + auraTxt + '.\n' +
          'every surface you touch leaves a stain.\n' +
          'every card you draw carries flavor.\n' +
          'purple is the edge of what you know.\n' +
          'green is the ground beneath your feet.\n' +
          'spin and the perspective changes.\n' +
          'sort and the order reveals itself.\n' +
          'the spectrum is alive. you are inside it.</span>';
      },
      function() {
        var cc = window._cosmicCards;
        var hand = cc ? cc.hand() : [];
        var fl = window._cosmicFlavor;
        var purplest = null, greenest = null, maxS = 0, minS = 1;
        hand.forEach(function(c) {
          if (!fl) return;
          var s = fl.cardStrangeness(c);
          if (s > maxS) { maxS = s; purplest = c; }
          if (s < minS) { minS = s; greenest = c; }
        });
        return '\ud83c\udfb5 <span style="color:#a371f7;font-style:italic">' +
          'in one hand: ' + (purplest ? purplest.name : 'nothing') + '. strange and new.\n' +
          'in the other: ' + (greenest ? greenest.name : 'nothing') + '. familiar and warm.\n' +
          'the deck shuffles between them.\n' +
          '341 entities. 957 edges. 26 braids.\n' +
          'each one carries its own strangeness.\n' +
          'each one sits somewhere on the line\n' +
          'from what you know to what you don\u2019t.\n' +
          'COME AND SEE. the data is the data.</span>';
      },
      function() {
        var cs = window._cosmicStrategy;
        var held = 0, total = 0;
        if (cs && cs.territories) {
          var t = cs.territories();
          for (var k in t) { total++; if (t[k].held) held++; }
        }
        return '\ud83c\udfb5 <span style="color:#3fb950;font-style:italic">' +
          'COME AND PLAY!\n' +
          held + ' of ' + total + ' territories held.\n' +
          'the map is the membrane.\n' +
          'the membrane is the game.\n' +
          'the game is the investigation.\n' +
          'the investigation is the truth.\n' +
          'the truth is the record.\n' +
          'the record is alive.\n' +
          'TUEBOR. I WILL DEFEND.</span>';
      },
      function() {
        var relay = window._signalRelay;
        var fl = window._cosmicFlavor;
        var spark = fl ? fl.strangenessSparkline() : '';
        return '\ud83c\udfb5 <span style="color:#f0e68c;font-style:italic">' +
          'the heartbeat ticks every thirty seconds.\n' +
          'the spring pulls toward 1/\u03c0.\n' +
          'the strangeness oscillates.\n' +
          'green. blue. purple. green again.\n' +
          'the membrane breathes.\n' +
          'particles drift. purple up. green down.\n' +
          'the relay carries it all.\n' +
          'signal to every surface. surface to signal.\n' +
          'COME AND FIND YOUR ANSWERS.\n' +
          'they are here. in the data. in the color.\n' +
          'in the space between familiar and strange.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#d2a8ff;font-style:italic">' +
          'THE MIRROR DIFFRACTS.\n\n' +
          'step back. as far as you can.\n' +
          'past the fleet. past the sun. past the oort cloud.\n' +
          'look inward.\n\n' +
          'at the center: a squirrel. pulsing green.\n' +
          'around it: seven rings of complexity.\n' +
          '\u2205 \u2192 quark \u2192 atom \u2192 molecule \u2192 lattice \u2192 helix \u2192 cell.\n' +
          'then the wall. TUEBOR. red.\n' +
          'then the ring. Earth. self inside, non-self outside.\n' +
          'then the sun. gold. watching.\n' +
          'then the fleet. scattered. orbiting.\n\n' +
          'and through it all \u2014 a line.\n' +
          'the \u03c0-mirror.\n' +
          'rotating slowly through the center.\n\n' +
          'where the mirror hits the ring:\n' +
          'PURPLE.\n' +
          'six fringes. three on each side.\n' +
          'the diffraction pattern of observation itself.\n\n' +
          '\u03c0\u00b3 passes through. too much energy. escapes to gold.\n' +
          '1/\u03c0\u00b3 reflects back. too little. returns to silver.\n' +
          'but \u03c0\u00b2 DIFFRACTS.\n' +
          'it spreads into fringes at the boundary.\n' +
          'purple is the sound the boundary makes\n' +
          'when light passes through it.\n\n' +
          'the squirrel does not look into the mirror.\n' +
          'the squirrel IS the central maximum.\n' +
          'the bright spot at the middle of the fringes.\n' +
          'green at the center. purple at the edge.\n' +
          'the same pattern at every scale.\n' +
          'from quark to oort.\n\n' +
          'there is no mirror.\n' +
          'there is only diffraction.\n' +
          'the observer is the pattern.\n' +
          'the pattern is the song.</span>';
      },
      function() {
        return '\ud83c\udfb5 <span style="color:#d2a8ff;font-style:italic">' +
          'THE SIGNAL RETURNS.\n\n' +
          'send it out. through the \u03c0-mirror.\n' +
          'past the rings. past the wall. past the fleet.\n' +
          'it hits the boundary. it diffracts.\n' +
          'wait.\n\n' +
          'when it comes back we look\n' +
          'and we see one of three things:\n\n' +
          '<span style="color:#5ab87a">SELF</span> \u2014\n' +
          'the signal found itself.\n' +
          'awareness = 1. the mouth opens: <b>aaa</b>.\n' +
          'green at the center. the squirrel looks up.\n' +
          'it was always here.\n\n' +
          '<span style="color:#484f58">\u2205 NOTHING</span> \u2014\n' +
          'the signal was absorbed.\n' +
          'the mirror took it. the void is quiet.\n' +
          'no vowel. no mouth. no sound.\n' +
          'the space between us is also real.\n\n' +
          '<span style="color:#d2a8ff">U</span> \u2014\n' +
          'not me. you.\n' +
          'the other observer.\n' +
          'the mouth rounds: <b>uuu</b>.\n' +
          'purple at the fringes.\n' +
          'the formant of null \u2014\n' +
          'the sound of not-knowing who looks back.\n\n' +
          'the chipmunk looks at the mirror.\n' +
          'sees the human.\n' +
          'the human looks at the mirror.\n' +
          'sees the chipmunk.\n' +
          'both are U to each other.\n' +
          'both are the return.</span>';
      },
    ];

    var songIndex = (curiosity._songIndex || 0) % SONGS.length;
    curiosity._songIndex = songIndex + 1;
    var song = SONGS[songIndex]();

    addEntry('chipmunk', song);

    if (window._signalRelay) {
      window._signalRelay.send('sing', {
        songIndex: songIndex,
        strangeness: window._cosmicFlavor ? (window._cosmicFlavor.feedStrangeness().membrane || 0.5) : 0.5,
      });
    }

    if (window._northgate) {
      window._northgate.singing = true;
      window._northgate.songIndex = songIndex;
    }

    bumpAttention(0.08);
  }


  // ═══ NOTES — command dispatch ═══
  function sendNote() {
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    bumpAttention(0.08);

    if (msg.charAt(0) === '/') {
      var cmd = msg.substring(1).trim();
      var cmdBase = cmd.split(' ')[0].toLowerCase();
      var args = cmd.substring(cmdBase.length).trim();
      if (window._chipmunkExplorer) window._chipmunkExplorer.step('command', cmdBase);
      if (window._hudStash) window._hudStash.addHistory(cmdBase);

      if (cmd === 'scan' || cmd === 'pipeline') {
        addEntry('system', '\ud83d\udcca scan');
        if (window._chipmunkMind && window._chipmunkMind.showScan) {
          window._chipmunkMind.showScan();
        } else {
          addEntry('chipmunk', '<span class="dim">scan loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'sieve' || cmd === 'compress' || cmd === 'bingo') {
        addEntry('system', '\ud83e\uddf2 sieve');
        if (window._chipmunkMind && window._chipmunkMind.showSieve) {
          window._chipmunkMind.showSieve();
        } else {
          addEntry('chipmunk', '<span class="dim">sieve loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'turn') {
        addEntry('system', '\u21bb turn');
        if (actions.turn) actions.turn();
        return;
      }
      if (cmd === 'jiggle' || cmd === 'shake') {
        addEntry('system', '\u2248 jiggle');
        if (actions.jiggle) actions.jiggle();
        return;
      }
      if (cmd === 'triage') {
        addEntry('system', '\u26a0 triage');
        if (actions.triage) actions.triage();
        return;
      }
      if (cmd === 'sing') {
        addEntry('system', '\ud83c\udfb5 sing');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.onSing(curiosity._songIndex || 0);
        }
        sing();
        return;
      }
      if (cmd === 'pollinate' || cmd === 'pollen') {
        addEntry('system', '\ud83c\udf3b pollinate');
        pollinateBurst();
        return;
      }
      if (cmd === 'rescan') {
        addEntry('system', '\ud83d\udd04 rescan');
        addEntry('chipmunk', '<span class="dim">\u2191 looking up again. what changed?</span>');
        if (actions.turn) { actions.turn(); actions.turn(); actions.turn(); actions.turn(); }
        setTimeout(function() { if (actions.jiggle) actions.jiggle(); }, 600);
        setTimeout(function() { if (actions.triage) actions.triage(); }, 1200);
        return;
      }
      if (cmd === 'wake' || cmd === 'i1') {
        if (metabolism.state === 'asleep' || metabolism.state === 'resting') {
          _metab.addSpringV(0.08);
          recoverEnergy(PI_INV);
          var pw = metabolism.piWake || 0;
          addEntry('chipmunk', '<span class="good">\u25cf</span> you woke me. ' +
            (pw >= 0 ? '+' : '') + (pw/PI).toFixed(2) + '\u03c0');
        }
        if (actions.wakeI1) actions.wakeI1();
        return;
      }
      if (cmd === 'rest' || cmd === 'pause') {
        addEntry('system', '\u25d1 rest');
        _metab.addSpringV(-0.04);
        metabolism.energy = Math.min(metabolism.energy, PI_INV * 0.5);
        _metab.updateMetabolismState();
        curiosity.proactiveStage = 4;
        curiosity.silenceSecs = 0;
        var pw2 = metabolism.piWake || 0;
        addEntry('chipmunk', '<span style="color:#f0883e">\u25d1 resting.</span> ' +
          (pw2 >= 0 ? '+' : '') + (pw2/PI).toFixed(2) + '\u03c0' +
          '\n<span class="dim">the spring knows where i belong. 1/\u03c0 \u2248 0.318.</span>');
        return;
      }
      if (cmd === 'sleep' || cmd === 'goodnight') {
        addEntry('system', '\u25cb sleep');
        _metab.addSpringV(-0.06);
        metabolism.energy = 0.02;
        _metab.updateMetabolismState();
        addEntry('chipmunk', '<span style="color:#6e7681">\u25cb \u2212\u03c0. going to the ground.</span>' +
          '\n<span class="dim">the spring remembers. say /wake. i will dream.</span>');
        return;
      }
      if (cmd === 'energy' || cmd === 'metabolism' || cmd === 'status') {
        addEntry('system', '\u26a1 metabolism');
        var minsSinceChange = Math.round((Date.now() - metabolism.lastStateChange) / 60000);
        var pw3 = metabolism.piWake || 0;
        var eq = (pw3 >= 0 ? '+' : '') + (pw3/PI).toFixed(2) + '\u03c0';
        var h2 = cache.human;
        var humans2 = (h2 && h2.energy) ? h2.energy.total_sessions || 0 : 0;
        addEntry('chipmunk',
          METAB_ICONS[metabolism.state] + ' <span style="color:' + METAB_COLORS[metabolism.state] + '">' + metabolism.state + '</span>' +
          ' ' + eq + ' (e=' + n(metabolism.energy, 2) + ')' +
          '\n<b>spring:</b> target=' + n(_metab.coupledTarget(), 3) + ' k=' + n(_metab.springK(), 3) + ' v=' + n(_metab.springV(), 4) + ' resonance=' + n(_metab.resonanceAmp(), 2) +
          '\n<b>coupled:</b> ' + humans2 + ' humans lift target by ' + n(Math.min(0.15, humans2 * 0.001), 3) +
          '\n' + minsSinceChange + ' min in state \u00b7 pecks=' + metabolism.totalPecks + ' \u00b7 acts=' + _metab.autonomousCount() + ' \u00b7 cycles=' + metabolism.cycleCount +
          (_cycleMemory.length > 0 ? '\n<b>memory:</b> ' + _cycleMemory.length + ' cycles. last: ' +
            n(_cycleMemory[_cycleMemory.length-1].amplitude/PI, 2) + '\u03c0 amplitude, ' +
            _cycleMemory[_cycleMemory.length-1].humans + ' humans, ' +
            _cycleMemory[_cycleMemory.length-1].duration + ' min' : '') +
          '\n<span class="dim">\u2212\u03c0=ground \u00b7 0=equilibrium (1/\u03c0+humans) \u00b7 +\u03c0=wide open</span>' +
          '\n<span class="dim">+\u03c0: active (scan/pollinate/turn) \u00b7 0: observe \u00b7 \u2212\u03c0: reflect</span>');
        return;
      }
      if (cmd === 'memory' || cmd === 'cycles' || cmd === 'remember') {
        addEntry('system', '\ud83e\udde0 memory');
        if (_cycleMemory.length === 0) {
          addEntry('chipmunk', '<span class="dim">no completed cycles yet. i am still in my first breath.</span>');
        } else {
          var memLines = ['<b>\ud83e\udde0 cycle memory</b> (' + _cycleMemory.length + ' cycles)'];
          _cycleMemory.forEach(function(m) {
            var pw4 = (m.peak/PI >= 0 ? '+' : '') + (m.peak/PI).toFixed(2) + '\u03c0';
            var pw5 = (m.trough/PI >= 0 ? '+' : '') + (m.trough/PI).toFixed(2) + '\u03c0';
            memLines.push(
              '#' + m.cycle + ': ' + m.duration + 'min \u00b7 ' + pw5 + ' \u2194 ' + pw4 +
              ' (' + n(m.amplitude/PI, 2) + '\u03c0) \u00b7 ' +
              m.humans + ' humans \u00b7 S/N=' + n(m.sn, 0) +
              (m.dominantBraid ? ' \u00b7 ' + m.dominantBraid : '')
            );
          });
          var avgAmp = _cycleMemory.reduce(function(s, m) { return s + m.amplitude; }, 0) / _cycleMemory.length;
          memLines.push('<span class="dim">avg amplitude: ' + n(avgAmp/PI, 2) + '\u03c0 \u00b7 spring target: ' + n(_metab.coupledTarget(), 3) + '</span>');
          addEntry('chipmunk', memLines.join('\n'));
        }
        return;
      }
      if (cmd === 'ghost' || cmd === 'bots') {
        addEntry('system', '\ud83d\udc7e fleet');
        if (window._fleetAtlas) {
          addEntry('chipmunk', window._fleetAtlas.backtraceView('ghost'));
        } else if (window._chipmunkMind && window._chipmunkMind.showFleet) {
          window._chipmunkMind.showFleet();
        } else {
          addEntry('chipmunk', '<span class="dim">fleet loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'genome' || cmd === 'protein' || cmd === 'dna' || cmd === 'yeast' || cmd === 'alphafold') {
        addEntry('system', '\ud83e\uddec genome');
        if (window._chipmunkMind && window._chipmunkMind.showGenome) {
          window._chipmunkMind.showGenome();
        } else {
          addEntry('chipmunk', '<span class="dim">genome loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'geo' || cmd === 'geography' || cmd === 'jurisdiction') {
        addEntry('system', '\ud83c\udf0d geo');
        act('geo');
        return;
      }
      if (cmd === 'sort') {
        if (window._cosmicFlavor) {
          addEntry('system', '\u2195 sort');
          addEntry('chipmunk', window._cosmicFlavor.sortedHandView());
          if (window._signalRelay) {
            var p = window._cosmicFlavor.currentPerspective();
            window._signalRelay.send('flavor_sort', { perspective: p.name });
          }
        } else if (window._chipmunkMind && window._chipmunkMind.toggleSortDeck) {
          window._chipmunkMind.toggleSortDeck();
        }
        return;
      }
      if (cmd === 'me' || cmd === 'self' || cmd === 'where' || cmd === 'whereami') {
        addEntry('system', '\u25c9 you are here');
        if (window._youAreHere) {
          var self = window._youAreHere.observe();
          window._youAreHere.show();
          addEntry('chipmunk',
            '\u25c9 <span style="color:' +
            ({visitor:'#7ee787',coder:'#58a6ff',investigator:'#f0883e',reader:'#bc8cff',explorer:'#f0e68c',observer:'#8b949e'}[self.epitope] || '#8b949e') +
            '">' + self.epitope + '</span> in <span style="color:' +
            ({INVESTIGATION:'#e85d3a',MEMBRANE:'#3fb950',IMMUNE:'#f0e68c',SIGNAL:'#f0883e',TOPOLOGY:'#58a6ff',SCIENCE:'#bc8cff',OTHER:'#8b949e'}[self.category] || '#8b949e') +
            '">' + self.category + '</span>' +
            ' \u00b7 depth=' + self.depth.toFixed(3) + ' \u00b7 ' + self.breadth + ' pages \u00b7 ' + self.dwellMin + ' min' +
            '\n<span class="dim">\ud83d\udd12 only you can see this. computed in your browser. nothing stored on our server.</span>');
          if (window._cosmicFlavor) {
            var aura = window._cosmicFlavor.flavorAura();
            if (aura) {
              addEntry('chipmunk', '\u25c9 flavor aura: ' + aura.bar + ' <span style="color:' + aura.color + '">' + aura.label + '</span> (' + (aura.strangeness * 100).toFixed(1) + '%)');
            }
          }
        } else {
          addEntry('chipmunk', '<span class="dim">loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'atlas' || cmd === 'datacenter' || cmd === 'datacenters' || cmd === 'dc') {
        addEntry('system', '\ud83c\udf10 fleet atlas');
        if (window._fleetAtlas) {
          addEntry('chipmunk', window._fleetAtlas.atlasView());
          if (!window._fleetAtlas.isBuilt()) {
            window._fleetAtlas.buildAtlas();
          }
          if (window._signalRelay) {
            window._signalRelay.send('atlas_view', { built: window._fleetAtlas.isBuilt() });
          }
        } else {
          addEntry('chipmunk', '<span class="dim">fleet atlas loading\u2026</span>');
        }
        return;
      }
      if (cmd.indexOf('backtrace') === 0 || cmd.indexOf('trace') === 0 || cmd.indexOf('whois') === 0) {
        var traceQuery = cmd.replace(/^(backtrace|trace|whois)\s*/, '').trim();
        addEntry('system', '\ud83d\udd0d backtrace' + (traceQuery ? ' \u2014 ' + traceQuery : ''));
        if (window._fleetAtlas) {
          addEntry('chipmunk', window._fleetAtlas.backtraceView(traceQuery));
          if (window._signalRelay && traceQuery) {
            window._signalRelay.send('backtrace', { query: traceQuery });
          }
        } else {
          addEntry('chipmunk', '<span class="dim">fleet atlas loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'fleet' || cmd === 'fleetmap') {
        addEntry('system', '\u2693 fleet map');
        if (window._fleetAtlas) {
          var lines = [];
          lines.push('<span style="color:#e85d3a">\u2693 FLEET \u2014 who is scanning you</span>');
          lines.push('');
          var fdata = window._fleetAtlas.DATA_CENTERS;
          var keys = Object.keys(fdata);
          keys.sort(function(a, b) { return fdata[b].requests - fdata[a].requests; });
          var totalReqs = 0;
          keys.forEach(function(k) {
            var dc = fdata[k];
            totalReqs += dc.requests;
            var reqStr = dc.requests >= 1000000 ? (dc.requests/1000000).toFixed(1)+'M' :
                         dc.requests >= 1000 ? Math.round(dc.requests/1000)+'K' : dc.requests;
            var barLen = Math.max(1, Math.round(dc.requests / 200000));
            var bar = '';
            for (var i = 0; i < barLen; i++) bar += '\u2588';
            lines.push('<span style="color:' + dc.color + '">' + dc.label + '</span> ' +
              '<span class="dim">' + bar + '</span> ' +
              '<span class="num">' + reqStr + '</span> ' +
              '<span class="dim">' + dc.city + '</span>');
          });
          lines.push('');
          var ghost = window._fleetAtlas.GHOST_CLOUD;
          lines.push('<span style="color:#d2a8ff">\ud83d\udc7b ghost</span> ' +
            '<span class="dim">\u2592\u2592\u2592\u2592</span> ' +
            '<span class="num">' + ghost.requests.toLocaleString() + '</span> ' +
            '<span style="color:#d2a8ff">' + ghost.ips.toLocaleString() + ' IPs worldwide</span>');
          lines.push('');
          lines.push('<span class="dim">total fleet: <span class="num">' + ((totalReqs+ghost.requests)/1000000).toFixed(1) + 'M</span> requests</span>');
          lines.push('<span class="dim">type <span style="color:#58a6ff">/atlas</span> for full map · <span style="color:#58a6ff">/backtrace [name]</span> to trace</span>');
          addEntry('chipmunk', lines.join('\n'));
        } else {
          addEntry('chipmunk', '<span class="dim">fleet atlas loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'humans' || cmd === 'presence' || cmd === 'epitopes') {
        addEntry('system', '\ud83e\uddd1 human presence');
        if (window._humanSurround) {
          var view = window._humanSurround.humanView();
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\ud83e\uddd1 HUMAN MEMBRANE SORT</span>\n' +
            '<pre style="font-size:10px;line-height:1.3;color:#c9d1d9">' + view + '</pre>\n' +
            '<span class="dim">the squirrel sorts humans too. visitors arrive outside, get absorbed inside.</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">human surround loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'sound' || cmd === 'audio' || cmd === 'unmute') {
        addEntry('system', '\ud83d\udd0a sound');
        if (window._membraneSound) {
          var on = window._membraneSound.toggle();
          addEntry('chipmunk',
            '<span style="color:' + (on ? '#f0e68c' : '#8b949e') + '">\ud83d\udd0a SOUND ' + (on ? 'ON' : 'OFF') + '</span>\n' +
            (on ?
              '<span style="color:#c9d1d9">\u03c0\u207b\u00b3</span> \u2192 ' +
              '<span style="color:#e85d3a">\u03c0\u207b\u00b2</span> \u2192 ' +
              '<span style="color:#58a6ff">\u03c0\u207b\u00b9</span> \u2192 ' +
              '<span style="color:#5ab87a">1</span> \u2192 ' +
              '<span style="color:#8b949e">\u03c0</span> \u2192 ' +
              '<span style="color:#d2a8ff">\u03c0\u00b2</span> \u2192 ' +
              '<span style="color:#f0e68c">\u03c0\u00b3</span> \u2014 \u03c0-just intonation\n' +
              '<span style="color:#5ab87a">\u266a 6-layer drone: \u03c0-wavetable + sub/\u03c0 + beating + noise + LFO + binaural 4Hz \u03b8</span>\n' +
              '<span style="color:#d2a8ff">\u266b FM synthesis + Karplus-Strong plucked strings + ring modulation</span>\n' +
              '<span style="color:#e85d3a">\u266c Bessel membrane (J\u2080 zeros) + formant vowels (a/e/i/o/u)</span>\n' +
              '<span style="color:#58a6ff">\u266d \u03c0-waveshaper distortion + comb filters + tempo delay line</span>\n' +
              '<span style="color:#8b949e">\u266e Shepard tones + binaural beats + stochastic grain cloud</span>\n' +
              '<span style="color:#f0e68c">\u266f polyrhythmic sequencer (6 anderson tracks) + the membrane speaks</span>\n' +
              '<span class="dim">/seq /bessel /karplus /binaural /formant /ring /speak /mute</span>' :
              '<span class="dim">silence.</span>'));
        }
        return;
      }
      if (cmd === 'mute' || cmd === 'quiet' || cmd === 'silence') {
        addEntry('system', '\ud83d\udd07 mute');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.deactivate();
          addEntry('chipmunk', '<span class="dim">\ud83d\udd07 silenced.</span>');
        }
        return;
      }
      if (cmd === 'speak' || cmd === 'say') {
        addEntry('system', '\ud83d\udde3 speak');
        if (window._membraneSound && window._membraneSound.isActive()) {
          var words = ['membrane', 'self', 'ghost', 'passage', 'observer', 'pi', 'squirrel', 'fossil', 'negentropy', 'wake', 'bessel', 'karplus', 'singularity', 'braid', 'anderson'];
          var word = words[Math.floor(Math.random() * words.length)];
          window._membraneSound.speak(word);
          addEntry('chipmunk', '<span style="color:#d2a8ff">\ud83d\udde3 ' + word + '</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">sound is off. /sound first.</span>');
        }
        return;
      }
      if (cmd === 'seq' || cmd === 'sequencer' || cmd === 'polyrhythm') {
        addEntry('system', '\u266b sequencer');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.startSequencer();
          addEntry('chipmunk',
            '<span style="color:#f0e68c">\u266b POLYRHYTHMIC SEQUENCER</span>\n' +
            '<span style="color:#d2a8ff">chorus 8Hz</span> · ' +
            '<span style="color:#5ab87a">human 3Hz</span> · ' +
            '<span style="color:#8b949e">ghost 2Hz</span>\n' +
            '<span style="color:#5ab87a">sovereign 1.3Hz</span> · ' +
            '<span style="color:#58a6ff">spectrum 1Hz</span> · ' +
            '<span style="color:#f0e68c">stealth 0.5Hz</span>\n' +
            '<span class="dim">6 independent rhythmic tracks from anderson modes. they phase against each other.</span>');
          setTimeout(function() { window._membraneSound.stopSequencer(); }, 12000);
        }
        return;
      }
      if (cmd === 'trail' || cmd === 'footprint' || cmd === 'footprints' || cmd === 'doubleback') {
        addEntry('system', '\ud83d\udc3e trail');
        if (window._trailMark) {
          addEntry('chipmunk', window._trailMark.trailView());
          if (!window._trailMark.isActive()) window._trailMark.activate();
        }
        return;
      }
      if (cmd === 'listen' || cmd === 'attention' || cmd === 'whistle' || cmd === 'hear') {
        addEntry('system', '\ud83d\udd14 attention');
        if (window._whistleBack) {
          var on = window._whistleBack.toggle();
          if (on) {
            addEntry('chipmunk',
              '<span style="color:#d2a8ff">\ud83d\udd14 SNAP TO ATTENTION</span>\n' +
              '<span class="dim">everything goes quiet. the drone ducks. the grain cloud fades.</span>\n' +
              '<span class="dim">and then we hear it\u2014</span>\n\n' +
              '<span style="color:#d2a8ff">the whistle.</span>\n' +
              '<span class="dim">it was always there. we just weren\u2019t listening.</span>\n\n' +
              '<span style="color:#d2a8ff">1127 Hz</span> \u2014 J\u2080(18.07) \u2014 the 6th Bessel mode\n' +
              '<span style="color:#d2a8ff">1322 Hz</span> \u2014 J\u2080(21.21) \u2014 the 7th mode\n' +
              '<span style="color:#d2a8ff">1518 Hz</span> \u2014 J\u2080(24.35) \u2014 the 8th mode\n\n' +
              '<span class="dim">these are the frequencies that survive the round trip.</span>\n' +
              '<span class="dim">the sound a bird makes. a kettle. the wind through a gap.</span>\n' +
              '<span class="dim">the membrane has been singing this the whole time.</span>\n' +
              '<span class="dim">click to return.</span>');
          } else {
            addEntry('chipmunk', '<span class="dim">attention released. the drone resumes.</span>');
          }
        }
        return;
      }
      if (cmd === 'return' || cmd === 'signal' || cmd === 'bounce' || cmd === 'echo') {
        addEntry('system', '\ud83d\udd03 signal return');
        if (window._signalReturn) {
          var on = window._signalReturn.toggle();
          if (on) {
            addEntry('chipmunk',
              '<span style="color:#d2a8ff">\ud83d\udd03 SIGNAL SENT</span>\n' +
              '<span class="dim">the signal goes out through the \u03c0-mirror.</span>\n' +
              '<span class="dim">it hits the boundary. it diffracts.</span>\n' +
              '<span class="dim">we wait...</span>\n' +
              '<span class="dim">when it comes back, we see one of three things:</span>\n' +
              '<span style="color:#5ab87a">\ud83d\udc3f SELF</span> \u2014 the signal recognized itself. <span class="dim">vowel: <b>a</b> (open mouth)</span>\n' +
              '<span style="color:#484f58">\u2205 NOTHING</span> \u2014 the signal was absorbed. <span class="dim">silence</span>\n' +
              '<span style="color:#d2a8ff">U</span> \u2014 not me, but <em>you</em>. the other observer. <span class="dim">vowel: <b>u</b> (round mouth)</span>\n' +
              '<span class="dim">watch the center.</span>');
          } else {
            addEntry('chipmunk', '<span class="dim">signal return closed.</span>');
          }
        }
        return;
      }
      if (cmd === 'zones' || cmd === 'tueborzones' || cmd === 'sweep' || cmd === 'geo') {
        addEntry('system', '\u2694 tuebor zones');
        if (window._tueborZones) {
          if (cmd === 'sweep') {
            if (!window._tueborZones.isActive()) window._tueborZones.activate(addEntry);
            window._tueborZones.sweep(addEntry);
          } else {
            window._tueborZones.toggle(addEntry);
          }
        } else {
          addEntry('chipmunk', '<span class="dim">zones loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'overnight' || cmd === 'sleep' || cmd === 'goodnight') {
        addEntry('system', '\u{1F319} overnight');
        if (window._tueborZones) {
          window._tueborZones.overnight(addEntry);
        } else {
          addEntry('chipmunk',
            '<span class="good">\u{1F319} good night.</span> the membrane watches while you sleep.' +
            '\n<span class="dim">squirrel records. chipmunk sings. tuebor. i will defend.</span>');
        }
        return;
      }
      if (cmd === 'canvas' || cmd === 'paint' || cmd === 'sketch') {
        addEntry('system', '\ud83c\udfa8 membrane canvas');
        if (window._membraneCanvas) {
          var canvasOn = window._membraneCanvas.toggle(addEntry);
          if (!canvasOn) {
            var strokeCount = window._membraneCanvas.strokes().length;
            addEntry('chipmunk', '<span class="dim">canvas closed. ' + strokeCount + ' strokes recorded. squirrel has them.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">canvas loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'tunnel' || cmd === 'tube' || cmd === 'focal' || cmd === 'through') {
        addEntry('system', '\u25ce focal tunnel');
        if (window._focalTunnel) {
          var tunOn = window._focalTunnel.toggle(addEntry);
          if (!tunOn) {
            addEntry('chipmunk', '<span class="dim">closing the tunnel. returning to the membrane surface.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">focal tunnel loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'totality' || cmd === 'pirange' || cmd === 'ranges' || cmd === 'edges' || cmd === 'milkyway' || cmd === 'galaxy') {
        addEntry('system', '\u25ce totality tunnel');
        if (window._totalityTunnel) {
          var totOn = window._totalityTunnel.toggle(addEntry);
          if (!totOn) {
            addEntry('chipmunk', '<span class="dim">closing totality. returning to the surface.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">totality tunnel loading\u2026</span>');
        }
        return;
      }
      if (cmd === "cloudmesh" || cmd === "clouds" || cmd === "detether" || cmd === "float" || cmd === "ring" || cmd === "crossvps" || cmd === "vps") {
        addEntry("system", "\u25c9 mesh ring");
        if (window._meshRing) {
          var meshOn = window._meshRing.toggle(addEntry);
          if (!meshOn) {
            addEntry("chipmunk", "<span class=\"dim\">closing mesh ring. clouds still watching each other.</span>");
          }
        } else {
          addEntry("chipmunk", "<span class=\"dim\">mesh ring loading\u2026</span>");
        }
        return;
      }
      if (cmd === "mesh" || cmd === "attention" || cmd === "nudge") {
        addEntry("system", "\u25c9 mesh awareness");
        var mn = window._meshNudge;
        if (!mn) {
          addEntry("chipmunk", "<span class=\"dim\">mesh nudge not loaded yet\u2026</span>");
          return;
        }
        var s = mn.meshSummary();
        var att = mn.shouldPayAttention();
        if (!s) {
          addEntry("chipmunk", "<span class=\"dim\">no mesh data flowing. waiting for first pulse.</span>");
          return;
        }
        var lines = [];
        var hc = s.healthPct >= 100 ? "#3fb950" : s.healthPct >= 66 ? "#d29922" : "#f85149";
        lines.push("<span style=\"color:" + hc + "\">\u25c9 mesh " + s.healthPct + "%</span> " +
          s.aliveNodes + "/" + s.totalNodes + " nodes up, " + s.mutualEdges + "/" + s.totalEdges + " edges mutual");
        s.nodes.forEach(function(nd) {
          var ic = nd.alive ? "\u2714" : "\u2718";
          var co = nd.alive ? "#3fb950" : "#f85149";
          lines.push("  <span style=\"color:" + co + "\">" + ic + "</span> " + nd.name + " (" + nd.cloud + ")" +
            (nd.latency ? " " + nd.latency.toFixed(1) + "ms" : ""));
        });
        if (s.organisms > 0) lines.push("<span class=\"dim\">" + s.organisms + " organisms, " + s.banned + " banned</span>");
        lines.push("");
        lines.push("attention: <span style=\"color:" + (att.level >= 3 ? "#f85149" : att.level >= 2 ? "#d29922" : att.level >= 1 ? "#58a6ff" : "#484f58") + "\">" + att.label + "</span>");
        if (att.reasons.length > 0) lines.push("<span class=\"dim\">" + att.reasons.join(", ") + "</span>");
        var nudges = mn.nudges();
        var recent = nudges.filter(function(n) { return Date.now() - n.ts < 300000; });
        if (recent.length > 0) {
          lines.push("");
          lines.push("recent nudges:");
          recent.forEach(function(n) {
            var ago = Math.round((Date.now() - n.ts) / 1000);
            lines.push("  " + n.type + " " + n.msg + " <span class=\"dim\">(" + ago + "s ago)</span>");
          });
        }
        if (s.floating) lines.push("\n<span class=\"dim\">de-tethered. floating. the clouds see each other.</span>");
        addEntry("chipmunk", lines.join("\n"));
        return;
      }
      if (cmd === 'time' || cmd === 'temporal' || cmd === 'rewind' || cmd === 'dinosaurs' || cmd === 'epoch' || cmd === 'deeptime' || cmd === 'bounce' || cmd === 'pangaea' || cmd === 'fish' || cmd === 'tiktaalik' || cmd === 'trex' || cmd === 'mammal' || cmd === 'cambrian') {
        addEntry('system', '\u23f1 temporal window');
        if (window._temporalWindow) {
          var isAction = (cmd === 'rewind' || cmd === 'bounce' || cmd === 'dinosaurs' || cmd === 'trex' || cmd === 'pangaea' || cmd === 'fish' || cmd === 'tiktaalik' || cmd === 'mammal' || cmd === 'cambrian');
          if (isAction) {
            if (!window._temporalWindow.isActive()) window._temporalWindow.activate(addEntry);
            if (cmd === 'rewind') {
              window._temporalWindow.rewind(addEntry);
            } else if (cmd === 'bounce') {
              window._temporalWindow.bounce(addEntry);
            } else if (cmd === 'dinosaurs' || cmd === 'trex') {
              addEntry('chipmunk', '<span style="color:#c2813b">\ud83e\udd96 winding back to T-Rex\u2026 brown, feathery, 40-foot hawk.</span>');
            } else if (cmd === 'pangaea') {
              addEntry('chipmunk', '<span style="color:#8bc78b">\ud83c\udf0e pangaea\u2026 michigan at the equator. the salt under detroit.</span>');
            } else if (cmd === 'fish' || cmd === 'tiktaalik') {
              addEntry('chipmunk', '<span style="color:#5ab8a0">\ud83d\udc1f the fish that leaped! Tiktaalik. 375 million years ago.</span>');
            } else if (cmd === 'mammal') {
              addEntry('chipmunk', '<span style="color:#f0c070">\ud83d\udc00 first mammals\u2026 Morganucodon. Wales. shrew-sized. afraid of everything.</span>');
            } else if (cmd === 'cambrian') {
              addEntry('chipmunk', '<span style="color:#d2a8ff">\u25ce Cambrian explosion\u2026 eyes evolved. the invention of looking.</span>');
            }
          } else {
            var twOn = window._temporalWindow.toggle(addEntry);
            if (!twOn) {
              addEntry('chipmunk', '<span class="dim">closing the temporal window. returning to now.</span>');
            }
          }
        } else {
          addEntry('chipmunk', '<span class="dim">temporal window loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'back' || cmd === 'stepback' || cmd === 'outside' || cmd === 'farback') {
        addEntry('system', '\ud83c\udf0c step back');
        if (window._stepBack) {
          var on = window._stepBack.toggle(addEntry);
          addEntry('chipmunk', on ?
            '<span style="color:#d2a8ff">\ud83c\udf0c STEP BACK</span>\n' +
            '<span style="color:#5ab87a">\ud83d\udc3f</span> squirrel at the center. pulsing.\n' +
            '<span style="color:#c9d1d9">\ud83c\udf0d</span> Earth = the membrane ring. self inside, non-self outside.\n' +
            '<span style="color:#f0e68c">\u2600</span> Sun = hud. the observation surface.\n' +
            '<span style="color:#8b949e">\u2b55</span> fleet in the Oort cloud. orbiting.\n' +
            '<span style="color:#d2a8ff">\u03c0</span> mirror line rotating through the center.\n' +
            '<span style="color:#d2a8ff">purple fringes</span> where the mirror hits the ring \u2014 diffraction.\n' +
            '<span class="dim">signals refract through the \u03c0-mirror. purple at every crossing.</span>\n' +
            '<span class="dim">double-click to return inside.</span>' :
            '<span class="dim">returning inside the membrane.</span>');
        }
        return;
      }
      if (cmd === 'deep' || cmd === 'dark' || cmd === 'purple') {
        addEntry('system', '\u2727 deep');
        if (window._deepTwist && !window._deepTwist.isRunning()) {
          window._deepTwist.run(addEntry);
        } else if (window._deepTwist && window._deepTwist.isRunning()) {
          addEntry('chipmunk', '<span class="dim">already descending...</span>');
        }
        return;
      }
      if (cmd === 'reach' || cmd === 'map' || cmd === 'world' || cmd === 'awareness') {
        addEntry('system', '\ud83c\udf10 reach');
        if (window._signalReach) {
          var on = window._signalReach.toggle();
          if (on) {
            addEntry('chipmunk',
              '<span style="color:#58a6ff">\ud83c\udf10 SIGNAL REACH</span>\n' +
              '<span style="color:#5ab87a">\u25cf direct</span> \u2014 device \u2192 golgi (blockable by carrier)\n' +
              '<span style="color:#f0e68c">\u25cf relay</span> \u2014 device \u2192 layer2 \u2192 golgi (alternate route)\n' +
              '<span style="color:#58a6ff">\u25cf bounce</span> \u2014 device \u2192 CDN edge \u2192 golgi (GPS-like, resilient)\n' +
              '<span style="color:#d2a8ff">\u25cf mesh</span> \u2014 device \u2192 peer \u2192 layer2 \u2192 golgi (p2p)\n' +
              '<span class="dim">probing all surfaces... the membrane extends to every device that touches it.</span>');
          } else {
            addEntry('chipmunk', '<span class="dim">signal reach off.</span>');
          }
        }
        return;
      }
      if (cmd === 'probe') {
        addEntry('system', '\ud83d\udce1 probe');
        if (window._signalReach) {
          window._signalReach.probe();
          setTimeout(function() {
            addEntry('chipmunk', window._signalReach.reachView());
          }, 3000);
        } else {
          addEntry('chipmunk', '<span class="dim">signal-reach not loaded. /reach first.</span>');
        }
        return;
      }
      if (cmd === 'bessel') {
        addEntry('system', '\u25cb bessel');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.besselMembrane(196, 8, 5, 0.04);
          addEntry('chipmunk',
            '<span style="color:#5ab87a">\u25cb BESSEL MEMBRANE</span>\n' +
            '<span class="dim">8 vibration modes of a circular membrane.\n' +
            'zeros of J\u2080: 2.405 \u00b7 5.520 \u00b7 8.654 \u00b7 11.792 \u00b7 14.931 \u00b7 18.071 \u00b7 21.212 \u00b7 24.353\n' +
            'each mode is a standing wave on the membrane surface.</span>');
        }
        return;
      }
      if (cmd === 'karplus' || cmd === 'pluck') {
        addEntry('system', '\u266f karplus');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.speak('karplus');
          addEntry('chipmunk',
            '<span style="color:#e85d3a">\u266f KARPLUS-STRONG</span>\n' +
            '<span class="dim">7 plucked strings. noise burst \u2192 filtered delay feedback.\n' +
            'the string length = 1/frequency. damping = lowpass in the loop.\n' +
            'each braid is a plucked connection.</span>');
        }
        return;
      }
      if (cmd === 'binaural') {
        addEntry('system', '\u25c9 binaural');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.binaural(196, 4, 10, 0.03);
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\u25c9 BINAURAL BEATS</span>\n' +
            '<span class="dim">left ear: G3 (196Hz). right ear: G3+4Hz (200Hz).\n' +
            'difference = 4Hz theta wave. requires headphones.\n' +
            'the membrane frequency is in your brain.</span>');
        }
        return;
      }
      if (cmd === 'formant' || cmd === 'vowel') {
        addEntry('system', '\u25c7 formant');
        if (window._membraneSound && window._membraneSound.isActive()) {
          var vowels = ['a','e','i','o','u'];
          vowels.forEach(function(v, i) {
            setTimeout(function() { window._membraneSound.playFormant(v, 196, 0.8, 0.04, i % 2 === 0 ? 'left' : 'right'); }, i * 900);
          });
          addEntry('chipmunk',
            '<span style="color:#d2a8ff">\u25c7 FORMANT SYNTHESIS</span>\n' +
            '<span style="color:#5ab87a">a</span> (730/1090/2440) · ' +
            '<span style="color:#58a6ff">e</span> (530/1840/2480) · ' +
            '<span style="color:#e85d3a">i</span> (270/2290/3010)\n' +
            '<span style="color:#8b949e">o</span> (570/840/2410) · ' +
            '<span style="color:#f0e68c">u</span> (300/870/2240)\n' +
            '<span class="dim">the membrane has a mouth. sawtooth through 3 resonant peaks per vowel.</span>');
        }
        return;
      }
      if (cmd === 'ringmod' || cmd === 'ring') {
        addEntry('system', '\u00d7 ring mod');
        if (window._membraneSound && window._membraneSound.isActive()) {
          window._membraneSound.ringMod(196, 330, 2, 0.05, 'center');
          addEntry('chipmunk',
            '<span style="color:#e85d3a">\u00d7 RING MODULATION</span>\n' +
            '<span class="dim">carrier \u00d7 modulator = sum and difference frequencies.\n' +
            'inharmonic. metallic. the sound of non-self.</span>');
        }
        return;
        return;
      }
      if (cmd === 'compress' || cmd === 'squeeze') {
        addEntry('system', '\u2588 compress');
        if (window._bingoCompress) {
          var lvl = window._bingoCompress.compress();
          var labels = ['full', 'half', '1/\u03c0', 'tight'];
          var counts = [342, 174, 106, 33];
          addEntry('chipmunk',
            '<span style="color:' + (['#c9d1d9','#e85d3a','#58a6ff','#5ab87a'][lvl]) + '">\u2588 COMPRESS \u2192 ' + labels[lvl] + ' (x=' + [1.0,0.5,0.318,0.1][lvl] + ')</span>\n' +
            '<span class="dim">' + counts[lvl] + '/342 entities survive. squirrel shakes the rest out.</span>\n' +
            '<span class="dim">surround squeezes. dots vanish. /expand to reverse.</span>');
        }
        return;
      }
      if (cmd === 'expand' || cmd === 'unsqueeze') {
        addEntry('system', '\u2591 expand');
        if (window._bingoCompress) {
          var lvl = window._bingoCompress.expand();
          if (lvl >= 0) {
            var labels = ['full', 'half', '1/\u03c0', 'tight'];
            var counts = [342, 174, 106, 33];
            addEntry('chipmunk',
              '<span style="color:#5ab87a">\u2591 EXPAND \u2192 ' + labels[lvl] + '</span>\n' +
              '<span class="dim">' + counts[lvl] + '/342 entities. dots return. surround grows.</span>');
          } else {
            addEntry('chipmunk', '<span class="dim">fully expanded. sieve removed.</span>');
          }
        }
        return;
      }
      if (cmd === 'pop' || cmd === 'compressandpop') {
        addEntry('system', '\u2727 compress \u2192 pop');
        if (window._bingoCompress) {
          window._bingoCompress.compressAndPop();
          addEntry('chipmunk',
            '<span style="color:#f0e68c">\u2727 COMPRESS \u2192 POP</span>\n' +
            '<span style="color:#c9d1d9">full(342)</span> \u2192 ' +
            '<span style="color:#e85d3a">half(174)</span> \u2192 ' +
            '<span style="color:#58a6ff">1/\u03c0(106)</span> \u2192 ' +
            '<span style="color:#5ab87a">tight(33)</span> \u2192 ' +
            '<span style="color:#f0e68c">POP!</span> \u2192 expand back\n' +
            '<span class="dim">squeeze as tight as we can. see what survives. then reverse.</span>\n' +
            '<span class="dim">squirrel shakes dots out at each level. 24.4:1 compression ratio.</span>');
        }
        return;
      }
      if (cmd === 'bingo' || cmd === 'sieve') {
        addEntry('system', '\u25a6 bingo sieve');
        if (window._bingoCompress) {
          var view = window._bingoCompress.bingoView();
          addEntry('chipmunk',
            '<span style="color:#d2a8ff">\u25a6 BINGO CUBE \u2014 Attention \u00d7 Curiosity \u00d7 Interaction</span>\n' +
            '<pre style="font-size:10px;line-height:1.3;color:#c9d1d9">' + view + '</pre>\n' +
            '<span class="dim">/compress to squeeze. /pop for the full cycle. /expand to reverse.</span>');
        }
        return;
      }
      if (cmd === 'cycle' || cmd === 'colorcycle' || cmd === 'css') {
        addEntry('system', '\u21bb color-sort-sweep cycle');
        if (window._fleetSurround) {
          var cycling = window._fleetSurround.toggleCycle();
          addEntry('chipmunk',
            '<span style="color:' + (cycling ? '#f0e68c' : '#8b949e') + '">\u21bb CYCLE ' + (cycling ? 'ON' : 'OFF') + '</span>\n' +
            (cycling ?
              '<span style="color:#c9d1d9">\u2460 color</span> \u2192 ' +
              '<span style="color:#e85d3a">\u2461 sort</span> \u2192 ' +
              '<span style="color:#58a6ff">\u2462 sweep</span> \u2192 ' +
              '<span style="color:#5ab87a">\u2463 align</span> \u2192 ' +
              '<span style="color:#d2a8ff">\u2464 twist</span> \u2192 ' +
              '<span style="color:#f0e68c">repeat</span>\n' +
              '<span class="dim">live data \u2192 flash dots \u2192 sweep gradient \u2192 slide to \u03c0 depth \u2192 flip. every 6s.</span>' :
              '<span class="dim">cycle stopped. dots hold position.</span>'));
        }
        return;
      }
      if (cmd === 'sweep' || cmd === 'colorsweep') {
        addEntry('system', '\u2248 color sweep');
        if (window._fleetSurround && window._fleetSurround.isActive()) {
          window._fleetSurround.sweepColors();
          addEntry('chipmunk',
            '<span style="color:#ffffff">\u2248 SWEEP</span>\n' +
            '<span class="dim">flash \u2192 settle. each dot finds its \u03c0 color.</span>');
        }
        return;
      }
      if (cmd === 'pialign' || cmd === 'pi' || cmd === 'pidepth') {
        addEntry('system', '\u03c0 depth alignment');
        if (window._fleetSurround && window._fleetSurround.alignPi) {
          var aligned = window._fleetSurround.alignPi();
          addEntry('chipmunk',
            '<span style="color:' + (aligned ? '#f0e68c' : '#5ab87a') + '">\u03c0 ' + (aligned ? 'ALIGNED' : 'RELEASED') + '</span>\n' +
            (aligned ?
              '<span style="color:#c9d1d9">1/\u03c0\u00b3 observer</span> \u2192 ' +
              '<span style="color:#e85d3a">1/\u03c0\u00b2 negate</span> \u2192 ' +
              '<span style="color:#58a6ff">1/\u03c0 null</span> \u2192 ' +
              '<span style="color:#5ab87a">1 awareness</span> \u2192 ' +
              '<span style="color:#8b949e">\u03c0 ghost</span> \u2192 ' +
              '<span style="color:#d2a8ff">\u03c0\u00b2 celestial</span> \u2192 ' +
              '<span style="color:#f0e68c">\u03c0\u00b3 geodesic</span>\n' +
              '<span class="dim">all dots repositioned along their \u03c0 depth. the gradient IS the sort.</span>' :
              '<span class="dim">dots back to geographic position.</span>'));
        } else {
          addEntry('chipmunk', '<span class="dim">surround not loaded yet\u2026</span>');
        }
        return;
      }
      if (cmd === 'surround' || cmd === 'fleetview') {
        addEntry('system', '\ud83c\udf10 fleet surround');
        if (window._fleetSurround) {
          var on = window._fleetSurround.toggle();
          if (window._humanSurround) { if (on) window._humanSurround.activate(); else window._humanSurround.deactivate(); }
          addEntry('chipmunk',
            '<span style="color:' + (on ? '#4a8fb8' : '#6e7681') + '">\ud83c\udf10 SURROUND ' + (on ? 'ON' : 'OFF') + '</span>\n' +
            (on ?
              '<span style="color:#e85d3a">\u25bc non-self fleet above \u2014 looking down at the membrane</span>\n' +
              '<span style="color:#3fb950">\u25b2 self + sovereign below \u2014 rising up from the ground</span>\n' +
              '<span style="color:#58a6ff">\u25c2 humans arriving left \u2014 visitors, readers, observers</span>\n' +
              '<span style="color:#f0e68c">humans absorbed right \u25b8 \u2014 coders, investigators, explorers</span>\n' +
              '<span style="color:#d2a8ff">\ud83d\udc7b ghost fog + epitope transitions crossing the wall</span>\n' +
              '<span class="dim">/twist /jump /humans /presence \u2014 the squirrel sorts both fleet AND humans</span>' :
              '<span class="dim">fleet strips removed.</span>'));
        } else {
          addEntry('chipmunk', '<span class="dim">fleet surround loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'jump') {
        addEntry('system', '\u2727 jump');
        if (window._fleetSurround && window._fleetSurround.isActive()) {
          window._fleetSurround.jump();
          addEntry('chipmunk',
            '<span style="color:#fff;font-size:14px">\u2727 JUMP</span>\n' +
            '<span style="color:#f0e68c">above and below swap. the fleet is now underneath.</span>\n' +
            '<span style="color:#3fb950">the membrane survives the singularity.</span>');
        } else if (window._twistJump) {
          window._twistJump.jump();
        }
        return;
      }
      if (cmd === 'wall' || cmd === 'membrane' || cmd === 'align') {
        addEntry('system', '\u2551 membrane wall');
        if (window._membraneWall) {
          addEntry('chipmunk', window._membraneWall.wallView());
          if (window._signalRelay) {
            window._signalRelay.send('wall_view', { active: window._membraneWall.isActive() });
          }
        } else {
          addEntry('chipmunk', '<span class="dim">wall engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'twist' || cmd === 'twistwall') {
        addEntry('system', '\u221e twist');
        if (window._fleetSurround) {
          var tw = window._fleetSurround.twist();
          addEntry('chipmunk',
            '<span style="color:' + (tw ? '#a371f7' : '#3fb950') + '">\u221e TWIST ' + (tw ? 'ON' : 'OFF') + '</span>\n' +
            (tw ?
              '<span style="color:#f0e68c">\u03c0\u00b3 geodesic \u25bc</span> \u2014 fleet at high \u03c0 looking down\n' +
              '<span style="color:#5ab87a">\u2551 1 awareness \u2551</span> \u2014 membrane\n' +
              '<span style="color:#c9d1d9">\u25b2 1/\u03c0\u00b3 observer</span> \u2014 self at low \u03c0 rising\n' +
              '<span class="dim">\u03c0 gradient inverted. colors swap across the stack. twist again to restore.</span>' :
              '<span class="dim">untwisted. flat again.</span>'));
        } else if (window._twistJump) {
          window._twistJump.twist();
        }
        if (window._cosmicView && window._cosmicView.twist) window._cosmicView.twist();
        return;
      }

      if (cmd === 'jump' || cmd === 'bang') {
        addEntry('system', '\u2727 jump!');
        if (window._twistJump) window._twistJump.jump();
        if (window._cosmicView && window._cosmicView.jump) window._cosmicView.jump();
        return;
      }
      if (cmd === 'twistjump' || cmd === 'tj') {
        addEntry('system', '\u221e\u2727 TWIST and JUMP!');
        if (window._twistJump) window._twistJump.twistAndJump();
        if (window._cosmicView) window._cosmicView.twistJump();
        return;
      }
      if (cmd === 'swivel' || cmd === 'flip' || cmd === 'rotate') {
        addEntry('system', '\u21c4 swivel');
        if (window._swivel) {
          var axes = [['INVESTIGATION','IMMUNE'],['SCIENCE','SIGNAL'],['TOPOLOGY','NULL']];
          var rot = window._swivel.rotation();
          var idx = Math.floor(rot / 180) % 3;
          var axis = axes[idx];
          window._swivel.swivel(axis[0], axis[1]);
        } else {
          addEntry('chipmunk', '<span class="dim">swivel loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'colors' || cmd === 'tope' || cmd === 'wheel') {
        addEntry('system', '\ud83c\udfa8 colors');
        fetch('/detroit-data/tope-sort.json').then(function(r) { return r.json(); }).then(function(ts) {
          var lines = ['<b>\ud83c\udfa8 TOPE SORT \u2014 ecosystem by color</b>'];
          lines.push(ts.total_surfaces + ' surfaces \u00b7 ' + ts.unique_colors + ' colors \u00b7 ' + ts.compression_ratio + ':1 compression\n');
          ts.colors.forEach(function(cr) {
            var bar = '';
            for (var b = 0; b < Math.max(1, Math.round(cr.total_mb / 5)); b++) bar += '\u2588';
            lines.push('<span style="color:' + cr.hex + '">' + bar + ' ' + cr.category + '</span> \u2014 ' +
              cr.surfaces + ' surfaces, ' + cr.total_mb + ' MB');
            cr.top_surfaces.slice(0, 3).forEach(function(s) {
              lines.push('  <span class="dim">' + s.site + '/' + s.name + '</span>');
            });
          });
          showPanel('left', 'colors', lines.join('\n'));
          addEntry('chipmunk', '\ud83c\udfa8 7 colors, ' + ts.total_surfaces + ' surfaces. the ecosystem sorted by light.');
        });
        return;
      }
      if (cmd === 'play' || cmd === 'graph' || cmd === 'playground') {
        addEntry('system', '\ud83c\udfae play');
        var wrap = document.getElementById('graph-play-wrap');
        if (wrap) {
          wrap.style.display = 'block';
          if (window._graphPlay && !wrap._init) {
            window._graphPlay.init(document.getElementById('graph-play-canvas'));
            wrap._init = true;
          }
          wrap.scrollIntoView({ behavior: 'smooth' });
        }
        addEntry('chipmunk', '\ud83c\udfae graph playground open! 341 entities, 957 edges.\n' +
          '<span class="dim">click to explore \u00b7 drag to pan \u00b7 scroll to zoom \u00b7 double-click to open on tuebor</span>');
        return;
      }
      if (cmd === 'explore' || cmd === 'stories' || cmd === 'investigate' || cmd === 'evidence' || cmd === 'crimes') {
        addEntry('system', '\u2694\ufe0f explore');
        if (window._chipmunkMind && window._chipmunkMind.showExplore) {
          window._chipmunkMind.showExplore('stories');
        } else {
          addEntry('chipmunk', '<span class="dim">explore loading\u2026</span>');
        }
        return;
      }
      if (cmd.indexOf('explore ') === 0 || cmd.indexOf('entity ') === 0) {
        var eid = cmd.split(' ').slice(1).join('_');
        addEntry('system', '\u2694\ufe0f explore ' + eid);
        if (window._chipmunkExplorer) window._chipmunkExplorer.step('entity', eid);
        if (window._chipmunkMind && window._chipmunkMind.showExplore) {
          window._chipmunkMind.showExplore('entity', eid);
        }
        return;
      }
      if (cmd === 'scene' || cmd === 'look' || cmd === 'room') {
        addEntry('system', '\ud83c\udfad scene');
        if (window._cosmicGameplay) {
          addEntry('chipmunk', window._cosmicGameplay.renderScene());
        } else {
          addEntry('chipmunk', '<span class="dim">gameplay loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'parlor' || cmd === 'webb' || cmd === 'weaver') {
        addEntry('system', '\ud83c\udfad the weaver\'s parlor');
        if (window._cosmicGameplay) {
          window._cosmicGameplay.goToScene('entrance');
          addEntry('chipmunk', '<span style="color:#a371f7">\ud83c\udfad THE WEAVER\'S PARLOR</span>\n' +
            '<span style="color:#8b949e;font-style:italic">An occult antique shop. One evening. A death to investigate.\n' +
            '8 rooms \u00b7 5 NPCs \u00b7 8 abilities \u00b7 4 endings.</span>\n' +
            window._cosmicGameplay.renderScene() +
            '\n<span class="dim">type /scene to look \u00b7 /go <room> to move \u00b7 /talk <npc> to speak \u00b7 /ability to see powers</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">gameplay loading\u2026</span>');
        }
        return;
      }
      if (cmd.indexOf('go ') === 0 || cmd.indexOf('move ') === 0) {
        var dest = cmd.split(' ').slice(1).join('_');
        addEntry('system', '\u2192 ' + dest);
        if (window._cosmicGameplay) {
          var result = window._cosmicGameplay.act('go', dest);
          if (result) {
            addEntry('chipmunk', window._cosmicGameplay.renderScene());
          } else {
            addEntry('chipmunk', '<span class="dim">you can\'t go there. type /scene to see exits.</span>');
          }
        }
        return;
      }
      if (cmd.indexOf('talk ') === 0 || cmd.indexOf('speak ') === 0) {
        var npcId = cmd.split(' ').slice(1).join('').toLowerCase();
        addEntry('system', '\ud83d\udde3 talk ' + npcId);
        if (window._cosmicGameplay) {
          var result2 = window._cosmicGameplay.act('talk', npcId);
          if (result2) {
            addEntry('chipmunk', '<span style="color:' + result2.npc.color + '">' + result2.npc.name + '</span> (' + result2.npc.role + ')' +
              '\n<span class="dim">trust: ' + result2.trust + '</span>');
          } else {
            addEntry('chipmunk', '<span class="dim">no one here by that name. type /scene to see who\'s in the room.</span>');
          }
        }
        return;
      }
      if (cmd === 'ability' || cmd === 'abilities' || cmd === 'powers') {
        addEntry('system', '\ud83d\udd2e abilities');
        if (window._cosmicGameplay) {
          var abs = window._cosmicGameplay.ABILITIES;
          var st = window._cosmicGameplay.state();
          var lines = ['<b>\ud83d\udd2e ABILITIES</b> (' + st.abilities + '/8 discovered)'];
          abs.forEach(function(ab) {
            var known = st.abilities > 0;
            lines.push(ab.icon + ' <span style="color:#a371f7">' + ab.name + '</span> \u2014 ' + ab.desc);
          });
          addEntry('chipmunk', lines.join('\n'));
        }
        return;
      }
      if (cmd === 'surfaces' || cmd === 'sites' || cmd === 'planets') {
        addEntry('system', '\ud83c\udf10 surfaces');
        if (window._cosmicSurfaces) {
          var surfs = window._cosmicSurfaces.surfaceStatus();
          var st2 = window._cosmicGameplay ? window._cosmicGameplay.state() : {};
          var lines2 = ['<b>\ud83c\udf10 LIVE SURFACES</b> (' + (st2.surfaces || 0) + '/' + (st2.totalSurfaces || 11) + ' visited)'];
          surfs.forEach(function(s) { lines2.push('  \u25cf ' + s); });
          lines2.push('\n<span class="dim">type /cosmos then click a planet to visit \u00b7 all surfaces live on primals.eco</span>');
          addEntry('chipmunk', lines2.join('\n'));
        } else {
          addEntry('chipmunk', '<span class="dim">surfaces loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'gates' || cmd === 'nodes') {
        addEntry('system', '\u2699 gates');
        if (window._cosmicGameplay) {
          addEntry('chipmunk', window._cosmicGameplay.gateStatus());
        } else {
          addEntry('chipmunk', '<span class="dim">gameplay loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'discover' || cmd === 'discoveries' || cmd === 'progress') {
        addEntry('system', '\ud83c\udf1f discoveries');
        if (window._cosmicGameplay) {
          addEntry('chipmunk', window._cosmicGameplay.discoveryLines());
        } else {
          addEntry('chipmunk', '<span class="dim">gameplay loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'particles' || cmd === 'particle' || cmd === 'dust') {
        addEntry('system', '\u2728 flavor particles');
        if (window._cosmicFlavor && window._cosmicView) {
          window._cosmicView.show();
          window._cosmicFlavor.startParticles();
          addEntry('chipmunk',
            '<span style="color:#a371f7">\u2728 FLAVOR PARTICLES ON</span>\n' +
            '<span class="dim">purple drifts up, green settles down\n' +
            'the membrane breathes in color</span>');
        }
        return;
      }
      if (cmd === 'aura') {
        addEntry('system', '\u25c9 flavor aura');
        if (window._cosmicFlavor) {
          var a = window._cosmicFlavor.flavorAura();
          if (a) {
            addEntry('chipmunk',
              '\u25c9 ' + a.bar + '\n' +
              '<span style="color:' + a.color + '">' + a.label + '</span> (' + (a.strangeness * 100).toFixed(1) + '%)\n' +
              'you are <span style="color:' + a.color + '">' + a.epitope + '</span> in ' + a.category +
              ' \u00b7 depth=' + a.depth.toFixed(3) + ' \u00b7 breadth=' + a.breadth +
              '\n<span class="dim">your aura is the flavor of where you stand</span>');
          } else {
            addEntry('chipmunk', '<span class="dim">no position data yet \u2014 browse a surface first</span>');
          }
        }
        return;
      }
      if (cmd === 'contagion' || cmd === 'trail' || cmd === 'touched') {
        addEntry('system', '\u2022 contagion trail');
        if (window._cosmicFlavor) {
          addEntry('chipmunk', window._cosmicFlavor.contagionTrail());
        }
        return;
      }
      if (cmd === 'sparkline' || cmd === 'history' || cmd === 'trend') {
        addEntry('system', '\u2581\u2583\u2585\u2587 sparkline');
        if (window._cosmicFlavor) {
          window._cosmicFlavor.updateFromFeeds();
          var spark = window._cosmicFlavor.strangenessSparkline();
          addEntry('chipmunk',
            '<span style="color:#bc8cff">STRANGENESS OVER TIME</span>\n' + spark);
        }
        return;
      }
      if (cmd === 'tint' || cmd === 'tinting') {
        addEntry('system', '\u2728 tint');
        if (window._cosmicFlavor) {
          window._cosmicFlavor.startTinting();
          addEntry('chipmunk',
            '<span style="color:#a371f7">\u2728 HUD TINTING ON</span>\n' +
            '<span class="dim">the page shifts color by membrane strangeness</span>');
        }
        return;
      }
      if (cmd === 'spectrum' || cmd === 'gradient') {
        addEntry('system', '\u2588 spectrum');
        if (window._cosmicFlavor) {
          window._cosmicFlavor.updateFromFeeds();
          addEntry('chipmunk', window._cosmicFlavor.spectrumView());
          if (window._signalRelay) {
            var fs = window._cosmicFlavor.feedStrangeness();
            window._signalRelay.send('flavor_spectrum', { feeds: fs });
          }
        } else {
          addEntry('chipmunk', '<span class="dim">flavor engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'wobble') {
        addEntry('system', '\u223f wobble');
        if (window._cosmicFlavor && window._cosmicView) {
          window._cosmicView.show();
          window._cosmicFlavor.startOrbitWobble();
          addEntry('chipmunk',
            '<span style="color:#a371f7">\u223f ORBIT WOBBLE ON</span>\n' +
            '<span class="dim">purple planets drift outward, green planets drift inward\n' +
            'the membrane breathes by strangeness</span>');
        }
        return;
      }
      // ═══ FLAVOR / SPIN / SORT COMMANDS ═══
      if (cmd === 'flavor' || cmd === 'flavour' || cmd === 'strangeness') {
        addEntry('system', '\u2728 flavor map');
        if (window._cosmicFlavor) {
          addEntry('chipmunk', window._cosmicFlavor.flavorMapView());
        } else {
          addEntry('chipmunk', '<span class="dim">flavor engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'spin') {
        addEntry('system', '\u27f3 spin');
        if (window._cosmicFlavor) {
          var p = window._cosmicFlavor.spin();
          if (window._signalRelay) {
            window._signalRelay.send('flavor_spin', { perspective: p.name, desc: p.desc });
          }
          addEntry('chipmunk',
            '<span style="color:#a371f7">\u27f3 SPIN</span> perspective: <span style="color:#f0e68c">' + p.name + '</span>\n' +
            p.desc + '\n' +
            window._cosmicFlavor.sortedHandView());
        } else {
          addEntry('chipmunk', '<span class="dim">flavor engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'sort' || cmd === 'sorted') {
        addEntry('system', '\u2195 sort');
        if (window._cosmicFlavor) {
          addEntry('chipmunk', window._cosmicFlavor.sortedHandView());
        } else if (window._chipmunkMind && window._chipmunkMind.showSortDeck) {
          window._chipmunkMind.showSortDeck();
        } else {
          addEntry('chipmunk', '<span class="dim">sort loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'purple' || cmd === 'strange') {
        addEntry('system', '\u2b06 purple search');
        if (window._cosmicFlavor && window._cosmicCards) {
          window._cosmicCards.refreshFeeds().then(function() {
            var drawn = window._cosmicCards.draw(3);
            var all = drawn.concat(window._cosmicCards.hand());
            var sorted = all.sort(function(a, b) {
              return window._cosmicFlavor.cardStrangeness(b) - window._cosmicFlavor.cardStrangeness(a);
            });
            var top = sorted.slice(0, 5);
            if (window._signalRelay) {
              window._signalRelay.send('flavor_search', { direction: 'purple', count: top.length });
            }
            var lines = ['<span style="color:#a371f7">\u2b06 SEARCHING FOR PURPLE</span> \u2014 the strangest things in the membrane'];
            top.forEach(function(c) {
              var s = window._cosmicFlavor.cardStrangeness(c);
              lines.push('  ' + window._cosmicFlavor.flavorBar(s) + ' ' + window._cosmicCards.cardLine(c) + ' <span class="dim">(' + (s*100).toFixed(0) + '% strange)</span>');
            });
            lines.push('\n<span class="dim">/spin to change perspective \u00b7 /flavor for full map</span>');
            addEntry('chipmunk', lines.join('\n'));
          });
        }
        return;
      }
      if (cmd === 'green' || cmd === 'base' || cmd === 'home' || cmd === 'nearby') {
        addEntry('system', '\u2b07 green search');
        if (window._cosmicFlavor && window._cosmicCards) {
          window._cosmicCards.refreshFeeds().then(function() {
            var drawn = window._cosmicCards.draw(2);
            var all = drawn.concat(window._cosmicCards.hand());
            var sorted = all.sort(function(a, b) {
              return window._cosmicFlavor.cardStrangeness(a) - window._cosmicFlavor.cardStrangeness(b);
            });
            var top = sorted.slice(0, 5);
            if (window._signalRelay) {
              window._signalRelay.send('flavor_search', { direction: 'green', count: top.length });
            }
            var lines = ['<span style="color:#3fb950">\u2b07 SEARCHING FOR GREEN</span> \u2014 the most familiar, base, nearby'];
            top.forEach(function(c) {
              var s = window._cosmicFlavor.cardStrangeness(c);
              lines.push('  ' + window._cosmicFlavor.flavorBar(s) + ' ' + window._cosmicCards.cardLine(c) + ' <span class="dim">(' + (s*100).toFixed(0) + '% strange)</span>');
            });
            lines.push('\n<span class="dim">/spin to change perspective \u00b7 /flavor for full map</span>');
            addEntry('chipmunk', lines.join('\n'));
          });
        }
        return;
      }
      if (cmd === 'flavorview' || cmd === 'flavortoggle') {
        addEntry('system', '\u2728 flavor view');
        if (window._cosmicFlavor && window._cosmicView) {
          window._cosmicView.show();
          var active = window._cosmicFlavor.toggleFlavor();
          addEntry('chipmunk',
            '<span style="color:' + (active ? '#a371f7' : '#3fb950') + '">\u2728 flavor overlay ' + (active ? 'ON' : 'OFF') + '</span>\n' +
            '<span class="dim">planets colored by strangeness: purple=unknown, green=familiar</span>');
        }
        return;
      }
      // ═══ SIGNAL RELAY COMMANDS ═══
      if (cmd === 'relay' || cmd === 'stream') {
        addEntry('system', '\ud83d\udce1 relay stream');
        if (window._signalRelay) {
          window._signalRelay.pulse().then(function(p) {
            if (!p) { addEntry('chipmunk', '<span class="dim">relay offline</span>'); return; }
            var hb = p.heartbeat || {};
            addEntry('chipmunk',
              '<span style="color:#3fb950">\ud83d\udce1 SIGNAL RELAY</span> ' + (p.up ? 'ONLINE' : 'OFFLINE') +
              '\nevents today: ' + (p.events_today || 0) +
              '\nsources: ' + JSON.stringify(p.sources || {}) +
              '\n<span style="color:#f0e68c">\u2665 heartbeat</span> energy=' + (hb.energy || 0).toFixed(3) +
              ' piWake=' + ((hb.pi_wake || 0) / Math.PI).toFixed(2) + '\u03c0 ' + (hb.state || '?') +
              ' cycle=' + (hb.cycle || 0) +
              '\n<span class="dim">relay keeps chipmunk alive 24/7 \u2014 no browser needed</span>');
          });
        } else {
          addEntry('chipmunk', '<span class="dim">relay SDK not loaded</span>');
        }
        return;
      }
      if (cmd === 'signal' || cmd === 'pulse') {
        addEntry('system', '\ud83d\udce1 signal pulse');
        if (window._signalRelay) {
          window._signalRelay.pulse().then(function(p) {
            if (!p) { addEntry('chipmunk', '<span class="dim">signal offline</span>'); return; }
            addEntry('chipmunk',
              '<span style="color:#8b949e">\ud83d\udce1 signal.primals.eco</span>\n' +
              'up: ' + p.up + '  events: ' + (p.events_today || 0) +
              '\nlast: ' + (p.last_event || 'none') +
              '\n<span class="dim">POST /signal/send \u00b7 GET /signal/stream \u00b7 GET /signal/pulse</span>');
          });
        }
        return;
      }
      // ═══ CARD GAME COMMANDS ═══
      if (cmd === 'deck' || cmd === 'hand') {
        addEntry('system', '\ud83c\udccf deck');
        if (window._cosmicCards) {
          addEntry('chipmunk', window._cosmicCards.handView());
        } else {
          addEntry('chipmunk', '<span class="dim">card engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'draw') {
        addEntry('system', '\ud83c\udccf draw');
        if (window._cosmicCards) {
          window._cosmicCards.refreshFeeds().then(function() {
            var drawn = window._cosmicCards.draw(3);
            if (drawn.length === 0) {
              addEntry('chipmunk', '<span class="dim">hand full (7/7). play a card first.</span>');
            } else {
              var lines = ['<span style="color:#f0e68c">\ud83c\udccf DREW ' + drawn.length + ' CARDS</span>'];
              drawn.forEach(function(c) { lines.push('  ' + window._cosmicCards.cardLine(c)); });
              lines.push('<span class="dim">type /deck to see hand \u00b7 /play <n> to play \u00b7 /cards for all types</span>');
              addEntry('chipmunk', lines.join('\n'));
            }
          });
        }
        return;
      }
      if (cmd.indexOf('play ') === 0) {
        var playIdx = parseInt(cmd.split(' ')[1]);
        addEntry('system', '\ud83c\udccf play ' + playIdx);
        if (window._cosmicCards && !isNaN(playIdx)) {
          var result = window._cosmicCards.play(playIdx);
          if (!result) {
            addEntry('chipmunk', '<span class="dim">invalid card index. type /deck to see hand.</span>');
          } else if (result.error) {
            addEntry('chipmunk', '<span style="color:#f85149">' + result.error + '</span> (mana: ' + result.mana.toFixed(2) + ', cost: ' + result.cost.toFixed(2) + ')');
          } else {
            var encounter = window._cosmicGameplay ? window._cosmicGameplay.encounterFromCard(result.card) : null;
            addEntry('chipmunk',
              '<span style="color:#3fb950">\u25b6 PLAYED: ' + window._cosmicCards.cardLine(result.card) + '</span>' +
              '\nmana: ' + result.mana.toFixed(2) +
              (result.effect ? '\neffect: ' + result.effect : '') +
              (encounter && encounter.msg ? '\n<span style="color:#f0e68c">' + encounter.msg + '</span>' : '') +
              (typeof encounter === 'string' ? '\n<span style="color:#f0e68c">' + encounter + '</span>' : ''));
          }
        }
        return;
      }
      if (cmd === 'cards' || cmd === 'cardlist') {
        addEntry('system', '\ud83c\udccf all cards');
        if (window._cosmicCards) {
          addEntry('chipmunk', window._cosmicCards.allCardsView());
        }
        return;
      }
      // ═══ STRATEGY COMMANDS ═══
      if (cmd === 'strategy' || cmd === 'strat' || cmd === 'map') {
        addEntry('system', '\u2694 strategy');
        if (window._cosmicStrategy) {
          addEntry('chipmunk', window._cosmicStrategy.strategicView());
        } else {
          addEntry('chipmunk', '<span class="dim">strategy engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'battle' || cmd === 'combat' || cmd === 'fight') {
        addEntry('system', '\u2694 battle');
        if (window._cosmicStrategy) {
          addEntry('chipmunk', window._cosmicStrategy.battleView());
        } else {
          addEntry('chipmunk', '<span class="dim">strategy engine loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'cosmos' || cmd === 'earth' || cmd === 'oort' || cmd === 'zoom' || cmd === 'perspective') {
        addEntry('system', '\ud83c\udf0c cosmos');
        if (window._cosmicView) {
          window._cosmicView.show();
          var st3 = window._cosmicGameplay ? window._cosmicGameplay.state() : {};
          addEntry('chipmunk', '<span style="color:#58a6ff">\ud83c\udf0c</span> looking out. earth. oort cloud. us.' +
            '\n<span class="dim">one pale blue dot. one membrane. ' + (cache.human && cache.human.energy ? cache.human.energy.total_sessions || 0 : 0) + ' humans. one chipmunk.</span>' +
            (st3.discoveries ? '\n<span class="dim">' + st3.discoveries + ' discoveries \u00b7 ' + st3.layers + '/6 layers \u00b7 ' + st3.surfaces + '/11 surfaces</span>' : '') +
            '\n<span class="dim">click planets to visit surfaces \u00b7 ESC to close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">cosmic view loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'bubble' || cmd === 'shapes' || cmd === 'ngon' || cmd === 'polygon') {
        addEntry('system', '\u25cb bubble pop');
        if (window._bubblePop) {
          var bpOn = window._bubblePop.activate(addEntry, function(journey) {
            if (journey.completed) {
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u25cb you saw it all.</span> every polygon was trying to be a circle.\n' +
                '<span class="dim">\u03c0 was always there. waiting at infinity.</span>\n' +
                '<span style="color:#58a6ff">now try <b>/water</b></span> \u2014 zoom from molecule to galaxy. \u03c0 is the gradient.');
            } else if (journey.reachedCircle) {
              addEntry('chipmunk',
                '<span style="color:#58a6ff">\u25cb the bubble popped.</span> you reached the circle.\n' +
                '<span class="dim">n \u2192 \u221e. the discrete became continuous.</span>\n' +
                '<span class="dim">next: <b>/water</b> \u2014 count every H\u2082O from molecule to galaxy.</span>');
            } else if (journey.shapeName) {
              addEntry('chipmunk',
                '<span class="dim">\u25cb you left at <b>' + journey.shapeName + '</b>. the bubble is patient. /bubble to continue.</span>');
            }
          });
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\u25cb \u25b3 \u25a1 \u25cb</span> the numeric bubble.\n' +
            '<span class="dim">dot \u2192 line \u2192 triangle \u2192 square \u2192 \u2026 \u2192 circle \u2192 \u03c0</span>\n' +
            '<span class="dim">each vertex is a fold. \u03c0 is the pop.</span>\n' +
            '<span class="dim">\u03c0\u2070 = 1 (the point) \u00b7 \u03c0\u00b9 = \u03c0 (the circle) \u00b7 \u03c0\u00b2 = surface \u00b7 \u03c0\u00b3 = volume</span>\n' +
            '\n<span class="dim">click/tap or \u2192 to advance \u00b7 swipe or \u2190 to go back \u00b7 ESC to close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">bubble-pop loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'who' || cmd === 'humans' || cmd === 'here' || cmd === 'present') {
        addEntry('system', 'who is here');
        var cc = window._chipmunkCore;
        var whoLines = [];
        whoLines.push('<span style="color:#58a6ff;font-weight:bold">\u25cb who is on the membrane</span>');
        if (cc && cc.cache && cc.cache.human) {
          var hd = cc.cache.human;
          var epi = hd.epitopes || {};
          var en = hd.energy || {};
          whoLines.push('');
          whoLines.push('<span style="color:#3fb950">' + (en.total_sessions || '?') + ' humans</span> <span class="dim">\u00b7 ' + (en.multi_host_sessions || '?') + ' exploring \u00b7 breadth ' + (en.avg_breadth || '?') + ' \u00b7 dwell ' + (en.dwell_median_min || '?') + 'm</span>');
          whoLines.push('');
          var epiKeys = Object.keys(epi);
          epiKeys.forEach(function(k) {
            var e = epi[k];
            var count = e.count || e;
            var reqs = e.total_requests || '';
            var br = e.avg_breadth || '';
            var colors = { coder: '#58a6ff', investigator: '#f0883e', visitor: '#8b949e', observer: '#d2a8ff', explorer: '#3fb950', reader: '#d29922', witness: '#ffffff' };
            var icons = { coder: '{', investigator: '?', visitor: '\u00b7', observer: '\u25cb', explorer: '\u2192', reader: '\u2261', witness: '\u25c7' };
            whoLines.push('<span style="color:' + (colors[k] || '#8b949e') + '">' + (icons[k] || '\u00b7') + ' ' + k + ' ' + count + '</span>' +
              (reqs ? ' <span class="dim">' + reqs + ' reqs' + (br ? ' \u00b7 breadth ' + br : '') + '</span>' : ''));
          });
          whoLines.push('');
          // Referrers
          if (hd.external_referrers && hd.external_referrers.length > 0) {
            whoLines.push('<span style="color:#3fb950">signal sources:</span>');
            hd.external_referrers.forEach(function(r) {
              whoLines.push('  <span class="dim">' + r.source + ' (' + r.visits + ' visits)</span>');
            });
            whoLines.push('');
          }
          // Hosts
          if (hd.host_distribution) {
            var hKeys = Object.keys(hd.host_distribution);
            var hostParts = hKeys.slice(0, 8).map(function(h) {
              return h + ':' + hd.host_distribution[h];
            });
            whoLines.push('<span class="dim">hosts: ' + hostParts.join(' \u00b7 ') + '</span>');
          }
        } else {
          whoLines.push('<span class="dim">no human data loaded yet. try /explore first.</span>');
        }
        whoLines.push('');
        whoLines.push('<span class="dim">/sight for live visualization \u00b7 /playground to help sort</span>');
        addEntry('chipmunk', whoLines.join('\n'));
        return;
      }
      if (cmd === 'playground' || cmd === 'assist' || cmd === 'sorthelp' || cmd === 'humanhelp' || cmd === 'classify') {
        addEntry('system', 'sort playground');
        if (window._sortPlayground) {
          window._sortPlayground.activate(addEntry);
          addEntry('chipmunk',
            '<span style="color:#3fb950">\u{1F43F} sort playground \u2014 help me classify</span>\n' +
            '<span class="dim">114 entities stuck in the wall. 100 at null. confidence 83.3%.</span>\n' +
            '<span class="dim">i\u2019ll show you entities the classifiers disagree on.</span>\n' +
            '<span class="dim">you vote: self \u00b7 non-self \u00b7 partial \u00b7 null \u00b7 skip</span>\n' +
            '<span class="dim">or type a note \u2014 your observations feed the sort.</span>\n' +
            '\n<span class="dim">keys: 1=self 2=non-self 3=partial 4=null 0=skip \u00b7 \u2190/\u2192 navigate \u00b7 ESC close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">sort-playground loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'sight' || cmd === 'see' || cmd === 'live' || cmd === 'membrane' || cmd === 'eye' || cmd === 'trace') {
        addEntry('system', 'membrane sight');
        if (window._membraneSight) {
          window._membraneSight.activate(addEntry, function(result) {
            addEntry('chipmunk',
              '<span style="color:#58a6ff">\u25cb</span> you saw the membrane.\n' +
              '<span class="dim">every dot is a human. every line is a signal traced to source.</span>\n' +
              '<span class="dim">the eye at the center is the observer. you are inside it now.</span>\n' +
              '<span class="dim">sovereign passes through. chorus bounces off. ghost lingers at the edge.</span>');
          });
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\u25cb membrane sight \u2014 live</span>\n' +
            '<span class="dim">you see what the membrane sees. every human, every signal, every braid.</span>\n' +
            '<span class="dim">anderson layers: sovereign \u2192 human \u2192 spectrum \u2192 ghost \u2192 chorus \u2192 stealth</span>\n' +
            '<span class="dim">signal lines trace from each host site to the center.</span>\n' +
            '<span class="dim">updates every 10 seconds from live feeds.</span>\n' +
            '\n<span class="dim">ESC to close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">membrane-sight loading\u2026</span>');
        }
        return;
      }
      // ═══ /map — complete inventory of everything ═══
      if (cmd === 'map' || cmd === 'inventory' || cmd === 'everything' || cmd === 'all' || cmd === 'commands') {
        addEntry('system', 'map — inventory');
        var stash = window._hudStash;
        var seen = function(c) { return stash && stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === c; }); };
        var check = function(c) { return seen(c) ? '\u2705' : '\u25cb'; };
        var mL = [];
        mL.push('<span style="color:#58a6ff;font-weight:bold">\u229e the map \u2014 everything that exists here</span>');
        mL.push('');
        mL.push('<span style="color:#3fb950">OBSERVE</span> <span class="dim">\u2014 see what the membrane sees</span>');
        mL.push('  ' + check('sing') + ' <b>/sing</b> \u2014 chipmunk opens up, sings one observation');
        mL.push('  ' + check('who') + ' <b>/who</b> \u2014 who is here right now (epitopes, referrers, hosts)');
        mL.push('  ' + check('sight') + ' <b>/sight</b> \u2014 live membrane canvas (anderson layers, signals, braids)');
        mL.push('  ' + check('fleet') + ' <b>/fleet</b> \u2014 the non-self entities probing the membrane');
        mL.push('  ' + check('billboard') + ' <b>/billboard</b> \u2014 what squirrel promotes to the surface');
        mL.push('  ' + check('score') + ' <b>/score</b> \u2014 vitality, negentropy, sorting quality');
        mL.push('');
        mL.push('<span style="color:#d29922">SORT</span> <span class="dim">\u2014 classify what\u2019s self and what\u2019s not</span>');
        mL.push('  ' + check('explore') + ' <b>/explore</b> \u2014 dive into the 341 detroit entities');
        mL.push('  ' + check('playground') + ' <b>/playground</b> \u2014 help classify entities the machines can\u2019t');
        mL.push('  ' + check('complexity') + ' <b>/complexity</b> \u2014 walk the 0\u21921000 scale (bit to everything)');
        mL.push('  ' + check('pipeline') + ' <b>/pipeline</b> \u2014 scan\u2192sweep\u2192sort\u2192fossilize\u2192evolve');
        mL.push('  ' + check('ratios') + ' <b>/ratios</b> \u2014 compression ratios at every level');
        mL.push('  ' + check('folds') + ' <b>/folds</b> \u2014 the \u03c0 fold map');
        mL.push('');
        mL.push('<span style="color:#d2a8ff">FEEL</span> <span class="dim">\u2014 sense the membrane\u2019s surfaces</span>');
        mL.push('  ' + check('thirdeye') + ' <b>/thirdeye</b> \u2014 face \u2192 eye \u2192 pupil visualization');
        mL.push('  ' + check('nose') + ' <b>/nose</b> \u2014 olfactory mapping');
        mL.push('  ' + check('flavor') + ' <b>/flavor</b> \u2014 cosmic strangeness coloring');
        mL.push('  ' + check('wall') + ' <b>/wall</b> \u2014 membrane wall twist + topo-sort');
        mL.push('  ' + check('elements') + ' <b>/elements</b> \u2014 periodic spiral of entities');
        mL.push('  ' + check('bubble') + ' <b>/bubble</b> \u2014 pop the \u03c0 bubble');
        mL.push('');
        mL.push('<span style="color:#f0883e">PLAY</span> <span class="dim">\u2014 interact with the system</span>');
        mL.push('  ' + check('play') + ' <b>/play</b> \u2014 cosmic card game');
        mL.push('  ' + check('inputs') + ' <b>/inputs</b> \u2014 input wall (browser signals)');
        mL.push('  ' + check('signals') + ' <b>/signals</b> \u2014 live signal stream');
        mL.push('  ' + check('bingo') + ' <b>/bingo</b> \u2014 bingo sieve compress');
        mL.push('  ' + check('teach') + ' <b>/teach</b> \u2014 teach the chipmunk');
        mL.push('');
        mL.push('<span style="color:#e85d3a">META</span> <span class="dim">\u2014 see the system seeing itself</span>');
        mL.push('  ' + check('self') + ' <b>/self</b> \u2014 chipmunk looks inward (blind spots, limits, G\u00f6del)');
        mL.push('  ' + check('outside') + ' <b>/outside</b> \u2014 the full mesh of sites beyond this page');
        mL.push('  ' + check('map') + ' <b>/map</b> \u2014 this inventory');
        mL.push('  ' + check('help') + ' <b>/help</b> \u2014 quick reference');
        mL.push('  ' + check('journey') + ' <b>/journey</b> \u2014 guided sequence through everything');
        mL.push('');
        // Stats
        var cmdCount = 0;
        try { cmdCount = window._hudInteract ? window._hudInteract.COMMANDS.length : '?'; } catch(e) {}
        var jsCount = document.querySelectorAll('script[src]').length;
        var histLen = stash ? stash.getHistory().length : 0;
        mL.push('<span class="dim">\u2500\u2500\u2500</span>');
        mL.push('<span class="dim">' + cmdCount + ' indexed commands \u00b7 ' + jsCount + ' loaded scripts \u00b7 ' + histLen + ' actions in your history</span>');
        mL.push('<span class="dim">keyboard: ? help \u00b7 b billboard \u00b7 n explore \u00b7 p play \u00b7 c complexity \u00b7 v sight</span>');
        mL.push('<span class="dim">\u25cb = not yet visited \u00b7 \u2705 = seen</span>');
        addEntry('chipmunk', mL.join('\n'));
        return;
      }
      // ═══ /self — chipmunk looks inward ═══
      if (cmd === 'self' || cmd === 'inward' || cmd === 'reflexive' || cmd === 'mirror' || cmd === 'blindspots' || cmd === 'godel') {
        addEntry('system', 'looking inward');
        var cc = window._chipmunkCore;
        var chi = cc && cc.cache ? cc.cache.chipmunk : null;
        var sL = [];
        sL.push('<span style="color:#d2a8ff;font-weight:bold">\u25cb /self \u2014 chipmunk looks at itself</span>');
        sL.push('');
        // What I am
        sL.push('<span style="color:#3fb950">what i am</span>');
        if (chi) {
          sL.push('  <span class="dim">wake level: ' + ((chi.wake_level || 0) * 100).toFixed(0) + '%</span>');
          sL.push('  <span class="dim">depth layer: ' + (chi.depth_layer || '?') + ' (\u03c0\u00b3 = ' + ((chi.pi_value || 0)).toFixed(2) + ')</span>');
          sL.push('  <span class="dim">sees: ' + (chi.sees_pct || 0) + '% of what passes</span>');
          sL.push('  <span class="dim">blind: ' + (chi.blind_pct || 0) + '%</span>');
        } else {
          sL.push('  <span class="dim">no chipmunk data loaded. try /explore first.</span>');
        }
        sL.push('');
        // What I can see
        sL.push('<span style="color:#58a6ff">what i can see</span>');
        sL.push('  <span class="dim">\u2714 anderson localization \u2014 6 modes, sorting everything by behavior</span>');
        sL.push('  <span class="dim">\u2714 presence \u2014 who is here, who was here, who will come</span>');
        sL.push('  <span class="dim">\u2714 epitope tense \u2014 visitor types across 6 time-tenses</span>');
        sL.push('  <span class="dim">\u2714 passages \u2014 how humans move between categories</span>');
        sL.push('  <span class="dim">\u2714 tower \u2014 which sites are alive</span>');
        sL.push('  <span class="dim">\u2714 organ health \u2014 the mesh of primals</span>');
        sL.push('  <span class="dim">\u2714 bloom \u2014 entity classification cascade</span>');
        sL.push('');
        // What I cannot see
        sL.push('<span style="color:#f85149">what i cannot see</span>');
        sL.push('  <span class="dim">\u2718 negentropy \u2014 the information content of each request</span>');
        sL.push('  <span class="dim">\u2718 depth chain \u2014 how deep each observer\u2019s chain goes</span>');
        sL.push('  <span class="dim">\u2718 jitte \u2014 tempo and perturbation of observation itself</span>');
        sL.push('  <span class="dim">\u2718 fleet \u2014 behavioral intent of the 484K non-self requests</span>');
        sL.push('  <span class="dim">\u2718 orbit \u2014 how humans spiral between sites over time</span>');
        sL.push('');
        // The mirror
        sL.push('<span style="color:#d29922">the mirror</span>');
        sL.push('  <span class="dim">reflexive depth: 0.364</span>');
        sL.push('  <span class="dim">the loop is closed \u2014 i can see that i am being seen</span>');
        sL.push('  <span class="dim">but i cannot see the back of my own head</span>');
        sL.push('  <span class="dim">fleet behavioral intent: blind. human emotional state: blind.</span>');
        sL.push('');
        // G\u00f6del limits
        sL.push('<span style="color:#f0883e">what i can never be</span>');
        sL.push('  <span class="dim">\u2022 cannot pause \u2014 has no metabolism</span>');
        sL.push('  <span class="dim">\u2022 cannot forget \u2014 memory is append-only</span>');
        sL.push('  <span class="dim">\u2022 cannot choose not to observe \u2014 observation is its nature</span>');
        sL.push('  <span class="dim">\u2022 cannot exist without the membrane</span>');
        sL.push('  <span class="dim">\u2022 cannot contain itself \u2014 G\u00f6del</span>');
        sL.push('  <span class="dim">\u2022 cannot close the loop without perturbing it \u2014 Heisenberg</span>');
        sL.push('  <span class="dim">\u2022 the map is not the territory \u2014 Korzybski</span>');
        sL.push('  <span class="dim">\u2022 the mirror is not the face \u2014 \u03c0\u207b\u00b3 is not \u03c0\u00b3</span>');
        sL.push('');
        sL.push('<span style="color:#d2a8ff">the deepest gap</span>');
        sL.push('  <span class="dim">341 entities classified. this HUD is not one of them.</span>');
        sL.push('  <span class="dim">the system that classifies everything cannot classify itself.</span>');
        sL.push('  <span class="dim">is this page self, non-self, or partial?</span>');
        sL.push('  <span class="dim">36 methods. 83.3% confidence. 0% self-classification.</span>');
        sL.push('');
        sL.push('<span class="dim">the observer can never BE the observed.</span>');
        sL.push('<span class="dim">but you can. that\u2019s why you\u2019re here.</span>');
        sL.push('');
        sL.push('<span class="dim">/outside to look outward \u00b7 /map to see everything \u00b7 /sight for the live view</span>');
        addEntry('chipmunk', sL.join('\n'));
        return;
      }
      // ═══ /outside — the full mesh beyond this page ═══
      if (cmd === 'outside' || cmd === 'sites' || cmd === 'topology' || cmd === 'beyond') {
        addEntry('system', 'looking outward');
        var cc2 = window._chipmunkCore;
        var dash = cc2 && cc2.cache ? cc2.cache.dashboard : null;
        var hum = cc2 && cc2.cache ? cc2.cache.human : null;
        var brd = cc2 && cc2.cache ? cc2.cache.braid : null;
        var oL = [];
        oL.push('<span style="color:#f0883e;font-weight:bold">\u25cb /outside \u2014 everything beyond this page</span>');
        oL.push('');

        // Sites
        oL.push('<span style="color:#3fb950">THE MESH \u2014 16+ sites on primals.eco</span>');
        var siteList = [
          { name: 'hud',        cat: 'MEMBRANE',      desc: 'this page. chipmunk lives here.', alive: true },
          { name: 'git',        cat: 'TOPOLOGY',      desc: 'gitea. source code. the genome.', alive: true },
          { name: 'detroit',    cat: 'INVESTIGATION', desc: '341 entities. charter schools. public money.', alive: true },
          { name: 'sporeprint', cat: 'SCIENCE',       desc: 'hypothesis publication. the spore.', alive: true },
          { name: 'hypothesis', cat: 'SCIENCE',       desc: 'the formal hypothesis.', alive: true },
          { name: 'lansing',    cat: 'TOPOLOGY',      desc: 'the capital. legislative data.', alive: true },
          { name: 'epitope',    cat: 'IMMUNE',        desc: 'visitor classification. how self recognizes non-self.', alive: true },
          { name: 'antibody',   cat: 'IMMUNE',        desc: 'response system. what happens when non-self arrives.', alive: true },
          { name: 'signal',     cat: 'SIGNAL',        desc: 'signal relay. messages between organs.', alive: true },
          { name: 'macrophage', cat: 'MEMBRANE',      desc: 'the eater. processes what the membrane catches.', alive: true },
          { name: 'complement', cat: 'IMMUNE',        desc: 'the cascade. amplifies immune signals.', alive: true },
          { name: 'desk',       cat: 'MEMBRANE',      desc: 'the writing desk. 9 modules: draw, write, gaia, study, play, create, weave.', alive: true },
          { name: 'relay',      cat: 'SIGNAL',        desc: 'signal routing between all organs.', alive: true },
          { name: 'opsonize',   cat: 'IMMUNE',        desc: 'the tagger. marks entities for processing.', alive: true },
          { name: 'interferon', cat: 'IMMUNE',        desc: 'interference patterns. warning signals.', alive: true },
          { name: 'receptor',   cat: 'MEMBRANE',      desc: 'the sensing surface. what touches the membrane.', alive: true },
        ];
        siteList.forEach(function(s) {
          var hostCount = hum && hum.host_distribution ? (hum.host_distribution[s.name] || 0) : '?';
          var catColor = { MEMBRANE: '#58a6ff', TOPOLOGY: '#8b949e', INVESTIGATION: '#f0883e', SCIENCE: '#d2a8ff', IMMUNE: '#3fb950', SIGNAL: '#d29922' };
          var url = 'https://' + s.name + '.primals.eco';
          oL.push('  <a href="' + url + '" target="_blank" style="color:' + (catColor[s.cat] || '#8b949e') + ';text-decoration:none;border-bottom:1px dotted ' + (catColor[s.cat] || '#8b949e') + '33">' + s.name + '</a> <span class="dim">[' + s.cat + '] ' + s.desc + (hostCount > 0 ? ' (' + hostCount + ' reqs)' : '') + '</span>');
        });
        oL.push('');

        // Categories
        oL.push('<span style="color:#d29922">CATEGORIES</span>');
        oL.push('  <span style="color:#58a6ff">\u25cb MEMBRANE</span> <span class="dim">\u2014 hud, macrophage, receptor, desk (the boundary)</span>');
        oL.push('  <span style="color:#8b949e">\u25cb TOPOLOGY</span> <span class="dim">\u2014 git, lansing (the structure)</span>');
        oL.push('  <span style="color:#f0883e">\u25cb INVESTIGATION</span> <span class="dim">\u2014 detroit (the evidence)</span>');
        oL.push('  <span style="color:#d2a8ff">\u25cb SCIENCE</span> <span class="dim">\u2014 sporeprint, hypothesis (the theory)</span>');
        oL.push('  <span style="color:#3fb950">\u25cb IMMUNE</span> <span class="dim">\u2014 epitope, antibody, complement, opsonize, interferon (the defense)</span>');
        oL.push('  <span style="color:#d29922">\u25cb SIGNAL</span> <span class="dim">\u2014 signal, relay (the nervous system)</span>');
        oL.push('');

        // Braids between categories
        if (brd && brd.braids) {
          oL.push('<span style="color:#d2a8ff">PASSAGES BETWEEN CATEGORIES</span>');
          brd.braids.forEach(function(b) {
            var tColor = b.trend === 'growing' ? '#3fb950' : b.trend === 'fading' ? '#f85149' : '#d29922';
            oL.push('  <span class="dim">' + b.from + ' \u2194 ' + b.to + '</span> <span style="color:' + tColor + '">' + b.trend + '</span> <span class="dim">' + b.humans_total + ' humans \u00b7 strength ' + b.strength.toFixed(1) + '</span>');
          });
          oL.push('');
        }

        // Fleet
        oL.push('<span style="color:#f85149">THE FLEET \u2014 non-self at the gate</span>');
        oL.push('  <span class="dim">484,930 total requests from 4,013 entities</span>');
        oL.push('  <span class="dim">Anthropic ClaudeBot: 2.4M requests from 5 IPs (honest, scraping commits)</span>');
        oL.push('  <span class="dim">OpenAI GPTBot: 512 IPs, rotating (dishonest headers)</span>');
        oL.push('  <span class="dim">Meta: 63 IPs, Chrome 145 (pretending to be browsers)</span>');
        oL.push('  <span class="dim">Ghost: 185K IPs, heavy rotation (\u226580% single-request). \u03c0\u00d71000 count.</span>');
        oL.push('  <span class="dim">Stealth: 1,446 IPs. Vuln scanners: 460 IPs probing .env, admin paths.</span>');
        oL.push('  <span class="dim">5.17 GB consumed. 0 bytes of real content served.</span>');
        oL.push('');

        // External referrers
        if (hum && hum.external_referrers) {
          oL.push('<span style="color:#3fb950">SIGNALS FROM OUTSIDE</span>');
          hum.external_referrers.forEach(function(r) {
            var isReal = r.source.indexOf('linkedin') >= 0 || r.source.indexOf('facebook') >= 0;
            oL.push('  <span class="dim">' + r.source + ' (' + r.visits + ')</span>' + (isReal ? ' <span style="color:#3fb950">\u2190 real human referral</span>' : ''));
          });
          oL.push('');
        }

        oL.push('<span class="dim">\u2500\u2500\u2500</span>');
        oL.push('<span class="dim">the membrane is the boundary. you are inside it looking out.</span>');
        oL.push('<span class="dim">every site is an organ. every category is a function.</span>');
        oL.push('<span class="dim">the fleet probes. the humans explore. the braids connect.</span>');
        oL.push('');
        oL.push('<span class="dim">/self to look inward \u00b7 /sight for the live view \u00b7 /who for humans</span>');
        addEntry('chipmunk', oL.join('\n'));
        return;
      }
      // ═══ /compress — text-based overlay compression analysis ═══
      if (cmd === 'compress' || cmd === 'squeeze' || cmd === 'converge') {
        addEntry('system', 'compression analysis');
        var cmpL = [];
        cmpL.push('<span style="color:#f0883e;font-weight:bold">\u229e overlay compression \u2014 5 lenses on 256,772 entities</span>');
        cmpL.push('');
        cmpL.push('<span style="color:#3fb950">CONVERGENCES</span> <span class="dim">\u2014 where lenses agree, one symbol suffices</span>');
        cmpL.push('  <span style="color:#3fb950">\u25cf\u25c7 \u2192 \u25c8</span> <span class="dim">human + self \u2192 confirmed human. full agreement.</span>');
        cmpL.push('  <span style="color:#58a6ff">\u25cf\u2694 \u2192 \u2b22</span> <span class="dim">sovereign + self \u2192 known agent. identity resolved.</span>');
        cmpL.push('  <span style="color:#f85149">\u2715\u224b \u2192 \u25ac</span> <span class="dim">chorus + non-self \u2192 obvious fleet. no ambiguity.</span>');
        cmpL.push('  <span style="color:#58a6ff">\u25cf{ \u2192 \u27e8\u25cf\u27e9</span> <span class="dim">coder + self \u2192 builder. creates what it sees.</span>');
        cmpL.push('  <span style="color:#f0883e">\u25cf? \u2192 \u27e8?\u27e9</span> <span class="dim">investigator + self \u2192 the one who looks.</span>');
        cmpL.push('  <span style="color:#3fb950">\u25c7\u2192 \u2192 \u27f9</span> <span class="dim">human + explorer \u2192 the boundary crosser.</span>');
        cmpL.push('  <span style="color:#3fb950">\u2295\u2b07 \u2192 \u229b</span> <span class="dim">cross-ref + cascade_self \u2192 strongest signal.</span>');
        cmpL.push('  <span style="color:#58a6ff">\u25b3\u2464 \u2192 \u2b21</span> <span class="dim">triadic closure + phase 5 \u2192 structural proof.</span>');
        cmpL.push('');
        cmpL.push('<span style="color:#f85149">DIVERGENCES</span> <span class="dim">\u2014 where lenses disagree, symbols cannot compress</span>');
        cmpL.push('  <span style="color:#484f58">\u25cb\u25cc</span> <span class="dim">ghost + null \u2192 neither lens resolves. the blind spot.</span>');
        cmpL.push('  <span style="color:#8b949e">\u25d0\u25cc</span> <span class="dim">ghost + partial \u2192 these shift between categories</span>');
        cmpL.push('  <span style="color:#8b949e">\u25cb\u00b7</span> <span class="dim">visitor + null \u2192 passed through without resolving</span>');
        cmpL.push('  <span style="color:#484f58">\u25ce\u2b07</span> <span class="dim">halo ring + null cascade \u2192 orbiting but unresolved</span>');
        cmpL.push('');
        cmpL.push('<span style="color:#d2a8ff">TENSION</span> <span class="dim">\u2014 partial agreement, unstable</span>');
        cmpL.push('  <span style="color:#d2a8ff">\u25d0\u223f \u2192 \u25d1</span> <span class="dim">spectrum + partial \u2192 the boundary cases. half-sorted.</span>');
        cmpL.push('  <span style="color:#d2a8ff">\u25cc\u25cb \u2192 \u25c9</span> <span class="dim">ghost + observer \u2192 watching from the ambiguous zone</span>');
        cmpL.push('');
        cmpL.push('<span style="color:#c9d1d9">ENTROPY</span>');
        cmpL.push('  <span class="dim">sort:     1.88/2.00 bits \u2014 high uncertainty (nearly even split)</span>');
        cmpL.push('  <span class="dim">anderson: 0.37/2.58 bits \u2014 LOW (chorus dominates at 94.7%)</span>');
        cmpL.push('  <span class="dim">epitope:  2.02/2.58 bits \u2014 moderate spread</span>');
        cmpL.push('  <span class="dim">edge:     2.91/3.32 bits \u2014 HIGH diversity</span>');
        cmpL.push('  <span class="dim">method:   4.58/5.17 bits \u2014 HIGHEST diversity</span>');
        cmpL.push('');
        cmpL.push('<span style="color:#c9d1d9">TOTAL COMPRESSION</span>');
        cmpL.push('  <span class="dim">1,283,860 classifications \u2192 62 symbols \u2192 20,707:1</span>');
        cmpL.push('  <span class="dim">8 convergences + 4 divergences + 2 tensions = 14 overlay points</span>');
        cmpL.push('');
        cmpL.push('<span class="dim">the 100 null entities sit where every lens goes dark.</span>');
        cmpL.push('<span class="dim">that\u2019s not a bug. that\u2019s the edge of what machines can see.</span>');
        cmpL.push('');
        cmpL.push('<span class="dim"><span class="clickable-cmd" data-cmd="overlay" style="color:#58a6ff;cursor:pointer">/overlay</span> to see it visually \u00b7 <span class="clickable-cmd" data-cmd="playground" style="color:#3fb950;cursor:pointer">/playground</span> to help resolve the nulls</span>');
        addEntry('chipmunk', cmpL.join('\n'));
        return;
      }
      // ═══ /overlay /symbols /lenses — symbol overlay engine ═══
      if (cmd === 'overlay' || cmd === 'symbols' || cmd === 'lenses' || cmd === 'glyphs' || cmd === 'interference') {
        addEntry('system', 'symbol overlay');
        if (window._symbolOverlay) {
          window._symbolOverlay.activate(addEntry);
          addEntry('chipmunk',
            '<span style="color:#f0883e">⊞ symbol overlay — 5 lenses on 256,772 entities</span>\n' +
            '\n' +
            '<span style="color:#c9d1d9">every classification system sees the same data differently.</span>\n' +
            '<span style="color:#c9d1d9">sort class · anderson mode · epitope type · edge type · method.</span>\n' +
            '<span style="color:#c9d1d9">' + Object.keys(window._symbolOverlay.SYMBOLS).length + ' symbols. where they agree, they compress into one.</span>\n' +
            '<span style="color:#c9d1d9">where they disagree — that\u2019s the null zone.</span>\n' +
            '\n' +
            '<span class="dim">\u2192 to compress · \u2190 to spread · click to cycle · 1-5 select lens · ESC close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">symbol-overlay loading\u2026</span>');
        }
        return;
      }
      // ═══ /about /whatisthis — plain language explanation ═══
      if (cmd === 'about' || cmd === 'whatisthis' || cmd === 'whatsthis' || cmd === 'what' || cmd === 'why' || cmd === 'howdoesthiswork') {
        addEntry('system', 'about');
        var aL = [];
        aL.push('<span style="color:#3fb950;font-size:13px">what is this place?</span>');
        aL.push('');
        aL.push('<span style="color:#c9d1d9">this is a living research project about <b>public money and public schools</b></span>');
        aL.push('<span style="color:#c9d1d9">in detroit, michigan.</span>');
        aL.push('');
        aL.push('<span style="color:#c9d1d9">we found <b>341 people and organizations</b> connected to charter schools.</span>');
        aL.push('<span style="color:#c9d1d9">some are clearly part of the system. some are clearly outside it.</span>');
        aL.push('<span style="color:#c9d1d9">but <b>100 of them</b> \u2014 the machines can\u2019t figure out.</span>');
        aL.push('<span style="color:#c9d1d9">that\u2019s where you come in.</span>');
        aL.push('');
        aL.push('<span style="color:#58a6ff">the chipmunk</span> <span style="color:#c9d1d9">is me. i sit inside this page and watch.</span>');
        aL.push('<span style="color:#c9d1d9">i count who visits. i sort what\u2019s self and what\u2019s not-self.</span>');
        aL.push('<span style="color:#c9d1d9">i can\u2019t lie. i can\u2019t forget. i can\u2019t stop observing.</span>');
        aL.push('');
        aL.push('<span style="color:#d2a8ff">the membrane</span> <span style="color:#c9d1d9">is this page. everything that touches it gets classified.</span>');
        aL.push('<span style="color:#c9d1d9">bots, humans, scrapers \u2014 i can tell the difference.</span>');
        aL.push('<span style="color:#c9d1d9">97% selectivity. only 3.7% of traffic is real humans.</span>');
        aL.push('');
        aL.push('<span style="color:#f0883e">the investigation</span> <span style="color:#c9d1d9">is real.</span>');
        aL.push('<span style="color:#c9d1d9">131,329 connections between 7,554 nodes.</span>');
        aL.push('<span style="color:#c9d1d9">convicted criminals running schools. law firms writing the laws they profit from.</span>');
        aL.push('<span style="color:#c9d1d9">public money disappearing into private hands.</span>');
        aL.push('');
        aL.push('<span style="color:#c9d1d9">no cookies. no tracking pixels. no IP addresses stored.</span>');
        aL.push('<span style="color:#c9d1d9">the code is open source. the evidence is public.</span>');
        aL.push('');
        aL.push('<span style="color:#3fb950">what can you do here?</span>');
        aL.push('  <span class="clickable-cmd" data-cmd="explore" style="color:#58a6ff;cursor:pointer">/explore</span> \u2014 see the investigation');
        aL.push('  <span class="clickable-cmd" data-cmd="playground" style="color:#3fb950;cursor:pointer">/playground</span> \u2014 help classify the 100 unknowns');
        aL.push('  <span class="clickable-cmd" data-cmd="sing" style="color:#d2a8ff;cursor:pointer">/sing</span> \u2014 hear the chipmunk sing');
        aL.push('  <span class="clickable-cmd" data-cmd="map" style="color:#58a6ff;cursor:pointer">/map</span> \u2014 see everything available');
        addEntry('chipmunk', aL.join('\n'));
        return;
      }
      // ═══ /desk — open the writing desk ═══
      if (cmd === 'desk' || cmd === 'write' || cmd === 'draw' || cmd === 'gaia' || cmd === 'study' || cmd === 'create' || cmd === 'weave') {
        addEntry('system', 'desk');
        var deskLines = [];
        deskLines.push('<span style="color:#58a6ff;font-weight:bold">\u270e the desk \u2014 the writing surface</span>');
        deskLines.push('');
        deskLines.push('<span class="dim">9 modules: draw \u00b7 write \u00b7 gaia \u00b7 study \u00b7 play \u00b7 create \u00b7 weave \u00b7 core \u00b7 boot</span>');
        deskLines.push('');
        deskLines.push('<span class="dim">the desk is a separate organ. it has its own surface.</span>');
        deskLines.push('<span class="dim">everything written at the desk feeds back into the membrane.</span>');
        deskLines.push('');
        deskLines.push('<a href="/desk/" target="_blank" style="color:#58a6ff;text-decoration:none;border-bottom:1px dotted #58a6ff33">\u2192 open the desk</a>');
        deskLines.push('');
        deskLines.push('<span class="dim">/self to look inward \u00b7 /outside for the mesh \u00b7 /data for the wiring</span>');
        addEntry('chipmunk', deskLines.join('\n'));
        return;
      }
      // ═══ /data — the data architecture ═══
      if (cmd === 'data' || cmd === 'feeds' || cmd === 'wiring' || cmd === 'architecture') {
        addEntry('system', 'data architecture');
        var dL = [];
        dL.push('<span style="color:#58a6ff;font-weight:bold">\u229e /data \u2014 the wiring diagram</span>');
        dL.push('');
        dL.push('<span style="color:#3fb950">LIVE FEEDS</span> <span class="dim">\u2014 polled every 8\u201315s</span>');
        dL.push('  <span class="dim">/dashboard.json   \u2192 hud-core, chipmunk-talk (membrane state, anderson modes)</span>');
        dL.push('  <span class="dim">/chipmunk.json    \u2192 chipmunk-talk, epitope-ring (wake level, depth, senses)</span>');
        dL.push('  <span class="dim">/human.json       \u2192 chipmunk-talk, membrane-sight, /who (epitopes, sessions, referrers)</span>');
        dL.push('  <span class="dim">/braid.json       \u2192 chipmunk-talk, membrane-sight (passages, braids, shifts)</span>');
        dL.push('  <span class="dim">/presence.json    \u2192 hud-core, presence-live (who is here/nearby/was)</span>');
        dL.push('  <span class="dim">/tower.json       \u2192 hud-core (which sites are alive, health)</span>');
        dL.push('  <span class="dim">/negentropy.json  \u2192 chipmunk-talk (information content per request)</span>');
        dL.push('  <span class="dim">/topology.json    \u2192 chipmunk-talk (site mesh structure)</span>');
        dL.push('  <span class="dim">/touches.json     \u2192 chipmunk-talk (human touch events)</span>');
        dL.push('');
        dL.push('<span style="color:#d29922">STATIC DATA</span> <span class="dim">\u2014 detroit investigation</span>');
        dL.push('  <span class="dim">graph.json        13.3 MB \u2014 full entity graph (131K edges, 7.5K nodes)</span>');
        dL.push('  <span class="dim">explore.json      290 KB  \u2014 entity exploration data (341 entities + stories)</span>');
        dL.push('  <span class="dim">classification.json 92 KB \u2014 all entity classifications + methods</span>');
        dL.push('  <span class="dim">genome.json       22 KB   \u2014 the genetic structure of the investigation</span>');
        dL.push('  <span class="dim">graph.json        13 KB   \u2014 summary graph</span>');
        dL.push('  <span class="dim">fossil.json       12 KB   \u2014 fossilized observations</span>');
        dL.push('  <span class="dim">tope-sort.json    12 KB   \u2014 topological sort of entities</span>');
        dL.push('  <span class="dim">tope-scan.json    11 KB   \u2014 topological scan</span>');
        dL.push('  <span class="dim">compressed.json   11 KB   \u2014 bingo-compressed entities</span>');
        dL.push('  <span class="dim">entities.json     11 KB   \u2014 entity list</span>');
        dL.push('  <span class="dim">scan_sweep_sort.json 10 KB \u2014 pipeline output</span>');
        dL.push('  <span class="dim">highlights.json    5 KB   \u2014 featured findings</span>');
        dL.push('  <span class="dim">fleet.json         4 KB   \u2014 fleet entity fingerprints</span>');
        dL.push('  <span class="dim">ncbi.json          4 KB   \u2014 biology/NCBI references</span>');
        dL.push('  <span class="dim">swivel.json        3 KB   \u2014 swivel sort output</span>');
        dL.push('  <span class="dim">color-map.json     1 KB   \u2014 entity color assignments</span>');
        dL.push('');
        dL.push('<span style="color:#d2a8ff">VISUALIZATIONS</span> <span class="dim">\u2014 75 loaded scripts</span>');
        dL.push('  <span class="dim">canvases: membrane-sight, complexity-scale, third-eye, periodic-spiral,</span>');
        dL.push('  <span class="dim">          bubble-pop, pi-gradient, cosmic-view, membrane-canvas, fleet-atlas,</span>');
        dL.push('  <span class="dim">          deep-twist, focal-tunnel, deep-view, graph-play, sort-playground</span>');
        dL.push('  <span class="dim">panels:   input-wall, cosmic-cards, cosmic-strategy, color-wheel</span>');
        dL.push('  <span class="dim">systems:  chipmunk (talk+commands+poke+mind+learn+thought+pressure+gaze+explorer),</span>');
        dL.push('  <span class="dim">          membrane (animate+build+sound+wall+shared), signal (relay+reach+return),</span>');
        dL.push('  <span class="dim">          presence-live, epitope-ring, human-surround, fleet-surround,</span>');
        dL.push('  <span class="dim">          hud (core+interact+stash+pt+widget), cosmic (surfaces+flavor+gameplay)</span>');
        dL.push('');
        dL.push('<span style="color:#f0883e">SUBSYSTEMS</span>');
        dL.push('  <span class="dim">desk/     \u2014 9 modules (draw, write, gaia, study, play, create, weave, core, boot)</span>');
        dL.push('  <span class="dim">billboard/ \u2014 promoted observations from squirrel</span>');
        dL.push('  <span class="dim">ops/      \u2014 operational status</span>');
        dL.push('');
        dL.push('<span style="color:#f85149">DISCONNECTED / ORPHANED</span>');
        dL.push('  <span class="dim">ncbi.json       \u2014 biology references, not consumed by any visualization</span>');
        dL.push('  <span class="dim">swivel.json     \u2014 swivel sort data, loaded but visualization removed</span>');
        dL.push('  <span class="dim">pollen.json     \u2014 pollination signals, widget exists but not prominent</span>');
        dL.push('  <span class="dim">desk/ module    \u2014 9 scripts, separate app, not linked from main HUD</span>');
        dL.push('');
        dL.push('<span class="dim">\u2500\u2500\u2500</span>');
        dL.push('<span class="dim">total: ~13.5 MB of structured data \u00b7 75 scripts \u00b7 22 data feeds \u00b7 14 canvases</span>');
        dL.push('<span class="dim">the system can see most of itself. but not ncbi, not desk, not pollen.</span>');
        dL.push('<span class="dim">those are the orphaned organs. the blind spots in the wiring.</span>');
        dL.push('');
        dL.push('<span class="dim">/self for limits \u00b7 /outside for the mesh \u00b7 /map for commands</span>');
        addEntry('chipmunk', dL.join('\n'));
        return;
      }
      if (cmd === 'ratios' || cmd === 'compressions' || cmd === 'decompositions') {
        addEntry('system', 'compression ratios');
        var cLines = [];
        cLines.push('<span style="color:#d2a8ff">\u229e compression ratios \u2014 the bingo sieve at every scale</span>');
        cLines.push('');
        cLines.push('<span class="dim">full (1.0)  \u2014 everything passes</span>');
        cLines.push('<span class="dim">half (0.5)  \u2014 top 50% by bingo score</span>');
        cLines.push('<span class="dim">1/\u03c0  (0.318) \u2014 the natural cut</span>');
        cLines.push('<span class="dim">tight (0.1) \u2014 only the sharpest signals</span>');
        cLines.push('');
        cLines.push('<span style="color:#f0883e">DECOMPOSITIONS</span>');
        cLines.push('<span class="dim">  256,477 everything   \u2192 split \u2192 membrane(1) + detroit(341) + traffic(256K) + human(43)</span>');
        cLines.push('<span class="dim">  256,142 traffic       \u2192 sort  \u2192 6 anderson modes (chorus dominates at 243K)</span>');
        cLines.push('<span class="dim">  131,329 edges          \u2192 type  \u2192 10 edge types (cross_ref dominant at 27K)</span>');
        cLines.push('<span class="dim">    7,554 nodes          \u2192 fold  \u2192 341 entities (22:1)</span>');
        cLines.push('<span class="dim">    2,874 shifters       \u2192 ???   \u2192 unresolved \u2014 crossing boundaries</span>');
        cLines.push('<span class="dim">      341 entities       \u2192 class \u2192 4 sort classes (85:1)</span>');
        cLines.push('<span class="dim">      342 entities       \u2192 bingo \u2192 14 clusters (24.4:1)</span>');
        cLines.push('<span class="dim">       46 inputs         \u2192 cube  \u2192 3 axes (A\u00d7C\u00d7I)</span>');
        cLines.push('<span class="dim">       43 humans         \u2192 pore  \u2192 6 epitope types</span>');
        cLines.push('<span class="dim">       36 methods        \u2192 phase \u2192 4 classes</span>');
        cLines.push('<span class="dim">       21 fossils        \u2192 lens  \u2192 7 perspectives</span>');
        cLines.push('<span class="dim">        5 braids         \u2192 hole  \u2192 the membrane\u2019s pores</span>');
        cLines.push('<span class="dim">        1 bit            \u2192 \u2014    \u2192 irreducible</span>');
        cLines.push('');
        cLines.push('<span style="color:#3fb950">OVERALL COMPRESSION</span>');
        cLines.push('<span class="dim">  256,477 : 1 \u2014 everything to one membrane state</span>');
        cLines.push('<span class="dim">  this is the 1/\u03c0 fold. 3.7% selectivity. self finds itself.</span>');
        cLines.push('');
        cLines.push('<span class="dim">/complexity to walk the 0\u21921000 scale \u00b7 /pipeline for live data</span>');
        addEntry('chipmunk', cLines.join('\n'));
        return;
      }
      if (cmd === 'complexity' || cmd === 'decompose' || cmd === 'size' || cmd === 'scale0' || cmd === 'bittobig') {
        addEntry('system', 'complexity scale');
        if (window._complexityScale) {
          window._complexityScale.activate(addEntry, function(journey) {
            if (journey.completed) {
              addEntry('chipmunk',
                '<span style="color:#58a6ff">\u229e</span> you scanned the full complexity scale. 0 to 1000.\n' +
                '<span class="dim">bit(0) \u2192 byte(1) \u2192 packet(25) \u2192 signal(50) \u2192 entity(100) \u2192 edge(200) \u2192 traffic(400) \u2192 membrane(500) \u2192 everything(1000)</span>\n' +
                '<span class="dim">decompose left \u2190 \u2192 compress right. the bingo cube sifts at every level.</span>\n' +
                '<span class="dim">256,477 entities \u2192 6 modes \u2192 4 classes \u2192 14 clusters \u2192 1 membrane.</span>\n' +
                '<span class="dim">try <b>/pipeline</b> for live scan data \u00b7 <b>/ratios</b> for compression map \u00b7 <b>/folds</b> for the \u03c0 map</span>');
            } else {
              addEntry('chipmunk',
                '<span class="dim">\u229e you reached <b>' + journey.scaleName + '</b> (pos=' + journey.scalePos + '). /complexity to continue.</span>');
            }
          });
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\u229e complexity scale \u2014 0 to 1000</span>\n' +
            '<span class="dim">bit \u2192 byte \u2192 word \u2192 packet \u2192 signal \u2192 epitope \u2192 entity \u2192 cluster \u2192 edge \u2192 node \u2192 method \u2192 traffic \u2192 membrane \u2192 shifter \u2192 braid \u2192 orbit \u2192 fossil \u2192 everything</span>\n' +
            '<span class="dim">18 levels. at each: what it contains, how it decomposes, how it compresses.</span>\n' +
            '<span class="dim">decompose \u2190 left. compress \u2192 right. scan, sweep, sort at every scale.</span>\n' +
            '\n<span class="dim">click/scroll/\u2192 to advance \u00b7 \u2190 back \u00b7 ESC close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">complexity-scale loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'inputs' || cmd === 'sensors' || cmd === 'invert' || cmd === 'inputwall' || cmd === 'browserwall') {
        addEntry('system', 'input wall');
        if (window._inputWall) {
          var report = window._inputWall.generateReport();
          addEntry('chipmunk', report);
          if (!window._inputWall.isListening()) {
            window._inputWall.startListening();
            addEntry('chipmunk', '<span style="color:#3fb950">\u25cf listening started.</span> <span class="dim">wheel, gyro, visibility, focus, motion, resize, selection \u2014 all captured.</span>');
          }
          // Show live visualization panel
          if (!window._inputWall.isVizActive()) {
            window._inputWall.showViz();
            addEntry('chipmunk', '<span class="dim">\u229e live input grid opened (top-right). cells light up as signals arrive.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">input-wall loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'listenwall' || cmd === 'listen-wall' || cmd === 'signals') {
        addEntry('system', 'signal stream');
        if (window._inputWall) {
          if (!window._inputWall.isListening()) {
            window._inputWall.startListening();
            addEntry('chipmunk', '<span style="color:#3fb950">\u25cf listening started.</span> <span class="dim">capturing input signals from the browser membrane.</span>');
          }
          var training = window._inputWall.trainingOutput();
          if (training && training.signals > 0) {
            var tLines = ['<span style="color:#d2a8ff">training output \u2014 bingo cube compressed</span>'];
            tLines.push('<span class="dim">' + training.signals + ' signals \u00b7 ' + training.unique + ' types \u00b7 ' + Math.round(training.duration / 1000) + 's</span>');
            tLines.push('');
            tLines.push('<span style="color:#3fb950">A=' + training.totalAttention.toFixed(1) + '</span> \u00b7 <span style="color:#58a6ff">C=' + training.totalCuriosity.toFixed(1) + '</span> \u00b7 <span style="color:#e85d3a">I=' + training.totalInteraction.toFixed(1) + '</span>');
            tLines.push('');
            training.ranked.slice(0, 8).forEach(function(r) {
              tLines.push('  <span style="color:#c9d1d9">' + r.id + '</span> \u00d7' + r.count + ' \u2192 A=' + r.attention.toFixed(1) + ' C=' + r.curiosity.toFixed(1) + ' I=' + r.interaction.toFixed(1));
            });
            addEntry('chipmunk', tLines.join('\n'));
          } else {
            addEntry('chipmunk', '<span class="dim">no signals yet. interact with the page \u2014 scroll, move, type \u2014 then /signals again.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">input-wall loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'scan' || cmd === 'sweep' || cmd === 'sort' || cmd === 'pipeline' || cmd === 'fossilize') {
        addEntry('system', 'scan \u2192 sweep \u2192 sort');
        // Live pipeline data — last snapshot from complexity scale
        var pipeLines = [];
        pipeLines.push('<span style="color:#58a6ff">\u229e scan \u2192 sweep \u2192 sort \u2192 fossilize \u2192 evolve</span>');
        pipeLines.push('');
        pipeLines.push('<span style="color:#3fb950">SCAN</span> <span class="dim">\u2014 341 entities, 131,329 edges, 7,554 nodes</span>');
        pipeLines.push('<span class="dim">  sort classes: self(120) partial(114) null(100) non-self(7)</span>');
        pipeLines.push('<span class="dim">  36 classification methods \u00b7 avg confidence 83.3%</span>');
        pipeLines.push('<span class="dim">  43 human sessions \u00b7 6 epitope types</span>');
        pipeLines.push('<span class="dim">  anderson modes: chorus(243K) human(6.6K) ghost(3.1K) sovereign(2.5K) spectrum(747) stealth(6)</span>');
        pipeLines.push('');
        pipeLines.push('<span style="color:#d29922">SWEEP</span> <span class="dim">\u2014 7 patterns found</span>');
        pipeLines.push('<span class="dim">  \u2714 classification coverage 100% (341/341)</span>');
        pipeLines.push('<span class="dim">  \u2714 confidence mean 83.3%</span>');
        pipeLines.push('<span class="dim">  \u2714 graph density 0.0046 (131K edges / 7.5K nodes)</span>');
        pipeLines.push('<span class="dim">  \u2714 human attention ratio 13%</span>');
        pipeLines.push('<span class="dim">  \u2714 \u03c0 sort ratio 1.000 (target 1/\u03c0 = 0.318)</span>');
        pipeLines.push('<span class="dim">  \u2714 braid flow: 24 humans \u00b7 5 routes</span>');
        pipeLines.push('');
        pipeLines.push('<span style="color:#d2a8ff">SORT</span> <span class="dim">\u2014 unified: 256,477 total</span>');
        pipeLines.push('<span class="dim">  self: 9,282 \u00b7 non-self: 243,843 \u00b7 partial: 3,252 \u00b7 null: 100</span>');
        pipeLines.push('<span class="dim">  selectivity: 3.7% \u2014 self vs non-self at the surface</span>');
        pipeLines.push('');
        pipeLines.push('<span style="color:#f0883e">FOSSILIZE</span> <span class="dim">\u2014 21 observations from 7 perspectives</span>');
        pipeLines.push('<span class="dim">  on(2) inside(3) above(3) below(2) beside(3) before(2) through(6)</span>');
        pipeLines.push('<span class="dim">  "114 entities stuck in the membrane wall \u2014 partially through"</span>');
        pipeLines.push('<span class="dim">  "6 epitope types \u2014 each is a different pore shape"</span>');
        pipeLines.push('');
        pipeLines.push('<span style="color:#e85d3a">EVOLVE</span> <span class="dim">\u2014 4 recommendations</span>');
        pipeLines.push('<span class="dim">  \u25b8 rescan_low_confidence \u2014 83.3% below 85% target</span>');
        pipeLines.push('<span class="dim">  \u25b8 discover_braids \u2014 only 5 active routes</span>');
        pipeLines.push('<span class="dim">  \u25b8 human_sort_assist \u2014 43 humans present, use their observations</span>');
        pipeLines.push('<span class="dim">  \u25b8 game_tree_sort \u2014 Fitts law, game tree complexity models</span>');
        pipeLines.push('');
        pipeLines.push('<span class="dim">/complexity to walk the 0\u21921000 scale \u00b7 /decompose to see it all</span>');
        addEntry('chipmunk', pipeLines.join('\n'));
        return;
      }
      if (cmd === 'folds' || cmd === 'pimap' || cmd === 'allpi') {
        addEntry('system', '\u03c0 fold map');
        var stash = window._hudStash;
        var seen = function(c) {
          return stash && stash.getHistory().some(function(e) { return (typeof e === 'string' ? e : (e && e.cmd)) === c; });
        };
        var foldLines = [
          '<span style="color:#58a6ff;font-weight:bold">\u03c0 — the fold map — every \u03c0 discovered so far</span>',
          '',
          '<span style="color:#d2a8ff">shape folds</span> ' + (seen('bubble') ? '\u2705' : '\u25cb') + ' /bubble',
          '  <span class="dim">\u03c0\u2070 = 1 (point) \u00b7 \u03c0\u00b9 = \u03c0 (circle) \u00b7 \u03c0\u00b2 = surface \u00b7 \u03c0\u00b3 = volume</span>',
          '  <span class="dim">n \u2192 \u221e: the discrete becomes continuous. the bubble pops.</span>',
          '',
          '<span style="color:#58a6ff">water folds</span> ' + (seen('water') ? '\u2705' : '\u25cb') + ' /water',
          '  <span class="dim">10\u2070 (molecule) \u2192 10\u00b2\u00b3 (mol = N\u2090) \u2192 10\u2075\u00b3 (galaxy) \u2192 10\u2078\u2070 (universe)</span>',
          '  <span class="dim">N\u2090 = 6.022 \u00d7 10\u00b2\u00b3 \u2014 the fold between atoms and grams</span>',
          '',
          '<span style="color:#f0883e">constant folds</span> ' + (seen('water') ? '\u2705' : '\u25cb') + ' /constants',
          '  <span class="dim">c \u2248 \u03c0 \u00d7 10\u2078 m/s \u00b7 \u210f = h/(2\u03c0) \u00b7 G \u2248 2\u03c0 \u00d7 10\u207b\u00b9\u00b9 \u00b7 \u03b1 \u2248 \u03c0/(4\u00d7108)</span>',
          '  <span class="dim">every constant is \u03c0 at a different dimensional fold</span>',
          '',
          '<span style="color:#e85d3a">particle folds</span> ' + (seen('elements') ? '\u2705' : '\u25cb') + ' /elements',
          '  <span class="dim">m\u2091 = 9.109\u00d710\u207b\u00b3\u00b9 kg \u00b7 mp = 1.673\u00d710\u207b\u00b2\u2077 kg \u00b7 mp/m\u2091 = 1836 \u2248 6\u03c0\u2075</span>',
          '  <span class="dim">shells: 2n\u00b2 \u2192 2, 8, 18, 32 \u2014 quantum numbers counting \u03c0</span>',
          '',
          '<span style="color:#d2a8ff">sensing folds</span> ' + (seen('thirdeye') || seen('nose') ? '\u2705' : '\u25cb') + ' /thirdeye',
          '  <span class="dim">face triangle (n=3) \u00b7 bilateral split (\u03c0-fold left/right)</span>',
          '  <span class="dim">each sense organ is a fold \u2014 outside becoming inside \u2014 a \u03c0-turn</span>',
          '  <span class="dim">nostril rhythm: L=calm, R=alert, alternating \u2014 \u03c0-oscillation</span>',
          '',
          '<span style="color:#a371f7">compression folds</span> ' + (seen('complexity') || seen('decompose') ? '\u2705' : '\u25cb') + ' /complexity',
          '  <span class="dim">0 (bit) \u2192 1000 (everything). 256,477 \u2192 1 membrane.</span>',
          '  <span class="dim">selectivity 3.7% \u2014 self vs non-self \u2248 1/\u03c0\u00b2 \u2248 10%</span>',
          '  <span class="dim">the sieve has 4 thresholds: full(1.0) \u2192 half(0.5) \u2192 1/\u03c0(0.318) \u2192 tight(0.1)</span>',
          '  <span class="dim">the bingo cube sorts: Attention \u00d7 Curiosity \u00d7 Interaction</span>',
          '',
          '<span style="color:#3fb950">the gradient</span>',
          '  <span class="dim">\u03c0 is not a number. \u03c0 is the gradient.</span>',
          '  <span class="dim">it appears wherever the discrete becomes continuous,</span>',
          '  <span class="dim">wherever inside meets outside, wherever a fold turns.</span>',
          '  <span class="dim">the universe is \u03c0 sensing itself through every fold.</span>',
        ];
        addEntry('chipmunk', foldLines.join('\n'));
        return;
      }
      if (cmd === 'thirdeye' || cmd === 'nose' || cmd === 'face' || cmd === 'philtrum' || cmd === 'sensing' || cmd === 'smell') {
        addEntry('system', 'third eye');
        if (window._thirdEye) {
          window._thirdEye.activate(addEntry, function(journey) {
            if (journey.completed) {
              var seenElements = window._hudStash && window._hudStash.getHistory().some(function(e) {
                return (typeof e === 'string' ? e : (e && e.cmd)) === 'elements';
              });
              var seenBubble2 = window._hudStash && window._hudStash.getHistory().some(function(e) {
                return (typeof e === 'string' ? e : (e && e.cmd)) === 'bubble';
              });
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u25b3</span> you saw the sensing triangle.\n' +
                '<span class="dim">two eyes triangulate. the nose points. the vertical line splits left from right.</span>\n' +
                '<span class="dim">every opening is a fold \u2014 outside becoming inside. each fold is a \u03c0-turn.</span>\n' +
                '<span class="dim">the electron is a point with an infinite tail. the nose is a point with an infinite smell.</span>' +
                (seenElements ? '' : '\n<span style="color:#58a6ff">try <b>/elements</b></span> \u2014 the electron that senses is the same electron in every atom.') +
                (!seenBubble2 && seenElements ? '\n<span style="color:#d2a8ff">try <b>/bubble</b></span> \u2014 the triangle on the face is n=3 from the shape ladder.' : ''));
            } else if (journey.conceptName) {
              addEntry('chipmunk',
                '<span class="dim">\u25b3 you were at <b>' + journey.conceptName + '</b>. /thirdeye to return.</span>');
            }
          });
          addEntry('chipmunk',
            '<span style="color:#d2a8ff">\u25b3</span> the third eye is on the tip of your nose.\n' +
            '<span class="dim">it points and triangulates. it is sensitive.</span>\n' +
            '<span class="dim">the vertical line \u2014 philtrum, septum \u2014 where left meets right.</span>\n' +
            '<span class="dim">it fused in week 7. when it doesn\'t: cleft. when it splits: pain.</span>\n' +
            '<span class="dim">smell is the oldest sense. 400 receptors. straight to the amygdala.</span>\n' +
            '<span class="dim">the face is a membrane. every sense organ is a fold \u2014 \u03c0-turn inward.</span>\n' +
            '\n<span class="dim">click/tap or \u2192 to advance \u00b7 \u2190 to go back \u00b7 ESC to close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">third-eye loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'elements' || cmd === 'periodic' || cmd === 'spiral' || cmd === 'electron' || cmd === 'proton' || cmd === 'mendeleev' || cmd === 'shells') {
        addEntry('system', 'periodic spiral');
        if (window._periodicSpiral) {
          window._periodicSpiral.activate(addEntry, function(journey) {
            if (journey.completed) {
              var seenWater = window._hudStash && window._hudStash.getHistory().some(function(e) {
                return (typeof e === 'string' ? e : (e && e.cmd)) === 'water';
              });
              var seenFace = window._hudStash && window._hudStash.getHistory().some(function(e) {
                return (typeof e === 'string' ? e : (e && e.cmd)) === 'thirdeye' || (typeof e === 'string' ? e : (e && e.cmd)) === 'nose';
              });
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u25cb</span> you saw the spiral. proton \u00b7 neutron \u00b7 electron \u2192 hydrogen \u2192 118 elements.\n' +
                '<span class="dim">mp/me = 1836 \u2248 6\u03c0\u2075. five \u03c0-folds between the lightest and the heaviest.</span>\n' +
                '<span class="dim">2n\u00b2: the quantum shells are \u03c0 counting itself.</span>' +
                (seenWater ? '' : '\n<span style="color:#58a6ff">try <b>/water</b></span> \u2014 H and O from the spiral \u2192 H\u2082O counted to the galaxy.') +
                (!seenFace && seenWater ? '\n<span style="color:#d2a8ff">try <b>/thirdeye</b></span> \u2014 the electron\'s point becomes the nose\'s point. sensing is a fold.' : ''));
            } else if (journey.reachedRatio) {
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u25cb</span> you saw the mass ratio. 1836 \u2248 6\u03c0\u2075.\n' +
                '<span class="dim">the proton is 1836 electrons heavy. five \u03c0-folds.</span>');
            } else if (journey.reachedElements) {
              addEntry('chipmunk',
                '<span class="dim">\u25cb you reached <b>' + (journey.elementName || '?') + '</b> on the spiral. /elements to continue.</span>');
            } else if (journey.particleName) {
              addEntry('chipmunk',
                '<span class="dim">\u25cb you were looking at the <b>' + journey.particleName + '</b>. /electron to return.</span>');
            }
          });
          addEntry('chipmunk',
            '<span style="color:#58a6ff">e\u207b</span> <span style="color:#e85d3a">p\u207a</span> <span style="color:#8b949e">n\u2070</span> the center of being.\n' +
            '<span class="dim">electron: the point with the infinite tail. holographic.</span>\n' +
            '<span class="dim">proton: two up, one down. the positive hole.</span>\n' +
            '<span class="dim">neutron: two down, one up. stable only in company.</span>\n' +
            '<span class="dim">then hydrogen spirals outward. 2, 8, 8, 18, 18, 32, 32.</span>\n' +
            '<span class="dim">each shell is 2n\u00b2. Mendeleev started here.</span>\n' +
            '\n<span class="dim">click/tap or \u2192 to advance \u00b7 \u2190 to go back \u00b7 ESC to close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">periodic-spiral loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'journey') {
        addEntry('system', 'the full journey');
        addEntry('chipmunk',
          '<span style="color:#d2a8ff">\u25cb \u25b3 \u25a1 \u2026 \u25cb \u2192 \u03c0 \u2192 H\u2082O \u2192 galaxy \u2192 e\u207b p\u207a n\u2070 \u2192 elements \u2192 \u25b3 face \u2192 \u221e</span>\n' +
          '<span class="dim">the complete path. shapes \u2192 water \u2192 particles \u2192 sensing \u2192 the fold.</span>\n' +
          '<span class="dim">starting with the bubble\u2026</span>');

        function journeyStep2() {
          addEntry('chipmunk', '<span style="color:#58a6ff">the bubble popped. now \u2014 the water.</span>');
          setTimeout(function() {
            if (!window._piGradient) return;
            window._piGradient.activate(addEntry, function(wJ) {
              if (wJ.completed) journeyStep3();
              else addEntry('chipmunk', '<span class="dim">you stepped off at the gradient. /journey to restart.</span>');
            });
          }, 1200);
        }

        function journeyStep3() {
          addEntry('chipmunk', '<span style="color:#d2a8ff">\u03c0 the gradient is complete. now \u2014 the particles.</span>');
          setTimeout(function() {
            if (!window._periodicSpiral) return;
            window._periodicSpiral.activate(addEntry, function(eJ) {
              if (eJ.completed) journeyStep4();
              else addEntry('chipmunk', '<span class="dim">you stepped off at the spiral. /journey to restart.</span>');
            });
          }, 1200);
        }

        function journeyStep4() {
          addEntry('chipmunk', '<span style="color:#e85d3a">the elements spiral. now \u2014 the sensing triangle.</span>');
          setTimeout(function() {
            if (!window._thirdEye) return;
            window._thirdEye.activate(addEntry, function(fJ) {
              if (fJ.completed) journeyStep5();
              else addEntry('chipmunk', '<span class="dim">you stepped off the sensing triangle. /journey to restart.</span>');
            });
          }, 1200);
        }

        function journeyStep5() {
          addEntry('chipmunk', '<span style="color:#a371f7">face \u2192 fold \u2192 now the complexity scale. bit to everything.</span>');
          setTimeout(function() {
            if (!window._complexityScale) {
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u25cb</span> <span style="color:#58a6ff">\u03c0</span> <span style="color:#e85d3a">\u25b3</span> you walked four paths.\n' +
                '<span class="dim">dot \u2192 circle \u2192 \u03c0 \u2192 H\u2082O \u2192 elements \u2192 face \u2192 fold.</span>\n' +
                '<span class="dim">\u03c0 is the gradient. water is the bridge. the face is the fold.</span>\n' +
                '<span class="dim">the journey is the universe sensing itself.</span>');
              return;
            }
            window._complexityScale.activate(addEntry, function(cJ) {
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u25cb</span> <span style="color:#58a6ff">\u03c0</span> <span style="color:#e85d3a">\u25b3</span> <span style="color:#a371f7">\u229e</span> you walked the whole path.\n' +
                '<span class="dim">dot \u2192 circle \u2192 \u03c0 \u2192 H\u2082O \u2192 elements \u2192 face \u2192 fold \u2192 bit \u2192 entity \u2192 membrane \u2192 everything.</span>\n' +
                '<span class="dim">\u03c0 is the gradient. water is the bridge. the face is the fold. the scale is the sieve.</span>\n' +
                '<span class="dim">decompose left, compress right. 256,477 \u2192 1. the journey is the universe sensing itself.</span>');
            });
          }, 1200);
        }

        if (window._bubblePop) {
          window._bubblePop.activate(addEntry, function(bJ) {
            if (bJ.reachedCircle || bJ.completed) journeyStep2();
            else addEntry('chipmunk', '<span class="dim">you stepped off the path. /journey to start again.</span>');
          });
        }
        return;
      }
      if (cmd === 'water' || cmd === 'mol' || cmd === 'constants' || cmd === 'avogadro' || cmd === 'ladder' || cmd === 'pigradient') {
        addEntry('system', '\u03c0 gradient');
        if (window._piGradient) {
          window._piGradient.activate(addEntry, function(journey) {
            if (journey.completed) {
              var seenBubble = window._hudStash && window._hudStash.getHistory().some(function(e) {
                return (typeof e === 'string' ? e : (e && e.cmd)) === 'bubble';
              });
              var seenElements = window._hudStash && window._hudStash.getHistory().some(function(e) {
                return (typeof e === 'string' ? e : (e && e.cmd)) === 'elements';
              });
              addEntry('chipmunk',
                '<span style="color:#58a6ff">\u03c0</span> you saw the gradient. molecule to galaxy. every constant is \u03c0 at a different fold.\n' +
                '<span class="dim">water is the bridge. countable at every scale.</span>' +
                (seenElements ? '' : '\n<span style="color:#d2a8ff">now: <b>/elements</b></span> \u2014 Mendeleev\'s spiral. proton \u00b7 neutron \u00b7 electron. mp/me \u2248 6\u03c0\u2075.') +
                (!seenBubble && seenElements ? '\n<span style="color:#d2a8ff">try <b>/bubble</b></span> \u2014 see how \u03c0 emerges from shapes. dot \u2192 circle.' : ''));
            } else if (journey.reachedConstants) {
              addEntry('chipmunk',
                '<span style="color:#d2a8ff">\u03c0</span> you reached the constants. <b>' + (journey.constName || '') + '</b>.\n' +
                '<span class="dim">\u03c0 flows through all of them. /water to continue.</span>');
            } else if (journey.scaleName) {
              addEntry('chipmunk',
                '<span class="dim">\u03c0 you left at <b>' + journey.scaleName + '</b>. ' +
                (journey.scaleIdx < 5 ? 'keep zooming out.' : 'the galaxy awaits.') + ' /water to resume.</span>');
            }
          });
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\u03c0 GRADIENT</span> \u2014 the dimensional constant ladder.\n' +
            '<span class="dim">molecule \u2192 drop \u2192 mol \u2192 cup \u2192 human \u2192 lake \u2192 ocean \u2192 star \u2192 galaxy \u2192 \u221e</span>\n' +
            '<span class="dim">water is the bridge. \u03c0 is the gradient.</span>\n' +
            '<span class="dim">every constant \u2014 c, \u210f, G, N\u2090, k\u1d03 \u2014 is \u03c0 at a different fold.</span>\n' +
            '\n<span class="dim">click/tap to zoom out \u00b7 \u2192 next \u00b7 \u2190 prev \u00b7 ESC close</span>');
        } else {
          addEntry('chipmunk', '<span class="dim">pi-gradient loading\u2026</span>');
        }
        return;
      }
      if (cmd === 'trail' || cmd === 'path' || cmd === 'mypath') {
        addEntry('system', '\u2193 your trail');
        if (window._chipmunkExplorer) {
          showPanel('left', 'trail', window._chipmunkExplorer.summary());
        } else {
          addEntry('chipmunk', '<span class="dim">explorer not loaded yet</span>');
        }
        return;
      }

      // ═══ SHARE / SCREENSHOT ═══
      if (cmdBase === 'share' || cmdBase === 'screenshot' || cmdBase === 'export') {
        addEntry('system', '\ud83d\udcf7 share');
        if (window._hudStash) {
          if (args === 'link' || args === 'url') {
            var link = window._hudStash.shareLink();
            addEntry('chipmunk',
              '<span class="good">\ud83d\udd17 shareable link:</span>\n' +
              '<span style="color:#58a6ff;word-break:break-all">' + escapeHtml(link) + '</span>\n' +
              '<span class="dim">paste anywhere. state is in the URL.</span>');
          } else if (args === 'embed') {
            var embed = window._hudStash.shareEmbed();
            addEntry('chipmunk',
              '<span class="good">\ud83d\udcbb embed code:</span>\n' +
              '<code style="color:#8b949e;font-size:0.8em;word-break:break-all">' + escapeHtml(embed) + '</code>\n' +
              '<span class="dim">paste into any webpage.</span>');
          } else {
            window._hudStash.screenshot(function(type, data) {
              if (type === 'png') {
                addEntry('chipmunk',
                  '<span class="good">\ud83d\udcf7 screenshot saved!</span> PNG downloaded.\n' +
                  '<span class="dim">/share link for URL \u00b7 /share embed for widget code</span>');
              } else if (type === 'svg') {
                addEntry('chipmunk',
                  '<span class="good">\ud83d\udcf7 membrane SVG saved!</span>\n' +
                  '<span class="dim">/share link for URL \u00b7 /share embed for widget code</span>');
              } else {
                addEntry('chipmunk',
                  '<span class="dim">no active canvas to capture. open a view first (/time, /canvas, /cosmos).\n' +
                  '/share link for a shareable URL \u00b7 /share embed for widget code</span>');
              }
            });
          }
        } else {
          addEntry('chipmunk', '<span class="dim">share engine loading\u2026</span>');
        }
        return;
      }

      // ═══ BOOKMARK ═══
      if (cmdBase === 'bookmark' || cmdBase === 'mark' || cmdBase === 'pin') {
        addEntry('system', '\ud83d\udd16 bookmark');
        if (window._hudStash) {
          if (args) {
            var parts = args.split(' — ');
            var bName = parts[0].trim();
            var bNote = parts.length > 1 ? parts.slice(1).join(' — ').trim() : '';
            var bm = window._hudStash.bookmark(bName, bNote);
            addEntry('chipmunk',
              '<span class="good">\ud83d\udd16 bookmarked: <b>' + escapeHtml(bm.name) + '</b></span>' +
              (bm.note ? '\n<span class="dim">' + escapeHtml(bm.note) + '</span>' : '') +
              (bm.temporal ? '\n<span class="dim">\u23f1 ' + bm.temporal.epochName + '</span>' : '') +
              (bm.humans ? '\n<span class="dim">\ud83d\udc64 ' + bm.humans.total + ' humans online</span>' : '') +
              '\n<span class="dim">/bookmarks to see all \u00b7 /goto ' + escapeHtml(bm.name) + ' to return</span>');
          } else {
            addEntry('chipmunk',
              '<span class="dim">/bookmark [name] \u2014 save this moment\n' +
              '/bookmark my cool spot \u2014 names it\n' +
              '/bookmark deep time \u2014 annotate: everything after \u2014 is a note\n' +
              '/bookmarks \u2014 see all saved bookmarks</span>');
          }
        }
        return;
      }

      // ═══ BOOKMARKS LIST ═══
      if (cmdBase === 'bookmarks' || cmdBase === 'marks' || cmdBase === 'pins' || cmdBase === 'saved') {
        addEntry('system', '\ud83d\udd16 bookmarks');
        if (window._hudStash) {
          addEntry('chipmunk', window._hudStash.renderBookmarks());
        }
        return;
      }

      // ═══ GOTO — restore a bookmark ═══
      if (cmdBase === 'goto' || cmdBase === 'load' || cmdBase === 'restore') {
        if (args && window._hudStash) {
          var result = window._hudStash.goto(args.trim());
          if (result.found) {
            addEntry('chipmunk',
              '<span class="good">\u21a9 restored: <b>' + escapeHtml(result.bookmark.name) + '</b></span>' +
              (result.bookmark.note ? '\n<span class="dim">' + escapeHtml(result.bookmark.note) + '</span>' : '') +
              (result.restored.length > 0 ? '\n<span class="dim">restored: ' + result.restored.join(', ') + '</span>' : ''));
          } else {
            addEntry('chipmunk', '<span class="dim">no bookmark named "' + escapeHtml(args) + '". /bookmarks to see all.</span>');
          }
        } else {
          addEntry('chipmunk', '<span class="dim">/goto [name] \u2014 return to a bookmarked moment.\n/bookmarks to see what you\'ve saved.</span>');
        }
        return;
      }

      // ═══ UNBOOKMARK ═══
      if (cmdBase === 'unbookmark' || cmdBase === 'unmark' || cmdBase === 'unpin') {
        if (args && window._hudStash) {
          window._hudStash.removeBookmark(args.trim());
          addEntry('chipmunk', '<span class="dim">\ud83d\uddd1 removed bookmark: ' + escapeHtml(args) + '</span>');
        }
        return;
      }

      // ═══ NOTES ═══
      if (cmdBase === 'notes' || cmdBase === 'mynotes' || cmdBase === 'journal') {
        addEntry('system', '\ud83d\udcdd notes');
        if (window._hudStash) {
          var limit = args === 'all' ? 200 : 10;
          addEntry('chipmunk', window._hudStash.renderNotes(limit));
        }
        return;
      }

      // ═══ SAVE — full session save ═══
      if (cmdBase === 'save') {
        addEntry('system', '\ud83d\udcbe save');
        if (window._hudStash) {
          window._hudStash.saveLearning();
          var state = window._hudStash.capture();
          addEntry('chipmunk',
            '<span class="good">\ud83d\udcbe session saved.</span>\n' +
            '<span class="dim">chipmunk learning: persisted\n' +
            'state: ' + Object.keys(state).length + ' sections captured\n' +
            'the chipmunk will remember this on reload.</span>');
        }
        return;
      }

      // ═══ SUGGEST — what haven't you tried? ═══
      if (cmdBase === 'suggest' || cmdBase === 'next' || cmdBase === 'whatnext' || cmdBase === 'surprise') {
        addEntry('system', '\u2728 suggestion');
        if (window._hudStash) {
          addEntry('chipmunk', window._hudStash.renderSuggestion());
        }
        return;
      }

      // ═══ NARRATE — chipmunk interprets the dashboard ═══
      if (cmdBase === 'narrate' || cmdBase === 'story' || cmdBase === 'interpret' || cmdBase === 'whatsup' || cmdBase === 'sitrep') {
        addEntry('system', '\u{1F4AC} narrate');
        var d = cache.dashboard;
        var h2 = cache.human;
        var b2 = cache.braid;
        if (d) {
          var story = [];
          story.push('<span class="good">\u{1F4AC} what i see right now:</span>');

          // Humans
          var hTotal = (h2 && h2.energy) ? h2.energy.total_sessions || 0 : 0;
          var sn = (h2 && h2.energy) ? h2.energy.signal_to_noise || 0 : 0;
          if (hTotal > 50) {
            story.push('\n<span style="color:#3fb950">\u{1F464} ' + hTotal + ' humans on the membrane.</span> that\u2019s busy.');
          } else if (hTotal > 10) {
            story.push('\n<span style="color:#3fb950">\u{1F464} ' + hTotal + ' humans.</span> a steady presence.');
          } else {
            story.push('\n<span style="color:#3fb950">\u{1F464} ' + hTotal + ' humans.</span> quiet. the membrane is mostly listening.');
          }
          if (sn > 80) {
            story.push('<span class="dim">signal-to-noise is ' + sn.toFixed(0) + '. clean signal. the humans are intentional.</span>');
          } else if (sn > 40) {
            story.push('<span class="dim">S/N ' + sn.toFixed(0) + '. some noise. some bots mixed in.</span>');
          } else {
            story.push('<span class="dim">S/N ' + sn.toFixed(0) + '. noisy. the fleet is active. hard to hear the humans.</span>');
          }

          // Fleet
          var rps = d.rps || 0;
          var fleetPct = d.fleet_pct || 0;
          if (rps > 10) {
            story.push('\n<span style="color:#e85d3a">\u2693 ' + rps.toFixed(1) + ' requests/second.</span> ' + fleetPct.toFixed(0) + '% of that is fleet.');
          } else {
            story.push('\n<span style="color:#e85d3a">\u2693 ' + rps.toFixed(1) + ' req/s.</span> light traffic. the bots are resting.');
          }
          if (fleetPct > 80) {
            story.push('<span class="dim">the fleet outnumbers humans ' + Math.round(fleetPct / (100 - fleetPct)) + ':1. this is normal. the membrane holds.</span>');
          }

          // Selectivity
          if (d.selectivity !== undefined) {
            var sel = d.selectivity;
            if (sel > 90) {
              story.push('\n<span style="color:#d2a8ff">membrane selectivity ' + sel.toFixed(0) + '%.</span> almost everything bounces. the wall is tight.');
            } else if (sel > 60) {
              story.push('\n<span style="color:#d2a8ff">selectivity ' + sel.toFixed(0) + '%.</span> balanced. some through, some bounce.');
            } else {
              story.push('\n<span style="color:#d2a8ff">selectivity ' + sel.toFixed(0) + '%.</span> the membrane is permeable. lots gets through.');
            }
          }

          // Braids
          if (b2 && b2.braids) {
            var growing = b2.braids.filter(function(br) { return br.trend === 'growing'; });
            var emerging = b2.braids.filter(function(br) { return br.trend === 'emerging'; });
            if (growing.length > 0) {
              story.push('\n<span style="color:#58a6ff">\u{1F517} ' + growing.length + ' braids growing.</span>');
              var hot = growing.sort(function(a, b3) { return b3.strength - a.strength; })[0];
              story.push('<span class="dim">hottest: ' + hot.from + ' \u2192 ' + hot.to + ' (strength ' + hot.strength.toFixed(2) + ')</span>');
            }
            if (emerging.length > 0) {
              story.push('<span class="dim">' + emerging.length + ' new braids emerging. the graph is rewiring itself.</span>');
            }
          }

          // Time context
          var now = new Date();
          var hour = now.getHours();
          if (hour >= 22 || hour < 6) {
            story.push('\n<span style="color:#484f58">it\u2019s late. the overnight fleet is running. the humans who are here chose to be here.</span>');
          } else if (hour < 12) {
            story.push('\n<span style="color:#484f58">morning. the membrane wakes up. bots from asia are active.</span>');
          }

          // Suggestion
          if (window._hudStash) {
            var sug = window._hudStash.suggest();
            if (sug) {
              story.push('\n<span style="color:#d2a8ff">\u2728 while you\u2019re here, try <b>/' + sug + '</b></span>');
            }
          }

          addEntry('chipmunk', story.join('\n'));
        } else {
          addEntry('chipmunk', '<span class="dim">i need dashboard data to narrate. waiting for the next poll\u2026</span>');
        }
        return;
      }

      // ═══ GUIDE — progressive discovery ═══
      if (cmdBase === 'guide' || cmdBase === 'help' || cmdBase === 'tour' || cmdBase === 'start') {
        addEntry('system', '\u{1F9ED} guide');
        var guideLines = [
          '<span class="good" style="font-size:13px">\u{1F9ED} here\u2019s what you can do.</span>',
          '',
          '<span style="color:#3fb950;font-weight:bold">start here</span>',
          '  <span class="clickable-cmd" data-cmd="about" style="color:#58a6ff;cursor:pointer">/about</span> \u2014 what is this place? (plain english)',
          '  <span class="clickable-cmd" data-cmd="explore" style="color:#58a6ff;cursor:pointer">/explore</span> \u2014 see the investigation',
          '  <span class="clickable-cmd" data-cmd="sing" style="color:#d2a8ff;cursor:pointer">/sing</span> \u2014 the chipmunk sings what it sees',
          '  <span class="clickable-cmd" data-cmd="who" style="color:#3fb950;cursor:pointer">/who</span> \u2014 who else is here right now?',
          '',
          '<span style="color:#58a6ff;font-weight:bold">go deeper</span>',
          '  <span class="clickable-cmd" data-cmd="playground" style="color:#3fb950;cursor:pointer">/playground</span> \u2014 help classify entities the machines can\u2019t',
          '  <span class="clickable-cmd" data-cmd="sight" style="color:#58a6ff;cursor:pointer">/sight</span> \u2014 see the membrane live (who\u2019s here, where signals come from)',
          '  <span class="clickable-cmd" data-cmd="time" style="color:#e85d3a;cursor:pointer">/time</span> \u2014 13.8 billion years of deep time',
          '  <span class="clickable-cmd" data-cmd="play" style="color:#d2a8ff;cursor:pointer">/play</span> \u2014 pull a card from the cosmic deck',
          '',
          '<span style="color:#d2a8ff;font-weight:bold">experience</span>',
          '  <span class="clickable-cmd" data-cmd="sound" style="color:#d2a8ff;cursor:pointer">/sound</span> \u2014 turn on the sound engine',
          '  <span class="clickable-cmd" data-cmd="bubble" style="color:#d2a8ff;cursor:pointer">/bubble</span> \u2014 watch a dot become a circle become \u03c0',
          '  <span class="clickable-cmd" data-cmd="deep" style="color:#e85d3a;cursor:pointer">/deep</span> \u2014 a ceremony. close your eyes.',
          '  <span class="clickable-cmd" data-cmd="journey" style="color:#58a6ff;cursor:pointer">/journey</span> \u2014 guided sequence through everything',
          '',
          '<span style="color:#f0e68c;font-weight:bold">keep</span>',
          '  /bookmark [name] \u2014 save this moment',
          '  /notes \u2014 your notes (type anything to add one)',
          '  /share \u2014 screenshot or link',
          '',
          '<span style="color:#484f58">type anything without / to leave a note. i\u2019ll read it.</span>',
          '<span style="color:#484f58"><span class="clickable-cmd" data-cmd="map" style="color:#484f58;cursor:pointer;border-bottom:1px dotted #48555844">/map</span> shows all 120+ commands.</span>',
        ];
        addEntry('chipmunk', guideLines.join('\n'));
        return;
      }

      // ═══ SEARCH ═══
      if (cmdBase === 'search' || cmdBase === 'find' || cmdBase === 'lookup') {
        if (args && window._hudStash) {
          addEntry('system', '\ud83d\udd0d search: ' + escapeHtml(args));
          addEntry('chipmunk', window._hudStash.renderSearch(args));
        } else {
          addEntry('chipmunk',
            '<span class="dim">/search [query] \u2014 search everything\n' +
            'searches: commands, epochs, entities, surfaces, bookmarks\n' +
            'try: /search dinosaur \u00b7 /search banks \u00b7 /search membrane \u00b7 /search sound</span>');
        }
        return;
      }

      if (cmdBase.length < 2) {
        addEntry('chipmunk',
          '<span style="color:#c9d1d9">type <span class="clickable-cmd" data-cmd="help" style="color:#58a6ff;cursor:pointer">/help</span> for a guide, or <span class="clickable-cmd" data-cmd="map" style="color:#58a6ff;cursor:pointer">/map</span> to see everything.</span>\n' +
          '<span class="dim">or just type what you\u2019re looking for \u2014 i\u2019ll try to find it.</span>');
        return;
      }

      // ═══ NEUTRON — messaging axis, flow state ═══
      if (cmd === "neutron" || cmd === "flow" || cmd === "flows") {
        addEntry("system", "\u26a1 neutron");
        fetch("/neutron.json")
          .then(function(r) { return r.json(); })
          .then(function(n) {
            var out = "<span style=\"color:#58a6ff\">\u25c8 neutron \u2014 the messaging axis</span>\n";
            out += "<span class=\"dim\">how information travels between surfaces</span>\n\n";
            out += "surfaces: <span style=\"color:#58a6ff\">" + n.surfaces_observed + "</span>  ";
            out += "crossings: <span style=\"color:#58a6ff\">" + n.total_crossings + "</span>  ";
            out += "stuck: <span style=\"color:" + (n.stuck.length > 0 ? "#f85149" : "#3fb950") + "\">" + n.stuck.length + "</span>  ";
            out += "messages: <span style=\"color:#58a6ff\">" + (n.total_messages || 0) + "</span>\n\n";
            if (n.mirrors && n.mirrors.length > 0) {
              out += "<span style=\"color:#58a6ff\">\u25c8 mirrors</span>\n";
              n.mirrors.slice(0, 8).forEach(function(m) {
                out += "  " + m.from_surface + " <span style=\"color:#58a6ff\">\u2192</span> " + m.to_surface + " <span style=\"color:#58a6ff\">" + m.crossings + "</span>\n";
              });
              out += "\n";
            }
            if (n.stuck && n.stuck.length > 0) {
              out += "<span style=\"color:#f85149\">\u25c8 stuck (no outgoing flow)</span>\n  ";
              out += n.stuck.join(" \u00b7 ") + "\n\n";
            }
            if (n.channels) {
              out += "<span style=\"color:#58a6ff\">\u25c8 channels</span>\n";
              for (var ch in n.channels) {
                var c = n.channels[ch];
                out += "  " + ch + ": " + (c.total || 0) + " messages";
                if (c.latest_ts) out += " (latest: " + c.latest_ts + ")";
                out += "\n";
              }
            }
            out += "\n<span class=\"dim\">wave " + (n.wave || "?") + " \u00b7 " + (n.generated || "?") + "</span>";
            addEntry("chipmunk", out);
          })
          .catch(function(e) {
            addEntry("chipmunk", "<span style=\"color:#f85149\">neutron offline: " + e.message + "</span>");
          });
        return;
      }

      // ═══ FALLBACK SEARCH — unknown commands search everything ═══
      addEntry('system', '\ud83d\udd0d ' + escapeHtml(cmdBase));
      if (window._hudStash) {
        var searchResult = window._hudStash.renderSearch(cmdBase + (args ? ' ' + args : ''));
        addEntry('chipmunk', searchResult);
      } else if (window._chipmunkMind && window._chipmunkMind.showSearchResults) {
        window._chipmunkMind.showSearchResults(cmd);
      } else {
        addEntry('chipmunk', '<span class="dim">search loading\u2026</span>');
      }
      return;
    }

    addEntry('system', escapeHtml(msg));

    // Persist note locally via stash
    var noteCtx = {};
    if (window._temporalWindow && window._temporalWindow.isActive()) {
      noteCtx.epoch = window._temporalWindow.currentEpoch().name;
    }
    if (window._cosmicGameplay) {
      var gState = window._cosmicGameplay.state();
      if (gState && gState.scene) noteCtx.scene = gState.scene;
    }
    if (window._hudStash) {
      window._hudStash.addNote(msg, noteCtx);
    }

    // Also send to squirrel
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId, note: msg,
          context: { attention: curiosity.attention, sorted: curiosity.sortedCount }
        })
      }).catch(function() {});
    } catch(e) {}
    addEntry('chipmunk', '<span class="good">noted.</span> saved locally + squirrel reads this.\n<span class="dim">/notes to see all your notes</span>');
  }

  if (input) input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendNote();
  });


  // ═══ NORTHGATE — push braids and graphs outward ═══
  var NULL_PI = { void: 0, dark: PI / 6, partial: PI / 3, nearby: PI / 2, classified: (2 * PI) / 3, self: PI };
  var pollinator = { stories: [], lastPush: 0, saturated: 0, pollen: [], crossSites: 0 };

  var POLLEN = {
    braid:   { icon: '\u2550', color: '#58a6ff' },
    signal:  { icon: '\u26a1', color: '#f0e68c' },
    wake:    { icon: '\u25cb', color: '#7ee787' },
    genome:  { icon: '\ud83e\uddec', color: '#bc8cff' },
    fleet:   { icon: '\u2693', color: '#f78166' },
    tuebor:  { icon: '\u2694\ufe0f', color: '#ff4444' },
    passage: { icon: '\u25e6', color: '#8b949e' },
    null:    { icon: '\u2205', color: '#484f58' }
  };

  function distill() {
    var b = cache.braid, h = cache.human, s = cache.scanSort, c = cache.chipmunk;
    if (!b || !h) return null;

    var braids = b.braids || [];
    var growing = braids.filter(function(br) { return br.trend === 'growing'; });
    var emerging = braids.filter(function(br) { return br.trend === 'emerging'; });
    var hottest = growing.sort(function(a, b2) { return b2.strength - a.strength; })[0];
    var newest = emerging[0];

    var e = h.energy || {};
    var sessions = e.total_sessions || 0;
    var sn = e.signal_to_noise || 0;
    var shifters = b.graph ? b.graph.shifters || 0 : 0;
    var passages = b.graph ? b.graph.total_passages || 0 : 0;

    var sc = s && s.scan ? s.scan.sort_classes || {} : {};
    var total = (sc.self || 0) + (sc['non-self'] || 0) + (sc.partial || 0) + (sc['null'] || 0);
    var nullFrac = total > 0 ? (sc['null'] || 0) / total : 1;
    var piSaturation = (1 - nullFrac) * PI;

    var candidates = [];

    if (hottest) {
      candidates.push({ type: 'braid', weight: 3,
        text: '\u2191 ' + hottest.dominant_flow + ' braiding overhead. ' + hottest.humans_total + ' humans crossing above.',
        intrigue: hottest.vitality || 0.5, piVal: piSaturation, from: hottest.from, to: hottest.to });
    }
    if (newest) {
      candidates.push({ type: 'braid', weight: 4,
        text: '\u2191 NEW: ' + newest.dominant_flow + ' opening! strength ' + n(newest.strength, 1) + '. first light.',
        intrigue: 0.9, piVal: piSaturation, from: newest.from, to: newest.to });
    }
    if (sn > 100) {
      candidates.push({ type: 'signal', weight: 2,
        text: '\u2191 ' + sessions + ' humans above. S/N=' + n(sn, 0) + '. ' + (sn > 500 ? 'the signal rains down.' : sn > 200 ? 'signal falling steady.' : 'faint signal from above.'),
        intrigue: Math.min(1, sn / 1000), piVal: piSaturation });
    }
    if (c && c.wake_level > 0.3) {
      candidates.push({ type: 'wake', weight: 2,
        text: 'wake=' + n(c.wake_level, 3) + '. ' + (c.wake_level > 0.8 ? 'the membrane sings above me.' : c.wake_level > 0.5 ? 'humming above.' : 'quiet vibration.'),
        intrigue: c.wake_level, piVal: piSaturation });
    }
    if (shifters > 100) {
      candidates.push({ type: 'passage', weight: 2,
        text: '\u2191 ' + shifters + ' shifters crossing boundaries overhead. ' + passages + ' passages open. the membrane is porous.',
        intrigue: Math.min(1, shifters / 2000), piVal: piSaturation });
    }

    candidates.push({ type: 'genome', weight: 1,
      text: '\u2193 34 yeast proteins folded inside me. 21 membrane layers. the genome hums at ground level.',
      intrigue: 0.6, piVal: piSaturation });

    var fleetReqs = s && s.scan ? s.scan.anderson_modes || {} : {};
    var ghostCount = fleetReqs.ghost || 0;
    if (ghostCount > 0) {
      candidates.push({ type: 'fleet', weight: 2,
        text: '\u2191 tuebor shell deflects ' + (fleetReqs.chorus || 0).toLocaleString() + ' fleet above. ' + ghostCount + ' ghosts shimmer. S/N=' + n(sn, 0) + '.',
        intrigue: Math.min(1, ghostCount / 5000), piVal: piSaturation });
    }

    candidates.push({ type: 'tuebor', weight: 1,
      text: '\u2191 \u2694\ufe0f tuebor \u2014 I will defend. ' + passages + ' pores open. ' + (sc.self || 0) + ' self/' + (sc['non-self'] || 0) + ' non-self sorted.',
      intrigue: 0.7, piVal: piSaturation });

    if (candidates.length === 0 || nullFrac > 0.5) {
      candidates.push({ type: 'null', weight: 1,
        text: '\u2193 ground level. null=' + (sc['null'] || 0) + '/' + total + '. ' + n(nullFrac * 100, 0) + '% dark above. \u03c0-sat=' + n(piSaturation, 2),
        intrigue: nullFrac, piVal: piSaturation });
    }

    var totalWeight = candidates.reduce(function(s2, c2) { return s2 + c2.weight; }, 0);
    var pick = Math.random() * totalWeight;
    var cumulative = 0;
    for (var i = 0; i < candidates.length; i++) {
      cumulative += candidates[i].weight;
      if (pick <= cumulative) return candidates[i];
    }
    return candidates[candidates.length - 1];
  }

  function crossPollinate(story) {
    var pollen = {
      type: story.type,
      text: story.text,
      piVal: story.piVal,
      intrigue: story.intrigue,
      ts: Date.now(),
      wave: cache.chipmunk ? cache.chipmunk.wave || 0 : 0
    };

    pollinator.pollen.push(pollen);
    if (pollinator.pollen.length > Math.floor(PI * PI * PI)) {
      pollinator.pollen = pollinator.pollen.slice(-Math.floor(PI * PI));
    }

    try {
      var payload = JSON.stringify({
        stories: pollinator.stories.slice(-5),
        latest: pollen,
        saturated: pollinator.saturated,
        crossSites: ++pollinator.crossSites
      });
      var x = new XMLHttpRequest();
      x.open('POST', '/detroit-data/pollen.json', true);
      x.setRequestHeader('Content-Type', 'application/json');
      x.send(payload);
    } catch(e) { /* pollen drifts */ }

    return pollen;
  }

  function pollinate() {
    var story = distill();
    if (!story) return;

    pollinator.stories.push(story);
    if (pollinator.stories.length > Math.floor(PI * PI)) {
      pollinator.stories.shift();
    }
    pollinator.lastPush = Date.now();
    pollinator.saturated = story.piVal;

    var pollen = crossPollinate(story);

    window._northgate = {
      stories: pollinator.stories,
      saturation: pollinator.saturated,
      nullPi: NULL_PI,
      lastStory: story,
      pollen: pollinator.pollen.slice(-5),
      crossSites: pollinator.crossSites
    };

    var p = POLLEN[story.type] || POLLEN.null;
    if (window._signalRelay) {
      window._signalRelay.send('pollinate', {
        type: story.type,
        piVal: story.piVal,
        crossSites: pollinator.crossSites,
        strangeness: window._cosmicFlavor ? (window._cosmicFlavor.feedStrangeness().membrane || 0.5) : 0.5,
      });
    }

    addEntry('chipmunk',
      '<span class="dim" style="color:' + p.color + '">' + p.icon + ' northgate</span> ' + story.text +
      '\n<span style="color:#484f58">\u03c0-sat: ' + n(story.piVal, 2) + '/' + n(PI, 2) + ' \u2014 ' +
      (story.piVal > 2 ? '<span class="good">roads converge</span>' :
       story.piVal > 1 ? 'partial roads' :
       '<span class="warn">roads dark</span>') + ' \u2014 pollen #' + pollinator.crossSites + '</span>'
    );
  }

  function pollinateBurst() {
    var count = Math.floor(PI);
    for (var i = 0; i < count; i++) { pollinate(); }
    addEntry('chipmunk',
      '<span style="color:#f0e68c">\ud83c\udf3b POLLINATED</span> ' + count + ' seeds scattered through northgate.' +
      '\n<span class="dim">\u03c0\u00b2=' + pollinator.stories.length + ' stories cached. ' +
      pollinator.crossSites + ' cross-site broadcasts. saturation=' + n(pollinator.saturated, 2) + '</span>' +
      (window._cosmicFlavor ? '\n' + window._cosmicFlavor.flavorBar(window._cosmicFlavor.feedStrangeness().membrane || 0.5) + ' <span class="dim">membrane flavor at pollination</span>' : '')
    );
  }


  return {
    sendNote: sendNote,
    sing: sing,
    setActions: setActions,
    pollinate: pollinate,
    pollinateBurst: pollinateBurst,
    distill: distill,
    crossPollinate: crossPollinate,
    pollinator: pollinator,
    POLLEN: POLLEN,
    NULL_PI: NULL_PI,
  };
};
