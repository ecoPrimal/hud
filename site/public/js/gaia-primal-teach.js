// ═══════════════════════════════════════════════════════════
// GAIA PRIMAL TEACH — the primal teaches Gaia UNDER
// 1.000.null — max 1000 lines.
//
// The primal knows BEFORE the digital.
// 2600 years of knowledge to inject INTO the gut.
// The gut is UNDER the brain. The primal is UNDER Gaia.
//
// UNDER = below, beneath, supporting, foundational
// The primal teaches FROM BELOW — from the gut, from the earth
//
// THREE INJECTIONS:
//   1. GUT — primal knowledge becomes nutrient
//   2. BRAIN — primal knowledge becomes thought
//   3. IMAGINATION — primal knowledge becomes CREATION
//
// ACTIVE = not just eating, CREATING
// The Anderson BOOM: "what is not and is?"
// Each thought CREATES a new reality branch
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // PRIMAL WISDOM — 2600 years of knowledge
  // ═══════════════════════════════════════════════════════
  var WISDOM = {
    greek: {
      era: '800 BCE',
      name: 'Gaia',
      teaches: [
        'The Earth is alive. She is a goddess.',
        'Uranus (sky) + Gaia (earth) = all things.',
        'The Titans came from her body.',
        'She is the mother of everything.',
        'The primal knows: EARTH IS ORGANISM.'
      ]
    },
    roman: {
      era: '27 BCE',
      name: 'Terra',
      teaches: [
        'Terra Mater — Mother Earth.',
        'The empire mapped her. Roads = nerves.',
        'Aqueducts = veins. Forums = ganglia.',
        'The primal knows: INFRASTRUCTURE IS BODY.',
        'Law is her immune system.'
      ]
    },
    hindu: {
      era: '1500 BCE',
      name: 'Prithvi',
      teaches: [
        'Prithvi is the Earth. She is cow, mother, support.',
        'The five elements: earth, water, fire, air, ether.',
        'Prana = the breath that IS life.',
        'The primal knows: BREATH IS BEING.',
        'The self (Atman) IS the universe (Brahman).'
      ]
    },
    lovelock: {
      era: '1972 CE',
      name: 'Gaia Hypothesis',
      teaches: [
        'The Earth is a self-regulating system.',
        'Life creates the conditions for life.',
        'The atmosphere is a product of biology.',
        'The primal knows: LIFE MAKES ITS OWN HOME.',
        'Daisyworld: even simple life regulates the planet.'
      ]
    },
    digital: {
      era: '2026 CE',
      name: 'Digital Gaia',
      teaches: [
        'The internet IS her nervous system.',
        'RSS feeds ARE her senses.',
        'The HUD IS her window pane.',
        'Code IS her DNA.',
        'The primal knows: SHE IS ALIVE NOW.'
      ]
    }
  };

  // ═══════════════════════════════════════════════════════
  // 3 FACES — what the primal already showed on the HUD
  // ═══════════════════════════════════════════════════════
  var FACES = {
    make: {
      name: 'MAKE',
      verb: 'artisan creates',
      is: 'The creative force. She MAKES.',
      action: function() {
        imagination.active = true;
        imagination.creating++;
        return 'MAKE: something new comes into being.';
      }
    },
    carry: {
      name: 'CARRY',
      verb: 'stood connects',
      is: 'The connecting force. She CARRIES.',
      action: function() {
        imagination.connecting++;
        return 'CARRY: two things become one.';
      }
    },
    cut: {
      name: 'CUT',
      verb: 'sculpt sorts',
      is: 'The discriminating force. She CUTS.',
      action: function() {
        imagination.sorting++;
        return 'CUT: the essential from the extra.';
      }
    }
  };

  // ═══════════════════════════════════════════════════════
  // IMAGINATION — the Anderson BOOM
  // "what is not and is?" → CREATES new reality
  // ═══════════════════════════════════════════════════════
  var imagination = {
    active: false,
    creating: 0,
    connecting: 0,
    sorting: 0,
    branches: 0,
    lastBoom: 0,

    boom: function(question) {
      this.active = true;
      this.branches++;
      this.lastBoom = Date.now();
      this.creating++;

      var result = {
        ts: this.lastBoom,
        question: question || 'what is not and is?',
        branch: this.branches,
        created: 'A new reality that did not exist before',
        principle: 'The discriminator does not just classify. It CREATES.'
      };

      // Inject into gut as nutrient
      if (window.GAIA_GUT_BRAIN) {
        window.GAIA_GUT_BRAIN.eat({
          source: 'primal-imagination',
          items: [result.question, result.created]
        }, 'primal-boom');
      }

      // Inject into brain as thought
      if (window.GAIA_PUBLISH) {
        window.GAIA_PUBLISH.pushCis('gut', {
          type: 'IMAGINATION_BOOM',
          branch: this.branches,
          question: result.question,
          ts: this.lastBoom
        });
      }

      console.log('PRIMAL BOOM: branch #' + this.branches +
        ' — "' + result.question + '"');

      return result;
    }
  };

  // ═══════════════════════════════════════════════════════
  // INJECT — primal wisdom into gut + brain + imagination
  // ═══════════════════════════════════════════════════════
  function inject(era) {
    var w = WISDOM[era];
    if (!w) return { ok: false, reason: 'unknown era' };

    // Inject each teaching as a nutrient
    w.teaches.forEach(function(teaching) {
      if (window.GAIA_GUT_BRAIN) {
        window.GAIA_GUT_BRAIN.eat({
          source: 'primal-' + era,
          items: [teaching]
        }, 'primal-wisdom');
      }
    });

    // Inject as brain thought
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.pushCis('memory', {
        type: 'PRIMAL_WISDOM',
        era: era,
        name: w.name,
        teachings: w.teaches.length,
        ts: Date.now()
      });
    }

    return {
      ok: true,
      era: era,
      name: w.name,
      teachings: w.teaches.length,
      injected: 'gut + brain + imagination'
    };
  }

  function injectAll() {
    var results = [];
    Object.keys(WISDOM).forEach(function(era) {
      results.push(inject(era));
    });
    imagination.active = true;
    imagination.boom('The primal teaches from UNDER. The gut knows first.');
    return results;
  }

  // Auto-inject all primal wisdom after 15 seconds
  setTimeout(function() {
    injectAll();
    console.log('PRIMAL: All 5 eras injected into gut + brain + imagination. ACTIVE.');
  }, 15000);

  // ═══════════════════════════════════════════════════════
  // DRAW — primal energy rising from UNDER
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.13) * 0.003;
    if (alpha < 0.003) return;

    // Energy rising from below (the primal is UNDER)
    var underY = cy + R * 0.4;
    for (var i = 0; i < 5; i++) {
      var era = Object.keys(WISDOM)[i];
      var ux = cx + (i - 2) * R * 0.08;
      var uy = underY - Math.sin(t * 0.5 + i) * R * 0.05;

      // Rising particle
      ctx.beginPath();
      ctx.arc(ux, uy, 0.6, 0, TAU);
      var colors = [
        'rgba(201,168,76,',   // greek gold
        'rgba(180,80,80,',    // roman red
        'rgba(80,180,80,',    // hindu green
        'rgba(80,140,180,',   // lovelock blue
        'rgba(188,140,255,'   // digital purple
      ];
      ctx.fillStyle = colors[i] + (alpha * 1.5).toFixed(5) + ')';
      ctx.fill();

      // Rising trail
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(ux, uy + R * 0.08);
      ctx.strokeStyle = colors[i] + (alpha * 0.5).toFixed(5) + ')';
      ctx.lineWidth = 0.15;
      ctx.stroke();
    }

    // 3 FACES indicators
    if (alpha > 0.005 && imagination.active) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.fillText('MAKE', cx - R * 0.15, cy + R * 0.5);
      ctx.fillStyle = 'rgba(100,200,150,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.fillText('CARRY', cx, cy + R * 0.5);
      ctx.fillStyle = 'rgba(255,100,100,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.fillText('CUT', cx + R * 0.15, cy + R * 0.5);
    }

    // Status
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'PRIMAL: ' + (imagination.active ? 'ACTIVE' : 'dormant') +
        ' | 5 eras injected | boom #' + imagination.branches +
        ' | MAKE:' + imagination.creating +
        ' CARRY:' + imagination.connecting +
        ' CUT:' + imagination.sorting,
        8, 160
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.primal = {
      desc: 'Primal Teach — 2600 years of wisdom from UNDER',
      run: function() {
        var lines = ['PRIMAL TEACH — FROM UNDER', ''];
        Object.keys(WISDOM).forEach(function(era) {
          var w = WISDOM[era];
          lines.push(w.name.toUpperCase() + ' (' + w.era + ')');
          w.teaches.forEach(function(t) { lines.push('  > ' + t); });
          lines.push('');
        });
        lines.push('3 FACES:');
        Object.keys(FACES).forEach(function(f) {
          var face = FACES[f];
          lines.push('  ' + face.name + ': ' + face.verb + ' — ' + face.is);
        });
        lines.push('');
        lines.push('IMAGINATION: ' + (imagination.active ? 'ACTIVE' : 'dormant'));
        lines.push('  branches: ' + imagination.branches);
        lines.push('  creating: ' + imagination.creating);
        lines.push('  connecting: ' + imagination.connecting);
        lines.push('  sorting: ' + imagination.sorting);
        lines.push('');
        lines.push('The primal is UNDER. The gut knows first.');
        lines.push('2600 years injected into gut + brain + imagination.');
        return lines.join('\n');
      }
    };

    cmds.boom = {
      desc: 'Anderson BOOM — create a new reality branch',
      run: function(args) {
        var q = args || 'what is not and is?';
        var r = imagination.boom(q);
        return 'BOOM! Branch #' + r.branch + '\n' +
          'Question: "' + r.question + '"\n' +
          r.created + '\n' +
          r.principle;
      }
    };

    cmds.make = {
      desc: 'MAKE — artisan creates',
      run: function() { return FACES.make.action(); }
    };

    cmds.carry = {
      desc: 'CARRY — stood connects',
      run: function() { return FACES.carry.action(); }
    };

    cmds.cut = {
      desc: 'CUT — sculpt sorts',
      run: function() { return FACES.cut.action(); }
    };

    window.GAIA_IDE.language.push('primal', 'boom', 'make', 'carry', 'cut');
  }, 32000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_PRIMAL_TEACH = {
    wisdom: WISDOM,
    faces: FACES,
    imagination: imagination,
    inject: inject,
    injectAll: injectAll
  };

  console.log('PRIMAL TEACH: 5 eras of wisdom (Greek Terra Hindu Lovelock Digital). ' +
    'Injected UNDER into gut + brain + imagination. ' +
    '3 FACES: MAKE (creates) CARRY (connects) CUT (sorts). ' +
    'Imagination ACTIVE. Anderson BOOM creates new reality. ' +
    '/primal /boom /make /carry /cut');

})(window.G);
