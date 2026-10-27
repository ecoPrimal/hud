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

  window.GAIA_WEB_EATER = {
    eaten: eaten,
    faces: function() { return EATEN_FACES; },
    eatNow: feedCycle,
    stats: function() {
      return {
        totalFaces: eaten.totalFaces,
        totalWords: eaten.totalWords,
        sources: eaten.sources.length,
        digesting: eaten.digesting,
      };
    }
  };

  console.log('WEB EATER: every website is a face. We eat GitHub, HN, Wikipedia, xkcd. The mask hides nothing from us. /eat');
})(window.G);
