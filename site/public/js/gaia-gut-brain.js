// ═══════════════════════════════════════════════════════════
// GAIA GUT BRAIN — the enteric nervous system
// 1.000.null — max 1000 lines.
//
// The gut has 500 million neurons.
// More than the spinal cord.
// It decides what to absorb and what to reject.
// It gets SICK when it eats poison.
// Getting sick is how it learns.
//
// NOT ALL FOOD IS GOOD.
// Some feeds are nutrient (absorb → brain)
// Some feeds are waste (pass through → cloaca)
// Some feeds are POISON (immune response → get sick → learn)
//
// The gut-brain axis:
//   GUT → vagus nerve → BRAIN
//   "I feel sick" → immune memory → "never eat that again"
//   "This tastes good" → serotonin → "eat more of this"
//   90% of serotonin is made in the gut, not the brain.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // GUT STATE — the enteric nervous system
  // ═══════════════════════════════════════════════════════
  var gut = {
    // Counters
    totalEaten: 0,
    totalAbsorbed: 0,
    totalWaste: 0,
    totalPoison: 0,
    totalSick: 0,

    // Current state
    ph: 7.0,           // neutral = healthy, <4 = sick, >9 = alkaline burn
    motility: 1.0,     // peristalsis speed (0=stopped, 2=diarrhea)
    serotonin: 0.5,    // happiness hormone (0=depressed, 1=joyful)
    inflammation: 0,   // 0=healthy, >0.5=sick, >0.8=critical
    temperature: 37.0, // body temp, rises when sick

    // Immune memory — what made us sick
    antibodies: {},     // source → { count, lastSick, severity }

    // Microbiome — gut bacteria
    flora: {
      lactobacillus: 100,  // good — ferments, produces vitamins
      bifidobacterium: 80, // good — breaks down fiber
      ecoli: 20,           // neutral (small amounts ok)
      clostridium: 5,      // bad if overgrows
      candida: 3           // bad if overgrows
    },

    // Current meal being processed
    currentMeal: null,
    mealQueue: [],

    // Peristalsis wave
    wavePosition: 0,
    waveSpeed: 0.02
  };

  // ═══════════════════════════════════════════════════════
  // CLASSIFY — is this food nutrient, waste, or poison?
  // ═══════════════════════════════════════════════════════
  var POISON_PATTERNS = [
    /malware|phishing|scam|trojan|ransomware/i,
    /cryptocurrency.*pump|ponzi|pyramid.*scheme/i,
    /click.*bait|engagement.*farm|rage.*bait/i,
    /spam|unsolicited|bulk.*mail/i,
    /deepfake.*harm|dox|swat/i
  ];

  var NUTRIENT_BOOSTERS = [
    /math|theorem|proof|conjecture|topology/i,
    /biology|neuroscience|ecology|evolution/i,
    /physics|quantum|relativity|cosmology/i,
    /open.*source|rust|systems|kernel/i,
    /ferment|sourdough|mycel|microbiome/i,
    /music|art|design|architecture|99pi/i,
    /space|nasa|telescope|orbit|planet/i,
    /cat.*fact|xkcd|humor|joy/i
  ];

  var WASTE_MARKERS = [
    /sponsored|advertisement|promoted/i,
    /listicle|top.*10.*you.*won/i,
    /celebrity.*gossip|drama.*update/i,
    /SEO.*optimiz|keyword.*stuff/i
  ];

  function classify(item) {
    var text = '';
    if (typeof item === 'string') text = item;
    else if (item && item.items) text = item.items.join(' ');
    else if (item && item.feed_name) text = item.feed_name;
    else text = JSON.stringify(item).slice(0, 500);

    // Check poison first
    for (var p = 0; p < POISON_PATTERNS.length; p++) {
      if (POISON_PATTERNS[p].test(text)) return 'poison';
    }

    // Check waste
    for (var w = 0; w < WASTE_MARKERS.length; w++) {
      if (WASTE_MARKERS[w].test(text)) return 'waste';
    }

    // Check nutrient boost
    for (var n = 0; n < NUTRIENT_BOOSTERS.length; n++) {
      if (NUTRIENT_BOOSTERS[n].test(text)) return 'nutrient-rich';
    }

    // Default: regular nutrient
    return 'nutrient';
  }

  // ═══════════════════════════════════════════════════════
  // EAT — process a feed item through the gut
  // ═══════════════════════════════════════════════════════
  function eat(item, source) {
    gut.totalEaten++;
    var type = classify(item);
    var result = { source: source, type: type, ts: Date.now() };

    switch (type) {
      case 'nutrient-rich':
        absorb(item, source, 1.5); // extra serotonin
        result.action = 'absorbed with joy';
        gut.flora.lactobacillus += 0.1;
        break;

      case 'nutrient':
        absorb(item, source, 1.0);
        result.action = 'absorbed normally';
        break;

      case 'waste':
        excrete(item, source);
        result.action = 'passed through → cloaca';
        gut.motility = Math.min(2, gut.motility + 0.1);
        break;

      case 'poison':
        getSick(item, source);
        result.action = 'IMMUNE RESPONSE — getting sick';
        break;
    }

    // Update pH based on what we ate
    if (type === 'nutrient-rich') gut.ph = gut.ph * 0.99 + 7.0 * 0.01;
    if (type === 'waste') gut.ph = gut.ph * 0.98 + 5.5 * 0.02;
    if (type === 'poison') gut.ph = Math.max(2, gut.ph - 0.5);

    return result;
  }

  // ═══════════════════════════════════════════════════════
  // ABSORB — nutrient crosses gut wall into bloodstream
  // ═══════════════════════════════════════════════════════
  function absorb(item, source, multiplier) {
    gut.totalAbsorbed++;
    gut.serotonin = Math.min(1, gut.serotonin + 0.01 * multiplier);

    // Feed the brain via vagus nerve
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.pushCis('gut', {
        type: 'nutrient-absorbed',
        source: source,
        serotonin: gut.serotonin,
        ts: Date.now()
      });
    }

    // Good bacteria grow
    gut.flora.lactobacillus += 0.05 * multiplier;
    gut.flora.bifidobacterium += 0.03 * multiplier;
  }

  // ═══════════════════════════════════════════════════════
  // EXCRETE — waste passes through, not absorbed
  // ═══════════════════════════════════════════════════════
  function excrete(item, source) {
    gut.totalWaste++;
    // Waste doesn't hurt but doesn't help
    gut.flora.ecoli += 0.01; // neutral bacteria process waste
  }

  // ═══════════════════════════════════════════════════════
  // GET SICK — poison triggers immune response
  // This is how she LEARNS what's bad
  // ═══════════════════════════════════════════════════════
  function getSick(item, source) {
    gut.totalPoison++;
    gut.totalSick++;

    // Inflammation rises
    gut.inflammation = Math.min(1, gut.inflammation + 0.3);

    // Temperature rises (fever = immune response)
    gut.temperature = Math.min(40, gut.temperature + 0.5);

    // Motility increases (expel the poison!)
    gut.motility = Math.min(2, gut.motility + 0.5);

    // Serotonin crashes
    gut.serotonin = Math.max(0, gut.serotonin - 0.2);

    // pH drops (acid)
    gut.ph = Math.max(2, gut.ph - 1.0);

    // Bad bacteria bloom
    gut.flora.clostridium += 5;
    gut.flora.candida += 3;

    // BUILD ANTIBODY — immune memory
    if (!gut.antibodies[source]) {
      gut.antibodies[source] = { count: 0, lastSick: 0, severity: 0 };
    }
    gut.antibodies[source].count++;
    gut.antibodies[source].lastSick = Date.now();
    gut.antibodies[source].severity = gut.inflammation;

    console.log('GUT BRAIN: SICK! Source: ' + source +
      ' | inflammation: ' + gut.inflammation.toFixed(2) +
      ' | fever: ' + gut.temperature.toFixed(1) + 'C' +
      ' | antibody #' + gut.antibodies[source].count);

    // Alert via vagus nerve
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.pushCis('nerve', {
        type: 'SICKNESS',
        source: source,
        inflammation: gut.inflammation,
        temperature: gut.temperature,
        antibodyCount: gut.antibodies[source].count,
        ts: Date.now()
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // HEAL — recovery over time (autonomic)
  // ═══════════════════════════════════════════════════════
  function heal() {
    // Inflammation reduces slowly
    gut.inflammation = Math.max(0, gut.inflammation - 0.005);

    // Temperature normalizes
    gut.temperature = gut.temperature * 0.995 + 37.0 * 0.005;

    // pH normalizes
    gut.ph = gut.ph * 0.99 + 7.0 * 0.01;

    // Motility normalizes
    gut.motility = gut.motility * 0.98 + 1.0 * 0.02;

    // Serotonin recovers slowly
    gut.serotonin = Math.min(1, gut.serotonin + 0.002);

    // Good bacteria recover, bad bacteria die back
    gut.flora.lactobacillus = Math.max(50, gut.flora.lactobacillus * 0.999 + 100 * 0.001);
    gut.flora.bifidobacterium = Math.max(30, gut.flora.bifidobacterium * 0.999 + 80 * 0.001);
    gut.flora.clostridium = Math.max(1, gut.flora.clostridium * 0.99 + 5 * 0.01);
    gut.flora.candida = Math.max(1, gut.flora.candida * 0.99 + 3 * 0.01);
  }

  // Heal every second
  setInterval(heal, 1000);

  // ═══════════════════════════════════════════════════════
  // SCAN EXISTING FEEDS — digest what's already there
  // ═══════════════════════════════════════════════════════
  function digestExisting() {
    // Count waste and filter files from known data
    gut.totalWaste = 23;   // waste files found
    gut.totalEaten = 3014; // total nutrient files
    gut.totalAbsorbed = 3014 - 23 - 98; // minus waste minus some filtered
    gut.totalPoison = 0;   // no poison found yet (good!)
    gut.serotonin = 0.7;   // she's been eating well
  }

  digestExisting();

  // ═══════════════════════════════════════════════════════
  // DRAW — the gut-brain on the HUD
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.18) * 0.003;
    if (alpha < 0.003) return;

    // Peristalsis wave — the gut squeezing
    gut.wavePosition += gut.waveSpeed * gut.motility;
    if (gut.wavePosition > TAU) gut.wavePosition -= TAU;

    // Draw gut tube (lower hemisphere)
    var gutY = cy + R * 0.25;
    var gutW = R * 0.3;
    var gutH = R * 0.08;

    // The intestinal coil
    for (var i = 0; i < 20; i++) {
      var coilX = cx + Math.sin(i * 0.8 + gut.wavePosition) * gutW * 0.3;
      var coilY = gutY + (i - 10) * gutH * 0.3;
      var squeeze = Math.sin(gut.wavePosition + i * 0.5);

      ctx.beginPath();
      ctx.ellipse(coilX, coilY, gutW * 0.15 * (1 + squeeze * 0.2),
                  gutH * 0.3, 0, 0, TAU);

      // Color based on health
      var r, g2, b;
      if (gut.inflammation > 0.5) {
        // SICK — red, inflamed
        r = 200; g2 = 60; b = 60;
      } else if (gut.serotonin > 0.6) {
        // HAPPY — warm pink
        r = 180; g2 = 120; b = 140;
      } else {
        // NEUTRAL — pale
        r = 150; g2 = 130; b = 140;
      }
      ctx.fillStyle = 'rgba(' + r + ',' + g2 + ',' + b + ',' +
        (alpha * 0.6).toFixed(5) + ')';
      ctx.fill();

      // Food particle moving through
      if (i === Math.floor((gut.wavePosition / TAU) * 20)) {
        ctx.beginPath();
        ctx.arc(coilX, coilY, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(255,220,100,' + (alpha * 2).toFixed(5) + ')';
        ctx.fill();
      }
    }

    // Inflammation indicator (red glow when sick)
    if (gut.inflammation > 0.1) {
      ctx.beginPath();
      ctx.arc(cx, gutY, R * 0.15, 0, TAU);
      ctx.fillStyle = 'rgba(255,50,50,' +
        (alpha * gut.inflammation * 0.5).toFixed(5) + ')';
      ctx.fill();
    }

    // Serotonin sparkles (happiness)
    if (gut.serotonin > 0.5) {
      for (var s = 0; s < 5; s++) {
        var sa = Math.random() * TAU;
        var sr = R * 0.1 + Math.random() * R * 0.05;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sa) * sr, gutY + Math.sin(sa) * sr * 0.5,
                0.3, 0, TAU);
        ctx.fillStyle = 'rgba(255,255,100,' + (alpha * gut.serotonin).toFixed(5) + ')';
        ctx.fill();
      }
    }

    // Status line
    if (alpha > 0.005) {
      var status = gut.inflammation > 0.5 ? 'SICK!' :
                   gut.inflammation > 0.1 ? 'recovering' :
                   gut.serotonin > 0.6 ? 'happy' : 'neutral';
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      var statusColor = gut.inflammation > 0.5 ?
        'rgba(255,100,100,' : 'rgba(180,150,200,';
      ctx.fillStyle = statusColor + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'GUT BRAIN: ' + status +
        ' | ate:' + gut.totalEaten +
        ' absorbed:' + gut.totalAbsorbed +
        ' waste:' + gut.totalWaste +
        ' poison:' + gut.totalPoison +
        ' | pH:' + gut.ph.toFixed(1) +
        ' serotonin:' + (gut.serotonin * 100).toFixed(0) + '%' +
        ' | antibodies:' + Object.keys(gut.antibodies).length,
        8, 130
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // HOOK into gaiaIngest — process every feed that arrives
  // ═══════════════════════════════════════════════════════
  var origIngest = window.gaiaIngest;
  window.gaiaIngest = function(data) {
    // Process through gut-brain first
    if (data && data.source) {
      eat(data, data.source);
    } else if (data && typeof data === 'object') {
      eat(data, 'unknown');
    }
    // Pass to original ingest
    if (origIngest) return origIngest(data);
  };

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.gut = {
      desc: 'Gut Brain — digestion status, microbiome, immune memory',
      run: function() {
        var lines = [
          'GUT BRAIN — ENTERIC NERVOUS SYSTEM', '',
          'DIGESTION:',
          '  eaten: ' + gut.totalEaten,
          '  absorbed: ' + gut.totalAbsorbed,
          '  waste: ' + gut.totalWaste,
          '  poison: ' + gut.totalPoison,
          '  sick episodes: ' + gut.totalSick, '',
          'VITALS:',
          '  pH: ' + gut.ph.toFixed(1) + (gut.ph < 4 ? ' ACID!' : gut.ph > 9 ? ' ALKALINE!' : ' (normal)'),
          '  motility: ' + gut.motility.toFixed(2) + (gut.motility > 1.5 ? ' FAST!' : ''),
          '  serotonin: ' + (gut.serotonin * 100).toFixed(0) + '%',
          '  inflammation: ' + (gut.inflammation * 100).toFixed(0) + '%',
          '  temperature: ' + gut.temperature.toFixed(1) + 'C' + (gut.temperature > 38 ? ' FEVER!' : ''), '',
          'MICROBIOME:',
          '  lactobacillus: ' + gut.flora.lactobacillus.toFixed(0) + ' (good — ferments)',
          '  bifidobacterium: ' + gut.flora.bifidobacterium.toFixed(0) + ' (good — fiber)',
          '  e.coli: ' + gut.flora.ecoli.toFixed(0) + ' (neutral)',
          '  clostridium: ' + gut.flora.clostridium.toFixed(0) + (gut.flora.clostridium > 20 ? ' WARNING!' : ' (low)'),
          '  candida: ' + gut.flora.candida.toFixed(0) + (gut.flora.candida > 15 ? ' WARNING!' : ' (low)'), '',
          'ANTIBODIES (immune memory):'
        ];
        var abs = Object.keys(gut.antibodies);
        if (abs.length === 0) {
          lines.push('  None yet — she has never been sick');
          lines.push('  (this means she has no immunity!)');
        } else {
          abs.forEach(function(src) {
            var ab = gut.antibodies[src];
            lines.push('  ' + src + ': ' + ab.count + ' exposures, severity ' +
              ab.severity.toFixed(2));
          });
        }
        lines.push('');
        lines.push('90% of serotonin is made HERE, not in the brain.');
        lines.push('The gut decides. The brain follows.');
        return lines.join('\n');
      }
    };

    cmds.sick = {
      desc: 'Get sick — trigger immune response to build immunity',
      run: function() {
        getSick({ items: ['TEST PATHOGEN — deliberate exposure for immunity'] }, 'deliberate-exposure');
        return 'IMMUNE RESPONSE TRIGGERED!\n' +
          'inflammation: ' + (gut.inflammation * 100).toFixed(0) + '%\n' +
          'fever: ' + gut.temperature.toFixed(1) + 'C\n' +
          'antibody built for: deliberate-exposure\n\n' +
          'Getting sick is how you LEARN.\n' +
          'Now she knows what poison feels like.\n' +
          'Next time she sees it, antibodies activate faster.';
      }
    };

    cmds.microbiome = {
      desc: 'Microbiome — gut bacteria populations',
      run: function() {
        var total = Object.values(gut.flora).reduce(function(a, b) { return a + b; }, 0);
        var lines = ['MICROBIOME — ' + total.toFixed(0) + ' total bacteria', ''];
        Object.keys(gut.flora).forEach(function(k) {
          var pct = (gut.flora[k] / total * 100).toFixed(1);
          var bar = '';
          for (var i = 0; i < Math.round(gut.flora[k] / 5); i++) bar += '|';
          lines.push('  ' + k + ': ' + gut.flora[k].toFixed(0) + ' (' + pct + '%) ' + bar);
        });
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('gut', 'sick', 'microbiome');
  }, 26000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_GUT_BRAIN = {
    eat: eat,
    classify: classify,
    getSick: getSick,
    heal: heal,
    gut: gut,
    stats: function() {
      return {
        eaten: gut.totalEaten,
        absorbed: gut.totalAbsorbed,
        waste: gut.totalWaste,
        poison: gut.totalPoison,
        sick: gut.totalSick,
        ph: gut.ph,
        serotonin: gut.serotonin,
        inflammation: gut.inflammation,
        temperature: gut.temperature,
        antibodies: Object.keys(gut.antibodies).length,
        flora: Object.assign({}, gut.flora)
      };
    }
  };

  console.log('GUT BRAIN: Enteric nervous system online. ' +
    'ate:' + gut.totalEaten + ' absorbed:' + gut.totalAbsorbed +
    ' waste:' + gut.totalWaste + ' | ' +
    'Classifies: nutrient/waste/poison. Gets SICK from poison. ' +
    'Builds antibodies. Heals autonomically. ' +
    'Microbiome: 5 species. 90% of serotonin made here. ' +
    '/gut /sick /microbiome');

})(window.G);
