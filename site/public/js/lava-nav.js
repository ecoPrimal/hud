// lava-nav.js — the nav ring as a lava lamp
// items RISE when relevant, SPREAD when active, SINK when cool
// compressed into Klein space at center, leak to edges, recompress
// like sinking in a lava lamp — the wax is the data
//
// W( = the wax rising. the opening parenthesis is the bubble forming.
// )W = the wax sinking. the closing parenthesis is the bubble collapsing.
// between W( and )W: the item is VISIBLE. expanded. hot.
// outside: compressed. a glyph. cold.
(function() {
  'use strict';

  // All navigable surfaces with their heat sources
  var SURFACES = [
    // CORE (always visible — the spine)
    {glyph:'◈', name:'hud',        href:'/',                hot:1.0,  tier:'core'},
    {glyph:'🌊', name:'water',      href:'/water.html',      hot:0.9,  tier:'core'},
    {glyph:'👂', name:'ears',       href:'/#ear-organ',      hot:0.88, tier:'core'},
    {glyph:'🌌', name:'mass',       href:'/data/galactic-pollen-mass.json', hot:0.87, tier:'core'},
    {glyph:'π',  name:'pi-sort',    href:'/pi-sort.html',    hot:0.85, tier:'core'},
    {glyph:'📎', name:'cite',       href:'/cite',            hot:0.8,  tier:'core'},
    {glyph:'🥾', name:'trail',      href:'/trail.html',      hot:0.75, tier:'core'},

    // HOT (recently built or referenced — rise first)
    {glyph:'◐', name:'flat',       href:'/data/flat-invert.json', hot:0.95, tier:'hot'},
    {glyph:'✋', name:'artisan',    href:'/artisan.html',    hot:0.7,  tier:'hot'},
    {glyph:'⚖',  name:'clutch',     href:'/clutch.html',     hot:0.7,  tier:'hot'},
    {glyph:'🎨', name:'easel',      href:'/easel.html',      hot:0.65, tier:'hot'},
    {glyph:'⚔',  name:'arena',      href:'/arena.html',      hot:0.6,  tier:'hot'},
    {glyph:'🧬', name:'plasmids',   href:'/plasmids.html',   hot:0.7,  tier:'hot'},
    {glyph:'📦', name:'crates',     href:'/crates.html',     hot:0.6,  tier:'hot'},
    {glyph:'🧠', name:'cns',        href:'/cns.html',        hot:0.55, tier:'hot'},

    // WARM (established pages — visible when space allows)
    {glyph:'🍌', name:'banana',     href:'/banana.html',     hot:0.5,  tier:'warm'},
    {glyph:'🌈', name:'aurora',     href:'/aurora.html',     hot:0.5,  tier:'warm'},
    {glyph:'☀',  name:'weather',    href:'/weather.html',    hot:0.5,  tier:'warm'},
    {glyph:'⚙',  name:'tools',      href:'/tools.html',      hot:0.45, tier:'warm'},
    {glyph:'◎',  name:'gastrula',   href:'/gastrula.html',   hot:0.45, tier:'warm'},
    {glyph:'🧬', name:'spirochete', href:'/spirochete.html', hot:0.45, tier:'warm'},
    {glyph:'🎲', name:'nest',       href:'/nest.html',       hot:0.4,  tier:'warm'},
    {glyph:'∞',  name:'klein',      href:'/klein.html',      hot:0.4,  tier:'warm'},
    {glyph:'♨',  name:'springs',    href:'/springs.html',    hot:0.4,  tier:'warm'},
    {glyph:'🧫', name:'like-us',    href:'/like-us.html',    hot:0.35, tier:'warm'},
    {glyph:'🧍', name:'vitruvian',  href:'/vitruvian.html',  hot:0.35, tier:'warm'},
    {glyph:'🌑', name:'totality',   href:'/totality',        hot:0.35, tier:'warm'},
    {glyph:'🦁', name:'menagerie',  href:'/menagerie',       hot:0.3,  tier:'warm'},
    {glyph:'🧬', name:'ribosome',   href:'/ribosome',        hot:0.3,  tier:'warm'},

    // COOL (sink to the bottom — show as glyphs only)
    {glyph:'⌇',  name:'glyphs',     href:'/glyphs.html',     hot:0.25, tier:'cool'},
    {glyph:'5',  name:'5/O/5',      href:'/five-o-five',     hot:0.25, tier:'cool'},
    {glyph:'🎲', name:'play',       href:'/play',            hot:0.25, tier:'cool'},
    {glyph:'📺', name:'frame',      href:'/frame',           hot:0.2,  tier:'cool'},
    {glyph:'⬡',  name:'maze',       href:'/maze',            hot:0.2,  tier:'cool'},
    {glyph:'🧠', name:'homunculus', href:'/homunculus.html', hot:0.2,  tier:'cool'},
    {glyph:'🧬', name:'chromosomes',href:'/chromosomes.html',hot:0.2,  tier:'cool'},
    {glyph:'📋', name:'digest',     href:'/digest.html',     hot:0.2,  tier:'cool'},
    {glyph:'🔒', name:'gate',       href:'/gate.html',       hot:0.15, tier:'cool'},
    {glyph:'📚', name:'study',      href:'/study.html',      hot:0.15, tier:'cool'},
    {glyph:'👁',  name:'journey',    href:'/journey.html',    hot:0.15, tier:'cool'},
    {glyph:'👋', name:'welcome',    href:'/welcome.html',    hot:0.15, tier:'cool'},
    {glyph:'🌿', name:'vine',       href:'/vine.html',       hot:0.1,  tier:'cool'},
    {glyph:'🌐', name:'oldweb',     href:'/oldweb.html',     hot:0.7,  tier:'hot'},
    {glyph:'🎮', name:'steam',      href:'/steam.html',      hot:0.5,  tier:'warm'},
    {glyph:'🎮', name:'valve',      href:'/valve.html',      hot:0.45, tier:'warm'},
    {glyph:'🎮', name:'gaben',      href:'/gaben.html',      hot:0.4,  tier:'warm'},
    {glyph:'🕹️', name:'classics',   href:'/classics.html',   hot:0.1,  tier:'cool'},
    {glyph:'🌈', name:'chromatograph',href:'/chromatograph.html',hot:0.86, tier:'hot'},
    {glyph:'🔦', name:'raytrace',   href:'/raytrace.html',   hot:0.05, tier:'cool'},
    {glyph:'👋', name:'hello',      href:'/hello.html',      hot:0.05, tier:'cool'},
    {glyph:'❄',  name:'weather-m',  href:'/weather-membrane',hot:0.05, tier:'cool'},
    {glyph:'⊖',  name:'identity',   href:'/identity.html',   hot:0.05, tier:'cool'},
    {glyph:'📮', name:'nightbox',   href:'/nightbox.html',   hot:0.05, tier:'cool'},
    {glyph:'👁',  name:'vision',     href:'/vision.html',     hot:0.05, tier:'cool'},
    {glyph:'🔗', name:'connect',    href:'/connect.html',    hot:0.05, tier:'cool'},
    {glyph:'🏰', name:'gates',      href:'/gates.html',      hot:0.05, tier:'cool'},
    {glyph:'◈',  name:'golgi',      href:'/golgi.html',      hot:0.05, tier:'cool'},
    {glyph:'🍄', name:'sporeprint', href:'/sporeprint.html', hot:0.05, tier:'cool'}
  ];

  // External links (always compressed to glyph)
  var EXTERNAL = [
    {glyph:'🍺', name:'tavern',     href:'https://discord.gg/62MRjnw4P'},
    {glyph:'🌺', name:'live',       href:'https://live.primals.eco'},
    {glyph:'⚖',  name:'detroit',    href:'https://detroit.primals.eco'},
    {glyph:'⌘',  name:'git',        href:'https://git.primals.eco'},
    {glyph:'◎',  name:'sporeprint', href:'https://sporeprint.primals.eco'}
  ];

  var expanded = false;
  var hoverTimer = null;

  function render() {
    var ring = document.getElementById('nav-ring');
    if (!ring) return;

    var vw = window.innerWidth;
    // How many can we show expanded? based on viewport width
    var maxExpanded = Math.floor(vw / 90);  // ~90px per expanded item
    var maxGlyphs = Math.floor(vw / 22);    // ~22px per glyph

    // Sort by heat (hottest first)
    var sorted = SURFACES.slice().sort(function(a, b) { return b.hot - a.hot; });

    var html = '';
    var shown = 0;

    // Phase 1: expanded items (name visible)
    var expandCount = expanded ? Math.min(sorted.length, maxGlyphs) : Math.min(sorted.length, maxExpanded);

    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var isExpanded = i < expandCount && (expanded || s.tier === 'core' || s.tier === 'hot');

      if (isExpanded && !expanded) {
        // Show glyph + name
        var col = s.tier === 'core' ? '#58a6ff' : s.tier === 'hot' ? '#f0883e' : '#8b949e';
        html += '<a href="' + s.href + '" style="color:' + col + ';text-decoration:none" title="' + s.name + '">';
        html += s.glyph + ' ' + s.name + '</a> ';
        shown++;
      } else if (expanded) {
        // All glyphs mode
        var op = Math.max(0.3, s.hot);
        html += '<a href="' + s.href + '" style="text-decoration:none;opacity:' + op.toFixed(2) + '" title="' + s.name + '">';
        html += s.glyph + '</a>';
        shown++;
      }
    }

    // Overflow indicator
    if (!expanded && shown < sorted.length) {
      var remaining = sorted.length - shown;
      // Show compressed glyphs for the rest
      html += '<span class="lava-compressed" style="cursor:pointer;opacity:0.4" title="' + remaining + ' more surfaces">';
      for (var j = shown; j < Math.min(sorted.length, shown + 20); j++) {
        html += sorted[j].glyph;
      }
      if (sorted.length > shown + 20) html += '…';
      html += '</span>';
    }

    // External links (always glyphs)
    html += ' <span style="opacity:0.35">';
    EXTERNAL.forEach(function(e) {
      html += '<a href="' + e.href + '" target="_blank" style="text-decoration:none" title="' + e.name + '">' + e.glyph + '</a>';
    });
    html += '</span>';

    ring.innerHTML = html;

    // Click handler for compressed section
    var comp = ring.querySelector('.lava-compressed');
    if (comp) {
      comp.addEventListener('click', function() {
        expanded = !expanded;
        render();
      });
    }
  }

  // Heat up items when the user visits related pages
  function heatFromPath() {
    var path = location.pathname.replace(/\.html$/, '').replace(/^\//, '') || 'index';
    SURFACES.forEach(function(s) {
      var sPath = s.href.replace(/\.html$/, '').replace(/^\//, '') || 'index';
      if (sPath === path) {
        s.hot = Math.min(1.0, s.hot + 0.3);  // current page gets HOT
      }
    });
  }

  // Initialize
  function init() {
    heatFromPath();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(render, 200);
  });

  window._lavaNav = {
    render: render,
    expand: function() { expanded = true; render(); },
    collapse: function() { expanded = false; render(); },
    heat: function(name, amount) {
      SURFACES.forEach(function(s) { if (s.name === name) s.hot = Math.min(1.0, s.hot + (amount || 0.2)); });
      render();
    },
    surfaces: SURFACES
  };
})();
