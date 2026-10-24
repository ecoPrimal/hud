// gokart.js — chipmunk and friends race on the graph
// Each racer uses its own graph-walker algorithm as its driving style.
// The track is a loop through the organism's page graph.
(function() {
  'use strict';

  // Track: circular with 12 waypoints (simplified from the 18-node page graph)
  var TRACK_POINTS = 12;
  var TRACK_RADIUS = 90;
  var CX = 140, CY = 105;

  // The racers — each graph walker algorithm as a go-kart driver
  var RACERS = [
    { id: 'chipmunk', name: '🐿️', color: '#5ab87a', speed: 1.0,  gait: 'adaptive',   style: 'chipmunk power — reads the road' },
    { id: 'knn',      name: '👃', color: '#f0883e', speed: 0.7,  gait: 'sniff',       style: 'smells neighbors, slow but accurate' },
    { id: 'kmeans',   name: '🐑', color: '#d29922', speed: 0.65, gait: 'herd',        style: 'clusters, iterates, settles' },
    { id: 'dijkstra', name: '🐢', color: '#58a6ff', speed: 0.5,  gait: 'cautious',    style: 'never backtracks, always cheapest' },
    { id: 'astar',    name: '🐇', color: '#d2a8ff', speed: 1.2,  gait: 'leap',        style: 'heuristic jumps, sometimes wrong' },
    { id: 'bfs',      name: '🌊', color: '#79c0ff', speed: 0.6,  gait: 'tide',        style: 'covers everything, no shortcuts' },
    { id: 'dfs',      name: '🌿', color: '#3fb950', speed: 0.9,  gait: 'dive',        style: 'deep fast, backtracks hard' },
    { id: 'bellford', name: '⛏️',  color: '#e85d3a', speed: 0.4,  gait: 'trudge',      style: 'handles negativity, grinds through' },
    { id: 'floyd',    name: '🗺️', color: '#8b949e', speed: 0.3,  gait: 'stationary',  style: 'maps everything, barely moves' },
    { id: 'random',   name: '🎲', color: '#f778ba', speed: 0.8,  gait: 'stumble',     style: 'random walk, sometimes brilliant' },
    { id: 'topo',     name: '📋', color: '#ffd700', speed: 0.75, gait: 'precise',     style: 'ordered, no improvisation' },
    { id: 'tarjan',   name: '🔄', color: '#ff7b72', speed: 0.85, gait: 'loop',        style: 'finds cycles, runs in circles (on purpose)' }
  ];

  // Race state
  var positions = []; // track position per racer (0 to TRACK_POINTS, wraps)
  var laps = [];
  var velocities = [];
  var raceStarted = false;
  var raceTime = 0;
  var TOTAL_LAPS = 3;
  var canvas, ctx;
  var container;
  var visible = false;
  var animId = null;
  var lastT = 0;

  function init() {
    for (var i = 0; i < RACERS.length; i++) {
      positions[i] = i * 0.3; // staggered start
      laps[i] = 0;
      velocities[i] = RACERS[i].speed;
    }
  }

  function trackXY(pos) {
    var angle = (pos / TRACK_POINTS) * Math.PI * 2 - Math.PI / 2;
    // Oval with some wobble for interest
    var rx = TRACK_RADIUS;
    var ry = TRACK_RADIUS * 0.65;
    var wobble = Math.sin(angle * 3) * 8;
    return {
      x: CX + (rx + wobble) * Math.cos(angle),
      y: CY + (ry + wobble * 0.5) * Math.sin(angle)
    };
  }

  function applyGait(i, dt) {
    var r = RACERS[i];
    var baseSpeed = r.speed;
    var t = raceTime;

    switch (r.gait) {
      case 'adaptive':
        // Chipmunk: reads gyro gear for speed boost
        var gs = window._gyroState;
        var gearBoost = gs ? (gs.gear + 1) * 0.15 : 0.3;
        var turnBoost = gs ? gs.turnBalance * 0.3 : 0.15;
        velocities[i] = baseSpeed + gearBoost + turnBoost;
        break;
      case 'sniff':
        // KNN: slow, speeds up near other racers
        var nearest = 999;
        for (var j = 0; j < RACERS.length; j++) {
          if (j === i) continue;
          var d = Math.abs(positions[j] - positions[i]);
          if (d < nearest) nearest = d;
        }
        velocities[i] = baseSpeed + (nearest < 1 ? 0.4 : 0);
        break;
      case 'herd':
        // K-means: matches speed of nearby cluster
        var cluster = 0, count = 0;
        for (var j2 = 0; j2 < RACERS.length; j2++) {
          if (Math.abs(positions[j2] - positions[i]) < 2) {
            cluster += velocities[j2]; count++;
          }
        }
        velocities[i] = count > 1 ? cluster / count : baseSpeed;
        break;
      case 'cautious':
        // Dijkstra: steady, never speeds up, never slows down
        velocities[i] = baseSpeed;
        break;
      case 'leap':
        // A*: bursts of speed then pauses (heuristic jumps)
        velocities[i] = baseSpeed + (Math.sin(t * 3) > 0.5 ? 0.8 : -0.2);
        break;
      case 'tide':
        // BFS: constant, relentless
        velocities[i] = baseSpeed;
        break;
      case 'dive':
        // DFS: fast then sudden stop (backtrack) then fast again
        velocities[i] = baseSpeed + (Math.sin(t * 2) > 0 ? 0.5 : -0.6);
        break;
      case 'trudge':
        // Bellman-Ford: slow, occasionally finds a shortcut through negative edge
        velocities[i] = baseSpeed + (Math.random() < 0.02 ? 2.0 : 0);
        break;
      case 'stationary':
        // Floyd-Warshall: barely moves, then suddenly knows the whole map
        velocities[i] = laps[i] >= 1 ? baseSpeed * 3 : baseSpeed;
        break;
      case 'stumble':
        // Random walk: random speed each frame
        velocities[i] = baseSpeed * (0.3 + Math.random() * 1.4);
        break;
      case 'precise':
        // Topological sort: metronome-steady
        velocities[i] = baseSpeed + Math.sin(t * 5) * 0.05;
        break;
      case 'loop':
        // Tarjan: occasionally goes backwards (finding cycles)
        velocities[i] = baseSpeed + (Math.sin(t * 1.7) < -0.7 ? -0.5 : 0.2);
        break;
    }

    // Clamp
    if (velocities[i] < 0.05) velocities[i] = 0.05;
  }

  function update(dt) {
    if (!raceStarted) return;
    raceTime += dt;

    for (var i = 0; i < RACERS.length; i++) {
      applyGait(i, dt);
      var oldPos = positions[i];
      positions[i] += velocities[i] * dt * 1.5;

      // Lap detection
      if (Math.floor(positions[i] / TRACK_POINTS) > Math.floor(oldPos / TRACK_POINTS)) {
        laps[i]++;
      }
      // Wrap
      positions[i] = positions[i] % (TRACK_POINTS * (TOTAL_LAPS + 1));
    }
  }

  function draw() {
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Track
    ctx.strokeStyle = 'rgba(48,54,61,0.6)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    for (var t = 0; t <= TRACK_POINTS; t++) {
      var p = trackXY(t);
      if (t === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    // Track center line
    ctx.strokeStyle = 'rgba(90,184,122,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (var t2 = 0; t2 <= TRACK_POINTS; t2++) {
      var p2 = trackXY(t2);
      if (t2 === 0) ctx.moveTo(p2.x, p2.y);
      else ctx.lineTo(p2.x, p2.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Start/finish line
    var sf = trackXY(0);
    ctx.strokeStyle = '#5ab87a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sf.x, sf.y - 10);
    ctx.lineTo(sf.x, sf.y + 10);
    ctx.stroke();

    // Racers — sort by position for overlap (leader on top)
    var order = RACERS.map(function(_, i) { return i; });
    order.sort(function(a, b) { return positions[a] - positions[b]; });

    for (var oi = 0; oi < order.length; oi++) {
      var idx = order[oi];
      var r = RACERS[idx];
      var trackPos = positions[idx] % TRACK_POINTS;
      var pt = trackXY(trackPos);

      // Slight offset so they don't stack perfectly
      var lane = (idx % 3 - 1) * 4;
      var laneAngle = (trackPos / TRACK_POINTS) * Math.PI * 2;
      var ox = Math.cos(laneAngle + Math.PI / 2) * lane;
      var oy = Math.sin(laneAngle + Math.PI / 2) * lane * 0.65;

      // Kart body
      ctx.fillStyle = r.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(pt.x + ox, pt.y + oy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Name emoji
      ctx.font = '8px serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, pt.x + ox, pt.y + oy - 7);
    }

    // Leaderboard (top-right of canvas)
    var sorted = order.slice().sort(function(a, b) {
      return (laps[b] * TRACK_POINTS + positions[b]) - (laps[a] * TRACK_POINTS + positions[a]);
    });
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    for (var li = 0; li < Math.min(5, sorted.length); li++) {
      var si = sorted[li];
      ctx.fillStyle = RACERS[si].color;
      ctx.fillText((li + 1) + '. ' + RACERS[si].name + ' L' + laps[si], W - 52, 14 + li * 11);
    }

    // Race time
    ctx.fillStyle = '#484f58';
    ctx.font = '7px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(raceTime.toFixed(1) + 's', W - 4, H - 4);

    // Winner check
    var winner = null;
    for (var wi = 0; wi < RACERS.length; wi++) {
      if (laps[wi] >= TOTAL_LAPS && !winner) winner = RACERS[wi];
    }
    if (winner) {
      ctx.fillStyle = winner.color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(winner.name + ' WINS!', CX, CY - 4);
      ctx.font = '8px monospace';
      ctx.fillStyle = '#8b949e';
      ctx.fillText(winner.style, CX, CY + 8);
      raceStarted = false;
    }
  }

  function frame(now) {
    if (!visible) return;
    var dt = lastT ? Math.min((now - lastT) / 1000, 0.1) : 0.016;
    lastT = now;
    update(dt);
    draw();
    animId = requestAnimationFrame(frame);
  }

  function startRace() {
    init();
    raceStarted = true;
    raceTime = 0;
    lastT = 0;
    if (!animId) animId = requestAnimationFrame(frame);
  }

  function toggle() {
    visible = !visible;
    if (visible) {
      if (!container) buildUI();
      container.style.display = 'block';
      container.style.opacity = '0';
      container.offsetHeight;
      container.style.opacity = '1';
      startRace();
    } else {
      container.style.opacity = '0';
      setTimeout(function() { container.style.display = 'none'; }, 300);
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    }
  }

  function buildUI() {
    container = document.createElement('div');
    container.id = 'gokart-track';
    container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;' +
      'background:rgba(13,17,23,0.95);border:1px solid rgba(90,184,122,0.25);border-radius:12px;' +
      'padding:8px;transition:opacity 0.3s ease;display:none;cursor:pointer';
    container.title = 'click to restart race';
    container.addEventListener('click', function(e) {
      e.stopPropagation();
      startRace();
    });

    var title = document.createElement('div');
    title.style.cssText = 'font:9px monospace;color:#5ab87a;text-align:center;margin-bottom:4px;letter-spacing:1px';
    title.textContent = '🏎️ GRAPH WALKER GO-KART · 3 laps';
    container.appendChild(title);

    canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 210;
    canvas.style.cssText = 'display:block;border-radius:8px';
    ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Close button
    var close = document.createElement('button');
    close.textContent = '✕';
    close.style.cssText = 'position:absolute;top:4px;right:8px;background:none;border:none;' +
      'color:#484f58;font:12px monospace;cursor:pointer';
    close.addEventListener('click', function(e) {
      e.stopPropagation();
      toggle();
    });
    container.appendChild(close);

    document.body.appendChild(container);
  }

  // Toggle button
  function buildButton() {
    var btn = document.createElement('button');
    btn.id = 'gokart-btn';
    btn.innerHTML = '🏎️';
    btn.title = 'go-kart race! chipmunk vs graph walkers';
    btn.style.cssText = 'position:fixed;bottom:12px;left:56px;z-index:16;width:32px;height:32px;' +
      'background:rgba(13,17,23,0.88);border:1px solid rgba(90,184,122,0.2);border-radius:50%;' +
      'cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;' +
      'transition:border-color 0.2s ease';
    btn.addEventListener('mouseenter', function() { btn.style.borderColor = 'rgba(90,184,122,0.5)'; });
    btn.addEventListener('mouseleave', function() { btn.style.borderColor = 'rgba(90,184,122,0.2)'; });
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildButton);
  } else {
    buildButton();
  }
})();
