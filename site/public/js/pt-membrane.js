// pt-membrane.js — [∅]D null dimension. The shape of data.
// All values are self. The membrane touches itself.
// Selectively permeable exactly at itself — P(self)=1.
//
// IS × WAS × WILLBE = π. Each body = π^(1/3).
// 1/0 = [∅] = null. The dimension before dimension.
// Over, under, above, and inside itself — overlay and layover.
//
// The ring is closed. 3 closed rings at 120° = sphere.
// Panels distributed across the entire continuum, not sectioned.
// The coil winds categories through each other at rate V(D)J.
// C(n) = π^(n/2) = observation cost. Product = π. Gap = √π.
// π-budget: ⌊π³⌋=31 max particles
window.PtMembrane = function(deps) {
  var PI = deps.PI, dimCost = deps.dimCost, PANELS = deps.PANELS;
  var CAT_COLORS = deps.CAT_COLORS, aliveSet = deps.aliveSet;
  var NS = 'http://www.w3.org/2000/svg';
  var MG = {W:700, H:480, R:Math.round(PI*54), cx:350, cy:250};
  var geo = {}, particles = [], pulses = {}, arcGlow = {};
  var pGroup, built = false, lastFrame = 0;
  var MAX_P = Math.floor(PI*PI*PI);
  var rates = {fire:0,membrane:0,immune:0,sound:0}, rps = 0, prevDash = null;
  var livePerturb = -1; // -1 = no live data, use sine wave
  var chipmunkData = null; // inner null space — squirrel/chipMonk state
  // IS×WAS×WILLBE temporal interpolation:
  // wasDash = previous fetch, isDash = current fetch, willbeT = lerp factor
  // At t=0 after fetch: willbeT=0 (pure IS). At t=15s: willbeT→1 (predicting WILLBE).
  // The jitter tear at willbeT→1 IS the prediction uncertainty.
  var wasDash = null;  // the previous dashboard snapshot (WAS)
  var isDash = null;   // the current dashboard snapshot (IS)
  var fetchTs = 0;     // timestamp of last fetch
  var fetchInterval = 15000; // ms between fetches
  var catAccum = {fire:0,membrane:0,immune:0,sound:0};
  var CATS = ['fire','membrane','immune','sound'];
  // Live stats for ionosphere band display — updated by ingest()
  var liveStats = {
    rps: 0, fleetIps: 0, humanIps: 0, fleetPct: 0,
    totalReqs: 0, entityCount: 0, aliveCount: 0
  };
  // Dimensional shape classification — ○□△◇ at module scope so animate() can see it
  var DIM_SHAPES = [
    {dim:1, sym:'\u25cb', color:'#9b59b6', count:0, names:[]},  // ○ circle
    {dim:2, sym:'\u25a1', color:'#e85d3a', count:0, names:[]},  // □ square
    {dim:3, sym:'\u25b3', color:'#5ab87a', count:0, names:[]},  // △ triangle
    {dim:4, sym:'\u25c7', color:'#4a8fb8', count:0, names:[]}   // ◇ diamond
  ];
  if (PANELS && PANELS.length) {
    PANELS.forEach(function(p) {
      var dsi = Math.min(Math.max((p.dim || 1) - 1, 0), 3);
      DIM_SHAPES[dsi].count++;
      DIM_SHAPES[dsi].names.push(p.id);
    });
  }

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

  // V(D)J interleave: distribute panels across the continuum.
  // Round-robin by category — the coil winding.
  // fire, membrane, immune, fire, membrane, immune...
  // Not sectioned. Mixed at the rate of the interleave.
  function vdjShuffle(panels) {
    var buckets = {};
    CATS.forEach(function(c) { buckets[c] = []; });
    panels.forEach(function(p) {
      if (buckets[p.cat]) buckets[p.cat].push(p);
    });
    var result = [], maxLen = 0;
    var activeCats = CATS.filter(function(c) { return buckets[c].length > 0; });
    activeCats.forEach(function(c) { maxLen = Math.max(maxLen, buckets[c].length); });
    for (var i = 0; i < maxLen; i++) {
      activeCats.forEach(function(c) {
        if (i < buckets[c].length) result.push(buckets[c][i]);
      });
    }
    return result;
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
    // Store live stats for ionosphere band display
    liveStats.rps = dash.rps || 0;
    liveStats.fleetIps = dash.fleet_ips || 0;
    liveStats.humanIps = dash.human_ips || 0;
    liveStats.fleetPct = dash.fleet_pct || 0;
    liveStats.totalReqs = dash.total_requests || 0;
    liveStats.entityCount = ents.length;
    liveStats.aliveCount = aliveSet.size;
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
      // Each body's value normalized to π^(1/3) scale
      var vals = {
        is: tb.emc2.energy || 0,
        was: tb.emc2.mass || 0,
        willbe: tb.emc2.c_squared || 0
      };
      ['is','was','willbe'].forEach(function(b) {
        var v = vals[b];
        var vE = document.getElementById('mg-body-val-'+b);
        if (vE) vE.textContent = '\u03c0^(1/3) \u00d7 ' + (v / Math.pow(PI, 1/3)).toFixed(2);
        var rE = document.getElementById('mg-body-ring-'+b);
        if (rE) {
          var scale = b === 'was' ? 4 : (b === 'willbe' ? 0.6 : 0.5);
          rE.setAttribute('r', (12 + v * scale).toFixed(1));
        }
      });
      var product = document.getElementById('mg-product');
      if (product && vals.is > 0 && vals.was > 0 && vals.willbe > 0) {
        var norm = (vals.is * vals.was * vals.willbe);
        var ratio = norm > 0 ? (PI / norm) : 0;
        product.textContent = 'IS\u00d7WAS\u00d7WILLBE \u2192 \u03c0 (' + ratio.toFixed(3) + ')';
      }
    }
    // ── [∅]D null dimension from Rust epitope sort ──
    var nd = dash.null_dimension;
    if (nd) {
      // Live perturbation from the Rust sort — overrides the sine animation
      if (typeof nd.perturbation === 'number') {
        livePerturb = nd.perturbation;
      }
      // VDJ map: update body labels with live classification
      var vdjNames = ['burst_ratio','reading_deficit','ua_pool_poverty',
                      'sec_fetch_monotone','session_absent','referer_self_loop'];
      var vdjMap = nd.vdj_map || [];
      if (vdjMap.length === 6) {
        var bodyVdj = {is:[], was:[], willbe:[]};
        for (var vi = 0; vi < 6; vi++) {
          var role = vdjMap[vi];
          if (role === 'V') bodyVdj.is.push(vdjNames[vi]);
          else if (role === 'J') bodyVdj.was.push(vdjNames[vi]);
          else bodyVdj.willbe.push(vdjNames[vi]);
        }
        var subIds = {is:'mg-sub-is', was:'mg-sub-was', willbe:'mg-sub-willbe'};
        ['is','was','willbe'].forEach(function(b) {
          var subEl = document.getElementById(subIds[b]);
          if (subEl && bodyVdj[b].length > 0) {
            subEl.textContent = bodyVdj[b].join(', ');
          }
        });
      }
      // Show live product error
      if (typeof nd.product === 'number') {
        var prodEl = document.getElementById('mg-product');
        if (prodEl) {
          var err = nd.product_error || 0;
          prodEl.textContent = 'IS\u00d7WAS\u00d7WILLBE = '
            + nd.product.toFixed(4)
            + ' (\u03c0\u00b1' + (err*100).toFixed(1) + '%)';
        }
      }
      // Show live observer fraction
      if (typeof nd.observer_fraction === 'number') {
        var obsEl = document.getElementById('mg-observer');
        if (obsEl) {
          obsEl.textContent = 'observer = ' + nd.observer_fraction.toFixed(6)
            + ' (the irrational remainder)';
        }
      }
      // Show J error — is the organism mature or learning?
      if (typeof nd.j_error === 'number') {
        var jEq = document.getElementById('mg-j-eq');
        if (jEq) {
          var state = nd.j_error > 0.1 ? 'mature' : (nd.j_error < -0.1 ? 'learning' : 'equilibrium');
          jEq.textContent = 'J\u2093rr = ' + (nd.j_error > 0 ? '+' : '') + nd.j_error.toFixed(3)
            + ' (' + state + ')';
        }
      }
    }
    // Temporal shift: WAS ← previous IS. IS ← new data.
    wasDash = prevDash ? JSON.parse(JSON.stringify(prevDash)) : null;
    isDash = JSON.parse(JSON.stringify(dash));
    fetchTs = performance.now();
    prevDash = JSON.parse(JSON.stringify(dash));
  }

  function ingestChipmunk(data) {
    chipmunkData = data;
  }

  // Great circle arc: project a 3D circle tilted by (tiltX, tiltZ) onto 2D
  function greatCirclePath(cx, cy, R, tiltX, tiltZ, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * 2 * PI;
      var x3 = R * Math.cos(t);
      var y3 = R * Math.sin(t) * Math.cos(tiltX);
      var z3 = R * Math.sin(t) * Math.sin(tiltX);
      var x2 = x3 * Math.cos(tiltZ) - z3 * Math.sin(tiltZ);
      var y2 = y3;
      pts.push((cx + x2).toFixed(1) + ' ' + (cy + y2).toFixed(1));
    }
    return 'M ' + pts.join(' L ');
  }

  // Coil path: helix winding N times around the ring
  function coilPath(cx, cy, R, offset, turns, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * 2 * PI;
      var coilAngle = t * turns + offset;
      var coilR = R + Math.sin(coilAngle) * 8;
      pts.push((cx + coilR * Math.cos(t)).toFixed(1) + ' ' + (cy + coilR * Math.sin(t)).toFixed(1));
    }
    return 'M ' + pts.join(' L ');
  }


  // ── Shared context for split files ──
  var _mc = {PI:PI, MG:MG, NS:NS, geo:geo, particles:particles, pulses:pulses,
    arcGlow:arcGlow, MAX_P:MAX_P, NS:NS, rates:rates, CATS:CATS, catAccum:catAccum,
    liveStats:liveStats, livePerturb:function(){return livePerturb;},
    setLivePerturb:function(v){livePerturb=v;},
    rps:function(){return rps;}, prevDash:function(){return prevDash;},
    PANELS:PANELS, CAT_COLORS:CAT_COLORS, aliveSet:aliveSet,
    DIM_SHAPES:DIM_SHAPES, dimCost:dimCost,
    el:el, txt:txt, vdjShuffle:vdjShuffle, spawnParticle:spawnParticle, pulse:pulse,
    coilPath:coilPath, greatCirclePath:greatCirclePath,
    chipmunkData:function(){return chipmunkData;},
    wasDash:function(){return wasDash;},
    isDash:function(){return isDash;},
    fetchTs:function(){return fetchTs;},
    fetchInterval:fetchInterval,
    pGroup:null, built:false, lastFrame:0};

  function build() {
    window._membraneBuild(_mc);
    built = true; _mc.built = true;
    pGroup = _mc.pGroup;
  }
  function animate(now) {
    if (!built || !pGroup) { requestAnimationFrame(animate); return; }
    _mc.rpsVal = rps; _mc.prevDashVal = prevDash;
    _mc.livePerturb = livePerturb;
    try { window._membraneAnimate(_mc, now); } catch(e) { if (!window._animErr) { window._animErr = e.message; console.warn('animate:', e.message); } }
    lastFrame = _mc.lastFrame;
    requestAnimationFrame(animate);
  }
  function render() {
    if (!built) build();
    var triLayer = document.getElementById('mg-triangulation');
    if (triLayer) triLayer.setAttribute('opacity', aliveSet.size > 3 ? '1' : '0');
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

  return {build:build, animate:animate, render:render, ingest:ingest, ingestChipmunk:ingestChipmunk, entityToCategory:entityToCategory, panelGeo:geo, _mc:_mc};
};
