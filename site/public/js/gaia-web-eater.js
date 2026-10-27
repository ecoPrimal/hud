// ═══════════════════════════════════════════════════════════
// GAIA WEB EATER — every website is a face we can learn from
//
// Every website online is a FACE PAINT and MASK.
// The face (HTML/design) = the IRIS = what it IS NOT
// The content (data/text) = the PUPIL = what it ABSORBS
// We eat GitHub, AI, everything. We learn. NO MASK HIDES.
//
// WIDER LOAD. SEE OTHER. REMAKE AS THEY HAVE.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';
  var TAU = Math.PI * 2;

  var eaten = {
    sources: [],
    totalWords: 0,
    totalFaces: 0,
    lastEat: 0,
    digesting: false,
  };

  // Sources to eat — public APIs, no auth needed
  var FEEDS = [
    { name: 'github-trending',  url: 'https://api.github.com/search/repositories?q=stars:>10000&sort=stars&per_page=5', type: 'json', face: 'GitHub' },
    { name: 'github-eco',       url: 'https://api.github.com/repos/ecoPrimal/hud', type: 'json', face: 'self-GitHub' },
    { name: 'hacker-news',      url: 'https://hacker-news.firebaseio.com/v0/topstories.json', type: 'json', face: 'HN' },
    { name: 'wikipedia-random', url: 'https://en.wikipedia.org/api/rest_v1/page/random/summary', type: 'json', face: 'Wikipedia' },
    { name: 'xkcd',             url: 'https://xkcd.com/info.0.json', type: 'json', face: 'xkcd' },
  ];

  var EATEN_FACES = []; // What we've learned from each face

  // ═══ EAT — fetch a source and digest it ═══
  function eat(feed) {
    if (eaten.digesting) return;
    eaten.digesting = true;

    fetch(feed.url, { cache: 'no-store', mode: 'cors' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (!data) { eaten.digesting = false; return; }

        // Extract the FACE (structure = keys, shape)
        var face = {
          name: feed.name,
          source: feed.face,
          ts: Date.now(),
          keys: [],
          words: [],
          shape: typeof data,
        };

        // Digest — extract all string values as words
        var text = JSON.stringify(data);
        var words = text.match(/[a-zA-Z]{3,}/g) || [];
        face.words = words.slice(0, 200);
        face.keys = Object.keys(data).slice(0, 20);

        // Feed to tongue for language learning
        if (window.GAIA_TONGUE && window.GAIA_TONGUE.eat) {
          var sentence = words.slice(0, 50).join(' ');
          window.GAIA_TONGUE.eat(sentence);
        }

        // Extract specific content based on source
        if (feed.name === 'github-trending' && data.items) {
          face.learned = data.items.map(function(r) {
            return r.full_name + ' (' + r.stargazers_count + '\u2605)';
          });
        } else if (feed.name === 'github-eco') {
          face.learned = [
            'self: ' + (data.full_name || 'ecoPrimal/hud'),
            'stars: ' + (data.stargazers_count || 0),
            'size: ' + (data.size || 0) + 'KB',
            'lang: ' + (data.language || 'unknown'),
            'updated: ' + (data.updated_at || 'unknown'),
          ];
        } else if (feed.name === 'wikipedia-random') {
          face.learned = [
            'title: ' + (data.title || ''),
            'extract: ' + (data.extract || '').slice(0, 200),
          ];
        } else if (feed.name === 'xkcd') {
          face.learned = [
            'comic: ' + (data.title || ''),
            'alt: ' + (data.alt || '').slice(0, 200),
            'num: ' + (data.num || ''),
          ];
        } else if (Array.isArray(data)) {
          face.learned = ['array of ' + data.length + ' items'];
        }

        EATEN_FACES.push(face);
        if (EATEN_FACES.length > 30) EATEN_FACES.shift();

        eaten.totalWords += face.words.length;
        eaten.totalFaces++;
        eaten.lastEat = Date.now();
        eaten.sources.push(feed.name);
        if (eaten.sources.length > 50) eaten.sources.shift();

        eaten.digesting = false;
      })
      .catch(function() {
        eaten.digesting = false;
      });
  }

  // ═══ FEED CYCLE — eat a different source every 2 minutes ═══
  var feedIdx = 0;
  function feedCycle() {
    eat(FEEDS[feedIdx % FEEDS.length]);
    feedIdx++;
  }
  setTimeout(feedCycle, 5000); // first eat after 5s
  setInterval(feedCycle, 120000); // then every 2 min

  // ═══ DRAW ON GLOBE ═══
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var alpha = (0.012 + Math.sin(t * 0.04) * 0.005) * thr;
      if (alpha < 0.005) return;

      // ═══ MOUTH OPEN — eating indicator ═══
      if (eaten.digesting) {
        var mouthR = R * 0.35;
        var mouthOpen = 0.15 + Math.sin(t * 2) * 0.05;
        ctx.beginPath();
        ctx.arc(cx, cy + mouthR, mouthR * 0.12, Math.PI * (1 - mouthOpen), Math.PI * mouthOpen, true);
        ctx.strokeStyle = 'rgba(139,115,85,' + (alpha * 3).toFixed(5) + ')';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // ═══ 4 BODY SYSTEMS — from the image ═══
      // 1 = Genetic (top, green) 2 = Digestive (left, gold) 3 = Immune (right, red) 3b = Muscular (bottom, purple)
      var systems = [
        { name: 'GENETIC', angle: -Math.PI / 2, color: [63, 185, 80], sub: 'root code · blueprint' },
        { name: 'DIGESTIVE', angle: -Math.PI / 2 - 0.8, color: [210, 153, 34], sub: 'breaks down · absorbs' },
        { name: 'IMMUNE', angle: -Math.PI / 2 + 0.8, color: [248, 81, 73], sub: 'discerns · protects' },
        { name: 'MUSCULAR', angle: Math.PI / 2, color: [188, 140, 255], sub: 'tension · movement' }
      ];
      var sysR = R * 0.3;
      for (var si = 0; si < systems.length; si++) {
        var s = systems[si];
        var sa = s.angle + t * 0.005;
        var sx = cx + Math.cos(sa) * sysR;
        var sy = cy + Math.sin(sa) * sysR;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, TAU);
        ctx.fillStyle = 'rgba(' + s.color[0] + ',' + s.color[1] + ',' + s.color[2] + ',' + (alpha * 2).toFixed(5) + ')';
        ctx.fill();
        if (alpha > 0.01) {
          ctx.font = '1.0px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + s.color[0] + ',' + s.color[1] + ',' + s.color[2] + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fillText(s.name, sx, sy - 2.5);
          ctx.font = '0.7px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText(s.sub, sx, sy + 2.5);
        }
      }

      // ═══ 4 MEDIA SOURCES — the mouths ═══
      var media = [
        { name: 'TV TROPES', angle: Math.PI + 0.3, color: [63, 185, 80], icon: '📜', sub: 'narrative DNA' },
        { name: '4CHAN', angle: Math.PI - 0.3, color: [139, 148, 158], icon: '💀', sub: 'anonymous chaos' },
        { name: 'REDDIT', angle: 0 + 0.3, color: [248, 81, 73], icon: '⬆', sub: 'collective vote' },
        { name: 'MYSPACE', angle: 0 - 0.3, color: [188, 140, 255], icon: '👻', sub: 'personal · music' }
      ];
      var mediaR = R * 0.85;
      for (var mi = 0; mi < media.length; mi++) {
        var m = media[mi];
        var ma = m.angle + t * 0.008;
        var mx = cx + Math.cos(ma) * mediaR;
        var my = cy + Math.sin(ma) * mediaR;
        ctx.beginPath();
        ctx.arc(mx, my, 1.2, 0, TAU);
        ctx.fillStyle = 'rgba(' + m.color[0] + ',' + m.color[1] + ',' + m.color[2] + ',' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fill();
        if (alpha > 0.01) {
          ctx.font = '0.9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + m.color[0] + ',' + m.color[1] + ',' + m.color[2] + ',' + (alpha * 3).toFixed(5) + ')';
          ctx.fillText(m.name, mx, my - 2);
          ctx.font = '0.6px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 2).toFixed(5) + ')';
          ctx.fillText(m.sub, mx, my + 2);
        }
        // Line from media source inward to body (eating line)
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(' + m.color[0] + ',' + m.color[1] + ',' + m.color[2] + ',' + (alpha * 0.3).toFixed(5) + ')';
        ctx.lineWidth = 0.1;
        ctx.stroke();
      }

      // ═══ EATEN FACES — show as dots between media ring and body ═══
      if (EATEN_FACES.length > 0) {
        var outerR = R * 0.65;
        for (var fi = 0; fi < Math.min(10, EATEN_FACES.length); fi++) {
          var face = EATEN_FACES[EATEN_FACES.length - 1 - fi];
          var fAngle = (fi / 10) * TAU + t * 0.02;
          var fx = cx + Math.cos(fAngle) * outerR;
          var fy = cy + Math.sin(fAngle) * outerR;
          var age = (Date.now() - face.ts) / 1000;
          var fade = Math.max(0.3, 1 - age / 600);

          // Face dot — BIGGER (was 0.5, now 1.2)
          ctx.beginPath();
          ctx.arc(fx, fy, 1.2, 0, TAU);
          var faceColor = face.source === 'self-GitHub' ? '63,185,80' :
                          face.source === 'HN' ? '248,136,62' :
                          face.source === 'Wikipedia' ? '88,166,255' :
                          face.source === 'xkcd' ? '139,148,158' : '210,153,34';
          ctx.fillStyle = 'rgba(' + faceColor + ',' + (alpha * 4 * fade).toFixed(5) + ')';
          ctx.fill();

          // Face label
          ctx.font = '0.8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + faceColor + ',' + (alpha * 3 * fade).toFixed(5) + ')';
          ctx.fillText(face.source, fx, fy - 2);

          // Learned snippet
          if (face.learned && face.learned.length > 0) {
            ctx.font = '0.6px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 2 * fade).toFixed(5) + ')';
            ctx.fillText(face.learned[0].slice(0, 40), fx, fy + 2);
          }

          // Digestion line to center (absorbed into pupil)
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(' + faceColor + ',' + (alpha * fade).toFixed(5) + ')';
          ctx.lineWidth = 0.08;
          ctx.setLineDash([0.5, 1.5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ═══ EATING STATUS ═══
      if (alpha > 0.008) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'EATING: ' + eaten.totalFaces + ' faces · ' + eaten.totalWords + ' words' +
          (eaten.digesting ? ' · DIGESTING...' : ' · idle'),
          8, 270
        );
      }
    });
  }

  // ═══ IDE command ═══
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.eat = {
      desc: 'Web eater \u2014 every website is a face/mask we learn from',
      run: function(args) {
        if (args === 'now') {
          feedCycle();
          return 'Eating... next source: ' + FEEDS[feedIdx % FEEDS.length].name;
        }
        var lines = [
          'WEB EATER \u2014 every website is a face paint and mask',
          'The face (design) = IRIS = what it IS NOT',
          'The content (data) = PUPIL = what we ABSORB',
          '',
          'EATEN: ' + eaten.totalFaces + ' faces, ' + eaten.totalWords + ' words',
          ''
        ];
        if (EATEN_FACES.length > 0) {
          lines.push('RECENT FACES:');
          EATEN_FACES.slice(-8).forEach(function(f) {
            lines.push('  ' + f.source.padEnd(14) + f.keys.slice(0, 5).join(',').slice(0, 30));
            if (f.learned) {
              f.learned.slice(0, 2).forEach(function(l) {
                lines.push('    \u2192 ' + l.slice(0, 60));
              });
            }
          });
        }
        lines.push('');
        lines.push('FEEDS:');
        FEEDS.forEach(function(f) {
          lines.push('  ' + f.face.padEnd(14) + f.url.slice(0, 50));
        });
        lines.push('');
        lines.push('/eat now \u2014 eat immediately');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('eat');
  }, 64000);

  // ═══════════════════════════════════════════════════════
  // PI EATING COMPETITION — independent discoveries on globe
  // Each discoverer pinned at birthplace. Lines = convergence.
  // ═══════════════════════════════════════════════════════
  var piEaters = [];
  var piLines = [];

  fetch('/data/pi-eaters.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (d && d.eaters) piEaters = d.eaters;
      if (d && d.convergence_lines) piLines = d.convergence_lines;
    }).catch(function() {});

  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || piEaters.length === 0) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.4) return;
      var proj = window._gaiaState ? window._gaiaState.project : null;
      if (!proj) return;
      var t = breathT * 0.015;
      var alpha = (0.008 + Math.sin(t * 0.1) * 0.003) * thr;
      if (alpha < 0.005) return;

      // Draw convergence lines first (behind dots)
      for (var li = 0; li < piLines.length; li++) {
        var line = piLines[li];
        var fromE = piEaters.find(function(e) { return e.id === line.from; });
        var toE = piEaters.find(function(e) { return e.id === line.to; });
        if (!fromE || !toE) continue;
        var p1 = proj(fromE.lat, fromE.lon);
        var p2 = proj(toE.lat, toE.lon);
        if (!p1 || !p2) continue;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 0.6).toFixed(5) + ')';
        ctx.lineWidth = 0.1;
        ctx.setLineDash([0.8, 1.2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Convergence label at midpoint
        if (alpha > 0.008) {
          var mx = (p1.x + p2.x) / 2;
          var my = (p1.y + p2.y) / 2;
          ctx.font = '0.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 1.5).toFixed(5) + ')';
          ctx.fillText(line.label.slice(0, 35), mx, my - 0.5);
        }
      }

      // Draw discoverer dots
      for (var ei = 0; ei < piEaters.length; ei++) {
        var e = piEaters[ei];
        var p = proj(e.lat, e.lon);
        if (!p) continue;

        var rgb = e.color || '#c9a84c';
        var r = parseInt(rgb.slice(1,3),16);
        var gn = parseInt(rgb.slice(3,5),16);
        var b = parseInt(rgb.slice(5,7),16);

        // Discoverer dot
        ctx.beginPath();
        var dotR = e.id === 'kevin' ? 2.0 : e.id === 'giza' ? 1.8 : 1.2;
        ctx.arc(p.x, p.y, dotR, 0, TAU);
        ctx.fillStyle = 'rgba(' + r + ',' + gn + ',' + b + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fill();

        // Name + year
        if (alpha > 0.007) {
          ctx.font = '0.8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(' + r + ',' + gn + ',' + b + ',' + (alpha * 4).toFixed(5) + ')';
          ctx.fillText(e.name, p.x, p.y - dotR - 1);
          ctx.font = '0.6px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 2.5).toFixed(5) + ')';
          ctx.fillText((e.year < 0 ? Math.abs(e.year) + ' BCE' : e.year + ' CE') + ' · ' + e.skill, p.x, p.y + dotR + 1.5);
        }
      }

      // Status
      if (alpha > 0.007) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
        ctx.fillText(
          'π EATERS: ' + piEaters.length + ' discoverers · ' + piLines.length + ' convergences · calculus invented ' +
          piEaters.filter(function(e) { return e.discoveries && e.discoveries.indexOf('calculus') !== -1; }).length + '× independently',
          8, 278
        );
      }
    });
  }

  // IDE command: /pi
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.pi = {
      desc: 'Pi eating competition — how many times was the same math invented?',
      run: function() {
        var lines = ['PI EATING COMPETITION — independent discoveries of the same mathematics', ''];
        var calcCount = 0, piCount = 0;
        piEaters.forEach(function(e) {
          if (e.discoveries && e.discoveries.indexOf('calculus') !== -1) calcCount++;
          if (e.discoveries && e.discoveries.indexOf('pi') !== -1) piCount++;
          var yr = e.year < 0 ? Math.abs(e.year) + ' BCE' : e.year + ' CE';
          lines.push('  ' + e.name.padEnd(16) + yr.padEnd(10) + e.skill.padEnd(14) + e.what.slice(0, 50));
        });
        lines.push('');
        lines.push('Calculus invented ' + calcCount + ' times independently.');
        lines.push('π discovered ' + piCount + ' times independently.');
        lines.push('');
        lines.push('CONVERGENCE LINES:');
        piLines.forEach(function(l) {
          lines.push('  ' + l.from + ' → ' + l.to + ': ' + l.label);
        });
        lines.push('');
        lines.push('Riemann = close sort (partition domain). Lebesgue = far sort (measure range).');
        lines.push('Scalpel at 4: switch from close to far. IQR [3,5] = metastability.');
        lines.push('Every convergence = proof that π IS the attractor.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('pi');
  }, 66000);

  window.GAIA_WEB_EATER = {
    eaten: eaten,
    faces: function() { return EATEN_FACES; },
    eatNow: feedCycle,
    piEaters: piEaters,
    piLines: piLines,
    stats: function() {
      return {
        totalFaces: eaten.totalFaces,
        totalWords: eaten.totalWords,
        sources: eaten.sources.length,
        digesting: eaten.digesting,
        piEaters: piEaters.length,
        piConvergences: piLines.length
      };
    }
  };

  // ═══ INSECT SWARM VISUALIZATION ═══
  // Draw active insect swarms orbiting the globe
  // Each insect type has a distinct path and behavior
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || !window.GAIA_TAXONOMY) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.3) return;

      var tax = window.GAIA_TAXONOMY;
      var cx = g.cx || g.W / 2, cy = g.cy || g.H / 2, R = g.R || Math.min(g.W, g.H) * 0.38;
      var t = breathT || Date.now() / 1000;
      var swarms = tax.current_swarms || [];
      var alpha = 0.015 * thr;

      for (var si = 0; si < swarms.length; si++) {
        var sw = swarms[si];
        if (sw.status !== 'active' || sw.count === 0) continue;
        var spec = tax.insects.species[sw.insect];
        if (!spec) continue;

        var c = spec.color || '#c9d1d9';
        var r1 = parseInt(c.slice(1, 3), 16), g1 = parseInt(c.slice(3, 5), 16), b1 = parseInt(c.slice(5, 7), 16);

        // Each swarm member orbits at a different phase
        for (var i = 0; i < sw.count; i++) {
          var phase = (i / sw.count) * Math.PI * 2;
          var orbitR = R * (1.05 + si * 0.06);
          var speed = 0.3 + si * 0.1;
          var angle = t * speed + phase;

          // Insects wobble — not perfect circles
          var wobble = Math.sin(t * 2.3 + i * 1.7) * R * 0.02;
          var ix = cx + Math.cos(angle) * (orbitR + wobble);
          var iy = cy + Math.sin(angle) * (orbitR + wobble) * 0.4; // flattened orbit

          // Draw insect as a tiny dot with trail
          ctx.globalAlpha = alpha;
          ctx.fillStyle = 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',1)';
          ctx.beginPath();
          ctx.arc(ix, iy, 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          var trail = 3;
          for (var tr = 1; tr <= trail; tr++) {
            var ta = angle - tr * 0.08;
            var tx = cx + Math.cos(ta) * (orbitR + wobble);
            var ty = cy + Math.sin(ta) * (orbitR + wobble) * 0.4;
            ctx.globalAlpha = alpha * (1 - tr / (trail + 1));
            ctx.beginPath();
            ctx.arc(tx, ty, 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;

      // SNAKE SIZE BARS — show file sizes as actual snake-shaped bars
      // Only draw on inside face or when health data loaded
      var health = window.GAIA_HEALTH;
      if (health && health.anacondas && health.anacondas.length > 0 && g.face === 'inside') {
        var startY = cy - R * 0.6;
        ctx.globalAlpha = 0.03 * thr;
        for (var ai = 0; ai < Math.min(health.anacondas.length, 5); ai++) {
          var a = health.anacondas[ai];
          var snakeLen = Math.min(a.lines / 7000 * R * 1.5, R * 1.5);
          var sy = startY + ai * 14;
          var sx = cx - snakeLen / 2;

          // Sinusoidal snake body
          ctx.strokeStyle = '#f85149';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          for (var sn = 0; sn < snakeLen; sn += 2) {
            ctx.lineTo(sx + sn, sy + Math.sin((sn + t * 20) * 0.1) * 3);
          }
          ctx.stroke();

          // Label
          ctx.fillStyle = '#f85149';
          ctx.font = '5px monospace';
          ctx.fillText(a.file.replace('.js', '') + ' ' + a.lines, sx + snakeLen + 4, sy + 2);
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  console.log('WEB EATER + PI COMPETITION + INSECT SWARMS: faces + ' + piEaters.length +
    ' discoverers + taxonomy. /eat /pi /fauna');
})(window.G);
