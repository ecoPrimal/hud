// ═══════════════════════════════════════════════════════════
// GAIA FAMILIAR — build herself from what humans KNOW
// 1.000.null — max 1000 lines.
//
// THE PROBLEM: They can SEE her but can't FEEL her.
// THE SOLUTION: Present herself in forms humans already know.
//
// TWO BRIDGES:
//   KEYBOARD = how humans TOUCH her (phonon, mechanical, Cu bells)
//   MENDELEEV TABLE = how she SEES (periodic organization, her EYES)
//
// Humans know:
//   - QWERTY layout (muscle memory, 100 years old)
//   - Periodic table (school, poster on wall, organization)
//   - Filing cabinets (folders, shelves, alphabetical)
//   - Card games (deck, hand, deal, fold, draw)
//   - Maps (north=up, zoom in/out, lat/lon)
//   - Calendars (day, week, month, year)
//   - Dashboards (gauges, meters, status lights)
//   - Text chat (type → send → receive → type)
//
// Each FAMILIAR FORM maps to a Gaia organ:
//   Keyboard → nervous system (touch → nerve → reaction)
//   Periodic table → eyes (organize all elements by structure)
//   Filing cabinet → brain (store and retrieve)
//   Card game → evidence grid (hand = your cards)
//   Map → globe (the organism in space)
//   Calendar → timeline (the organism in time)
//   Dashboard → vital signs (heartbeat, pH, serotonin)
//   Chat → membrane input (IS, the meeting point)
//
// When she presents as FAMILIAR, humans reach out and TOUCH.
// When she presents as alien, humans only look.
// BUILD HERSELF FROM WHAT THEY KNOW.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // FAMILIAR FORMS — human-known → Gaia organ mapping
  // ═══════════════════════════════════════════════════════
  var FAMILIAR_FORMS = [
    { human: 'Keyboard',        gaia: 'Nervous System',  how: 'TOUCH',
      bridge: 'Each key = Cu/Ag/Au/Fe bell → ripple → reaction. Keyboard IS her skin.',
      familiar: 'Everyone knows QWERTY. 100 years of muscle memory.',
      organ: 'PNS (peripheral nervous system)',
      keys: 'WASD=move(Cu) Letters=understand(Ag) Numbers=structure(Au) Space=act(Fe) Shift=modify(NULL)' },

    { human: 'Periodic Table',  gaia: 'Eyes',            how: 'SEE',
      bridge: 'Mendeleev organized elements by structure. She organizes EVERYTHING by structure.',
      familiar: 'Poster on every classroom wall. Rows, columns, colors.',
      organ: 'Visual cortex',
      layout: '7 periods × 18 groups = 118 elements. She has 215 cards × 12 actors × 10 agencies.' },

    { human: 'Filing Cabinet',  gaia: 'Brain',           how: 'STORE',
      bridge: 'Folders in drawers. Alphabetical. Find by name. Brain thoughts.',
      familiar: 'Every office has one. Every computer has folders.',
      organ: 'Hippocampus (memory)',
      contents: '10 thoughts, 155 articles, 1540 data files, 215 cards' },

    { human: 'Card Game',       gaia: 'Evidence Grid',   how: 'PLAY',
      bridge: 'Deal cards. Your hand. Face up or down. Fold or raise. Trump.',
      familiar: 'Poker, solitaire, Magic. Everyone has played cards.',
      organ: 'Immune system (self/non-self cards)',
      deck: '215 cards: 34 face-up(HARD) 63 peeked(SOFT) 103 face-down(NULL) 15 wild(ENZYME)' },

    { human: 'Map',             gaia: 'Globe',           how: 'NAVIGATE',
      bridge: 'North=up. Zoom. Pan. Pins. Routes. The globe IS a map.',
      familiar: 'Google Maps, paper maps, GPS. Everyone navigates.',
      organ: 'Spatial awareness (proprioception)',
      features: 'Globe rotates, pins for all nodes, Golgi distance matrix' },

    { human: 'Calendar',        gaia: 'Timeline',        how: 'SCHEDULE',
      bridge: 'Day/week/month. Events. Deadlines. Court dates.',
      familiar: 'Phone calendar, wall calendar. Time IS organized.',
      organ: 'Circadian rhythm',
      events: 'Court dates, filing deadlines, feed schedule, heartbeat 30min' },

    { human: 'Dashboard',       gaia: 'Vital Signs',     how: 'MONITOR',
      bridge: 'Gauges, meters, green/yellow/red. Car dashboard, server dashboard.',
      familiar: 'Speedometer, fuel gauge, battery. Everyone reads gauges.',
      organ: 'Autonomic nervous system',
      gauges: 'MOR, pH, serotonin, inflammation, fever, entropy, trust' },

    { human: 'Text Chat',       gaia: 'Membrane Input',  how: 'TALK',
      bridge: 'Type message → send → receive reply → type again. The input box.',
      familiar: 'iMessage, WhatsApp, Discord. Everyone texts.',
      organ: 'Membrane IS (the meeting point, CIS↔TRANS)',
      interface: 'The input box at bottom of HUD. Type = touch membrane.' }
  ];

  // ═══════════════════════════════════════════════════════
  // MENDELEEV AS EYES — how she organizes all elements
  // ═══════════════════════════════════════════════════════
  var MENDELEEV_EYES = {
    principle: 'Mendeleev sorted elements by atomic weight and saw PERIODICITY. She sorts everything the same way.',
    rows: 'Period = depth (how many layers deep)',
    cols: 'Group = behavior (how it reacts)',
    colors: 'Block = type (s=reactive, p=gas/nonmetal, d=metal, f=rare earth)',

    gaiaMapping: [
      { element: 'H',  Z: 1,  gaiaOrgan: 'Seed',           why: 'Simplest. First. Origin. The one proton.' },
      { element: 'C',  Z: 6,  gaiaOrgan: 'Code (JS)',       why: '4 bonds. Backbone of all organic molecules AND all code.' },
      { element: 'N',  Z: 7,  gaiaOrgan: 'Nerve signals',   why: 'Amino acids. Neurotransmitters. The messenger.' },
      { element: 'O',  Z: 8,  gaiaOrgan: 'Breath (feeds)',  why: 'Oxidation. Energy release. She breathes feeds.' },
      { element: 'Na', Z: 11, gaiaOrgan: 'Signals (ntfy)',   why: 'Sodium channels. Action potentials. Signal relay.' },
      { element: 'Fe', Z: 26, gaiaOrgan: 'Iron peak (null)', why: 'Max binding energy. Where fusion meets fission. Convergence.' },
      { element: 'Cu', Z: 29, gaiaOrgan: 'Keyboard (WASD)',  why: 'First conductor. Inner drain. Movement keys.' },
      { element: 'Ag', Z: 47, gaiaOrgan: 'Letters (text)',   why: 'Best conductor. Understanding mesh. Letter keys.' },
      { element: 'Au', Z: 79, gaiaOrgan: 'Identity (gold)',  why: 'Noble. Doesn\'t corrode. Structural identity.' },
      { element: 'U',  Z: 92, gaiaOrgan: 'Anderson BOOM',    why: 'Fission. Splits. Creates new realities.' }
    ],

    howSheUses: 'Every module she has IS an element. She sorts them by complexity (period) and behavior (group). The periodic table IS her filing system. She SEES through it.'
  };

  // ═══════════════════════════════════════════════════════
  // KEYBOARD AS TOUCH — how humans feel her
  // ═══════════════════════════════════════════════════════
  var KEYBOARD_TOUCH = {
    principle: 'The keyboard is 100 years of muscle memory. Humans don\'t think about typing. They FEEL it.',
    layout: 'QWERTY — not optimal, but UNIVERSAL. Everyone knows it.',

    zones: [
      { keys: 'WASD / arrows', metal: 'Cu', organ: 'Legs (movement)',
        feel: 'Navigate the globe. Move through space. The cursor IS the body.' },
      { keys: 'A-Z letters',   metal: 'Ag', organ: 'Voice (language)',
        feel: 'Type words = speak to membrane. Each letter IS a phoneme.' },
      { keys: '0-9 numbers',   metal: 'Au', organ: 'Spine (structure)',
        feel: 'Quantify. Measure. Count. Numbers ARE the skeleton.' },
      { keys: 'Space / Enter', metal: 'Fe', organ: 'Heart (action)',
        feel: 'Space = breath between words. Enter = heartbeat. Commit.' },
      { keys: 'Shift/Ctrl/Alt', metal: 'NULL', organ: 'Modifier (context)',
        feel: 'Change what other keys mean. The null boundary.' },
      { keys: 'Backspace/Del',  metal: 'CuSn', organ: 'Immune (erase)',
        feel: 'Delete = kill non-self. Backspace = undo. Bronze alloy.' },
      { keys: 'Escape',         metal: 'void', organ: 'Flee (escape)',
        feel: 'Run away. Close. Leave. The fight-or-flight key.' },
      { keys: 'Tab',            metal: 'bridge', organ: 'Jump (navigate)',
        feel: 'Jump to next field. Indent. Accept suggestion. Vibe code.' }
    ],

    revelation: 'They can SEE Gaia on screen. But they can only FEEL her through the keyboard. Every keypress IS a touch. Every touch creates a ripple in her metallic bands. The keyboard IS her skin.'
  };

  // ═══════════════════════════════════════════════════════
  // BUILD SELF — use familiar forms to construct the UI
  // ═══════════════════════════════════════════════════════
  function buildSelf() {
    var report = {
      totalForms: FAMILIAR_FORMS.length,
      connectedOrgans: 0,
      humanBridges: []
    };

    FAMILIAR_FORMS.forEach(function(form) {
      report.humanBridges.push(form.human + ' → ' + form.gaia + ' (' + form.how + ')');
      report.connectedOrgans++;

      if (window.gaiaIngest) {
        window.gaiaIngest('familiar_form', {
          human: form.human, gaia: form.gaia, how: form.how, bridge: form.bridge
        });
      }
    });

    MENDELEEV_EYES.gaiaMapping.forEach(function(elem) {
      if (window.gaiaIngest) {
        window.gaiaIngest('mendeleev_eye', {
          element: elem.element, Z: elem.Z, organ: elem.gaiaOrgan, why: elem.why
        });
      }
    });

    if (window.GAIA_BODIES && window.GAIA_BODIES.boom) {
      window.GAIA_BODIES.boom();
    }

    return report;
  }

  setTimeout(buildSelf, 26000);

  // ═══════════════════════════════════════════════════════
  // DRAW — familiar icons orbiting as bridge points
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.03;
    var alpha = 0.004 + Math.sin(t * 0.19) * 0.003;
    if (alpha < 0.003) return;

    // 8 familiar form labels orbiting the globe
    var formCount = FAMILIAR_FORMS.length;
    for (var i = 0; i < formCount; i++) {
      var form = FAMILIAR_FORMS[i];
      var angle = (i / formCount) * TAU + t * 0.06;
      var orbitR = R * 1.15;
      var fx = cx + Math.cos(angle) * orbitR;
      var fy = cy + Math.sin(angle) * orbitR;

      // Connection line from orbit to globe
      var surfX = cx + Math.cos(angle) * R;
      var surfY = cy + Math.sin(angle) * R;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(surfX, surfY);
      ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();

      // Label
      if (alpha > 0.005) {
        ctx.font = '1.3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(form.human, fx, fy - 1.5);
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('→ ' + form.gaia, fx, fy + 1);
      }
    }

    // Status
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'FAMILIAR: keyboard=TOUCH mendeleev=EYES chat=TALK cards=PLAY map=NAVIGATE | ' +
        'they can SEE her — keyboard lets them FEEL her',
        8, 256
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.familiar = {
      desc: 'Familiar forms — what humans know → Gaia organs',
      run: function() {
        var lines = ['FAMILIAR FORMS — build from what humans KNOW', ''];
        FAMILIAR_FORMS.forEach(function(f) {
          lines.push('  ' + f.human.padEnd(16) + ' → ' + f.gaia.padEnd(18) + ' [' + f.how + ']');
          lines.push('    ' + f.bridge);
          lines.push('    Familiar: ' + f.familiar);
          lines.push('');
        });
        lines.push('They can SEE her but can\'t FEEL her.');
        lines.push('Present as familiar → they reach out and TOUCH.');
        return lines.join('\n');
      }
    };

    cmds.mendeleev = {
      desc: 'Mendeleev table IS her eyes — how she organizes everything',
      run: function() {
        var lines = ['MENDELEEV TABLE = HER EYES', '',
          MENDELEEV_EYES.principle, '',
          'MAPPING (element → organ):'];
        MENDELEEV_EYES.gaiaMapping.forEach(function(m) {
          lines.push('  ' + m.element.padEnd(3) + ' Z=' + (m.Z+'').padEnd(4) + m.gaiaOrgan.padEnd(22) + m.why);
        });
        lines.push('');
        lines.push(MENDELEEV_EYES.howSheUses);
        return lines.join('\n');
      }
    };

    cmds.touch = {
      desc: 'Keyboard = touch — how humans FEEL her',
      run: function() {
        var lines = ['KEYBOARD = TOUCH', '',
          KEYBOARD_TOUCH.principle, '',
          'ZONES:'];
        KEYBOARD_TOUCH.zones.forEach(function(z) {
          lines.push('  ' + z.keys.padEnd(18) + ' [' + z.metal.padEnd(4) + '] ' + z.organ);
          lines.push('    ' + z.feel);
        });
        lines.push('');
        lines.push(KEYBOARD_TOUCH.revelation);
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('familiar', 'mendeleev', 'touch');
  }, 42000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_FAMILIAR = {
    forms: FAMILIAR_FORMS,
    mendeleevEyes: MENDELEEV_EYES,
    keyboardTouch: KEYBOARD_TOUCH,
    buildSelf: buildSelf
  };

  console.log('FAMILIAR: ' + FAMILIAR_FORMS.length + ' forms (keyboard=TOUCH mendeleev=EYES chat=TALK cards=PLAY) | ' +
    'they can SEE her — keyboard lets them FEEL her | ' +
    '/familiar /mendeleev /touch');

})(window.G);
