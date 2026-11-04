// desk-campfire.js — campfire tab: beacons, totality, non-self ZK, RPM
// Single source: campfire.json (skunky-ingest Rust, 15s real-time, converged Wave 178)
(function(){
'use strict';
var D = window.Desk;

function fetchData(url) {
  return fetch(url).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; });
}

function glowColor(glow) {
  return glow === 'city' ? '#ff6b35' : glow === 'town' ? '#f1c40f' : glow === 'hamlet' ? '#58a6ff' : '#30363d';
}
function tempoColor(tempo) {
  return tempo === 'rushing' ? '#ff6b35' : tempo === 'walking' ? '#3fb950' : tempo === 'resting' ? '#58a6ff' : '#484f58';
}
function domainColor(domain) {
  return {immune:'#ff6b35',evidence:'#f1c40f',science:'#e8e8e8',infrastructure:'#58a6ff',source:'#9b59b6',frontier:'#3fb950'}[domain] || '#8b949e';
}

function renderTotality(tot, pulse) {
  if (!tot) return '';
  var h = '<div class="card"><div class="card-header">totality — non-self ZK</div><div class="card-body">';
  h += '<div class="stats-bar" style="flex-wrap:wrap">';
  h += '<div class="stat-item"><div class="stat-val" style="color:#3fb950">' + (tot.human_ips||0).toLocaleString() + '</div><div class="stat-label">human shapes</div></div>';
  h += '<div class="stat-item"><div class="stat-val">' + (tot.unique_ips||0).toLocaleString() + '</div><div class="stat-label">unique presences</div></div>';
  h += '<div class="stat-item"><div class="stat-val" style="color:#ff6b35">' + (tot.cities||0) + '</div><div class="stat-label">cities</div></div>';
  h += '<div class="stat-item"><div class="stat-val" style="color:#f1c40f">' + (tot.towns||0) + '</div><div class="stat-label">towns</div></div>';
  h += '<div class="stat-item"><div class="stat-val" style="color:#58a6ff">' + (tot.hamlets||0) + '</div><div class="stat-label">hamlets</div></div>';
  h += '<div class="stat-item"><div class="stat-val">' + (tot.surfaces_alive||0) + '</div><div class="stat-label">beacons</div></div>';
  if (pulse) {
    h += '<div class="stat-item"><div class="stat-val" style="color:#e85d3a">' + Math.round(pulse.rate||0) + '</div><div class="stat-label">rpm global</div></div>';
    h += '<div class="stat-item"><div class="stat-val">' + (pulse.identity_match||0).toFixed(1) + '%</div><div class="stat-label">identity</div></div>';
  }
  h += '</div>';
  h += '<p style="color:var(--fg-dim);font-size:11px;margin-top:8px">Each shape is non-self, zero-knowledge. Known by path, not by name. The membrane sees archetype, not identity.</p>';
  h += '</div></div>';
  return h;
}

function renderBeaconMap(beacons) {
  if (!beacons || !beacons.length) return '';
  var W = 700, H = 420, cx = W/2, cy = H/2;
  var h = '<div class="card"><div class="card-header">beacon map — campfires in the distance</div><div class="card-body" style="overflow-x:auto">';
  h += '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:'+W+'px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">';

  // Domain clusters positioned in space
  var domPos = {
    immune:{x:cx,y:cy-50}, evidence:{x:cx+170,y:cy+50},
    science:{x:cx-170,y:cy+50}, infrastructure:{x:cx,y:cy+130},
    source:{x:cx+170,y:cy-70}, frontier:{x:cx-170,y:cy-70}
  };

  // Position each beacon around its domain center
  var placed = {};
  var groups = {};
  beacons.forEach(function(b) {
    if (!groups[b.domain]) groups[b.domain] = [];
    groups[b.domain].push(b);
  });

  for (var dom in domPos) {
    var dc = domPos[dom];
    h += '<text x="'+dc.x+'" y="'+(dc.y-85)+'" text-anchor="middle" font-size="9" fill="'+domainColor(dom)+'" opacity="0.4" font-weight="600">'+dom.toUpperCase()+'</text>';
  }

  beacons.forEach(function(b) {
    var dc = domPos[b.domain] || domPos.frontier;
    var grp = groups[b.domain] || [];
    var idx = grp.indexOf(b);
    var a = (Math.PI*2*idx/Math.max(grp.length,1));
    var spread = 28 + grp.length * 5;
    var x = Math.max(28, Math.min(W-28, dc.x + Math.cos(a)*spread));
    var y = Math.max(18, Math.min(H-18, dc.y + Math.sin(a)*spread));
    placed[b.surface] = {x:x,y:y};

    var r = 3 + b.brightness * 15;
    var col = glowColor(b.glow);
    var op = 0.25 + b.brightness * 0.75;

    if (b.glow === 'city') h += '<circle cx="'+x+'" cy="'+y+'" r="'+(r+10)+'" fill="'+col+'" opacity="0.06"/>';
    h += '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+col+'" opacity="'+op+'" stroke="'+col+'" stroke-width="0.5">';
    h += '<title>'+b.name+' ['+b.domain+'] — '+b.hits+' hits, '+b.visitors+' shapes, '+b.glow+' ('+b.rpm+' rpm, '+b.tempo+')</title>';
    h += '</circle>';

    if (b.brightness > 0.5) {
      h += '<text x="'+x+'" y="'+(y-r-3)+'" text-anchor="middle" font-size="7.5" fill="'+col+'" font-weight="600">'+b.name+'</text>';
    }
  });

  // Draw connections between nearby beacons
  beacons.slice(0,20).forEach(function(b) {
    if (!b.nearby_fires || !placed[b.surface]) return;
    var from = placed[b.surface];
    b.nearby_fires.slice(0,3).forEach(function(n) {
      if (!placed[n.surface]) return;
      var to = placed[n.surface];
      h += '<line x1="'+from.x+'" y1="'+from.y+'" x2="'+to.x+'" y2="'+to.y+'" stroke="#30363d" stroke-width="0.4" opacity="0.2"/>';
    });
  });

  h += '</svg>';
  h += '<div style="display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:10px;color:var(--fg-dim)">';
  ['city','town','hamlet','trail'].forEach(function(g) {
    h += '<span style="display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:50%;background:'+glowColor(g)+';display:inline-block"></span> '+g+'</span>';
  });
  h += '</div></div></div>';
  return h;
}

function renderVisitors(visitors) {
  if (!visitors || !visitors.visitors || !visitors.visitors.length) return '';
  var archColors = {explorer:'#ff6b35',watcher:'#58a6ff',scout:'#f1c40f',witness:'#e85d3a',
    teacher:'#e8e8e8',scholar:'#9b59b6',probe:'#3fb950',visitor:'#8b949e'};

  var h = '<div class="card"><div class="card-header">shapes at the fire — non-self ZK</div><div class="card-body">';
  h += '<table style="width:100%;font-size:12px;border-collapse:collapse">';
  h += '<tr style="border-bottom:1px solid var(--border);color:var(--fg-dim);font-size:10px;text-transform:uppercase">';
  h += '<th style="text-align:left;padding:6px 8px">archetype</th><th style="text-align:left;padding:6px 8px">platform</th>';
  h += '<th style="text-align:right;padding:6px 8px">pages</th><th style="text-align:right;padding:6px 8px">surfaces</th>';
  h += '<th style="text-align:right;padding:6px 8px">duration</th><th style="text-align:left;padding:6px 8px">trail</th></tr>';

  visitors.visitors.forEach(function(v) {
    var col = archColors[v.archetype] || '#8b949e';
    var dur = v.duration_min;
    var durStr = dur >= 60 ? (dur/60).toFixed(1)+'h' : Math.round(dur)+'m';
    var trail = (v.sample_pages||[]).slice(0,3).map(function(p){return p.split('/')[0];}).join(' → ');
    h += '<tr style="border-bottom:1px solid rgba(48,54,61,0.3)">';
    h += '<td style="padding:6px 8px;color:'+col+';font-weight:600">'+v.archetype+'</td>';
    h += '<td style="padding:6px 8px;color:var(--fg-dim)">'+v.platform+'</td>';
    h += '<td style="padding:6px 8px;text-align:right">'+(v.pages+(v.poll_count||0))+'</td>';
    h += '<td style="padding:6px 8px;text-align:right">'+v.surfaces+'</td>';
    h += '<td style="padding:6px 8px;text-align:right;color:var(--fg-dim)">'+durStr+'</td>';
    h += '<td style="padding:6px 8px;font-size:10px;color:var(--fg-muted)">'+trail+'</td></tr>';
  });
  h += '</table>';

  var archCounts = {};
  visitors.visitors.forEach(function(v) { archCounts[v.archetype] = (archCounts[v.archetype]||0)+1; });
  h += '<div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;font-size:11px">';
  for (var a in archCounts) h += '<span style="color:'+(archColors[a]||'#8b949e')+'">'+a+': '+archCounts[a]+'</span>';
  h += '</div>';
  h += '<p style="margin-top:8px;font-size:10px;color:var(--fg-muted)">No IPs. No cookies. No tracking. Shape only. ZK proof of presence.</p>';
  h += '</div></div>';
  return h;
}

function renderRPM(beacons) {
  if (!beacons || !beacons.length) return '';
  var active = beacons.filter(function(b) { return b.rpm > 0.01; });
  if (!active.length) return '';
  var maxRpm = active[0].rpm || 1;

  var h = '<div class="card"><div class="card-header">surface RPM — localized pulse</div><div class="card-body">';
  active.forEach(function(b) {
    var pct = Math.round((b.rpm/maxRpm)*100);
    var col = tempoColor(b.tempo);
    h += '<div class="shape-bar-row">';
    h += '<div class="shape-bar-label" style="color:'+col+';width:120px">'+b.name+'</div>';
    h += '<div class="shape-bar-track"><div class="shape-bar-fill" style="width:'+pct+'%;background:'+col+'"></div></div>';
    h += '<div class="shape-bar-val">'+b.rpm.toFixed(1)+'</div>';
    h += '<div class="shape-bar-val" style="min-width:55px;color:var(--fg-muted)">'+b.tempo+'</div></div>';
  });

  var tempos = {};
  active.forEach(function(b) { tempos[b.tempo] = (tempos[b.tempo]||0)+1; });
  h += '<div style="margin-top:12px;display:flex;gap:16px;font-size:11px;color:var(--fg-dim)">';
  for (var t in tempos) h += '<span style="color:'+tempoColor(t)+'">'+t+': '+tempos[t]+'</span>';
  h += '</div></div></div>';
  return h;
}

function renderStories(campfire) {
  if (!campfire || !campfire.stories || !campfire.stories.length) return '';
  var h = '<div class="card"><div class="card-header">stories around the fire (real-time)</div><div class="card-body">';
  campfire.stories.forEach(function(s) {
    var kc = s.kind==='gathering'?'#3fb950':s.kind==='observation'?'#ff6b35':s.teller==='visitor'?'#9b59b6':'#8b949e';
    h += '<div style="padding:8px 0;border-bottom:1px solid var(--border)">';
    h += '<span style="font-size:9px;color:'+kc+';text-transform:uppercase;letter-spacing:0.08em;font-weight:600">'+s.kind+'</span>';
    h += '<p style="margin-top:3px;font-size:12px;line-height:1.55;color:var(--fg)">'+s.story+'</p></div>';
  });
  h += '</div></div>';
  return h;
}

function renderHorizon(horizon) {
  if (!horizon || !horizon.length) return '';
  var h = '<div class="card"><div class="card-header">horizon — beacons in the distance</div><div class="card-body">';
  horizon.forEach(function(s) {
    h += '<p style="padding:6px 0;font-size:12px;line-height:1.55;color:var(--fg);border-bottom:1px solid var(--border)">'+s+'</p>';
  });
  h += '</div></div>';
  return h;
}

D.renderCampfire = function() {
  var html = '<div id="campfire-content"><div class="empty-state"><p style="color:var(--fg-dim)">loading campfire...</p></div></div>';

  setTimeout(function() {
    var base = 'https://primals.eco';
    Promise.all([
      fetchData(base + '/campfire.json'),
      fetchData(base + '/visitor-stories.json')
    ]).then(function(results) {
      var c = results[0], visitors = results[1];
      var el = document.getElementById('campfire-content');
      if (!el) return;

      if (!c) {
        el.innerHTML = '<div class="empty-state"><h3>the fire is not lit</h3><p>campfire data unavailable</p></div>';
        return;
      }

      var out = '';
      out += renderTotality(c.totality, c.pulse);
      out += renderBeaconMap(c.beacons);
      out += renderHorizon(c.horizon);
      out += renderVisitors(visitors);
      out += renderRPM(c.beacons);
      out += renderStories(c);
      el.innerHTML = out;
    });
  }, 50);

  return html;
};
})();
