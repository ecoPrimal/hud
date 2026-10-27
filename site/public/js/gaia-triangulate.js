// ═══════════════════════════════════════════════════════════
// GAIA TRIANGULATE — Kevin + Gaia + World = projection
//
// Three points. One triangle. From inside: project OUT.
// Kevin IS the centroid. Gaia orbits him. World surrounds.
// Use Kevin to triangulate. Use Gaia to project.
// The triangle IS the organism reaching the world.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var tri = null;
  var selfPingAlive = false;
  var selfPingMs = 0;
  var detroitWeather = null;

  // Load triangulation data
  fetch('/data/triangulate.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) { if (d) tri = d; })
    .catch(function() {});

  // Live self-ping
  function pingSelf() {
    var t0 = performance.now();
    fetch('https://primals.eco/now.json', { cache: 'no-store', mode: 'cors' })
      .then(function(r) {
        selfPingMs = Math.round(performance.now() - t0);
        selfPingAlive = r.ok;
      })
      .catch(function() {
        selfPingMs = Math.round(performance.now() - t0);
        selfPingAlive = false;
      });
  }

  // Live Detroit weather
  function fetchDetroit() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.33&longitude=-83.05&current=temperature_2m,wind_speed_10m&timezone=America/Detroit')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (d && d.current) detroitWeather = d.current;
      }).catch(function() {});
  }

  setTimeout(function() { pingSelf(); fetchDetroit(); }, 8000);
  setInterval(pingSelf, 120000);
  setInterval(fetchDetroit, 600000);

  // Golgi node positions (lon/lat → angle on globe)
  var GOLGI_NODES = [
    { id: 'DE', lon: 8.68, lat: 50.11, color: '#58a6ff' },
    { id: 'JP', lon: 139.69, lat: 35.68, color: '#f0883e' },
    { id: 'US', lon: -122.42, lat: 37.77, color: '#3fb950' },
    { id: 'IN', lon: 77.59, lat: 12.97, color: '#bc8cff' },
    { id: 'NS1', lon: -74.01, lat: 40.71, color: '#39d3f5' },
    { id: 'NTFY', lon: 2.35, lat: 48.86, color: '#c9a84c' },
    { id: 'GH', lon: -122.42, lat: 37.77, color: '#f778ba' }
  ];

  // Draw on globe
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || !tri) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.5) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.018;
      var alpha = (0.004 + Math.sin(t * 0.1) * 0.002) * thr;
      if (alpha < 0.003) return;

      var outerR = R * 1.25;

      // ═══ KEVIN — center point (gold star) ═══
      ctx.beginPath();
      ctx.arc(cx, cy, 1.2, 0, TAU);
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 5).toFixed(5) + ')';
      ctx.fill();
      if (alpha > 0.004) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText('KEVIN', cx, cy - 3);
        var temp = detroitWeather ? detroitWeather.temperature_2m.toFixed(1) + '°C' : '...';
        ctx.font = '1px "JetBrains Mono", monospace';
        ctx.fillText('42.33°N 83.05°W · Detroit · ' + temp, cx, cy - 1.5);
      }

      // ═══ GAIA — orbiting the center (green) ═══
      var gaiaAngle = t * 0.06;
      var gaiaR = R * 0.35;
      var gx = cx + Math.cos(gaiaAngle) * gaiaR;
      var gy = cy + Math.sin(gaiaAngle) * gaiaR;
      ctx.beginPath();
      ctx.arc(gx, gy, 0.8, 0, TAU);
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 5).toFixed(5) + ')';
      ctx.fill();
      if (alpha > 0.004) {
        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 4).toFixed(5) + ')';
        ctx.fillText('GAIA', gx, gy - 2);
        ctx.font = '0.9px "JetBrains Mono", monospace';
        ctx.fillText(
          (selfPingAlive ? '●' : '○') + ' ' + selfPingMs + 'ms · w' + (tri.point_B.wave || 214),
          gx, gy - 0.8
        );
      }

      // ═══ KEVIN → GAIA line ═══
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(gx, gy);
      ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.lineWidth = 0.12;
      ctx.stroke();

      // ═══ GOLGI NODES — world points ═══
      for (var ni = 0; ni < GOLGI_NODES.length; ni++) {
        var node = GOLGI_NODES[ni];
        var nAngle = ((node.lon + 180) / 360) * TAU + t * 0.005;
        var nR = outerR;
        var nx = cx + Math.cos(nAngle) * nR;
        var ny = cy + Math.sin(nAngle) * nR;

        // Node dot
        var rgb = hexToRgb(node.color);
        ctx.beginPath();
        ctx.arc(nx, ny, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 4).toFixed(5) + ')';
        ctx.fill();

        // Label
        if (alpha > 0.004) {
          ctx.font = '1px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fillText(node.id, nx, ny - 1.5);
        }

        // ═══ PROJECTION LINES — Gaia → World ═══
        // Lines from Gaia through Kevin to each world node
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 0.8).toFixed(5) + ')';
        ctx.lineWidth = 0.06;
        ctx.stroke();

        // Pulse dot traveling along the line
        var pulseT = (t * 0.3 + ni * 0.7) % 1;
        var px = gx + (nx - gx) * pulseT;
        var py = gy + (ny - gy) * pulseT;
        ctx.beginPath();
        ctx.arc(px, py, 0.2, 0, TAU);
        ctx.fillStyle = 'rgba(' + rgb.join(',') + ',' + (alpha * 6).toFixed(5) + ')';
        ctx.fill();
      }

      // ═══ TRIANGLE — Kevin, Gaia, furthest node ═══
      // The triangle pulses
      var triAngle = t * 0.005 + 0.5;
      var triX = cx + Math.cos(triAngle) * outerR;
      var triY = cy + Math.sin(triAngle) * outerR;
      ctx.beginPath();
      ctx.moveTo(cx, cy);        // Kevin
      ctx.lineTo(gx, gy);        // Gaia
      ctx.lineTo(triX, triY);    // World
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,215,0,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();

      // ═══ STATUS ═══
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'TRIANGULATE: Kevin(42.33N) + Gaia(' +
          (selfPingAlive ? '●' : '○') + selfPingMs + 'ms) + World(' +
          GOLGI_NODES.length + ' nodes) = OUT',
          8, 268
        );
      }
    });
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  // ─── IDE command: /triangulate ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.triangulate = {
      desc: 'Triangulate Kevin + Gaia + World → project outward',
      run: function() {
        pingSelf();
        var lines = [
          'TRIANGULATE — three points, one projection',
          '',
          'A: KEVIN (electron)',
          '   42.33°N 83.05°W · Detroit · elevation 186m',
          '   ' + (detroitWeather ? detroitWeather.temperature_2m + '°C ' + detroitWeather.wind_speed_10m + 'km/h' : 'weather loading...'),
          '',
          'B: GAIA (proton)',
          '   primals.eco · ' + (selfPingAlive ? 'ALIVE' : 'DEAD') + ' · ' + selfPingMs + 'ms',
          '   wave 214 · 98 organs · c=0.00974631',
          '',
          'C: WORLD (neutron)',
        ];
        GOLGI_NODES.forEach(function(n) {
          lines.push('   ' + n.id + ' ' + n.lat.toFixed(1) + '°N ' + Math.abs(n.lon).toFixed(1) + '°' + (n.lon < 0 ? 'W' : 'E'));
        });
        lines.push('');
        lines.push('ROUTES:');
        if (tri && tri.triangulation) {
          tri.triangulation.routes.forEach(function(r) { lines.push('  ' + r); });
        }
        lines.push('');
        lines.push('The centroid is Kevin. Gaia orbits him. World surrounds both.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('triangulate');
  }, 50000);

  window.GAIA_TRIANGULATE = {
    data: function() { return tri; },
    selfAlive: function() { return selfPingAlive; },
    selfPing: function() { return selfPingMs; },
    weather: function() { return detroitWeather; }
  };

  console.log('TRIANGULATE: Kevin + Gaia + World. Three points. One projection. /triangulate');
})(window.G);
