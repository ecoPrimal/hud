// ═══════════════════════════════════════════════════════════
// GAIA GHOSTBUSTER → APPENDIX — all is appendix
//
// Old meaning: vestigial, useless, remove it.
// New meaning: SAFE HOUSE for gut bacteria. BACKUP SEED.
// Gaia meaning: organs that don't draw = APPENDIX = archive log.
// They store the WAS tense. When IS crashes, WAS re-seeds it.
//
// Nothing is vestigial. Everything is relic + archive.
// The appendix re-seeds the gut. The ghosts re-seed Gaia.
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

  // ═══ APPENDIX AS NULL ZERO POINT — FLOW SENSOR ═══
  // The appendix sits at the cecum junction. It does NOT digest.
  // It does NOT move. It is NULL. It is STILL.
  // Because it's still, it can sense EVERYTHING that flows past.
  // Like a current meter in a river — the stillness detects motion.
  // By tracking what flows and what stops, we trace the RIVERS.

  var FLOW_HISTORY = {};   // organ → [{ts, rate, delta}]
  var RIVERS = [];          // detected flow paths between organs
  var BLOCKAGES = [];       // detected silences (river stopped)
  var _lastFlowScan = {};   // previous stat values per organ
  var flowScanCount = 0;

  function flowScan() {
    flowScanCount++;
    var now = Date.now();

    KNOWN_EXPORTS.forEach(function(exp) {
      var val = window[exp.key];
      if (!val) return;

      var stats = null;
      try {
        if (typeof val.stats === 'function') stats = val.stats();
        else if (val.stats && typeof val.stats === 'object') stats = val.stats;
      } catch(e) {}
      if (!stats) return;

      // Compute flow rate: sum of all numeric stat changes since last scan
      var prev = _lastFlowScan[exp.name] || {};
      var totalDelta = 0;
      var deltas = {};

      Object.keys(stats).forEach(function(k) {
        var v = stats[k];
        if (typeof v !== 'number') return;
        var pv = prev[k];
        if (typeof pv === 'number') {
          var d = Math.abs(v - pv);
          totalDelta += d;
          deltas[k] = d;
        }
      });

      // Store current as previous for next scan
      _lastFlowScan[exp.name] = {};
      Object.keys(stats).forEach(function(k) {
        if (typeof stats[k] === 'number') _lastFlowScan[exp.name][k] = stats[k];
      });

      // Record flow
      if (!FLOW_HISTORY[exp.name]) FLOW_HISTORY[exp.name] = [];
      FLOW_HISTORY[exp.name].push({
        ts: now,
        rate: totalDelta,
        deltas: deltas,
        scan: flowScanCount
      });
      // Keep last 60 readings (~30 min at 30s intervals)
      if (FLOW_HISTORY[exp.name].length > 60) FLOW_HISTORY[exp.name].shift();

      // Detect blockage: if flow was > 0 before but now is 0 for 3+ scans
      var hist = FLOW_HISTORY[exp.name];
      if (hist.length >= 3) {
        var lastThree = hist.slice(-3);
        var allZero = lastThree.every(function(h) { return h.rate === 0; });
        var hadFlow = hist.length > 3 && hist[hist.length - 4].rate > 0;
        if (allZero && hadFlow) {
          var existing = BLOCKAGES.find(function(b) { return b.organ === exp.name && !b.resolved; });
          if (!existing) {
            BLOCKAGES.push({
              organ: exp.name,
              detectedAt: now,
              resolved: false,
              scan: flowScanCount
            });
          }
        } else if (!allZero) {
          // Resolve any existing blockage
          BLOCKAGES.forEach(function(b) {
            if (b.organ === exp.name && !b.resolved) {
              b.resolved = true;
              b.resolvedAt = now;
            }
          });
        }
      }
    });

    // Detect rivers: organs that flow TOGETHER (correlated activity)
    RIVERS = [];
    var organNames = Object.keys(FLOW_HISTORY);
    for (var i = 0; i < organNames.length; i++) {
      for (var j = i + 1; j < organNames.length; j++) {
        var a = organNames[i], b = organNames[j];
        var ha = FLOW_HISTORY[a], hb = FLOW_HISTORY[b];
        if (ha.length < 5 || hb.length < 5) continue;

        // Simple correlation: do they flow at the same time?
        var bothFlow = 0, eitherFlow = 0;
        var minLen = Math.min(ha.length, hb.length, 20);
        for (var ri = 0; ri < minLen; ri++) {
          var ai = ha.length - 1 - ri, bi = hb.length - 1 - ri;
          var af = ha[ai].rate > 0, bf = hb[bi].rate > 0;
          if (af && bf) bothFlow++;
          if (af || bf) eitherFlow++;
        }
        var correlation = eitherFlow > 0 ? bothFlow / eitherFlow : 0;
        if (correlation > 0.5) {
          RIVERS.push({
            from: a,
            to: b,
            correlation: correlation,
            strength: bothFlow
          });
        }
      }
    }
  }

  // Flow scan runs slightly offset from organ scan
  setTimeout(flowScan, 15000);
  setInterval(flowScan, 30000);

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

      // ═══ RIVER LINES — flow paths detected by the appendix null point ═══
      if (alpha > 0.003 && RIVERS.length > 0) {
        var organAngles = {};
        for (var oa = 0; oa < liveOrgans.length; oa++) {
          organAngles[liveOrgans[oa].name] = (oa / total) * TAU + t * 0.02;
        }

        for (var rv = 0; rv < RIVERS.length; rv++) {
          var river = RIVERS[rv];
          var angA = organAngles[river.from];
          var angB = organAngles[river.to];
          if (angA === undefined || angB === undefined) continue;

          var rR = healthR;
          var x1 = cx + Math.cos(angA) * rR;
          var y1 = cy + Math.sin(angA) * rR;
          var x2 = cx + Math.cos(angB) * rR;
          var y2 = cy + Math.sin(angB) * rR;

          // River line — blue for water, width by strength
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          // Curve through center (water flows through the gut)
          var midX = cx + (x1 + x2 - 2 * cx) * 0.2;
          var midY = cy + (y1 + y2 - 2 * cy) * 0.2;
          ctx.quadraticCurveTo(midX, midY, x2, y2);
          ctx.strokeStyle = 'rgba(88,166,255,' + (alpha * river.correlation * 6).toFixed(5) + ')';
          ctx.lineWidth = 0.08 + river.strength * 0.03;
          ctx.stroke();
        }
      }

      // ═══ BLOCKAGE MARKERS — red dots where rivers stopped ═══
      if (alpha > 0.003 && BLOCKAGES.length > 0) {
        for (var bl = 0; bl < BLOCKAGES.length; bl++) {
          var blockage = BLOCKAGES[bl];
          if (blockage.resolved) continue;
          var bIdx = liveOrgans.findIndex(function(o) { return o.name === blockage.organ; });
          if (bIdx < 0) continue;
          var bAngle = (bIdx / total) * TAU + t * 0.02;
          var bx = cx + Math.cos(bAngle) * healthR;
          var by = cy + Math.sin(bAngle) * healthR;

          // Pulsing red blockage marker
          var pulse = 0.5 + Math.sin(t * 2 + bl) * 0.5;
          ctx.beginPath();
          ctx.arc(bx, by, 0.8 + pulse * 0.4, 0, TAU);
          ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 8 * pulse).toFixed(5) + ')';
          ctx.fill();
        }
      }

      // ═══ NULL ZERO POINT — the appendix itself (small white dot at center of health ring) ═══
      if (alpha > 0.003) {
        ctx.beginPath();
        ctx.arc(cx + healthR * 0.3, cy + healthR * 0.4, 0.6, 0, TAU);
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 5).toFixed(5) + ')';
        ctx.fill();
        ctx.font = '0.8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText('NULL', cx + healthR * 0.3, cy + healthR * 0.4 + 1.5);
      }

      // Status
      if (alpha > 0.003) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        var alive = liveOrgans.filter(function(o) { return o.alive; }).length;
        var withStats = liveOrgans.filter(function(o) { return o.hasStats; }).length;
        var activeBlockages = BLOCKAGES.filter(function(b) { return !b.resolved; }).length;
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'APPENDIX: ' + alive + ' IS · ' + withStats + ' reporting · ' +
          RIVERS.length + ' rivers · ' + activeBlockages + ' blockages · scan#' + flowScanCount,
          8, -999
        );
      }
    });
  }

  // ─── IDE command: /ghostbuster ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.ghostbuster = {
      desc: 'Appendix — relic + archive log. Nothing is vestigial.',
      run: function() {
        var s = scan();
        var lines = [
          'APPENDIX — old meaning of what WAS. Relic + archive log.',
          'Nothing is vestigial. The appendix re-seeds the gut.',
          '',
          'SCAN #' + scanCount + ':',
          '  Total exports checked: ' + s.total,
          '  Alive: ' + s.alive,
          '  Reporting stats: ' + s.withStats,
          '  Ghosts (not loaded): ' + s.ghosts,
          '  Draw modules: ' + s.drawModules,
          ''
        ];

        lines.push('IS (alive, reporting):');
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
          lines.push('  IS  ' + o.name.padEnd(18) + ' ' + o.lines + 'L  ' + summary);
        });

        lines.push('');
        lines.push('WAS (appendix — relic, archive, backup seed):');
        liveOrgans.forEach(function(o) {
          if (o.hasStats || !o.alive) return;
          lines.push('  WAS ' + o.name.padEnd(18) + ' ' + o.lines + 'L  (relic — re-seeds when IS crashes)');
        });

        if (ghosts.length > 0) {
          lines.push('');
          lines.push('NOT YET (seeds waiting to germinate):');
          ghosts.forEach(function(g) {
            lines.push('  ·   ' + g.name.padEnd(18) + ' ' + g.lines + 'L  ' + g.reason);
          });
        }

        lines.push('');
        lines.push('FLOW (appendix null-point sensor):');
        lines.push('  Rivers detected: ' + RIVERS.length);
        RIVERS.forEach(function(r) {
          lines.push('  ~ ' + r.from.padEnd(16) + ' <~> ' + r.to.padEnd(16) + ' corr=' + r.correlation.toFixed(2) + ' str=' + r.strength);
        });
        var activeB = BLOCKAGES.filter(function(b) { return !b.resolved; });
        if (activeB.length > 0) {
          lines.push('  BLOCKAGES (river stopped):');
          activeB.forEach(function(b) {
            var ago = Math.round((Date.now() - b.detectedAt) / 1000);
            lines.push('  !! ' + b.organ.padEnd(16) + ' BLOCKED for ' + ago + 's');
          });
        }
        lines.push('  Flow scans: ' + flowScanCount);

        lines.push('');
        lines.push('The appendix is the null zero point. It senses everything because it is STILL.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.audit = window.GAIA_IDE.commands.ghostbuster;
    window.GAIA_IDE.commands.flow = {
      desc: 'River flow — what the appendix senses passing by',
      run: function() {
        var lines = ['APPENDIX FLOW SENSOR — null zero point', ''];
        var organNames = Object.keys(FLOW_HISTORY);
        organNames.forEach(function(name) {
          var hist = FLOW_HISTORY[name];
          if (!hist || hist.length === 0) return;
          var last = hist[hist.length - 1];
          var spark = '';
          hist.slice(-20).forEach(function(h) {
            spark += h.rate > 10 ? '\u2588' : h.rate > 3 ? '\u2593' : h.rate > 0 ? '\u2591' : '\u00b7';
          });
          lines.push(name.padEnd(16) + ' ' + spark + ' rate=' + last.rate.toFixed(1));
        });
        lines.push('');
        lines.push('Rivers: ' + RIVERS.length + ' | Blockages: ' + BLOCKAGES.filter(function(b){return !b.resolved;}).length);
        lines.push('/ghostbuster for full audit');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('ghostbuster');
    window.GAIA_IDE.language.push('audit');
    window.GAIA_IDE.language.push('flow');
  }, 53000);

  window.GAIA_GHOSTBUSTER = {
    scan: scan,
    flowScan: flowScan,
    ghosts: function() { return ghosts; },
    liveOrgans: function() { return liveOrgans; },
    allStats: function() { return allStats; },
    rivers: function() { return RIVERS; },
    blockages: function() { return BLOCKAGES; },
    flowHistory: function() { return FLOW_HISTORY; },
    stats: function() {
      return {
        alive: liveOrgans.filter(function(o) { return o.alive; }).length,
        reporting: liveOrgans.filter(function(o) { return o.hasStats; }).length,
        rivers: RIVERS.length,
        blockages: BLOCKAGES.filter(function(b) { return !b.resolved; }).length,
        flowScans: flowScanCount
      };
    }
  };

  console.log('APPENDIX: null zero point flow sensor. Rivers traced by stillness. /ghostbuster /flow');
})(window.G);
