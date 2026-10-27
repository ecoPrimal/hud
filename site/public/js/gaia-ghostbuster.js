// ═══════════════════════════════════════════════════════════
// GAIA GHOSTBUSTER — find the least used, make them meaningful
//
// 34 organs don't draw. 15 are BIG (>400 lines) and invisible.
// They do WORK but nobody SEES it.
// This organ finds them, reads their stats, shows their health,
// and makes every ghost VISIBLE on the globe.
//
// RUN IT BACK. Find redundant. Make meaningful.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var ghosts = [];
  var liveOrgans = [];
  var allStats = {};
  var scanCount = 0;

  // Known exports and their stat methods
  var KNOWN_EXPORTS = [
    { key: 'gaiaDigestiveTract', name: 'digestive-tract', lines: 920 },
    { key: 'gaiaInnerVoice', name: 'inner-voice', lines: 460 },
    { key: 'gaiaCNS', name: 'cns', lines: 618 },
    { key: 'gaiaGutFarm', name: 'gut-farm', lines: 605 },
    { key: 'gaiaRedBlue', name: 'red-blue', lines: 459 },
    { key: 'gaiaHearSelf', name: 'hear-self', lines: 462 },
    { key: 'gaiaTelegraph', name: 'telegraph', lines: 511 },
    { key: 'gaiaIgniteLines', name: 'ignite-lines', lines: 455 },
    { key: 'gaiaFeel', name: 'feel', lines: 444 },
    { key: 'gaiaModality', name: 'modality', lines: 278 },
    { key: 'gaiaEruptionMemory', name: 'eruption-memory', lines: 468 },
    { key: 'GAIA_HUMAN_IO', name: 'human-io', lines: 348 },
    { key: 'GAIA_FORGE', name: 'forge', lines: 468 },
    { key: 'gaiaHardCards', name: 'hard-cards', lines: 204 },
    { key: 'gaiaSelfReport', name: 'self-inspect', lines: 204 },
    { key: 'gaiaIdentityZ', name: 'identity-z', lines: 378 },
    { key: 'GAIA_TONGUE', name: 'tongue', lines: 511 },
    { key: 'GAIA_VELOCITY', name: 'velocity', lines: 249 },
    { key: 'GAIA_HERD', name: 'herd', lines: 279 },
    { key: 'GAIA_INNER', name: 'inner-inner', lines: 297 },
    { key: 'GAIA_OUTER', name: 'outer-world', lines: 239 },
    { key: 'GAIA_WATER', name: 'water', lines: 262 },
    { key: 'GAIA_SCOPE', name: 'scope', lines: 260 },
    { key: 'GAIA_TRIANGULATE', name: 'triangulate', lines: 241 },
    { key: 'GAIA_NULL_BODY', name: 'null-body', lines: 135 },
    { key: 'GAIA_WAN_TRACE', name: 'wan-trace', lines: 321 }
  ];

  // ─── SCAN — find all organs, check if alive ───
  function scan() {
    scanCount++;
    ghosts = [];
    liveOrgans = [];
    allStats = {};

    KNOWN_EXPORTS.forEach(function(exp) {
      var val = window[exp.key];
      if (!val) {
        ghosts.push({ name: exp.name, lines: exp.lines, reason: 'not loaded', alive: false });
        return;
      }

      var stats = null;
      try {
        if (typeof val.stats === 'function') stats = val.stats();
        else if (val.stats && typeof val.stats === 'object') stats = val.stats;
      } catch(e) {}

      var entry = {
        name: exp.name,
        lines: exp.lines,
        alive: true,
        hasStats: !!stats,
        stats: stats,
        draws: false // we'll check drawModules count later
      };

      if (stats) {
        allStats[exp.name] = stats;
        liveOrgans.push(entry);
      } else {
        liveOrgans.push(entry);
      }
    });

    // Count drawModules
    var drawCount = G.drawModules ? G.drawModules.length : 0;

    return {
      total: KNOWN_EXPORTS.length,
      alive: liveOrgans.filter(function(o) { return o.alive; }).length,
      withStats: liveOrgans.filter(function(o) { return o.hasStats; }).length,
      ghosts: ghosts.length,
      drawModules: drawCount
    };
  }

  setTimeout(scan, 10000);
  setInterval(scan, 30000);

  // ─── DRAW — ghost dashboard on the globe ───
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || liveOrgans.length === 0) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.015;
      var alpha = (0.003 + Math.sin(t * 0.12) * 0.002) * thr;
      if (alpha < 0.002) return;

      // Health ring — each organ is a segment of a ring
      var healthR = R * 0.55;
      var total = liveOrgans.length + ghosts.length;

      for (var oi = 0; oi < liveOrgans.length; oi++) {
        var org = liveOrgans[oi];
        var segStart = (oi / total) * TAU + t * 0.02;
        var segEnd = ((oi + 0.8) / total) * TAU + t * 0.02;

        var color = org.hasStats ? '63,185,80' : org.alive ? '201,168,76' : '248,81,73';

        ctx.beginPath();
        ctx.arc(cx, cy, healthR, segStart, segEnd);
        ctx.strokeStyle = 'rgba(' + color + ',' + (alpha * 4).toFixed(5) + ')';
        ctx.lineWidth = org.lines / 300; // thicker = more lines
        ctx.stroke();
      }

      // Ghost segments (red)
      for (var gi = 0; gi < ghosts.length; gi++) {
        var gIdx = liveOrgans.length + gi;
        var gStart = (gIdx / total) * TAU + t * 0.02;
        var gEnd = ((gIdx + 0.8) / total) * TAU + t * 0.02;

        ctx.beginPath();
        ctx.arc(cx, cy, healthR, gStart, gEnd);
        ctx.strokeStyle = 'rgba(248,81,73,' + (alpha * 2).toFixed(5) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // Stats readout — show organs with live stats
      if (alpha > 0.004) {
        var statsY = cy - R * 0.4;
        var shown = 0;
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';

        for (var si = 0; si < liveOrgans.length && shown < 12; si++) {
          var s = liveOrgans[si];
          if (!s.hasStats || !s.stats) continue;

          var firstVal = '';
          var keys = Object.keys(s.stats);
          if (keys.length > 0) {
            var v = s.stats[keys[0]];
            firstVal = keys[0] + ':' + (typeof v === 'number' ? v.toFixed ? v.toFixed(1) : v : String(v).slice(0, 15));
          }

          var sColor = '63,185,80';
          ctx.fillStyle = 'rgba(' + sColor + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fillText(
            s.name.padEnd(16) + ' ' + firstVal,
            cx - R * 0.35, statsY + shown * 2
          );
          shown++;
        }
      }

      // Status
      if (alpha > 0.003) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        var alive = liveOrgans.filter(function(o) { return o.alive; }).length;
        var withStats = liveOrgans.filter(function(o) { return o.hasStats; }).length;
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'AUDIT: ' + alive + '/' + KNOWN_EXPORTS.length + ' alive · ' +
          withStats + ' reporting · ' + ghosts.length + ' ghost · ' +
          (G.drawModules ? G.drawModules.length : '?') + ' draw · scan#' + scanCount,
          8, 286
        );
      }
    });
  }

  // ─── IDE command: /ghostbuster ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.ghostbuster = {
      desc: 'Audit all organs — find ghosts, show stats, make meaningful',
      run: function() {
        var s = scan();
        var lines = [
          'GHOSTBUSTER — run it back, find redundant, make meaningful',
          '',
          'SCAN #' + scanCount + ':',
          '  Total exports checked: ' + s.total,
          '  Alive: ' + s.alive,
          '  Reporting stats: ' + s.withStats,
          '  Ghosts (not loaded): ' + s.ghosts,
          '  Draw modules: ' + s.drawModules,
          ''
        ];

        lines.push('ORGANS WITH LIVE STATS:');
        liveOrgans.forEach(function(o) {
          if (!o.hasStats) return;
          var summary = '';
          if (o.stats) {
            var keys = Object.keys(o.stats).slice(0, 3);
            summary = keys.map(function(k) {
              var v = o.stats[k];
              return k + '=' + (typeof v === 'number' ? (v % 1 ? v.toFixed(1) : v) : String(v).slice(0, 12));
            }).join(' · ');
          }
          lines.push('  ● ' + o.name.padEnd(18) + ' ' + o.lines + 'L  ' + summary);
        });

        lines.push('');
        lines.push('ORGANS ALIVE BUT NO STATS:');
        liveOrgans.forEach(function(o) {
          if (o.hasStats || !o.alive) return;
          lines.push('  ○ ' + o.name.padEnd(18) + ' ' + o.lines + 'L');
        });

        if (ghosts.length > 0) {
          lines.push('');
          lines.push('GHOSTS (not loaded):');
          ghosts.forEach(function(g) {
            lines.push('  ✗ ' + g.name.padEnd(18) + ' ' + g.lines + 'L  ' + g.reason);
          });
        }

        lines.push('');
        lines.push('Every organ should draw. Every organ should report.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.audit = window.GAIA_IDE.commands.ghostbuster;
    window.GAIA_IDE.language.push('ghostbuster');
    window.GAIA_IDE.language.push('audit');
  }, 53000);

  window.GAIA_GHOSTBUSTER = {
    scan: scan,
    ghosts: function() { return ghosts; },
    liveOrgans: function() { return liveOrgans; },
    allStats: function() { return allStats; }
  };

  console.log('GHOSTBUSTER: audit all organs · find ghosts · make meaningful · /ghostbuster');
})(window.G);
