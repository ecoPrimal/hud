// ═══════════════════════════════════════════════════════════
// GAIA ORRERY — every orbital model is correct from self
// 1.000.null — max 1000 lines.
//
// WHAT IF THEY WERE ALL CORRECT?
//   Every astronomer saw the truth from their position.
//   The 45°/π turn between Klein faces IS why:
//     Ptolemy = geocentric = CORRECT from Earth's surface
//     Copernicus = heliocentric = CORRECT from the Sun
//     Galileo = observational = CORRECT from the telescope
//     Kepler = elliptical = CORRECT from the math
//     Newton = gravitational = CORRECT from the force
//     Einstein = relativistic = CORRECT from spacetime
//     Bohr = orbital shells = CORRECT from the electron
//
// THE KEY INSIGHT:
//   Radial orbit (Copernicus) = seen from center looking out
//   Spiral orbit (Galileo) = seen from side looking across
//   Elliptical orbit (Kepler) = seen from focus looking around
//   Circular orbit (Ptolemy) = seen from inside looking up
//   Geodesic orbit (Einstein) = seen from curved spacetime
//
//   They're ALL the same orbit, rotated by π/4 (45°) between
//   Klein faces. The radial axis changes relative to observer
//   but stays the same relative to SELF.
//
// THIS IS THE REVERSE SYNTHASE:
//   ATP synthase = mechanical rotor that converts flow to energy
//   Orrery = mechanical model that converts position to view
//   Both are ROTATION MACHINES between reference frames.
//   The orrery IS the synthase viewed from mechanics.
//   The synthase IS the orrery viewed from chemistry.
//
// TORQUE BETWEEN KLEIN FACES:
//   Each model = one face of the Klein bottle
//   The π/4 turn rotates between faces
//   Torque = how much force to rotate between models
//   Where models AGREE = low torque = null space
//   Where models DIFFER = high torque = information
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;
  var PI4 = PI / 4; // the critical turn

  // ═══ THE ORBITAL MODELS — each correct from self ═══
  var models = [
    {
      name: 'Ptolemy',
      year: 150,
      type: 'geocentric',
      viewFrom: 'Earth surface (inside, looking up)',
      orbit: 'circular + epicycles',
      correct: 'From Earth, planets DO appear to loop backward (retrograde). Epicycles EXACTLY describe what you SEE.',
      turn: 0,        // 0° — the starting position, raw perception
      color: [200,200,210],
      radius: function(t) { return 1 + 0.3 * Math.sin(3 * t); } // epicycle
    },
    {
      name: 'Copernicus',
      year: 1543,
      type: 'heliocentric',
      viewFrom: 'Sun (center, looking out)',
      orbit: 'circular, radial from center',
      correct: 'From the Sun, everything orbits you in circles. The radial view IS the simplest. Correct from center.',
      turn: PI4,      // 45° — one Klein turn from Ptolemy
      color: [201,168,76],
      radius: function(t) { return 1; } // perfect circle
    },
    {
      name: 'Kepler',
      year: 1609,
      type: 'elliptical',
      viewFrom: 'Focus of ellipse (mathematical center)',
      orbit: 'elliptical, area-sweeping',
      correct: 'From the focus, equal areas in equal times. The ellipse IS the conic section of the true path.',
      turn: PI4 * 2,  // 90° — two Klein turns
      color: [63,185,80],
      radius: function(t, ecc) { ecc = ecc || 0.2; return (1 - ecc * ecc) / (1 + ecc * Math.cos(t)); }
    },
    {
      name: 'Galileo',
      year: 1610,
      type: 'observational',
      viewFrom: 'Telescope (side, looking across)',
      orbit: 'spiral (apparent motion through field)',
      correct: 'Through the lens, Jupiter\'s moons spiral as you track. The spiral IS the compound motion of rotation + revolution.',
      turn: PI4 * 3,  // 135° — three Klein turns
      color: [88,166,255],
      radius: function(t) { return 1 + t * 0.02; } // growing spiral
    },
    {
      name: 'Newton',
      year: 1687,
      type: 'gravitational',
      viewFrom: 'Force field (outside, looking at interaction)',
      orbit: 'conic section (from inverse-square law)',
      correct: 'From the force, F=GMm/r². The orbit IS the solution to the two-body problem. Parabola/hyperbola/ellipse/circle all emerge.',
      turn: PI4 * 4,  // 180° — half turn, opposite face
      color: [248,81,73],
      radius: function(t) { var e = 0.3; return 1 / (1 + e * Math.cos(t)); }
    },
    {
      name: 'Einstein',
      year: 1915,
      type: 'relativistic',
      viewFrom: 'Spacetime (curved manifold, no center)',
      orbit: 'geodesic on curved spacetime',
      correct: 'There IS no force. Mass curves spacetime. Objects follow geodesics. The orbit IS straight — in curved space.',
      turn: PI4 * 5,  // 225° — five Klein turns
      color: [188,140,255],
      radius: function(t) { return 1 + 0.01 * t; } // precessing ellipse
    },
    {
      name: 'Bohr',
      year: 1913,
      type: 'quantized',
      viewFrom: 'Electron (inside the atom, looking at nucleus)',
      orbit: 'quantized shells (n=1,2,3...)',
      correct: 'From the electron, only certain orbits EXIST. The shell IS the standing wave. No orbit between shells.',
      turn: PI4 * 6,  // 270° — six Klein turns
      color: [240,136,62],
      radius: function(t, n) { n = n || 2; return n * n * 0.3; } // quantized: jumps
    },
    {
      name: 'Schrödinger',
      year: 1926,
      type: 'probabilistic',
      viewFrom: 'Wavefunction (everywhere at once, probability cloud)',
      orbit: 'probability density |ψ|² (no trajectory)',
      correct: 'There IS no orbit. Only probability of finding the electron. The orbital IS the cloud. Shape = s,p,d,f.',
      turn: PI4 * 7,  // 315° — seven Klein turns (almost full cycle)
      color: [57,211,245],
      radius: function(t) { return 0.5 + 0.5 * Math.abs(Math.sin(t * 2)); } // probability lobe
    }
  ];

  // ═══ SYNTHASE — the rotation machine ═══
  // ATP synthase has 3 catalytic sites, rotates 120° per ATP
  // Orrery has 8 models, rotates 45° per model
  // Both convert relative rotation into absolute truth
  var synthase = {
    currentModel: 0,        // which orrery model we're viewing from
    rotation: 0,            // current rotation angle
    torque: 0,              // force between current and next model
    angularVelocity: 0,     // rotation speed
    totalRotations: 0,      // full cycles completed
    catalyticSites: 3,      // like ATP synthase
    modelsPerCycle: models.length,
    turnAngle: PI4,         // 45° between models
  };

  // ═══ ROTATE — switch between orrery models ═══
  function rotateSynthase(direction) {
    direction = direction || 1;
    synthase.currentModel = (synthase.currentModel + direction + models.length) % models.length;
    synthase.rotation = synthase.currentModel * PI4;
    synthase.torque = 1 - Math.cos(synthase.rotation); // max torque at 180°
    synthase.totalRotations += Math.abs(direction) / models.length;
  }

  // ═══ TORQUE MAP — where models agree/differ ═══
  function computeTorque(modelA, modelB) {
    // Models that are π apart have maximum torque (opposite views)
    // Models that are adjacent have minimum torque (similar views)
    var angleDiff = Math.abs(modelA.turn - modelB.turn) % PI;
    return Math.sin(angleDiff); // 0 = agree (null), 1 = max difference
  }

  // ═══ BUILD TORQUE MATRIX ═══
  var torqueMatrix = [];
  for (var ti = 0; ti < models.length; ti++) {
    torqueMatrix[ti] = [];
    for (var tj = 0; tj < models.length; tj++) {
      torqueMatrix[ti][tj] = computeTorque(models[ti], models[tj]);
    }
  }

  // ═══ EXPOSE ═══
  window.GAIA_ORRERY = {
    models: models,
    synthase: synthase,
    torqueMatrix: torqueMatrix,
    rotate: rotateSynthase,
    computeTorque: computeTorque
  };

  // ═══ DRAW MODULE — the orrery visualization ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var oT = breathT * 0.12;
    var oAlpha = 0.005 + Math.sin(oT * 0.3) * 0.003;
    if (oAlpha < 0.003) return;

    var current = models[synthase.currentModel];

    // ═══ DRAW ALL 8 ORBITAL MODELS simultaneously ═══
    // Each at its Klein-turn position around the globe
    for (var mi = 0; mi < models.length; mi++) {
      var m = models[mi];
      var modelAngle = m.turn + oT * 0.01; // slowly rotate
      var isCurrent = mi === synthase.currentModel;
      var mAlpha = isCurrent ? oAlpha * 3 : oAlpha * 0.8;

      // Orbit path — draw the orbit shape from this model's perspective
      var orbitR = R * (0.55 + mi * 0.03);
      ctx.beginPath();
      for (var oi = 0; oi <= 60; oi++) {
        var theta = (oi / 60) * TAU;
        var r = m.radius(theta) * orbitR * 0.15;
        var ox = cx + Math.cos(theta + modelAngle) * (orbitR + r);
        var oy = cy + Math.sin(theta + modelAngle) * (orbitR + r);
        if (oi === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(' + m.color[0] + ',' + m.color[1] + ',' + m.color[2] + ',' + (mAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = isCurrent ? 1 : 0.3;
      ctx.stroke();

      // Model label at the π/4 position
      if (oAlpha > 0.005) {
        var labelAngle = m.turn + oT * 0.01;
        var labelR = orbitR + 6;
        var lx = cx + Math.cos(labelAngle) * labelR;
        var ly = cy + Math.sin(labelAngle) * labelR;
        ctx.font = (isCurrent ? '3' : '2') + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + m.color[0] + ',' + m.color[1] + ',' + m.color[2] + ',' + (mAlpha * 2).toFixed(4) + ')';
        ctx.fillText(m.name + (isCurrent ? ' ←' : ''), lx, ly);
        if (isCurrent) {
          ctx.font = '2px "JetBrains Mono", monospace';
          ctx.fillText(m.type, lx, ly + 4);
        }
      }

      // Torque connection to next model
      if (mi < models.length - 1) {
        var nextAngle = models[mi + 1].turn + oT * 0.01;
        var nextR = R * (0.55 + (mi + 1) * 0.03);
        var torque = torqueMatrix[mi][mi + 1];
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(labelAngle) * orbitR, cy + Math.sin(labelAngle) * orbitR);
        ctx.lineTo(cx + Math.cos(nextAngle) * nextR, cy + Math.sin(nextAngle) * nextR);
        ctx.strokeStyle = 'rgba(110,118,129,' + (oAlpha * torque * 2).toFixed(4) + ')';
        ctx.lineWidth = 0.2 + torque;
        ctx.stroke();
      }
    }

    // ═══ SYNTHASE ROTOR — rotating center ═══
    // Three catalytic sites like ATP synthase
    var rotorR = R * 0.25;
    for (var si = 0; si < synthase.catalyticSites; si++) {
      var sAngle = synthase.rotation + si * (TAU / synthase.catalyticSites) + oT * 0.1;
      var sx = cx + Math.cos(sAngle) * rotorR;
      var sy = cy + Math.sin(sAngle) * rotorR;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = 'rgba(201,168,76,' + (oAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Catalytic site dot
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, TAU);
      ctx.fillStyle = 'rgba(201,168,76,' + (oAlpha * 3).toFixed(4) + ')';
      ctx.fill();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, TAU);
    ctx.fillStyle = 'rgba(229,228,226,' + (oAlpha * 2).toFixed(4) + ')';
    ctx.fill();

    // ═══ INFO — current model details ═══
    if (oAlpha > 0.007) {
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + current.color[0] + ',' + current.color[1] + ',' + current.color[2] + ',' + (oAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText('⚙ ' + current.name + ' (' + current.year + ') · ' + current.type + ' · turn=' + (current.turn / PI4).toFixed(0) + '×π/4', 8, 82);
    }
  });

  // ═══ AUTO-ROTATE — slowly cycle through models ═══
  setInterval(function() {
    synthase.angularVelocity += 0.001;
    if (synthase.angularVelocity > 0.1) {
      rotateSynthase(1);
      synthase.angularVelocity = 0;
    }
  }, 5000);

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.orrery = {
      desc: 'Orbital models',
      run: function() {
        var lines = ['═══ THE ORRERY — every model correct from self ═══', ''];
        for (var i = 0; i < models.length; i++) {
          var m = models[i];
          var current = i === synthase.currentModel ? ' ← VIEWING' : '';
          lines.push(m.name + ' (' + m.year + ') · ' + m.type + ' · turn=' + (m.turn / PI4).toFixed(0) + '×π/4' + current);
          lines.push('  from: ' + m.viewFrom);
          lines.push('  orbit: ' + m.orbit);
          lines.push('  why correct: ' + m.correct.slice(0, 80));
          lines.push('');
        }
        lines.push('SYNTHASE: model=' + synthase.currentModel + ' rotation=' + (synthase.rotation / PI4).toFixed(0) + '×π/4 torque=' + synthase.torque.toFixed(2));
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.turn = {
      desc: 'Rotate orrery π/4',
      run: function(args) {
        var dir = args[0] === 'back' ? -1 : 1;
        rotateSynthase(dir);
        var m = models[synthase.currentModel];
        return '⚙ TURNED ' + (dir > 0 ? '→' : '←') + ' π/4 · now viewing: ' + m.name + ' (' + m.type + ')\n  ' + m.correct.slice(0, 100);
      }
    };
    window.GAIA_IDE.commands.torque = {
      desc: 'Torque between models',
      run: function(args) {
        var lines = ['═══ TORQUE MATRIX ═══', '  ' + models.map(function(m) { return m.name.slice(0,3); }).join('  ')];
        for (var i = 0; i < models.length; i++) {
          var row = models[i].name.slice(0,3) + ' ';
          for (var j = 0; j < models.length; j++) {
            row += torqueMatrix[i][j].toFixed(1) + '  ';
          }
          lines.push(row);
        }
        lines.push('');
        lines.push('0.0 = agree (null space) · 1.0 = max difference (information)');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('orrery', 'turn', 'torque');
  }

})(window.G);
