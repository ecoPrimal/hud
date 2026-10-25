// membrane-discuss.js v2 — sovereign discussion widget
// Anchored to the page URL. Reads/writes via nestgate.io MCP (discuss_thread).
// No login. No GitHub. No cookies. Just speak.
(function(){
  'use strict';

  var MCP = 'https://nestgate.io/mcp';
  var page = window.location.pathname || 'general';

  function callMCP(tool, args) {
    return fetch(MCP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: tool, arguments: args }
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var text = d.result && d.result.content && d.result.content[0] && d.result.content[0].text;
      return text ? JSON.parse(text) : null;
    });
  }

  function renderThread(container, data) {
    if (!data || !data.entries || data.entries.length === 0) {
      container.innerHTML = '<p style="color:#6e7681;font-size:.85em">no comments yet — be the first</p>';
      return;
    }
    var html = '<div style="margin:.5rem 0">';
    data.entries.forEach(function(e) {
      var ts = e.ts ? new Date(e.ts).toLocaleString() : '';
      html += '<div style="border-left:2px solid #3fb950;padding:.4rem .8rem;margin:.4rem 0;font-size:.88em">' +
        '<div style="color:#6e7681;font-size:.75em">' + esc(e.author || 'anonymous') + ' · ' + ts + '</div>' +
        '<div>' + esc(e.body || '') + '</div>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function init() {
    var anchors = document.querySelectorAll('.membrane-discuss, [data-membrane-discuss]');
    if (anchors.length === 0) {
      var footer = document.querySelector('footer') || document.body;
      var div = document.createElement('div');
      div.className = 'membrane-discuss';
      footer.parentNode.insertBefore(div, footer);
      anchors = [div];
    }

    anchors.forEach(function(el) {
      var slug = el.getAttribute('data-page') || page;
      el.innerHTML =
        '<details style="margin:1rem 0;border:1px solid #21262d;border-radius:8px;padding:.8rem;background:#161b22">' +
        '<summary style="cursor:pointer;color:#58a6ff;font-weight:600;font-size:.9em">💬 discuss this page</summary>' +
        '<div class="discuss-thread" style="margin:.6rem 0"></div>' +
        '<div style="display:flex;gap:.4rem;margin-top:.5rem">' +
        '<input type="text" class="discuss-input" placeholder="say something..." style="flex:1;background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:.5rem;color:#c9d1d9;font:inherit;font-size:.85em">' +
        '<button class="discuss-send" style="background:#3fb950;color:#0d1117;border:none;border-radius:6px;padding:.5rem .8rem;font:600 .85em/1 inherit;cursor:pointer">post</button>' +
        '</div>' +
        '<div style="margin-top:.4rem;font-size:.7em;color:#6e7681">sovereign discussion via <a href="https://nestgate.io" style="color:#58a6ff">nestgate.io</a> · no login · persists in the membrane</div>' +
        '</details>';

      var thread = el.querySelector('.discuss-thread');
      var input = el.querySelector('.discuss-input');
      var btn = el.querySelector('.discuss-send');

      function loadThread() {
        callMCP('discuss_thread', { page: slug, action: 'read', limit: 20 })
          .then(function(data) { renderThread(thread, data); })
          .catch(function() { thread.innerHTML = '<p style="color:#f85149;font-size:.85em">could not load thread</p>'; });
      }

      btn.addEventListener('click', function() {
        var body = input.value.trim();
        if (!body) return;
        btn.disabled = true;
        callMCP('discuss_thread', { page: slug, action: 'write', body: body, author: 'human-on-page' })
          .then(function() { input.value = ''; loadThread(); })
          .catch(function() {})
          .then(function() { btn.disabled = false; });
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { btn.click(); }
      });

      el.querySelector('details').addEventListener('toggle', function(e) {
        if (e.target.open) loadThread();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.__membrane_discuss = { callMCP: callMCP, page: page };
})();
