// signal-reach.js — geographic awareness layer
// Maps the world. Extends the membrane's awareness farther.
// Tracks which surfaces are reachable from which networks.
// Visualizes signal routing: origin → CDN/relay → tower → device.
//
// Three signal paths:
//   Direct:    device → golgi (blocked on some cellular)
//   Relay:     device → layer2/relay → golgi (alternate route)
//   Bounce:    device → CDN edge → golgi (GPS-like, always available)
//
(function() {
  'use strict';

  var _active = false;
  var _overlay = null;
  var _probeResults = {};
  var _networkInfo = {};
  var _reachHistory = [];

  // ═══ KNOWN SIGNAL ORIGINS ═══
  // Geographic positions of known entities (approx center, not precise)
  var GEO_NODES = {
    golgi:     { lat: 42.7, lon: -83.5, label: 'golgi (origin)',   type: 'origin',  color: '#5ab87a' },
    michigan:  { lat: 42.7, lon: -83.5, label: 'Michigan (self)',   type: 'self',    color: '#3fb950' },
    anthropic: { lat: 37.8, lon: -122.4,label: 'Anthropic (SF)',    type: 'fleet',   color: '#d2a8ff' },
    meta:      { lat: 53.3, lon: -6.3,  label: 'Meta (Dublin)',     type: 'fleet',   color: '#e85d3a' },
    hpe:       { lat: 30.1, lon: -95.4, label: 'HPE (Spring TX)',   type: 'fleet',   color: '#f0e68c' },
    ashburn:   { lat: 39.0, lon: -77.5, label: 'Ashburn VA',       type: 'fleet',   color: '#8b949e' },
    google:    { lat: 37.4, lon: -122.1,label: 'Google (MV)',       type: 'search',  color: '#58a6ff' },
    bing:      { lat: 47.6, lon: -122.3,label: 'Bing (Redmond)',    type: 'search',  color: '#58a6ff' },
    apple:     { lat: 37.3, lon: -122.0,label: 'Apple (Cupertino)', type: 'search',  color: '#c9d1d9' },
    huawei:    { lat: 31.2, lon: 121.5, label: 'Huawei (Shanghai)', type: 'search',  color: '#e85d3a' },
    bytedance: { lat: 55.9, lon: 27.6,  label: 'ByteDance (Minsk)', type: 'stealth', color: '#f0e68c' },
    // CDN edges (conceptual)
    cdn_west:  { lat: 34.1, lon: -118.2,label: 'CDN West (LA)',     type: 'cdn',     color: '#79c0ff' },
    cdn_east:  { lat: 40.7, lon: -74.0, label: 'CDN East (NYC)',    type: 'cdn',     color: '#79c0ff' },
    cdn_eu:    { lat: 51.5, lon: -0.1,  label: 'CDN EU (London)',   type: 'cdn',     color: '#79c0ff' },
    cdn_asia:  { lat: 35.7, lon: 139.8, label: 'CDN Asia (Tokyo)',  type: 'cdn',     color: '#79c0ff' },
  };

  // ═══ SIGNAL ROUTES ═══
  var ROUTES = {
    direct:  { name: 'direct',  hops: ['device', 'golgi'],                     color: '#5ab87a', risk: 'blockable' },
    relay:   { name: 'relay',   hops: ['device', 'layer2', 'golgi'],            color: '#f0e68c', risk: 'alternate' },
    bounce:  { name: 'bounce',  hops: ['device', 'cdn_edge', 'golgi'],          color: '#58a6ff', risk: 'resilient' },
    mesh:    { name: 'mesh',    hops: ['device', 'peer', 'layer2', 'golgi'],    color: '#d2a8ff', risk: 'p2p' },
  };

  // ═══ SURFACES & REACHABILITY ═══
  var SURFACES = [
    { name: 'hud',        host: 'hud.primals.eco',        cat: 'MEMBRANE' },
    { name: 'tuebor',     host: 'tuebor.primals.eco',     cat: 'IMMUNE' },
    { name: 'clutch',     host: 'clutch.primals.eco',     cat: 'INVESTIGATION' },
    { name: 'detroit',    host: 'detroit.primals.eco',     cat: 'INVESTIGATION' },
    { name: 'sporeprint', host: 'sporeprint.primals.eco', cat: 'SCIENCE' },
    { name: 'gorilla',    host: 'gorilla.primals.eco',    cat: 'IMMUNE' },
    { name: 'hypothesis', host: 'hypothesis.primals.eco', cat: 'SCIENCE' },
    { name: 'barry',      host: 'barry.primals.eco',      cat: 'INVESTIGATION' },
    { name: 'signal',     host: 'signal.primals.eco',     cat: 'SIGNAL' },
    { name: 'git',        host: 'git.primals.eco',        cat: 'TOPOLOGY' },
    { name: 'relay',      host: 'relay.primals.eco',      cat: 'SIGNAL' },
    { name: 'layer2',     host: 'layer2.primals.eco',     cat: 'TOPOLOGY' },
  ];

  // ═══ MAP PROJECTION — equirectangular ═══
  function geoToXY(lat, lon, width, height) {
    var x = ((lon + 180) / 360) * width;
    var y = ((90 - lat) / 180) * height;
    return { x: x, y: y };
  }

  // ═══ BUILD MAP OVERLAY ═══
  function activate() {
    if (_overlay) return;
    _active = true;

    _overlay = document.createElement('div');
    _overlay.id = 'signal-reach-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:3;' +
      'pointer-events:none;overflow:hidden;';

    // Dark transparent background
    var bg = document.createElement('div');
    bg.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(13,17,23,0.85);';
    _overlay.appendChild(bg);

    // Title
    var title = document.createElement('div');
    title.style.cssText =
      'position:absolute;top:12px;left:0;width:100%;text-align:center;' +
      'font-family:"Courier New",monospace;font-size:11px;letter-spacing:3px;' +
      'color:#5ab87a;opacity:0.6;';
    title.textContent = 'SIGNAL REACH · MEMBRANE AWARENESS';
    _overlay.appendChild(title);

    // Map container
    var mapW = Math.min(window.innerWidth - 40, 800);
    var mapH = mapW * 0.5;
    var mapX = (window.innerWidth - mapW) / 2;
    var mapY = 40;

    var mapEl = document.createElement('div');
    mapEl.style.cssText =
      'position:absolute;left:' + mapX + 'px;top:' + mapY + 'px;' +
      'width:' + mapW + 'px;height:' + mapH + 'px;' +
      'border:1px solid rgba(90,184,122,0.15);border-radius:4px;overflow:hidden;';

    // Simplified world outline — latitude/longitude grid
    var grid = document.createElement('canvas');
    grid.width = mapW;
    grid.height = mapH;
    var ctx = grid.getContext('2d');
    ctx.strokeStyle = 'rgba(88,166,255,0.06)';
    ctx.lineWidth = 0.5;

    // Latitude lines every 30°
    for (var lat = -60; lat <= 60; lat += 30) {
      var y = ((90 - lat) / 180) * mapH;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mapW, y); ctx.stroke();
    }
    // Longitude lines every 30°
    for (var lon = -150; lon <= 180; lon += 30) {
      var x = ((lon + 180) / 360) * mapW;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mapH); ctx.stroke();
    }

    // Equator brighter
    ctx.strokeStyle = 'rgba(90,184,122,0.1)';
    var eqY = mapH / 2;
    ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(mapW, eqY); ctx.stroke();

    mapEl.appendChild(grid);

    // Plot all known nodes
    Object.keys(GEO_NODES).forEach(function(key) {
      var node = GEO_NODES[key];
      var pos = geoToXY(node.lat, node.lon, mapW, mapH);

      // Dot
      var dot = document.createElement('div');
      var size = node.type === 'origin' ? 8 : node.type === 'cdn' ? 5 : 4;
      dot.style.cssText =
        'position:absolute;width:' + size + 'px;height:' + size + 'px;' +
        'border-radius:50%;background:' + node.color + ';' +
        'left:' + (pos.x - size/2) + 'px;top:' + (pos.y - size/2) + 'px;' +
        'opacity:0.7;';
      if (node.type === 'origin') {
        dot.style.boxShadow = '0 0 12px ' + node.color;
        dot.style.opacity = '1';
      }
      mapEl.appendChild(dot);

      // Label
      var label = document.createElement('div');
      label.style.cssText =
        'position:absolute;font-family:"Courier New",monospace;font-size:6px;' +
        'color:' + node.color + ';opacity:0.4;white-space:nowrap;' +
        'left:' + (pos.x + size) + 'px;top:' + (pos.y - 3) + 'px;';
      label.textContent = node.label;
      mapEl.appendChild(label);

      // Draw arcs from fleet/search to golgi
      if (node.type !== 'origin' && node.type !== 'cdn') {
        var golgiPos = geoToXY(GEO_NODES.golgi.lat, GEO_NODES.golgi.lon, mapW, mapH);
        drawArc(mapEl, pos, golgiPos, node.color, node.type === 'fleet' ? 0.15 : 0.08);
      }
    });

    _overlay.appendChild(mapEl);

    // ═══ REACHABILITY PANEL ═══
    var panelY = mapY + mapH + 12;
    var panel = document.createElement('div');
    panel.id = 'reach-panel';
    panel.style.cssText =
      'position:absolute;left:' + mapX + 'px;top:' + panelY + 'px;' +
      'width:' + mapW + 'px;';

    // Network status
    var netLine = document.createElement('div');
    netLine.id = 'reach-net';
    netLine.style.cssText =
      'font-family:"Courier New",monospace;font-size:9px;color:#8b949e;' +
      'margin-bottom:6px;';
    netLine.textContent = 'network: detecting...';
    panel.appendChild(netLine);

    // Route legend
    var legend = document.createElement('div');
    legend.style.cssText =
      'display:flex;gap:12px;margin-bottom:8px;';
    Object.keys(ROUTES).forEach(function(key) {
      var r = ROUTES[key];
      var item = document.createElement('span');
      item.style.cssText =
        'font-family:"Courier New",monospace;font-size:8px;color:' + r.color + ';opacity:0.5;';
      item.textContent = '● ' + r.name + ' (' + r.risk + ')';
      legend.appendChild(item);
    });
    panel.appendChild(legend);

    // Surface reachability grid
    var surfGrid = document.createElement('div');
    surfGrid.id = 'reach-grid';
    surfGrid.style.cssText =
      'display:grid;grid-template-columns:repeat(4,1fr);gap:4px;';

    SURFACES.forEach(function(s) {
      var cell = document.createElement('div');
      cell.id = 'reach-' + s.name;
      cell.style.cssText =
        'font-family:"Courier New",monospace;font-size:8px;padding:4px;' +
        'border-left:2px solid rgba(88,166,255,0.2);';

      var name = document.createElement('div');
      name.style.cssText = 'color:#c9d1d9;font-weight:600;';
      name.textContent = s.name;
      cell.appendChild(name);

      var status = document.createElement('div');
      status.className = 'reach-status';
      status.style.cssText = 'color:#8b949e;font-size:7px;';
      status.textContent = 'probing...';
      cell.appendChild(status);

      surfGrid.appendChild(cell);
    });
    panel.appendChild(surfGrid);

    _overlay.appendChild(panel);
    document.body.appendChild(_overlay);

    // Register service worker
    registerSW();

    // Start connectivity probes
    startProbing();

    // Listen for probe results from service worker
    navigator.serviceWorker && navigator.serviceWorker.addEventListener('message', function(e) {
      if (e.data.type === 'membrane-probe') {
        updateReachability(e.data);
      }
    });
  }

  function drawArc(container, from, to, color, opacity) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    svg.setAttribute('viewBox', '0 0 ' + container.offsetWidth + ' ' + container.offsetHeight);

    var midX = (from.x + to.x) / 2;
    var midY = Math.min(from.y, to.y) - 20; // arc above
    var d = 'M ' + from.x + ' ' + from.y + ' Q ' + midX + ' ' + midY + ' ' + to.x + ' ' + to.y;

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '0.5');
    path.setAttribute('opacity', String(opacity || 0.15));
    path.setAttribute('stroke-dasharray', '2,3');

    svg.appendChild(path);
    container.appendChild(svg);
  }

  // ═══ SERVICE WORKER REGISTRATION ═══
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/js/membrane-sw.js', { scope: '/' })
      .then(function(reg) {
        console.log('membrane-sw registered:', reg.scope);
        // Tell SW to start probing
        if (reg.active) reg.active.postMessage('start-probe');
        reg.addEventListener('updatefound', function() {
          var worker = reg.installing;
          worker.addEventListener('statechange', function() {
            if (worker.state === 'activated') {
              worker.postMessage('start-probe');
            }
          });
        });
      })
      .catch(function(err) {
        console.warn('membrane-sw failed:', err);
      });
  }

  // ═══ DIRECT PROBING (from page context) ═══
  var _probeTimer = null;

  function startProbing() {
    probe();
    _probeTimer = setInterval(probe, 30000);
  }

  function probe() {
    // Detect network type
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    _networkInfo = {
      type: conn.type || 'unknown',
      effectiveType: conn.effectiveType || '?',
      downlink: conn.downlink || 0,
      rtt: conn.rtt || 0,
      saveData: conn.saveData || false,
    };

    var netEl = document.getElementById('reach-net');
    if (netEl) {
      var netColor = _networkInfo.type === 'wifi' ? '#5ab87a' :
                     _networkInfo.type === 'cellular' ? '#e85d3a' : '#8b949e';
      netEl.innerHTML =
        '<span style="color:' + netColor + '">● ' + _networkInfo.type + '</span> ' +
        _networkInfo.effectiveType + ' · ' +
        (_networkInfo.downlink > 0 ? _networkInfo.downlink + 'Mbps · ' : '') +
        (_networkInfo.rtt > 0 ? _networkInfo.rtt + 'ms RTT' : '');
    }

    // Probe each surface
    SURFACES.forEach(function(s) {
      var url = 'https://' + s.host + '/';
      var start = Date.now();
      fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
        .then(function() {
          var latency = Date.now() - start;
          updateSurfaceStatus(s.name, true, latency);
        })
        .catch(function() {
          updateSurfaceStatus(s.name, false, -1);
        });
    });
  }

  function updateSurfaceStatus(name, reachable, latency) {
    _probeResults[name] = { reachable: reachable, latency: latency, time: Date.now() };

    var cell = document.getElementById('reach-' + name);
    if (!cell) return;
    var status = cell.querySelector('.reach-status');
    if (!status) return;

    if (reachable) {
      cell.style.borderLeftColor = '#5ab87a';
      status.style.color = '#5ab87a';
      status.textContent = '✓ ' + latency + 'ms · direct';
    } else {
      cell.style.borderLeftColor = '#e85d3a';
      status.style.color = '#e85d3a';
      status.textContent = '✗ blocked · need relay';
    }

    // Record history
    _reachHistory.push({
      surface: name,
      reachable: reachable,
      latency: latency,
      network: _networkInfo.type,
      effectiveType: _networkInfo.effectiveType,
      time: Date.now(),
    });

    // Keep last 200
    if (_reachHistory.length > 200) _reachHistory = _reachHistory.slice(-200);

    // Report to relay
    if (window._signalRelay) {
      window._signalRelay.send('reach-probe', {
        surface: name,
        reachable: reachable,
        latency: latency,
        network: _networkInfo,
      });
    }

    // Sound — blocked surface = warning tone
    if (!reachable && window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.playNote(
        window._membraneSound.PI_NOTES[1], 0.3, 0, 'triangle', 0.04, { pan: 'center' }
      );
    }
  }

  function updateReachability(data) {
    if (data.network) _networkInfo = data.network;
    if (data.surfaces) {
      Object.keys(data.surfaces).forEach(function(url) {
        var result = data.surfaces[url];
        var host = url.replace('https://', '').replace('/', '');
        var surface = SURFACES.find(function(s) { return s.host === host; });
        if (surface) {
          updateSurfaceStatus(surface.name, result.reachable, result.latency);
        }
      });
    }
  }

  function deactivate() {
    _active = false;
    if (_probeTimer) { clearInterval(_probeTimer); _probeTimer = null; }
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  // ═══ REACH VIEW — text readout ═══
  function reachView() {
    var lines = [];
    lines.push('SIGNAL REACH · network: ' + (_networkInfo.type || '?') + ' ' + (_networkInfo.effectiveType || ''));

    var up = 0; var down = 0;
    SURFACES.forEach(function(s) {
      var r = _probeResults[s.name];
      if (r && r.reachable) { up++; lines.push('  ✓ ' + s.name + ' · ' + r.latency + 'ms'); }
      else if (r) { down++; lines.push('  ✗ ' + s.name + ' · BLOCKED'); }
      else { lines.push('  ? ' + s.name + ' · not probed'); }
    });

    lines.push(up + '/' + SURFACES.length + ' reachable · ' + down + ' blocked');

    if (down > 0 && _networkInfo.type === 'cellular') {
      lines.push('cellular carrier is filtering. need CDN bounce or relay path.');
    }

    return lines.join('\n');
  }

  window._signalReach = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    probe: probe,
    reachView: reachView,
    isActive: function() { return _active; },
    getResults: function() { return _probeResults; },
    getNetwork: function() { return _networkInfo; },
    getHistory: function() { return _reachHistory; },
    GEO_NODES: GEO_NODES,
    ROUTES: ROUTES,
    SURFACES: SURFACES,
  };
})();
