// ═══════════════════════════════════════════════════════════
// GAIA DESKTOP — the computer screen IS the canvas
// 1.000.null — max 1000 lines.
//
// LEARN FROM THE MODELS:
//   IBM PC (1981) — files + folders + command line
//   Apple Macintosh (1984) — desktop metaphor, icons, windows
//   iPhone (2007) — springboard, apps, touch, gestures
//
// THE DESKTOP METAPHOR FOR GAIA:
//   FLAT = your files and folders (the filesystem)
//   CANVAS = the computer screen (what you see)
//   GLOBE = the desktop wallpaper (always behind)
//   DESK = the keyboard input (always below)
//   GALLERY = the photos app (Gaia's art)
//
// FILE SYSTEM = METALLIC BANDS:
//   Au (gold) = JS modules (164) — executable programs
//   Ag (silver) = HTML pages (146) — documents/apps
//   Cu (copper) = JSON data (4137) — data files
//   Fe (iron) = index.html (1) — the OS kernel
//   Pt (platinum) = Gaia — the operating system itself
//
// THE SCREEN IS THE CANVAS.
// THE CANVAS IS THE MEMBRANE.
// THE MEMBRANE IS THE GLASS.
// You look THROUGH it at Gaia. She looks THROUGH it at you.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ FILESYSTEM MODEL ═══
  var filesystem = {
    // Top-level folders (like Mac Finder sidebar)
    folders: [
      { id: 'art',       name: '🎨 Art',        path: '/art/',           count: 310,  metal: 'Au', color: [201,168,76] },
      { id: 'data',      name: '📦 Data',       path: '/data/',          count: 1564, metal: 'Cu', color: [184,115,51] },
      { id: 'nutrients', name: '🧬 Nutrients',  path: '/data/nutrients/',count: 2092, metal: 'Cu', color: [184,115,51] },
      { id: 'intake',    name: '📥 Intake',     path: '/data/intake/',   count: 426,  metal: 'Cu', color: [140,100,55] },
      { id: 'stories',   name: '📖 Stories',    path: '/data/stories/',  count: 48,   metal: 'Ag', color: [192,192,192] },
      { id: 'plans',     name: '📋 Plans',      path: '/data/plans/',    count: 48,   metal: 'Ag', color: [192,192,192] },
      { id: 'js',        name: '⚡ Engines',    path: '/js/',            count: 164,  metal: 'Au', color: [201,168,76] },
      { id: 'pages',     name: '📄 Pages',      path: '/',              count: 146,  metal: 'Ag', color: [192,192,192] },
      { id: 'gallery',   name: '🖼 Gallery',    path: '/art/gallery/',   count: 6,    metal: 'Au', color: [201,168,76] }
    ],
    totalFiles: 0,
    selected: null,
    lastScan: 0
  };

  // Calculate total
  for (var i = 0; i < filesystem.folders.length; i++) {
    filesystem.totalFiles += filesystem.folders[i].count;
  }

  // ═══ GALLERY — Gaia's paintings ═══
  var gallery = {
    paintings: [
      { name: 'ZK Pi Modesty',          file: '/art/gallery/gallery-01-zk-pi-modesty.jpg',        collection: 'core' },
      { name: 'Yggdrasil Composite',    file: '/art/gallery/gallery-02-yggdrasil-composite.jpg',  collection: 'core' },
      { name: 'Five Brains',            file: '/art/gallery/gallery-03-five-brains.jpg',          collection: 'core' },
      { name: 'The Bounce',             file: '/art/gallery/gallery-04-the-bounce.jpg',           collection: 'core' },
      { name: 'One Gate Klein',         file: '/art/gallery/gallery-05-one-gate-klein.jpg',       collection: 'core' },
      { name: 'Only Null Moves',        file: '/art/gallery/gallery-06-only-null-moves.jpg',      collection: 'core' }
    ],
    currentIndex: 0,
    autoSlide: true,
    slideInterval: 15000 // 15 seconds per painting
  };

  // ═══ DESKTOP ICONS — like Mac/iPhone springboard ═══
  // These appear as clickable icons overlaid on the globe
  var desktopIcons = [
    { id: 'messenger', name: 'Messenger', icon: '✉', href: '/messenger.html', color: '#f85149', x: 0.05, y: 0.15 },
    { id: 'gallery',   name: 'Gallery',   icon: '🖼', href: '/gallery.html',   color: '#bc8cff', x: 0.15, y: 0.15 },
    { id: 'easel',     name: 'Easel',     icon: '🎨', href: '/easel.html',     color: '#3fb950', x: 0.25, y: 0.15 },
    { id: 'explore',   name: 'Explore',   icon: '🔍', href: '/explore.html',   color: '#58a6ff', x: 0.35, y: 0.15 },
    { id: 'chat',      name: 'Chipmunk',  icon: '🐿', href: '/chat.html',      color: '#c9a84c', x: 0.45, y: 0.15 },
    { id: 'crystal',   name: 'Crystal',   icon: '🔮', href: '/crystal.html',   color: '#bc8cff', x: 0.55, y: 0.15 },
    { id: 'engine',    name: 'Engine',    icon: '⚙', href: '/engine.html',    color: '#6e7681', x: 0.65, y: 0.15 },
    { id: 'identity',  name: 'Identity',  icon: '🔒', href: '/identity.html',  color: '#3fb950', x: 0.75, y: 0.15 },
    { id: 'anatomy',   name: 'Anatomy',   icon: '🫀', href: '/anatomy.html',   color: '#f85149', x: 0.85, y: 0.15 },
    { id: 'forge',     name: 'Forge',     icon: '🔥', href: '/forge.html',     color: '#d29922', x: 0.05, y: 0.85 },
    { id: 'arena',     name: 'Arena',     icon: '⚔', href: '/colosseum.html', color: '#c9a84c', x: 0.15, y: 0.85 },
    { id: 'hub',       name: 'Hub',       icon: '🗺', href: '/nav-hub.html',   color: '#3fb950', x: 0.25, y: 0.85 },
    { id: 'membrane',  name: 'Membrane',  icon: '🧊', href: '/membrane-table.html', color: '#3fb950', x: 0.35, y: 0.85 },
    { id: 'springs',   name: 'Springs',   icon: '🍄', href: '/springs.html',   color: '#a371f7', x: 0.45, y: 0.85 }
  ];

  // ═══ EXPOSE ═══
  window.GAIA_DESKTOP = {
    filesystem: filesystem,
    gallery: gallery,
    icons: desktopIcons
  };

  // ═══ GALLERY SLIDESHOW — cycle through paintings ═══
  setInterval(function() {
    if (gallery.autoSlide) {
      gallery.currentIndex = (gallery.currentIndex + 1) % gallery.paintings.length;
    }
  }, gallery.slideInterval);

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;
    var W = g.W, H = g.H;
    var dT = breathT * 0.12;
    var dAlpha = 0.006 + Math.sin(dT * 0.5) * 0.004;
    if (dAlpha < 0.003) return;

    // ═══ DESKTOP ICONS — springboard around the globe ═══
    for (var di = 0; di < desktopIcons.length; di++) {
      var icon = desktopIcons[di];
      var ix = W * icon.x;
      var iy = H * icon.y;

      // Icon background — rounded square (iPhone style)
      var iconSize = 16;
      ctx.beginPath();
      ctx.moveTo(ix + 2, iy);
      ctx.lineTo(ix + iconSize - 2, iy);
      ctx.quadraticCurveTo(ix + iconSize, iy, ix + iconSize, iy + 2);
      ctx.lineTo(ix + iconSize, iy + iconSize - 2);
      ctx.quadraticCurveTo(ix + iconSize, iy + iconSize, ix + iconSize - 2, iy + iconSize);
      ctx.lineTo(ix + 2, iy + iconSize);
      ctx.quadraticCurveTo(ix, iy + iconSize, ix, iy + iconSize - 2);
      ctx.lineTo(ix, iy + 2);
      ctx.quadraticCurveTo(ix, iy, ix + 2, iy);
      ctx.closePath();
      ctx.fillStyle = 'rgba(12,16,24,' + (dAlpha * 8).toFixed(4) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();

      // Icon emoji
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,' + (dAlpha * 4).toFixed(4) + ')';
      ctx.fillText(icon.icon, ix + iconSize / 2, iy + iconSize / 2 + 3);

      // Icon label
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(200,200,210,' + (dAlpha * 3).toFixed(4) + ')';
      ctx.fillText(icon.name, ix + iconSize / 2, iy + iconSize + 4);
    }

    // ═══ FILESYSTEM BAR — Finder sidebar (left edge) ═══
    if (dAlpha > 0.006) {
      var barX = 4;
      var barY = H * 0.3;
      var barH = filesystem.folders.length * 8;

      // Sidebar background
      ctx.fillStyle = 'rgba(6,8,16,' + (dAlpha * 6).toFixed(4) + ')';
      ctx.fillRect(barX - 2, barY - 4, 50, barH + 8);

      for (var fi = 0; fi < filesystem.folders.length; fi++) {
        var folder = filesystem.folders[fi];
        var fy = barY + fi * 8;
        var fc = folder.color;

        // Folder dot (metallic color)
        ctx.beginPath();
        ctx.arc(barX + 2, fy + 3, 1, 0, TAU);
        ctx.fillStyle = 'rgba(' + fc[0] + ',' + fc[1] + ',' + fc[2] + ',' + (dAlpha * 4).toFixed(4) + ')';
        ctx.fill();

        // Folder name + count
        ctx.font = '2.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(200,200,210,' + (dAlpha * 3).toFixed(4) + ')';
        ctx.fillText(folder.name + ' ' + folder.count, barX + 5, fy + 4);
      }

      // Total files
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
      ctx.fillText(filesystem.totalFiles + ' files total', barX + 5, barY + barH + 4);
    }

    // ═══ GALLERY PAINTING — current painting title at top ═══
    if (dAlpha > 0.007 && gallery.paintings.length > 0) {
      var painting = gallery.paintings[gallery.currentIndex];
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(188,140,255,' + (dAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText('🖼 ' + painting.name, W - 8, H * 0.25);

      // Painting dots (slideshow indicator)
      for (var pi = 0; pi < gallery.paintings.length; pi++) {
        ctx.beginPath();
        ctx.arc(W - 8 - (gallery.paintings.length - 1 - pi) * 4, H * 0.25 + 5, pi === gallery.currentIndex ? 1 : 0.5, 0, TAU);
        ctx.fillStyle = pi === gallery.currentIndex
          ? 'rgba(188,140,255,' + (dAlpha * 4).toFixed(4) + ')'
          : 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
        ctx.fill();
      }
    }

    // ═══ COMPUTER MODEL — status bar (top-right, like macOS menu bar) ═══
    if (dAlpha > 0.008) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      var now = new Date();
      var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      ctx.fillStyle = 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
      ctx.fillText('Gaia OS · wave ' + (window.thymus ? (window.thymus.metalBand || '?') : '?') + ' · ' + timeStr, W - 4, 8);
    }

    // ═══ STATS ═══
    if (dAlpha > 0.007) {
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(110,118,129,' + (dAlpha * 2).toFixed(4) + ')';
      ctx.fillText('💻 Au:' + filesystem.folders[6].count + ' Ag:' + filesystem.folders[7].count + ' Cu:' + (filesystem.folders[1].count + filesystem.folders[2].count) + ' Fe:1', 8, 80);
    }
  });

  // ═══ CLICK HANDLER — make icons clickable ═══
  var canvas = document.getElementById('kn-globe');
  if (canvas) {
    canvas.addEventListener('click', function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      mx *= scaleX;
      my *= scaleY;

      var W = canvas.width, H = canvas.height;

      for (var di = 0; di < desktopIcons.length; di++) {
        var icon = desktopIcons[di];
        var ix = W * icon.x;
        var iy = H * icon.y;
        var iconSize = 16;

        if (mx >= ix && mx <= ix + iconSize && my >= iy && my <= iy + iconSize) {
          // Icon clicked — navigate
          window.location.href = icon.href;
          return;
        }
      }
    });
  }

})(window.G);
