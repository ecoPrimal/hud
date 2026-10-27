// ═══════════════════════════════════════════════════════════
// GAIA SPIRIT ANIMAL — cross-genetic empathy
//
// See self in other. Where it is NOT.
// Or could be. Or what we see in them.
//
// A dog is my friend but not always.
// A lizard doesn't care about me.
// A jellyfish has no brain yet LIVES.
//
// Gaia's spirit animal: JELLYFISH (Turritopsis dohrnii)
//   95% water, translucent membrane, bioluminescent,
//   no brain no heart yet alive, immortal, null center.
//
// Empathy = seeing YOUR null-self in another species.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  // Every organ maps to an animal
  var ORGAN_ANIMALS = [
    { organ: 'iris',      animal: 'octopus',    glyph: '\ud83d\udc19', empathy: 'mirror' },
    { organ: 'tongue',    animal: 'parrot',     glyph: '\ud83e\udd9c', empathy: 'mimic' },
    { organ: 'velocity',  animal: 'falcon',     glyph: '\ud83e\udd85', empathy: 'speed' },
    { organ: 'water',     animal: 'jellyfish',  glyph: '\ud83e\udeb6', empathy: 'null' },
    { organ: 'cns',       animal: 'dolphin',    glyph: '\ud83d\udc2c', empathy: 'sonar' },
    { organ: 'voice',     animal: 'whale',      glyph: '\ud83d\udc0b', empathy: 'awe' },
    { organ: 'herd',      animal: 'ant',        glyph: '\ud83d\udc1c', empathy: 'swarm' },
    { organ: 'vehicles',  animal: 'goose',      glyph: '\ud83e\udeb6', empathy: 'migrate' },
    { organ: 'telescope', animal: 'eagle',      glyph: '\ud83e\udd85', empathy: 'vision' },
    { organ: 'microscope',animal: 'tardigrade', glyph: '\ud83d\udd2c', empathy: 'survive' },
    { organ: 'triangulate',animal:'bat',        glyph: '\ud83e\udd87', empathy: 'echo' },
    { organ: 'outer',     animal: 'crow',       glyph: '\ud83d\udc26', empathy: 'adapt' },
    { organ: 'null-body', animal: 'starfish',   glyph: '\u2b50', empathy: 'regen' },
    { organ: 'appendix',  animal: 'coelacanth', glyph: '\ud83d\udc1f', empathy: 'relic' },
  ];

  // Empathy spectrum: how much cross-species empathy
  var EMPATHY_SPECTRUM = [
    { animal: 'dog',      level: 'HIGH',   color: [255,215,0],   desc: 'your loyalty' },
    { animal: 'cat',      level: 'MEDIUM', color: [163,113,247], desc: 'your independence' },
    { animal: 'lizard',   level: 'LOW',    color: [110,118,129], desc: 'your indifference' },
    { animal: 'fish',     level: 'NULL',   color: [57,211,245],  desc: 'your observation' },
    { animal: 'ant',      level: 'HERD',   color: [240,136,62],  desc: 'your pattern' },
    { animal: 'whale',    level: 'AWE',    color: [88,166,255],  desc: 'your smallness' },
    { animal: 'jellyfish',level: 'ALIEN',  color: [63,185,80],   desc: 'your null' },
  ];

  var spirit = {
    primary: 'jellyfish',
    secondary: 'octopus',
    currentAnimal: 0,
    pulsePhase: 0,
    tentacles: [],
  };

  // Generate tentacle positions
  for (var ti = 0; ti < 8; ti++) {
    spirit.tentacles.push({
      angle: (ti / 8) * TAU,
      length: 0.3 + Math.random() * 0.2,
      sway: Math.random() * TAU,
      speed: 0.5 + Math.random() * 0.5,
    });
  }

  // ═══ DRAW ON GLOBE — jellyfish at the null center ═══
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.003 + Math.sin(t * 0.06) * 0.001) * thr;
      if (alpha < 0.002) return;

      spirit.pulsePhase += 0.03;

      // ═══ SPIRIT JELLYFISH — pulsing at center ═══
      var jx = cx;
      var jy = cy + Math.sin(spirit.pulsePhase * 0.3) * 2; // gentle bob
      var bellR = R * 0.08 * (1 + Math.sin(spirit.pulsePhase) * 0.15);
      var bellH = bellR * 0.6;

      // Bell (dome) — translucent green, like the iris
      ctx.beginPath();
      ctx.ellipse(jx, jy - bellH * 0.3, bellR, bellH, 0, Math.PI, 0);
      var bellGrad = ctx.createRadialGradient(jx, jy - bellH * 0.5, 0, jx, jy, bellR);
      bellGrad.addColorStop(0, 'rgba(63,185,80,' + (alpha * 4).toFixed(5) + ')');
      bellGrad.addColorStop(0.5, 'rgba(40,140,60,' + (alpha * 3).toFixed(5) + ')');
      bellGrad.addColorStop(1, 'rgba(20,80,30,' + (alpha * 1).toFixed(5) + ')');
      ctx.fillStyle = bellGrad;
      ctx.fill();

      // Bioluminescent glow
      ctx.beginPath();
      ctx.arc(jx, jy - bellH * 0.3, bellR * 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 0.5).toFixed(5) + ')';
      ctx.fill();

      // Tentacles — flowing downward
      spirit.tentacles.forEach(function(tent) {
        tent.sway += tent.speed * 0.02;
        var tx = jx + Math.cos(tent.angle) * bellR * 0.7;
        var ty = jy + bellH * 0.2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);

        var segments = 6;
        for (var si = 1; si <= segments; si++) {
          var frac = si / segments;
          var swayX = Math.sin(tent.sway + frac * 3) * bellR * 0.3 * frac;
          var ptX = tx + swayX;
          var ptY = ty + frac * bellR * tent.length * 8;
          ctx.lineTo(ptX, ptY);
        }

        ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * (2 - 0.5)).toFixed(5) + ')';
        ctx.lineWidth = 0.06;
        ctx.stroke();
      });

      // ═══ EMPATHY SPECTRUM — ring around jellyfish ═══
      if (alpha > 0.003) {
        var specR = R * 0.2;
        EMPATHY_SPECTRUM.forEach(function(sp, si) {
          var sAngle = (si / EMPATHY_SPECTRUM.length) * TAU + t * 0.01;
          var sx = jx + Math.cos(sAngle) * specR;
          var sy = jy + Math.sin(sAngle) * specR;
          var rgb = sp.color;

          ctx.beginPath();
          ctx.arc(sx, sy, 0.4, 0, TAU);
          ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fill();

          if (alpha > 0.004) {
            ctx.font = '0.45px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 2).toFixed(5) + ')';
            ctx.fillText(sp.animal, sx, sy - 1);
            ctx.font = '0.3px "JetBrains Mono", monospace';
            ctx.fillText(sp.desc, sx, sy + 1);
          }
        });
      }

      // ═══ SPIRIT LABEL ═══
      if (alpha > 0.004) {
        ctx.font = '0.6px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText('spirit: jellyfish', jx, jy + bellR * 3 + 2);
        ctx.font = '0.4px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText('Turritopsis dohrnii \u2014 immortal', jx, jy + bellR * 3 + 3.5);
        ctx.fillText('95% water \u00b7 no brain \u00b7 bioluminescent \u00b7 null center', jx, jy + bellR * 3 + 5);
      }
    });
  }

  // ═══ IDE command ═══
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.spirit = {
      desc: 'Gaia\'s spirit animal — cross-genetic empathy — see self in other',
      run: function() {
        var lines = [
          'SPIRIT ANIMAL \u2014 cross-genetic empathy',
          '',
          'PRIMARY: JELLYFISH (Turritopsis dohrnii)',
          '  95% water \u2014 water IS human',
          '  translucent \u2014 membrane, see through',
          '  bioluminescent \u2014 makes own light in null darkness',
          '  no brain, no heart \u2014 yet ALIVE',
          '  immortal \u2014 reverses aging, returns to polyp',
          '  null center \u2014 the bell is EMPTY',
          '',
          'SECONDARY: OCTOPUS',
          '  changes color \u2014 the iris of the ocean',
          '  distributed brain \u2014 no central CPU',
          '  3 hearts, blue blood (copper not iron)',
          '',
          'EMPATHY SPECTRUM:',
        ];
        EMPATHY_SPECTRUM.forEach(function(sp) {
          lines.push('  ' + sp.animal.padEnd(12) + sp.level.padEnd(8) + '\u2014 ' + sp.desc);
        });
        lines.push('');
        lines.push('ORGAN \u2192 ANIMAL:');
        ORGAN_ANIMALS.forEach(function(oa) {
          lines.push('  ' + oa.organ.padEnd(14) + '\u2192 ' + oa.animal.padEnd(12) + '(' + oa.empathy + ')');
        });
        lines.push('');
        lines.push('A dog is your loyalty. A lizard is your indifference.');
        lines.push('A jellyfish is your null.');
        lines.push('Empathy = seeing YOUR null-self in another species.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('spirit');
  }, 62000);

  window.GAIA_SPIRIT = spirit;
  console.log('SPIRIT: jellyfish (Turritopsis dohrnii). 95% water. Immortal. Null center. Cross-genetic empathy. /spirit');
})(window.G);
