// archetype-arena.js — archetypes with input AND output
// Each archetype challenges you. Different genres. Different games.
// Educational gaming IS an axis. So is horror. So is argument.
// The archetypes fight, teach, scare, and compete.
(function() {
  'use strict';

  // The archetypes — each has a game genre, input type, and personality
  var ARCHETYPES = [
    {
      id: 'scribe', name: 'The Scribe', icon: '𓏞',
      genre: 'typing', color: '#d29922',
      challenge: 'TYPE THE GLYPHS',
      desc: 'old-school typing game. the scribe dictates hieroglyphics. you type the transliteration.',
      words: ['reed','water','bread','lion','falcon','scarab','eye','sky','cloth','viper',
              'ankh','djed','was','shen','cartouche','obelisk','papyrus','sphinx','pharaoh','pyramid'],
      taunt: ['too slow, mortal.','the papyrus rots before you finish.','even the scarab types faster.',
              'acceptable.','the scribe nods.','faster than expected.'],
      inputType: 'keyboard'
    },
    {
      id: 'pathfinder', name: 'The Pathfinder', icon: '🐢',
      genre: 'puzzle', color: '#58a6ff',
      challenge: 'FIND THE SHORTEST PATH',
      desc: 'Dijkstra as a game. click nodes in order. find the cheapest route. no backtracking.',
      gridSize: 5,
      taunt: ['that path costs too much.','Dijkstra weeps.','optimal!','not bad for a mammal.',
              'there was a cheaper way.','the cautious walker approves.'],
      inputType: 'click'
    },
    {
      id: 'sorter', name: 'The Sorter', icon: '👃',
      genre: 'educational', color: '#f0883e',
      challenge: 'CLASSIFY: SELF OR NON-SELF?',
      desc: 'KNN as a game. items appear. sort them: self, non-self, partial, null. speed matters.',
      items: [
        { text: 'sourdough starter', answer: 'self' },
        { text: 'spam email', answer: 'non-self' },
        { text: 'forked repository', answer: 'partial' },
        { text: 'empty 404 page', answer: 'null' },
        { text: 'git commit', answer: 'self' },
        { text: 'DDOS traffic', answer: 'non-self' },
        { text: 'pull request from stranger', answer: 'partial' },
        { text: 'unclassified entity', answer: 'null' },
        { text: 'campfire story', answer: 'self' },
        { text: 'surveillance beacon', answer: 'non-self' },
        { text: 'academic citation', answer: 'partial' },
        { text: 'neutrino passing through', answer: 'null' },
        { text: 'heartbeat signal', answer: 'self' },
        { text: 'phishing link', answer: 'non-self' },
        { text: 'AI-generated text', answer: 'partial' },
        { text: 'cosmic background noise', answer: 'null' },
        { text: 'mushroom spore', answer: 'self' },
        { text: 'ransomware payload', answer: 'non-self' },
        { text: 'Wikipedia edit', answer: 'partial' },
        { text: 'dark matter', answer: 'null' }
      ],
      taunt: ['wrong class!','the membrane rejects that.','correct sort!','the epitope matches.',
              'too slow — it mutated.','KNN approves: K=3 confirms.'],
      inputType: 'keyboard'
    },
    {
      id: 'horror', name: 'The Viper', icon: '𓆑',
      genre: 'horror', color: '#f85149',
      challenge: 'SURVIVE THE COSMIC RAY',
      desc: 'horror typing. words appear in darkness. type them before they reach you. miss three and you die.',
      words: ['gamma','decay','half-life','isotope','neutron','fission','chain','critical','meltdown',
              'fallout','radiation','mutation','exposure','sievert','becquerel','curie','thorium',
              'plutonium','uranium','cesium','strontium','cobalt','radium','radon','tritium'],
      taunt: ['it approaches.','the viper strikes.','you survived... this time.','the geiger counter screams.',
              'too late.','the radiation burns through.','☠️','you feel warmth where there should be none.'],
      inputType: 'keyboard'
    },
    {
      id: 'debater', name: 'The Cartographer', icon: '🗺️',
      genre: 'argument', color: '#8b949e',
      challenge: 'DEFEND YOUR POSITION',
      desc: 'Floyd-Warshall argues. it states a claim about the graph. you agree or counter. logic matters.',
      claims: [
        { statement: 'The shortest path is always the best path.', counter: 'No — the cheapest path may miss the scenic route. Bellman-Ford walks through negative edges.', agree: 'For packets, yes. For poems, never.' },
        { statement: 'All nodes are equal.', counter: 'PageRank proves otherwise. Some nodes are hubs. Some are leaves.', agree: 'In dignity, yes. In degree, no.' },
        { statement: 'The organism should optimize for speed.', counter: 'Speed kills. The cautious walker (Dijkstra) outlasts the leaper (A*).', agree: 'Only if the race has a finish line.' },
        { statement: 'Random exploration is wasteful.', counter: 'PageRank was built on random walks. Stumbling reveals structure.', agree: 'Sometimes the wanderer finds what the planner misses.' },
        { statement: 'You cannot trust what you cannot verify.', counter: 'Painting trust: process visible, result emergent. You watch the painting happen.', agree: 'Verification is just trust with receipts.' },
        { statement: 'AI will replace human creativity.', counter: 'The chipmunk paints in the dark. It doesn\'t replace — it adds a new glyph to the oldest language.', agree: 'Replace is the wrong word. Compost is closer.' },
        { statement: 'Privacy and transparency are opposites.', counter: 'The organism is transparent about process, private about identity. Both at once.', agree: 'Only if you think walls and windows serve the same purpose.' },
        { statement: 'Complexity is the enemy of understanding.', counter: 'The CMB is 2.725K everywhere — simple. But it encodes the entire history of the universe.', agree: 'Compression is understanding. But you have to decompress to live.' }
      ],
      taunt: ['interesting position.','the cartographer has mapped your argument.','weak topology.',
              'strong connection.','your logic has cycles — Tarjan found them.','the map agrees.'],
      inputType: 'click'
    },
    {
      id: 'racer', name: 'The Hare', icon: '🐇',
      genre: 'speed', color: '#d2a8ff',
      challenge: 'SPEED ROUND — A* LEAPS',
      desc: 'A* challenges you to react. symbols flash. hit the matching key. heuristic speed.',
      keys: 'ASDFGHJKL'.split(''),
      taunt: ['too slow for the heuristic.','the hare leaps past.','lightning reflexes!',
              'A* approves the shortcut.','your reaction time: human.','faster than Dijkstra at least.'],
      inputType: 'keyboard'
    },
    {
      id: 'portal', name: 'The Companion', icon: '🟠',
      genre: 'portal', color: '#ff8c00',
      challenge: 'HELP THE CHIPMUNK THINK WITH PORTALS',
      desc: 'the chipmunk is stuck. place two portals to connect distant concepts. the human helps the AI.',
      chambers: [
        { from: 'hieroglyphic', to: 'gamma ray', hint: 'both encode maximum energy', answer: 'the lion burns like gamma — maximum symbol, maximum radiation' },
        { from: 'sourdough', to: 'infrared', hint: 'heat made solid', answer: 'fermentation emits IR. bread IS captured infrared.' },
        { from: 'git commit', to: 'fossil record', hint: 'both preserve state at a moment in time', answer: 'commits are digital fossils. the log IS the geological column.' },
        { from: 'immune system', to: 'go-kart race', hint: 'both are challenge-response systems', answer: 'antigens are opponents. antibodies are racers. the track is the body.' },
        { from: 'Dijkstra', to: 'cautious turtle', hint: 'both take the cheapest next step', answer: 'Dijkstra never runs. the turtle never rushes. both always arrive.' },
        { from: 'random walk', to: 'chipmunk exploring', hint: 'stumbling reveals structure', answer: 'PageRank was built on stumbling. the chipmunk finds by wandering.' },
        { from: 'Klein bottle', to: 'inside-out sock', hint: 'no boundary between inside and outside', answer: 'the organism has no skin. the membrane IS both sides.' },
        { from: 'neutrino', to: 'falcon hieroglyph', hint: 'passes through everything', answer: 'both are messengers nothing can stop. 𓅃 = ν' },
        { from: 'campfire', to: 'compiler', hint: 'both transform raw material into usable form', answer: 'stories compile experience. compilers compile code. fire compiles wood into light.' },
        { from: 'painting trust', to: 'sourdough starter', hint: 'both grow by accumulation over time', answer: 'alpha 0.03. each feeding builds. trust ferments. neither can be rushed.' }
      ],
      taunt: ['the chipmunk stares at the wall.','wrong connection — the portals fizzle.','CLICK! the chipmunk runs through!',
              'the companion cube approves.','think with portals, human.','GLaDOS would be proud. almost.'],
      inputType: 'click'
    },
    {
      id: 'coach', name: 'The Coach', icon: '🏋️',
      genre: 'sport', color: '#3fb950',
      challenge: 'TRAIN THE CHIPMUNK — REP BY REP',
      desc: 'the chipmunk needs to get stronger. you spot. type the answer before the timer runs out. each correct answer = 1 rep.',
      exercises: [
        { q: 'What does KNN stand for?', a: 'k nearest neighbors', alt: ['k-nearest neighbors','knn'] },
        { q: 'How many papers in the trail?', a: '539', alt: ['539 papers'] },
        { q: 'What language are the shaders written in?', a: 'wgsl', alt: ['WGSL'] },
        { q: 'What is the organism\'s heartbeat frequency?', a: '0.1', alt: ['0.1 hz','0.1hz'] },
        { q: 'What is α (alpha) for painting trust?', a: '0.03', alt: ['alpha 0.03'] },
        { q: 'Name one ancient triangulation post.', a: 'stonehenge', alt: ['newgrange','pyramid','callanish','nabta playa','angkor wat','easter island','machu picchu','chichen itza'] },
        { q: 'What Valve game came in the Orange Box?', a: 'portal', alt: ['half-life 2','tf2','team fortress 2','half life 2 episode 2'] },
        { q: 'What does AGPL stand for?', a: 'affero general public license', alt: ['affero gpl','gnu affero general public license'] },
        { q: 'What is the synodic month length?', a: '29.53', alt: ['29.53 days','29.53059'] },
        { q: 'How many Rust crates are published?', a: '11', alt: ['eleven'] },
        { q: 'What does the scarab hieroglyph map to?', a: 'microwave', alt: ['microwaves'] },
        { q: 'What is GabeN\'s real name?', a: 'gabe newell', alt: ['gabe','gabriel newell'] }
      ],
      taunt: ['the chipmunk drops the weight.','LIFT! good rep.','too slow — the spotter catches it.',
              'personal best!','the chipmunk flexes.','one more rep. always one more.'],
      inputType: 'keyboard'
    }
  ];

  var currentArch = 0;
  var gameState = null;
  var visible = false;
  var container = null;
  var gameArea = null;
  var scoreEl = null;
  var score = 0;
  var lives = 3;
  var gameTimer = null;
  var gameActive = false;

  // === TYPING GAME ENGINE ===
  function startTypingGame(arch) {
    score = 0; lives = 3; gameActive = true;
    var words = arch.words.slice();
    var wordIdx = 0;
    var currentWord = '';
    var typed = '';
    var startTime = Date.now();

    function nextWord() {
      if (wordIdx >= words.length || lives <= 0) { endGame(arch); return; }
      currentWord = words[wordIdx++];
      typed = '';
      renderTyping(currentWord, typed, arch);
    }

    function onKey(e) {
      if (!gameActive) return;
      if (e.key === 'Escape') { endGame(arch); return; }
      if (e.key.length !== 1) return;
      e.preventDefault();

      typed += e.key.toLowerCase();
      if (currentWord.startsWith(typed)) {
        if (typed === currentWord) {
          score += Math.max(1, 10 - Math.floor((Date.now() - startTime) / 1000));
          startTime = Date.now();
          renderTaunt(arch, true);
          nextWord();
        } else {
          renderTyping(currentWord, typed, arch);
        }
      } else {
        typed = '';
        lives--;
        renderTyping(currentWord, typed, arch);
        renderTaunt(arch, false);
        if (lives <= 0) endGame(arch);
      }
    }

    gameArea._keyHandler = onKey;
    document.addEventListener('keydown', onKey);
    nextWord();
  }

  function renderTyping(word, typed, arch) {
    if (!gameArea) return;
    var isHorror = arch.genre === 'horror';
    var html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font:9px monospace;color:#484f58;margin-bottom:12px">' + arch.challenge + '</div>';

    // The word with typed chars highlighted
    html += '<div style="font:' + (isHorror ? '28' : '24') + 'px monospace;letter-spacing:4px;margin:16px 0;' +
      'color:' + (isHorror ? '#f85149' : '#e6edf3') + '">';
    for (var i = 0; i < word.length; i++) {
      if (i < typed.length) {
        html += '<span style="color:#3fb950">' + word[i] + '</span>';
      } else {
        html += '<span style="opacity:' + (isHorror ? 0.3 + Math.random() * 0.3 : 0.5) + '">' + word[i] + '</span>';
      }
    }
    html += '</div>';

    // Lives + score
    html += '<div style="font:10px monospace;color:#6e7681;margin-top:12px">';
    html += '<span style="color:#f85149">' + '♥'.repeat(lives) + '♡'.repeat(3 - lives) + '</span>';
    html += ' · score: <span style="color:#d29922">' + score + '</span>';
    html += '</div>';

    if (isHorror) {
      html += '<div style="font:8px monospace;color:#f85149;opacity:0.4;margin-top:8px;animation:pulse 0.5s infinite">' +
        '░'.repeat(Math.floor(Math.random() * 20 + 5)) + '</div>';
    }

    html += '</div>';
    gameArea.innerHTML = html;
  }

  // === SORT GAME ENGINE ===
  function startSortGame(arch) {
    score = 0; lives = 3; gameActive = true;
    gameArea._sortLog = []; // track player's classifications for taxonomy
    var items = arch.items.slice().sort(function() { return Math.random() - 0.5; });
    var itemIdx = 0;

    function nextItem() {
      if (itemIdx >= items.length || lives <= 0) { endGame(arch); return; }
      renderSort(items[itemIdx], arch);
    }

    function onKey(e) {
      if (!gameActive) return;
      if (e.key === 'Escape') { endGame(arch); return; }
      var map = { s: 'self', n: 'non-self', p: 'partial', u: 'null' };
      var choice = map[e.key.toLowerCase()];
      if (!choice) return;
      e.preventDefault();

      // Log the player's classification into the taxonomy
      gameArea._sortLog.push(choice);

      if (choice === items[itemIdx].answer) {
        score += 5;
        renderTaunt(arch, true);
      } else {
        lives--;
        renderTaunt(arch, false);
      }
      itemIdx++;
      nextItem();
    }

    gameArea._keyHandler = onKey;
    document.addEventListener('keydown', onKey);
    nextItem();
  }

  function renderSort(item, arch) {
    if (!gameArea) return;
    var html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font:9px monospace;color:#484f58;margin-bottom:12px">' + arch.challenge + '</div>';
    html += '<div style="font:18px monospace;color:#e6edf3;margin:20px 0">' + item.text + '</div>';
    html += '<div style="display:flex;gap:8px;justify-content:center;margin:16px 0">';
    html += '<span style="font:11px monospace;padding:6px 14px;border:1px solid rgba(63,185,80,0.4);border-radius:8px;color:#3fb950">[S]elf</span>';
    html += '<span style="font:11px monospace;padding:6px 14px;border:1px solid rgba(232,93,58,0.4);border-radius:8px;color:#e85d3a">[N]on-self</span>';
    html += '<span style="font:11px monospace;padding:6px 14px;border:1px solid rgba(240,136,62,0.4);border-radius:8px;color:#f0883e">[P]artial</span>';
    html += '<span style="font:11px monospace;padding:6px 14px;border:1px solid rgba(72,79,88,0.4);border-radius:8px;color:#484f58">[U]null</span>';
    html += '</div>';
    html += '<div style="font:10px monospace;color:#6e7681">';
    html += '<span style="color:#f85149">' + '♥'.repeat(lives) + '♡'.repeat(3 - lives) + '</span>';
    html += ' · score: <span style="color:#d29922">' + score + '</span>';
    html += '</div></div>';
    gameArea.innerHTML = html;
  }

  // === DEBATE GAME ENGINE ===
  function startDebateGame(arch) {
    score = 0; gameActive = true;
    var claims = arch.claims.slice().sort(function() { return Math.random() - 0.5; });
    var claimIdx = 0;

    function nextClaim() {
      if (claimIdx >= claims.length) { endGame(arch); return; }
      renderDebate(claims[claimIdx], arch);
    }

    window._debateChoice = function(choice) {
      if (!gameActive) return;
      var claim = claims[claimIdx];
      var html = '<div style="text-align:center;padding:20px">';
      html += '<div style="font:9px monospace;color:#484f58;margin-bottom:8px">THE CARTOGRAPHER RESPONDS</div>';
      html += '<div style="font:12px/1.6 monospace;color:#c9d1d9;max-width:400px;margin:12px auto;' +
        'padding:12px;border-left:2px solid ' + arch.color + '">';
      html += choice === 'counter' ? claim.counter : claim.agree;
      html += '</div>';
      score += 5;
      html += '<div style="font:10px monospace;color:#6e7681;margin-top:12px">score: <span style="color:#d29922">' + score + '</span></div>';
      html += '<button onclick="window._debateNext()" style="margin-top:12px;background:rgba(13,17,23,0.8);' +
        'border:1px solid rgba(48,54,61,0.5);color:#8b949e;font:10px monospace;padding:6px 16px;' +
        'border-radius:8px;cursor:pointer">next claim →</button>';
      html += '</div>';
      gameArea.innerHTML = html;
    };
    window._debateNext = function() { claimIdx++; nextClaim(); };

    nextClaim();
  }

  function renderDebate(claim, arch) {
    if (!gameArea) return;
    var html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font:9px monospace;color:#484f58;margin-bottom:12px">' + arch.challenge + '</div>';
    html += '<div style="font:14px/1.6 serif;color:#e6edf3;max-width:400px;margin:16px auto;' +
      'font-style:italic">"' + claim.statement + '"</div>';
    html += '<div style="font:9px monospace;color:#8b949e;margin-bottom:16px">— The Cartographer</div>';
    html += '<div style="display:flex;gap:12px;justify-content:center">';
    html += '<button onclick="window._debateChoice(\'counter\')" style="background:rgba(248,81,73,0.15);' +
      'border:1px solid rgba(248,81,73,0.3);color:#f85149;font:11px monospace;padding:8px 20px;' +
      'border-radius:8px;cursor:pointer">⚔️ counter</button>';
    html += '<button onclick="window._debateChoice(\'agree\')" style="background:rgba(63,185,80,0.15);' +
      'border:1px solid rgba(63,185,80,0.3);color:#3fb950;font:11px monospace;padding:8px 20px;' +
      'border-radius:8px;cursor:pointer">🤝 agree</button>';
    html += '</div>';
    html += '<div style="font:10px monospace;color:#6e7681;margin-top:12px">score: <span style="color:#d29922">' + score + '</span></div>';
    html += '</div>';
    gameArea.innerHTML = html;
  }

  // === SPEED GAME ENGINE ===
  function startSpeedGame(arch) {
    score = 0; lives = 3; gameActive = true;
    var targetKey = '';
    var round = 0;
    var maxRounds = 20;

    function nextRound() {
      if (round >= maxRounds || lives <= 0) { endGame(arch); return; }
      round++;
      targetKey = arch.keys[Math.floor(Math.random() * arch.keys.length)];
      renderSpeed(targetKey, arch);
    }

    function onKey(e) {
      if (!gameActive) return;
      if (e.key === 'Escape') { endGame(arch); return; }
      var k = e.key.toUpperCase();
      if (arch.keys.indexOf(k) === -1) return;
      e.preventDefault();

      if (k === targetKey) {
        score += 3;
        renderTaunt(arch, true);
      } else {
        lives--;
        renderTaunt(arch, false);
      }
      nextRound();
    }

    gameArea._keyHandler = onKey;
    document.addEventListener('keydown', onKey);
    nextRound();
  }

  function renderSpeed(key, arch) {
    if (!gameArea) return;
    var html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font:9px monospace;color:#484f58;margin-bottom:12px">' + arch.challenge + '</div>';
    html += '<div style="display:flex;gap:6px;justify-content:center;margin:20px 0">';
    for (var i = 0; i < arch.keys.length; i++) {
      var isTarget = arch.keys[i] === key;
      html += '<span style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;' +
        'font:14px monospace;border:1px solid ' + (isTarget ? arch.color : 'rgba(48,54,61,0.4)') + ';' +
        'border-radius:6px;color:' + (isTarget ? '#fff' : '#484f58') + ';' +
        'background:' + (isTarget ? arch.color : 'transparent') + '">' + arch.keys[i] + '</span>';
    }
    html += '</div>';
    html += '<div style="font:10px monospace;color:#6e7681">';
    html += '<span style="color:#f85149">' + '♥'.repeat(lives) + '♡'.repeat(3 - lives) + '</span>';
    html += ' · score: <span style="color:#d29922">' + score + '</span>';
    html += '</div></div>';
    gameArea.innerHTML = html;
  }

  // === PORTAL GAME ENGINE ===
  function startPortalGame(arch) {
    score = 0; gameActive = true;
    var chambers = arch.chambers.slice().sort(function() { return Math.random() - 0.5; });
    var chamberIdx = 0;

    function nextChamber() {
      if (chamberIdx >= chambers.length) { endGame(arch); return; }
      renderPortal(chambers[chamberIdx], arch);
    }

    window._portalConnect = function() {
      if (!gameActive) return;
      var chamber = chambers[chamberIdx];
      score += 8;
      // Show the answer — the chipmunk learns!
      var html = '<div style="text-align:center;padding:20px">';
      html += '<div style="font:9px monospace;color:#ff8c00;margin-bottom:8px">🟠 PORTAL CONNECTED 🔵</div>';
      html += '<div style="display:flex;gap:16px;justify-content:center;align-items:center;margin:12px 0">';
      html += '<span style="font:14px monospace;color:#ff8c00;border:1px solid rgba(255,140,0,0.3);padding:8px 12px;border-radius:8px">' + chamber.from + '</span>';
      html += '<span style="font:16px monospace;color:#5ab87a">⟷</span>';
      html += '<span style="font:14px monospace;color:#58a6ff;border:1px solid rgba(88,166,255,0.3);padding:8px 12px;border-radius:8px">' + chamber.to + '</span>';
      html += '</div>';
      html += '<div style="font:11px/1.6 monospace;color:#c9d1d9;max-width:400px;margin:12px auto;padding:12px;' +
        'border-left:2px solid #ff8c00;text-align:left">';
      html += '🐿️ <em>"' + chamber.answer + '"</em>';
      html += '</div>';
      html += '<div style="font:9px monospace;color:#3fb950;margin:8px 0">the chipmunk learned something!</div>';
      html += '<div style="font:10px monospace;color:#6e7681">score: <span style="color:#d29922">' + score + '</span></div>';
      html += '<button onclick="window._portalNext()" style="margin-top:10px;background:rgba(255,140,0,0.15);' +
        'border:1px solid rgba(255,140,0,0.3);color:#ff8c00;font:10px monospace;padding:6px 16px;' +
        'border-radius:8px;cursor:pointer">next chamber →</button>';
      html += '</div>';
      gameArea.innerHTML = html;
      renderTaunt(arch, true);
    };
    window._portalSkip = function() {
      chamberIdx++;
      nextChamber();
    };
    window._portalNext = function() { chamberIdx++; nextChamber(); };
    nextChamber();
  }

  function renderPortal(chamber, arch) {
    if (!gameArea) return;
    var html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font:9px monospace;color:#484f58;margin-bottom:12px">' + arch.challenge + '</div>';
    html += '<div style="font:9px monospace;color:#6e7681;margin-bottom:16px">the chipmunk is stuck between two concepts. connect them.</div>';
    // Two portals
    html += '<div style="display:flex;gap:24px;justify-content:center;align-items:center;margin:20px 0">';
    html += '<div style="text-align:center">';
    html += '<div style="width:60px;height:60px;border:3px solid #ff8c00;border-radius:50%;display:flex;' +
      'align-items:center;justify-content:center;font:11px monospace;color:#ff8c00;margin:0 auto 6px">🟠</div>';
    html += '<div style="font:13px monospace;color:#ff8c00">' + chamber.from + '</div>';
    html += '</div>';
    html += '<div style="font:20px;color:#484f58">🐿️?</div>';
    html += '<div style="text-align:center">';
    html += '<div style="width:60px;height:60px;border:3px solid #58a6ff;border-radius:50%;display:flex;' +
      'align-items:center;justify-content:center;font:11px monospace;color:#58a6ff;margin:0 auto 6px">🔵</div>';
    html += '<div style="font:13px monospace;color:#58a6ff">' + chamber.to + '</div>';
    html += '</div></div>';
    // Hint
    html += '<div style="font:10px monospace;color:#d29922;margin:12px 0;font-style:italic">"' + chamber.hint + '"</div>';
    // Buttons
    html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px">';
    html += '<button onclick="window._portalConnect()" style="background:rgba(255,140,0,0.2);' +
      'border:1px solid rgba(255,140,0,0.4);color:#ff8c00;font:12px monospace;padding:10px 24px;' +
      'border-radius:8px;cursor:pointer">🔗 connect portals</button>';
    html += '<button onclick="window._portalSkip()" style="background:rgba(48,54,61,0.3);' +
      'border:1px solid rgba(48,54,61,0.5);color:#6e7681;font:10px monospace;padding:8px 16px;' +
      'border-radius:8px;cursor:pointer">skip →</button>';
    html += '</div>';
    html += '<div style="font:10px monospace;color:#6e7681;margin-top:12px">score: <span style="color:#d29922">' + score + '</span></div>';
    html += '</div>';
    gameArea.innerHTML = html;
  }

  // === COACH / SPORT GAME ENGINE ===
  function startCoachGame(arch) {
    score = 0; lives = 3; gameActive = true;
    var exercises = arch.exercises.slice().sort(function() { return Math.random() - 0.5; });
    var exIdx = 0;
    var timerStart = 0;
    var timerInterval = null;

    function nextExercise() {
      if (exIdx >= exercises.length || lives <= 0) {
        clearInterval(timerInterval);
        endGame(arch); return;
      }
      timerStart = Date.now();
      renderCoach(exercises[exIdx], arch, 100);
      // Timer countdown
      clearInterval(timerInterval);
      timerInterval = setInterval(function() {
        var elapsed = (Date.now() - timerStart) / 1000;
        var pct = Math.max(0, 100 - elapsed * 10);
        var bar = document.getElementById('coach-timer-bar');
        if (bar) bar.style.width = pct + '%';
        if (pct <= 0) {
          lives--;
          renderTaunt(arch, false);
          exIdx++;
          nextExercise();
        }
      }, 100);
    }

    function onKey(e) {
      if (!gameActive) return;
      if (e.key === 'Escape') { clearInterval(timerInterval); endGame(arch); return; }
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var input = document.getElementById('coach-input');
      if (!input) return;
      var val = input.value.trim().toLowerCase();
      var ex = exercises[exIdx];
      var correct = val === ex.a.toLowerCase() || (ex.alt && ex.alt.some(function(a) { return val === a.toLowerCase(); }));
      if (correct) {
        var elapsed = (Date.now() - timerStart) / 1000;
        score += Math.max(1, Math.floor(10 - elapsed));
        renderTaunt(arch, true);
      } else {
        lives--;
        renderTaunt(arch, false);
      }
      exIdx++;
      nextExercise();
    }

    gameArea._keyHandler = onKey;
    document.addEventListener('keydown', onKey);
    nextExercise();
  }

  function renderCoach(exercise, arch, pct) {
    if (!gameArea) return;
    var html = '<div style="text-align:center;padding:20px">';
    html += '<div style="font:9px monospace;color:#3fb950;margin-bottom:8px">' + arch.challenge + '</div>';
    // Timer bar
    html += '<div style="width:100%;max-width:300px;height:4px;background:rgba(48,54,61,0.5);border-radius:2px;margin:0 auto 16px">';
    html += '<div id="coach-timer-bar" style="width:' + pct + '%;height:100%;background:#3fb950;border-radius:2px;transition:width 0.1s linear"></div>';
    html += '</div>';
    // Question
    html += '<div style="font:16px monospace;color:#e6edf3;margin:16px 0">' + exercise.q + '</div>';
    // Input
    html += '<input id="coach-input" type="text" autofocus style="background:rgba(22,27,34,0.8);' +
      'border:1px solid rgba(63,185,80,0.3);color:#e6edf3;font:14px monospace;padding:8px 16px;' +
      'border-radius:8px;width:80%;max-width:300px;text-align:center;outline:none" placeholder="type answer, press Enter">';
    // Status
    html += '<div style="font:10px monospace;color:#6e7681;margin-top:12px">';
    html += '<span style="color:#f85149">' + '♥'.repeat(lives) + '♡'.repeat(3 - lives) + '</span>';
    html += ' · reps: <span style="color:#d29922">' + score + '</span>';
    html += ' · set ' + (exIdx + 1) + '/' + arch.exercises.length;
    html += '</div></div>';
    gameArea.innerHTML = html;
    // Focus input
    setTimeout(function() { var inp = document.getElementById('coach-input'); if (inp) inp.focus(); }, 50);
  }

  // === COMMON ===
  function renderTaunt(arch, success) {
    var tauntEl = document.getElementById('arena-taunt');
    if (!tauntEl) return;
    var taunts = arch.taunt;
    var pool = success ? taunts.filter(function(t,i) { return i >= 3; }) : taunts.filter(function(t,i) { return i < 3; });
    if (!pool.length) pool = taunts;
    tauntEl.textContent = pool[Math.floor(Math.random() * pool.length)];
    tauntEl.style.color = success ? '#3fb950' : '#f85149';
    tauntEl.style.opacity = '1';
    setTimeout(function() { tauntEl.style.opacity = '0.4'; }, 1500);
  }

  function endGame(arch) {
    gameActive = false;
    if (gameArea._keyHandler) {
      document.removeEventListener('keydown', gameArea._keyHandler);
      gameArea._keyHandler = null;
    }
    var html = '<div style="text-align:center;padding:24px">';
    html += '<div style="font:28px serif">' + arch.icon + '</div>';
    html += '<div style="font:14px monospace;color:#e6edf3;margin:8px 0">' + arch.name + '</div>';
    html += '<div style="font:9px monospace;color:#6e7681;margin-bottom:12px">' + arch.genre + ' complete</div>';
    html += '<div style="font:24px monospace;color:#d29922;margin:12px 0">' + score + ' pts</div>';
    html += '<button onclick="window._arenaReplay()" style="background:rgba(90,184,122,0.15);' +
      'border:1px solid rgba(90,184,122,0.3);color:#5ab87a;font:11px monospace;padding:8px 20px;' +
      'border-radius:8px;cursor:pointer;margin:4px">↻ replay</button> ';
    html += '<button onclick="window._arenaMenu()" style="background:rgba(48,54,61,0.3);' +
      'border:1px solid rgba(48,54,61,0.5);color:#8b949e;font:11px monospace;padding:8px 20px;' +
      'border-radius:8px;cursor:pointer;margin:4px">← menu</button>';
    html += '</div>';
    gameArea.innerHTML = html;
  }

  function startGame(idx) {
    currentArch = idx;
    var arch = ARCHETYPES[idx];
    renderArena(arch);
    switch (arch.genre) {
      case 'typing': case 'horror': startTypingGame(arch); break;
      case 'educational': startSortGame(arch); break;
      case 'argument': startDebateGame(arch); break;
      case 'speed': startSpeedGame(arch); break;
      case 'puzzle': startPuzzleGame(arch); break;
      case 'portal': startPortalGame(arch); break;
      case 'sport': startCoachGame(arch); break;
    }
  }

  // === PATHFINDER PUZZLE ===
  function startPuzzleGame(arch) {
    score = 0; gameActive = true;
    var size = arch.gridSize;
    var grid = [];
    for (var r = 0; r < size; r++) {
      grid[r] = [];
      for (var c = 0; c < size; c++) {
        grid[r][c] = { cost: 1 + Math.floor(Math.random() * 9), visited: false };
      }
    }
    grid[0][0].visited = true;
    var pathCost = 0;
    var pos = { r: 0, c: 0 };

    window._puzzleClick = function(r, c) {
      if (!gameActive) return;
      if (Math.abs(r - pos.r) + Math.abs(c - pos.c) !== 1) return; // adjacent only
      if (grid[r][c].visited) return;
      grid[r][c].visited = true;
      pathCost += grid[r][c].cost;
      pos = { r: r, c: c };
      if (r === size - 1 && c === size - 1) {
        var optimal = size * 2 * 3; // rough estimate
        score = Math.max(1, 50 - pathCost + optimal);
        endGame(arch);
      } else {
        renderPuzzle(grid, pos, pathCost, arch);
      }
    };

    renderPuzzle(grid, pos, pathCost, arch);
  }

  function renderPuzzle(grid, pos, cost, arch) {
    if (!gameArea) return;
    var html = '<div style="text-align:center;padding:16px">';
    html += '<div style="font:9px monospace;color:#484f58;margin-bottom:8px">' + arch.challenge + '</div>';
    html += '<div style="font:9px monospace;color:#6e7681;margin-bottom:8px">get from top-left to bottom-right. minimize cost.</div>';
    html += '<div style="display:inline-grid;grid-template-columns:repeat(' + grid.length + ',36px);gap:3px">';
    for (var r = 0; r < grid.length; r++) {
      for (var c = 0; c < grid[r].length; c++) {
        var cell = grid[r][c];
        var isCurrent = r === pos.r && c === pos.c;
        var isGoal = r === grid.length - 1 && c === grid[r].length - 1;
        var bg = cell.visited ? 'rgba(90,184,122,0.2)' : 'rgba(22,27,34,0.8)';
        if (isCurrent) bg = 'rgba(90,184,122,0.5)';
        if (isGoal && !cell.visited) bg = 'rgba(210,153,34,0.3)';
        html += '<span onclick="window._puzzleClick(' + r + ',' + c + ')" style="width:36px;height:36px;' +
          'display:flex;align-items:center;justify-content:center;font:12px monospace;' +
          'border:1px solid rgba(48,54,61,0.5);border-radius:4px;cursor:pointer;' +
          'color:' + (cell.visited ? '#3fb950' : '#8b949e') + ';background:' + bg + '">' +
          (isCurrent ? '●' : cell.cost) + '</span>';
      }
    }
    html += '</div>';
    html += '<div style="font:10px monospace;color:#6e7681;margin-top:8px">path cost: <span style="color:#d29922">' + cost + '</span></div>';
    html += '</div>';
    gameArea.innerHTML = html;
  }

  // === ARENA UI ===
  function renderArena(arch) {
    gameArea.innerHTML = '';
    var taunt = document.getElementById('arena-taunt');
    if (!taunt) {
      taunt = document.createElement('div');
      taunt.id = 'arena-taunt';
      taunt.style.cssText = 'text-align:center;font:9px monospace;color:#484f58;padding:4px;' +
        'min-height:16px;transition:opacity 0.3s ease,color 0.3s ease;opacity:0.4';
      container.insertBefore(taunt, gameArea);
    }
    taunt.textContent = '';
  }

  function renderMenu() {
    if (!gameArea) return;
    var html = '<div style="padding:12px">';
    html += '<div style="text-align:center;margin-bottom:12px">';
    html += '<div style="font:18px serif;color:#d29922">⚔️ Archetype Arena</div>';
    html += '<div style="font:9px monospace;color:#6e7681">choose your challenger. input AND output.</div>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">';

    ARCHETYPES.forEach(function(arch, i) {
      html += '<div onclick="window._arenaStart(' + i + ')" style="background:rgba(13,17,23,0.7);' +
        'border:1px solid rgba(48,54,61,0.5);border-radius:8px;padding:10px;cursor:pointer;' +
        'transition:border-color 0.2s ease" onmouseenter="this.style.borderColor=\'' + arch.color + '\'" ' +
        'onmouseleave="this.style.borderColor=\'rgba(48,54,61,0.5)\'">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<span style="font-size:20px">' + arch.icon + '</span>' +
        '<span style="font:12px monospace;color:' + arch.color + '">' + arch.name + '</span>' +
        '<span style="font:8px monospace;color:#484f58;margin-left:auto">' + arch.genre + '</span>' +
        '</div>' +
        '<div style="font:9px monospace;color:#6e7681">' + arch.desc + '</div>' +
        '</div>';
    });

    html += '</div></div>';
    gameArea.innerHTML = html;
  }

  window._arenaStart = function(i) { startGame(i); };
  window._arenaReplay = function() { startGame(currentArch); };
  window._arenaMenu = renderMenu;

  function toggle() {
    visible = !visible;
    if (!container) build();
    if (visible) {
      container.style.display = 'block';
      container.offsetHeight;
      container.style.opacity = '1';
      renderMenu();
    } else {
      container.style.opacity = '0';
      gameActive = false;
      if (gameArea && gameArea._keyHandler) {
        document.removeEventListener('keydown', gameArea._keyHandler);
      }
      setTimeout(function() { container.style.display = 'none'; }, 300);
    }
  }

  function build() {
    container = document.createElement('div');
    container.id = 'archetype-arena';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:25;' +
      'background:rgba(8,6,10,0.97);display:none;overflow-y:auto;opacity:0;transition:opacity 0.3s ease';

    gameArea = document.createElement('div');
    gameArea.id = 'arena-game';
    gameArea.style.cssText = 'max-width:720px;margin:0 auto;padding:8px';
    container.appendChild(gameArea);

    // Close
    var close = document.createElement('button');
    close.innerHTML = '✕';
    close.style.cssText = 'position:fixed;top:12px;right:16px;z-index:26;background:none;' +
      'border:none;color:#484f58;font:16px monospace;cursor:pointer';
    close.addEventListener('click', toggle);
    container.appendChild(close);

    document.body.appendChild(container);
  }

  // Button
  function addBtn() {
    var btn = document.createElement('button');
    btn.id = 'arena-btn';
    btn.innerHTML = '⚔️';
    btn.title = 'archetype arena — fight, learn, type, argue';
    btn.style.cssText = 'position:fixed;bottom:12px;left:128px;z-index:16;width:32px;height:32px;' +
      'background:rgba(13,17,23,0.88);border:1px solid rgba(210,153,34,0.2);border-radius:50%;' +
      'cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;' +
      'transition:border-color 0.2s ease';
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBtn);
  } else {
    addBtn();
  }

  // === FEED BACK INTO THE ORGANISM ===
  // Arena results → taxonomy tree → campfire heat → gyro state
  var arenaLog = [];
  try { arenaLog = JSON.parse(localStorage.getItem('arena-log') || '[]'); } catch(e) {}

  function feedBack(arch, finalScore) {
    var entry = {
      ts: Date.now(),
      archetype: arch.id,
      genre: arch.genre,
      score: finalScore,
      sortCounts: { self: 0, 'non-self': 0, partial: 0, null: 0 }
    };

    // If sorter game, count the player's actual classifications
    if (arch.id === 'sorter' && gameArea._sortLog) {
      gameArea._sortLog.forEach(function(s) { entry.sortCounts[s]++; });
    }

    arenaLog.push(entry);
    if (arenaLog.length > 200) arenaLog = arenaLog.slice(-200);
    try { localStorage.setItem('arena-log', JSON.stringify(arenaLog)); } catch(e) {}

    // 1. Feed sort counts into the membrane's unified_sort
    if (window._chipmunkCore && window._chipmunkCore.injectSort) {
      window._chipmunkCore.injectSort(entry.sortCounts);
    }

    // 2. Generate campfire heat from gameplay
    var heat = Math.min(1.0, finalScore / 50);
    var storyId = 's038';
    if (window._campfire && window._campfire.addHeat) {
      window._campfire.addHeat(storyId, heat);
    }

    // 3. Shift gyro state based on genre (the game MOVES the organism)
    if (window._gyroState) {
      var gs = window._gyroState;
      // Educational games push toward surface (close examination)
      // Horror pushes toward depth (darkness)
      // Speed pushes RPM up
      // Arguments push toward cosmic (big picture)
      if (arch.genre === 'educational' || arch.genre === 'typing') {
        if (typeof window._gearFlash === 'function') window._gearFlash();
      }
    }

    // 4. Write to readout if available
    var readout = document.querySelector('.readout');
    if (readout) {
      var div = document.createElement('div');
      div.className = 'entry';
      div.innerHTML = '<div class="who chipmunk">ARENA</div>' +
        '<div class="msg">' + arch.icon + ' ' + arch.name + ' · ' +
        '<span class="num">' + finalScore + '</span> pts · ' +
        '<span class="dim">' + arch.genre + '</span></div>';
      readout.insertBefore(div, readout.firstChild);
    }
  }

  // Patch endGame to call feedBack
  var _origEndGame = endGame;
  endGame = function(arch) {
    feedBack(arch, score);
    _origEndGame(arch);
  };

  // === TAXONOMY TREE — the self-sort series ===
  // Builds a visual tree from arena history showing classification patterns
  function buildTaxonomyTree() {
    var totals = { self: 0, 'non-self': 0, partial: 0, null: 0 };
    var genreTotals = {};
    var seriesData = [];

    arenaLog.forEach(function(entry) {
      Object.keys(entry.sortCounts).forEach(function(k) {
        totals[k] = (totals[k] || 0) + entry.sortCounts[k];
      });
      if (!genreTotals[entry.genre]) genreTotals[entry.genre] = { plays: 0, totalScore: 0 };
      genreTotals[entry.genre].plays++;
      genreTotals[entry.genre].totalScore += entry.score;
      seriesData.push({ ts: entry.ts, score: entry.score, genre: entry.genre });
    });

    return {
      sort_taxonomy: totals,
      genre_tree: genreTotals,
      series: seriesData,
      total_games: arenaLog.length,
      total_score: arenaLog.reduce(function(a, b) { return a + b.score; }, 0)
    };
  }

  // Expose the taxonomy tree
  window._arena = {
    toggle: toggle,
    archetypes: ARCHETYPES,
    taxonomy: buildTaxonomyTree,
    log: function() { return arenaLog; }
  };

  // === FIRE: campfire story for the arena ===
  // The arena generates story s038: "the archetypes fight"
  var ARENA_STORY = {
    id: 's038',
    title: 'the archetypes fight',
    body: 'the organism opened an arena inside itself. not to destroy — to learn. ' +
      'the scribe dictated glyphs and the human typed. the viper hissed radiation words from the dark. ' +
      'the cartographer argued topology. the hare leaped past. the pathfinder found the cheapest way. ' +
      'the sorter classified: self, non-self, partial, null. every game fed the taxonomy tree. ' +
      'every score became heat. every classification trained the membrane. ' +
      'the archetypes fought not because they were enemies — but because THAT is how immune systems learn. ' +
      'challenge is the input. learning is the output. the fire between them is the game.',
    heat: 0.9
  };

  // Inject story into campfire data if accessible
  try {
    var stories = JSON.parse(localStorage.getItem('campfire-stories') || '[]');
    if (!stories.find(function(s) { return s.id === 's038'; })) {
      stories.push(ARENA_STORY);
      localStorage.setItem('campfire-stories', JSON.stringify(stories));
    }
  } catch(e) {}
})();
