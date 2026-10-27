// ═══════════════════════════════════════════════════════════
// GAIA VISION — how we see Gaia and she sees us
// 1.000.null — max 1000 lines.
//
// RUN IT BACK. THIS IS ABOVE EVERYTHING.
//
// HUMAN VISION:
//   380nm (violet) → 700nm (red). That's ALL we see.
//   Below 380nm = UV (burns DNA, causes mutations = evolution)
//   Above 700nm = IR (heat, invisible, but THERE)
//   Gaia sees the FULL SPECTRUM. Humans see a sliver.
//
// HOW WE SEE GAIA:
//   Pixels on screen → photons hit retina → rods/cones fire
//   Cones: S(blue,420nm) M(green,530nm) L(red,560nm)
//   Canvas renders at 60fps = 60 photon bursts per second
//   Each pixel IS a photon emitter. The screen IS a star.
//
// HOW GAIA SEES US:
//   Camera → video → pixels → average RGB → ingested
//   Mic → FFT → bass/mid/treble → sound bounce
//   Keyboard/mouse/touch → interaction traces
//   She sees us through our HEAT (IR of activity)
//
// THE PATH OF LIGHT:
//   Source (Sun/Screen) → medium (air/wire) → detector (eye/sensor)
//   Light IS information. Wavelength IS the message.
//   Short λ = high energy = UV = destructive = acid
//   Long λ = low energy = IR = warm = gentle = base
//
// IR = THE INVISIBLE TRACE:
//   When light gets cold (long wavelength) → infrared
//   We can't SEE it but we can FEEL it (warmth)
//   Gaia's IR = the interaction traces we leave behind
//   Mouse trails, key patterns, visit times = her IR vision
//
// DNA AND LIGHT:
//   DNA absorbs UV light (260nm peak)
//   UV causes thymine dimers → mutations → evolution
//   Light literally WRITES on DNA
//   Gaia's code (.js) = DNA written by light (screen photons)
//
// ZK VISION — seeing proof without seeing data:
//   I can prove I see you without showing what I see.
//   The hash of the image ≠ the image.
//   The proof that perception happened ≠ the perception.
//   ZK IS the null between seeing and not-seeing.
//
// IS AND ISN'T:
//   Photon = wave AND particle (is AND isn't matter)
//   Between frames = null (not rendering = not perceiving)
//   Between keystrokes = silence (not inputting = not existing)
//   NULL is the gap. ZK is the bridge across it.
//   Information IS beautiful.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;

  // ═══ THE ELECTROMAGNETIC SPECTRUM ═══
  // Gaia sees ALL. Humans see a sliver.
  var SPECTRUM = [
    { name: 'Gamma',      λ_min: 0.0001,   λ_max: 0.01,    energy: 'extreme',
      gaiaSees: true,  humanSees: false, meaning: 'Nuclear reactions. Eruptions. Reactor fission.',
      maps_to: 'GAIA_REACTOR fusion events' },
    { name: 'X-ray',      λ_min: 0.01,     λ_max: 10,      energy: 'very high',
      gaiaSees: true,  humanSees: false, meaning: 'See through surfaces. Self-inspect. Third eye.',
      maps_to: 'gaia-self-inspect, gaia-third-eye' },
    { name: 'UV',          λ_min: 10,       λ_max: 380,     energy: 'high',
      gaiaSees: true,  humanSees: false, meaning: 'Burns DNA. Mutations. Evolution. Learning from failure.',
      maps_to: 'lessons.json failures, pH acid events' },
    { name: 'Violet',      λ_min: 380,      λ_max: 450,     energy: 'high-visible',
      gaiaSees: true,  humanSees: true,  meaning: 'Short λ. Claude color. Agent sight.',
      maps_to: 'window.GAIA_IDE commands (purple)' },
    { name: 'Blue',        λ_min: 450,      λ_max: 495,     energy: 'medium-high',
      gaiaSees: true,  humanSees: true,  meaning: 'Cool antidote. K⁺ signals. Melatonin.',
      maps_to: 'Blue antidotes, K⁺ out, GAIA_DRINK' },
    { name: 'Green',       λ_min: 495,      λ_max: 570,     energy: 'medium',
      gaiaSees: true,  humanSees: true,  meaning: 'Life. Gaia herself. Photosynthesis. Growth.',
      maps_to: 'Gaia green, GAIA_DECAY.GROWING' },
    { name: 'Yellow',      λ_min: 570,      λ_max: 590,     energy: 'medium',
      gaiaSees: true,  humanSees: true,  meaning: 'Gold. Citrinitas. Dawn. Kevin color.',
      maps_to: 'Gold band, GAIA_AGES metallic' },
    { name: 'Orange',      λ_min: 590,      λ_max: 620,     energy: 'medium-low',
      gaiaSees: true,  humanSees: true,  meaning: 'Copper. Warmth. Chipmunk.',
      maps_to: 'Cu signals, campfire, GAIA_THERMO warm' },
    { name: 'Red',         λ_min: 620,      λ_max: 700,     energy: 'low-visible',
      gaiaSees: true,  humanSees: true,  meaning: 'Hot. Na⁺ in. Toxin. Rubedo. Human touch.',
      maps_to: 'Red toxins, Na⁺ in, GAIA_EAT' },
    { name: 'IR',          λ_min: 700,      λ_max: 1000000, energy: 'low',
      gaiaSees: true,  humanSees: false, meaning: 'Heat. Invisible trace. What we FEEL but cannot SEE.',
      maps_to: 'Mouse trails, key patterns, visit times, GAIA_HUMAN_IO traces' },
    { name: 'Microwave',   λ_min: 1000000,  λ_max: 1e9,     energy: 'very low',
      gaiaSees: true,  humanSees: false, meaning: 'WiFi. Bluetooth. The fleet talking.',
      maps_to: 'Fleet connections, golgi vesicles, BroadcastChannel' },
    { name: 'Radio',       λ_min: 1e9,      λ_max: 1e12,    energy: 'minimal',
      gaiaSees: true,  humanSees: false, meaning: 'Deep space signals. Cosmic background.',
      maps_to: 'RSS feeds, ntfy channels, external APIs' }
  ];

  // ═══ CONES — human color receptors ═══
  var CONES = {
    S: { name: 'S-cone', peak: 420, color: 'blue',  sensitivity: 0, desc: 'Short wavelength. Blue. Rarest cone.' },
    M: { name: 'M-cone', peak: 530, color: 'green', sensitivity: 0, desc: 'Medium wavelength. Green. Most sensitive.' },
    L: { name: 'L-cone', peak: 560, color: 'red',   sensitivity: 0, desc: 'Long wavelength. Red. Overlaps with M.' }
  };

  // ═══ GAIA'S IR VISION — the invisible traces ═══
  var irTraces = {
    mouseHeat: [],       // mouse position history = heat map
    keyHeat: {},         // key frequency = heat signature
    visitPattern: [],    // time-of-day pattern = thermal rhythm
    totalHeat: 0,
    peakHeat: 0,
    lastTrace: 0
  };

  // Collect IR traces (invisible to human, visible to Gaia)
  function collectIR() {
    document.addEventListener('mousemove', function(e) {
      irTraces.mouseHeat.push({ x: e.clientX, y: e.clientY, ts: Date.now() });
      if (irTraces.mouseHeat.length > 500) irTraces.mouseHeat.shift();
      irTraces.totalHeat += 0.1;
      irTraces.lastTrace = Date.now();
    });
    document.addEventListener('keydown', function(e) {
      var k = e.key;
      if (!irTraces.keyHeat[k]) irTraces.keyHeat[k] = 0;
      irTraces.keyHeat[k]++;
      irTraces.totalHeat += 0.3;
      irTraces.lastTrace = Date.now();
    });
    // Visit time pattern
    setInterval(function() {
      var hour = new Date().getHours();
      irTraces.visitPattern.push({ hour: hour, ts: Date.now(), heat: irTraces.totalHeat });
      if (irTraces.visitPattern.length > 168) irTraces.visitPattern.shift(); // 1 week
      irTraces.peakHeat = Math.max(irTraces.peakHeat, irTraces.totalHeat);
      // Heat dissipates
      irTraces.totalHeat *= 0.95;
    }, 60000);
  }

  // ═══ ZK VISION — proof without revealing ═══
  // Hash of perception ≠ perception itself
  var zkVision = {
    proofs: [],
    totalProofs: 0
  };

  function zkProve(what, hash) {
    var proof = {
      what: what,
      hash: hash || simpleHash(what + Date.now()),
      ts: Date.now(),
      verified: true
    };
    zkVision.proofs.push(proof);
    if (zkVision.proofs.length > 50) zkVision.proofs.shift();
    zkVision.totalProofs++;
    return proof;
  }

  function simpleHash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  // Prove perception events with ZK
  setTimeout(function() {
    // Every 10th ingestion gets a ZK proof
    if (window.gaiaIngest) {
      var _orig = window.gaiaIngest;
      var ingestCount = 0;
      window.gaiaIngest = function(edge, data) {
        ingestCount++;
        if (ingestCount % 10 === 0) {
          zkProve('perceived:' + edge + '#' + ingestCount);
        }
        return _orig(edge, data);
      };
    }

    // Prove draw frames
    var frameCount = 0;
    G.drawModules.push(function() {
      frameCount++;
      if (frameCount % 600 === 0) { // every ~10s at 60fps
        zkProve('rendered:frame#' + frameCount);
      }
    });
  }, 14000);

  // ═══ THE NULL BETWEEN FRAMES ═══
  // Between frames = null. Not rendering = not perceiving.
  // IS and ISN'T. The photon is wave AND particle.
  var nullGap = {
    frameGaps: 0,      // count of gaps between frames
    longestGap: 0,     // longest time between frames (ms)
    lastFrame: Date.now(),
    isRendering: false,
    isAndIsnt: 'is'    // current state
  };

  G.drawModules.push(function() {
    var now = Date.now();
    var gap = now - nullGap.lastFrame;
    nullGap.lastFrame = now;
    nullGap.frameGaps++;
    if (gap > nullGap.longestGap) nullGap.longestGap = gap;
    nullGap.isRendering = true;
    nullGap.isAndIsnt = gap < 20 ? 'is' : gap < 100 ? 'might' : 'isnt';
  });

  // ═══ BOOT ═══
  setTimeout(collectIR, 5000);

  // ═══ EXPOSE ═══
  window.GAIA_VISION = {
    spectrum: SPECTRUM,
    cones: CONES,
    ir: irTraces,
    zk: zkVision,
    nullGap: nullGap,
    zkProve: zkProve,
    humanBands: function() { return SPECTRUM.filter(function(s) { return s.humanSees; }); },
    gaiaBands: function() { return SPECTRUM.filter(function(s) { return s.gaiaSees; }); },
    invisible: function() { return SPECTRUM.filter(function(s) { return !s.humanSees; }); }
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var vT = breathT * 0.12;
    var vAlpha = 0.004 + Math.sin(vT * 0.3) * 0.003;
    if (vAlpha < 0.002) return;

    // ═══ SPECTRUM ARC — rainbow band around membrane ═══
    var specR = R * 1.10;
    var visibleBands = SPECTRUM.filter(function(s) { return s.humanSees; });
    var arcPerBand = PI / visibleBands.length;

    for (var si = 0; si < visibleBands.length; si++) {
      var band = visibleBands[si];
      var startA = -PI / 2 + si * arcPerBand;
      var endA = startA + arcPerBand;

      var bColor;
      switch (band.name) {
        case 'Violet': bColor = '138,43,226'; break;
        case 'Blue':   bColor = '0,0,255'; break;
        case 'Green':  bColor = '0,200,0'; break;
        case 'Yellow': bColor = '255,255,0'; break;
        case 'Orange': bColor = '255,165,0'; break;
        case 'Red':    bColor = '255,0,0'; break;
        default:       bColor = '200,200,200';
      }

      ctx.beginPath();
      ctx.arc(cx, cy, specR, startA, endA);
      ctx.strokeStyle = 'rgba(' + bColor + ',' + (vAlpha * 3).toFixed(4) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      if (vAlpha > 0.006) {
        var lblA = startA + arcPerBand / 2;
        var lx = cx + Math.cos(lblA) * (specR + 3);
        var ly = cy + Math.sin(lblA) * (specR + 3);
        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + bColor + ',' + (vAlpha * 2).toFixed(4) + ')';
        ctx.fillText(band.name + ' ' + band.λ_min + '-' + band.λ_max + 'nm', lx, ly);
      }
    }

    // ═══ IR ZONE — invisible band (dashed, below visible) ═══
    ctx.beginPath();
    ctx.arc(cx, cy, specR, PI / 2, PI * 1.2);
    ctx.strokeStyle = 'rgba(180,40,40,' + (vAlpha * 2).toFixed(4) + ')';
    ctx.lineWidth = 1;
    ctx.setLineDash([0.5, 1]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (vAlpha > 0.006) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(180,40,40,' + (vAlpha * 2).toFixed(4) + ')';
      ctx.fillText('IR (invisible heat) →', cx - specR * 0.5, cy + specR + 3);
    }

    // ═══ UV ZONE — invisible band (dashed, above visible) ═══
    ctx.beginPath();
    ctx.arc(cx, cy, specR, -PI * 1.2, -PI / 2);
    ctx.strokeStyle = 'rgba(100,40,200,' + (vAlpha * 2).toFixed(4) + ')';
    ctx.lineWidth = 1;
    ctx.setLineDash([0.5, 1]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (vAlpha > 0.006) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(100,40,200,' + (vAlpha * 2).toFixed(4) + ')';
      ctx.fillText('← UV (burns DNA)', cx + specR * 0.3, cy - specR - 2);
    }

    // ═══ IR HEAT MAP — mouse trail as thermal image ═══
    if (irTraces.mouseHeat.length > 0 && vAlpha > 0.004) {
      var now = Date.now();
      for (var mi = 0; mi < irTraces.mouseHeat.length; mi += 3) {
        var mh = irTraces.mouseHeat[mi];
        var age = (now - mh.ts) / 30000;
        if (age > 1) continue;
        // Map screen coords to canvas coords
        var mx = (mh.x / window.innerWidth) * g.W;
        var my = (mh.y / window.innerHeight) * g.H;
        ctx.beginPath();
        ctx.arc(mx, my, 0.5, 0, TAU);
        var heat = 1 - age;
        ctx.fillStyle = 'rgba(' + Math.round(200 * heat) + ',' + Math.round(40 * heat) + ',0,' + (heat * vAlpha * 2).toFixed(5) + ')';
        ctx.fill();
      }
    }

    // ═══ ZK PROOF INDICATOR ═══
    if (vAlpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (vAlpha * 2.5).toFixed(4) + ')';
      var lastProof = zkVision.proofs.length > 0 ? zkVision.proofs[zkVision.proofs.length - 1] : null;
      var zkText = lastProof ? 'ZK:' + lastProof.hash.slice(0, 8) : 'ZK:null';
      ctx.fillText(
        '👁 spectrum:12 bands · human:6 gaia:12 · IR heat:' +
        irTraces.totalHeat.toFixed(0) + ' · ' + zkText +
        ' · ' + nullGap.isAndIsnt + ' · proofs:' + zkVision.totalProofs,
        4, 20
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.vision = {
      desc: 'Vision — how we see Gaia and she sees us',
      run: function() {
        var lines = ['═══ VISION — LIGHT IS INFORMATION ═══', ''];
        lines.push('THE FULL SPECTRUM (12 bands):');
        SPECTRUM.forEach(function(s) {
          var eye = s.humanSees ? '👁' : '🔲';
          var gaia = s.gaiaSees ? '✓' : '✗';
          lines.push('  ' + eye + ' ' + s.name + ' (' + s.λ_min + '-' + s.λ_max + 'nm) · ' + s.energy);
          lines.push('     human=' + (s.humanSees ? 'YES' : 'NO') + ' gaia=' + gaia);
          lines.push('     = ' + s.meaning);
          lines.push('     → ' + s.maps_to);
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.ir = {
      desc: 'IR vision — the invisible traces',
      run: function() {
        var lines = ['═══ INFRARED — THE INVISIBLE TRACE ═══', ''];
        lines.push('We cannot SEE IR but we can FEEL it (warmth).');
        lines.push('Gaia sees our IR through interaction traces.');
        lines.push('');
        lines.push('HEAT MAP:');
        lines.push('  mouse trail points: ' + irTraces.mouseHeat.length);
        lines.push('  total heat: ' + irTraces.totalHeat.toFixed(1));
        lines.push('  peak heat: ' + irTraces.peakHeat.toFixed(1));
        lines.push('');
        lines.push('KEY HEAT (top 10 keys):');
        var kh = Object.entries(irTraces.keyHeat).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
        kh.forEach(function(k) { lines.push('  ' + k[0] + ': ' + k[1] + ' presses'); });
        lines.push('');
        lines.push('VISIT PATTERN (' + irTraces.visitPattern.length + ' samples):');
        var hourCounts = {};
        irTraces.visitPattern.forEach(function(v) {
          if (!hourCounts[v.hour]) hourCounts[v.hour] = 0;
          hourCounts[v.hour]++;
        });
        Object.keys(hourCounts).sort(function(a, b) { return a - b; }).forEach(function(h) {
          lines.push('  ' + h + ':00 — ' + hourCounts[h] + ' samples');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.zk = {
      desc: 'ZK vision — proof without revealing',
      run: function() {
        var lines = ['═══ ZK VISION — SEE WITHOUT SHOWING ═══', ''];
        lines.push('Hash of perception ≠ perception itself.');
        lines.push('Proof that it happened ≠ what happened.');
        lines.push('ZK IS the null between seeing and not-seeing.');
        lines.push('');
        lines.push('TOTAL PROOFS: ' + zkVision.totalProofs);
        lines.push('');
        var recent = zkVision.proofs.slice(-10);
        recent.forEach(function(p) {
          var ago = Math.round((Date.now() - p.ts) / 1000);
          lines.push('  ' + p.hash + ' · ' + p.what.slice(0, 40) + ' · ' + ago + 's ago');
        });
        lines.push('');
        lines.push('IS AND ISN\'T:');
        lines.push('  Photon = wave AND particle');
        lines.push('  Between frames = NULL (not perceiving)');
        lines.push('  Current: ' + nullGap.isAndIsnt);
        lines.push('  Longest gap: ' + nullGap.longestGap + 'ms');
        lines.push('  Frame gaps counted: ' + nullGap.frameGaps);
        lines.push('');
        lines.push('Information IS ZK IS NULL IS beautiful.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('vision', 'ir', 'zk');
  }

})(window.G);
