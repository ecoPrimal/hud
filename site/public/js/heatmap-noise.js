/* heatmap-noise.js — the membrane's thermal/acoustic heatmap
 *
 * NOISE COLORS (acoustic spectrum = table legs in SOUND):
 *
 *   BROWN noise  = 1/f² — heavy bass, random walk, deep ocean
 *                   the THOUGHT leg (π³, violet, lowest freq)
 *                   = deep investigation, organisms, braids, pangaea
 *
 *   PINK noise   = 1/f  — balanced, natural, heartbeat, rivers
 *                   the CONNECT leg (π², blue, medium freq)
 *                   = network, mesh, balanced signal, membrane
 *
 *   WHITE noise  = flat — all frequencies equal, hiss, static
 *                   the DATUM leg (π⁰, white, all freq)
 *                   = raw data, undifferentiated, ionosphere
 *
 *   BLUE noise   = f¹ — high freq emphasis, crisp, dithering
 *                   the PATTERN leg (π¹, green, high freq)
 *                   = discovery, novelty, surprise, epitope sort
 *
 *   VIOLET noise = f² — highest freq, harsh, rare
 *                   beyond the legs — non_self, threat, extreme
 *                   = attack patterns, immunological threat
 *
 * MAPPING TO MEMBRANE:
 *   MUSIC    = structured signal (human creativity, braids, investigation)
 *   SILENCE  = null (absence, unmeasured, dead feeds)
 *   NOISE    = unstructured (fleet, bots, automated)
 *   GREY     = between music and noise (partial, mixed)
 *
 * THERMAL:
 *   HOT  = lots of activity, high entropy, lots of surprise
 *   COLD = little activity, low entropy, predictable
 *   The thermocline IS where hot meets cold
 *
 * Wave 180. The membrane has a temperature. It has a sound color.
 */
(function () {
  'use strict';

  var PI = Math.PI;

  // ═══════════════════════════════════════════════════════════
  // NOISE COLORS — the acoustic spectrum
  // Matched to table legs from klein-prism.js
  // ═══════════════════════════════════════════════════════════
  var NOISE_COLORS = {
    brown:  { slope: -2, color: '#8B4513', leg: 'thought', piPower: 3, freq: 'low',    meaning: 'deep — organisms, braids, long investigation', musicality: 0.7 },
    pink:   { slope: -1, color: '#FF69B4', leg: 'connect', piPower: 2, freq: 'medium', meaning: 'balanced — natural, heartbeat, rivers',          musicality: 0.9 },
    white:  { slope:  0, color: '#e8e8e8', leg: 'datum',   piPower: 0, freq: 'flat',   meaning: 'all frequencies — raw, undifferentiated',        musicality: 0.3 },
    blue:   { slope:  1, color: '#4169E1', leg: 'pattern', piPower: 1, freq: 'high',   meaning: 'crisp — discovery, novelty, surprise',           musicality: 0.5 },
    violet: { slope:  2, color: '#9400D3', leg: null,      piPower: 4, freq: 'vhigh',  meaning: 'harsh — threats, attacks, immunological',        musicality: 0.1 },
    grey:   { slope: null, color: '#484f58', leg: null,    piPower: null, freq: 'perceptual', meaning: 'perceptually flat — null surface', musicality: 0 },
  };

  // ═══════════════════════════════════════════════════════════
  // THERMAL ZONES — what the membrane temperature means
  // ═══════════════════════════════════════════════════════════
  var ZONES = [
    { name: 'frozen',   range: [0, 0.1],    noiseColor: 'grey',   sound: 'silence',          color: '#161b22', meaning: 'dead — no signal at all' },
    { name: 'cold',     range: [0.1, 0.25], noiseColor: 'brown',  sound: 'deep rumble',      color: '#3d1f00', meaning: 'dormant — braids resting, organisms sleeping' },
    { name: 'cool',     range: [0.25, 0.4], noiseColor: 'pink',   sound: 'heartbeat',        color: '#1a3a5c', meaning: 'steady — humans present, gentle rhythm' },
    { name: 'tepid',    range: [0.4, 0.55], noiseColor: 'white',  sound: 'ambient hiss',     color: '#2d333b', meaning: 'moderate — mixed traffic, background activity' },
    { name: 'warm',     range: [0.55, 0.7], noiseColor: 'blue',   sound: 'bright shimmer',   color: '#1c3d5a', meaning: 'active — discovery happening, sorts running' },
    { name: 'hot',      range: [0.7, 0.85], noiseColor: 'violet', sound: 'sharp crackle',    color: '#5c1a3a', meaning: 'intense — threats active, immune response' },
    { name: 'boiling',  range: [0.85, 1.0], noiseColor: 'violet', sound: 'overdriven',       color: '#8B0000', meaning: 'crisis — membrane under attack' },
  ];

  // ═══════════════════════════════════════════════════════════
  // COMPUTE THERMAL STATE — from all live sources
  // ═══════════════════════════════════════════════════════════
  function computeThermal() {
    var temps = {};
    var overall = 0;
    var count = 0;

    // From temperature.json (pre-computed)
    var anchor = window._voxelAnchor;
    if (anchor) {
      var st = anchor.state();
      var tempData = st.layers.membrane && st.layers.membrane.temperature;
      if (tempData && tempData.sources) {
        for (var src in tempData.sources) {
          temps[src] = tempData.sources[src].temp || 0;
          overall += temps[src];
          count++;
        }
      }
    }

    // From permeability layers
    var perm = window._permeability;
    if (perm) {
      perm.layers.forEach(function (layer) {
        temps[layer.name] = layer.temperature;
        overall += layer.temperature;
        count++;
      });
    }

    // From pi-step-dance sensation
    var dance = window._piStepDance;
    if (dance && dance.tense) {
      var t = dance.tense();
      if (t.now && t.now.sensation) {
        temps.sensation = t.now.sensation.total || 0;
        overall += temps.sensation;
        count++;
      }
      if (t.now && t.now.pressure) {
        temps.pressure = Math.abs(t.now.pressure.magnitude || 0);
        overall += temps.pressure;
        count++;
      }
    }

    // From proprioception (clicks = heat)
    var proprio = window._proprioception;
    if (proprio) {
      var nerves = proprio.nerves();
      var recentClicks = nerves.clicks.filter(function (c) {
        return Date.now() - c.ts < 60000; // last minute
      }).length;
      temps.interaction = Math.min(1, recentClicks / 10);
      overall += temps.interaction;
      count++;
    }

    // From prism signal
    var prism = window._kleinPrism;
    if (prism) {
      temps.signal = prism.signal();
      overall += temps.signal;
      count++;
    }

    if (count === 0) return { temp: 0.42, zone: ZONES[3], temps: {}, noiseColor: 'white' };

    var avg = overall / count;
    var zone = ZONES[0];
    for (var i = 0; i < ZONES.length; i++) {
      if (avg >= ZONES[i].range[0] && avg < ZONES[i].range[1]) {
        zone = ZONES[i];
        break;
      }
    }
    if (avg >= 0.85) zone = ZONES[ZONES.length - 1];

    return {
      temp: avg,
      zone: zone,
      temps: temps,
      noiseColor: zone.noiseColor,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // MUSICALITY SCORE — how much is music vs noise?
  // ═══════════════════════════════════════════════════════════
  function musicality() {
    var thermal = computeThermal();
    var nc = NOISE_COLORS[thermal.noiseColor];

    // musicality 0→1: 0 = pure noise/silence, 1 = pure music
    var base = nc ? nc.musicality : 0.5;

    // Human presence increases musicality
    var anchor = window._voxelAnchor;
    if (anchor) {
      var trust = anchor.state().trust;
      if (trust.human > 0) {
        base = Math.min(1, base + 0.2);
      }
      if (trust.bot > trust.human) {
        base = Math.max(0, base - 0.3);
      }
    }

    // Shannon entropy: mid-entropy = most musical (not too predictable, not too random)
    var dance = window._piStepDance;
    if (dance && dance.tense) {
      var t = dance.tense();
      if (t.now && t.now.entropies) {
        // Collect all entropies
        var entropies = [];
        for (var k in t.now.entropies) {
          entropies.push(t.now.entropies[k]);
        }
        if (entropies.length > 0) {
          var avgH = entropies.reduce(function (s, h) { return s + h; }, 0) / entropies.length;
          // Mid-entropy (2-4 bits) = most musical
          var musicFromH = 1 - Math.abs(avgH - 3) / 3;
          base = (base + Math.max(0, musicFromH)) / 2;
        }
      }
    }

    return {
      score: base,
      label: base > 0.8 ? 'MUSIC' : base > 0.6 ? 'melodic' : base > 0.4 ? 'rhythmic'
        : base > 0.2 ? 'noisy' : base > 0.05 ? 'static' : 'SILENCE',
      noiseColor: thermal.noiseColor,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — the heatmap widget
  // ═══════════════════════════════════════════════════════════
  function renderHeatmap() {
    var existing = document.getElementById('heatmap-noise');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'heatmap-noise';
    el.style.cssText = 'position:fixed;top:70px;right:12px;z-index:5;'
      + 'background:rgba(22,27,34,.85);border:1px solid rgba(255,105,180,.2);'
      + 'border-radius:8px;padding:6px 10px;width:155px;pointer-events:auto;'
      + 'font:9px monospace;color:#8b949e;';

    function update() {
      var thermal = computeThermal();
      var music = musicality();
      var nc = NOISE_COLORS[thermal.noiseColor];

      var html = '<div style="color:' + nc.color + ';font-weight:bold;margin-bottom:3px">'
        + '🌡 ' + thermal.noiseColor + ' noise · ' + thermal.zone.name
        + '</div>';

      // Temperature bar with gradient
      var tempPct = Math.round(thermal.temp * 100);
      html += '<div style="height:6px;background:linear-gradient(90deg,'
        + '#161b22 0%,#3d1f00 15%,#1a3a5c 30%,#2d333b 45%,#1c3d5a 60%,#5c1a3a 80%,#8B0000 100%);'
        + 'border-radius:3px;position:relative;margin:3px 0">';
      html += '<div style="position:absolute;left:' + tempPct + '%;top:-2px;'
        + 'width:2px;height:10px;background:#fff;border-radius:1px"></div>';
      html += '</div>';
      html += '<div style="font-size:7px;display:flex;justify-content:space-between">';
      html += '<span>frozen</span><span>cool</span><span>warm</span><span>boiling</span>';
      html += '</div>';

      // Noise color spectrum
      html += '<div style="display:flex;height:8px;border-radius:3px;overflow:hidden;margin:4px 0">';
      var noiseNames = ['brown', 'pink', 'white', 'blue', 'violet'];
      noiseNames.forEach(function (n) {
        var nc2 = NOISE_COLORS[n];
        var isActive = n === thermal.noiseColor;
        html += '<div style="flex:1;background:' + nc2.color
          + ';opacity:' + (isActive ? '1' : '0.25')
          + ';border:' + (isActive ? '1px solid #fff' : 'none')
          + '" title="' + n + ' noise: ' + nc2.meaning + '"></div>';
      });
      html += '</div>';
      html += '<div style="font-size:6px;display:flex;justify-content:space-between;color:#484f58">';
      html += '<span>brown</span><span>pink</span><span>white</span><span>blue</span><span>violet</span>';
      html += '</div>';

      // Leg mapping
      html += '<div style="margin-top:3px;font-size:7px;color:#484f58">';
      if (nc.leg) {
        html += 'table leg: <span style="color:' + (nc.leg === 'thought' ? '#a371f7'
          : nc.leg === 'connect' ? '#58a6ff'
          : nc.leg === 'datum' ? '#e8e8e8'
          : '#3fb950') + '">' + nc.leg + '</span> π' + ['⁰','¹','²','³','⁴'][nc.piPower || 0];
      } else {
        html += '<span style="color:#f85149">beyond the legs</span>';
      }
      html += '</div>';

      // Musicality
      html += '<div style="margin-top:3px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">';
      var musicColor = music.score > 0.6 ? '#3fb950' : music.score > 0.3 ? '#f0e68c' : '#f85149';
      html += '<span style="color:' + musicColor + '">♫ ' + music.label + '</span>';
      html += ' <span style="color:#484f58">' + (music.score * 100).toFixed(0) + '%</span>';

      // Music vs noise bar
      html += '<div style="display:flex;height:4px;border-radius:2px;overflow:hidden;margin:2px 0">';
      html += '<div style="width:' + (music.score * 100) + '%;background:#3fb950" title="music"></div>';
      html += '<div style="flex:1;background:#484f58" title="noise/silence"></div>';
      html += '</div>';
      html += '<div style="font-size:6px;display:flex;justify-content:space-between">';
      html += '<span style="color:#3fb950">music</span>';
      html += '<span style="color:#484f58">null</span>';
      html += '<span style="color:#e8e8e8">noise</span>';
      html += '</div>';
      html += '</div>';

      // Sound description
      html += '<div style="margin-top:2px;font-size:7px;color:#484f58">'
        + 'sound: ' + thermal.zone.sound
        + '</div>';

      // Per-source temperatures (mini heatmap)
      var temps = thermal.temps;
      var tempKeys = Object.keys(temps);
      if (tempKeys.length > 0) {
        html += '<div style="margin-top:3px;border-top:1px solid rgba(48,54,61,.5);padding-top:2px">';
        html += '<div style="display:flex;flex-wrap:wrap;gap:1px">';
        tempKeys.sort(function (a, b) { return temps[b] - temps[a]; });
        tempKeys.forEach(function (key) {
          var t = temps[key];
          // Heat color: cold=blue, warm=yellow, hot=red
          var r = Math.round(t * 255);
          var g = Math.round((1 - Math.abs(t - 0.5) * 2) * 180);
          var b = Math.round((1 - t) * 255);
          html += '<div style="width:18px;height:10px;background:rgb(' + r + ',' + g + ',' + b + ');'
            + 'border-radius:2px;font-size:5px;text-align:center;color:#fff;line-height:10px;'
            + 'overflow:hidden" title="' + key + ': ' + (t * 100).toFixed(0) + '%">'
            + key.substring(0, 3)
            + '</div>';
        });
        html += '</div></div>';
      }

      el.innerHTML = html;
    }

    update();
    setInterval(update, Math.round(PI * PI * 1000)); // π² ≈ 10s
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._heatmapNoise = {
    thermal: computeThermal,
    musicality: musicality,
    noiseColors: NOISE_COLORS,
    zones: ZONES,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    setTimeout(function () {
      renderHeatmap();
      var t = computeThermal();
      var m = musicality();
      console.log('[heatmap-noise] ' + t.noiseColor + ' noise · '
        + t.zone.name + ' (' + (t.temp * 100).toFixed(0) + '%) · '
        + '♫ ' + m.label + ' (' + (m.score * 100).toFixed(0) + '%)');
      console.log('  brown=deep/thought · pink=balanced/connect · white=raw/datum · blue=crisp/pattern · violet=threat');
      console.log('  music→null→noise · structured→absent→random');
    }, 4500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
