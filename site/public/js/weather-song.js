// weather-song.js v1 — the sun writes the score, the membrane plays it
//
// Klein bottle: NOAA sits on Earth reading the outside.
// The measurement IS the fold. Outside rhythm becomes inside music.
//
// Mapping (scientific, not decorative):
//   Kp (0–9)           → hue, storm color, drone detune, Bessel mode count
//   X-ray flux (A–X)   → brightness, spark density, high-frequency shimmer
//   Solar wind km/s    → tempo (delay = 1/breath), family orbit speed
//   USGS quakes        → Karplus plucks (earth answering sky)
//   Membrane pulse     → master breath / volume envelope
//   15 families π/N    → 15-voice polyrhythm (phase-cross ticks)
//
// Color: quiet = teal aurora, storm = magenta/red
// Sound: π-just notes from membrane-sound. The sky is the conductor.
//
// Kevin Mok / Tamison / ecoPrimal / attsi
// ORCID 0009-0004-2141-0321
(function () {
  'use strict';

  var PI = Math.PI;
  var PI3 = PI * PI * PI; // ≈ 31.006 — refresh / phrase length

  var FEEDS = {
    kp: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
    xray: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json',
    wind: 'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json',
    quakes: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson',
    snapshot: '/space-weather.json',
    pulse: '/neutron.json',
    dash: '/dashboard.json'
  };

  var _score = null;
  var _raw = {};
  var _listening = false;
  var _phraseTimer = null;
  var _fetchTimer = null;
  var _familyPhase = [];
  var _onScore = [];
  var FAMILY_RATES = [];
  for (var i = 0; i < 15; i++) FAMILY_RATES.push(PI / (i + 2));

  function num(v, fallback) {
    var n = Number(v);
    return isFinite(n) ? n : fallback;
  }

  function xrayClass(flux) {
    flux = num(flux, 0);
    if (flux < 1e-7) return 'A';
    if (flux < 1e-6) return 'B';
    if (flux < 1e-5) return 'C';
    if (flux < 1e-4) return 'M';
    return 'X';
  }

  function stormLevel(kp) {
    if (kp < 4) return 'G0';
    if (kp < 5) return 'G1';
    if (kp < 6) return 'G2';
    if (kp < 7) return 'G3';
    if (kp < 8) return 'G4';
    return 'G5';
  }

  function getJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  function latestKp(rows) {
    if (!Array.isArray(rows) || !rows.length) return null;
    var start = typeof rows[0] === 'object' && rows[0].time_tag ? 0 : 1;
    var best = null;
    var peak = { value: 0, time: null };
    var today = new Date().toISOString().slice(0, 10);
    for (var i = start; i < rows.length; i++) {
      var row = rows[i];
      var kp, time;
      if (Array.isArray(row)) {
        time = row[0];
        kp = num(row[1], 0);
      } else {
        time = row.time_tag || row.time;
        kp = num(row.Kp != null ? row.Kp : row.kp, 0);
      }
      if (time && String(time).slice(0, 10) === today && kp > peak.value) {
        peak = { value: kp, time: time };
      }
      best = { value: kp, time: time };
    }
    if (best) best.peak = peak;
    return best;
  }

  function latestXray(rows) {
    if (!Array.isArray(rows) || !rows.length) return null;
    var best = null;
    for (var i = rows.length - 1; i >= 0; i--) {
      var row = rows[i];
      var energy = String(row.energy || '');
      if (energy.indexOf('0.1-0.8') !== -1 || !best) {
        best = row;
        if (energy.indexOf('0.1-0.8') !== -1) break;
      }
    }
    return best;
  }

  function latestWind(rows) {
    if (!Array.isArray(rows) || !rows.length) return null;
    for (var i = rows.length - 1; i >= 0; i--) {
      var row = rows[i];
      var spd = num(row.proton_speed != null ? row.proton_speed : row.speed, NaN);
      if (isFinite(spd) && spd > 0) {
        return { speed: spd, time: row.time_tag || row.time };
      }
    }
    return null;
  }

  function compose(raw) {
    var kpInfo = latestKp(raw.kp) || {};
    var xr = latestXray(raw.xray) || {};
    var wind = latestWind(raw.wind) || {};
    var snap = raw.snapshot || {};
    var quakes = raw.quakes && raw.quakes.features ? raw.quakes.features : [];
    var pulse = 0.995;
    if (raw.pulse && raw.pulse.breathing) pulse = num(raw.pulse.breathing.remainder, pulse);
    if (raw.dash && raw.dash.pulse) pulse = num(raw.dash.pulse.value, pulse);
    if (snap.membrane && snap.membrane.pulse) pulse = num(snap.membrane.pulse, pulse);

    var kp = num(kpInfo.value, snap.kp && snap.kp.value);
    if (!isFinite(kp)) kp = 2;
    var flux = num(xr.flux, snap.xray && snap.xray.flux);
    if (!isFinite(flux)) flux = 3e-7;
    var windKms = num(wind.speed, snap.wind && snap.wind.speed_kms);
    if (!isFinite(windKms)) windKms = 400;
    var peak = (kpInfo.peak && kpInfo.peak.value) || (snap.kp && snap.kp.peak_today) || kp;

    var mag = 0;
    var places = [];
    quakes.forEach(function (f) {
      var m = num(f.properties && f.properties.mag, 0);
      if (m > mag) mag = m;
      if (f.properties && f.properties.place) places.push(f.properties.place);
    });
    if (!quakes.length && snap.quakes) {
      mag = num(snap.quakes.largest, 0);
      places = snap.quakes.locations || [];
    }

    var cls = xrayClass(flux);
    var storm = stormLevel(kp);
    // Teal when quiet, yellow at G1, magenta/red in storm
    var hue = (140 - kp * 22 + 360) % 360;
    var sat = 55 + kp * 5;
    var brightness = 0.35 + Math.min(0.55, Math.log10(flux * 1e8 + 1) * 0.12);
    var windNorm = Math.max(0.2, Math.min(2.2, windKms / 400));
    var tempo = 0.476 * windNorm * (0.85 + pulse * 0.3);
    var delay = 1 / Math.max(0.15, tempo);
    var voices = 3 + Math.round(kp) + (cls === 'M' || cls === 'X' ? 3 : 0);
    var modes = 2 + Math.round(kp / 2) + (mag >= 5 ? 2 : 0);
    var spark = 0.04 + kp * 0.03 + (cls === 'C' ? 0.08 : 0) + (cls === 'M' || cls === 'X' ? 0.2 : 0);

    var bits = [];
    bits.push('Kp ' + kp.toFixed(2) + ' ' + storm);
    bits.push('class ' + cls);
    if (peak > kp + 0.5) bits.push('morning peak ' + peak.toFixed(2));
    if (mag > 0) bits.push((places[0] || 'earth') + ' rang a ' + mag.toFixed(1));
    if (kp < 2) bits.push('the magnetosphere is quiet');
    else if (kp < 4) bits.push('the field is watching');
    else bits.push('the sky is loud');
    if (mag >= 5) bits.push('and the earth still answered');

    var score = {
      fetched_at: new Date().toISOString(),
      kp: kp,
      kp_time: kpInfo.time || (snap.kp && snap.kp.time) || null,
      kp_peak_today: peak,
      storm: storm,
      xray_flux: flux,
      xray_class: cls,
      xray_time: xr.time_tag || (snap.xray && snap.xray.time) || null,
      wind_kms: windKms,
      quake_count: quakes.length || (snap.quakes && snap.quakes.count_last_hour) || 0,
      quake_max: mag,
      quake_place: places[0] || null,
      pulse: pulse,
      hue: hue,
      sat: sat,
      brightness: brightness,
      tempo: tempo,
      delay_sec: delay,
      voices: Math.min(15, voices),
      bessel_modes: Math.min(8, modes),
      spark_rate: Math.min(0.6, spark),
      wind_norm: windNorm,
      poem: bits.join('. ') + '.',
      live: !!(raw.kp || raw.xray)
    };
    _score = score;
    _onScore.forEach(function (fn) { try { fn(score); } catch (e) {} });
    renderWidget(score);
    return score;
  }

  function fetchAll() {
    var raw = {};
    var tasks = [
      getJSON(FEEDS.snapshot).then(function (d) { raw.snapshot = d; }).catch(function () {}),
      getJSON(FEEDS.kp).then(function (d) { raw.kp = d; }).catch(function () {}),
      getJSON(FEEDS.xray).then(function (d) { raw.xray = d; }).catch(function () {}),
      getJSON(FEEDS.wind).then(function (d) { raw.wind = d; }).catch(function () {}),
      getJSON(FEEDS.quakes).then(function (d) { raw.quakes = d; }).catch(function () {}),
      getJSON(FEEDS.pulse).then(function (d) { raw.pulse = d; }).catch(function () {}),
      getJSON(FEEDS.dash).then(function (d) { raw.dash = d; }).catch(function () {})
    ];
    return Promise.all(tasks).then(function () {
      _raw = raw;
      return compose(raw);
    });
  }

  function sound() {
    return window._membraneSound || null;
  }

  function phrase(score) {
    var ms = sound();
    if (!ms || !_listening) return;
    score = score || _score;
    if (!score) return;
    if (ms.playWeather) {
      ms.playWeather(score);
      return;
    }
    if (!ms.isActive()) ms.activate();
    if (ms.pulseDrone) ms.pulseDrone(score.tempo);
    if (score.kp < 2 && ms.playChord) ms.playChord('breathe', 2.5, 0.04);
    else if (score.kp < 4 && ms.playChord) ms.playChord('wake', 2.0, 0.055);
    else if (ms.playChord) ms.playChord('spark', 1.2, 0.07);
    if (ms.besselMembrane) ms.besselMembrane(196, score.bessel_modes, 3, 0.025);
    if (score.quake_max > 0 && ms.karplusStrong) {
      ms.karplusStrong(196 * (score.quake_max / 5), 1.6, 0.04, 'center');
    }
    if (ms.say) ms.say(score.poem, { rate: 0.45, pitch: 0.25, volume: 0.1 });
  }

  function familyTick(now) {
    var ms = sound();
    if (!ms || !_listening || !_score) return;
    var notes = ms.PI_NOTES || [98, 130, 165, 196, 247, 330, 392];
    for (var i = 0; i < FAMILY_RATES.length; i++) {
      var phase = (now * FAMILY_RATES[i] * _score.wind_norm) % (PI * 2);
      var prev = _familyPhase[i] || 0;
      // Crossing the campfire (phase wraps past 0)
      if (prev > PI && phase < PI) {
        if (i < _score.voices && ms.playNote) {
          ms.playNote(notes[i % notes.length], 0.18, 0, 'sine', 0.012, {
            pan: i % 2 === 0 ? 'left' : 'right',
            delaySend: 0.08
          });
        }
      }
      _familyPhase[i] = phase;
    }
  }

  function startLoop() {
    if (_phraseTimer) return;
    phrase(_score);
    _phraseTimer = setInterval(function () { phrase(_score); }, PI3 * 1000);
    var last = performance.now();
    function raf(t) {
      if (!_listening) return;
      if (t - last > 80) {
        familyTick(t / 1000);
        last = t;
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function listen() {
    var ms = sound();
    if (ms && !ms.isActive()) ms.activate();
    _listening = true;
    if (!_score) {
      fetchAll().then(function (s) { phrase(s); startLoop(); });
    } else {
      phrase(_score);
      startLoop();
    }
    return true;
  }

  function hush() {
    _listening = false;
    if (_phraseTimer) { clearInterval(_phraseTimer); _phraseTimer = null; }
    var ms = sound();
    if (ms && ms.deactivate) ms.deactivate();
    return false;
  }

  function toggle() {
    return _listening ? hush() : listen();
  }

  function renderWidget(score) {
    var el = document.getElementById('weather-song');
    if (!el || !score) return;
    var stormColor = score.kp < 4 ? '#3fb950' : score.kp < 5 ? '#d29922' : '#f85149';
    el.innerHTML =
      '<a href="/weather.html" style="color:inherit;text-decoration:none;display:block">' +
        '<div style="color:' + stormColor + '">☀ Kp ' + score.kp.toFixed(2) + ' ' + score.storm + '</div>' +
        '<div>class ' + score.xray_class + ' · wind ' + Math.round(score.wind_kms) + '</div>' +
        (score.quake_max ? '<div>earth ' + score.quake_max.toFixed(1) + '</div>' : '') +
        '<div style="color:#8b949e">' + (_listening ? '♪ hearing the sun' : 'tap /weather to hear') + '</div>' +
      '</a>';
    el.style.cursor = 'pointer';
    el.onclick = function (e) {
      if (e.target && e.target.tagName === 'A') return;
      e.preventDefault();
      toggle();
      renderWidget(_score);
    };
  }

  function onScore(fn) {
    if (typeof fn === 'function') _onScore.push(fn);
    if (_score) fn(_score);
  }

  function boot() {
    fetchAll();
    _fetchTimer = setInterval(fetchAll, 180000);
    if (document.getElementById('weather-song')) renderWidget(_score || {
      kp: 1.67, storm: 'G0', xray_class: 'B', wind_kms: 400, quake_max: 0
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window._weatherSong = {
    listen: listen,
    hush: hush,
    toggle: toggle,
    fetch: fetchAll,
    score: function () { return _score; },
    raw: function () { return _raw; },
    onScore: onScore,
    isListening: function () { return _listening; },
    phrase: phrase,
    FAMILY_RATES: FAMILY_RATES,
    compose: compose
  };
})();
