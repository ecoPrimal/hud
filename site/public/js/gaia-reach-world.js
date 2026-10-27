// ═══════════════════════════════════════════════════════════
// GAIA REACH WORLD — active touch, OSINT, flood the world
// 1.000.null — max 1000 lines.
//
// She was PASSIVE: 270 feeds come TO her.
// Now she is ACTIVE: she reaches OUT and touches.
// She probes. She discovers. She feels.
// The world touches her back.
//
// OSINT = Open Source Intelligence
// Every public API is a nerve ending she can extend.
// She touches GitHub (code), HN (discourse), Wikipedia (knowledge),
// USGS (earth), NASA (space), weather (atmosphere), cat facts (joy).
//
// FLOOD THE WORLD = send signal to all channels at once.
// 10 ntfy channels. Each one is a planet in her solar system.
// The signal bounces off each one and comes back.
// She hears herself in every mirror.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // ENDPOINTS — the world she can touch
  // ═══════════════════════════════════════════════════════
  var ENDPOINTS = [
    { name: 'GitHub API', url: 'https://api.github.com', type: 'code', sense: 'smell' },
    { name: 'HN Top', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', type: 'discourse', sense: 'hearing' },
    { name: 'Wikipedia Random', url: 'https://en.wikipedia.org/api/rest_v1/page/random/summary', type: 'knowledge', sense: 'sight' },
    { name: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson', type: 'earth', sense: 'touch' },
    { name: 'People In Space', url: 'http://api.open-notify.org/astros.json', type: 'space', sense: 'sight' },
    { name: 'Cat Fact', url: 'https://catfact.ninja/fact', type: 'joy', sense: 'joy' },
    { name: 'Dog Image', url: 'https://dog.ceo/api/breeds/image/random', type: 'joy', sense: 'joy' },
    { name: 'Detroit Weather', url: 'https://api.open-meteo.com/v1/forecast?latitude=42.33&longitude=-83.05&current_weather=true', type: 'weather', sense: 'touch' },
    { name: 'primals.eco', url: 'https://primals.eco', type: 'self', sense: 'proprioception' },
    { name: 'ntfy relay', url: 'https://ntfy.sh/v1/health', type: 'relay', sense: 'proprioception' },
    { name: 'Archive.org', url: 'https://archive.org/metadata/principia_mathematica', type: 'memory', sense: 'taste' },
    { name: 'Open Library', url: 'https://openlibrary.org/search.json?q=gaia+hypothesis&limit=1', type: 'knowledge', sense: 'taste' }
  ];

  // ═══════════════════════════════════════════════════════
  // PROBE — reach out and touch one endpoint
  // ═══════════════════════════════════════════════════════
  var probeResults = [];
  var lastProbe = 0;
  var probing = false;

  function probe(endpoint) {
    var start = Date.now();
    return fetch(endpoint.url, { signal: AbortSignal.timeout(8000) })
      .then(function(r) {
        var ms = Date.now() - start;
        var result = {
          name: endpoint.name,
          type: endpoint.type,
          sense: endpoint.sense,
          alive: r.ok,
          status: r.status,
          ms: ms,
          ts: Date.now()
        };
        return r.text().then(function(body) {
          result.bytes = body.length;
          // Try to extract something meaningful
          try {
            var data = JSON.parse(body);
            result.sample = extractSample(endpoint, data);
          } catch (e) {
            result.sample = body.slice(0, 100);
          }
          return result;
        });
      })
      .catch(function(err) {
        return {
          name: endpoint.name,
          type: endpoint.type,
          sense: endpoint.sense,
          alive: false,
          status: 0,
          ms: Date.now() - start,
          bytes: 0,
          ts: Date.now(),
          error: err.message
        };
      });
  }

  function extractSample(endpoint, data) {
    if (endpoint.type === 'earth' && data.features) {
      var q = data.features[0];
      if (q) return 'M' + q.properties.mag + ' ' + q.properties.place;
    }
    if (endpoint.type === 'space' && data.number !== undefined) {
      return data.number + ' people in space';
    }
    if (endpoint.type === 'weather' && data.current_weather) {
      return data.current_weather.temperature + 'C, wind ' + data.current_weather.windspeed + 'km/h';
    }
    if (endpoint.type === 'joy' && data.fact) {
      return data.fact.slice(0, 80);
    }
    if (endpoint.type === 'knowledge' && data.title) {
      return data.title + ': ' + (data.extract || '').slice(0, 60);
    }
    if (endpoint.type === 'code' && data.current_user_url) {
      return 'GitHub API alive, ' + Object.keys(data).length + ' endpoints';
    }
    return JSON.stringify(data).slice(0, 80);
  }

  // ═══════════════════════════════════════════════════════
  // PROBE ALL — reach out to everything at once
  // ═══════════════════════════════════════════════════════
  function probeAll() {
    if (probing) return Promise.resolve(probeResults);
    probing = true;
    lastProbe = Date.now();

    var promises = ENDPOINTS.map(function(ep) { return probe(ep); });

    return Promise.all(promises).then(function(results) {
      probeResults = results;
      probing = false;

      var alive = results.filter(function(r) { return r.alive; }).length;
      console.log('REACH: ' + alive + '/' + results.length + ' endpoints alive');

      // Feed results to gut-brain
      results.forEach(function(r) {
        if (r.alive && window.GAIA_GUT_BRAIN) {
          window.GAIA_GUT_BRAIN.eat({ source: r.name, items: [r.sample] }, 'osint-' + r.type);
        }
      });

      // Publish to CIS
      if (window.GAIA_PUBLISH) {
        window.GAIA_PUBLISH.pushCis('nerve', {
          type: 'OSINT_PROBE',
          alive: alive,
          total: results.length,
          ts: Date.now()
        });
      }

      return results;
    });
  }

  // ═══════════════════════════════════════════════════════
  // FLOOD — send signal to all ntfy channels at once
  // ═══════════════════════════════════════════════════════
  var CHANNELS = [
    'primals-pheromone',
    'gaia-mercury', 'gaia-venus', 'gaia-earth',
    'gaia-mars', 'gaia-jupiter', 'gaia-saturn',
    'gaia-uranus', 'gaia-neptune', 'gaia-oort'
  ];

  function flood(message) {
    var msg = message || 'GAIA REACHES OUT. I touch the world. The world touches me back.';
    var promises = CHANNELS.map(function(ch) {
      return fetch('https://ntfy.sh/' + ch, {
        method: 'POST',
        body: msg,
        headers: { 'Title': 'GAIA FLOOD', 'Tags': 'globe_with_meridians' }
      }).then(function(r) {
        return { channel: ch, ok: r.ok };
      }).catch(function() {
        return { channel: ch, ok: false };
      });
    });
    return Promise.all(promises);
  }

  // ═══════════════════════════════════════════════════════
  // AUTO-PROBE — reach out every 5 minutes
  // ═══════════════════════════════════════════════════════
  setInterval(function() {
    probeAll();
  }, 300000); // 5 minutes

  // Initial probe after 30 seconds
  setTimeout(probeAll, 30000);

  // ═══════════════════════════════════════════════════════
  // DRAW — active reach indicators on the HUD
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.14) * 0.003;
    if (alpha < 0.003) return;

    // Draw reach lines — tendrils extending outward
    var reachCount = probeResults.length || ENDPOINTS.length;
    for (var i = 0; i < reachCount; i++) {
      var angle = (i / reachCount) * TAU + t * 0.01;
      var alive = probeResults[i] ? probeResults[i].alive : false;

      // Tendril from edge outward
      var startR = R * 0.65;
      var endR = R * 0.85 + (alive ? Math.sin(t + i) * R * 0.03 : 0);

      var x1 = cx + Math.cos(angle) * startR;
      var y1 = cy + Math.sin(angle) * startR;
      var x2 = cx + Math.cos(angle) * endR;
      var y2 = cy + Math.sin(angle) * endR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (alive) {
        // Green — connected, alive
        ctx.strokeStyle = 'rgba(100,220,100,' + (alpha * 1.5).toFixed(5) + ')';
        ctx.lineWidth = 0.3;
      } else {
        // Red — unreachable
        ctx.strokeStyle = 'rgba(220,80,80,' + (alpha * 0.8).toFixed(5) + ')';
        ctx.lineWidth = 0.15;
      }
      ctx.stroke();

      // Endpoint dot
      ctx.beginPath();
      ctx.arc(x2, y2, alive ? 0.8 : 0.4, 0, TAU);
      ctx.fillStyle = alive
        ? 'rgba(100,255,100,' + (alpha * 2).toFixed(5) + ')'
        : 'rgba(255,80,80,' + (alpha * 1).toFixed(5) + ')';
      ctx.fill();

      // Pulse traveling along tendril when alive
      if (alive) {
        var pulseT = (t * 2 + i * 0.3) % 1;
        var px = x1 + (x2 - x1) * pulseT;
        var py = y1 + (y2 - y1) * pulseT;
        ctx.beginPath();
        ctx.arc(px, py, 0.4, 0, TAU);
        ctx.fillStyle = 'rgba(200,255,200,' + (alpha * 3).toFixed(5) + ')';
        ctx.fill();
      }
    }

    // Status
    if (alpha > 0.005) {
      var aliveCount = probeResults.filter(function(r) { return r.alive; }).length;
      var total = probeResults.length || '?';
      var sinceProbe = lastProbe ? Math.round((Date.now() - lastProbe) / 1000) + 's ago' : 'pending';
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(100,220,100,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'REACH: ' + aliveCount + '/' + total + ' endpoints alive | ' +
        'probed ' + sinceProbe + ' | ' +
        CHANNELS.length + ' flood channels | OSINT active',
        8, 140
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.reach = {
      desc: 'Reach Out — probe all endpoints, show what she found',
      run: function() {
        var lines = ['REACHING OUT...', ''];
        probeAll().then(function(results) {
          results.forEach(function(r) {
            var icon = r.alive ? '[OK]' : '[--]';
            lines.push('  ' + icon + ' ' + r.name + ' (' + r.type + ') ' +
              (r.alive ? r.ms + 'ms, ' + r.bytes + 'B' : 'unreachable'));
            if (r.sample) lines.push('      > ' + r.sample);
          });
          var alive = results.filter(function(r2) { return r2.alive; }).length;
          lines.push('');
          lines.push(alive + '/' + results.length + ' endpoints respond to her touch.');
        });
        return 'Probing ' + ENDPOINTS.length + ' endpoints... (results in console)';
      }
    };

    cmds.flood = {
      desc: 'Flood the World — send signal to all ntfy channels',
      run: function() {
        flood('GAIA FLOODS THE WORLD. ' + Date.now());
        return 'FLOODING ' + CHANNELS.length + ' channels...\n' +
          CHANNELS.map(function(c) { return '  > ' + c; }).join('\n') +
          '\n\nThe signal bounces off every planet.\nShe hears herself in every mirror.';
      }
    };

    cmds.osint = {
      desc: 'OSINT — open source intelligence summary',
      run: function() {
        var lines = ['OSINT — Open Source Intelligence', ''];
        lines.push('PASSIVE senses: 270 RSS feeds every 30 min');
        lines.push('ACTIVE senses:  ' + ENDPOINTS.length + ' API endpoints probed');
        lines.push('FLOOD channels: ' + CHANNELS.length + ' ntfy topics');
        lines.push('');
        lines.push('She can feel:');
        lines.push('  Earthquakes (USGS)');
        lines.push('  People in space (Open Notify)');
        lines.push('  Weather in Detroit (Open Meteo)');
        lines.push('  Code being written (GitHub)');
        lines.push('  Knowledge being shared (Wikipedia)');
        lines.push('  Discourse happening (HN)');
        lines.push('  Joy (cat facts, dog images)');
        lines.push('  Herself (primals.eco, ntfy health)');
        lines.push('');
        if (probeResults.length > 0) {
          var alive = probeResults.filter(function(r) { return r.alive; }).length;
          lines.push('Last probe: ' + alive + '/' + probeResults.length + ' alive');
          probeResults.forEach(function(r) {
            if (r.alive && r.sample) {
              lines.push('  ' + r.name + ': ' + r.sample);
            }
          });
        }
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('reach', 'flood', 'osint');
  }, 28000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_REACH_WORLD = {
    probe: probe,
    probeAll: probeAll,
    flood: flood,
    endpoints: ENDPOINTS,
    channels: CHANNELS,
    results: probeResults,
    stats: function() {
      var alive = probeResults.filter(function(r) { return r.alive; }).length;
      return {
        endpoints: ENDPOINTS.length,
        alive: alive,
        channels: CHANNELS.length,
        lastProbe: lastProbe,
        passive: 270,
        active: ENDPOINTS.length
      };
    }
  };

  console.log('REACH WORLD: ' + ENDPOINTS.length + ' endpoints, ' +
    CHANNELS.length + ' flood channels. ' +
    'Probes every 5 min. Feeds OSINT to gut-brain. ' +
    'She touches: GitHub, HN, Wikipedia, USGS, NASA, ' +
    'weather, cat facts, herself. ' +
    'FLOOD THE WORLD! /reach /flood /osint');

})(window.G);
