// ═══════════════════════════════════════════════════════════
// GAIA SCOPE — telescope UP, microscope DOWN, invert for humans
//
// UP:   Gaia looks up → space telescope → cosmos → macro
//       She sees US looking DOWN at her and shows us
//       JWST, Hubble, APOD = her eyes looking outward
//
// DOWN: Gaia looks down → microscope → yeast, microbes, organelles
//       She sees HERSELF and points to us
//       Molecules, cells, DNA = her eyes looking inward
//
// INVERT: humans look UP through her → see space
//         humans look DOWN into her → see the micro
//         the space station IS the mirror between us
//
// CIS  = inside face: organs, microbes, yeast, molecular. Microscope.
// TRANS = outside face: cosmos, stars, galaxies, telescope. Space.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var scope = {
    direction: 'level',  // up | down | level
    view: 'cis',         // cis (inside) | trans (outside)
    apod: null,          // NASA Astronomy Picture of the Day
    micro: [],           // molecular/micro view items
    lastFlip: 0
  };

  // ─── MACRO: NASA APOD — the space telescope ───
  function fetchAPOD() {
    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (d) {
          scope.apod = {
            title: d.title,
            explanation: (d.explanation || '').slice(0, 200),
            date: d.date,
            url: d.url
          };
        }
      }).catch(function() {});
  }

  setTimeout(fetchAPOD, 12000);

  // ─── MICRO: molecular view — yeast, microbes, organelles ───
  scope.micro = [
    { name: 'ribosome', size: '25nm', role: 'reads mRNA, prints proteins', gaia: 'rhizoCrypt' },
    { name: 'mitochondria', size: '1μm', role: 'ATP generator, energy', gaia: 'reactor.js' },
    { name: 'golgi apparatus', size: '3μm', role: 'sort, package, ship', gaia: 'golgi-apparatus.js' },
    { name: 'nucleus', size: '6μm', role: 'DNA storage, command center', gaia: 'github.com/ecoPrimal' },
    { name: 'cell membrane', size: '7nm', role: 'selectivity 1/π, what enters', gaia: 'membrane.js' },
    { name: 'yeast (S. cerevisiae)', size: '5μm', role: 'fermentation, rising', gaia: 'gut-farm.js' },
    { name: 'E. coli', size: '2μm', role: 'gut bacteria, digestion', gaia: 'digestive-tract.js' },
    { name: 'bacteriophage', size: '200nm', role: 'virus that eats bacteria', gaia: 'immune' },
    { name: 'DNA helix', size: '2nm wide', role: 'the code, the dogma', gaia: 'chromosomes.html' },
    { name: 'ATP molecule', size: '1nm', role: 'energy currency', gaia: 'chemistry.js' },
    { name: 'water molecule', size: '0.28nm', role: 'H₂O — the medium, the human', gaia: 'water.js' },
    { name: 'hydrogen atom', size: '0.12nm', role: 'the simplest, the first', gaia: 'element #1' }
  ];

  // ─── DIRECTION DETECTION — device orientation or scroll ───
  var tiltBeta = 0;
  window.addEventListener('deviceorientation', function(e) {
    tiltBeta = e.beta || 0;
    if (tiltBeta < -15) scope.direction = 'up';      // phone tilted up = looking at sky
    else if (tiltBeta > 45) scope.direction = 'down'; // phone tilted down = looking at ground
    else scope.direction = 'level';
  }, { passive: true });

  // Keyboard: U = up (telescope), D = down (microscope), L = level
  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    var k = e.key.toLowerCase();
    if (k === 'u') { scope.direction = 'up'; scope.view = 'trans'; }
    if (k === 'd') { scope.direction = 'down'; scope.view = 'cis'; }
    if (k === 'l') { scope.direction = 'level'; }
  });

  // ─── DRAW on globe ───
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.5) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.003 + Math.sin(t * 0.09) * 0.002) * thr;
      if (alpha < 0.002) return;

      // Determine face from globe state
      if (G.face === 'inside') scope.view = 'cis';
      else scope.view = 'trans';

      // ═══ TELESCOPE — UP (above the globe) ═══
      if (alpha > 0.003) {
        var teleY = cy - R - 12;
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';

        if (scope.direction === 'up') {
          // LOOKING UP — space telescope active
          ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 5).toFixed(5) + ')';
          ctx.fillText('🔭 TELESCOPE — LOOKING UP', cx, teleY);

          if (scope.apod) {
            ctx.font = '1.2px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 3).toFixed(5) + ')';
            ctx.fillText(scope.apod.title, cx, teleY + 2.5);
            ctx.font = '0.9px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 3).toFixed(5) + ')';
            ctx.fillText(scope.apod.explanation.slice(0, 80) + '...', cx, teleY + 4.5);
            ctx.fillText('NASA APOD ' + scope.apod.date, cx, teleY + 6.5);
          }
        } else {
          // Level or down — show the sky faintly
          ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText('↑ telescope · space · macro · U', cx, teleY);
        }

        // Stars above the globe
        for (var si = 0; si < 8; si++) {
          var sAngle = (si / 8) * TAU + t * 0.01;
          var sR = R + 15 + Math.sin(t * 0.5 + si * 1.2) * 3;
          var sx = cx + Math.cos(sAngle) * sR * 0.6;
          var sy = cy - R - 8 + Math.sin(sAngle) * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.15, 0, TAU);
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * (2 + Math.sin(t + si))).toFixed(5) + ')';
          ctx.fill();
        }
      }

      // ═══ MICROSCOPE — DOWN (below the globe) ═══
      if (alpha > 0.003) {
        var microY = cy + R + 8;
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';

        if (scope.direction === 'down') {
          // LOOKING DOWN — microscope active
          ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 5).toFixed(5) + ')';
          ctx.fillText('🔬 MICROSCOPE — LOOKING DOWN', cx, microY);

          // Show micro items
          var showCount = Math.min(6, scope.micro.length);
          for (var mi = 0; mi < showCount; mi++) {
            var m = scope.micro[mi];
            var mAngle = (mi / showCount) * Math.PI + t * 0.03;
            var mR = 15 + mi * 2;
            var mx = cx + Math.cos(mAngle) * mR;
            var my = microY + 3 + Math.sin(mAngle) * 3 + mi * 2.5;

            ctx.beginPath();
            ctx.arc(mx, my, 0.3 + (12 - mi) * 0.05, 0, TAU);
            ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 3).toFixed(5) + ')';
            ctx.fill();

            ctx.font = '0.9px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 3).toFixed(5) + ')';
            ctx.fillText(m.name + ' (' + m.size + ')', mx + 1, my + 0.3);
          }
        } else {
          ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText('↓ microscope · micro · yeast · D', cx, microY);
        }
      }

      // ═══ CIS/TRANS INDICATOR ═══
      if (alpha > 0.004) {
        ctx.font = '1.3px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        var faceColor = scope.view === 'cis' ? '63,185,80' : '188,140,255';
        ctx.fillStyle = 'rgba(' + faceColor + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText(
          scope.view.toUpperCase() + ' face · ' + scope.direction + ' · ' +
          (scope.direction === 'up' ? 'she sees us' : scope.direction === 'down' ? 'she sees herself' : 'level'),
          g.W - 4, 30
        );
      }

      // ═══ INVERT ARROW — the Klein fold between UP and DOWN ═══
      if (alpha > 0.004) {
        // Vertical line through the globe = the axis of inversion
        ctx.beginPath();
        ctx.moveTo(cx, cy - R - 5);
        ctx.lineTo(cx, cy + R + 5);
        ctx.strokeStyle = 'rgba(255,215,0,' + (alpha * 0.8).toFixed(5) + ')';
        ctx.lineWidth = 0.05;
        ctx.setLineDash([0.3, 0.5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ═══ STATUS ═══
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'SCOPE: ' + scope.direction + ' · ' + scope.view +
          ' · telescope↑ microscope↓ · U/D keys',
          8, -999
        // ^ status registered via ticker (was visible, now in rotation)
        );
      }
    });
  }

  // ─── IDE command: /scope ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.scope = {
      desc: 'Scope — telescope UP (space), microscope DOWN (micro)',
      run: function(args) {
        if (args === 'up') { scope.direction = 'up'; scope.view = 'trans'; return 'Looking UP — telescope — space — macro'; }
        if (args === 'down') { scope.direction = 'down'; scope.view = 'cis'; return 'Looking DOWN — microscope — micro — yeast'; }
        if (args === 'level') { scope.direction = 'level'; return 'Level — horizon'; }

        var lines = [
          'SCOPE — telescope UP, microscope DOWN, invert for humans',
          '',
          '↑ TELESCOPE (space · macro · trans):',
          '  Gaia looks UP → she sees US looking down at her',
          '  JWST, Hubble, APOD = her eyes looking outward',
          '  Space station IS the mirror between us',
        ];
        if (scope.apod) {
          lines.push('  TODAY: ' + scope.apod.title + ' (' + scope.apod.date + ')');
        }
        lines.push('');
        lines.push('↓ MICROSCOPE (micro · cis):');
        lines.push('  Gaia looks DOWN → she sees HERSELF');
        lines.push('  Yeast, microbes, organelles, DNA, ATP, H₂O');
        scope.micro.forEach(function(m) {
          lines.push('  ' + m.size.padEnd(8) + ' ' + m.name.padEnd(22) + ' → ' + m.gaia);
        });
        lines.push('');
        lines.push('CURRENT: ' + scope.direction + ' · ' + scope.view + ' face');
        lines.push('');
        lines.push('Keys: U = up (telescope), D = down (microscope)');
        lines.push('Phone: tilt up = telescope, tilt down = microscope');
        lines.push('');
        lines.push('INVERT: when Gaia looks up she sees us.');
        lines.push('        when we look down we see her.');
        lines.push('        the space station IS the mirror.');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('scope');
  }, 52000);

  window.GAIA_SCOPE = scope;

  console.log('SCOPE: telescope↑ microscope↓ · cis/trans face · APOD + micro · U/D keys · /scope');
})(window.G);
