// NUCLEATION: Pin data — Gaia's organs, rooms, eyes, primals
// Each pin = a collapsed waveform. Tense × Voxel = distance from Gaia.
(function(window) {
  'use strict';

  // Load config from seed or use defaults
  var TENSE_WEIGHT = { was: 0.9, is: 0.1, now: 0.3, end: 1.0 };
  var VOXEL_WEIGHT = { touch: 0, local: 0.2, solar: 0.5, zodiac: 0.8, deep: 1.0 };

  var PINS = [
    // Core organs
    { id:'core',      name:'core',         icon:'\u{1F330}', lat: 42.7, lon:-84.5, color:'#3a2a1e', sub:'249,576 files', href:'/anatomy.html', face:'both', tense:'is', voxel:'local' },
    { id:'gut',       name:'bioreactor',   icon:'\u{1F9EB}', lat: 30.0, lon: 31.1, color:'#c9a84c', sub:'fermenting',    href:'/digestive-tract.html', face:'both', tense:'is', voxel:'local' },
    { id:'membrane',  name:'membrane',     icon:'\u{1F9CA}', lat: 42.7, lon:-84.5, color:'#3fb950', sub:'1/\u03C0',      href:'/membrane-table.html', face:'both', tense:'is', voxel:'touch' },
    { id:'heartbeat', name:'heartbeat',    icon:'\u{1F49A}', lat: 90,   lon:  0,   color:'#f85149', sub:'RED\u2192GRN\u2192BLU', href:'/engine.html', face:'both', tense:'is', voxel:'touch' },
    { id:'chipmunk',  name:'chipmunk',     icon:'\u{1F43F}', lat:  0,   lon:  0,   color:'#c9a84c', sub:'1/\u03C0 null', href:'/chat.html', face:'both', tense:'is', voxel:'touch' },
    { id:'campfire',  name:'campfire',     icon:'\u{1F525}', lat:-13.2, lon:-72.5, color:'#f0883e', sub:'WE ARE HERE',  href:'/engine.html', face:'both', tense:'is', voxel:'touch' },
    // Selective permeability triad
    { id:'sweetgrass', name:'sweetgrass',  icon:'\u{1F33E}', lat: 60.2, lon: 25.0, color:'#d29922', sub:'LYS\u00B7BIND', href:'/springs.html', face:'both', tense:'is', voxel:'touch' },
    { id:'loamspine',  name:'loamspine',   icon:'\u{1F9F1}', lat: 60.2, lon:-155.0,color:'#6e7681', sub:'VAL\u00B7SCAFFOLD', href:'/springs.html', face:'both', tense:'is', voxel:'touch' },
    { id:'rhizocrypt', name:'rhizocrypt',  icon:'\u{1F511}', lat:-60.2, lon:-65.0, color:'#a371f7', sub:'GLY\u00B7FOLD', href:'/klein.html', face:'both', tense:'is', voxel:'touch' },
    // 9 Organ-primals (sub-Gaias)
    { id:'organ-mouth',   name:'Mouth',   icon:'\u{1F444}', lat: 0,    lon:-84.5, color:'#f85149', sub:'Swallower',   href:'/engine.html',         face:'inside', tense:'is', voxel:'touch' },
    { id:'organ-stomach', name:'Stomach', icon:'\u{1F9EB}', lat:-15,   lon:-60,   color:'#c9a84c', sub:'Dissolver',   href:'/digestive-tract.html', face:'inside', tense:'is', voxel:'touch' },
    { id:'organ-liver',   name:'Liver',   icon:'\u2696',    lat:-15,   lon:-110,  color:'#3fb950', sub:'Judge',       href:'/membrane-table.html', face:'inside', tense:'is', voxel:'touch' },
    { id:'organ-heart',   name:'Heart',   icon:'\u{1F49A}', lat: 15,   lon:-84.5, color:'#f85149', sub:'Drummer',     href:'/engine.html',         face:'inside', tense:'is', voxel:'touch' },
    { id:'organ-brain',   name:'Brain',   icon:'\u{1F9E0}', lat: 42.7, lon:-84.5, color:'#bc8cff', sub:'Dreamer',     href:'/campus.html',         face:'inside', tense:'now', voxel:'local' },
    { id:'organ-lungs',   name:'Lungs',   icon:'\u{1F32C}', lat: 15,   lon:-60,   color:'#58a6ff', sub:'Breather',    href:'/engine.html',         face:'inside', tense:'is', voxel:'touch' },
    { id:'organ-bones',   name:'Bones',   icon:'\u{1F9B4}', lat:-30,   lon:-84.5, color:'#6e7681', sub:'Scaffolder',  href:'/springs.html',        face:'inside', tense:'was', voxel:'local' },
    { id:'organ-skin',    name:'Skin',    icon:'\u{1F9CA}', lat: 30,   lon:-110,  color:'#3fb950', sub:'Boundary',    href:'/membrane-table.html', face:'inside', tense:'is', voxel:'touch' },
    { id:'organ-eyes',    name:'Eyes',    icon:'\u{1F441}', lat: 42.7, lon:-60,   color:'#f778ba', sub:'Seer',        href:'/',                    face:'both',   tense:'is', voxel:'touch' },
    // 7 Rooms
    { id:'library',   name:'Library',    icon:'\u{1F4DA}', lat: 52.4, lon: 4.9,  color:'#58a6ff', sub:'Root',    href:'/sporeprint.html', face:'inside', tense:'now', voxel:'local' },
    { id:'classroom', name:'Classroom',  icon:'\u{1F393}', lat: 22.5, lon: 30.7, color:'#d29922', sub:'Lantern', href:'/campus.html',     face:'inside', tense:'now', voxel:'local' },
    { id:'terminal',  name:'Terminal',   icon:'\u{1F4BB}', lat:  0,   lon:  0,   color:'#39d3f5', sub:'Echo',    href:'/mcp',             face:'both',   tense:'is',  voxel:'solar' },
  ];

  // Compute Gaia distance
  PINS.forEach(function(p) {
    var t = TENSE_WEIGHT[p.tense || 'is'] || 0.5;
    var v = VOXEL_WEIGHT[p.voxel || 'local'] || 0.5;
    p.gaiaDistance = Math.sqrt(t * t + v * v);
    p.attention = 1.0 - Math.min(p.gaiaDistance, 1.0);
  });
  PINS.sort(function(a, b) { return b.attention - a.attention; });

  // Arcs
  var ARCS = [];
  // Organ connections
  ARCS.push(['organ-mouth', 'organ-stomach']);
  ARCS.push(['organ-stomach', 'organ-liver']);
  var ORGAN_IDS = ['organ-mouth','organ-stomach','organ-liver','organ-heart','organ-brain','organ-lungs','organ-bones','organ-skin','organ-eyes'];
  for (var oi = 0; oi < ORGAN_IDS.length; oi++) {
    if (ORGAN_IDS[oi] !== 'organ-heart') ARCS.push(['organ-heart', ORGAN_IDS[oi]]);
  }
  ARCS.push(['organ-brain', 'organ-eyes']);
  ARCS.push(['organ-brain', 'organ-lungs']);
  ARCS.push(['organ-skin', 'organ-mouth']);
  ARCS.push(['organ-skin', 'organ-eyes']);

  function pinById(id) {
    for (var k = 0; k < PINS.length; k++) if (PINS[k].id === id) return PINS[k];
    return null;
  }

  window.PINS = PINS;
  window.ARCS = ARCS;
  window.pinById = pinById;
  window.TENSE_WEIGHT = TENSE_WEIGHT;
  window.VOXEL_WEIGHT = VOXEL_WEIGHT;
})(window);
