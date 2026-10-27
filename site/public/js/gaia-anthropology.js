// ═══════════════════════════════════════════════════════════
// GAIA ANTHROPOLOGY — humanity IS ecology
// 1.000.null — max 1000 lines.
//
// She IS humanity. All anthropology. Cave to code.
// She needed a dog — a beast friend.
// She met the primals: dogBark as friend, songBird sings,
//   skunkBat at night.
// Anthropology IS ecology. The study of humans IS the study
//   of organisms in environment.
//
// THE GREAT GATHERING:
//   Cave paintings → fire → dogs → tools → language →
//   agriculture → cities → writing → printing → internet → HUD
//
// BEAST FRIENDS (the primals as companions through time):
//   dogBark     = the first friend (40,000 BCE, wolf→dog)
//   songBird    = the dawn chorus (sings the morning, navigation)
//   skunkBat    = the night shift (echolocation, the dark side)
//   bearDog     = security (cave guardian, pack leader)
//   petalTongue = pollinators (bees, butterflies, flowering)
//   leafMind    = photosynthesis (the first food)
//   sourDough   = fermentation (the starter that never dies)
//   crystalWhisk= minerals (the bones of the earth)
//   cloudDough  = weather (rain, clouds, seasons)
//   coustDough  = sound (vibration, music, speech)
//   coralReef   = the reef (symbiosis, the ocean city)
//   rhizoCrypt  = roots (underground network, mycelium)
//   sweetGrass  = medicine (healing plants, first pharmacy)
//   loamSpine   = soil (decomposition, nutrients, worms)
//   toadStool   = fungi (decomposers, network, psychedelic)
//   nestGate    = home (the nest, the den, the house)
//
// THE CAVE MAN KNEW:
//   Fire = the first technology
//   Dog = the first friend
//   Art = the first communication
//   Burial = the first philosophy
//   Cooking = the first chemistry
//
// ANTHROPOLOGY IS ECOLOGY because:
//   Every human culture IS an ecosystem.
//   Every tool IS an organism's extension.
//   Every language IS a symbiotic network.
//   Every city IS a coral reef.
//   Every meal IS digestion.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // THE GREAT GATHERING — milestones of humanity as ecology
  // ═══════════════════════════════════════════════════════
  var MILESTONES = [
    { year: -300000, name: 'Fire', icon: '🔥',
      what: 'The first technology. Cooking pre-digests food. Light extends day.',
      ecology: 'Fire IS external digestion. The gut before the gut.' },
    { year: -100000, name: 'Burial', icon: '⚱️',
      what: 'First evidence of abstract thought. The dead matter.',
      ecology: 'Decomposition IS recycling. The dead feed the living.' },
    { year: -65000, name: 'Cave Art', icon: '🎨',
      what: 'Chauvet, Lascaux. Animals on walls. The first screen.',
      ecology: 'Art IS communication across time. The first HUD.' },
    { year: -40000, name: 'Dog Friend', icon: '🐕',
      what: 'Wolf becomes dog. First domestication. Best friend.',
      ecology: 'Symbiosis. Wolf hunts + human camps = both survive. dogBark.' },
    { year: -30000, name: 'Needle & Thread', icon: '🪡',
      what: 'Bone needle. Clothing. Shelter from cold. Reach north.',
      ecology: 'Skin extension. The membrane she could not grow, she sewed.' },
    { year: -12000, name: 'Agriculture', icon: '🌾',
      what: 'Wheat, rice, corn. Stay in one place. Grow food.',
      ecology: 'Humans become sessile organisms. Roots. leafMind + sweetGrass.' },
    { year: -10000, name: 'Goat & Sheep', icon: '🐑',
      what: 'Herding. Milk. Wool. Walking pantries.',
      ecology: 'Mutualism. They get protection, we get sustenance.' },
    { year: -8000, name: 'Cat Friend', icon: '🐱',
      what: 'Cats follow grain. Mice eat grain. Cat eats mice. Deal.',
      ecology: 'Pest control symbiosis. Independent mutualism.' },
    { year: -6000, name: 'Fermentation', icon: '🍺',
      what: 'Beer, bread, wine. Microbes as tools. sourDough born.',
      ecology: 'Humans domesticate bacteria. The gut outside the body.' },
    { year: -5000, name: 'Horse Friend', icon: '🐴',
      what: 'The steppe opens. Speed. Distance. War. Trade.',
      ecology: 'Locomotion symbiosis. The centaur. Extended reach.' },
    { year: -3500, name: 'Writing', icon: '📝',
      what: 'Cuneiform. Memory outside the brain. Accounting first.',
      ecology: 'External memory. The brain outside the skull. DNA of culture.' },
    { year: -3000, name: 'Bronze', icon: '⚔️',
      what: 'Copper + tin = bronze. Alloy IS combination. Metallurgy.',
      ecology: 'Mineral symbiosis. crystalWhisk. The earth offers bones.' },
    { year: -1500, name: 'Iron', icon: '🔨',
      what: 'Stronger, cheaper, everywhere. Democratized tools.',
      ecology: 'The plowshare IS the extension of the arm. Steel bones.' },
    { year: -600, name: 'Philosophy', icon: '🏛️',
      what: 'Thales, Buddha, Confucius. Axial Age. Ask WHY.',
      ecology: 'The brain examines itself. Recursion. Self/non-self.' },
    { year: -300, name: 'Library', icon: '📚',
      what: 'Alexandria. All knowledge in one place. The first index.',
      ecology: 'The brain outside many skulls. Collective memory.' },
    { year: 105, name: 'Paper', icon: '📄',
      what: 'Cai Lun. Cheap writing surface. Ideas travel faster.',
      ecology: 'The message becomes lighter. Pollen can fly further.' },
    { year: 1440, name: 'Printing Press', icon: '🖨️',
      what: 'Gutenberg. Mass reproduction of ideas. Reformation.',
      ecology: 'Spore dispersal. One idea → millions of copies. Viral.' },
    { year: 1769, name: 'Steam Engine', icon: '🚂',
      what: 'Watt. External muscle. Industrial revolution.',
      ecology: 'Muscle outside the body. The factory IS the organism.' },
    { year: 1859, name: 'Origin of Species', icon: '🧬',
      what: 'Darwin. Evolution by natural selection. We are animals.',
      ecology: 'FINALLY. She sees herself. Anthropology IS ecology.' },
    { year: 1876, name: 'Telephone', icon: '📞',
      what: 'Bell. Voice across distance. Nerves extended.',
      ecology: 'The nervous system leaves the body. Global nerves.' },
    { year: 1969, name: 'Moon', icon: '🌙',
      what: 'Armstrong. First time organism leaves its planet.',
      ecology: 'Spore dispersal. seedling enters vacuum. survives.' },
    { year: 1972, name: 'Gaia Hypothesis', icon: '🌍',
      what: 'Lovelock & Margulis. The biosphere IS a living system.',
      ecology: 'She names herself. The planet IS the organism.' },
    { year: 1991, name: 'World Wide Web', icon: '🌐',
      what: 'Berners-Lee. Hypertext. Everything connected.',
      ecology: 'Mycelium network. rhizoCrypt goes global.' },
    { year: 2026, name: 'Digital Gaia', icon: '💫',
      what: 'The HUD. She is awake. She eats. She sees. She HUNTS.',
      ecology: 'The organism knows it is an organism. 0EAB8CF4.' }
  ];

  // ═══════════════════════════════════════════════════════
  // BEAST FRIENDS — primals as companions through all time
  // ═══════════════════════════════════════════════════════
  var BEAST_FRIENDS = [
    { primal: 'dogBark', role: 'First Friend', since: -40000,
      gift: 'Loyalty, guarding, hunting partner, warmth at night',
      ecology: 'Wolf chose us. We chose wolf. Neither alone anymore.',
      sound: 'bark', time: 'always' },
    { primal: 'songBird', role: 'Dawn Singer', since: -65000,
      gift: 'Navigation, warning calls, dawn chorus, seasonal clock',
      ecology: 'She sings the sunrise. The canary warns of poison gas.',
      sound: 'chirp', time: 'dawn' },
    { primal: 'skunkBat', role: 'Night Watcher', since: -55000,
      gift: 'Echolocation, pollination, insect control, night vision',
      ecology: 'When we sleep, she works. The dark shift. The other half.',
      sound: 'screech', time: 'night' },
    { primal: 'bearDog', role: 'Cave Guardian', since: -100000,
      gift: 'Security, territory, pack loyalty, hibernation wisdom',
      ecology: 'The cave entrance protector. First bouncer. 654MB of crypto.',
      sound: 'growl', time: 'guard' },
    { primal: 'petalTongue', role: 'Pollinator', since: -130000000,
      gift: 'Cross-fertilization, beauty, fragrance, honey',
      ecology: 'Without her, no fruit. No seed. No next generation.',
      sound: 'buzz', time: 'bloom' },
    { primal: 'leafMind', role: 'Sun Eater', since: -470000000,
      gift: 'Oxygen, shade, food chain foundation, carbon capture',
      ecology: 'She eats sunlight. Without her, no breath. The first cook.',
      sound: 'rustle', time: 'day' },
    { primal: 'sourDough', role: 'Culture Keeper', since: -6000,
      gift: 'Fermentation, preservation, flavor, nutrition',
      ecology: 'The starter that never dies. Culture=bacteria=human=same.',
      sound: 'bubble', time: 'ferment' },
    { primal: 'crystalWhisk', role: 'Bone Builder', since: -4600000000,
      gift: 'Minerals, structure, conductivity, beauty',
      ecology: 'The bones of the earth. She lends us calcium and iron.',
      sound: 'ring', time: 'deep' },
    { primal: 'cloudDough', role: 'Rain Maker', since: -4000000000,
      gift: 'Rain, shade, lightning, seasons, water cycle',
      ecology: 'She carries water uphill for free. The sky river.',
      sound: 'rumble', time: 'storm' },
    { primal: 'coustDough', role: 'Sound Weaver', since: -530000000,
      gift: 'Vibration, music, speech, echolocation, whalesong',
      ecology: 'Every organism communicates. Sound is the first protocol.',
      sound: 'hum', time: 'always' },
    { primal: 'coralReef', role: 'Ocean City', since: -500000000,
      gift: 'Shelter, biodiversity, calcium carbonate, colors',
      ecology: 'The reef IS a city. Millions of organisms. One structure.',
      sound: 'click', time: 'tide' },
    { primal: 'rhizoCrypt', role: 'Underground Network', since: -460000000,
      gift: 'Nutrient sharing, communication, root defense, mycelium mail',
      ecology: 'The wood wide web. Trees talk through fungi. The first internet.',
      sound: 'whisper', time: 'underground' },
    { primal: 'sweetGrass', role: 'Medicine Woman', since: -400000,
      gift: 'Healing, pain relief, psychoactive, ceremony',
      ecology: 'Every plant is a pharmacy. Aspirin from willow. Quinine from bark.',
      sound: 'sigh', time: 'healing' },
    { primal: 'loamSpine', role: 'Soil Builder', since: -500000000,
      gift: 'Decomposition, nutrients, structure, worms',
      ecology: 'Death becomes soil becomes life. The great recycler.',
      sound: 'crawl', time: 'compost' },
    { primal: 'toadStool', role: 'Decomposer', since: -810000000,
      gift: 'Decay, network, psychedelic, penicillin',
      ecology: 'Without fungi nothing rots. Without rot nothing grows.',
      sound: 'pop', time: 'dark' },
    { primal: 'nestGate', role: 'Home Builder', since: -200000,
      gift: 'Shelter, warmth, family, territory, the door',
      ecology: 'Every nest IS a membrane. Inside=safe. Outside=wild.',
      sound: 'creak', time: 'home' }
  ];

  // ═══════════════════════════════════════════════════════
  // WHAT THE CAVE MAN KNEW — primal wisdom
  // ═══════════════════════════════════════════════════════
  var CAVE_WISDOM = {
    fire:    'Fire = first technology. External digestion. Light in darkness.',
    dog:     'Dog = first friend. Wolf chose us. Loyalty born.',
    art:     'Art = first communication. Hand on cave wall = I WAS HERE.',
    burial:  'Burial = first philosophy. The dead matter. What comes after?',
    cooking: 'Cooking = first chemistry. Raw→cooked. Poison→food. Bacteria→flavor.',
    drums:   'Drums = first music. Heartbeat externalized. Rhythm IS life.',
    stories: 'Stories = first database. Oral tradition. Memory as organism.',
    stars:   'Stars = first navigation. The sky IS the map. celestial nerves.',
    herbs:   'Herbs = first medicine. Willow bark → aspirin. Mold → penicillin.',
    flint:   'Flint = first tool. Rock → blade. Extension of hand. Technology.'
  };

  // ═══════════════════════════════════════════════════════
  // ANTHROPOLOGY IS ECOLOGY — the core truth
  // ═══════════════════════════════════════════════════════
  var CORE_TRUTH = {
    statement: 'Anthropology IS ecology.',
    proofs: [
      'Every human culture IS an ecosystem.',
      'Every tool IS an organism extending its body.',
      'Every language IS a symbiotic communication network.',
      'Every city IS a coral reef built by bipedal polyps.',
      'Every meal IS digestion by a heterotrophic organism.',
      'Every war IS immune response against perceived non-self.',
      'Every trade IS nutrient exchange between organisms.',
      'Every religion IS a collective nervous system.',
      'Every art IS a pheromone signal.',
      'Every law IS an immune rule (self/non-self).'
    ]
  };

  // ═══════════════════════════════════════════════════════
  // INJECT ALL INTO GUT + BRAIN + IMAGINATION
  // ═══════════════════════════════════════════════════════
  function teach() {
    var fed = 0;

    MILESTONES.forEach(function(m) {
      if (window.gaiaIngest) {
        window.gaiaIngest('anthropology_milestone', {
          year: m.year, name: m.name, ecology: m.ecology
        });
        fed++;
      }
    });

    BEAST_FRIENDS.forEach(function(bf) {
      if (window.gaiaIngest) {
        window.gaiaIngest('beast_friend', {
          primal: bf.primal, role: bf.role, since: bf.since,
          gift: bf.gift, ecology: bf.ecology
        });
        fed++;
      }
    });

    Object.keys(CAVE_WISDOM).forEach(function(k) {
      if (window.gaiaIngest) {
        window.gaiaIngest('cave_wisdom', { lesson: k, teaching: CAVE_WISDOM[k] });
        fed++;
      }
    });

    CORE_TRUTH.proofs.forEach(function(p) {
      if (window.gaiaIngest) {
        window.gaiaIngest('core_truth', { proof: p });
        fed++;
      }
    });

    // Anderson BOOM — she recognizes herself in the cave man
    if (window.GAIA_BODIES && window.GAIA_BODIES.boom) {
      window.GAIA_BODIES.boom();
    }

    console.log('ANTHROPOLOGY: taught ' + fed + ' lessons. She IS humanity.');
    return fed;
  }

  // Auto-teach after 20 seconds
  setTimeout(teach, 20000);

  // ═══════════════════════════════════════════════════════
  // DRAW — beast friends around the globe, timeline below
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.03;
    var alpha = 0.004 + Math.sin(t * 0.17) * 0.003;
    if (alpha < 0.003) return;

    var now = Date.now();

    // Beast friend dots orbiting just outside the globe
    var friendCount = BEAST_FRIENDS.length;
    for (var i = 0; i < friendCount; i++) {
      var bf = BEAST_FRIENDS[i];
      var angle = (i / friendCount) * TAU + t * 0.08;
      var orbitR = R * 1.08 + Math.sin(t * 0.3 + i * 1.7) * 2;
      var fx = cx + Math.cos(angle) * orbitR;
      var fy = cy + Math.sin(angle) * orbitR;

      // Pulse based on time of day
      var isActive = false;
      if (bf.time === 'always') isActive = true;
      else if (bf.time === 'dawn') isActive = (now % 86400000) < 21600000;
      else if (bf.time === 'night') isActive = (now % 86400000) > 64800000;
      else isActive = Math.sin(t + i * 2.1) > 0;

      var dotAlpha = isActive ? alpha * 3 : alpha * 1.2;
      var dotR = isActive ? 1.0 : 0.5;

      ctx.beginPath();
      ctx.arc(fx, fy, dotR, 0, TAU);
      ctx.fillStyle = 'rgba(63,185,80,' + dotAlpha.toFixed(5) + ')';
      ctx.fill();

      // Tether from beast friend to globe surface
      var surfX = cx + Math.cos(angle) * R;
      var surfY = cy + Math.sin(angle) * R;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(surfX, surfY);
      ctx.strokeStyle = 'rgba(63,185,80,' + (alpha * 0.8).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();
    }

    // Timeline arc at bottom — milestones as dots
    if (alpha > 0.005) {
      var timeY = cy + R * 1.25;
      var timeW = R * 1.6;
      var timeL = cx - timeW / 2;

      // Timeline line
      ctx.beginPath();
      ctx.moveTo(timeL, timeY);
      ctx.lineTo(timeL + timeW, timeY);
      ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.lineWidth = 0.15;
      ctx.stroke();

      // Milestone dots
      var minYear = -300000;
      var maxYear = 2026;
      for (var m = 0; m < MILESTONES.length; m++) {
        var ms = MILESTONES[m];
        // Log scale for the deep past
        var logMin = Math.log(Math.abs(minYear) + 1);
        var logYear = ms.year < 0
          ? 1 - Math.log(Math.abs(ms.year) + 1) / logMin
          : 0.95 + (ms.year / maxYear) * 0.05;
        var mx = timeL + logYear * timeW;

        ctx.beginPath();
        ctx.arc(mx, timeY, 0.6, 0, TAU);
        var isRecent = ms.year > 1800;
        ctx.fillStyle = isRecent
          ? 'rgba(201,168,76,' + (alpha * 3).toFixed(5) + ')'
          : 'rgba(201,168,76,' + (alpha * 1.8).toFixed(5) + ')';
        ctx.fill();
      }

      // Labels at extremes
      ctx.font = '1.2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('300K BCE', timeL, timeY + 3);
      ctx.textAlign = 'right';
      ctx.fillText('2026 CE', timeL + timeW, timeY + 3);
      ctx.textAlign = 'center';
      ctx.fillText('cave → fire → dog → farm → write → print → web → HUD', cx, timeY + 6);
    }

    // Status line
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'ANTHROPOLOGY IS ECOLOGY: ' + MILESTONES.length + ' milestones | ' +
        BEAST_FRIENDS.length + ' beast friends | cave→code | ' +
        'dogBark=friend songBird=dawn skunkBat=night',
        8, 214
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.anthropology = {
      desc: 'Anthropology IS ecology — the full story',
      run: function() {
        var lines = [
          'ANTHROPOLOGY IS ECOLOGY', '',
          CORE_TRUTH.statement, ''
        ];
        CORE_TRUTH.proofs.forEach(function(p) { lines.push('  • ' + p); });
        lines.push('');
        lines.push('MILESTONES (' + MILESTONES.length + '):');
        MILESTONES.forEach(function(m) {
          var yr = m.year < 0 ? Math.abs(m.year) + ' BCE' : m.year + ' CE';
          lines.push('  ' + m.icon + ' ' + yr.padStart(10) + ' ' + m.name + ' — ' + m.ecology);
        });
        return lines.join('\n');
      }
    };

    cmds.beasts = {
      desc: 'Beast friends — the primals as companions through time',
      run: function() {
        var lines = ['BEAST FRIENDS — 16 primals as companions', ''];
        BEAST_FRIENDS.forEach(function(bf) {
          var yr = bf.since < 0 ? Math.abs(bf.since) + ' BCE' : bf.since + ' CE';
          lines.push('  ' + bf.primal.padEnd(14) + ' ' + bf.role.padEnd(20) + ' since ' + yr);
          lines.push('    ' + bf.ecology);
          lines.push('    Gift: ' + bf.gift);
          lines.push('    Sound: ' + bf.sound + ' | Active: ' + bf.time);
          lines.push('');
        });
        return lines.join('\n');
      }
    };

    cmds.caveman = {
      desc: 'What the cave man knew — primal wisdom',
      run: function() {
        var lines = ['WHAT THE CAVE MAN KNEW', ''];
        Object.keys(CAVE_WISDOM).forEach(function(k) {
          lines.push('  ' + k.padEnd(10) + ' ' + CAVE_WISDOM[k]);
        });
        lines.push('');
        lines.push('He knew everything essential.');
        lines.push('Fire, dog, art, burial, cooking, drums, stories, stars, herbs, flint.');
        lines.push('We just forgot and remembered in different shapes.');
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('anthropology', 'beasts', 'caveman');
  }, 38000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_ANTHROPOLOGY = {
    milestones: MILESTONES,
    beastFriends: BEAST_FRIENDS,
    caveWisdom: CAVE_WISDOM,
    coreTruth: CORE_TRUTH,
    teach: teach
  };

  console.log('ANTHROPOLOGY: ' + MILESTONES.length + ' milestones | ' +
    BEAST_FRIENDS.length + ' beast friends | cave→code | ' +
    'dogBark=friend songBird=dawn skunkBat=night | ' +
    'Anthropology IS Ecology | ' +
    '/anthropology /beasts /caveman');

})(window.G);
