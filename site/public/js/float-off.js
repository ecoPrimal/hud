/* float-off.js — paying attention, falling asleep, you drift.
 *
 * Inactivity on a still-open HUD is not absence. It is dormancy.
 * The local sun sets. The glass goes dark. You float —
 * lat/long, through history — and see sun and moon from those angles.
 * Move, and dawn comes back. No lecture. Just physics.
 */
(function () {
  var PI = Math.PI, TAU = PI * 2;
  var HOME = { lat: 42.3314, lon: -83.0458, name: 'detroit' };
  var canvas, ctx, W = 0, H = 0, raf = 0;
  var lastAct = performance.now();
  var depth = 0;          // 0 awake local, 1 floating far
  var lat = HOME.lat, lon = HOME.lon;
  var histYears = 0;
  var spoke = false;
  var lastSunEl = 0.4;
  var EPOCHS = [
    { y: 0, name: 'now' },
    { y: 1 / 365, name: 'yesterday' },
    { y: 1, name: 'a year ago' },
    { y: 12, name: 'banks 2014' },
    { y: 189, name: 'michigan statehood' },
    { y: 1500, name: 'before the survey' },
    { y: 12000, name: 'ice sheet' },
    { y: 68000000, name: 't-rex' },
    { y: 360000000, name: 'tiktaalik' },
    { y: 541000000, name: 'cambrian' },
    { y: 4500000000, name: 'earth' }
  ];

  function init() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'float-off';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:6;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, poke, { passive: true });
    });
    var input = document.getElementById('input');
    if (input) input.addEventListener('input', poke);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') lastAct = performance.now();
    });
    loop();
  }

  function poke() { lastAct = performance.now(); }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function solar(latD, lonD, dayOfYear, utcHours) {
    var lat = latD * PI / 180;
    var decl = 0.4093 * Math.sin(TAU * (dayOfYear - 81) / 365);
    var lst = utcHours + lonD / 15;
    var ha = (lst - 12) * 15 * PI / 180;
    var sinEl = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
    var el = Math.asin(Math.max(-1, Math.min(1, sinEl)));
    var az = Math.atan2(-Math.sin(ha), Math.tan(decl) * Math.cos(lat) - Math.sin(lat) * Math.cos(ha));
    if (!isFinite(el)) el = -0.2;
    if (!isFinite(az)) az = 0;
    return { el: el, az: az, decl: decl };
  }

  function lunar(age, sun) {
    age = age - Math.floor(age);
    var el = sun.el * -0.85 + (age - 0.5) * 0.4;
    var az = sun.az + PI + (age - 0.5) * 0.6;
    if (!isFinite(el)) el = 0.2;
    if (!isFinite(az)) az = PI;
    return { el: el, az: az, age: age };
  }

  function epochName(years) {
    var name = EPOCHS[0].name;
    for (var i = 0; i < EPOCHS.length; i++) {
      if (years >= EPOCHS[i].y) name = EPOCHS[i].name;
    }
    return name;
  }

  function skyColor(el) {
    var deg = el * 180 / PI;
    if (deg > 12) return [8, 14, 28, 0.0];
    if (deg > 0) {
      var t = 1 - deg / 12;
      return [18 + t * 40, 10 + t * 8, 28 + t * 10, t * 0.45];
    }
    if (deg > -8) {
      var t = (-deg) / 8;
      return [12 + (1 - t) * 50, 6, 22 + t * 10, 0.45 + t * 0.35];
    }
    return [2, 4, 14, 0.82];
  }

  function project(az, el) {
    var x = W / 2 + Math.sin(az) * (W * 0.38) * Math.cos(el);
    var y = H * 0.42 - Math.sin(el) * H * 0.46;
    return { x: x, y: y };
  }

  function loop() {
    var now = performance.now();
    var hidden = document.visibilityState === 'hidden';
    var quiet = hidden ? 0 : (now - lastAct) / 1000;
    var target = quiet < 16 ? 0 : Math.min(1, (quiet - 16) / 70);
    depth += (target - depth) * (target > depth ? 0.018 : 0.06);

    if (depth > 0.04) {
      lon = HOME.lon - depth * 86 * (0.7 + 0.3 * Math.sin(now / 18000));
      lat = HOME.lat + Math.sin(now / 14000) * depth * 28;
      lat = Math.max(-66, Math.min(66, lat));
      histYears = Math.pow(10, depth * 8.6) - 1;
    } else {
      lon += (HOME.lon - lon) * 0.08;
      lat += (HOME.lat - lat) * 0.08;
      histYears *= 0.92;
    }

    var driftHours = depth * 8;
    var nowDate = new Date();
    var utcHours = nowDate.getUTCHours() + nowDate.getUTCMinutes() / 60 + nowDate.getUTCSeconds() / 3600 - driftHours;
    utcHours = ((utcHours % 24) + 24) % 24;
    var start = Date.UTC(nowDate.getUTCFullYear(), 0, 0);
    var dayOfYear = ((nowDate.getTime() - start) / 86400000 + Math.log(1 + histYears) * 7) % 365;
    var moonAge = ((Date.now() / 86400000) + Math.log(1 + histYears) * 0.4) / 29.53059;
    var sun = solar(lat, lon, dayOfYear, utcHours);
    var moon = lunar(moonAge, sun);
    lastSunEl = sun.el;
    var localEl = 0.42 - depth * 1.25;

    draw(sun, moon, localEl, now);

    var host = document.getElementById('membrane-focal-svg');
    if (host) {
      var dim = 1 - depth * 0.45 + Math.sin(now / 1100) * depth * 0.04;
      host.style.filter = 'brightness(' + dim.toFixed(3) + ') saturate(' + (1 - depth * 0.35).toFixed(3) + ')';
    }
    if (canvas) {
      canvas.style.transform = 'translate(' +
        (Math.sin(now / 1400) * depth * 3).toFixed(2) + 'px,' +
        (Math.cos(now / 1800) * depth * 2).toFixed(2) + 'px)';
    }
    document.body.classList.toggle('float-off', depth > 0.12);
    document.body.classList.toggle('hud-night', depth > 0.2);
    document.body.style.setProperty('--hud-dusk', depth.toFixed(3));

    if (depth > 0.28 && !spoke) {
      spoke = true;
      say('the local sun just set. you are still looking. you are floating.');
    }
    if (depth < 0.08) spoke = false;

    raf = requestAnimationFrame(loop);
  }

  function draw(sun, moon, localEl, now) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (depth < 0.02) return;
    var c = skyColor(localEl);
    ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (c[3] * Math.min(1, depth * 1.4)) + ')';
    ctx.fillRect(0, 0, W, H);

    if (localEl < 0.12) {
      var n = Math.floor(depth * 110);
      ctx.fillStyle = '#c9d1d9';
      for (var i = 0; i < n; i++) {
        ctx.globalAlpha = Math.min(0.75, depth) * (0.35 + ((i * 13) % 10) / 18);
        var sx = ((i * 97 + now * 0.004) % W);
        var sy = ((i * 53) % (H * 0.72));
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    var sp = project(sun.az, sun.el);
    sp.y = Math.min(H * 0.72, Math.max(H * 0.1, sp.y));
    var r = 14 + Math.max(0, sun.el) * 12;
    /* atmosphere NOW — Rayleigh reddens the path, not the star. */
    var air = Math.min(1, 0.12 / Math.max(0.04, Math.sin(Math.max(-0.15, sun.el))));
    var g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 7);
    var red = Math.round(40 + air * 180);
    var blu = Math.round(180 - air * 140);
    g.addColorStop(0, 'rgba(255,244,196,' + (0.55 * depth) + ')');
    g.addColorStop(0.22, 'rgba(' + red + ',70,' + blu + ',' + (0.35 * depth * air) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r * 7, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff4c4';
    ctx.globalAlpha = sun.el > -0.3 ? 0.95 : 0.4;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, Math.max(8, r), 0, TAU);
    ctx.fill();

    var mp = project(moon.az, moon.el);
    mp.y = Math.min(H * 0.78, Math.max(H * 0.08, mp.y));
    if (depth > 0.12) {
      ctx.globalAlpha = 0.45 + depth * 0.4;
      ctx.fillStyle = '#c9d1d9';
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, 9, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#010409';
      ctx.beginPath();
      ctx.arc(mp.x + (moon.age - 0.5) * 14, mp.y, 8, 0, TAU);
      ctx.fill();
    }

    ctx.globalAlpha = 0.78 * Math.min(1, depth * 1.6);
    ctx.fillStyle = '#c9d1d9';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    var hemi = lat >= 0 ? 'N' : 'S';
    var ew = lon >= 0 ? 'E' : 'W';
    ctx.fillText(
      lat.toFixed(1) + '\u00b0' + hemi + '  ' + Math.abs(lon).toFixed(1) + '\u00b0' + ew +
      '  \u00b7  ' + epochName(histYears) +
      '  \u00b7  sun ' + (sun.el * 180 / PI).toFixed(0) + '\u00b0' +
      '  moon ' + (moon.el * 180 / PI).toFixed(0) + '\u00b0',
      W / 2, H - 86
    );
    ctx.globalAlpha = 1;
  }

  function say(msg) {
    try {
      var add = (window._chipmunkCore && window._chipmunkCore.addEntry) || window.addEntry;
      if (add) add('chipmunk', '<span class="dim">' + msg + '</span>');
    } catch (e) {}
  }

  function status() {
    return {
      depth: +depth.toFixed(3),
      lat: +lat.toFixed(2),
      lon: +lon.toFixed(2),
      years: histYears,
      epoch: epochName(histYears),
      dormant: depth > 0.12,
      sunEl: +lastSunEl.toFixed(3),
      note: 'the star does not change color. atmosphere is the perception point. you float.'
    };
  }

  window._floatOff = {
    poke: poke,
    status: status,
    sink: function () { lastAct = performance.now() - 120000; return status(); },
    here: function () {
      lastAct = performance.now();
      depth = 0; lat = HOME.lat; lon = HOME.lon; histYears = 0; spoke = false;
      var host = document.getElementById('membrane-focal-svg');
      if (host) host.style.filter = '';
      if (canvas) canvas.style.transform = '';
      return status();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
