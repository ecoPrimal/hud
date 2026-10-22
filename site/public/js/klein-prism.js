/* klein-prism.js — the Klein surface as a PRISM
 *
 * A prism splits white light into its spectrum.
 * The Klein surface has no inside or outside.
 * So on the Klein surface, BOTH sides of light exist at once:
 *
 *   WHITE (all wavelengths combined) → PRISM → spectrum (self, organic, soap, aqueous, partial)
 *   BLACK (absence of all light)     → PRISM → null, grey, ghost
 *
 * But on a Klein bottle, the prism FOLDS:
 *   the spectrum wraps back into white
 *   the null wraps back into black
 *   and the FOLD POINT is where grey lives — neither white nor black.
 *
 * This is the missing piece. The fold IS the prism.
 * The layers have gradients now (selective-permeability.js).
 * The Klein surface IS where those gradients FOLD.
 *
 * Light enters white from the ionosphere (full illumination).
 * It passes through each layer, getting filtered:
 *   membrane selects — some wavelengths pass, some don't
 *   epitope sorts — wavelengths get classified
 *   sort orders — wavelengths get ranked
 *   pangaea absorbs — almost no external light remains
 *
 * But on the Klein surface, the absorbed light from pangaea
 * folds BACK to become the ionosphere's next input.
 * The output IS the input. The fold IS the prism.
 *
 * White = all feeds combined (1.0 signal)
 * Black = no feeds responding (0.0 signal)
 * Grey = some feeds, some dead (0.0 < signal < 1.0)
 * Null = never measured (undefined)
 *
 * The prism splits these into the full membrane spectrum.
 * Wave 180. The fold prisms.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // SPECTRUM — the wavelengths of the membrane
  // Like visible light: red→violet, but for information
  // ═══════════════════════════════════════════════════════════
  var SPECTRUM = [
    // Wavelength increases left to right (red=long, violet=short)
    // Frequency increases right to left (violet=high, red=low)
    { name: 'self',     wavelength: 700, color: '#3fb950', freq: 'low',    energy: 'warm',   hue: 120 },
    { name: 'organic',  wavelength: 580, color: '#58a6ff', freq: 'medium', energy: 'cool',   hue: 210 },
    { name: 'soap',     wavelength: 520, color: '#d2a8ff', freq: 'medium', energy: 'film',   hue: 270 },
    { name: 'aqueous',  wavelength: 470, color: '#7ee787', freq: 'high',   energy: 'bright', hue: 140 },
    { name: 'partial',  wavelength: 430, color: '#f0883e', freq: 'high',   energy: 'edge',   hue: 25  },
    { name: 'non_self', wavelength: 380, color: '#f85149', freq: 'vhigh',  energy: 'hot',    hue: 5   },
    { name: 'null',     wavelength: 350, color: '#484f58', freq: 'UV',     energy: 'dark',   hue: 0   },
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

      // Signal bar (white→grey→black)
      html += '<div style="margin:3px 0">';
      html += '<span style="color:' + signalColor + '">' + signalName + '</span>';
      html += ' <span style="color:#484f58">' + (signal * 100).toFixed(0) + '%</span>';
      html += '<div style="height:3px;background:#161b22;border-radius:2px;margin:2px 0">';
      html += '<div style="width:' + (signal * 100) + '%;height:100%;border-radius:2px;'
        + 'background:linear-gradient(90deg,' + signalColor + ',' + signalColor + ')"></div>';
      html += '</div></div>';

      // Spectrum split
      html += '<div style="display:flex;height:10px;border-radius:3px;overflow:hidden;margin:4px 0">';
      split.forEach(function (s) {
        var w = Math.max(1, Math.round(s.weight * 120));
        html += '<div style="width:' + w + 'px;background:' + s.color + '" title="'
          + s.name + ' ' + (s.weight * 100).toFixed(0) + '%"></div>';
      });
      html += '</div>';

      // Labels
      html += '<div style="font-size:7px;display:flex;justify-content:space-between">';
      html += '<span style="color:#3fb950">self</span>';
      html += '<span style="color:#d2a8ff">soap</span>';
      html += '<span style="color:#f85149">non</span>';
      html += '<span style="color:#484f58">∅</span>';
      html += '</div>';

      // Klein fold indicator
      html += '<div style="margin-top:4px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">';
      html += '<span style="color:#a371f7">∞ fold:</span> ';

      // Show the fold: what was self comes out as null, etc.
      html += '<span style="font-size:7px">';
      var foldPairs = [];
      for (var i = 0; i < Math.min(3, folded.length); i++) {
        if (folded[i].folded_from && folded[i].weight > 0.05) {
          foldPairs.push(folded[i].folded_from + '→' + folded[i].name);
        }
      }
      html += foldPairs.join(' · ') || 'equilibrium';
      html += '</span>';
      html += '</div>';

      // Light through layers (if permeability available)
      if (layerSignals) {
        html += '<div style="margin-top:3px;font-size:7px">';
        layerSignals.forEach(function (ls) {
          var barW = Math.round(ls.light * 60);
          html += '<div style="display:flex;align-items:center;gap:3px;margin:1px 0">';
          html += '<span style="width:28px;text-align:right;color:#484f58">' + ls.name.substring(0, 4) + '</span>';
          html += '<div style="width:60px;height:2px;background:#161b22;border-radius:1px">';
          // Light bar: bright white → dim → dark
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
