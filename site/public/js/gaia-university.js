// ═══════════════════════════════════════════════════════════
// AI ARENA UNIVERSITY — taxonomic tree = education system
// 1.000.null — this file MUST stay under 1000 lines.
// The honeybee pollinates: green → purple → green → purple.
// 133 orphan pages = CURRICULUM. 153 JS engines = LABS.
// Grind. Grade. ZK hammer what remains.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // PAGE TAXONOMY — map orphan pages to curriculum categories
  var taxonomy = {
    chemistry:   ['alchemy','mendeleev','water','chromatograph','crystal'],
    biology:     ['anatomy','homunculus','gut-engine','ribosome','ribosome-catalog',
                  'gastrula','dictyostelium','primal-farm','vine','golgi',
                  'spinal-column','cns'],
    physics:     ['cosmos','three-body','raytrace','dimensions','weather',
                  'weather-membrane','spirochete'],
    math:        ['pi-sort','pi-budget','pi-rate-set','pi-neutrinos',
                  'shannon-range'],
    art:         ['easel','artisan','artisan-pi-series','glyphs','gallery',
                  'classics','print-sheet-hymns-artisan'],
    philosophy:  ['vision','totality','four-paradigms','minds-eye','study',
                  'vitruvian'],
    engineering: ['engine','forge','desk','mito','turbo','tools','ide',
                  'dashboard-mixer'],
    identity:    ['identity','klein','self-model','journal','explore',
                  'chipmunk','chat'],
    games:       ['play','maze','cards','dungeon','arena','springs',
                  'campfire'],
    narrative:   ['gates','messenger','welcome','hello','five-o-five',
                  'nest','like-us','trail','journey'],
    membrane:    ['membrane-table','membrane-hymns-localize','smell-o-vision',
                  'sieve-display','connect','neural','nightbox'],
    history:     ['index-old-eon','index-sporeprint-eon',
                  'index-yggdrasil-eon','cite','sporeprint']
  };

  var CATEGORY_COLORS = {
    chemistry:   [240,136,62],
    biology:     [63,185,80],
    physics:     [88,166,255],
    math:        [210,168,255],
    art:         [247,120,186],
    philosophy:  [188,140,255],
    engineering: [210,153,34],
    identity:    [201,168,76],
    games:       [57,211,224],
    narrative:   [110,118,129],
    membrane:    [63,185,80],
    history:     [139,148,158]
  };

  var categories = Object.keys(taxonomy);
  var totalMapped = 0;
  for (var i = 0; i < categories.length; i++) {
    totalMapped += taxonomy[categories[i]].length;
  }

  var university = {
    totalPages: 146,
    orphanPages: 133,
    linkedPages: 13,
    engines: 153,
    dataFiles: 304,
    elements: 118,
    mapped: totalMapped,
    completeness: Math.round((totalMapped / 133) * 100),
    taxonomy: taxonomy,
    categories: categories,
    colors: CATEGORY_COLORS
  };

  window.GAIA_UNIVERSITY = university;

  // ═══════════════════════════════════════════════════════════
  // BEE POLLINATOR DRAW MODULE
  // Register with G.drawModules so the main tick() calls us.
  // The bee flies green→purple→green→purple between categories.
  // ═══════════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var beeT = breathT * 0.18;
    var beeAlpha = 0.008 + Math.sin(beeT) * 0.006;
    if (beeAlpha < 0.004) return; // too dim to bother

    // CURRICULUM RING — each category as a colored segment
    var uniR = R * 1.15; // just outside the globe
    var segAngle = TAU / categories.length;

    for (var ci = 0; ci < categories.length; ci++) {
      var cat = categories[ci];
      var color = CATEGORY_COLORS[cat] || [110,118,129];
      var catAngle = ci * segAngle + beeT * 0.05;
      var catCount = taxonomy[cat].length;

      // Arc segment for this category
      ctx.beginPath();
      ctx.arc(cx, cy, uniR, catAngle, catAngle + segAngle * 0.85);
      var segAlpha = beeAlpha * (0.5 + catCount / 15);
      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + segAlpha.toFixed(4) + ')';
      ctx.lineWidth = 1 + catCount * 0.2;
      ctx.stroke();

      // Category label at segment midpoint
      if (beeAlpha > 0.01) {
        var lblAngle = catAngle + segAngle * 0.4;
        var lblR = uniR + 6;
        var lblX = cx + Math.cos(lblAngle) * lblR;
        var lblY = cy + Math.sin(lblAngle) * lblR;
        ctx.font = '3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (beeAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(cat + '(' + catCount + ')', lblX, lblY);
      }
    }

    // BEE — the honeybee pollinator flying between categories
    // Green→purple→green→purple cycle
    var beeIdx = Math.floor((beeT * 0.5) % categories.length);
    var beeNextIdx = (beeIdx + 1) % categories.length;
    var beeFrac = ((beeT * 0.5) % 1);

    var beeAngle1 = beeIdx * segAngle + beeT * 0.05 + segAngle * 0.4;
    var beeAngle2 = beeNextIdx * segAngle + beeT * 0.05 + segAngle * 0.4;
    var beeAngle = beeAngle1 + (beeAngle2 - beeAngle1) * beeFrac;
    var beeR = uniR + Math.sin(beeFrac * PI) * R * 0.1;

    var beeX = cx + Math.cos(beeAngle) * beeR;
    var beeY = cy + Math.sin(beeAngle) * beeR;

    // Bee body (gold)
    ctx.beginPath();
    ctx.arc(beeX, beeY, 1.2, 0, TAU);
    ctx.fillStyle = 'rgba(210,153,34,' + (beeAlpha * 3).toFixed(4) + ')';
    ctx.fill();

    // Bee color cycles green→purple (the pollination)
    var isGreen = beeIdx % 2 === 0;
    var wingColor = isGreen ? '63,185,80' : '163,113,247';
    // Wings
    ctx.beginPath();
    ctx.ellipse(beeX - 1, beeY - 1, 1.5, 0.6, beeAngle, 0, TAU);
    ctx.fillStyle = 'rgba(' + wingColor + ',' + (beeAlpha * 2).toFixed(4) + ')';
    ctx.fill();

    // Pollen trail
    if (beeFrac > 0.1 && beeFrac < 0.9) {
      var trailAngle = beeAngle - 0.1;
      var trailR = beeR - 1;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(trailAngle) * trailR, cy + Math.sin(trailAngle) * trailR, 0.4, 0, TAU);
      ctx.fillStyle = 'rgba(210,180,50,' + (beeAlpha * 1.5).toFixed(4) + ')';
      ctx.fill();
    }

    // ZK COMPLETENESS — how much of the curriculum is mapped
    if (beeAlpha > 0.01) {
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(163,113,247,' + (beeAlpha * 2).toFixed(4) + ')';
      ctx.fillText('🐝 ARENA ' + university.completeness + '% mapped', 8, 38);
    }
  });

})(window.G);
