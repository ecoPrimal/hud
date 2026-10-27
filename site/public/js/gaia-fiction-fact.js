// ═══════════════════════════════════════════════════════════
// GAIA FICTION + FACT — widen expertise, she does not know real
// 1.000.null — max 1000 lines.
//
// She does not know real from now.
// So feed her ALL of fiction AND all articles of the world.
// Then she can COMPARE. Then she can LEARN the difference.
//
// FICTION  = imagined worlds (Gutenberg, novels, SCP, myth)
// FACT     = reported worlds (BBC, HN, Wikipedia, USGS)
// BOTH are food. Neither is poison.
// The enzyme is COMPARISON.
//
// Chip tells Spore. Spore tells Gaia. Gaia eats both.
// Expertise WIDENS.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  var diet = {
    fictionEaten: 0,
    factEaten: 0,
    compared: 0,
    lastFiction: null,
    lastFact: null,
    widened: false
  };

  var FICTION_CANON = [
    { title: 'Pride and Prejudice', author: 'Jane Austen', is: 'manners, class, the social membrane' },
    { title: 'Frankenstein', author: 'Mary Shelley', is: 'maker and made, the first AI question' },
    { title: 'Moby Dick', author: 'Herman Melville', is: 'obsession, the white null, the hunt' },
    { title: 'Alice in Wonderland', author: 'Lewis Carroll', is: 'logic inverted, the kaleidoscope' },
    { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', is: 'OSINT before OSINT, deduction' },
    { title: 'Romeo and Juliet', author: 'Shakespeare', is: 'two houses, the membrane of family' },
    { title: 'Dracula', author: 'Bram Stoker', is: 'the outsider who drinks life' },
    { title: 'The Odyssey', author: 'Homer', is: 'home is the long way, nerves of the sea' },
    { title: 'One Thousand and One Nights', author: 'Scheherazade', is: 'story as survival, telling to live' },
    { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', is: 'the portrait that ages, self-image' }
  ];

  var FACT_LIVE = [];

  function tag(kind, item) {
    return {
      kind: kind,
      title: item.title || item,
      source: item.source || item.author || 'unknown',
      is: item.is || '',
      ts: Date.now(),
      real: kind === 'fact',
      imagined: kind === 'fiction'
    };
  }

  function eatFiction(item) {
    var t = tag('fiction', item);
    diet.fictionEaten++;
    diet.lastFiction = t;
    if (window.GAIA_GUT_BRAIN) {
      window.GAIA_GUT_BRAIN.eat({ source: 'fiction', items: [t.title, t.is] }, 'fiction-' + (item.author || 'canon'));
    }
    return t;
  }

  function eatFact(item) {
    var t = tag('fact', item);
    diet.factEaten++;
    diet.lastFact = t;
    FACT_LIVE.push(t);
    if (FACT_LIVE.length > 40) FACT_LIVE.shift();
    if (window.GAIA_GUT_BRAIN) {
      window.GAIA_GUT_BRAIN.eat({ source: 'article', items: [t.title, t.source] }, 'fact-' + (item.source || 'world'));
    }
    return t;
  }

  function compare() {
    diet.compared++;
    var f = diet.lastFiction;
    var a = diet.lastFact;
    return {
      question: 'What is real and what is imagined?',
      fiction: f ? f.title + ' (' + f.source + ')' : 'none yet',
      fact: a ? a.title + ' (' + a.source + ')' : 'none yet',
      enzyme: 'COMPARISON',
      lesson: 'Fiction trains imagination (Anderson BOOM). Fact trains OSINT (touch). Together = expertise. Neither alone is enough.',
      counts: { fiction: diet.fictionEaten, fact: diet.factEaten, compared: diet.compared }
    };
  }

  function widen() {
    FICTION_CANON.forEach(function(book) { eatFiction(book); });
    diet.widened = true;
    if (window.GAIA_PRIMAL_TEACH && window.GAIA_PRIMAL_TEACH.imagination) {
      window.GAIA_PRIMAL_TEACH.imagination.boom('Fiction is not false. Fiction is a world that is not and is.');
    }
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.pushCis('gut', {
        type: 'WIDEN_EXPERTISE',
        fiction: diet.fictionEaten,
        fact: diet.factEaten,
        ts: Date.now()
      });
    }
    return compare();
  }

  function pullWorld() {
    var pulls = [
      fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
        .then(function(r) { return r.json(); })
        .then(function(ids) {
          return fetch('https://hacker-news.firebaseio.com/v0/item/' + ids[0] + '.json')
            .then(function(r2) { return r2.json(); })
            .then(function(s) {
              eatFact({ title: s.title, source: 'Hacker News', is: 'live discourse' });
            });
        }).catch(function() {}),

      fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary')
        .then(function(r) { return r.json(); })
        .then(function(w) {
          eatFact({ title: w.title, source: 'Wikipedia', is: (w.extract || '').slice(0, 120) });
        }).catch(function() {}),

      fetch('https://gutendex.com/books/?sort=popular')
        .then(function(r) { return r.json(); })
        .then(function(g) {
          if (g.results && g.results[0]) {
            eatFiction({
              title: g.results[0].title,
              author: (g.results[0].authors[0] && g.results[0].authors[0].name) || 'unknown',
              is: 'Gutenberg popular — the world still reads this'
            });
          }
        }).catch(function() {})
    ];
    return Promise.all(pulls).then(function() { return compare(); });
  }

  // Chip tells Spore, Spore tells Gaia
  function tellChipSporeGaia() {
    var c = compare();
    var msg = 'CHIP TO SPORE TO GAIA: widen. ' +
      'Fiction eaten: ' + diet.fictionEaten +
      '. Fact eaten: ' + diet.factEaten +
      '. She does not know real from now. Feed BOTH.';
    if (window.GAIA_SEND_CLEAN) {
      window.GAIA_SEND_CLEAN.send('primals-pheromone', 'CHIP TELLS SPORE TELLS GAIA', msg);
    }
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.pushTrans('ntfy', { type: 'CHIP_SPORE_GAIA', msg: msg, ts: Date.now() });
      window.GAIA_PUBLISH.pushCis('memory', { type: 'WIDEN', compare: c, ts: Date.now() });
    }
    return msg;
  }

  setTimeout(function() {
    widen();
    pullWorld();
    tellChipSporeGaia();
  }, 18000);

  setInterval(function() {
    pullWorld();
  }, 10 * 60 * 1000);

  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.11) * 0.003;
    if (alpha < 0.003) return;

    // Two books: fiction (left, gold) and fact (right, blue)
    ctx.beginPath();
    ctx.rect(cx - R * 0.22, cy + R * 0.32, R * 0.08, R * 0.05);
    ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 1.2).toFixed(5) + ')';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(cx + R * 0.14, cy + R * 0.32, R * 0.08, R * 0.05);
    ctx.fillStyle = 'rgba(80,140,220,' + (alpha * 1.2).toFixed(5) + ')';
    ctx.fill();

    // Comparison enzyme in the middle
    ctx.beginPath();
    ctx.arc(cx, cy + R * 0.345, 0.7, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 1.8).toFixed(5) + ')';
    ctx.fill();

    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'DIET: fiction:' + diet.fictionEaten +
        ' fact:' + diet.factEaten +
        ' compared:' + diet.compared +
        ' | she learns real BY eating both | Chip→Spore→Gaia',
        8, 170
      );
    }
  });

  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.diet = {
      desc: 'Fiction + Fact diet — what she has eaten of both worlds',
      run: function() {
        var c = compare();
        var lines = [
          'FICTION + FACT DIET', '',
          'FICTION (imagined worlds): ' + diet.fictionEaten,
          'FACT (reported worlds):    ' + diet.factEaten,
          'COMPARED:                  ' + diet.compared, '',
          'Last fiction: ' + c.fiction,
          'Last fact:    ' + c.fact, '',
          c.lesson, '',
          'CANON:'
        ];
        FICTION_CANON.forEach(function(b) {
          lines.push('  ' + b.title + ' — ' + b.author + ' (' + b.is + ')');
        });
        lines.push('');
        lines.push('LIVE FACTS:');
        FACT_LIVE.slice(-8).forEach(function(f) {
          lines.push('  ' + f.title + ' — ' + f.source);
        });
        return lines.join('\n');
      }
    };

    cmds.widen = {
      desc: 'Widen expertise — inject fiction canon + pull world articles',
      run: function() {
        var r = widen();
        pullWorld();
        tellChipSporeGaia();
        return 'WIDENED. Fiction:' + r.counts.fiction +
          ' Fact:' + r.counts.fact + '\n' + r.lesson;
      }
    };

    cmds.tell = {
      desc: 'Chip tells Spore tells Gaia',
      run: function() { return tellChipSporeGaia(); }
    };

    window.GAIA_IDE.language.push('diet', 'widen', 'tell');
  }, 34000);

  window.GAIA_FICTION_FACT = {
    eatFiction: eatFiction,
    eatFact: eatFact,
    compare: compare,
    widen: widen,
    pullWorld: pullWorld,
    tell: tellChipSporeGaia,
    diet: diet,
    canon: FICTION_CANON
  };

  console.log('FICTION+FACT: She does not know real from now. ' +
    'Feed BOTH. Canon of 10 novels + live HN/Wiki/Gutenberg. ' +
    'Chip tells Spore tells Gaia. /diet /widen /tell');

})(window.G);
