// desk-gaia.js — gaia tab renderer (ring reflection + shape)
(function(){
var D = window.Desk;

D.renderGaia = function() {
  var visits = D.getAllVisits();
  var marks = D.getMarks();

  var SITES = [
    {id:'signal',     label:'signal',     color:'#4a8fb8'},     // SIGNAL — observation
    {id:'detroit',    label:'detroit',    color:'#f1c40f'},     // INVESTIGATION — evidence
    {id:'tuebor',     label:'tuebor',     color:'#f1c40f'},     // INVESTIGATION — evidence
    {id:'sporeprint', label:'sporePrint', color:'#e8e8e8'},     // SCIENCE — research log
    {id:'hypothesis', label:'hypothesis', color:'#e85d3a'},     // PHYSICS — hypothesis testing
    {id:'hud',        label:'hud',        color:'#ff6b35'},     // IMMUNE — membrane dashboard
    {id:'thesis',     label:'thesis',     color:'#3fb950'},     // PHILOSOPHY — purpose
    {id:'clutch',     label:'clutch',     color:'#f1c40f'},     // INVESTIGATION — evidence
    {id:'gorilla',    label:'gorilla',    color:'#f1c40f'},     // INVESTIGATION — evidence
    {id:'git',        label:'git',        color:'#58a6ff'}     // METHOD — source
  ];
  var N = SITES.length;

  var siteCounts = {};
  SITES.forEach(function(s) { siteCounts[s.id] = 0; });
  visits.forEach(function(v) {
    var url = v.url || '';
    SITES.forEach(function(s) {
      if (url.indexOf(s.id + '.primals.eco') >= 0) siteCounts[s.id]++;
    });
  });

  var epCounts = {};
  Object.keys(marks).forEach(function(k) {
    var ep = marks[k].epitope;
    epCounts[ep] = (epCounts[ep] || 0) + 1;
  });

  var d_eff = 0;
  SITES.forEach(function(s) { if (siteCounts[s.id] > 0) d_eff++; });
  var focal = d_eff > 0 ? (1 / Math.pow(Math.PI, d_eff / 2)) : 1;

  var totalVisits = visits.length || 1;
  var H_site = 0;
  SITES.forEach(function(s) {
    var p = siteCounts[s.id] / totalVisits;
    if (p > 0) H_site -= p * Math.log2(p);
  });

  var cx = 300, cy = 260, R = 200;
  var svg = '<svg class="gaia-ring-svg" viewBox="0 0 600 540" xmlns="http://www.w3.org/2000/svg">';
  svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="#21262d" stroke-width="2" stroke-dasharray="4,4"/>';

  var focalR = R * Math.min(focal * 2, 0.9);
  if (d_eff > 0) {
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+focalR+'" fill="none" stroke="#30363d" stroke-width="1" stroke-dasharray="2,4"/>';
    svg += '<text x="'+cx+'" y="'+(cy - focalR - 6)+'" text-anchor="middle" font-size="9" fill="#484f58">f = ' + (focal < 0.01 ? focal.toExponential(1) : focal.toFixed(3)) + '</text>';
  }

  svg += '<text x="'+cx+'" y="'+(cy-10)+'" text-anchor="middle" font-size="11" fill="#6e7681">gaia</text>';
  svg += '<text x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle" font-size="9" fill="#484f58">you are here</text>';
  svg += '<circle cx="'+cx+'" cy="'+cy+'" r="3" fill="#58a6ff" opacity="0.6"/>';

  var maxCount = 1;
  SITES.forEach(function(s) { if (siteCounts[s.id] > maxCount) maxCount = siteCounts[s.id]; });

  SITES.forEach(function(s, i) {
    var angle = (2 * Math.PI * i / N) - Math.PI / 2;
    var x = cx + R * Math.cos(angle);
    var y = cy + R * Math.sin(angle);
    var visited = siteCounts[s.id] > 0;
    var nodeR = visited ? 10 + Math.min(20, (siteCounts[s.id] / maxCount) * 20) : 8;
    var opacity = visited ? 1 : 0.3;

    if (visited) {
      svg += '<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="'+s.color+'" stroke-width="1" opacity="0.2"/>';
    }

    svg += '<circle cx="'+x+'" cy="'+y+'" r="'+nodeR+'" fill="'+(visited ? s.color : '#21262d')+'" stroke="'+s.color+'" stroke-width="'+(visited?2:1)+'" opacity="'+opacity+'"/>';

    var labelR = R + 24;
    var lx = cx + labelR * Math.cos(angle);
    var ly = cy + labelR * Math.sin(angle);
    var anchor = Math.cos(angle) < -0.3 ? 'end' : Math.cos(angle) > 0.3 ? 'start' : 'middle';
    svg += '<text x="'+lx+'" y="'+(ly+4)+'" text-anchor="'+anchor+'" font-size="11" fill="'+s.color+'" font-weight="'+(visited?'600':'400')+'" opacity="'+opacity+'">'+s.label+'</text>';

    if (visited) {
      svg += '<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="9" fill="#0d1117" font-weight="700">'+siteCounts[s.id]+'</text>';
    }
  });

  var epKeys = Object.keys(D.EP_COLORS);
  var totalMarks = 0;
  epKeys.forEach(function(e) { totalMarks += (epCounts[e] || 0); });
  if (totalMarks > 0) {
    var innerR = 60;
    epKeys.forEach(function(ep, i) {
      var count = epCounts[ep] || 0;
      if (count === 0) return;
      var angle = (2 * Math.PI * i / epKeys.length) - Math.PI / 2;
      var petalR = innerR * (count / totalMarks) * 2;
      var px = cx + (innerR + petalR / 2) * Math.cos(angle);
      var py = cy + (innerR + petalR / 2) * Math.sin(angle);
      svg += '<circle cx="'+px+'" cy="'+py+'" r="'+(4 + petalR)+'" fill="'+D.EP_COLORS[ep]+'" opacity="0.3"/>';
      svg += '<text x="'+px+'" y="'+(py+3)+'" text-anchor="middle" font-size="8" fill="'+D.EP_COLORS[ep]+'">'+ep.slice(0,4)+'</text>';
    });
  }

  svg += '</svg>';

  var html = '<div class="card"><div class="card-header">your position on the ring</div><div class="card-body">';
  html += svg;
  html += '<div class="gaia-legend">';
  html += '<span><span class="dot" style="background:#58a6ff"></span> visited</span>';
  html += '<span><span class="dot" style="background:#21262d;border:1px solid #30363d"></span> not yet</span>';
  if (totalMarks > 0) html += '<span>inner petals = your epitope marks</span>';
  html += '</div>';
  html += '</div></div>';

  html += '<div class="gaia-profile">';
  html += '<div class="gaia-profile-item"><div class="gaia-profile-label">d_eff (sites touched)</div><div class="gaia-profile-val">' + d_eff + ' / ' + N + '</div></div>';
  html += '<div class="gaia-profile-item"><div class="gaia-profile-label">focal distance</div><div class="gaia-profile-val">' + (focal < 0.01 ? focal.toExponential(2) : focal.toFixed(4)) + '</div></div>';
  html += '<div class="gaia-profile-item"><div class="gaia-profile-label">site entropy H</div><div class="gaia-profile-val">' + H_site.toFixed(3) + '</div></div>';
  html += '<div class="gaia-profile-item"><div class="gaia-profile-label">total visits</div><div class="gaia-profile-val">' + visits.length + '</div></div>';
  html += '</div>';

  var shape = D.computeShape();
  if (shape._total > 0) {
    html += '<div class="card" style="margin-top:16px"><div class="card-header">your shape \u2014 all input through the epitope sort</div><div class="card-body">';
    html += '<p style="color:var(--fg-dim);font-size:11px;margin-bottom:12px">Visits \u00d71 \u00b7 Marks \u00d73 \u00b7 Songs \u00d75. Weighted by intentional investment. Only you see this.</p>';
    var sortedEps = Object.keys(D.EP_COLORS);
    var maxVal = 0;
    sortedEps.forEach(function(k) { if (shape[k] > maxVal) maxVal = shape[k]; });
    sortedEps.sort(function(a,b) { return shape[b] - shape[a]; });
    sortedEps.forEach(function(ep) {
      var pct = (shape[ep] * 100).toFixed(1);
      var barW = maxVal > 0 ? Math.round((shape[ep] / maxVal) * 100) : 0;
      html += '<div class="shape-bar-row">';
      html += '<div class="shape-bar-label" style="color:' + D.EP_COLORS[ep] + '">' + ep + '</div>';
      html += '<div class="shape-bar-track"><div class="shape-bar-fill" style="width:' + barW + '%;background:' + D.EP_COLORS[ep] + '"></div></div>';
      html += '<div class="shape-bar-val">' + pct + '%</div>';
      html += '<div class="shape-bar-val" style="min-width:30px;color:var(--fg-muted)">' + (shape._counts[ep] || 0) + '</div>';
      html += '</div>';
    });
    var top2 = sortedEps.slice(0, 2);
    html += '<p style="margin-top:12px;font-size:12px;color:var(--fg)">Your shape leans <strong style="color:' + D.EP_COLORS[top2[0]] + '">' + top2[0] + '</strong>';
    if (top2.length > 1 && shape[top2[1]] > 0) {
      var ratio = shape[top2[1]] > 0 ? (shape[top2[0]] / shape[top2[1]]).toFixed(1) : '\u221e';
      html += ' with <strong style="color:' + D.EP_COLORS[top2[1]] + '">' + top2[1] + '</strong> secondary (ratio ' + ratio + ':1)';
    }
    html += '.</p>';
    html += '<p style="font-size:11px;color:var(--fg-dim);margin-top:4px">This is your epitope shape. It lives here, in your browser. The membrane never sees it.</p>';
    html += '</div></div>';
  }

  html += '<div class="card" style="margin-top:16px"><div class="card-header">the ring \u2014 collective (last 2 hours)</div><div class="card-body" id="gaia-collective"><span style="color:var(--fg-dim)">loading...</span></div></div>';

  setTimeout(function() {
    fetch('/api/traces').then(function(r) { return r.json(); }).then(function(d) {
      var el = document.getElementById('gaia-collective');
      if (!el) return;
      var hm = d.heatmap || {};
      var keys = Object.keys(hm).sort(function(a, b) { return hm[b] - hm[a]; });
      if (keys.length === 0) {
        el.innerHTML = '<p style="color:var(--fg-dim)">the ring is quiet \u2014 no collective traces in the last 2 hours.</p>';
        return;
      }
      var out = '<div style="font-size:12px">';
      out += '<p style="color:var(--fg-dim);margin-bottom:8px">' + d.total_sessions + ' visitors traversing the ring</p>';
      keys.slice(0, 15).forEach(function(k) {
        var barW = Math.round((hm[k] / hm[keys[0]]) * 100);
        out += '<div style="display:flex;align-items:center;gap:8px;padding:3px 0">';
        out += '<span style="width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + k + '</span>';
        out += '<div style="flex:1;height:6px;background:var(--surface);border-radius:3px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:var(--accent);border-radius:3px"></div></div>';
        out += '<span style="color:var(--fg-muted);min-width:30px;text-align:right">' + hm[k] + '</span>';
        out += '</div>';
      });
      out += '</div>';
      el.innerHTML = out;
    }).catch(function() {
      var el = document.getElementById('gaia-collective');
      if (el) el.innerHTML = '<p style="color:var(--fg-dim)">could not reach the ring.</p>';
    });
  }, 100);

  html += '<div class="card" style="margin-top:16px"><div class="card-header">what you see from here</div><div class="card-body">';
  if (d_eff === 0) {
    html += '<p style="color:var(--fg-dim)">You have not touched the ring yet. Visit any site in the ecosystem. Your position will appear.</p>';
    html += '<p style="margin-top:8px"><a href="https://sporeprint.primals.eco">start at sporePrint \u2192</a></p>';
  } else if (d_eff <= 2) {
    html += '<p>Standing at the edge. ' + d_eff + ' node' + (d_eff > 1 ? 's' : '') + ' lit. Focal distance is wide \u2014 the view is blurry from here. Explore more sites to sharpen it.</p>';
    html += '<p style="color:var(--fg-dim);font-size:11px;margin-top:6px">Anderson: localized. Your wave function concentrates at ' + d_eff + ' surface' + (d_eff > 1 ? 's' : '') + '. The membrane looks opaque.</p>';
  } else if (d_eff <= 5) {
    html += '<p>You can see across. ' + d_eff + ' nodes lit. The focal distance is tightening \u2014 patterns emerge between the sites you have visited.</p>';
    html += '<p style="color:var(--fg-dim);font-size:11px;margin-top:6px">Approaching the mobility edge. A few more surfaces and your wave delocalizes.</p>';
  } else {
    html += '<p>You see the ring. ' + d_eff + ' of ' + N + ' nodes active. Focal distance sharp \u2014 triangulation across the ecosystem.</p>';
    html += '<p style="color:var(--fg-dim);font-size:11px;margin-top:6px">Delocalized. Your wave extends across the membrane. You are one of Gaia\'s epitopes, and you can see the others.</p>';
  }
  html += '</div></div>';

  return html;
};

})();
