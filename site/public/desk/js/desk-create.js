// desk-create.js — create tab renderer + braid export
(function(){
var D = window.Desk;

D.renderCreate = function() {
  var marks = D.getMarks();
  var songs = D.getAllSongs();
  var markCount = Object.keys(marks).length;
  var songCount = Object.keys(songs).length;

  if (markCount === 0 && songCount === 0) {
    return '<div class="empty-state">' +
      '<h3>forge something</h3>' +
      '<p>Mark pages you find important. Sing notes on them. Come back here to weave them into a story \u2014 a shareable braid of the things that caught your eye.</p>' +
    '</div>';
  }

  var html = '<div class="card"><div class="card-header">forge a braid</div><div class="card-body">';
  html += '<p style="color:var(--fg-dim);margin-bottom:16px">Your marks and songs, woven together. Export as a shareable page.</p>';

  html += '<div class="stats-bar">' +
    '<div class="stat-item"><div class="stat-val">' + markCount + '</div><div class="stat-label">marks</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + songCount + '</div><div class="stat-label">songs</div></div>' +
  '</div>';

  for (var url in marks) {
    var m = marks[url];
    var ep = m.epitope || D.classify(url);
    html += '<div style="margin-bottom:12px;padding:10px;background:var(--surface2);border-radius:4px;border-left:3px solid '+(D.EP_COLORS[ep]||'#8b949e')+'">';
    html += '<div style="display:flex;align-items:center;gap:8px">' +
      D.epPill(ep) + ' <a href="' + url + '" target="_blank">' + (m.title || url) + '</a>' +
    '</div>';
    if (songs[url]) {
      html += '<div style="margin-top:8px;padding:8px;background:var(--bg);border-radius:4px;font-size:12px;color:var(--fg);white-space:pre-wrap">' +
        D.escHtml(songs[url].text) + '</div>';
    }
    html += '</div>';
  }

  html += '<div style="margin-top:16px;display:flex;gap:8px">' +
    '<button class="export-btn" id="export-braid-md">export as markdown</button>' +
    '<button class="export-btn" id="export-braid-json" style="border-color:var(--ep-topology);color:var(--ep-topology)">export as JSON</button>' +
  '</div>';

  html += '</div></div>';
  return html;
};

D.exportBraidMd = function() {
  var marks = D.getMarks();
  var songs = D.getAllSongs();
  var md = '# My Braid \u2014 primals.eco\n\n';
  md += '_Forged ' + new Date().toISOString().slice(0,10) + '_\n\n';
  for (var url in marks) {
    var m = marks[url];
    var ep = m.epitope || D.classify(url);
    md += '## ' + (m.title || url) + '\n\n';
    md += '**Epitope:** ' + ep + '  \n';
    md += '**URL:** ' + url + '\n\n';
    if (songs[url]) md += songs[url].text + '\n\n';
    md += '---\n\n';
  }
  D.downloadFile('braid.md', md, 'text/markdown');
};

D.exportBraidJson = function() {
  var braids = D.findAllBraids();
  var marks = D.getMarks();
  var data = { exported: new Date().toISOString(), braids: braids.map(function(b){return b.braid;}), marks: marks };
  D.downloadFile('braid.json', JSON.stringify(data, null, 2), 'application/json');
};

})();
