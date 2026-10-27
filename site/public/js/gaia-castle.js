// ═══════════════════════════════════════════════════════════
// MIND CASTLE — localhost is your HOUSE
// 1.000.null — max 1000 lines.
//
// When you're on localhost, you're INSIDE your house.
// Looking outside the window = seeing your local network/land.
// Leaving the door = going to other localities.
// Other Gaia instances = other houses in the neighborhood.
// Golgi VPS nodes = castles in distant lands.
//
// LOCALITY MESH:
// Every locality knows its relative distance to every other.
// distances + times + measurements + positions = the mesh.
// The mesh IS the land between the houses.
// No absolute coordinates. Only relative measurements.
//
// HYPERLOCAL = inside your house (same machine, same origin)
// LOCAL = your land (same network, nearby latency)
// INTRALOCAL = between your land and neighbor's land
// SOLAR = the wider region (same continent/cloud)
// DEEP = the far reaches (cross-ocean, high latency)
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ CASTLE ARCHITECTURE ═══
  // The house has rooms, windows, and doors.
  // Rooms = tabs on the same origin (BroadcastChannel siblings)
  // Windows = views OUT to other localities (fetch endpoints)
  // Doors = links TO other localities (navigation paths)
  var castle = {
    name: 'eastGate',  // Kevin's castle name
    type: 'house',     // default castle type (user can change)
    rooms: {},         // tabId → room info
    windows: [],       // outward views
    doors: [],         // exit paths
    walls: [],         // boundaries (firewall, CORS, auth)
    hearth: null,      // the center — localStorage/shared state
    moat: null,        // the boundary — CORS/same-origin
    built: Date.now(),
    lastSweep: 0
  };

  // ═══ ROOM REGISTRY — each tab is a room ═══
  function registerRoom(tabId, locality) {
    castle.rooms[tabId] = {
      id: tabId,
      locality: locality,
      entered: Date.now(),
      lastSeen: Date.now(),
      name: 'room-' + Object.keys(castle.rooms).length,
      // Room position is relative to the hearth
      x: locality ? (locality.screenX || 0) : 0,
      y: locality ? (locality.screenY || 0) : 0,
      w: locality ? (locality.windowW || 800) : 800,
      h: locality ? (locality.windowH || 600) : 600
    };
  }

  // Register self as the first room
  if (window.GAIA_LOCALITY) {
    registerRoom(window.GAIA_LOCALITY.tabId || 'self', window.GAIA_LOCALITY);
  }

  // Watch for sibling tabs (other rooms in the castle)
  setInterval(function() {
    var sibs = window.GAIA_SIBLINGS || {};
    var keys = Object.keys(sibs);
    for (var i = 0; i < keys.length; i++) {
      var sib = sibs[keys[i]];
      if (sib && Date.now() - sib.lastSeen < 30000) {
        if (!castle.rooms[keys[i]]) {
          registerRoom(keys[i], sib.locality);
        } else {
          castle.rooms[keys[i]].lastSeen = sib.lastSeen;
        }
      }
    }
    // Evict stale rooms (tabs closed >30s ago)
    var rKeys = Object.keys(castle.rooms);
    for (var j = 0; j < rKeys.length; j++) {
      if (Date.now() - castle.rooms[rKeys[j]].lastSeen > 60000) {
        delete castle.rooms[rKeys[j]];
      }
    }
  }, 5000);

  // ═══ WINDOWS — views to other localities ═══
  // Each Golgi endpoint is a window you can look through
  function buildWindows() {
    var endpoints = window.GAIA_GOLGI_DISTANCES || {};
    var golgiEps = [
      { id: 'US', name: 'Dallas window',    url: 'https://primals.eco',             dir: 'west' },
      { id: 'DE', name: 'Frankfurt window', url: 'https://golgi-de.primals.eco',    dir: 'east' },
      { id: 'IN', name: 'Mumbai window',    url: 'https://golgi-in.primals.eco',    dir: 'south' },
      { id: 'JP', name: 'Tokyo window',     url: 'https://golgi-jp.primals.eco',    dir: 'north' }
    ];

    castle.windows = golgiEps.map(function(ep) {
      var dist = endpoints[ep.id];
      return {
        id: ep.id,
        name: ep.name,
        url: ep.url,
        direction: ep.dir,
        latency: dist ? dist.avg : 999,
        lastProbe: dist ? dist.ts : 0,
        visible: dist ? dist.avg < 500 : false, // can see through if latency < 500ms
        clarity: dist ? Math.max(0, 1 - dist.avg / 1000) : 0 // 0=opaque, 1=crystal clear
      };
    });
  }

  // ═══ DOORS — paths to other localities ═══
  function buildDoors() {
    castle.doors = [
      { id: 'front',  name: 'Front door (public)',  href: 'https://primals.eco',   type: 'public',  locked: false },
      { id: 'back',   name: 'Back door (admin)',     href: '/admin',                type: 'private', locked: true },
      { id: 'garden', name: 'Garden gate (feed)',    href: '/feed.xml',             type: 'public',  locked: false },
      { id: 'cellar', name: 'Cellar (data)',         href: '/data/',                type: 'private', locked: false },
      { id: 'attic',  name: 'Attic (legacy)',        href: '/index-old-eon.html',   type: 'archive', locked: false },
      { id: 'tower',  name: 'Tower (crystal ball)',  href: '/crystal.html',         type: 'public',  locked: false }
    ];
  }

  // ═══ LOCALITY MESH — relative distances between all known localities ═══
  var meshNodes = {};
  var meshEdges = [];

  function buildMesh() {
    meshNodes = {};
    meshEdges = [];

    // Self = the hearth
    meshNodes['self'] = {
      id: 'self',
      type: 'hearth',
      latency: 0,
      position: { x: 0, y: 0 }, // origin
      lastSeen: Date.now()
    };

    // Sibling tabs = rooms (very short distance)
    var roomKeys = Object.keys(castle.rooms);
    for (var ri = 0; ri < roomKeys.length; ri++) {
      var room = castle.rooms[roomKeys[ri]];
      meshNodes['room-' + roomKeys[ri]] = {
        id: 'room-' + roomKeys[ri],
        type: 'room',
        latency: 1, // same machine = ~1ms
        position: { x: room.x * 0.01, y: room.y * 0.01 },
        lastSeen: room.lastSeen
      };
      meshEdges.push({ from: 'self', to: 'room-' + roomKeys[ri], latency: 1, type: 'hallway' });
    }

    // Golgi endpoints = distant castles
    var golgiDist = window.GAIA_GOLGI_DISTANCES || {};
    var golgiKeys = Object.keys(golgiDist);
    for (var gi = 0; gi < golgiKeys.length; gi++) {
      var gk = golgiKeys[gi];
      var gd = golgiDist[gk];
      var lat = gd.avg || 999;
      // Position in mesh based on latency (farther = more distant)
      var angle = (gi / golgiKeys.length) * Math.PI * 2;
      meshNodes['golgi-' + gk] = {
        id: 'golgi-' + gk,
        type: 'castle',
        latency: lat,
        position: { x: Math.cos(angle) * lat * 0.1, y: Math.sin(angle) * lat * 0.1 },
        lastSeen: gd.ts || 0
      };
      meshEdges.push({ from: 'self', to: 'golgi-' + gk, latency: lat, type: 'road' });
    }

    // Edges between Golgi nodes (inter-castle roads)
    for (var a = 0; a < golgiKeys.length; a++) {
      for (var b = a + 1; b < golgiKeys.length; b++) {
        var latA = (golgiDist[golgiKeys[a]] || {}).avg || 500;
        var latB = (golgiDist[golgiKeys[b]] || {}).avg || 500;
        // Estimate inter-node latency as geometric mean
        var interLat = Math.sqrt(latA * latB);
        meshEdges.push({
          from: 'golgi-' + golgiKeys[a],
          to: 'golgi-' + golgiKeys[b],
          latency: interLat,
          type: 'trail'
        });
      }
    }
  }

  // Rebuild periodically
  setTimeout(function() {
    buildWindows();
    buildDoors();
    buildMesh();
  }, 4000);
  setInterval(function() {
    buildWindows();
    buildMesh();
  }, 30000);

  // ═══ EXPOSE ═══
  window.GAIA_CASTLE = castle;
  window.GAIA_MESH = { nodes: meshNodes, edges: meshEdges };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var isLocal = g.isLocalHost;

    // Castle only renders on localhost — you can only see your house from inside
    if (!isLocal) return;

    var cT = breathT * 0.15;
    var cAlpha = 0.008 + Math.sin(cT * 0.4) * 0.005;
    if (cAlpha < 0.004) return;

    // ═══ HOUSE OUTLINE — the castle boundary ═══
    // A warm rectangle (house shape) superimposed on the globe
    var houseW = R * 0.8;
    var houseH = R * 0.6;
    var houseX = cx - houseW / 2;
    var houseY = cy - houseH / 2;

    // House body
    ctx.beginPath();
    ctx.rect(houseX, houseY, houseW, houseH);
    ctx.strokeStyle = 'rgba(140,100,55,' + (cAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Roof — triangle
    ctx.beginPath();
    ctx.moveTo(houseX - 5, houseY);
    ctx.lineTo(cx, houseY - houseH * 0.4);
    ctx.lineTo(houseX + houseW + 5, houseY);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(120,80,40,' + (cAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // ═══ WINDOWS — views to Golgi endpoints ═══
    for (var wi = 0; wi < castle.windows.length; wi++) {
      var win = castle.windows[wi];
      var wSize = 8;
      var wx, wy;

      // Position window based on direction
      switch (win.direction) {
        case 'north': wx = cx; wy = houseY + 5; break;
        case 'south': wx = cx; wy = houseY + houseH - 5; break;
        case 'east':  wx = houseX + houseW - 5; wy = cy; break;
        case 'west':  wx = houseX + 5; wy = cy; break;
        default: wx = cx; wy = cy;
      }

      // Window pane
      ctx.beginPath();
      ctx.rect(wx - wSize/2, wy - wSize/2, wSize, wSize);

      // Clarity determines color — clear window = green, opaque = grey
      var wColor = win.visible
        ? 'rgba(63,185,80,' + (cAlpha * (1 + win.clarity)).toFixed(4) + ')'
        : 'rgba(110,118,129,' + (cAlpha * 0.8).toFixed(4) + ')';
      ctx.strokeStyle = wColor;
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Cross-bar (window panes)
      ctx.beginPath();
      ctx.moveTo(wx, wy - wSize/2);
      ctx.lineTo(wx, wy + wSize/2);
      ctx.moveTo(wx - wSize/2, wy);
      ctx.lineTo(wx + wSize/2, wy);
      ctx.strokeStyle = wColor;
      ctx.lineWidth = 0.2;
      ctx.stroke();

      // Window label
      if (cAlpha > 0.01) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = wColor;
        var latLabel = win.latency < 999 ? win.latency + 'ms' : '?';
        ctx.fillText(win.id + ' ' + latLabel, wx, wy + wSize/2 + 3);
      }
    }

    // ═══ DOORS — exit paths ═══
    for (var di = 0; di < castle.doors.length; di++) {
      var door = castle.doors[di];
      // Doors along bottom of house
      var dw = 5, dh = 8;
      var dx = houseX + 10 + di * (houseW / castle.doors.length);
      var dy = houseY + houseH - dh;

      ctx.beginPath();
      ctx.rect(dx, dy, dw, dh);
      var doorColor = door.locked
        ? 'rgba(248,81,73,' + (cAlpha * 1.2).toFixed(4) + ')'
        : 'rgba(210,153,34,' + (cAlpha * 1.2).toFixed(4) + ')';
      ctx.strokeStyle = doorColor;
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Door handle
      ctx.beginPath();
      ctx.arc(dx + dw - 1, dy + dh/2, 0.3, 0, TAU);
      ctx.fillStyle = doorColor;
      ctx.fill();
    }

    // ═══ ROOMS — tabs as rooms inside the house ═══
    var roomKeys = Object.keys(castle.rooms);
    if (roomKeys.length > 1) {
      var roomW = houseW / (roomKeys.length + 1);
      for (var rmi = 0; rmi < roomKeys.length; rmi++) {
        var rm = castle.rooms[roomKeys[rmi]];
        var rmx = houseX + 5 + rmi * roomW;
        var rmy = houseY + houseH * 0.3;
        var rmw = roomW * 0.8;
        var rmh = houseH * 0.35;

        ctx.beginPath();
        ctx.rect(rmx, rmy, rmw, rmh);
        ctx.strokeStyle = 'rgba(88,166,255,' + (cAlpha * 0.8).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.setLineDash([1, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Room name
        if (cAlpha > 0.01) {
          ctx.font = '1.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(88,166,255,' + (cAlpha * 1.2).toFixed(4) + ')';
          ctx.fillText(rm.name, rmx + rmw/2, rmy + rmh/2);
        }
      }
    }

    // ═══ HEARTH — the warm center ═══
    ctx.beginPath();
    ctx.arc(cx, cy + houseH * 0.15, 2, 0, TAU);
    var hearthPulse = 0.5 + Math.sin(cT * 2) * 0.3;
    ctx.fillStyle = 'rgba(210,100,30,' + (cAlpha * 2 * hearthPulse).toFixed(4) + ')';
    ctx.fill();

    // ═══ MESH LINES — connections to distant castles ═══
    for (var mi = 0; mi < meshEdges.length; mi++) {
      var edge = meshEdges[mi];
      var fromNode = meshNodes[edge.from];
      var toNode = meshNodes[edge.to];
      if (!fromNode || !toNode) continue;

      // Only draw castle-to-castle edges (roads to distant lands)
      if (edge.type !== 'road' && edge.type !== 'trail') continue;

      var fromX = cx + (fromNode.position.x || 0) * 0.5;
      var fromY = cy + (fromNode.position.y || 0) * 0.5;
      var toX = cx + (toNode.position.x || 0) * 0.5;
      var toY = cy + (toNode.position.y || 0) * 0.5;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      var edgeAlpha = cAlpha * (edge.type === 'road' ? 1.0 : 0.5);
      ctx.strokeStyle = 'rgba(63,185,80,' + edgeAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.setLineDash(edge.type === 'trail' ? [1, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // Latency label on roads
      if (edge.type === 'road' && cAlpha > 0.01) {
        var midX = (fromX + toX) / 2;
        var midY = (fromY + toY) / 2;
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(63,185,80,' + (cAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(Math.round(edge.latency) + 'ms', midX, midY - 1);
      }
    }

    // ═══ DISTANT CASTLES — Golgi nodes as structures ═══
    var nodeKeys = Object.keys(meshNodes);
    for (var ni = 0; ni < nodeKeys.length; ni++) {
      var node = meshNodes[nodeKeys[ni]];
      if (node.type !== 'castle') continue;

      var nx = cx + (node.position.x || 0) * 0.5;
      var ny = cy + (node.position.y || 0) * 0.5;

      // Distant castle = small triangle (far tower)
      var ts = 3;
      ctx.beginPath();
      ctx.moveTo(nx, ny - ts);
      ctx.lineTo(nx - ts * 0.7, ny + ts * 0.5);
      ctx.lineTo(nx + ts * 0.7, ny + ts * 0.5);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(201,168,76,' + (cAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Castle name
      if (cAlpha > 0.01) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(201,168,76,' + (cAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(node.id.replace('golgi-', ''), nx, ny + ts + 3);
      }
    }

    // ═══ CASTLE STATS ═══
    if (cAlpha > 0.009) {
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(140,100,55,' + (cAlpha * 2).toFixed(4) + ')';
      var roomCount = Object.keys(castle.rooms).length;
      var winCount = castle.windows.filter(function(w) { return w.visible; }).length;
      var doorCount = castle.doors.filter(function(d) { return !d.locked; }).length;
      ctx.fillText('🏰 ' + roomCount + ' rooms · ' + winCount + '/' + castle.windows.length + ' windows · ' + doorCount + ' doors', 8, 68);
    }
  });

})(window.G);
