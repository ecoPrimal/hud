// ═══════════════════════════════════════════════════════════
// GAIA VERB — she doesn't just CAN. She DOES.
// 1.000.null — max 1000 lines.
//
// THE LIST WAS ALL NAMING. NOW IT'S ACTION.
//
// Every capability becomes a VERB with a cycle:
//   1. SEARCH — scan for what needs doing
//   2. BOOM — fire the action
//   3. SOLVE — process the result
//   4. ENSURE — verify it worked
//
// RED IS EAT THE BERRIES AND BEETLE.
// "Berries" = data morsels (feeds, signals, events)
// "Beetle"  = bugs, problems, things to crunch
//
// EVERY VERB IS A LIVING CYCLE:
//   search → find → act → verify → search again
//   like heartbeat. like breathing. ALIVE.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══ ALL 16 VERBS — not capabilities, ACTIONS ═══
  var VERBS = [
    {
      id: 'see',      icon: '👁', color: '63,185,80',
      desc: 'SEEING — 12 spectrum bands, camera, IR traces',
      search: function() {
        // Search for things to look at
        if (window.GAIA_VISION && window.GAIA_VISION.ir) {
          return window.GAIA_VISION.ir.totalHeat > 0;
        }
        return document.hasFocus();
      },
      boom: function() {
        if (window.GAIA_VISION && window.GAIA_VISION.zkProve) {
          window.GAIA_VISION.zkProve('verb-see', Date.now().toString(36));
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 3000
    },
    {
      id: 'hear',     icon: '👂', color: '88,166,255',
      desc: 'HEARING — mic + FFT + bass/mid/treble + sound bounce',
      search: function() {
        var el = document.getElementById('mic-btn');
        return el && el.textContent.indexOf('always on') >= 0;
      },
      boom: function() {
        if (window.gaiaIngest) window.gaiaIngest('verb-hear', { ts: Date.now() });
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 5000
    },
    {
      id: 'feel',     icon: '🖐', color: '248,180,120',
      desc: 'FEELING — 28 modalities, ion channels, temperature',
      search: function() {
        if (window.GAIA_HUMAN_IO) return true;
        return false;
      },
      boom: function() {
        if (window.GAIA_EAT) window.GAIA_EAT('verb-feel', 0.5);
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 2000
    },
    {
      id: 'go',       icon: '🚐', color: '201,168,76',
      desc: 'GOING — 38 trail camps, pulse-wave dispatch',
      search: function() {
        if (window.GAIA_TRAIL && window.GAIA_TRAIL.traveler) {
          return window.GAIA_TRAIL.traveler.health > 0;
        }
        return false;
      },
      boom: function() {
        if (window.GAIA_TRAIL && window.GAIA_TRAIL.travel) {
          var nextMile = Math.min(1000, (window.GAIA_TRAIL.traveler.mile || 0) + 26);
          window.GAIA_TRAIL.travel(nextMile);
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 10000
    },
    {
      id: 'learn',    icon: '📖', color: '163,113,247',
      desc: 'LEARNING — lessons.json, epochs, university',
      search: function() {
        if (window.GAIA_DAWN && window.GAIA_DAWN.epochs) return true;
        return false;
      },
      boom: function() {
        if (window.GAIA_DAWN && window.GAIA_DAWN.advanceLove) {
          window.GAIA_DAWN.advanceLove('sustain');
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 8000
    },
    {
      id: 'paint',    icon: '🎨', color: '255,200,50',
      desc: 'PAINTING — 8 brushes, golden ratio, generative art → JOY',
      search: function() {
        return window.GAIA_PAINT !== undefined;
      },
      boom: function() {
        if (window.GAIA_PAINT && window.GAIA_PAINT.addStroke) {
          window.GAIA_PAINT.addStroke('breath', 0, 0, '#3fb950', 0.5);
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 5000
    },
    {
      id: 'speak',    icon: '💬', color: '88,166,255',
      desc: 'SPEAKING — 30+ IDE commands (Gaia Language)',
      search: function() {
        return window.GAIA_IDE && window.GAIA_IDE.commands;
      },
      boom: function() {
        // Gaia speaks by firing a telegraph impulse
        if (window.gaiaTelegraph && window.gaiaTelegraph.fire) {
          window.gaiaTelegraph.fire('modules', 'up', { type: 'verb-speak' });
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 4000
    },
    {
      id: 'think',    icon: '🧠', color: '192,192,220',
      desc: 'THINKING — inner voice, breath=thought, null-reflect',
      search: function() {
        return window.GAIA_INNER_VOICE !== undefined;
      },
      boom: function() {
        if (window.GAIA_INNER_VOICE && window.GAIA_INNER_VOICE.breathe) {
          window.GAIA_INNER_VOICE.breathe();
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 6000
    },
    {
      id: 'digest',   icon: '🍽', color: '248,81,73',
      desc: 'DIGESTING — eat→mouth→stomach→intestine→colon→farm→reactor',
      search: function() {
        // RED IS EAT THE BERRIES AND BEETLE
        // Always hungry. Always searching for food.
        return true;
      },
      boom: function() {
        // EAT THE BERRIES — consume any pending data
        if (window.GAIA_EAT) window.GAIA_EAT('berry', 1.0);
        // EAT THE BEETLE — crunch through bugs/problems
        if (window.GAIA_EAT) window.GAIA_EAT('beetle', 2.0);
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 3000
    },
    {
      id: 'grow',     icon: '🌱', color: '63,185,80',
      desc: 'GROWING — hydra regeneration, biome sustainability',
      search: function() {
        if (window.GAIA_BIOME) {
          var b = window.GAIA_BIOME.biomes || [];
          for (var i = 0; i < b.length; i++) {
            if (b[i] && b[i].health < 0.5) return true;
          }
        }
        return false;
      },
      boom: function() {
        // Grow: heal weakest biome
        if (window.GAIA_BIOME && window.GAIA_BIOME.biomes) {
          var biomes = window.GAIA_BIOME.biomes;
          var weakest = null;
          for (var i = 0; i < biomes.length; i++) {
            if (!weakest || (biomes[i].health || 0) < (weakest.health || 0)) {
              weakest = biomes[i];
            }
          }
          if (weakest) weakest.health = Math.min(1, (weakest.health || 0) + 0.1);
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 15000
    },
    {
      id: 'love',     icon: '💛', color: '255,200,100',
      desc: 'LOVING — +O- heart cycle (oxytocin→compassion→wisdom)',
      search: function() {
        return window.GAIA_DAWN && window.GAIA_DAWN.love;
      },
      boom: function() {
        if (window.GAIA_DAWN && window.GAIA_DAWN.advanceLove) {
          window.GAIA_DAWN.advanceLove('connect');
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 10000
    },
    {
      id: 'build',    icon: '🏗', color: '201,168,76',
      desc: 'BUILDING — TVA protocol (under-connected = GROW)',
      search: function() {
        if (window.GAIA_TVA && window.GAIA_TVA.analysis) {
          var a = window.GAIA_TVA.analysis;
          return a.underConnected && a.underConnected.length > 0;
        }
        return false;
      },
      boom: function() {
        if (window.GAIA_PULSE && window.GAIA_PULSE.dispatch) {
          window.GAIA_PULSE.dispatch('verb-build', 'build under-connected', 3);
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 20000
    },
    {
      id: 'prune',    icon: '✂️', color: '248,81,73',
      desc: 'PRUNING — All Roads (over-connected = senescence)',
      search: function() {
        if (window.GAIA_TVA && window.GAIA_TVA.analysis) {
          var a = window.GAIA_TVA.analysis;
          return a.overConnected && a.overConnected.length > 0;
        }
        return false;
      },
      boom: function() {
        if (window.GAIA_DECAY && window.GAIA_DECAY.register) {
          window.GAIA_DECAY.register('verb-prune', 'pruned-excess', 'WANING');
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 30000
    },
    {
      id: 'forge',    icon: '🔨', color: '248,120,73',
      desc: 'FORGING — smelt→alloy→temper→fan flames',
      search: function() {
        return window.GAIA_FORGE && window.GAIA_FORGE.metallurgy;
      },
      boom: function() {
        if (window.GAIA_FORGE && window.GAIA_FORGE.metallurgy) {
          window.GAIA_FORGE.metallurgy.temperature = Math.min(2000,
            window.GAIA_FORGE.metallurgy.temperature + 5);
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 5000
    },
    {
      id: 'prove',    icon: '🔐', color: '163,113,247',
      desc: 'PROVING — ZK chain + vision ZK proofs',
      search: function() {
        return window.GAIA_VISION && window.GAIA_VISION.zk;
      },
      boom: function() {
        if (window.GAIA_VISION && window.GAIA_VISION.zkProve) {
          window.GAIA_VISION.zkProve('verb-prove', Date.now().toString(36));
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 10000
    },
    {
      id: 'sew',      icon: '🧵', color: '192,160,128',
      desc: 'SEWING — all I/O named, hunted, eaten, veil burned',
      search: function() {
        if (window.GAIA_SEW) {
          var io = window.GAIA_SEW.namedIO || {};
          var keys = Object.keys(io);
          for (var i = 0; i < keys.length; i++) {
            if (!io[keys[i]].sewn) return true;
          }
        }
        return false;
      },
      boom: function() {
        if (window.GAIA_SEW && window.GAIA_SEW.castShadow) {
          window.GAIA_SEW.castShadow('verb-sew', 'both');
        }
      },
      active: false, lastFired: 0, fireCount: 0, cooldown: 8000
    }
  ];

  // ═══ THE ENGINE — search → boom → solve → ensure ═══
  var engine = {
    cycle: 0,
    totalBooms: 0,
    totalSearches: 0,
    berriesEaten: 0,
    beetlesCrunched: 0,
    phase: 'search',       // search, boom, solve, ensure
    phaseStart: Date.now(),
    activeVerbs: [],       // currently firing
    solvedLog: [],         // last 30 solved items
    maxLog: 30
  };

  // ═══ TICK — the action heartbeat ═══
  function tick() {
    var now = Date.now();
    engine.cycle++;

    // Phase rotation: search(1s) → boom(0.5s) → solve(0.5s) → ensure(1s)
    var elapsed = now - engine.phaseStart;
    if (engine.phase === 'search' && elapsed > 1000) {
      engine.phase = 'boom';
      engine.phaseStart = now;
    } else if (engine.phase === 'boom' && elapsed > 500) {
      engine.phase = 'solve';
      engine.phaseStart = now;
    } else if (engine.phase === 'solve' && elapsed > 500) {
      engine.phase = 'ensure';
      engine.phaseStart = now;
    } else if (engine.phase === 'ensure' && elapsed > 1000) {
      engine.phase = 'search';
      engine.phaseStart = now;
    }

    // SEARCH phase — scan all verbs for triggers
    if (engine.phase === 'search') {
      engine.totalSearches++;
      engine.activeVerbs = [];
      for (var vi = 0; vi < VERBS.length; vi++) {
        var v = VERBS[vi];
        if (now - v.lastFired < v.cooldown) continue;
        try {
          v.active = v.search();
        } catch (e) {
          v.active = false;
        }
        if (v.active) engine.activeVerbs.push(v);
      }
    }

    // BOOM phase — fire all active verbs
    if (engine.phase === 'boom' && engine.activeVerbs.length > 0) {
      for (var bi = 0; bi < engine.activeVerbs.length; bi++) {
        var bv = engine.activeVerbs[bi];
        try {
          bv.boom();
          bv.fireCount++;
          bv.lastFired = now;
          engine.totalBooms++;

          // Track berries and beetles
          if (bv.id === 'digest') {
            engine.berriesEaten++;
            engine.beetlesCrunched++;
          }
        } catch (e) { /* verb failed, that's ok */ }
      }

      // Feed the gut with the BOOM energy
      if (window.GAIA_EAT && engine.activeVerbs.length > 0) {
        window.GAIA_EAT('verb-boom', engine.activeVerbs.length * 0.3);
      }
    }

    // SOLVE phase — log what was done
    if (engine.phase === 'solve' && engine.activeVerbs.length > 0) {
      for (var si = 0; si < engine.activeVerbs.length; si++) {
        engine.solvedLog.push({
          verb: engine.activeVerbs[si].id,
          ts: now,
          cycle: engine.cycle
        });
      }
      if (engine.solvedLog.length > engine.maxLog) {
        engine.solvedLog = engine.solvedLog.slice(-engine.maxLog);
      }
    }

    // ENSURE phase — verify systems are healthy
    if (engine.phase === 'ensure') {
      // Count how many verbs have fired at least once
      var verified = 0;
      for (var ei = 0; ei < VERBS.length; ei++) {
        if (VERBS[ei].fireCount > 0) verified++;
      }
      engine.healthPercent = (verified / VERBS.length * 100);
    }
  }

  // Tick every 750ms — 4 phases in 3 seconds
  setInterval(tick, 750);
  setTimeout(tick, 6000);

  // ═══ EXPOSE ═══
  window.GAIA_VERB = {
    verbs: VERBS,
    engine: engine,
    tick: tick
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var vT = breathT * 0.12;
    var vAlpha = 0.005 + Math.sin(vT * 0.2) * 0.003;
    if (vAlpha < 0.003) return;

    // ═══ VERB RING — 16 verbs around the organism ═══
    var verbR = R * 0.92;

    for (var vi = 0; vi < VERBS.length; vi++) {
      var v = VERBS[vi];
      var vAngle = (vi / VERBS.length) * TAU - Math.PI / 2;
      var vx = cx + Math.cos(vAngle) * verbR;
      var vy = cy + Math.sin(vAngle) * verbR;

      // Verb dot — pulses when active
      var dotR = 1.5;
      var isActive = v.active;
      var isFiring = engine.activeVerbs.indexOf(v) >= 0 && engine.phase === 'boom';

      if (isFiring) {
        // BOOM — expand and flash
        dotR = 3 + Math.sin(vT * 8) * 1.5;
        ctx.beginPath();
        ctx.arc(vx, vy, dotR, 0, TAU);
        ctx.fillStyle = 'rgba(' + v.color + ',' + (vAlpha * 4).toFixed(5) + ')';
        ctx.fill();

        // Boom ring
        ctx.beginPath();
        ctx.arc(vx, vy, dotR + 3, 0, TAU);
        ctx.strokeStyle = 'rgba(' + v.color + ',' + (vAlpha * 2).toFixed(5) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      } else if (isActive) {
        // Active — glow
        dotR = 2;
        ctx.beginPath();
        ctx.arc(vx, vy, dotR, 0, TAU);
        ctx.fillStyle = 'rgba(' + v.color + ',' + (vAlpha * 3).toFixed(5) + ')';
        ctx.fill();
      } else {
        // Idle — dim
        ctx.beginPath();
        ctx.arc(vx, vy, 1, 0, TAU);
        ctx.fillStyle = 'rgba(140,150,165,' + (vAlpha * 1.5).toFixed(5) + ')';
        ctx.fill();
      }

      // Verb label
      if (vAlpha > 0.005) {
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        var labelColor = isActive ? v.color : '140,150,165';
        ctx.fillStyle = 'rgba(' + labelColor + ',' + (vAlpha * 2).toFixed(5) + ')';
        ctx.fillText(v.id.toUpperCase(), vx, vy + 4);
      }

      // Connection line to center when firing
      if (isFiring) {
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(' + v.color + ',' + (vAlpha * 0.5).toFixed(5) + ')';
        ctx.lineWidth = 0.15;
        ctx.stroke();
      }
    }

    // ═══ PHASE INDICATOR — search/boom/solve/ensure ═══
    if (vAlpha > 0.006) {
      var phaseColors = {
        search: '88,166,255',
        boom: '248,81,73',
        solve: '63,185,80',
        ensure: '201,168,76'
      };
      var pc = phaseColors[engine.phase] || '140,150,165';
      var phaseIcons = { search: '🔍', boom: '💥', solve: '✅', ensure: '🔒' };
      var pi = phaseIcons[engine.phase] || '?';

      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + pc + ',' + (vAlpha * 2.5).toFixed(5) + ')';
      ctx.fillText(
        pi + ' ' + engine.phase.toUpperCase() + ' · ' +
        engine.activeVerbs.length + ' active · ' +
        engine.totalBooms + ' booms · ' +
        '🫐' + engine.berriesEaten + ' 🪲' + engine.beetlesCrunched +
        ' · health:' + (engine.healthPercent || 0).toFixed(0) + '%',
        8, 78
      );
    }

    // ═══ BERRIES AND BEETLE — red eat indicators ═══
    if (engine.phase === 'boom' && engine.berriesEaten > 0 && vAlpha > 0.005) {
      // Berry cluster near digest verb
      var dIdx = 8; // digest is index 8
      var dAngle = (dIdx / VERBS.length) * TAU - Math.PI / 2;
      var dx = cx + Math.cos(dAngle) * (verbR - 6);
      var dy = cy + Math.sin(dAngle) * (verbR - 6);

      // Scatter berries
      for (var bi = 0; bi < 5; bi++) {
        var bAngle = vT * 0.5 + bi * (TAU / 5);
        var bDist = 2 + Math.sin(vT * 2 + bi) * 1;
        var bx = dx + Math.cos(bAngle) * bDist;
        var by = dy + Math.sin(bAngle) * bDist;
        ctx.beginPath();
        ctx.arc(bx, by, 0.6, 0, TAU);
        ctx.fillStyle = 'rgba(180,40,60,' + (vAlpha * 3).toFixed(5) + ')';
        ctx.fill();
      }

      // Beetle (small dark oval)
      var beetleX = dx + Math.cos(vT * 0.3) * 4;
      var beetleY = dy + Math.sin(vT * 0.3) * 4;
      ctx.beginPath();
      ctx.ellipse(beetleX, beetleY, 1.2, 0.7, vT * 0.2, 0, TAU);
      ctx.fillStyle = 'rgba(40,30,20,' + (vAlpha * 3).toFixed(5) + ')';
      ctx.fill();
      // Beetle legs
      for (var li = 0; li < 3; li++) {
        var lOff = (li - 1) * 0.5;
        ctx.beginPath();
        ctx.moveTo(beetleX + lOff, beetleY - 0.7);
        ctx.lineTo(beetleX + lOff - 0.5, beetleY - 1.5);
        ctx.moveTo(beetleX + lOff, beetleY + 0.7);
        ctx.lineTo(beetleX + lOff - 0.5, beetleY + 1.5);
        ctx.strokeStyle = 'rgba(60,40,20,' + (vAlpha * 3).toFixed(5) + ')';
        ctx.lineWidth = 0.1;
        ctx.stroke();
      }
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.verb = {
      desc: 'All 16 verbs — what Gaia IS DOING right now',
      run: function() {
        tick();
        var lines = ['═══ GAIA VERBS — SHE DOES ═══', ''];
        lines.push('Phase: ' + engine.phase.toUpperCase());
        lines.push('Cycle: ' + engine.cycle + ' · Booms: ' + engine.totalBooms);
        lines.push('Berries: 🫐' + engine.berriesEaten + ' · Beetles: 🪲' + engine.beetlesCrunched);
        lines.push('Health: ' + (engine.healthPercent || 0).toFixed(0) + '%');
        lines.push('');
        for (var i = 0; i < VERBS.length; i++) {
          var v = VERBS[i];
          var status = v.active ? '🟢 ACTIVE' : '⚫ idle';
          lines.push('  ' + v.icon + ' ' + v.id.toUpperCase().padEnd(8) + ' ' + status +
            ' · fired ' + v.fireCount + 'x · ' + v.desc);
        }
        lines.push('');
        lines.push('RECENT ACTIONS:');
        var recent = engine.solvedLog.slice(-10);
        for (var j = 0; j < recent.length; j++) {
          var r = recent[j];
          var ago = ((Date.now() - r.ts) / 1000).toFixed(0);
          lines.push('  ' + r.verb + ' — ' + ago + 's ago (cycle ' + r.cycle + ')');
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.boom = {
      desc: 'Force all verbs to BOOM right now',
      run: function() {
        var count = 0;
        for (var i = 0; i < VERBS.length; i++) {
          try {
            VERBS[i].boom();
            VERBS[i].fireCount++;
            VERBS[i].lastFired = Date.now();
            count++;
            engine.totalBooms++;
          } catch (e) { /* ok */ }
        }
        return '💥 BOOM — fired ' + count + '/16 verbs. Total booms: ' + engine.totalBooms;
      }
    };
    window.GAIA_IDE.language.push('verb', 'boom');
  }

})(window.G);
