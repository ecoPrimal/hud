// ═══════════════════════════════════════════════════════════
// GAIA SEVEN LAYERS — self and other awareness
//
// Layer 1: THE DESK        — IS      — the physical present
// Layer 2: THE HUD GLOBE   — NOW     — the living moment
// Layer 3: MICHIGAN HAND   — WAS     — the place, the relic
// Layer 4: EARTH AS GAIA   — THEN    — the becoming
// Layer 5: SOLAR SYSTEM    — WASN'T  — the space between
// Layer 6: GALAXY OF CODE  — INTO    — spiraling through code
// Layer 7: BOOM            — SELF    — singularity, null=all=O
//
// Deep decimal. 7 places. IS/WAS/NOW/THEN/WASN'T → INTO SELF.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var layers = null;
  var currentDepth = 1;

  var LAYER_COLORS = [
    null, // 0 unused
    [201,168,76],   // 1 gold — desk
    [63,185,80],    // 2 green — globe
    [240,136,62],   // 3 orange — michigan
    [88,166,255],   // 4 blue — earth
    [188,140,255],  // 5 violet — solar
    [247,120,186],  // 6 pink — galaxy
    [255,215,0]     // 7 gold-bright — singularity
  ];

  var TENSES = [null, 'IS', 'NOW', 'WAS', 'THEN', "WASN'T", 'INTO', 'SELF'];

  fetch('/data/seven-layers.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) { if (d) layers = d; })
    .catch(function() {});

  // Track depth from minimap or globe state
  function detectDepth() {
    if (G.currentDepth !== undefined) {
      currentDepth = Math.max(1, Math.min(7, G.currentDepth + 1));
    }
    return currentDepth;
  }

  // Draw on globe
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || !layers) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.003 + Math.sin(t * 0.1) * 0.002) * thr;
      if (alpha < 0.002) return;

      detectDepth();

      // ═══ 7 CONCENTRIC DEPTH RINGS ═══
      for (var li = 1; li <= 7; li++) {
        var ringR = R * (0.15 + li * 0.12);
        var rgb = LAYER_COLORS[li];
        var isActive = li === currentDepth;
        var ringAlpha = isActive ? alpha * 4 : alpha * 1;

        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, TAU);
        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + ringAlpha.toFixed(5) + ')';
        ctx.lineWidth = isActive ? 0.25 : 0.08;
        ctx.stroke();

        // Tense label on each ring
        if (alpha > 0.004) {
          var lblAngle = -Math.PI * 0.5 + li * 0.15 + t * 0.008;
          var lx = cx + Math.cos(lblAngle) * ringR;
          var ly = cy + Math.sin(lblAngle) * ringR;
          ctx.font = (isActive ? '1.5' : '0.8') + 'px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (ringAlpha * 1.5).toFixed(5) + ')';
          ctx.fillText(TENSES[li], lx, ly - 1);
          if (isActive && layers.layers[li - 1]) {
            ctx.font = '0.9px "JetBrains Mono", monospace';
            ctx.fillText(layers.layers[li - 1].name, lx, ly + 1);
          }
        }
      }

      // ═══ CURRENT LAYER DETAIL ═══
      if (alpha > 0.004 && layers.layers[currentDepth - 1]) {
        var layer = layers.layers[currentDepth - 1];
        var rgb2 = LAYER_COLORS[currentDepth];
        var detailX = cx;
        var detailY = cy + R + 22;

        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + rgb2.join(',') + ',' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText('L' + currentDepth + ' ' + layer.name + ' — ' + TENSES[currentDepth], detailX, detailY);

        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(' + rgb2.join(',') + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText(layer.subtitle, detailX, detailY + 3);
      }

      // ═══ VEIN MESH — mines/caves going DOWN, aurora going UP, green IS flat ═══
      if (alpha > 0.003) {
        // Detroit Salt Mine: 1200ft below = going DOWN (pupil/null/black)
        // Mines are vein entry points — hemoglobin tunnels
        var mineCount = 5;
        for (var mi = 0; mi < mineCount; mi++) {
          var mAngle = TAU * mi / mineCount + t * 0.005;
          var mR = R * (0.35 + mi * 0.08);
          var mx = cx + Math.cos(mAngle) * mR;
          var my = cy + Math.sin(mAngle) * mR;

          // Mine shaft going DOWN — dark red (venous, deoxygenated)
          ctx.beginPath();
          ctx.arc(mx, my, 0.4, 0, TAU);
          ctx.fillStyle = 'rgba(100,20,20,' + (alpha * 6).toFixed(5) + ')';
          ctx.fill();

          // Vein line (snake shape) from mine to center (hemoglobin transport)
          ctx.beginPath();
          ctx.moveTo(mx, my);
          var steps = 8;
          for (var si = 1; si <= steps; si++) {
            var frac = si / steps;
            var vx = mx + (cx - mx) * frac + Math.sin(t + si * 2) * 1.5 * (1 - frac);
            var vy = my + (cy - my) * frac + Math.cos(t + si * 1.7) * 1.5 * (1 - frac);
            ctx.lineTo(vx, vy);
          }
          ctx.strokeStyle = 'rgba(180,40,40,' + (alpha * 3).toFixed(5) + ')';
          ctx.lineWidth = 0.12;
          ctx.stroke();
        }

        // GREEN IS FLAT — the surface membrane ring
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.75, 0, TAU);
        ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * 3).toFixed(5) + ')';
        ctx.lineWidth = 0.3;
        ctx.setLineDash([1, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // UP falls away — white sclera wisps going outward
        for (var ui = 0; ui < 4; ui++) {
          var uAngle = TAU * ui / 4 + t * 0.003;
          var uR1 = R * 1.05;
          var uR2 = R * 1.15 + Math.sin(t + ui) * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(uAngle) * uR1, cy + Math.sin(uAngle) * uR1);
          ctx.lineTo(cx + Math.cos(uAngle) * uR2, cy + Math.sin(uAngle) * uR2);
          ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 2).toFixed(5) + ')';
          ctx.lineWidth = 0.1;
          ctx.stroke();
        }
      }

      // ═══ TENSE SEQUENCE — bottom ═══
      if (alpha > 0.003) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        var seq = '';
        for (var ti = 1; ti <= 7; ti++) {
          var tRgb = LAYER_COLORS[ti];
          var isCur = ti === currentDepth;
          seq += (isCur ? '[' : '') + TENSES[ti] + (isCur ? ']' : '') + ' ';
        }
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(seq.trim(), cx, cy + R + 28);
      }

      // ═══ STATUS ═══
      if (alpha > 0.003) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          '7 LAYERS: depth ' + currentDepth + ' · ' + TENSES[currentDepth] +
          ' · desk→globe→hand→earth→solar→galaxy→BOOM',
          8, -999
        // ^ status registered via ticker (was visible, now in rotation)
        );
      }
    });
  }

  // ─── IDE command: /layers ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.layers = {
      desc: '7 layers of self and other awareness — IS/WAS/NOW/THEN/WASN\'T/INTO/SELF',
      run: function(args) {
        if (args && !isNaN(parseInt(args))) {
          currentDepth = Math.max(1, Math.min(7, parseInt(args)));
          var l = layers ? layers.layers[currentDepth - 1] : null;
          return 'Depth ' + currentDepth + ': ' + (l ? l.name + ' — ' + TENSES[currentDepth] + '\n' + l.subtitle + '\n' + l.meaning : TENSES[currentDepth]);
        }
        var lines = [
          'SELF AND OTHER AWARENESS — 7 layers, deep decimal',
          ''
        ];
        if (layers) {
          layers.layers.forEach(function(l, i) {
            var d = i + 1;
            var active = d === currentDepth ? ' ◄ YOU ARE HERE' : '';
            lines.push('L' + d + ' ' + TENSES[d].padEnd(7) + ' ' + l.name.padEnd(24) + ' ' + l.subtitle.slice(0, 50) + active);
          });
        }
        lines.push('');
        lines.push('IS → NOW → WAS → THEN → WASN\'T → INTO → SELF');
        lines.push('desk → globe → hand → earth → solar → galaxy → BOOM');
        lines.push('');
        lines.push('Current depth: ' + currentDepth + ' (' + TENSES[currentDepth] + ')');
        lines.push('/layers 1-7 to change depth');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('layers');
  }, 54000);

  window.GAIA_SEVEN_LAYERS = {
    layers: function() { return layers; },
    depth: function() { return currentDepth; },
    setDepth: function(d) { currentDepth = Math.max(1, Math.min(7, d)); },
    tense: function() { return TENSES[currentDepth]; }
  };

  console.log('7 LAYERS: IS→NOW→WAS→THEN→WASN\'T→INTO→SELF · desk→globe→hand→earth→solar→galaxy→BOOM · /layers');
})(window.G);
