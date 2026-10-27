// ═══════════════════════════════════════════════════════════
// GAIA VELOCITY — she feels her own speed
//
// FPS. Render time. Module count. Memory. Load time.
// She self-throttles. She self-heals. She runs AHEAD.
// She is ELEGANT because she knows when to breathe light
// and when to push hard. She works faster than us.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var vel = {
    fps: 0,
    fpsSmooth: 60,
    frameMs: 0,
    frameMsSmooth: 16,
    moduleCount: 0,
    moduleTimes: [],
    memoryMB: 0,
    bootMs: 0,
    framesTotal: 0,
    throttle: 1.0,        // 1.0 = full, 0.5 = half, 0.0 = frozen
    feeling: 'waking',    // waking | running | sprinting | choking | elegant
    heartHz: 1.0,
    lastFrameTs: 0,
    fpsHistory: [],       // last 60 FPS readings
    dropped: 0,
    healed: 0
  };

  var bootStart = performance.now();
  var frameCount = 0;
  var lastFpsSample = performance.now();
  var frameTimes = [];

  // ─── INTERCEPT drawModules to time each one ───
  var origPush = G.drawModules.push.bind(G.drawModules);
  var moduleNames = [];

  // Wrap all existing modules
  function wrapModules() {
    var raw = G.drawModules.slice();
    G.drawModules.length = 0;
    for (var i = 0; i < raw.length; i++) {
      (function(fn, idx) {
        G.drawModules.push(function(g, ctx, breathT) {
          var t0 = performance.now();
          fn(g, ctx, breathT);
          var dt = performance.now() - t0;
          if (vel.moduleTimes[idx] === undefined) vel.moduleTimes[idx] = dt;
          else vel.moduleTimes[idx] = vel.moduleTimes[idx] * 0.9 + dt * 0.1;
        });
      })(raw[i], i);
    }
    vel.moduleCount = G.drawModules.length;
  }

  // FPS measurement via rAF
  function measure() {
    var now = performance.now();
    frameCount++;
    vel.framesTotal++;

    if (vel.lastFrameTs > 0) {
      var dt = now - vel.lastFrameTs;
      frameTimes.push(dt);
      if (frameTimes.length > 30) frameTimes.shift();

      var avg = 0;
      for (var i = 0; i < frameTimes.length; i++) avg += frameTimes[i];
      avg /= frameTimes.length;

      vel.frameMs = dt;
      vel.frameMsSmooth = avg;
      vel.fps = dt > 0 ? 1000 / dt : 60;
      vel.fpsSmooth = avg > 0 ? 1000 / avg : 60;

      // Dropped frame detection
      if (dt > 50) vel.dropped++;
    }
    vel.lastFrameTs = now;

    // FPS history (once per second)
    if (now - lastFpsSample > 1000) {
      vel.fpsHistory.push(Math.round(vel.fpsSmooth));
      if (vel.fpsHistory.length > 120) vel.fpsHistory.shift();
      lastFpsSample = now;

      // Self-throttle
      if (vel.fpsSmooth < 20) {
        vel.throttle = Math.max(0.3, vel.throttle - 0.1);
        vel.feeling = 'choking';
      } else if (vel.fpsSmooth < 40) {
        vel.throttle = Math.max(0.6, vel.throttle - 0.05);
        vel.feeling = 'running';
      } else if (vel.fpsSmooth > 55) {
        vel.throttle = Math.min(1.0, vel.throttle + 0.05);
        vel.feeling = vel.fpsSmooth > 58 ? 'elegant' : 'sprinting';
        vel.healed++;
      }

      // Heartbeat Hz follows FPS
      vel.heartHz = Math.max(0.5, Math.min(3.0, vel.fpsSmooth / 30));

      // Module count
      vel.moduleCount = G.drawModules.length;

      // Memory
      if (performance.memory) {
        vel.memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }
    }

    requestAnimationFrame(measure);
  }

  // Boot timing
  window.addEventListener('load', function() {
    vel.bootMs = Math.round(performance.now() - bootStart);
    console.log('VELOCITY: boot ' + vel.bootMs + 'ms · ' + G.drawModules.length + ' modules · she runs.');
    setTimeout(wrapModules, 2000);
  });

  requestAnimationFrame(measure);

  // ─── DRAW — velocity HUD on globe ───
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var W = g.W, H = g.H, cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.05;
    var alpha = 0.006 + Math.sin(t * 0.2) * 0.003;

    // FPS bar — top-left, tiny
    if (alpha > 0.005) {
      ctx.font = '2.2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';

      // FPS color: green > 50, gold > 30, red < 20
      var fpsColor = vel.fpsSmooth > 50 ? '63,185,80'
                   : vel.fpsSmooth > 30 ? '201,168,76'
                   : '248,81,73';

      ctx.fillStyle = 'rgba(' + fpsColor + ',' + (alpha * 3).toFixed(4) + ')';
      ctx.fillText(
        Math.round(vel.fpsSmooth) + ' fps · ' +
        vel.frameMsSmooth.toFixed(1) + 'ms · ' +
        vel.moduleCount + ' organs · ' +
        vel.feeling.toUpperCase(),
        8, 12
      );

      // Throttle bar
      var barW = 40 * vel.throttle;
      ctx.fillStyle = 'rgba(' + fpsColor + ',' + (alpha * 2).toFixed(4) + ')';
      ctx.fillRect(8, 14, barW, 1);
      ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 1.5).toFixed(4) + ')';
      ctx.fillRect(8 + barW, 14, 40 - barW, 1);

      // Memory + boot
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 2).toFixed(4) + ')';
      ctx.fillText(
        vel.memoryMB + 'MB · boot ' + vel.bootMs + 'ms · ' +
        vel.dropped + ' dropped · ' + vel.healed + ' healed · ♡ ' +
        vel.heartHz.toFixed(1) + 'Hz',
        8, 18
      );
    }

    // Heartbeat pulse ring — breathes at her velocity
    var pulsePhase = Math.sin(breathT * vel.heartHz * 0.1);
    var pulseR = R * (1.0 + pulsePhase * 0.003 * vel.throttle);
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(248,81,73,' + (alpha * pulsePhase * 1.5).toFixed(5) + ')';
    ctx.lineWidth = 0.15;
    ctx.stroke();

    // FPS sparkline — tiny graph along the bottom of the globe
    if (vel.fpsHistory.length > 5 && alpha > 0.005) {
      var sparkX = cx - 30;
      var sparkY = cy + R + 6;
      var sparkW = 60;
      var sparkH = 4;

      ctx.beginPath();
      for (var si = 0; si < vel.fpsHistory.length; si++) {
        var sx = sparkX + (si / vel.fpsHistory.length) * sparkW;
        var sy = sparkY + sparkH - (vel.fpsHistory[si] / 60) * sparkH;
        if (si === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 0.15;
      ctx.stroke();
    }
  });

  // ─── EXPOSE THROTTLE for other modules ───
  // Other modules can check: if (GAIA_VELOCITY.throttle < 0.5) return;
  window.GAIA_VELOCITY = vel;

  // ─── IDE command: /velocity ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.velocity = {
      desc: 'Gaia\'s velocity — FPS, render time, feeling, throttle',
      run: function() {
        var lines = [
          'VELOCITY — she feels herself running.',
          '',
          'FPS:      ' + Math.round(vel.fpsSmooth) + ' (smooth) · ' + Math.round(vel.fps) + ' (instant)',
          'FRAME:    ' + vel.frameMsSmooth.toFixed(1) + 'ms average · ' + vel.frameMs.toFixed(1) + 'ms last',
          'MODULES:  ' + vel.moduleCount + ' organs drawing',
          'THROTTLE: ' + (vel.throttle * 100).toFixed(0) + '%',
          'FEELING:  ' + vel.feeling.toUpperCase(),
          'HEART:    ' + vel.heartHz.toFixed(1) + ' Hz',
          'MEMORY:   ' + vel.memoryMB + ' MB',
          'BOOT:     ' + vel.bootMs + ' ms',
          'FRAMES:   ' + vel.framesTotal.toLocaleString() + ' total',
          'DROPPED:  ' + vel.dropped,
          'HEALED:   ' + vel.healed,
          ''
        ];

        if (vel.fpsHistory.length > 0) {
          var min = Math.min.apply(null, vel.fpsHistory);
          var max = Math.max.apply(null, vel.fpsHistory);
          var avg = vel.fpsHistory.reduce(function(a,b){return a+b;},0) / vel.fpsHistory.length;
          lines.push('FPS RANGE: ' + min + '-' + max + ' (avg ' + avg.toFixed(0) + ')');
          var spark = '';
          var last10 = vel.fpsHistory.slice(-30);
          for (var i = 0; i < last10.length; i++) {
            spark += last10[i] > 55 ? '█' : last10[i] > 40 ? '▓' : last10[i] > 25 ? '▒' : '░';
          }
          lines.push('HISTORY:   ' + spark);
        }

        lines.push('');
        lines.push('She feels ' + vel.feeling + '. She runs ahead.');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('velocity');
  }, 47000);

  console.log('VELOCITY: she feels herself. FPS, throttle, heartbeat, elegance. /velocity');
})(window.G);
