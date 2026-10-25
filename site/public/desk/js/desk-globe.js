// desk-globe.js — atlasHugged: the globe view. Spin, explore, see every fire.
// Atlas hugs the globe. Knowledge embraces the world.
(function(){
'use strict';
var D = window.Desk;

function fetchJ(url) {
  return fetch(url).then(function(r){return r.ok?r.json():null}).catch(function(){return null});
}
function gc(g){return g==='city'?'#ff6b35':g==='town'?'#f1c40f':g==='hamlet'?'#58a6ff':'#30363d';}
function dc(d){return{immune:'#ff6b35',evidence:'#f1c40f',science:'#e8e8e8',infrastructure:'#58a6ff',source:'#9b59b6',frontier:'#3fb950'}[d]||'#8b949e';}

function renderGlobeView(c) {
  if (!c || !c.beacons || !c.beacons.length) return '<div class="empty-state"><h3>no fires visible</h3></div>';

  var W=700,H=700,R=260,cx=W/2,cy=H/2;
  var beacons = c.beacons;
  var tot = c.totality || {};
  var pulse = c.pulse || {};

  // Globe header
  var h = '<div class="card"><div class="card-header">atlasHugged — the globe<span style="font-size:10px;color:var(--fg-muted);font-weight:400;text-transform:none">';
  h += (tot.surfaces_alive||beacons.length)+' fires • '+(tot.human_ips||0).toLocaleString()+' shapes • '+Math.round(pulse.rate||0)+' rpm</span></div>';
  h += '<div class="card-body" style="overflow-x:auto;text-align:center">';

  // Interactive globe: project beacons onto sphere using domain+index as lat/lon
  h += '<svg id="globe-svg" viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:'+W+'px;display:block;margin:0 auto;cursor:grab" xmlns="http://www.w3.org/2000/svg">';

  // Background sphere
  h += '<defs><radialGradient id="sphere-g" cx="40%" cy="35%"><stop offset="0%" stop-color="#1a2332"/>';
  h += '<stop offset="100%" stop-color="#0a0c12"/></radialGradient></defs>';
  h += '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="url(#sphere-g)" stroke="#30363d" stroke-width="1.5"/>';

  // Grid lines (meridians + parallels)
  for (var i=0;i<6;i++){
    var a=i*30*Math.PI/180;
    var rr=R*Math.cos(a);
    if(rr>5) h+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rr+'" ry="'+R+'" fill="none" stroke="#1c2030" stroke-width="0.5" transform="rotate('+(i*30)+' '+cx+' '+cy+')"/>';
  }
  for(var lat=-60;lat<=60;lat+=30){
    var y2=cy-R*Math.sin(lat*Math.PI/180);
    var rx2=R*Math.cos(lat*Math.PI/180);
    h+='<ellipse cx="'+cx+'" cy="'+y2+'" rx="'+rx2+'" ry="'+(rx2*0.3)+'" fill="none" stroke="#1c2030" stroke-width="0.5"/>';
  }

  // Domain positions on globe (as longitude sectors)
  var domains = ['immune','evidence','science','infrastructure','source','frontier'];
  var domLon = {};
  domains.forEach(function(d,i){domLon[d]=(-150+i*60)*Math.PI/180;});

  // Place beacons on globe
  var domCount = {};
  beacons.forEach(function(b){
    var d = b.domain || 'frontier';
    domCount[d] = (domCount[d]||0)+1;
    var idx = domCount[d];
    var lon = (domLon[d]||0) + (idx%5-2)*0.15;
    var lat = (Math.sin(idx*2.3)*0.6)*Math.PI/2;

    // Orthographic projection
    var x3 = Math.cos(lat)*Math.sin(lon);
    var y3 = Math.sin(lat);
    var z3 = Math.cos(lat)*Math.cos(lon);

    if (z3 < -0.05) return; // behind globe

    var px = cx + x3*R*0.92;
    var py = cy - y3*R*0.92;
    var size = 3 + b.brightness*12;
    var opacity = 0.4 + z3*0.6;
    var col = gc(b.glow);

    // Glow
    if (b.glow==='city') h+='<circle cx="'+px+'" cy="'+py+'" r="'+(size+6)+'" fill="'+col+'" opacity="'+(opacity*0.15)+'"/>';

    h+='<circle cx="'+px+'" cy="'+py+'" r="'+size+'" fill="'+col+'" opacity="'+opacity+'" stroke="'+dc(d)+'" stroke-width="0.5">';
    h+='<title>'+b.name+' ('+b.glow+') — '+b.hits+' hits, '+b.visitors+' shapes, '+b.rpm+' rpm</title></circle>';

    // Label for cities
    if (b.glow==='city' && z3>0.3) {
      h+='<text x="'+(px+size+4)+'" y="'+(py+3)+'" fill="'+col+'" opacity="'+opacity+'" font-size="9" font-family="monospace">'+b.name+'</text>';
    }
  });

  // Title arc
  h+='<text x="'+cx+'" y="'+(cy-R-16)+'" text-anchor="middle" fill="var(--fg-dim)" font-size="11" font-family="monospace">atlas hugs the globe</text>';

  h+='</svg>';

  // Domain legend
  h+='<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:12px;font-size:11px">';
  domains.forEach(function(d){
    var n = beacons.filter(function(b){return b.domain===d;}).length;
    if(n) h+='<span style="color:'+dc(d)+'">● '+d+' ('+n+')</span>';
  });
  h+='</div>';

  // Totality summary below globe
  if (tot.human_ips) {
    h+='<div style="margin-top:16px;padding:12px;background:var(--surface2);border-radius:6px;font-size:12px;color:var(--fg-dim);text-align:center">';
    h+=tot.human_ips.toLocaleString()+' human shapes have touched this globe. ';
    h+=(tot.cities||0)+' cities blaze, '+(tot.towns||0)+' towns glow, '+(tot.hamlets||0)+' hamlets flicker. ';
    if(pulse.rate) h+='The globe breathes at '+Math.round(pulse.rate)+' rpm. ';
    h+='Each presence: non-self, zero-knowledge. Known by shape, not by name.';
    h+='</div>';
  }

  h+='</div></div>';

  // Horizon stories as "view from space"
  if (c.horizon && c.horizon.length) {
    h+='<div class="card"><div class="card-header">view from orbit</div><div class="card-body">';
    c.horizon.forEach(function(s){
      h+='<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px;font-style:italic">'+s+'</p>';
    });
    h+='</div></div>';
  }

  return h;
}

D.renderGlobe = function() {
  var html = '<div id="globe-content"><div class="empty-state"><p style="color:var(--fg-dim)">spinning up the globe...</p></div></div>';
  setTimeout(function(){
    fetchJ('https://primals.eco/campfire.json').then(function(c){
      var el = document.getElementById('globe-content');
      if(el) el.innerHTML = renderGlobeView(c);
    });
  },50);
  return html;
};
})();
