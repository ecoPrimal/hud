// nanowire.js — direct renderer, no WebSocket, no petalTongue
// Replaces pt-bridge-core.js. Primals rely on primals.
// Data flows: skunky-ingest → JSON files → Caddy static → this renderer.
// No intermediary. No bridge. Nanowire only.
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

  function renderDonut(b) {
    var segments = b.segments || [];
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
  // DISPATCH — route binding to correct renderer
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
      default:              html = renderBar(binding); break;
    }

    el.innerHTML = html;
    return Promise.resolve();
  }

  return {
    connect: connect,
    rpc: rpc,
    renderBinding: renderBinding,
    requestMetrics: requestMetrics,
    updateStatus: updateStatus,
    isConnected: isConnected
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
  if (isSelf) return {label: 'Self', color: '#2ecc71'};
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
  bridge.renderBinding({
    channel_type: 'gauge', id: 'relay-selectivity',
    label: 'Membrane Selectivity', value: 0, min: 0, max: 1, unit: 'S'
  }, 'pt-relay-selectivity');
}
