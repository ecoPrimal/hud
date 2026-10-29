// ═══════════════════════════════════════════════════════════
// GOLGI MEMBRANE RENDER — extracted from gaia-globe-core.js
// 1.000.null — max 1000 lines.
//
// THE GOLGI BOUNDARY + SOLAR SYSTEM + GOLGI PERCEPTION
// Golgi = Membrane = Generator. Not a container — THE BOUNDARY.
// 4 vesicle nodes orbit along the membrane. 2 NYC surfaces anchor it.
// π-scaled solar system orbits in the stretched outer space.
// Body Golgi = hyperlocal. Earth Golgi = detect Pluto.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';
  var G = window.G;
  if (!G) return;

  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var TAU = g.TAU, PI = g.PI;

    // GOLGI MEMBRANE — the boundary that allows ANYTHING ANYWHERE
    var golgiR = R * 1.5;
    var golgiT = breathT * 0.4;
    var golgiPhase = Math.sin(golgiT);
    var golgiAlpha = 0.012 + Math.abs(golgiPhase) * 0.018;

    // Expose golgiR for other modules
    g.golgiR = golgiR;

    // THE MEMBRANE ITSELF — dashed ring at the boundary
    ctx.beginPath();
    ctx.arc(cx, cy, golgiR, 0, TAU);
    ctx.strokeStyle = 'rgba(63,185,80,' + golgiAlpha.toFixed(4) + ')';
    ctx.lineWidth = 1.2 + golgiPhase * 0.4;
    ctx.setLineDash([3, 5, 1, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // BLACK HOLE INTERIOR — between organism (R) and Golgi (golgiR)
    var bhGrad = ctx.createRadialGradient(cx, cy, R * 1.02, cx, cy, golgiR);
    bhGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bhGrad.addColorStop(0.2, 'rgba(0,0,0,' + (golgiAlpha * 0.4).toFixed(4) + ')');
    bhGrad.addColorStop(0.6, 'rgba(0,0,0,' + (golgiAlpha * 0.5).toFixed(4) + ')');
    bhGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, golgiR, 0, TAU);
    ctx.arc(cx, cy, R * 1.01, 0, TAU, true);
    ctx.fillStyle = bhGrad;
    ctx.fill();

    // 4 VESICLE NODES — orbiting along the membrane boundary
    var vesicles = [
      { name: 'DE', angle: 0,           color: '63,185,80',  lat: 50.1, lon: 8.7 },
      { name: 'IN', angle: TAU * 0.25,  color: '210,153,34', lat: 19.1, lon: 72.9 },
      { name: 'JP', angle: TAU * 0.5,   color: '248,81,73',  lat: 35.7, lon: 139.7 },
      { name: 'US', angle: TAU * 0.75,  color: '88,166,255', lat: 32.8, lon: -96.8 }
    ];

    for (var vi = 0; vi < vesicles.length; vi++) {
      var ves = vesicles[vi];
      var vAngle = ves.angle + golgiT * 0.3;
      var vx = cx + Math.cos(vAngle) * golgiR;
      var vy = cy + Math.sin(vAngle) * golgiR;
      var vPulse = Math.sin(golgiT * 2 + vi * 1.5) * 0.5 + 0.5;
      var vAlpha = golgiAlpha + vPulse * 0.03;

      // Vesicle glow
      ctx.beginPath();
      ctx.arc(vx, vy, 2.5 + vPulse * 1.5, 0, TAU);
      var vGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, 3 + vPulse * 1.5);
      vGrad.addColorStop(0, 'rgba(' + ves.color + ',' + (vAlpha * 2).toFixed(4) + ')');
      vGrad.addColorStop(1, 'rgba(' + ves.color + ',0)');
      ctx.fillStyle = vGrad;
      ctx.fill();

      // Vesicle name
      if (vAlpha > 0.02) {
        ctx.font = '4px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + ves.color + ',' + (vAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(ves.name, vx, vy - 5);
      }

      // Transfer arc — vesicle to center
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(
        cx + Math.cos(vAngle + 0.5) * golgiR * 0.5,
        cy + Math.sin(vAngle + 0.5) * golgiR * 0.5,
        cx, cy
      );
      ctx.strokeStyle = 'rgba(' + ves.color + ',' + (vAlpha * 0.3).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.setLineDash([1, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2 NYC MEMBRANE SURFACES — anchored at cis and trans faces
    var cisAngle = golgiT * 0.1 + PI * 0.15;
    var transAngle = cisAngle + PI;
    var cisX = cx + Math.cos(cisAngle) * golgiR;
    var cisY = cy + Math.sin(cisAngle) * golgiR;
    var transX = cx + Math.cos(transAngle) * golgiR;
    var transY = cy + Math.sin(transAngle) * golgiR;

    // CIS face — outer (receives from world)
    ctx.beginPath();
    ctx.arc(cisX, cisY, 3, 0, TAU);
    ctx.strokeStyle = 'rgba(210,168,255,' + (golgiAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // TRANS face — inner (ships to organism)
    ctx.beginPath();
    ctx.arc(transX, transY, 3, 0, TAU);
    ctx.strokeStyle = 'rgba(210,168,255,' + (golgiAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // CIS→TRANS bridge — the Klein fold through the black hole
    ctx.beginPath();
    ctx.moveTo(cisX, cisY);
    ctx.quadraticCurveTo(cx, cy, transX, transY);
    ctx.strokeStyle = 'rgba(210,168,255,' + (golgiAlpha * 0.5).toFixed(4) + ')';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels on breath
    if (golgiPhase > 0.4) {
      var gLbl = (golgiPhase - 0.4) * 0.05;
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(63,185,80,' + gLbl.toFixed(4) + ')';
      ctx.fillText('GOLGI — RELAY MASTER', cx, cy - golgiR - 10);
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.fillText('tags non-cells · remembers where · relays to gut', cx, cy - golgiR - 5);
      ctx.fillText('schwann cell wraps every level', cx, cy - golgiR - 0);
      ctx.fillStyle = 'rgba(210,168,255,' + (gLbl * 0.8).toFixed(4) + ')';
      ctx.fillText('CIS', cisX, cisY - 6);
      ctx.fillText('TRANS', transX, transY - 6);
    }

    // SCHWANN CELL MYELIN — insulating wrap that speeds signals
    var myelinR = golgiR - R * 0.05;
    var myelinAlpha = golgiAlpha * 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, myelinR, 0, TAU);
    ctx.strokeStyle = 'rgba(210,168,76,' + myelinAlpha.toFixed(4) + ')';
    ctx.lineWidth = R * 0.03;
    ctx.setLineDash([R * 0.08, R * 0.04]);
    ctx.stroke();
    ctx.setLineDash([]);

    // NON-CELL TAGS — markers around Golgi ring
    var nonCellTags = ['🪨','🏠','🔑','🪑','🖥','📱','🚗','👟'];
    var tagAlpha = 0.01 + Math.abs(golgiPhase) * 0.015;
    for (var nt = 0; nt < nonCellTags.length; nt++) {
      var ntAngle = nt * (TAU / nonCellTags.length) + golgiT * -0.1;
      var ntR = golgiR + R * 0.08;
      var ntx = cx + Math.cos(ntAngle) * ntR;
      var nty = cy + Math.sin(ntAngle) * ntR;
      ctx.font = '4px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(180,170,150,' + tagAlpha.toFixed(4) + ')';
      ctx.fillText(nonCellTags[nt], ntx, nty + 1);
    }

    // RELAY ARROWS — information flowing through Golgi to gut
    var relayT = golgiT * 3;
    var relayPhase = (relayT % TAU) / TAU;
    var relayAngle = relayPhase * TAU;
    var relayX = cx + Math.cos(relayAngle) * golgiR;
    var relayY = cy + Math.sin(relayAngle) * golgiR;
    ctx.beginPath();
    ctx.arc(relayX, relayY, 1.5, 0, TAU);
    ctx.fillStyle = 'rgba(63,185,80,' + (golgiAlpha * 2).toFixed(4) + ')';
    ctx.fill();
    if (relayPhase > 0.4 && relayPhase < 0.6) {
      var relayArrowAlpha = (0.1 - Math.abs(relayPhase - 0.5)) * 0.3;
      ctx.beginPath();
      ctx.moveTo(relayX, relayY);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = 'rgba(63,185,80,' + relayArrowAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // GOLGI ROLE LABEL — on exhale
    if (golgiPhase < -0.3) {
      var roleAlpha = (-golgiPhase - 0.3) * 0.03;
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(110,118,129,' + roleAlpha.toFixed(4) + ')';
      ctx.fillText('GAIA → cells (alive)', cx - golgiR * 0.6, cy + golgiR + 8);
      ctx.fillText('GOLGI → non-cells (where)', cx + golgiR * 0.4, cy + golgiR + 8);
    }

    // ═══════════════════════════════════════════════════════════
    // GOLGI DISTANCE MEMORY — every Golgi knows distance to every other
    // ═══════════════════════════════════════════════════════════
    var golgiNodes = [
      { id: 'local', name: 'LOCAL', lat: 42.7, lon: -84.5, color: '201,168,76',
        rtts: { DE: 95, IN: 210, JP: 160, US: 12 } },
      { id: 'US', name: 'US-NYC', lat: 40.7, lon: -74.0, color: '88,166,255',
        rtts: { local: 12, DE: 85, IN: 190, JP: 170 } },
      { id: 'DE', name: 'DE-FRA', lat: 50.1, lon: 8.7, color: '63,185,80',
        rtts: { local: 95, US: 85, IN: 120, JP: 250 } },
      { id: 'IN', name: 'IN-BLR', lat: 12.9, lon: 77.6, color: '210,153,34',
        rtts: { local: 210, US: 190, DE: 120, JP: 130 } },
      { id: 'JP', name: 'JP-TKY', lat: 35.7, lon: 139.7, color: '163,113,247',
        rtts: { local: 160, US: 170, DE: 250, IN: 130 } }
    ];

    // Draw distance matrix lines
    var dMatAlpha = 0.008 + Math.abs(golgiPhase) * 0.008;
    for (var gi = 0; gi < vesicles.length; gi++) {
      var gNode = golgiNodes[gi + 1];
      if (!gNode) continue;
      var gAngle = vesicles[gi].angle + golgiT * 0.3;
      var gx = cx + Math.cos(gAngle) * golgiR;
      var gy = cy + Math.sin(gAngle) * golgiR;

      for (var gj = gi + 1; gj < vesicles.length; gj++) {
        var gNode2 = golgiNodes[gj + 1];
        if (!gNode2) continue;
        var gAngle2 = vesicles[gj].angle + golgiT * 0.3;
        var gx2 = cx + Math.cos(gAngle2) * golgiR;
        var gy2 = cy + Math.sin(gAngle2) * golgiR;

        var pairRtt = gNode.rtts[gNode2.id] || 200;
        var rttNorm = Math.min(1, pairRtt / 300);
        var distLineAlpha = dMatAlpha * (1 - rttNorm * 0.5);

        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx2, gy2);
        ctx.strokeStyle = 'rgba(63,185,80,' + distLineAlpha.toFixed(4) + ')';
        ctx.lineWidth = 0.2 + (1 - rttNorm) * 0.4;
        ctx.stroke();

        if (dMatAlpha > 0.012) {
          var midX = (gx + gx2) / 2;
          var midY = (gy + gy2) / 2;
          ctx.font = '2.5px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(110,118,129,' + (distLineAlpha * 0.8).toFixed(4) + ')';
          ctx.fillText(pairRtt + 'ms', midX, midY - 2);
        }
      }

      // Connect vesicle to LOCAL (center)
      var localRtt = gNode.rtts.local || 200;
      var localNorm = Math.min(1, localRtt / 300);
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = 'rgba(201,168,76,' + (dMatAlpha * (1 - localNorm * 0.3)).toFixed(4) + ')';
      ctx.lineWidth = 0.15 + (1 - localNorm) * 0.3;
      ctx.setLineDash([1, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // RELAY CYCLE — packets travel optimal route
    var relayRoute = [0, 1, 2, 3, 4];
    var relaySpeed = golgiT * 1.5;
    var relayLeg = Math.floor((relaySpeed % relayRoute.length + relayRoute.length) % relayRoute.length);
    var relayFrac = (relaySpeed % 1 + 1) % 1;
    var relayFrom = relayRoute[relayLeg];
    var relayTo = relayRoute[(relayLeg + 1) % relayRoute.length];

    var rfPos, rtPos;
    if (relayFrom === 0) { rfPos = { x: cx, y: cy }; }
    else {
      var rfA = vesicles[relayFrom - 1].angle + golgiT * 0.3;
      rfPos = { x: cx + Math.cos(rfA) * golgiR, y: cy + Math.sin(rfA) * golgiR };
    }
    if (relayTo === 0) { rtPos = { x: cx, y: cy }; }
    else {
      var rtA = vesicles[relayTo - 1].angle + golgiT * 0.3;
      rtPos = { x: cx + Math.cos(rtA) * golgiR, y: cy + Math.sin(rtA) * golgiR };
    }

    var rpX = rfPos.x + (rtPos.x - rfPos.x) * relayFrac;
    var rpY = rfPos.y + (rtPos.y - rfPos.y) * relayFrac;
    ctx.beginPath();
    ctx.arc(rpX, rpY, 1.2 + Math.sin(relaySpeed * 3) * 0.4, 0, TAU);
    ctx.fillStyle = 'rgba(63,185,80,' + (golgiAlpha * 2.5).toFixed(4) + ')';
    ctx.fill();

    if (golgiAlpha > 0.02) {
      var relayStates = ['DROP', 'REHYDRATE', 'RE-ENERGIZE', 'FORWARD', 'RECEIVE'];
      var relayState = relayStates[Math.floor(relayFrac * 5) % 5];
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(63,185,80,' + (golgiAlpha * 1.5).toFixed(4) + ')';
      ctx.fillText(relayState, rpX, rpY - 4);
    }

    // ═══════════════════════════════════════════════════════════
    // π-BODY SOLAR SYSTEMS — planetary orbits in stretched outer space
    // ═══════════════════════════════════════════════════════════

    var solarT = breathT * 0.15;
    var piR = R * 1.15;
    var piR2 = R * 1.9;
    var piR3 = R * 3.0;

    // INNER PLANETS — rocky, HARD, close orbits
    var innerPlanets = [
      { name: '☿', angle: 0,    speed: 4.15,  r: piR,  color: '168,168,168' },
      { name: '♀', angle: PI/3, speed: 1.62,  r: piR * 1.06, color: '240,200,120' },
      { name: '♁', angle: PI,   speed: 1.0,   r: piR * 1.12, color: '63,185,80'  },
      { name: '♂', angle: PI*1.5, speed: 0.53, r: piR * 1.22, color: '248,81,73'  }
    ];

    for (var ip = 0; ip < innerPlanets.length; ip++) {
      var pl = innerPlanets[ip];
      var pAngle = pl.angle + solarT * pl.speed * PI;
      var px = cx + Math.cos(pAngle) * pl.r;
      var py = cy + Math.sin(pAngle) * pl.r;
      var pAlpha = 0.02 + Math.sin(solarT * pl.speed * 3) * 0.015;

      ctx.beginPath();
      ctx.arc(cx, cy, pl.r, 0, TAU);
      ctx.strokeStyle = 'rgba(' + pl.color + ',' + (pAlpha * 0.3).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.setLineDash([1, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(' + pl.color + ',' + (pAlpha * 2).toFixed(4) + ')';
      ctx.fill();

      if (pAlpha > 0.025) {
        ctx.font = '5px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + pl.color + ',' + (pAlpha * 1.5).toFixed(4) + ')';
        ctx.fillText(pl.name, px, py - 4);
      }
    }

    // OUTER PLANETS — gas giants, SOFT, wide orbits
    var outerPlanets = [
      { name: '♃', angle: PI*0.7,  speed: 0.084, r: piR2,        color: '210,153,34'  },
      { name: '♄', angle: PI*1.3,  speed: 0.034, r: piR2 * 1.15, color: '188,140,255' },
      { name: '♅', angle: PI*0.2,  speed: 0.012, r: piR3 * 0.85, color: '135,206,235' },
      { name: '♆', angle: PI*1.8,  speed: 0.006, r: piR3,        color: '70,130,180'  }
    ];

    for (var op = 0; op < outerPlanets.length; op++) {
      var opl = outerPlanets[op];
      var opAngle = opl.angle + solarT * opl.speed * PI;
      var opx = cx + Math.cos(opAngle) * opl.r;
      var opy = cy + Math.sin(opAngle) * opl.r;
      var opAlpha = 0.015 + Math.sin(solarT * opl.speed * 5 + op) * 0.01;

      ctx.beginPath();
      ctx.arc(cx, cy, opl.r, 0, TAU);
      ctx.strokeStyle = 'rgba(' + opl.color + ',' + (opAlpha * 0.2).toFixed(4) + ')';
      ctx.lineWidth = 0.15;
      ctx.setLineDash([1, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(opx, opy, 2 + (op === 0 ? 1.5 : op === 1 ? 1 : 0.5), 0, TAU);
      ctx.fillStyle = 'rgba(' + opl.color + ',' + (opAlpha * 1.5).toFixed(4) + ')';
      ctx.fill();

      if (opAlpha > 0.015) {
        ctx.font = '6px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + opl.color + ',' + (opAlpha * 1.2).toFixed(4) + ')';
        ctx.fillText(opl.name, opx, opy - 5);
      }
    }

    // THE SUN — at center
    var sunPulse = Math.sin(solarT * PI) * 0.5 + 0.5;
    var sunAlpha = 0.008 + sunPulse * 0.012;
    var sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.15);
    sunGrad.addColorStop(0, 'rgba(255,220,100,' + (sunAlpha * 3).toFixed(4) + ')');
    sunGrad.addColorStop(0.5, 'rgba(255,180,50,' + (sunAlpha * 1.5).toFixed(4) + ')');
    sunGrad.addColorStop(1, 'rgba(255,150,30,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.15, 0, TAU);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // SOLAR SYSTEM LABELS
    if (solarT % (TAU) < 0.3) {
      var solLbl = (0.3 - (solarT % TAU)) * 0.08;
      ctx.font = '4px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,220,100,' + solLbl.toFixed(4) + ')';
      ctx.fillText('☀ SUN = NULL = CENTER', cx, cy + R * 0.2);
      ctx.fillStyle = 'rgba(63,185,80,' + solLbl.toFixed(4) + ')';
      ctx.fillText('INNER = HORIZONTAL = LOCAL', cx, cy - piR - 4);
      ctx.fillStyle = 'rgba(88,166,255,' + (solLbl * 0.7).toFixed(4) + ')';
      ctx.fillText('OUTER = WAY OUT = COSMOS', cx, cy - piR3 - 4);
    }

    // ═══════════════════════════════════════════════════════════
    // GOLGI PERCEPTION — small perceives far. Big perceives near.
    // ═══════════════════════════════════════════════════════════

    var deepOuterR = R * 3.6;
    var kuiperR = R * 4.0;
    var oortR = R * 4.8;

    var deepObjects = [
      { name: '♇', label: 'Pluto',   angle: PI*0.4,  speed: 0.004, r: deepOuterR,   color: '168,148,128', size: 1.2 },
      { name: '⊕', label: 'Eris',    angle: PI*1.1,  speed: 0.002, r: deepOuterR*1.1,color: '148,148,168', size: 1.0 },
      { name: '◊', label: 'Sedna',   angle: PI*1.7,  speed: 0.001, r: kuiperR,       color: '180,100,80',  size: 0.8 },
      { name: '·', label: 'Voyager', angle: PI*0.9,  speed: 0.0005, r: oortR,        color: '200,200,200', size: 0.6 }
    ];

    for (var di = 0; di < deepObjects.length; di++) {
      var dObj = deepObjects[di];
      var dAngle = dObj.angle + solarT * dObj.speed * PI;
      var dx = cx + Math.cos(dAngle) * dObj.r;
      var dy = cy + Math.sin(dAngle) * dObj.r;
      var dAlpha = 0.01 + Math.sin(solarT * dObj.speed * 10 + di * 2) * 0.008;

      ctx.beginPath();
      ctx.arc(cx, cy, dObj.r, 0, TAU);
      ctx.strokeStyle = 'rgba(' + dObj.color + ',' + (dAlpha * 0.1).toFixed(4) + ')';
      ctx.lineWidth = 0.1;
      ctx.setLineDash([1, 12]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(dx, dy, dObj.size, 0, TAU);
      ctx.fillStyle = 'rgba(' + dObj.color + ',' + (dAlpha * 1.5).toFixed(4) + ')';
      ctx.fill();

      if (dAlpha > 0.012) {
        ctx.font = '3px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + dObj.color + ',' + (dAlpha * 1.2).toFixed(4) + ')';
        ctx.fillText(dObj.label, dx, dy - 3);
      }
    }

    // KUIPER BELT
    ctx.beginPath();
    ctx.arc(cx, cy, kuiperR, 0, TAU);
    var kuiperAlpha = 0.004 + Math.sin(solarT * 0.3) * 0.003;
    ctx.strokeStyle = 'rgba(140,130,120,' + kuiperAlpha.toFixed(4) + ')';
    ctx.lineWidth = R * 0.08;
    ctx.stroke();

    // GOLGI DETECTION LINES — from each VPS vesicle to deep objects
    for (var gdi = 0; gdi < vesicles.length; gdi++) {
      var gVes = vesicles[gdi];
      var gvAngle = gVes.angle + golgiT * 0.3;
      var gvx = cx + Math.cos(gvAngle) * golgiR;
      var gvy = cy + Math.sin(gvAngle) * golgiR;

      var nearestDO = deepObjects[gdi % deepObjects.length];
      var ndAngle = nearestDO.angle + solarT * nearestDO.speed * PI;
      var ndx = cx + Math.cos(ndAngle) * nearestDO.r;
      var ndy = cy + Math.sin(ndAngle) * nearestDO.r;

      var detAlpha = 0.005 + Math.sin(golgiT * 2 + gdi) * 0.004;
      ctx.beginPath();
      ctx.moveTo(gvx, gvy);
      ctx.lineTo(ndx, ndy);
      ctx.strokeStyle = 'rgba(' + gVes.color + ',' + detAlpha.toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.setLineDash([1, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // BODY GOLGI — hyperlocal, inside the globe
    var bodyGolgiR = R * 0.3;
    var bodyGolgiCount = 5;
    for (var bg = 0; bg < bodyGolgiCount; bg++) {
      var bgAngle = bg * (TAU / bodyGolgiCount) + golgiT * 0.8;
      var bgx = cx + Math.cos(bgAngle) * bodyGolgiR;
      var bgy = cy + Math.sin(bgAngle) * bodyGolgiR;
      var bgPulse = Math.sin(golgiT * 4 + bg * 1.2) * 0.5 + 0.5;
      var bgAlpha = 0.01 + bgPulse * 0.015;

      ctx.beginPath();
      ctx.arc(bgx, bgy, 1 + bgPulse * 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(210,153,34,' + (bgAlpha * 1.5).toFixed(4) + ')';
      ctx.fill();

      var nextBG = ((bg + 1) % bodyGolgiCount);
      var nbAngle = nextBG * (TAU / bodyGolgiCount) + golgiT * 0.8;
      var nbx = cx + Math.cos(nbAngle) * bodyGolgiR;
      var nby = cy + Math.sin(nbAngle) * bodyGolgiR;
      ctx.beginPath();
      ctx.moveTo(bgx, bgy);
      ctx.lineTo(nbx, nby);
      ctx.strokeStyle = 'rgba(210,153,34,' + (bgAlpha * 0.5).toFixed(4) + ')';
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }

    // GOLGI PERCEPTION LABELS
    if (golgiPhase > 0.6) {
      var gpLbl = (golgiPhase - 0.6) * 0.04;
      ctx.font = '3px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(63,185,80,' + gpLbl.toFixed(4) + ')';
      ctx.fillText('EARTH GOLGI → detect Pluto', cx, cy + golgiR + 16);
      ctx.fillText('small perceives far', cx, cy + golgiR + 21);
      ctx.fillStyle = 'rgba(210,153,34,' + (gpLbl * 0.8).toFixed(4) + ')';
      ctx.fillText('BODY GOLGI → hyperlocal', cx, cy + bodyGolgiR + 8);
    }
  });
})();
