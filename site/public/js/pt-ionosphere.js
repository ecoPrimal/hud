// pt-ionosphere.js — ionosphere globe SVG + signal transit animation
// Extracted from hud-pt.js for epitope boundary split
window.PtIonosphere = function() {
  var GLOBE = {W: 700, H: 400, cx: 350, cy: 200};
  var globeSvgEl = null;
  var globeBuilt = false;
  var globeGeoData = null;
  var globeRotation = 0;
  var globeAnimId = null;

  var COUNTRY_POS = {
    US: [-98, 38], CN: [-104, 35], IE: [-8, 53], BY: [28, 53], GB: [-2, 54],
    DE: [10, 51], FR: [2, 46], JP: [138, 36], IN: [78, 22], BR: [-51, -10],
    RU: [100, 60], AU: [134, -25], CA: [-106, 56], KR: [127, 36], SG: [104, 1],
    NL: [5, 52], SE: [16, 62], FI: [26, 64], NO: [10, 62], IL: [35, 31],
    HK: [114, 22], TW: [121, 24], UA: [32, 49], PL: [20, 52], ES: [-4, 40],
    IT: [12, 42], CH: [8, 47], AT: [14, 47], BE: [4, 51], DK: [10, 56],
    MX: [-102, 23], AR: [-64, -34], CL: [-71, -35], CO: [-74, 4], ZA: [26, -29],
    NG: [8, 10], KE: [38, 0], EG: [31, 27], AE: [54, 24], SA: [45, 24],
    TR: [35, 39], GR: [22, 39], CZ: [15, 50], RO: [25, 46], HU: [19, 47],
    'IE/US': [-40, 48], '??': [0, 0]
  };

  var US_REGIONS = {
    'California': [-120, 37], 'Michigan': [-85, 44], 'Texas': [-99, 31],
    'Virginia': [-79, 38], 'Washington': [-121, 47], 'Colorado': [-106, 39],
    'New Jersey': [-74, 40], 'New York': [-74, 41], 'Massachusetts': [-72, 42],
    'Illinois': [-89, 40], 'Oregon': [-121, 44], 'Arizona': [-112, 34],
    'Florida': [-82, 28], 'Georgia': [-84, 33], 'Pennsylvania': [-78, 41],
    'Ohio': [-83, 40], 'North Carolina': [-80, 35]
  };

  var EPITOPE_COLORS = {
    PHYSICS: '#e85d3a', TOPOLOGY: '#9b59b6', PHILOSOPHY: '#3fb950',
    METHOD: '#58a6ff', INVESTIGATION: '#f1c40f', IMMUNE: '#ff6b35',
    SCIENCE: '#e8e8e8', SIGNAL: '#4a8fb8', HOMEPAGE: '#6e7681',
    META: '#484f58', OTHER: '#30363d'
  };

  var COAST_PATHS = [
    'M 85,95 L 80,100 75,108 72,118 74,130 82,140 95,148 110,145 115,138 130,135 140,132 148,128 152,120 148,112 140,105 130,100 120,98 105,95 Z',
    'M 125,175 L 120,185 118,200 122,220 130,240 138,260 135,275 128,280 130,270 125,255 115,235 112,220 115,200 120,185 Z',
    'M 310,80 L 315,85 325,88 340,85 345,90 350,95 345,100 335,105 320,108 310,105 305,98 308,90 Z',
    'M 310,130 L 305,140 310,155 320,170 330,185 340,200 345,210 340,225 330,230 318,225 305,210 300,195 298,180 295,165 300,150 305,140 Z',
    'M 350,80 L 365,75 385,78 405,80 420,85 440,90 460,95 475,100 480,110 470,118 455,115 440,112 425,105 410,100 395,95 380,90 365,85 Z',
    'M 460,210 L 470,205 485,208 495,215 498,225 492,235 480,238 468,232 460,222 Z'
  ];

  function geoProject(lon, lat) {
    var W = GLOBE.W - 60, H = GLOBE.H - 40;
    var x = 30 + (lon + 180) / 360 * W;
    var y = 20 + (90 - lat) / 180 * H;
    return [x, y];
  }

  function buildIonosphereSVG(geoData) {
    var el = document.getElementById('ionosphere-svg');
    if (!el) return;
    var W = GLOBE.W, H = GLOBE.H;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.cssText = 'width:100%;max-height:420px;font-family:"Courier New",monospace;cursor:crosshair';
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="iono-bg" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#0a0e17" stop-opacity="0.9"/><stop offset="100%" stop-color="#050810" stop-opacity="1"/></radialGradient><filter id="iono-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="iono-soft"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg.appendChild(defs);
    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', W); bg.setAttribute('height', H);
    bg.setAttribute('fill', 'url(#iono-bg)'); bg.setAttribute('rx', '8');
    svg.appendChild(bg);
    for (var lon = -180; lon <= 180; lon += 30) {
      var p = geoProject(lon, 0);
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', p[0]); line.setAttribute('y1', 20);
      line.setAttribute('x2', p[0]); line.setAttribute('y2', H - 20);
      line.setAttribute('stroke', '#1a1f2e'); line.setAttribute('stroke-width', '0.5');
      svg.appendChild(line);
    }
    for (var lat = -60; lat <= 80; lat += 20) {
      var pL = geoProject(-180, lat), pR = geoProject(180, lat);
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', pL[0]); line.setAttribute('y1', pL[1]);
      line.setAttribute('x2', pR[0]); line.setAttribute('y2', pR[1]);
      line.setAttribute('stroke', '#1a1f2e'); line.setAttribute('stroke-width', '0.5');
      svg.appendChild(line);
    }
    COAST_PATHS.forEach(function(d) {
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d); path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#1e2639'); path.setAttribute('stroke-width', '1'); path.setAttribute('opacity', '0.6');
      svg.appendChild(path);
    });
    var title = document.createElementNS(NS, 'text');
    title.setAttribute('x', W/2); title.setAttribute('y', 14);
    title.setAttribute('text-anchor', 'middle'); title.setAttribute('fill', '#4a8fb8');
    title.setAttribute('font-size', '10'); title.setAttribute('opacity', '0.8');
    title.textContent = 'ionosphere \u2014 signal transit across the surface';
    svg.appendChild(title);
    var memPos = geoProject(-83, 43);
    var memPulse = document.createElementNS(NS, 'circle');
    memPulse.setAttribute('cx', memPos[0]); memPulse.setAttribute('cy', memPos[1]);
    memPulse.setAttribute('r', '12'); memPulse.setAttribute('fill', 'none');
    memPulse.setAttribute('stroke', '#5ab87a'); memPulse.setAttribute('stroke-width', '0.8'); memPulse.setAttribute('opacity', '0.3');
    var anim = document.createElementNS(NS, 'animate');
    anim.setAttribute('attributeName', 'r'); anim.setAttribute('values', '5;15;5');
    anim.setAttribute('dur', '3s'); anim.setAttribute('repeatCount', 'indefinite'); memPulse.appendChild(anim);
    var anim2 = document.createElementNS(NS, 'animate');
    anim2.setAttribute('attributeName', 'opacity'); anim2.setAttribute('values', '0.4;0.1;0.4');
    anim2.setAttribute('dur', '3s'); anim2.setAttribute('repeatCount', 'indefinite'); memPulse.appendChild(anim2);
    svg.appendChild(memPulse);
    var memDot = document.createElementNS(NS, 'circle');
    memDot.setAttribute('cx', memPos[0]); memDot.setAttribute('cy', memPos[1]);
    memDot.setAttribute('r', '3'); memDot.setAttribute('fill', '#5ab87a'); memDot.setAttribute('filter', 'url(#iono-glow)');
    svg.appendChild(memDot);
    var memLabel = document.createElementNS(NS, 'text');
    memLabel.setAttribute('x', memPos[0]); memLabel.setAttribute('y', memPos[1] - 8);
    memLabel.setAttribute('text-anchor', 'middle'); memLabel.setAttribute('fill', '#5ab87a');
    memLabel.setAttribute('font-size', '7'); memLabel.setAttribute('opacity', '0.7');
    memLabel.textContent = 'membrane'; svg.appendChild(memLabel);
    var arcGroup = document.createElementNS(NS, 'g'); arcGroup.id = 'iono-arcs'; svg.appendChild(arcGroup);
    var dotGroup = document.createElementNS(NS, 'g'); dotGroup.id = 'iono-dots'; svg.appendChild(dotGroup);
    var particleGroup = document.createElementNS(NS, 'g'); particleGroup.id = 'iono-particles'; svg.appendChild(particleGroup);
    if (geoData && geoData.length > 0) renderIonosphereData(svg, geoData);
    var lgX = 10, lgY = H - 50;
    var legends = [['signal','#e85d3a'],['topology','#9b59b6'],['philosophy','#3fb950'],['method','#58a6ff'],['investigation','#f1c40f'],['immune','#ff6b35']];
    legends.forEach(function(leg, i) {
      var row = Math.floor(i / 3), col = i % 3;
      var lx = lgX + col * 80, ly = lgY + row * 11;
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', lx + 4); dot.setAttribute('cy', ly - 2);
      dot.setAttribute('r', '2'); dot.setAttribute('fill', leg[1]); dot.setAttribute('opacity', '0.8'); svg.appendChild(dot);
      var txt = document.createElementNS(NS, 'text');
      txt.setAttribute('x', lx + 10); txt.setAttribute('y', ly);
      txt.setAttribute('fill', '#6e7681'); txt.setAttribute('font-size', '6'); txt.textContent = leg[0]; svg.appendChild(txt);
    });
    var statLabel = document.createElementNS(NS, 'text');
    statLabel.setAttribute('x', W - 10); statLabel.setAttribute('y', H - 8);
    statLabel.setAttribute('text-anchor', 'end'); statLabel.setAttribute('fill', '#484f58');
    statLabel.setAttribute('font-size', '6'); statLabel.id = 'iono-stats'; svg.appendChild(statLabel);
    el.innerHTML = ''; el.appendChild(svg);
    globeSvgEl = svg; globeBuilt = true;
  }

  function renderIonosphereData(svg, geoData) {
    var NS = 'http://www.w3.org/2000/svg';
    var arcGroup = svg.querySelector('#iono-arcs') || svg;
    var dotGroup = svg.querySelector('#iono-dots') || svg;
    var memPos = geoProject(-83, 43);
    var totalReqs = 0;
    geoData.forEach(function(g) { totalReqs += g.requests; });
    geoData.forEach(function(g) {
      if (g.country === '??' || !g.requests) return;
      var pos = COUNTRY_POS[g.country]; if (!pos) return;
      var p = geoProject(pos[0], pos[1]);
      var pct = totalReqs > 0 ? g.requests / totalReqs : 0;
      var r = Math.max(2, Math.min(12, Math.sqrt(pct) * 20));
      var mx = (memPos[0] + p[0]) / 2;
      var my = Math.min(memPos[1], p[1]) - 20 - pct * 80;
      var arc = document.createElementNS(NS, 'path');
      arc.setAttribute('d', 'M ' + memPos[0] + ' ' + memPos[1] + ' Q ' + mx + ' ' + my + ' ' + p[0] + ' ' + p[1]);
      arc.setAttribute('fill', 'none'); arc.setAttribute('stroke', '#4a8fb8');
      arc.setAttribute('stroke-width', (0.5 + pct * 3).toFixed(1)); arc.setAttribute('stroke-opacity', (0.15 + pct * 0.4).toFixed(2));
      arc.setAttribute('stroke-dasharray', '3,4'); arcGroup.appendChild(arc);
      if (pct > 0.05) {
        var ionoGlow = document.createElementNS(NS, 'path');
        ionoGlow.setAttribute('d', 'M ' + memPos[0] + ' ' + memPos[1] + ' Q ' + mx + ' ' + (my - 10) + ' ' + p[0] + ' ' + p[1]);
        ionoGlow.setAttribute('fill', 'none'); ionoGlow.setAttribute('stroke', '#58a6ff');
        ionoGlow.setAttribute('stroke-width', (pct * 6).toFixed(1)); ionoGlow.setAttribute('stroke-opacity', '0.08');
        ionoGlow.setAttribute('filter', 'url(#iono-soft)'); arcGroup.appendChild(ionoGlow);
      }
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); dot.setAttribute('r', r.toFixed(1));
      var color = pct > 0.3 ? '#e85d3a' : pct > 0.1 ? '#f1c40f' : '#4a8fb8';
      dot.setAttribute('fill', color); dot.setAttribute('opacity', (0.3 + pct * 0.5).toFixed(2));
      if (pct > 0.1) dot.setAttribute('filter', 'url(#iono-glow)'); dotGroup.appendChild(dot);
      if (pct > 0.01 || g.country !== '??') {
        var label = document.createElementNS(NS, 'text');
        label.setAttribute('x', p[0]); label.setAttribute('y', p[1] + r + 8);
        label.setAttribute('text-anchor', 'middle'); label.setAttribute('fill', '#6e7681'); label.setAttribute('font-size', '6');
        label.textContent = g.country + ' (' + (pct * 100).toFixed(1) + '%)'; dotGroup.appendChild(label);
      }
      if (g.country === 'US' && g.regions) {
        g.regions.forEach(function(reg) {
          var regPos = US_REGIONS[reg.region];
          if (!regPos || reg.requests < 50) return;
          var rp = geoProject(regPos[0], regPos[1]);
          var regPct = totalReqs > 0 ? reg.requests / totalReqs : 0;
          var regR = Math.max(1.5, Math.min(8, Math.sqrt(regPct) * 15));
          var regDot = document.createElementNS(NS, 'circle');
          regDot.setAttribute('cx', rp[0]); regDot.setAttribute('cy', rp[1]);
          regDot.setAttribute('r', regR.toFixed(1)); regDot.setAttribute('fill', regPct > 0.3 ? '#e85d3a' : '#f1c40f');
          regDot.setAttribute('opacity', (0.2 + regPct * 0.4).toFixed(2)); dotGroup.appendChild(regDot);
          if (regPct > 0.005) {
            var regLabel = document.createElementNS(NS, 'text');
            regLabel.setAttribute('x', rp[0]); regLabel.setAttribute('y', rp[1] - regR - 2);
            regLabel.setAttribute('text-anchor', 'middle'); regLabel.setAttribute('fill', '#484f58'); regLabel.setAttribute('font-size', '5');
            regLabel.textContent = reg.region; dotGroup.appendChild(regLabel);
          }
        });
      }
    });
    var statEl = svg.querySelector('#iono-stats');
    if (statEl) {
      var countries = geoData.filter(function(g) { return g.country !== '??'; }).length;
      statEl.textContent = countries + ' countries \u00b7 ' + totalReqs.toLocaleString() + ' signals';
    }
  }

  var ionoParticles = [];
  var ionoLastFrame = 0;

  function ionoSpawnParticle(geoData) {
    if (ionoParticles.length >= 20 || !geoData || geoData.length === 0) return;
    var totalReqs = 0;
    geoData.forEach(function(g) { totalReqs += g.requests; });
    var pick = Math.random() * totalReqs;
    var acc = 0, target = geoData[0];
    for (var i = 0; i < geoData.length; i++) { acc += geoData[i].requests; if (acc >= pick) { target = geoData[i]; break; } }
    var pos = COUNTRY_POS[target.country]; if (!pos) return;
    var dest = geoProject(pos[0], pos[1]);
    var memPos = geoProject(-83, 43);
    var inbound = Math.random() > 0.3;
    ionoParticles.push({
      sx: inbound ? dest[0] : memPos[0], sy: inbound ? dest[1] : memPos[1],
      ex: inbound ? memPos[0] : dest[0], ey: inbound ? memPos[1] : dest[1],
      t: 0, speed: 0.4 + Math.random() * 0.6,
      color: inbound ? '#4a8fb8' : '#5ab87a', el: null
    });
  }

  function ionoAnimateFrame(now) {
    if (!globeBuilt) { globeAnimId = requestAnimationFrame(ionoAnimateFrame); return; }
    var dt = ionoLastFrame ? (now - ionoLastFrame) / 1000 : 0.016;
    if (dt > 0.1) dt = 0.1;
    ionoLastFrame = now;
    var NS = 'http://www.w3.org/2000/svg';
    var pg = globeSvgEl ? globeSvgEl.querySelector('#iono-particles') : null;
    if (!pg) { globeAnimId = requestAnimationFrame(ionoAnimateFrame); return; }
    if (Math.random() < dt * 2 && globeGeoData) ionoSpawnParticle(globeGeoData);
    var toRemove = [];
    ionoParticles.forEach(function(p, idx) {
      p.t += p.speed * dt;
      if (p.t >= 1.0) { toRemove.push(idx); if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el); return; }
      var mx = (p.sx + p.ex) / 2, my = Math.min(p.sy, p.ey) - 30;
      var t = p.t;
      var x = (1-t)*(1-t)*p.sx + 2*(1-t)*t*mx + t*t*p.ex;
      var y = (1-t)*(1-t)*p.sy + 2*(1-t)*t*my + t*t*p.ey;
      var opacity = t < 0.1 ? t/0.1 : t > 0.85 ? (1-t)/0.15 : 0.9;
      if (!p.el) { p.el = document.createElementNS(NS, 'circle'); p.el.setAttribute('fill', p.color); p.el.setAttribute('r', '1.5'); pg.appendChild(p.el); }
      p.el.setAttribute('cx', x.toFixed(1)); p.el.setAttribute('cy', y.toFixed(1));
      p.el.setAttribute('opacity', opacity.toFixed(2));
    });
    for (var i = toRemove.length - 1; i >= 0; i--) ionoParticles.splice(toRemove[i], 1);
    globeAnimId = requestAnimationFrame(ionoAnimateFrame);
  }

  function updateGeoData(geo) {
    if (geo.length > 0 && (!globeGeoData || JSON.stringify(geo) !== JSON.stringify(globeGeoData))) {
      globeGeoData = geo;
      if (globeBuilt) {
        var arcG = globeSvgEl.querySelector('#iono-arcs');
        var dotG = globeSvgEl.querySelector('#iono-dots');
        if (arcG) arcG.innerHTML = '';
        if (dotG) dotG.innerHTML = '';
        renderIonosphereData(globeSvgEl, geo);
      }
    }
  }

  return {
    build: buildIonosphereSVG,
    animate: ionoAnimateFrame,
    renderData: renderIonosphereData,
    updateGeo: updateGeoData,
    svgEl: function() { return globeSvgEl; }
  };
};
