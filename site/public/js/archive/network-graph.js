// Network graph visualization for detroit.primals.eco
// Renders actor/entity relationships as an interactive force-directed graph.
// Body awareness: 0=raw(graph.json), 1=sorted(classification.json),
//   2=observed(gaia core + moon orbit + π ratio).
//
// Data source: window.DETROIT_NETWORK (loaded from network-data.js)
// Fallback: petalTongue API /api/public-record/network

(function() {
  'use strict';

  var DN = window.DETROIT_NETWORK || {};
  var COLORS = DN.nodeColors || {};
  var LINK_COLORS = DN.edgeColors || {};
  var NEXUS_COLORS = DN.nexusColors || {};
  var FLOW_COLORS = DN.flowColors || {};
  var FLOW_ICONS = DN.flowIcons || {};
  var OWNERSHIP_GROUPS = DN.ownershipGroups || [];
  var ADDRESS_CLUSTERS = DN.addressClusters || [];
  var OVERSIGHT_CYCLES = DN.oversightCycles || [];
  var COMMUNITIES = DN.communities || [];
  var SORT_COLORS = DN.sortColors || {
    'non-self': '#e74c3c', 'self': '#27ae60', 'null': '#7f8c8d',
    'partial': '#f39c12', 'other': '#3498db', 'unknown': 'rgba(128,128,128,0.3)'
  };
  var SORT_RADIUS = { 'non-self': 0.20, 'partial': 0.35, 'null': 0.50, 'self': 0.65, 'other': 0.80, 'unknown': 0.90 };

  var classificationData = null;
  var bodyLevel = 0;
  var showSort = false;
  var activeNexus = { education: true, political: true, enforcement: true, weaponization: true, legislative: true };
  var showOwnership = false, showAddress = false, showCycles = false;
  var activeFlows = null, activeDynasty = null;
  var collapseStrategy = null;
  var expandedGroups = {};

  var DYNASTY_COLORS = { kilpatrick:'#a855f7', stallworth:'#f59e0b', sabree:'#60a5fa', banks_flenory:'#ef4444', mayoral:'#94a3b8' };
  var DYNASTY_LABELS = { kilpatrick:'Kilpatrick', stallworth:'Stallworth', sabree:'Sabree', banks_flenory:'Banks/BMF', mayoral:'Mayors' };

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  function svgText(text, attrs, parent) {
    var el = svgEl('text', attrs, parent);
    el.textContent = text;
    return el;
  }

  function convexHull(points) {
    if (points.length < 3) return points;
    points.sort(function(a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var lower = [], upper = [];
    for (var i = 0; i < points.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) lower.pop();
      lower.push(points[i]);
    }
    for (var i = points.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) upper.pop();
      upper.push(points[i]);
    }
    upper.pop(); lower.pop();
    return lower.concat(upper);
  }
  function cross(O, A, B) { return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]); }

  // ═══ CONTROLS ═══
  function buildControls(ctx) {
    var c = ctx.container, data = ctx.data;
    var controls = c.querySelector('.graph-controls');
    if (controls) { ctx.controls = controls; return; }
    controls = document.createElement('div');
    controls.className = 'graph-controls';
    controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;';

    function addLabel(text) {
      var s = document.createElement('span');
      s.textContent = text;
      s.style.cssText = 'font-size:12px;font-weight:600;opacity:0.7;margin-right:4px;';
      controls.appendChild(s);
    }
    function addSep() {
      var s = document.createElement('span');
      s.style.cssText = 'width:1px;height:20px;background:rgba(128,128,128,0.3);margin:0 4px;';
      controls.appendChild(s);
    }
    function addBtn(label, style, onClick) {
      var b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = style;
      b.addEventListener('click', onClick);
      controls.appendChild(b);
      return b;
    }
    var btnBase = 'padding:4px 12px;border-radius:14px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;';

    addLabel('Nexus overlay:');
    var nexusLabels = { education:'Education', political:'Political', enforcement:'Enforcement', weaponization:'Weaponization', legislative:'Legislative' };
    ['education','political','enforcement','weaponization','legislative'].forEach(function(nx) {
      var btn = addBtn(nexusLabels[nx],
        btnBase + 'border:2px solid ' + NEXUS_COLORS[nx] + ';background:' + NEXUS_COLORS[nx] + ';color:#fff;',
        function() {
          activeNexus[nx] = !activeNexus[nx];
          btn.style.background = activeNexus[nx] ? NEXUS_COLORS[nx] : 'transparent';
          btn.style.color = activeNexus[nx] ? '#fff' : NEXUS_COLORS[nx];
          renderGraph(c, data);
        });
      btn.dataset.nexus = nx;
    });

    var allBtn = addBtn('All',
      btnBase + 'border:2px solid #7f8c8d;background:transparent;color:#7f8c8d;',
      function() {
        Object.keys(activeNexus).forEach(function(k) { activeNexus[k] = true; });
        controls.querySelectorAll('[data-nexus]').forEach(function(b) {
          b.style.background = NEXUS_COLORS[b.dataset.nexus]; b.style.color = '#fff';
        });
        renderGraph(c, data);
      });

    addSep();

    var ownerBtn = addBtn('⬡ Ownership', btnBase + 'border:2px solid rgba(192,57,43,0.5);background:transparent;color:#c0392b;',
      function() {
        showOwnership = !showOwnership;
        ownerBtn.style.background = showOwnership ? 'rgba(192,57,43,0.15)' : 'transparent';
        renderGraph(c, data);
      });
    var addrBtn = addBtn('📍 Addresses', btnBase + 'border:2px solid rgba(211,84,0,0.5);background:transparent;color:#d35400;',
      function() {
        showAddress = !showAddress;
        addrBtn.style.background = showAddress ? 'rgba(211,84,0,0.15)' : 'transparent';
        renderGraph(c, data);
      });
    var cycBtn = addBtn('⟳ Cycles', btnBase + 'border:2px solid rgba(230,126,34,0.5);background:transparent;color:#e67e22;',
      function() {
        showCycles = !showCycles;
        cycBtn.style.background = showCycles ? 'rgba(230,126,34,0.15)' : 'transparent';
        renderGraph(c, data);
      });

    addSep();

    var dynastyKeys = Object.keys(DYNASTY_COLORS);
    if (dynastyKeys.length) {
      addLabel('Dynasty:');
      dynastyKeys.forEach(function(dk) {
        var db = addBtn(DYNASTY_LABELS[dk] || dk,
          btnBase + 'border:2px solid ' + DYNASTY_COLORS[dk] + ';background:transparent;color:' + DYNASTY_COLORS[dk] + ';',
          function() {
            activeDynasty = activeDynasty === dk ? null : dk;
            dynastyKeys.forEach(function(k) {
              var el = controls.querySelector('[data-dynasty="' + k + '"]');
              if (el) {
                el.style.background = activeDynasty === k ? DYNASTY_COLORS[k] : 'transparent';
                el.style.color = activeDynasty === k ? '#fff' : DYNASTY_COLORS[k];
              }
            });
            renderGraph(c, data);
          });
        db.dataset.dynasty = dk;
      });
    }

    addSep();

    addLabel('Flow:');
    Object.keys(FLOW_COLORS).forEach(function(ft) {
      var fb = addBtn(FLOW_ICONS[ft] + ' ' + ft.charAt(0).toUpperCase() + ft.slice(1),
        btnBase + 'border:2px solid ' + FLOW_COLORS[ft] + ';background:transparent;color:' + FLOW_COLORS[ft] + ';',
        function() {
          if (!activeFlows) activeFlows = {};
          activeFlows[ft] = !activeFlows[ft];
          fb.style.background = activeFlows[ft] ? FLOW_COLORS[ft] + '22' : 'transparent';
          if (!Object.values(activeFlows).some(function(v) { return v; })) activeFlows = null;
          renderGraph(c, data);
        });
      fb.dataset.flow = ft;
    });

    addSep();

    addLabel('Collapse:');
    var collapseWrap = document.createElement('span');
    collapseWrap.style.position = 'relative';
    var collapseBtn = addBtn(collapseStrategy ? '▾ ' + collapseStrategy : '▸ None',
      btnBase + 'border:2px solid #7f8c8d;background:transparent;color:#7f8c8d;', function() {
        collapseMenu.style.display = collapseMenu.style.display === 'block' ? 'none' : 'block';
      });
    collapseWrap.appendChild(collapseBtn);
    var collapseMenu = document.createElement('div');
    collapseMenu.style.cssText = 'display:none;position:absolute;top:100%;left:0;background:#1a1a2e;border:1px solid #30363d;border-radius:6px;z-index:100;min-width:140px;padding:4px 0;';
    [{ key: null, label: 'None' }, { key: 'community', label: 'Community' },
     { key: 'ownership', label: 'Ownership' }, { key: 'address', label: 'Address' },
     { key: 'dynasty', label: 'Dynasty' }].forEach(function(opt) {
      var item = document.createElement('div');
      item.textContent = (collapseStrategy === opt.key ? '● ' : '○ ') + opt.label;
      item.style.cssText = 'padding:4px 12px;font-size:11px;cursor:pointer;color:#c9d1d9;';
      item.addEventListener('mouseenter', function() { item.style.background = 'rgba(88,166,255,0.1)'; });
      item.addEventListener('mouseleave', function() { item.style.background = 'transparent'; });
      item.addEventListener('click', function() {
        collapseStrategy = opt.key; expandedGroups = {};
        collapseMenu.style.display = 'none';
        collapseBtn.textContent = opt.key ? '▾ ' + opt.key : '▸ None';
        renderGraph(c, data);
      });
      collapseMenu.appendChild(item);
    });
    collapseWrap.appendChild(collapseMenu);
    controls.appendChild(collapseWrap);

    addSep();

    var sortBtn = addBtn('◉ Sort', btnBase + 'border:2px solid #e67e22;background:transparent;color:#e67e22;',
      function() {
        showSort = !showSort;
        sortBtn.style.background = showSort ? '#e67e2222' : 'transparent';
        renderGraph(c, data);
      });

    c.insertBefore(controls, c.firstChild);
    ctx.controls = controls;
  }

  // ═══ FILTER + COLLAPSE ═══
  function filterAndCollapse(ctx) {
    var data = ctx.data;
    var anyActive = Object.values(activeNexus).some(function(v) { return v; });
    ctx.filteredNodes = data.nodes.filter(function(n) {
      if (!anyActive) return true;
      return !n.nexus || !n.nexus.length || n.nexus.some(function(nx) { return activeNexus[nx]; });
    });
    var visibleIds = {};
    ctx.filteredNodes.forEach(function(n) { visibleIds[n.id] = true; });
    ctx.filteredLinks = data.links.filter(function(l) { return visibleIds[l.source] && visibleIds[l.target]; });

    if (!collapseStrategy) return;
    var groups = [];
    if (collapseStrategy === 'community') {
      groups = COMMUNITIES.map(function(c) { return { id: 'comm_' + c.id, label: c.label, members: c.members, color: c.color }; });
    } else if (collapseStrategy === 'ownership') {
      groups = OWNERSHIP_GROUPS.map(function(g) { return { id: 'own_' + g.id, label: g.label, members: g.members, color: '#e74c3c' }; });
    } else if (collapseStrategy === 'address') {
      groups = ADDRESS_CLUSTERS.map(function(a) { return { id: 'addr_' + a.id, label: a.label, members: a.members, color: '#d35400' }; });
    } else if (collapseStrategy === 'dynasty') {
      var dynGroups = {};
      ctx.filteredNodes.forEach(function(n) {
        var dy = n.dynasty || '_ungrouped';
        if (!dynGroups[dy]) dynGroups[dy] = [];
        dynGroups[dy].push(n.id);
      });
      Object.keys(dynGroups).forEach(function(dy) {
        if (dy === '_ungrouped' || dynGroups[dy].length < 2) return;
        groups.push({ id: 'dyn_' + dy, label: (DYNASTY_LABELS[dy] || dy) + ' dynasty', members: dynGroups[dy], color: DYNASTY_COLORS[dy] || '#7f8c8d' });
      });
    }

    var nodeToGroup = {}, groupedNodeIds = {};
    groups.forEach(function(g) {
      if (expandedGroups[g.id]) return;
      g.members.forEach(function(mid) { if (visibleIds[mid]) { nodeToGroup[mid] = g.id; groupedNodeIds[mid] = true; } });
    });

    var superNodes = [];
    groups.forEach(function(g) {
      if (expandedGroups[g.id]) return;
      var memberNodes = g.members.filter(function(m) { return visibleIds[m]; });
      if (!memberNodes.length) return;
      var edgeCount = 0;
      ctx.filteredLinks.forEach(function(l) { if (nodeToGroup[l.source] === g.id || nodeToGroup[l.target] === g.id) edgeCount++; });
      superNodes.push({
        id: g.id, label: g.label, tier: 3, type: 'super', detail: memberNodes.length + ' nodes, ' + edgeCount + ' connections',
        url: null, nexus: [], dynasty: null, era: null, community: -1,
        _isSuper: true, _members: memberNodes, _color: g.color, _memberCount: memberNodes.length
      });
    });

    ctx.filteredNodes = ctx.filteredNodes.filter(function(n) { return !groupedNodeIds[n.id]; }).concat(superNodes);
    visibleIds = {};
    ctx.filteredNodes.forEach(function(n) { visibleIds[n.id] = true; });

    ctx.filteredLinks = ctx.filteredLinks.map(function(l) {
      return { source: nodeToGroup[l.source] || l.source, target: nodeToGroup[l.target] || l.target,
               type: l.type, flow: l.flow, label: l.label, amount: l.amount };
    }).filter(function(l) { return l.source !== l.target && visibleIds[l.source] && visibleIds[l.target]; });

    var edgeKey = {}, deduped = [];
    ctx.filteredLinks.forEach(function(l) {
      var k = l.source < l.target ? l.source + '|' + l.target : l.target + '|' + l.source;
      if (!edgeKey[k]) { edgeKey[k] = { source: l.source, target: l.target, type: l.type, flow: l.flow, label: '', amount: null, _count: 1 }; deduped.push(edgeKey[k]); }
      else { edgeKey[k]._count++; if (l.amount && (!edgeKey[k].amount || l.amount > edgeKey[k].amount)) edgeKey[k].amount = l.amount; }
    });
    deduped.forEach(function(l) { if (l._count > 1) l.label = l._count + ' connections'; });
    ctx.filteredLinks = deduped;
  }

  // ═══ FORCE LAYOUT ═══
  function layoutForce(ctx) {
    var w = ctx.width, h = ctx.height, fn = ctx.filteredNodes, fl = ctx.filteredLinks;
    ctx.nodes = fn.map(function(n, i) {
      var angle = (2 * Math.PI * i) / fn.length;
      var radius = Math.min(w, h) * 0.35;
      return Object.assign({}, n, {
        x: w / 2 + radius * Math.cos(angle) * (0.5 + n.tier * 0.12),
        y: h / 2 + radius * Math.sin(angle) * (0.5 + n.tier * 0.12), vx: 0, vy: 0
      });
    });

    var nodeMap = {}; ctx.nodeMap = nodeMap;
    ctx.nodes.forEach(function(n) { nodeMap[n.id] = n; });

    var hasSuper = ctx.nodes.some(function(n) { return n._isSuper; });
    var repulsion = hasSuper ? 28000 : 18000, idealDist = hasSuper ? 240 : 180;

    ctx.gaiaCore = null; ctx.maxDeg = 0;
    var degMap = {};
    fl.forEach(function(l) { degMap[l.source] = (degMap[l.source] || 0) + 1; degMap[l.target] = (degMap[l.target] || 0) + 1; });
    ctx.nodes.forEach(function(n) { var d = degMap[n.id] || 0; if (d > ctx.maxDeg) { ctx.maxDeg = d; ctx.gaiaCore = n; } });

    for (var iter = 0; iter < 100; iter++) {
      for (var i = 0; i < ctx.nodes.length; i++) {
        for (var j = i + 1; j < ctx.nodes.length; j++) {
          var dx = ctx.nodes[j].x - ctx.nodes[i].x, dy = ctx.nodes[j].y - ctx.nodes[i].y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var force = repulsion / (dist * dist);
          var fx = (dx / dist) * force, fy = (dy / dist) * force;
          ctx.nodes[i].vx -= fx; ctx.nodes[i].vy -= fy;
          ctx.nodes[j].vx += fx; ctx.nodes[j].vy += fy;
        }
      }
      fl.forEach(function(link) {
        var s = nodeMap[link.source], t = nodeMap[link.target];
        if (!s || !t) return;
        var dx = t.x - s.x, dy = t.y - s.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var force = (dist - idealDist) * 0.015, fx = (dx / dist) * force, fy = (dy / dist) * force;
        s.vx += fx; s.vy += fy; t.vx -= fx; t.vy -= fy;
      });
      var gcx = ctx.gaiaCore ? ctx.gaiaCore.x : w / 2, gcy = ctx.gaiaCore ? ctx.gaiaCore.y : h / 2;
      var baseR = Math.min(w, h) * 0.35;
      ctx.nodes.forEach(function(n) {
        if (showSort && bodyLevel >= 1 && n !== ctx.gaiaCore) {
          var orbitR = baseR * (SORT_RADIUS[n.classification || 'unknown'] || 0.90);
          var dx = n.x - gcx, dy = n.y - gcy, dist = Math.sqrt(dx * dx + dy * dy) || 1;
          n.vx += (gcx + (dx / dist) * orbitR - n.x) * 0.003;
          n.vy += (gcy + (dy / dist) * orbitR - n.y) * 0.003;
        }
        n.vx += (w / 2 - n.x) * 0.004; n.vy += (h / 2 - n.y) * 0.004;
        n.x += n.vx * 0.3; n.y += n.vy * 0.3;
        n.vx *= 0.78; n.vy *= 0.78;
        n.x = Math.max(90, Math.min(w - 90, n.x)); n.y = Math.max(50, Math.min(h - 50, n.y));
      });
    }

    ctx.adjacency = {};
    ctx.nodes.forEach(function(n) { ctx.adjacency[n.id] = new Set(); });
    fl.forEach(function(l) {
      if (ctx.adjacency[l.source]) ctx.adjacency[l.source].add(l.target);
      if (ctx.adjacency[l.target]) ctx.adjacency[l.target].add(l.source);
    });
  }

  // ═══ DRAW HULLS ═══
  function drawHulls(ctx) {
    var svg = ctx.svg, nm = ctx.nodeMap;

    function drawHullGroup(items, padSize) {
      items.forEach(function(group) {
        var pts = [];
        group.members.forEach(function(mid) {
          if (nm[mid]) {
            var n = nm[mid], p = padSize;
            pts.push([n.x - p, n.y - p], [n.x + p, n.y - p], [n.x - p, n.y + p], [n.x + p, n.y + p]);
          }
        });
        if (pts.length < 6) return;
        var hull = convexHull(pts);
        var pathD = 'M ' + hull.map(function(p) { return p[0] + ',' + p[1]; }).join(' L ') + ' Z';
        var hp = svgEl('path', { d: pathD, fill: group.color, stroke: group.stroke,
          'stroke-width': '2', 'stroke-dasharray': '6,4' }, svg);
        var title = svgEl('title', {}, hp); title.textContent = group.label + '\n' + (group.note || group.address || '');

        var cx = 0, cy = 0;
        hull.forEach(function(p) { cx += p[0]; cy += p[1]; });
        cx /= hull.length; cy /= hull.length;
        var topY = Math.min.apply(null, hull.map(function(p) { return p[1]; }));

        if (group.note) {
          svgText(group.label, { x: cx, y: topY - 8, 'text-anchor': 'middle',
            fill: group.stroke, 'font-size': '10', 'font-weight': '600', 'font-style': 'italic' }, svg);
        }
        if (group.address) {
          var bg = svgEl('rect', { x: cx - 50, y: topY - 14, width: 100, height: 16, rx: 3,
            fill: 'rgba(0,0,0,0.6)', stroke: group.stroke, 'stroke-width': '1' }, svg);
          svgText(group.label, { x: cx, y: topY - 2, 'text-anchor': 'middle',
            fill: group.stroke, 'font-size': '9', 'font-weight': '600' }, svg);
        }
      });
    }
    if (showOwnership) drawHullGroup(OWNERSHIP_GROUPS, 35);
    if (showAddress) drawHullGroup(ADDRESS_CLUSTERS, 30);
  }

  // ═══ DRAW CYCLES ═══
  function drawCycles(ctx) {
    if (!showCycles) return;
    var svg = ctx.svg, nm = ctx.nodeMap;
    OVERSIGHT_CYCLES.forEach(function(cycle) {
      var pts = cycle.path.map(function(pid) { return nm[pid]; }).filter(Boolean);
      if (pts.length < 2) return;
      pts.push(pts[0]);
      var pathD = pts.map(function(p, i) { return (i === 0 ? 'M ' : 'L ') + p.x + ',' + p.y; }).join(' ');
      var cp = svgEl('path', { d: pathD, fill: 'none', stroke: '#e67e22',
        'stroke-width': '2', 'stroke-dasharray': '8,4', 'stroke-opacity': '0.4' }, svg);
      var anim = svgEl('animate', { attributeName: 'stroke-dashoffset', from: '0', to: '24',
        dur: '2s', repeatCount: 'indefinite' }, cp);
      var title = svgEl('title', {}, cp); title.textContent = cycle.label;

      var cx = pts.reduce(function(s, p) { return s + p.x; }, 0) / pts.length;
      var cy = pts.reduce(function(s, p) { return s + p.y; }, 0) / pts.length;
      svgEl('rect', { x: cx - 40, y: cy - 8, width: 80, height: 16, rx: 3,
        fill: 'rgba(0,0,0,0.7)', stroke: '#e67e22', 'stroke-width': '1' }, svg);
      svgText(cycle.label, { x: cx, y: cy + 4, 'text-anchor': 'middle',
        fill: '#e67e22', 'font-size': '9', 'font-weight': '600' }, svg);
    });

    var defs = svg.querySelector('defs') || svgEl('defs', {});
    if (!defs.parentNode) svg.insertBefore(defs, svg.firstChild);
    var marker = svgEl('marker', { id: 'cycle-arrow', viewBox: '0 0 10 10',
      refX: '10', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto' }, defs);
    var ap = svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#e67e22', opacity: '0.6' }, marker);
  }

  // ═══ DRAW ARROWS ═══
  function drawArrows(ctx) {
    var svg = ctx.svg;
    var defs = svg.querySelector('defs') || svgEl('defs', {});
    if (!defs.parentNode) svg.insertBefore(defs, svg.firstChild);
    var blur = svgEl('filter', { id: 'sigma-blur', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    svgEl('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '4' }, blur);
    Object.keys(FLOW_COLORS).forEach(function(ft) {
      var m = svgEl('marker', { id: 'arrow-' + ft, viewBox: '0 0 10 10',
        refX: '28', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto' }, defs);
      svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: FLOW_COLORS[ft], opacity: '0.8' }, m);
    });
    var dm = svgEl('marker', { id: 'arrow-default', viewBox: '0 0 10 10',
      refX: '28', refY: '5', markerWidth: '4', markerHeight: '4', orient: 'auto' }, defs);
    svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#95a5a6', opacity: '0.5' }, dm);
  }

  // ═══ DRAW EDGES ═══
  function drawEdges(ctx) {
    ctx.linkElements = [];
    var svg = ctx.svg, nm = ctx.nodeMap;
    var EVIDENCE_DASH = { documented: 'none', observed: 'none', inferred: '6,4', contextual: '3,3' };
    var EVIDENCE_OPACITY = { documented: '0.7', observed: '0.5', inferred: '0.3', contextual: '0.15' };
    ctx.filteredLinks.forEach(function(link) {
      var s = nm[link.source], t = nm[link.target];
      if (!s || !t) return;
      var flowActive = activeFlows && link.flow;
      var isFlowMatch = !activeFlows || (activeFlows && activeFlows[link.flow]);
      var useFlowColor = activeFlows && link.flow;
      var ev = link.evidence || 'contextual';
      var sigma = link.sigma || 0.5;

      var attrs = { x1: s.x, y1: s.y, x2: t.x, y2: t.y };
      if (useFlowColor && isFlowMatch) {
        Object.assign(attrs, { stroke: FLOW_COLORS[link.flow], 'stroke-width': '3', 'stroke-opacity': '0.8', 'marker-end': 'url(#arrow-' + link.flow + ')' });
      } else if (activeFlows && !isFlowMatch) {
        Object.assign(attrs, { stroke: '#555', 'stroke-width': '1', 'stroke-opacity': '0.1' });
      } else {
        var baseOpacity = showSort ? EVIDENCE_OPACITY[ev] : '0.5';
        var dash = showSort ? EVIDENCE_DASH[ev] : 'none';
        Object.assign(attrs, { stroke: LINK_COLORS[link.type] || '#95a5a6',
          'stroke-width': Math.max(0.5, (link.weight || 0.5) * 3).toFixed(1),
          'stroke-opacity': baseOpacity });
        if (dash !== 'none') attrs['stroke-dasharray'] = dash;
        if (activeFlows) attrs['marker-end'] = 'url(#arrow-default)';
      }
      var line = svgEl('line', attrs, svg);
      if (link._count && link._count > 1) {
        var cw = parseFloat(line.getAttribute('stroke-width')) || 1.5;
        line.setAttribute('stroke-width', Math.min(6, cw + Math.log2(link._count)));
      }
      line.dataset.source = link.source; line.dataset.target = link.target;
      line.dataset.flow = link.flow || ''; line.dataset.count = link._count || 1;
      line.dataset.evidence = ev; line.dataset.sigma = sigma;
      ctx.linkElements.push(line);

      if (link._count && link._count > 2) {
        var mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
        svgEl('circle', { cx: mx, cy: my, r: 8, fill: 'rgba(0,0,0,0.7)' }, svg);
        svgText(link._count, { x: mx, y: my + 3, 'text-anchor': 'middle',
          fill: '#fff', 'font-size': '8', 'font-weight': '700', 'pointer-events': 'none' }, svg);
      }
    });
  }

  // ═══ DRAW NODES ═══
  function drawNodes(ctx) {
    var svg = ctx.svg, nm = ctx.nodeMap, c = ctx.container, data = ctx.data;
    var nodeDegree = {};
    ctx.nodes.forEach(function(n) { nodeDegree[n.id] = 0; });
    ctx.filteredLinks.forEach(function(l) {
      if (nodeDegree[l.source] !== undefined) nodeDegree[l.source]++;
      if (nodeDegree[l.target] !== undefined) nodeDegree[l.target]++;
    });

    ctx.nodeElements = {};
    ctx.nodes.forEach(function(n) {
      var g = svgEl('g', { transform: 'translate(' + n.x + ',' + n.y + ')' }, svg);
      g.style.transition = 'opacity 0.2s';
      var deg = nodeDegree[n.id] || 0;

      if (n._isSuper) {
        var mc = n._memberCount || 1;
        var r = Math.max(24, Math.min(50, 18 + Math.sqrt(mc) * 8));
        var circle = svgEl('circle', { r: r, fill: n._color || '#1abc9c', stroke: '#fff',
          'stroke-width': '3', 'stroke-dasharray': '6,3' }, g);
        circle.style.transition = 'r 0.2s'; circle.style.cursor = 'pointer';
        svgText(mc, { 'text-anchor': 'middle', dy: '5', fill: '#fff',
          'font-size': r > 30 ? '14' : '11', 'font-weight': '700', 'pointer-events': 'none' }, g);
        svgText(n.label, { dy: -(r + 8), 'text-anchor': 'middle', fill: 'currentColor',
          'font-size': '11', 'font-weight': '700' }, g);
        var title = svgEl('title', {}, g); title.textContent = n.label + ' (' + mc + ' nodes)\nClick to expand';
        g.style.cursor = 'pointer';
        g.addEventListener('click', function(e) { e.stopPropagation(); expandedGroups[n.id] = true; renderGraph(c, data); });
        g.addEventListener('mouseenter', function() { highlightNode(ctx, n.id); showSuperInfo(ctx, n); });
        g.addEventListener('mouseleave', function() { clearHighlight(ctx); hideInfo(ctx); });
        ctx.nodeElements[n.id] = { group: g, circle: circle, radius: r };
      } else {
        if (n.url) { g.style.cursor = 'pointer'; g.addEventListener('click', function(e) { e.stopPropagation(); window.location.href = n.url; }); }
        var r = Math.max(10, Math.min(32, 10 + Math.sqrt(deg) * 4));
        if (showSort && n.classification && n.classification !== 'unknown') {
          var sr = svgEl('circle', { r: r + 4, fill: 'none', stroke: SORT_COLORS[n.classification] || '#7f8c8d',
            'stroke-width': '3', 'stroke-dasharray': n.classification === 'partial' ? '4,2' : 'none' }, g);
          sr.style.opacity = String(n.confidence || 0.5);
        }
        if (showSort) g.style.opacity = String(n.opacity || 0.25);
        var nodeSigma = n.sigma || 0.3;
        if (showSort && nodeSigma > 0.2) {
          var blur = svgEl('circle', { r: r + nodeSigma * 12, fill: (COLORS[n.type] || '#95a5a6'),
            opacity: String(nodeSigma * 0.3), filter: 'url(#sigma-blur)' }, g);
        }
        var circle = svgEl('circle', { r: r, fill: COLORS[n.type] || '#95a5a6', stroke: '#fff',
          'stroke-width': r > 20 ? '2.5' : '1.5' }, g);
        circle.style.transition = 'r 0.2s, stroke-width 0.2s';
        if (deg >= 3) svgText(deg, { 'text-anchor': 'middle', dy: '4', fill: '#fff',
          'font-size': r > 20 ? '11' : '9', 'font-weight': '700', 'pointer-events': 'none' }, g);
        svgText(n.label, { dy: deg >= 5 ? -(r + 6) : (r + 14), 'text-anchor': 'middle', fill: 'currentColor',
          'font-size': deg >= 8 ? '12' : (deg >= 3 ? '10' : '9'), 'font-weight': deg >= 8 ? '700' : '500' }, g);
        var titleParts = [n.label + ' (' + deg + ' connections)', n.detail];
        if (n.classification && n.classification !== 'unknown') {
          titleParts.push('Sort: ' + n.classification.toUpperCase() + ' (' + Math.round((n.confidence || 0) * 100) + '%)');
          if (n.sort_note) titleParts.push(n.sort_note);
        } else if (showSort) titleParts.push('Sort: UNKNOWN — not yet classified');
        var title = svgEl('title', {}, g); title.textContent = titleParts.join('\n');
        g.addEventListener('mouseenter', function() { highlightNode(ctx, n.id); showInfo(ctx, n); });
        g.addEventListener('mouseleave', function() { clearHighlight(ctx); hideInfo(ctx); });
        ctx.nodeElements[n.id] = { group: g, circle: circle, radius: r };
      }
    });
  }

  // ═══ DYNASTY OVERLAY ═══
  function applyDynasty(ctx) {
    if (!activeDynasty) return;
    Object.keys(ctx.nodeElements).forEach(function(nid) {
      var n = ctx.nodeMap[nid], el = ctx.nodeElements[nid];
      if (!n) return;
      if (n.dynasty === activeDynasty) {
        el.group.style.opacity = '1'; el.circle.setAttribute('stroke', DYNASTY_COLORS[activeDynasty]); el.circle.setAttribute('stroke-width', '3');
      } else el.group.style.opacity = '0.2';
    });
    ctx.linkElements.forEach(function(line) {
      var sn = ctx.nodeMap[line.dataset.source], tn = ctx.nodeMap[line.dataset.target];
      if ((sn && sn.dynasty === activeDynasty) || (tn && tn.dynasty === activeDynasty)) {
        line.setAttribute('stroke-opacity', '0.7'); line.setAttribute('stroke', DYNASTY_COLORS[activeDynasty]); line.setAttribute('stroke-width', '2.5');
      } else line.setAttribute('stroke-opacity', '0.06');
    });
  }

  // ═══ HIGHLIGHT ═══
  function highlightNode(ctx, id) {
    var neighbors = ctx.adjacency[id] || new Set();
    Object.keys(ctx.nodeElements).forEach(function(nid) {
      var el = ctx.nodeElements[nid];
      if (nid === id) { el.group.style.opacity = '1'; el.circle.setAttribute('stroke-width', '4'); el.circle.setAttribute('r', el.radius + 4); }
      else if (neighbors.has(nid)) { el.group.style.opacity = '1'; el.circle.setAttribute('stroke-width', '3'); }
      else el.group.style.opacity = '0.15';
    });
    ctx.linkElements.forEach(function(line) {
      if (line.dataset.source === id || line.dataset.target === id) {
        line.setAttribute('stroke-opacity', '0.9');
        line.setAttribute('stroke-width', line.getAttribute('stroke-width') === '3' ? '4' : '3');
      } else line.setAttribute('stroke-opacity', '0.08');
    });
  }

  function clearHighlight(ctx) {
    Object.keys(ctx.nodeElements).forEach(function(nid) {
      var el = ctx.nodeElements[nid];
      el.group.style.opacity = '1'; el.circle.setAttribute('stroke-width', el.radius > 20 ? '2.5' : '1.5'); el.circle.setAttribute('r', el.radius);
    });
    ctx.linkElements.forEach(function(line) {
      line.setAttribute('stroke-opacity', '0.5');
      line.setAttribute('stroke-width', line.getAttribute('stroke') === LINK_COLORS.money ? '3' : '1.5');
    });
  }

  // ═══ INFO PANEL ═══
  function ensureInfoPanel(ctx) {
    var ip = ctx.container.querySelector('.graph-info');
    if (!ip) {
      ip = document.createElement('div');
      ip.className = 'graph-info';
      ip.style.cssText = 'position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.85);color:#fff;padding:12px 16px;border-radius:8px;font-size:12px;max-width:280px;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:10;line-height:1.5;';
      ctx.container.style.position = 'relative';
      ctx.container.appendChild(ip);
    }
    ctx.infoPanel = ip;
  }

  function showInfo(ctx, n) {
    var connCount = (ctx.adjacency[n.id] || new Set()).size;
    var nexusStr = (n.nexus && n.nexus.length) ? n.nexus.map(function(x) {
      return '<span style="color:' + NEXUS_COLORS[x] + '">' + x + '</span>';
    }).join(' · ') : 'none';

    var extras = '';
    OWNERSHIP_GROUPS.forEach(function(g) { if (g.members.indexOf(n.id) !== -1) extras += '<br><span style="color:#e74c3c;font-size:10px;">⬡ ' + g.note + '</span>'; });
    ADDRESS_CLUSTERS.forEach(function(a) { if (a.members.indexOf(n.id) !== -1) extras += '<br><span style="color:#d35400;font-size:10px;">📍 ' + a.address + ' (' + a.members.length + ' entities)</span>'; });
    OVERSIGHT_CYCLES.forEach(function(c) { if (c.path.indexOf(n.id) !== -1) extras += '<br><span style="color:#e67e22;font-size:10px;">⟳ ' + c.label + '</span>'; });

    var flowIn = { money:0, power:0, influence:0, position:0 }, flowOut = { money:0, power:0, influence:0, position:0 };
    ctx.filteredLinks.forEach(function(l) {
      if (l.flow) { if (l.target === n.id && flowIn[l.flow] !== undefined) flowIn[l.flow]++; if (l.source === n.id && flowOut[l.flow] !== undefined) flowOut[l.flow]++; }
    });
    var flowParts = [];
    Object.keys(FLOW_COLORS).forEach(function(ft) {
      if (flowIn[ft] || flowOut[ft]) {
        var parts = []; if (flowIn[ft]) parts.push(flowIn[ft] + ' in'); if (flowOut[ft]) parts.push(flowOut[ft] + ' out');
        flowParts.push('<span style="color:' + FLOW_COLORS[ft] + '">' + FLOW_ICONS[ft] + ' ' + ft + ': ' + parts.join(', ') + '</span>');
      }
    });
    var flowStr = flowParts.length ? '<br>' + flowParts.join(' · ') : '';

    var sortStr = '';
    if (n.classification && n.classification !== 'unknown') {
      var sigma = n.sigma || 0.3;
      var sigmaBar = sigma < 0.15 ? '░' : sigma < 0.3 ? '▒' : '▓';
      sortStr = '<br><span style="color:' + (SORT_COLORS[n.classification] || '#7f8c8d') + ';font-size:10px;font-weight:600">◉ ' +
        n.classification.toUpperCase() + ' (' + Math.round((n.confidence || 0) * 100) + '% ±' + Math.round(sigma * 100) + ')</span>';
      sortStr += '<br><span style="font-size:9px;opacity:0.4">σ=' + sigma.toFixed(2) + ' ' + sigmaBar + '</span>';
      if (n.sort_note) sortStr += '<br><span style="font-size:10px;opacity:0.6">' + n.sort_note + '</span>';
    }

    ctx.infoPanel.innerHTML = '<strong>' + n.label + '</strong> (' + connCount + ')<br>' +
      '<span style="font-size:10px;opacity:0.6">' + n.detail + '</span><br>' +
      '<span style="font-size:10px">Nexus: ' + nexusStr + '</span>' +
      extras + flowStr + sortStr;
    ctx.infoPanel.style.opacity = '1';
  }

  function showSuperInfo(ctx, n) {
    ctx.infoPanel.innerHTML = '<strong>' + n.label + '</strong><br>' +
      '<span style="font-size:10px;">' + (n._memberCount || '?') + ' members</span><br>' +
      '<span style="font-size:10px;opacity:0.6">' + (n.detail || '') + '</span><br>' +
      '<span style="font-size:10px;color:#58a6ff">Click to expand</span>';
    ctx.infoPanel.style.opacity = '1';
  }

  function hideInfo(ctx) { ctx.infoPanel.style.opacity = '0'; }

  // ═══ LEGEND ═══
  function drawLegend(ctx) {
    var svg = ctx.svg, w = ctx.width, h = ctx.height, y = 20;

    var legend = [
      { color: COLORS.actor, label: 'Enterprise principals' },
      { color: COLORS.judge, label: 'Judicial cover' },
      { color: COLORS.political, label: 'Political enablers' },
      { color: COLORS.school, label: 'Schools' },
      { color: COLORS.entity, label: 'Shell entities' },
      { color: COLORS.bmf, label: 'BMF connection' },
      { color: COLORS.institutional, label: 'Institutional (FOIA)' },
    ];
    legend.forEach(function(item) {
      svgEl('circle', { cx: 20, cy: y, r: 6, fill: item.color }, svg);
      svgText(item.label, { x: 32, y: y + 4, fill: 'currentColor', 'font-size': '10', 'font-weight': '500' }, svg);
      y += 20;
    });

    if (activeFlows) {
      y += 8;
      Object.keys(FLOW_COLORS).forEach(function(ft) {
        if (!activeFlows[ft]) return;
        svgEl('line', { x1: 14, y1: y, x2: 26, y2: y, stroke: FLOW_COLORS[ft], 'stroke-width': '3', 'marker-end': 'url(#arrow-' + ft + ')' }, svg);
        svgText(FLOW_ICONS[ft] + ' ' + ft.charAt(0).toUpperCase() + ft.slice(1),
          { x: 32, y: y + 4, fill: FLOW_COLORS[ft], 'font-size': '10', 'font-weight': '600' }, svg);
        y += 20;
      });
    }

    if (showAddress || showOwnership || showCycles) {
      y += 8;
      if (showAddress) {
        svgEl('rect', { x: 14, y: y - 5, width: 12, height: 10, rx: 2, fill: 'rgba(211,84,0,0.15)', stroke: 'rgba(211,84,0,0.6)', 'stroke-width': '1.5', 'stroke-dasharray': '3,3' }, svg);
        svgText('Shared address (' + ADDRESS_CLUSTERS.length + ' clusters)', { x: 32, y: y + 4, fill: 'currentColor', 'font-size': '10', 'font-weight': '500' }, svg);
        y += 20;
      }
      if (showOwnership) {
        svgEl('rect', { x: 14, y: y - 5, width: 12, height: 10, rx: 2, fill: 'rgba(192,57,43,0.15)', stroke: 'rgba(192,57,43,0.5)', 'stroke-width': '1.5', 'stroke-dasharray': '3,2' }, svg);
        svgText('Ownership hull', { x: 32, y: y + 4, fill: 'currentColor', 'font-size': '10', 'font-weight': '500' }, svg);
        y += 20;
      }
      if (showCycles) {
        svgEl('line', { x1: 14, y1: y, x2: 26, y2: y, stroke: '#e67e22', 'stroke-width': '2', 'stroke-dasharray': '4,2' }, svg);
        svgText('Cyclic "oversight"', { x: 32, y: y + 4, fill: 'currentColor', 'font-size': '10', 'font-weight': '500' }, svg);
        y += 20;
      }
    }

    if (showSort) {
      y += 8;
      svgText('Epitope Sort:', { x: 20, y: y + 4, fill: '#e67e22', 'font-size': '10', 'font-weight': '700' }, svg);
      y += 18;
      var sortLegend = [
        { cls: 'non-self', label: 'Non-self (capture)' }, { cls: 'self', label: 'Self (functioning)' },
        { cls: 'null', label: 'Null (routing)' }, { cls: 'partial', label: 'Partial capture' },
        { cls: 'other', label: 'Other (insufficient data)' }, { cls: 'unknown', label: 'Unknown — not yet sorted' },
      ];
      sortLegend.forEach(function(item) {
        var sc = svgEl('circle', { cx: 20, cy: y, r: 5, fill: 'none', stroke: SORT_COLORS[item.cls], 'stroke-width': '2' }, svg);
        if (item.cls === 'partial') sc.setAttribute('stroke-dasharray', '3,1');
        if (item.cls === 'unknown') sc.style.opacity = '0.25';
        var st = svgText(item.label, { x: 32, y: y + 4, fill: 'currentColor', 'font-size': '10', 'font-weight': '500' }, svg);
        if (item.cls === 'unknown') st.style.opacity = '0.5';
        y += 18;
      });
      var sortedCount = ctx.filteredNodes.filter(function(n) { return n.classification && n.classification !== 'unknown'; }).length;
      var st = svgText(sortedCount + '/' + ctx.filteredNodes.length + ' sorted', { x: 20, y: y + 4, fill: 'currentColor', 'font-size': '9' }, svg);
      st.style.opacity = '0.5';
      y += 24;

      svgText('Evidence quality:', { x: 20, y: y + 4, fill: '#8b949e', 'font-size': '9', 'font-weight': '600' }, svg);
      y += 16;
      var evLegend = [
        { dash: 'none', opacity: '0.7', label: 'Documented (FEC/court)', tense: 'WAS' },
        { dash: 'none', opacity: '0.5', label: 'Observed (public record)', tense: 'IS' },
        { dash: '6,4', opacity: '0.3', label: 'Inferred (structural)', tense: 'NEARBY' },
        { dash: '3,3', opacity: '0.15', label: 'Contextual (analysis)', tense: 'WILLBE' },
      ];
      evLegend.forEach(function(item) {
        var el = svgEl('line', { x1: 14, y1: y, x2: 26, y2: y, stroke: '#8b949e',
          'stroke-width': '2', 'stroke-opacity': item.opacity }, svg);
        if (item.dash !== 'none') el.setAttribute('stroke-dasharray', item.dash);
        svgText(item.label, { x: 32, y: y + 3, fill: 'currentColor', 'font-size': '8', 'font-weight': '400' }, svg).style.opacity = '0.5';
        y += 14;
      });
      y += 6;
      svgText('σ = uncertainty band (blur radius)', { x: 20, y: y + 4, fill: 'currentColor', 'font-size': '8' }, svg).style.opacity = '0.3';
      y += 20;
    }
  }

  // ═══ MOON ORBITS + π PANEL ═══
  function drawObservation(ctx) {
    var svg = ctx.svg, w = ctx.width, h = ctx.height;

    if (showSort && ctx.gaiaCore) {
      var gcx = ctx.gaiaCore.x, gcy = ctx.gaiaCore.y, baseR = Math.min(w, h) * 0.35;
      ['non-self','partial','null','self','other'].forEach(function(cls) {
        var ring = svgEl('circle', { cx: gcx, cy: gcy, r: baseR * (SORT_RADIUS[cls] || 0.90),
          fill: 'none', stroke: SORT_COLORS[cls] || '#7f8c8d', 'stroke-width': '0.5', 'stroke-opacity': '0.15', 'stroke-dasharray': '4,4' });
        svg.insertBefore(ring, svg.firstChild);
      });
      svgEl('circle', { cx: gcx, cy: gcy, r: 3, fill: '#e74c3c', opacity: '0.4' }, svg);
    }

    if (showSort) {
      var piSorted = ctx.filteredNodes.filter(function(n) { return n.classification && n.classification !== 'unknown'; }).length;
      var piTotal = ctx.filteredNodes.length, piRatio = piTotal > 0 ? piSorted / piTotal : 0, piTarget = 1 / Math.PI;
      var piY = h - 80, piG = svgEl('g', {}, svg);
      var bl = bodyLevel === 0 ? '0-body: raw' : bodyLevel === 1 ? '1-body: sorted' : '2-body: observed';
      svgText(bl, { x: w - 10, y: piY, 'text-anchor': 'end', fill: 'currentColor', 'font-size': '9', opacity: '0.5' }, piG);
      svgText(piSorted + '/' + piTotal + ' sorted · π=' + piRatio.toFixed(3) + (piRatio > piTarget ? ' ✓' : ' → 1/π=' + piTarget.toFixed(3)),
        { x: w - 10, y: piY + 14, 'text-anchor': 'end', fill: piRatio > piTarget ? '#27ae60' : '#f39c12', 'font-size': '10', 'font-weight': '600' }, piG);
      var counts = { 'non-self': 0, 'null': 0, 'self': 0, 'partial': 0, 'other': 0 };
      ctx.filteredNodes.forEach(function(n) { var c = n.classification || 'unknown'; if (counts[c] !== undefined) counts[c]++; });
      svgText('non-self:' + counts['non-self'] + ' null:' + counts['null'] + ' self:' + counts['self'] + ' partial:' + counts['partial'] + ' other:' + counts['other'],
        { x: w - 10, y: piY + 28, 'text-anchor': 'end', fill: 'currentColor', 'font-size': '9', opacity: '0.4' }, piG);
      if (ctx.gaiaCore) {
        svgText('gaia core: ' + (ctx.gaiaCore.label || ctx.gaiaCore.id) + ' (' + ctx.maxDeg + ' edges)',
          { x: w - 10, y: piY + 42, 'text-anchor': 'end', fill: '#e74c3c', 'font-size': '9', opacity: '0.5' }, piG);
      }
    }
  }

  // ═══ SUMMARY ═══
  function drawSummary(ctx) {
    var w = ctx.width, h = ctx.height;
    var layerInfo = [];
    if (showOwnership) layerInfo.push(OWNERSHIP_GROUPS.length + ' ownership groups');
    if (showAddress) layerInfo.push(ADDRESS_CLUSTERS.length + ' address clusters');
    if (showCycles) layerInfo.push(OVERSIGHT_CYCLES.length + ' cycles');
    if (activeFlows) {
      var fc = {};
      ctx.filteredLinks.forEach(function(l) { if (l.flow && activeFlows[l.flow]) fc[l.flow] = (fc[l.flow] || 0) + 1; });
      var fcs = Object.keys(fc).map(function(f) { return fc[f] + ' ' + f; });
      if (fcs.length) layerInfo.push(fcs.join(', '));
    }
    if (collapseStrategy) {
      var superCount = ctx.filteredNodes.filter(function(n) { return n._isSuper; }).length;
      layerInfo.push('collapsed: ' + superCount + ' groups from ' + ctx.data.nodes.length + ' nodes');
    }
    if (showSort) {
      var sc = ctx.filteredNodes.filter(function(n) { return n.classification && n.classification !== 'unknown'; }).length;
      layerInfo.push(sc + ' sorted / ' + (ctx.filteredNodes.length - sc) + ' proximate');
    }
    svgText(ctx.filteredNodes.length + ' nodes · ' + ctx.filteredLinks.length + ' edges' + (layerInfo.length ? ' · ' + layerInfo.join(' · ') : ''),
      { x: w - 10, y: h - 10, 'text-anchor': 'end', fill: 'currentColor', 'font-size': '10', opacity: '0.4' }, ctx.svg);
  }

  // ═══ RENDER GRAPH — DISPATCHER ═══
  function renderGraph(container, data) {
    var ctx = {
      container: container, data: data,
      width: container.clientWidth || 800,
      height: Math.max(700, (container.clientWidth || 800) * 0.75)
    };

    buildControls(ctx);
    filterAndCollapse(ctx);

    var existingSvg = container.querySelector('svg');
    if (existingSvg) existingSvg.remove();
    ctx.svg = svgEl('svg', { viewBox: '0 0 ' + ctx.width + ' ' + ctx.height,
      width: '100%', height: ctx.height, role: 'img',
      'aria-label': 'Institutional capture network — ' + ctx.filteredNodes.length + ' nodes, ' + ctx.filteredLinks.length + ' edges' });
    ctx.svg.style.cssText = 'background:rgba(0,0,0,0.02);border-radius:8px;';
    container.appendChild(ctx.svg);

    layoutForce(ctx);
    drawHulls(ctx);
    drawCycles(ctx);
    drawArrows(ctx);
    drawEdges(ctx);
    drawNodes(ctx);
    applyDynasty(ctx);
    ensureInfoPanel(ctx);
    drawLegend(ctx);
    drawObservation(ctx);
    drawSummary(ctx);
  }

  // ═══ CLASSIFICATION ═══
  function applyClassification(data) {
    if (!classificationData || !classificationData.entities) return data;
    data.nodes.forEach(function(n) {
      var entry = classificationData.entities[n.id];
      if (entry) {
        n.classification = entry.classification; n.confidence = entry.confidence;
        n.opacity = Math.max(0.25, entry.confidence || 0);
        n.sort_pass = entry.sort_pass; n.sort_method = entry.method;
        if (entry.note) n.sort_note = entry.note;
      }
    });
    bodyLevel = 1;
    var sorted = data.nodes.filter(function(n) { return n.classification && n.classification !== 'unknown'; }).length;
    if (sorted > data.nodes.length * 0.3) bodyLevel = 2;
    return data;
  }

  // ═══ INIT ═══
  function init() {
    var container = document.getElementById('network-graph');
    if (!container) return;
    fetch('/classification.json')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(cls) { classificationData = cls; })
      .catch(function() { classificationData = null; })
      .finally(function() {
        if (DN.nodes && DN.edges) { renderGraph(container, applyClassification(DN.graphData())); return; }
        fetch('/api/public-record/network')
          .then(function(r) { return r.ok ? r.json() : Promise.reject('no API'); })
          .then(function(data) { renderGraph(container, applyClassification(data)); })
          .catch(function() { container.innerHTML = '<p style="color:#e74c3c;">Network data not loaded. Ensure network-data.js is included before network-graph.js.</p>'; });
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
