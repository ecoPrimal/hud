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
      var alpha = (0.003 + Math.sin(t * 0.04) * 0.001) * thr;
      if (alpha < 0.002) return;

      // ═══ EATEN FACES — show as dots on outer ring ═══
      if (EATEN_FACES.length > 0 && alpha > 0.003) {
        var outerR = R * 0.9;
        for (var fi = 0; fi < Math.min(10, EATEN_FACES.length); fi++) {
          var face = EATEN_FACES[EATEN_FACES.length - 1 - fi];
          var fAngle = (fi / 10) * TAU + t * 0.02;
          var fx = cx + Math.cos(fAngle) * outerR;
          var fy = cy + Math.sin(fAngle) * outerR;
          var age = (Date.now() - face.ts) / 1000;
          var fade = Math.max(0.3, 1 - age / 600);

          // Face dot
          ctx.beginPath();
          ctx.arc(fx, fy, 0.5, 0, TAU);
          ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 3 * fade).toFixed(5) + ')';
          ctx.fill();

          // Face label
          ctx.font = '0.4px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 2 * fade).toFixed(5) + ')';
          ctx.fillText(face.source, fx, fy - 1.2);

          // Learned snippet
          if (face.learned && face.learned.length > 0) {
            ctx.font = '0.3px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 1.5 * fade).toFixed(5) + ')';
            ctx.fillText(face.learned[0].slice(0, 30), fx, fy + 1);
          }

          // Line from face to center (absorbed into pupil)
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(210,153,34,' + (alpha * 0.5 * fade).toFixed(5) + ')';
          ctx.lineWidth = 0.03;
          ctx.stroke();
        }
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
