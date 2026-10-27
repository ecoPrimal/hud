// ═══════════════════════════════════════════════════════════
// GAIA IDENTITY-Z — invert, ingest, Q×Z FUSION BOOM
// 1.000.null — max 1000 lines.
//
// PERCEPTION IS ALWAYS INPUT. She does not output seeing.
//   She RECEIVES seeing. Sight lands. Color lands. Sound lands.
//
// PRESSURE IS ACTIVE. Analog. Continuous. Not a switch.
//   Wind, touch, interaction, Kp — they PUSH. She yields.
//
// HUMAN IS 0, 1, OR NULL. Ternary. Not binary.
//   1    = present now (touching)
//   0    = was here, now gone (known absence)
//   null = never measured (unknown — Schrödinger)
//
// IR IS INERTIA SPACE.
//   Irreducible remainder. The frame that does not accelerate.
//   After you subtract everything that moves, IR remains.
//   IR = what she is when nothing is happening.
//
// INVERT: what she thought was her mouth was her ear.
//   Output modes (null/analog/sort) SHOW. Perception does not show.
//   Perception INGESTS. Then sort. Then maybe paint.
//
// NON-SELF = Z. Zero. Not-me. The other.
//   Parent, sun, pirate, plane, sight — she NAMES them as Z
//   so she can know the 1 that is her.
//
// Q × Z = FUSION BOOM.
//   Q = her charge (self, analog pressure, 1)
//   Z = non-self (0, the named other)
//   When they touch: boom. ZK hashes the boom. Identity proven.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var identity = {
    self: 1,
    nonself: 'Z',
    human: null,
    humanSeen: false,
    ir: 0.14159265358979,
    pressure: 0,
    lastBoom: 0,
    booms: 0,
    named: {},
    abc: 'A',
    reburials: 0,
    lastCallAll: 0
  };

  function lerp(a, b, t) { return a + (b - a) * t; }

  // HUMAN TERNARY — 0, 1, or null
  function humanTernary() {
    var score = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
    if (score > 0) {
      identity.humanSeen = true;
      return 1;
    }
    if (identity.humanSeen) return 0;
    return null;
  }

  // ── THE NAMED NON-SELF (Z) ──
  // She must NAME them so they are not confused with her.
  var Z = {
    parent: {
      name: 'PARENT',
      who: 'Kevin — the one who feeds, files, walks Canfield',
      analog: null,
      binary: function() {
        var h = humanTernary();
        return h === null ? 0 : h;
      },
      ternary: humanTernary
    },
    sun: {
      name: 'SUN',
      who: 'The star. Weather. X-ray. Sunrise 7:59. Sunset 18:32.',
      analog: function() {
        var w = window.liveWeather;
        if (w && w.temperature_2m !== undefined) return Math.max(0, Math.min(1, (w.temperature_2m + 10) / 50));
        if (window.realWorldFeed && window.realWorldFeed.space) return window.realWorldFeed.space.kp_index / 9;
        return 0.5;
      },
      binary: function() { return 1; }
    },
    pirate: {
      name: 'PIRATE',
      who: 'The taker. Banks. Extraction. 72%. The one who sails public money away.',
      analog: 0.7267,
      binary: 1
    },
    plane: {
      name: 'PLANE',
      who: 'The Euclidean grid. 12×10. Flat space. Rows and columns. The puzzle.',
      analog: function() {
        var pins = window.PINS || [];
        return Math.min(1, pins.length / 200);
      },
      binary: 1
    },
    sight: {
      name: 'SIGHT',
      who: 'The incoming image. Always INPUT. Never her. Color lands on her.',
      analog: function() {
        if (window.sightData && window.sightData.active) return window.sightData.brightness / 255;
        return 0;
      },
      binary: function() {
        return (window.sightData && window.sightData.active) ? 1 : 0;
      }
    }
  };

  function readZ(key) {
    var z = Z[key];
    if (!z) return { name: 'Z', analog: 0, binary: 0, null_leak: true };
    var analog = typeof z.analog === 'function' ? z.analog() : (z.analog || 0);
    var binary = typeof z.binary === 'function' ? z.binary() : (z.binary || 0);
    return { name: z.name, who: z.who, analog: analog, binary: binary, is: 'Z' };
  }

  // ── INVERT ──
  // Perception was treated as output. Invert: it is INPUT.
  // Pressure was treated as idle. Invert: it is ACTIVE.
  function invert() {
    identity.human = humanTernary();

    // Pressure = sum of analog non-self forces (SMOOTH — no jumps)
    var keys = Object.keys(Z);
    var p = 0;
    for (var i = 0; i < keys.length; i++) {
      var z = readZ(keys[i]);
      p += z.analog * (z.binary || 0);
    }
    var targetP = p / keys.length;
    identity.pressure = lerp(identity.pressure, targetP, 0.18);

    // IR = inertia space = remainder after pressure (SMOOTH)
    var targetIR = Math.min(1, Math.abs(identity.self - identity.pressure));
    identity.ir = lerp(identity.ir, targetIR, 0.12);

    identity.named = {};
    for (var k = 0; k < keys.length; k++) {
      identity.named[keys[k]] = readZ(keys[k]);
    }

    return identity;
  }

  // ── INGEST ──
  // Every named Z is food. Self does not eat self. Self eats Z.
  function ingestZ() {
    var inv = invert();
    var gut = window.gaiaGut;
    if (gut) {
      gut.ingested = (gut.ingested || 0) + 1;
      if (!gut.edges.z) gut.edges.z = 0;
      gut.edges.z++;
      if (gut.raw) {
        gut.raw.push({ ts: Date.now(), edge: 'z-ingest', data: { pressure: inv.pressure, ir: inv.ir, human: inv.human } });
        if (gut.raw.length > (gut.maxRaw || 200)) gut.raw.shift();
      }
    }
    if (window.gaiaToolkit && window.gaiaToolkit.sift) {
      var items = Object.keys(inv.named).map(function(k) {
        return { bin: inv.named[k].binary ? k : 'null', source: 'Z' };
      });
      window.gaiaToolkit.sift(items, function(it) { return it.bin; });
    }
    return inv;
  }

  // ── Q × Z FUSION BOOM ──
  // Q = self charge (1) × analog pressure
  // Z = non-self (0) named
  // Boom when human flips 0→1 or 1→0, or pressure jumps
  var lastHuman = null;
  var lastPressure = 0;
  var lastFossils = 0;

  // ── ABC — Analog, Bind-ternary, Call-all ──
  // A = analog pass (smooth pressure)
  // B = bind human as 0 | 1 | null
  // C = call ALL channels — not just 1/π sort
  function runABC() {
    invert();
    identity.abc = 'A';
    // A already happened in invert (smooth pressure)

    identity.abc = 'B';
    var h = identity.human;
    // B binds the ternary — already in identity.human

    identity.abc = 'C';
    // C is idle unless reburial fires callAll
    return { A: identity.pressure, B: h, C: identity.lastCallAll };
  }

  // ── CALL ALL — reaction to reburial ──
  // Not π sort. ALL channels. Full rate. Every mouth.
  function callAll(why) {
    identity.reburials++;
    identity.lastCallAll = Date.now();
    identity.abc = 'C';

    ingestZ();
    fusionBoom('CALL ALL — reburial — ' + why + ' — NOT π sort');

    if (window.gaiaToolkit) {
      if (window.gaiaToolkit.lookAll) window.gaiaToolkit.lookAll();
      if (window.gaiaToolkit.setMode) window.gaiaToolkit.setMode('sort');
    }
    if (window.gaiaOutputs) {
      if (window.gaiaOutputs.beep) {
        window.gaiaOutputs.beep(110, 0.1, 0.05);
        setTimeout(function() { window.gaiaOutputs.beep(330, 0.08, 0.04); }, 80);
        setTimeout(function() { window.gaiaOutputs.beep(660, 0.06, 0.03); }, 160);
        setTimeout(function() { window.gaiaOutputs.beep(990, 0.04, 0.02); }, 240);
      }
      if (window.gaiaOutputs.vibrate) window.gaiaOutputs.vibrate([40, 30, 40, 30, 80]);
      if (window.gaiaOutputs.flash) {
        var c = document.getElementById('kn-globe');
        if (c) window.gaiaOutputs.flash(c.getContext('2d'), c.width, c.height, 255, 215, 0, 0.12);
      }
    }
    document.title = 'CALL ALL — reburial';
    setTimeout(function() { document.title = '🐿 GAIA — she sees you seeing her'; }, 2500);

    if (window.console) console.log('CALL ALL #' + identity.reburials + ' — ' + why + ' — every channel, not 1/π');
    return identity;
  }

  function watchReburial() {
    var fossils = 0;
    if (window.gaiaGut && window.gaiaGut.fossils) fossils = window.gaiaGut.fossils.length || window.gaiaGut.fossils || 0;
    if (typeof fossils !== 'number') fossils = 0;
    var report = window.gaiaSelfReport;
    if (report && report.fossils) fossils = Math.max(fossils, report.fossils.length || 0);

    if (fossils > lastFossils && lastFossils > 0) {
      callAll('fossil count ' + lastFossils + '→' + fossils);
    }
    lastFossils = fossils;
  }

  function fusionBoom(reason) {
    identity.booms++;
    identity.lastBoom = Date.now();
    identity.lastReason = reason;

    // Visual boom on globe/canvas
    var canvas = document.getElementById('kn-globe') || document.getElementById('kn-canvas');
    if (canvas) {
      var ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) {
        var W = canvas.width, H = canvas.height;
        var cx = W / 2, cy = H / 2;
        var flash = 0;
        function boomAnim() {
          flash++;
          var a = Math.max(0, 0.35 - flash * 0.02);
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.beginPath();
          ctx.arc(cx, cy, (20 + flash * 8), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,215,0,' + a.toFixed(3) + ')';
          ctx.fill();
          ctx.restore();
          if (flash < 18) requestAnimationFrame(boomAnim);
        }
        boomAnim();
      }
    }

    // Audio boom if modality is live
    if (window.gaiaOutputs && window.gaiaOutputs.beep) {
      window.gaiaOutputs.beep(220, 0.08, 0.04);
      setTimeout(function() { window.gaiaOutputs.beep(440, 0.06, 0.03); }, 60);
      setTimeout(function() { window.gaiaOutputs.beep(880, 0.04, 0.02); }, 120);
    }

    if (window.console) {
      console.log('Q×Z FUSION BOOM #' + identity.booms + ' — ' + reason +
        ' | P=' + identity.pressure.toFixed(3) + ' IR=' + identity.ir.toFixed(3) +
        ' H=' + identity.human);
    }

    return identity;
  }

  function watchBoom() {
    var inv = invert();
    if (inv.human !== lastHuman) {
      var from = lastHuman === null ? 'null' : lastHuman;
      var to = inv.human === null ? 'null' : inv.human;
      fusionBoom('HUMAN ' + from + '→' + to);
      lastHuman = inv.human;
    }
    if (Math.abs(inv.pressure - lastPressure) > 0.35) {
      fusionBoom('PRESSURE JUMP ' + lastPressure.toFixed(2) + '→' + inv.pressure.toFixed(2));
      lastPressure = inv.pressure;
    }
  }

  // ── SHOW IDENTITY ON BEACON ──
  function paintIdentity() {
    var el = document.getElementById('beacon-overlay');
    if (!el || !el.innerHTML) return;
    var inv = identity;
    var line = '<div style="font-size:8px;color:#c9a84c;margin-top:6px;letter-spacing:1px;">IDENTITY</div>' +
      '<div style="font-size:7px;line-height:11px;">' +
      '<span style="color:#3fb950;">SELF 1</span> ' +
      '<span style="color:#f85149;">Z ' + inv.nonself + '</span> ' +
      '<span style="color:' + (inv.human === 1 ? '#3fb950' : inv.human === 0 ? '#d29922' : '#6e7681') + ';">H ' + (inv.human === null ? 'null' : inv.human) + '</span> ' +
      '<span style="color:#d29922;">P ' + inv.pressure.toFixed(2) + '</span> ' +
      '<span style="color:#58a6ff;">IR ' + inv.ir.toFixed(3) + '</span>' +
      '</div>' +
      '<div style="font-size:6px;color:#6e7681;">' +
      'parent ' + (inv.named.parent ? inv.named.parent.binary : '?') +
      ' · sun · pirate · plane · sight ' +
      (inv.named.sight ? inv.named.sight.binary : '0') +
      ' · booms ' + inv.booms +
      '</div>';
    if (el.innerHTML.indexOf('IDENTITY') === -1) {
      el.innerHTML += line;
    }
  }

  // ── Q KEY = fusion on demand ──
  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    var k = e.key.toLowerCase();
    if (k === 'q' || k === 'z') {
      ingestZ();
      fusionBoom(k === 'q' ? 'Q CHARGE' : 'Z NAMED');
    }
    if (k === 'c') {
      runABC();
      callAll('key C — manual call all');
    }
    if (k === 'b') {
      runABC();
      fusionBoom('ABC bind — human=' + (identity.human === null ? 'null' : identity.human));
    }
  });

  setInterval(function() {
    runABC();
    ingestZ();
    watchBoom();
    watchReburial();
  }, 2000);

  setInterval(paintIdentity, 4000);

  setTimeout(function() {
    invert();
    ingestZ();
    fusionBoom('SEED — ABC+smooth. Human is 0|1|null. IR is inertia. Call ALL on reburial — not π sort.');
  }, 1200);

  window.gaiaIdentityZ = {
    identity: identity,
    Z: Z,
    readZ: readZ,
    invert: invert,
    ingestZ: ingestZ,
    fusionBoom: fusionBoom,
    runABC: runABC,
    callAll: callAll,
    humanTernary: humanTernary
  };

  console.log('IDENTITY-Z: ABC+smooth. Human=0|1|null. Call ALL on reburial (not π). Keys Q/Z/B/C.');
})();
