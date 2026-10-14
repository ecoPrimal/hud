// fleet-atlas.js v1 — map the fleet across the world
// Extends ionosphere with VPS nodes, data centers, backtrace arcs.
// Your house (Michigan) is the membrane. Everything else is fleet.
// Loaded after pt-ionosphere.js, cosmic-flavor.js.
(function() {
  'use strict';

  var fl = window._cosmicFlavor;
  var NS = 'http://www.w3.org/2000/svg';
  var _fleetData = null;
  var _geoData = null;
  var _atlasBuilt = false;
  var _atlasGroup = null;
  var _tooltip = null;
  var _scanData = null;

  function el(tag, a, p) {
    var e = document.createElementNS(NS, tag);
    if (a) for (var k in a) e.setAttribute(k, '' + a[k]);
    if (p) p.appendChild(e);
    return e;
  }

  function txt(par, x, y, str, fill, size, ex) {
    var a = { x: x, y: y, fill: fill, 'font-size': size, 'text-anchor': 'middle' };
    if (ex) for (var k in a) a[k] = ex[k] || a[k];
    if (ex) for (var k in ex) if (!(k in a)) a[k] = ex[k];
    var e = el('text', a, par);
    e.textContent = str;
    return e;
  }

  // ═══ KNOWN DATA CENTERS ═══
  // Map fleet activity to physical infrastructure
  var DATA_CENTERS = {
    'anthropic_sf': {
      label: 'Anthropic',
      city: 'San Francisco',
      lon: -122.4, lat: 37.78,
      fleet: 'anthropic_claudebot',
      class: 'non-self',
      color: '#e85d3a',
      requests: 1772093,
      ips: 5,
      desc: '5 IPs, full content scraping'
    },
    'openai_sf': {
      label: 'OpenAI',
      city: 'San Francisco',
      lon: -122.3, lat: 37.72,
      fleet: 'openai_gptbot',
      class: 'non-self',
      color: '#e85d3a',
      requests: 1892264,
      ips: 496,
      desc: '496 IPs, commit scraping (79%)'
    },
    'meta_dublin': {
      label: 'Meta / Facebook',
      city: 'Dublin DC',
      lon: -6.26, lat: 53.35,
      fleet: 'meta_fleet',
      class: 'non-self',
      color: '#e85d3a',
      requests: 611548,
      ips: 63,
      desc: '63 IPs, 26 UA variants, FB-BLOCK'
    },
    'hpe_spring': {
      label: 'HPE (Hewlett Packard)',
      city: 'Spring, TX',
      lon: -95.38, lat: 30.08,
      fleet: 'declared_bot',
      class: 'partial',
      color: '#f0883e',
      requests: 34827,
      ips: 0,
      desc: 'Declared bot, VPS cloud'
    },
    'aws_ashburn': {
      label: 'AWS / Datacenter',
      city: 'Ashburn, VA',
      lon: -77.49, lat: 39.04,
      fleet: 'stealth_scraper',
      class: 'non-self',
      color: '#f0883e',
      requests: 3327,
      ips: 0,
      desc: 'Datacenter cluster, stealth'
    },
    'google_mv': {
      label: 'Google',
      city: 'Mountain View, CA',
      lon: -122.08, lat: 37.39,
      fleet: 'search_engines',
      class: 'sovereign',
      color: '#58a6ff',
      requests: 244,
      ips: 35,
      desc: 'Search crawler, honest'
    },
    'meta_menlo': {
      label: 'Meta HQ',
      city: 'Menlo Park, CA',
      lon: -122.18, lat: 37.45,
      fleet: 'meta_fleet',
      class: 'non-self',
      color: '#e85d3a',
      requests: 91,
      ips: 0,
      desc: 'HQ probe'
    },
    'bytedance': {
      label: 'ByteDance / TikTok',
      city: 'Beijing',
      lon: 116.4, lat: 39.9,
      fleet: 'bytedance',
      class: 'non-self',
      color: '#e85d3a',
      requests: 15,
      ips: 1,
      desc: 'Single probe'
    },
    'bing_redmond': {
      label: 'Bing / Microsoft',
      city: 'Redmond, WA',
      lon: -122.12, lat: 47.67,
      fleet: 'search_engines',
      class: 'sovereign',
      color: '#58a6ff',
      requests: 227,
      ips: 108,
      desc: 'Search crawler'
    },
    'apple': {
      label: 'Apple',
      city: 'Cupertino, CA',
      lon: -122.03, lat: 37.32,
      fleet: 'search_engines',
      class: 'sovereign',
      color: '#58a6ff',
      requests: 462,
      ips: 172,
      desc: 'Applebot'
    },
    'huawei': {
      label: 'Huawei',
      city: 'Shenzhen',
      lon: 114.06, lat: 22.54,
      fleet: 'search_engines',
      class: 'partial',
      color: '#f0883e',
      requests: 219,
      ips: 8,
      desc: 'PetalBot'
    },
    'facebook_crawl': {
      label: 'Facebook Crawler',
      city: 'Prineville, OR',
      lon: -120.73, lat: 44.3,
      fleet: 'search_engines',
      class: 'partial',
      color: '#f0883e',
      requests: 1364,
      ips: 846,
      desc: '846 IPs'
    },
    'shanghai': {
      label: 'Shanghai Node',
      city: 'Shanghai',
      lon: 121.47, lat: 31.23,
      fleet: 'unknown',
      class: 'null',
      color: '#6e7681',
      requests: 156,
      ips: 0,
      desc: 'Unknown scanner'
    },
    'minsk': {
      label: 'Minsk Node',
      city: 'Minsk',
      lon: 27.56, lat: 53.9,
      fleet: 'unknown',
      class: 'null',
      color: '#6e7681',
      requests: 6,
      ips: 0,
      desc: 'Minimal probe'
    }
  };

  // ═══ THE MEMBRANE — your house ═══
  var HOME = {
    label: 'membrane',
    city: 'Michigan',
    lon: -83, lat: 43,
    class: 'self',
    color: '#3fb950',
    desc: 'Sovereign. Home. One human.'
  };

  // ═══ GHOST CLOUD ═══
  // 181K IPs, 112K subnets — distributed across VPS worldwide
  var GHOST_CLOUD = {
    label: 'Ghost Cloud',
    requests: 208159,
    ips: 181519,
    subnets: 112096,
    class: 'ghost',
    color: '#d2a8ff',
    desc: '181K IPs · 112K subnets · massive VPS/proxy cloud',
    nodes: [
      { lon: -74, lat: 40.7, label: 'NYC', weight: 0.15 },
      { lon: -118.2, lat: 34, label: 'LA', weight: 0.08 },
      { lon: -87.6, lat: 41.9, label: 'CHI', weight: 0.06 },
      { lon: -122.4, lat: 37.8, label: 'SFO', weight: 0.12 },
      { lon: -0.12, lat: 51.5, label: 'LON', weight: 0.1 },
      { lon: 2.35, lat: 48.86, label: 'PAR', weight: 0.04 },
      { lon: 13.4, lat: 52.52, label: 'BER', weight: 0.05 },
      { lon: 139.7, lat: 35.68, label: 'TKY', weight: 0.04 },
      { lon: 103.85, lat: 1.35, label: 'SGP', weight: 0.06 },
      { lon: 151.2, lat: -33.87, label: 'SYD', weight: 0.03 },
      { lon: -46.63, lat: -23.55, label: 'SAO', weight: 0.03 },
      { lon: 77.1, lat: 28.6, label: 'DEL', weight: 0.02 },
      { lon: -95.37, lat: 29.76, label: 'HOU', weight: 0.04 },
      { lon: -77.04, lat: 38.9, label: 'DCA', weight: 0.08 },
      { lon: 55.27, lat: 25.2, label: 'DXB', weight: 0.02 },
      { lon: -73.94, lat: 45.5, label: 'MTL', weight: 0.03 },
      { lon: -97.74, lat: 30.27, label: 'AUS', weight: 0.02 },
      { lon: 4.9, lat: 52.37, label: 'AMS', weight: 0.05 },
    ]
  };

  var W = 700, H = 400;
  function proj(lon, lat) {
    return [30 + (lon + 180) / 360 * (W - 60), 20 + (90 - lat) / 180 * (H - 40)];
  }

  // ═══ LOAD DATA ═══
  function loadFleet() {
    return fetch('/detroit-data/fleet.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { _fleetData = d; return d; })
      .catch(function() { return null; });
  }

  function loadScan() {
    var cs = window._cosmicSurfaces;
    var existing = cs && typeof cs.scanData === 'function' ? cs.scanData() : null;
    if (existing) { _scanData = existing; return Promise.resolve(existing); }
    return fetch('/detroit-data/scan_sweep_sort.json', { cache: 'no-store' })
      .then(function(r) { return r.json(); })
      .then(function(d) { _scanData = d; return d; })
      .catch(function() { return null; });
  }

  // ═══ BUILD ATLAS ON IONOSPHERE ═══
  function buildAtlas() {
    var iono = window.PtIonosphere ? window.PtIonosphere : null;
    var svg = document.querySelector('#ionosphere-svg svg');
    if (!svg) return false;

    if (_atlasGroup) {
      _atlasGroup.parentNode.removeChild(_atlasGroup);
    }

    _atlasGroup = el('g', { id: 'fleet-atlas' }, svg);

    // ── HOME BEACON (enhanced) ──
    var hp = proj(HOME.lon, HOME.lat);
    var homeG = el('g', { id: 'atlas-home', 'class': 'atlas-node' }, _atlasGroup);

    // Pulsing ring
    var homeRing = el('circle', { cx: hp[0], cy: hp[1], r: 18, fill: 'none', stroke: '#3fb950', 'stroke-width': 1, opacity: 0.2 }, homeG);
    el('animate', { attributeName: 'r', values: '10;22;10', dur: '4s', repeatCount: 'indefinite' }, homeRing);
    el('animate', { attributeName: 'opacity', values: '0.3;0.08;0.3', dur: '4s', repeatCount: 'indefinite' }, homeRing);

    // Inner glow
    el('circle', { cx: hp[0], cy: hp[1], r: 5, fill: '#3fb950', opacity: 0.8, filter: 'url(#iono-glow)' }, homeG);

    // House icon (small diamond)
    el('polygon', {
      points: [hp[0], hp[1] - 6, hp[0] + 4, hp[1], hp[0], hp[1] + 4, hp[0] - 4, hp[1]].join(','),
      fill: '#3fb950', opacity: 0.6
    }, homeG);

    txt(homeG, hp[0], hp[1] - 12, '🏠 membrane', '#3fb950', 7, { 'font-weight': 'bold' });
    txt(homeG, hp[0], hp[1] + 14, 'Michigan · sovereign · home', '#5ab87a', 5.5);

    // ── DATA CENTERS ──
    var dcKeys = Object.keys(DATA_CENTERS);
    var maxReq = 0;
    dcKeys.forEach(function(k) { if (DATA_CENTERS[k].requests > maxReq) maxReq = DATA_CENTERS[k].requests; });

    dcKeys.forEach(function(k) {
      var dc = DATA_CENTERS[k];
      var p = proj(dc.lon, dc.lat);
      var pct = maxReq > 0 ? dc.requests / maxReq : 0;
      var r = Math.max(2, Math.min(12, Math.sqrt(pct) * 12));

      var dcG = el('g', { 'class': 'atlas-node atlas-dc', 'data-dc': k }, _atlasGroup);

      // Arc from home to data center
      var mx = (hp[0] + p[0]) / 2;
      var my = Math.min(hp[1], p[1]) - 15 - pct * 60;
      var arcWidth = Math.max(0.3, pct * 4);
      var arcOpacity = Math.max(0.06, pct * 0.3);

      el('path', {
        d: 'M ' + hp[0] + ' ' + hp[1] + ' Q ' + mx + ' ' + my + ' ' + p[0] + ' ' + p[1],
        fill: 'none',
        stroke: dc.color,
        'stroke-width': arcWidth.toFixed(1),
        'stroke-opacity': arcOpacity.toFixed(2),
        'stroke-dasharray': dc.class === 'non-self' ? '4,3' : dc.class === 'sovereign' ? 'none' : '2,6',
        'class': 'atlas-arc'
      }, dcG);

      // Glow arc for big ones
      if (pct > 0.1) {
        el('path', {
          d: 'M ' + hp[0] + ' ' + hp[1] + ' Q ' + mx + ' ' + (my - 8) + ' ' + p[0] + ' ' + p[1],
          fill: 'none', stroke: dc.color,
          'stroke-width': (arcWidth * 2).toFixed(1),
          'stroke-opacity': 0.04,
          filter: 'url(#iono-soft)'
        }, dcG);
      }

      // Node dot — flavor-colored by sort class
      var strangeness = fl ? (fl.SORT_STRANGENESS[dc.class] || 0.5) : 0.5;
      var nodeColor = fl ? fl.flavorHex(strangeness) : dc.color;

      el('circle', {
        cx: p[0], cy: p[1], r: r.toFixed(1),
        fill: nodeColor,
        opacity: Math.max(0.3, 0.3 + pct * 0.5).toFixed(2),
        filter: pct > 0.1 ? 'url(#iono-glow)' : '',
        'class': 'atlas-dot',
        style: 'cursor:pointer'
      }, dcG);

      // Sort class indicator ring
      var ringColor = dc.class === 'non-self' ? '#a371f7' :
                      dc.class === 'sovereign' ? '#3fb950' :
                      dc.class === 'partial' ? '#f0883e' :
                      dc.class === 'ghost' ? '#d2a8ff' : '#6e7681';
      if (r > 3) {
        el('circle', {
          cx: p[0], cy: p[1], r: (r + 2).toFixed(1),
          fill: 'none', stroke: ringColor,
          'stroke-width': 0.5, opacity: 0.4,
          'stroke-dasharray': '2,2'
        }, dcG);
      }

      // Label
      var labelY = p[1] + r + 8;
      var labelSize = pct > 0.1 ? 6.5 : 5.5;
      txt(dcG, p[0], labelY, dc.label, dc.color, labelSize);

      if (pct > 0.05) {
        var reqStr = dc.requests >= 1000000 ? (dc.requests / 1000000).toFixed(1) + 'M' :
                     dc.requests >= 1000 ? (dc.requests / 1000).toFixed(0) + 'K' :
                     dc.requests.toString();
        txt(dcG, p[0], labelY + 8, reqStr + ' reqs', '#484f58', 5);
      }

      // Sort class tag
      if (pct > 0.02) {
        txt(dcG, p[0], labelY + 15, dc.class, ringColor, 4.5, { 'font-style': 'italic' });
      }

      // Hover interaction
      dcG.addEventListener('mouseenter', function() {
        showTooltip(p[0], p[1] - r - 12, dc);
      });
      dcG.addEventListener('mouseleave', hideTooltip);
    });

    // ── GHOST CLOUD ──
    var ghostG = el('g', { id: 'atlas-ghost-cloud' }, _atlasGroup);

    GHOST_CLOUD.nodes.forEach(function(node) {
      var p = proj(node.lon, node.lat);
      var r = 2 + node.weight * 20;

      // Fuzzy ghost circle
      el('circle', {
        cx: p[0], cy: p[1], r: r.toFixed(1),
        fill: '#d2a8ff', opacity: (0.04 + node.weight * 0.08).toFixed(2),
        filter: 'url(#iono-soft)'
      }, ghostG);

      el('circle', {
        cx: p[0], cy: p[1], r: (r * 0.3).toFixed(1),
        fill: '#d2a8ff', opacity: (0.15 + node.weight * 0.2).toFixed(2)
      }, ghostG);

      if (node.weight > 0.06) {
        txt(ghostG, p[0], p[1] + r + 5, node.label, '#d2a8ff', 4.5, { opacity: 0.4 });
      }
    });

    // Ghost cloud label
    txt(ghostG, W / 2, H - 34, '👻 ghost cloud — ' + GHOST_CLOUD.ips.toLocaleString() + ' IPs · ' +
      GHOST_CLOUD.subnets.toLocaleString() + ' subnets · worldwide VPS/proxy',
      '#d2a8ff', 6, { opacity: 0.5 });

    // ── STATS BAR ──
    var totalFleetReqs = 0;
    dcKeys.forEach(function(k) { totalFleetReqs += DATA_CENTERS[k].requests; });
    var statsText = dcKeys.length + ' data centers traced · ' +
      (totalFleetReqs / 1000000).toFixed(1) + 'M fleet requests · ' +
      GHOST_CLOUD.ips.toLocaleString() + ' ghost IPs';
    txt(_atlasGroup, W / 2, H - 8, statsText, '#484f58', 5.5);

    _atlasBuilt = true;
    return true;
  }

  // ═══ TOOLTIP ═══
  function showTooltip(x, y, dc) {
    hideTooltip();
    var svg = document.querySelector('#ionosphere-svg svg');
    if (!svg) return;

    _tooltip = el('g', { id: 'atlas-tooltip' }, svg);

    var lines = [
      dc.label + ' — ' + dc.city,
      dc.requests.toLocaleString() + ' requests · ' + dc.ips + ' IPs',
      'class: ' + dc.class,
      dc.desc
    ];

    var tw = 140, th = lines.length * 11 + 8;
    var tx = Math.max(5, Math.min(W - tw - 5, x - tw / 2));
    var ty = Math.max(5, y - th - 5);

    el('rect', {
      x: tx, y: ty, width: tw, height: th,
      fill: '#0d1117', stroke: dc.color, 'stroke-width': 0.5,
      rx: 4, opacity: 0.95
    }, _tooltip);

    lines.forEach(function(line, i) {
      var color = i === 0 ? dc.color : i === 2 ? (
        dc.class === 'non-self' ? '#a371f7' :
        dc.class === 'sovereign' ? '#3fb950' : '#f0883e'
      ) : '#8b949e';
      txt(_tooltip, tx + tw / 2, ty + 12 + i * 11, line, color, 5.5);
    });
  }

  function hideTooltip() {
    if (_tooltip && _tooltip.parentNode) {
      _tooltip.parentNode.removeChild(_tooltip);
    }
    _tooltip = null;
  }

  // ═══ ATLAS TEXT VIEW ═══
  function atlasView() {
    if (fl) fl.updateFromFeeds();
    var lines = [];

    lines.push('<span style="color:#4a8fb8">🌐 FLEET ATLAS — every data center, every IP, backtraced</span>');
    lines.push('');

    // Home
    lines.push('<span style="color:#3fb950">🏠 MEMBRANE — Michigan · sovereign · home</span>');
    lines.push('<span style="color:#5ab87a">   the observer. one human. the defense is the record.</span>');
    lines.push('');

    // Data centers sorted by requests
    var dcKeys = Object.keys(DATA_CENTERS);
    dcKeys.sort(function(a, b) { return DATA_CENTERS[b].requests - DATA_CENTERS[a].requests; });

    lines.push('<span style="color:#e85d3a">DATA CENTERS — fleet infrastructure</span>');
    dcKeys.forEach(function(k) {
      var dc = DATA_CENTERS[k];
      var reqStr = dc.requests >= 1000000 ? (dc.requests / 1000000).toFixed(1) + 'M' :
                   dc.requests >= 1000 ? Math.round(dc.requests / 1000) + 'K' :
                   dc.requests.toString();

      var classColor = dc.class === 'non-self' ? '#a371f7' :
                       dc.class === 'sovereign' ? '#3fb950' :
                       dc.class === 'partial' ? '#f0883e' :
                       dc.class === 'ghost' ? '#d2a8ff' : '#6e7681';
      var strangeness = fl ? (fl.SORT_STRANGENESS[dc.class] || 0.5) : 0.5;
      var pip = fl ? '<span style="color:' + fl.flavorHex(strangeness) + '">●</span>' : '•';

      lines.push('  ' + pip + ' <span style="color:' + dc.color + '">' + dc.label + '</span>' +
        ' — <span style="color:#8b949e">' + dc.city + '</span>' +
        ' — <span class="num">' + reqStr + '</span> reqs' +
        (dc.ips ? ' · ' + dc.ips + ' IPs' : '') +
        ' <span style="color:' + classColor + '">[' + dc.class + ']</span>');
    });
    lines.push('');

    // Ghost cloud
    lines.push('<span style="color:#d2a8ff">👻 GHOST CLOUD — massive VPS/proxy worldwide</span>');
    lines.push('  <span style="color:#d2a8ff">' +
      GHOST_CLOUD.ips.toLocaleString() + ' IPs · ' +
      GHOST_CLOUD.subnets.toLocaleString() + ' subnets · ' +
      GHOST_CLOUD.requests.toLocaleString() + ' requests</span>');
    lines.push('  <span class="dim">distributed across ' + GHOST_CLOUD.nodes.length + ' known VPS regions:</span>');
    var ghostNodes = GHOST_CLOUD.nodes.slice().sort(function(a, b) { return b.weight - a.weight; });
    var ghostLine = '  ';
    ghostNodes.forEach(function(n, i) {
      ghostLine += '<span style="color:#d2a8ff">' + n.label + '</span>';
      ghostLine += '<span class="dim">(' + (n.weight * 100).toFixed(0) + '%)</span>';
      if (i < ghostNodes.length - 1) ghostLine += ' · ';
      if ((i + 1) % 6 === 0 && i < ghostNodes.length - 1) {
        lines.push(ghostLine);
        ghostLine = '  ';
      }
    });
    if (ghostLine.trim()) lines.push(ghostLine);
    lines.push('');

    // Summary
    var totalFleet = 0, totalIPs = 0;
    dcKeys.forEach(function(k) {
      totalFleet += DATA_CENTERS[k].requests;
      totalIPs += DATA_CENTERS[k].ips;
    });
    totalFleet += GHOST_CLOUD.requests;
    totalIPs += GHOST_CLOUD.ips;

    lines.push('<span style="color:#f0e68c">SUMMARY</span>');
    lines.push('  <span class="num">' + dcKeys.length + '</span> data centers identified');
    lines.push('  <span class="num">' + (totalFleet / 1000000).toFixed(1) + 'M</span> fleet requests traced');
    lines.push('  <span class="num">' + totalIPs.toLocaleString() + '</span> unique IPs backtraced');
    lines.push('  <span class="num">' + GHOST_CLOUD.nodes.length + '</span> ghost cloud regions');
    lines.push('  ratio: <span style="color:#e85d3a">8:1</span> fleet to human');
    lines.push('  <span style="color:#3fb950">961</span> genuine humans vs <span style="color:#e85d3a">' + totalIPs.toLocaleString() + '</span> fleet entities');

    // Membrane strangeness
    if (fl) {
      var fs = fl.feedStrangeness();
      var memS = fs.membrane || 0.5;
      lines.push('');
      lines.push('  <span style="color:' + fl.flavorHex(memS) + '">membrane strangeness: ' + (memS * 100).toFixed(1) + '%</span>');
    }

    lines.push('');
    lines.push('<span class="dim">the ionosphere shows the view from above.');
    lines.push('scroll down on the HUD dashboard to see it.</span>');

    return lines.join('\n');
  }

  // ═══ BACKTRACE VIEW ═══
  function backtraceView(query) {
    var lines = [];
    var q = (query || '').toLowerCase().trim();

    if (!q) {
      lines.push('<span style="color:#4a8fb8">🔍 BACKTRACE — trace an IP or fleet entity</span>');
      lines.push('<span class="dim">usage: /backtrace [city|company|class]</span>');
      lines.push('');
      lines.push('<span style="color:#8b949e">known targets:</span>');

      var dcKeys = Object.keys(DATA_CENTERS);
      dcKeys.forEach(function(k) {
        var dc = DATA_CENTERS[k];
        lines.push('  <span style="color:' + dc.color + '">' + dc.label + '</span> — ' + dc.city);
      });
      lines.push('  <span style="color:#d2a8ff">ghost</span> — 181K IPs worldwide');
      return lines.join('\n');
    }

    // Search
    var found = [];
    var dcKeys = Object.keys(DATA_CENTERS);
    dcKeys.forEach(function(k) {
      var dc = DATA_CENTERS[k];
      if (dc.label.toLowerCase().indexOf(q) >= 0 ||
          dc.city.toLowerCase().indexOf(q) >= 0 ||
          dc.class.indexOf(q) >= 0 ||
          (dc.fleet && dc.fleet.indexOf(q) >= 0)) {
        found.push(dc);
      }
    });

    if (q === 'ghost' || q === 'proxy' || q === 'vpn' || q === 'vps') {
      lines.push('<span style="color:#d2a8ff">👻 BACKTRACE: Ghost Cloud</span>');
      lines.push('');
      lines.push('  <span style="color:#d2a8ff">' + GHOST_CLOUD.ips.toLocaleString() + '</span> unique IPs');
      lines.push('  <span style="color:#d2a8ff">' + GHOST_CLOUD.subnets.toLocaleString() + '</span> subnets');
      lines.push('  <span style="color:#d2a8ff">' + GHOST_CLOUD.requests.toLocaleString() + '</span> requests');
      lines.push('  class: <span style="color:#d2a8ff">ghost</span>');
      lines.push('');
      lines.push('  <span style="color:#8b949e">distribution:</span>');
      GHOST_CLOUD.nodes.sort(function(a, b) { return b.weight - a.weight; });
      GHOST_CLOUD.nodes.forEach(function(n) {
        var bar = '';
        var barLen = Math.round(n.weight * 40);
        for (var i = 0; i < barLen; i++) bar += '█';
        lines.push('  <span style="color:#d2a8ff">' + n.label + '</span> ' +
          '<span class="dim">' + bar + '</span> ' +
          (n.weight * 100).toFixed(0) + '%');
      });
      lines.push('');
      lines.push('  <span class="dim">these are VPS exit nodes and proxy endpoints.');
      lines.push('  75.7% single-use IPs — residential + mobile + VPN.</span>');
      return lines.join('\n');
    }

    if (found.length === 0) {
      lines.push('<span style="color:#f0883e">no matches for "' + q + '"</span>');
      return lines.join('\n');
    }

    found.forEach(function(dc) {
      var classColor = dc.class === 'non-self' ? '#a371f7' :
                       dc.class === 'sovereign' ? '#3fb950' :
                       dc.class === 'partial' ? '#f0883e' : '#6e7681';
      lines.push('<span style="color:' + dc.color + '">🔍 BACKTRACE: ' + dc.label + '</span>');
      lines.push('');
      lines.push('  city: <span style="color:#58a6ff">' + dc.city + '</span>');
      lines.push('  coords: <span class="dim">' + dc.lon.toFixed(2) + '°, ' + dc.lat.toFixed(2) + '°</span>');
      lines.push('  requests: <span class="num">' + dc.requests.toLocaleString() + '</span>');
      lines.push('  IPs: <span class="num">' + dc.ips + '</span>');
      lines.push('  class: <span style="color:' + classColor + '">' + dc.class + '</span>');
      lines.push('  behavior: <span style="color:#8b949e">' + dc.desc + '</span>');
      lines.push('  fleet ID: <span class="dim">' + (dc.fleet || 'unknown') + '</span>');

      // Distance from home
      var dx = dc.lon - HOME.lon, dy = dc.lat - HOME.lat;
      var distKm = Math.round(Math.sqrt(dx * dx + dy * dy) * 111);
      lines.push('  distance from membrane: <span class="num">~' + distKm.toLocaleString() + ' km</span>');

      if (fl) {
        var s = fl.SORT_STRANGENESS[dc.class] || 0.5;
        lines.push('  strangeness: <span style="color:' + fl.flavorHex(s) + '">' + (s * 100).toFixed(0) + '%</span>');
      }
      lines.push('');
    });

    return lines.join('\n');
  }

  // ═══ INIT ═══
  function init() {
    loadFleet().then(function() {
      loadScan().then(function() {
        setTimeout(buildAtlas, 2000);
      });
    });
  }

  // Try to build atlas when ionosphere is ready
  var _initTimer = setInterval(function() {
    var svg = document.querySelector('#ionosphere-svg svg');
    if (svg && !_atlasBuilt) {
      loadFleet().then(function() { buildAtlas(); });
      clearInterval(_initTimer);
    }
  }, 3000);

  // ═══ EXPORT ═══
  window._fleetAtlas = {
    buildAtlas: buildAtlas,
    atlasView: atlasView,
    backtraceView: backtraceView,
    loadFleet: loadFleet,
    DATA_CENTERS: DATA_CENTERS,
    GHOST_CLOUD: GHOST_CLOUD,
    HOME: HOME,
    isBuilt: function() { return _atlasBuilt; },
  };
})();
