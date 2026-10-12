// Signal exploration visualization — the traveling salesman's doorbell.
// Shows how visitors navigate through the evidence site.
// Each hop is detected via the Referer header — no cookies, no tracking.
// Data source: window.SIGNAL_EXPLORATION (from signal-data.js)
// Sweep: 588→588 lines, 1 monolith (renderExploration) → 7 named helpers.

(function() {
  'use strict';

  var SE = window.SIGNAL_EXPLORATION;
  if (!SE) return;

  // ═══════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }

  function shortLabel(path) {
    if (path === '/') return 'Home';
    var parts = path.split('/').filter(Boolean);
    var last = parts[parts.length - 1].replace(/-/g, ' ');
    return last.length > 18 ? last.substring(0, 16) + '...' : last;
  }

  // ═══════════════════════════════════════════════════════════
  // Section 1: Stats bar
  // ═══════════════════════════════════════════════════════════
  function buildStats(container) {
    var s = SE.summary;
    var stats = document.createElement('div');
    stats.style.cssText = 'display:flex;gap:24px;flex-wrap:wrap;justify-content:center;margin:0 0 16px;';
    [
      { n: s.humanHits || s.totalHits || 0, l: 'human hits', c: '#2ecc71' },
      { n: s.uniquePages || 0, l: 'pages explored', c: '#2ecc71' },
      { n: s.totalHops || 0, l: 'doorbell hops', c: '#2ecc71' },
      { n: s.crawlerHits || 0, l: 'crawlers guided', c: '#3498db' },
      { n: s.scannerHits || 0, l: 'scanners neutralized', c: '#e74c3c' },
    ].forEach(function(item) {
      var d = document.createElement('div');
      d.style.cssText = 'text-align:center;';
      d.innerHTML = '<div style="font-size:28px;font-weight:800;color:' + item.c + ';">' + item.n +
        '</div><div style="font-size:10px;opacity:0.5;text-transform:uppercase;letter-spacing:1px;">' +
        item.l + '</div>';
      stats.appendChild(d);
    });
    container.appendChild(stats);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 2: Traffic composition pie (SVG donut)
  // ═══════════════════════════════════════════════════════════
  function buildPie(container, width) {
    var eco = SE.ecosystem;
    var s = SE.summary;
    if (!eco) return;

    var pieTitle = document.createElement('h4');
    pieTitle.style.cssText = 'margin:20px 0 6px;font-size:13px;opacity:0.7;';
    pieTitle.textContent = 'Who Visits — Traffic Classification';
    container.appendChild(pieTitle);

    var pieSub = document.createElement('p');
    pieSub.style.cssText = 'font-size:10px;opacity:0.4;margin:0 0 8px;';
    pieSub.textContent = 'Every request classified. Crawlers guided. Scanners cataloged. Only verified humans counted as signal.';
    container.appendChild(pieSub);

    var pieH = 160;
    var pieSvg = svgEl('svg', { viewBox: '0 0 ' + width + ' ' + pieH, width: '100%', height: pieH });
    pieSvg.style.cssText = 'margin-bottom:8px;';

    var cx = pieH / 2 + 10, cy = pieH / 2;
    var outerR = 60, innerR = 35;

    var slices = [
      { label: 'Humans', val: s.humanHits || s.totalHits || 0, color: '#2ecc71' },
      { label: 'Crawlers', val: s.crawlerHits || 0, color: '#3498db' },
      { label: 'SEO Bots', val: s.seoHits || 0, color: '#9b59b6' },
      { label: 'Link Previews', val: s.previewHits || 0, color: '#f39c12' },
      { label: 'Scanners', val: s.scannerHits || 0, color: '#e74c3c' },
    ].filter(function(sl) { return sl.val > 0; });

    var total = slices.reduce(function(a, b) { return a + b.val; }, 0) || 1;
    var angle = -Math.PI / 2;

    slices.forEach(function(sl) {
      var sweep = (sl.val / total) * 2 * Math.PI;
      var endAngle = angle + sweep;
      var large = sweep > Math.PI ? 1 : 0;
      var x1o = cx + outerR * Math.cos(angle),     y1o = cy + outerR * Math.sin(angle);
      var x2o = cx + outerR * Math.cos(endAngle),   y2o = cy + outerR * Math.sin(endAngle);
      var x1i = cx + innerR * Math.cos(endAngle),   y1i = cy + innerR * Math.sin(endAngle);
      var x2i = cx + innerR * Math.cos(angle),       y2i = cy + innerR * Math.sin(angle);

      var path = svgEl('path', {
        d: 'M ' + x1o + ' ' + y1o +
           ' A ' + outerR + ' ' + outerR + ' 0 ' + large + ' 1 ' + x2o + ' ' + y2o +
           ' L ' + x1i + ' ' + y1i +
           ' A ' + innerR + ' ' + innerR + ' 0 ' + large + ' 0 ' + x2i + ' ' + y2i + ' Z',
        fill: sl.color, opacity: '0.8',
      }, pieSvg);
      var title = svgEl('title', null, path);
      title.textContent = sl.label + ': ' + sl.val + ' (' + Math.round(sl.val / total * 100) + '%)';
      angle = endAngle;
    });

    // Center label
    var ct = svgEl('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', fill: 'currentColor',
                             'font-size': '14', 'font-weight': '800' }, pieSvg);
    ct.textContent = (s.totalRequests || total);
    var ct2 = svgEl('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', fill: 'currentColor',
                              'font-size': '8', opacity: '0.4' }, pieSvg);
    ct2.textContent = 'total requests';

    // Legend
    var lx = cx + outerR + 30, ly = 20;
    slices.forEach(function(sl) {
      svgEl('rect', { x: lx, y: ly - 8, width: 10, height: 10, rx: 2,
                      fill: sl.color, opacity: '0.8' }, pieSvg);
      var t = svgEl('text', { x: lx + 16, y: ly, fill: 'currentColor', 'font-size': '10' }, pieSvg);
      t.textContent = sl.label + ' — ' + sl.val + ' (' + Math.round(sl.val / total * 100) + '%)';
      ly += 20;
    });

    // Scanner details
    if (eco.scanners && eco.scanners.length > 0) {
      var sx = lx + 220, sy = 16;
      var sh = svgEl('text', { x: sx, y: sy, fill: '#e74c3c', 'font-size': '9', 'font-weight': '600' }, pieSvg);
      sh.textContent = 'Scanner types:';
      sy += 14;
      eco.scanners.slice(0, 6).forEach(function(sc) {
        var t = svgEl('text', { x: sx, y: sy, fill: 'currentColor', 'font-size': '8', opacity: '0.5' }, pieSvg);
        t.textContent = sc.name + ' (' + sc.hits + ')';
        sy += 12;
      });

      // Probe paths
      if (eco.probes && eco.probes.length > 0) {
        sy += 6;
        var ph = svgEl('text', { x: sx, y: sy, fill: '#e74c3c', 'font-size': '9', 'font-weight': '600' }, pieSvg);
        ph.textContent = 'Probed paths:';
        sy += 14;
        eco.probes.slice(0, 4).forEach(function(pr) {
          var t = svgEl('text', { x: sx, y: sy, fill: 'currentColor', 'font-size': '8', opacity: '0.5' }, pieSvg);
          t.textContent = pr.path + ' (' + pr.hits + ')';
          sy += 12;
        });
      }
    }

    container.appendChild(pieSvg);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 3: Hourly heatmap
  // ═══════════════════════════════════════════════════════════
  function buildHeatmap(container, width) {
    var heatTitle = document.createElement('h4');
    heatTitle.style.cssText = 'margin:20px 0 6px;font-size:13px;opacity:0.7;';
    heatTitle.textContent = 'When They Come — Hourly Human Signal';
    container.appendChild(heatTitle);

    var heatH = 80;
    var heatSvg = svgEl('svg', { viewBox: '0 0 ' + width + ' ' + heatH, width: '100%', height: heatH });
    heatSvg.style.cssText = 'background:rgba(0,0,0,0.02);border-radius:6px;margin-bottom:8px;';

    var hours = SE.hourly || [];
    if (hours.length) {
      var maxH = Math.max.apply(null, hours.map(function(h) { return h.hits; }));
      var barW = Math.max(6, (width - 40) / hours.length - 2);
      hours.forEach(function(h, i) {
        var bh = (h.hits / maxH) * (heatH - 25);
        var x = 20 + i * (barW + 2);
        var intensity = h.hits / maxH;
        var r = Math.round(46 + intensity * 200);
        var g = Math.round(204 - intensity * 100);
        var b = Math.round(113 - intensity * 50);

        var bar = svgEl('rect', {
          x: x, y: heatH - 15 - bh, width: barW, height: bh, rx: '2',
          fill: 'rgb(' + r + ',' + g + ',' + b + ')', opacity: '0.8',
        }, heatSvg);
        var title = svgEl('title', null, bar);
        title.textContent = h.hour + ':00 — ' + h.hits + ' human hits';

        if (h.hits > maxH * 0.5 || i === 0 || i === hours.length - 1) {
          var lbl = svgEl('text', { x: x + barW / 2, y: heatH - 3, 'text-anchor': 'middle',
                                    fill: 'currentColor', 'font-size': '7', opacity: '0.4' }, heatSvg);
          lbl.textContent = h.hour.split(' ')[1] + 'h';
        }

        if (h.hits > 5) {
          var ct = svgEl('text', { x: x + barW / 2, y: heatH - 18 - bh, 'text-anchor': 'middle',
                                   fill: 'currentColor', 'font-size': '8', 'font-weight': '600', opacity: '0.6' }, heatSvg);
          ct.textContent = h.hits;
        }
      });
    }
    container.appendChild(heatSvg);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 4: Navigation hop graph (the traveling salesman)
  // ═══════════════════════════════════════════════════════════
  function buildHopGraph(container, width) {
    var hops = SE.hops || [];
    var pages = SE.pages || [];

    var hopTitle = document.createElement('h4');
    hopTitle.style.cssText = 'margin:20px 0 6px;font-size:13px;opacity:0.7;';
    hopTitle.textContent = 'The Traveling Salesman — How They Navigate';
    container.appendChild(hopTitle);

    var hopSub = document.createElement('p');
    hopSub.style.cssText = 'font-size:10px;opacity:0.4;margin:0 0 8px;';
    hopSub.textContent = 'Each arrow is a doorbell ring — a visitor moving from one page to another. Detected via Referer header. No cookies. No tracking.';
    container.appendChild(hopSub);

    var graphH = Math.max(350, width * 0.4);
    var graphSvg = svgEl('svg', { viewBox: '0 0 ' + width + ' ' + graphH, width: '100%', height: graphH });
    graphSvg.style.cssText = 'background:rgba(0,0,0,0.02);border-radius:8px;';

    // Arrow marker
    var defs = svgEl('defs', null, graphSvg);
    var marker = svgEl('marker', { id: 'hop-arrow', viewBox: '0 0 10 10',
      refX: '22', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto' }, defs);
    var ap = svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#2ecc71', opacity: '0.6' }, marker);

    // Build node set
    var hopNodes = {};
    hops.forEach(function(h) {
      hopNodes[h.from] = hopNodes[h.from] || { id: h.from, hits: 0 };
      hopNodes[h.to]   = hopNodes[h.to]   || { id: h.to, hits: 0 };
    });
    pages.forEach(function(p) {
      if (!hopNodes[p.path]) hopNodes[p.path] = { id: p.path, hits: 0 };
      hopNodes[p.path].hits = p.hits;
      hopNodes[p.path].label = p.label;
      hopNodes[p.path].entries = p.entries;
    });

    var nodeArr = Object.values(hopNodes);
    if (nodeArr.length === 0) {
      var emptyMsg = svgEl('text', { x: width / 2, y: graphH / 2, 'text-anchor': 'middle',
                                     fill: 'currentColor', 'font-size': '12', opacity: '0.4' }, graphSvg);
      emptyMsg.textContent = 'Awaiting navigation hops — the traveling salesman has not yet arrived';
      container.appendChild(graphSvg);
      return;
    }

    // Force-directed layout
    var nodes = nodeArr.map(function(n, i) {
      var angle = (2 * Math.PI * i) / nodeArr.length;
      var r = Math.min(width, graphH) * 0.3;
      return { id: n.id, label: n.label || shortLabel(n.id), hits: n.hits || 1,
               entries: n.entries || 0, x: width / 2 + r * Math.cos(angle),
               y: graphH / 2 + r * Math.sin(angle), vx: 0, vy: 0 };
    });
    var nodeMap = {};
    nodes.forEach(function(n) { nodeMap[n.id] = n; });

    for (var iter = 0; iter < 80; iter++) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var force = 8000 / (dist * dist);
          var fx = (dx / dist) * force, fy = (dy / dist) * force;
          nodes[i].vx -= fx; nodes[i].vy -= fy;
          nodes[j].vx += fx; nodes[j].vy += fy;
        }
      }
      hops.forEach(function(h) {
        var src = nodeMap[h.from], tgt = nodeMap[h.to];
        if (!src || !tgt) return;
        var dx = tgt.x - src.x, dy = tgt.y - src.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var force = (dist - 120) * 0.02;
        var fx = (dx / dist) * force, fy = (dy / dist) * force;
        src.vx += fx; src.vy += fy;
        tgt.vx -= fx; tgt.vy -= fy;
      });
      nodes.forEach(function(n) {
        n.vx += (width / 2 - n.x) * 0.005;
        n.vy += (graphH / 2 - n.y) * 0.005;
        n.x += n.vx * 0.3; n.y += n.vy * 0.3;
        n.vx *= 0.75; n.vy *= 0.75;
        n.x = Math.max(60, Math.min(width - 60, n.x));
        n.y = Math.max(30, Math.min(graphH - 30, n.y));
      });
    }

    // Draw edges
    hops.forEach(function(h) {
      var src = nodeMap[h.from], tgt = nodeMap[h.to];
      if (!src || !tgt) return;
      svgEl('line', {
        x1: src.x, y1: src.y, x2: tgt.x, y2: tgt.y,
        stroke: '#2ecc71', 'stroke-width': Math.min(h.count * 2, 6),
        'stroke-opacity': Math.min(0.3 + h.count * 0.15, 0.8),
        'marker-end': 'url(#hop-arrow)',
      }, graphSvg);

      if (h.count >= 2) {
        var el = svgEl('text', { x: (src.x + tgt.x) / 2, y: (src.y + tgt.y) / 2 - 4,
                                 'text-anchor': 'middle', fill: '#2ecc71',
                                 'font-size': '8', 'font-weight': '700' }, graphSvg);
        el.textContent = h.count + '×';
      }
    });

    // Draw nodes
    var maxHits = Math.max.apply(null, nodes.map(function(n) { return n.hits; }));
    nodes.forEach(function(n) {
      var g = svgEl('g', { transform: 'translate(' + n.x + ',' + n.y + ')' }, graphSvg);
      var r = 8 + Math.sqrt(n.hits / maxHits) * 16;
      var isEntry = n.entries > n.hits * 0.5;
      svgEl('circle', { r: r, fill: isEntry ? '#e74c3c' : '#2ecc71',
                         'fill-opacity': '0.7', stroke: '#fff', 'stroke-width': '2' }, g);
      if (n.hits > 1) {
        var ht = svgEl('text', { dy: '3', 'text-anchor': 'middle', fill: '#fff',
                                 'font-size': Math.max(8, r * 0.6), 'font-weight': '700' }, g);
        ht.textContent = n.hits;
      }
      var label = svgEl('text', { dy: r + 12, 'text-anchor': 'middle', fill: 'currentColor',
                                  'font-size': '9', 'font-weight': n.hits > 5 ? '600' : '400' }, g);
      label.textContent = n.label;
      var tooltip = svgEl('title', null, g);
      tooltip.textContent = n.label + '\n' + n.hits + ' visits' +
        (n.entries ? '\n' + n.entries + ' direct entries (landing page)' : '') + '\n' + n.id;
    });

    // Legend
    var ly = 16;
    [
      { color: '#e74c3c', label: '● Entry point (landing page)' },
      { color: '#2ecc71', label: '● Internal page (navigated to)' },
      { color: '#2ecc71', label: '→ Doorbell hop (Referer detected)' },
    ].forEach(function(item) {
      var t = svgEl('text', { x: 8, y: ly, fill: item.color, 'font-size': '9', opacity: '0.6' }, graphSvg);
      t.textContent = item.label;
      ly += 14;
    });

    container.appendChild(graphSvg);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 5: Top exploration paths
  // ═══════════════════════════════════════════════════════════
  function buildPaths(container) {
    var pages = SE.pages || [];
    var pathTitle = document.createElement('h4');
    pathTitle.style.cssText = 'margin:20px 0 6px;font-size:13px;opacity:0.7;';
    pathTitle.textContent = 'Most Explored Pages';
    container.appendChild(pathTitle);

    var table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:12px;';
    var thead = '<tr style="opacity:0.5;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);">' +
      '<th style="padding:4px 8px;">Page</th>' +
      '<th style="padding:4px 8px;text-align:right;">Visits</th>' +
      '<th style="padding:4px 8px;text-align:right;">Direct</th>' +
      '<th style="padding:4px 8px;">Bar</th></tr>';
    var tbody = '';
    var topHits = pages.length > 0 ? pages[0].hits : 1;
    pages.slice(0, 12).forEach(function(p) {
      var barW = Math.round((p.hits / topHits) * 100);
      var entryPct = p.entries ? Math.round(p.entries / p.hits * 100) : 0;
      tbody += '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
        '<td style="padding:4px 8px;"><a href="' + p.path + '" style="color:inherit;text-decoration:none;">' + p.label + '</a></td>' +
        '<td style="padding:4px 8px;text-align:right;font-weight:600;">' + p.hits + '</td>' +
        '<td style="padding:4px 8px;text-align:right;opacity:0.5;">' + (p.entries || 0) + '</td>' +
        '<td style="padding:4px 8px;">' +
          '<div style="background:rgba(46,204,113,0.15);border-radius:3px;height:14px;width:100%;position:relative;">' +
            '<div style="background:#2ecc71;border-radius:3px;height:100%;width:' + barW + '%;opacity:0.7;"></div>' +
            (entryPct > 0 ? '<div style="background:#e74c3c;border-radius:3px;height:100%;width:' + Math.round(barW * entryPct / 100) + '%;opacity:0.5;position:absolute;top:0;left:0;"></div>' : '') +
          '</div>' +
        '</td></tr>';
    });
    table.innerHTML = thead + tbody;
    container.appendChild(table);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 6: Bot ecosystem detail
  // ═══════════════════════════════════════════════════════════
  function buildBotEcosystem(container) {
    var eco = SE.ecosystem;
    if (!eco || !(eco.crawlers.length || eco.aiCrawlers.length || eco.scanners.length)) return;

    var ecoTitle = document.createElement('h4');
    ecoTitle.style.cssText = 'margin:20px 0 6px;font-size:13px;opacity:0.7;';
    ecoTitle.textContent = 'Bot Ecosystem — Guide · Catalog · Neutralize';
    container.appendChild(ecoTitle);

    var ecoGrid = document.createElement('div');
    ecoGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:11px;';

    var guidedCol = '<div style="border-left:3px solid #3498db;padding-left:8px;">';
    guidedCol += '<div style="font-weight:700;color:#3498db;margin-bottom:6px;">🧭 Guided</div>';
    (eco.crawlers || []).forEach(function(c) {
      guidedCol += '<div style="opacity:0.7;">' + c.name + ' <span style="opacity:0.4;">(' + c.hits + ')</span></div>';
    });
    (eco.aiCrawlers || []).forEach(function(c) {
      guidedCol += '<div style="opacity:0.7;">' + c.name + ' <span style="opacity:0.4;">(' + c.hits + ')</span></div>';
    });
    guidedCol += '</div>';

    var catCol = '<div style="border-left:3px solid #9b59b6;padding-left:8px;">';
    catCol += '<div style="font-weight:700;color:#9b59b6;margin-bottom:6px;">📋 Cataloged</div>';
    (eco.seoBots || []).forEach(function(c) {
      catCol += '<div style="opacity:0.7;">' + c.name + ' <span style="opacity:0.4;">(' + c.hits + ')</span></div>';
    });
    (eco.linkPreviews || []).forEach(function(c) {
      catCol += '<div style="opacity:0.7;">' + c.name + ' <span style="opacity:0.4;">(' + c.hits + ')</span></div>';
    });
    catCol += '</div>';

    var neutCol = '<div style="border-left:3px solid #e74c3c;padding-left:8px;">';
    neutCol += '<div style="font-weight:700;color:#e74c3c;margin-bottom:6px;">🛡️ Neutralized</div>';
    (eco.scanners || []).slice(0, 8).forEach(function(c) {
      neutCol += '<div style="opacity:0.7;">' + c.name + ' <span style="opacity:0.4;">(' + c.hits + ')</span></div>';
    });
    if (eco.probes && eco.probes.length) {
      neutCol += '<div style="margin-top:6px;font-size:9px;opacity:0.4;">Probed: ';
      neutCol += eco.probes.slice(0, 5).map(function(p) { return p.path; }).join(', ');
      neutCol += '</div>';
    }
    neutCol += '</div>';

    ecoGrid.innerHTML = guidedCol + catCol + neutCol;
    container.appendChild(ecoGrid);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 7: Generated timestamp
  // ═══════════════════════════════════════════════════════════
  function buildTimestamp(container) {
    var s = SE.summary;
    var ts = document.createElement('p');
    ts.style.cssText = 'font-size:9px;opacity:0.3;text-align:right;margin-top:12px;';
    ts.textContent = 'Receptor snapshot: ' + SE.generated + ' · ' +
      (s.humanHits || s.totalHits || 0) + ' human hits · ' +
      (s.totalRequests || 0) + ' total requests · ' +
      (s.days || 0) + ' days';
    container.appendChild(ts);
  }

  // ═══════════════════════════════════════════════════════════
  // Dispatcher: renderExploration
  // ═══════════════════════════════════════════════════════════
  function renderExploration(container) {
    var width = container.clientWidth || 800;
    container.innerHTML = '';

    buildStats(container);
    buildPie(container, width);
    buildHeatmap(container, width);
    buildHopGraph(container, width);
    buildPaths(container);
    buildBotEcosystem(container);
    buildTimestamp(container);
  }

  function init() {
    var container = document.getElementById('signal-exploration');
    if (!container) return;
    renderExploration(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
