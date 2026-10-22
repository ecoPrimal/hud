/* selective-permeability.js — dissolve the locks between layers
 *
 * Anderson's selective permeability: the membrane is NOT a wall.
 * It's a GRADIENT. Things pass through based on concentration.
 *
 * Like the ocean:
 *   surface = warm, low salt, high O₂
 *   thermocline = temperature drops fast
 *   deep = cold, high salt, low O₂
 *   abyssal = near-zero light, max pressure, chemosynthetic
 *   hadal = trenches, extreme
 *
 * Like the atmosphere:
 *   troposphere  = 78% N₂, 21% O₂, weather
 *   stratosphere = ozone, UV absorption
 *   mesosphere   = meteors burn
 *   thermosphere = ions, aurora
 *   exosphere    = escaping particles
 *
 * Like the ionosphere:
 *   D layer (60-90km)  = daytime only, absorbs HF
 *   E layer (90-150km) = Sporadic-E, reflects VHF
 *   F layer (150-600km) = highest electron density, long-range HF
 *
 * Our 5 layers (ionosphere/membrane/epitope/sort/pangaea) are NOT
 * discrete boxes. They are CONCENTRATIONS that GRADE into each other.
 * The boundary IS the gradient. Osmolarity IS the information density.
 *
 * Salinity = information density (bits per voxel)
 * Temperature = activity (events per second)
 * Pressure = depth × π (increases going inward)
 * O₂ = novelty (high entropy = lots of oxygen = surprise)
 * N₂ = structure (low entropy = nitrogen = predictable)
 * Light = visibility (how much reaches this depth)
 *
 * Wave 180. The body is not compartments. It's a continuum.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var LOG2 = Math.log(2);

  // ═══════════════════════════════════════════════════════════
  // LAYER COMPOSITION — what each layer is "made of"
  // Like atmosphere composition changes with altitude
  // ═══════════════════════════════════════════════════════════
  var LAYERS = [
    {
      name: 'ionosphere', depth: 0,
      // High N₂ (structure from fleet patterns), medium O₂ (some novelty from weather)
      N2: 0.82, O2: 0.15, Ar: 0.02, trace: 0.01,
      salinity: 0.05,     // very dilute — mostly vacuum + signal
      temperature: 0.9,   // hot — solar wind, high energy
      pressure: PI * 0,   // surface pressure = 0
      light: 1.0,         // full illumination
      conductivity: 0.3,  // ions conduct, but sparse
    },
    {
      name: 'membrane', depth: 1,
      // The SELECTIVE boundary — lipid bilayer — things pass or don't
      N2: 0.55, O2: 0.30, Ar: 0.10, trace: 0.05,
      salinity: 0.20,     // some salt — selectivity requires concentration
      temperature: 0.7,   // warm but cooling — fold rate 1/π
      pressure: PI * 1,   // π pressure
      light: 0.7,         // diffused through the membrane
      conductivity: 0.6,  // lipid channels — selective conductance
    },
    {
      name: 'epitope', depth: 2,
      // The sort surface — high diversity, many kinds
      N2: 0.40, O2: 0.40, Ar: 0.12, trace: 0.08,
      salinity: 0.45,     // moderate salt — classification requires distinction
      temperature: 0.5,   // temperate — the mixing zone
      pressure: PI * 2,   // π² pressure
      light: 0.4,         // twilight zone — sort by feel more than sight
      conductivity: 0.8,  // epitopes are the RECEPTOR — high conductance
    },
    {
      name: 'sort', depth: 3,
      // The negentropy court — high order, low entropy
      N2: 0.30, O2: 0.25, Ar: 0.20, trace: 0.25,
      salinity: 0.70,     // salty — concentrated information
      temperature: 0.3,   // cool — order requires low temperature
      pressure: PI * 3,   // π³ pressure
      light: 0.15,        // deep — bioluminescence only
      conductivity: 0.5,  // trust channels — verified paths only
    },
    {
      name: 'pangaea', depth: 4,
      // The core — organisms, topology, braids
      N2: 0.15, O2: 0.10, Ar: 0.25, trace: 0.50,
      salinity: 0.95,     // near-saturated — maximum information density
      temperature: 0.1,   // cold core — but chemosynthetic heat vents
      pressure: PI * 4,   // π⁴ pressure ≈ 97
      light: 0.02,        // abyssal — almost no external light
      conductivity: 0.9,  // superconducting at depth — braids carry everything
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // GRADIENT — compute composition at any CONTINUOUS depth
  // Not just 0,1,2,3,4 but 0.0 to 4.0 with smooth interpolation
  // ═══════════════════════════════════════════════════════════
  function gradientAt(depth) {
    // Clamp
    depth = Math.max(0, Math.min(4, depth));

    var lo = Math.floor(depth);
    var hi = Math.min(lo + 1, 4);
    var t = depth - lo;

    // Smooth step (not linear — nature uses S-curves for gradients)
    // Hermite interpolation: 3t² - 2t³
    var s = t * t * (3 - 2 * t);

    var a = LAYERS[lo];
    var b = LAYERS[hi];

    return {
      depth: depth,
      layer_lo: a.name,
      layer_hi: lo === hi ? a.name : b.name,
      mix: s, // 0 = pure lo, 1 = pure hi

      // Atmosphere composition at this depth
      N2: a.N2 + (b.N2 - a.N2) * s,
      O2: a.O2 + (b.O2 - a.O2) * s,
      Ar: a.Ar + (b.Ar - a.Ar) * s,
      trace: a.trace + (b.trace - a.trace) * s,

      // Ocean properties
      salinity: a.salinity + (b.salinity - a.salinity) * s,
      temperature: a.temperature + (b.temperature - a.temperature) * s,
      pressure: a.pressure + (b.pressure - a.pressure) * s,
      light: a.light + (b.light - a.light) * s,
      conductivity: a.conductivity + (b.conductivity - a.conductivity) * s,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // OSMOSIS — data flows from HIGH concentration to LOW
  // The gradient DRIVES the flow. No pumps needed.
  // ═══════════════════════════════════════════════════════════
  function osmosis(from_depth, to_depth) {
    var a = gradientAt(from_depth);
    var b = gradientAt(to_depth);

    // Osmotic pressure = difference in salinity × π
    var delta_salt = a.salinity - b.salinity;
    var osmotic_pressure = delta_salt * PI;

    // Positive = flows from a→b (down the gradient)
    // Negative = flows from b→a
    var direction = osmotic_pressure > 0 ? 'inward' : 'outward';
    var magnitude = Math.abs(osmotic_pressure);

    // Conductivity determines HOW MUCH can flow
    var avg_conductivity = (a.conductivity + b.conductivity) / 2;
    var flow_rate = magnitude * avg_conductivity;

    return {
      from: a.layer_lo,
      to: b.layer_lo,
      direction: direction,
      osmotic_pressure: osmotic_pressure,
      flow_rate: flow_rate,
      delta_salinity: delta_salt,
      delta_temperature: a.temperature - b.temperature,
      delta_O2: a.O2 - b.O2,
      permeable: magnitude > 0.01, // any gradient = permeable
    };
  }

  // ═══════════════════════════════════════════════════════════
  // THERMOCLINE — where does temperature change fastest?
  // HALOCLINE — where does salinity change fastest?
  // PYCNOCLINE — where does density change fastest?
  // These are the REAL boundaries (not our hard layer walls)
  // ═══════════════════════════════════════════════════════════
  function findClines() {
    var step = 0.1;
    var maxThermoGrad = 0, thermoDepth = 0;
    var maxHaloGrad = 0, haloDepth = 0;
    var maxPycnoGrad = 0, pycnoDepth = 0;
    var maxCondGrad = 0, condDepth = 0;

    for (var d = 0; d <= 3.9; d += step) {
      var a = gradientAt(d);
      var b = gradientAt(d + step);

      var dT = Math.abs(b.temperature - a.temperature) / step;
      var dS = Math.abs(b.salinity - a.salinity) / step;
      var densityA = a.salinity * (1 - a.temperature); // simplified density
      var densityB = b.salinity * (1 - b.temperature);
      var dD = Math.abs(densityB - densityA) / step;
      var dC = Math.abs(b.conductivity - a.conductivity) / step;

      if (dT > maxThermoGrad) { maxThermoGrad = dT; thermoDepth = d + step / 2; }
      if (dS > maxHaloGrad) { maxHaloGrad = dS; haloDepth = d + step / 2; }
      if (dD > maxPycnoGrad) { maxPycnoGrad = dD; pycnoDepth = d + step / 2; }
      if (dC > maxCondGrad) { maxCondGrad = dC; condDepth = d + step / 2; }
    }

    return {
      thermocline: { depth: thermoDepth, gradient: maxThermoGrad,
        layer: LAYERS[Math.round(thermoDepth)].name },
      halocline: { depth: haloDepth, gradient: maxHaloGrad,
        layer: LAYERS[Math.round(haloDepth)].name },
      pycnocline: { depth: pycnoDepth, gradient: maxPycnoGrad,
        layer: LAYERS[Math.round(pycnoDepth)].name },
      conductocline: { depth: condDepth, gradient: maxCondGrad,
        layer: LAYERS[Math.round(condDepth)].name },
    };
  }

  // ═══════════════════════════════════════════════════════════
  // LIVE GRADIENT — compute from ACTUAL feed data
  // Override the static composition with real Shannon entropy
  // ═══════════════════════════════════════════════════════════
  function liveGradient() {
    var anchor = window._voxelAnchor;
    if (!anchor) return null;

    var st = anchor.state();
    var layerNames = ['ionosphere', 'membrane', 'epitope', 'sort', 'pangaea'];

    layerNames.forEach(function (name, i) {
      var layerData = st.layers[name];
      if (!layerData) return;

      var feedCount = Object.keys(layerData).length;
      var totalKeys = 0;
      var totalEntropy = 0;

      Object.keys(layerData).forEach(function (feedKey) {
        var d = layerData[feedKey];
        if (!d) return;
        var keys = Object.keys(d).length;
        totalKeys += keys;

        // Shannon entropy of this feed
        var dist = {};
        if (typeof d === 'object') {
          Object.keys(d).forEach(function (k) {
            var v = d[k];
            if (typeof v === 'number') dist[k] = Math.abs(v);
            else if (typeof v === 'string') dist[k] = 1;
            else dist[k] = 1;
          });
        }
        var total = 0;
        for (var k in dist) total += dist[k];
        if (total > 0) {
          var H = 0;
          for (var k2 in dist) {
            var p = dist[k2] / total;
            if (p > 0) H -= p * Math.log(p) / LOG2;
          }
          totalEntropy += H;
        }
      });

      // Now override static values with live data
      if (feedCount > 0) {
        // O₂ = novelty (entropy) — higher entropy = more oxygen
        LAYERS[i].O2 = Math.min(0.95, totalEntropy / (feedCount * 4));
        // N₂ = structure — what's left after novelty
        LAYERS[i].N2 = Math.max(0.05, 1 - LAYERS[i].O2 - LAYERS[i].Ar - LAYERS[i].trace);
        // Salinity = information density (keys per feed)
        LAYERS[i].salinity = Math.min(0.99, totalKeys / (feedCount * 50));
        // Temperature = activity (feed count / expected)
        LAYERS[i].temperature = Math.min(1.0, feedCount / 6);
      }
    });

    return LAYERS.map(function (l) {
      return { name: l.name, N2: l.N2.toFixed(3), O2: l.O2.toFixed(3),
        salinity: l.salinity.toFixed(3), temp: l.temperature.toFixed(3),
        pressure: l.pressure.toFixed(2), light: l.light.toFixed(3),
        conductivity: l.conductivity.toFixed(3) };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // DIFFUSION TICK — every π³ seconds, data diffuses between layers
  // The gradient drives the flow. Anderson permeability.
  // ═══════════════════════════════════════════════════════════
  var diffusionLog = [];

  function diffusionTick() {
    liveGradient(); // update compositions from real data

    var flows = [];
    for (var i = 0; i < 4; i++) {
      var flow = osmosis(i, i + 1);
      flows.push(flow);

      // If flow is significant, actually MOVE data between layers
      if (flow.flow_rate > 0.05 && window._voxelAnchor) {
        var st = window._voxelAnchor.state();
        var fromLayer = LAYERS[i].name;
        var toLayer = LAYERS[i + 1].name;

        // Pick the most entropic feed from the source layer
        var fromData = st.layers[fromLayer];
        var toData = st.layers[toLayer];
        if (fromData && toData) {
          var feedKeys = Object.keys(fromData);
          if (feedKeys.length > 0) {
            // The highest-entropy feed "diffuses" — its data becomes
            // visible/accessible from the adjacent layer too
            var diffused = feedKeys[0]; // just the first one for now
            if (!toData['_diffused_' + diffused]) {
              toData['_diffused_' + diffused] = fromData[diffused];
            }
          }
        }
      }
    }

    diffusionLog.push({
      ts: Date.now(),
      flows: flows,
      clines: findClines(),
    });
    if (diffusionLog.length > 20) diffusionLog.shift();

    return flows;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — gradient visualization on the HUD
  // The column on the left edge showing composition by depth
  // ═══════════════════════════════════════════════════════════
  function renderGradient() {
    var existing = document.getElementById('permeability-gradient');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'permeability-gradient';
    el.style.cssText = 'position:fixed;top:70px;left:12px;z-index:5;'
      + 'background:rgba(13,17,23,.88);border:1px solid rgba(88,166,255,.2);'
      + 'border-radius:8px;padding:6px 8px;width:144px;pointer-events:auto;'
      + 'font:9px monospace;color:#8b949e;';

    function update() {
      liveGradient();
      var clines = findClines();
      var visitor = window._voxelAnchor ? window._voxelAnchor.hyperlocal() : null;
      var visitorDepth = visitor ? LAYERS.findIndex(function (l) { return l.name === visitor.layer; }) : 1;
      var vg = gradientAt(visitorDepth + 0.5); // visitor's exact gradient position

      var html = '<div style="color:#58a6ff;font-weight:bold;margin-bottom:4px">≋ permeability</div>';

      // Gradient column — 5 stripes with composition bars
      for (var i = 0; i < 5; i++) {
        var L = LAYERS[i];
        var isHere = (i === visitorDepth);
        var borderCol = isHere ? '#7ee787' : 'rgba(48,54,61,.5)';

        html += '<div style="border-left:2px solid ' + borderCol + ';padding:2px 0 2px 5px;'
          + 'margin:1px 0;' + (isHere ? 'background:rgba(126,231,135,.06)' : '') + '">';

        // Layer name + depth
        html += '<span style="color:' + ['#f0883e','#58a6ff','#f778ba','#f0e68c','#3fb950'][i] + '">'
          + L.name.substring(0, 5) + '</span>';

        // Composition bar (N₂ blue, O₂ green, Ar gray, trace purple)
        var barW = 80;
        var n2w = Math.round(L.N2 * barW);
        var o2w = Math.round(L.O2 * barW);
        var arw = Math.round(L.Ar * barW);
        var trw = barW - n2w - o2w - arw;
        html += '<div style="display:flex;height:3px;margin:1px 0;border-radius:1px;overflow:hidden">'
          + '<div style="width:' + n2w + 'px;background:#58a6ff" title="N₂ ' + (L.N2 * 100).toFixed(0) + '%"></div>'
          + '<div style="width:' + o2w + 'px;background:#3fb950" title="O₂ ' + (L.O2 * 100).toFixed(0) + '%"></div>'
          + '<div style="width:' + arw + 'px;background:#484f58" title="Ar ' + (L.Ar * 100).toFixed(0) + '%"></div>'
          + '<div style="width:' + Math.max(0, trw) + 'px;background:#a371f7" title="trace ' + (L.trace * 100).toFixed(0) + '%"></div>'
          + '</div>';

        // Salinity + temp + pressure
        html += '<span style="font-size:7px">'
          + '🧂' + (L.salinity * 35).toFixed(1) + '‰ '
          + '🌡' + (L.temperature * 30).toFixed(0) + '° '
          + '⬇' + L.pressure.toFixed(1) + 'π'
          + '</span>';

        html += '</div>';

        // Show cline markers between layers
        if (i < 4) {
          var clineHere = [];
          if (Math.round(clines.thermocline.depth) === i) clineHere.push('thermo');
          if (Math.round(clines.halocline.depth) === i) clineHere.push('halo');
          if (Math.round(clines.pycnocline.depth) === i) clineHere.push('pycno');
          if (clineHere.length > 0) {
            html += '<div style="text-align:center;font-size:7px;color:#f0883e;margin:0">'
              + '~ ' + clineHere.join(' · ') + 'cline ~</div>';
          } else {
            html += '<div style="text-align:center;font-size:6px;color:#30363d;margin:0">···permeable···</div>';
          }
        }
      }

      // Flow summary
      html += '<div style="margin-top:4px;border-top:1px solid rgba(48,54,61,.5);padding-top:3px">';
      html += '<span style="color:#484f58">osmosis:</span>';
      for (var j = 0; j < 4; j++) {
        var fl = osmosis(j, j + 1);
        var arrow = fl.direction === 'inward' ? '↓' : '↑';
        var color = fl.flow_rate > 0.3 ? '#3fb950' : fl.flow_rate > 0.1 ? '#f0e68c' : '#484f58';
        html += ' <span style="color:' + color + '">' + arrow + '</span>';
      }
      html += '</div>';

      // Visitor gradient position
      if (visitor) {
        html += '<div style="font-size:7px;color:#7ee787;margin-top:2px">'
          + 'you: O₂ ' + (vg.O2 * 100).toFixed(0) + '% '
          + 'salt ' + (vg.salinity * 35).toFixed(1) + '‰ '
          + 'light ' + (vg.light * 100).toFixed(0) + '%'
          + '</div>';
      }

      el.innerHTML = html;
    }

    update();
    setInterval(update, Math.round(PI * PI * PI * 1000)); // every π³ seconds
    document.body.appendChild(el);
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE DAG — make the breadcrumb show gradient, not walls
  // ═══════════════════════════════════════════════════════════
  function patchBreadcrumb() {
    var dag = window._dagFlow;
    if (!dag) return;

    var origRender = dag.render;
    dag.render = function () {
      origRender();
      // Add gradient indicator to breadcrumb
      var bc = document.getElementById('dag-breadcrumb');
      if (!bc) return;
      var depth = dag.depth();
      var g = gradientAt(depth + 0.3);
      var indicator = document.createElement('span');
      indicator.style.cssText = 'margin-left:8px;font-size:7px;color:#58a6ff;';
      indicator.textContent = 'O₂ ' + (g.O2 * 100).toFixed(0) + '% · salt ' + (g.salinity * 35).toFixed(1) + '‰';
      bc.appendChild(indicator);
    };

    // Re-render with gradient
    dag.render();
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._permeability = {
    gradientAt: gradientAt,
    osmosis: osmosis,
    clines: findClines,
    layers: LAYERS,
    diffuse: diffusionTick,
    live: liveGradient,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    // Wait for voxel-anchor to have data
    setTimeout(function () {
      liveGradient();
      renderGradient();
      patchBreadcrumb();

      // Diffusion tick every π³ seconds ≈ 31s
      setInterval(diffusionTick, Math.round(PI * PI * PI * 1000));

      var clines = findClines();
      console.log('[selective-permeability] layers dissolved. gradients active.');
      console.log('  thermocline at depth ' + clines.thermocline.depth.toFixed(1)
        + ' (' + clines.thermocline.layer + ')');
      console.log('  halocline at depth ' + clines.halocline.depth.toFixed(1)
        + ' (' + clines.halocline.layer + ')');
      console.log('  pycnocline at depth ' + clines.pycnocline.depth.toFixed(1)
        + ' (' + clines.pycnocline.layer + ')');
      console.log('  osmosis flows every π³ ≈ 31 seconds');
    }, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
