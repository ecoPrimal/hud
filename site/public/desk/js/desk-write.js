// desk-write.js — write tab renderer + escHtml + pad utilities
(function(){
var D = window.Desk;

D.escHtml = function(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};

D.pad = function(s, n) {
  while (s.length < n) s += ' ';
  return s;
};

D.renderWrite = function() {
  var songs = D.getAllSongs();
  var urls = Object.keys(songs);

  if (urls.length === 0) {
    return '<div class="empty-state">' +
      '<h3>no notes yet</h3>' +
      '<p>Use <strong>\u266a sing</strong> on any page to leave a note. Your notes live in your braid \u2014 never sent to a server.</p>' +
      '<p>Your songs will appear here as a notebook.</p>' +
    '</div>';
  }

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
    '<span style="color:var(--fg-dim);font-size:12px">' + urls.length + ' pages with notes</span>' +
    '<button class="export-btn" id="export-md">export as markdown</button>' +
  '</div>';

  urls.forEach(function(url) {
    var s = songs[url];
    var ep = D.classify(url);
    html += '<div class="write-entry">' +
      '<div class="write-page">' +
        D.epPill(ep) +
        ' <a href="' + url + '" target="_blank">' + s.title + '</a>' +
      '</div>' +
      '<div class="write-note">' + D.escHtml(s.text) + '</div>' +
    '</div>';
  });

  return html;
};

D.exportMarkdown = function() {
  var songs = D.getAllSongs();
  var md = '# Desk Notes \u2014 primals.eco\n\n';
  md += '_Exported ' + new Date().toISOString().slice(0,10) + '_\n\n';
  for (var url in songs) {
    var s = songs[url];
    var ep = D.classify(url);
    md += '## ' + s.title + '\n\n';
    md += '**Epitope:** ' + ep + '  \n';
    md += '**URL:** ' + url + '\n\n';
    md += s.text + '\n\n---\n\n';
  }
  D.downloadFile('desk-notes.md', md, 'text/markdown');
};

})();
