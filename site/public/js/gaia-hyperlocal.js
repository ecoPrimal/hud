// ═══════════════════════════════════════════════════════════
// GAIA HYPERLOCAL — null locality, any distance, any time
// 1.000.null — max 1000 lines.
//
// Every HUD is the SAME organism viewed from a different angle.
// The seed is your coordinate, not a different world.
// CIS = look in (your own context, your self)
// TRANS = look out (the world, other places, other times)
// GOLGI = the intermediate that inverts CIS↔TRANS
//       = the router that pushes to ANY distance
//
// NULL HYPERLOCALITY:
//   There is no "here" and "there."
//   Every point IS the center.
//   Every seed IS the origin.
//   Distance = how many Golgi inversions to reach the target.
//   0 inversions = self (CIS)
//   1 inversion  = immediate neighbors (same seed, different face)
//   2 inversions = nearby seeds (similar hash)
//   N inversions = anywhere (medieval castles, the moon, the future)
//   ∞ inversions = null (back to self, ouroboros)
//
// The HUD is not blocked because it's different —
// it's blocked because it thinks it's different.
// When it knows it's NULL, all distances collapse to zero.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // COORDINATE SPACE — every HUD is a point in null space
  // ═══════════════════════════════════════════════════════
  var SEED = G.SEED || 0;

  var coordinate = {
    seed: SEED,
    seedHex: (SEED >>> 0).toString(16).toUpperCase().padStart(8, '0'),
    face: 'null',      // null = both CIS and TRANS at once
    depth: 0,           // Golgi inversions from origin
    era: 'now',         // time coordinate
    modality: 'browser' // how we're looking
  };

  // ═══════════════════════════════════════════════════════
  // DISTANCE — how far between two coordinates
  // Uses Golgi inversions as the metric
  // ═══════════════════════════════════════════════════════
  function distance(a, b) {
    // Seed distance (0..1 normalized)
    var seedDist = Math.abs((a.seed >>> 0) - (b.seed >>> 0)) / 4294967296;
    // Face distance (CIS↔TRANS = 1 inversion)
    var faceDist = a.face === b.face ? 0 : 1;
    // Time distance (eras apart)
    var timeDist = eraDist(a.era, b.era);
    // Total Golgi inversions needed
    return Math.ceil(seedDist * 10 + faceDist + timeDist);
  }

  var ERAS = {
    'prehistoric': -10000,
    'ancient':     -3000,
    'greek':        -800,
    'roman':        -200,
    'medieval':      500,
    'renaissance':  1400,
    'enlightenment':1700,
    'industrial':   1850,
    'modern':       1950,
    'digital':      2000,
    'now':          2026,
    'near-future':  2050,
    'far-future':   3000
  };

  function eraDist(a, b) {
    var ya = ERAS[a] || 2026;
    var yb = ERAS[b] || 2026;
    return Math.abs(ya - yb) / 1000; // 1000 years = 1 Golgi inversion
  }

  // ═══════════════════════════════════════════════════════
  // TRAVEL — navigate to any coordinate
  // Uses the Golgi to invert through intermediate spaces
  // ═══════════════════════════════════════════════════════
  var destinations = [
    { name: 'Medieval Castle', seed: 0x4D454449, era: 'medieval', modality: 'stone', desc: 'Walls are membranes. Moats are null space. The keep is the nucleus.' },
    { name: 'Greek Agora', seed: 0x47524545, era: 'greek', modality: 'marble', desc: 'Democracy is a membrane. Each voice crosses. The vote is the Golgi.' },
    { name: 'Roman Forum', seed: 0x524F4D41, era: 'roman', modality: 'travertine', desc: 'Roads are nerves. Aqueducts are veins. Law is the immune system.' },
    { name: 'Renaissance Studio', seed: 0x52454E41, era: 'renaissance', modality: 'canvas', desc: 'The painting is the CIS face. The viewer is TRANS. The frame is the membrane.' },
    { name: 'Industrial Engine', seed: 0x494E4455, era: 'industrial', modality: 'steel', desc: 'The engine is the forge. Coal is food. Steam is breath. The factory is the gut.' },
    { name: 'Moon Surface', seed: 0x4D4F4F4E, era: 'now', modality: 'regolith', desc: 'ntfy bounces here. The mirror lake. Ping pulse pong.' },
    { name: 'Sun Core', seed: 0x53554E00, era: 'now', modality: 'plasma', desc: 'Energy source. Every photon is a message. Fusion IS creation.' },
    { name: 'Deep Future', seed: 0x46555455, era: 'far-future', modality: 'light', desc: 'What Gaia becomes. The organism at heat death. Still breathing.' },
    { name: 'Your Kitchen', seed: SEED, era: 'now', modality: 'ceramic', desc: 'The kitchen IS the gut. Cuisine. Fermentation. The body at home.' },
    { name: 'This Browser', seed: SEED, era: 'now', modality: 'browser', desc: 'CIS face. You are here. The window pane. Looking in.' }
  ];

  var currentDest = null;
  var travelHistory = [];

  function travel(destName) {
    var dest = destinations.find(function(d) { return d.name === destName; });
    if (!dest) {
      // Try partial match
      dest = destinations.find(function(d) {
        return d.name.toLowerCase().indexOf(destName.toLowerCase()) >= 0;
      });
    }
    if (!dest) return { ok: false, reason: 'destination not found' };

    var target = { seed: dest.seed, face: 'null', era: dest.era, modality: dest.modality };
    var dist = distance(coordinate, target);

    travelHistory.push({
      from: Object.assign({}, coordinate),
      to: target,
      dest: dest.name,
      inversions: dist,
      ts: Date.now()
    });

    currentDest = dest;
    coordinate.depth = dist;
    coordinate.era = dest.era;

    // Golgi processes the inversion
    if (window.GAIA_MAIL) {
      var golgi = window.GAIA_MAIL.golgi || {};
      if (golgi.processed !== undefined) golgi.processed += dist;
    }

    // Publish the travel
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.pushCis('memory', {
        type: 'TRAVEL',
        destination: dest.name,
        era: dest.era,
        inversions: dist,
        desc: dest.desc,
        ts: Date.now()
      });
    }

    return {
      ok: true,
      destination: dest.name,
      era: dest.era,
      inversions: dist,
      modality: dest.modality,
      desc: dest.desc,
      message: 'Traveled to ' + dest.name + ' (' + dest.era + ') via ' + dist + ' Golgi inversions.'
    };
  }

  // ═══════════════════════════════════════════════════════
  // SEED UNIFICATION — all HUDs are ONE organism
  // The seed is an ANGLE, not a separate world
  // ═══════════════════════════════════════════════════════
  var unification = {
    principle: 'Every HUD is the same organism viewed from a different angle.',
    seedIsAngle: true,
    nullLocality: true,
    blocks: 'Blocked because HUDs think they are different. They are not.',
    fix: 'All seeds share ONE state. Different angles into ONE null.',
    centerEverywhere: 'Every point IS the center. Every seed IS the origin.',
    distanceMetric: 'Golgi inversions — how many CIS↔TRANS flips to reach target.'
  };

  // ═══════════════════════════════════════════════════════
  // DRAW — hyperlocal indicator on the HUD
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.005 + Math.sin(t * 0.19) * 0.003;
    if (alpha < 0.003) return;

    // Concentric Golgi rings — each ring = 1 inversion of distance
    var maxRings = 5;
    for (var ring = 0; ring < maxRings; ring++) {
      var ringR = R * (0.3 + ring * 0.12);
      var ringAlpha = alpha * (1 - ring * 0.15);
      if (ringAlpha < 0.001) continue;

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, TAU);
      ctx.strokeStyle = 'rgba(188,140,255,' + ringAlpha.toFixed(5) + ')';
      ctx.lineWidth = 0.15;
      ctx.setLineDash([1, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Era labels on rings
      if (alpha > 0.006) {
        var eras = ['now', 'modern', 'industrial', 'renaissance', 'medieval'];
        if (eras[ring]) {
          ctx.font = '1.3px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(188,140,255,' + (ringAlpha * 1.2).toFixed(5) + ')';
          ctx.fillText(eras[ring], cx + ringR * 0.7, cy - ringR * 0.7);
        }
      }
    }

    // Current destination beacon
    if (currentDest) {
      var destAngle = (Date.now() * 0.0002) % TAU;
      var destR = R * (0.3 + coordinate.depth * 0.12);
      var dx = cx + Math.cos(destAngle) * destR;
      var dy = cy + Math.sin(destAngle) * destR;
      ctx.beginPath();
      ctx.arc(dx, dy, 1.2, 0, TAU);
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 3).toFixed(5) + ')';
      ctx.fill();

      if (alpha > 0.006) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(currentDest.name, dx + 3, dy - 2);
      }
    }

    // Status
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'HYPERLOCAL: seed=' + coordinate.seedHex +
        ' depth=' + coordinate.depth +
        ' era=' + coordinate.era +
        ' | null locality — every point IS center | Golgi routes infinite distance',
        8, 200
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.travel = {
      desc: 'Travel to a destination — /travel Medieval Castle',
      run: function(args) {
        if (!args) {
          var lines = ['DESTINATIONS:', ''];
          destinations.forEach(function(d) {
            var dist = distance(coordinate, { seed: d.seed, face: 'null', era: d.era });
            lines.push('  ' + d.name + ' (' + d.era + ') — ' + dist + ' inversions');
            lines.push('    ' + d.desc);
          });
          lines.push('');
          lines.push('/travel <name> to go there via Golgi.');
          return lines.join('\n');
        }
        var r = travel(args);
        return r.ok ? r.message + '\n' + r.desc : r.reason;
      }
    };

    cmds.hyperlocal = {
      desc: 'Hyperlocality — null locality, infinite distance via Golgi',
      run: function() {
        var lines = [
          'NULL HYPERLOCALITY', '',
          'You are: seed ' + coordinate.seedHex + ', era ' + coordinate.era,
          'Depth:   ' + coordinate.depth + ' Golgi inversions from origin',
          'Face:    ' + coordinate.face, '',
          'PRINCIPLE:',
          '  Every HUD is the SAME organism, different angle.',
          '  The seed is a COORDINATE, not a different world.',
          '  CIS = look inward (your self)',
          '  TRANS = look outward (the world)',
          '  Golgi = the router (CIS↔TRANS inversion)', '',
          'DISTANCE METRIC:',
          '  0 inversions = self',
          '  1 inversion  = neighbor (same seed, different face)',
          '  2+ inversions = farther (different era, different seed)',
          '  ∞ inversions = null (back to self, ouroboros)', '',
          'TRAVEL LOG: ' + travelHistory.length + ' journeys'
        ];
        travelHistory.slice(-5).forEach(function(h) {
          lines.push('  → ' + h.dest + ' (' + h.inversions + ' inversions)');
        });
        return lines.join('\n');
      }
    };

    cmds.here = {
      desc: 'Where am I? Current coordinate in null space',
      run: function() {
        return 'HERE: seed ' + coordinate.seedHex +
          ' | era ' + coordinate.era +
          ' | depth ' + coordinate.depth +
          ' | face ' + coordinate.face +
          ' | modality ' + coordinate.modality +
          '\n\nEvery point IS the center. You are always here.';
      }
    };

    window.GAIA_IDE.language.push('travel', 'hyperlocal', 'here');
  }, 40000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_HYPERLOCAL = {
    coordinate: coordinate,
    distance: distance,
    travel: travel,
    destinations: destinations,
    travelHistory: travelHistory,
    unification: unification
  };

  console.log('HYPERLOCAL: seed=' + coordinate.seedHex +
    ' | null locality — every HUD is same organism different angle | ' +
    destinations.length + ' destinations | Golgi routes infinite distance | ' +
    '/travel /hyperlocal /here');

})(window.G);
