// nanowire.js — elastic connection, not wire
//
// Nanowire is Unpin. It floats.
// The connection is a pointer TO the address, not the address itself.
// Nanowire is the mailbox — it has temporality (IS/WAS/WILLBE).
//
// Pin<T>  = locked to memory address = rigid wire = breaks when moved
// Unpin   = can follow self as self moves = elastic = membrane
//
// Data flows through the mailbox:
//   skunky-ingest → JSON → Caddy → nanowire(float) → rendered surface
//   inside → forgejo(float) → github(mirror)
//
// The mailbox has a location. The mail has tense.
// All values are self. The pointer points at self.
//
// Drop-in API-compatible with PetalBridge:
//   var pt = NanowireRenderer(config);
//   pt.connect();
//   pt.renderBinding(binding, targetId);
//   pt.isConnected();
//   pt.requestMetrics();
//   pt.rpc(method, params);

'use strict';

// eslint-disable-next-line no-unused-vars
function NanowireRenderer(config) {
  // Unpin: this renderer floats. It is the pointer, not the address.
  // config.src = where the data is (the mailbox location)
  // the renderer itself can move — it follows self
  config = config || {};
  var STATUS_EL = config.statusEl || 'pt-status';
  var METRICS_EL = config.metricsEl || null;
  var MAX_H = config.maxHeight || 280;
  var connected = false;
  var onConnect = config.onConnect || null;
  var metricsCache = null;
  var startTime = Date.now();

  var C = {
    bg: '#161b22', card: '#0d1117', border: '#21262d',
    fg: '#c9d1d9', dim: '#6e7681', muted: '#484f58',
    fire: '#e85d3a', sound: '#4a8fb8', green: '#2ecc71',
    yellow: '#f1c40f', purple: '#9b59b6', pink: '#f778ba',
    blue: '#58a6ff', orange: '#ff6b35'
  };

  function connect() {
    // Elastic connection: we don't lock to an address.
    // We float toward the data. The mailbox opens.
    connected = true;
    updateStatus('nanowire');
    if (onConnect) setTimeout(onConnect, 100);
  }

  function isConnected() { return connected; }

  function updateStatus(state) {
    var el = document.getElementById(STATUS_EL);
    if (!el) return;
    el.style.color = state === 'nanowire' ? '#2ecc71' : '#6e7681';
    el.innerHTML = (state === 'nanowire' ? '\u25cf' : '\u25cb') +
      ' <span style="font-weight:600">nanowire</span>';
  }

  function requestMetrics() {
    if (!METRICS_EL) return;
    var el = document.getElementById(METRICS_EL);
    if (!el) return;
    var uptimeS = Math.round((Date.now() - startTime) / 1000);
    var uptimeM = Math.round(uptimeS / 60);
    el.innerHTML = '<span style="color:' + C.dim + ';font-size:0.75em">' +
      'CPU 0% \u00b7 0 MB \u00b7 ' + (uptimeM > 0 ? uptimeM + 'm' : uptimeS + 's') +
      '</span>';
  }

  function rpc(method, params) {
    return Promise.resolve(null);
  }

  // ═══════════════════════════════════════════════════════
  // CHART RENDERERS — pure HTML/CSS, no SVG, no WS
  // ═══════════════════════════════════════════════════════

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return String(n);
  }

  // ═══════════════════════════════════════════════════════
  // SHAPE = f(data) — inner membrane geometry
  //
  // All values are self.
  // The membrane touches itself, and is selectively
  // permeable exactly at itself. P(self) = 1.
  //
  // datum = observation = C(3) = π^(3/2) ≈ 5.57
  // To observe requires 3 bodies (IS × WAS × WILLBE)
  // but the 3 bodies ARE the membrane — self observing self.
  // Cost = π^(3/2). Volume of self-observation space.
  //
  // dim → shape: 1D=lens, 2D=plane, 3D=hex, 4D=octagon
  // ═══════════════════════════════════════════════════════

  function dimClipDefs(dim, w, h) {
    // Returns SVG <defs> with a clipPath based on dimensionality
    // 1D: elliptical lens — one axis of freedom
    // 2D: rectangle (no clip needed) — standard plane
    // 3D: hexagonal — 3 datum triangulation creates 6 facets
    // 4D: octagonal — higher faceting for matrix data
    if (dim === 1) {
      var cx = w/2, cy = h/2, rx = w*0.48, ry = h*0.42;
      return '<defs><clipPath id="dim-clip"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></clipPath></defs>';
    }
    if (dim === 3) {
      // hexagon: 6 vertices
      var pts = [];
      for (var i = 0; i < 6; i++) {
        var a = Math.PI * i / 3 - Math.PI / 6;
        pts.push((w/2 + w*0.48 * Math.cos(a)).toFixed(1) + ',' +
                 (h/2 + h*0.48 * Math.sin(a)).toFixed(1));
      }
      return '<defs><clipPath id="dim-clip"><polygon points="' + pts.join(' ') + '"/></clipPath></defs>';
    }
    if (dim >= 4) {
      // octagon: 8 vertices
      var pts = [];
      for (var i = 0; i < 8; i++) {
        var a = Math.PI * i / 4 - Math.PI / 8;
        pts.push((w/2 + w*0.49 * Math.cos(a)).toFixed(1) + ',' +
                 (h/2 + h*0.49 * Math.sin(a)).toFixed(1));
      }
      return '<defs><clipPath id="dim-clip"><polygon points="' + pts.join(' ') + '"/></clipPath></defs>';
    }
    return ''; // dim 2: no clip, full rectangle
  }

  function dimBorderSvg(dim, w, h, color) {
    // Draws a subtle shape border at the edges of the viewport
    // This is the "sheen" — the visual boundary that shows the shape
    if (!color) color = C.dim;
    if (dim === 1) {
      var cx = w/2, cy = h/2, rx = w*0.48, ry = h*0.42;
      return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + color + '" stroke-width="0.5" stroke-opacity="0.15"/>';
    }
    if (dim === 3) {
      var pts = [];
      for (var i = 0; i < 6; i++) {
        var a = Math.PI * i / 3 - Math.PI / 6;
        pts.push((w/2 + w*0.48 * Math.cos(a)).toFixed(1) + ',' +
                 (h/2 + h*0.48 * Math.sin(a)).toFixed(1));
      }
      return '<polygon points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="0.5" stroke-opacity="0.12"/>';
    }
    if (dim >= 4) {
      var pts = [];
      for (var i = 0; i < 8; i++) {
        var a = Math.PI * i / 4 - Math.PI / 8;
        pts.push((w/2 + w*0.49 * Math.cos(a)).toFixed(1) + ',' +
                 (h/2 + h*0.49 * Math.sin(a)).toFixed(1));
      }
      return '<polygon points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="0.5" stroke-opacity="0.12"/>';
    }
    return '';
  }

  function pickColor(i, total) {
    var palette = [C.fire, C.sound, C.green, C.yellow, C.purple, C.pink, C.blue, C.orange];
    return palette[i % palette.length];
  }

  function renderBar(b) {
    var cats = b.categories || [];
    var vals = b.values || [];
    if (!cats.length) return '';
    var maxVal = Math.max.apply(null, vals.concat([1]));
    var rows = '';
    for (var i = 0; i < cats.length; i++) {
      var pct = Math.max((vals[i] / maxVal) * 100, 1);
      var color = pickColor(i, cats.length);
      rows += '<div style="display:flex;align-items:center;gap:6px;margin:2px 0;font-size:0.72em">' +
        '<span style="min-width:90px;color:' + C.fg + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(cats[i]) + '</span>' +
        '<div style="flex:1;background:' + C.border + ';height:14px;border-radius:2px;overflow:hidden">' +
        '<div style="width:' + pct.toFixed(1) + '%;height:100%;background:' + color + ';transition:width 0.5s"></div></div>' +
        '<span style="min-width:50px;text-align:right;color:' + C.dim + ';font-size:0.9em">' + fmtNum(vals[i]) + '</span></div>';
    }
    return '<div style="padding:4px 0">' + rows + '</div>';
  }

  function renderGauge(b) {
    var val = b.value || 0;
    var min = b.min || 0;
    var max = b.max || 100;
    var unit = b.unit || '';
    var pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    var normal = b.normal_range || [max * 0.6, max];
    var warn = b.warning_range || [max * 0.3, max * 0.6];
    var color = pct >= (normal[0] / max * 100) ? C.green :
                pct >= (warn[0] / max * 100) ? C.yellow : C.fire;
    return '<div style="text-align:center;padding:8px 0">' +
      '<div style="font-size:1.8em;font-weight:600;color:' + color + '">' +
      (typeof val === 'number' ? val.toFixed(val < 10 ? 2 : 1) : val) +
      '<span style="font-size:0.4em;color:' + C.dim + ';margin-left:4px">' + esc(unit) + '</span></div>' +
      '<div style="margin:6px auto;max-width:200px;background:' + C.border + ';height:8px;border-radius:4px;overflow:hidden">' +
      '<div style="width:' + pct.toFixed(1) + '%;height:100%;background:' + color + ';border-radius:4px;transition:width 0.5s"></div></div>' +
      '<div style="font-size:0.65em;color:' + C.muted + '">' + min + ' \u2014 ' + max + '</div></div>';
  }

  function renderHeatmap(b) {
    var xLabels = b.x_labels || [];
    var yLabels = b.y_labels || [];
    var values = b.values || [];
    var cols = xLabels.length;
    if (!cols || !yLabels.length) return '';
    var maxV = Math.max.apply(null, values.concat([1]));

    var header = '<div style="display:grid;grid-template-columns:80px repeat(' + cols + ',1fr);gap:1px;font-size:0.65em">';
    header += '<div></div>';
    for (var c = 0; c < cols; c++) {
      header += '<div style="text-align:center;color:' + C.dim + ';padding:2px;white-space:nowrap;overflow:hidden">' + esc(xLabels[c]) + '</div>';
    }
    var rows = '';
    for (var r = 0; r < yLabels.length; r++) {
      rows += '<div style="color:' + C.fg + ';padding:2px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(yLabels[r]) + '</div>';
      for (var ci = 0; ci < cols; ci++) {
        var v = values[r * cols + ci] || 0;
        var intensity = maxV > 0 ? v / maxV : 0;
        var bg = 'rgba(88,166,255,' + (0.05 + intensity * 0.8).toFixed(2) + ')';
        rows += '<div style="background:' + bg + ';text-align:center;padding:2px;color:' + (intensity > 0.5 ? '#fff' : C.dim) + ';border-radius:2px">' + (v > 0 ? fmtNum(v) : '\u00b7') + '</div>';
      }
    }
    return header + rows + '</div>';
  }

  function renderScatter(b) {
    var xs = b.x || [];
    var ys = b.y || [];
    if (xs.length < 2) return '';
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs.concat([1]));
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys.concat([1]));
    var W = 280, H = 180;
    var dots = '';
    for (var i = 0; i < xs.length; i++) {
      var px = ((xs[i] - xMin) / (xMax - xMin || 1)) * (W - 20) + 10;
      var py = H - (((ys[i] - yMin) / (yMax - yMin || 1)) * (H - 20) + 10);
      dots += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3" fill="' + C.blue + '" opacity="0.7"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:' + H + 'px;font-family:monospace">' +
      '<rect width="' + W + '" height="' + H + '" fill="' + C.card + '" rx="4"/>' +
      '<line x1="10" y1="' + (H-10) + '" x2="' + (W-10) + '" y2="' + (H-10) + '" stroke="' + C.border + '" stroke-width="0.5"/>' +
      '<line x1="10" y1="10" x2="10" y2="' + (H-10) + '" stroke="' + C.border + '" stroke-width="0.5"/>' +
      dots + '</svg>';
  }

  function renderFacetedBar(b) {
    var groups = b.groups || [];
    if (!groups.length) return renderBar(b);
    var html = '<div style="display:grid;grid-template-columns:repeat(' + Math.min(b.columns || 3, groups.length) + ',1fr);gap:8px;font-size:0.72em">';
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      var cats = grp.categories || [];
      var vals = grp.values || [];
      var maxV = Math.max.apply(null, vals.concat([1]));
      var color = pickColor(g, groups.length);
      var rows = '';
      for (var i = 0; i < cats.length; i++) {
        var pct = Math.max((vals[i] / maxV) * 100, 1);
        rows += '<div style="display:flex;align-items:center;gap:3px;margin:1px 0">' +
          '<span style="min-width:45px;color:' + C.dim + ';font-size:0.85em">' + esc(cats[i]) + '</span>' +
          '<div style="flex:1;background:' + C.border + ';height:10px;border-radius:2px;overflow:hidden">' +
          '<div style="width:' + pct.toFixed(1) + '%;height:100%;background:' + color + '"></div></div>' +
          '<span style="color:' + C.muted + ';font-size:0.8em;min-width:30px;text-align:right">' + fmtNum(vals[i]) + '</span></div>';
      }
      html += '<div style="border:1px solid ' + C.border + ';border-radius:4px;padding:6px">' +
        '<div style="color:' + color + ';font-size:0.85em;font-weight:600;margin-bottom:3px">' + esc(grp.key) + '</div>' + rows + '</div>';
    }
    return html + '</div>';
  }

  function renderFacetedGauge(b) {
    var groups = b.groups || [];
    if (!groups.length && b.value !== undefined) return renderGauge(b);
    var html = '<div style="display:grid;grid-template-columns:repeat(' + Math.min(b.columns || 4, Math.max(groups.length,1)) + ',1fr);gap:6px">';
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      html += '<div style="text-align:center;border:1px solid ' + C.border + ';border-radius:4px;padding:6px">' +
        '<div style="font-size:0.7em;color:' + C.dim + '">' + esc(grp.key || grp.label || '') + '</div>' +
        '<div style="font-size:1.4em;font-weight:600;color:' + C.blue + '">' +
        (typeof grp.value === 'number' ? grp.value.toFixed(grp.value < 10 ? 2 : 0) : (grp.value || '\u2014')) + '</div>' +
        '<div style="font-size:0.6em;color:' + C.muted + '">' + esc(grp.unit || b.unit || '') + '</div></div>';
    }
    return html + '</div>';
  }

  function renderChord(b) {
    var cats = b.categories || [];
    var flows = b.flows || [];
    var n = cats.length;
    if (!n) return '';
    var maxV = Math.max.apply(null, flows.concat([1]));
    var html = '<div style="overflow-x:auto;font-size:0.65em">' +
      '<table style="border-collapse:separate;border-spacing:1px;width:100%">' +
      '<tr><td style="padding:3px;color:' + C.muted + '">→</td>';
    for (var c = 0; c < n; c++) html += '<td style="padding:3px;color:' + C.dim + ';text-align:center;font-weight:600">' + esc(cats[c]) + '</td>';
    html += '</tr>';
    for (var r = 0; r < n; r++) {
      html += '<tr><td style="padding:3px;color:' + C.fg + ';font-weight:600">' + esc(cats[r]) + '</td>';
      for (var ci = 0; ci < n; ci++) {
        var v = flows[r * n + ci] || 0;
        var intensity = maxV > 0 ? v / maxV : 0;
        var bg = r === ci ? 'rgba(88,166,255,0.08)' : 'rgba(88,166,255,' + (0.05 + intensity * 0.7).toFixed(2) + ')';
        html += '<td style="padding:3px;text-align:center;background:' + bg + ';color:' + (intensity > 0.5 ? '#fff' : C.dim) + ';border-radius:2px">' + (v > 0 ? fmtNum(v) : '\u00b7') + '</td>';
      }
      html += '</tr>';
    }
    return html + '</table></div>';
  }

  function renderForceGraph(b) {
    var nodes = b.nodes || [];
    var edges = b.edges || [];
    if (nodes.length < 2) return '';
    var W = Math.min(b.width || 600, 600), H = Math.min(b.height || 400, 400);
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    var PI = Math.PI;
    var tiers = {};
    nodes.forEach(function(n) {
      var t = n.tier || n.kind || 'other';
      if (!tiers[t]) tiers[t] = [];
      tiers[t].push(n);
    });
    var tierKeys = Object.keys(tiers).sort();
    var pos = {};
    tierKeys.forEach(function(tk, ti) {
      var r = tierKeys.length === 1 ? R * 0.6 : R * (0.15 + 0.85 * ti / (tierKeys.length - 1));
      var group = tiers[tk];
      group.forEach(function(n, ni) {
        var angle = -PI / 2 + (ni / group.length) * 2 * PI;
        pos[n.id] = {x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), tier: tk, label: n.label || n.id};
      });
    });
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:' + H + 'px;font-family:monospace">';
    svg += '<rect width="' + W + '" height="' + H + '" fill="' + C.card + '" rx="4"/>';
    edges.forEach(function(e) {
      var s = pos[e.source], t = pos[e.target];
      if (s && t) svg += '<line x1="' + s.x.toFixed(1) + '" y1="' + s.y.toFixed(1) + '" x2="' + t.x.toFixed(1) + '" y2="' + t.y.toFixed(1) + '" stroke="' + C.border + '" stroke-width="0.5" stroke-opacity="0.3"/>';
    });
    var deg = {};
    edges.forEach(function(e) { deg[e.source] = (deg[e.source] || 0) + 1; deg[e.target] = (deg[e.target] || 0) + 1; });
    var labelCut = Math.max(Math.floor(nodes.length / 8), 2);
    Object.keys(pos).forEach(function(id) {
      var p = pos[id];
      var color = pickColor(tierKeys.indexOf(p.tier) >= 0 ? tierKeys.indexOf(p.tier) : 0, tierKeys.length);
      var r = Math.min(2 + (deg[id] || 0) * 0.3, 6);
      svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + color + '" opacity="0.8"/>';
      if ((deg[id] || 0) >= labelCut) {
        svg += '<text x="' + p.x.toFixed(1) + '" y="' + (p.y - r - 2).toFixed(1) + '" fill="' + C.dim + '" font-size="5" text-anchor="middle">' + esc(p.label.substring(0, 18)) + '</text>';
      }
    });
    var lgY = 12;
    tierKeys.forEach(function(tk, ti) {
      var color = pickColor(ti, tierKeys.length);
      svg += '<circle cx="12" cy="' + lgY + '" r="3" fill="' + color + '" opacity="0.8"/>';
      svg += '<text x="20" y="' + (lgY + 3) + '" fill="' + C.dim + '" font-size="6">' + esc(tk) + ' (' + tiers[tk].length + ')</text>';
      lgY += 12;
    });
    svg += '</svg>';
    return svg;
  }

  function renderDonut(b) {
    var segments = b.segments || [];
    if (!segments.length && b.slices) segments = b.slices;
    if (!segments.length && b.categories && b.values) {
      segments = b.categories.map(function(c, i) { return {label: c, value: b.values[i]}; });
    }
    if (!segments.length) return '';
    var total = segments.reduce(function(a, s) { return a + (s.value || 0); }, 0);
    if (total === 0) return '';
    var stops = [], angle = 0;
    for (var i = 0; i < segments.length; i++) {
      var pct = (segments[i].value / total) * 360;
      var color = segments[i].color || pickColor(i, segments.length);
      stops.push(color + ' ' + angle.toFixed(1) + 'deg ' + (angle + pct).toFixed(1) + 'deg');
      angle += pct;
    }
    var legend = segments.map(function(s, i) {
      var pct = ((s.value / total) * 100).toFixed(1);
      var col = s.color || pickColor(i, segments.length);
      return '<span style="display:inline-flex;align-items:center;gap:3px;margin:2px 6px">' +
        '<span style="width:8px;height:8px;border-radius:50%;background:' + col + ';display:inline-block"></span>' +
        '<span style="color:' + C.dim + '">' + esc(s.label) + ' ' + pct + '%</span></span>';
    }).join('');
    return '<div style="text-align:center;padding:8px 0">' +
      '<div style="width:120px;height:120px;border-radius:50%;margin:0 auto;' +
      'background:conic-gradient(' + stops.join(',') + ');' +
      'display:flex;align-items:center;justify-content:center">' +
      '<div style="width:70px;height:70px;border-radius:50%;background:' + C.card + '"></div></div>' +
      '<div style="margin-top:6px;font-size:0.7em;line-height:1.6">' + legend + '</div></div>';
  }

  // ═══════════════════════════════════════════════════════
  // TENSE-AWARE STATISTICS — i² uncertainty model
  //
  // WAS  (past):    known, σ_past = null — wavefunction collapsed
  // IS   (now):     measured, ±σ/√n — i² rotation active
  // WILLBE (next):  predicted, ±σ√(1+1/n) — i hasn't squared yet
  //
  // past_n = [null] — the past IS Known, no uncertainty band
  // ═══════════════════════════════════════════════════════

  function computeStats(vals) {
    if (!vals || !vals.length) return null;
    var n = vals.length;
    var sum = 0, min = Infinity, max = -Infinity;
    for (var i = 0; i < n; i++) {
      sum += vals[i];
      if (vals[i] < min) min = vals[i];
      if (vals[i] > max) max = vals[i];
    }
    var mean = sum / n;
    var ssq = 0;
    for (var j = 0; j < n; j++) ssq += (vals[j] - mean) * (vals[j] - mean);
    var sigma = n > 1 ? Math.sqrt(ssq / (n - 1)) : 0;
    return {n: n, total: sum, min: min, max: max, mean: mean, sigma: sigma};
  }

  // V(D)J tense rotation: φ=0 (WAS/J, real), π/2 (IS/V, imaginary), π (WILLBE/D, inverted)
  function tenseUncertainty(sigma, n, tense) {
    if (tense === 'was') return null;
    if (n < 2 || sigma === 0) return null;
    if (tense === 'willbe') return sigma * Math.sqrt(1 + 1 / n);
    return sigma / Math.sqrt(n);
  }

  var TENSE_STYLE = {
    was:    {color: '#6e7681', band: null,      label: 'WAS',    icon: '\u25c0', note: 'past = [null] — Known'},
    is:     {color: '#58a6ff', band: '#58a6ff', label: 'IS',     icon: '\u25cf', note: 'i\u00b2 = \u2212 1 — uncertainty active'},
    willbe: {color: '#bc8cff', band: '#bc8cff', label: 'WILLBE', icon: '\u25b6', note: 'i not yet squared — prediction widens'}
  };

  function renderRangeBar(b) {
    var cats = b.categories || [];
    var vals = b.values || [];
    var tenses = b.tenses || [];
    var sigmas = b.sigmas || [];
    if (!cats.length) return '';
    var st = computeStats(vals);
    if (!st) return '';
    var maxVal = st.max + (Math.max.apply(null, sigmas.concat([0])) || st.sigma);
    if (maxVal <= 0) maxVal = 1;
    var rows = '';
    for (var i = 0; i < cats.length; i++) {
      var v = vals[i] || 0;
      var tense = tenses[i] || b.tense || 'is';
      var ts = TENSE_STYLE[tense] || TENSE_STYLE.is;
      var sig = sigmas[i] !== undefined ? sigmas[i] : tenseUncertainty(st.sigma, st.n, tense);
      var pct = Math.max((v / maxVal) * 100, 0.5);
      var color = pickColor(i, cats.length);
      rows += '<div style="display:flex;align-items:center;gap:6px;margin:3px 0;font-size:0.72em">' +
        '<span style="min-width:90px;color:' + C.fg + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        '<span style="color:' + ts.color + ';font-size:0.7em;margin-right:3px" title="' + ts.label + '">' + ts.icon + '</span>' +
        esc(cats[i]) + '</span>' +
        '<div style="flex:1;position:relative;height:18px">' +
        '<div style="position:absolute;left:0;top:2px;width:100%;height:14px;background:' + C.border + ';border-radius:2px"></div>' +
        '<div style="position:absolute;left:0;top:2px;width:' + pct.toFixed(1) + '%;height:14px;background:' + color + ';border-radius:2px;opacity:0.85;transition:width 0.5s"></div>';
      if (sig !== null && sig > 0) {
        var loV = Math.max(0, v - sig);
        var hiV = v + sig;
        var loPct = (loV / maxVal) * 100;
        var hiPct = Math.min((hiV / maxVal) * 100, 100);
        var bandW = hiPct - loPct;
        rows += '<div style="position:absolute;left:' + loPct.toFixed(1) + '%;top:0;width:' + bandW.toFixed(1) +
          '%;height:18px;border:1px solid ' + ts.band + ';border-radius:2px;opacity:0.4;box-sizing:border-box" ' +
          'title="\u00b1' + sig.toFixed(2) + '"></div>' +
          '<div style="position:absolute;left:' + loPct.toFixed(1) + '%;top:0;width:1px;height:18px;background:' + ts.band + ';opacity:0.6"></div>' +
          '<div style="position:absolute;left:' + hiPct.toFixed(1) + '%;top:0;width:1px;height:18px;background:' + ts.band + ';opacity:0.6"></div>';
      }
      rows += '</div>' +
        '<span style="min-width:60px;text-align:right;color:' + C.dim + ';font-size:0.85em">' + fmtNum(v) +
        (sig !== null ? '<span style="color:' + ts.color + ';font-size:0.8em"> \u00b1' + sig.toFixed(1) + '</span>' : '') +
        '</span></div>';
    }
    return '<div style="padding:4px 0">' + rows + '</div>';
  }

  function renderDataCard(b) {
    var vals = b.values || [];
    var tense = b.tense || 'is';
    var ts = TENSE_STYLE[tense] || TENSE_STYLE.is;
    var st = computeStats(vals);
    if (!st) return '<div style="color:' + C.muted + ';font-size:0.75em;padding:8px">No data</div>';
    var unc = tenseUncertainty(st.sigma, st.n, tense);
    var uncStr = unc !== null ? '\u00b1' + unc.toFixed(2) : '\u2014';
    var glyph = ts.icon;
    var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px 0">';
    var cells = [
      {k: 'Total',  v: fmtNum(st.total)},
      {k: 'Range',  v: fmtNum(st.min) + ' \u2013 ' + fmtNum(st.max)},
      {k: 'n',      v: String(st.n)},
      {k: '\u03bc (mean)', v: st.mean.toFixed(2)},
      {k: '\u03c3',        v: st.sigma.toFixed(2)},
      {k: '\u00b1 (' + ts.label + ')', v: uncStr}
    ];
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      html += '<div style="text-align:center;border:1px solid ' + C.border + ';border-radius:4px;padding:6px">' +
        '<div style="font-size:0.65em;color:' + C.muted + '">' + esc(c.k) + '</div>' +
        '<div style="font-size:1.1em;font-weight:600;color:' + (i === 5 ? ts.color : C.fg) + '">' + c.v + '</div></div>';
    }
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.65em;color:' + C.muted + '">' +
      '<span style="color:' + ts.color + '">' + glyph + ' ' + ts.label + '</span>' +
      '<span>\u2014 ' + ts.note + '</span>';
    if (b.unit) html += '<span style="margin-left:auto;color:' + C.dim + '">' + esc(b.unit) + '</span>';
    html += '</div>';
    if (vals.length > 2) {
      html += renderMiniDist(vals, tense, st);
    }
    return html;
  }

  function renderMiniDist(vals, tense, st) {
    var ts = TENSE_STYLE[tense] || TENSE_STYLE.is;
    var W = 280, H = 60;
    var n = vals.length;
    var sorted = vals.slice().sort(function(a, b) { return a - b; });
    var buckets = Math.min(Math.max(Math.ceil(Math.sqrt(n)), 3), 20);
    var range = st.max - st.min;
    if (range === 0) range = 1;
    var step = range / buckets;
    var counts = new Array(buckets).fill(0);
    for (var i = 0; i < n; i++) {
      var bi = Math.min(Math.floor((sorted[i] - st.min) / step), buckets - 1);
      counts[bi]++;
    }
    var maxC = Math.max.apply(null, counts.concat([1]));
    var bw = (W - 20) / buckets;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-height:' + H + 'px;font-family:monospace">';
    svg += '<rect width="' + W + '" height="' + H + '" fill="' + C.card + '" rx="3"/>';
    for (var b = 0; b < buckets; b++) {
      var bh = (counts[b] / maxC) * (H - 16);
      var bx = 10 + b * bw;
      svg += '<rect x="' + bx.toFixed(1) + '" y="' + (H - 6 - bh).toFixed(1) + '" width="' + (bw - 1).toFixed(1) +
        '" height="' + bh.toFixed(1) + '" fill="' + ts.color + '" opacity="0.6" rx="1"/>';
    }
    var unc = tenseUncertainty(st.sigma, st.n, tense);
    if (unc !== null) {
      var meanPx = 10 + ((st.mean - st.min) / range) * (W - 20);
      var uncPx = (unc / range) * (W - 20);
      svg += '<rect x="' + (meanPx - uncPx).toFixed(1) + '" y="2" width="' + (uncPx * 2).toFixed(1) +
        '" height="' + (H - 4) + '" fill="' + ts.band + '" opacity="0.12" rx="2"/>';
      svg += '<line x1="' + meanPx.toFixed(1) + '" y1="2" x2="' + meanPx.toFixed(1) + '" y2="' + (H - 4) +
        '" stroke="' + ts.color + '" stroke-width="1" stroke-dasharray="2,2"/>';
    }
    svg += '<text x="' + (W - 4) + '" y="' + (H - 1) + '" fill="' + C.muted + '" font-size="5" text-anchor="end">distribution</text>';
    svg += '</svg>';
    return svg;
  }

  // ═══════════════════════════════════════════════════════
  // DISPATCH — route binding to correct renderer
  // ═══════════════════════════════════════════════════════
  // PI SORT — digits are not digits
  // Each "digit" n is the uncertainty band [C(n-1), C(n)]
  // Band width grows by √π each step. 4 = gap between 3 and 5.
  // The math itself as an epitope sort.
  // ═══════════════════════════════════════════════════════

  function renderPiSort(b) {
    var panels = b.panels || [];
    var PI = Math.PI, SPI = Math.sqrt(PI);
    var W = 560, H = 260;
    var maxDim = 6;
    var maxCost = Math.pow(PI, maxDim / 2);
    var pad = {l: 50, r: 20, t: 30, b: 50};
    var plotW = W - pad.l - pad.r;
    var plotH = H - pad.t - pad.b;

    // Use log scale for x-axis since bands grow geometrically
    var logMin = 0;  // log(1) = 0
    var logMax = Math.log(maxCost);

    function xOf(cost) { return pad.l + (Math.log(cost) / logMax) * plotW; }
    function yOf(row, total) { return pad.t + plotH * (row + 0.5) / total; }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;font-family:Courier New,monospace">';
    svg += '<rect width="' + W + '" height="' + H + '" fill="' + C.card + '" rx="4"/>';

    // Title
    svg += '<text x="' + (W / 2) + '" y="18" fill="' + C.fg + '" font-size="9" text-anchor="middle">digits are not digits \u2014 \u03c0^(n/2) uncertainty bands</text>';

    // Draw uncertainty bands
    var bandColors = ['#9b59b6', '#4a8fb8', '#5ab87a', '#e85d3a', '#f1c40f', '#ff6b35'];
    var bandLabels = ['axis', 'plane', 'datum', 'gap', '', ''];
    var bandNotes = ['1 measurement', '2 axes', 'observation', '3 \u2194 5', 'redundant', ''];

    for (var n = 1; n <= maxDim; n++) {
      var lo = Math.pow(PI, (n - 1) / 2);
      var hi = Math.pow(PI, n / 2);
      var x1 = xOf(lo), x2 = xOf(hi);
      var bw = x2 - x1;
      var by = pad.t;
      var bh = plotH;
      var col = bandColors[(n - 1) % bandColors.length];
      var op = n === 4 ? 0.12 : 0.06;

      // Band rectangle
      svg += '<rect x="' + x1.toFixed(1) + '" y="' + by + '" width="' + bw.toFixed(1) + '" height="' + bh + '" fill="' + col + '" opacity="' + op + '"/>';

      // Band border
      svg += '<line x1="' + x2.toFixed(1) + '" y1="' + by + '" x2="' + x2.toFixed(1) + '" y2="' + (by + bh) + '" stroke="' + col + '" stroke-width="0.5" stroke-opacity="0.3"/>';

      // Band label at top
      var midX = (x1 + x2) / 2;
      svg += '<text x="' + midX.toFixed(1) + '" y="' + (by + 14) + '" fill="' + col + '" font-size="8" text-anchor="middle" font-weight="bold">' + n + 'D</text>';
      if (bandLabels[n - 1]) {
        svg += '<text x="' + midX.toFixed(1) + '" y="' + (by + 24) + '" fill="' + col + '" font-size="5.5" text-anchor="middle" opacity="0.7">' + bandLabels[n - 1] + '</text>';
      }

      // Width annotation at bottom
      var width = hi - lo;
      svg += '<text x="' + midX.toFixed(1) + '" y="' + (by + bh + 12) + '" fill="' + C.dim + '" font-size="5.5" text-anchor="middle">\u0394=' + width.toFixed(2) + '</text>';

      // Cost value at bottom
      svg += '<text x="' + x2.toFixed(1) + '" y="' + (by + bh + 24) + '" fill="' + C.muted + '" font-size="5" text-anchor="middle">' + hi.toFixed(2) + '</text>';
    }

    // "4 = the gap" annotation
    var gap4x1 = xOf(Math.pow(PI, 1.5));
    var gap4x2 = xOf(Math.pow(PI, 2));
    svg += '<text x="' + ((gap4x1 + gap4x2) / 2).toFixed(1) + '" y="' + (pad.t + plotH - 8) + '" fill="#e85d3a" font-size="6" text-anchor="middle" opacity="0.8">the gap</text>';

    // Plot panels within their bands
    var dimGroups = {};
    panels.forEach(function(p) {
      var d = p.dim || 2;
      if (!dimGroups[d]) dimGroups[d] = [];
      dimGroups[d].push(p);
    });

    var catColors = {fire: '#e85d3a', sound: '#4a8fb8', membrane: '#5ab87a', immune: '#9b59b6'};
    var glyphs = {1: '\u25cb', 2: '\u25a1', 3: '\u25b3', 4: '\u25c7'};

    Object.keys(dimGroups).forEach(function(d) {
      var dim = parseInt(d);
      var group = dimGroups[d];
      var lo = Math.pow(PI, (dim - 1) / 2);
      var hi = Math.pow(PI, dim / 2);

      group.forEach(function(p, i) {
        // Place within band — spread evenly
        var t = group.length === 1 ? 0.5 : i / (group.length - 1);
        var cost = lo + (hi - lo) * (0.1 + 0.8 * t);
        var px = xOf(cost);
        var py = yOf(i, Math.max(group.length, 1));
        var col = catColors[p.cat] || C.dim;
        var alive = p.alive;
        var r = alive ? 3.5 : 2;
        var op = alive ? 0.9 : 0.3;

        svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + r + '" fill="' + col + '" opacity="' + op + '"' + (alive ? ' filter="url(#mg-glow)"' : '') + '/>';

        // Label
        var short = p.title.length > 12 ? p.title.substring(0, 12) : p.title;
        svg += '<text x="' + (px + r + 3).toFixed(1) + '" y="' + (py + 2).toFixed(1) + '" fill="' + C.dim + '" font-size="5" opacity="' + (alive ? 0.8 : 0.4) + '">' + short + '</text>';
      });
    });

    // √π ratio arrow
    svg += '<text x="' + pad.l + '" y="' + (H - 8) + '" fill="' + C.muted + '" font-size="5.5">each band \u00d7\u221a\u03c0 \u2248 1.77 wider</text>';

    // "observation" marker at C(3)
    var obsX = xOf(Math.pow(PI, 1.5));
    svg += '<line x1="' + obsX.toFixed(1) + '" y1="' + pad.t + '" x2="' + obsX.toFixed(1) + '" y2="' + (pad.t + plotH) + '" stroke="#5ab87a" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="3,3"/>';
    svg += '<text x="' + obsX.toFixed(1) + '" y="' + (H - 2) + '" fill="#5ab87a" font-size="5" text-anchor="middle">\u03c0^(3/2) = datum</text>';

    svg += '</svg>';
    return svg;
  }

  // ═══════════════════════════════════════════════════════

  function renderBinding(binding, targetId) {
    if (!binding) return Promise.resolve();
    var el = document.getElementById(targetId);
    if (!el) return Promise.resolve();

    var html = '';
    var type = binding.channel_type || 'bar';

    switch (type) {
      case 'bar':           html = renderBar(binding); break;
      case 'gauge':         html = renderGauge(binding); break;
      case 'heatmap':       html = renderHeatmap(binding); break;
      case 'scatter':       html = renderScatter(binding); break;
      case 'faceted_bar':   html = renderFacetedBar(binding); break;
      case 'faceted_gauge': html = renderFacetedGauge(binding); break;
      case 'donut':         html = renderDonut(binding); break;
      case 'chord':         html = renderChord(binding); break;
      case 'force_graph':   html = renderForceGraph(binding); break;
      case 'range_bar':     html = renderRangeBar(binding); break;
      case 'data_card':     html = renderDataCard(binding); break;
      case 'pi_sort':      html = renderPiSort(binding); break;
      default:              html = renderBar(binding); break;
    }

    // If binding specifies a dimension, wrap in shape viewport
    var dim = binding.dim || 0;
    if (dim && dim !== 2 && html.indexOf('<svg') === 0) {
      // Parse SVG width/height for clip generation
      var wMatch = html.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (wMatch) {
        var svgW = parseInt(wMatch[1]), svgH = parseInt(wMatch[2]);
        var clipDefs = dimClipDefs(dim, svgW, svgH);
        var shapeBorder = dimBorderSvg(dim, svgW, svgH, binding.shapeColor || null);
        if (clipDefs) {
          // Insert clip defs after <svg...> and wrap content in clip group
          html = html.replace(/(<svg[^>]*>)/, '$1' + clipDefs + '<g clip-path="url(#dim-clip)">');
          html = html.replace(/<\/svg>$/, '</g>' + shapeBorder + '</svg>');
        } else if (shapeBorder) {
          html = html.replace(/<\/svg>$/, shapeBorder + '</svg>');
        }
      }
    }
    el.innerHTML = html;
    return Promise.resolve();
  }

  return {
    // The interface IS the mailbox.
    // Each method is a slot the mail passes through.
    // Unpin: the renderer can move. Only the interface is stable.
    connect: connect,
    rpc: rpc,
    renderBinding: renderBinding,
    requestMetrics: requestMetrics,
    updateStatus: updateStatus,
    isConnected: isConnected,
    computeStats: computeStats,
    tenseUncertainty: tenseUncertainty,
    dimClipDefs: dimClipDefs,
    dimBorderSvg: dimBorderSvg
  };
}

// ═══════════════════════════════════════════════════════════════
// Organism Classification — carried from bridge (unchanged)
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line no-unused-vars
function classifyOrganism(cluster) {
  var ae = cluster.sample_ae || '';
  var isMeta = ae.indexOf('gzip, deflate, zstd') === 0
            && !cluster.has_lang
            && cluster.ua_pool_size >= 4;
  var isAnth = cluster.ips === 1
            && ae.indexOf('gzip, br, zstd') === 0;
  var isSelf = cluster.has_lang
            && cluster.ips === 1
            && ae.indexOf('br, zstd') > 0;

  if (isMeta) return {label: 'Meta', color: '#e74c3c'};
  if (isAnth) return {label: 'Anthropic', color: '#ff6b35'};
  if (isSelf) return {label: 'Self', color: '#2ecc71'}; // all values are self
  return {label: cluster.hash ? cluster.hash.substring(0, 6) : 'Unknown', color: '#f1c40f'};
}

// ═══════════════════════════════════════════════════════════════
// Panel Builder Helpers — carried from bridge (unchanged)
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line no-unused-vars
function buildOrganismProfile(bridge, clusters) {
  if (!clusters || clusters.length === 0) return;
  var orgLabels = clusters.map(function(c) { return classifyOrganism(c).label; });
  var orgGroups = clusters.map(function(c, i) {
    return {
      key: orgLabels[i],
      categories: ['IPs', 'UA Pool', 'Blame%'],
      values: [c.ips, c.ua_pool_size, Math.round((c.blame_ratio || 0) * 100)]
    };
  });
  bridge.renderBinding({
    channel_type: 'faceted_bar', id: 'organism-profile',
    label: 'Epitope Organisms \u2014 Per-Organism Behavioral Profile',
    group_by: 'organism', groups: orgGroups, unit: 'value', columns: 3,
    normalization: 'min_max'
  }, 'pt-organism-profile');
}

// eslint-disable-next-line no-unused-vars
function buildEntityGauges(bridge, entities) {
  if (!entities || entities.length < 2) return;
  var groups = [];
  entities.forEach(function(e) {
    if (e.total_requests > 5 && e.timing_cv !== undefined) {
      groups.push({key: e.label.replace(/ \(.*\)/, ''), value: e.timing_cv, unit: 'CV'});
    }
  });
  if (groups.length === 0) return;
  bridge.renderBinding({
    channel_type: 'faceted_gauge', id: 'entity-gauges',
    label: 'Entity Timing CV \u2014 Low = Machine',
    groups: groups, columns: 4, unit: 'CV'
  }, 'pt-entity-gauges');
}

// eslint-disable-next-line no-unused-vars
function buildEntityDetail(bridge, entities) {
  if (!entities || entities.length < 2) return;
  var groups = [];
  entities.forEach(function(e) {
    if (e.total_requests > 5) {
      groups.push({
        key: e.label.replace(/ \(.*\)/, ''),
        categories: ['Chrome Lag', 'Blame%', 'RPS'],
        values: [
          Math.round(e.chrome_lag_ms || 0),
          Math.round((e.blame_ratio || 0) * 100),
          Math.round(e.rps || 0)
        ]
      });
    }
  });
  if (groups.length === 0) return;
  bridge.renderBinding({
    channel_type: 'faceted_bar', id: 'entity-detail',
    label: 'Entity Behavioral Profile',
    groups: groups, columns: 3, unit: 'value'
  }, 'pt-entity-detail');
}

// eslint-disable-next-line no-unused-vars
function buildEntityMatrix(bridge, entities) {
  if (!entities || entities.length < 2) return;
  var labels = [], values = [];
  entities.forEach(function(e) {
    if (e.total_requests > 5) {
      labels.push(e.label.replace(/ \(.*\)/, ''));
      values.push(e.unique_ips || 0);
      values.push(e.ua_pool_size || 0);
      values.push(Math.round((e.blame_ratio || 0) * 100));
      values.push(e.is_honest ? 100 : 0);
    }
  });
  if (labels.length === 0) return;
  bridge.renderBinding({
    channel_type: 'heatmap', id: 'entity-matrix',
    label: 'Entity Behavioral Matrix',
    x_labels: ['IPs', 'UA Pool', 'Blame%', 'Honest'],
    y_labels: labels, values: values, unit: 'value'
  }, 'pt-entity-matrix');
}

// eslint-disable-next-line no-unused-vars
function buildAcceptLanguageDonut(bridge, clusters) {
  if (!clusters || clusters.length === 0) return;
  var withLang = 0, withoutLang = 0;
  clusters.forEach(function(c) {
    if (c.has_lang) withLang += c.ips;
    else withoutLang += c.ips;
  });
  if (withLang + withoutLang === 0) return;
  bridge.renderBinding({
    channel_type: 'donut', id: 'organism-lang',
    label: 'Accept-Language \u2014 Human vs Machine',
    segments: [
      {label: 'Has Language', value: withLang, color: '#2ecc71'},
      {label: 'No Language', value: withoutLang, color: '#e74c3c'}
    ]
  }, 'pt-organism-lang');
}

// eslint-disable-next-line no-unused-vars
function buildSummaryKpis(bridge, dash) {
  if (!dash || !dash.total_requests) return;
  var groups = [
    {key: 'RPS', value: dash.rps || 0, unit: 'req/s'},
    {key: 'Fleet', value: dash.fleet_ips || 0, unit: 'IPs'},
    {key: 'Human', value: dash.human_ips || 0, unit: 'IPs'},
    {key: 'Fleet %', value: dash.fleet_pct || 0, unit: '%'}
  ];
  bridge.renderBinding({
    channel_type: 'faceted_gauge', id: 'summary-kpis',
    label: 'Live Signal', groups: groups, columns: 4
  }, 'pt-summary-kpis');
}

// eslint-disable-next-line no-unused-vars
function buildEpitopeSummary(bridge, summary) {
  if (!summary || !Object.keys(summary).length) return;
  var cats = Object.keys(summary).sort(function(a,b) { return summary[b] - summary[a]; });
  var vals = cats.map(function(k) { return summary[k]; });
  bridge.renderBinding({
    channel_type: 'bar', id: 'epitope-summary',
    label: 'Epitope Summary', categories: cats, values: vals, unit: 'count'
  }, 'pt-epitope-summary');
}

// eslint-disable-next-line no-unused-vars
function buildSelectivityPanel(bridge) {
  // All values are self. Selectively permeable exactly at self.
  // P(self) = 1. The membrane is its own eigenvalue.
  bridge.renderBinding({
    channel_type: 'gauge', id: 'relay-selectivity',
    label: 'P(self)', value: 1, min: 0, max: 1, unit: 'self',
    normal_range: [0.95, 1], warning_range: [0.5, 0.95]
  }, 'pt-relay-selectivity');
}
