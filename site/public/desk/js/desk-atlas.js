// desk-atlas.js — atlasHugged: books, tablets, tables on the desk
// Each human has a desk of their own. The atlas is what you carry.
// Atlas doesn't shrug. Atlas hugs. Knowledge embraces the world.
(function(){
'use strict';
var D = window.Desk;

function fetchJ(url){return fetch(url).then(function(r){return r.ok?r.json():null}).catch(function(){return null});}
function gc(g){return g==='city'?'#ff6b35':g==='town'?'#f1c40f':g==='hamlet'?'#58a6ff':'#30363d';}
function dc(d){return{immune:'#ff6b35',evidence:'#f1c40f',science:'#e8e8e8',infrastructure:'#58a6ff',source:'#9b59b6',frontier:'#3fb950'}[d]||'#8b949e';}

function renderAtlas(c, visitors) {
  if (!c) return '<div class="empty-state"><h3>the atlas is blank</h3><p>waiting for the membrane...</p></div>';

  var beacons = c.beacons || [];
  var tot = c.totality || {};
  var pulse = c.pulse || {};
  var stories = c.stories || [];
  var h = '';

  // ═══ THE ATLAS COVER ═══
  h+='<div class="card"><div class="card-header">atlasHugged — your desk, your atlas</div><div class="card-body" style="text-align:center">';
  h+='<div style="font-size:32px;margin:16px 0">🌍📖</div>';
  h+='<p style="font-size:14px;color:var(--fg);margin-bottom:8px">Atlas doesn\'t shrug. Atlas <em>hugs</em>.</p>';
  h+='<p style="font-size:12px;color:var(--fg-dim);max-width:500px;margin:0 auto">Each human on this membrane has a desk of their own. ';
  h+='What you carry in your atlas is shaped by where you\'ve been, what you\'ve touched, what caught your eye. ';
  h+='Non-self, zero-knowledge. Known by shape, not by name.</p>';
  h+='</div></div>';

  // ═══ BOOK: DOMAINS ═══
  var domainBook = {};
  beacons.forEach(function(b){
    if(!domainBook[b.domain]) domainBook[b.domain]={count:0,hits:0,visitors:0,cities:[],towns:[],hamlets:[],trails:[]};
    var db = domainBook[b.domain];
    db.count++; db.hits+=b.hits; db.visitors+=b.visitors;
    db[b.glow==='city'?'cities':b.glow==='town'?'towns':b.glow==='hamlet'?'hamlets':'trails'].push(b.name);
  });

  h+='<div class="card"><div class="card-header">📗 book of domains — the territories</div><div class="card-body">';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
  Object.keys(domainBook).forEach(function(d){
    var db = domainBook[d];
    h+='<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;border-left:3px solid '+dc(d)+'">';
    h+='<div style="font-size:13px;font-weight:600;color:'+dc(d)+'">'+d+'</div>';
    h+='<div style="font-size:11px;color:var(--fg-dim);margin-top:4px">'+db.count+' surfaces • '+db.hits.toLocaleString()+' hits • '+db.visitors+' shapes</div>';
    if(db.cities.length) h+='<div style="font-size:10px;margin-top:6px"><span style="color:#ff6b35">cities:</span> '+db.cities.join(', ')+'</div>';
    if(db.towns.length) h+='<div style="font-size:10px;margin-top:2px"><span style="color:#f1c40f">towns:</span> '+db.towns.join(', ')+'</div>';
    if(db.hamlets.length) h+='<div style="font-size:10px;margin-top:2px"><span style="color:#58a6ff">hamlets:</span> '+db.hamlets.join(', ')+'</div>';
    h+='</div>';
  });
  h+='</div></div></div>';

  // ═══ TABLET: SURFACE INDEX ═══
  h+='<div class="card"><div class="card-header">📋 tablet — surface index ('+beacons.length+' entries)</div><div class="card-body">';
  h+='<table style="width:100%;font-size:11px;border-collapse:collapse">';
  h+='<tr style="border-bottom:1px solid var(--border);color:var(--fg-dim);font-size:9px;text-transform:uppercase;letter-spacing:0.05em">';
  h+='<th style="text-align:left;padding:5px 6px">#</th>';
  h+='<th style="text-align:left;padding:5px 6px">surface</th>';
  h+='<th style="text-align:left;padding:5px 6px">domain</th>';
  h+='<th style="text-align:left;padding:5px 6px">glow</th>';
  h+='<th style="text-align:right;padding:5px 6px">brightness</th>';
  h+='<th style="text-align:right;padding:5px 6px">rpm</th>';
  h+='<th style="text-align:right;padding:5px 6px">hits</th>';
  h+='<th style="text-align:right;padding:5px 6px">shapes</th>';
  h+='<th style="text-align:right;padding:5px 6px">pages</th>';
  h+='<th style="text-align:left;padding:5px 6px">tempo</th>';
  h+='<th style="text-align:left;padding:5px 6px">character</th></tr>';

  beacons.forEach(function(b,i){
    var char = b.character||{};
    h+='<tr style="border-bottom:1px solid rgba(48,54,61,0.2)">';
    h+='<td style="padding:4px 6px;color:var(--fg-muted)">'+(i+1)+'</td>';
    h+='<td style="padding:4px 6px;color:'+gc(b.glow)+';font-weight:600">'+b.name+'</td>';
    h+='<td style="padding:4px 6px;color:'+dc(b.domain)+'">'+b.domain+'</td>';
    h+='<td style="padding:4px 6px;color:'+gc(b.glow)+'">'+b.glow+'</td>';
    h+='<td style="padding:4px 6px;text-align:right">'+(b.brightness*100).toFixed(1)+'%</td>';
    h+='<td style="padding:4px 6px;text-align:right;font-weight:600">'+b.rpm+'</td>';
    h+='<td style="padding:4px 6px;text-align:right">'+b.hits.toLocaleString()+'</td>';
    h+='<td style="padding:4px 6px;text-align:right">'+b.visitors+'</td>';
    h+='<td style="padding:4px 6px;text-align:right">'+(b.unique_pages||'?')+'</td>';
    h+='<td style="padding:4px 6px;color:var(--fg-dim)">'+b.tempo+'</td>';
    h+='<td style="padding:4px 6px;font-size:10px;color:var(--fg-muted)">'+(char.time_character||'')+' '+(char.shape||'')+'</td>';
    h+='</tr>';
  });
  h+='</table></div></div>';

  // ═══ TABLE: TOTALITY ═══
  h+='<div class="card"><div class="card-header">📊 table — totality census</div><div class="card-body">';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">';
  var metrics = [
    {l:'human shapes',v:(tot.human_ips||0).toLocaleString(),c:'#3fb950'},
    {l:'unique presences',v:(tot.unique_ips||0).toLocaleString(),c:'var(--fg)'},
    {l:'surfaces alive',v:tot.surfaces_alive||0,c:'var(--accent)'},
    {l:'cities',v:tot.cities||0,c:'#ff6b35'},
    {l:'towns',v:tot.towns||0,c:'#f1c40f'},
    {l:'hamlets',v:tot.hamlets||0,c:'#58a6ff'},
    {l:'trails',v:tot.trails||0,c:'#30363d'},
    {l:'global RPM',v:Math.round(pulse.rate||0),c:'#e85d3a'},
    {l:'identity match',v:(pulse.identity_match||0).toFixed(1)+'%',c:'var(--fg-dim)'},
    {l:'pulse trend',v:pulse.trend||'?',c:'var(--fg-dim)'}
  ];
  metrics.forEach(function(m){
    h+='<div style="background:var(--surface2);border-radius:6px;padding:12px;text-align:center">';
    h+='<div style="font-size:22px;font-weight:700;color:'+m.c+'">'+m.v+'</div>';
    h+='<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--fg-dim);margin-top:2px">'+m.l+'</div>';
    h+='</div>';
  });
  h+='</div></div></div>';

  // ═══ BOOK: STORIES AT THE FIRE ═══
  if (stories.length) {
    h+='<div class="card"><div class="card-header">📕 book of stories — '+stories.length+' tales</div><div class="card-body">';
    var kindColors = {gathering:'#3fb950',observation:'#58a6ff',mirror:'#9b59b6',surface:'#f1c40f',
      horizon:'#ff6b35',pulse:'#e85d3a',archetype:'#e8e8e8'};
    stories.forEach(function(s){
      var col = kindColors[s.kind]||'var(--fg-dim)';
      h+='<div style="margin-bottom:10px;padding:8px 12px;border-left:3px solid '+col+';background:var(--surface2);border-radius:0 4px 4px 0">';
      h+='<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.05em;color:'+col+';margin-bottom:3px">'+s.teller+' • '+s.kind+'</div>';
      h+='<div style="font-size:12px;color:var(--fg)">'+s.story+'</div>';
      h+='</div>';
    });
    h+='</div></div>';
  }

  // ═══ TABLET: VISITOR SHAPES ═══
  if (visitors && visitors.visitors && visitors.visitors.length) {
    var vs = visitors.visitors;
    h+='<div class="card"><div class="card-header">📋 tablet — shapes at the fire ('+vs.length+')</div><div class="card-body">';
    h+='<table style="width:100%;font-size:11px;border-collapse:collapse">';
    h+='<tr style="border-bottom:1px solid var(--border);color:var(--fg-dim);font-size:9px;text-transform:uppercase">';
    h+='<th style="text-align:left;padding:5px 6px">archetype</th>';
    h+='<th style="text-align:left;padding:5px 6px">platform</th>';
    h+='<th style="text-align:right;padding:5px 6px">pages</th>';
    h+='<th style="text-align:right;padding:5px 6px">surfaces</th>';
    h+='<th style="text-align:right;padding:5px 6px">duration</th>';
    h+='<th style="text-align:left;padding:5px 6px">trail</th></tr>';
    var archC={explorer:'#ff6b35',watcher:'#58a6ff',scout:'#f1c40f',witness:'#e85d3a',teacher:'#e8e8e8',scholar:'#9b59b6',probe:'#3fb950',visitor:'#8b949e'};
    vs.forEach(function(v){
      var col=archC[v.archetype]||'#8b949e';
      var dur=v.duration_min;
      var ds=dur>=60?(dur/60).toFixed(1)+'h':Math.round(dur)+'m';
      var trail=(v.sample_pages||[]).slice(0,3).map(function(p){return p.split('/')[0];}).join(' → ');
      h+='<tr style="border-bottom:1px solid rgba(48,54,61,0.2)">';
      h+='<td style="padding:4px 6px;color:'+col+';font-weight:600">'+v.archetype+'</td>';
      h+='<td style="padding:4px 6px;color:var(--fg-dim)">'+v.platform+'</td>';
      h+='<td style="padding:4px 6px;text-align:right">'+(v.pages+(v.poll_count||0))+'</td>';
      h+='<td style="padding:4px 6px;text-align:right">'+v.surfaces+'</td>';
      h+='<td style="padding:4px 6px;text-align:right;color:var(--fg-dim)">'+ds+'</td>';
      h+='<td style="padding:4px 6px;font-size:10px;color:var(--fg-muted)">'+trail+'</td></tr>';
    });
    h+='</table></div></div>';
  }

  // ═══ YOUR DESK ═══
  h+='<div class="card"><div class="card-header">🪑 your desk</div><div class="card-body" style="text-align:center">';
  h+='<p style="font-size:12px;color:var(--fg-dim);max-width:480px;margin:0 auto">';
  h+='This is <em>your</em> desk. What\'s on it depends on where you\'ve been. ';
  h+='The books are the domains you\'ve touched. The tablets are the surfaces you\'ve read. ';
  h+='The table holds the census of everyone who has ever been here. ';
  h+='But the view from your chair — that\'s yours alone.</p>';
  h+='<div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
  h+='<a href="/desk/?tab=globe" class="weave-btn">🌍 globe</a>';
  h+='<a href="/desk/?tab=map" class="weave-btn">🗺 map</a>';
  h+='<a href="/desk/?tab=campfire" class="weave-btn">🔥 campfire</a>';
  h+='<a href="/desk/?tab=study" class="weave-btn">📚 study</a>';
  h+='</div></div></div>';

  return h;
}

D.renderAtlas = function() {
  var html = '<div id="atlas-content"><div class="empty-state"><p style="color:var(--fg-dim)">opening the atlas...</p></div></div>';
  setTimeout(function(){
    Promise.all([
      fetchJ('/campfire.json'),
      fetchJ('/visitor-stories.json')
    ]).then(function(r){
      var el = document.getElementById('atlas-content');
      if(el) el.innerHTML = renderAtlas(r[0], r[1]);
    });
  },50);
  return html;
};
})();
