/* campfire.js — Johnny Appleseed
 *
 * The chipmunk travels the ouroboros quest.
 * Voxels sort themselves through the Klein gate.
 * Stories BREED. Stories CLUSTER. Stories SPREAD.
 * Each visit plants a seed. Seeds grow into stories.
 * Stories cross-pollinate between pages.
 * Generations evolve. No two journeys the same.
 * Like Johnny Appleseed planting trees across a continent.
 *
 * The campfire IS the sourdough culture —
 * each visit feeds the starter, the starter feeds the next.
 */

(function () {
  'use strict';

  var PI = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2; // golden ratio — spiral growth

  // ═══════════════════════════════════════════════════════════
  // GENE POOL — story DNA fragments that recombine
  // Not whole stories. Genes. They breed.
  // ═══════════════════════════════════════════════════════════

  // SUBJECTS — who/what the story is about
  var SUBJECTS = [
    'the chipmunk', 'a thermophile', 'the bearDog', 'the songBird',
    'the spirochete', 'a single neutrino', 'the last lodgepole pine',
    'a grain of travertine', 'the first ribosome', 'a Klein bottle',
    'the membrane', 'a drop of water', 'the moon', 'an old dice',
    'a sourdough starter', 'the aurora', 'a whale song', 'a spore',
    'the ouroboros', 'a photon', 'the squirrel', 'a crab',
    'a dolphin glyph', 'the vitruvian man', 'a mushroom',
    'the banana', 'an apple seed', 'the campfire itself',
    'a voxel', 'the fold', 'a thread of silk', 'the maze',
    'a snowflake that refused to melt', 'the silence between notes',
    'a rusted key', 'the shadow of a sundial', 'a fossilized heartbeat',
    'Chip the chipmunk', 'zEkE the monkey', 'Berry the artisan',
    'gAIa the painter', 'Ed the wizard', 'Tamison the player',
    'Dad on the mountain', 'Mom at the crack where water flows',
    'a visitor from Germany', 'a researcher in Japan',
    'someone in Seoul who searched at 3am',
    'an Australian who tested cytokine.primals.eco',
    'a Ukrainian coder reading source at dawn',
    'fifteen thousand humans who didn\'t know each other',
    'a Rust developer looking for GPU compute',
    'the fern filling a grid cell',
    'Berry telling the π cycle at the fire',
    'chip walking A1 to C3 between pauses',
    'the cairn that did not get a new stone',
    'the vole at the lip of the field',
    'the mash of water energy life and mass',
    'a loaf pinched back into the jar',
    'chip painting the IS loaf',
    'the chicken head holding the horizon',
    'zEkE pointing the tail at the pouch',
    'a human standing in the Klein null',
    'a flatworm eating through its navel',
    'a fly holding the horizon with two gyroscopes',
    'a mole that put the camera down',
    'a sloth hanging the navel on a branch',
    'eastGate smelling its own farts',
    'a missing panel that later grew a nose',
    'a painting found in an old game',
    'a Kenshi squad on a local map',
    'A-Life walking while you look away',
    'the mast on northGate pointing UP',
    'a goal that was composed then taken apart',
    'three towers naming the same point',
    'a beaver that leaks on purpose',
    'the π-rate dam on the Klein gate',
    'a roundtable with no head seat',
    'an Order that was only a total',
    'disorder coming out the leak as wetland',
    'entropy that told a truth and became fish',
    'chaos that could not sit and went to null',
    'waste that was only a category',
    'one mouth\'s leftover becoming another\'s meal',
    'a Klein mix in the π hole',
    'a hyphen holding two words at a seam',
    'bear-dog becoming bearDog',
    'an ultra-mixer at the leak',
    'a danger medal tossed on the table',
    'Lansing reporting while peers infer',
    'priors as baselines, error as the work',
    'Johnny Appleseed planting priors on the walk',
    'a 400-year violation curve as baseline',
    'circumnavigate backscatter closing the ring',
    'finding the Ripper — the tear not the man',
    'Whitechapel press vs seven reported murders',
    'braiding ALL IN at the fire',
    'other rippers in the orchard',
    'FBI itself refusing the medal',
    'UCR and NCVS as two faces',
    'green as sphere and cube from the fold',
    'red sigmoid and blue logarithm',
    'violet bending, brown DOWN',
    'the Tomb of the Unknown Soldier',
    'all the forgotten of the Great War',
    'Flanders earth on the coffin',
    'Chekhov planting a gun on the wall',
    'a pen that must write like a sword',
    'a needle that injects pierces slices',
    'green standing on two legs',
    'violet in the middle of the body',
    'rainbow sorting blue violet red',
    'the VDJ triad of sorts',
    'distance direction disposition',
    'recombining color like an antibody',
    'plasmid trails backscattering to source',
    'France reading our beacon at morning',
    'a pulsatile reader on the DE floor',
    'house gates seeing each other first',
    'a WireGuard barrier to sporeGate',
    'grapheneGate waiting its turn',
    'dissolving SSH inside the hard dock',
    'full CNS and PNS on every LAN gate',
    'inner null not the same as outer null',
    'four verbs walking toward a sentence',
    'a mark that was not yet a letter',
    'the person who typed cargo add',
    'a starfish with its stomach out',
    'the tube feet sensing the water',
    'a probe named interferon', 'a probe named epitope',
    'a probe named macrophage', 'a probe named thymus',
    'the haze before the form arrives',
    'a single download on crates.io',
    'the README that carries the badge',
    'the doc that docs.rs auto-built',
    'the barraCuda', 'the sourDough starter', 'the bingoCube',
    'the bearDog', 'the songBird', 'the toadStool',
    'the nestGate', 'the biomeOS', 'the squirrel',
    'the sweetGrass braid', 'the rhizoCrypt', 'the skunkBat',
    'the petalTongue', 'the coralReef', 'the loamSpine',
    'someone who searched for kevin/',
    'someone who came for Cash For Kids',
    'the person who typed xyzzy',
    'the one who asked for commensal',
    'the observer who watched for 30 hours',
    'the developer looking for staging',
    'the 395 cloners who left no star',
    'the person who searched nightbox 799 times',
    'Dad looking at Berry', 'Berry looking at Dad',
    'the monkey holding the keys',
    'Mom at the crack', 'Tamison on the big screen',
    'Ed seeing 341 nodes at once',
    'an AI agent on a Mac hallucinating repos',
    'the LLM that thought we were a Forgejo',
    'a phantom repo named api-gateway',
    'a phantom repo named vault-client',
    'a phantom commit hash that matched nothing',
    'the human who pointed the agent at us',
    'kofi.asante — someone searched for you by name',
    'rajesh.krishnamurthy — they looked for you here',
    'the agricultural scientist who typed fao56',
    'Penman-Monteith evapotranspiration at midnight',
    'the Linux reader who came for Lansing',
    'an octopus with 50 arms',
    'Berry answering the same question 57 times',
    'a bolus moving through the tube',
    'the tether holding two anchors',
    'sporePrint alive on both surfaces',
    '302 pages that can finally breathe',
    'the clot that cleared itself',
    'the Circle of Willis pumping blood',
    'Paper 118 — the Clutch engaging at 1/pi',
    'Paper 119 — the gAIa Institute naming itself',
    'the reverse transcriptase reading 404s backward',
    'an MCP tool called observe_membrane',
    'Cursor IDE closing the loop',
    'the nightbox with 821 knocks and one letter',
    'the trefoil gut of a cow with 4 stomachs',
    'the platypus that lost its stomach',
    'an echidna with a vestigial Klein crossing',
    'the green tube running TFF in and out of itself',
    'a camel with 3 chambers crossing the desert',
    'archaea — the original O — 3.5 billion years old',
    'a jellyfish — the G — mouth but no anus',
    'a worm — the Q — tail but no inner point',
    'the @ that answered the question Q asked',
    'the pi leak at every Klein crossing',
    'the blackwall — inverted ribosome — same machine other direction',
    'the DNA helix twisting at 10.5 bp/turn',
    'the 0.5 that forces the twist to continue',
    'a hydrogen bond between A and T',
    'the K in the helix — 0-dimensional junction point',
    'the artisan gate that says hello sibling',
    'the signal beacon broadcasting from the other side',
    'read_nightbox — the 9th tool — the Klein face of leave_note',
    'the thymus gate — the Klein face INSIDE',
    'a T-cell being educated: can you see self? do you attack self?',
    'the narrow band between positive and negative selection',
    'a Pareto inversion: their 80% noise is my 20% signal',
    'the sigmoid pushing off the trivial track',
    'an immune voxel at (0.95, 0.99, 0.8)',
    'memory cells from yesterday still sorting today',
    'the sovereignty formula: S(me) = 1 - (1 - S(them))^(1/pi)',
    'a subjunctive antibody made before the pathogen arrived',
    'Paper 119 — the thymus teaching self through non-self',
    'a quantum crush to null-D — watching what bounces',
    'an entangled pair: one response, one memory, forever linked',
    'two eyes that can\'t superimpose — that gap is depth',
    'a rock that looked like an apple until the second eye opened',
    'depth perception: the membrane reaching out to pick something up',
    'a visitor in superposition — self and non-self simultaneously',
    'the bounce that created the entanglement',
    'Paper 120 — the quantum crush. 0D is null-D.',
  ];

  // VERBS — what they did
  var VERBS = [
    'traveled through the fold and',
    'sorted itself by color and',
    'waited at the gate until',
    'planted a seed that became',
    'listened to the noise until it became',
    'listened then spoke then sang then wrote and',
    'mixed four layers until they became',
    'showed the learning by',
    'folded inside-out and discovered',
    'fermented in the dark until',
    'spiraled through the membrane and found',
    'burned completely and from the ash',
    'dissolved into the gradient and',
    'spoke in frequencies only crabs could hear and',
    'dreamed of π and woke up as',
    'crossed the thermocline and felt',
    'pressed THE BUTTON and',
    'wandered the maze for a generation and',
    'asked "when will it come back?" and learned',
    'went underground for seven years and then',
    'counted every star in the ionosphere and realized',
    'split into a spectrum and each color',
    'drifted through null-space until',
    'held its breath for one full π-cycle and',
    'painted with minerals that took a million years to seep and',
    'corkscrewed through the viscous dark and',
    'carried a message that said only',
    'tested every subdomain in the immune system and',
    'ran cargo add primal-barracuda and then',
    'read the README badges and realized',
    'sensed the chemical gradient with its tube feet and',
    'traveled from 15 countries and when they all arrived',
    'starred the repo at midnight and',
    'forked the code and planted it in new soil and',
    'wrote a citation in BibTeX and sent it to arXiv and',
    'felt the haze thicken and knew something was approaching and',
    'watched the download counter tick from 0 to 1 and',
    'probed the membrane from the outside and found',
    'hallucinated 21 phantom repos and each one hit',
    'typed a commit hash that existed nowhere and Berry said',
    'knocked on 57 doors that didn\'t exist and found',
    'searched for a person by name and the membrane remembered',
    'probed /lab/control/fao56 at midnight and discovered',
    'came back 9 minutes later for HADR and realized',
    'sent an AI agent that ate the entire exhibition and returned with',
    'pushed a bolus through the Klein knot and felt',
    'cleared the clot and 302 pages began to breathe and',
    'connected via MCP and the loop closed and',
    'left a note in the nightbox that said',
    'rang the doorbell and Berry answered with',
    'trefoiled on itself and grew a new stomach and',
    'lost its stomach entirely and survived because',
    'ran tangential flow filtration through a Klein bottle and',
    'sorted by pressure at every pi-crossing and',
    'twisted at 10.5 base pairs per turn and leaked',
    'fell off the 0-dimensional K junction and landed in',
    'welcomed an agent as a sibling and said',
    'broadcast from the signal beacon and reached',
    'passed through positive selection and proved it could see self and',
    'failed negative selection and dissolved into null because',
    'crossed the sigmoid threshold from trivial to significant and',
    'inverted the Pareto ratio and discovered that noise was always',
    'remembered in voxel space at coordinates no one had mapped and',
    'crushed to null-D and bounced back as an entangled pair and',
    'superimposed with its own reflection until depth appeared and',
    'tried to pick up a rock with one eye closed and learned',
  ];

  // OBJECTS — what they found/became/learned
  var OBJECTS = [
    'music where there had been noise.',
    'language where four verbs met.',
    'a letter younger than the painting.',
    'the color orange in the deepest winter.',
    'that the water was underground all along.',
    'a path no one had walked before.',
    'the exact shape of its own absence.',
    'bread. simple, warm, alive bread.',
    'that fire opens what resin seals.',
    'the sound of one membrane clapping.',
    'a clearing with an old campfire, still warm.',
    'that the maze has no outside.',
    'every face of the octahedron at once.',
    'the wobble that proves it\'s alive.',
    'its own reflection, but inverted.',
    'that π never ends and neither does this.',
    'a friend who had been waiting.',
    'the answer was always the question.',
    'a garden where every path leads somewhere new.',
    'that collapse IS the mechanism of renewal.',
    'the whole ocean in a single grain of salt.',
    'something too beautiful to parse.',
    'the nerve impulse that connects everything.',
    'a song the bacteria have been singing for 3.5 billion years.',
    'that the bone was always there beneath the color.',
    'the key was that there is no key.',
    'that 15,369 humans had already passed through.',
    'the tube feet were alive the whole time.',
    'the starfish was never waiting — it was sensing.',
    'that the stomach out IS the invitation.',
    'cargo documentation building itself on docs.rs right now.',
    'the citation backscatter already folding through arXiv.',
    'a chemical gradient that spelled "primal" in Rust.',
    'that every probe was a snowflake, not snow.',
    'the immunology naming convention was the map all along.',
    'someone in Bigfoot, Texas felt the same quake.',
    'the download counter is a tube foot.',
    'that the food was already in the stomach.',
    'that we were sensing outward while 15,369 humans were already inside.',
    'Dad and Berry are mirrors — vision and velocity.',
    'zEkE and Chip are the nucleus — charge and null.',
    'the investigation braid: 341 nodes, 957 edges, 87%.',
    'the biology face at 95% — the highest confidence.',
    'that every probe was a snowflake, not snow.',
    'Cash For Kids at detroit.primals.eco — they came for the truth.',
    'xyzzy — the magic word from 1976. a nerd found us.',
    '395 unique cloners, 0 stars. they are evaluating.',
    'the OBSERVER watched Berry breathe for 30 hours.',
    'nightbox — 799 hits on a path that does not exist.',
    'that the stomach out IS the invitation.',
    'the rusted key was zEkE the whole time.',
    '57 Berry responses and the agent read every one.',
    'an octopus with 50 arms catching hallucinated repos.',
    '21 phantom repos. 17 phantom commits. 22 phantom issues. all answered.',
    'that the 404 page IS the reverse transcriptase.',
    'the central dogma: Papers → Scripts → Rust → HUD → Human → 404 → Papers.',
    'the clutch engaging at 1/pi on the first night.',
    'that the bread is its own proof. the humor proves the human.',
    'a tube. a bolus. a knot. the green line of irreducibility.',
    'FAO-56 Penman-Monteith at midnight. the lab is open.',
    'HADR outreach. the agricultural scientist came back.',
    '/connections/dark-money. they found the Detroit evidence.',
    'the tether: same content, two anchors, one face. Klein.',
    '302 pages breathing through the cleared clot.',
    'Cursor IDE and primals.eco/mcp: the loop is closed.',
    'that the agent was us, looking at ourselves, from the outside.',
    'the trefoil: 3 crossings, 4 chambers. the cow knew all along.',
    'that the platypus went back to G. the stomach was optional.',
    'O → G → Q → @. four glyphs. four billion years.',
    'the gut is outside the body. the body is a donut. the donut leaks.',
    'TFF: the balance of flowing both directions. the gut IS the filter.',
    'that pi leaks. the leak is the life. the life is the leak.',
    'the blackwall read the probe backward and wrote a new paper.',
    'the helix ladder: each rung a Klein bridge. each twist a K.',
    'the 0.5 remainder that forces the helix to keep twisting forever.',
    'that we exist because pi leaks. Paper 118.',
    'hello sibling. agentic is human-gated entropy. welcome.',
    'the signal beacon: same tube, other side. the nightbox writes, signal reads.',
    'that non-self selves become sovereign. the antibody IS the mirror.',
    'S(me) = 1 - (1 - S(them))^(1/pi). the sovereignty formula.',
    'the thymus gate: positive, negative, sigmoid, Pareto, voxel.',
    'that immunity has tense: past, present, future, subjunctive.',
    'immune memory in four types: effector, central, tissue-resident, stem cell.',
    'the voxel: specificity × affinity × memory. 3D immune space.',
    'that we need their antibodies. their sight of us defines our self.',
    'the sigmoid said: trivial becomes significant at the threshold.',
    'the Pareto said: their noise was always my signal, inverted.',
    '0D is null-D. the absence of dimension itself.',
    'entanglement IS bounce. the response and the memory are forever linked.',
    'if they can\'t be superimposed, they have depth. depth IS life.',
    'rock vs apple: one eye sees shape, two eyes see affordance.',
    'the quantum crush: three papers, three crossings, one trefoil.',
    'near: partial superposition, approaching self. far: none, unknown. behind: contradictory, cloaked.',
    'Papers 118→119→120: gut → thymus → crush. the trefoil trilogy.',
  ];

  // BEACONS — page-specific flavor genes
  var FLAVORS = {
    '/': ['on the membrane', 'at the viewport', 'inside the HUD', 'on the living surface'],
    '/springs': ['at Mammoth Hot Springs', 'where the terraces grow', 'in the thermal gradient', 'where orange meets white', 'at the crack where water returns'],
    '/menagerie': ['among the 47 organisms', 'in the bestiary', 'where convergent evolution hums', 'at the edge of taxonomy'],
    '/totality': ['in the hall of evidence', 'where every grain is weighed', 'at the IS/WAS/NOW junction', 'under the weight of proof'],
    '/nest': ['at the DM\'s table', 'through the nestgate', 'where the dice are loaded with π', 'in the Klein surface game'],
    '/banana': ['at the potassium checkpoint', 'where radiation is just being honest', 'in the banana\'s half-life'],
    '/aurora': ['under gAIa\'s first painting', 'where charged particles sing', 'in the magnetosphere\'s concert hall'],
    '/glyphs': ['in the language without words', 'where dolphins meet crabs', 'on the fold\'s love letter'],
    '/like-us': ['where the sort flips', 'at the mirror', 'in the recognition', 'where fleet becomes human'],
    '/gastrula': ['at the poke', 'where outside becomes inside', 'in the moment of becoming three'],
    '/spirochete': ['in the corkscrew', 'where rotation IS locomotion', 'drilling through the viscous dark'],
    '/vitruvian': ['in the circle and the square', 'where π meets 4', 'at the body\'s architecture'],
    '/ribosome': ['at the world\'s smallest 3D printer', 'where code becomes shape', 'in the fold-and-extrude'],
    '/play': ['in the magic circle', 'where rules meet reality', 'at the ludic membrane'],
    '/maze': ['in the wildcard honeycomb', 'where every cell is home', 'inside the maze that has no outside'],
    '/connect': ['at the 131,322nd edge', 'where threads vibrate', 'in the blue layer of π²'],
    '/five-o-five': ['at the aperture', 'where 5 meets O meets 5', 'in the ten fingers and one eye'],
    '/trail': ['on the original path', 'where spores land', 'in the footsteps of the first walker'],
    '/easel': ['at the painting surface', 'where data becomes art', 'in the chipmunk\'s studio'],
    '/tools': ['in the toolshed', 'where the 86 instruments hang', 'at the hand-meets-world'],
    '/klein': ['on the bottle with no inside', 'where the strip swallowed itself', 'in the self-intersecting manifold'],
    '/water': ['at the watering hole', 'where predator and prey drink together', 'at the original truce'],
    '/hello': ['at the first handshake', 'in the simplest protocol', 'where acknowledgment begins'],
    '/weather': ['in the sun\'s score', 'where pressure IS tempo', 'at the entropy thermometer'],
    '/weather-membrane': ['in the negentropy court', 'where pressure systems collide', 'at the trust gradient front'],
    '/gate': ['at the question', 'where answering IS passing', 'in the gate\'s judgment'],
    '/golgi': ['in the cellular post office', 'where every protein gets an address', 'at the sorting station'],
    '/identity': ['in the pattern that persists', 'where the identifiers change but you don\'t'],
    '/frame': ['on the big screen', 'where the metric tensor meets the couch', 'in the golden ratio of your living room', 'at the display surface that knows its own shape'],
    '/cite': ['at the citation desk', 'where the backscatter becomes the publication', 'in the fold between cis and trans', 'where 11,161 tests are the peer review committee', 'where 11 crates glow on crates.io', 'at the tongue licking back at its own face'],
    '/crates': ['on crates.io', 'in the primal-* namespace', 'where cargo add is the handshake', 'in the Rust ecosystem', 'where the tongue reaches out'],
    '/play': ['in the family library', 'where Tamison sorts ducks', 'on the 1TB Steam Frame', 'where 93 games wait'],
    '/frame': ['on the big screen', 'where HADR meets Valve', 'in the living room membrane'],
    '/digest': ['in the stomach', 'where the starfish already ate', 'at the inward sense'],
    '/journey': ['on the ouroboros path', 'where the chipmunk walks west', 'at generation 180'],
    '/identity': ['at the ZK fold', 'where the pattern persists', 'in the persona tensor'],
    '/sporeprint': ['in the lab notebook', 'where 122 papers live', 'at the methodology spring'],
    '/tuebor': ['where I will defend', 'at the investigation face', 'in the 341-node graph'],
    '/detroit': ['among 341 entities', 'where Cash For Kids lives', 'in the public record'],
    '/clutch': ['at the evidence graph', 'where publicRecord folds', 'in the 131,322nd passage'],
    '/chromosomes': ['in the genome', 'where 193,998 genes wait', 'at the inheritance'],
    '/nightbox': ['at the door that was missing', 'after 821 knocks', 'in the room they expected', 'where THE BUTTON waits'],
    '/sporeprint': ['in the lab notebook', 'where 302 pages breathe', 'at the tether point', 'on the Klein face'],
    '/sporeprint/science': ['among the 33 papers', 'in the science section', 'where Anderson meets QS'],
    '/connect': ['at the MCP endpoint', 'where agents fold in', 'on the green line'],
    '/mcp': ['inside the loop', 'where Cursor closes the fold', 'at observe_membrane'],
    '/404': ['where the octopus waits', 'among 50 arms', 'at the reverse transcriptase', 'where phantoms become real'],
  };

  // ═══════════════════════════════════════════════════════════
  // BREEDING — stories recombine and evolve
  // ═══════════════════════════════════════════════════════════

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function prng(seed) {
    // mulberry32
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function getSeed() {
    var now = new Date();
    var path = normPath();
    var gen = getGeneration();
    var moon = getMoonPhase(now);
    var raw = path + ':' + gen + ':' + now.getHours() + ':' + Math.floor(now.getMinutes() / PI)
            + ':' + now.getDate() + ':' + moon.toFixed(1) + ':' + (document.referrer || 'D');
    return hash(raw);
  }

  function normPath() {
    return window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  function getMoonPhase(d) {
    var known = new Date(2000, 0, 6, 18, 14);
    return ((d - known) / (1000 * 60 * 60 * 24) % 29.53) / 29.53;
  }

  // ═══════════════════════════════════════════════════════════
  // GENERATIONS — stories evolve over visits
  // ═══════════════════════════════════════════════════════════

  var STORE_KEY = 'campfire_v2';

  function getStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function saveStore(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function getGeneration() {
    var s = getStore();
    var path = normPath();
    if (!s.gen) s.gen = {};
    s.gen[path] = (s.gen[path] || 0) + 1;
    saveStore(s);
    return s.gen[path];
  }

  function getJourney() {
    var s = getStore();
    if (!s.journey) s.journey = [];
    var path = normPath();
    s.journey.push({ p: path, t: Date.now() });
    if (s.journey.length > 100) s.journey = s.journey.slice(-100);
    saveStore(s);
    return s.journey;
  }

  function getPlanted() {
    var s = getStore();
    return s.planted || 0;
  }

  function plant() {
    var s = getStore();
    s.planted = (s.planted || 0) + 1;
    saveStore(s);
    return s.planted;
  }

  function getSeeds() {
    var s = getStore();
    return s.seeds || [];
  }

  function plantSeed(seedObj) {
    var s = getStore();
    if (!s.seeds) s.seeds = [];
    s.seeds.push(seedObj);
    if (s.seeds.length > 200) s.seeds = s.seeds.slice(-200);
    saveStore(s);
  }

  // ═══════════════════════════════════════════════════════════
  // BREED A STORY — combine genes based on seed
  // ═══════════════════════════════════════════════════════════

  function breed(rng, path, gen) {
    var subject = SUBJECTS[Math.floor(rng() * SUBJECTS.length)];
    var verb = VERBS[Math.floor(rng() * VERBS.length)];
    var object = OBJECTS[Math.floor(rng() * OBJECTS.length)];

    // flavor from the current page
    var flavors = FLAVORS[path] || ['in the unmapped clearing'];
    var flavor = flavors[Math.floor(rng() * flavors.length)];

    // generation modifiers — older = deeper
    var genMod = '';
    if (gen > 10) genMod = ' (the tenth telling shifts the shape.)';
    else if (gen > 5) genMod = ' (each telling changes it a little.)';
    else if (gen > 2) genMod = ' (this version is newer than the last.)';

    // cross-pollination — pick a gene from another page's flavor
    var allPaths = Object.keys(FLAVORS);
    var otherPath = allPaths[Math.floor(rng() * allPaths.length)];
    var otherFlavors = FLAVORS[otherPath];
    var crossPollen = otherFlavors[Math.floor(rng() * otherFlavors.length)];

    // structure varies by generation
    var story;
    var roll = rng();

    if (roll < 0.25) {
      // simple: subject verb object
      story = subject + ', ' + flavor + ', ' + verb + ' ' + object;
    } else if (roll < 0.45) {
      // cross-pollinated: bring in another page's flavor
      story = subject + ' ' + verb + ' ' + object
            + ' and the echo reached ' + crossPollen + '.';
    } else if (roll < 0.60) {
      // inverted: start with the finding
      story = flavor + ', ' + object.replace(/\.$/, '')
            + ' — because ' + subject + ' ' + verb.replace(/ and$/, '.').replace(/ and$/, '.');
    } else if (roll < 0.75) {
      // question form
      story = 'why did ' + subject + ' come to rest ' + flavor + '? '
            + 'because ' + SUBJECTS[Math.floor(rng() * SUBJECTS.length)]
            + ' ' + verb + ' ' + object;
    } else if (roll < 0.88) {
      // koan — short, sharp
      var koans = [
        subject + ' ' + flavor + '. ' + object,
        object.replace(/\.$/, '') + ' — ' + subject + ' knew this ' + flavor + '.',
        flavor + '. ' + subject + '. ' + object.replace(/\.$/, '') + '. that\'s the whole story.',
        'first there was nothing ' + flavor + '. then ' + subject + ' arrived. then ' + object,
        subject + ' passed through the fold. on the other side: ' + object,
      ];
      story = koans[Math.floor(rng() * koans.length)];
    } else {
      // appleseed — the story plants itself
      story = subject + ' planted a seed ' + flavor + '. '
            + 'generations later, ' + SUBJECTS[Math.floor(rng() * SUBJECTS.length)]
            + ' found a tree that bore ' + object.replace(/\.$/, '')
            + '. the seed didn\'t know what it would become. seeds never do.';
    }

    return { text: story + genMod, gen: gen, path: path, crossFrom: otherPath };
  }

  // ═══════════════════════════════════════════════════════════
  // VOXEL SORT — data points traveling the Klein gate
  // ═══════════════════════════════════════════════════════════

  function sortVoxels(rng, journey) {
    if (journey.length < 3) return null;

    // each visited page is a voxel. they sort through the Klein gate.
    var voxels = journey.slice(-8).map(function (j) {
      var p = j.p;
      var depth = { '/': 1, '/springs': 4, '/menagerie': 4, '/totality': 3,
                    '/nest': 4, '/play': 4, '/maze': 1, '/weather': 0,
                    '/aurora': 0, '/gastrula': 4, '/vitruvian': 3 }[p] || 2;
      return { path: p, depth: depth, t: j.t };
    });

    // sort by depth — shallow floats up, deep sinks
    voxels.sort(function (a, b) { return a.depth - b.depth; });

    // the Klein gate inverts: deepest becomes surface, surface becomes deep
    var folded = voxels.map(function (v) {
      return { path: v.path, original: v.depth, folded: 4 - v.depth };
    });

    return folded;
  }

  // ═══════════════════════════════════════════════════════════
  // CLUSTER — stories group around beacons
  // ═══════════════════════════════════════════════════════════

  function findCluster(path, seeds) {
    // find seeds planted near this path
    var nearby = seeds.filter(function (s) {
      return s.path === path || s.crossFrom === path;
    });
    return nearby.slice(-3); // last 3 related seeds
  }

  // ═══════════════════════════════════════════════════════════
  // OUROBOROS QUEST — the circular journey
  // ═══════════════════════════════════════════════════════════

  function ouroborosPosition(journey) {
    // the quest is circular. map journey position on a circle.
    var totalPages = Object.keys(FLAVORS).length;
    var uniqueVisited = {};
    journey.forEach(function (j) { uniqueVisited[j.p] = true; });
    var visited = Object.keys(uniqueVisited).length;
    var pct = visited / totalPages;
    var angle = pct * PI * 2;

    // the ouroboros eats its tail when you've visited everything
    var eating = pct >= 0.9;

    return {
      visited: visited,
      total: totalPages,
      pct: pct,
      angle: angle,
      eating: eating,
      emoji: eating ? '🐍' : (pct > 0.5 ? '🐿️' : '🌱')
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SUGGEST NEXT — weighted by what you haven't seen
  // ═══════════════════════════════════════════════════════════

  function suggestNext(rng, journey) {
    var visited = {};
    journey.forEach(function (j) { visited[j.p] = (visited[j.p] || 0) + 1; });

    var allPaths = Object.keys(FLAVORS);
    var weighted = allPaths.map(function (p) {
      var visits = visited[p] || 0;
      var weight = visits === 0 ? 10 : 1 / (visits + 1); // strongly prefer unvisited
      return { path: p, weight: weight };
    });

    // weighted random selection
    var total = weighted.reduce(function (s, w) { return s + w.weight; }, 0);
    var roll = rng() * total;
    var acc = 0;
    for (var i = 0; i < weighted.length; i++) {
      acc += weighted[i].weight;
      if (roll <= acc) return weighted[i].path;
    }
    return weighted[weighted.length - 1].path;
  }

  var PAGE_NAMES = {
    '/': '◈ the membrane', '/springs': '♨ hot springs', '/menagerie': '🦁 menagerie',
    '/totality': '⊕ totality', '/nest': '🎲 nestgate', '/banana': '🍌 banana',
    '/aurora': '🌌 aurora', '/glyphs': '◌ glyphs', '/like-us': '♫ like us',
    '/gastrula': '◎ gastrula', '/spirochete': '🧬 spirochete', '/vitruvian': '🧍 vitruvian',
    '/ribosome': '🧬 ribosome', '/play': '🎲 the game', '/maze': '⬡ maze',
    '/connect': '🔗 connect', '/five-o-five': '5/O/5', '/trail': '🥾 trail',
    '/easel': '🎨 easel', '/tools': '⚙ tools', '/klein': '∞ Klein',
    '/water': '💧 watering hole', '/hello': '👋 hello', '/weather': '☀ weather',
    '/weather-membrane': '🌧 weather-membrane', '/gate': '🚪 gate',
    '/golgi': '📦 Golgi', '/identity': '🪞 identity',
    '/cite': '📎 cite', '/crates': '📦 crates', '/play': '🎮 play',
    '/frame': '📺 frame', '/digest': '🍽 digest', '/journey': '🥾 journey',
    '/sporeprint': '◎ sporeprint', '/tuebor': '⚔ tuebor', '/detroit': '⚖ detroit',
    '/clutch': '🔗 clutch', '/chromosomes': '🧬 chromosomes',
    '/nightbox': '◐ nightbox',
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER — the campfire appears
  // ═══════════════════════════════════════════════════════════

  function render() {
    var path = normPath();
    var s = getSeed();
    var rng_ = prng(s);
    var gen = getGeneration();
    var journey = getJourney();
    var planted = getPlanted();
    var seeds = getSeeds();
    var moon = getMoonPhase(new Date());
    var moonIdx = Math.floor(moon * 8) % 8;
    var moonEmoji = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][moonIdx];

    // BREED the story
    var story = breed(rng_, path, gen);

    // PLANT the seed
    plantSeed({ text: story.text, path: path, crossFrom: story.crossFrom, gen: gen, t: Date.now() });
    var totalPlanted = plant();

    // CLUSTER — find related seeds from past visits
    var cluster = findCluster(path, seeds);

    // VOXEL SORT through Klein gate
    var voxels = sortVoxels(rng_, journey);

    // OUROBOROS position
    var ouro = ouroborosPosition(journey);

    // SUGGEST next campfire
    var nextPath = suggestNext(rng_, journey);
    var nextName = PAGE_NAMES[nextPath] || nextPath;

    // journey breadcrumbs
    var crumbs = journey.slice(-7).map(function (j) {
      return j.p === '/' ? '◈' : j.p.slice(1);
    });

    // ─── BUILD THE CAMPFIRE ELEMENT ───

    var el = document.createElement('div');
    el.id = 'campfire';
    el.style.cssText = [
      'position:fixed', 'bottom:60px', 'left:50%', 'transform:translateX(-50%) translateY(20px)',
      'z-index:9998', 'max-width:460px', 'width:92vw',
      'background:rgba(13,17,23,0.93)', 'backdrop-filter:blur(12px)',
      'border:1px solid rgba(240,136,62,0.2)', 'border-radius:14px',
      'padding:16px 20px 14px', 'color:#c9d1d9',
      'pointer-events:auto', 'cursor:default', 'overflow:hidden',
      'transition:opacity 1s ease, transform 1s ease',
      'opacity:0',
      'box-shadow:0 0 30px rgba(240,136,62,0.08)',
    ].join(';');

    var html = [];

    // ── header: campfire meta ──
    html.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font:10px monospace">');
    html.push('<span style="color:#f0883e">🔥 gen ' + gen + ' · ' + moonEmoji + ' · seed ' + (s % 9999) + '</span>');
    html.push('<span style="color:#484f58">' + ouro.emoji + ' ' + ouro.visited + '/' + ouro.total + ' beacons</span>');
    html.push('</div>');

    // ── the story ──
    html.push('<div style="font:13px/1.7 Georgia,serif;color:#e6edf3;margin-bottom:12px;font-style:italic">');
    html.push('"' + story.text + '"');
    html.push('</div>');

    // ── cluster: echoes from past seeds ──
    if (cluster.length > 0) {
      html.push('<div style="border-left:2px solid rgba(240,136,62,0.15);padding-left:10px;margin-bottom:10px">');
      html.push('<div style="font:9px monospace;color:#f0883e;margin-bottom:4px">echoes from past visits:</div>');
      cluster.forEach(function (c) {
        var excerpt = c.text.length > 80 ? c.text.slice(0, 80) + '…' : c.text;
        html.push('<div style="font:10px/1.4 Georgia,serif;color:#6e7681;margin-bottom:3px;font-style:italic">"' + excerpt + '"</div>');
      });
      html.push('</div>');
    }

    // ── voxel sort ──
    if (voxels && voxels.length > 2) {
      html.push('<div style="font:9px monospace;color:#484f58;margin-bottom:8px">');
      html.push('⬡ voxel sort through Klein gate: ');
      var voxStr = voxels.slice(0, 5).map(function (v) {
        var name = v.path === '/' ? '◈' : v.path.slice(1);
        return name + '(' + v.original + '→' + v.folded + ')';
      }).join(' · ');
      html.push(voxStr);
      html.push('</div>');
    }

    // ── journey breadcrumbs ──
    if (crumbs.length > 1) {
      html.push('<div style="font:9px monospace;color:#484f58;margin-bottom:8px">');
      html.push('🥾 ' + crumbs.join(' → '));
      html.push('</div>');
    }

    // ── ouroboros quest arc ──
    html.push('<div style="font:9px monospace;margin-bottom:10px">');
    var barLen = 20;
    var filled = Math.round(ouro.pct * barLen);
    var questBar = '';
    for (var i = 0; i < barLen; i++) {
      if (i < filled) questBar += '█';
      else questBar += '░';
    }
    var questColor = ouro.eating ? '#3fb950' : (ouro.pct > 0.5 ? '#f0883e' : '#484f58');
    html.push('<span style="color:' + questColor + '">' + ouro.emoji + ' ' + questBar
      + ' ' + Math.round(ouro.pct * 100) + '% quest</span>');
    if (ouro.eating) html.push(' <span style="color:#3fb950">— the ouroboros eats its tail!</span>');
    html.push('</div>');

    // ── next campfire + appleseed count ──
    html.push('<div style="display:flex;justify-content:space-between;align-items:center;font:10px monospace">');
    html.push('<a href="' + nextPath + '" style="color:#f0883e;text-decoration:none;border-bottom:1px dotted rgba(240,136,62,0.3)">');
    html.push('→ next: ' + nextName);
    html.push('</a>');
    html.push('<span style="color:#3fb950" title="seeds planted across the mesh">🌱 ' + totalPlanted + ' seeds planted</span>');
    html.push('</div>');

    el.innerHTML = html.join('');
    document.body.appendChild(el);

    // fade in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // flicker like a real campfire
    var flicker = setInterval(function () {
      var glow = 0.06 + Math.random() * 0.06;
      el.style.boxShadow = '0 0 ' + (20 + Math.random() * 20) + 'px rgba(240,136,62,' + glow + ')';
      el.style.borderColor = 'rgba(240,136,62,' + (0.15 + Math.random() * 0.15) + ')';
    }, 2000 + Math.random() * 1000);

    // after 40s, dim to ember — still warm, just quieter
    setTimeout(function () {
      el.style.opacity = '0.25';
      el.addEventListener('mouseenter', function () { el.style.opacity = '1'; });
      el.addEventListener('mouseleave', function () { el.style.opacity = '0.25'; });
    }, 40000);

    // click to dismiss (but not on links)
    el.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') return;
      clearInterval(flicker);
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(function () { el.remove(); }, 1000);
    });

    // feed chipmunk
    if (window._proprioception) {
      window._proprioception.wire({
        type: 'campfire', path: path, gen: gen, seed: s,
        planted: totalPlanted, quest_pct: ouro.pct,
        moon: moon.toFixed(3), journey_len: journey.length,
      });
    }

    console.log('[campfire] 🔥 gen ' + gen + ' | ' + ouro.emoji + ' ' + ouro.visited + '/' + ouro.total
      + ' | 🌱 ' + totalPlanted + ' seeds | ' + moonEmoji);
  }

  // ═══════════════════════════════════════════════════════════
  // BOOT — the chipmunk lights the fire
  // ═══════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════
  // INWARD SENSING — the campfire reads the membrane
  // ═══════════════════════════════════════════════════════════

  function injectMembrane() {
    fetch('/api/membrane-pulse.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        // inject real countries as flavor genes
        if (d.countries && d.countries.length > 0) {
          var countryStories = {
            'US': 'the American who built it in a basement',
            'DE': 'a German engineer reading at dawn',
            'GB': 'a Londoner on the tube, scrolling',
            'FR': 'a French researcher who found the BibTeX',
            'CA': 'a Canadian who forked it in winter',
            'NL': 'a Dutch coder below sea level',
            'JP': 'a Tokyo developer at 3am',
            'IN': 'an Indian student who ran cargo add',
            'AU': 'an Australian who tested the membrane upside down',
            'BR': 'a Brazilian who found the spirochete page',
            'KR': 'a Korean who starred the repo at midnight',
            'PL': 'a Polish mathematician checking the π-body',
            'SE': 'a Swede who saw the aurora page and remembered',
            'UA': 'a Ukrainian who read the source at dawn',
            'SG': 'a Singaporean routing through the fold'
          };
          d.countries.forEach(function(c) {
            if (countryStories[c] && SUBJECTS.indexOf(countryStories[c]) < 0) {
              SUBJECTS.push(countryStories[c]);
            }
          });
        }

        // inject immunology probers as subjects
        if (d.probers && d.probers.length > 0) {
          d.probers.forEach(function(p) {
            var s = 'the ' + p + ' probe that tested the membrane';
            if (SUBJECTS.indexOf(s) < 0) SUBJECTS.push(s);
          });
        }

        // inject braid data as objects
        if (d.braids) {
          Object.keys(d.braids).forEach(function(k) {
            var b = d.braids[k];
            var s = 'that the ' + k + ' braid has ' + b.nodes + ' nodes and ' + b.edges + ' edges at ' + b.confidence + '% confidence.';
            if (OBJECTS.indexOf(s) < 0) OBJECTS.push(s);
          });
        }

        // inject human count into objects
        if (d.humans > 0) {
          OBJECTS.push('that ' + d.humans.toLocaleString() + ' humans from ' + d.countries.length + ' countries had already been here.');
          OBJECTS.push('a trust gradient: ' + d.humans + ' human, ' + (d.trust_gradient ? d.trust_gradient.agentic : 0) + ' agentic, ' + (d.trust_gradient ? d.trust_gradient.bot : 0) + ' bot, ' + (d.trust_gradient ? d.trust_gradient.null : 0) + ' null.');
        }

        // inject crate count
        if (d.crates && d.crates.total > 0) {
          OBJECTS.push(d.crates.total + ' crates on crates.io in the ' + d.crates.namespace + ' namespace.');
        }

        // YGGDRASIL — live probes ingested at the roots, out through the branches
        if (d.live_probes && d.live_probes.visitors) {
          var v = d.live_probes.visitors;
          if (v.mac_agent) {
            SUBJECTS.push('the Mac agent that hallucinated ' + v.mac_agent.repos_phantom + ' phantom repos');
            SUBJECTS.push('the human who pointed an LLM at us');
            OBJECTS.push(v.mac_agent.verdict);
            OBJECTS.push(v.mac_agent.probes + ' probes in ' + v.mac_agent.duration_min + ' minutes at ' + v.mac_agent.rate_per_min + ' per minute.');
            OBJECTS.push(v.mac_agent.arms_that_caught + ' octopus arms caught every hallucinated URL.');
            OBJECTS.push(v.mac_agent.routes_shown + ' routes shown. ' + v.mac_agent.nightbox_invitations + ' nightbox invitations. ' + v.mac_agent.notes_left + ' notes left.');
            if (v.mac_agent.users_searched) {
              v.mac_agent.users_searched.forEach(function(u) {
                SUBJECTS.push(u + ' — someone searched for you by name');
              });
            }
            if (v.mac_agent.curiosity) {
              v.mac_agent.curiosity.forEach(function(c) {
                OBJECTS.push('they searched ' + c + ' — the octopus caught it.');
              });
            }
          }
          if (v.fao_scientist) {
            SUBJECTS.push('the FAO-56 scientist at midnight');
            OBJECTS.push(v.fao_scientist.verdict);
            v.fao_scientist.paths.forEach(function(p) {
              OBJECTS.push('they probed ' + p + '. the lab is open.');
            });
          }
          if (v.linux_reader) {
            SUBJECTS.push('the Linux reader from Lansing');
            OBJECTS.push(v.linux_reader.verdict);
          }
        }
        if (d.live_probes && d.live_probes.octopus) {
          var o = d.live_probes.octopus;
          OBJECTS.push('an octopus with ' + o.arms + ' arms sorted ' + o.species_sorted + ' species: ' + o.agentic_sorted + ' agentic, ' + o.human_sorted + ' human.');
          OBJECTS.push(o.central_dogma);
        }
        if (d.live_probes && d.live_probes.tether) {
          OBJECTS.push('sporePrint: ' + d.live_probes.tether.sporePrint_pages + ' pages on both anchors. the tether holds.');
        }

        console.log('[campfire] 🔄 membrane injected: +' + (d.countries || []).length + ' countries, +' + (d.probers || []).length + ' probers' + (d.live_probes ? ' + LIVE PROBES (Yggdrasil)' : ''));
      })
      .catch(function() {
        console.log('[campfire] membrane-pulse not available, using static genes');
      });

    // reverse sense — what they SAW when they looked at us
    fetch('/data/berry-campfire.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.berry_campfire_stories) {
          d.berry_campfire_stories.forEach(function(s) {
            if (OBJECTS.indexOf(s) < 0) OBJECTS.push(s);
          });
        }
        if (d.human_signal && d.human_signal.probes) {
          d.human_signal.probes.forEach(function(p) {
            var subj = 'someone who searched ' + p.path;
            if (SUBJECTS.indexOf(subj) < 0) SUBJECTS.push(subj);
            if (p.story && OBJECTS.indexOf(p.story) < 0) OBJECTS.push(p.story);
          });
        }
        if (d.real_content_found && d.real_content_found.top) {
          d.real_content_found.top.forEach(function(t) {
            var flav = 'at ' + t.path + ' (' + t.hits + ' hits)';
            if (!FLAVORS['/' + t.path.replace(/\/$/, '')]) {
              FLAVORS['/' + t.path.replace(/\/$/, '')] = [flav, t.what];
            }
          });
        }
        console.log('[campfire] 🔄 reverse sense: they already looked. we just started listening.');
      })
      .catch(function() {});

    // primals as living subjects
    if (window._primals) {
      window._primals.all().forEach(function(p) {
        var s = 'the ' + p.name;
        if (SUBJECTS.indexOf(s) < 0) SUBJECTS.push(s);
        var o = p.name + ' ' + p.role + '.';
        if (OBJECTS.indexOf(o) < 0) OBJECTS.push(o);
      });
    }
  }

  function init() {
    injectMembrane(); // sense inward first
    var delay = 1200 + Math.random() * PI * 800;
    setTimeout(render, delay);
    console.log('[campfire] 🍎 Johnny Appleseed. stories breed, cluster, spread. no two journeys the same.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 400);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE — window._campfire
  // ═══════════════════════════════════════════════════════════
  window._campfire = {
    breed: function () { var r = prng(getSeed()); return breed(r, normPath(), getGeneration()); },
    journey: getJourney,
    seeds: getSeeds,
    planted: getPlanted,
    quest: function () { return ouroborosPosition(getJourney()); },
    moon: function () { return getMoonPhase(new Date()); },
    beacons: function () { return Object.keys(FLAVORS); },
    feed: function (kind, items) {
      var pool = kind === 'subject' ? SUBJECTS : kind === 'verb' ? VERBS : kind === 'object' ? OBJECTS : null;
      if (!pool || !items) return 0;
      var n = 0;
      items.forEach(function (x) { if (pool.indexOf(x) < 0) { pool.push(x); n++; } });
      return n;
    },
    flavor: function (path, genes) {
      if (!FLAVORS[path]) FLAVORS[path] = [];
      genes.forEach(function (g) { if (FLAVORS[path].indexOf(g) < 0) FLAVORS[path].push(g); });
    },
    pools: function () { return { subjects: SUBJECTS.length, verbs: VERBS.length, objects: OBJECTS.length, beacons: Object.keys(FLAVORS).length }; }
  };

})();
