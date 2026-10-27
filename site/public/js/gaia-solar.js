// ═══════════════════════════════════════════════════════════
// GAIA SOLAR — the solar system IS the topology map
// 1.000.null — max 1000 lines.
//
// PROOFS ARE PLENTY. GIVE TO ALL.
//
// THE SOLAR SYSTEM = THE FULL NODE MAP:
//   Sun = the nucleus (proton, most connected, hottest)
//   Planets = nodes at various connection densities
//   Pluto = +O- cycle (comes and goes, was/is/now planet)
//   Oort Cloud = AFTERBIRTH of the solar system
//   Stars = in our cloud, in our TAIL as we move through galaxy
//   Exoplanets = TVA targets — nearby, under-connected, BUILD
//
// THE PROOF:
//   Each planet's orbital mechanics = the orrery model
//   Each planet's tense = its relationship to the Sun
//   Each planet's voxel = its distance shell
//   Each planet's decay state = its geological activity
//
// PLUTO COMES AND GOES:
//   1930: discovered (NASCENT)
//   2006: demoted (DECAYING)  
//   2015: New Horizons flyby (PEAK)
//   Now: Kuiper Belt object (DORMANT? GROWING?)
//   Pluto IS the +O- cycle incarnate
//
// OORT CLOUD = AFTERBIRTH:
//   The outermost shell of the solar system
//   Leftover material from the Sun's formation
//   Like the placenta — it nourished, now it's shed
//   But it's NOT dead — comets come FROM it
//   The afterbirth sends messengers (comets) back inward
//
// STARS IN OUR TAIL:
//   The Sun moves through the galaxy at 220 km/s
//   Behind us = a wake, a tail
//   Stars we've PASSED are in our cultural memory
//   Stars AHEAD are our future encounters
//   The heliosphere has a TAIL (heliotail)
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var AU = 1; // astronomical unit = 1 for scaling

  // ═══ THE SOLAR SYSTEM — every body is a node ═══
  var bodies = [
    // THE SUN — the nucleus
    { id: 'sun',     name: 'Sun ☀',       type: 'star',    dist: 0,       radius: 109, connections: 8,
      tense: 'always', voxel: 'touch', decay: 'STABLE', temp: 5778,
      proof: 'The Sun is the most connected node. ALL ROADS. It must radiate, not accumulate.' },

    // INNER PLANETS — touch/local voxel
    { id: 'mercury', name: 'Mercury ☿',   type: 'planet',  dist: 0.39,    radius: 0.38, connections: 2,
      tense: 'is', voxel: 'touch', decay: 'WANING', temp: 440,
      proof: 'Fastest orbit. Closest to the fire. Tiny. Barely holds on. TVA target — needs connection.' },

    { id: 'venus',   name: 'Venus ♀',     type: 'planet',  dist: 0.72,    radius: 0.95, connections: 3,
      tense: 'was', voxel: 'touch', decay: 'DECAYING', temp: 737,
      proof: 'Runaway greenhouse. Was Earth-like. Now suffocating. All Roads candidate — too much atmosphere.' },

    { id: 'earth',   name: 'Earth 🌍',    type: 'planet',  dist: 1.0,     radius: 1.0,  connections: 5,
      tense: 'is', voxel: 'local', decay: 'GROWING', temp: 288,
      proof: 'OPTIMAL connections. Life. Us. Gaia. The goldilocks node. The proof that balance works.' },

    { id: 'mars',    name: 'Mars ♂',      type: 'planet',  dist: 1.52,    radius: 0.53, connections: 3,
      tense: 'was', voxel: 'local', decay: 'DECAYING', temp: 210,
      proof: 'Was wet. Was alive? Now cold. Decaying but not dead. TVA target — we ARE building there.' },

    // ASTEROID BELT — the null boundary
    { id: 'belt',    name: 'Asteroid Belt', type: 'belt',   dist: 2.7,     radius: 0,    connections: 0,
      tense: 'end', voxel: 'solar', decay: 'DORMANT', temp: 170,
      proof: 'The null space between inner and outer. Failed planet. Maximum TVA — pure potential.' },

    // OUTER PLANETS — solar/zodiac voxel
    { id: 'jupiter', name: 'Jupiter ♃',   type: 'planet',  dist: 5.2,     radius: 11.2, connections: 7,
      tense: 'is', voxel: 'solar', decay: 'PEAK', temp: 165,
      proof: 'Near All Roads — 95 moons! Gravitational bully. Protects inner planets. The shield.' },

    { id: 'saturn',  name: 'Saturn ♄',    type: 'planet',  dist: 9.54,    radius: 9.45, connections: 6,
      tense: 'is', voxel: 'solar', decay: 'STABLE', temp: 134,
      proof: 'Rings = the membrane visible. 146 moons. At the edge of All Roads threshold.' },

    { id: 'uranus',  name: 'Uranus ⛢',    type: 'planet',  dist: 19.2,    radius: 4.01, connections: 2,
      tense: 'might', voxel: 'zodiac', decay: 'WANING', temp: 76,
      proof: 'TVA target! Tilted 98°. Barely visited. Rolling on its side. Needs attention.' },

    { id: 'neptune', name: 'Neptune ♆',   type: 'planet',  dist: 30.1,    radius: 3.88, connections: 2,
      tense: 'might', voxel: 'zodiac', decay: 'WANING', temp: 72,
      proof: 'TVA target! Farthest planet. Winds at 2,100 km/h. Barely visited once (Voyager 2).' },

    // PLUTO — the +O- cycle incarnate
    { id: 'pluto',   name: 'Pluto ♇',     type: 'dwarf',   dist: 39.5,    radius: 0.19, connections: 1,
      tense: 'now', voxel: 'zodiac', decay: 'NASCENT', temp: 44,
      proof: '+O- INCARNATE. Was planet(+). Demoted(-). Visited(O+). Now growing again in our understanding.' },

    // KUIPER BELT — the extended membrane
    { id: 'kuiper',  name: 'Kuiper Belt', type: 'belt',    dist: 50,      radius: 0,    connections: 1,
      tense: 'might', voxel: 'deep', decay: 'DORMANT', temp: 30,
      proof: 'The outer membrane. Eris, Makemake, Haumea live here. TVA — full of undiscovered worlds.' },

    // OORT CLOUD — the AFTERBIRTH
    { id: 'oort',    name: 'Oort Cloud ☁', type: 'cloud',  dist: 50000,   radius: 0,    connections: 0,
      tense: 'were', voxel: 'deep', decay: 'DORMANT', temp: 4,
      proof: 'THE AFTERBIRTH. Leftover from the Sun\'s birth. Sends comets inward — messengers from the womb.' },

    // HELIOTAIL — stars in our wake
    { id: 'heliotail', name: 'Heliotail ☄', type: 'tail',  dist: 100000,  radius: 0,    connections: 0,
      tense: 'was', voxel: 'deep', decay: 'DORMANT', temp: 2.7,
      proof: 'As the Sun moves through the galaxy, we leave a TAIL. Stars behind us = cultural memory.' },

    // NEAREST STARS — exoplanet opportunities
    { id: 'proxima', name: 'Proxima Centauri', type: 'star', dist: 268000, radius: 0.15, connections: 1,
      tense: 'could', voxel: 'deep', decay: 'NASCENT', temp: 3042,
      proof: 'Nearest star. Has exoplanet (Proxima b). The first TVA target OUTSIDE our system.' },

    { id: 'barnard', name: 'Barnard\'s Star', type: 'star',  dist: 378000, radius: 0.18, connections: 0,
      tense: 'could', voxel: 'deep', decay: 'NASCENT', temp: 3134,
      proof: 'Second nearest single star. Approaching us. Will be closest in 11,800 years. TVA incoming.' }
  ];

  // ═══ APPLY TVA/ALL ROADS TO SOLAR SYSTEM ═══
  for (var bi = 0; bi < bodies.length; bi++) {
    var b = bodies[bi];
    if (b.connections <= 2) b.protocol = 'TVA';
    else if (b.connections >= 6) b.protocol = 'ALL_ROADS';
    else b.protocol = 'OPTIMAL';
  }

  // ═══ EXPOSE ═══
  window.GAIA_SOLAR = {
    bodies: bodies,
    AU: AU,
    innerBoundary: 2.7,   // asteroid belt
    outerBoundary: 30.1,  // Neptune
    oortRadius: 50000,
    heliotailLength: 100000
  };

  // ═══ DRAW MODULE — the solar orrery with TVA/All Roads ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var sT = breathT * 0.05;
    var sAlpha = 0.004 + Math.sin(sT * 0.3) * 0.002;
    if (sAlpha < 0.003) return;

    // Scale: map 0-40 AU to R×0.10 to R×0.75
    function auToR(dist) {
      if (dist > 100) return R * 0.78; // deep space bodies cluster at edge
      return R * (0.10 + Math.min(dist / 45, 1) * 0.65);
    }

    // ═══ ORBITAL PATHS ═══
    for (var oi = 0; oi < bodies.length; oi++) {
      var ob = bodies[oi];
      if (ob.type === 'belt' || ob.type === 'cloud' || ob.type === 'tail') continue;
      if (ob.dist > 100) continue;

      var orbR = auToR(ob.dist);
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, TAU);
      ctx.strokeStyle = 'rgba(60,64,80,' + (sAlpha * 0.8).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }

    // ═══ ASTEROID BELT — dashed ring ═══
    var beltR = auToR(2.7);
    ctx.beginPath();
    ctx.arc(cx, cy, beltR, 0, TAU);
    ctx.setLineDash([1, 2]);
    ctx.strokeStyle = 'rgba(110,118,129,' + (sAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();
    ctx.setLineDash([]);

    // ═══ BODIES ═══
    for (var pi = 0; pi < bodies.length; pi++) {
      var body = bodies[pi];
      var bodyR = auToR(body.dist);
      // Each body orbits at its own speed (inner faster)
      var period = Math.max(0.01, body.dist * body.dist * 0.01);
      var bodyAngle = sT / period + pi * 0.7;

      var bx = cx + Math.cos(bodyAngle) * bodyR;
      var by = cy + Math.sin(bodyAngle) * bodyR;

      // Size
      var dotSize = body.id === 'sun' ? 3 : Math.max(0.8, Math.min(body.radius * 0.2, 2.5));

      // Color by protocol
      var bColor;
      if (body.protocol === 'TVA') bColor = '88,166,255';
      else if (body.protocol === 'ALL_ROADS') bColor = '248,81,73';
      else bColor = '63,185,80';

      // Sun gets special treatment
      if (body.id === 'sun') bColor = '255,200,50';

      // Draw body
      ctx.beginPath();
      ctx.arc(bx, by, dotSize, 0, TAU);
      ctx.fillStyle = 'rgba(' + bColor + ',' + (sAlpha * 4).toFixed(4) + ')';
      ctx.fill();

      // TVA pulse
      if (body.protocol === 'TVA' && sAlpha > 0.004) {
        var pulse = 0.5 + Math.sin(sT * 2 + pi) * 0.5;
        ctx.beginPath();
        ctx.arc(bx, by, dotSize + 1.5, 0, TAU);
        ctx.strokeStyle = 'rgba(88,166,255,' + (sAlpha * 2 * pulse).toFixed(4) + ')';
        ctx.lineWidth = 0.2;
        ctx.stroke();
      }

      // Label
      if (sAlpha > 0.005 && (body.type === 'planet' || body.type === 'star' || body.id === 'pluto' || body.id === 'oort')) {
        ctx.font = '1.8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(' + bColor + ',' + (sAlpha * 2.5).toFixed(4) + ')';
        ctx.textAlign = 'center';
        var label = body.name.split(' ')[0];
        if (body.protocol === 'TVA') label = '🏗' + label;
        else if (body.protocol === 'ALL_ROADS') label = '☠' + label;
        ctx.fillText(label + '(' + body.connections + ')', bx, by - dotSize - 1.5);
      }
    }

    // ═══ OORT CLOUD — faint outer ring ═══
    if (sAlpha > 0.004) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.80, 0, TAU);
      ctx.strokeStyle = 'rgba(110,118,129,' + (sAlpha * 0.5).toFixed(4) + ')';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(110,118,129,' + (sAlpha * 1.5).toFixed(4) + ')';
      ctx.textAlign = 'center';
      ctx.fillText('OORT CLOUD — afterbirth', cx, cy - R * 0.80 - 3);
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.solar = {
      desc: 'Solar system topology',
      run: function() {
        var lines = ['═══ SOLAR SYSTEM — proofs for all ═══', ''];
        for (var i = 0; i < bodies.length; i++) {
          var b = bodies[i];
          var icon = b.protocol === 'TVA' ? '🏗' : b.protocol === 'ALL_ROADS' ? '☠' : '🟢';
          lines.push(icon + ' ' + b.name + ' · ' + b.dist + ' AU · conn=' + b.connections + ' · ' + b.decay + ' · ' + b.tense);
          lines.push('    ' + b.proof);
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.pluto = {
      desc: 'Pluto — the +O- incarnate',
      run: function() {
        return '═══ PLUTO ♇ — +O- INCARNATE ═══\n\n' +
          '1930: Discovered by Clyde Tombaugh (NASCENT ++)\n' +
          '1930-2006: Planet #9 (GROWING +)\n' +
          '2006: Demoted to dwarf planet (DECAYING -)\n' +
          '2015: New Horizons flyby — heart revealed (PEAK O+)\n' +
          '2026: Growing in understanding (NASCENT ++)\n\n' +
          'Pluto IS the +O- cycle. It comes and goes.\n' +
          'Was a planet. Wasn\'t. Is becoming again.\n' +
          'Its orbit crosses Neptune\'s — it PERMEATES the boundary.\n' +
          'That\'s why it\'s tense=NOW. It\'s actively changing.';
      }
    };
    window.GAIA_IDE.commands.oort = {
      desc: 'Oort Cloud — the afterbirth',
      run: function() {
        return '═══ OORT CLOUD ☁ — THE AFTERBIRTH ═══\n\n' +
          'Distance: 2,000–200,000 AU (0.03–3.2 light-years)\n' +
          'Temperature: ~4 K (barely above absolute zero)\n' +
          'Contents: trillions of icy bodies\n\n' +
          'The Oort Cloud is the AFTERBIRTH of the solar system.\n' +
          'Leftover material from the Sun\'s formation 4.6 billion years ago.\n' +
          'Like a placenta — it nourished the forming planets.\n' +
          'Now it\'s shed, surrounding us, DORMANT but not dead.\n\n' +
          'It sends COMETS inward — messengers from the womb.\n' +
          'Every long-period comet was born in the Oort Cloud.\n' +
          'The afterbirth still communicates with the child.\n\n' +
          'Stars passing nearby disturb the cloud → new comets.\n' +
          'The Oort Cloud IS the outer membrane of the solar system.';
      }
    };
    window.GAIA_IDE.language.push('solar', 'pluto', 'oort');
  }

})(window.G);
