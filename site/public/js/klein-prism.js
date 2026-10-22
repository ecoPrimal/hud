/* klein-prism.js — the Klein surface as a PRISM
 *
 * THE TABLE:
 *   4 LEGS (uneven, because π — they never align):
 *     white  (#e8e8e8) = datum    π⁰  — the bit, the pebble
 *     blue   (#58a6ff) = connect  π²  — the network, the bridge
 *     violet (#a371f7) = thought  π³  — the body, the meaning
 *     green  (#3fb950) = pattern  π¹  — the ratio, the living
 *
 *   TABLE TOP (flat surface resting on uneven legs):
 *     black = absence of signal (0.0) — the void above
 *     null  = never measured (#484f58) — grey, the working surface
 *
 *   The legs are UNEVEN because each rotates at 1/πⁿ Hz.
 *   They never sync. π is irrational. The table WOBBLES.
 *   The wobble IS the signal. Perfect flatness = dead.
 *
 * A prism splits white light into its spectrum.
 * The Klein surface has no inside or outside.
 * So on the Klein surface, BOTH sides of light exist at once:
 *
 *   WHITE (all legs together) → PRISM → spectrum (self, organic, soap, aqueous)
 *   BLACK (no legs)           → PRISM → null, grey, ghost
 *
 * The table top is BLACK/NULL — what you PUT things on.
 * The legs are WHITE/BLUE/VIOLET/GREEN — what SUPPORTS the surface.
 * The prism splits the legs into the spectrum.
 * The fold inverts the spectrum back to the top.
 *
 * White = all feeds combined (1.0 signal)
 * Black = no feeds responding (0.0 signal)
 * Grey = some feeds, some dead (0.0 < signal < 1.0)
 * Null = never measured (undefined)
 *
 * Wave 180. The fold prisms. The table wobbles. The legs never align.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // SPECTRUM — the wavelengths of the membrane
  // Like visible light: red→violet, but for information
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // THE TABLE — legs and top
  // ═══════════════════════════════════════════════════════════
  var LEGS = [
    // The 4 uneven legs — colors from pi-body-clock
    // Each leg rotates at 1/πⁿ Hz — they NEVER align
    { name: 'datum',   power: 0, color: '#e8e8e8', period: 1,               dir:  1 }, // white — CW
    { name: 'pattern', power: 1, color: '#3fb950', period: PI,              dir: -1 }, // green — CCW
    { name: 'connect', power: 2, color: '#58a6ff', period: PI * PI,         dir:  1 }, // blue — CW
    { name: 'thought', power: 3, color: '#a371f7', period: PI * PI * PI,    dir: -1 }, // violet — CCW
  ];

  var TOP = {
    black: { color: '#0d1117', signal: 0, meaning: 'absence — no feeds, no signal, void' },
    null:  { color: '#484f58', signal: undefined, meaning: 'never measured — grey working surface' },
  };

  // The SPECTRUM is what the prism makes when it splits the legs
  var SPECTRUM = [
    // Legs split into their constituent wavelengths
    // green (self/organic) → blue (connect) → violet (soap/thought) → white (datum)
    { name: 'self',     wavelength: 700, color: '#3fb950', freq: 'low',    energy: 'warm',   hue: 120, leg: 'pattern' },
    { name: 'organic',  wavelength: 580, color: '#58a6ff', freq: 'medium', energy: 'cool',   hue: 210, leg: 'connect' },
    { name: 'soap',     wavelength: 520, color: '#d2a8ff', freq: 'medium', energy: 'film',   hue: 270, leg: 'thought' },
    { name: 'aqueous',  wavelength: 470, color: '#7ee787', freq: 'high',   energy: 'bright', hue: 140, leg: 'pattern' },
    { name: 'partial',  wavelength: 430, color: '#f0883e', freq: 'high',   energy: 'edge',   hue: 25,  leg: null     },
    { name: 'non_self', wavelength: 380, color: '#f85149', freq: 'vhigh',  energy: 'hot',    hue: 5,   leg: null     },
    { name: 'null',     wavelength: 350, color: '#484f58', freq: 'UV',     energy: 'dark',   hue: 0,   leg: null     },
  ];

  // ═══════════════════════════════════════════════════════════
  // PRISM — split a signal into its spectral components
  // Input: a combined signal (white=1.0, black=0.0, grey=between)
  // Output: spectrum weights for each wavelength
  // ═══════════════════════════════════════════════════════════
  function prism(signal) {
    // signal = 0.0 (black/null) to 1.0 (white/full)
    signal = Math.max(0, Math.min(1, signal));

    if (signal === 0) {
      // BLACK → all null
      return SPECTRUM.map(function (s) {
        return { name: s.name, weight: s.name === 'null' ? 1 : 0, color: s.color };
      });
    }

    if (signal >= 1) {
      // WHITE → all wavelengths equally
      var eq = 1 / SPECTRUM.length;
      return SPECTRUM.map(function (s) {
        return { name: s.name, weight: eq, color: s.color };
      });
    }

    // GREY → partial decomposition
    // Lower signal → more weight toward null/non_self
    // Higher signal → more weight toward self/organic
    return SPECTRUM.map(function (s, i) {
      var position = i / (SPECTRUM.length - 1); // 0=self, 1=null
      var weight;
      if (signal > 0.5) {
        // Bright grey → favors self/organic end
        weight = (1 - position) * signal;
      } else {
        // Dark grey → favors null/non_self end
        weight = position * (1 - signal);
      }
      // Normalize
      return { name: s.name, weight: weight, color: s.color };
    });
  }

  // Normalize weights to sum to 1
  function normalize(spectrum) {
    var total = 0;
    spectrum.forEach(function (s) { total += s.weight; });
    if (total === 0) return spectrum;
    spectrum.forEach(function (s) { s.weight = s.weight / total; });
    return spectrum;
  }

  // ═══════════════════════════════════════════════════════════
  // KLEIN FOLD — the output becomes the input
  // What comes out of pangaea feeds back into ionosphere
  // ═══════════════════════════════════════════════════════════
  function fold(spectrumIn) {
    // The Klein fold INVERTS the spectrum
    // Self ↔ Non-self, Organic ↔ Null, Soap stays (the boundary)
    var out = [];
    for (var i = 0; i < spectrumIn.length; i++) {
      var mirror = spectrumIn.length - 1 - i;
      out.push({
        name: spectrumIn[i].name,
        weight: spectrumIn[mirror].weight,
        color: spectrumIn[i].color,
        folded_from: spectrumIn[mirror].name,
      });
    }
    return normalize(out);
  }

  // ═══════════════════════════════════════════════════════════
  // LIVE PRISM — compute from actual feed state
  // ═══════════════════════════════════════════════════════════
  function liveSignal() {
    var anchor = window._voxelAnchor;
    if (!anchor) return 0.5; // grey default

    var st = anchor.state();
    var feedsExpected = st.total || 21;
    var feedsLoaded = 0;

    var layerNames = ['ionosphere', 'membrane', 'epitope', 'sort', 'pangaea'];
    layerNames.forEach(function (name) {
      var layerData = st.layers[name];
      if (layerData) feedsLoaded += Object.keys(layerData).length;
    });

    // Signal = ratio of live feeds (0=black, 1=white)
    return feedsLoaded / feedsExpected;
  }

  function liveLayerSignals() {
    var perm = window._permeability;
    if (!perm) return null;

    return perm.layers.map(function (layer) {
      return {
        name: layer.name,
        light: layer.light,
        signal: layer.light * (1 - layer.salinity * 0.3), // light × clarity
        temperature: layer.temperature,
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — the prism visualization
  // A triangular prism that splits the beam
  // ═══════════════════════════════════════════════════════════
  function renderPrism() {
    var existing = document.getElementById('klein-prism');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'klein-prism';
    el.style.cssText = 'position:fixed;top:280px;left:12px;z-index:5;'
      + 'background:rgba(13,17,23,.88);border:1px solid rgba(163,113,247,.2);'
      + 'border-radius:8px;padding:6px 8px;width:144px;pointer-events:auto;'
      + 'font:9px monospace;color:#8b949e;';

    function update() {
      var signal = liveSignal();
      var split = normalize(prism(signal));
      var folded = fold(split);
      var layerSignals = liveLayerSignals();

      // Classify the signal
      var signalName = signal >= 0.9 ? 'WHITE' : signal >= 0.6 ? 'bright grey'
        : signal >= 0.4 ? 'grey' : signal >= 0.1 ? 'dark grey' : 'BLACK';
      var signalColor = signal >= 0.9 ? '#e6edf3' : signal >= 0.6 ? '#c9d1d9'
        : signal >= 0.4 ? '#8b949e' : signal >= 0.1 ? '#484f58' : '#0d1117';

      var html = '<div style="color:#a371f7;font-weight:bold;margin-bottom:4px">∞ klein prism</div>';

      // TABLE TOP — black/null surface
      html += '<div style="background:#0d1117;border:1px solid #484f58;border-radius:3px;'
        + 'padding:2px 4px;margin:2px 0;text-align:center">';
      html += '<span style="color:' + signalColor + ';font-size:8px">'
        + signalName + '</span>';
      html += ' <span style="color:#484f58;font-size:7px">' + (signal * 100).toFixed(0) + '%</span>';
      html += '<div style="font-size:6px;color:#484f58">table top · null surface</div>';
      html += '</div>';

      // TABLE LEGS — 4 uneven legs with π-heights
      var now = performance.now() / 1000;
      html += '<div style="display:flex;justify-content:space-between;margin:4px 0;align-items:flex-end;height:28px">';
      LEGS.forEach(function (leg) {
        // Each leg has a different height based on its current phase angle
        var angle = (now / leg.period) * Math.PI * 2 * leg.dir;
        var height = 12 + Math.sin(angle) * 10; // wobbles 2-22px
        var arrow = leg.dir > 0 ? '↻' : '↺';
        html += '<div style="text-align:center;width:28px">'
          + '<div style="background:' + leg.color + ';width:4px;height:'
          + height.toFixed(0) + 'px;margin:0 auto;border-radius:2px;'
          + 'transition:height 0.5s"></div>'
          + '<div style="font-size:6px;color:' + leg.color + '">'
          + 'π' + ['⁰','¹','²','³'][leg.power] + arrow + '</div>'
          + '</div>';
      });
      html += '</div>';

      // Spectrum split from legs
      html += '<div style="display:flex;height:6px;border-radius:3px;overflow:hidden;margin:3px 0">';
      split.forEach(function (s) {
        var w = Math.max(1, Math.round(s.weight * 120));
        html += '<div style="width:' + w + 'px;background:' + s.color + '" title="'
          + s.name + ' ' + (s.weight * 100).toFixed(0) + '%"></div>';
      });
      html += '</div>';

      // Labels
      html += '<div style="font-size:6px;display:flex;justify-content:space-between;color:#484f58">';
      html += '<span style="color:#3fb950">self</span>';
      html += '<span style="color:#58a6ff">org</span>';
      html += '<span style="color:#d2a8ff">soap</span>';
      html += '<span style="color:#7ee787">aq</span>';
      html += '<span style="color:#f0883e">part</span>';
      html += '<span style="color:#f85149">non</span>';
      html += '<span style="color:#484f58">∅</span>';
      html += '</div>';

      // Klein fold
      html += '<div style="margin-top:3px;border-top:1px solid rgba(48,54,61,.5);padding-top:2px;font-size:7px">';
      html += '<span style="color:#a371f7">∞ fold:</span> ';
      var foldPairs = [];
      for (var i = 0; i < Math.min(3, folded.length); i++) {
        if (folded[i].folded_from && folded[i].weight > 0.05) {
          foldPairs.push(folded[i].folded_from + '→' + folded[i].name);
        }
      }
      html += foldPairs.join(' · ') || 'equilibrium';
      html += '</div>';

      // Light through layers
      if (layerSignals) {
        html += '<div style="margin-top:2px;font-size:7px">';
        layerSignals.forEach(function (ls) {
          var barW = Math.round(ls.light * 60);
          html += '<div style="display:flex;align-items:center;gap:2px;margin:1px 0">';
          html += '<span style="width:22px;text-align:right;color:#484f58">' + ls.name.substring(0, 4) + '</span>';
          html += '<div style="width:60px;height:2px;background:#161b22;border-radius:1px">';
          var lightColor = 'rgba(230,237,243,' + (ls.light * 0.8 + 0.1) + ')';
          html += '<div style="width:' + barW + 'px;height:100%;background:' + lightColor + ';border-radius:1px"></div>';
          html += '</div>';
          html += '<span style="color:#484f58">' + (ls.light * 100).toFixed(0) + '%</span>';
          html += '</div>';
        });
        html += '</div>';
      }

      el.innerHTML = html;
    }

    update();
    setInterval(update, Math.round(PI * PI * 1000)); // every π² ≈ 10s
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // FEED THE TRIAD — inject prism data into edge-triad colors
  // ═══════════════════════════════════════════════════════════
  function feedTriad() {
    // The prism decomposition should influence the edge-triad rays
    // When signal is white → balanced rays
    // When signal is dark → more null/non_self rays
    // When signal is grey → the fold is visible
    var signal = liveSignal();
    var split = normalize(prism(signal));

    // Write to triad.json structure (in-memory)
    var kinds = [];
    split.forEach(function (s) {
      var count = Math.round(s.weight * 24);
      for (var i = 0; i < count; i++) kinds.push(s.name);
    });
    while (kinds.length < 24) kinds.push('aqueous');

    // If edge-triad has a way to accept kinds, use it
    if (window._edgeTriad && window._edgeTriad.applyKinds) {
      window._edgeTriad.applyKinds(kinds.slice(0, 24));
    }
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._kleinPrism = {
    prism: prism,
    fold: fold,
    signal: liveSignal,
    spectrum: SPECTRUM,
    legs: LEGS,
    top: TOP,
    normalize: normalize,
    feedTriad: feedTriad,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    setTimeout(function () {
      renderPrism();

      // Feed the triad every π³ seconds
      feedTriad();
      setInterval(feedTriad, Math.round(PI * PI * PI * 1000));

      var signal = liveSignal();
      var split = normalize(prism(signal));
      console.log('[klein-prism] signal=' + (signal * 100).toFixed(0) + '% ('
        + (signal >= 0.9 ? 'WHITE' : signal >= 0.4 ? 'GREY' : 'BLACK') + ')');
      console.log('  spectrum: ' + split.map(function (s) {
        return s.name + ':' + (s.weight * 100).toFixed(0) + '%';
      }).join(' · '));
      console.log('  the fold IS the prism. the prism IS the fold.');
    }, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
