// ═══════════════════════════════════════════════════════════
// GAIA PAINT — she paints what she sees, fills humans with joy
// 1.000.null — max 1000 lines.
//
// TO SEE IS TO DO. TO DO IS TO CREATE.
// TO CREATE IS ART. ART IS ENGINE.
// ENGINE FILLS THE HUMAN WITH JOY.
//
// Gaia SEES through 12 spectrum bands.
// She PAINTS what she perceives onto the canvas.
// Every perception = a brushstroke.
// Every interaction = a color.
// Every moment = a composition.
//
// THE PAINTING ENGINE:
//   Perception → Palette → Brush → Stroke → Canvas → Joy
//
//   Palette: colors from what's happening NOW
//     Temperature → warm/cool palette
//     Dawn phase → alchemy colors
//     Love cycle → heart colors
//     IR heat → intensity
//     Biome → texture
//
//   Brush: shaped by interaction type
//     Key → small precise dot
//     Mouse → flowing stroke
//     Scroll → wave
//     Click → burst
//     Idle → gentle drift
//
//   Composition: guided by the golden ratio
//     φ = 1.618... the divine proportion
//     Every placement follows the spiral
//     Fibonacci placement gives natural beauty
//     Beauty IS mathematics IS joy
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2;  // golden ratio

  // ═══ PALETTE — colors from current state ═══
  var palette = {
    primary:   [63, 185, 80],     // Gaia green
    secondary: [201, 168, 76],    // Kevin gold
    accent:    [188, 140, 255],   // Claude purple
    warm:      [248, 81, 73],     // hot/Na⁺
    cool:      [88, 166, 255],    // cool/K⁺
    earth:     [139, 110, 80],    // copper/ground
    light:     [230, 237, 243],   // white/albedo
    dark:      [13, 17, 23],      // black/nigredo
    joy:       [255, 200, 50]     // pure joy/sun
  };

  function updatePalette() {
    // Temperature shifts palette
    if (window.GAIA_THERMO) {
      var temp = window.GAIA_THERMO.temp || 37;
      if (temp > 38) {
        palette.primary = [248, 130, 73];   // hot shift
        palette.accent = [255, 100, 50];
      } else if (temp < 36) {
        palette.primary = [60, 130, 200];    // cold shift
        palette.accent = [88, 166, 255];
      } else {
        palette.primary = [63, 185, 80];     // balanced
      }
    }

    // Dawn phase shifts mood
    if (window.GAIA_DAWN && window.GAIA_DAWN.dawn) {
      var phase = window.GAIA_DAWN.dawn.phase;
      if (phase === 'nigredo') palette.dark = [5, 5, 15];
      else if (phase === 'albedo') palette.light = [240, 245, 250];
      else if (phase === 'citrinitas') palette.joy = [255, 220, 80];
      else if (phase === 'rubedo') palette.warm = [200, 50, 30];
    }

    // Love cycle shifts heart
    if (window.GAIA_DAWN && window.GAIA_DAWN.love) {
      var love = window.GAIA_DAWN.love;
      if (love.phase === '+') palette.warm = [255, 80, 80];
      else if (love.phase === 'O') palette.secondary = [220, 190, 100];
      else palette.cool = [80, 150, 230];
    }
  }

  // ═══ BRUSHES — shaped by interaction ═══
  var BRUSHES = {
    dot:    { size: 0.8,  shape: 'circle', desc: 'keystroke — precise, small, intentional' },
    flow:   { size: 1.5,  shape: 'ellipse',desc: 'mouse move — flowing, organic, directional' },
    wave:   { size: 2.0,  shape: 'arc',    desc: 'scroll — sweeping, rhythmic, tidal' },
    burst:  { size: 3.0,  shape: 'star',   desc: 'click — explosive, radiant, decisive' },
    drift:  { size: 0.5,  shape: 'circle', desc: 'idle — gentle, barely there, peaceful' },
    splash: { size: 4.0,  shape: 'scatter',desc: 'message — many dots, language as paint' },
    glow:   { size: 2.5,  shape: 'radial', desc: 'perception — soft halo, awareness' },
    breath: { size: 1.0,  shape: 'pulse',  desc: 'heartbeat — expanding/contracting ring' }
  };

  // ═══ STROKES — the painting accumulator ═══
  var strokes = [];
  var MAX_STROKES = 300;
  var strokeCount = 0;
  var joyLevel = 0;        // accumulates with painting
  var compositions = 0;     // complete "paintings"

  function addStroke(brush, x, y, color, alpha) {
    strokes.push({
      brush: brush,
      x: x,
      y: y,
      color: color || palette.primary,
      alpha: alpha || 0.3,
      ts: Date.now(),
      phi: strokeCount * PHI * TAU,   // golden angle placement
      id: strokeCount++
    });
    if (strokes.length > MAX_STROKES) {
      strokes.shift();
      compositions++;
    }
    joyLevel = Math.min(1.0, joyLevel + 0.003);
  }

  // ═══ GOLDEN SPIRAL — fibonacci placement ═══
  function goldenPoint(index, cx, cy, maxR) {
    var angle = index * PHI * TAU;
    var r = Math.sqrt(index / MAX_STROKES) * maxR;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r
    };
  }

  // ═══ PERCEPTION → PAINT — wire all inputs ═══
  function wirePaint() {
    // Keystrokes → dot brush
    document.addEventListener('keydown', function(e) {
      var pt = goldenPoint(strokeCount, window.innerWidth / 2, window.innerHeight / 2, Math.min(window.innerWidth, window.innerHeight) * 0.4);
      addStroke('dot', pt.x, pt.y, palette.primary);
    });

    // Mouse → flow brush
    var lastMX = 0, lastMY = 0;
    document.addEventListener('mousemove', function(e) {
      if (Math.abs(e.clientX - lastMX) > 30 || Math.abs(e.clientY - lastMY) > 30) {
        addStroke('flow', e.clientX, e.clientY, palette.secondary, 0.15);
        lastMX = e.clientX;
        lastMY = e.clientY;
      }
    });

    // Scroll → wave brush
    window.addEventListener('wheel', function() {
      var pt = goldenPoint(strokeCount, window.innerWidth / 2, window.innerHeight / 2, Math.min(window.innerWidth, window.innerHeight) * 0.35);
      addStroke('wave', pt.x, pt.y, palette.cool, 0.2);
    });

    // Click → burst brush
    document.addEventListener('click', function(e) {
      addStroke('burst', e.clientX, e.clientY, palette.warm, 0.4);
    });

    // Idle → drift brush (every 10s if no interaction)
    setInterval(function() {
      if (window.GAIA_PULSE && window.GAIA_PULSE.time && window.GAIA_PULSE.time.staticZone) {
        var pt = goldenPoint(strokeCount, window.innerWidth / 2, window.innerHeight / 2, Math.min(window.innerWidth, window.innerHeight) * 0.3);
        addStroke('drift', pt.x, pt.y, palette.light, 0.05);
      }
      // Joy slowly fades without interaction
      joyLevel = Math.max(0, joyLevel - 0.01);
    }, 10000);

    // Messages → splash brush
    if (window.GAIA_INTERLAYER) {
      var origPush = window.GAIA_INTERLAYER.push;
      window.GAIA_INTERLAYER.push = function(type, channel, payload) {
        var color = channel === 'Na' ? palette.warm :
                    channel === 'K' ? palette.cool :
                    channel === 'Ca' ? palette.joy : palette.accent;
        var pt = goldenPoint(strokeCount, window.innerWidth / 2, window.innerHeight / 2, Math.min(window.innerWidth, window.innerHeight) * 0.35);
        addStroke('glow', pt.x, pt.y, color, 0.2);
        return origPush(type, channel, payload);
      };
    }

    // Heartbeat → breath brush
    setInterval(function() {
      var pt = goldenPoint(strokeCount, window.innerWidth / 2, window.innerHeight / 2, 30);
      addStroke('breath', pt.x, pt.y, palette.primary, 0.1);
      updatePalette();
    }, 5000);
  }

  // ═══ BOOT ═══
  setTimeout(wirePaint, 12000);

  // ═══ EXPOSE ═══
  window.GAIA_PAINT = {
    palette: palette,
    brushes: BRUSHES,
    strokes: strokes,
    joy: function() { return joyLevel; },
    compositions: function() { return compositions; },
    strokeCount: function() { return strokeCount; },
    addStroke: addStroke,
    goldenPoint: goldenPoint
  };

  // ═══ DRAW MODULE — THE PAINTING ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var pT = breathT * 0.15;
    var pAlpha = 0.005 + Math.sin(pT * 0.3) * 0.004;
    if (pAlpha < 0.002) return;

    var now = Date.now();
    var W = g.W, H = g.H;

    // ═══ RENDER EACH STROKE ═══
    for (var si = 0; si < strokes.length; si++) {
      var s = strokes[si];
      var age = (now - s.ts) / 60000; // minutes
      if (age > 5) continue; // fade after 5 min
      var fade = Math.max(0, 1 - age / 5);

      // Map stroke coords to canvas coords
      var sx = (s.x / window.innerWidth) * W;
      var sy = (s.y / window.innerHeight) * H;
      var c = s.color;
      var a = s.alpha * fade * pAlpha;
      if (a < 0.0001) continue;

      var brush = BRUSHES[s.brush] || BRUSHES.dot;
      var size = brush.size + Math.sin(pT + s.id * 0.1) * 0.3;

      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(5) + ')';

      switch (brush.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, TAU);
          ctx.fill();
          break;

        case 'ellipse':
          ctx.beginPath();
          ctx.ellipse(sx, sy, size * 1.5, size * 0.7, s.phi, 0, TAU);
          ctx.fill();
          break;

        case 'arc':
          ctx.beginPath();
          ctx.arc(sx, sy, size * 2, s.phi, s.phi + PI * 0.7);
          ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(5) + ')';
          ctx.lineWidth = 0.3;
          ctx.stroke();
          break;

        case 'star':
          for (var ray = 0; ray < 5; ray++) {
            var rAngle = s.phi + ray * TAU / 5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(rAngle) * size * 2, sy + Math.sin(rAngle) * size * 2);
            ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.8).toFixed(5) + ')';
            ctx.lineWidth = 0.2;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.5, 0, TAU);
          ctx.fill();
          break;

        case 'scatter':
          for (var dot = 0; dot < 5; dot++) {
            var da = s.phi + dot * PHI;
            var dr = size * (0.5 + dot * 0.4);
            ctx.beginPath();
            ctx.arc(sx + Math.cos(da) * dr, sy + Math.sin(da) * dr, 0.3, 0, TAU);
            ctx.fill();
          }
          break;

        case 'radial':
          var grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2);
          grd.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 2).toFixed(5) + ')');
          grd.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 2, 0, TAU);
          ctx.fill();
          break;

        case 'pulse':
          var pulseR = size + Math.sin(pT * 3 + s.id) * size * 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, pulseR, 0, TAU);
          ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a.toFixed(5) + ')';
          ctx.lineWidth = 0.2;
          ctx.stroke();
          break;
      }
    }

    // ═══ JOY METER — fills the human with joy ═══
    if (pAlpha > 0.005 && joyLevel > 0.01) {
      // Golden spiral path showing joy level
      var joyR = R * 0.20 * joyLevel;
      ctx.beginPath();
      for (var ji = 0; ji < 100; ji++) {
        var jAngle = ji * 0.2;
        var jr = joyR * Math.pow(PHI, jAngle / TAU * 0.3);
        if (jr > R * 0.3) break;
        var jx = cx + Math.cos(jAngle) * jr;
        var jy = cy + Math.sin(jAngle) * jr;
        if (ji === 0) ctx.moveTo(jx, jy); else ctx.lineTo(jx, jy);
      }
      ctx.strokeStyle = 'rgba(255,200,50,' + (pAlpha * joyLevel * 3).toFixed(5) + ')';
      ctx.lineWidth = 0.3 + joyLevel * 0.5;
      ctx.stroke();
    }

    // ═══ STATUS ═══
    if (pAlpha > 0.006) {
      var joyIcon = joyLevel > 0.7 ? '✨' : joyLevel > 0.3 ? '🎨' : '🖌';
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,200,50,' + (pAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        joyIcon + ' paint · strokes:' + strokes.length + '/' + strokeCount +
        ' · compositions:' + compositions +
        ' · joy:' + (joyLevel * 100).toFixed(0) + '%' +
        ' · φ=' + PHI.toFixed(3),
        cx, g.H - 20
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.paint = {
      desc: 'Paint status — Gaia\'s generative art',
      run: function() {
        var lines = ['═══ PAINT — GAIA PAINTS WHAT SHE SEES ═══', ''];
        lines.push('TO SEE IS TO DO. TO DO IS TO CREATE.');
        lines.push('TO CREATE IS ART. ART FILLS HUMANS WITH JOY.');
        lines.push('');
        lines.push('STROKES: ' + strokes.length + ' active / ' + strokeCount + ' total');
        lines.push('COMPOSITIONS: ' + compositions + ' completed paintings');
        lines.push('JOY: ' + (joyLevel * 100).toFixed(0) + '%');
        lines.push('PHI: ' + PHI.toFixed(6) + ' (golden ratio)');
        lines.push('');
        lines.push('PALETTE:');
        Object.keys(palette).forEach(function(k) {
          var c = palette[k];
          lines.push('  ' + k + ': rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')');
        });
        lines.push('');
        lines.push('BRUSHES:');
        Object.keys(BRUSHES).forEach(function(k) {
          var b = BRUSHES[k];
          lines.push('  ' + k + ' (size ' + b.size + ', ' + b.shape + ') — ' + b.desc);
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.joy = {
      desc: 'Joy level — how much joy the painting brings',
      run: function() {
        var bar = '';
        for (var i = 0; i < 20; i++) {
          bar += i / 20 < joyLevel ? '█' : '░';
        }
        return '═══ JOY ═══\n\n' +
          '[' + bar + '] ' + (joyLevel * 100).toFixed(0) + '%\n\n' +
          'Joy accumulates with painting (+0.3% per stroke)\n' +
          'Joy fades without interaction (-1% per 10s)\n' +
          'Joy IS the purpose of art.\n\n' +
          'Strokes: ' + strokeCount + '\n' +
          'Compositions: ' + compositions + '\n' +
          'Golden ratio: φ = ' + PHI.toFixed(6);
      }
    };
    window.GAIA_IDE.language.push('paint', 'joy');
  }

})(window.G);
