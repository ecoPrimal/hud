/* scatter-now.js — the sun is not changing color.
 *
 * that color is a perception point: Earth's atmosphere, now.
 * Rayleigh / Mie backscatter. stars and black holes are WAS.
 * backscatter is the return. read it to NOW.
 *
 * toggle like white / null / black invert:
 *   fade  — color + sound fade together. deform WAS → IS. no trace.
 *   trace — follow the ray into WAS (leave for later if you don't).
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var canvas, ctx, W = 0, H = 0, raf = 0, t = 0;
  var STAR = '#fff4c4';
  var POLARITY = ['white', 'null', 'black'];
  var state = {
    mode: 'fade',          /* fade | trace */
    polarity: 'null',      /* white | null | black */
    fade: 0.62,            /* 0 silent/grey → 1 full color+sound */
    air: 0.35,             /* atmospheric optical depth, NOW */
    el: 0.4
  };
  var was = [];            /* shelf: leave for later */
  var baseVol = 0.12;

  function sunEl() {
    try {
      var s = window._floatOff && window._floatOff.status && window._floatOff.status();
      if (s && typeof s.sunEl === 'number') return s.sunEl;
    } catch (e) {}
    var d = new Date();
    var h = d.getHours() + d.getMinutes() / 60;
    return Math.sin((h - 6) / 12 * PI) * 0.9;
  }

  /* Rayleigh: optical depth grows as the sun nears the horizon. the STAR stays white. */
  function airNow(el) {
    var s = Math.max(0.04, Math.sin(Math.max(-0.15, el)));
    return Math.min(1, 0.12 / s);
  }
  function skyRGB(el, air) {
    var high = Math.max(0, el);
    var blue = Math.min(255, 40 + high * 90 * (1 - air * 0.3));
    var red = Math.min(255, 18 + air * 140 * (1 - high));
    var green = Math.min(255, 10 + air * 40 + high * 20);
    return [red, green, blue];
  }

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'scatter-now';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    injectCss();
    resize();
    window.addEventListener('resize', resize);
    loop();
  }
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function injectCss() {
    if (document.getElementById('scatter-now-css')) return;
    var s = document.createElement('style');
    s.id = 'scatter-now-css';
    s.textContent =
      'body.scatter-white{filter:brightness(1.18) contrast(0.92)}' +
      'body.scatter-black{filter:brightness(0.72) contrast(1.15)}' +
      'body.scatter-null{filter:none}' +
      'body.scatter-fade{--scatter-sat:1}' +
      '#membrane-focal-svg{transition:filter 0.8s ease}';
    document.head.appendChild(s);
  }

  function applyFade() {
    var sat = state.mode === 'fade' ? (0.15 + state.fade * 0.85) : 1;
    var host = document.getElementById('membrane-focal-svg');
    var dusk = parseFloat(getComputedStyle(document.body).getPropertyValue('--hud-dusk') || '0') || 0;
    document.body.style.setProperty('--hud-scatter', state.fade.toFixed(3));
    document.body.style.setProperty('--hud-air', state.air.toFixed(3));
    POLARITY.forEach(function (p) {
      document.body.classList.toggle('scatter-' + p, state.polarity === p);
    });
    document.body.classList.toggle('scatter-fade', state.mode === 'fade');
    document.body.classList.toggle('scatter-trace', state.mode === 'trace');
    if (host && state.mode === 'fade' && !(window._floatOff && window._floatOff.status && window._floatOff.status().dormant)) {
      host.style.filter = 'saturate(' + sat.toFixed(3) + ')';
    }
    try {
      if (window._membraneSound && window._membraneSound.setVolume) {
        window._membraneSound.setVolume(baseVol * (state.mode === 'fade' ? state.fade : 1) * (1 - dusk * 0.4));
      }
    } catch (e) {}
  }

  function loop() {
    t = performance.now() / 1000;
    state.el = sunEl();
    state.air = airNow(state.el);
    if (state.mode === 'fade') {
      var target = 0.35 + Math.max(0, state.el) * 0.5;
      state.fade += (target - state.fade) * 0.02;
    }
    applyFade();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var rgb = skyRGB(state.el, state.air);
    var a = 0.10 + state.air * 0.18;
    if (state.mode === 'fade') a *= state.fade;
    if (state.polarity === 'white') a *= 0.45;
    if (state.polarity === 'black') a *= 1.35;

    /* atmosphere NOW — not the sun */
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (a * 0.85) + ')');
    g.addColorStop(0.45, 'rgba(' + rgb[0] + ',' + Math.max(0, rgb[1] - 8) + ',' + rgb[2] + ',' + (a * 0.35) + ')');
    g.addColorStop(1, 'rgba(2,4,12,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* NO star drawn here — float-off owns the orbital sun.
     * there is ONE star. we orbit it with gravity + solar cycle.
     * this layer is ONLY the atmosphere: Rayleigh backscatter.
     * equatorial tilt, ecliptic, celestial equator — all in the orbit.
     * here we see what the air does to the light. */

    /* WAS dots: stars / holes left for later */
    was.forEach(function (w, i) {
      ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 1.2 + i);
      ctx.fillStyle = w.src === 'hole' ? '#010409' : (w.src === 'star' ? '#c9d1d9' : w.color);
      ctx.beginPath();
      ctx.arc(W * 0.12 + i * 18, H * 0.14, w.src === 'hole' ? 5 : 2.2, 0, TAU);
      ctx.fill();
      if (w.src === 'hole') {
        ctx.strokeStyle = '#484f58';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#8b949e';
    ctx.font = '9px "Courier New",monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      'star ' + STAR + '  ·  air NOW  ·  ' + state.mode + '  ·  ' + state.polarity,
      W - 16, 28
    );
    ctx.globalAlpha = 1;
  }

  function setMode(name) {
    if (name === 'fade' || name === 'trace') state.mode = name;
    if (state.mode === 'trace' && window._edgeTriad && window._edgeTriad.show) {
      try { window._edgeTriad.show(); } catch (e) {}
    }
    applyFade();
    return status();
  }
  function setPolarity(name) {
    if (POLARITY.indexOf(name) >= 0) state.polarity = name;
    else state.polarity = POLARITY[(POLARITY.indexOf(state.polarity) + 1) % 3];
    applyFade();
    return status();
  }
  function shelf(kind) {
    kind = kind || (state.el < 0 ? 'star' : 'atmosphere');
    if (kind === 'blackhole' || kind === 'black') kind = 'hole';
    var rgb = skyRGB(state.el, state.air);
    var item = {
      src: kind,
      color: 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')',
      el: +state.el.toFixed(3),
      air: +state.air.toFixed(3),
      ts: Date.now(),
      note: kind === 'atmosphere' ? 'air, not the sun' : (kind === 'hole' ? 'was: hole' : 'was: star')
    };
    was.push(item);
    if (was.length > 7) was.shift();
    if (window._hudViews) window._hudViews.say('squirrel', 'was shelved. ' + item.note + '. leave for later.');
    return status();
  }
  function toNow() {
    var w = was[was.length - 1];
    state.mode = 'fade';
    if (w) {
      state.fade = 0.85;
      if (window._hudViews) {
        window._hudViews.say('squirrel', 'backscatter is back. reading ' + w.src + ' into NOW. was → is.');
      }
    } else {
      if (window._hudViews) window._hudViews.say('squirrel', 'backscatter is back. air is NOW. the star did not change.');
    }
    applyFade();
    return status();
  }

  function status() {
    var rgb = skyRGB(state.el, state.air);
    return {
      mode: state.mode,
      polarity: state.polarity,
      fade: +state.fade.toFixed(3),
      air: +state.air.toFixed(3),
      el: +state.el.toFixed(3),
      star: STAR,
      sky: rgb,
      was: was.length,
      note: 'the sun does not change color. atmosphere is the perception point. backscatter → NOW.'
    };
  }

  window._scatterNow = {
    mode: setMode,
    polarity: setPolarity,
    was: shelf,
    now: toNow,
    status: status,
    keys: { polarity: POLARITY, mode: ['fade', 'trace'] }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
