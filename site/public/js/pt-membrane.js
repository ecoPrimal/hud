// pt-membrane.js — membrane focal-point SVG + transit animation
// π-budget: ⌊π³⌋=31 max particles · WAS/IS/WILLBE epitope layers
// Abstracted: el() + txt() primitives compress SVG DOM creation
// Evolve: grouped layers make adding new elements structural
window.PtMembrane = function(deps) {
  var PI = deps.PI, dimCost = deps.dimCost, PANELS = deps.PANELS;
  var CAT_COLORS = deps.CAT_COLORS, aliveSet = deps.aliveSet;
  var NS = 'http://www.w3.org/2000/svg';
  var MG = {W:700, H:480, R:Math.round(PI*54), cx:350, cy:250};
  var geo = {}, particles = [], pulses = {}, arcGlow = {};
  var pGroup, built = false, lastFrame = 0;
  var MAX_P = Math.floor(PI*PI*PI);
  var rates = {fire:0,membrane:0,immune:0,sound:0}, rps = 0, prevDash = null;
  var catAccum = {fire:0,membrane:0,immune:0,sound:0};
  var CATS = ['fire','membrane','immune','sound'];

  function el(tag, a, par) {
    var e = document.createElementNS(NS, tag);
    if (a) for (var k in a) e.setAttribute(k, ''+a[k]);
    if (par) par.appendChild(e);
    return e;
  }
  function txt(par, x, y, str, fill, size, ex) {
    var a = {x:x, y:y, fill:fill, 'font-size':size, 'text-anchor':'middle'};
    if (ex) for (var k in ex) a[k] = ex[k];
    var e = el('text', a, par);
    e.textContent = str;
    return e;
  }

  function entityToCategory(label) {
    if (/Anthropic|OpenAI|Meta|Google|Amazon|Apple|Microsoft|ByteDance|Yandex|Baidu/i.test(label)) return 'fire';
    if (/Ghost|proxy|VPN|Tor/i.test(label)) return 'immune';
    if (/Bot|crawler|spider|scanner/i.test(label)) return 'membrane';
    if (/Human|organic/i.test(label)) return 'sound';
    return 'fire';
  }

  function spawnParticle(pid) {
    var g = geo[pid];
    if (!g || particles.length >= MAX_P) return;
    particles.push({
      id:pid, angle:g.angle+(Math.random()-0.5)*0.15,
      r:g.R+50+Math.random()*40, targetR:g.R-g.focalR,
      speed:35+Math.random()*25+g.dim*8, color:g.color,
      cat:g.cat, dim:g.dim, size:1+g.dim*0.4, opacity:0, el:null
    });
  }

  function pulse(pid) {
    pulses[pid] = {scale:2.2, decay:0.92};
    var d = document.getElementById('mg-dot-'+pid);
    if (d) d.setAttribute('filter','url(#mg-pulse)');
  }

  function ingest(dash, topo) {
    rps = dash.rps || 0;
    var ents = (topo && topo.entities) || [];
    var ct = {fire:0,membrane:0,immune:0,sound:0}, tot = 0;
    ents.forEach(function(e) {
      ct[entityToCategory(e.label||'')] += e.total_requests||0;
      tot += e.total_requests||0;
    });
    var s = tot > 0 ? (rps*0.3)/tot : 0;
    CATS.forEach(function(c) { rates[c] = ct[c]*s; });
    CATS.forEach(function(c) {
      arcGlow[c] = Math.max(arcGlow[c]||0, (tot>0 ? ct[c]/tot : 0)*0.6);
    });
    if (prevDash) {
      var pe = prevDash.epitope_summary||{}, ce = dash.epitope_summary||{};
      Object.keys(ce).forEach(function(k) { if (ce[k]!==pe[k]) pulse('epitope-summary'); });
      if (dash.total_requests !== prevDash.total_requests) pulse('summary-kpis');
      if ((dash.fleet_pct||0) !== (prevDash.fleet_pct||0)) pulse('honesty');
      if ((dash.epitope_clusters||[]).length !== (prevDash.epitope_clusters||[]).length) {
        pulse('bingo'); pulse('epitope-mx'); pulse('organism-profile');
      }
    }
    var tb = dash.threebody_pi;
    if (tb && tb.emc2) {
      var map = {is:['energy',0.5], was:['mass',4], willbe:['c_squared',0.6]};
      var fmt = {is:function(v){return 'E = '+v.toFixed(2)+' \u2248 4\u03c0';}, was:function(v){return 'm = '+v.toFixed(3);}, willbe:function(v){return 'c\u00b2 = '+v.toFixed(2)+' \u2248 3\u03c0';}};
      ['is','was','willbe'].forEach(function(b) {
        var val = tb.emc2[map[b][0]];
        var vE = document.getElementById('mg-body-val-'+b);
        if (vE) vE.textContent = fmt[b](val);
        var rE = document.getElementById('mg-body-ring-'+b);
        if (rE) rE.setAttribute('r', (12+val*map[b][1]).toFixed(1));
      });
    }
    prevDash = JSON.parse(JSON.stringify(dash));
  }

  function build() {
    var host = document.getElementById('membrane-focal-svg');
    if (!host) return;
    var W=MG.W, H=MG.H, cx=MG.cx, cy=MG.cy, R=MG.R;
    var TAU = 2*PI, GAP = PI/80;

    var svg = el('svg', {viewBox:'0 0 '+W+' '+H});
    svg.style.cssText = 'width:100%;max-height:460px;font-family:"Courier New",monospace';

    var defs = el('defs', null, svg);
    defs.innerHTML = '<radialGradient id="mg-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a1a2e" stop-opacity="0.6"/><stop offset="100%" stop-color="#0d1117" stop-opacity="0.9"/></radialGradient><filter id="mg-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="mg-pulse"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    el('rect', {width:W, height:H, fill:'url(#mg-bg)', rx:8}, svg);
    txt(svg, W/2, 22, 'Membrane \u2014 signal transit through the lens', '#c9d1d9', 11);

    // \u2550\u2550 WAS layer: static structure \u2550\u2550
    var wasG = el('g', {id:'mg-was'}, svg);
    var catPanels = {}; CATS.forEach(function(c){catPanels[c]=[];});
    PANELS.forEach(function(p){if(catPanels[p.cat]) catPanels[p.cat].push(p);});
    var total = PANELS.length, usable = TAU - GAP*CATS.length;
    var arcStarts = {}, arcSpans = {}, theta = -PI/2;
    CATS.forEach(function(cat) {
      var span = (catPanels[cat].length/total)*usable;
      arcStarts[cat] = theta; arcSpans[cat] = span;
      theta += span + GAP;
    });
    var catLabels = {fire:'signal',membrane:'membrane',immune:'immune',sound:'beacon'};
    CATS.forEach(function(cat) {
      var color = CAT_COLORS[cat]||'#6e7681';
      var start = arcStarts[cat], span = arcSpans[cat], end = start+span;
      var x1=cx+R*Math.cos(start), y1=cy+R*Math.sin(start);
      var x2=cx+R*Math.cos(end), y2=cy+R*Math.sin(end);
      el('path', {d:'M '+x1.toFixed(1)+' '+y1.toFixed(1)+' A '+R+' '+R+' 0 '+(span>PI?1:0)+' 1 '+x2.toFixed(1)+' '+y2.toFixed(1), fill:'none', stroke:color, 'stroke-width':2.5, 'stroke-opacity':0.5, id:'mg-arc-'+cat}, wasG);
      arcGlow[cat] = 0;
      var mid = start+span/2;
      txt(wasG, (cx+(R+22)*Math.cos(mid)).toFixed(1), (cy+(R+22)*Math.sin(mid)).toFixed(1), catLabels[cat]||cat, color, 8, {opacity:0.7, 'dominant-baseline':'central'});
    });
    CATS.forEach(function(cat) {
      var panels = catPanels[cat], start = arcStarts[cat], span = arcSpans[cat];
      var color = CAT_COLORS[cat]||'#6e7681';
      panels.forEach(function(p, i) {
        var t = panels.length===1 ? 0.5 : i/(panels.length-1);
        var angle = start + span*(0.1+0.8*t);
        var px=cx+R*Math.cos(angle), py=cy+R*Math.sin(angle);
        var txd=-Math.sin(angle), tyd=Math.cos(angle);
        var cost = dimCost(p.dim), fd = 1/cost;
        var tLen=fd*120, fR=fd*R*0.85;
        var nxd=-Math.cos(angle), nyd=-Math.sin(angle);
        var fx=px+nxd*fR, fy=py+nyd*fR;
        var alive = aliveSet.has(p.id), op = alive?1:0.25;
        geo[p.id] = {angle:angle, px:px, py:py, fx:fx, fy:fy, cat:p.cat, dim:p.dim, color:color, focalR:fR, R:R};
        el('line', {x1:(px-txd*tLen).toFixed(1), y1:(py-tyd*tLen).toFixed(1), x2:(px+txd*tLen).toFixed(1), y2:(py+tyd*tLen).toFixed(1), stroke:color, 'stroke-width':1, 'stroke-opacity':(op*0.6).toFixed(2)}, wasG);
        el('line', {x1:px.toFixed(1), y1:py.toFixed(1), x2:fx.toFixed(1), y2:fy.toFixed(1), stroke:color, 'stroke-width':0.5, 'stroke-opacity':0.3, 'stroke-dasharray':'3,3', id:'mg-fl-'+p.id}, wasG);
        el('circle', {cx:fx.toFixed(1), cy:fy.toFixed(1), r:alive?2.5:1.5, fill:color, opacity:(op*0.5).toFixed(2), id:'mg-fd-'+p.id}, wasG);
        var dotR = alive ? Math.max(5-fd*2,2) : 2.5;
        var da = {cx:px.toFixed(1), cy:py.toFixed(1), r:dotR.toFixed(1), fill:color, opacity:op.toFixed(2), id:'mg-dot-'+p.id};
        if (alive) da.filter = 'url(#mg-glow)';
        el('circle', da, wasG);
        var lDist = R+38+(p.dim>2?6:0);
        var lx=cx+lDist*Math.cos(angle), ly=cy+lDist*Math.sin(angle);
        var rot = angle*180/PI;
        if (rot > 90 && rot < 270) rot += 180;
        if (rot < -90 && rot > -270) rot += 180;
        var anchor = (angle>PI/2 && angle<PI*1.5) ? 'end' : 'start';
        if (Math.abs(angle-PI/2)<0.2 || Math.abs(angle+PI/2)<0.2) anchor = 'middle';
        var short = p.title.length>14 ? p.title.substring(0,14) : p.title;
        txt(wasG, lx.toFixed(1), ly.toFixed(1), short, color, 7, {opacity:(op*0.85).toFixed(2), 'text-anchor':anchor, 'dominant-baseline':'central', transform:'rotate('+rot.toFixed(1)+' '+lx.toFixed(1)+' '+ly.toFixed(1)+')'});
        var bDist = R+52+(p.dim>2?6:0);
        var bx=cx+bDist*Math.cos(angle), by=cy+bDist*Math.sin(angle);
        txt(wasG, bx.toFixed(1), by.toFixed(1), p.dim+'D', '#6e7681', 6, {opacity:(op*0.6).toFixed(2), 'text-anchor':anchor, 'dominant-baseline':'central', transform:'rotate('+rot.toFixed(1)+' '+bx.toFixed(1)+' '+by.toFixed(1)+')'});
      });
    });

    // \u2550\u2550 WILLBE layer: three-body predictive \u2550\u2550
    var wbG = el('g', {id:'mg-willbe'}, svg);
    var BR = R*(PI/8);
    var bodies = [
      {id:'is', label:'IS', sub:'energy \u2248 4\u03c0', angle:-PI/2, color:'#e85d3a'},
      {id:'was', label:'WAS', sub:'ground', angle:-PI/2+TAU/3, color:'#4a8fb8'},
      {id:'willbe', label:'WILLBE', sub:'predict \u2248 1/d', angle:-PI/2+2*TAU/3, color:'#5ab87a'}
    ];
    var bPos = {};
    bodies.forEach(function(b) { bPos[b.id] = {x:cx+BR*Math.cos(b.angle), y:cy+BR*Math.sin(b.angle)}; });
    el('path', {d:'M '+bPos.is.x.toFixed(1)+' '+bPos.is.y.toFixed(1)+' L '+bPos.was.x.toFixed(1)+' '+bPos.was.y.toFixed(1)+' L '+bPos.willbe.x.toFixed(1)+' '+bPos.willbe.y.toFixed(1)+' Z', fill:'none', stroke:'#c9d1d9', 'stroke-width':0.5, 'stroke-opacity':0.12, 'stroke-dasharray':'4,6', id:'mg-body-tri'}, wbG);
    [{from:'is',to:'was',label:'E = IS/WAS',color:'#e85d3a'},{from:'was',to:'willbe',label:'m = NP/WAS',color:'#6e7681'},{from:'willbe',to:'is',label:'c\u00b2 = IS/NP',color:'#5ab87a'}].forEach(function(e) {
      txt(wbG, ((bPos[e.from].x+bPos[e.to].x)/2).toFixed(1), ((bPos[e.from].y+bPos[e.to].y)/2).toFixed(1), e.label, e.color, 5.5, {opacity:0.4, 'dominant-baseline':'central'});
    });
    bodies.forEach(function(b) {
      var p = bPos[b.id];
      el('circle', {cx:p.x.toFixed(1), cy:p.y.toFixed(1), r:16, fill:'none', stroke:b.color, 'stroke-width':0.5, 'stroke-opacity':0.18, 'stroke-dasharray':'2,3', id:'mg-body-ring-'+b.id}, wbG);
      el('circle', {cx:p.x.toFixed(1), cy:p.y.toFixed(1), r:4.5, fill:b.color, opacity:0.6, filter:'url(#mg-glow)', id:'mg-body-'+b.id}, wbG);
      txt(wbG, p.x.toFixed(1), (p.y-20).toFixed(1), b.label, b.color, 8.5, {opacity:0.85, 'font-weight':'bold'});
      txt(wbG, p.x.toFixed(1), (p.y+24).toFixed(1), b.sub, '#6e7681', 5.5, {opacity:0.45, id:'mg-body-val-'+b.id});
    });

    // \u2550\u2550 TRIANGULATION layer: 3 datum \u2192 1 vector \u2550\u2550
    // Each panel node's position is triangulated by:
    //   angle (form) \u2192 IS body    \u2014 where on the arc
    //   focalR (face) \u2192 WAS body  \u2014 how deep inside
    //   dim (function) \u2192 WILLBE body \u2014 what complexity
    var triG = el('g', {id:'mg-triangulation', opacity:0}, svg);
    PANELS.forEach(function(p) {
      var g = geo[p.id];
      if (!g) return;
      var nearest = bodies[0], minD = Infinity;
      bodies.forEach(function(b) {
        var dx = g.px - bPos[b.id].x, dy = g.py - bPos[b.id].y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < minD) { minD = d; nearest = b; }
      });
      el('line', {x1:g.px.toFixed(1), y1:g.py.toFixed(1),
        x2:bPos[nearest.id].x.toFixed(1), y2:bPos[nearest.id].y.toFixed(1),
        stroke:nearest.color, 'stroke-width':0.3, 'stroke-opacity':0.08,
        'stroke-dasharray':'1,4', id:'mg-tri-'+p.id}, triG);
    });

    // \u2550\u2550 IS layer: live particles \u2550\u2550
    pGroup = el('g', {id:'mg-is'}, svg);

    // center + legend
    txt(svg, cx, cy-8, 'epitopes', '#8b949e', 9);
    txt(svg, cx, cy+6, aliveSet.size+'/'+PANELS.length+' alive', '#6e7681', 7, {id:'mg-alive-count'});
    var lgG = el('g', {id:'mg-legend'}, svg);
    txt(lgG, 14, H-55, 'focal distance = 1/C(n) = 1/\u03c0^(n/2)', '#6e7681', 7, {'text-anchor':'start'});
    [['1D: \u221a\u03c0 \u2248 1.77 \u2192 f = 0.56','#9b59b6'],['2D: \u03c0 \u2248 3.14 \u2192 f = 0.32','#4a8fb8'],['3D: \u03c0^1.5 \u2248 5.57 \u2192 f = 0.18','#5ab87a'],['4D: \u03c0\u00b2 \u2248 9.87 \u2192 f = 0.10','#e85d3a']].forEach(function(leg, i) {
      var ly = H-43+i*11;
      el('circle', {cx:18, cy:ly-3, r:3, fill:leg[1], opacity:0.7}, lgG);
      txt(lgG, 26, ly, leg[0], '#6e7681', 6.5, {'text-anchor':'start'});
    });
    [[W-160,'signal transit',2,'#58a6ff',0.8],[W-98,'alive',3,'#5ab87a',1],[W-62,'dormant',2,'#6e7681',0.25]].forEach(function(l) {
      el('circle', {cx:l[0], cy:H-33, r:l[2], fill:l[3], opacity:l[4]}, lgG);
      txt(lgG, l[0]+7, H-30, l[1], '#6e7681', 6.5, {'text-anchor':'start'});
    });
    txt(lgG, W-10, H-14, '\u03c0-budget: \u230a\u03c0\u00b3\u230b=' + MAX_P + ' particles', '#484f58', 5.5, {'text-anchor':'end'});

    host.innerHTML = ''; host.appendChild(svg);
    built = true;
  }

  function animate(now) {
    if (!built || !pGroup) { requestAnimationFrame(animate); return; }
    var dt = lastFrame ? (now-lastFrame)/1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    lastFrame = now;
    var cx=MG.cx, cy=MG.cy, R=MG.R;
    CATS.forEach(function(cat) {
      var r = rates[cat]||0; if (r<=0) return;
      catAccum[cat] += r*dt;
      while (catAccum[cat] >= 1 && particles.length < MAX_P) {
        catAccum[cat]--;
        var cands = []; aliveSet.forEach(function(id){var g=geo[id]; if(g&&g.cat===cat) cands.push(id);});
        if (cands.length) spawnParticle(cands[Math.floor(Math.random()*cands.length)]);
      }
    });
    if (rps===0 && Math.random() < 0.2*dt*60) {
      var arr = []; aliveSet.forEach(function(id){arr.push(id);});
      if (arr.length) spawnParticle(arr[Math.floor(Math.random()*arr.length)]);
    }
    var rm = [];
    particles.forEach(function(p, i) {
      p.r -= p.speed*dt;
      if (p.r > R+10) p.opacity = Math.min(p.opacity+dt*3, 0.85);
      else if (p.r > R-5) { p.opacity=1; p.size*=1+dt*2; arcGlow[p.cat]=Math.min((arcGlow[p.cat]||0)+0.15, 1); }
      else { p.opacity = Math.max(p.opacity-dt*2.5, 0); p.size = Math.max(p.size-dt*2, 0.5); }
      if (p.r<=p.targetR || p.opacity<=0.01) {
        rm.push(i); pulse(p.id);
        if (p.el&&p.el.parentNode) p.el.parentNode.removeChild(p.el);
        return;
      }
      if (!p.el) p.el = el('circle', {fill:p.color}, pGroup);
      p.el.setAttribute('cx', (cx+p.r*Math.cos(p.angle)).toFixed(1));
      p.el.setAttribute('cy', (cy+p.r*Math.sin(p.angle)).toFixed(1));
      p.el.setAttribute('r', p.size.toFixed(1));
      p.el.setAttribute('opacity', p.opacity.toFixed(2));
    });
    for (var i=rm.length-1; i>=0; i--) particles.splice(rm[i], 1);
    var totalRate = 0; CATS.forEach(function(c){totalRate+=rates[c]||0;});
    CATS.forEach(function(cat) {
      var g = arcGlow[cat]||0;
      var base = totalRate>0 ? ((rates[cat]||0)/totalRate)*0.5 : 0;
      if (g>base) arcGlow[cat] = Math.max(g-dt*0.3, base);
      var a = document.getElementById('mg-arc-'+cat);
      if (a) { a.setAttribute('stroke-width',(2.5+g*3).toFixed(1)); a.setAttribute('stroke-opacity',(0.5+g*0.4).toFixed(2)); }
    });
    Object.keys(pulses).forEach(function(pid) {
      var p = pulses[pid]; p.scale *= p.decay;
      if (p.scale<1.05) { delete pulses[pid]; var d=document.getElementById('mg-dot-'+pid); if(d&&aliveSet.has(pid)) d.setAttribute('filter','url(#mg-glow)'); return; }
      var d = document.getElementById('mg-dot-'+pid);
      if (d) { var g=geo[pid]; var br=g?Math.max(5-(1/dimCost(g.dim))*2,2):3; d.setAttribute('r',(br*p.scale).toFixed(1)); }
    });
    var ac = document.getElementById('mg-alive-count');
    if (ac) { var l=aliveSet.size+'/'+PANELS.length+' alive'; if(rps>0) l+=' \u00b7 '+rps.toFixed(1)+' rps'; ac.textContent=l; }
    requestAnimationFrame(animate);
  }

  function render() {
    if (!built) build();
    var triLayer = document.getElementById('mg-triangulation');
    var aliveCount = aliveSet.size;
    if (triLayer) triLayer.setAttribute('opacity', aliveCount > 3 ? '1' : '0');
    aliveSet.forEach(function(pid) {
      var d=document.getElementById('mg-dot-'+pid);
      if(d){d.setAttribute('opacity','1');d.setAttribute('filter','url(#mg-glow)');}
      var fl=document.getElementById('mg-fl-'+pid);
      if(fl) fl.setAttribute('stroke-opacity','0.3');
      var fd=document.getElementById('mg-fd-'+pid);
      if(fd){fd.setAttribute('opacity','0.5');fd.setAttribute('r','2.5');}
      var tri=document.getElementById('mg-tri-'+pid);
      if(tri) tri.setAttribute('stroke-opacity','0.15');
    });
  }

  return {build:build, animate:animate, render:render, ingest:ingest, entityToCategory:entityToCategory, panelGeo:geo};
};
