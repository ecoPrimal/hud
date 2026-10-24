// depth-walk.js — first-person graph depth
// You stand at a node. You see 3 ahead, 2 beside, 1 behind.
// Pivot with mouse/touch. Click a node to walk there.
// The graph has DEPTH — not flat, not 2D. You are IN it.
(function() {
  'use strict';
  var PI = Math.PI, TWO_PI = PI * 2;

  // The organism's page graph — nodes are pages, edges are links
  var NODES = [
    { id: 'hud',       label: '◈ HUD',        href: '/',              color: '#3fb950', x: 0,   z: 0 },
    { id: 'easel',     label: '🎨 easel',      href: '/easel',         color: '#d2a8ff', x: 0,   z: 1 },
    { id: 'trail',     label: '🥾 trail',      href: '/trail.html',    color: '#3fb950', x: -1,  z: 2 },
    { id: 'water',     label: '🌊 water',      href: '/water.html',    color: '#58a6ff', x: 1,   z: 2 },
    { id: 'nest',      label: '🎲 nest',       href: '/nest.html',     color: '#f1c40f', x: -2,  z: 3 },
    { id: 'nightbox',  label: '🔥 campfire',   href: '/nightbox.html', color: '#e85d75', x: 0,   z: 3 },
    { id: 'vision',    label: '👁 vision',     href: '/vision.html',   color: '#d2a8ff', x: 2,   z: 3 },
    { id: 'tools',     label: '⚙ tools',      href: '/tools.html',    color: '#6e7681', x: -1,  z: 4 },
    { id: 'banana',    label: '🍌 banana',     href: '/banana.html',   color: '#f1c40f', x: 1,   z: 4 },
    { id: 'springs',   label: '♨ springs',    href: '/springs.html',  color: '#58a6ff', x: 0,   z: 5 },
    { id: 'play',      label: '🎲 play',       href: '/play.html',     color: '#d29922', x: -2,  z: 5 },
    { id: 'weather',   label: '☀ weather',    href: '/weather.html',  color: '#ffe135', x: 2,   z: 5 },
    { id: 'menagerie', label: '🦁 menagerie',  href: '/menagerie.html',color: '#e85d75', x: 0,   z: 6 },
    { id: 'classics',  label: '🎮 classics',   href: '/classics.html', color: '#79c0ff', x: -1,  z: 6 },
    { id: 'gates',     label: '🔒 gates',      href: '/gates.html',    color: '#3fb950', x: 1,   z: 6 },
    { id: 'sporeprint',label: '🍄 sporeprint', href: 'https://sporeprint.primals.eco', color: '#d29922', x: 0, z: 7 },
    { id: 'detroit',   label: '⚖ detroit',    href: 'https://detroit.primals.eco',     color: '#e85d75', x: -1, z: 8 },
    { id: '404',       label: '🐿 404',        href: '/404',           color: '#d2a8ff', x: 1,   z: 8 },
  ];

  // Find current page
  var currentPath = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  var currentNode = NODES.find(function(n) {
    var hp = n.href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    return hp === currentPath;
  }) || NODES[0];

  // Camera state
  var camAngle = 0; // radians, 0 = looking forward (+z)
  var camX = currentNode.x;
  var camZ = currentNode.z;
  var FOV = 60; // degrees

  // Create the depth viewer
  var container = null;
  var canvas = null;
  var ctx = null;
  var W = 280, H = 200;
  var isOpen = false;

  function createViewer() {
    container = document.createElement('div');
    container.id = 'depth-walk';
    container.style.cssText = 'position:fixed;bottom:56px;left:12px;z-index:15;' +
      'width:' + W + 'px;height:' + (H + 24) + 'px;' +
      'background:rgba(8,6,10,0.9);border:1px solid rgba(110,118,129,0.2);' +
      'border-radius:10px;overflow:hidden;transition:all .3s;display:none;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:4px 8px;font:9px "SF Mono",monospace;color:#6e7681;' +
      'display:flex;justify-content:space-between;align-items:center;cursor:pointer;';
    header.innerHTML = '<span>🐿️ depth · <span id="dw-pos">—</span></span>' +
      '<span style="color:#30363d;font-size:8px">drag to pivot · click to walk</span>';
    container.appendChild(header);

    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;cursor:grab;';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    document.body.appendChild(container);

    // Drag to pivot
    var dragging = false, lastX = 0;
    canvas.addEventListener('mousedown', function(e) { dragging = true; lastX = e.clientX; canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      camAngle -= dx * 0.01;
      lastX = e.clientX;
      render();
    });
    window.addEventListener('mouseup', function() { dragging = false; canvas.style.cursor = 'grab'; });

    // Touch support
    canvas.addEventListener('touchstart', function(e) { dragging = true; lastX = e.touches[0].clientX; }, { passive: true });
    canvas.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - lastX;
      camAngle -= dx * 0.01;
      lastX = e.touches[0].clientX;
      render();
    }, { passive: true });
    canvas.addEventListener('touchend', function() { dragging = false; });

    // Click to walk
    canvas.addEventListener('click', function(e) {
      if (dragging) return;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      // Find closest projected node to click
      var best = null, bestDist = 40;
      projected.forEach(function(p) {
        var d = Math.sqrt((p.sx - mx) * (p.sx - mx) + (p.sy - my) * (p.sy - my));
        if (d < bestDist) { best = p.node; bestDist = d; }
      });
      if (best && best.href) {
        location.href = best.href;
      }
    });
  }

  // Project 3D → 2D with perspective
  var projected = [];
  function render() {
    ctx.fillStyle = '#08060a';
    ctx.fillRect(0, 0, W, H);

    var cosA = Math.cos(camAngle), sinA = Math.sin(camAngle);
    var focalLength = W / (2 * Math.tan(FOV * PI / 360));

    projected = [];
    NODES.forEach(function(node) {
      // Translate relative to camera
      var dx = node.x - camX;
      var dz = node.z - camZ;

      // Rotate by camera angle
      var rx = dx * cosA - dz * sinA;
      var rz = dx * sinA + dz * cosA;

      // Only render if in front of camera
      if (rz < 0.3) return;

      // Perspective projection
      var sx = W / 2 + (rx * focalLength) / rz;
      var sy = H / 2 + (focalLength * 0.1) / rz; // slight downward offset

      // Size based on distance
      var size = Math.max(3, 18 / rz);
      var alpha = Math.min(1, 1.5 / rz);

      // Brightness based on distance
      var isCurrent = node === currentNode;

      projected.push({ node: node, sx: sx, sy: sy, size: size, alpha: alpha, rz: rz, isCurrent: isCurrent });
    });

    // Sort by depth (far first)
    projected.sort(function(a, b) { return b.rz - a.rz; });

    // Draw connections (wires between nearby nodes)
    ctx.lineWidth = 0.5;
    projected.forEach(function(p) {
      projected.forEach(function(q) {
        if (p === q) return;
        var dist = Math.abs(p.node.x - q.node.x) + Math.abs(p.node.z - q.node.z);
        if (dist <= 2) {
          ctx.strokeStyle = 'rgba(33,38,45,' + (Math.min(p.alpha, q.alpha) * 0.5) + ')';
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy);
          ctx.lineTo(q.sx, q.sy);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    projected.forEach(function(p) {
      // Glow
      if (p.isCurrent) {
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size * 2, 0, TWO_PI);
        ctx.fillStyle = 'rgba(210,168,255,0.1)';
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.size, 0, TWO_PI);
      ctx.fillStyle = p.node.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label (only for close nodes)
      if (p.rz < 4) {
        ctx.font = Math.max(7, 11 - p.rz) + 'px monospace';
        ctx.fillStyle = p.node.color;
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.textAlign = 'center';
        ctx.fillText(p.node.label, p.sx, p.sy + p.size + 10);
        ctx.globalAlpha = 1;
      }

      // Distance indicator
      if (p.rz < 2.5 && !p.isCurrent) {
        ctx.font = '7px monospace';
        ctx.fillStyle = '#30363d';
        ctx.fillText(p.rz.toFixed(1), p.sx, p.sy - p.size - 3);
      }
    });

    // Crosshair at center
    ctx.strokeStyle = 'rgba(110,118,129,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(W/2 - 6, H/2); ctx.lineTo(W/2 + 6, H/2);
    ctx.moveTo(W/2, H/2 - 6); ctx.lineTo(W/2, H/2 + 6);
    ctx.stroke();

    // Position label
    var posEl = document.getElementById('dw-pos');
    if (posEl) {
      var ahead = projected.filter(function(p) { return !p.isCurrent && p.rz < 4; }).length;
      var behind = NODES.length - projected.length - 1;
      posEl.textContent = currentNode.label + ' · ' + ahead + ' ahead · ' + behind + ' behind';
    }
  }

  // Toggle button
  function createToggle() {
    var btn = document.createElement('button');
    btn.id = 'depth-toggle';
    btn.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:15;' +
      'background:rgba(22,27,34,0.9);border:1px solid rgba(110,118,129,0.25);' +
      'color:#6e7681;font:10px "SF Mono",monospace;padding:4px 10px;' +
      'border-radius:10px;cursor:pointer;';
    btn.textContent = '🐿️ depth';
    btn.onclick = function() {
      isOpen = !isOpen;
      container.style.display = isOpen ? 'block' : 'none';
      if (isOpen) render();
    };
    document.body.appendChild(btn);
  }

  // Gentle auto-rotation when idle
  var autoRotate = null;
  function startAutoRotate() {
    if (autoRotate) return;
    autoRotate = setInterval(function() {
      camAngle += 0.003;
      if (isOpen) render();
    }, 50);
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }

  function init() {
    createViewer();
    createToggle();
    render();
    startAutoRotate();
  }

  window._depthWalk = { NODES: NODES, render: render };
})();
