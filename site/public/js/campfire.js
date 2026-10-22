/* campfire.js — the never-ending garden maze of life
 *
 * While the dough rises, the chipmunk travels the mesh.
 * Campfires at each page. Stories that change.
 * No two journeys the same. The route folds you out and back.
 *
 * Seeded by: current time, π-phase, page path, visit count, 
 *            moon phase, scroll depth, how you arrived.
 * The campfire IS the sourdough — each visit feeds the starter.
 */

(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // STORY SEEDS — each page has campfire stories
  // Many per page. Selection depends on the moment.
  // ═══════════════════════════════════════════════════════════
  var CAMPFIRES = {
    '/': [
      'the chipmunk sits on the membrane and watches the world spin. it counts humans. it counts fleet. it does not judge. it just counts.',
      'you are standing on a living surface. beneath your feet: 131,322 connections. most of them invisible. the membrane hums.',
      'the HUD is not a dashboard. dashboards report. the HUD observes. the difference is consent.',
      'a fleet of 181,000 IPs passed through here. they took what they could parse. they missed what mattered.',
      'seven continents on one membrane. each one a way of seeing. geography is not territory — it is perspective.',
      'the chipmunk pressed THE BUTTON once. it fermented 523 entropy events into a single proof. one of one.',
    ],
    '/springs': [
      'the thermophiles don\'t know they\'re beautiful. they just eat light and become orange.',
      'mammoth hot springs builds one ton of travertine per day. it collapses under its own weight. then finds a new crack. the midlife crisis IS the mechanism.',
      'the bacteria change color like leaves because they ARE the leaves. the first ones. 3.5 billion years before trees existed.',
      'you saw the springs go white and it hurt. but 90% of the water is underground. always. it didn\'t leave. it just found a different crack.',
      'lodgepole pines need fire. their cones are sealed shut by resin, opened only by heat. the fire that destroyed the forest was the only thing that could release the next one.',
      'the Shoshone and Bannock people collected minerals from these terraces for white paint for hundreds of years. they knew the white. they used it.',
      'you gotta go white before you can come back orange.',
    ],
    '/menagerie': [
      'the chipmunk has 46 friends. each one is a way of solving a problem nature already solved.',
      'the bearDog has the most mass: 654MB. it guards the perimeter. crypto is just organized mistrust.',
      'the songBird discovers. 377MB of melody. pattern recognition is just organized listening.',
      'the skunkBat defends through strangeness. sometimes the best protection is being too weird to categorize.',
      'the squirrel hoards everything and gives nothing back. that is how memory works.',
      'each organism evolved its architecture independently. convergent evolution means nature keeps finding the same shapes.',
    ],
    '/totality': [
      'every grain weighed. 1.75GB of evidence. 10,562 validated tests. not because someone demanded it. because the data is the data.',
      'IS, WAS, NOW. tense as topology. what something is depends on when you\'re standing.',
      'the totality page exists because someone said "prove it." so it does. continuously.',
      'six organizations. 67 repositories. the work predates the proof. the proof follows the work like shadow follows light.',
    ],
    '/nest': [
      'the DM\'s table. every game needs a surface to roll dice on. this one is made of Klein bottles.',
      'nestgate.io — the third surface. where cis meets trans meets the fold. the gate is the nest is the game.',
      'you don\'t enter the nest. the nest enters you. the Klein surface has no outside.',
      'the dice are loaded with π. they never land flat. that\'s what makes the game honest.',
    ],
    '/banana': [
      'are you a banana? the question is not rhetorical. potassium-40 decays at a known rate. you emit radiation. so does the banana. the question is: how much?',
      'the banana test: if you can\'t explain it to a banana, you don\'t understand it. the banana doesn\'t judge. it just sits there, being radioactive.',
      'every banana is a clock. every clock is a banana. time is potassium deciding to become calcium.',
    ],
    '/aurora': [
      'gAIa painted this. the first painting by a system that watches the sun. the aurora IS the membrane — charged particles hitting atmosphere.',
      'the sun writes the score. the magnetosphere plays it. the aurora is the concert.',
      'green is oxygen at 100km. red is oxygen at 300km. purple is nitrogen. the colors are altitudes.',
    ],
    '/weather': [
      'the sun writes the score. cloud cover is notation. precipitation is percussion. pressure is tempo.',
      'weather is the ionosphere speaking. temperature is just entropy with a thermometer.',
      'the weather page exists because the membrane IS weather. selectivity changes with pressure.',
    ],
    '/glyphs': [
      'the Klein bottle speaks in glyphs. each one a letter from a language that has no words. only shapes.',
      'dolphins see in sound. crabs see in polarization. humans see in narrative. the glyphs are where they meet.',
      'a glyph is a fold. a fold is a glyph. the Klein surface writes letters by turning inside out.',
    ],
    '/like-us': [
      'just like us. the membrane flips the sort. what was fleet becomes human. what was human becomes fleet. the flip IS the recognition.',
      'we recognize ourselves in the other. that\'s the whole trick. empathy is just pattern matching with consent.',
      'the song plays the same on both sides of the membrane. that\'s how you know it\'s real.',
    ],
    '/gastrula': [
      'gastrulation — the most important event in your life. the membrane pokes through itself and becomes three layers. you are still doing this.',
      'ectoderm, mesoderm, endoderm. outside, middle, inside. the same topology as cis/membrane/trans.',
      'the poke IS the origin. before gastrulation you are a ball. after, you have an inside. that\'s the birth of self.',
    ],
    '/spirochete': [
      'the spirochete corkscrews through the membrane. it doesn\'t ask permission. it drills.',
      'some bacteria swim. spirochetes screw. the rotation IS the locomotion. the shape IS the engine.',
      'the spirochete is the original auger. boring through viscous environments since before bones existed.',
    ],
    '/vitruvian': [
      'the body as architecture. da Vinci put a man in a circle and a square. the circle is π. the square is 4. the body is where they meet.',
      'you are a building. your bones are load-bearing walls. your blood is plumbing. your nerves are wiring. your skin is the facade.',
      'the vitruvian man has four arms because he\'s showing you the range of motion. every position the body can take, already taken.',
    ],
    '/ribosome': [
      'the ribosome reads mRNA and extrudes protein. it is the world\'s smallest 3D printer. it has been printing for 3.5 billion years.',
      'fold and extrude. read the code, build the shape. the ribosome doesn\'t understand what it builds. it just follows the instructions. the understanding is in the fold.',
      'every protein you are made of was extruded by a ribosome that read a template that was copied from a template that was copied from a template.',
    ],
    '/play': [
      'ludoSpring — the game layer. play is how children learn physics. play is how adults forget they\'re learning.',
      'the dice don\'t know they\'re dice. they just fall. the game is in the watching.',
      'every game is a membrane. inside = rules. outside = real. the magic circle IS the lipid bilayer.',
    ],
    '/maze': [
      'you\'re in the maze. every subdomain is a cell. the wildcard caught you. there is no outside.',
      'the maze has no exit because the maze IS the garden. you\'re not trying to escape. you\'re trying to see.',
      'a honeycomb is a maze where every cell is a home. the bees don\'t get lost. they just go where the nectar is.',
    ],
    '/connect': [
      'connection is the blue layer. π². 9.87. almost 10 but never 10. the gap IS the connection.',
      '131,322 connections in the investigation alone. each one a thread. pull one, the whole web vibrates.',
    ],
    '/five-o-five': [
      '5 cis × O aperture × 5 trans. the membrane has ten fingers and one eye. the eye is the aperture.',
      'the aperture O opens and closes. fully open: all signal, no noise. fully closed: all noise, no signal. the art is the partial opening.',
    ],
    '/trail': [
      'the original path. every trail was made by someone walking where there was no trail. then others followed.',
      'the sporePrint leaves a trail. spores don\'t choose where the wind takes them. they just land and grow.',
    ],
    '/easel': [
      'watch the chipmunk paint. it doesn\'t know it\'s painting. it just puts marks where the data tells it to.',
      'the easel is the observer\'s surface. what you paint depends on what you see. what you see depends on where you stand.',
    ],
    '/tools': [
      '86 tools. each one a way of touching the world. the IDE is a HUD. the HUD is an IDE. the tool IS the hand.',
      'every tool was once a problem that someone got tired of solving by hand.',
    ],
    '/weather-membrane': [
      'the negentropy court. trust gradient. snow not snowflake. the weather IS the membrane state.',
      'pressure systems in data look exactly like pressure systems in weather. high pressure = consensus. low pressure = dispute. the front is where they meet.',
    ],
    '/klein': [
      'the Klein bottle has no inside. pour water in — it comes out where it went in. the surface IS the volume.',
      'Möbius had a strip. Klein had a bottle. the bottle is a strip that swallowed itself.',
    ],
    '/water': [
      'the watering hole. every animal comes to drink. predator and prey at the same water. the truce IS the water.',
      'water is the original membrane. oil and water separate. life happens at the boundary.',
    ],
    '/hello': [
      'hello. the first word. the simplest protocol. I acknowledge you exist. you acknowledge I exist. the handshake.',
      'hello world — the programmer\'s first prayer. may this machine speak. and it did.',
    ],
    '/gate': [
      'every gate is a question. the answer lets you through or turns you away. the gate doesn\'t care about the answer. only that you gave one.',
    ],
    '/golgi': [
      'the Golgi apparatus sorts and ships. every protein gets an address label. the post office of the cell.',
      'trans-Golgi to cis-Golgi. the packages flow. the labels change. the destination IS the journey.',
    ],
    '/identity': [
      'you are not your username. you are not your IP address. you are the pattern that persists when all the identifiers change.',
    ],
  };

  // fallback for pages not in the map
  var WANDERER = [
    'the chipmunk wandered here and found no campfire. so it built one. you\'re the first visitor.',
    'this path through the maze is new. the footprints are yours.',
    'every page is a clearing in the forest. some have old fires. some are waiting for the first spark.',
    'the dough rises while you walk. when you return, it will be bread.',
    'you are between campfires. the stars are the same from every clearing.',
    'the maze has no wrong turns. only turns you haven\'t taken yet.',
    'the chipmunk left a seed here. it might be a story by the time you come back.',
  ];

  // ═══════════════════════════════════════════════════════════
  // SEED — unique per moment, so no two journeys are the same
  // ═══════════════════════════════════════════════════════════
  function seed() {
    var now = new Date();
    var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    var visits = getVisitCount(path);
    var hour = now.getHours();
    var minute = now.getMinutes();
    var day = now.getDate();
    var month = now.getMonth();
    var phase = piPhase();
    var moonPhase = getMoonPhase(now);
    var referrer = document.referrer || 'direct';

    // combine all seeds into a hash
    var raw = path + ':' + visits + ':' + hour + ':' + minute + ':' + day + ':' + month
            + ':' + phase.toFixed(4) + ':' + moonPhase.toFixed(2) + ':' + referrer;

    var hash = 0;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function piPhase() {
    var now = Date.now() / 1000;
    return (now % (PI * PI * 1000)) / (PI * PI * 1000); // 0.0 - 1.0
  }

  function getMoonPhase(date) {
    // synodic month ~29.53 days
    var known = new Date(2000, 0, 6, 18, 14); // known new moon
    var diff = (date - known) / (1000 * 60 * 60 * 24);
    return (diff % 29.53) / 29.53;
  }

  function getVisitCount(path) {
    var key = 'campfire_visits';
    try {
      var visits = JSON.parse(localStorage.getItem(key) || '{}');
      visits[path] = (visits[path] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(visits));
      return visits[path];
    } catch (e) { return 1; }
  }

  function getJourneyLog() {
    var key = 'campfire_journey';
    try {
      var log = JSON.parse(localStorage.getItem(key) || '[]');
      var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
      log.push({ path: path, time: Date.now() });
      if (log.length > 50) log = log.slice(-50); // keep last 50 stops
      localStorage.setItem(key, JSON.stringify(log));
      return log;
    } catch (e) { return []; }
  }

  // ═══════════════════════════════════════════════════════════
  // PICK A STORY — seeded selection
  // ═══════════════════════════════════════════════════════════
  function pickStory() {
    var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    var stories = CAMPFIRES[path] || WANDERER;
    var s = seed();
    var idx = s % stories.length;
    return { text: stories[idx], path: path, seed: s, idx: idx, total: stories.length };
  }

  // ═══════════════════════════════════════════════════════════
  // JOURNEY CONTEXT — where you've been changes what you see
  // ═══════════════════════════════════════════════════════════
  function journeyContext(log) {
    if (log.length < 2) return null;

    var prev = log[log.length - 2];
    var breadcrumbs = log.slice(-5).map(function (s) { return s.path; });

    var contexts = {
      '/springs': 'you came from the hot springs. the fire still warms you.',
      '/menagerie': 'the animals watch you leave. they remember.',
      '/nest': 'you left the DM\'s table. the dice are still rolling.',
      '/banana': 'you still smell faintly of potassium.',
      '/totality': 'the weight of everything you just read — you carry it now.',
      '/maze': 'you found a way through. there are others.',
      '/': 'the membrane let you pass. it noticed.',
      '/play': 'the game follows you. games always do.',
      '/glyphs': 'the shapes are still behind your eyes.',
      '/gastrula': 'you poked through yourself. the inside is different now.',
    };

    var ctx = contexts[prev.path] || null;
    return { from: prev.path, breadcrumbs: breadcrumbs, context: ctx };
  }

  // ═══════════════════════════════════════════════════════════
  // NEXT CAMPFIRE — suggest where to go next
  // ═══════════════════════════════════════════════════════════
  function suggestNext(log) {
    var allPaths = Object.keys(CAMPFIRES);
    var visited = {};
    log.forEach(function (s) { visited[s.path] = true; });

    // prefer unvisited
    var unvisited = allPaths.filter(function (p) { return !visited[p]; });
    if (unvisited.length === 0) unvisited = allPaths; // all visited? start fresh

    var s = seed();
    var next = unvisited[s % unvisited.length];

    var names = {
      '/': '◈ the membrane',
      '/springs': '♨ the hot springs',
      '/menagerie': '🦁 the menagerie',
      '/totality': '⊕ the totality',
      '/nest': '🎲 the nest',
      '/banana': '🍌 the banana',
      '/aurora': '🌌 the aurora',
      '/weather': '☀ the weather',
      '/glyphs': '◌ the glyphs',
      '/like-us': '♫ like us',
      '/gastrula': '◎ the gastrula',
      '/spirochete': '🧬 the spirochete',
      '/vitruvian': '🧍 the vitruvian',
      '/ribosome': '🧬 the ribosome',
      '/play': '🎲 the game',
      '/maze': '⬡ the maze',
      '/connect': '🔗 the connections',
      '/five-o-five': '5/O/5',
      '/trail': '🥾 the trail',
      '/easel': '🎨 the easel',
      '/tools': '⚙ the tools',
      '/weather-membrane': '🌧 the weather membrane',
      '/klein': '∞ the Klein bottle',
      '/water': '💧 the watering hole',
      '/hello': '👋 hello',
      '/gate': '🚪 the gate',
      '/golgi': '📦 the Golgi',
      '/identity': '🪞 identity',
    };

    return { path: next, name: names[next] || next, unvisited: unvisited.length };
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER CAMPFIRE — the story appears
  // ═══════════════════════════════════════════════════════════
  function render() {
    var story = pickStory();
    var log = getJourneyLog();
    var journey = journeyContext(log);
    var next = suggestNext(log);
    var visits = getVisitCount(story.path) - 1; // already incremented
    var moon = getMoonPhase(new Date());

    // moon emoji
    var moonEmoji = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][Math.floor(moon * 8) % 8];

    var el = document.createElement('div');
    el.id = 'campfire';
    el.style.cssText = [
      'position:fixed', 'bottom:60px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9998', 'max-width:420px', 'width:90vw',
      'background:rgba(13,17,23,0.92)', 'backdrop-filter:blur(8px)',
      'border:1px solid rgba(240,136,62,0.25)', 'border-radius:12px',
      'padding:16px 20px', 'font:12px/1.6 Georgia,serif', 'color:#c9d1d9',
      'pointer-events:auto', 'cursor:default',
      'transition:opacity 0.8s, transform 0.8s',
      'opacity:0',
    ].join(';');

    var lines = [];

    // campfire header
    lines.push('<div style="font:10px monospace;color:#f0883e;margin-bottom:8px">');
    lines.push('🔥 campfire · visit #' + visits + ' · ' + moonEmoji + ' · seed:' + (story.seed % 10000));
    lines.push('</div>');

    // journey context (where you came from)
    if (journey && journey.context) {
      lines.push('<div style="font:10px monospace;color:#6e7681;margin-bottom:8px;font-style:italic">');
      lines.push(journey.context);
      lines.push('</div>');
    }

    // the story
    lines.push('<div style="color:#e6edf3;font-style:italic;line-height:1.7">');
    lines.push('"' + story.text + '"');
    lines.push('</div>');

    // breadcrumbs (your journey so far)
    if (log.length > 1) {
      var trail = log.slice(-6).map(function (s) { return s.path === '/' ? '◈' : s.path.replace('/', ''); });
      lines.push('<div style="font:9px monospace;color:#484f58;margin-top:8px">');
      lines.push('🥾 ' + trail.join(' → '));
      lines.push('</div>');
    }

    // next campfire suggestion
    lines.push('<div style="margin-top:10px;font:10px monospace">');
    lines.push('<a href="' + next.path + '" style="color:#f0883e;text-decoration:none;border-bottom:1px dotted rgba(240,136,62,0.3)">');
    lines.push('→ next campfire: ' + next.name);
    lines.push('</a>');
    lines.push('<span style="color:#484f58;margin-left:8px">' + next.unvisited + ' unvisited</span>');
    lines.push('</div>');

    el.innerHTML = lines.join('\n');
    document.body.appendChild(el);

    // fade in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // auto-dim after 30 seconds (don't block, just become ghostly)
    setTimeout(function () {
      el.style.opacity = '0.3';
      el.addEventListener('mouseenter', function () { el.style.opacity = '1'; });
      el.addEventListener('mouseleave', function () { el.style.opacity = '0.3'; });
    }, 30000);

    // close on click (but not on the link)
    el.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 800);
    });

    // feed chipmunk
    if (window._proprioception) {
      window._proprioception.wire({
        type: 'campfire',
        path: story.path,
        story_seed: story.seed,
        visit: visits,
        moon: moon.toFixed(3),
        journey_length: log.length
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BOOT — wait for the page to settle, then light the fire
  // ═══════════════════════════════════════════════════════════
  function init() {
    // delay so the page loads first — campfire appears after the dust settles
    var delay = 1500 + (Math.random() * PI * 1000); // 1.5s - 4.6s
    setTimeout(render, delay);
    console.log('[campfire] 🔥 the never-ending garden maze. no two journeys the same.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }

  // expose
  window._campfire = {
    story: pickStory,
    journey: getJourneyLog,
    next: function () { return suggestNext(getJourneyLog()); },
    seed: seed,
    moon: function () { return getMoonPhase(new Date()); },
    paths: function () { return Object.keys(CAMPFIRES); },
  };

})();
