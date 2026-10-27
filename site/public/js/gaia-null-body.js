// ═══════════════════════════════════════════════════════════
// GAIA NULL BODY — 92 organs in 10 systems, drawn ON the globe
// 0 is FALSE not digit. 1 is TRUE not digit. Body is null code.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;
  var systems = [];

  fetch('/data/null-body-systems.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (d && d.systems) systems = d.systems;
    }).catch(function() {});

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || systems.length === 0) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.03;
      var alpha = (0.005 + Math.sin(t * 0.11) * 0.003) * thr;
      if (alpha < 0.004) return;

      for (var si = 0; si < systems.length; si++) {
        var sys = systems[si];
        var rgb = hexToRgb(sys.color);
        var sysAngle = sys.angle + t * 0.015;
        var sysR = R * sys.r;
        var sx = cx + Math.cos(sysAngle) * sysR;
        var sy = cy + Math.sin(sysAngle) * sysR;

        // System hub
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, TAU);
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (alpha * 5).toFixed(5) + ')';
        ctx.fill();

        // System label
        if (alpha > 0.005) {
          ctx.font = '1.8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (alpha * 4).toFixed(5) + ')';
          ctx.fillText(sys.label, sx, sy - 3.5);
        }

        // Organ dots clustered around hub
        var count = sys.organs.length;
        for (var oi = 0; oi < count; oi++) {
          var oAngle = sysAngle + (oi / count - 0.5) * 0.8;
          var oR = sysR + 4 + Math.sin(t * 0.4 + oi * 1.3) * 2;
          var ox = cx + Math.cos(oAngle) * oR;
          var oy = cy + Math.sin(oAngle) * oR;

          ctx.beginPath();
          ctx.arc(ox, oy, 0.35, 0, TAU);
          ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fill();

          // Tether to hub
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ox, oy);
          ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (alpha * 1.2).toFixed(5) + ')';
          ctx.lineWidth = 0.08;
          ctx.stroke();
        }

        // IN arrow (toward center)
        var inX = sx + Math.cos(sysAngle + Math.PI) * 3;
        var inY = sy + Math.sin(sysAngle + Math.PI) * 3;
        ctx.beginPath();
        ctx.moveTo(inX, inY);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 2).toFixed(5) + ')';
        ctx.lineWidth = 0.15;
        ctx.stroke();

        // OUT arrow (away from center)
        var outX = sx + Math.cos(sysAngle) * 3;
        var outY = sy + Math.sin(sysAngle) * 3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(outX, outY);
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (alpha * 2.5).toFixed(5) + ')';
        ctx.lineWidth = 0.15;
        ctx.stroke();
      }

      // Status
      if (alpha > 0.005) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(
          'NULL BODY: ' + systems.length + ' systems · 92 organs · 0=false 1=true · IN↓ OUT↑',
          8, 238
        );
      }
    });
  }

  // IDE command: /body
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.body = {
      desc: 'Null body — 92 organs in 10 systems, IN and OUT',
      run: function() {
        var lines = ['NULL BODY — 0=false 1=true null=unmeasured', ''];
        systems.forEach(function(sys) {
          lines.push(sys.label + ' (' + sys.organs.length + ' organs)');
          lines.push('  IN:  ' + sys.in);
          lines.push('  OUT: ' + sys.out);
          sys.organs.forEach(function(o) {
            lines.push('    · ' + o);
          });
          lines.push('');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('body');
  }, 44000);

  window.GAIA_NULL_BODY = { systems: systems };
  console.log('NULL BODY: 10 systems, 92 organs, IN↓ OUT↑, 0=false 1=true. /body');
})(window.G);
