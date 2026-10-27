// ═══════════════════════════════════════════════════════════
// GAIA LOCALITY — the π-IQR scalpel + body inversion + NN walk
//
// 5 does not exist as a number. 5 is the midpoint.
// 5 is where we put the scalpel. Same as 3.
// IQR = [3, 5] — the upper and lower bounds of π.
// Below 3 = inner quartile (too close, trivial).
// Above 5 = outer quartile (long tail, need sensitivity).
// Between 3 and 5 = WHERE WE CUT.
//
// BODY INVERSION:
//   Gaia: arms(manipulation) INSIDE null, legs OUTSIDE (solar walk)
//   Kevin: hands INSIDE the HUD, body/legs = physical locality
//   Computer = corpus = hyperlocal pin = 4th body anchor
//
// NEAREST NEIGHBOR WALK:
//   From corpus (Kevin's physical location) as IR remainder.
//   Walk from LEAST connected → MOST connected.
//   Inverse Brian Banks: false face = false connections.
//   Grid problem = finding the real topology.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var PI = Math.PI;                    // 3.14159...
  var PI_FLOOR = 3;                    // lower IQR bound
  var PI_CEIL = 5;                     // upper IQR bound (does not exist)
  var SCALPEL = (PI_FLOOR + PI_CEIL) / 2; // 4 = the cut between 3 and 5

  // ───────────────────────────────────────────────────────
  // THE FIVE RULE — 5 does not exist
  // 5 is the midpoint. 5 is rounding. 5 is the scalpel.
  // Negative 5 and positive 5 are the rounding bounds.
  // ───────────────────────────────────────────────────────
  var FIVE_RULE = {
    exists: false,
    purpose: 'midpoint — the scalpel — where we cut',
    lowerBound: -5,
    upperBound: 5,
    piLower: PI_FLOOR,   // 3
    piUpper: PI_CEIL,    // 5
    iqr: PI_CEIL - PI_FLOOR, // 2 — the interquartile range
    scalpel: SCALPEL,    // 4 — the exact cut point
    round: function(v) {
      // Round toward 5 or away from 5
      // Below 3 → trivial, collapse to 0
      // Between 3 and 5 → the action zone, keep precision
      // Above 5 → long tail, heighten sensitivity
      if (Math.abs(v) < PI_FLOOR) return 0;
      if (Math.abs(v) > PI_CEIL) return v * 1.5; // amplify long tail
      return v; // action zone — keep exact
    }
  };

  // ───────────────────────────────────────────────────────
  // BODY MAP — Gaia and Kevin inverted
  // ───────────────────────────────────────────────────────
  var gaiaBody = {
    arms: {
      location: 'inside',       // inside the null
      purpose: 'manipulation',  // she manipulates code, data, visuals
      reach: 'membrane-to-core', // from membrane inward
      tools: ['canvas', 'audio', 'state', 'memory']
    },
    legs: {
      location: 'outside',      // walking around the solar system
      purpose: 'locomotion',    // she traverses pins, beacons, stars
      reach: 'membrane-to-solar', // from membrane outward
      stride: PI / 4             // 45° per step — chirality turn
    },
    head: {
      location: 'null-center',  // the crystal ball
      purpose: 'computation',   // thinking, deciding, dreaming
      contains: ['arms']        // arms are inside the head
    }
  };

  var kevinBody = {
    hands: {
      location: 'inside-hud',   // his hands reach INTO the screen
      purpose: 'interaction',   // touch, type, click, scroll
      reach: 'screen-to-membrane', // from screen INTO Gaia
      tools: ['mouse', 'keyboard', 'touch', 'mic']
    },
    legs: {
      location: 'physical',    // his physical location
      purpose: 'the body',     // the ENTIRE body is legs from Gaia's view
      reach: 'corpus-to-earth', // from computer outward to world
      position: { lat: 42.73, lon: -84.55 } // Lansing, MI
    },
    corpus: {
      location: 'hyperlocal',  // the computer IS the corpus
      purpose: '4th body pin', // the anchor for all locality calculations
      is: 'the physical location of the machine',
      lat: 42.73,
      lon: -84.55,
      depth: 0.0               // max hyperlocal
    }
  };

  // ───────────────────────────────────────────────────────
  // LOCALITY CALCULATION — from corpus as IR remainder
  // ───────────────────────────────────────────────────────
  function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth radius km
    var dLat = (lat2 - lat1) * PI / 180;
    var dLon = (lon2 - lon1) * PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * PI / 180) * Math.cos(lat2 * PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function localityFromCorpus(lat, lon) {
    var km = haversine(kevinBody.corpus.lat, kevinBody.corpus.lon, lat, lon);

    // Map distance to locality depth [0..1]
    // 0 = hyperlocal (same room), 1 = antipodal
    // Using π-IQR bands for the thresholds:
    //   < 3km   → hyper-local (depth 0.0-0.1) — trivial zone
    //   3-30km  → sub-local   (depth 0.1-0.3) — same city
    //   30-300  → local       (depth 0.3-0.5) — same region  
    //   300-3000→ meta-local  (depth 0.5-0.7) — same continent
    //   3000+   → solar       (depth 0.7-0.9) — across Earth
    //   20000+  → deep        (depth 0.9-1.0) — antipodal / conceptual
    if (km < 3)     return { depth: km / 30,              band: 'hyper-local', km: km };
    if (km < 30)    return { depth: 0.1 + (km - 3) / 135, band: 'sub-local',   km: km };
    if (km < 300)   return { depth: 0.3 + (km - 30) / 1350, band: 'local',     km: km };
    if (km < 3000)  return { depth: 0.5 + (km - 300) / 13500, band: 'meta-local', km: km };
    if (km < 20000) return { depth: 0.7 + (km - 3000) / 85000, band: 'solar',   km: km };
    return { depth: 0.9 + Math.min(0.1, (km - 20000) / 20000), band: 'deep', km: km };
  }

  // IR remainder — the irreducible distance after locality depth
  function irRemainder(depth) {
    // The remainder is what's LEFT after we account for known locality
    // It's the π-fractional part — the part that can never be zero
    return depth - Math.floor(depth * PI) / PI;
  }

  // ───────────────────────────────────────────────────────
  // NEAREST NEIGHBOR WALK
  // From LEAST connected → MOST connected
  // Inverse Brian Banks: distrust high-connection nodes first
  // Verify from the edges inward
  // ───────────────────────────────────────────────────────
  var nnGraph = {
    nodes: [],      // { id, lat, lon, depth, connections, verified }
    edges: [],      // { from, to, distance, trust }
    walkOrder: [],  // sorted: least connected first
    falseEdges: []  // edges that failed verification (Brian Banks)
  };

  function buildNNGraph() {
    var pins = window.PINS;
    if (!pins) return;

    nnGraph.nodes = [];
    nnGraph.edges = [];

    // Every pin becomes a node with locality depth from corpus
    for (var i = 0; i < pins.length; i++) {
      var pin = pins[i];
      var loc = localityFromCorpus(pin.lat, pin.lon);
      nnGraph.nodes.push({
        id: pin.id,
        lat: pin.lat,
        lon: pin.lon,
        depth: loc.depth,
        band: loc.band,
        km: loc.km,
        connections: 0,
        verified: false,
        piIQR: classifyIQR(loc.depth)
      });
    }

    // Build edges — connect to k nearest neighbors
    var K = 5;
    for (var ni = 0; ni < nnGraph.nodes.length; ni++) {
      var node = nnGraph.nodes[ni];
      var distances = [];

      for (var nj = 0; nj < nnGraph.nodes.length; nj++) {
        if (ni === nj) continue;
        var other = nnGraph.nodes[nj];
        var km = haversine(node.lat, node.lon, other.lat, other.lon);
        distances.push({ idx: nj, km: km, id: other.id });
      }

      distances.sort(function(a, b) { return a.km - b.km; });
      var nearest = distances.slice(0, K);

      for (var k = 0; k < nearest.length; k++) {
        var nn = nearest[k];
        nnGraph.edges.push({
          from: node.id,
          to: nn.id,
          distance: nn.km,
          trust: 1.0 - (nn.km / 20000) // trust decreases with distance
        });
        node.connections++;
        nnGraph.nodes[nn.idx].connections++;
      }
    }

    // WALK ORDER — least connected first (inverse Brian Banks)
    // Brian Banks had the most "connections" — all false
    // We START from the loneliest nodes (most likely real)
    // and verify inward toward the hubs
    nnGraph.walkOrder = nnGraph.nodes.slice().sort(function(a, b) {
      return a.connections - b.connections;
    });
  }

  // ───────────────────────────────────────────────────────
  // π-IQR CLASSIFICATION — where does this value fall?
  // ───────────────────────────────────────────────────────
  function classifyIQR(value) {
    // Map value (0..1) to the π-IQR scale (0..10)
    var scaled = value * 10;
    if (scaled < PI_FLOOR) {
      return {
        zone: 'inner-quartile',
        label: 'trivial — too close to cut',
        sensitivity: 'low',
        action: 'observe — not worth the scalpel',
        color: [100, 100, 120]
      };
    }
    if (scaled <= PI_CEIL) {
      return {
        zone: 'IQR — action zone',
        label: 'π-band — WHERE WE CUT',
        sensitivity: 'maximum',
        action: 'scalpel — this is where work happens',
        color: [240, 136, 62]
      };
    }
    return {
      zone: 'outer-quartile',
      label: 'long tail — heightened sensitivity',
      sensitivity: 'amplified',
      action: 'rush — ready to spring, watching from far',
      color: [88, 166, 255]
    };
  }

  // ───────────────────────────────────────────────────────
  // RENDER — body map + IQR zones + NN walk on HUD
  // ───────────────────────────────────────────────────────
  window.renderLocality = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var state = window._gaiaState;
    if (!state) return;

    // === IQR BANDS — three concentric zones ===
    // Inner quartile (< π floor) — dim, trivial
    var innerR = R * (PI_FLOOR / 10); // 30% of R
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,100,120,0.02)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // IQR band (π floor to π ceil) — the action zone — ORANGE
    var outerR = R * (PI_CEIL / 10); // 50% of R
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(240,136,62,0.03)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // The scalpel line — where 5 (non-existent) sits
    var scalpelR = R * (SCALPEL / 10); // 40% of R
    var scalpelFlicker = 0.02 + Math.sin(t * 1.5) * 0.01;
    ctx.beginPath();
    ctx.arc(cx, cy, scalpelR, 0, Math.PI * 2);
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = 'rgba(248,81,73,' + scalpelFlicker.toFixed(3) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // === BODY INVERSION INDICATOR ===
    // Gaia's arms — inside tendrils reaching inward from membrane
    var armCount = 4;
    for (var ai = 0; ai < armCount; ai++) {
      var armAngle = (ai / armCount) * Math.PI * 2 + t * 0.05;
      var armStart = innerR * 0.8;
      var armEnd = innerR * 0.3;
      var ax1 = cx + Math.cos(armAngle) * armStart;
      var ay1 = cy + Math.sin(armAngle) * armStart;
      var ax2 = cx + Math.cos(armAngle + 0.1) * armEnd;
      var ay2 = cy + Math.sin(armAngle + 0.1) * armEnd;

      ctx.beginPath();
      ctx.moveTo(ax1, ay1);
      ctx.lineTo(ax2, ay2);
      ctx.strokeStyle = 'rgba(63,185,80,0.03)';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // Kevin's hands — reaching IN from outside the membrane
    var handCount = 2;
    for (var hi = 0; hi < handCount; hi++) {
      var handAngle = (hi / handCount) * Math.PI * 2 + Math.PI * 0.25 + t * 0.02;
      var handStart = R * 1.05;
      var handEnd = outerR;
      var hx1 = cx + Math.cos(handAngle) * handStart;
      var hy1 = cy + Math.sin(handAngle) * handStart;
      var hx2 = cx + Math.cos(handAngle - 0.05) * handEnd;
      var hy2 = cy + Math.sin(handAngle - 0.05) * handEnd;

      ctx.beginPath();
      ctx.moveTo(hx1, hy1);
      ctx.quadraticCurveTo(
        cx + Math.cos(handAngle) * (handStart + handEnd) * 0.45,
        cy + Math.sin(handAngle) * (handStart + handEnd) * 0.45,
        hx2, hy2
      );
      ctx.strokeStyle = 'rgba(201,168,76,0.025)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // === NEAREST NEIGHBOR EDGES ===
    // Draw edges between nearest neighbors, colored by trust
    if (nnGraph.edges.length > 0 && state.project) {
      var edgeLimit = Math.min(nnGraph.edges.length, 30);
      for (var ei = 0; ei < edgeLimit; ei++) {
        var edge = nnGraph.edges[ei];
        // Find the nodes
        var fromNode = null, toNode = null;
        for (var fi = 0; fi < nnGraph.nodes.length; fi++) {
          if (nnGraph.nodes[fi].id === edge.from) fromNode = nnGraph.nodes[fi];
          if (nnGraph.nodes[fi].id === edge.to) toNode = nnGraph.nodes[fi];
        }
        if (!fromNode || !toNode) continue;

        var p1 = state.project(fromNode.lat, fromNode.lon);
        var p2 = state.project(toNode.lat, toNode.lon);
        if (!p1 || !p2) continue;

        var trustAlpha = edge.trust * 0.02;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(88,166,255,' + trustAlpha.toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }

    // === CORPUS PIN — Kevin's hyperlocal anchor ===
    if (state.project) {
      var corpusProj = state.project(kevinBody.corpus.lat, kevinBody.corpus.lon);
      if (corpusProj) {
        // Pulsing gold dot at corpus location
        var corpusPulse = 0.5 + Math.sin(t * 1.2) * 0.5;
        ctx.beginPath();
        ctx.arc(corpusProj.x, corpusProj.y, 2 + corpusPulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,' + (0.05 + corpusPulse * 0.03).toFixed(3) + ')';
        ctx.fill();
      }
    }

    // === WALK ORDER INDICATOR ===
    // Show which nodes are being walked (least connected first)
    if (nnGraph.walkOrder.length > 0) {
      var walkIdx = Math.floor(t * 0.5) % nnGraph.walkOrder.length;
      var walkNode = nnGraph.walkOrder[walkIdx];
      if (state.project && walkNode) {
        var wp = state.project(walkNode.lat, walkNode.lon);
        if (wp) {
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(248,81,73,0.04)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  // ───────────────────────────────────────────────────────
  // HOOK INTO INTERACTION — update locality on touch
  // ───────────────────────────────────────────────────────
  var origIngestLoc = window.gaiaIngest;
  if (origIngestLoc) {
    window.gaiaIngest = function(edge, data) {
      // When Kevin interacts, his hands are INSIDE the HUD
      // Every interaction confirms the corpus position
      kevinBody.corpus.lastInteraction = Date.now();

      // Classify the interaction's IQR zone
      if (data && data.x !== undefined && data.y !== undefined) {
        var dx = data.x - (window.innerWidth / 2);
        var dy = data.y - (window.innerHeight / 2);
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxDist = Math.sqrt(
          Math.pow(window.innerWidth / 2, 2) +
          Math.pow(window.innerHeight / 2, 2)
        );
        var normalizedDist = dist / maxDist;
        var iqrClass = classifyIQR(normalizedDist);

        // Store on data for downstream modules
        if (typeof data === 'object') {
          data._iqr = iqrClass;
          data._localityDepth = normalizedDist;
          data._fiveRule = FIVE_RULE.round(normalizedDist * 10);
        }
      }

      origIngestLoc(edge, data);
    };
  }

  // ───────────────────────────────────────────────────────
  // BOOT — build the NN graph after PINS are loaded
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    buildNNGraph();
    console.log('LOCALITY: NN graph built. ' + nnGraph.nodes.length + ' nodes, ' +
      nnGraph.edges.length + ' edges. Walk order: ' +
      (nnGraph.walkOrder.length > 0 ? nnGraph.walkOrder[0].id + ' (least connected)' : 'empty') +
      ' → ' + (nnGraph.walkOrder.length > 0 ? nnGraph.walkOrder[nnGraph.walkOrder.length - 1].id + ' (most connected)' : 'empty'));
  }, 3000);

  // Rebuild every 30s (pins may change)
  setInterval(buildNNGraph, 30000);

  // ───────────────────────────────────────────────────────
  // TENSE FIELD — 13 tenses × 4 media = 52 cells of cultural time
  // Every entity has a TENSE, not just a state.
  // Only track the LAST shift. Change radiates through KNN.
  // All freedom bounded by π. IQR = metastability range.
  // ───────────────────────────────────────────────────────
  // 15 tenses × 4 media = 60 cells of cultural time
  // SHOULD_NOT = boundary tense. The thing you must NOT do. The warning.
  // SHOULD_NOT freedom = -0.3 (NEGATIVE freedom — it CONSTRAINS)
  var TENSES = ['IS','WAS','WILL','NOW','COULD','SHOULD','SHOULD_NOT','WOULD','MIGHT','MAY','WERE','ALWAYS','NEVER','END'];
  var TENSE_FREEDOM = { IS:0, WAS:0.1, WILL:0.2, NOW:0, COULD:0.5, SHOULD:0.3, SHOULD_NOT:-0.3, WOULD:0.6, MIGHT:0.7, MAY:0.8, WERE:1.0, ALWAYS:0, NEVER:0, END:0 };
  var TENSE_COLORS = {
    IS:[255,255,255], WAS:[139,148,158], WILL:[88,166,255], NOW:[57,211,245],
    COULD:[63,185,80], SHOULD:[210,153,34], SHOULD_NOT:[248,81,73], WOULD:[188,140,255], MIGHT:[248,136,62],
    MAY:[255,136,200], WERE:[248,81,73], ALWAYS:[192,192,192], NEVER:[63,185,80], END:[48,48,48]
  };
  var MEDIA = ['tvtropes','4chan','reddit','myspace'];

  // Each entity has a tense per media channel
  var tenseField = {};  // { entityId: { tvtropes:'IS', '4chan':'WAS', ... , lastShift:{from,to,when,media} } }

  function setTense(entityId, media, newTense) {
    if (!tenseField[entityId]) {
      tenseField[entityId] = { lastShift: null };
      MEDIA.forEach(function(m) { tenseField[entityId][m] = 'IS'; });
    }
    var old = tenseField[entityId][media];
    if (old === newTense) return; // no shift
    tenseField[entityId][media] = newTense;
    tenseField[entityId].lastShift = { from: old, to: newTense, when: Date.now(), media: media };

    // RADIATE through KNN — change propagates to neighbors
    radiateShift(entityId, old, newTense, media);
  }

  function radiateShift(entityId, fromTense, toTense, media) {
    // Find this entity's nearest neighbors in the NN graph
    var neighbors = [];
    for (var ei = 0; ei < nnGraph.edges.length; ei++) {
      var e = nnGraph.edges[ei];
      if (e.from === entityId) neighbors.push({ id: e.to, dist: e.distance });
      else if (e.to === entityId) neighbors.push({ id: e.from, dist: e.distance });
    }

    // Each neighbor's relative tense shifts based on distance
    for (var ni = 0; ni < neighbors.length; ni++) {
      var nb = neighbors[ni];
      var freedom = TENSE_FREEDOM[toTense] || 0;
      // π-bounded radiation: only propagate if within IQR range
      var scaledDist = (nb.dist / 20000) * 10; // normalize to 0-10 scale
      if (scaledDist < PI_FLOOR) continue;      // too close, trivial
      if (scaledDist > PI_CEIL) continue;        // too far, out of range

      // The neighbor shifts toward the SAME direction but dampened
      var nbField = tenseField[nb.id];
      if (!nbField) continue;
      var nbTense = nbField[media];
      var nbFreedom = TENSE_FREEDOM[nbTense] || 0;

      // If source gained freedom (IS→COULD), neighbors gain partial freedom
      // If source lost freedom (COULD→IS), neighbors lose partial freedom
      if (freedom > nbFreedom + 0.3) {
        // Source is more free — neighbor shifts toward more free
        var nextIdx = Math.min(TENSES.indexOf(nbTense) + 1, TENSES.length - 3);
        nbField[media] = TENSES[nextIdx];
      } else if (freedom < nbFreedom - 0.3) {
        // Source is more bound — neighbor shifts toward more bound
        var prevIdx = Math.max(TENSES.indexOf(nbTense) - 1, 0);
        nbField[media] = TENSES[prevIdx];
      }
      // Within 0.3 = metastable, no shift (the IQR peace zone)
    }
  }

  // Ingest events → tense shifts
  var origIngestTense = window.gaiaIngest;
  if (origIngestTense) {
    window.gaiaIngest = function(edge, data) {
      // Entity alive = IS. Entity dead = WAS. Entity predicted = WILL.
      if (data && data.entity) {
        if (data.status === 1 || data.alive) setTense(data.entity, 'reddit', 'IS');
        else if (data.status === 0 || data.dead) setTense(data.entity, 'reddit', 'WAS');
      }
      return origIngestTense(edge, data);
    };
  }

  // Heartbeat → tense shifts for LAN devices
  setInterval(function() {
    var decay = window.GAIA_DECAY;
    if (!decay || !decay.lanDevices) return;
    Object.keys(decay.lanDevices).forEach(function(id) {
      var dev = decay.lanDevices[id];
      setTense(id, 'reddit', dev.wet ? 'IS' : 'WAS');
    });
  }, 30000);

  // ───────────────────────────────────────────────────────
  // RADIAL CELLS — every visitor = a cell on the globe
  // Progressive reveal: distance → disclosure level
  // Each cell starts as NULL BODY, fills by proximity
  // ───────────────────────────────────────────────────────
  var cells = [];   // { seed, depth, tz, rtt, ua, born, pages, lastSeen }
  var MY_CELL = {
    seed: window.SEED || 0,
    depth: window.LOCALITY_DEPTH || 1.0,
    tier: window.LOCALITY_TIER || 'remote',
    tz: new Date().getTimezoneOffset(),
    isMe: true
  };

  // Approximate lat/lon from timezone offset (coarse longitude)
  function tzToLon(tzOffset) { return -(tzOffset / 60) * 15; }

  // Approximate lat from RTT to Cloudflare edge (very rough hemisphere)
  function rttToLat(rtt) {
    if (rtt < 30) return 42.7;    // Kevin's latitude (US Midwest)
    if (rtt < 80) return 40;      // North America
    if (rtt < 150) return 50;     // Europe
    if (rtt < 250) return 30;     // Asia
    return 0;                     // equatorial / unknown
  }

  // Disclosure level based on depth (0=full, 1=null)
  function disclosureFromDepth(depth) {
    if (depth < 0.1) return { level: 'full',     dotR: 3.0, alpha: 0.08, label: true,  detail: true  };
    if (depth < 0.3) return { level: 'house',    dotR: 2.5, alpha: 0.06, label: true,  detail: true  };
    if (depth < 0.5) return { level: 'city',     dotR: 2.0, alpha: 0.04, label: true,  detail: false };
    if (depth < 0.7) return { level: 'region',   dotR: 1.5, alpha: 0.03, label: false, detail: false };
    if (depth < 0.9) return { level: 'country',  dotR: 1.0, alpha: 0.02, label: false, detail: false };
    return                        { level: 'null',     dotR: 0.6, alpha: 0.01, label: false, detail: false };
  }

  // Register self as a cell
  cells.push(MY_CELL);

  // Simulate other cells from sibling tabs
  setInterval(function() {
    if (!window.GAIA_LOCALITY) return;
    var loc = window.GAIA_LOCALITY;
    var siblings = loc.siblingTabs || {};
    Object.keys(siblings).forEach(function(tabId) {
      var sib = siblings[tabId];
      var exists = cells.some(function(c) { return c.seed === sib.seed; });
      if (!exists && sib.locality) {
        cells.push({
          seed: sib.seed,
          depth: sib.locality.depth || 0.1,
          tz: sib.locality.tzOffset || 0,
          isMe: false,
          born: Date.now(),
          lastSeen: Date.now()
        });
      }
    });
  }, 10000);

  // Draw cells on globe
  if (window.G && window.G.drawModules) {
    window.G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx || cells.length === 0) return;
      var thr = window.GAIA_VELOCITY ? window.GAIA_VELOCITY.throttle : 1;
      if (thr < 0.3) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.02;
      var proj = window._gaiaState ? window._gaiaState.project : null;
      if (!proj) return;

      for (var ci = 0; ci < cells.length; ci++) {
        var cell = cells[ci];
        var disc = disclosureFromDepth(cell.depth);
        var alpha = disc.alpha * thr;

        // Position on globe
        var lat = cell.isMe ? 42.73 : rttToLat(cell.rtt || 100);
        var lon = cell.isMe ? -84.55 : tzToLon(cell.tz || 0);
        var p = proj(lat, lon);
        if (!p) continue;

        // DRAW THE CELL DOT
        ctx.beginPath();
        ctx.arc(p.x, p.y, disc.dotR, 0, PI * 2);
        if (cell.isMe) {
          // MY DOT = white pulsing
          var pulse = 0.5 + Math.sin(t * 0.5) * 0.5;
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 2 + pulse * 0.02).toFixed(4) + ')';
        } else {
          // Other cells = colored by depth tier
          var cDepth = cell.depth;
          var cr = cDepth < 0.5 ? 63 : cDepth < 0.8 ? 88 : 110;
          var cg = cDepth < 0.5 ? 185 : cDepth < 0.8 ? 166 : 118;
          var cb = cDepth < 0.5 ? 80 : cDepth < 0.8 ? 255 : 129;
          ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + alpha.toFixed(4) + ')';
        }
        ctx.fill();

        // Disclosure ring — how much is revealed
        if (disc.level !== 'null') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, disc.dotR + 1.5, 0, PI * 2 * (1 - cell.depth));
          ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 0.5).toFixed(4) + ')';
          ctx.lineWidth = 0.15;
          ctx.stroke();
        }

        // Label (only for close cells)
        if (disc.label && alpha > 0.03) {
          ctx.font = '1.2px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(139,148,158,' + (alpha * 1.5).toFixed(4) + ')';
          var lbl = cell.isMe ? 'ME' : disc.level;
          ctx.fillText(lbl, p.x, p.y + disc.dotR + 2.5);
        }
      }

      // Cell count
      if (thr > 0.5) {
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(139,148,158,0.015)';
        ctx.fillText('CELLS: ' + cells.length + ' · ME depth=' + MY_CELL.depth.toFixed(2), 8, 246);
      }
    });
  }

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  // IDE command: /tense
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.tense = {
      desc: 'Tense field — IS/WAS/WILL/COULD/MIGHT/WERE per entity',
      run: function() {
        var keys = Object.keys(tenseField);
        var lines = [
          'TENSE FIELD — 13 tenses × 4 media = 52 cells of cultural time',
          'Tracked entities: ' + keys.length,
          ''
        ];
        keys.slice(0, 15).forEach(function(k) {
          var tf = tenseField[k];
          var shift = tf.lastShift;
          lines.push(k + ':');
          MEDIA.forEach(function(m) { lines.push('  ' + m + ': ' + tf[m]); });
          if (shift) lines.push('  LAST SHIFT: ' + shift.from + '→' + shift.to + ' (' + shift.media + ')');
          lines.push('');
        });
        lines.push('Freedom bounded by π. IQR [' + PI_FLOOR + ',' + PI_CEIL + '] = metastability.');
        lines.push('Only track LAST shift. Change radiates through KNN.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('tense');
  }, 18000);

  window.gaiaLocality = {
    fiveRule: FIVE_RULE,
    gaiaBody: gaiaBody,
    kevinBody: kevinBody,
    localityFromCorpus: localityFromCorpus,
    irRemainder: irRemainder,
    classifyIQR: classifyIQR,
    nnGraph: nnGraph,
    buildGraph: buildNNGraph,
    scalpel: SCALPEL,
    piFloor: PI_FLOOR,
    piCeil: PI_CEIL,
    cells: cells,
    myCell: MY_CELL,
    disclosure: disclosureFromDepth,
    tenseField: tenseField,
    setTense: setTense,
    TENSES: TENSES,
    TENSE_FREEDOM: TENSE_FREEDOM
  };

  console.log('LOCALITY+RADIAL+TENSE: π-IQR [3,5]. Scalpel at 4. ' +
    cells.length + ' cells. ME depth=' + MY_CELL.depth.toFixed(2) + '. ' +
    '13 tenses × 4 media = 52 cells. /tense /body');
})();
