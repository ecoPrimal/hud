// desk-study.js — study tab renderer
(function(){
var D = window.Desk;

D.renderStudy = function() {
  var marks = D.getMarks();
  var entries = [];
  for (var url in marks) {
    entries.push({ url: url, title: marks[url].title || url, epitope: marks[url].epitope || D.classify(url), time: marks[url].time });
  }

  if (entries.length === 0) {
    return '<div class="empty-state">' +
      '<h3>nothing marked yet</h3>' +
      '<p>As you explore the membrane, use <strong>\u2605 mark</strong> on pages that catch your eye. They\'ll appear here as your reading list.</p>' +
      '<p><a href="https://sporeprint.primals.eco">start exploring \u2192</a></p>' +
    '</div>';
  }

  var groups = D.groupByEpitope(entries);
  var html = '<div class="stats-bar">' +
    '<div class="stat-item"><div class="stat-val">' + entries.length + '</div><div class="stat-label">marked</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + Object.keys(groups).length + '</div><div class="stat-label">epitopes</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + D.computeEntropy(entries).toFixed(2) + '</div><div class="stat-label">H (entropy)</div></div>' +
  '</div>';

  var epOrder = ['PHYSICS','TOPOLOGY','PHILOSOPHY','METHOD','INVESTIGATION','IMMUNE','SCIENCE','SIGNAL'];
  epOrder.forEach(function(ep) {
    if (!groups[ep]) return;
    var c = D.EP_COLORS[ep];
    html += '<div class="study-group">' +
      '<div class="study-group-label" style="color:'+c+'">' + ep + ' (' + groups[ep].length + ')</div>';
    groups[ep].sort(function(a,b) { return (b.time||'') > (a.time||'') ? 1 : -1; });
    groups[ep].forEach(function(e) {
      html += '<div class="study-item">' +
        '<a href="' + e.url + '" target="_blank">' + e.title + '</a>' +
        '<span class="study-time">' + (e.time ? D.timeAgo(e.time) : '') + '</span>' +
      '</div>';
    });
    html += '</div>';
  });

  return html;
};

})();
