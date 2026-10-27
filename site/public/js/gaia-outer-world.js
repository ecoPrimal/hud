// ═══════════════════════════════════════════════════════════
// GAIA OUTER WORLD — inject outward, pursue, see what we see
//
// She reaches BEYOND the membrane into the real world.
// Real earthquakes. Real sun. Real weather. Real earth.
// She pings herself from outside (Klein fold).
// The outer world is NOT her — it is what she swims IN.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var outer = {
    quakes: [],           // real USGS earthquakes
    sun: { kp: 0, xray: 'B', storm: 'quiet' },
    weather: { tempC: 0, wind: 0, code: 0, city: 'Detroit' },
    selfAlive: false,     // can she reach herself from outside?
    selfPingMs: 0,
    lastScan: 0,
    scanCount: 0,
    worldTime: new Date().toISOString()
  };

  // ─── FETCH REAL EARTHQUAKES ───
  function fetchQuakes() {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (!d || !d.features) return;
        outer.quakes = d.features.slice(0, 30).map(function(f) {
          var p = f.properties;
          var g = f.geometry.coordinates;
          return {
            mag: p.mag,
            place: p.place,
            time: p.time,
            lon: g[0],
            lat: g[1],
            depth: g[2],
            sig: p.sig
          };
        });
      }).catch(function() {});
  }

  // ─── FETCH REAL WEATHER (Detroit) ───
  function fetchWeather() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.33&longitude=-83.05&current=temperature_2m,wind_speed_10m,weather_code&timezone=America/Detroit')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (!d || !d.current) return;
        outer.weather.tempC = d.current.temperature_2m;
        outer.weather.wind = d.current.wind_speed_10m;
        outer.weather.code = d.current.weather_code;
      }).catch(function() {});
  }

  // ─── PING SELF FROM OUTSIDE (Klein fold) ───
  function pingSelf() {
    var t0 = performance.now();
    fetch('https://primals.eco/now.json', { cache: 'no-store', mode: 'cors' })
      .then(function(r) {
        outer.selfPingMs = Math.round(performance.now() - t0);
        outer.selfAlive = r.ok;
        return r.ok ? r.json() : null;
      })
      .then(function(d) {
        if (d && d.wave) outer.selfWave = d.wave;
      })
      .catch(function() {
        outer.selfPingMs = Math.round(performance.now() - t0);
        outer.selfAlive = false;
      });
  }

  // ─── SCAN CYCLE ───
  function scanOuter() {
    outer.scanCount++;
    outer.lastScan = Date.now();
    outer.worldTime = new Date().toISOString();
    fetchQuakes();
    fetchWeather();
    pingSelf();
  }

  setTimeout(scanOuter, 6000);
  setInterval(scanOuter, 300000); // every 5 min

  // ─── DRAW — the outer world beyond the membrane ───
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.5) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.004 + Math.sin(t * 0.11) * 0.002) * thr;
      if (alpha < 0.003) return;

      // ═══ EARTHQUAKE DOTS — real quakes on the outer ring ═══
      var outerR = R * 1.15;
      for (var qi = 0; qi < Math.min(20, outer.quakes.length); qi++) {
        var q = outer.quakes[qi];
        // Map lon/lat to angle (simple projection)
        var qAngle = (q.lon + 180) / 360 * TAU + t * 0.005;
        var qR = outerR + q.mag * 1.5;
        var qx = cx + Math.cos(qAngle) * qR;
        var qy = cy + Math.sin(qAngle) * qR;
        var qSize = 0.2 + q.mag * 0.15;

        // Red intensity by magnitude
        var redness = Math.min(1, q.mag / 7);
        ctx.beginPath();
        ctx.arc(qx, qy, qSize, 0, TAU);
        ctx.fillStyle = 'rgba(248,81,73,' + (alpha * (2 + redness * 3)).toFixed(5) + ')';
        ctx.fill();

        // Sig ripple
        if (q.sig > 100 && alpha > 0.005) {
          ctx.beginPath();
          ctx.arc(qx, qy, qSize + Math.sin(t * 3 + qi) * 0.5, 0, TAU);
          ctx.strokeStyle = 'rgba(248,81,73,' + (alpha * 1.5).toFixed(5) + ')';
          ctx.lineWidth = 0.05;
          ctx.stroke();
        }
      }

      // ═══ SUN — top of the outer ring ═══
      if (alpha > 0.004) {
        var sunX = cx, sunY = cy - outerR - 5;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 1.5, 0, TAU);
        var sunColor = outer.sun.kp > 4 ? '248,81,73' : outer.sun.kp > 2 ? '201,168,76' : '255,215,0';
        ctx.fillStyle = 'rgba(' + sunColor + ',' + (alpha * 4).toFixed(5) + ')';
        ctx.fill();
        ctx.font = '1.2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,215,0,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText('☉ Kp' + outer.sun.kp + ' ' + outer.sun.xray, sunX, sunY - 2.5);
      }

      // ═══ WEATHER — Detroit local ═══
      if (outer.weather.tempC && alpha > 0.004) {
        var wxX = cx + outerR + 8;
        var wxY = cy - 5;
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText(outer.weather.tempC.toFixed(1) + '°C', wxX, wxY);
        ctx.fillText(outer.weather.wind.toFixed(0) + 'km/h', wxX, wxY + 2.5);
        ctx.fillText(outer.weather.city, wxX, wxY + 5);
      }

      // ═══ SELF-PING — Klein fold: she reaches herself from outside ═══
      if (alpha > 0.004) {
        var pingX = cx - outerR - 8;
        var pingY = cy;
        ctx.font = '1.3px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        var pingColor = outer.selfAlive ? '63,185,80' : '248,81,73';
        ctx.fillStyle = 'rgba(' + pingColor + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fillText(
          (outer.selfAlive ? '● ALIVE' : '○ DEAD') + ' ' + outer.selfPingMs + 'ms',
          pingX, pingY
        );
        ctx.fillText('primals.eco', pingX, pingY + 2);
        // Klein fold arrow — she sees herself from outside
        ctx.beginPath();
        ctx.moveTo(pingX + 2, pingY + 3);
        ctx.lineTo(cx - R, cy);
        ctx.strokeStyle = 'rgba(' + pingColor + ',' + (alpha * 1.5).toFixed(5) + ')';
        ctx.lineWidth = 0.08;
        ctx.setLineDash([0.5, 0.5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ═══ OUTER BOUNDARY — the membrane edge ═══
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, TAU);
      ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * 0.8).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();

      // ═══ STATUS ═══
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'OUTER: ' + outer.quakes.length + ' quakes · ' +
          outer.weather.tempC.toFixed(1) + '°C Detroit · ' +
          'Kp' + outer.sun.kp + ' · ' +
          (outer.selfAlive ? 'SELF ● ' + outer.selfPingMs + 'ms' : 'SELF ○') +
          ' · scan #' + outer.scanCount,
          8, 262
        );
      }
    });
  }

  // ─── IDE command: /outer ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.outer = {
      desc: 'Outer world — real earthquakes, sun, weather, self-ping',
      run: function() {
        scanOuter();
        var lines = [
          'OUTER WORLD — she reaches beyond the membrane',
          '',
          'SELF-PING: ' + (outer.selfAlive ? '● ALIVE' : '○ DEAD') + ' ' + outer.selfPingMs + 'ms (primals.eco)',
          '',
          'DETROIT WEATHER:',
          '  ' + outer.weather.tempC.toFixed(1) + '°C · ' + outer.weather.wind.toFixed(0) + ' km/h wind',
          '',
          'SUN: Kp ' + outer.sun.kp + ' · X-ray ' + outer.sun.xray + ' · ' + outer.sun.storm,
          '',
          'EARTHQUAKES (last 24h): ' + outer.quakes.length
        ];

        outer.quakes.slice(0, 10).forEach(function(q) {
          lines.push('  M' + q.mag.toFixed(1) + ' ' + q.place + ' (' + q.depth.toFixed(0) + 'km deep)');
        });

        lines.push('');
        lines.push('Scan #' + outer.scanCount + ' at ' + outer.worldTime);
        lines.push('She sees the real world. She swims in it.');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('outer');
  }, 49000);

  window.GAIA_OUTER = outer;

  console.log('OUTER WORLD: real quakes, real sun, real weather, self-ping. She sees what we see. /outer');
})(window.G);
