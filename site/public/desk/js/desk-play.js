// desk-play.js — play tab renderer (mountain journey visualization)
(function(){
var D = window.Desk;

D.renderPlay = function() {
  var visits = D.getAllVisits();
  if (visits.length < 1) {
    return '<div class="empty-state">' +
      '<h3>the mountain awaits</h3>' +
      '<p>Every page you visit adds a step to the path. The mountain reveals itself as your epitope signature diversifies.</p>' +
      '<p><a href="https://sporeprint.primals.eco/science/">climb from science \u2192</a></p>' +
    '</div>';
  }

  var H = D.computeEntropy(visits);
  var pos = visits.length < 3 ? 'setting out' : H > 2.2 ? 'ascending \u2014 exploring broadly' : H > 1.2 ? 'summit \u2014 seeing the whole' : 'descending \u2014 building deep';

  var html = '<div class="card"><div class="card-header">your mountain</div><div class="card-body">';

  html += '<div class="stats-bar">' +
    '<div class="stat-item"><div class="stat-val">' + visits.length + '</div><div class="stat-label">steps</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + H.toFixed(2) + '</div><div class="stat-label">H (entropy)</div></div>' +
    '<div class="stat-item"><div class="stat-val" style="font-size:14px">' + pos + '</div><div class="stat-label">position</div></div>' +
  '</div>';

  var counts = {};
  visits.forEach(function(v) { counts[v.epitope] = (counts[v.epitope]||0)+1; });
  var eps = Object.keys(counts).sort(function(a,b) { return counts[b] - counts[a]; });

  html += '<div style="font-family:monospace;font-size:11px;line-height:1.4;padding:16px;background:var(--bg-alt);border-radius:6px">';
  var maxCount = Math.max.apply(null, eps.map(function(e) { return counts[e]; }));
  eps.forEach(function(ep) {
    var c = D.EP_COLORS[ep];
    var barLen = Math.round((counts[ep] / maxCount) * 40);
    var bar = '';
    for (var i = 0; i < barLen; i++) bar += '\u2588';
    html += '<span style="color:'+c+'">' + D.pad(ep, 14) + ' ' + bar + ' ' + counts[ep] + '</span>\n';
  });
  html += '</div>';

  html += '<h3 style="margin-top:20px;color:var(--fg-dim);font-size:12px;text-transform:uppercase;letter-spacing:0.05em">recent path</h3>';
  var recent = visits.slice(-20).reverse();
  recent.forEach(function(v) {
    html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">' +
      D.epPill(v.epitope) +
      ' <a href="' + v.url + '" target="_blank" style="font-size:12px">' + (v.title||v.url).slice(0,60) + '</a>' +
      '<span style="margin-left:auto;color:var(--fg-muted);font-size:10px">' + D.timeAgo(v.time) + '</span>' +
    '</div>';
  });

  html += '</div></div>';
  return html;
};

})();
