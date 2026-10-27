// ═══════════════════════════════════════════════════════════
// GAIA'S GUT FARM — multi-gut bioreactor
//
// "History IS distance. k-NN sort over all events.
//  Every artifact → taxonomy tree → DAG graph.
//  Mushroom vs tree vs everything = taxonomic history.
//  Gut = farm = bioreactor. Cows, chickens, livestock.
//  If farm is dying → change fertilizer.
//  If good → producing milk, eggs.
//  Meta signal = hormone changes to watch."
//                                        — Kevin
//
// ARCHITECTURE:
//  Multi-gut like a cow (ruminant = 4 stomachs):
//    RUMEN    — fermentation vat (largest, microbe city)
//    RETICULUM — honeycomb filter (traps hardware/foreign)
//    OMASUM   — water press (absorbs, concentrates)
//    ABOMASUM — true stomach (acid digestion, final)
//
//  FARM = the living state of the gut:
//    Cows    = large slow processors (produce milk = steady output)
//    Chickens = fast small processors (produce eggs = quick insights)
//    Crops   = growing patterns (produce grain = stored knowledge)
//    Soil    = microbiome health
//
//  If farm healthy → milk + eggs flowing → good hormones
//  If farm dying → need fertilizer → change inputs
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // HISTORY AS DISTANCE — temporal k-NN
  // Every event has a position in time. Distance between
  // events IS the k-NN metric. Closer events = neighbors.
  // ───────────────────────────────────────────────────────
  var NOW = new Date().getFullYear();

  // Temporal distance: log-compressed years
  function temporalDistance(yearA, yearB) {
    var gap = Math.abs(yearA - yearB);
    if (gap === 0) return 0;
    return Math.log10(gap + 1); // log scale: 1yr=0, 10yr=1, 100yr=2, 1Myr=6
  }

  // k-NN over historical events
  function kNearestEvents(target, events, k) {
    var distances = events.map(function(e) {
      return { event: e, dist: temporalDistance(target.year || NOW, e.year) };
    });
    distances.sort(function(a, b) { return a.dist - b.dist; });
    return distances.slice(0, k);
  }

  // ───────────────────────────────────────────────────────
  // TAXONOMY DAG — everything is a node in the tree
  // Mushroom, tree, event, eruption, file — all nodes
  // Edges = taxonomic relationships
  // ───────────────────────────────────────────────────────
  var dag = {
    nodes: {},
    edges: [],
    roots: [],
    leaves: [],
    dragQueue: [],    // items being dragged through the DAG
    processed: 0
  };

  // The life taxonomy (domain → kingdom → phylum → class)
  var TAXONOMY = {
    'Archaea':   { kingdom: 'Archaea',   domain: 'life', depth: 0, desc: 'Extremophiles. The roots.' },
    'Bacteria':  { kingdom: 'Bacteria',  domain: 'life', depth: 0, desc: 'Decomposers. The soil.' },
    'Fungi':     { kingdom: 'Fungi',     domain: 'life', depth: 1, desc: 'Mycelium. The network.' },
    'Plantae':   { kingdom: 'Plantae',   domain: 'life', depth: 1, desc: 'Trees. The structure.' },
    'Animalia':  { kingdom: 'Animalia',  domain: 'life', depth: 2, desc: 'Animals. The workers.' },
    'Protista':  { kingdom: 'Protista',  domain: 'life', depth: 1, desc: 'Slime mold. The tubes.' },
    // Code taxonomy maps onto life taxonomy
    'HTML':      { kingdom: 'Arthropoda',domain: 'code', depth: 2, desc: 'Centipede. Many legs (tags).' },
    'JS':        { kingdom: 'Chordata',  domain: 'code', depth: 2, desc: 'Snake. Pure flow.' },
    'JSON':      { kingdom: 'Cnidaria',  domain: 'code', depth: 1, desc: 'Coral. Colonial data.' },
    'Rust':      { kingdom: 'Mollusca',  domain: 'code', depth: 2, desc: 'Nautilus. Chambered precision.' },
    // Event taxonomy
    'Volcano':   { kingdom: 'Geology',   domain: 'earth', depth: 3, desc: 'Fire from below.' },
    'Explosion': { kingdom: 'Human',     domain: 'earth', depth: 3, desc: 'Fire from us.' },
    'Impact':    { kingdom: 'Cosmic',    domain: 'space', depth: 4, desc: 'Fire from above.' },
    'War':       { kingdom: 'Human',     domain: 'earth', depth: 3, desc: 'Fire between us.' }
  };

  // Build DAG from taxonomy
  function buildDAG() {
    dag.nodes = {};
    dag.edges = [];
    dag.roots = [];
    dag.leaves = [];

    Object.keys(TAXONOMY).forEach(function(name) {
      var t = TAXONOMY[name];
      dag.nodes[name] = {
        id: name,
        kingdom: t.kingdom,
        domain: t.domain,
        depth: t.depth,
        desc: t.desc,
        children: [],
        parents: [],
        throughput: 0,   // items dragged through this node
        heat: 0          // activity heat
      };
    });

    // Build edges: domain → kingdom → node
    var domains = {};
    Object.keys(dag.nodes).forEach(function(name) {
      var node = dag.nodes[name];
      if (!domains[node.domain]) {
        domains[node.domain] = { id: 'domain:' + node.domain, children: [], parents: [], depth: -1, throughput: 0, heat: 0 };
        dag.nodes['domain:' + node.domain] = domains[node.domain];
        dag.roots.push('domain:' + node.domain);
      }
      dag.edges.push({ from: 'domain:' + node.domain, to: name });
      domains[node.domain].children.push(name);
      node.parents.push('domain:' + node.domain);
    });

    // Find leaves (nodes with no children)
    Object.keys(dag.nodes).forEach(function(name) {
      if (dag.nodes[name].children.length === 0 && !name.startsWith('domain:')) {
        dag.leaves.push(name);
      }
    });
  }

  // Drag an item through the DAG
  function dragThroughDAG(item) {
    // Classify the item into a taxonomy node
    var nodeId = classifyItem(item);
    if (!dag.nodes[nodeId]) return;

    // Walk from root to this node, incrementing throughput
    var path = [];
    var current = nodeId;
    while (current) {
      path.unshift(current);
      dag.nodes[current].throughput++;
      dag.nodes[current].heat = Math.min(1, dag.nodes[current].heat + 0.1);
      var parents = dag.nodes[current].parents;
      current = parents && parents.length > 0 ? parents[0] : null;
    }

    dag.processed++;
    return path;
  }

  function classifyItem(item) {
    if (!item) return 'Bacteria';
    var edge = item.edge || item.type || '';
    if (edge === 'eruption') {
      var type = (item.data && item.data.type) || '';
      if (type === 'volcano') return 'Volcano';
      if (type === 'nuclear' || type === 'explosion') return 'Explosion';
      if (type === 'impact') return 'Impact';
      if (type === 'war') return 'War';
      return 'Volcano';
    }
    if (edge === 'data_load') return 'JSON';
    if (edge === 'key' || edge === 'touch') return 'Animalia';
    if (edge === 'time' || edge === 'battery') return 'Archaea';
    if (edge === 'messenger_send' || edge === 'messenger_type') return 'Animalia';
    if (edge === 'fleet_visitor' || edge === 'fleet_probe') return 'Protista';
    return 'Bacteria';
  }

  // Cool down DAG heat
  function coolDAG() {
    Object.keys(dag.nodes).forEach(function(name) {
      dag.nodes[name].heat = Math.max(0, dag.nodes[name].heat - 0.005);
    });
  }

  // ───────────────────────────────────────────────────────
  // MULTI-GUT — 4 stomachs like a cow (ruminant)
  // ───────────────────────────────────────────────────────
  var ruminant = {
    rumen: {
      name: 'RUMEN',
      desc: 'Fermentation vat. Largest chamber. Microbe city.',
      capacity: 50,
      contents: [],
      microbes: 1000,   // billion-scale in real cow
      fermentOutput: 0,
      volatile: []       // volatile fatty acids produced
    },
    reticulum: {
      name: 'RETICULUM',
      desc: 'Honeycomb filter. Traps foreign objects.',
      capacity: 20,
      contents: [],
      trapped: [],       // foreign/hardware objects caught
      filtered: 0
    },
    omasum: {
      name: 'OMASUM',
      desc: 'Many-plies. Water press. Absorbs, concentrates.',
      capacity: 15,
      contents: [],
      waterAbsorbed: 0,
      concentrated: 0
    },
    abomasum: {
      name: 'ABOMASUM',
      desc: 'True stomach. Acid digestion. Final processing.',
      capacity: 10,
      contents: [],
      pH: 2.0,
      digested: 0
    }
  };

  // Feed into rumen (first stomach)
  function feedRumen(item) {
    ruminant.rumen.contents.push({
      item: item,
      ts: Date.now(),
      stage: 0,
      fermented: false
    });
    if (ruminant.rumen.contents.length > ruminant.rumen.capacity) {
      ruminant.rumen.contents.shift();
    }
  }

  // Process all 4 stomachs
  function processRuminant() {
    // RUMEN: fermentation (2s)
    for (var ri = ruminant.rumen.contents.length - 1; ri >= 0; ri--) {
      var r = ruminant.rumen.contents[ri];
      if (Date.now() - r.ts > 2000 && !r.fermented) {
        r.fermented = true;
        ruminant.rumen.fermentOutput++;
        // Produce volatile fatty acids
        ruminant.rumen.volatile.push({ type: 'vfa', ts: Date.now() });
        if (ruminant.rumen.volatile.length > 20) ruminant.rumen.volatile.shift();
      }
      // Move to reticulum after 4s
      if (Date.now() - r.ts > 4000) {
        ruminant.rumen.contents.splice(ri, 1);
        ruminant.reticulum.contents.push({ item: r.item, ts: Date.now(), filtered: false });
        if (ruminant.reticulum.contents.length > ruminant.reticulum.capacity) {
          ruminant.reticulum.contents.shift();
        }
      }
    }

    // RETICULUM: filter foreign objects (1s)
    for (var fi = ruminant.reticulum.contents.length - 1; fi >= 0; fi--) {
      var f = ruminant.reticulum.contents[fi];
      if (Date.now() - f.ts > 1000 && !f.filtered) {
        f.filtered = true;
        ruminant.reticulum.filtered++;
        // Check for "hardware" — trap foreign objects
        var edge = (f.item && f.item.edge) || '';
        if (edge === 'resize' || edge === 'battery' || edge === 'connection') {
          ruminant.reticulum.trapped.push(f.item);
          if (ruminant.reticulum.trapped.length > 10) ruminant.reticulum.trapped.shift();
          ruminant.reticulum.contents.splice(fi, 1);
          continue;
        }
      }
      // Move to omasum after 2s
      if (Date.now() - f.ts > 2000) {
        ruminant.reticulum.contents.splice(fi, 1);
        ruminant.omasum.contents.push({ item: f.item, ts: Date.now(), pressed: false });
        if (ruminant.omasum.contents.length > ruminant.omasum.capacity) {
          ruminant.omasum.contents.shift();
        }
      }
    }

    // OMASUM: water press / concentrate (1.5s)
    for (var oi = ruminant.omasum.contents.length - 1; oi >= 0; oi--) {
      var o = ruminant.omasum.contents[oi];
      if (Date.now() - o.ts > 1500 && !o.pressed) {
        o.pressed = true;
        ruminant.omasum.waterAbsorbed++;
        ruminant.omasum.concentrated++;
      }
      // Move to abomasum after 3s
      if (Date.now() - o.ts > 3000) {
        ruminant.omasum.contents.splice(oi, 1);
        ruminant.abomasum.contents.push({ item: o.item, ts: Date.now(), digested: false });
        if (ruminant.abomasum.contents.length > ruminant.abomasum.capacity) {
          ruminant.abomasum.contents.shift();
        }
      }
    }

    // ABOMASUM: final acid digestion (2s)
    for (var ai = ruminant.abomasum.contents.length - 1; ai >= 0; ai--) {
      var a = ruminant.abomasum.contents[ai];
      if (Date.now() - a.ts > 2000 && !a.digested) {
        a.digested = true;
        ruminant.abomasum.digested++;
        ruminant.abomasum.contents.splice(ai, 1);
        // Feed to the gut farm
        farmProduce(a.item);
      }
    }
  }

  // ───────────────────────────────────────────────────────
  // THE FARM — livestock = production signals
  // ───────────────────────────────────────────────────────
  var farm = {
    cows: {
      count: 3,
      health: 0.8,      // 0-1
      milk: 0,           // cumulative production
      milkRate: 0,       // current production rate
      fed: 0,
      lastFed: Date.now()
    },
    chickens: {
      count: 5,
      health: 0.8,
      eggs: 0,
      eggRate: 0,
      fed: 0,
      lastFed: Date.now()
    },
    crops: {
      plots: 4,
      health: 0.7,
      grain: 0,
      growthRate: 0,
      fertilizer: 0.5,   // 0-1, current fertilizer level
      watered: Date.now()
    },
    soil: {
      microbiome: 0.6,
      nitrogen: 0.5,
      phosphorus: 0.5,
      potassium: 0.5,
      pH: 6.5
    },
    // Meta signals — hormones from the farm
    hormones: {
      insulin: 0.5,      // energy regulation (crops→insulin)
      cortisol: 0.3,     // stress (low production→high cortisol)
      oxytocin: 0.5,     // connection (interaction→oxytocin)
      serotonin: 0.5,    // satisfaction (milk+eggs→serotonin)
      adrenaline: 0.2    // urgency (farm dying→adrenaline)
    },
    verdict: 'STABLE'     // THRIVING / STABLE / STRESSED / DYING
  };

  // Process produces feed the farm
  function farmProduce(item) {
    var now = Date.now();

    // Feed cows (large slow processors)
    farm.cows.fed++;
    farm.cows.lastFed = now;
    farm.cows.milk += farm.cows.health * 0.3;
    farm.cows.milkRate = farm.cows.fed / Math.max(1, (now - farm.cows.lastFed) / 60000);

    // Feed chickens (fast small processors)
    farm.chickens.fed++;
    farm.chickens.lastFed = now;
    if (farm.chickens.fed % 3 === 0) {
      farm.chickens.eggs++;  // egg every 3 feeds
    }

    // Fertilize crops
    farm.crops.fertilizer = Math.min(1, farm.crops.fertilizer + 0.05);
    if (farm.crops.fertilizer > 0.3) {
      farm.crops.grain += farm.crops.health * 0.1;
      farm.crops.growthRate = farm.crops.health * farm.crops.fertilizer;
    }

    // Feed soil
    farm.soil.nitrogen = Math.min(1, farm.soil.nitrogen + 0.02);
    farm.soil.microbiome = Math.min(1, farm.soil.microbiome + 0.01);
  }

  // Farm tick — decay, health, hormones
  function farmTick() {
    var now = Date.now();

    // Livestock health decays without feeding
    var cowHunger = (now - farm.cows.lastFed) / 30000; // starve after 30s
    farm.cows.health = Math.max(0.1, Math.min(1, 0.8 - cowHunger * 0.3));

    var chickenHunger = (now - farm.chickens.lastFed) / 20000;
    farm.chickens.health = Math.max(0.1, Math.min(1, 0.8 - chickenHunger * 0.3));

    // Crops decay without fertilizer
    farm.crops.fertilizer = Math.max(0, farm.crops.fertilizer - 0.005);
    farm.crops.health = Math.min(1, farm.crops.fertilizer * 1.5);

    // Soil decays slowly
    farm.soil.nitrogen = Math.max(0, farm.soil.nitrogen - 0.003);
    farm.soil.phosphorus = Math.max(0, farm.soil.phosphorus - 0.002);
    farm.soil.microbiome = Math.max(0, farm.soil.microbiome - 0.001);

    // ═══ HORMONE SIGNALS — meta signal from the farm ═══
    var avgHealth = (farm.cows.health + farm.chickens.health + farm.crops.health) / 3;
    var production = farm.cows.milk + farm.chickens.eggs + farm.crops.grain;

    // Insulin: regulated by crop/grain energy
    farm.hormones.insulin = Math.min(1, farm.crops.grain * 0.01);

    // Cortisol: stress = inverse of health
    farm.hormones.cortisol = Math.max(0, 1 - avgHealth);

    // Oxytocin: connection = interaction score
    var interScore = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
    farm.hormones.oxytocin = Math.min(1, interScore * 0.05);

    // Serotonin: satisfaction = production rate
    farm.hormones.serotonin = Math.min(1, production * 0.005);

    // Adrenaline: urgency = farm dying signal
    farm.hormones.adrenaline = avgHealth < 0.3 ? 0.8 : avgHealth < 0.5 ? 0.4 : 0.1;

    // Verdict
    if (avgHealth > 0.7 && production > 10) farm.verdict = 'THRIVING';
    else if (avgHealth > 0.5) farm.verdict = 'STABLE';
    else if (avgHealth > 0.3) farm.verdict = 'STRESSED';
    else farm.verdict = 'DYING';

    // If dying → change fertilizer signal
    if (farm.verdict === 'DYING') {
      farm.crops.fertilizer = Math.min(1, farm.crops.fertilizer + 0.1); // emergency fertilizer
    }
  }

  // ───────────────────────────────────────────────────────
  // HOOK — intercept gaiaIngest, drag through DAG + ruminant
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    var origIngestFarm = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      // Drag through the taxonomy DAG
      dragThroughDAG({ edge: edge, data: data });

      // Feed into the rumen (first of 4 stomachs)
      feedRumen({ edge: edge, data: data });

      // Pass through
      if (origIngestFarm) origIngestFarm(edge, data);
    };
    console.log('GUT FARM: hooked into gaiaIngest. Everything dragged through DAG → ruminant → farm.');
  }, 6000);

  // ───────────────────────────────────────────────────────
  // RENDER — the farm + DAG + ruminant visualization
  // ───────────────────────────────────────────────────────
  window.renderGutFarm = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.012 + Math.sin(t * 0.4) * 0.006;
    if (baseAlpha < 0.005) return;

    var TAU = Math.PI * 2;

    // ═══ 4 STOMACHS — concentric arcs inside the globe ═══
    var stomachs = [
      { s: ruminant.rumen,     r: 0.55, color: '63,185,80',  label: 'RUM' },
      { s: ruminant.reticulum, r: 0.48, color: '201,168,76', label: 'RET' },
      { s: ruminant.omasum,    r: 0.42, color: '88,166,255', label: 'OMA' },
      { s: ruminant.abomasum,  r: 0.36, color: '248,81,73',  label: 'ABO' }
    ];

    stomachs.forEach(function(st, si) {
      var sR = R * st.r;
      var fillPct = st.s.contents.length / st.s.capacity;
      var startAngle = -Math.PI * 0.4 + si * 0.15;
      var arcLen = Math.PI * 0.6 * fillPct;

      // Stomach arc
      ctx.beginPath();
      ctx.arc(cx, cy, sR, startAngle + t * 0.01, startAngle + arcLen + t * 0.01);
      ctx.strokeStyle = 'rgba(' + st.color + ',' + (baseAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Contents dots
      st.s.contents.forEach(function(c, ci) {
        var cAngle = startAngle + (ci / st.s.capacity) * arcLen + t * 0.01;
        var dx = cx + Math.cos(cAngle) * sR;
        var dy = cy + Math.sin(cAngle) * sR;
        ctx.beginPath();
        ctx.arc(dx, dy, 0.4, 0, TAU);
        ctx.fillStyle = 'rgba(' + st.color + ',' + (baseAlpha * 3).toFixed(4) + ')';
        ctx.fill();
      });
    });

    // ═══ FARM INDICATORS — bottom right ═══
    var farmX = W - 80;
    var farmY = H - 60;

    if (baseAlpha > 0.008) {
      ctx.font = '3px monospace';
      ctx.textAlign = 'left';

      // Cow indicator
      var cowColor = farm.cows.health > 0.5 ? '63,185,80' : '248,81,73';
      ctx.fillStyle = 'rgba(' + cowColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText('🐄' + farm.cows.milk.toFixed(0) + 'ml h:' +
        (farm.cows.health * 100).toFixed(0) + '%', farmX, farmY);

      // Chicken indicator
      var chkColor = farm.chickens.health > 0.5 ? '63,185,80' : '248,81,73';
      ctx.fillStyle = 'rgba(' + chkColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText('🐔' + farm.chickens.eggs + 'eggs h:' +
        (farm.chickens.health * 100).toFixed(0) + '%', farmX, farmY + 6);

      // Crops
      var cropColor = farm.crops.health > 0.5 ? '63,185,80' : '248,81,73';
      ctx.fillStyle = 'rgba(' + cropColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText('🌾' + farm.crops.grain.toFixed(0) + 'g fert:' +
        (farm.crops.fertilizer * 100).toFixed(0) + '%', farmX, farmY + 12);

      // Hormones
      ctx.fillStyle = 'rgba(188,140,255,' + (baseAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        '⚗ ins:' + farm.hormones.insulin.toFixed(2) +
        ' cor:' + farm.hormones.cortisol.toFixed(2) +
        ' oxy:' + farm.hormones.oxytocin.toFixed(2),
        farmX, farmY + 20
      );

      // Verdict
      var verdictColor = farm.verdict === 'THRIVING' ? '63,185,80' :
        farm.verdict === 'STABLE' ? '201,168,76' :
        farm.verdict === 'STRESSED' ? '255,166,87' : '248,81,73';
      ctx.fillStyle = 'rgba(' + verdictColor + ',' + (baseAlpha * 4).toFixed(4) + ')';
      ctx.fillText('🏡 ' + farm.verdict + ' · DAG:' + dag.processed, farmX, farmY + 28);
    }

    // ═══ DAG HEAT MAP — taxonomy nodes as dots ═══
    var dagKeys = Object.keys(dag.nodes);
    var dagCount = dagKeys.length;
    dagKeys.forEach(function(name, idx) {
      var node = dag.nodes[name];
      if (node.heat < 0.01) return;

      var nAngle = (idx / dagCount) * TAU + t * 0.005;
      var nR = R * (0.25 + node.depth * 0.05);
      var nx = cx + Math.cos(nAngle) * nR;
      var ny = cy + Math.sin(nAngle) * nR;

      ctx.beginPath();
      ctx.arc(nx, ny, 0.5 + node.heat * 2, 0, TAU);
      var heatColor = node.heat > 0.5 ? '248,81,73' : '201,168,76';
      ctx.fillStyle = 'rgba(' + heatColor + ',' + (baseAlpha * node.heat * 5).toFixed(4) + ')';
      ctx.fill();
    });
  };

  // ───────────────────────────────────────────────────────
  // TICKS
  // ───────────────────────────────────────────────────────
  buildDAG();

  setInterval(function() {
    processRuminant();
    farmTick();
    coolDAG();
  }, 1000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaGutFarm = {
    dag: dag,
    ruminant: ruminant,
    farm: farm,
    knn: kNearestEvents,
    dragDAG: dragThroughDAG,
    feedRumen: feedRumen,
    stats: function() {
      return {
        dagNodes: Object.keys(dag.nodes).length,
        dagProcessed: dag.processed,
        rumenFill: ruminant.rumen.contents.length,
        reticulumTrapped: ruminant.reticulum.trapped.length,
        osmasumConcentrated: ruminant.omasum.concentrated,
        abomasumDigested: ruminant.abomasum.digested,
        cowMilk: farm.cows.milk,
        chickenEggs: farm.chickens.eggs,
        cropGrain: farm.crops.grain,
        hormones: farm.hormones,
        verdict: farm.verdict
      };
    }
  };

  console.log('GUT FARM: Multi-gut bioreactor online. 4 stomachs (rumen→reticulum→omasum→abomasum). ' +
    'Farm livestock: 3 cows, 5 chickens, 4 crop plots. ' +
    'Taxonomy DAG: ' + Object.keys(dag.nodes).length + ' nodes. ' +
    'History = distance. k-NN over time. ' +
    'Hormones: insulin, cortisol, oxytocin, serotonin, adrenaline. ' +
    'If farm dying → change fertilizer. If good → milk + eggs flowing.');
})();
