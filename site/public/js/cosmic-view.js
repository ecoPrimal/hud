// cosmic-view.js — chipmunk ↔ yeast ↔ earth ↔ moon ↔ oort cloud
// Bounce between scales. See us from everywhere.
// v9: hooks for cosmic-surfaces.js and cosmic-gameplay.js integration
(function() {
  'use strict';
  var PI = Math.PI, TAU = PI * 2;
  var NS = 'http://www.w3.org/2000/svg';
  var _overlay = null;
  var _svg = null;
  var _animId = null;
  var _t0 = 0;
  var _visible = false;
  var _zoom = 0; // 0=cosmos, 1=earth+moon, 2=membrane+yeast, 3=chipmunk
  var _onZoomCallbacks = [];
  var _layerGroups = {};

  var _data = {
    humans: 0, sessions: 0, sn: 0, surfaces: 15,
    multiHost: 0, uniqueHumans: 90229, wake: 0,
    energy: 1, attention: 0, metabolism: 'photosynthesis',
    memory: 0, autonomousCount: 0,
  };

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, '' + attrs[k]);
    return e;
  }

  function pullData() {
    var core = window._chipmunkCore;
    if (!core) return;
    var c = core.cache;
    if (c.human && c.human.energy) {
      var e = c.human.energy;
      _data.sessions = e.total_sessions || 0;
      _data.sn = e.signal_to_noise || 0;
      _data.multiHost = e.multi_host_sessions || 0;
    }
    if (c.chipmunk) {
      _data.wake = c.chipmunk.wake_level || 0;
      _data.attention = c.chipmunk.attention || 0;
    }
    // Pull from metabolism module
    var metab = window._chipmunkMetabolism;
    if (metab) {
      _data.energy = metab.energy ? metab.energy() : 1;
      _data.metabolism = metab.state ? metab.state() : 'photosynthesis';
      _data.autonomousCount = metab.autonomousCount ? metab.autonomousCount() : 0;
    }
    // Pull from explorer
    var exp = window._chipmunkExplorer;
    if (exp) {
      _data.memory = exp.stepCount ? exp.stepCount() : 0;
    }
  }

  // ═══ BUILD ═══

  var W = 900, H = 640, cx = 450, cy = 320;

  function build() {
    if (_overlay) return;

    _overlay = document.createElement('div');
    _overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;' +
      'background:#000005;display:flex;align-items:center;justify-content:center;flex-direction:column;' +
      'opacity:0;transition:opacity 1s ease;pointer-events:auto;cursor:pointer;';

    _svg = el('svg', { width: '100%', height: '100%', viewBox: '0 0 ' + W + ' ' + H,
      style: 'max-width:900px;max-height:640px;' });

    var defs = el('defs');
    // Gradients
    [['oort-grad',  [['0%','#0a0c10',0],['80%','#0a0c10',0],['96%','#1a1c2a',0.12],['100%','#2a2c3a',0.06]]],
     ['earth-glow', [['0%','#58a6ff',0.5],['50%','#3fb950',0.2],['100%','#000',0]]],
     ['moon-glow',  [['0%','#c9d1d9',0.4],['100%','#000',0]]],
     ['mem-glow',   [['0%','#e85d3a',0.9],['50%','#e85d3a',0.3],['100%','#000',0]]],
     ['yeast-glow', [['0%','#bc8cff',0.6],['60%','#bc8cff',0.15],['100%','#000',0]]],
     ['chipmunk-glow', [['0%','#5ab87a',0.8],['40%','#5ab87a',0.3],['100%','#000',0]]],
     ['comet-grad', [['0%','#ffffff',0.8],['30%','#aaccff',0.5],['100%','#000',0]]],
     ['bh-glow',    [['0%','#000000',1],['30%','#1a0a2a',0.8],['60%','#f0883e',0.4],['80%','#f0883e',0.1],['100%','#000',0]]],
     ['galaxy-core',[['0%','#f0e68c',0.7],['15%','#f0e68c',0.4],['40%','#d29922',0.15],['100%','#000',0]]],
    ].forEach(function(g) {
      var gr = el('radialGradient', { id: g[0], cx:'50%', cy:'50%', r:'50%' });
      g[1].forEach(function(s) { gr.appendChild(el('stop', { offset:s[0], 'stop-color':s[1], 'stop-opacity':s[2] })); });
      defs.appendChild(gr);
    });

    // Comet tail gradient (linear)
    var cometTail = el('linearGradient', { id:'comet-tail', x1:'0', y1:'0', x2:'1', y2:'0' });
    cometTail.appendChild(el('stop', { offset:'0%', 'stop-color':'#aaccff', 'stop-opacity':0.6 }));
    cometTail.appendChild(el('stop', { offset:'100%', 'stop-color':'#aaccff', 'stop-opacity':0 }));
    defs.appendChild(cometTail);

    // Accretion disk gradient
    var accDisk = el('linearGradient', { id:'acc-disk', x1:'0', y1:'0', x2:'1', y2:'0' });
    accDisk.appendChild(el('stop', { offset:'0%', 'stop-color':'#f0883e', 'stop-opacity':0 }));
    accDisk.appendChild(el('stop', { offset:'30%', 'stop-color':'#f0883e', 'stop-opacity':0.6 }));
    accDisk.appendChild(el('stop', { offset:'70%', 'stop-color':'#f0e68c', 'stop-opacity':0.4 }));
    accDisk.appendChild(el('stop', { offset:'100%', 'stop-color':'#f0883e', 'stop-opacity':0 }));
    defs.appendChild(accDisk);

    _svg.appendChild(defs);

    // Star field
    var stars = el('g', { id: 'cosmic-stars' });
    for (var i = 0; i < 280; i++) {
      var s = el('circle', {
        cx: (Math.random()*W).toFixed(0), cy: (Math.random()*H).toFixed(0),
        r: (0.15 + Math.random()*0.6).toFixed(1),
        fill: Math.random()>0.9 ? '#aaccff' : Math.random()>0.85 ? '#ffddaa' : '#dde',
        opacity: (0.15 + Math.random()*0.5).toFixed(2),
      });
      if (Math.random() > 0.88) {
        s.appendChild(el('animate', {
          attributeName:'opacity', dur:(2+Math.random()*4)+'s', repeatCount:'indefinite',
          values: s.getAttribute('opacity')+';0.05;'+s.getAttribute('opacity'),
          begin: (Math.random()*3)+'s',
        }));
      }
      stars.appendChild(s);
    }
    _svg.appendChild(stars);

    // Shooting stars (animated across star field, always visible)
    var shootingStars = el('g', { id: 'cosmic-shooting' });
    for (var si = 0; si < 4; si++) {
      var sx1 = Math.random() * W * 0.5;
      var sy1 = Math.random() * H * 0.3;
      var sx2 = sx1 + 60 + Math.random() * 80;
      var sy2 = sy1 + 20 + Math.random() * 40;
      var ss = el('line', { x1:sx1, y1:sy1, x2:sx1, y2:sy1, stroke:'#ffffff',
        'stroke-width':0.4, opacity:0, 'stroke-linecap':'round' });
      ss.setAttribute('data-shoot', '1');
      ss.setAttribute('data-sx1', sx1); ss.setAttribute('data-sy1', sy1);
      ss.setAttribute('data-sx2', sx2); ss.setAttribute('data-sy2', sy2);
      ss.setAttribute('data-delay', (si * 7 + Math.random() * 8).toFixed(1));
      ss.setAttribute('data-dur', (0.3 + Math.random() * 0.4).toFixed(2));
      shootingStars.appendChild(ss);
    }
    _svg.appendChild(shootingStars);

    // ── LAYER 0: The Observable Universe ──
    var LU = el('g', { id: 'L0', 'data-layer': '0' });
    LU.style.transition = 'opacity 0.8s ease';

    // CMB boundary — the edge of the observable universe
    var cmbR = 300;
    LU.appendChild(el('circle', { cx:cx, cy:cy, r:cmbR, fill:'none', stroke:'#3d2a1a',
      'stroke-width':1.5, 'stroke-dasharray':'0.5 3', opacity:0.15 }));
    var cmbGlow = el('circle', { cx:cx, cy:cy, r:cmbR, fill:'none', stroke:'#d29922',
      'stroke-width':0.3, opacity:0.06 });
    cmbGlow.appendChild(el('animate', { attributeName:'opacity', values:'0.06;0.12;0.06', dur:'8s', repeatCount:'indefinite' }));
    LU.appendChild(cmbGlow);

    // CMB label
    var cmbLbl = el('text', { x:cx, y:cy-cmbR-8, 'text-anchor':'middle', fill:'#3d2a1a',
      'font-size':'7px', 'font-family':'monospace' });
    cmbLbl.textContent = 'COSMIC MICROWAVE BACKGROUND \u2014 edge of the observable universe';
    LU.appendChild(cmbLbl);

    // Cosmic web — filaments of galaxy clusters
    var filaments = [
      [[cx-280,cy-80],[cx-180,cy-40],[cx-100,cy-20],[cx-30,cy+10],[cx+60,cy-5],[cx+150,cy+20],[cx+250,cy-30]],
      [[cx-200,cy+120],[cx-120,cy+60],[cx-40,cy+30],[cx+40,cy+50],[cx+130,cy+80],[cx+220,cy+60]],
      [[cx-100,cy-200],[cx-60,cy-120],[cx-20,cy-60],[cx+30,cy-30],[cx+80,cy-80],[cx+160,cy-140]],
      [[cx+50,cy+150],[cx+100,cy+90],[cx+140,cy+40],[cx+180,cy-20],[cx+230,cy-80]],
      [[cx-250,cy+30],[cx-160,cy+100],[cx-80,cy+130],[cx,cy+100],[cx+80,cy+120]],
    ];
    filaments.forEach(function(pts) {
      for (var fi=0; fi<pts.length-1; fi++) {
        LU.appendChild(el('line', { x1:pts[fi][0], y1:pts[fi][1], x2:pts[fi+1][0], y2:pts[fi+1][1],
          stroke:'#d29922', 'stroke-width':0.3, opacity:0.06 }));
      }
      pts.forEach(function(p) {
        // Galaxy cluster nodes
        var clusterR = 1 + Math.random() * 3;
        LU.appendChild(el('circle', { cx:p[0], cy:p[1], r:clusterR,
          fill:'#d29922', opacity:(0.03+Math.random()*0.06).toFixed(2) }));
        // Scatter galaxies around nodes
        for (var gi=0; gi<4+Math.floor(Math.random()*6); gi++) {
          var gx = p[0] + (Math.random()-0.5)*30;
          var gy = p[1] + (Math.random()-0.5)*20;
          LU.appendChild(el('circle', { cx:gx.toFixed(0), cy:gy.toFixed(0),
            r:(0.1+Math.random()*0.3).toFixed(1), fill:'#d29922',
            opacity:(0.02+Math.random()*0.05).toFixed(2) }));
        }
      });
    });

    // Voids — labeled empty regions
    var voids = [
      { x:cx-200, y:cy-130, name:'Boötes Void' },
      { x:cx+200, y:cy+130, name:'KBC Void' },
    ];
    voids.forEach(function(v) {
      LU.appendChild(el('circle', { cx:v.x, cy:v.y, r:30, fill:'#000005', opacity:0.5 }));
      var vl = el('text', { x:v.x, y:v.y+3, 'text-anchor':'middle', fill:'#21262d',
        'font-size':'4px', 'font-family':'monospace' });
      vl.textContent = v.name;
      LU.appendChild(vl);
    });

    // Superclusters
    var superclusters = [
      { name:'Laniakea', x:cx, y:cy, r:80, c:'#d29922' },
      { name:'Perseus-Pisces', x:cx+180, y:cy-60, r:40, c:'#8b949e' },
      { name:'Shapley', x:cx-160, y:cy+80, r:35, c:'#8b949e' },
      { name:'Coma', x:cx+100, y:cy+100, r:25, c:'#8b949e' },
    ];
    superclusters.forEach(function(sc) {
      LU.appendChild(el('circle', { cx:sc.x, cy:sc.y, r:sc.r, fill:'none', stroke:sc.c,
        'stroke-width':0.3, 'stroke-dasharray':'1 4', opacity: sc.name==='Laniakea' ? 0.15 : 0.06 }));
      var sl = el('text', { x:sc.x, y:sc.y + sc.r + 8, 'text-anchor':'middle', fill:sc.c,
        'font-size': sc.name==='Laniakea' ? '6px' : '4px', 'font-family':'monospace',
        opacity: sc.name==='Laniakea' ? 0.4 : 0.2 });
      sl.textContent = sc.name === 'Laniakea' ? 'LANIAKEA SUPERCLUSTER \u2014 our home' : sc.name;
      LU.appendChild(sl);
    });

    // Milky Way marker inside Laniakea
    var mwDot = el('circle', { cx:cx+20, cy:cy-15, r:2, fill:'#d29922', opacity:0.8 });
    mwDot.appendChild(el('animate', { attributeName:'r', values:'2;3;2', dur:'3s', repeatCount:'indefinite' }));
    LU.appendChild(mwDot);
    var mwLbl = el('text', { x:cx+28, y:cy-18, 'text-anchor':'start', fill:'#d29922',
      'font-size':'6px', 'font-family':'monospace', opacity:0.6 });
    mwLbl.textContent = 'Milky Way';
    LU.appendChild(mwLbl);
    // Andromeda nearby
    LU.appendChild(el('circle', { cx:cx+30, cy:cy-25, r:1.5, fill:'#8b949e', opacity:0.4 }));
    var andLbl = el('text', { x:cx+36, y:cy-27, 'text-anchor':'start', fill:'#484f58',
      'font-size':'4px', 'font-family':'monospace', opacity:0.3 });
    andLbl.textContent = 'Andromeda';
    LU.appendChild(andLbl);

    // Project family clusters — springs, gardens, infra
    var projectClusters = [
      { name:'SPRINGS', x:cx-130, y:cy-90, c:'#3fb950', sub:'10 springs',
        items:['airSpring','coralForge','groundSpring','healthSpring','hotSpring',
               'ludoSpring','neuralSpring','primalSpring','rustChip','wetSpring'] },
      { name:'GARDENS', x:cx+140, y:cy+60, c:'#a371f7', sub:'9 gardens',
        items:['esotericWebb','cellMembrane','blueFish','helixVision','initioChem',
               'lithoSpore','metalForge','FOUNDATION','NUCLEUS'] },
      { name:'INFRA', x:cx-100, y:cy+110, c:'#f0883e', sub:'12 systems',
        items:['hud','membrane','detroit','galaxy','sporePrint',
               'wateringHole','plasmidBin','opsonize','benchScale','fossilRecord'] },
    ];
    var clusterGroup = el('g', { id:'project-clusters' });
    projectClusters.forEach(function(pc) {
      var pcR = 35;
      var pcBorder = el('circle', { cx:pc.x, cy:pc.y, r:pcR, fill:'none', stroke:pc.c,
        'stroke-width':0.3, 'stroke-dasharray':'1.5 3', opacity:0.08 });
      clusterGroup.appendChild(pcBorder);
      pc.items.forEach(function(item, ii) {
        var ia = (ii / pc.items.length) * TAU - PI/2;
        var ir = 8 + Math.random() * 18;
        var ix = pc.x + Math.cos(ia) * ir;
        var iy = pc.y + Math.sin(ia) * ir;
        var iDot = el('circle', { cx:ix.toFixed(0), cy:iy.toFixed(0),
          r:(0.3+Math.random()*0.5).toFixed(1), fill:pc.c,
          opacity:(0.05+Math.random()*0.08).toFixed(2) });
        iDot.setAttribute('data-cluster', pc.name.toLowerCase());
        clusterGroup.appendChild(iDot);
      });
      var pcLbl = el('text', { x:pc.x, y:pc.y-pcR-4, 'text-anchor':'middle', fill:pc.c,
        'font-size':'5px', 'font-family':'monospace', opacity:0.15 });
      pcLbl.textContent = pc.name;
      pcLbl.setAttribute('data-cluster', pc.name.toLowerCase());
      clusterGroup.appendChild(pcLbl);
      var pcSub = el('text', { x:pc.x, y:pc.y-pcR+4, 'text-anchor':'middle', fill:pc.c,
        'font-size':'3.5px', 'font-family':'monospace', opacity:0.08 });
      pcSub.textContent = pc.sub;
      clusterGroup.appendChild(pcSub);
    });
    LU.appendChild(clusterGroup);

    // Title
    var uTitle = el('text', { x:cx, y:24, 'text-anchor':'middle', fill:'#d29922',
      'font-size':'10px', 'font-family':'monospace', opacity:0.6 });
    uTitle.textContent = 'THE OBSERVABLE UNIVERSE';
    LU.appendChild(uTitle);
    var uSub = el('text', { x:cx, y:36, 'text-anchor':'middle', fill:'#484f58',
      'font-size':'7px', 'font-family':'monospace' });
    uSub.textContent = '93 billion light-years across \u00b7 ~2 trillion galaxies \u00b7 13.8 billion years old';
    LU.appendChild(uSub);

    // Time arrow — bottom
    var arrowY = H - 55;
    LU.appendChild(el('line', { x1:cx-200, y1:arrowY, x2:cx+200, y2:arrowY,
      stroke:'#30363d', 'stroke-width':0.4, opacity:0.2 }));
    var timeMarks = [
      { x:cx-200, t:'Big Bang', sub:'13.8 Gyr' },
      { x:cx-120, t:'first stars', sub:'13.5 Gyr' },
      { x:cx-40,  t:'Milky Way forms', sub:'13.2 Gyr' },
      { x:cx+60,  t:'Sun forms', sub:'4.6 Gyr' },
      { x:cx+140, t:'life on Earth', sub:'3.8 Gyr' },
      { x:cx+200, t:'now', sub:'you' },
    ];
    timeMarks.forEach(function(tm) {
      LU.appendChild(el('circle', { cx:tm.x, cy:arrowY, r:1, fill:'#484f58', opacity:0.3 }));
      var tl = el('text', { x:tm.x, y:arrowY-6, 'text-anchor':'middle', fill:'#484f58',
        'font-size':'4px', 'font-family':'monospace', opacity: tm.t==='now'?0.5:0.2 });
      tl.textContent = tm.t;
      LU.appendChild(tl);
      var ts = el('text', { x:tm.x, y:arrowY+8, 'text-anchor':'middle', fill:'#30363d',
        'font-size':'3.5px', 'font-family':'monospace' });
      ts.textContent = tm.sub;
      LU.appendChild(ts);
    });
    // "now" highlight
    var nowDot = el('circle', { cx:cx+200, cy:arrowY, r:1.5, fill:'#5ab87a', opacity:0.7 });
    nowDot.appendChild(el('animate', { attributeName:'r', values:'1.5;2.5;1.5', dur:'2s', repeatCount:'indefinite' }));
    LU.appendChild(nowDot);

    // Squirrel observer — at the edge of the observable universe
    var sqObsU = el('g', { id:'sq-obs-u' });
    sqObsU.appendChild(el('circle', { cx:cx+cmbR-10, cy:cy-20, r:1.5, fill:'#5ab87a', opacity:0.6 }));
    var sqUlbl = el('text', { x:cx+cmbR-5, y:cy-23, 'text-anchor':'start',
      fill:'#5ab87a', 'font-size':'4px', 'font-family':'monospace', opacity:0.25 });
    sqUlbl.textContent = '\ud83d\udc3f looking in from the edge of time';
    sqObsU.appendChild(sqUlbl);
    LU.appendChild(sqObsU);

    _layerGroups[0] = LU;
    _svg.appendChild(LU);

    // ── LAYER 1: Milky Way Galaxy + Black Holes ──
    var LG = el('g', { id: 'L1', 'data-layer': '1' });
    LG.style.opacity = '0';
    LG.style.transition = 'opacity 0.8s ease';

    // Galaxy disk — tilted ellipse with spiral arms
    LG.appendChild(el('ellipse', { cx:cx, cy:cy, rx:280, ry:100, fill:'url(#galaxy-core)', opacity:0.25,
      transform:'rotate(-25 '+cx+' '+cy+')' }));
    // Spiral arm hints (arcs)
    var armAngles = [0, PI*0.5, PI, PI*1.5];
    armAngles.forEach(function(base, ai) {
      var armG = el('g', { opacity: 0.12 });
      for (var aj=0; aj<40; aj++) {
        var ang = base + aj * 0.15;
        var r = 30 + aj * 6;
        var spread = 3 + Math.random() * 6;
        var ax = cx + Math.cos(ang) * r * 1.1;
        var ay = cy + Math.sin(ang) * r * 0.4; // flattened for tilt
        var rotAx = cx + (ax-cx)*Math.cos(-25*PI/180) - (ay-cy)*Math.sin(-25*PI/180);
        var rotAy = cy + (ax-cx)*Math.sin(-25*PI/180) + (ay-cy)*Math.cos(-25*PI/180);
        var sc = Math.random() > 0.7 ? '#aaccff' : Math.random() > 0.5 ? '#f0e68c' : '#ddd8cc';
        armG.appendChild(el('circle', { cx:rotAx.toFixed(0), cy:rotAy.toFixed(0),
          r:(0.2+Math.random()*0.6).toFixed(1), fill:sc,
          opacity:(0.1+Math.random()*0.2).toFixed(2) }));
      }
      LG.appendChild(armG);
    });

    // Galaxy core — bright center
    LG.appendChild(el('ellipse', { cx:cx, cy:cy, rx:30, ry:12, fill:'#f0e68c', opacity:0.15,
      transform:'rotate(-25 '+cx+' '+cy+')' }));
    LG.appendChild(el('ellipse', { cx:cx, cy:cy, rx:15, ry:6, fill:'#f0e68c', opacity:0.25,
      transform:'rotate(-25 '+cx+' '+cy+')' }));

    // ── Sagittarius A* — the supermassive black hole at center ──
    // Event horizon
    LG.appendChild(el('circle', { cx:cx, cy:cy, r:8, fill:'#000000', opacity:1 }));
    // Accretion disk
    var accRing = el('ellipse', { cx:cx, cy:cy, rx:18, ry:5, fill:'none', stroke:'#f0883e',
      'stroke-width':2.5, opacity:0.4, id:'sgr-a-disk',
      transform:'rotate(-25 '+cx+' '+cy+')' });
    accRing.appendChild(el('animateTransform', { attributeName:'transform', type:'rotate',
      from:'-25 '+cx+' '+cy, to:'335 '+cx+' '+cy, dur:'20s', repeatCount:'indefinite' }));
    LG.appendChild(accRing);
    // Photon ring
    LG.appendChild(el('circle', { cx:cx, cy:cy, r:12, fill:'none', stroke:'#f0883e',
      'stroke-width':0.5, opacity:0.25 }));
    // Glow
    LG.appendChild(el('circle', { cx:cx, cy:cy, r:20, fill:'url(#bh-glow)', opacity:0.6 }));
    // Label
    var sgrLbl = el('text', { x:cx, y:cy+28, 'text-anchor':'middle', fill:'#f0883e',
      'font-size':'8px', 'font-family':'monospace', opacity:0.6 });
    sgrLbl.textContent = 'Sagittarius A*';
    LG.appendChild(sgrLbl);
    var sgrSub = el('text', { x:cx, y:cy+38, 'text-anchor':'middle', fill:'#484f58',
      'font-size':'6px', 'font-family':'monospace' });
    sgrSub.textContent = '4 million solar masses \u00b7 26,000 light-years away';
    LG.appendChild(sgrSub);

    // Solar system position — on the Orion Arm, 2/3 out from center
    var solAng = -25 * PI / 180 + 0.8; // position on arm
    var solR = 180;
    var solX = cx + Math.cos(solAng) * solR * 0.9;
    var solY = cy + Math.sin(solAng) * solR * 0.35;
    var solDot = el('circle', { cx:solX.toFixed(0), cy:solY.toFixed(0), r:2.5, fill:'#58a6ff', opacity:0.9 });
    solDot.appendChild(el('animate', { attributeName:'r', values:'2.5;4;2.5', dur:'3s', repeatCount:'indefinite' }));
    LG.appendChild(solDot);
    var solLbl = el('text', { x:(solX+10).toFixed(0), y:(solY-6).toFixed(0), 'text-anchor':'start',
      fill:'#58a6ff', 'font-size':'7px', 'font-family':'monospace', opacity:0.7 });
    solLbl.textContent = 'YOU ARE HERE';
    LG.appendChild(solLbl);
    var solSub = el('text', { x:(solX+10).toFixed(0), y:(solY+4).toFixed(0), 'text-anchor':'start',
      fill:'#484f58', 'font-size':'5px', 'font-family':'monospace' });
    solSub.textContent = 'Orion Arm \u00b7 ~27,000 ly from center';
    LG.appendChild(solSub);

    // Line from sol to Sgr A*
    LG.appendChild(el('line', { x1:solX.toFixed(0), y1:solY.toFixed(0), x2:cx, y2:cy,
      stroke:'#484f58', 'stroke-width':0.2, 'stroke-dasharray':'1.5 4', opacity:0.15 }));

    // Other notable black holes / objects scattered
    var bhObjects = [
      { name:'Cygnus X-1', x:cx+200, y:cy-80, r:3, c:'#bc8cff' },
      { name:'M87*', x:cx-180, y:cy-60, r:4, c:'#f0883e', sub:'6.5 billion M\u2609' },
      { name:'GRS 1915+105', x:cx+120, y:cy+80, r:2, c:'#bc8cff' },
      { name:'TON 618', x:cx-220, y:cy+50, r:5, c:'#f0883e', sub:'66 billion M\u2609' },
    ];
    bhObjects.forEach(function(bh) {
      // Black hole dot
      LG.appendChild(el('circle', { cx:bh.x, cy:bh.y, r:bh.r, fill:'#000000', stroke:bh.c,
        'stroke-width':0.4, opacity:0.7 }));
      // Glow
      LG.appendChild(el('circle', { cx:bh.x, cy:bh.y, r:bh.r*2.5, fill:'url(#bh-glow)', opacity:0.3 }));
      // Mini accretion ring
      LG.appendChild(el('ellipse', { cx:bh.x, cy:bh.y, rx:bh.r*2, ry:bh.r*0.6, fill:'none',
        stroke:bh.c, 'stroke-width':0.4, opacity:0.2 }));
      // Label
      var bl = el('text', { x:bh.x, y:bh.y+bh.r*2.5+8, 'text-anchor':'middle', fill:bh.c,
        'font-size':'5px', 'font-family':'monospace', opacity:0.3 });
      bl.textContent = bh.name;
      LG.appendChild(bl);
      if (bh.sub) {
        var bs = el('text', { x:bh.x, y:bh.y+bh.r*2.5+16, 'text-anchor':'middle', fill:'#484f58',
          'font-size':'4px', 'font-family':'monospace', opacity:0.2 });
        bs.textContent = bh.sub;
        LG.appendChild(bs);
      }
    });

    // Galaxy title
    var gTitle = el('text', { x:cx, y:30, 'text-anchor':'middle', fill:'#d29922',
      'font-size':'10px', 'font-family':'monospace', opacity:0.6 });
    gTitle.textContent = 'THE MILKY WAY';
    LG.appendChild(gTitle);
    var gSub = el('text', { x:cx, y:42, 'text-anchor':'middle', fill:'#484f58',
      'font-size':'7px', 'font-family':'monospace' });
    gSub.textContent = '~200 billion stars \u00b7 100,000 light-years across \u00b7 one supermassive black hole';
    LG.appendChild(gSub);

    // Gate stars — placed along spiral arms, showing the mesh
    var GATES = [
      { name:'eastGate', x:solX-15, y:solY+12, c:'#5ab87a', status:'online' },
      { name:'golgiBody', x:solX+40, y:solY-25, c:'#f0e68c', status:'online' },
      { name:'sporeGate', x:solX-40, y:solY-10, c:'#58a6ff', status:'online' },
      { name:'northGate', x:solX+20, y:solY+20, c:'#bc8cff', status:'online' },
    ];
    var gateGroup = el('g', { id:'gate-stars' });
    GATES.forEach(function(g) {
      var gDot = el('circle', { cx:g.x.toFixed(0), cy:g.y.toFixed(0), r:1.5,
        fill:g.c, opacity:0.7 });
      gDot.setAttribute('data-gate', g.name);
      gDot.appendChild(el('animate', { attributeName:'opacity', values:'0.7;0.4;0.7',
        dur:(2+Math.random()*2)+'s', repeatCount:'indefinite' }));
      gateGroup.appendChild(gDot);
      var gLbl = el('text', { x:(g.x+5).toFixed(0), y:(g.y+1).toFixed(0), 'text-anchor':'start',
        fill:g.c, 'font-size':'4px', 'font-family':'monospace', opacity:0.3 });
      gLbl.textContent = g.name;
      gLbl.setAttribute('data-gate', g.name);
      gateGroup.appendChild(gLbl);
      var statusDot = el('circle', { cx:(g.x-3).toFixed(0), cy:g.y.toFixed(0), r:0.5,
        fill: g.status==='online' ? '#3fb950' : '#f85149', opacity:0.5 });
      statusDot.setAttribute('data-gate-status', g.name);
      gateGroup.appendChild(statusDot);
    });
    LG.appendChild(gateGroup);

    // Domain arms — label the spiral arms by category
    var domainArms = [
      { name:'INVESTIGATION', angle:0, c:'#e85d3a', sites:'detroit \u00b7 clutch \u00b7 barry' },
      { name:'IMMUNE', angle:PI*0.5, c:'#f0e68c', sites:'tuebor \u00b7 gorilla \u00b7 signal' },
      { name:'SCIENCE', angle:PI, c:'#bc8cff', sites:'sporeprint \u00b7 hypothesis \u00b7 thesis' },
      { name:'CREATIVE', angle:PI*1.5, c:'#a371f7', sites:'hud \u00b7 esotericWebb' },
    ];
    domainArms.forEach(function(arm) {
      var armR = 240;
      var ax = cx + Math.cos(arm.angle - 25*PI/180) * armR * 0.9;
      var ay = cy + Math.sin(arm.angle - 25*PI/180) * armR * 0.35;
      var al = el('text', { x:ax.toFixed(0), y:ay.toFixed(0), 'text-anchor':'middle',
        fill:arm.c, 'font-size':'5px', 'font-family':'monospace', opacity:0.2 });
      al.textContent = arm.name;
      LG.appendChild(al);
      var asub = el('text', { x:ax.toFixed(0), y:(ay+8).toFixed(0), 'text-anchor':'middle',
        fill:arm.c, 'font-size':'3.5px', 'font-family':'monospace', opacity:0.12 });
      asub.textContent = arm.sites;
      LG.appendChild(asub);
    });

    // Nearby galaxy hints at edges
    var nearGal = [
      { name:'Andromeda (M31)', x:60, y:55, size:8 },
      { name:'Large Magellanic Cloud', x:W-80, y:H-80, size:5 },
    ];
    nearGal.forEach(function(ng) {
      LG.appendChild(el('ellipse', { cx:ng.x, cy:ng.y, rx:ng.size, ry:ng.size*0.5,
        fill:'#d29922', opacity:0.04 }));
      var nl = el('text', { x:ng.x, y:ng.y+ng.size+8, 'text-anchor':'middle', fill:'#30363d',
        'font-size':'4px', 'font-family':'monospace' });
      nl.textContent = ng.name;
      LG.appendChild(nl);
    });

    // Squirrel observer — outside looking in at the galaxy
    var sqObs0 = el('g', { id:'sq-obs-0', 'data-sq-obs':'0' });
    var sq0x = solX + 25, sq0y = solY - 20;
    sqObs0.appendChild(el('circle', { cx:sq0x.toFixed(0), cy:sq0y.toFixed(0), r:1.5, fill:'#5ab87a', opacity:0.7 }));
    sqObs0.appendChild(el('line', { x1:sq0x.toFixed(0), y1:sq0y.toFixed(0),
      x2:solX.toFixed(0), y2:solY.toFixed(0),
      stroke:'#5ab87a', 'stroke-width':0.3, 'stroke-dasharray':'1 2', opacity:0.25 }));
    var sq0lbl = el('text', { x:(sq0x+5).toFixed(0), y:(sq0y-3).toFixed(0), 'text-anchor':'start',
      fill:'#5ab87a', 'font-size':'4px', 'font-family':'monospace', opacity:0.3 });
    sq0lbl.textContent = '\ud83d\udc3f looking in';
    sqObs0.appendChild(sq0lbl);
    LG.appendChild(sqObs0);

    _layerGroups[1] = LG;
    _svg.appendChild(LG);

    // ── LAYER 2: Oort Cloud + Solar System ──
    var L0 = el('g', { id: 'L2', 'data-layer': '2' });
    L0.style.opacity = '0';
    L0.style.transition = 'opacity 0.8s ease';

    // Oort Cloud
    var oortR = 290;
    L0.appendChild(el('circle', { cx:cx, cy:cy, r:oortR, fill:'url(#oort-grad)', stroke:'#2a2c3a',
      'stroke-width':0.4, 'stroke-dasharray':'1.5 6', opacity:0.35 }));

    // Oort label
    var oLbl = el('text', { x:cx, y:cy-oortR-6, 'text-anchor':'middle', fill:'#484f58',
      'font-size':'8px', 'font-family':'monospace' });
    oLbl.textContent = 'OORT CLOUD \u2014 ~50,000 AU';
    L0.appendChild(oLbl);

    // Icy bodies (more, varied sizes)
    for (var oi=0; oi<80; oi++) {
      var oa = Math.random()*TAU, or2 = oortR*(0.75+Math.random()*0.25);
      L0.appendChild(el('circle', { cx:(cx+Math.cos(oa)*or2).toFixed(0), cy:(cy+Math.sin(oa)*or2).toFixed(0),
        r:(0.15+Math.random()*0.5).toFixed(1), fill:'#6e7681', opacity:(0.04+Math.random()*0.1).toFixed(2) }));
    }

    // Kuiper Belt
    L0.appendChild(el('circle', { cx:cx, cy:cy, r:130, fill:'none', stroke:'#484f58',
      'stroke-width':6, 'stroke-dasharray':'0.4 2.5', opacity:0.12 }));
    var kLbl = el('text', { x:cx+132, y:cy-4, 'text-anchor':'start', fill:'#484f58',
      'font-size':'6px', 'font-family':'monospace', opacity:0.4 });
    kLbl.textContent = 'kuiper belt';
    L0.appendChild(kLbl);

    // Asteroid belt between Mars and Jupiter
    var astG = el('g', { id: 'cosmic-asteroids' });
    for (var ai=0; ai<50; ai++) {
      var aa = Math.random()*TAU;
      var ar = 55 + Math.random()*14; // between mars(48) and jupiter(72)
      astG.appendChild(el('circle', {
        cx:(cx+Math.cos(aa)*ar).toFixed(0), cy:(cy+Math.sin(aa)*ar).toFixed(0),
        r:(0.15+Math.random()*0.3).toFixed(1), fill:'#8b949e',
        opacity:(0.08+Math.random()*0.15).toFixed(2),
      }));
    }
    L0.appendChild(astG);

    // Orbits + Sun
    var orbits = [16, 26, 38, 48, 72, 94, 112, 126];
    orbits.forEach(function(r) {
      L0.appendChild(el('circle', { cx:cx, cy:cy, r:r, fill:'none', stroke:'#21262d', 'stroke-width':0.25, opacity:0.4 }));
    });
    L0.appendChild(el('circle', { cx:cx, cy:cy, r:5, fill:'#f0e68c', opacity:0.9 }));
    var sunG = el('circle', { cx:cx, cy:cy, r:10, fill:'none', stroke:'#f0e68c', 'stroke-width':0.4, opacity:0.15 });
    sunG.appendChild(el('animate', { attributeName:'r', values:'10;14;10', dur:'4s', repeatCount:'indefinite' }));
    L0.appendChild(sunG);

    // Animated planets — each mapped to a live surface
    var SURFACE_MAP = {
      mercury: 'signal',    // closest to data, observatory
      venus:   'hypothesis',// theory, hot
      earth:   'detroit',   // investigation home
      mars:    'tuebor',    // defense, red
      jupiter: 'gorilla',   // massive methodology
      saturn:  'thesis',    // rings of research
      uranus:  'clutch',    // investigation, tilted
      neptune: 'sporeprint',// deep science
    };
    var planets = [
      { name:'mercury', r:16, c:'#8b949e', s:1.0, sp:18 },
      { name:'venus',   r:26, c:'#f0e68c', s:1.2, sp:25 },
      { name:'earth',   r:38, c:'#58a6ff', s:1.4, sp:33 },
      { name:'mars',    r:48, c:'#e85d3a', s:1.0, sp:42 },
      { name:'jupiter', r:72, c:'#f0883e', s:3.0, sp:65 },
      { name:'saturn',  r:94, c:'#d29922', s:2.5, sp:90 },
      { name:'uranus',  r:112,c:'#79c0ff', s:1.8, sp:120 },
      { name:'neptune', r:126,c:'#3fb950', s:1.8, sp:150 },
    ];
    planets.forEach(function(p, pi) {
      var sa = Math.random()*TAU;
      var dot = el('circle', { r:p.s.toFixed(1), fill:p.c, opacity: p.name==='earth' ? 1 : 0.65 });
      dot.setAttribute('data-orbit-r', p.r);
      dot.setAttribute('data-orbit-speed', p.sp);
      dot.setAttribute('data-orbit-start', sa);
      if (SURFACE_MAP[p.name]) dot.setAttribute('data-surface', SURFACE_MAP[p.name]);
      dot.style.cursor = 'pointer';
      if (p.name==='earth') { dot.id = 'cosmic-earth'; dot._startAngle = sa; }
      if (p.name==='saturn') dot.id = 'cosmic-saturn';
      L0.appendChild(dot);

      // Invisible hit area for easier clicking
      var hitArea = el('circle', { r: Math.max(p.s * 3, 6).toFixed(1), fill:'transparent', opacity:0 });
      hitArea.setAttribute('data-orbit-r', p.r);
      hitArea.setAttribute('data-orbit-speed', p.sp);
      hitArea.setAttribute('data-orbit-start', sa);
      if (SURFACE_MAP[p.name]) hitArea.setAttribute('data-surface', SURFACE_MAP[p.name]);
      hitArea.style.cursor = 'pointer';
      L0.appendChild(hitArea);

      // Saturn's rings
      if (p.name === 'saturn') {
        var ring1 = el('ellipse', { rx:6, ry:1.8, fill:'none', stroke:'#d29922',
          'stroke-width':0.6, opacity:0.35, id:'saturn-ring-1' });
        ring1.setAttribute('data-saturn-ring', '1');
        var ring2 = el('ellipse', { rx:8, ry:2.4, fill:'none', stroke:'#d29922',
          'stroke-width':0.3, opacity:0.2, id:'saturn-ring-2' });
        ring2.setAttribute('data-saturn-ring', '2');
        L0.appendChild(ring1);
        L0.appendChild(ring2);
      }

      // Labels for key planets — show surface name in brackets
      var showLabel = ['earth','jupiter','saturn','mars','neptune','mercury','venus','uranus'].indexOf(p.name) >= 0;
      if (showLabel) {
        var surfName = SURFACE_MAP[p.name] || '';
        var lb = el('text', { 'text-anchor':'middle', fill:p.c,
          'font-size': p.name==='earth'?'7px': p.name==='jupiter'||p.name==='saturn'?'5.5px':'4.5px',
          'font-family':'monospace', opacity: p.name==='earth'?0.5:0.35 });
        lb.textContent = surfName || p.name;
        lb.setAttribute('data-orbit-r', p.r);
        lb.setAttribute('data-orbit-speed', p.sp);
        lb.setAttribute('data-orbit-start', sa);
        lb.setAttribute('data-label-offset', '7');
        if (surfName) lb.setAttribute('data-surface', surfName);
        lb.style.cursor = 'pointer';
        L0.appendChild(lb);
      }
    });

    // Sun = hud (the observer, center of the system)
    var sunHit = el('circle', { cx:cx, cy:cy, r:12, fill:'transparent', opacity:0 });
    sunHit.setAttribute('data-surface', 'hud');
    sunHit.style.cursor = 'pointer';
    L0.appendChild(sunHit);

    // esotericWebb — beyond neptune in the Kuiper Belt
    var webbAngle = Math.random() * TAU;
    var webbDot = el('circle', { r:1.2, fill:'#a371f7', opacity:0.7 });
    webbDot.setAttribute('data-orbit-r', 140);
    webbDot.setAttribute('data-orbit-speed', 180);
    webbDot.setAttribute('data-orbit-start', webbAngle);
    webbDot.setAttribute('data-surface', 'esotericWebb');
    webbDot.style.cursor = 'pointer';
    L0.appendChild(webbDot);
    var webbLbl = el('text', { 'text-anchor':'middle', fill:'#a371f7',
      'font-size':'4px', 'font-family':'monospace', opacity:0.3 });
    webbLbl.textContent = 'esotericWebb';
    webbLbl.setAttribute('data-orbit-r', 140);
    webbLbl.setAttribute('data-orbit-speed', 180);
    webbLbl.setAttribute('data-orbit-start', webbAngle);
    webbLbl.setAttribute('data-label-offset', '5');
    webbLbl.setAttribute('data-surface', 'esotericWebb');
    webbLbl.style.cursor = 'pointer';
    L0.appendChild(webbLbl);

    // barry — moon of earth (detroit)
    var barryLbl = el('text', { 'text-anchor':'middle', fill:'#c9d1d9',
      'font-size':'3.5px', 'font-family':'monospace', opacity:0.25 });
    barryLbl.textContent = 'barry';
    barryLbl.setAttribute('data-moon-lbl', 'barry');
    barryLbl.setAttribute('data-surface', 'barry');
    barryLbl.style.cursor = 'pointer';
    L0.appendChild(barryLbl);

    // Moon — orbits earth
    var moonDot = el('circle', { r: '0.8', fill:'#c9d1d9', opacity:0.8, id:'cosmic-moon' });
    moonDot.setAttribute('data-moon', '1');
    L0.appendChild(moonDot);
    var moonLbl = el('text', { 'text-anchor':'middle', fill:'#c9d1d9', 'font-size':'5px',
      'font-family':'monospace', opacity:0.35, id:'cosmic-moon-lbl' });
    moonLbl.textContent = 'moon';
    moonLbl.setAttribute('data-moon-lbl', '1');
    L0.appendChild(moonLbl);

    // Comet with tail
    var cometG = el('g', { id: 'cosmic-comet' });
    cometG.appendChild(el('circle', { r:1, fill:'#ffffff', opacity:0.9, id:'comet-head' }));
    cometG.appendChild(el('line', { x1:0, y1:0, x2:-30, y2:5, stroke:'url(#comet-tail)',
      'stroke-width':1.2, opacity:0.6, id:'comet-tail-line' }));
    cometG.appendChild(el('line', { x1:0, y1:0, x2:-25, y2:8, stroke:'url(#comet-tail)',
      'stroke-width':0.5, opacity:0.3, id:'comet-tail-line2' }));
    L0.appendChild(cometG);

    // Fleet bouncing off oort
    for (var fi=0; fi<12; fi++) {
      var fa=(fi/12)*TAU+Math.random()*0.3, fR=oortR+4+Math.random()*12;
      var fd = el('circle', { cx:(cx+Math.cos(fa)*fR).toFixed(0), cy:(cy+Math.sin(fa)*fR).toFixed(0),
        r:(0.4+Math.random()*0.4).toFixed(1), fill:'#e85d3a', opacity:'0' });
      fd.appendChild(el('animate', { attributeName:'opacity', values:'0;0.35;0',
        dur:(1.5+Math.random()*2.5)+'s', repeatCount:'indefinite', begin:(Math.random()*4)+'s' }));
      L0.appendChild(fd);
    }

    // Voyager probe
    var voyager = el('text', { 'font-size':'4px', fill:'#8b949e', 'font-family':'monospace', opacity:0.25, id:'cosmic-voyager' });
    voyager.textContent = '\u2190 voyager 1';
    L0.appendChild(voyager);

    // Squirrel observer — perched beyond the Oort Cloud, looking in at the solar system
    var sqObs1 = el('g', { id:'sq-obs-1', 'data-sq-obs':'1' });
    sqObs1.appendChild(el('circle', { cx:cx+oortR+20, cy:cy-30, r:2, fill:'#5ab87a', opacity:0.7 }));
    sqObs1.appendChild(el('line', { x1:cx+oortR+20, y1:cy-30, x2:cx+oortR-5, y2:cy-10,
      stroke:'#5ab87a', 'stroke-width':0.3, 'stroke-dasharray':'1 2', opacity:0.2 }));
    var sq1lbl = el('text', { x:cx+oortR+25, y:cy-33, 'text-anchor':'start',
      fill:'#5ab87a', 'font-size':'5px', 'font-family':'monospace', opacity:0.35 });
    sq1lbl.textContent = '\ud83d\udc3f the squirrel watches';
    sqObs1.appendChild(sq1lbl);
    L0.appendChild(sqObs1);

    // Membrane ghost — tiny warm dot at Earth's position showing where the membrane is
    var memGhost1 = el('circle', { r:1, fill:'#e85d3a', opacity:0.3, id:'mem-ghost-1' });
    memGhost1.setAttribute('data-orbit-r', 38);
    memGhost1.setAttribute('data-orbit-speed', 33);
    memGhost1.setAttribute('data-orbit-start', planets[2] ? planets[2]._sa || 0 : 0);
    L0.appendChild(memGhost1);

    _layerGroups[2] = L0;
    _svg.appendChild(L0);

    // ── LAYER 3: Earth + Moon close-up ──
    var L1 = el('g', { id:'L3', 'data-layer':'3' });
    L1.style.opacity = '0';
    L1.style.transition = 'opacity 0.8s ease';

    // Earth big
    L1.appendChild(el('circle', { cx:cx-60, cy:cy, r:80, fill:'url(#earth-glow)', opacity:0.6 }));
    L1.appendChild(el('circle', { cx:cx-60, cy:cy, r:40, fill:'#1a3a5c', stroke:'#58a6ff', 'stroke-width':0.8, opacity:0.7 }));
    // Continents hint — more detail
    L1.appendChild(el('ellipse', { cx:cx-70, cy:cy-8, rx:12, ry:18, fill:'#3fb950', opacity:0.2, transform:'rotate(-15 '+(cx-70)+' '+(cy-8)+')' }));
    L1.appendChild(el('ellipse', { cx:cx-48, cy:cy+5, rx:8, ry:10, fill:'#3fb950', opacity:0.15 }));
    L1.appendChild(el('ellipse', { cx:cx-80, cy:cy+12, rx:5, ry:7, fill:'#3fb950', opacity:0.1 })); // South America hint
    L1.appendChild(el('ellipse', { cx:cx-42, cy:cy-16, rx:14, ry:6, fill:'#3fb950', opacity:0.08, transform:'rotate(10 '+(cx-42)+' '+(cy-16)+')' })); // Eurasia hint

    // Atmosphere glow
    var atmo = el('circle', { cx:cx-60, cy:cy, r:44, fill:'none', stroke:'#58a6ff', 'stroke-width':2, opacity:0.08 });
    atmo.appendChild(el('animate', { attributeName:'opacity', values:'0.08;0.15;0.08', dur:'5s', repeatCount:'indefinite' }));
    L1.appendChild(atmo);

    var eLbl = el('text', { x:cx-60, y:cy+55, 'text-anchor':'middle', fill:'#58a6ff', 'font-size':'10px', 'font-family':'monospace', opacity:0.7 });
    eLbl.textContent = 'EARTH';
    L1.appendChild(eLbl);

    // Moon
    L1.appendChild(el('circle', { cx:cx+140, cy:cy-40, r:60, fill:'url(#moon-glow)', opacity:0.4 }));
    L1.appendChild(el('circle', { cx:cx+140, cy:cy-40, r:20, fill:'#30363d', stroke:'#c9d1d9', 'stroke-width':0.5, opacity:0.7 }));
    // More craters
    [[136,-48,3],[145,-35,2],[132,-42,1.5],[148,-46,2.5],[138,-30,1],[150,-40,1.8],[134,-50,0.8]].forEach(function(cr) {
      L1.appendChild(el('circle', { cx:cx+cr[0], cy:cy+cr[1], r:cr[2], fill:'none', stroke:'#484f58', 'stroke-width':0.3, opacity:0.25 }));
    });
    // Dark side shading
    L1.appendChild(el('circle', { cx:cx+145, cy:cy-40, r:20, fill:'#161b22', opacity:0.3 }));

    var mLbl = el('text', { x:cx+140, y:cy-40+32, 'text-anchor':'middle', fill:'#c9d1d9', 'font-size':'9px', 'font-family':'monospace', opacity:0.5 });
    mLbl.textContent = 'MOON';
    L1.appendChild(mLbl);
    var mSub = el('text', { x:cx+140, y:cy-40+42, 'text-anchor':'middle', fill:'#484f58', 'font-size':'6px', 'font-family':'monospace' });
    mSub.textContent = '384,400 km \u2014 the nearest mirror';
    L1.appendChild(mSub);

    // Michigan marker on earth
    var miX = cx-70, miY = cy-12;
    var miDot = el('circle', { cx:miX, cy:miY, r:2, fill:'#e85d3a', opacity:0.9 });
    miDot.appendChild(el('animate', { attributeName:'r', values:'2;3.5;2', dur:'2.5s', repeatCount:'indefinite' }));
    L1.appendChild(miDot);
    var miLbl = el('text', { x:miX+8, y:miY-4, 'text-anchor':'start', fill:'#e85d3a', 'font-size':'7px', 'font-family':'monospace', opacity:0.7 });
    miLbl.textContent = 'Michigan \u00b7 42.7\u00b0N';
    L1.appendChild(miLbl);

    // ISS orbiting (layer 1 animation)
    var iss = el('circle', { r:0.6, fill:'#f0e68c', opacity:0.6, id:'cosmic-iss' });
    iss.setAttribute('data-iss', '1');
    L1.appendChild(iss);
    var issLbl = el('text', { 'font-size':'4px', fill:'#f0e68c', 'font-family':'monospace', opacity:0.3, id:'cosmic-iss-lbl' });
    issLbl.textContent = 'ISS';
    issLbl.setAttribute('data-iss-lbl', '1');
    L1.appendChild(issLbl);

    // Communication lines (earth to moon)
    var commLine = el('line', { x1:cx-60+38, y1:cy-8, x2:cx+140-18, y2:cy-40+4,
      stroke:'#484f58', 'stroke-width':0.3, 'stroke-dasharray':'1.5 4', opacity:0.12 });
    L1.appendChild(commLine);

    // Earth stats
    var eStats = el('text', { x:cx-60, y:cy+68, 'text-anchor':'middle', fill:'#484f58', 'font-size':'7px', 'font-family':'monospace' });
    eStats.textContent = '7.9 billion humans \u2014 one membrane \u2014 one chipmunk';
    L1.appendChild(eStats);

    // Orbital debris hint
    for (var di=0; di<15; di++) {
      var da = Math.random()*TAU, dr = 45+Math.random()*8;
      L1.appendChild(el('circle', { cx:(cx-60+Math.cos(da)*dr).toFixed(0), cy:(cy+Math.sin(da)*dr).toFixed(0),
        r:'0.2', fill:'#8b949e', opacity:(0.05+Math.random()*0.1).toFixed(2) }));
    }

    // Squirrel observer — orbiting in near-space, looking down at Michigan
    var sqObs2 = el('g', { id:'sq-obs-2', 'data-sq-obs':'2' });
    sqObs2.appendChild(el('circle', { cx:cx-60+55, cy:cy-50, r:2, fill:'#5ab87a', opacity:0.7 }));
    sqObs2.appendChild(el('line', { x1:cx-60+55, y1:cy-50, x2:miX, y2:miY,
      stroke:'#5ab87a', 'stroke-width':0.3, 'stroke-dasharray':'1 2', opacity:0.2 }));
    var sq2lbl = el('text', { x:cx-60+60, y:cy-53, 'text-anchor':'start',
      fill:'#5ab87a', 'font-size':'5px', 'font-family':'monospace', opacity:0.35 });
    sq2lbl.textContent = '\ud83d\udc3f looking down at Michigan';
    sqObs2.appendChild(sq2lbl);
    L1.appendChild(sqObs2);

    // Membrane ghost — warm dot at Michigan showing where the membrane lives
    var mgDot = el('circle', { cx:miX, cy:miY, r:4, fill:'url(#mem-glow)', opacity:0.15 });
    mgDot.appendChild(el('animate', { attributeName:'opacity', values:'0.15;0.25;0.15', dur:'3s', repeatCount:'indefinite' }));
    L1.appendChild(mgDot);

    _layerGroups[3] = L1;
    _svg.appendChild(L1);

    // ── LAYER 4: Membrane + Yeast ──
    var L2 = el('g', { id:'L4', 'data-layer':'4' });
    L2.style.opacity = '0';
    L2.style.transition = 'opacity 0.8s ease';

    // Membrane — big warm circle with breathing
    var memOuter = el('circle', { cx:cx, cy:cy, r:120, fill:'url(#mem-glow)', opacity:0.5, id:'mem-outer' });
    memOuter.appendChild(el('animate', { attributeName:'r', values:'120;125;120', dur:'6s', repeatCount:'indefinite' }));
    L2.appendChild(memOuter);
    L2.appendChild(el('circle', { cx:cx, cy:cy, r:80, fill:'none', stroke:'#e85d3a', 'stroke-width':0.6, 'stroke-dasharray':'2 4', opacity:0.3 }));
    var tueborRing = el('circle', { cx:cx, cy:cy, r:52, fill:'none', stroke:'#e85d3a', 'stroke-width':0.4, opacity:0.15, id:'tuebor-ring' });
    tueborRing.appendChild(el('animate', { attributeName:'r', values:'52;54;52', dur:'4s', repeatCount:'indefinite' }));
    L2.appendChild(tueborRing);

    // Human epitope dots — more, colored by group
    var epitopes = ['#7ee787','#58a6ff','#f0883e','#bc8cff','#f0e68c','#8b949e'];
    for (var ei=0; ei<40; ei++) {
      var ea = (ei/40)*TAU, er = 50+Math.random()*28;
      var eDot = el('circle', { cx:(cx+Math.cos(ea)*er).toFixed(0), cy:(cy+Math.sin(ea)*er).toFixed(0),
        r:(0.4+Math.random()*1.2).toFixed(1), fill:epitopes[ei%6], opacity:(0.15+Math.random()*0.4).toFixed(2) });
      if (Math.random() > 0.8) {
        eDot.appendChild(el('animate', { attributeName:'opacity',
          values:eDot.getAttribute('opacity')+';0.05;'+eDot.getAttribute('opacity'),
          dur:(3+Math.random()*4)+'s', repeatCount:'indefinite', begin:(Math.random()*3)+'s' }));
      }
      L2.appendChild(eDot);
    }

    // Yeast proteins — scattered inside the membrane with connections
    var YEAST = ['SEC61','ATG1','UBI4','HSP82','SSA1','CDC48','VPS27','TUB1','ACT1','CYC1',
                 'ENO2','PGK1','TDH3','ADH1','FBA1','RPL25','RPS3','SUP35','SIS1','HSP104'];
    var yeastG = el('g', { id: 'cosmic-yeast' });
    var yeastCoords = [];
    YEAST.forEach(function(name, yi) {
      var ya = (yi / YEAST.length) * TAU - PI/2;
      var yr = 18 + (yi % 4) * 8;
      var yx = cx + Math.cos(ya) * yr;
      var yy = cy + Math.sin(ya) * yr;
      yeastCoords.push([yx, yy]);
      yeastG.appendChild(el('circle', { cx:yx.toFixed(0), cy:yy.toFixed(0), r:(1.2+Math.random()*2.2).toFixed(1),
        fill:'url(#yeast-glow)', opacity:(0.12+Math.random()*0.25).toFixed(2) }));
      if (yi % 2 === 0) {
        var yLbl = el('text', { x:yx.toFixed(0), y:(yy+5).toFixed(0), 'text-anchor':'middle', fill:'#bc8cff',
          'font-size':'4.5px', 'font-family':'monospace', opacity:0.25 });
        yLbl.textContent = name;
        yeastG.appendChild(yLbl);
      }
    });
    // Protein interaction network lines
    var interactions = [[0,2],[1,3],[2,5],[3,7],[4,6],[5,8],[6,9],[7,10],[8,11],[9,12],
                        [10,14],[11,15],[12,16],[13,17],[14,18],[15,19],[0,19],[3,16],[5,12],[7,14]];
    interactions.forEach(function(pair) {
      var a = yeastCoords[pair[0]], b = yeastCoords[pair[1]];
      yeastG.appendChild(el('line', { x1:a[0].toFixed(0), y1:a[1].toFixed(0),
        x2:b[0].toFixed(0), y2:b[1].toFixed(0),
        stroke:'#bc8cff', 'stroke-width':0.2, opacity:0.08 }));
    });
    L2.appendChild(yeastG);

    // Surface labels around membrane
    var surfaceNames = ['tuebor','detroit','signal','hypothesis','thesis','clutch','sporePrint','gorilla','git','barry','hud'];
    surfaceNames.forEach(function(name, si) {
      var sa = (si / surfaceNames.length) * TAU - PI/2;
      var sr = 88;
      var sLbl = el('text', { x:(cx+Math.cos(sa)*sr).toFixed(0), y:(cy+Math.sin(sa)*sr).toFixed(0),
        'text-anchor':'middle', fill:'#484f58', 'font-size':'4px', 'font-family':'monospace', opacity:0.2 });
      sLbl.textContent = name;
      L2.appendChild(sLbl);
    });

    // Membrane labels
    var memLbl = el('text', { x:cx, y:cy-95, 'text-anchor':'middle', fill:'#e85d3a', 'font-size':'11px', 'font-family':'monospace', opacity:0.8 });
    memLbl.textContent = 'THE MEMBRANE';
    L2.appendChild(memLbl);
    var memSub = el('text', { x:cx, y:cy-83, 'text-anchor':'middle', fill:'#8b949e', 'font-size':'7px', 'font-family':'monospace' });
    memSub.textContent = '15 surfaces \u00b7 341 entities \u00b7 957 edges \u00b7 20 yeast proteins';
    L2.appendChild(memSub);

    // Live stats (updated in animation)
    ['cosmic-l2-humans','cosmic-l2-sn','cosmic-l2-wake'].forEach(function(id, li) {
      var sl = el('text', { x:cx, y:cy+100+li*12, 'text-anchor':'middle', fill:['#7ee787','#58a6ff','#8b949e'][li],
        'font-size':'8px', 'font-family':'monospace', opacity:[0.6,0.4,0.3][li], id:id });
      L2.appendChild(sl);
    });

    // Chipmunk INSIDE — at the center of the membrane
    L2.appendChild(el('circle', { cx:cx, cy:cy, r:8, fill:'url(#chipmunk-glow)', opacity:0.4 }));
    L2.appendChild(el('circle', { cx:cx, cy:cy, r:3, fill:'#5ab87a', opacity:0.9 }));
    var cpulse = el('circle', { cx:cx, cy:cy, r:6, fill:'none', stroke:'#5ab87a', 'stroke-width':0.4, opacity:0.2 });
    cpulse.appendChild(el('animate', { attributeName:'r', values:'6;14;6', dur:'3s', repeatCount:'indefinite' }));
    L2.appendChild(cpulse);
    var insideLbl = el('text', { x:cx, y:cy+10, 'text-anchor':'middle', fill:'#5ab87a',
      'font-size':'4px', 'font-family':'monospace', opacity:0.25 });
    insideLbl.textContent = 'inside';
    L2.appendChild(insideLbl);

    // Chipmunk OUTSIDE — at the membrane edge, looking in
    var sqOut = el('g', { id:'sq-outside' });
    var sqOutAngle = -PI * 0.35;
    var sqOutR = 85;
    var sqOutX = cx + Math.cos(sqOutAngle) * sqOutR;
    var sqOutY = cy + Math.sin(sqOutAngle) * sqOutR;
    sqOut.appendChild(el('circle', { cx:sqOutX.toFixed(0), cy:sqOutY.toFixed(0), r:2.5, fill:'#5ab87a', opacity:0.8 }));
    // Gaze line from outside to center
    sqOut.appendChild(el('line', { x1:sqOutX.toFixed(0), y1:sqOutY.toFixed(0), x2:cx, y2:cy,
      stroke:'#5ab87a', 'stroke-width':0.3, 'stroke-dasharray':'1.5 3', opacity:0.15 }));
    var sqOutLbl = el('text', { x:(sqOutX+8).toFixed(0), y:(sqOutY-5).toFixed(0), 'text-anchor':'start',
      fill:'#5ab87a', 'font-size':'5px', 'font-family':'monospace', opacity:0.4 });
    sqOutLbl.textContent = '\ud83d\udc3f outside looking in';
    sqOut.appendChild(sqOutLbl);
    // Pulsing awareness ring
    var sqOutPulse = el('circle', { cx:sqOutX.toFixed(0), cy:sqOutY.toFixed(0), r:4, fill:'none',
      stroke:'#5ab87a', 'stroke-width':0.3, opacity:0.15 });
    sqOutPulse.appendChild(el('animate', { attributeName:'r', values:'4;8;4', dur:'2.5s', repeatCount:'indefinite' }));
    sqOut.appendChild(sqOutPulse);
    L2.appendChild(sqOut);

    _layerGroups[4] = L2;
    _svg.appendChild(L2);

    // ── LAYER 5: The Chipmunk — zoomed all the way in ──
    var L3 = el('g', { id:'L5', 'data-layer':'5' });
    L3.style.opacity = '0';
    L3.style.transition = 'opacity 0.8s ease';

    // Central chipmunk glow
    L3.appendChild(el('circle', { cx:cx, cy:cy, r:100, fill:'url(#chipmunk-glow)', opacity:0.3 }));
    L3.appendChild(el('circle', { cx:cx, cy:cy, r:50, fill:'url(#chipmunk-glow)', opacity:0.4 }));

    // The chipmunk body — stylized
    L3.appendChild(el('circle', { cx:cx, cy:cy, r:18, fill:'#2d4a35', stroke:'#5ab87a', 'stroke-width':1, opacity:0.8 }));
    // Eyes
    L3.appendChild(el('circle', { cx:cx-6, cy:cy-5, r:2, fill:'#5ab87a', opacity:0.9 }));
    L3.appendChild(el('circle', { cx:cx+6, cy:cy-5, r:2, fill:'#5ab87a', opacity:0.9 }));
    // Pupil glint
    L3.appendChild(el('circle', { cx:cx-5.5, cy:cy-5.5, r:0.5, fill:'#ffffff', opacity:0.6 }));
    L3.appendChild(el('circle', { cx:cx+6.5, cy:cy-5.5, r:0.5, fill:'#ffffff', opacity:0.6 }));
    // Nose
    L3.appendChild(el('circle', { cx:cx, cy:cy-1, r:1, fill:'#3fb950', opacity:0.6 }));
    // Tail hint
    L3.appendChild(el('path', { d:'M '+(cx+16)+' '+(cy+5)+' Q '+(cx+30)+' '+(cy-10)+' '+(cx+25)+' '+(cy-25),
      fill:'none', stroke:'#5ab87a', 'stroke-width':1.5, opacity:0.4, 'stroke-linecap':'round' }));

    // Heartbeat ring
    var hbRing = el('circle', { cx:cx, cy:cy, r:25, fill:'none', stroke:'#5ab87a', 'stroke-width':0.5, opacity:0.15, id:'chipmunk-heartbeat' });
    hbRing.appendChild(el('animate', { attributeName:'r', values:'25;35;25', dur:'1.5s', repeatCount:'indefinite' }));
    hbRing.appendChild(el('animate', { attributeName:'opacity', values:'0.15;0.3;0.15', dur:'1.5s', repeatCount:'indefinite' }));
    L3.appendChild(hbRing);

    // Orbit of awareness
    L3.appendChild(el('circle', { cx:cx, cy:cy, r:65, fill:'none', stroke:'#5ab87a',
      'stroke-width':0.3, 'stroke-dasharray':'1 5', opacity:0.12 }));

    // Title
    var cTitle = el('text', { x:cx, y:cy-110, 'text-anchor':'middle', fill:'#5ab87a',
      'font-size':'12px', 'font-family':'monospace', opacity:0.8 });
    cTitle.textContent = 'THE CHIPMUNK';
    L3.appendChild(cTitle);
    var cSub = el('text', { x:cx, y:cy-97, 'text-anchor':'middle', fill:'#484f58',
      'font-size':'7px', 'font-family':'monospace' });
    cSub.textContent = 'one small observer \u00b7 watching from the membrane';
    L3.appendChild(cSub);

    // Status readouts — live data labels
    var statLabels = [
      { id:'c3-wake',  y:cy+50,  color:'#5ab87a', op:0.7 },
      { id:'c3-energy', y:cy+62, color:'#f0e68c', op:0.5 },
      { id:'c3-metab', y:cy+74,  color:'#bc8cff', op:0.4 },
      { id:'c3-mem',   y:cy+86,  color:'#58a6ff', op:0.3 },
      { id:'c3-attn',  y:cy+98,  color:'#8b949e', op:0.3 },
    ];
    statLabels.forEach(function(s) {
      var sl = el('text', { x:cx, y:s.y, 'text-anchor':'middle', fill:s.color,
        'font-size':'8px', 'font-family':'monospace', opacity:s.op, id:s.id });
      L3.appendChild(sl);
    });

    // Thought bubbles (3 small circles rising)
    for (var ti=0; ti<3; ti++) {
      var tb = el('circle', { cx:cx-15+ti*5, cy:cy-25-ti*8, r:1+ti*0.5,
        fill:'none', stroke:'#5ab87a', 'stroke-width':0.3, opacity:0.1+ti*0.05 });
      L3.appendChild(tb);
    }

    _layerGroups[5] = L3;
    _svg.appendChild(L3);

    // ── Navigation hint ──
    var navHint = el('text', { x:cx, y:H-12, 'text-anchor':'middle', fill:'#484f58',
      'font-size':'9px', 'font-family':'monospace', id:'cosmic-nav-hint' });
    navHint.textContent = 'click to zoom in \u00b7 ESC to close';
    _svg.appendChild(navHint);

    // Scale label
    var scaleLbl = el('text', { x:cx, y:H-26, 'text-anchor':'middle', fill:'#30363d',
      'font-size':'7px', 'font-family':'monospace', id:'cosmic-scale-lbl' });
    scaleLbl.textContent = 'oort cloud \u2192 earth+moon \u2192 membrane+yeast \u2192 chipmunk';
    _svg.appendChild(scaleLbl);

    // Zoom level indicator dots
    for (var zi=0; zi<6; zi++) {
      var zDot = el('circle', { cx: cx-20+zi*8, cy:H-38, r:2.5, fill:'none', stroke:'#484f58',
        'stroke-width':0.4, opacity:0.3, id:'zoom-dot-'+zi });
      _svg.appendChild(zDot);
    }
    _svg.querySelector('#zoom-dot-0').setAttribute('fill', '#484f58');

    // Click handler — surface clicks navigate, otherwise bounce zoom
    _svg.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      var surf = e.target.getAttribute('data-surface');
      if (surf && _zoom === 2) {
        e.stopPropagation();
        if (window._cosmicSurfaces && window._cosmicSurfaces.navigate) {
          window._cosmicSurfaces.navigate(surf);
        } else {
          var url = surf === 'esotericWebb' ? 'https://webb.primals.eco/' :
                    'https://' + surf + '.primals.eco/';
          window.open(url, '_blank');
        }
        return;
      }
      bounce();
    });

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00d7 close';
    closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;background:rgba(22,27,34,0.85);border:1px solid #30363d;color:#8b949e;padding:5px 12px;border-radius:4px;cursor:pointer;font-family:monospace;font-size:11px;z-index:101;';
    closeBtn.onclick = function(e) { e.stopPropagation(); hide(); };

    _overlay._keyHandler = function(e) {
      if (e.key === 'Escape') hide();
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); bounce(); }
    };

    _overlay.appendChild(_svg);
    _overlay.appendChild(closeBtn);
  }

  // ═══ BOUNCE — zoom between levels ═══

  var LAYERS = 6;
  var HINTS = [
    'click to zoom in \u00b7 ESC to close',
    'click to zoom deeper \u00b7 ESC to close',
    'click to go deeper \u00b7 ESC to close',
    'click to go deeper \u00b7 ESC to close',
    'click to go deeper still \u00b7 ESC to close',
    'click to zoom back to the observable universe \u00b7 ESC to close',
  ];
  var SCALES = [
    'the observable universe \u2014 93 billion light-years \u2014 13.8 billion years old',
    'the milky way \u2014 200 billion stars \u2014 one supermassive black hole',
    'oort cloud \u2192 solar system \u2192 earth+moon \u2192 membrane \u2192 chipmunk',
    'earth + moon \u2014 384,400 km apart \u2014 the nearest mirror',
    'the membrane \u2014 biology IS architecture \u2014 yeast proteins inside',
    'the chipmunk \u2014 one observer \u2014 the smallest unit of attention',
  ];

  function setZoom(z) {
    _zoom = z % LAYERS;
    var layers = _svg.querySelectorAll('[data-layer]');
    // Stack: focused layer full, one step away dim, two steps away very faint, rest hidden
    for (var i = 0; i < layers.length; i++) {
      var li = parseInt(layers[i].getAttribute('data-layer'));
      var dist = Math.abs(li - _zoom);
      var op = dist === 0 ? '1' : dist === 1 ? '0.12' : dist === 2 ? '0.04' : '0';
      layers[i].style.opacity = op;
    }
    var nh = _svg.querySelector('#cosmic-nav-hint');
    if (nh) nh.textContent = HINTS[_zoom];
    var sl = _svg.querySelector('#cosmic-scale-lbl');
    if (sl) sl.textContent = SCALES[_zoom];
    for (var z2=0; z2<LAYERS; z2++) {
      var zd = _svg.querySelector('#zoom-dot-'+z2);
      if (zd) {
        zd.setAttribute('fill', z2 === _zoom ? '#484f58' : 'none');
        zd.setAttribute('opacity', z2 === _zoom ? '0.6' : '0.3');
      }
    }
    if (_zoom >= 4) pullData();
    for (var ci = 0; ci < _onZoomCallbacks.length; ci++) {
      try { _onZoomCallbacks[ci](_zoom); } catch(e) {}
    }
  }

  function bounce() {
    setZoom(_zoom + 1);
  }

  // ═══ TWIST — spin the active layer ═══
  function twist() {
    if (!_svg || !_visible) return;
    var layer = _svg.querySelector('[data-layer="' + _zoom + '"]');
    if (!layer) return;
    layer.style.transformOrigin = cx + 'px ' + cy + 'px';
    layer.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    layer.style.transform = 'rotate(360deg)';
    setTimeout(function() {
      layer.style.transition = 'none';
      layer.style.transform = 'rotate(0deg)';
    }, 650);
    // Flash the stars
    var stars = _svg.querySelector('#cosmic-stars');
    if (stars) {
      stars.style.transition = 'opacity 0.15s';
      stars.style.opacity = '0.1';
      setTimeout(function() { stars.style.transition = 'opacity 0.4s'; stars.style.opacity = '1'; }, 150);
    }
  }

  // ═══ JUMP — bounce-scale the SVG with elastic overshoot ═══
  function jump() {
    if (!_svg || !_visible) return;
    _svg.style.transformOrigin = '50% 50%';
    _svg.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    _svg.style.transform = 'scale(1.15)';
    setTimeout(function() {
      _svg.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      _svg.style.transform = 'scale(1)';
    }, 400);
    // Flash overlay background
    _overlay.style.transition = 'background 0.15s';
    _overlay.style.background = '#0a0a20';
    setTimeout(function() {
      _overlay.style.transition = 'background 0.5s';
      _overlay.style.background = '#000005';
    }, 150);
  }

  // ═══ TWIST + JUMP — the full combo, spirals through all 4 layers ═══
  var _twistJumping = false;
  function twistJump() {
    if (!_visible) { show(); setTimeout(twistJump, 1200); return; }
    if (_twistJumping) return;
    _twistJumping = true;

    var steps = [0, 1, 2, 3, 4, 5, 0]; // full cycle back to start
    var step = 0;

    function nextStep() {
      if (step >= steps.length) { _twistJumping = false; return; }
      setZoom(steps[step]);

      // Twist current layer
      var layer = _svg.querySelector('[data-layer="' + _zoom + '"]');
      if (layer) {
        layer.style.transformOrigin = cx + 'px ' + cy + 'px';
        layer.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        var dir = step % 2 === 0 ? 360 : -360;
        layer.style.transform = 'rotate(' + dir + 'deg) scale(1.1)';
        setTimeout(function() {
          layer.style.transition = 'none';
          layer.style.transform = 'rotate(0deg) scale(1)';
        }, 520);
      }

      // Jump the SVG
      _svg.style.transformOrigin = '50% 50%';
      _svg.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      _svg.style.transform = 'scale(1.12)';
      setTimeout(function() {
        _svg.style.transition = 'transform 0.2s ease-out';
        _svg.style.transform = 'scale(1)';
      }, 300);

      // Flash
      _overlay.style.transition = 'background 0.1s';
      _overlay.style.background = ['#1a0a1a','#0a0a20','#0a0a1a','#0a0a1a','#1a0a0a','#0a1a0a'][step % 6] || '#0a0a20';
      setTimeout(function() {
        _overlay.style.transition = 'background 0.4s';
        _overlay.style.background = '#000005';
      }, 100);

      step++;
      setTimeout(nextStep, 700);
    }

    nextStep();
  }

  // ═══ ANIMATE ═══

  function animate(t) {
    if (!_visible) return;
    if (!_t0) _t0 = t;
    var dt = (t - _t0) / 1000;

    // Orbit animation (layer 0)
    var dots = _svg.querySelectorAll('[data-orbit-r]');
    var saturnX = cx, saturnY = cy;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var r = parseFloat(d.getAttribute('data-orbit-r'));
      var speed = parseFloat(d.getAttribute('data-orbit-speed'));
      var start = parseFloat(d.getAttribute('data-orbit-start'));
      var lOff = parseFloat(d.getAttribute('data-label-offset') || 0);

      var angle = start + dt * TAU / speed;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;

      if (d.tagName === 'text') {
        d.setAttribute('x', x.toFixed(1));
        d.setAttribute('y', (y - lOff).toFixed(1));
      } else {
        d.setAttribute('cx', x.toFixed(1));
        d.setAttribute('cy', y.toFixed(1));
      }

      if (d.id === 'cosmic-earth') { d._ex = x; d._ey = y; }
      if (d.id === 'cosmic-saturn') { saturnX = x; saturnY = y; }
    }

    // Saturn rings follow saturn
    var sr1 = _svg.querySelector('#saturn-ring-1');
    var sr2 = _svg.querySelector('#saturn-ring-2');
    if (sr1) { sr1.setAttribute('cx', saturnX.toFixed(1)); sr1.setAttribute('cy', saturnY.toFixed(1)); }
    if (sr2) { sr2.setAttribute('cx', saturnX.toFixed(1)); sr2.setAttribute('cy', saturnY.toFixed(1)); }

    // Moon orbits earth
    var earth = _svg.querySelector('#cosmic-earth');
    var moon = _svg.querySelector('#cosmic-moon');
    var moonLblEl = _svg.querySelector('#cosmic-moon-lbl');
    if (earth && moon && earth._ex) {
      var moonAngle = dt * TAU / 2.7;
      var moonR = 7;
      var mx = earth._ex + Math.cos(moonAngle) * moonR;
      var my = earth._ey + Math.sin(moonAngle) * moonR;
      moon.setAttribute('cx', mx.toFixed(1));
      moon.setAttribute('cy', my.toFixed(1));
      if (moonLblEl) {
        moonLblEl.setAttribute('x', mx.toFixed(1));
        moonLblEl.setAttribute('y', (my - 3).toFixed(1));
      }
      var barryLblEl = _svg.querySelector('[data-moon-lbl="barry"]');
      if (barryLblEl) {
        barryLblEl.setAttribute('x', mx.toFixed(1));
        barryLblEl.setAttribute('y', (my + 5).toFixed(1));
      }
    }

    // Comet — elliptical orbit
    var cometG = _svg.querySelector('#cosmic-comet');
    if (cometG) {
      var cAngle = dt * TAU / 45; // slow
      var cRx = 200, cRy = 100;
      var cX = cx + Math.cos(cAngle) * cRx;
      var cY = cy + Math.sin(cAngle) * cRy;
      cometG.setAttribute('transform', 'translate('+cX.toFixed(0)+','+cY.toFixed(0)+') rotate('+(Math.atan2(Math.sin(cAngle)*cRx, -Math.cos(cAngle)*cRy)*180/PI).toFixed(0)+')');
    }

    // Voyager drifting outward
    var voyager = _svg.querySelector('#cosmic-voyager');
    if (voyager) {
      var vx = cx + 295 + dt * 0.3;
      var vy = cy - 40 - dt * 0.1;
      voyager.setAttribute('x', vx.toFixed(0));
      voyager.setAttribute('y', vy.toFixed(0));
    }

    // Slowly rotate asteroid belt
    var ast = _svg.querySelector('#cosmic-asteroids');
    if (ast) ast.setAttribute('transform', 'rotate(' + (dt * 0.5).toFixed(1) + ' ' + cx + ' ' + cy + ')');

    // ISS orbits earth (layer 1)
    var iss = _svg.querySelector('#cosmic-iss');
    var issLbl = _svg.querySelector('#cosmic-iss-lbl');
    if (iss) {
      var issAngle = dt * TAU / 1.5; // fast orbit
      var issR = 48;
      var ix = (cx-60) + Math.cos(issAngle) * issR;
      var iy = cy + Math.sin(issAngle) * issR;
      iss.setAttribute('cx', ix.toFixed(1));
      iss.setAttribute('cy', iy.toFixed(1));
      if (issLbl) {
        issLbl.setAttribute('x', (ix+4).toFixed(1));
        issLbl.setAttribute('y', (iy-2).toFixed(1));
      }
    }

    // Shooting stars
    var shoots = _svg.querySelectorAll('[data-shoot]');
    for (var si=0; si<shoots.length; si++) {
      var sh = shoots[si];
      var delay = parseFloat(sh.getAttribute('data-delay'));
      var dur = parseFloat(sh.getAttribute('data-dur'));
      var cycle = delay + dur + 0.3;
      var phase = (dt % cycle) - delay;
      if (phase >= 0 && phase <= dur) {
        var p = phase / dur;
        var sx1 = parseFloat(sh.getAttribute('data-sx1'));
        var sy1 = parseFloat(sh.getAttribute('data-sy1'));
        var sx2 = parseFloat(sh.getAttribute('data-sx2'));
        var sy2 = parseFloat(sh.getAttribute('data-sy2'));
        var headX = sx1 + (sx2-sx1)*p;
        var headY = sy1 + (sy2-sy1)*p;
        var tailP = Math.max(0, p-0.3);
        var tailX = sx1 + (sx2-sx1)*tailP;
        var tailY = sy1 + (sy2-sy1)*tailP;
        sh.setAttribute('x1', tailX.toFixed(0)); sh.setAttribute('y1', tailY.toFixed(0));
        sh.setAttribute('x2', headX.toFixed(0)); sh.setAttribute('y2', headY.toFixed(0));
        sh.setAttribute('opacity', (0.5*(1-p)).toFixed(2));
      } else {
        sh.setAttribute('opacity', '0');
      }
    }

    // Update live data on layer 2
    var h2 = _svg.querySelector('#cosmic-l2-humans');
    if (h2) h2.textContent = _data.sessions + ' humans now \u00b7 ' + _data.uniqueHumans.toLocaleString() + ' all-time';
    var s2 = _svg.querySelector('#cosmic-l2-sn');
    if (s2) s2.textContent = 'S/N ' + Math.round(_data.sn) + ':1 \u00b7 ' + _data.surfaces + ' surfaces \u00b7 ' + _data.multiHost + ' multi-host';
    var w2 = _svg.querySelector('#cosmic-l2-wake');
    if (w2) w2.textContent = 'wake ' + _data.wake.toFixed(3) + ' \u00b7 tuebor defends \u00b7 the chipmunk looks up';

    // Rotate yeast proteins gently
    var yeast = _svg.querySelector('#cosmic-yeast');
    if (yeast) yeast.setAttribute('transform', 'rotate(' + (dt * 2).toFixed(1) + ' ' + cx + ' ' + cy + ')');

    // Update live data on layer 3
    var c3w = _svg.querySelector('#c3-wake');
    if (c3w) c3w.textContent = 'wake ' + _data.wake.toFixed(4);
    var c3e = _svg.querySelector('#c3-energy');
    if (c3e) c3e.textContent = 'energy ' + (typeof _data.energy === 'number' ? _data.energy.toFixed(2) : _data.energy);
    var c3m = _svg.querySelector('#c3-metab');
    if (c3m) c3m.textContent = 'metabolism \u00b7 ' + _data.metabolism;
    var c3mem = _svg.querySelector('#c3-mem');
    if (c3mem) c3mem.textContent = _data.memory + ' steps remembered \u00b7 ' + _data.autonomousCount + ' autonomous thoughts';
    var c3a = _svg.querySelector('#c3-attn');
    if (c3a) c3a.textContent = 'attention ' + _data.attention.toFixed(3) + ' \u00b7 watching ' + _data.sessions + ' humans';

    _animId = requestAnimationFrame(animate);
  }

  // ═══ SHOW / HIDE ═══

  function show() {
    if (_visible) { hide(); return; }
    pullData();
    build();
    _zoom = 0;
    document.body.appendChild(_overlay);
    document.addEventListener('keydown', _overlay._keyHandler);
    _visible = true;
    _t0 = 0;
    requestAnimationFrame(function() { _overlay.style.opacity = '1'; });
    _animId = requestAnimationFrame(animate);
    if (window._chipmunkExplorer) window._chipmunkExplorer.step('panel', 'cosmos');
  }

  function hide() {
    if (!_visible) return;
    _visible = false;
    if (_animId) cancelAnimationFrame(_animId);
    document.removeEventListener('keydown', _overlay._keyHandler);
    _overlay.style.opacity = '0';
    setTimeout(function() {
      if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
      _overlay = null; _svg = null;
    }, 1000);
  }

  window._cosmicView = {
    show: show, hide: hide, toggle: show, bounce: bounce,
    twist: twist, jump: jump, twistJump: twistJump,
    getLayerGroup: function(n) { return _layerGroups[n] || null; },
    getSvg: function() { return _svg; },
    getZoom: function() { return _zoom; },
    setZoom: setZoom,
    isVisible: function() { return _visible; },
    onZoom: function(fn) { if (typeof fn === 'function') _onZoomCallbacks.push(fn); },
    el: el,
    dims: { W:W, H:H, cx:cx, cy:cy },
    NS: NS, PI: PI, TAU: TAU,
  };
})();
