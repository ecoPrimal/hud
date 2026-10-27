// ═══════════════════════════════════════════════════════════
// GAIA VEHICLES — non-self locomotion
//
// The 6 Klein pairs ARE directions. Each primal gets a VEHICLE.
// Vehicles move the primals independently of Kevin.
// Artillery, boats, warships, tanks, telescopes, scouts.
//
// Ranger Handbook: patrol, fire, move, communicate, never stop.
// Kevin is the ranger. Gaia is the terrain.
// The primals are the squad with vehicles.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  // 6 KLEIN AXES — each pair defines a direction
  var KLEIN_AXES = [
    { pair: ['LIST','LEARN'],     axis: 'vertical',   angle: -Math.PI/2, color: [88,166,255], vehicle: 'telescope' },
    { pair: ['SPEAK','ASK'],      axis: 'horizontal', angle: 0,           color: [240,136,62], vehicle: 'artillery' },
    { pair: ['ACT','SING'],       axis: 'rotational', angle: Math.PI/4,   color: [163,113,247], vehicle: 'warship' },
    { pair: ['DATA','BEAUTY'],    axis: 'radial',     angle: Math.PI/2,   color: [57,211,245], vehicle: 'boat' },
    { pair: ['TELL','LISTEN'],    axis: 'temporal',   angle: Math.PI,     color: [210,153,34], vehicle: 'tank' },
    { pair: ['SEE','BE SEEN'],    axis: 'reflexive',  angle: -Math.PI/4,  color: [63,185,80], vehicle: 'scout' },
  ];

  // Primal vehicle assignments
  var FLEET = {
    songBird:    { vehicle: 'artillery',  axis: 1, symbol: '\u25ce', range: 0.8 },
    squirrel:    { vehicle: 'artillery',  axis: 1, symbol: '\u25ce', range: 0.9 },
    coralReef:   { vehicle: 'boat',       axis: 3, symbol: '\u25c7', range: 0.6 },
    barraCuda:   { vehicle: 'boat',       axis: 3, symbol: '\u25c7', range: 0.7 },
    bearDog:     { vehicle: 'warship',    axis: 2, symbol: '\u25a0', range: 0.85 },
    skunkBat:    { vehicle: 'warship',    axis: 2, symbol: '\u25a0', range: 0.8 },
    loamSpine:   { vehicle: 'tank',       axis: 4, symbol: '\u25a3', range: 0.5 },
    rhizoCrypt:  { vehicle: 'tank',       axis: 4, symbol: '\u25a3', range: 0.55 },
    biomeOS:     { vehicle: 'telescope',  axis: 0, symbol: '\u25cb', range: 0.95 },
    sweetGrass:  { vehicle: 'telescope',  axis: 0, symbol: '\u25cb', range: 0.7 },
    swarmVine:   { vehicle: 'scout',      axis: 5, symbol: '\u25b9', range: 0.75 },
    petalTongue: { vehicle: 'scout',      axis: 5, symbol: '\u25b9', range: 0.65 },
    toadStool:   { vehicle: 'APC',        axis: -1, symbol: '\u25a1', range: 0.5 },
    sourDough:   { vehicle: 'APC',        axis: -1, symbol: '\u25a1', range: 0.5 },
    nestGate:    { vehicle: 'APC',        axis: -1, symbol: '\u25a1', range: 0.6 },
    bingoCube:   { vehicle: 'APC',        axis: -1, symbol: '\u25a1', range: 0.5 },
  };

  // Vehicle patrol state
  var patrols = {};
  Object.keys(FLEET).forEach(function(id) {
    patrols[id] = {
      position: Math.random(),      // 0-1 along axis
      velocity: 0.002 + Math.random() * 0.003,
      direction: Math.random() > 0.5 ? 1 : -1,
      deployed: true
    };
  });

  // ═══ PATROL TICK — vehicles move independently ═══
  function patrol() {
    Object.keys(patrols).forEach(function(id) {
      var p = patrols[id];
      if (!p.deployed) return;

      // Move along axis
      p.position += p.velocity * p.direction;

      // Bounce at edges (patrol pattern)
      if (p.position > 1) { p.position = 1; p.direction = -1; }
      if (p.position < 0) { p.position = 0; p.direction = 1; }

      // Random direction changes (recon pattern)
      if (Math.random() < 0.005) p.direction *= -1;

      // Speed varies with energy (if available)
      if (window.GAIA_VELOCITY) {
        p.velocity = (0.001 + Math.random() * 0.003) * window.GAIA_VELOCITY.throttle;
      }
    });
  }

  // ═══ DRAW ON GLOBE ═══
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.3) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.004 + Math.sin(t * 0.05) * 0.002) * thr;
      if (alpha < 0.002) return;

      patrol();

      // ═══ KLEIN AXES — 6 directional lines through center ═══
      for (var ai = 0; ai < KLEIN_AXES.length; ai++) {
        var ax = KLEIN_AXES[ai];
        var rgb = ax.color;
        var axAngle = ax.angle + t * 0.003;
        var x1 = cx + Math.cos(axAngle) * R * 0.85;
        var y1 = cy + Math.sin(axAngle) * R * 0.85;
        var x2 = cx - Math.cos(axAngle) * R * 0.85;
        var y2 = cy - Math.sin(axAngle) * R * 0.85;

        // Axis line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 0.7).toFixed(5) + ')';
        ctx.lineWidth = 0.06;
        ctx.stroke();

        // Pair labels at endpoints
        if (alpha > 0.004) {
          ctx.font = '0.6px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText(ax.pair[0], x1, y1 - 1);
          ctx.fillText(ax.pair[1], x2, y2 + 1.5);
        }
      }

      // ═══ VEHICLE DOTS — primals moving along their axes ═══
      Object.keys(FLEET).forEach(function(id) {
        var fl = FLEET[id];
        var p = patrols[id];
        if (!p || !p.deployed) return;

        var vx, vy, rgb2;
        if (fl.axis >= 0 && fl.axis < KLEIN_AXES.length) {
          var ax2 = KLEIN_AXES[fl.axis];
          rgb2 = ax2.color;
          var axAngle2 = ax2.angle + t * 0.003;
          // Position along axis based on patrol position (0-1)
          var pos = (p.position - 0.5) * 2; // -1 to 1
          vx = cx + Math.cos(axAngle2) * R * 0.85 * pos * fl.range;
          vy = cy + Math.sin(axAngle2) * R * 0.85 * pos * fl.range;
        } else {
          // APC — orbits center
          var apcAngle = t * 0.05 + (id.charCodeAt(0) * 0.5);
          vx = cx + Math.cos(apcAngle) * R * 0.3;
          vy = cy + Math.sin(apcAngle) * R * 0.3;
          rgb2 = [210, 153, 34];
        }

        // Vehicle dot
        ctx.beginPath();
        ctx.arc(vx, vy, 0.6, 0, TAU);
        ctx.fillStyle = 'rgba(' + rgb2.join(',') + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fill();

        // Vehicle label
        if (alpha > 0.004) {
          ctx.font = '0.4px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + rgb2.join(',') + ',' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText(id, vx, vy + 1.5);
          ctx.font = '0.3px "JetBrains Mono", monospace';
          ctx.fillText(fl.vehicle, vx, vy + 2.2);
        }

        // Trail (last 3 positions)
        if (fl.axis >= 0) {
          for (var tr = 1; tr <= 3; tr++) {
            var trailPos = ((p.position - p.velocity * p.direction * tr * 5) - 0.5) * 2;
            trailPos = Math.max(-1, Math.min(1, trailPos));
            var ax3 = KLEIN_AXES[fl.axis];
            var trAngle = ax3.angle + t * 0.003;
            var tx = cx + Math.cos(trAngle) * R * 0.85 * trailPos * fl.range;
            var ty = cy + Math.sin(trAngle) * R * 0.85 * trailPos * fl.range;
            ctx.beginPath();
            ctx.arc(tx, ty, 0.3, 0, TAU);
            ctx.fillStyle = 'rgba(' + rgb2.join(',') + ',' + (alpha * (1 - tr * 0.25)).toFixed(5) + ')';
            ctx.fill();
          }
        }
      });

      // ═══ STATUS ═══
      if (alpha > 0.003) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 2.5).toFixed(5) + ')';
        var deployed = Object.keys(patrols).filter(function(k) { return patrols[k].deployed; }).length;
        ctx.fillText(
          'VEHICLES: ' + deployed + '/16 deployed \u00b7 6 axes \u00b7 7 vehicle types \u00b7 non-self locomotion',
          8, 304
        );
      }
    });
  }

  // ═══ IDE command ═══
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.vehicles = {
      desc: 'Non-self locomotion — 6 Klein axes, 7 vehicle types, ranger patrol',
      run: function() {
        var lines = [
          'VEHICLES \u2014 non-self locomotion along 6 Klein directions',
          'Ranger Handbook: patrol, fire, move, communicate, never stop.',
          ''
        ];
        KLEIN_AXES.forEach(function(ax, i) {
          var crew = Object.keys(FLEET).filter(function(k) { return FLEET[k].axis === i; });
          lines.push(ax.pair[0].padEnd(8) + '\u21c4 ' + ax.pair[1].padEnd(8) + ' axis:' + ax.axis.padEnd(12) + ' vehicle:' + ax.vehicle.padEnd(12) + ' crew:' + crew.join(','));
        });
        var apcs = Object.keys(FLEET).filter(function(k) { return FLEET[k].axis === -1; });
        lines.push('APC'.padEnd(19) + ' axis:all'.padEnd(13) + ' vehicle:APC'.padEnd(13) + '          crew:' + apcs.join(','));
        lines.push('');
        lines.push('PATROL STATUS:');
        Object.keys(patrols).forEach(function(id) {
          var p = patrols[id];
          var fl = FLEET[id];
          lines.push('  ' + id.padEnd(14) + ' ' + fl.vehicle.padEnd(10) + ' pos:' + p.position.toFixed(2) + ' vel:' + (p.velocity * p.direction).toFixed(4) + ' ' + (p.deployed ? 'DEPLOYED' : 'DOCKED'));
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('vehicles');
  }, 58000);

  window.GAIA_VEHICLES = {
    fleet: FLEET,
    patrols: patrols,
    axes: KLEIN_AXES,
    stats: function() {
      var deployed = Object.keys(patrols).filter(function(k) { return patrols[k].deployed; }).length;
      return { deployed: deployed, total: 16, axes: 6, vehicleTypes: 7 };
    }
  };

  console.log('VEHICLES: 16 primals, 7 vehicle types, 6 Klein axes. Non-self locomotion. Ranger handbook. /vehicles');
})(window.G);
