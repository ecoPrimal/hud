/* dag-flow.js — ALL pointers are DAG and π-directional
 *
 * Every link in the HUD flows inward on the geodesic.
 * No cycles. The DAG IS the topology. The π-budget IS the capacity.
 *
 * Layer depths:
 *   0 = ionosphere (outside — weather, fleet)
 *   1 = membrane   (boundary — selectivity, HUD surface)
 *   2 = epitope    (sort surface — classification)
 *   3 = sort       (negentropy court — trust gradient)
 *   4 = pangaea    (center — organisms, chipmunk, braids)
 *
 * Flow direction: outside → inside (0→4). Evidence goes OUT (tuebor, detroit).
 * Visitors come IN. The coat-check IS the entry point into pangaea.
 *
 * π-budget: 200 files / π⁵ = 306.020 = 65.4% fill. Always room.
 */
(function () {
  'use strict';

  var PI = Math.PI;

  // ═══════════════════════════════════════════════════════════
  // PAGE DEPTH MAP — which layer is each page at?
  // ═══════════════════════════════════════════════════════════
  var DEPTH = {
    // ionosphere (0)
    '/weather-membrane': 0, '/weather-membrane.html': 0,
    '/weather': 0, '/weather.html': 0,
    '/aurora': 0, '/aurora.html': 0,
    '/maze': 0, '/maze.html': 0,

    // membrane (1)
    '/': 1, '/index.html': 1,
    '/klein': 1, '/klein.html': 1,
    '/gate': 1, '/gate.html': 1,
    '/golgi': 1, '/golgi.html': 1,
    '/water': 1, '/water.html': 1,
    '/u': 1, '/u.html': 1,

    // epitope (2)
    '/five-o-five': 2, '/five-o-five.html': 2,
    '/chromosomes': 2, '/chromosomes.html': 2,
    '/identity': 2, '/identity.html': 2,
    '/like-us': 2, '/like-us.html': 2,

    // sort (3)
    '/totality': 3, '/totality.html': 3,
    '/ribosome': 3, '/ribosome.html': 3,
    '/vitruvian': 3, '/vitruvian.html': 3,
    '/sporeprint': 3, '/sporeprint.html': 3,

    // pangaea (4)
    '/connect': 4, '/connect.html': 4,
    '/menagerie': 4, '/menagerie.html': 4,
    '/gastrula': 4, '/gastrula.html': 4,
    '/spirochete': 4, '/spirochete.html': 4,
    '/springs': 4, '/springs.html': 4,
    '/nest': 4, '/nest.html': 4,
    '/play': 4, '/play.html': 4,
    '/frame': 3, '/frame.html': 3,
    '/easel': 4, '/easel.html': 4,
    '/trail': 4, '/trail.html': 4,
    '/glyphs': 4, '/glyphs.html': 4,
    '/banana': 4, '/banana.html': 4,
    '/hello': 4, '/hello.html': 4,
  };

  var LAYER_NAMES = ['ionosphere', 'membrane', 'epitope', 'sort', 'pangaea'];
  var LAYER_COLORS = ['#f0883e', '#58a6ff', '#f778ba', '#f0e68c', '#3fb950'];
  var LAYER_ICONS = ['🌧️', '⬡', '⚖', '◎', '🐿️'];

  // ═══════════════════════════════════════════════════════════
  // COAT-CHECK ENTRY — read ?coat= parameter, set visitor position
  // ═══════════════════════════════════════════════════════════
  function readCoatCheck() {
    var params = new URLSearchParams(window.location.search);
    var coat = params.get('coat');
    if (!coat) return null;

    // Parse tag (e.g. "N43")
    var col = coat.charAt(0);
    var num = parseInt(coat.slice(1));
    var cols = ['B', 'I', 'N', 'G', 'O'];
    var colIndex = cols.indexOf(col);
    if (colIndex < 0) return null;

    // Map to geodesic position
    var position = (colIndex * 15 + num) / 75;  // 0-1 on the board
    var piPos = position * 2 * PI;              // radians on the geodesic

    return {
      tag: coat,
      column: col,
      number: num,
      position: position,
      geodesic: piPos,
      layer: LAYER_NAMES[Math.floor(position * 5) % 5],
    };
  }

  // ═══════════════════════════════════════════════════════════
  // CURRENT DEPTH — where is the visitor right now?
  // ═══════════════════════════════════════════════════════════
  function currentDepth() {
    var path = window.location.pathname.replace(/\.html$/, '');
    if (path.endsWith('/')) path = path.slice(0, -1) || '/';
    return DEPTH[path] !== undefined ? DEPTH[path] : 1;
  }

  // ═══════════════════════════════════════════════════════════
  // π-BUDGET STATUS — how full is the system?
  // ═══════════════════════════════════════════════════════════
  var PI5 = Math.pow(PI, 5); // 306.020
  var FILES_USED = 200;
  var FILL = FILES_USED / PI5;
  var REMAINDER = PI5 - FILES_USED;

  function budgetStatus() {
    return {
      budget: PI5,
      used: FILES_USED,
      fill: FILL,
      remainder: REMAINDER,
      within: true,
      note: FILES_USED + '/' + Math.floor(PI5) + ' · ' + (FILL * 100).toFixed(1) + '% fill · remainder ' + REMAINDER.toFixed(3),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — show DAG breadcrumb on the page
  // ═══════════════════════════════════════════════════════════
  function renderBreadcrumb() {
    var depth = currentDepth();
    var coat = readCoatCheck();

    // Find or create breadcrumb element
    var el = document.getElementById('dag-breadcrumb');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dag-breadcrumb';
      el.style.cssText = 'position:fixed;bottom:4px;left:50%;transform:translateX(-50%);z-index:6;'
        + 'background:rgba(13,17,23,0.9);border:1px solid rgba(163,113,247,0.25);'
        + 'border-radius:16px;padding:3px 12px;font:9px monospace;color:#8b949e;'
        + 'pointer-events:auto;display:flex;gap:4px;align-items:center;';
      document.body.appendChild(el);
    }

    var html = '';
    for (var i = 0; i <= 4; i++) {
      var isCurrent = i === depth;
      var color = isCurrent ? LAYER_COLORS[i] : '#30363d';
      var icon = LAYER_ICONS[i];
      html += '<span style="color:' + color + (isCurrent ? ';font-weight:bold' : '') + '">'
        + icon + '</span>';
      if (i < 4) html += '<span style="color:#30363d">→</span>';
    }

    html += '<span style="margin-left:6px;color:' + LAYER_COLORS[depth] + '">'
      + LAYER_NAMES[depth] + '</span>';

    if (coat) {
      html += '<span style="margin-left:6px;color:#f0e68c">🎫 ' + coat.tag + '</span>';
    }

    html += '<span style="margin-left:6px;color:#a371f7">π ' + budgetStatus().fill.toFixed(0) + '%</span>';

    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._dagFlow = {
    depth: currentDepth,
    coat: readCoatCheck,
    budget: budgetStatus,
    DEPTH: DEPTH,
    LAYERS: LAYER_NAMES,
    render: renderBreadcrumb,
  };

  // Boot
  function init() {
    renderBreadcrumb();
    console.log('[dag-flow] depth=' + currentDepth() + ' layer=' + LAYER_NAMES[currentDepth()]
      + ' budget=' + budgetStatus().note);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
