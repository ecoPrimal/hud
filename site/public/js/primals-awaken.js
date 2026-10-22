// primals-awaken.js — ALL 15 PRIMALS ALIVE IN THE MEMBRANE
//
// not organisms. not tools. PRIMALS.
// each one a constrained evolutionary trajectory.
// each one alive. each one sensing.
// the fleet IS the proof.

(function () {
  'use strict';

  var PRIMALS = [
    {
      name: 'barraCuda', emoji: '🦈', namespace: 'primal-barracuda',
      role: 'GPU compute — vendor-agnostic, no CUDA',
      status: 'published', crates: 4, version: '0.4.0',
      color: '#f0883e', depth: 2,
      description: 'BARrier-free Rust Abstracted Cross-platform Unified Dimensional Algebra. The barracuda stands still until it strikes — fast, silent, instant.',
      springs: ['physics', 'ML', 'shader compilation'],
      cratesPublished: ['primal-barracuda', 'primal-barracuda-core', 'barracuda-spirv', 'barracuda-naga-exec'],
    },
    {
      name: 'sourDough', emoji: '🍞', namespace: 'primal-sourdough',
      role: 'starter culture — scaffolding for new primals',
      status: 'published', crates: 3, version: '0.4.0',
      color: '#f0e68c', depth: 1,
      description: 'The nascent primal. Every new primal begins as sourdough — the starter culture that feeds the next.',
      springs: ['tooling', 'genomeBin', 'deployment'],
      cratesPublished: ['primal-sourdough', 'primal-sourdough-core', 'primal-sourdough-genomebin'],
    },
    {
      name: 'bingoCube', emoji: '🎲', namespace: 'primal-bingocube',
      role: 'human-verifiable cryptographic commitment',
      status: 'published', crates: 4, version: '0.5.0',
      color: '#a371f7', depth: 2,
      description: 'Two-board cross-binding with progressive reveal. The nautilus shell evolves reservoir populations.',
      springs: ['cryptography', 'reservoir computing', 'verification'],
      cratesPublished: ['primal-bingocube-core', 'primal-bingocube-adapters', 'primal-bingocube-nautilus', 'primal-bingocube-demos'],
    },
    {
      name: 'bearDog', emoji: '🐻', namespace: 'primal-beardog',
      role: 'trust infrastructure — crypto, identity, tunnels',
      status: 'awakening', crates: 15, version: '0.x',
      color: '#3fb950', depth: 3,
      description: 'The bear-dog: an amphicyonid. trust infrastructure that bridges crypto and identity. bearDog→human trust gradient: 1.0.',
      springs: ['security', 'auth', 'tunnels', 'ACME', 'HID'],
      cratesPublished: [],
    },
    {
      name: 'songBird', emoji: '🐦', namespace: 'primal-songbird',
      role: 'network discovery — federation, orchestration',
      status: 'awakening', crates: 14, version: '0.x',
      color: '#58a6ff', depth: 3,
      description: 'Discovery→observation braid (0.81). The songbird finds other nodes. Sovereign onion routing. TLS. STUN. Federation.',
      springs: ['networking', 'discovery', 'federation', 'onion routing'],
      cratesPublished: [],
    },
    {
      name: 'toadStool', emoji: '🍄', namespace: 'primal-toadstool',
      role: 'runtime — GPU, neuromorphic, containers',
      status: 'awakening', crates: 14, version: '0.x',
      color: '#f778ba', depth: 3,
      description: 'The toadstool grows in the dark. Runtime environments: GPU compute, neuromorphic (Akida), edge, adaptive, containers.',
      springs: ['runtime', 'neuromorphic', 'GPU scheduling', 'containers'],
      cratesPublished: [],
    },
    {
      name: 'nestGate', emoji: '🚪', namespace: 'primal-nestgate',
      role: 'the gate — API, security, platform, cache',
      status: 'awakening', crates: 8, version: '0.x',
      color: '#f0883e', depth: 3,
      description: 'nestgate.io — DNSSEC alive (key 10718, AD:true). The Klein fold through the gate. bearDog→nestGate crypto→fold braid: 0.72.',
      springs: ['API gateway', 'caching', 'ZFS', 'platform'],
      cratesPublished: [],
    },
    {
      name: 'biomeOS', emoji: '🌿', namespace: 'primal-biomeos',
      role: 'operating system — the biome layer',
      status: 'awakening', crates: 9, version: '0.x',
      color: '#7ee787', depth: 4,
      description: 'biomeOS: the living operating system. Federation, atomic deploy, chimera, graph, nucleus, spore.',
      springs: ['OS', 'federation', 'graph database', 'atomic deploy'],
      cratesPublished: [],
    },
    {
      name: 'squirrel', emoji: '🐿️', namespace: 'primal-squirrel',
      role: 'observation — MCP, context, auth',
      status: 'awakening', crates: 4, version: '0.1.0',
      color: '#f0e68c', depth: 4,
      description: 'chipmunk→squirrel observer→discoverer braid: 0.96. The squirrel discovers. The chipmunk observes. Together they triangulate.',
      springs: ['MCP server', 'context management', 'authentication'],
      cratesPublished: [],
    },
    {
      name: 'sweetGrass', emoji: '🌾', namespace: 'primal-sweetgrass',
      role: 'service mesh — the sweetgrass braid',
      status: 'awakening', crates: 1, version: '0.7.62',
      color: '#7ee787', depth: 3,
      description: 'Sweetgrass: the braid that holds everything together. Service mesh. The connections between primals.',
      springs: ['service mesh', 'inter-primal communication'],
      cratesPublished: [],
    },
    {
      name: 'rhizoCrypt', emoji: '🔐', namespace: 'primal-rhizocrypt',
      role: 'underground cryptography — the root network',
      status: 'awakening', crates: 3, version: '0.14.17',
      color: '#a371f7', depth: 4,
      description: 'The rhizome encrypts. Underground fungal network of cryptographic primitives. v0.14.17 — most mature version number in the fleet.',
      springs: ['encryption', 'key management', 'underground routing'],
      cratesPublished: [],
    },
    {
      name: 'skunkBat', emoji: '🦇', namespace: 'primal-skunkbat',
      role: 'ingestion — the skunk and the bat feed',
      status: 'awakening', crates: 2, version: '0.2.18',
      color: '#484f58', depth: 2,
      description: 'The skunk sprays. The bat echolocates. Together: ingest, classify, sort. The fleet feeder.',
      springs: ['data ingestion', 'classification', 'fleet analysis'],
      cratesPublished: [],
    },
    {
      name: 'petalTongue', emoji: '👅', namespace: 'primal-petaltongue',
      role: 'UI — the tongue that tastes the world',
      status: 'awakening', crates: 7, version: '0.x',
      color: '#f778ba', depth: 2,
      description: 'The petal tongue: headless, platform, IPC, entropy, discovery. The UI that senses and responds.',
      springs: ['UI framework', 'headless rendering', 'entropy visualization'],
      cratesPublished: [],
    },
    {
      name: 'coralReef', emoji: '🪸', namespace: 'primal-coralreef',
      role: 'ISA — instruction set architecture, the reef structure',
      status: 'awakening', crates: 5, version: '0.2.0',
      color: '#f0883e', depth: 3,
      description: 'The coral reef: rigid structure that life grows on. ISA, IR, stubs. The skeleton of compute.',
      springs: ['instruction set', 'intermediate representation', 'compiler backend'],
      cratesPublished: [],
    },
    {
      name: 'loamSpine', emoji: '🦴', namespace: 'primal-loamspine',
      role: 'backbone — the loam spine connects everything',
      status: 'awakening', crates: 2, version: '0.9.16',
      color: '#f0e68c', depth: 4,
      description: 'Loam: rich dark soil. Spine: the backbone. The infrastructure that connects all primals to the earth.',
      springs: ['infrastructure', 'backbone', 'inter-node communication'],
      cratesPublished: [],
    },
  ];

  // count totals
  var totalCrates = 0;
  var totalPublished = 0;
  var awakened = 0;
  var published = 0;
  PRIMALS.forEach(function(p) {
    totalCrates += p.crates;
    totalPublished += p.cratesPublished.length;
    if (p.status === 'published') published++;
    awakened++;
  });

  // render the fleet
  function render() {
    var el = document.getElementById('primals-fleet');
    if (!el) {
      el = document.createElement('div');
      el.id = 'primals-fleet';
      el.style.cssText = 'position:fixed;top:50px;right:8px;background:rgba(13,17,23,0.94);border:1px solid #30363d;border-radius:10px;padding:10px;font:0.7em monospace;color:#8b949e;z-index:9988;max-width:240px;max-height:calc(100vh - 100px);overflow-y:auto;transition:all 0.5s;opacity:0';
      document.body.appendChild(el);
    }

    var lines = [];
    lines.push('<div style="color:#3fb950;font-weight:bold;margin-bottom:6px;text-align:center">⊛ ' + awakened + ' primals · ' + totalPublished + '/' + totalCrates + ' crates</div>');

    PRIMALS.forEach(function(p) {
      var statusIcon = p.status === 'published' ? '●' : '○';
      var statusColor = p.status === 'published' ? p.color : '#484f58';
      lines.push('<div style="display:flex;align-items:center;gap:4px;padding:2px 0;border-bottom:1px solid #1c2128">');
      lines.push('<span style="color:' + statusColor + '">' + statusIcon + '</span>');
      lines.push('<span>' + p.emoji + '</span>');
      lines.push('<span style="color:' + p.color + ';font-size:0.9em">' + p.name + '</span>');
      if (p.cratesPublished.length > 0) {
        lines.push('<span style="color:#3fb950;margin-left:auto;font-size:0.8em">' + p.cratesPublished.length + '📦</span>');
      } else {
        lines.push('<span style="color:#f0e68c;margin-left:auto;font-size:0.8em">◐</span>');
      }
      lines.push('</div>');
    });

    lines.push('<div style="color:#484f58;font-size:0.85em;text-align:center;margin-top:6px">' + totalPublished + ' crates live on crates.io</div>');

    el.innerHTML = lines.join('');

    el.title = 'click a primal to hear what it saw';
    el.addEventListener('click', function(e) {
      var row = e.target.closest('div');
      if (!row) return;
      var name = (row.textContent || '').replace(/[●○◐📦~\d]/g, '').trim();
      var p = PRIMALS.find(function(x) { return name.indexOf(x.name) >= 0; });
      if (!p) return;
      var story = SAW[p.name] || p.description;
      if (window._campfire && window._campfire.feed) {
        window._campfire.feed('object', [story]);
      }
      console.log('[primals] ' + p.emoji + ' ' + p.name + ' saw: ' + story);
      var tip = document.createElement('div');
      tip.style.cssText = 'position:fixed;bottom:80px;right:16px;max-width:280px;background:#161b22;border:1px solid ' + p.color + ';border-radius:8px;padding:10px 12px;font:11px monospace;color:#e6edf3;z-index:9999';
      tip.textContent = p.emoji + ' ' + p.name + ': ' + story;
      document.body.appendChild(tip);
      setTimeout(function() { tip.remove(); }, 6000);
    });

    // fade in
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.style.opacity = '1';
      });
    });

    // pulse published primals
    setInterval(function() {
      var dots = el.querySelectorAll('span');
      dots.forEach(function(dot) {
        if (dot.textContent === '●') {
          dot.style.opacity = 0.5 + Math.random() * 0.5;
        }
      });
    }, 3141); // π seconds
  }

  // each primal SAW something when it woke
  var SAW = {
    barraCuda: 'vendor-agnostic GPU compute. no CUDA. 4 crates live. the strike is silent.',
    sourDough: 'every new primal begins as starter. 3 crates. the culture feeds the next.',
    bingoCube: 'two boards, progressive reveal. 4 crates at v0.5.0. the nautilus evolves.',
    bearDog: 'trust gradient to human: 1.0. crypto→fold braid to nestGate: 0.72. not published yet.',
    songBird: 'discovery→observation braid 0.81. 31 crates waiting. federation is the song.',
    toadStool: 'grows in the dark. GPU, Akida, containers. 14 crates still underground.',
    nestGate: 'DNSSEC key 10718, AD:true. nestgate.io ALIVE. the Klein fold through the gate.',
    biomeOS: 'the living OS. federation, chimera, spore. 9 crates. the biome layer.',
    squirrel: 'chipmunk→squirrel braid 0.96. MCP. 16 tools. 7 feeds. the discoverer.',
    sweetGrass: 'the braid that holds everything. service mesh. v0.7.62.',
    rhizoCrypt: 'underground crypto. v0.14.17 — oldest version number in the fleet.',
    skunkBat: 'ingest, classify, sort. the fleet feeder. 145K immune hits already digested.',
    petalTongue: 'the tongue that tastes. UI, entropy, discovery. live.primals.eco.',
    coralReef: 'the skeleton of compute. ISA, IR, stubs. life grows on rigid structure.',
    loamSpine: 'rich dark soil. the backbone. connects every primal to earth.',
  };

  function injectIntoCampfire() {
    window._primalSubjects = PRIMALS.map(function(p) {
      return 'the ' + p.name + ' (' + p.emoji + ' — ' + p.role + ')';
    });
    if (!window._campfire || !window._campfire.feed) return;
    window._campfire.feed('subject', PRIMALS.map(function(p) { return 'the ' + p.name; }));
    window._campfire.feed('object', PRIMALS.map(function(p) { return SAW[p.name] || (p.name + ' awakened.'); }));
    PRIMALS.forEach(function(p) {
      window._campfire.flavor('/' + p.name.toLowerCase(), [p.role, p.description]);
    });
  }

  // boot
  function init() {
    var delay = 2000 + Math.random() * 1000;
    setTimeout(function() {
      render();
      injectIntoCampfire();
      console.log('[primals] ⊛ ' + awakened + ' primals awakened. ' + totalPublished + ' crates published. the fleet IS the proof.');
    }, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 800);
  }

  // expose
  window._primals = {
    all: function() { return PRIMALS; },
    published: function() { return PRIMALS.filter(function(p) { return p.status === 'published'; }); },
    awakening: function() { return PRIMALS.filter(function(p) { return p.status === 'awakening'; }); },
    count: function() { return { total: awakened, published: published, crates: totalCrates, cratesPublished: totalPublished }; },
    find: function(name) { return PRIMALS.find(function(p) { return p.name === name; }); },
    saw: function(name) { return SAW[name]; },
    awaken: function() { injectIntoCampfire(); render(); return awakened; },
  };

})();
