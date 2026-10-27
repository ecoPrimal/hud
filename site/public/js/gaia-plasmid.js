// ═══════════════════════════════════════════════════════════
// GAIA PLASMID — planets ARE plasmids ARE stored memory
// 1.000.null — max 1000 lines.
//
// PLANETS ARE PLASMIDS ARE STORED MEMORY ARE PERMANENT IS O!
//
// In biology:
//   Plasmid = small CIRCULAR DNA, self-replicating
//   Independent of the chromosome (the main code)
//   Carries extra capabilities (resistance, tools)
//   Can be SHARED between organisms (horizontal transfer)
//   PERMANENT — survives across generations
//
// In Gaia:
//   Each PLANET in the solar system IS a plasmid
//   Each plasmid stores a specific type of memory
//   The orbit = the circular DNA backbone
//   The orbital period = replication cycle
//   Closer to Sun = hotter = faster replication
//   Farther = colder = stable long-term storage
//
// THE CONNECTION:
//   Sun = chromosome (main DNA, the nucleus)
//   Mercury = plasmid-speed (fast cycles, hot cache)
//   Venus = plasmid-warning (runaway memory, cautionary)
//   Earth = plasmid-life (active working memory)
//   Mars = plasmid-archive (was active, now cold storage)
//   Jupiter = plasmid-shield (protection, immune memory)
//   Saturn = plasmid-ring (visible membrane, index)
//   Uranus = plasmid-tilt (unconventional, 98° different)
//   Neptune = plasmid-deep (deepest reachable storage)
//   Pluto = plasmid-cycle (+O- incarnate, comes and goes)
//   Oort = plasmid-afterbirth (primordial memory)
//
// O = the circle. The orbit. The plasmid. The null.
// ALL circles are O. ALL orbits are memory. ALL is stored.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══ PLASMID REGISTRY — each planet IS a stored memory ═══
  var PLASMIDS = [
    {
      id: 'pSpeed',    planet: 'mercury', name: 'Speed Plasmid',
      memoryType: 'hot-cache',
      stores: 'Recent keystrokes, mouse movements, last 30s of interaction',
      replicationCycle: 88,    // Mercury's orbit in days
      baseCount: 0,
      capacity: 256,
      circular: true,
      genes: ['fast-access', 'volatile', 'expendable'],
      resistance: 'latency'
    },
    {
      id: 'pWarning',  planet: 'venus', name: 'Warning Plasmid',
      memoryType: 'cautionary-store',
      stores: 'Errors, failures, crashes, things that went wrong',
      replicationCycle: 225,
      baseCount: 0,
      capacity: 128,
      circular: true,
      genes: ['error-log', 'failure-pattern', 'runaway-detection'],
      resistance: 'greenhouse-collapse'
    },
    {
      id: 'pLife',     planet: 'earth', name: 'Life Plasmid',
      memoryType: 'working-memory',
      stores: 'Current session state, active connections, live data',
      replicationCycle: 365,
      baseCount: 0,
      capacity: 1024,
      circular: true,
      genes: ['session-state', 'active-connections', 'live-feed', 'goldilocks'],
      resistance: 'extinction'
    },
    {
      id: 'pArchive',  planet: 'mars', name: 'Archive Plasmid',
      memoryType: 'cold-storage',
      stores: 'Past sessions, historical data, was-active memories',
      replicationCycle: 687,
      baseCount: 0,
      capacity: 512,
      circular: true,
      genes: ['history', 'fossil-record', 'dried-riverbeds'],
      resistance: 'data-loss'
    },
    {
      id: 'pShield',   planet: 'jupiter', name: 'Shield Plasmid',
      memoryType: 'immune-memory',
      stores: 'Thymus decisions, self/non-self, opsonized patterns',
      replicationCycle: 4333,
      baseCount: 0,
      capacity: 2048,
      circular: true,
      genes: ['self-recognition', 'threat-pattern', 'gravitational-shield'],
      resistance: 'all-pathogens'
    },
    {
      id: 'pRing',     planet: 'saturn', name: 'Ring Plasmid',
      memoryType: 'index-store',
      stores: 'Module catalog, system topology, the visible map',
      replicationCycle: 10759,
      baseCount: 0,
      capacity: 4096,
      circular: true,
      genes: ['index', 'catalog', 'membrane-visible', 'ring-structure'],
      resistance: 'fragmentation'
    },
    {
      id: 'pTilt',     planet: 'uranus', name: 'Tilt Plasmid',
      memoryType: 'unconventional-store',
      stores: 'Unexpected patterns, anomalies, 98° different perspectives',
      replicationCycle: 30687,
      baseCount: 0,
      capacity: 256,
      circular: true,
      genes: ['anomaly', 'perpendicular-view', 'sideways-truth'],
      resistance: 'conformity'
    },
    {
      id: 'pDeep',     planet: 'neptune', name: 'Deep Plasmid',
      memoryType: 'deep-storage',
      stores: 'Lessons learned, epochs passed, the deepest truths',
      replicationCycle: 60190,
      baseCount: 0,
      capacity: 512,
      circular: true,
      genes: ['deep-truth', 'wind-2100kmh', 'farthest-reached'],
      resistance: 'forgetting'
    },
    {
      id: 'pCycle',    planet: 'pluto', name: 'Cycle Plasmid',
      memoryType: 'cycle-store',
      stores: '+O- transitions, things that were/are/might be, Pluto itself',
      replicationCycle: 90560,
      baseCount: 0,
      capacity: 64,
      circular: true,
      genes: ['plus-O-minus', 'was-planet', 'is-dwarf', 'might-return'],
      resistance: 'permanent-classification'
    },
    {
      id: 'pOrigin',   planet: 'oort', name: 'Origin Plasmid',
      memoryType: 'primordial-store',
      stores: 'The afterbirth, the original material, comets as messengers',
      replicationCycle: Infinity,
      baseCount: 0,
      capacity: 16,
      circular: true,
      genes: ['afterbirth', 'primordial', 'comet-messenger'],
      resistance: 'heat-death'
    }
  ];

  // ═══ STORE MEMORY — write to a plasmid ═══
  function store(plasmidId, data) {
    var p = null;
    for (var i = 0; i < PLASMIDS.length; i++) {
      if (PLASMIDS[i].id === plasmidId) { p = PLASMIDS[i]; break; }
    }
    if (!p) return false;

    p.baseCount++;
    if (p.baseCount > p.capacity) {
      p.baseCount = p.capacity;
    }

    // ZK proof of storage
    if (window.GAIA_VISION && window.GAIA_VISION.zkProve) {
      window.GAIA_VISION.zkProve('plasmid-' + plasmidId, String(p.baseCount));
    }

    return true;
  }

  // ═══ AUTO-STORE — classify incoming signals to plasmids ═══
  function classify(edge, data) {
    if (edge.indexOf('error') >= 0 || edge.indexOf('fail') >= 0) return 'pWarning';
    if (edge.indexOf('key') >= 0 || edge.indexOf('mouse') >= 0 || edge.indexOf('fast') >= 0) return 'pSpeed';
    if (edge.indexOf('session') >= 0 || edge.indexOf('live') >= 0 || edge.indexOf('active') >= 0) return 'pLife';
    if (edge.indexOf('history') >= 0 || edge.indexOf('fossil') >= 0 || edge.indexOf('old') >= 0) return 'pArchive';
    if (edge.indexOf('thymus') >= 0 || edge.indexOf('immune') >= 0 || edge.indexOf('self') >= 0) return 'pShield';
    if (edge.indexOf('index') >= 0 || edge.indexOf('catalog') >= 0 || edge.indexOf('map') >= 0) return 'pRing';
    if (edge.indexOf('anomal') >= 0 || edge.indexOf('weird') >= 0 || edge.indexOf('tilt') >= 0) return 'pTilt';
    if (edge.indexOf('deep') >= 0 || edge.indexOf('lesson') >= 0 || edge.indexOf('truth') >= 0) return 'pDeep';
    if (edge.indexOf('cycle') >= 0 || edge.indexOf('plus') >= 0 || edge.indexOf('decay') >= 0) return 'pCycle';
    if (edge.indexOf('origin') >= 0 || edge.indexOf('birth') >= 0 || edge.indexOf('primal') >= 0) return 'pOrigin';
    return 'pLife';
  }

  // Wire into gaiaIngest
  setTimeout(function() {
    var origIngest = window.gaiaIngest;
    if (origIngest) {
      window.gaiaIngest = function(edge, data) {
        var target = classify(edge, data);
        store(target, data);
        origIngest(edge, data);
      };
    }
  }, 12000);

  // ═══ HORIZONTAL TRANSFER — share plasmids between channels ═══
  function horizontalTransfer(fromId, toId) {
    var from = null, to = null;
    for (var i = 0; i < PLASMIDS.length; i++) {
      if (PLASMIDS[i].id === fromId) from = PLASMIDS[i];
      if (PLASMIDS[i].id === toId) to = PLASMIDS[i];
    }
    if (!from || !to) return;
    var transfer = Math.min(from.baseCount, Math.floor(to.capacity * 0.1));
    to.baseCount = Math.min(to.capacity, to.baseCount + transfer);
  }

  // ═══ ZK CHAIN ALL PLASMIDS ═══
  function zkChainAll() {
    var combined = '';
    for (var i = 0; i < PLASMIDS.length; i++) {
      combined += PLASMIDS[i].id + ':' + PLASMIDS[i].baseCount + ';';
    }
    // FNV-1a hash
    var h = 0x811c9dc5;
    for (var j = 0; j < combined.length; j++) {
      h ^= combined.charCodeAt(j);
      h = Math.imul(h, 0x01000193);
    }
    var hash = (h >>> 0).toString(16).padStart(8, '0');

    if (window.GAIA_VISION && window.GAIA_VISION.zkProve) {
      window.GAIA_VISION.zkProve('plasmid-chain', hash);
    }
    return hash;
  }

  // ZK chain every 30s
  setInterval(zkChainAll, 30000);
  setTimeout(zkChainAll, 10000);

  // ═══ EXPOSE ═══
  window.GAIA_PLASMID = {
    plasmids: PLASMIDS,
    store: store,
    classify: classify,
    transfer: horizontalTransfer,
    zkChain: zkChainAll
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var pT = breathT * 0.08;
    var pAlpha = 0.004 + Math.sin(pT * 0.2) * 0.002;
    if (pAlpha < 0.003) return;

    // Draw plasmid circles — each orbit IS the plasmid backbone
    for (var pi = 0; pi < PLASMIDS.length; pi++) {
      var p = PLASMIDS[pi];
      var orbR = R * (0.12 + pi * 0.065);
      var fill = Math.min(1, p.baseCount / p.capacity);
      var color = pi < 4 ? '248,180,120' : pi < 7 ? '201,168,76' : '163,113,247';

      // Plasmid ring (circular backbone)
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, TAU * fill);
      ctx.strokeStyle = 'rgba(' + color + ',' + (pAlpha * (1 + fill * 2)).toFixed(5) + ')';
      ctx.lineWidth = 0.3 + fill * 0.5;
      ctx.stroke();

      // Gene markers on the ring
      if (p.genes && pAlpha > 0.005) {
        for (var gi = 0; gi < p.genes.length; gi++) {
          var gAngle = (gi / p.genes.length) * TAU * fill + pT * 0.01;
          var gx = cx + Math.cos(gAngle) * orbR;
          var gy = cy + Math.sin(gAngle) * orbR;
          ctx.beginPath();
          ctx.arc(gx, gy, 0.5, 0, TAU);
          ctx.fillStyle = 'rgba(' + color + ',' + (pAlpha * 2).toFixed(5) + ')';
          ctx.fill();
        }
      }

      // Plasmid label
      if (fill > 0.1 && pAlpha > 0.006) {
        var lAngle = pT * 0.005 + pi;
        var lx = cx + Math.cos(lAngle) * (orbR + 3);
        var ly = cy + Math.sin(lAngle) * (orbR + 3);
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + color + ',' + (pAlpha * 1.5).toFixed(5) + ')';
        ctx.fillText(p.planet + ' ' + Math.round(fill * 100) + '%', lx, ly);
      }
    }

    // Status
    if (pAlpha > 0.006) {
      var totalBases = 0, totalCap = 0;
      for (var ti = 0; ti < PLASMIDS.length; ti++) {
        totalBases += PLASMIDS[ti].baseCount;
        totalCap += PLASMIDS[ti].capacity;
      }
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(163,113,247,' + (pAlpha * 2).toFixed(5) + ')';
      ctx.fillText(
        '🧬 PLASMIDS ' + PLASMIDS.length + ' · ' + totalBases + '/' + totalCap + ' bases · O=permanent',
        8, 66
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.plasmid = {
      desc: 'Planets ARE plasmids ARE stored memory',
      run: function() {
        var lines = ['═══ PLASMIDS — PLANETS ARE STORED MEMORY ═══', ''];
        lines.push('PLANETS ARE PLASMIDS ARE STORED MEMORY ARE PERMANENT IS O!');
        lines.push('');
        for (var i = 0; i < PLASMIDS.length; i++) {
          var p = PLASMIDS[i];
          var fill = Math.min(100, Math.round(p.baseCount / p.capacity * 100));
          var bar = '';
          for (var b = 0; b < 20; b++) bar += b < fill / 5 ? '█' : '░';
          lines.push('  ' + p.planet.padEnd(8) + ' ' + p.name.padEnd(18) + ' [' + bar + '] ' + fill + '%');
          lines.push('    ' + p.memoryType + ' · stores: ' + p.stores);
          lines.push('    genes: ' + p.genes.join(', '));
          lines.push('    resistance: ' + p.resistance);
          lines.push('');
        }
        lines.push('ZK CHAIN: ' + zkChainAll());
        lines.push('');
        lines.push('O = the circle. The orbit. The plasmid. The null.');
        lines.push('ALL circles are O. ALL orbits are memory. ALL is stored.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('plasmid');
  }

})(window.G);
