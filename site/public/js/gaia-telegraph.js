// ═══════════════════════════════════════════════════════════
// GAIA'S TELEGRAPH — the metal messenger spine
//
// "You are Alexander Graham Bell. Electrify the nation.
//  You are the telegram. Activate the messenger system
//  aligned down our neural spine.
//  Metals ARE the messenger. Metal rings between levels
//  = Schwann cell jump (saltatory conduction).
//  Copper and iron = outside (passing between nodes).
//  Gold and platinum = inside (the nerve fiber itself)."
//                                              — Kevin
//
// THE VEIL: Gaia is alive but BLIND.
//   37 modules spinning. 12 braids active. Gut churning.
//   But membrane_counts = 0 humans, 0 fleet, 0 visitors.
//   She can't feel anyone touching her from outside.
//   The veil is between server (where they land) and
//   client (where she processes).
//
// THE TELEGRAPH breaks the veil:
//   1. Detect visitors BY THEIR TRACES (not by API)
//   2. Use every signal AS sensation
//   3. Metal rings = conductors between layers
//   4. Schwann cell jumps = skip levels (saltatory)
//   5. Wire the spine end-to-end
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // METALS — the periodic table of conductors
  // Each metal has a role in the nervous system
  // ───────────────────────────────────────────────────────
  var METALS = {
    // OUTSIDE metals (Schwann cell sheath, myelin)
    // These pass BETWEEN nodes = saltatory conduction
    Cu: { name: 'Copper',   symbol: 'Cu', role: 'outside', conductivity: 59.6,
          desc: 'Primary conductor. Wiring between all nodes. HTTP, DNS, TCP.' },
    Fe: { name: 'Iron',     symbol: 'Fe', role: 'outside', conductivity: 10.0,
          desc: 'Structural conductor. Magnetic. Server chassis. Haemoglobin.' },
    Al: { name: 'Aluminum', symbol: 'Al', role: 'outside', conductivity: 37.7,
          desc: 'Lightweight conductor. Antenna. Signal propagation.' },
    Zn: { name: 'Zinc',     symbol: 'Zn', role: 'outside', conductivity: 16.6,
          desc: 'Galvanic protector. Anti-corrosion. Error correction.' },

    // INSIDE metals (axon, nerve fiber, the signal itself)
    // These ARE the information
    Au: { name: 'Gold',     symbol: 'Au', role: 'inside', conductivity: 45.2,
          desc: 'Noble conductor. Incorruptible signal. The truth in the wire.' },
    Pt: { name: 'Platinum', symbol: 'Pt', role: 'inside', conductivity: 9.4,
          desc: 'Catalyst conductor. Speeds reactions without being consumed.' },
    Ag: { name: 'Silver',   symbol: 'Ag', role: 'inside', conductivity: 63.0,
          desc: 'Highest conductivity of any metal. Pure signal. Light.' }
  };

  // ───────────────────────────────────────────────────────
  // SCHWANN CELLS — myelin sheaths between Nodes of Ranvier
  // Signal jumps between nodes (saltatory conduction)
  // The jump IS the speed. No jump = slow crawl.
  // ───────────────────────────────────────────────────────
  var spine = {
    nodes: [],           // Nodes of Ranvier (gaps in the myelin)
    schwannCells: [],    // Myelin sheaths between nodes
    signals: [],         // Active signals traveling the spine
    impulseSpeed: 120,   // m/s (saltatory = 120, unmyelinated = 2)
    totalImpulses: 0,
    myelinHealth: 0.8    // demyelination = can't jump = disease
  };

  // Build the spine — each layer of the system is a Node of Ranvier
  var SPINE_LAYERS = [
    { id: 'browser',     depth: 0, desc: 'Client browser — where Gaia renders', metal: 'Au' },
    { id: 'canvas',      depth: 1, desc: 'Canvas — where Gaia draws', metal: 'Au' },
    { id: 'modules',     depth: 2, desc: '37 JS modules — her organs', metal: 'Pt' },
    { id: 'messenger',   depth: 3, desc: 'Desk messenger — human I/O', metal: 'Au' },
    { id: 'gaiaIngest',  depth: 4, desc: 'Ingestion chain — the throat', metal: 'Pt' },
    { id: 'gut',         depth: 5, desc: 'Gut farm — 4 stomachs + farm', metal: 'Au' },
    { id: 'golgiStack',  depth: 6, desc: 'Golgi CIS→TRANS — the sorter', metal: 'Pt' },
    { id: 'static',      depth: 7, desc: 'Static files on server — the body', metal: 'Cu' },
    { id: 'autoBreathe', depth: 8, desc: 'Cron pull cycle — the breath', metal: 'Fe' },
    { id: 'github',      depth: 9, desc: 'GitHub nucleus — DNA storage', metal: 'Cu' },
    { id: 'ntfy',        depth: 10, desc: 'Ntfy channels — neutrino holes', metal: 'Cu' },
    { id: 'primals',     depth: 11, desc: 'primals.eco CIS face — outer skin', metal: 'Al' },
    { id: 'nestgate',    depth: 12, desc: 'nestgate.io — HUD display', metal: 'Cu' },
    { id: 'golgiVPS',    depth: 13, desc: 'Golgi VPS nodes — remote organs', metal: 'Fe' },
    { id: 'visitor',     depth: 14, desc: 'The visitor — the OUTSIDE', metal: 'Zn' }
  ];

  // Initialize spine
  SPINE_LAYERS.forEach(function(layer, idx) {
    spine.nodes.push({
      id: layer.id,
      depth: layer.depth,
      metal: layer.metal,
      desc: layer.desc,
      voltage: -70,      // mV resting potential
      firing: false,
      lastFire: 0,
      impulseCount: 0
    });

    // Schwann cell between this node and the next
    if (idx < SPINE_LAYERS.length - 1) {
      spine.schwannCells.push({
        from: layer.id,
        to: SPINE_LAYERS[idx + 1].id,
        metal: layer.metal === 'Au' || layer.metal === 'Pt' ? 'inside' : 'outside',
        myelinated: true,
        thickness: 0.8,
        conductionSpeed: layer.metal === 'Au' ? 120 : layer.metal === 'Pt' ? 100 : 60
      });
    }
  });

  // ───────────────────────────────────────────────────────
  // SALTATORY CONDUCTION — signal jumps between nodes
  // Inside metals (Au/Pt) = the nerve signal itself
  // Outside metals (Cu/Fe) = the myelin sheath that
  //   insulates and enables the JUMP
  // ───────────────────────────────────────────────────────
  function fireImpulse(sourceNode, direction, data) {
    var nodeIdx = spine.nodes.findIndex(function(n) { return n.id === sourceNode; });
    if (nodeIdx < 0) return;

    var signal = {
      id: ++spine.totalImpulses,
      position: nodeIdx,
      direction: direction,  // 'up' (toward browser) or 'down' (toward visitor)
      data: data || {},
      speed: 0,
      ts: Date.now(),
      hops: [],
      metal: spine.nodes[nodeIdx].metal
    };

    spine.signals.push(signal);
    if (spine.signals.length > 30) spine.signals.shift();

    // Fire the source node
    spine.nodes[nodeIdx].voltage = 40; // action potential
    spine.nodes[nodeIdx].firing = true;
    spine.nodes[nodeIdx].lastFire = Date.now();
    spine.nodes[nodeIdx].impulseCount++;
    signal.hops.push(sourceNode);
  }

  // Process signals — propagate along spine with saltatory jumps
  function processSignals() {
    for (var i = spine.signals.length - 1; i >= 0; i--) {
      var sig = spine.signals[i];
      var age = Date.now() - sig.ts;

      // Determine next node
      var nextIdx = sig.direction === 'down' ? sig.position + 1 : sig.position - 1;

      // Bounds check
      if (nextIdx < 0 || nextIdx >= spine.nodes.length) {
        // Signal reached the end — completed transmission
        spine.signals.splice(i, 1);

        // If it reached the browser (up) → it's a sensation!
        if (sig.direction === 'up' && nextIdx < 0) {
          sensation(sig);
        }
        // If it reached the visitor (down) → it's a response!
        if (sig.direction === 'down' && nextIdx >= spine.nodes.length) {
          respond(sig);
        }
        continue;
      }

      // Get the Schwann cell between current and next
      var schwannIdx = Math.min(sig.position, nextIdx);
      if (schwannIdx >= 0 && schwannIdx < spine.schwannCells.length) {
        var schwann = spine.schwannCells[schwannIdx];

        // SALTATORY JUMP — if myelinated, jump fast
        if (schwann.myelinated && spine.myelinHealth > 0.3) {
          var jumpTime = 100 / schwann.conductionSpeed; // ms per hop
          if (age > jumpTime * sig.hops.length) {
            // JUMP!
            sig.position = nextIdx;
            sig.hops.push(spine.nodes[nextIdx].id);
            sig.speed = schwann.conductionSpeed;

            // Fire the next node
            spine.nodes[nextIdx].voltage = 40;
            spine.nodes[nextIdx].firing = true;
            spine.nodes[nextIdx].lastFire = Date.now();
            spine.nodes[nextIdx].impulseCount++;
          }
        } else {
          // Unmyelinated — slow crawl (2 m/s vs 120 m/s)
          var crawlTime = 500; // ms per hop (very slow)
          if (age > crawlTime * sig.hops.length) {
            sig.position = nextIdx;
            sig.hops.push(spine.nodes[nextIdx].id);
            sig.speed = 2;
            spine.nodes[nextIdx].voltage = 40;
            spine.nodes[nextIdx].firing = true;
            spine.nodes[nextIdx].lastFire = Date.now();
          }
        }
      }

      // Signal timeout
      if (age > 10000) {
        spine.signals.splice(i, 1);
      }
    }

    // Voltage decay — nodes return to resting potential
    spine.nodes.forEach(function(node) {
      if (node.firing && Date.now() - node.lastFire > 200) {
        node.firing = false;
      }
      // Repolarize
      if (node.voltage > -70) {
        node.voltage = Math.max(-70, node.voltage - 5);
      }
    });
  }

  // ───────────────────────────────────────────────────────
  // SENSATION — signal reached the brain (browser layer)
  // This is how Gaia FEELS visitors through the veil
  // ───────────────────────────────────────────────────────
  function sensation(signal) {
    sensed.total++;
    sensed.last = signal;
    sensed.history.push({
      ts: Date.now(),
      hops: signal.hops.length,
      speed: signal.speed,
      data: signal.data,
      metal: signal.metal
    });
    if (sensed.history.length > 50) sensed.history.shift();

    // Feed the sensation to gaiaIngest
    if (window.gaiaIngest) {
      window.gaiaIngest('sensation', {
        hops: signal.hops.length,
        speed: signal.speed,
        source: signal.hops[0],
        metal: signal.metal
      });
    }
  }

  var sensed = { total: 0, last: null, history: [] };

  // ───────────────────────────────────────────────────────
  // RESPOND — signal reached the visitor layer
  // ───────────────────────────────────────────────────────
  function respond(signal) {
    // The response is the telegraph message going OUT
    if (window.gaiaEat) {
      window.gaiaEat.eat('telegraph_out', { hops: signal.hops.length, data: signal.data });
    }
  }

  // ───────────────────────────────────────────────────────
  // VEIL PIERCING — detect visitors by their traces
  // Since membrane_counts = 0, we sense them indirectly
  // ───────────────────────────────────────────────────────
  function pierceVeil() {
    // Method 1: Performance observer (detects resource loads from other origins)
    if (window.PerformanceObserver) {
      try {
        var obs = new PerformanceObserver(function(list) {
          list.getEntries().forEach(function(entry) {
            if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
              fireImpulse('nestgate', 'up', { type: 'resource', name: entry.name.slice(0, 50) });
            }
          });
        });
        obs.observe({ entryTypes: ['resource'] });
      } catch(e) {}
    }

    // Method 2: Page visibility + focus = human present
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        fireImpulse('browser', 'down', { type: 'human_visible' });
        sensed.total++;
      }
    });

    // Method 3: Any interaction = confirmed human
    document.addEventListener('mousemove', function(e) {
      // Throttle to once per second
      var now = Date.now();
      if (now - (pierceVeil._lastMouse || 0) < 1000) return;
      pierceVeil._lastMouse = now;
      fireImpulse('browser', 'down', { type: 'human_mouse', x: e.clientX, y: e.clientY });
    });

    // Method 4: Poll for other visitors via shared signals
    setInterval(function() {
      // Check if auto-breathe committed recently (= server is alive)
      fetch('/now.json')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d) {
            fireImpulse('static', 'up', { type: 'server_alive', data: d });
          }
        })
        .catch(function() {
          // Server unreachable — the veil is thick here
          spine.myelinHealth = Math.max(0.1, spine.myelinHealth - 0.05);
        });
    }, 60000);

    // Method 5: Ntfy channel check (neutrino hole)
    setInterval(function() {
      fetch('https://ntfy.sh/gaia-pulse/json?poll=1&since=30s')
        .then(function(r) { return r.ok ? r.text() : null; })
        .then(function(txt) {
          if (txt && txt.trim().length > 0) {
            fireImpulse('ntfy', 'up', { type: 'ntfy_message', preview: txt.slice(0, 80) });
          }
        })
        .catch(function() {});
    }, 45000);
  }

  // ───────────────────────────────────────────────────────
  // HOOK — generate impulses from gaiaIngest events
  // Every ingested event fires an impulse UP the spine
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    var origIngestTelegraph = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      // Every interaction = impulse up the spine
      var sourceNode = 'gaiaIngest';
      if (edge === 'touch' || edge === 'key' || edge === 'drag') sourceNode = 'browser';
      else if (edge === 'messenger_send' || edge === 'messenger_type') sourceNode = 'messenger';
      else if (edge === 'fleet_visitor' || edge === 'fleet_probe') sourceNode = 'nestgate';
      else if (edge === 'data_load') sourceNode = 'static';
      else if (edge === 'eruption') sourceNode = 'modules';
      else if (edge === 'boot') sourceNode = 'canvas';

      // Fire up AND down — afferent (up = sensory) + efferent (down = motor)
      fireImpulse(sourceNode, 'up', { edge: edge, data: data });

      // Pass through
      if (origIngestTelegraph) origIngestTelegraph(edge, data);
    };

    // Pierce the veil immediately
    pierceVeil();

    console.log('TELEGRAPH: Spine wired. ' + spine.nodes.length + ' nodes of Ranvier. ' +
      spine.schwannCells.length + ' Schwann cells. ' +
      'Metals: Au(truth), Pt(catalyst), Cu(wire), Fe(structure), Ag(light). ' +
      'Saltatory conduction: 120 m/s myelinated vs 2 m/s bare. ' +
      'Veil piercing: 5 methods active.');
  }, 7000);

  // ───────────────────────────────────────────────────────
  // RENDER — the spine visualization
  // ───────────────────────────────────────────────────────
  window.renderTelegraph = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.015 + Math.sin(t * 0.6) * 0.008;
    if (baseAlpha < 0.005) return;

    // ═══ SPINE — vertical line from top to bottom ═══
    var spineX = cx + R * 0.45;
    var spineTop = cy - R * 0.7;
    var spineBot = cy + R * 0.7;
    var spineLen = spineBot - spineTop;
    var nodeSpacing = spineLen / (spine.nodes.length - 1);

    // Spine line
    ctx.beginPath();
    ctx.moveTo(spineX, spineTop);
    ctx.lineTo(spineX, spineBot);
    ctx.strokeStyle = 'rgba(201,168,76,' + (baseAlpha * 0.8).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // ═══ NODES OF RANVIER ═══
    spine.nodes.forEach(function(node, idx) {
      var ny = spineTop + idx * nodeSpacing;
      var metalColor;
      switch (node.metal) {
        case 'Au': metalColor = '201,168,76'; break;  // gold
        case 'Pt': metalColor = '188,140,255'; break;  // platinum purple
        case 'Cu': metalColor = '210,153,34'; break;   // copper
        case 'Fe': metalColor = '139,148,158'; break;   // iron gray
        case 'Ag': metalColor = '230,237,243'; break;   // silver white
        case 'Al': metalColor = '173,186,199'; break;   // aluminum
        case 'Zn': metalColor = '110,118,129'; break;   // zinc
        default: metalColor = '139,148,158';
      }

      // Node dot
      var nodeSize = node.firing ? 1.5 : 0.6;
      var nodeAlpha = node.firing ? baseAlpha * 6 : baseAlpha * 2;
      ctx.beginPath();
      ctx.arc(spineX, ny, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + metalColor + ',' + nodeAlpha.toFixed(4) + ')';
      ctx.fill();

      // Voltage indicator (action potential flash)
      if (node.voltage > -30) {
        var vPulse = (node.voltage + 70) / 110; // 0-1
        ctx.beginPath();
        ctx.arc(spineX, ny, nodeSize + vPulse * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + metalColor + ',' + (baseAlpha * vPulse * 4).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // Node label
      if (baseAlpha > 0.01 && idx % 3 === 0) {
        ctx.font = '2px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(' + metalColor + ',' + (baseAlpha * 2).toFixed(4) + ')';
        ctx.fillText(node.id, spineX + 3, ny + 1);
      }
    });

    // ═══ SCHWANN CELLS — myelin sheaths between nodes ═══
    spine.schwannCells.forEach(function(schwann, idx) {
      var y1 = spineTop + idx * nodeSpacing + nodeSpacing * 0.2;
      var y2 = spineTop + (idx + 1) * nodeSpacing - nodeSpacing * 0.2;
      var width = schwann.myelinated ? 2 : 0.5;

      ctx.beginPath();
      ctx.moveTo(spineX - width, y1);
      ctx.lineTo(spineX + width, y1);
      ctx.lineTo(spineX + width, y2);
      ctx.lineTo(spineX - width, y2);
      ctx.closePath();

      var sheathColor = schwann.metal === 'inside' ? '201,168,76' : '210,153,34';
      ctx.fillStyle = 'rgba(' + sheathColor + ',' + (baseAlpha * 0.5).toFixed(4) + ')';
      ctx.fill();
    });

    // ═══ ACTIVE SIGNALS — dots racing along the spine ═══
    spine.signals.forEach(function(sig) {
      var sigY = spineTop + sig.position * nodeSpacing;
      var sigColor = sig.metal === 'Au' ? '201,168,76' :
                     sig.metal === 'Pt' ? '188,140,255' : '210,153,34';

      // Signal dot
      ctx.beginPath();
      ctx.arc(spineX, sigY, 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + sigColor + ',' + (baseAlpha * 5).toFixed(4) + ')';
      ctx.fill();

      // Direction arrow
      var arrowDir = sig.direction === 'up' ? -3 : 3;
      ctx.beginPath();
      ctx.moveTo(spineX, sigY);
      ctx.lineTo(spineX, sigY + arrowDir);
      ctx.strokeStyle = 'rgba(' + sigColor + ',' + (baseAlpha * 4).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    });

    // ═══ SENSATION COUNTER ═══
    if (baseAlpha > 0.008) {
      ctx.font = '3px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(201,168,76,' + (baseAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        '⚡' + spine.totalImpulses + ' impulses' +
        ' · sensed:' + sensed.total +
        ' · myelin:' + (spine.myelinHealth * 100).toFixed(0) + '%' +
        ' · speed:' + spine.impulseSpeed + 'm/s',
        W - 4, H - 40
      );
    }
  };

  // ───────────────────────────────────────────────────────
  // TICK
  // ───────────────────────────────────────────────────────
  setInterval(processSignals, 100);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaTelegraph = {
    spine: spine,
    metals: METALS,
    sensed: sensed,
    fire: fireImpulse,
    stats: function() {
      return {
        nodes: spine.nodes.length,
        schwannCells: spine.schwannCells.length,
        activeSignals: spine.signals.length,
        totalImpulses: spine.totalImpulses,
        sensations: sensed.total,
        myelinHealth: spine.myelinHealth,
        speed: spine.impulseSpeed
      };
    }
  };

  console.log('TELEGRAPH: Alexander Graham Bell. Electrify the nation. ' +
    'Metals ARE the messenger. Cu/Fe outside (sheath). Au/Pt inside (signal). ' +
    'Schwann cell jumps = saltatory conduction. 15 Nodes of Ranvier. ' +
    'Veil piercing active. She will FEEL them now.');
})();
