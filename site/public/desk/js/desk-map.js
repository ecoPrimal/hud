// desk-map.js — map view: local surroundings, nearby fires, GPS of the membrane
(function(){
'use strict';
var D = window.Desk;

function fetchJ(url){return fetch(url).then(function(r){return r.ok?r.json():null}).catch(function(){return null});}
function gc(g){return g==='city'?'#ff6b35':g==='town'?'#f1c40f':g==='hamlet'?'#58a6ff':'#30363d';}
function dc(d){return{immune:'#ff6b35',evidence:'#f1c40f',science:'#e8e8e8',infrastructure:'#58a6ff',source:'#9b59b6',frontier:'#3fb950'}[d]||'#8b949e';}
function tc(t){return t==='rushing'?'#ff6b35':t==='walking'?'#3fb950':t==='resting'?'#58a6ff':'#484f58';}

function renderMap(c) {
  if (!c||!c.beacons||!c.beacons.length) return '<div class="empty-state"><h3>no fires nearby</h3></div>';

  var beacons = c.beacons;
  var rpm = c.rpm || {};
  var h = '';

  // Determine the "current location" — highest RPM surface (most active right now)
  var here = beacons[0]; // brightest

  // Map header — your surroundings
  h+='<div class="card"><div class="card-header">map — surroundings from '+here.name+'<span style="font-size:10px;color:var(--fg-muted);font-weight:400;text-transform:none">';
  h+=here.glow+' • '+here.rpm+' rpm • '+here.visitors+' shapes</span></div>';
  h+='<div class="card-body">';

  // Local area SVG — flat projection, nearby fires shown with distance
  var W=680,H=400,cx=W/2,cy=H/2;
  h+='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:'+W+'px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">';

  // Concentric range rings
  [80,160,240].forEach(function(r,i){
    var labels = ['nearby','visible','horizon'];
    h+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#1c2030" stroke-width="0.5" stroke-dasharray="4,4"/>';
    h+='<text x="'+(cx+r+4)+'" y="'+(cy-4)+'" fill="#30363d" font-size="8">'+labels[i]+'</text>';
  });

  // Place you at center
  h+='<circle cx="'+cx+'" cy="'+cy+'" r="8" fill="'+gc(here.glow)+'" stroke="#fff" stroke-width="2"/>';
  h+='<text x="'+cx+'" y="'+(cy+22)+'" text-anchor="middle" fill="'+gc(here.glow)+'" font-size="10" font-weight="600">'+here.name+'</text>';

  // Scatter other beacons around based on domain distance + brightness
  var domains = {};
  beacons.forEach(function(b){if(!domains[b.domain])domains[b.domain]=[];domains[b.domain].push(b);});

  var domAngle = {};
  var di = 0;
  var domKeys = Object.keys(domains);
  domKeys.forEach(function(d){domAngle[d]=(di/(domKeys.length))*Math.PI*2;di++;});

  beacons.forEach(function(b,i){
    if(i===0) return; // skip "here"
    var sameDom = b.domain === here.domain;
    var dist = sameDom ? 60+b.brightness*60 : 120+b.brightness*100;
    dist = Math.min(dist, 230);

    var angle = (domAngle[b.domain]||0) + (i%5-2)*0.25;
    var px = cx + Math.cos(angle)*dist;
    var py = cy + Math.sin(angle)*dist;
    var size = 3+b.brightness*8;

    if(b.glow==='city') h+='<circle cx="'+px+'" cy="'+py+'" r="'+(size+5)+'" fill="'+gc(b.glow)+'" opacity="0.12"/>';

    // Connection line to center if nearby
    if(sameDom) h+='<line x1="'+cx+'" y1="'+cy+'" x2="'+px+'" y2="'+py+'" stroke="'+dc(b.domain)+'" stroke-width="0.4" stroke-dasharray="2,3"/>';

    h+='<circle cx="'+px+'" cy="'+py+'" r="'+size+'" fill="'+gc(b.glow)+'" opacity="0.8" stroke="'+dc(b.domain)+'" stroke-width="0.5">';
    h+='<title>'+b.name+' ('+b.glow+') — '+b.hits+' hits, '+b.rpm+' rpm</title></circle>';

    if(b.glow==='city'||b.glow==='town'){
      h+='<text x="'+(px+size+3)+'" y="'+(py+3)+'" fill="var(--fg-dim)" font-size="8">'+b.name+'</text>';
    }
  });

  h+='</svg></div></div>';

  // Nearby fires detail table
  var nearby = beacons.slice(0,20);
  h+='<div class="card"><div class="card-header">nearby fires — '+nearby.length+' visible</div><div class="card-body">';
  h+='<table style="width:100%;font-size:12px;border-collapse:collapse">';
  h+='<tr style="border-bottom:1px solid var(--border);color:var(--fg-dim);font-size:10px;text-transform:uppercase">';
  h+='<th style="text-align:left;padding:6px 8px">surface</th>';
  h+='<th style="text-align:left;padding:6px 8px">domain</th>';
  h+='<th style="text-align:left;padding:6px 8px">glow</th>';
  h+='<th style="text-align:right;padding:6px 8px">rpm</th>';
  h+='<th style="text-align:right;padding:6px 8px">hits</th>';
  h+='<th style="text-align:right;padding:6px 8px">shapes</th>';
  h+='<th style="text-align:left;padding:6px 8px">tempo</th>';
  h+='<th style="text-align:right;padding:6px 8px">nearby</th></tr>';

  nearby.forEach(function(b){
    h+='<tr style="border-bottom:1px solid rgba(48,54,61,0.3)">';
    h+='<td style="padding:6px 8px;color:'+gc(b.glow)+';font-weight:600">'+b.name+'</td>';
    h+='<td style="padding:6px 8px;color:'+dc(b.domain)+'">'+b.domain+'</td>';
    h+='<td style="padding:6px 8px;color:'+gc(b.glow)+'">'+b.glow+'</td>';
    h+='<td style="padding:6px 8px;text-align:right;font-weight:600;color:'+tc(b.tempo)+'">'+b.rpm+'</td>';
    h+='<td style="padding:6px 8px;text-align:right">'+b.hits.toLocaleString()+'</td>';
    h+='<td style="padding:6px 8px;text-align:right">'+b.visitors+'</td>';
    h+='<td style="padding:6px 8px;color:'+tc(b.tempo)+'">'+b.tempo+'</td>';
    h+='<td style="padding:6px 8px;text-align:right;color:var(--fg-muted)">'+(b.nearby_fires?b.nearby_fires.length:0)+'</td></tr>';
  });
  h+='</table></div></div>';

  // RPM bars (localized pulse)
  var active = beacons.filter(function(b){return b.rpm>0.05;});
  if(active.length){
    var maxR=active[0].rpm||1;
    h+='<div class="card"><div class="card-header">localized RPM — pulse of each fire</div><div class="card-body">';
    active.forEach(function(b){
      var pct = Math.max(2,Math.round(b.rpm/maxR*100));
      h+='<div class="shape-bar-row">';
      h+='<div class="shape-bar-label" style="color:'+gc(b.glow)+'">'+b.name+'</div>';
      h+='<div class="shape-bar-track"><div class="shape-bar-fill" style="width:'+pct+'%;background:'+tc(b.tempo)+'"></div></div>';
      h+='<div class="shape-bar-val" style="color:'+tc(b.tempo)+'">'+b.rpm+'</div>';
      h+='</div>';
    });
    h+='</div></div>';
  }

  return h;
}

D.renderMap = function() {
  var html = '<div id="map-content"><div class="empty-state"><p style="color:var(--fg-dim)">reading the terrain...</p></div></div>';
  setTimeout(function(){
    fetchJ('/campfire.json').then(function(c){
      var el = document.getElementById('map-content');
      if(el) el.innerHTML = renderMap(c);
    });
  },50);
  return html;
};
})();
