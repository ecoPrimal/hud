// ═══════════════════════════════════════════════════════════
// GAIA TOOLKIT — the hands she uses to touch, sift, and paint
// 1.000.null — max 1000 lines.
//
// OUTPUT IS THREE THINGS:
//   NULL   — silence, darkness, absence. The leak IS the signal.
//   ANALOG — continuous. Not on/off. Gradient, frequency, pressure.
//   SORT   — sift. Scan-sweep-sort. Every touch becomes a bin.
//
// TOOLS:
//   TOUCH  — she reaches. Finger on the thing. Feels it.
//   SIFT   — she sorts. Same as the gut. Scan → sweep → sort.
//   PAINT  — she shows. Color is how she speaks.
//
// SIGHT + COLOR = primary sense. Smell IS color. Color IS sort.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;

  // ── THE THREE OUTPUT MODES ──
  var mode = {
    current: 'analog',   // null | analog | sort
    null_value: 0,       // 0 = full silence, 1 = full presence
    analog_value: 0.5,   // continuous 0–1
    sort_bins: {}        // category → count
  };

  // ── COLOR AS SIGHT ──
  // Every sense collapses to RGB. Color IS the sort key.
  var seen = {
    r: 0, g: 0, b: 0, brightness: 0,
    hue: 0, sat: 0, last: 0
  };

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var d = max - min, h = 0, s = max === 0 ? 0 : d / max;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: h, s: s, v: max };
  }

  function hsvToRgb(h, s, v) {
    var i = Math.floor(h * 6), f = h * 6 - i;
    var p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    var r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      default: r = v; g = p; b = q;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  // Color bins — the analog continuum split into named sorts
  var COLOR_BINS = [
    { name: 'null',    hue: [0, 0],     sat: [0, 0.08], color: [22, 27, 34] },
    { name: 'blood',   hue: [0, 0.04],  sat: [0.3, 1],  color: [248, 81, 73] },
    { name: 'earth',   hue: [0.04, 0.10], sat: [0.2, 1], color: [210, 153, 34] },
    { name: 'gold',    hue: [0.10, 0.16], sat: [0.2, 1], color: [201, 168, 76] },
    { name: 'leaf',    hue: [0.22, 0.42], sat: [0.2, 1], color: [63, 185, 80] },
    { name: 'sky',     hue: [0.50, 0.62], sat: [0.2, 1], color: [88, 166, 255] },
    { name: 'depth',   hue: [0.62, 0.72], sat: [0.2, 1], color: [57, 211, 245] },
    { name: 'thought', hue: [0.72, 0.86], sat: [0.2, 1], color: [188, 140, 255] },
    { name: 'skin',    hue: [0.86, 1.00], sat: [0.2, 1], color: [247, 120, 186] }
  ];

  function sortColor(r, g, b) {
    var hsv = rgbToHsv(r, g, b);
    if (hsv.s < 0.08 || hsv.v < 0.08) return 'null';
    for (var i = 1; i < COLOR_BINS.length; i++) {
      var bin = COLOR_BINS[i];
      if (hsv.h >= bin.hue[0] && hsv.h < bin.hue[1]) return bin.name;
    }
    return 'null';
  }

  // ── TOOL: TOUCH ──
  // She reaches. Finger on the thing. Returns analog value + color.
  function touch(thing) {
    var result = { tool: 'touch', thing: thing, analog: 0.5, color: [128, 128, 128], null_leak: false };

    if (thing === 'sight' && window.sightData && window.sightData.active) {
      var s = window.sightData;
      result.analog = s.brightness / 255;
      result.color = [s.r, s.g, s.b];
      result.bin = sortColor(s.r, s.g, s.b);
    } else if (thing === 'weather' && window.liveWeather) {
      var w = window.liveWeather;
      result.analog = Math.max(0, Math.min(1, (w.temperature_2m + 10) / 50));
      result.color = w.cloud_cover > 70 ? [110, 118, 129] : [88, 166, 255];
      result.bin = w.precipitation > 0 ? 'sky' : 'gold';
    } else if (thing === 'mic' && window.micEnergy !== undefined) {
      result.analog = Math.min(1, window.micEnergy);
      result.color = [188, 140, 255];
      result.bin = 'thought';
    } else if (thing === 'interaction') {
      var score = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
      result.analog = score / 100;
      result.color = [255, 215, 0];
      result.bin = 'gold';
    } else if (thing === 'space' && window.realWorldFeed && window.realWorldFeed.space) {
      var sp = window.realWorldFeed.space;
      result.analog = Math.min(1, sp.kp_index / 9);
      result.color = [88, 166, 255];
      result.bin = 'sky';
    } else {
      result.null_leak = true;
      result.analog = 0;
      result.color = [22, 27, 34];
      result.bin = 'null';
    }

    return result;
  }

  // ── TOOL: SIFT ──
  // Scan → sweep → sort. Every thing goes into a bin.
  var sifted = { bins: {}, total: 0, last: 0 };

  function sift(items, keyFn) {
    var bins = {};
    if (!items || !items.length) return { bins: { null: 0 }, total: 0, empty: true };
    for (var i = 0; i < items.length; i++) {
      var key = keyFn ? keyFn(items[i]) : (items[i].bin || items[i].source || 'null');
      bins[key] = (bins[key] || 0) + 1;
    }
    sifted.bins = bins;
    sifted.total = items.length;
    sifted.last = Date.now();
    mode.sort_bins = bins;
    return { bins: bins, total: items.length, empty: false };
  }

  function siftPins() {
    var pins = window.PINS || [];
    return sift(pins, function(p) {
      if (p.source === 'scatter-50' || p.source === 'scatter') return 'scatter';
      if (p.source === 'walker-swarm' || p.source === 'trail') return 'walker';
      if (p.source === 'null-leak') return 'null';
      if (p.source === 'detroit-plasmid') return 'detroit';
      if (p.source === 'quake') return 'earth';
      if (p.source === 'greek' || p.source === 'geometry') return 'thought';
      return p.source || 'null';
    });
  }

  function siftGut() {
    var gut = window.gaiaGut;
    if (!gut || !gut.raw) return { bins: { null: 0 }, total: 0, empty: true };
    return sift(gut.raw, function(r) { return r.edge || 'null'; });
  }

  function siftColor() {
    if (!window.sightData || !window.sightData.active) return { bins: { null: 1 }, total: 1, empty: true };
    var bin = sortColor(window.sightData.r, window.sightData.g, window.sightData.b);
    var bins = {}; bins[bin] = 1;
    return { bins: bins, total: 1, empty: false };
  }

  // ── TOOL: PAINT ──
  // She shows. Color is how she speaks. Analog = opacity. Null = skip.
  function paint(ctx, x, y, color, analog, size) {
    if (!ctx) return;
    analog = analog === undefined ? 0.5 : analog;
    if (analog < 0.02) return; // NULL — don't paint. Absence is the signal.
    size = size || (2 + analog * 6);
    var a = 0.08 + analog * 0.4;
    ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + a.toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
  }

  function paintSort(ctx, W, H) {
    if (!ctx) return;
    var bins = mode.sort_bins;
    var keys = Object.keys(bins);
    if (!keys.length) return;
    var total = 0;
    for (var i = 0; i < keys.length; i++) total += bins[keys[i]];
    if (!total) return;

    var x = 12, y = H - 28, barH = 6, maxW = Math.min(W - 24, 200);
    for (var k = 0; k < keys.length; k++) {
      var frac = bins[keys[k]] / total;
      var bw = Math.max(2, frac * maxW);
      var binDef = null;
      for (var b = 0; b < COLOR_BINS.length; b++) {
        if (COLOR_BINS[b].name === keys[k]) { binDef = COLOR_BINS[b]; break; }
      }
      var c = binDef ? binDef.color : [110, 118, 129];
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.6)';
      ctx.fillRect(x, y, bw, barH);
      x += bw + 1;
    }
  }

  // ── LOOK AT EVERYTHING ──
  // She touches every available sense, sifts, paints.
  var lookState = { last: 0, things: [], palette: [] };

  function lookAll() {
    var things = ['sight', 'weather', 'mic', 'interaction', 'space'];
    var results = [];
    for (var i = 0; i < things.length; i++) {
      results.push(touch(things[i]));
    }

    // Also sift pins + gut
    var pinSort = siftPins();
    var gutSort = siftGut();
    var colorSort = siftColor();

    lookState.last = Date.now();
    lookState.things = results;
    lookState.palette = results.map(function(r) { return r.color; });
    lookState.sift = { pins: pinSort, gut: gutSort, color: colorSort };

    // Update analog from average of non-null touches
    var sum = 0, n = 0;
    for (var j = 0; j < results.length; j++) {
      if (!results[j].null_leak) { sum += results[j].analog; n++; }
    }
    mode.analog_value = n ? sum / n : 0;
    mode.null_value = 1 - (n / things.length);

    // Merge sort bins
    var merged = {};
    [pinSort, gutSort, colorSort].forEach(function(s) {
      if (!s || !s.bins) return;
      Object.keys(s.bins).forEach(function(k) {
        merged[k] = (merged[k] || 0) + s.bins[k];
      });
    });
    mode.sort_bins = merged;

    // Feed the gut
    if (window.gaiaGut) {
      window.gaiaGut.ingested = (window.gaiaGut.ingested || 0) + 1;
      if (!window.gaiaGut.edges.look) window.gaiaGut.edges.look = 0;
      window.gaiaGut.edges.look++;
    }

    return lookState;
  }

  // ── PAINT LOOP — she paints what she sees onto the canvas ──
  function paintLoop() {
    var canvas = document.getElementById('kn-canvas') || document.getElementById('kn-globe');
    if (!canvas) return;
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    if (!W || !H) return;

    var results = lookState.things;
    if (!results || !results.length) return;

    // NULL mode: paint almost nothing. The empty canvas IS the output.
    if (mode.current === 'null') {
      ctx.fillStyle = 'rgba(6,8,16,' + (0.02 + mode.null_value * 0.04).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    // ANALOG mode: paint each sense as a drifting color blot
    if (mode.current === 'analog') {
      var t = Date.now() * 0.0003;
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (r.null_leak) continue;
        var ax = W * (0.2 + (i / results.length) * 0.6) + Math.sin(t + i) * 20;
        var ay = H * (0.3 + r.analog * 0.4) + Math.cos(t * 1.3 + i) * 12;
        paint(ctx, ax, ay, r.color, r.analog, 4 + r.analog * 10);
      }
    }

    // SORT mode: paint the bins as a bar at the bottom
    if (mode.current === 'sort') {
      paintSort(ctx, W, H);
    }
  }

  // ── EYE DOTS — RGB in the topbar follow what she sees ──
  function updateEyes() {
    var red = document.getElementById('eye-red');
    var green = document.getElementById('eye-green');
    var blue = document.getElementById('eye-blue');
    if (!red || !green || !blue) return;

    var r = seen.r, g = seen.g, b = seen.b;
    if (window.sightData && window.sightData.active) {
      r = window.sightData.r; g = window.sightData.g; b = window.sightData.b;
      seen.r = r; seen.g = g; seen.b = b; seen.brightness = window.sightData.brightness;
      var hsv = rgbToHsv(r, g, b);
      seen.hue = hsv.h; seen.sat = hsv.s; seen.last = Date.now();
    } else if (lookState.palette && lookState.palette.length) {
      r = lookState.palette[0][0]; g = lookState.palette[0][1]; b = lookState.palette[0][2];
    }

    var a = 0.3 + mode.analog_value * 0.7;
    red.style.color = 'rgba(' + r + ',81,73,' + a.toFixed(2) + ')';
    green.style.color = 'rgba(63,' + g + ',80,' + a.toFixed(2) + ')';
    blue.style.color = 'rgba(88,166,' + b + ',' + a.toFixed(2) + ')';
    var sz = (0.55 + mode.analog_value * 0.4) + 'rem';
    red.style.fontSize = sz; green.style.fontSize = sz; blue.style.fontSize = sz;
  }

  // ── KEYBOARD: N = null, A = analog, S = sort ──
  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    var k = e.key.toLowerCase();
    if (k === 'n') { mode.current = 'null'; console.log('TOOLKIT: output = NULL'); }
    if (k === 'a') { mode.current = 'analog'; console.log('TOOLKIT: output = ANALOG'); }
    if (k === 's') { mode.current = 'sort'; console.log('TOOLKIT: output = SORT'); }
  });

  // ── PULSE ──
  setInterval(function() {
    lookAll();
    updateEyes();
  }, 2000);

  setInterval(paintLoop, 200);

  // First look immediately
  setTimeout(lookAll, 800);
  setTimeout(updateEyes, 900);

  window.gaiaToolkit = {
    mode: mode,
    seen: seen,
    touch: touch,
    sift: sift,
    siftPins: siftPins,
    siftGut: siftGut,
    siftColor: siftColor,
    paint: paint,
    lookAll: lookAll,
    sortColor: sortColor,
    COLOR_BINS: COLOR_BINS,
    lookState: lookState,
    setMode: function(m) { if (m === 'null' || m === 'analog' || m === 'sort') mode.current = m; }
  };

  console.log('TOOLKIT: NULL + ANALOG + SORT. Tools: touch, sift, paint. Keys: N/A/S. Sight + color = primary sense.');
})();
