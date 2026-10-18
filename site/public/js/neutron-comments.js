// neutron-comments.js — sovereign comment widget
// Wave 180: replaces Giscus/Disqus. No account needed. No tracking.
// Uses opsonize discuss API. Built on the neutron messaging axis.
//
// Usage: <div id="neutron-comments" data-page="page-slug"></div>
//        <script src="https://hud.primals.eco/js/neutron-comments.js"></script>
(function() {
  'use strict';

  var API = '/api/discuss';
  var POLL_MS = 60000;
  var _container = null;
  var _page = '';
  var _comments = [];

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function timeAgo(ts) {
    if (!ts) return '';
    var diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function load() {
    fetch(API + '?page=' + encodeURIComponent(_page))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        _comments = data.comments || [];
        render();
      })
      .catch(function() {});
  }

  function render() {
    if (!_container) return;
    var html = '<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;max-width:680px">';

    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(88,166,255,0.12)">';
    html += '<span style="color:#58a6ff;font-size:13px;font-weight:500">';
    html += '<span style="display:inline-block;width:6px;height:6px;background:#58a6ff;border-radius:50%;margin-right:6px;box-shadow:0 0 4px #58a6ff"></span>';
    html += 'neutron \u00b7 ' + _comments.length + ' comment' + (_comments.length !== 1 ? 's' : '') + '</span>';
    html += '<a href="https://neutron.primals.eco" style="color:#8b949e;font-size:11px;text-decoration:none" target="_blank">sovereign \u00b7 no tracking</a>';
    html += '</div>';

    // Comment form
    html += '<div id="nc-form" style="margin-bottom:16px">';
    html += '<textarea id="nc-body" rows="3" placeholder="leave a comment... no account needed" style="width:100%;padding:10px;background:#0d1117;color:#c9d1d9;border:1px solid rgba(88,166,255,0.15);border-radius:6px;font-size:13px;resize:vertical;font-family:inherit;box-sizing:border-box"></textarea>';
    html += '<div style="display:flex;gap:8px;margin-top:6px;align-items:center">';
    html += '<input id="nc-author" placeholder="name (optional)" style="padding:6px 10px;background:#0d1117;color:#c9d1d9;border:1px solid rgba(88,166,255,0.15);border-radius:4px;font-size:12px;flex:1;font-family:inherit">';
    html += '<button id="nc-submit" style="padding:6px 16px;background:rgba(88,166,255,0.15);color:#58a6ff;border:1px solid rgba(88,166,255,0.3);border-radius:4px;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap">post</button>';
    html += '</div>';
    html += '</div>';

    // Comments list
    if (_comments.length === 0) {
      html += '<div style="color:#8b949e;font-size:12px;padding:16px 0;text-align:center">no comments yet. be the first.</div>';
    } else {
      var sorted = _comments.slice().sort(function(a, b) {
        return (b.epoch || 0) - (a.epoch || 0);
      });
      sorted.forEach(function(c) {
        html += '<div style="padding:10px 12px;border-left:2px solid rgba(88,166,255,0.12);margin-bottom:4px;transition:border-color 0.2s"';
        html += ' onmouseover="this.style.borderLeftColor=\'#58a6ff\'" onmouseout="this.style.borderLeftColor=\'rgba(88,166,255,0.12)\'">';
        html += '<div style="font-size:11px;color:#8b949e;margin-bottom:4px">';
        html += '<span style="color:#c9d1d9">' + esc(c.author || 'anon') + '</span>';
        html += ' \u00b7 ' + timeAgo(c.ts);
        html += '</div>';
        html += '<div style="font-size:13px;white-space:pre-wrap;word-break:break-word;color:#c9d1d9">' + esc(c.body) + '</div>';
        html += '</div>';
      });
    }

    html += '<div style="font-size:10px;color:#8b949e;margin-top:12px;text-align:center">';
    html += 'powered by <a href="https://neutron.primals.eco" style="color:#58a6ff;text-decoration:none">neutron</a> \u00b7 sovereign \u00b7 no account \u00b7 no cookies \u00b7 no tracking';
    html += '</div>';
    html += '</div>';

    _container.innerHTML = html;

    // Wire submit
    var btn = document.getElementById('nc-submit');
    if (btn) {
      btn.addEventListener('click', submit);
    }
    var body = document.getElementById('nc-body');
    if (body) {
      body.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit();
      });
    }
  }

  function submit() {
    var body = document.getElementById('nc-body');
    var author = document.getElementById('nc-author');
    var btn = document.getElementById('nc-submit');
    if (!body || !body.value.trim()) return;

    btn.disabled = true;
    btn.textContent = 'posting...';

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: _page,
        author: (author && author.value.trim()) || 'anon',
        body: body.value.trim()
      })
    })
    .then(function(r) {
      if (r.ok) {
        body.value = '';
        setTimeout(load, 500);
      } else {
        return r.json().then(function(d) {
          btn.textContent = d.detail || 'error';
          setTimeout(function() { btn.textContent = 'post'; btn.disabled = false; }, 3000);
        });
      }
    })
    .catch(function() {
      btn.textContent = 'offline';
      setTimeout(function() { btn.textContent = 'post'; btn.disabled = false; }, 3000);
    });
  }

  // Init
  function init() {
    _container = document.getElementById('neutron-comments');
    if (!_container) return;
    _page = _container.getAttribute('data-page') || window.location.pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'default';
    _container.innerHTML = '<div style="color:#58a6ff;font-size:12px;padding:8px">loading neutron comments\u2026</div>';
    load();
    setInterval(load, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.NeutronComments = { load: load, render: render };
})();
