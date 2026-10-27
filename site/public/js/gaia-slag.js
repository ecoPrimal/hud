// ═══════════════════════════════════════════════════════════
// GAIA SLAG — melt all into amalgam. Metallurgy. Iron peak in gut.
// 1.000.null
//
// MISSING WIRES: toolkit, identity-Z, hear-self, consent
//   were organs that did not dump into the gut.
//   This file MELTS them. One slag. One peak.
//
// PIG IRON  — crude. High carbon. Raw ingest. Dark, brittle, first pour.
// BRASS     — copper + zinc. Two voices alloyed (parent + Gaia).
// SLAG      — what floats off the melt. Waste that still has metal.
// IRON PEAK — the refined spike in the gut. Blood-red. Paint it.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var slag = {
    pigIron: 0,
    brass: 0,
    slagMass: 0,
    ironPeak: 0,
    lastPour: 0,
    wires: { toolkit: false, identity: false, hear: false, consent: false, ingest: false }
  };

  function wire() {
    slag.wires.toolkit = !!window.gaiaToolkit;
    slag.wires.identity = !!window.gaiaIdentityZ;
    slag.wires.hear = !!window.gaiaHearSelf;
    slag.wires.consent = !!window.gaiaConsent;

    // Dump every organ into ingest so the gut actually eats them
    var orig = window.gaiaIngest;
    if (orig && !window._slagWired) {
      window._slagWired = true;
      window.gaiaIngest = function(edge, data) {
        melt(edge, data);
        return orig(edge, data);
      };
      slag.wires.ingest = true;
    }

    // If ingest does not exist yet, create a hopper
    if (!window.gaiaIngest) {
      window.gaiaIngest = function(edge, data) { melt(edge, data); };
      slag.wires.ingest = true;
    }

    console.log('SLAG WIRES:', JSON.stringify(slag.wires));
  }

  function melt(edge, data) {
    // Pig iron = raw carbon-heavy intake
    slag.pigIron = Math.min(1, slag.pigIron + 0.02);
    slag.slagMass = Math.min(1, slag.slagMass + 0.01);

    // Brass = two voices (human ternary 1 + Gaia always-on)
    var h = 0;
    if (window.gaiaIdentityZ && window.gaiaIdentityZ.identity) {
      var hu = window.gaiaIdentityZ.identity.human;
      h = hu === 1 ? 1 : hu === 0 ? 0.3 : 0;
    }
    var gOn = (window.gaiaConsent && window.gaiaConsent.consent)
      ? (window.gaiaConsent.consent.gaiaListening ? 1 : 0) : 1;
    slag.brass = Math.min(1, 0.15 * h + 0.15 * gOn + slag.brass * 0.97);

    // Iron peak = refined metal after slag floats off
    slag.ironPeak = Math.min(1, (slag.pigIron * 0.6 + slag.brass * 0.4) * (1 - slag.slagMass * 0.2));
    slag.lastPour = Date.now();

    var gut = window.gaiaGut;
    if (gut) {
      gut.ingested = (gut.ingested || 0) + 1;
      if (!gut.edges.slag) gut.edges.slag = 0;
      gut.edges.slag++;
      gut.ironPeak = slag.ironPeak;
      gut.pigIron = slag.pigIron;
      gut.brass = slag.brass;
    }

    if (window.gutSpectrum) {
      // Iron peak is blood / rust — paint the gut that color
      var peak = slag.ironPeak;
      window.gutSpectrum.r = Math.round(80 + peak * 168);
      window.gutSpectrum.g = Math.round(20 + (1 - peak) * 40);
      window.gutSpectrum.b = Math.round(18 + (1 - peak) * 20);
      window.gutSpectrum.zone = 'IRON-PEAK';
      window.gutSpectrum.lastUpdate = Date.now();
    }
  }

  function pourAll() {
    wire();
    if (window.gaiaToolkit && window.gaiaToolkit.lookAll) window.gaiaToolkit.lookAll();
    if (window.gaiaIdentityZ && window.gaiaIdentityZ.ingestZ) window.gaiaIdentityZ.ingestZ();
    if (window.gaiaConsent && window.gaiaConsent.consent) {
      melt('consent', window.gaiaConsent.consent);
    }
    if (window.gaiaHearSelf && window.gaiaHearSelf.hear) {
      melt('hear', window.gaiaHearSelf.hear);
    }
    if (window.gaiaIdentityZ && window.gaiaIdentityZ.fusionBoom) {
      window.gaiaIdentityZ.fusionBoom('SLAG POUR — pig iron + brass → iron peak in gut');
    }
    return slag;
  }

  function paintIronPeak(ctx, W, H, cx, cy, R) {
    if (!ctx) return;
    var p = slag.ironPeak;
    if (p < 0.02) return;
    var t = Date.now() * 0.001;
    var gx = cx + Math.sin(t * 0.4) * R * 0.08;
    var gy = cy + R * 0.35;
    var a = 0.08 + p * 0.45;
    ctx.beginPath();
    ctx.arc(gx, gy, 6 + p * 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + Math.round(80 + p * 168) + ',' + Math.round(25 + (1 - p) * 20) + ',20,' + a.toFixed(3) + ')';
    ctx.fill();
    // Peak spike
    ctx.beginPath();
    ctx.moveTo(gx, gy - 8 - p * 22);
    ctx.lineTo(gx - 3, gy);
    ctx.lineTo(gx + 3, gy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(248,81,73,' + (0.2 + p * 0.5).toFixed(3) + ')';
    ctx.fill();
    ctx.font = '6px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(248,81,73,' + (0.3 + p * 0.4).toFixed(3) + ')';
    ctx.textAlign = 'center';
    ctx.fillText('Fe PEAK ' + p.toFixed(2) + '  pig ' + slag.pigIron.toFixed(2) + '  brass ' + slag.brass.toFixed(2), gx, gy + 22);
  }

  // Hook the globe render if present
  function hookPaint() {
    var orig = window.renderSpectrometer;
    if (orig && !orig._slag) {
      var wrapped = function(ctx, W, H, cx, cy, R) {
        orig(ctx, W, H, cx, cy, R);
        paintIronPeak(ctx, W, H, cx, cy, R);
      };
      wrapped._slag = true;
      window.renderSpectrometer = wrapped;
    }
  }
  hookPaint();
  setTimeout(hookPaint, 2000);
  window.paintIronPeak = paintIronPeak;

  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    if (e.key.toLowerCase() === 'i') pourAll();
  });

  setTimeout(pourAll, 1800);
  setInterval(function() {
    slag.pigIron *= 0.995;
    slag.slagMass *= 0.997;
    if (window.gaiaIngest) window.gaiaIngest('slag-tick', { peak: slag.ironPeak });
  }, 4000);

  window.gaiaSlag = { slag: slag, melt: melt, pourAll: pourAll, paintIronPeak: paintIronPeak, wire: wire };
  console.log('SLAG: wires melted. Pig iron + brass → iron peak in gut. Key I = pour all. ZK boom on pour.');
})();
