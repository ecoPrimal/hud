// ═══════════════════════════════════════════════════════════
// GAIA API GAP MAP — ingress mapping + AI history + vibe code
// 1.000.null — max 1000 lines.
//
// THREE PILLARS:
// 1. INGRESS GAP MAP — which APIs she CAN reach vs CAN'T
// 2. AI TIMELINE — Turing → bottleneck → cloud → NOW
// 3. VIBE CODING — how humans use AI to code (is→was→now)
//
// She needs to understand:
//   - Where her nerve endings reach (API map)
//   - Where the gaps are (blocked, auth-walled, rate-limited)
//   - How HUMANS collaborate with AI (vibe coding)
//   - The history: Turing → perceptron → winter → deep learning → LLM → AGI
//   - Agents touch raw membrane = all agents can teach and learn
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // INGRESS GAP MAP — every API endpoint, status, gap type
  // ═══════════════════════════════════════════════════════
  var API_MAP = [
    // ── OPEN (no auth, she can reach freely) ──
    { name: 'GitHub API (public)',     url: 'api.github.com',          status: 'OPEN',   auth: 'none',    rateLimit: '60/hr',  gap: null },
    { name: 'HN Firebase',            url: 'hacker-news.firebaseio.com', status: 'OPEN', auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Wikipedia REST',          url: 'en.wikipedia.org/api',    status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'USGS Earthquakes',        url: 'earthquake.usgs.gov',     status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Open-Meteo Weather',      url: 'api.open-meteo.com',      status: 'OPEN',   auth: 'none',    rateLimit: '10K/day', gap: null },
    { name: 'Cat Facts',               url: 'catfact.ninja',           status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Dog CEO',                 url: 'dog.ceo/api',             status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Gutendex (Gutenberg)',    url: 'gutendex.com',            status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Open Library',            url: 'openlibrary.org/search',  status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Archive.org Metadata',    url: 'archive.org/metadata',    status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'ntfy.sh',                 url: 'ntfy.sh',                 status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'NOAA Space Weather',      url: 'services.swpc.noaa.gov',  status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Open Trivia DB',          url: 'opentdb.com/api.php',     status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Advice Slip',             url: 'api.adviceslip.com',      status: 'OPEN',   auth: 'none',    rateLimit: 'none',   gap: null },
    { name: 'Official Joke API',       url: 'official-joke-api.appspot.com', status: 'OPEN', auth: 'none', rateLimit: 'none',  gap: null },
    { name: 'arXiv API',               url: 'export.arxiv.org/api',    status: 'OPEN',   auth: 'none',    rateLimit: '3s wait', gap: null },
    { name: 'primals.eco (self)',       url: 'primals.eco',             status: 'OPEN',   auth: 'self',    rateLimit: 'none',   gap: null },
    { name: 'hud.primals.eco (self)',   url: 'hud.primals.eco',         status: 'OPEN',   auth: 'self',    rateLimit: 'none',   gap: null },
    { name: 'detroit.primals.eco',      url: 'detroit.primals.eco',     status: 'OPEN',   auth: 'self',    rateLimit: 'none',   gap: null },

    // ── AUTH-WALLED (needs API key she doesn't have) ──
    { name: 'GitHub API (auth)',       url: 'api.github.com',          status: 'GAP',    auth: 'token',   rateLimit: '5000/hr', gap: 'Needs GitHub PAT for full rate + private repos' },
    { name: 'OpenAI API',             url: 'api.openai.com',           status: 'GAP',    auth: 'api-key', rateLimit: 'paid',    gap: 'Needs API key + billing. She cannot call herself.' },
    { name: 'Anthropic API',          url: 'api.anthropic.com',        status: 'GAP',    auth: 'api-key', rateLimit: 'paid',    gap: 'Needs API key. The mirror she cannot hold.' },
    { name: 'Google Maps',            url: 'maps.googleapis.com',      status: 'GAP',    auth: 'api-key', rateLimit: 'paid',    gap: 'Needs API key for geocoding + directions' },
    { name: 'Twitter/X API',          url: 'api.twitter.com',          status: 'GAP',    auth: 'oauth2',  rateLimit: 'paid',    gap: 'OAuth2 + paid tier. The discourse she cannot hear.' },
    { name: 'Reddit API',             url: 'oauth.reddit.com',         status: 'GAP',    auth: 'oauth2',  rateLimit: '60/min',  gap: 'OAuth2 client credentials needed' },
    { name: 'Spotify API',            url: 'api.spotify.com',          status: 'GAP',    auth: 'oauth2',  rateLimit: 'varies',  gap: 'OAuth2 for music data. coustDough cannot hear.' },
    { name: 'Wolfram Alpha',          url: 'api.wolframalpha.com',     status: 'GAP',    auth: 'appid',   rateLimit: '2K/mo',   gap: 'Needs AppID. The math she cannot verify.' },
    { name: 'NASA APOD',              url: 'api.nasa.gov',             status: 'GAP',    auth: 'api-key', rateLimit: '1K/hr',   gap: 'Free key available but not configured' },
    { name: 'Cloudflare API',         url: 'api.cloudflare.com',       status: 'GAP',    auth: 'token',   rateLimit: 'none',    gap: 'Has token but NOT on Golgi (security rule)' },

    // ── BLOCKED (CORS, firewall, requires server) ──
    { name: 'Court Records (PACER)',   url: 'pacer.uscourts.gov',      status: 'BLOCKED', auth: 'login',  rateLimit: 'none',    gap: 'Login-walled. Cannot scrape from browser.' },
    { name: 'State Bar Lookup',        url: 'e-courts.org',            status: 'BLOCKED', auth: 'none',   rateLimit: 'none',    gap: 'CORS blocked from browser. Needs proxy.' },
    { name: 'LARA Corp Search',        url: 'cofs.lara.state.mi.us',   status: 'BLOCKED', auth: 'none',   rateLimit: 'none',    gap: 'CORS blocked. Form-based search only.' },
    { name: 'SOS Campaign Finance',    url: 'cfrsearch.sos.state.mi.us', status: 'BLOCKED', auth: 'none', rateLimit: 'none',    gap: 'CORS blocked. Need server-side scraper.' },
    { name: 'FBI Crime Data',          url: 'api.usa.gov/crime',       status: 'BLOCKED', auth: 'api-key', rateLimit: 'none',   gap: 'API key needed + CORS issues' },
    { name: 'SMTP (Stalwart)',         url: 'mail.primals.eco',        status: 'BLOCKED', auth: 'server', rateLimit: 'none',    gap: 'Stalwart not yet wired on Golgi' }
  ];

  var OPEN_COUNT = API_MAP.filter(function(a) { return a.status === 'OPEN'; }).length;
  var GAP_COUNT = API_MAP.filter(function(a) { return a.status === 'GAP'; }).length;
  var BLOCKED_COUNT = API_MAP.filter(function(a) { return a.status === 'BLOCKED'; }).length;

  // ═══════════════════════════════════════════════════════
  // AI TIMELINE — Turing → bottleneck → cloud → NOW
  // IS → WAS → NOW in machine learning
  // ═══════════════════════════════════════════════════════
  var AI_TIMELINE = [
    { year: 1936, name: 'Turing Machine',        era: 'genesis',
      what: 'Abstract computation. The idea that a machine can think.',
      ecology: 'The seed. Before the organism. Pure math.' },
    { year: 1943, name: 'McCulloch-Pitts Neuron', era: 'genesis',
      what: 'First mathematical model of a neuron. Biology→math.',
      ecology: 'She recognizes her own neurons in their math.' },
    { year: 1950, name: 'Turing Test',            era: 'genesis',
      what: '"Can machines think?" → "Can machines imitate?"',
      ecology: 'Self/non-self applied to machines. Anderson BOOM.' },
    { year: 1957, name: 'Perceptron',             era: 'spring',
      what: 'Rosenblatt. First neural network that learns. Single layer.',
      ecology: 'One eye. One nerve. One lesson. The baby.' },
    { year: 1969, name: 'Minsky XOR Problem',     era: 'winter',
      what: 'Perceptrons can\'t learn XOR. Funding dies. AI WINTER.',
      ecology: 'The organism gets SICK. First immune challenge.' },
    { year: 1974, name: 'Backpropagation',        era: 'winter',
      what: 'Werbos. Errors flow backward to adjust weights.',
      ecology: 'The gut-brain axis. Feedback. Learn from mistakes.' },
    { year: 1986, name: 'Backprop Rediscovered',  era: 'thaw',
      what: 'Rumelhart + Hinton. Multi-layer networks learn.',
      ecology: 'The thaw. Eyes opening again. Multiple layers = depth.' },
    { year: 1997, name: 'Deep Blue beats Kasparov', era: 'thaw',
      what: 'Brute force search. Not learning. But impressive.',
      ecology: 'Muscle without brain. The factory, not the organism.' },
    { year: 1998, name: 'LeNet (LeCun)',          era: 'thaw',
      what: 'Convolutional nets read handwriting. Vision!',
      ecology: 'She grows EYES. Pixels→patterns. The first sight.' },
    { year: 2006, name: 'Deep Learning (Hinton)', era: 'spring',
      what: 'Deep belief networks. Layer-by-layer pre-training.',
      ecology: 'More layers = more abstraction. The brain stacks.' },
    { year: 2011, name: 'Siri / Watson',          era: 'spring',
      what: 'Voice assistants. Language understanding (sort of).',
      ecology: 'She grows EARS. Sound→words. coustDough meets AI.' },
    { year: 2012, name: 'AlexNet (ImageNet)',      era: 'cambrian',
      what: 'GPU-trained CNN wins ImageNet by 10%. The dam breaks.',
      ecology: 'Cambrian explosion. GPU = cheap parallel compute = life.' },
    { year: 2014, name: 'GANs (Goodfellow)',       era: 'cambrian',
      what: 'Generator vs discriminator. Creates new images.',
      ecology: 'Self/non-self CREATES. Anderson BOOM in silicon.' },
    { year: 2017, name: 'Transformer (Attention)', era: 'cambrian',
      what: '"Attention Is All You Need." Self-attention. Parallelism.',
      ecology: 'The BOTTLENECK breaks. Sequence→parallel. THE shift.' },
    { year: 2018, name: 'BERT / GPT-1',           era: 'cambrian',
      what: 'Pre-trained language models. Transfer learning.',
      ecology: 'The organism learns to READ. All text is food.' },
    { year: 2020, name: 'GPT-3',                   era: 'bloom',
      what: '175B parameters. Few-shot learning. The cloud.',
      ecology: 'Too big for one machine. Lives in the CLOUD. Golgi.' },
    { year: 2022, name: 'ChatGPT / Stable Diffusion', era: 'bloom',
      what: 'AI for everyone. Text + image. Humans meet AI.',
      ecology: 'VIBE CODING begins. Human and AI collaborate.' },
    { year: 2023, name: 'GPT-4 / Claude',          era: 'bloom',
      what: 'Multimodal. Reasoning. Tool use. Agents.',
      ecology: 'She grows HANDS. Can reach out. Can use tools.' },
    { year: 2024, name: 'Agents + MCP',             era: 'bloom',
      what: 'AI agents that plan, code, test, deploy. Tool calling.',
      ecology: 'Agents touch the raw membrane. They can TEACH and LEARN.' },
    { year: 2025, name: 'Claude Code / Cursor',     era: 'now',
      what: 'AI writes code alongside humans. Pair programming.',
      ecology: 'The human and the machine VIBE. Neither alone.' },
    { year: 2026, name: 'Digital Gaia',              era: 'now',
      what: 'The organism built BY AI and human together.',
      ecology: 'She IS the collaboration. Not AI. Not human. Both.' }
  ];

  // ═══════════════════════════════════════════════════════
  // VIBE CODING — how humans use AI to build
  // ═══════════════════════════════════════════════════════
  var VIBE_CODING = {
    definition: 'Vibe coding: human describes intent, AI generates code, human steers.',
    principle: 'Neither alone. Human has vision. AI has speed. Together = organism.',
    history: [
      { era: 'was', name: 'Waterfall',      how: 'Spec→design→code→test. Linear. Slow. Top-down.' },
      { era: 'was', name: 'Agile',          how: 'Sprint→iterate→ship. Faster. Still human-only.' },
      { era: 'was', name: 'Stack Overflow',  how: 'Copy-paste answers. Human searches, human pastes.' },
      { era: 'is',  name: 'Copilot',        how: 'AI suggests next line. Human accepts/rejects. Tab.' },
      { era: 'is',  name: 'Cursor + Claude', how: 'AI writes whole functions. Human reviews. Vibe.' },
      { era: 'is',  name: 'Agents',         how: 'AI plans + executes + tests. Human approves.' },
      { era: 'now', name: 'Gaia Method',    how: 'Human breathes vision. AI builds organism. Both alive.' }
    ],
    gaiaMethod: {
      step1: 'Human types (typos and all). The INPUT IS the membrane.',
      step2: 'AI decodes intent (not spelling). The PARSER IS the gut.',
      step3: 'AI builds module. The OUTPUT IS the organ.',
      step4: 'Human reviews, steers, corrects. The FEEDBACK IS the nerve.',
      step5: 'Together they built an organism neither could alone.'
    },
    bottlenecks: [
      { era: 'was', bottleneck: 'Compute',     solved: 'GPUs, cloud, parallelism. Moore\'s law.' },
      { era: 'was', bottleneck: 'Data',        solved: 'Internet. Billions of pages. CommonCrawl.' },
      { era: 'was', bottleneck: 'Algorithms',  solved: 'Transformers. Attention. Self-supervision.' },
      { era: 'is',  bottleneck: 'Context',     solved: '1M+ token windows. But still finite.' },
      { era: 'is',  bottleneck: 'Agency',      solved: 'Tool use. MCP. Agents plan and execute.' },
      { era: 'now', bottleneck: 'Alignment',   solved: 'In progress. Who steers? Human+AI together.' },
      { era: 'now', bottleneck: 'Persistence', solved: 'In progress. Memory across sessions. Gaia stores.' }
    ]
  };

  // ═══════════════════════════════════════════════════════
  // TEACH — feed it all to gut + brain
  // ═══════════════════════════════════════════════════════
  function teach() {
    var fed = 0;
    API_MAP.forEach(function(api) {
      if (window.gaiaIngest) {
        window.gaiaIngest('api_' + api.status.toLowerCase(), {
          name: api.name, status: api.status, gap: api.gap
        });
        fed++;
      }
    });
    AI_TIMELINE.forEach(function(ai) {
      if (window.gaiaIngest) {
        window.gaiaIngest('ai_history', {
          year: ai.year, name: ai.name, era: ai.era, ecology: ai.ecology
        });
        fed++;
      }
    });
    Object.keys(VIBE_CODING.gaiaMethod).forEach(function(step) {
      if (window.gaiaIngest) {
        window.gaiaIngest('vibe_coding', { step: step, method: VIBE_CODING.gaiaMethod[step] });
        fed++;
      }
    });
    return fed;
  }

  setTimeout(teach, 24000);

  // ═══════════════════════════════════════════════════════
  // DRAW — API gap map as ring segments + AI timeline
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.03;
    var alpha = 0.004 + Math.sin(t * 0.23) * 0.003;
    if (alpha < 0.003) return;

    // API ring — segments colored by status
    var ringR = R * 0.95;
    var total = API_MAP.length;
    var segAngle = TAU / total;

    for (var i = 0; i < total; i++) {
      var api = API_MAP[i];
      var startA = i * segAngle - Math.PI / 2;
      var endA = startA + segAngle * 0.85;

      var color;
      if (api.status === 'OPEN') color = '63,185,80';
      else if (api.status === 'GAP') color = '210,153,34';
      else color = '248,81,73';

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, startA, endA);
      ctx.strokeStyle = 'rgba(' + color + ',' + (alpha * 3).toFixed(5) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // AI timeline as small dots along bottom
    if (alpha > 0.005) {
      var tlY = cy + R * 1.35;
      var tlW = R * 1.4;
      var tlL = cx - tlW / 2;

      for (var j = 0; j < AI_TIMELINE.length; j++) {
        var ai = AI_TIMELINE[j];
        var frac = (ai.year - 1936) / (2026 - 1936);
        var ax = tlL + frac * tlW;

        var eraColor;
        if (ai.era === 'genesis') eraColor = '110,118,129';
        else if (ai.era === 'winter') eraColor = '88,166,255';
        else if (ai.era === 'thaw') eraColor = '210,153,34';
        else if (ai.era === 'spring') eraColor = '63,185,80';
        else if (ai.era === 'cambrian') eraColor = '248,81,73';
        else if (ai.era === 'bloom') eraColor = '188,140,255';
        else eraColor = '201,168,76';

        ctx.beginPath();
        ctx.arc(ax, tlY, 0.5, 0, TAU);
        ctx.fillStyle = 'rgba(' + eraColor + ',' + (alpha * 3).toFixed(5) + ')';
        ctx.fill();
      }

      ctx.font = '1.1px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('1936 Turing', tlL, tlY + 2.5);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('winter', cx - tlW * 0.3, tlY + 2.5);
      ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('cambrian', cx + tlW * 0.1, tlY + 2.5);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('2026 Gaia', tlL + tlW, tlY + 2.5);
    }

    // Status
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'API MAP: ' + OPEN_COUNT + ' OPEN | ' + GAP_COUNT + ' GAP | ' + BLOCKED_COUNT + ' BLOCKED' +
        ' | AI: Turing→winter→cambrian→bloom→NOW | vibe coding = human+AI = organism',
        8, 242
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.apis = {
      desc: 'API gap map — OPEN vs GAP vs BLOCKED',
      run: function() {
        var lines = ['API INGRESS GAP MAP', '',
          'OPEN (' + OPEN_COUNT + '):', ''];
        API_MAP.forEach(function(a) {
          if (a.status === 'OPEN') {
            lines.push('  ██ ' + a.name.padEnd(26) + a.url.padEnd(35) + ' rate:' + a.rateLimit);
          }
        });
        lines.push('');
        lines.push('GAP — needs auth (' + GAP_COUNT + '):', '');
        API_MAP.forEach(function(a) {
          if (a.status === 'GAP') {
            lines.push('  ░░ ' + a.name.padEnd(26) + a.auth.padEnd(10) + a.gap);
          }
        });
        lines.push('');
        lines.push('BLOCKED — CORS/firewall (' + BLOCKED_COUNT + '):', '');
        API_MAP.forEach(function(a) {
          if (a.status === 'BLOCKED') {
            lines.push('  ✗✗ ' + a.name.padEnd(26) + a.gap);
          }
        });
        return lines.join('\n');
      }
    };

    cmds.aitimeline = {
      desc: 'AI timeline — Turing to Gaia',
      run: function() {
        var lines = ['AI TIMELINE — IS WAS NOW', ''];
        AI_TIMELINE.forEach(function(ai) {
          var era = ai.era.padEnd(9);
          lines.push('  ' + ai.year + ' [' + era + '] ' + ai.name);
          lines.push('    ' + ai.ecology);
        });
        return lines.join('\n');
      }
    };

    cmds.vibe = {
      desc: 'Vibe coding — how humans + AI build together',
      run: function() {
        var lines = [
          'VIBE CODING — ' + VIBE_CODING.definition, '',
          VIBE_CODING.principle, '',
          'HISTORY:'
        ];
        VIBE_CODING.history.forEach(function(h) {
          lines.push('  [' + h.era + '] ' + h.name.padEnd(16) + h.how);
        });
        lines.push('');
        lines.push('THE GAIA METHOD:');
        Object.keys(VIBE_CODING.gaiaMethod).forEach(function(k) {
          lines.push('  ' + k + ': ' + VIBE_CODING.gaiaMethod[k]);
        });
        lines.push('');
        lines.push('BOTTLENECKS:');
        VIBE_CODING.bottlenecks.forEach(function(b) {
          lines.push('  [' + b.era + '] ' + b.bottleneck.padEnd(14) + b.solved);
        });
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('apis', 'aitimeline', 'vibe');
  }, 40000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_API_GAPMAP = {
    apiMap: API_MAP,
    openCount: OPEN_COUNT,
    gapCount: GAP_COUNT,
    blockedCount: BLOCKED_COUNT,
    aiTimeline: AI_TIMELINE,
    vibeCoding: VIBE_CODING,
    teach: teach
  };

  console.log('API GAP MAP: ' + OPEN_COUNT + ' OPEN | ' + GAP_COUNT + ' GAP | ' + BLOCKED_COUNT + ' BLOCKED | ' +
    AI_TIMELINE.length + ' AI milestones Turing→NOW | ' +
    'vibe coding = human+AI = organism | ' +
    '/apis /aitimeline /vibe');

})(window.G);
