// pt-ionosphere.js — ionosphere globe SVG + signal transit
// π-budget: ⌊π²⌋=9 max particles · π-spaced grid
// Epitope layers: WAS (coasts/grid) → IS (arcs/dots/particles)
window.PtIonosphere = function() {
  var _m = window._membrane || {};
  var el = (_m || window._membrane || {}).el || function(tag,a,p){var e=document.createElementNS(NS||'http://www.w3.org/2000/svg',tag);if(a)for(var k in a)e.setAttribute(k,''+a[k]);if(p)p.appendChild(e);return e;};
  var PI = _m.PI || Math.PI, NS = _m.NS || 'http://www.w3.org/2000/svg';
  var G = {W:700, H:400};
  var svgRoot, built = false, geoData = null;
  var MAX_P = Math.floor(PI*PI);
  var particles = [], lastFrame = 0;

  function txt(par, x, y, str, fill, size, ex) {
    var a = {x:x, y:y, fill:fill, 'font-size':size, 'text-anchor':'middle'};
    if (ex) for (var k in ex) a[k] = ex[k];
    var e = el('text', a, par);
    e.textContent = str;
    return e;
  }

  var POS = {
    US:[-98,38],CN:[-104,35],IE:[-8,53],BY:[28,53],GB:[-2,54],
    DE:[10,51],FR:[2,46],JP:[138,36],IN:[78,22],BR:[-51,-10],
    RU:[100,60],AU:[134,-25],CA:[-106,56],KR:[127,36],SG:[104,1],
    NL:[5,52],SE:[16,62],FI:[26,64],NO:[10,62],IL:[35,31],
    HK:[114,22],TW:[121,24],UA:[32,49],PL:[20,52],ES:[-4,40],
    IT:[12,42],CH:[8,47],AT:[14,47],BE:[4,51],DK:[10,56],
    MX:[-102,23],AR:[-64,-34],CL:[-71,-35],CO:[-74,4],ZA:[26,-29],
    NG:[8,10],KE:[38,0],EG:[31,27],AE:[54,24],SA:[45,24],
    TR:[35,39],GR:[22,39],CZ:[15,50],RO:[25,46],HU:[19,47],
    'IE/US':[-40,48],'??':[0,0]
  };
  var US_REG = {
    California:[-120,37],Michigan:[-85,44],Texas:[-99,31],
    Virginia:[-79,38],Washington:[-121,47],Colorado:[-106,39],
    'New Jersey':[-74,40],'New York':[-74,41],Massachusetts:[-72,42],
    Illinois:[-89,40],Oregon:[-121,44],Arizona:[-112,34],
    Florida:[-82,28],Georgia:[-84,33],Pennsylvania:[-78,41],
    Ohio:[-83,40],'North Carolina':[-80,35]
  };
  var COASTS = [
    'M 85,95 L 80,100 75,108 72,118 74,130 82,140 95,148 110,145 115,138 130,135 140,132 148,128 152,120 148,112 140,105 130,100 120,98 105,95 Z',
    'M 125,175 L 120,185 118,200 122,220 130,240 138,260 135,275 128,280 130,270 125,255 115,235 112,220 115,200 120,185 Z',
    'M 310,80 L 315,85 325,88 340,85 345,90 350,95 345,100 335,105 320,108 310,105 305,98 308,90 Z',
    'M 310,130 L 305,140 310,155 320,170 330,185 340,200 345,210 340,225 330,230 318,225 305,210 300,195 298,180 295,165 300,150 305,140 Z',
    'M 350,80 L 365,75 385,78 405,80 420,85 440,90 460,95 475,100 480,110 470,118 455,115 440,112 425,105 410,100 395,95 380,90 365,85 Z',
    'M 460,210 L 470,205 485,208 495,215 498,225 492,235 480,238 468,232 460,222 Z'
  ];

  function proj(lon, lat) {
    return [30+(lon+180)/360*(G.W-60), 20+(90-lat)/180*(G.H-40)];
  }

  function build() {
    var host = document.getElementById('ionosphere-svg');
    if (!host) return;
    var W=G.W, H=G.H;
    var svg = el('svg', {viewBox:'0 0 '+W+' '+H});
    svg.style.cssText = 'width:100%;max-height:420px;font-family:"Courier New",monospace;cursor:crosshair';
    var defs = el('defs', null, svg);
    defs.innerHTML = '<radialGradient id="iono-bg" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#0a0e17" stop-opacity="0.9"/><stop offset="100%" stop-color="#050810" stop-opacity="1"/></radialGradient><filter id="iono-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="iono-soft"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    el('rect', {width:W, height:H, fill:'url(#iono-bg)', rx:8}, svg);

    // \u2550\u2550 WAS layer: grid + coasts \u2550\u2550
    var wasG = el('g', {id:'iono-was'}, svg);
    var lonStep = Math.round(360/Math.floor(4*PI));
    for (var lon=-180; lon<=180; lon+=lonStep) {
      var p = proj(lon, 0);
      el('line', {x1:p[0], y1:20, x2:p[0], y2:H-20, stroke:'#1a1f2e', 'stroke-width':0.5}, wasG);
    }
    var latStep = Math.round(PI*PI*2);
    for (var lat=-60; lat<=80; lat+=latStep) {
      var pL=proj(-180,lat), pR=proj(180,lat);
      el('line', {x1:pL[0], y1:pL[1], x2:pR[0], y2:pR[1], stroke:'#1a1f2e', 'stroke-width':0.5}, wasG);
    }
    COASTS.forEach(function(d) { el('path', {d:d, fill:'none', stroke:'#1e2639', 'stroke-width':1, opacity:0.6}, wasG); });

    txt(svg, W/2, 14, 'ionosphere \u2014 signal transit across the surface', '#4a8fb8', 10, {opacity:0.8});

    // membrane beacon
    var mp = proj(-83, 43);
    var pulse = el('circle', {cx:mp[0], cy:mp[1], r:12, fill:'none', stroke:'#5ab87a', 'stroke-width':0.8, opacity:0.3}, svg);
    el('animate', {attributeName:'r', values:'5;15;5', dur:'3s', repeatCount:'indefinite'}, pulse);
    el('animate', {attributeName:'opacity', values:'0.4;0.1;0.4', dur:'3s', repeatCount:'indefinite'}, pulse);
    el('circle', {cx:mp[0], cy:mp[1], r:3, fill:'#5ab87a', filter:'url(#iono-glow)'}, svg);
    txt(svg, mp[0], mp[1]-8, 'membrane', '#5ab87a', 7, {opacity:0.7});

    // \u2550\u2550 IS layer: live data \u2550\u2550
    el('g', {id:'iono-arcs'}, svg);
    el('g', {id:'iono-dots'}, svg);
    el('g', {id:'iono-particles'}, svg);

    if (geoData && geoData.length > 0) renderData(svg, geoData);

    // legend
    [['signal','#e85d3a'],['topology','#9b59b6'],['philosophy','#3fb950'],['method','#58a6ff'],['investigation','#f1c40f'],['immune','#ff6b35']].forEach(function(l, i) {
      var row=Math.floor(i/3), col=i%3, lx=10+col*80, ly=H-50+row*11;
      el('circle', {cx:lx+4, cy:ly-2, r:2, fill:l[1], opacity:0.8}, svg);
      txt(svg, lx+10, ly, l[0], '#6e7681', 6, {'text-anchor':'start'});
    });
    txt(svg, W-10, H-8, '', '#484f58', 6, {'text-anchor':'end', id:'iono-stats'});
    txt(svg, W-10, H-20, '\u03c0-budget: \u230a\u03c0\u00b2\u230b='+MAX_P+' particles', '#484f58', 5.5, {'text-anchor':'end'});

    host.innerHTML = ''; host.appendChild(svg);
    svgRoot = svg; built = true;
  }

  function renderData(svg, geo) {
    var arcG = svg.querySelector('#iono-arcs')||svg;
    var dotG = svg.querySelector('#iono-dots')||svg;
    var mp = proj(-83, 43);
    var tot = 0; geo.forEach(function(g){tot+=g.requests;});
    geo.forEach(function(g) {
      if (g.country==='??' || !g.requests) return;
      var pos = POS[g.country]; if (!pos) return;
      var p = proj(pos[0], pos[1]);
      var pct = tot>0 ? g.requests/tot : 0;
      var r = Math.max(2, Math.min(4*PI, Math.sqrt(pct)*20));
      var mx=(mp[0]+p[0])/2, my=Math.min(mp[1],p[1])-20-pct*80;
      el('path', {d:'M '+mp[0]+' '+mp[1]+' Q '+mx+' '+my+' '+p[0]+' '+p[1], fill:'none', stroke:'#4a8fb8', 'stroke-width':(0.5+pct*3).toFixed(1), 'stroke-opacity':(0.15+pct*0.4).toFixed(2), 'stroke-dasharray':'3,4'}, arcG);
      if (pct>0.05) el('path', {d:'M '+mp[0]+' '+mp[1]+' Q '+mx+' '+(my-10)+' '+p[0]+' '+p[1], fill:'none', stroke:'#58a6ff', 'stroke-width':(pct*6).toFixed(1), 'stroke-opacity':0.08, filter:'url(#iono-soft)'}, arcG);
      var color = pct>0.3 ? '#e85d3a' : pct>0.1 ? '#f1c40f' : '#4a8fb8';
      var da = {cx:p[0], cy:p[1], r:r.toFixed(1), fill:color, opacity:(0.3+pct*0.5).toFixed(2)};
      if (pct>0.1) da.filter = 'url(#iono-glow)';
      el('circle', da, dotG);
      if (pct>0.01) txt(dotG, p[0], p[1]+r+8, g.country+' ('+(pct*100).toFixed(1)+'%)', '#6e7681', 6);
      if (g.country==='US' && g.regions) {
        g.regions.forEach(function(reg) {
          var rp=US_REG[reg.region]; if(!rp || reg.requests<50) return;
          var rPt=proj(rp[0],rp[1]);
          var regPct = tot>0 ? reg.requests/tot : 0;
          var regR = Math.max(1.5, Math.min(PI*2.5, Math.sqrt(regPct)*15));
          el('circle', {cx:rPt[0], cy:rPt[1], r:regR.toFixed(1), fill:regPct>0.3?'#e85d3a':'#f1c40f', opacity:(0.2+regPct*0.4).toFixed(2)}, dotG);
          if (regPct>0.005) txt(dotG, rPt[0], rPt[1]-regR-2, reg.region, '#484f58', 5);
        });
      }
    });
    var stat = svg.querySelector('#iono-stats');
    if (stat) {
      var c=geo.filter(function(g){return g.country!=='??';}).length;
      var nullC=geo.filter(function(g){return g.country==='??';}).reduce(function(s,g){return s+g.requests;},0);
      var cas = window._cascade;
      var projStr = '';
      if (cas && cas[0] && cas[0].proj_up > 0) projStr = ' \u00b7 \u2191' + (cas[0].proj_up*100).toFixed(0) + '% classified';
      stat.textContent = c + ' countries \u00b7 ' + tot.toLocaleString() + ' signals' + (nullC > 0 ? ' \u00b7 \u2193' + nullC + ' null' : '') + projStr;
    }
  }

  function spawnP() {
    if (particles.length>=MAX_P || !geoData || !geoData.length) return;
    var tot=0; geoData.forEach(function(g){tot+=g.requests;});
    var pick=Math.random()*tot, acc=0, tgt=geoData[0];
    for (var i=0; i<geoData.length; i++) { acc+=geoData[i].requests; if(acc>=pick){tgt=geoData[i]; break;} }
    var pos=POS[tgt.country]; if(!pos) return;
    var dest=proj(pos[0],pos[1]), mp=proj(-83,43);
    var inb = Math.random()>0.3;
    particles.push({
      sx:inb?dest[0]:mp[0], sy:inb?dest[1]:mp[1],
      ex:inb?mp[0]:dest[0], ey:inb?mp[1]:dest[1],
      t:0, speed:0.4+Math.random()*0.6,
      color:inb?'#4a8fb8':'#5ab87a', el:null
    });
  }

  function animate(now) {
    if (!built) { requestAnimationFrame(animate); return; }
    var dt = lastFrame ? (now-lastFrame)/1000 : 0.016;
    if (dt>0.1) dt=0.1;
    lastFrame = now;
    var pg = svgRoot ? svgRoot.querySelector('#iono-particles') : null;
    if (!pg) { requestAnimationFrame(animate); return; }
    if (Math.random()<dt*2 && geoData) spawnP();
    var rm = [];
    particles.forEach(function(p, i) {
      p.t += p.speed*dt;
      if (p.t>=1) { rm.push(i); if(p.el&&p.el.parentNode) p.el.parentNode.removeChild(p.el); return; }
      var mx=(p.sx+p.ex)/2, my=Math.min(p.sy,p.ey)-30, t=p.t;
      var x=(1-t)*(1-t)*p.sx + 2*(1-t)*t*mx + t*t*p.ex;
      var y=(1-t)*(1-t)*p.sy + 2*(1-t)*t*my + t*t*p.ey;
      var op = t<0.1 ? t/0.1 : t>0.85 ? (1-t)/0.15 : 0.9;
      if (!p.el) p.el = el('circle', {fill:p.color, r:1.5}, pg);
      p.el.setAttribute('cx', x.toFixed(1));
      p.el.setAttribute('cy', y.toFixed(1));
      p.el.setAttribute('opacity', op.toFixed(2));
    });
    for (var i=rm.length-1; i>=0; i--) particles.splice(rm[i], 1);
    requestAnimationFrame(animate);
  }

  function updateGeo(geo) {
    if (geo.length>0 && (!geoData || JSON.stringify(geo)!==JSON.stringify(geoData))) {
      geoData = geo;
      if (built) {
        var aG=svgRoot.querySelector('#iono-arcs'), dG=svgRoot.querySelector('#iono-dots');
        if(aG) aG.innerHTML=''; if(dG) dG.innerHTML='';
        renderData(svgRoot, geo);
      }
    }
  }

  return {build:build, animate:animate, renderData:renderData, updateGeo:updateGeo, svgEl:function(){return svgRoot;}};
};
