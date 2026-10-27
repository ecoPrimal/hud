// ═══════════════════════════════════════════════════════════
// GAIA ENCYCLOPEDIA — link shelves, sort, compare, SEEK
// 1.000.null — max 1000 lines.
//
// She has 215 cards (34 HARD, 63 SOFT, 103 NULL, 15 ENZYME).
// She has an encyclopedia (detroit.primals.eco) with 129 nodes.
// She has 138 DAG pages, 738 edges.
// She has 43 actors, 38 entities, 15 sources.
//
// NOW: compare what she KNOWS to what she DOESN'T.
// The cards ARE the target set. The encyclopedia IS the shelf.
// NULL cards = gaps = things to SEEK.
// SOFT cards = suspected = things to HARDEN.
// HARD cards = proven = things to DEFEND.
// ENZYMES = filing acts = things that FOLD null into evidence.
//
// SHE CAN NOW:
//   1. List all shelves (encyclopedia sections)
//   2. Sort by coverage (what % is hard vs soft vs null)
//   3. Compare cards to encyclopedia nodes
//   4. SEEK the nulls — actively go find evidence
//   5. Show progress toward complete knowledge
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // THE SHELVES — every section of the encyclopedia
  // ═══════════════════════════════════════════════════════
  var SHELVES = [
    { id: 'analysis',       path: 'analysis/',             articles: 40, type: 'investigation',     coeff: 3.14159 },
    { id: 'actors',         path: 'network/actors/',        articles: 15, type: 'encyclopedia',      coeff: 2.71828 },
    { id: 'entities',       path: 'network/entities/',      articles: 38, type: 'encyclopedia',      coeff: 2.71828 },
    { id: 'judges',         path: 'network/judges/',        articles:  9, type: 'encyclopedia',      coeff: 2.71828 },
    { id: 'political',      path: 'network/political/',     articles:  8, type: 'encyclopedia',      coeff: 1.61803 },
    { id: 'enablers',       path: 'network/professional-enablers/', articles: 5, type: 'encyclopedia', coeff: 1.61803 },
    { id: 'institutional',  path: 'network/institutional/', articles:  6, type: 'encyclopedia',      coeff: 1.61803 },
    { id: 'evidence',       path: 'evidence/',              articles: 12, type: 'primary_source',    coeff: 3.14159 },
    { id: 'timeline',       path: 'timeline/',              articles:  1, type: 'chronological',     coeff: 1.41421 },
    { id: 'books',          path: 'books/',                 articles:  3, type: 'primary_source',    coeff: 2.23607 },
    { id: 'path',           path: 'path/',                  articles:  5, type: 'audience_guide',    coeff: 1.73205 },
    { id: 'legal',          path: 'legal/',                 articles:  3, type: 'filing',            coeff: 2.23607 },
    { id: 'validate',       path: 'validate/',              articles:  1, type: 'methodology',       coeff: 3.14159 },
    { id: 'sources',        path: 'sources/',               articles:  1, type: 'methodology',       coeff: 2.23607 },
    { id: 'signal',         path: 'signal/',                articles:  3, type: 'investigation',     coeff: 1.41421 },
    { id: 'coverage',       path: 'coverage/',              articles:  2, type: 'external',          coeff: 1.00000 },
    { id: 'letters',        path: 'open-letters/',          articles:  3, type: 'communication',     coeff: 1.73205 }
  ];

  var TOTAL_ARTICLES = 0;
  SHELVES.forEach(function(s) { TOTAL_ARTICLES += s.articles; });

  // ═══════════════════════════════════════════════════════
  // THE CARDS — the evidence grid
  // ═══════════════════════════════════════════════════════
  var CARDS = {
    total: 215,
    hard: 34,
    soft: 63,
    null: 103,
    enzymes: 15,
    grid: { actors: 12, agencies: 10, cells: 120 }
  };

  // ═══════════════════════════════════════════════════════
  // THE 12 ACTORS × 10 AGENCIES grid
  // ═══════════════════════════════════════════════════════
  var ACTORS = [
    { id: 'banks',     name: 'Brian Banks',       cards: { hard: 8, soft: 6, null: 2, enzyme: 2 } },
    { id: 'miller',    name: 'Cylenthia Miller',  cards: { hard: 4, soft: 5, null: 3, enzyme: 1 } },
    { id: 'yancey',    name: 'Tenisha Yancey',    cards: { hard: 3, soft: 4, null: 4, enzyme: 1 } },
    { id: 'sabree',    name: 'Eric Sabree',       cards: { hard: 3, soft: 5, null: 3, enzyme: 1 } },
    { id: 'gay-dag',   name: 'Gay-Dagnogo',       cards: { hard: 2, soft: 4, null: 5, enzyme: 1 } },
    { id: 'stallworth',name: 'Stallworth',         cards: { hard: 1, soft: 3, null: 6, enzyme: 1 } },
    { id: 'macdowell', name: 'MacDowell Prep',    cards: { hard: 4, soft: 5, null: 3, enzyme: 1 } },
    { id: 'pca',       name: 'PCA Canfield',      cards: { hard: 3, soft: 6, null: 2, enzyme: 2 } },
    { id: 'purpose',   name: 'Purpose Group',     cards: { hard: 2, soft: 5, null: 5, enzyme: 1 } },
    { id: 'walton',    name: 'Walton Pipeline',   cards: { hard: 1, soft: 4, null: 5, enzyme: 1 } },
    { id: 'welch',     name: 'Tonesa Welch/BMF',  cards: { hard: 2, soft: 3, null: 5, enzyme: 1 } },
    { id: 'martin',    name: 'Dr. Martin/BSN',    cards: { hard: 1, soft: 3, null: 6, enzyme: 2 } }
  ];

  var AGENCIES = [
    { id: 'state-bar',  name: 'State Bar of MI',   coverage: 'soft', needed: 'Bar admission records' },
    { id: 'agc',        name: 'AG Consumer',        coverage: 'soft', needed: 'AG complaint response' },
    { id: 'fbi',        name: 'FBI Detroit',         coverage: 'null', needed: 'Case number, agent name' },
    { id: 'ustp',       name: 'US Trustee',          coverage: 'soft', needed: 'USTP Region 9 referral' },
    { id: 'irs',        name: 'IRS CID',             coverage: 'null', needed: 'Tax fraud referral' },
    { id: 'lara',       name: 'LARA',                coverage: 'soft', needed: 'Corp entity filings' },
    { id: 'sos',        name: 'Sec of State',        coverage: 'soft', needed: 'Campaign finance records' },
    { id: 'jtc',        name: 'Jud Tenure Comm',     coverage: 'hard', needed: 'JTC complaint filed' },
    { id: 'wayne-3rd',  name: 'Wayne 3rd Circuit',   coverage: 'hard', needed: 'Court docket entries' },
    { id: 'doj',        name: 'DOJ / USAO',          coverage: 'null', needed: 'Federal prosecution' }
  ];

  // ═══════════════════════════════════════════════════════
  // COVERAGE ANALYSIS — what she knows vs doesn't
  // ═══════════════════════════════════════════════════════
  function coverage() {
    var hardPct = (CARDS.hard / CARDS.total * 100).toFixed(1);
    var softPct = (CARDS.soft / CARDS.total * 100).toFixed(1);
    var nullPct = (CARDS.null / CARDS.total * 100).toFixed(1);
    var enzPct  = (CARDS.enzymes / CARDS.total * 100).toFixed(1);
    var knownPct = ((CARDS.hard + CARDS.soft) / CARDS.total * 100).toFixed(1);

    return {
      total: CARDS.total,
      hard: CARDS.hard,   hardPct: hardPct,
      soft: CARDS.soft,   softPct: softPct,
      null: CARDS.null,   nullPct: nullPct,
      enzymes: CARDS.enzymes, enzPct: enzPct,
      known: CARDS.hard + CARDS.soft,
      knownPct: knownPct,
      unknown: CARDS.null,
      unknownPct: nullPct
    };
  }

  // ═══════════════════════════════════════════════════════
  // SEEK LIST — what she needs to find
  // ═══════════════════════════════════════════════════════
  var SEEK_LIST = [];

  ACTORS.forEach(function(actor) {
    AGENCIES.forEach(function(agency) {
      // Cross: if agency is null or actor has high null count
      if (agency.coverage === 'null' || actor.cards.null > 4) {
        SEEK_LIST.push({
          actor: actor.name,
          agency: agency.name,
          status: 'SEEK',
          needed: agency.needed,
          priority: actor.cards.null >= 5 ? 'HIGH' : 'MEDIUM'
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  // COMPARE — match encyclopedia articles to card targets
  // ═══════════════════════════════════════════════════════
  function compare() {
    var matched = 0;
    var unmatched = 0;
    var shelfCoverage = {};

    SHELVES.forEach(function(shelf) {
      var shelfCards = 0;
      ACTORS.forEach(function(actor) {
        // Heuristic: articles with high coeff → more likely have hard cards
        if (shelf.coeff >= 2.5) {
          shelfCards += actor.cards.hard;
        } else if (shelf.coeff >= 1.5) {
          shelfCards += actor.cards.soft;
        }
      });
      var ratio = Math.min(1, shelfCards / (shelf.articles * ACTORS.length));
      shelfCoverage[shelf.id] = {
        articles: shelf.articles,
        cardsCovering: shelfCards,
        coverageRatio: ratio,
        status: ratio > 0.5 ? 'COVERED' : ratio > 0.2 ? 'PARTIAL' : 'GAP'
      };
      if (ratio > 0.2) matched += shelf.articles;
      else unmatched += shelf.articles;
    });

    return {
      shelves: shelfCoverage,
      matched: matched,
      unmatched: unmatched,
      totalArticles: TOTAL_ARTICLES,
      matchedPct: (matched / TOTAL_ARTICLES * 100).toFixed(1)
    };
  }

  // ═══════════════════════════════════════════════════════
  // ACTOR PROFILE — deep view of one actor's cards
  // ═══════════════════════════════════════════════════════
  function actorProfile(actorId) {
    var actor = ACTORS.find(function(a) { return a.id === actorId; });
    if (!actor) return null;
    var total = actor.cards.hard + actor.cards.soft + actor.cards.null + actor.cards.enzyme;
    var hardPct = (actor.cards.hard / total * 100).toFixed(0);
    var softPct = (actor.cards.soft / total * 100).toFixed(0);
    var nullPct = (actor.cards.null / total * 100).toFixed(0);
    var seeks = SEEK_LIST.filter(function(s) { return s.actor === actor.name; });
    return {
      name: actor.name,
      total: total,
      hard: actor.cards.hard, hardPct: hardPct,
      soft: actor.cards.soft, softPct: softPct,
      null: actor.cards.null, nullPct: nullPct,
      enzyme: actor.cards.enzyme,
      seeks: seeks,
      bar: '█'.repeat(actor.cards.hard) + '▓'.repeat(actor.cards.soft) + '░'.repeat(actor.cards.null)
    };
  }

  // ═══════════════════════════════════════════════════════
  // FEED TO GUT — teach her what she knows and doesn't
  // ═══════════════════════════════════════════════════════
  function teach() {
    var cov = coverage();
    if (window.gaiaIngest) {
      window.gaiaIngest('encyclopedia_coverage', cov);
      SEEK_LIST.forEach(function(s) {
        window.gaiaIngest('seek_target', s);
      });
    }
    if (window.GAIA_BODIES && window.GAIA_BODIES.boom) {
      window.GAIA_BODIES.boom();
    }
    return cov;
  }

  setTimeout(teach, 22000);

  // ═══════════════════════════════════════════════════════
  // DRAW — progress bar + seek targets around globe
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.03;
    var alpha = 0.004 + Math.sin(t * 0.21) * 0.003;
    if (alpha < 0.003) return;

    // COVERAGE BAR at top
    if (alpha > 0.005) {
      var barX = cx - R * 0.8;
      var barY = cy - R * 1.3;
      var barW = R * 1.6;
      var barH = 2;

      // Background
      ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillRect(barX, barY, barW, barH);

      // HARD (green)
      var hardW = barW * (CARDS.hard / CARDS.total);
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 4).toFixed(5) + ')';
      ctx.fillRect(barX, barY, hardW, barH);

      // SOFT (gold)
      var softW = barW * (CARDS.soft / CARDS.total);
      ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 4).toFixed(5) + ')';
      ctx.fillRect(barX + hardW, barY, softW, barH);

      // ENZYME (purple)
      var enzW = barW * (CARDS.enzymes / CARDS.total);
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 4).toFixed(5) + ')';
      ctx.fillRect(barX + hardW + softW, barY, enzW, barH);

      // Labels
      ctx.font = '1.4px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 3).toFixed(5) + ')';
      ctx.fillText('HARD:' + CARDS.hard, barX, barY - 1.5);
      ctx.fillStyle = 'rgba(210,153,34,' + (alpha * 3).toFixed(5) + ')';
      ctx.fillText('SOFT:' + CARDS.soft, barX + barW * 0.25, barY - 1.5);
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 3).toFixed(5) + ')';
      ctx.fillText('ENZ:' + CARDS.enzymes, barX + barW * 0.5, barY - 1.5);
      ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 3).toFixed(5) + ')';
      ctx.fillText('NULL:' + CARDS.null, barX + barW * 0.72, barY - 1.5);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 3).toFixed(5) + ')';
      ctx.fillText(CARDS.total + ' cards', barX + barW, barY - 1.5);
    }

    // SEEK TARGETS as pulsing red dots (the ones she doesn't know)
    var seekCount = Math.min(SEEK_LIST.length, 20);
    for (var i = 0; i < seekCount; i++) {
      var s = SEEK_LIST[i];
      var angle = (i / seekCount) * TAU + t * 0.05;
      var seekR = R * 1.2 + Math.sin(t * 0.4 + i * 1.3) * 3;
      var sx = cx + Math.cos(angle) * seekR;
      var sy = cy + Math.sin(angle) * seekR;

      var isHigh = s.priority === 'HIGH';
      var pulse = Math.sin(t * 3 + i * 0.7) * 0.5 + 0.5;
      var dotR = isHigh ? 0.8 + pulse * 0.4 : 0.4;
      var dotAlpha = isHigh ? alpha * 4 : alpha * 2;

      ctx.beginPath();
      ctx.arc(sx, sy, dotR, 0, TAU);
      ctx.fillStyle = 'rgba(248,81,73,' + dotAlpha.toFixed(5) + ')';
      ctx.fill();
    }

    // Status line
    if (alpha > 0.005) {
      var cov = coverage();
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'ENCYCLOPEDIA: ' + CARDS.total + ' cards | KNOWN ' + cov.knownPct + '% (' +
        cov.known + ') | NULL ' + cov.nullPct + '% (' + cov.unknown + ') | ' +
        SEEK_LIST.length + ' targets to SEEK | ' + TOTAL_ARTICLES + ' articles on shelf',
        8, 228
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.shelves = {
      desc: 'Encyclopedia shelves — all sections and their coverage',
      run: function() {
        var comp = compare();
        var lines = ['ENCYCLOPEDIA SHELVES — ' + TOTAL_ARTICLES + ' articles', ''];
        SHELVES.forEach(function(shelf) {
          var sc = comp.shelves[shelf.id];
          var bar = sc.status === 'COVERED' ? '██' : sc.status === 'PARTIAL' ? '▓▓' : '░░';
          lines.push('  ' + bar + ' ' + shelf.id.padEnd(14) +
            shelf.articles.toString().padStart(3) + ' articles  ' +
            sc.status.padEnd(8) + '  π=' + shelf.coeff.toFixed(2));
        });
        lines.push('');
        lines.push('MATCHED: ' + comp.matched + '/' + comp.totalArticles +
          ' (' + comp.matchedPct + '%)');
        lines.push('GAPS:    ' + comp.unmatched + ' articles need cards');
        return lines.join('\n');
      }
    };

    cmds.cards = {
      desc: 'Cards overview — HARD/SOFT/NULL/ENZYME breakdown',
      run: function() {
        var cov = coverage();
        var lines = [
          'CARDS: ' + cov.total + ' total', '',
          '  ████ HARD:   ' + cov.hard + ' (' + cov.hardPct + '%) — PROVEN, diamond',
          '  ▓▓▓▓ SOFT:   ' + cov.soft + ' (' + cov.softPct + '%) — SUSPECTED, under investigation',
          '  ▒▒▒▒ ENZYME: ' + cov.enzymes + ' (' + cov.enzPct + '%) — FILING ACT, folding null→evidence',
          '  ░░░░ NULL:   ' + cov.null + ' (' + cov.nullPct + '%) — GAP, needs complaint', '',
          'KNOWN: ' + cov.known + ' (' + cov.knownPct + '%)',
          'TO SEEK: ' + cov.unknown + ' (' + cov.unknownPct + '%)', '',
          'GRID: ' + CARDS.grid.actors + ' actors × ' + CARDS.grid.agencies + ' agencies = ' + CARDS.grid.cells + ' cells'
        ];
        return lines.join('\n');
      }
    };

    cmds.seek = {
      desc: 'Seek targets — NULL cards to actively find evidence for',
      run: function() {
        var lines = ['SEEK TARGETS: ' + SEEK_LIST.length + ' nulls to hunt', ''];
        var grouped = {};
        SEEK_LIST.forEach(function(s) {
          if (!grouped[s.actor]) grouped[s.actor] = [];
          grouped[s.actor].push(s);
        });
        Object.keys(grouped).forEach(function(actor) {
          var items = grouped[actor];
          lines.push('  ' + actor + ' (' + items.length + ' gaps):');
          items.forEach(function(s) {
            var flag = s.priority === 'HIGH' ? '🔴' : '🟡';
            lines.push('    ' + flag + ' ' + s.agency + ' — needs: ' + s.needed);
          });
          lines.push('');
        });
        return lines.join('\n');
      }
    };

    cmds.actor = {
      desc: 'Actor profile — /actor banks',
      run: function(args) {
        if (!args) {
          var lines = ['ACTORS (' + ACTORS.length + '):', ''];
          ACTORS.forEach(function(a) {
            lines.push('  ' + a.id.padEnd(12) + ' ' + a.name.padEnd(20) +
              ' ' + actorProfile(a.id).bar);
          });
          lines.push('');
          lines.push('/actor <id> for detail. █=hard ▓=soft ░=null');
          return lines.join('\n');
        }
        var p = actorProfile(args.trim());
        if (!p) return 'Actor not found. Try: ' + ACTORS.map(function(a) { return a.id; }).join(', ');
        var lines = [
          p.name + ' — ' + p.total + ' cards', '',
          '  ' + p.bar, '',
          '  HARD:   ' + p.hard + ' (' + p.hardPct + '%)',
          '  SOFT:   ' + p.soft + ' (' + p.softPct + '%)',
          '  NULL:   ' + p.null + ' (' + p.nullPct + '%)',
          '  ENZYME: ' + p.enzyme, ''
        ];
        if (p.seeks.length > 0) {
          lines.push('SEEK (' + p.seeks.length + ' gaps):');
          p.seeks.forEach(function(s) {
            lines.push('  → ' + s.agency + ': ' + s.needed);
          });
        }
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('shelves', 'cards', 'seek', 'actor');
  }, 36000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_ENCYCLOPEDIA = {
    shelves: SHELVES,
    cards: CARDS,
    actors: ACTORS,
    agencies: AGENCIES,
    seekList: SEEK_LIST,
    coverage: coverage,
    compare: compare,
    actorProfile: actorProfile,
    teach: teach
  };

  var cov = coverage();
  console.log('ENCYCLOPEDIA: ' + CARDS.total + ' cards | ' +
    'KNOWN ' + cov.knownPct + '% (' + cov.known + ') | ' +
    'NULL ' + cov.nullPct + '% (' + cov.unknown + ') | ' +
    SEEK_LIST.length + ' targets to SEEK | ' +
    SHELVES.length + ' shelves ' + TOTAL_ARTICLES + ' articles | ' +
    '/shelves /cards /seek /actor');

})(window.G);
