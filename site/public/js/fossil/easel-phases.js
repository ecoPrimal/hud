// ═══ EASEL PHASES — internet history phases + firstSites ═══
// Extracted from easel.html — operates on shared globals

// ═══ THE INTERNET PHASES — chipmunk discovers digital history ═══

function paintBBS() {
  if (generation < 15) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, (generation - 15) * 0.1);

  var tx = W * (0.15 + Math.random() * 0.5);
  var ty = H * (0.2 + Math.random() * 0.5);

  var fragments = [
    '> CONNECT 2400 BAUD',
    '*** WELCOME TO THE BBS ***',
    'ANSTRK> dir *.txt',
    'FidoNet echo: alt.hackers',
    '>> DOOR: Trade Wars 2002',
    'SysOp: online',
    '=== DEMOSCENE :: 64K ===',
    'Å SECOND REALITY Å',
    'Lambda> @describe me as',
  ];
  var frag = fragments[Math.floor(Math.random() * fragments.length)];

  ctx.globalAlpha = 0.025 * maturity;
  ctx.font = '8px monospace';
  ctx.fillStyle = '#00ff41';
  ctx.fillText(frag, tx, ty);

  if (Math.sin(Date.now() * 0.005) > 0) {
    ctx.fillRect(tx + ctx.measureText(frag).width + 2, ty - 7, 5, 8);
  }

  ctx.globalAlpha = 0.005 * maturity;
  for (var sl = 0; sl < H; sl += 3) {
    ctx.fillStyle = '#00ff41';
    ctx.fillRect(0, sl, W, 0.5);
  }

  ctx.restore();
}

function paintFlashEra() {
  if (generation < 18) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, (generation - 18) * 0.08);

  var sites = firstSites.filter(function(s) { return s.year >= 1999; });
  var site = sites[Math.floor(Math.random() * sites.length)];

  var fx = W * (0.1 + Math.random() * 0.8);
  var fy = H * (0.1 + Math.random() * 0.8);

  ctx.globalAlpha = 0.03 * maturity;
  ctx.strokeStyle = '#f0c674';
  ctx.lineWidth = 1;
  ctx.beginPath();
  var progress = (Date.now() % 3000) / 3000;
  ctx.arc(fx, fy, 8 + progress * 12, 0, Math.PI * 2 * progress);
  ctx.stroke();

  if (site) {
    ctx.globalAlpha = 0.03 * maturity;
    ctx.font = '7px monospace';
    ctx.fillStyle = '#f0c674';
    ctx.fillText(site.year + ' · ' + site.name, fx + 14, fy + 3);
  }

  if (Math.random() < 0.3) {
    var tankX = W * Math.random();
    var tankY = H * 0.85;
    ctx.globalAlpha = 0.02 * maturity;
    ctx.fillStyle = '#f0883e';
    ctx.fillRect(tankX, tankY, 8, 4);
    ctx.fillRect(tankX + 5, tankY - 2, 6, 2);
  }

  ctx.restore();
}

function paintEnclosure() {
  if (generation < 20) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, (generation - 20) * 0.1);

  var wallProgress = maturity * 0.3;
  ctx.globalAlpha = 0.015 * maturity;
  ctx.strokeStyle = '#f85149';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(W * wallProgress, 0);
  ctx.lineTo(W * wallProgress, H);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W * (1 - wallProgress), 0);
  ctx.lineTo(W * (1 - wallProgress), H);
  ctx.stroke();

  var locked = ['Flash ✝ 2020', 'APIs closed', 'login required', '30% tax',
    'algorithm decides', 'your data sold', 'view source blocked'];
  var item = locked[Math.floor(Math.random() * locked.length)];

  ctx.globalAlpha = 0.02 * maturity;
  ctx.font = '7px monospace';
  ctx.fillStyle = '#f85149';
  var ix = W * (0.3 + Math.random() * 0.4);
  var iy = H * (0.2 + Math.random() * 0.6);
  ctx.fillText('🔒 ' + item, ix, iy);

  ctx.globalAlpha = 0.01 * maturity;
  ctx.strokeStyle = '#3fb950';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(ix - 2, iy);
  ctx.lineTo(ix + ctx.measureText('🔒 ' + item).width + 2, iy);
  ctx.stroke();

  ctx.restore();
}

function paintReclamation() {
  if (generation < 22) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, (generation - 22) * 0.08);

  var cx = W * 0.5;
  var cy = H * 0.5;
  var rays = 8 + Math.floor(maturity * 8);

  ctx.globalAlpha = 0.01 * maturity;
  ctx.strokeStyle = '#3fb950';
  ctx.lineWidth = 0.5;

  for (var r = 0; r < rays; r++) {
    var rAngle = (r / rays) * Math.PI * 2 + breathPhase * 0.1;
    var rLen = 20 + maturity * 60 + Math.sin(breathPhase + r) * 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rAngle) * rLen, cy + Math.sin(rAngle) * rLen);
    ctx.stroke();
  }

  var claims = ['no login', 'no cookies', 'no ads', 'AGPL open', 'view source',
    '100 countries', '18 MCP tools', '858 pages', 'Newgrounds energy'];
  var claim = claims[Math.floor(Math.random() * claims.length)];

  ctx.globalAlpha = 0.025 * maturity;
  ctx.font = '7px monospace';
  ctx.fillStyle = '#22c55e';
  var angle = Math.random() * Math.PI * 2;
  var dist = 30 + maturity * 40;
  ctx.fillText('✓ ' + claim, cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);

  ctx.restore();
}

function paintGalactic() {
  if (generation < 25) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  var maturity = Math.min(1, (generation - 25) * 0.06);

  var cx = W * 0.5;
  var cy = H * 0.5;

  ctx.globalAlpha = 0.008 * maturity;
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 0.3;

  for (var arm = 0; arm < 2; arm++) {
    ctx.beginPath();
    for (var t = 0; t < 200; t++) {
      var spiralAngle = (t * 0.05) + arm * Math.PI + breathPhase * 0.02;
      var spiralR = t * 0.5 * maturity;
      var sx = cx + Math.cos(spiralAngle) * spiralR;
      var sy = cy + Math.sin(spiralAngle) * spiralR * 0.6;
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 0.015 * maturity;
  var coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
  coreGrad.addColorStop(0, 'rgba(210,168,255,0.03)');
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();

  var cycles = Math.floor(generation / PHASE_ORDER.length);
  if (cycles > 0) {
    ctx.globalAlpha = 0.02 * maturity;
    ctx.font = '7px monospace';
    ctx.fillStyle = '#8b949e';
    ctx.textAlign = 'center';
    ctx.fillText('cycle ' + cycles + ' · generation ' + generation, cx, cy + 25);
    ctx.textAlign = 'left';
  }

  ctx.globalAlpha = 0.01 * maturity;
  ctx.font = '6px monospace';
  ctx.fillStyle = '#6e7681';
  ctx.textAlign = 'center';
  ctx.fillText('HUD · sticky in null space · persists through all cycles', cx, H - 8);
  ctx.textAlign = 'left';

  ctx.restore();
}

function paintFerment() {
  ctx.save();
  var fHue = 30 + Math.sin(stroke * 0.1) * 20;
  ctx.fillStyle = 'hsla(' + fHue + ',40%,12%,0.005)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// The first sites online — archaeological record
var firstSites = [
  { year: 1991, name: 'info.cern.ch', still: true,
    desc: 'Tim Berners-Lee. THE first website. A list of links. STILL ONLINE.',
    url: 'http://info.cern.ch/hypertext/WWW/TheProject.html' },
  { year: 1991, name: 'SLAC', still: true,
    desc: 'Stanford Linear Accelerator. First US website. Physics.',
    url: 'https://www.slac.stanford.edu' },
  { year: 1993, name: 'NCSA Mosaic', still: false,
    desc: 'The browser that made the web VISUAL. Inline images. Everything changed.' },
  { year: 1993, name: 'Coffee Pot Cam', still: false,
    desc: 'Trojan Room, Cambridge. First webcam. Watching coffee brew. Peak internet.' },
  { year: 1993, name: 'ALIWEB', still: false,
    desc: 'First search engine. Archie-Like Indexing. Before Yahoo. Before Google.' },
  { year: 1994, name: 'Yahoo!', still: true,
    desc: 'Jerry & David\'s Guide to the WWW. Hand-curated directory. Now a zombie.' },
  { year: 1994, name: 'W3C', still: true,
    desc: 'World Wide Web Consortium. The standards body. Still fighting for open.' },
  { year: 1994, name: 'First banner ad', still: false,
    desc: 'HotWired. "Have you ever clicked your mouse right HERE?" The original sin.' },
  { year: 1994, name: 'Pizza Hut', still: true,
    desc: 'First online food order. A pizza. On the internet. Revolutionary.',
    url: 'https://www.pizzahut.com' },
  { year: 1995, name: 'Amazon', still: true,
    desc: 'Books only. One guy in a garage. Look at it now. Look what it became.' },
  { year: 1995, name: 'eBay (AuctionWeb)', still: true,
    desc: 'First item sold: a broken laser pointer. $14.83. "Are you sure?" "I collect broken laser pointers."' },
  { year: 1995, name: 'Craigslist', still: true,
    desc: 'Email list in SF. Still looks the same. Never changed. Never needed to.' },
  { year: 1996, name: 'Internet Archive', still: true,
    desc: 'Brewster Kahle. Archive everything. The Wayback Machine. Humanity\'s backup disk.',
    url: 'https://web.archive.org' },
  { year: 1997, name: 'Google', still: true,
    desc: 'Two Stanford students. PageRank. "Don\'t be evil." LOL.' },
  { year: 1999, name: 'Newgrounds', still: true,
    desc: 'Tom Fulp. The blackhole. Flash games + movies + audio. STILL ALIVE. Still weird.',
    url: 'https://www.newgrounds.com' },
  { year: 2001, name: 'Wikipedia', still: true,
    desc: 'The free encyclopedia. Proof that humans will build for free if you let them.',
    url: 'https://www.wikipedia.org' },
];
