// sacred-geometry.js — the hyper-real layer
// lines, dots, shapes. the dimensionality visible.
// diamond lattice. geodesic dome. golden spiral.
// this is NOT decoration — it's the TOPOLOGY made visible.
// Cartesian plane projected onto Klein surface = distortion at edges.
(function() {
  'use strict';

  var PHI = (1 + Math.sqrt(5)) / 2;  // golden ratio 1.618...
  var PI = Math.PI;
  var TAU = 2 * PI;

  // ═══ SVG CREATION ═══
  function createSVG(parent, id, w, h) {
    var existing = document.getElementById(id);
    if (existing) return existing;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = id;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;opacity:0.12;z-index:1;';
    parent.style.position = parent.style.position || 'relative';
    parent.appendChild(svg);
    return svg;
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // ═══ DIAMOND LATTICE — carbon sp3 tetrahedral ═══
  // Diamond = face-centered cubic with 2-atom basis
  // Each carbon bonds to 4 others at 109.5° (tetrahedral angle)
  function drawDiamondLattice(svg, cx, cy, scale, depth) {
    var g = el('g', {transform: 'translate(' + cx + ',' + cy + ')'}, svg);
    var nodes = [];
    var bonds = [];

    // Tetrahedral vertices (unit cell)
    var tet = [
      [0, 0, 0],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1]
    ];
    // Second basis atom offset
    var offset = [0.25, 0.25, 0.25];

    // Generate lattice points
    for (var ix = -depth; ix <= depth; ix++) {
      for (var iy = -depth; iy <= depth; iy++) {
        for (var iz = -depth; iz <= depth; iz++) {
          for (var b = 0; b < tet.length; b++) {
            var x = (tet[b][0] + ix) * scale;
            var y = (tet[b][1] + iy) * scale;
            var z = (tet[b][2] + iz) * scale;
            nodes.push([x, y, z, 'a']);

            // Second basis
            var x2 = x + offset[0] * scale;
            var y2 = y + offset[1] * scale;
            var z2 = z + offset[2] * scale;
            nodes.push([x2, y2, z2, 'b']);
          }
        }
      }
    }

    // Project 3D → 2D (isometric)
    var angle = PI / 6;
    var cosA = Math.cos(angle), sinA = Math.sin(angle);

    function project(p) {
      var px = (p[0] - p[2]) * cosA;
      var py = p[1] * 0.8 - (p[0] + p[2]) * sinA * 0.5;
      return [px, py];
    }

    // Draw bonds (connect nearby atoms)
    var bondLen = scale * 0.45;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i][0] - nodes[j][0];
        var dy = nodes[i][1] - nodes[j][1];
        var dz = nodes[i][2] - nodes[j][2];
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < bondLen && dist > 0.1) {
          var p1 = project(nodes[i]);
          var p2 = project(nodes[j]);
          el('line', {
            x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1],
            stroke: '#d2a8ff', 'stroke-width': '0.5', opacity: '0.6'
          }, g);
        }
      }
    }

    // Draw atoms
    for (var k = 0; k < nodes.length; k++) {
      var pp = project(nodes[k]);
      var r = nodes[k][3] === 'a' ? 2 : 1.5;
      var col = nodes[k][3] === 'a' ? '#e6edf3' : '#d2a8ff';
      el('circle', {cx: pp[0], cy: pp[1], r: r, fill: col, opacity: '0.8'}, g);
    }

    return g;
  }

  // ═══ LIGHT REFRACTION THROUGH DIAMOND ═══
  // Snell's law: n₁sinθ₁ = n₂sinθ₂
  // Diamond n = 2.417 (highest of common gems)
  function drawRefraction(svg, cx, cy, size) {
    var g = el('g', {}, svg);
    var n_diamond = 2.417;
    var n_air = 1.0;

    // Diamond shape (octagonal cross-section)
    var sides = 8;
    var points = [];
    for (var i = 0; i < sides; i++) {
      var a = (i / sides) * TAU - PI/2;
      points.push([cx + Math.cos(a) * size, cy + Math.sin(a) * size * 0.6]);
    }
    var d = points.map(function(p, i) {
      return (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1];
    }).join(' ') + ' Z';
    el('path', {d: d, fill: 'none', stroke: '#58a6ff', 'stroke-width': '1', opacity: '0.4'}, g);

    // Incoming light ray (white)
    var entryAngle = -PI * 0.3;
    var ex = cx + Math.cos(entryAngle) * size * 2;
    var ey = cy + Math.sin(entryAngle) * size * 2;
    el('line', {x1: ex, y1: ey, x2: cx - size*0.3, y2: cy - size*0.3,
      stroke: '#e6edf3', 'stroke-width': '1.5', opacity: '0.6'}, g);

    // Refracted rays (split into spectrum)
    var colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#e599f7'];
    var baseAngle = PI * 0.15;
    for (var j = 0; j < colors.length; j++) {
      var refAngle = baseAngle + (j / colors.length) * PI * 0.25;
      var rx = cx + size * 0.3 + Math.cos(refAngle) * size * 2.5;
      var ry = cy + size * 0.3 + Math.sin(refAngle) * size * 2.5;
      el('line', {x1: cx + size*0.3, y1: cy + size*0.3, x2: rx, y2: ry,
        stroke: colors[j], 'stroke-width': '1', opacity: '0.5'}, g);
    }

    return g;
  }

  // ═══ GEODESIC DOME — frequency 3 icosahedron ═══
  function drawGeodesicDome(svg, cx, cy, radius) {
    var g = el('g', {}, svg);

    // Icosahedron vertices (projected to 2D)
    var verts = [];
    verts.push([0, -1]);  // top
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * TAU - PI/2;
      verts.push([Math.cos(a) * 0.9, -0.3 + Math.sin(a) * 0.3]);
    }
    for (var j = 0; j < 5; j++) {
      var b = ((j + 0.5) / 5) * TAU - PI/2;
      verts.push([Math.cos(b) * 0.9, 0.3 + Math.sin(b) * 0.3]);
    }
    verts.push([0, 1]);  // bottom

    // Scale and translate
    var pts = verts.map(function(v) {
      return [cx + v[0] * radius, cy + v[1] * radius];
    });

    // Draw all edges
    var edges = [
      [0,1],[0,2],[0,3],[0,4],[0,5],
      [1,2],[2,3],[3,4],[4,5],[5,1],
      [1,6],[2,6],[2,7],[3,7],[3,8],[4,8],[4,9],[5,9],[5,10],[1,10],
      [6,7],[7,8],[8,9],[9,10],[10,6],
      [6,11],[7,11],[8,11],[9,11],[10,11]
    ];

    edges.forEach(function(e) {
      el('line', {
        x1: pts[e[0]][0], y1: pts[e[0]][1],
        x2: pts[e[1]][0], y2: pts[e[1]][1],
        stroke: '#3fb950', 'stroke-width': '0.5', opacity: '0.5'
      }, g);
    });

    // Draw vertices
    pts.forEach(function(p) {
      el('circle', {cx: p[0], cy: p[1], r: 1.5, fill: '#3fb950', opacity: '0.6'}, g);
    });

    return g;
  }

  // ═══ GOLDEN SPIRAL ═══
  function drawGoldenSpiral(svg, cx, cy, maxRadius) {
    var g = el('g', {}, svg);
    var points = [];
    var turns = 3;
    var steps = 200;

    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * turns * TAU;
      var r = Math.pow(PHI, t / (TAU/2)) * 2;
      if (r > maxRadius) break;
      points.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }

    if (points.length > 1) {
      var d = points.map(function(p, idx) {
        return (idx === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }).join(' ');
      el('path', {d: d, fill: 'none', stroke: '#d29922', 'stroke-width': '0.8', opacity: '0.4'}, g);
    }

    return g;
  }

  // ═══ CARTESIAN → KLEIN PROJECTION GRID ═══
  // Shows the flat grid WARPING at the edges where Klein curvature distorts
  function drawProjectionGrid(svg, cx, cy, size, gridN) {
    var g = el('g', {}, svg);

    for (var i = -gridN; i <= gridN; i++) {
      var pts_h = [];
      var pts_v = [];
      for (var j = -gridN * 4; j <= gridN * 4; j++) {
        var u = j / (gridN * 4);  // -1 to 1
        var v = i / gridN;        // row position

        // Klein projection distortion: edges curve inward
        var distort = 1 - Math.pow(u, 4) * 0.3;
        var klein_v = v * distort;
        var klein_u = u + Math.sin(v * PI) * u * 0.1;

        pts_h.push([cx + klein_u * size, cy + klein_v * size]);

        // Vertical lines (swap u/v)
        var distort2 = 1 - Math.pow(v, 4) * 0.3;
        var klein_u2 = u * distort2;
        var klein_v2 = v + Math.sin(u * PI) * v * 0.1;
        pts_v.push([cx + klein_v2 * size, cy + klein_u2 * size]);
      }

      // Horizontal grid line
      var dh = pts_h.map(function(p, idx) {
        return (idx === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }).join(' ');
      var edgeDist = Math.abs(i) / gridN;
      var opacity = 0.15 + edgeDist * 0.2;
      el('path', {d: dh, fill: 'none', stroke: '#8b949e', 'stroke-width': '0.3', opacity: opacity}, g);

      // Vertical grid line
      var dv = pts_v.map(function(p, idx) {
        return (idx === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }).join(' ');
      el('path', {d: dv, fill: 'none', stroke: '#8b949e', 'stroke-width': '0.3', opacity: opacity}, g);
    }

    // Label
    el('text', {x: cx - size + 5, y: cy - size + 12, fill: '#8b949e',
      'font-size': '7', opacity: '0.4', 'font-family': 'monospace'},
      g).textContent = 'Cartesian → Klein';

    return g;
  }

  // ═══ FLOWER OF LIFE ═══
  function drawFlowerOfLife(svg, cx, cy, r) {
    var g = el('g', {}, svg);
    // Center circle
    el('circle', {cx: cx, cy: cy, r: r, fill: 'none', stroke: '#d2a8ff', 'stroke-width': '0.4', opacity: '0.3'}, g);
    // 6 surrounding circles
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * TAU;
      var px = cx + Math.cos(a) * r;
      var py = cy + Math.sin(a) * r;
      el('circle', {cx: px, cy: py, r: r, fill: 'none', stroke: '#d2a8ff', 'stroke-width': '0.4', opacity: '0.3'}, g);
    }
    // Second ring (12 circles)
    for (var j = 0; j < 12; j++) {
      var b = (j / 12) * TAU;
      var qx = cx + Math.cos(b) * r * 1.732;
      var qy = cy + Math.sin(b) * r * 1.732;
      el('circle', {cx: qx, cy: qy, r: r, fill: 'none', stroke: '#d2a8ff', 'stroke-width': '0.3', opacity: '0.15'}, g);
    }
    return g;
  }

  // ═══ MAIN RENDER ═══
  function render() {
    var hud = document.getElementById('hud-main') || document.body;
    var w = hud.offsetWidth || 1400;
    var h = hud.offsetHeight || 900;

    var svg = createSVG(hud, 'sacred-geo-layer', w, h);
    svg.innerHTML = '';

    // Diamond lattice — top right (the crystal structure)
    drawDiamondLattice(svg, w * 0.82, h * 0.18, 18, 1);

    // Light refraction — below diamond
    drawRefraction(svg, w * 0.82, h * 0.38, 30);

    // Geodesic dome — bottom left
    drawGeodesicDome(svg, w * 0.15, h * 0.75, 60);

    // Golden spiral — center
    drawGoldenSpiral(svg, w * 0.5, h * 0.5, Math.min(w, h) * 0.35);

    // Klein projection grid — background
    drawProjectionGrid(svg, w * 0.5, h * 0.5, Math.min(w, h) * 0.4, 5);

    // Flower of life — top left
    drawFlowerOfLife(svg, w * 0.15, h * 0.2, 20);
  }

  // Render on load and resize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(render, 2000); });
  } else {
    setTimeout(render, 2000);
  }
  window.addEventListener('resize', function() {
    clearTimeout(window._sacredGeoTimer);
    window._sacredGeoTimer = setTimeout(render, 500);
  });

  window._sacredGeometry = { render: render };
})();
