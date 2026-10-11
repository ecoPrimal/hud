// desk-draw.js — draw tab renderer (epitope connection map)
(function(){
var D = window.Desk;

D.renderDraw = function() {
  var visits = D.getAllVisits();
  if (visits.length < 2) {
    return '<div class="empty-state">' +
      '<h3>not enough trail yet</h3>' +
      '<p>Explore more pages across the membrane. As your trail grows, the draw canvas maps the connections between the epitopes you\'ve touched.</p>' +
    '</div>';
  }

  var counts = {};
  visits.forEach(function(v) { counts[v.epitope] = (counts[v.epitope]||0)+1; });
  var eps = Object.keys(counts).sort(function(a,b) { return counts[b] - counts[a]; });
  var total = visits.length;

  var html = '<div class="card"><div class="card-header">your epitope map</div><div class="card-body">';
  html += '<div class="draw-canvas" id="draw-area">';

  var cx = 400, cy = 200, r = 150;
  eps.forEach(function(ep, i) {
    var angle = (2 * Math.PI * i / eps.length) - Math.PI/2;
    var x = cx + r * Math.cos(angle) - 25;
    var y = cy + r * Math.sin(angle) - 25;
    var size = 30 + Math.min(50, (counts[ep]/total) * 150);
    var c = D.EP_COLORS[ep];
    html += '<div class="draw-node" style="left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;border-color:'+c+';color:'+c+'">' +
      ep + '<br>' + counts[ep] +
    '</div>';
  });

  html += '</div></div></div>';

  html += '<div class="card"><div class="card-header">epitope transitions</div><div class="card-body">';
  var transitions = {};
  for (var i = 1; i < visits.length; i++) {
    var from = visits[i-1].epitope, to = visits[i].epitope;
    if (from !== to) {
      var key = from + ' \u2192 ' + to;
      transitions[key] = (transitions[key]||0) + 1;
    }
  }
  var tKeys = Object.keys(transitions).sort(function(a,b) { return transitions[b] - transitions[a]; });
  if (tKeys.length === 0) {
    html += '<p style="color:var(--fg-dim)">All visits in one epitope \u2014 no transitions yet.</p>';
  } else {
    tKeys.slice(0,15).forEach(function(t) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0">' +
        '<span style="font-size:12px">' + t + '</span>' +
        '<span style="margin-left:auto;color:var(--fg-dim);font-size:11px">\u00d7' + transitions[t] + '</span>' +
      '</div>';
    });
  }
  html += '</div></div>';

  return html;
};

})();
