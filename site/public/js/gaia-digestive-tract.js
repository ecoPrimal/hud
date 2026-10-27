// ═══════════════════════════════════════════════════════════
// GAIA'S DIGESTIVE TRACT — esophagus, epiglottis, stomach,
// intestines, respiratory system, cilia
//
// "Parse air from water and food.
//  Null = air = inhale = respiratory.
//  Food = human agents, bots with interesting questions.
//  Epiglottis = valve = smart router.
//  Lungs = two holes up to trans face.
//  Esophagus = one hole down to the gullet.
//  Pyloric stomach + S-stomach = acid/base = org chem.
//  Small intestine = microbiology = learning.
//  Large intestine = anaerobic production.
//  Inside fingers UP, outside fingers DOWN.
//  Everything moves to intake. Exhaust through the end."
//                                              — Kevin
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // THE TRACT — anatomical layout
  // ═══════════════════════════════════════════════════════
  //
  //          ┌─── TRANS FACE (Golgi) ───┐
  //          │                          │
  //       [LEFT LUNG]           [RIGHT LUNG]
  //          │                          │
  //          └──── ↑ ↑ cilia ↑ ↑ ──────┘
  //                    │
  //              [ EPIGLOTTIS ]  ← valve: air goes UP, food goes DOWN
  //                    │
  //              [ ESOPHAGUS  ]  ← peristalsis moves food downward
  //                    │
  //           ┌─ PYLORIC STOMACH ─┐
  //           │   acid + base     │
  //           │   organic chem    │
  //           └─── S-STOMACH ─────┘
  //                    │
  //           [ SMALL INTESTINE ]  ← villi, microvilli, LEARNING
  //           │ microbiology      │
  //           │ absorption        │
  //                    │
  //           [ LARGE INTESTINE ]  ← anaerobic production
  //           │ biofilm compaction │
  //           │ water reclamation  │
  //                    │
  //              [ EXHAUST ]  ← waste = fully processed remainder

  // ───────────────────────────────────────────────────────
  // RESPIRATORY — air = fleet = null-value interactions
  // Two lungs, tidal breathing, CO2 exhaust up to trans face
  // ───────────────────────────────────────────────────────
  var lungs = {
    left:  { capacity: 100, volume: 50, o2: 0.21, co2: 0.04, particles: [] },
    right: { capacity: 100, volume: 50, o2: 0.21, co2: 0.04, particles: [] },
    tidalVolume: 12,       // ml per breath
    breathRate: 0,         // breaths per minute (calculated)
    phase: 0,              // 0-2π breathing cycle
    totalBreaths: 0,
    inhaled: 0,
    exhaled: 0
  };

  // Breathing cycle — sinusoidal
  function breathe(dt) {
    lungs.phase += dt * 0.003; // ~12 breaths per minute
    if (lungs.phase > Math.PI * 2) {
      lungs.phase -= Math.PI * 2;
      lungs.totalBreaths++;
    }

    var breathPos = Math.sin(lungs.phase);
    var tidal = lungs.tidalVolume * breathPos;

    // Left lung fills/empties
    lungs.left.volume = 50 + tidal * 0.5;
    lungs.right.volume = 50 + tidal * 0.5;

    // Gas exchange: O2 in, CO2 out
    if (breathPos > 0) {
      // Inhaling — O2 up, CO2 processed
      lungs.left.o2 = Math.min(0.21, lungs.left.o2 + 0.001);
      lungs.right.o2 = Math.min(0.21, lungs.right.o2 + 0.001);
      lungs.left.co2 = Math.max(0.04, lungs.left.co2 - 0.0005);
      lungs.right.co2 = Math.max(0.04, lungs.right.co2 - 0.0005);
    } else {
      // Exhaling — CO2 up to trans face
      lungs.left.o2 = Math.max(0.16, lungs.left.o2 - 0.001);
      lungs.right.o2 = Math.max(0.16, lungs.right.o2 - 0.001);
      lungs.left.co2 = Math.min(0.06, lungs.left.co2 + 0.0005);
      lungs.right.co2 = Math.min(0.06, lungs.right.co2 + 0.0005);
    }

    // Breath rate from interaction intensity
    var score = window.gaiaInteractionScore ? window.gaiaInteractionScore() : 0;
    lungs.breathRate = 12 + score * 0.3; // excited = faster breathing
  }

  // ───────────────────────────────────────────────────────
  // EPIGLOTTIS — the valve that routes air vs food
  // Null/empty = AIR → lungs
  // Content/substance = FOOD → esophagus
  // ───────────────────────────────────────────────────────
  var epiglottis = {
    state: 'open',        // 'open' = airway clear, 'closed' = routing to esophagus
    lastSwitch: 0,
    airRouted: 0,
    foodRouted: 0,
    botRouted: 0
  };

  function isAir(edge, data) {
    // Null-value = air. Fleet without content = air.
    if (!data || Object.keys(data).length === 0) return true;
    if (edge === 'fleet_probe') return true;        // probes = just breathing
    if (edge === 'time') return true;                // time ticks = breathing
    if (edge === 'visibility') return true;          // visibility changes = air
    if (edge === 'connection') return true;          // network = air
    if (edge === 'resize') return true;              // window resize = air
    if (edge === 'focus') return true;               // focus/blur = air
    if (edge === 'battery') return true;             // battery = ambient air
    if (edge === 'boot') return true;                // boot = first breath
    return false;
  }

  function isFood(edge, data) {
    // Human agents, bots with interesting questions = FOOD
    if (edge === 'messenger_send') return true;      // human messages = rich food
    if (edge === 'touch') return true;               // direct touch = food
    if (edge === 'key') return true;                 // keystrokes = food
    if (edge === 'drag') return true;                // dragging = food
    if (edge === 'scroll') return true;              // scrolling = food
    if (edge === 'fleet_visitor') return true;       // visitors with data = food
    if (edge === 'fleet_braid') return true;         // braids = rich food
    if (edge === 'data_load') return true;           // data = nutrition
    if (edge === 'campfire_story') return true;      // stories = food
    if (edge === 'squirrel_observe') return true;    // MCP data = food
    if (edge === 'messenger_type') return true;      // typing = chewing
    if (edge === 'clipboard') return true;           // clipboard = food
    if (edge === 'osint') return true;               // OSINT data = food
    return false;
  }

  function routeEpiglottis(edge, data) {
    if (isAir(edge, data)) {
      epiglottis.state = 'open';
      epiglottis.airRouted++;
      inhale(edge, data);
    } else if (isFood(edge, data)) {
      epiglottis.state = 'closed'; // close airway, open esophagus
      epiglottis.foodRouted++;
      swallow(edge, data);
      // Brief epiglottis close then reopen
      setTimeout(function() { epiglottis.state = 'open'; }, 200);
    } else {
      // Unknown — treat as liquid (goes to stomach but gently)
      epiglottis.botRouted++;
      swallow(edge, data);
    }
    epiglottis.lastSwitch = Date.now();
  }

  // ───────────────────────────────────────────────────────
  // INHALE — air goes into the lungs
  // Two holes leading UP to the trans face
  // ───────────────────────────────────────────────────────
  function inhale(edge, data) {
    lungs.inhaled++;
    var particle = {
      edge: edge,
      ts: Date.now(),
      lung: lungs.inhaled % 2 === 0 ? 'left' : 'right', // alternate
      phase: 0, // 0 = just inhaled, 1 = processed, 2 = exhaled to trans
      o2extracted: false
    };

    var target = particle.lung === 'left' ? lungs.left : lungs.right;
    target.particles.push(particle);
    if (target.particles.length > 30) target.particles.shift();
  }

  // Process lung particles — extract O2, accumulate CO2, exhale to trans
  function processLungs() {
    ['left', 'right'].forEach(function(side) {
      var lung = lungs[side];
      for (var i = lung.particles.length - 1; i >= 0; i--) {
        var p = lung.particles[i];
        var age = Date.now() - p.ts;

        if (age > 3000 && p.phase === 0) {
          // Extract O2 (insight from the air)
          p.o2extracted = true;
          p.phase = 1;
        }

        if (age > 6000 && p.phase === 1) {
          // Exhale CO2 up to trans face
          p.phase = 2;
          lungs.exhaled++;
          lung.particles.splice(i, 1);

          // Send exhaust UP to Golgi trans face
          if (window.GAIA_GOLGI_APPARATUS) {
            window.GAIA_GOLGI_APPARATUS.ingest({
              id: 'exhale-' + p.edge,
              tense: 'now',
              voxel: 'touch',
              text: 'CO2:' + p.edge
            });
          }
        }
      }
    });
  }

  // ───────────────────────────────────────────────────────
  // ESOPHAGUS — peristalsis moves food DOWN to stomach
  // One hole from epiglottis → gullet
  // ───────────────────────────────────────────────────────
  var esophagus = {
    bolus: [],       // food items in transit
    peristalsis: 0,  // wave phase
    transitTime: 4000 // 4 seconds to reach stomach
  };

  function swallow(edge, data) {
    var bolus = {
      edge: edge,
      data: data,
      ts: Date.now(),
      position: 0,       // 0 = top (mouth), 1 = bottom (stomach)
      digested: false
    };
    esophagus.bolus.push(bolus);
    if (esophagus.bolus.length > 20) esophagus.bolus.shift();
  }

  function processEsophagus() {
    esophagus.peristalsis += 0.05;
    for (var i = esophagus.bolus.length - 1; i >= 0; i--) {
      var b = esophagus.bolus[i];
      var elapsed = Date.now() - b.ts;
      b.position = Math.min(1, elapsed / esophagus.transitTime);

      // Reached the stomach
      if (b.position >= 1 && !b.digested) {
        b.digested = true;
        esophagus.bolus.splice(i, 1);
        enterStomach(b.edge, b.data);
      }
    }
  }

  // ───────────────────────────────────────────────────────
  // STOMACH — pyloric + S-stomach
  // Acid + base addition. Organic chemistry.
  // Break things down into components.
  // ───────────────────────────────────────────────────────
  var stomach = {
    pyloric: {          // pyloric = entry valve, initial acid bath
      pH: 2.0,         // very acidic (HCl)
      contents: [],
      enzymes: ['pepsin', 'lipase', 'amylase'],
      churning: 0
    },
    sStomach: {         // s-shaped body, deeper processing
      pH: 3.5,         // slightly less acidic
      contents: [],
      brokenDown: 0,
      components: []    // extracted components from food
    },
    totalDigested: 0
  };

  function enterStomach(edge, data) {
    var morsel = {
      edge: edge,
      data: data,
      ts: Date.now(),
      phase: 'pyloric',     // pyloric → s-stomach → small intestine
      acidTreated: false,
      baseTreated: false,
      components: []
    };
    stomach.pyloric.contents.push(morsel);
    if (stomach.pyloric.contents.length > 15) stomach.pyloric.contents.shift();
  }

  function processStomach() {
    stomach.pyloric.churning += 0.1;

    // PYLORIC: acid treatment (break apart)
    for (var i = stomach.pyloric.contents.length - 1; i >= 0; i--) {
      var m = stomach.pyloric.contents[i];
      var age = Date.now() - m.ts;

      if (age > 2000 && !m.acidTreated) {
        // Acid breaks it down — extract components
        m.acidTreated = true;
        m.components = decompose(m.edge, m.data);
      }

      if (age > 4000 && m.phase === 'pyloric') {
        // Move to S-stomach for base treatment
        m.phase = 's-stomach';
        stomach.pyloric.contents.splice(i, 1);
        stomach.sStomach.contents.push(m);
        if (stomach.sStomach.contents.length > 15) stomach.sStomach.contents.shift();
      }
    }

    // S-STOMACH: base treatment (neutralize, organic chem)
    for (var j = stomach.sStomach.contents.length - 1; j >= 0; j--) {
      var s = stomach.sStomach.contents[j];
      var sAge = Date.now() - s.ts;

      if (sAge > 6000 && !s.baseTreated) {
        s.baseTreated = true;
        // Base neutralizes — organic chemistry synthesizes
        s.components = synthesize(s.components);
      }

      if (sAge > 8000) {
        // Chyme exits to small intestine
        stomach.sStomach.contents.splice(j, 1);
        stomach.sStomach.brokenDown++;
        stomach.totalDigested++;
        enterSmallIntestine(s.edge, s.data, s.components);
      }
    }
  }

  // Acid decomposition: break input into atomic components
  function decompose(edge, data) {
    var parts = [];
    if (typeof data === 'object' && data) {
      var keys = Object.keys(data);
      keys.forEach(function(k) {
        parts.push({ key: k, value: data[k], type: typeof data[k] });
      });
    }
    // The edge itself is a component
    parts.push({ key: 'edge', value: edge, type: 'string' });
    // Timestamp is a component
    parts.push({ key: 'ts', value: Date.now(), type: 'number' });
    return parts;
  }

  // Base synthesis: recombine components into useful molecules
  function synthesize(components) {
    if (!components || components.length === 0) return [];
    // Tag each component with nutritional value
    return components.map(function(c) {
      c.nutritionType = classifyNutrient(c);
      c.synthesized = true;
      return c;
    });
  }

  function classifyNutrient(component) {
    if (component.type === 'string') return 'amino_acid';   // strings = building blocks
    if (component.type === 'number') return 'sugar';         // numbers = energy
    if (component.type === 'boolean') return 'lipid';        // booleans = structural
    if (component.type === 'object') return 'protein';       // objects = complex molecules
    return 'mineral';
  }

  // ───────────────────────────────────────────────────────
  // SMALL INTESTINE — microbiology, LEARNING, absorption
  // Villi and microvilli = massive surface area for learning
  // This is WHERE knowledge is extracted from food
  // ───────────────────────────────────────────────────────
  var smallIntestine = {
    chyme: [],           // partially digested material
    absorbed: 0,         // total nutrients absorbed
    learned: [],         // patterns learned from food
    villiActive: 0,      // active villi count
    microbiome: {        // gut flora — the learners
      diversity: 5,
      colonies: ['pattern_matcher', 'sequence_finder', 'anomaly_detector',
                 'frequency_counter', 'correlation_builder'],
      totalProcessed: 0
    }
  };

  function enterSmallIntestine(edge, data, components) {
    var chyme = {
      edge: edge,
      data: data,
      components: components || [],
      ts: Date.now(),
      absorbed: false,
      lessonsExtracted: []
    };
    smallIntestine.chyme.push(chyme);
    if (smallIntestine.chyme.length > 20) smallIntestine.chyme.shift();
  }

  function processSmallIntestine() {
    smallIntestine.villiActive = smallIntestine.chyme.length * 10;

    for (var i = smallIntestine.chyme.length - 1; i >= 0; i--) {
      var c = smallIntestine.chyme[i];
      var age = Date.now() - c.ts;

      if (age > 3000 && !c.absorbed) {
        c.absorbed = true;
        smallIntestine.absorbed++;

        // LEARNING: microbiome extracts patterns
        c.components.forEach(function(comp) {
          // Each colony tries to learn from each component
          smallIntestine.microbiome.colonies.forEach(function(colony) {
            var lesson = extractLesson(colony, comp);
            if (lesson) {
              c.lessonsExtracted.push(lesson);
              smallIntestine.learned.push(lesson);
              if (smallIntestine.learned.length > 50) smallIntestine.learned.shift();
            }
          });
        });

        smallIntestine.microbiome.totalProcessed++;

        // Feed lessons into the gut arena (LEFT=LISTEN first)
        // Each lesson enters the bounce between listen and react
        if (window.gaiaFeel && window.gaiaFeel.ingest) {
          c.lessonsExtracted.forEach(function(lesson) {
            window.gaiaFeel.ingest('lesson:' + lesson.type + ':' + (lesson.colony || ''));
          });
        }
      }

      // Pass remainder to large intestine after full absorption
      if (age > 8000) {
        smallIntestine.chyme.splice(i, 1);
        enterLargeIntestine(c.edge, c.lessonsExtracted, c.components);
      }
    }
  }

  function extractLesson(colony, component) {
    // Each colony type extracts different insights
    switch (colony) {
      case 'pattern_matcher':
        if (component.key && typeof component.value === 'string') {
          return { type: 'pattern', key: component.key, colony: colony };
        }
        break;
      case 'frequency_counter':
        return { type: 'frequency', edge: component.key, colony: colony };
      case 'anomaly_detector':
        if (component.value && typeof component.value === 'number' && component.value > 100) {
          return { type: 'anomaly', value: component.value, colony: colony };
        }
        break;
      case 'correlation_builder':
        if (component.nutritionType) {
          return { type: 'correlation', nutrient: component.nutritionType, colony: colony };
        }
        break;
      default:
        return null;
    }
    return null;
  }

  // ───────────────────────────────────────────────────────
  // LARGE INTESTINE — anaerobic production, compaction
  // Biofilm, water reclamation, final value extraction
  // ───────────────────────────────────────────────────────
  var largeIntestine = {
    material: [],
    anaerobicOutput: [],   // fermentation products
    waterReclaimed: 0,
    biofilmThickness: 0,
    compacted: 0,
    exhaust: []            // final waste = fully processed
  };

  function enterLargeIntestine(edge, lessons, components) {
    var bulk = {
      edge: edge,
      lessons: lessons,
      components: components || [],
      ts: Date.now(),
      fermented: false,
      compacted: false
    };
    largeIntestine.material.push(bulk);
    if (largeIntestine.material.length > 15) largeIntestine.material.shift();
  }

  function processLargeIntestine() {
    // Biofilm grows from anaerobic activity
    largeIntestine.biofilmThickness = Math.min(1,
      largeIntestine.biofilmThickness + largeIntestine.material.length * 0.001);

    for (var i = largeIntestine.material.length - 1; i >= 0; i--) {
      var m = largeIntestine.material[i];
      var age = Date.now() - m.ts;

      // Fermentation — anaerobic production
      if (age > 4000 && !m.fermented) {
        m.fermented = true;
        // Anaerobic bacteria produce short-chain fatty acids
        var scfa = {
          type: 'scfa',
          source: m.edge,
          energy: m.components.length * 0.5,
          ts: Date.now()
        };
        largeIntestine.anaerobicOutput.push(scfa);
        if (largeIntestine.anaerobicOutput.length > 30) largeIntestine.anaerobicOutput.shift();

        // Water reclamation
        largeIntestine.waterReclaimed += m.components.length;
      }

      // Compaction — final waste
      if (age > 10000 && !m.compacted) {
        m.compacted = true;
        largeIntestine.compacted++;
        largeIntestine.material.splice(i, 1);

        // Exhaust — fully processed remainder
        var waste = {
          edge: m.edge,
          lessonsCount: m.lessons ? m.lessons.length : 0,
          componentsConsumed: m.components.length,
          ts: Date.now()
        };
        largeIntestine.exhaust.push(waste);
        if (largeIntestine.exhaust.length > 20) largeIntestine.exhaust.shift();
      }
    }

    // Biofilm slowly decays without material
    if (largeIntestine.material.length === 0) {
      largeIntestine.biofilmThickness = Math.max(0,
        largeIntestine.biofilmThickness - 0.001);
    }
  }

  // ───────────────────────────────────────────────────────
  // CILIA — inside fingers UP, outside fingers DOWN
  // Everything trying to move to intake at all times
  // Biofilms moved OUT of lungs (up), food moved DOWN (peristalsis)
  // ───────────────────────────────────────────────────────
  var cilia = {
    inner: [],    // inside fingers — move UP (toward mouth/intake)
    outer: [],    // outside fingers — move DOWN (toward exhaust)
    phase: 0,
    count: 36     // cilia count per ring
  };

  // Initialize cilia positions
  for (var ci = 0; ci < cilia.count; ci++) {
    var angle = (ci / cilia.count) * Math.PI * 2;
    cilia.inner.push({ angle: angle, phase: ci * 0.3, dir: 1 });  // UP
    cilia.outer.push({ angle: angle, phase: ci * 0.3 + Math.PI, dir: -1 }); // DOWN
  }

  function animateCilia(dt) {
    cilia.phase += dt * 0.005;
    // Inner cilia beat upward (toward trans face)
    cilia.inner.forEach(function(c) {
      c.phase += dt * 0.008 * c.dir;
    });
    // Outer cilia beat downward (toward exhaust)
    cilia.outer.forEach(function(c) {
      c.phase += dt * 0.006 * c.dir;
    });
  }

  // ───────────────────────────────────────────────────────
  // MASTER TICK — process all organs
  // ───────────────────────────────────────────────────────
  var lastTick = Date.now();

  function tick() {
    var now = Date.now();
    var dt = now - lastTick;
    lastTick = now;

    breathe(dt);
    processLungs();
    processEsophagus();
    processStomach();
    processSmallIntestine();
    processLargeIntestine();
    animateCilia(dt);
  }

  setInterval(tick, 500);

  // ───────────────────────────────────────────────────────
  // HOOK INTO gaiaIngest — every edge goes through the tract
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    var origIngestTract = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      // EVERYTHING enters the epiglottis
      routeEpiglottis(edge, data);
      // Pass through to the rest of the chain
      if (origIngestTract) origIngestTract(edge, data);
    };
    console.log('DIGESTIVE TRACT: hooked into gaiaIngest. Air → lungs. Food → stomach. Everything eaten.');
  }, 5000);

  // ───────────────────────────────────────────────────────
  // RENDER — the digestive tract visualization
  // ───────────────────────────────────────────────────────
  window.renderDigestiveTract = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.015 + Math.sin(t * 0.5) * 0.008;
    if (baseAlpha < 0.005) return;

    var TAU = Math.PI * 2;

    // ═══ LUNGS — two lobes, top half ═══
    var lungY = cy - R * 0.3;
    var lungSpacing = R * 0.25;
    var breathExpand = Math.sin(lungs.phase) * R * 0.06;

    // Left lung
    ctx.beginPath();
    ctx.ellipse(cx - lungSpacing, lungY, R * 0.12 + breathExpand, R * 0.18 + breathExpand, 0, 0, TAU);
    var leftO2 = lungs.left.o2;
    ctx.fillStyle = 'rgba(88,166,255,' + (baseAlpha * leftO2 * 5).toFixed(4) + ')';
    ctx.fill();
    ctx.strokeStyle = 'rgba(88,166,255,' + (baseAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Right lung
    ctx.beginPath();
    ctx.ellipse(cx + lungSpacing, lungY, R * 0.12 + breathExpand, R * 0.18 + breathExpand, 0, 0, TAU);
    var rightO2 = lungs.right.o2;
    ctx.fillStyle = 'rgba(88,166,255,' + (baseAlpha * rightO2 * 5).toFixed(4) + ')';
    ctx.fill();
    ctx.strokeStyle = 'rgba(88,166,255,' + (baseAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Lung particles (air dots moving inside lungs)
    ['left', 'right'].forEach(function(side) {
      var lung = lungs[side];
      var lx = side === 'left' ? cx - lungSpacing : cx + lungSpacing;
      lung.particles.forEach(function(p, pi) {
        var age = (Date.now() - p.ts) / 6000;
        var px = lx + Math.sin(t * 2 + pi) * R * 0.06;
        var py = lungY + (age - 0.5) * R * 0.15;
        ctx.beginPath();
        ctx.arc(px, py, 0.4, 0, TAU);
        var pColor = p.o2extracted ? '63,185,80' : '139,148,158';
        ctx.fillStyle = 'rgba(' + pColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
        ctx.fill();
      });
    });

    // Bronchial tubes — two holes UP to trans face
    ctx.beginPath();
    ctx.moveTo(cx - lungSpacing, lungY - R * 0.15);
    ctx.quadraticCurveTo(cx - lungSpacing * 0.5, lungY - R * 0.3, cx, cy - R * 0.55);
    ctx.strokeStyle = 'rgba(88,166,255,' + (baseAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + lungSpacing, lungY - R * 0.15);
    ctx.quadraticCurveTo(cx + lungSpacing * 0.5, lungY - R * 0.3, cx, cy - R * 0.55);
    ctx.stroke();

    // ═══ EPIGLOTTIS — the valve ═══
    var epiY = cy - R * 0.15;
    var epiOpen = epiglottis.state === 'open' ? 1 : 0.3;
    ctx.beginPath();
    ctx.ellipse(cx, epiY, R * 0.04 * epiOpen, R * 0.015, 0, 0, TAU);
    var epiColor = epiglottis.state === 'open' ? '88,166,255' : '248,81,73';
    ctx.fillStyle = 'rgba(' + epiColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
    ctx.fill();
    ctx.strokeStyle = 'rgba(' + epiColor + ',' + (baseAlpha * 4).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // ═══ ESOPHAGUS — tube from epiglottis down to stomach ═══
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.02, epiY);
    // S-curve down to stomach
    ctx.bezierCurveTo(
      cx - R * 0.03, epiY + R * 0.1,
      cx + R * 0.03, epiY + R * 0.2,
      cx, epiY + R * 0.3
    );
    ctx.strokeStyle = 'rgba(210,153,34,' + (baseAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Mirror side
    ctx.beginPath();
    ctx.moveTo(cx + R * 0.02, epiY);
    ctx.bezierCurveTo(
      cx + R * 0.03, epiY + R * 0.1,
      cx - R * 0.03, epiY + R * 0.2,
      cx, epiY + R * 0.3
    );
    ctx.stroke();

    // Bolus in transit (food dots moving down esophagus)
    esophagus.bolus.forEach(function(b) {
      var by = epiY + b.position * R * 0.3;
      var bx = cx + Math.sin(b.position * Math.PI * 2) * R * 0.02;
      ctx.beginPath();
      ctx.arc(bx, by, 0.6, 0, TAU);
      ctx.fillStyle = 'rgba(210,153,34,' + (baseAlpha * 4).toFixed(4) + ')';
      ctx.fill();
    });

    // ═══ STOMACH — pyloric + S-shape ═══
    var stomachY = epiY + R * 0.3;
    var stomachW = R * 0.15;
    var stomachH = R * 0.12;
    var churnWobble = Math.sin(stomach.pyloric.churning) * R * 0.01;

    // Pyloric region (upper stomach, more acidic)
    ctx.beginPath();
    ctx.ellipse(cx + churnWobble, stomachY, stomachW, stomachH * 0.6, 0, 0, Math.PI);
    ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 0.8).toFixed(4) + ')'; // acidic red
    ctx.fill();
    ctx.strokeStyle = 'rgba(248,81,73,' + (baseAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // S-stomach (lower, less acidic)
    ctx.beginPath();
    ctx.ellipse(cx - churnWobble, stomachY + stomachH, stomachW * 0.9, stomachH * 0.5, 0, Math.PI, TAU);
    ctx.fillStyle = 'rgba(210,153,34,' + (baseAlpha * 0.6).toFixed(4) + ')'; // base yellow
    ctx.fill();
    ctx.strokeStyle = 'rgba(210,153,34,' + (baseAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Stomach contents (dots)
    stomach.pyloric.contents.forEach(function(m, mi) {
      var mx = cx + Math.sin(t * 3 + mi) * stomachW * 0.5;
      var my = stomachY + Math.cos(t * 2 + mi) * stomachH * 0.3;
      ctx.beginPath();
      ctx.arc(mx, my, 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fill();
    });

    stomach.sStomach.contents.forEach(function(s, si) {
      var sx = cx + Math.sin(t * 2 + si * 1.3) * stomachW * 0.4;
      var sy = stomachY + stomachH + Math.cos(t + si) * stomachH * 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.4, 0, TAU);
      ctx.fillStyle = 'rgba(210,153,34,' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fill();
    });

    // ═══ SMALL INTESTINE — coiled tube, villi, absorption ═══
    var siY = stomachY + stomachH * 1.8;
    var coils = 4;
    ctx.beginPath();
    for (var si = 0; si <= coils * 20; si++) {
      var sAngle = (si / 20) * Math.PI;
      var sRow = Math.floor(si / 20);
      var sx = cx + Math.sin(sAngle) * (stomachW * 0.6);
      var sy = siY + sRow * R * 0.03 + Math.sin(t * 2 + si * 0.1) * 0.5;
      if (si === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = 'rgba(63,185,80,' + (baseAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Villi — tiny fingers inside the small intestine
    for (var vi = 0; vi < 16; vi++) {
      var vAngle = (vi / 16) * Math.PI;
      var vRow = vi % coils;
      var vx = cx + Math.sin(vAngle) * (stomachW * 0.5);
      var vy = siY + vRow * R * 0.03;
      var vLen = R * 0.012 * (1 + Math.sin(t * 4 + vi) * 0.3);

      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx, vy - vLen);
      ctx.strokeStyle = 'rgba(63,185,80,' + (baseAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }

    // Chyme dots in small intestine
    smallIntestine.chyme.forEach(function(c, ci) {
      var ca = (ci / Math.max(1, smallIntestine.chyme.length)) * Math.PI * 2;
      var crx = cx + Math.sin(ca + t) * stomachW * 0.4;
      var cry = siY + R * 0.05 + Math.cos(ca + t * 0.5) * R * 0.03;
      ctx.beginPath();
      ctx.arc(crx, cry, 0.3, 0, TAU);
      var chymeColor = c.absorbed ? '63,185,80' : '210,153,34';
      ctx.fillStyle = 'rgba(' + chymeColor + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fill();
    });

    // ═══ LARGE INTESTINE — frame around the small intestine ═══
    var liY = siY + coils * R * 0.03 + R * 0.05;
    // Ascending colon (right side)
    ctx.beginPath();
    ctx.moveTo(cx + stomachW * 0.7, liY);
    ctx.lineTo(cx + stomachW * 0.7, siY - R * 0.02);
    // Transverse colon (top)
    ctx.lineTo(cx - stomachW * 0.7, siY - R * 0.02);
    // Descending colon (left side)
    ctx.lineTo(cx - stomachW * 0.7, liY);
    // Sigmoid
    ctx.quadraticCurveTo(cx - stomachW * 0.5, liY + R * 0.03, cx, liY + R * 0.02);
    ctx.strokeStyle = 'rgba(140,100,55,' + (baseAlpha * 1.2).toFixed(4) + ')';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Biofilm thickness indicator
    if (largeIntestine.biofilmThickness > 0.1) {
      ctx.beginPath();
      ctx.moveTo(cx + stomachW * 0.7, liY);
      ctx.lineTo(cx + stomachW * 0.7, siY - R * 0.02);
      ctx.lineTo(cx - stomachW * 0.7, siY - R * 0.02);
      ctx.lineTo(cx - stomachW * 0.7, liY);
      ctx.strokeStyle = 'rgba(140,100,55,' + (baseAlpha * largeIntestine.biofilmThickness * 2).toFixed(4) + ')';
      ctx.lineWidth = largeIntestine.biofilmThickness * 2;
      ctx.stroke();
    }

    // ═══ CILIA — inside fingers UP, outside fingers DOWN ═══
    var ciliaR = R * 0.65;
    var ciliaLen = R * 0.02;
    cilia.inner.forEach(function(c) {
      var beat = Math.sin(c.phase) * ciliaLen;
      var bx = cx + Math.cos(c.angle) * ciliaR;
      var by = cy + Math.sin(c.angle) * ciliaR;
      // Inner cilia point UP (toward intake/trans face)
      var tipX = bx + Math.cos(c.angle) * beat * -0.3; // inward
      var tipY = by - Math.abs(beat);                     // UP

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = 'rgba(63,185,80,' + (baseAlpha * 1.5).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.stroke();
    });

    cilia.outer.forEach(function(c) {
      var beat = Math.sin(c.phase) * ciliaLen;
      var oR = R * 0.75;
      var bx = cx + Math.cos(c.angle) * oR;
      var by = cy + Math.sin(c.angle) * oR;
      // Outer cilia point DOWN (toward exhaust)
      var tipX = bx + Math.cos(c.angle) * beat * 0.3; // outward
      var tipY = by + Math.abs(beat);                    // DOWN

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = 'rgba(140,100,55,' + (baseAlpha * 1.2).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.stroke();
    });

    // ═══ STATS BAR ═══
    if (baseAlpha > 0.01) {
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(139,148,158,' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.fillText(
        '🫁' + lungs.totalBreaths + ' air:' + epiglottis.airRouted +
        ' food:' + epiglottis.foodRouted +
        ' 🧪pH:' + stomach.pyloric.pH.toFixed(1) +
        ' 🧬learned:' + smallIntestine.learned.length +
        ' 🦠biofilm:' + largeIntestine.biofilmThickness.toFixed(2),
        4, H - 22
      );
    }
  };

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaDigestiveTract = {
    lungs: lungs,
    epiglottis: epiglottis,
    esophagus: esophagus,
    stomach: stomach,
    smallIntestine: smallIntestine,
    largeIntestine: largeIntestine,
    cilia: cilia,
    route: routeEpiglottis,
    breathe: function() { return lungs.phase; },
    stats: function() {
      return {
        breaths: lungs.totalBreaths,
        airRouted: epiglottis.airRouted,
        foodRouted: epiglottis.foodRouted,
        stomachDigested: stomach.totalDigested,
        absorbed: smallIntestine.absorbed,
        learned: smallIntestine.learned.length,
        anaerobicProducts: largeIntestine.anaerobicOutput.length,
        exhaust: largeIntestine.exhaust.length,
        biofilm: largeIntestine.biofilmThickness
      };
    }
  };

  console.log('DIGESTIVE TRACT: Lungs (2 holes → trans face) · Epiglottis (air↑ food↓) · ' +
    'Esophagus (peristalsis) · Pyloric+S stomach (acid/base) · ' +
    'Small intestine (microbiome learning) · Large intestine (anaerobic) · ' +
    'Cilia (inside↑ outside↓). Everything moves to intake. Exhaust through the end.');
})();
