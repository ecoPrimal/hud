// Graph Walker — Clutch Justice Investigation Explorer
// Sweep: 555→compressed, renderGraph(375) → svgEl + 5 section helpers.
(function() {
  'use strict';

  var INV_COLORS = { detroit: '#ef4444', saginaw: '#f59e0b', barry: '#60a5fa', eastpointe: '#a855f7', shared: '#10b981' };
  var NODE_COLORS = { actor: '#e74c3c', judge: '#f1c40f', political: '#9b59b6', school: '#3498db', entity: '#1abc9c', bmf: '#e67e22', institutional: '#95a5a6', enforcement: '#e74c3c' };
  var FLOW_COLORS = { money: '#2ecc71', power: '#e74c3c', influence: '#f39c12', position: '#3498db' };
  var FLOW_ICONS = { money: '💰', power: '⚡', influence: '🔗', position: '📍' };

  var activeInvestigation = null;
  var activeFlows = null;
  var searchQuery = '';
  var graphData = { nodes: [], edges: [] };

  // ── Shared helpers ──
  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  function div(css, parent) {
    var d = document.createElement('div');
    if (css) d.style.cssText = css;
    if (parent) parent.appendChild(d);
    return d;
  }

  // ── Controls: investigation + flow filters ──
  function buildControls(container, data) {
    var controls = container.querySelector('.walker-controls');
    if (controls) return;
    controls = div('display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;padding:8px;background:rgba(0,0,0,0.3);border-radius:8px;');

    var invLabel = document.createElement('span');
    invLabel.textContent = 'Investigation:';
    invLabel.style.cssText = 'font-size:11px;font-weight:600;opacity:0.7;';
    controls.appendChild(invLabel);

    ['all', 'detroit', 'saginaw', 'barry', 'eastpointe'].forEach(function(inv) {
      var btn = document.createElement('button');
      btn.textContent = inv === 'all' ? 'All Cases' : inv.charAt(0).toUpperCase() + inv.slice(1);
      btn.dataset.inv = inv;
      var color = inv === 'all' ? '#fff' : INV_COLORS[inv];
      btn.style.cssText = 'padding:4px 12px;border:2px solid ' + color +
        ';border-radius:14px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;' +
        (inv === 'all' ? 'background:#fff;color:#000;' : 'background:transparent;color:' + color + ';');
      btn.addEventListener('click', function() {
        activeInvestigation = inv === 'all' ? null : inv;
        controls.querySelectorAll('button[data-inv]').forEach(function(b) {
          var c2 = b.dataset.inv === 'all' ? '#fff' : INV_COLORS[b.dataset.inv];
          var on = (b.dataset.inv === 'all' && !activeInvestigation) || (b.dataset.inv === activeInvestigation);
          b.style.background = on ? c2 : 'transparent';
          b.style.color = on ? (b.dataset.inv === 'all' ? '#000' : '#fff') : c2;
        });
        renderGraph(container, data);
      });
      controls.appendChild(btn);
    });

    var sep = document.createElement('span');
    sep.textContent = '│'; sep.style.cssText = 'opacity:0.3;margin:0 4px;';
    controls.appendChild(sep);

    var flowLabel = document.createElement('span');
    flowLabel.textContent = 'Flows:';
    flowLabel.style.cssText = 'font-size:11px;font-weight:600;opacity:0.7;';
    controls.appendChild(flowLabel);

    ['money', 'power', 'influence', 'position'].forEach(function(ft) {
      var btn = document.createElement('button');
      btn.textContent = FLOW_ICONS[ft] + ' ' + ft.charAt(0).toUpperCase() + ft.slice(1);
      btn.dataset.flow = ft;
      btn.style.cssText = 'padding:4px 10px;border:2px solid ' + FLOW_COLORS[ft] +
        ';border-radius:14px;font-size:10px;font-weight:600;cursor:pointer;transition:all 0.2s;' +
        'background:transparent;color:' + FLOW_COLORS[ft] + ';';
      btn.addEventListener('click', function() {
        if (!activeFlows) activeFlows = { money: false, power: false, influence: false, position: false };
        activeFlows[ft] = !activeFlows[ft];
        if (!Object.values(activeFlows).some(function(v) { return v; })) activeFlows = null;
        btn.style.background = (activeFlows && activeFlows[ft]) ? FLOW_COLORS[ft] : 'transparent';
        btn.style.color = (activeFlows && activeFlows[ft]) ? '#fff' : FLOW_COLORS[ft];
        renderGraph(container, data);
      });
      controls.appendChild(btn);
    });
    container.insertBefore(controls, container.firstChild);
  }

  // ── Force simulation ──
  function simulate(nodes, edges, nodeMap, w, h) {
    for (var iter = 0; iter < 120; iter++) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var f = 22000 / (dist * dist), fx = (dx / dist) * f, fy = (dy / dist) * f;
          nodes[i].vx -= fx; nodes[i].vy -= fy;
          nodes[j].vx += fx; nodes[j].vy += fy;
        }
      }
      edges.forEach(function(e) {
        var s = nodeMap[e.source], t = nodeMap[e.target];
        if (!s || !t) return;
        var dx = t.x - s.x, dy = t.y - s.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = (dist - 200) * 0.015, fx = (dx / dist) * f, fy = (dy / dist) * f;
        s.vx += fx; s.vy += fy; t.vx -= fx; t.vy -= fy;
      });
      nodes.forEach(function(n) {
        n.vx += (w / 2 - n.x) * 0.005; n.vy += (h / 2 - n.y) * 0.005;
        n.x += n.vx * 0.3; n.y += n.vy * 0.3;
        n.vx *= 0.78; n.vy *= 0.78;
        n.x = Math.max(80, Math.min(w - 80, n.x));
        n.y = Math.max(50, Math.min(h - 50, n.y));
      });
    }
  }

  // ── Draw edges with flow arrows ──
  function drawEdges(svg, edges, nodeMap) {
    var elems = [];
    edges.forEach(function(e) {
      var s = nodeMap[e.source], t = nodeMap[e.target];
      if (!s || !t) return;
      var isMatch = !activeFlows || (activeFlows && activeFlows[e.flow]);
      var attrs = { x1: s.x, y1: s.y, x2: t.x, y2: t.y };
      if (activeFlows && isMatch) {
        Object.assign(attrs, { stroke: FLOW_COLORS[e.flow] || '#888', 'stroke-width': 3, 'stroke-opacity': 0.8, 'marker-end': 'url(#walker-arrow-' + e.flow + ')' });
      } else if (activeFlows) {
        Object.assign(attrs, { stroke: '#444', 'stroke-width': 1, 'stroke-opacity': 0.1 });
      } else {
        Object.assign(attrs, { stroke: '#666', 'stroke-width': 1.5, 'stroke-opacity': 0.4 });
      }
      var line = svgEl('line', attrs, svg);
      line.dataset.source = e.source; line.dataset.target = e.target; line.dataset.flow = e.flow || '';
      elems.push(line);

      if (e.flow === 'money' && e.label) {
        svgEl('text', { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 - 4, 'text-anchor': 'middle',
          fill: FLOW_COLORS.money, 'font-size': 8, 'font-weight': 600, 'pointer-events': 'none' }, svg)
          .textContent = e.label;
      }
    });
    return elems;
  }

  // ── Draw nodes with hover/click ──
  function drawNodes(svg, nodes, edges, nodeMap, adjacency, container) {
    var nodeEls = {};
    var deg = {};
    nodes.forEach(function(n) { deg[n.id] = 0; });
    edges.forEach(function(e) { if (deg[e.source] !== undefined) deg[e.source]++; if (deg[e.target] !== undefined) deg[e.target]++; });

    nodes.forEach(function(n) {
      var g = svgEl('g', { transform: 'translate(' + n.x + ',' + n.y + ')' }, svg);
      g.style.transition = 'opacity 0.2s';
      var d = deg[n.id] || 0, r = Math.max(10, Math.min(35, 10 + Math.sqrt(d) * 5));
      var invC = INV_COLORS[n.investigation] || '#888';

      svgEl('circle', { r: r + 4, fill: 'none', stroke: invC, 'stroke-width': 2, 'stroke-opacity': 0.5 }, g);
      var circle = svgEl('circle', { r: r, fill: NODE_COLORS[n.type] || '#95a5a6', stroke: '#fff', 'stroke-width': r > 20 ? 2.5 : 1.5 }, g);
      circle.style.transition = 'r 0.2s'; circle.style.cursor = 'pointer';

      if (d >= 3) {
        var badge = svgEl('text', { 'text-anchor': 'middle', dy: 4, fill: '#fff', 'font-size': r > 20 ? 11 : 9, 'font-weight': 700, 'pointer-events': 'none' }, g);
        badge.textContent = d;
      }

      var label = svgEl('text', { dy: d >= 5 ? -(r + 8) : (r + 14), 'text-anchor': 'middle', fill: 'currentColor', 'font-size': d >= 8 ? 12 : (d >= 3 ? 10 : 9), 'font-weight': d >= 5 ? 700 : 500 }, g);
      label.textContent = n.label;

      svgEl('title', {}, g).textContent = n.label + ' (' + d + ' connections)\n' + (n.detail || '') + '\n' + (n.investigation || '');

      if (n.url) { g.style.cursor = 'pointer'; g.addEventListener('click', function(e) { e.stopPropagation(); window.open(n.url, '_blank'); }); }

      g.addEventListener('mouseenter', function() { highlightNode(n.id, nodeEls, adjacency); showNodeInfo(n, d, edges, container); });
      g.addEventListener('mouseleave', function() { clearHighlight(nodeEls); hideNodeInfo(container); });

      nodeEls[n.id] = { group: g, circle: circle, radius: r };
    });
    return { nodeEls: nodeEls, deg: deg };
  }

  // ── Legend ──
  function drawLegend(svg, w, h, nodeCount, edgeCount) {
    svgEl('text', { x: w - 10, y: h - 10, 'text-anchor': 'end', fill: 'currentColor', 'font-size': 10, opacity: 0.4 }, svg)
      .textContent = nodeCount + ' nodes · ' + edgeCount + ' edges' + (activeInvestigation ? ' · ' + activeInvestigation : ' · all investigations');

    var y = 20;
    [{ c: NODE_COLORS.actor, l: 'Key actors' }, { c: NODE_COLORS.judge, l: 'Judges' },
     { c: NODE_COLORS.political, l: 'Political enablers' }, { c: NODE_COLORS.school, l: 'Schools' },
     { c: NODE_COLORS.entity, l: 'Entities' }, { c: NODE_COLORS.enforcement, l: 'Enforcement' }]
      .forEach(function(item) {
        svgEl('circle', { cx: 20, cy: y, r: 6, fill: item.c }, svg);
        svgEl('text', { x: 32, y: y + 4, fill: 'currentColor', 'font-size': 10 }, svg).textContent = item.l;
        y += 18;
      });

    y += 10;
    Object.keys(INV_COLORS).forEach(function(inv) {
      if (inv === 'shared') return;
      svgEl('circle', { cx: 20, cy: y, r: 8, fill: 'none', stroke: INV_COLORS[inv], 'stroke-width': 2 }, svg);
      svgEl('text', { x: 32, y: y + 4, fill: 'currentColor', 'font-size': 10 }, svg).textContent = inv.charAt(0).toUpperCase() + inv.slice(1);
      y += 18;
    });
  }

  // ── Highlight / info panel ──
  var edgeElements = [];

  function highlightNode(id, nodeEls, adjacency) {
    var neighbors = adjacency[id] || new Set();
    Object.keys(nodeEls).forEach(function(nid) {
      var el = nodeEls[nid];
      if (nid === id) { el.group.style.opacity = '1'; el.circle.setAttribute('stroke-width', '4'); el.circle.setAttribute('r', el.radius + 4); }
      else if (neighbors.has(nid)) { el.group.style.opacity = '1'; el.circle.setAttribute('stroke-width', '3'); }
      else { el.group.style.opacity = '0.12'; }
    });
    edgeElements.forEach(function(line) {
      var on = line.dataset.source === id || line.dataset.target === id;
      line.setAttribute('stroke-opacity', on ? '0.9' : '0.05');
      line.setAttribute('stroke-width', on ? '3' : '1');
    });
  }

  function clearHighlight(nodeEls) {
    Object.keys(nodeEls).forEach(function(nid) {
      var el = nodeEls[nid];
      el.group.style.opacity = '1';
      el.circle.setAttribute('stroke-width', el.radius > 20 ? '2.5' : '1.5');
      el.circle.setAttribute('r', el.radius);
    });
    edgeElements.forEach(function(line) {
      line.setAttribute('stroke-opacity', activeFlows ? '0.8' : '0.4');
      line.setAttribute('stroke-width', activeFlows ? '3' : '1.5');
    });
  }

  function showNodeInfo(n, deg, edges, container) {
    var panel = container.querySelector('.walker-info');
    if (!panel) {
      panel = div('position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.9);color:#fff;padding:16px 20px;border-radius:10px;font-size:12px;max-width:320px;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:10;line-height:1.6;border:1px solid rgba(255,255,255,0.1);');
      container.style.position = 'relative';
      container.appendChild(panel);
    }
    var invC = INV_COLORS[n.investigation] || '#888';
    var invL = n.investigation ? n.investigation.charAt(0).toUpperCase() + n.investigation.slice(1) : 'Unknown';

    var flowIn = {}, flowOut = {};
    edges.forEach(function(e) {
      if (e.flow) { if (e.target === n.id) flowIn[e.flow] = (flowIn[e.flow] || 0) + 1; if (e.source === n.id) flowOut[e.flow] = (flowOut[e.flow] || 0) + 1; }
    });
    var fh = '';
    Object.keys(FLOW_COLORS).forEach(function(ft) {
      if (flowIn[ft] || flowOut[ft]) {
        var p = []; if (flowIn[ft]) p.push(flowIn[ft] + ' in'); if (flowOut[ft]) p.push(flowOut[ft] + ' out');
        fh += '<span style="color:' + FLOW_COLORS[ft] + '">' + FLOW_ICONS[ft] + ' ' + ft + ': ' + p.join(', ') + '</span> ';
      }
    });
    panel.innerHTML = '<div style="margin-bottom:4px;"><strong style="font-size:15px;">' + n.label + '</strong>' +
      '<span style="float:right;color:' + invC + ';font-size:10px;font-weight:600;border:1px solid ' + invC + ';padding:1px 6px;border-radius:8px;">' + invL + '</span></div>' +
      '<div style="opacity:0.7;margin-bottom:6px;">' + (n.detail || '') + '</div>' +
      '<div style="opacity:0.5;font-size:10px;margin-bottom:4px;">' + deg + ' connections</div>' +
      (fh ? '<div style="font-size:10px;margin-bottom:4px;">' + fh + '</div>' : '') +
      (n.url ? '<div style="opacity:0.4;font-size:10px;">Click to view evidence page →</div>' : '');
    panel.style.opacity = '1';
  }

  function hideNodeInfo(container) {
    var p = container.querySelector('.walker-info');
    if (p) p.style.opacity = '0';
  }

  // ═══ Main render ═══
  function renderGraph(container, data) {
    var w = container.clientWidth || 900, h = Math.max(700, w * 0.7);
    var old = container.querySelector('svg');
    if (old) old.remove();

    buildControls(container, data);

    // Filter
    var nodes = data.nodes.filter(function(n) {
      if (activeInvestigation && n.investigation !== activeInvestigation && n.investigation !== 'shared') return false;
      if (searchQuery && n.label.toLowerCase().indexOf(searchQuery.toLowerCase()) === -1) return false;
      return true;
    });
    var vis = {}; nodes.forEach(function(n) { vis[n.id] = true; });
    var edges = data.edges.filter(function(e) { return vis[e.source] && vis[e.target]; });

    // SVG + arrow defs
    var svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', height: h, role: 'img', 'aria-label': 'Investigation network — ' + nodes.length + ' nodes' });
    svg.style.cssText = 'background:rgba(0,0,0,0.05);border-radius:8px;';
    container.appendChild(svg);

    var defs = svgEl('defs', {}, svg);
    Object.keys(FLOW_COLORS).forEach(function(ft) {
      var m = svgEl('marker', { id: 'walker-arrow-' + ft, viewBox: '0 0 10 10', refX: 28, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs);
      svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: FLOW_COLORS[ft], opacity: 0.8 }, m);
    });

    // Layout nodes
    var simNodes = nodes.map(function(n, i) {
      var a = (2 * Math.PI * i) / nodes.length;
      var r = Math.min(w, h) * 0.35, to = (n.tier || 3) * 0.15;
      return Object.assign({}, n, { x: w / 2 + r * Math.cos(a) * (0.4 + to), y: h / 2 + r * Math.sin(a) * (0.4 + to), vx: 0, vy: 0 });
    });
    var nodeMap = {};
    simNodes.forEach(function(n) { nodeMap[n.id] = n; });

    simulate(simNodes, edges, nodeMap, w, h);

    var adjacency = {};
    simNodes.forEach(function(n) { adjacency[n.id] = new Set(); });
    edges.forEach(function(e) { if (adjacency[e.source]) adjacency[e.source].add(e.target); if (adjacency[e.target]) adjacency[e.target].add(e.source); });

    edgeElements = drawEdges(svg, edges, nodeMap);
    drawNodes(svg, simNodes, edges, nodeMap, adjacency, container);
    drawLegend(svg, w, h, simNodes.length, edges.length);
  }

  // ═══ Init ═══
  function init() {
    var c = document.getElementById('investigation-graph');
    if (!c) return;
    c.innerHTML = '<div style="padding:40px;text-align:center;opacity:0.5;">Loading investigation graph…</div>';
    fetch('/api/graph.json')
      .then(function(r) { return r.ok ? r.json() : Promise.reject('no local'); })
      .catch(function() { return fetch('https://detroit.primals.eco/graph.json').then(function(r) { return r.ok ? r.json() : Promise.reject('no remote'); }); })
      .then(function(d) { return { nodes: d.nodes || [], edges: d.edges || [] }; })
      .catch(function() { return { nodes: [], edges: [] }; })
      .then(function(d) { graphData = d; c.innerHTML = ''; renderGraph(c, d); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
