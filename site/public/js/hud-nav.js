// hud-nav.js — the HUD IS the nav
// click bubbles, bingo cells, buttons → viewports open
// golden ratio splits: 61.8% content / 38.2% detail
// each viewport has a π-budget: how many items it can hold
// sub-sort within any viewport by clicking column headers
// iterate with ←→ keys or click prev/next
(function() {
  'use strict';

  var PI  = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2;    // 1.618...
  var INV_PHI = 1 / PHI;               // 0.618...

  // ═══ VIEWPORT STATE ═══
  var activeViewport = null;            // currently open viewport id
  var viewportStack = [];               // navigation history
  var viewportData = {};                // { id: { items, cursor, piBudget, sortKey, sortDir } }
  var MAX_STACK = 12;

  // ═══ PI-BUDGET PER VIEWPORT ═══
  function viewportBudget(scale) {
    var budget = Math.pow(PI, scale || 2);
    var cap = Math.floor(budget);
    return { budget: budget, cap: cap, rem: budget - cap, scale: scale || 2 };
  }

  // ═══ GOLDEN RATIO LAYOUT ═══
  var LAYOUT = {
    contentRatio: INV_PHI,              // 0.618 of available width
    detailRatio: 1 - INV_PHI,           // 0.382 of available width
    maxWidth: 480,
    maxHeight: 420,
  };

  // ═══ CREATE VIEWPORT PANEL ═══
  function createViewport(id, title, items, opts) {
    opts = opts || {};
    var scale = opts.scale || 2;
    var pb = viewportBudget(scale);

    // π-budget: only show cap items, remainder = unique slot
    var displayed = items.slice(0, pb.cap);
    var remainder = items.length > pb.cap ? items.slice(pb.cap) : [];
    var uniqueSlot = null;
    if (remainder.length > 0) {
      // Most novel item goes to the unique slot
      remainder.sort(function(a, b) { return (b.novelty || 0) - (a.novelty || 0); });
      uniqueSlot = remainder[0];
    }

    viewportData[id] = {
      id: id,
      title: title,
      allItems: items,
      displayed: displayed,
      remainder: remainder,
      uniqueSlot: uniqueSlot,
      cursor: 0,
      piBudget: pb,
      sortKey: opts.sortKey || 'name',
      sortDir: 1,
      parent: opts.parent || null,
    };

    renderViewport(id);
    pushStack(id);
    activeViewport = id;
  }

  function pushStack(id) {
    if (viewportStack[viewportStack.length - 1] === id) return;
    viewportStack.push(id);
    if (viewportStack.length > MAX_STACK) viewportStack.shift();
  }

  function popStack() {
    viewportStack.pop();
    var prev = viewportStack[viewportStack.length - 1];
    if (prev && viewportData[prev]) {
      activeViewport = prev;
      renderViewport(prev);
    } else {
      closeViewport();
    }
  }

  // ═══ RENDER ═══
  function renderViewport(id) {
    var vp = viewportData[id];
    if (!vp) return;

    var panel = document.getElementById('hud-viewport');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'hud-viewport';
      document.body.appendChild(panel);
    }

    var pb = vp.piBudget;
    var cw = Math.round(LAYOUT.maxWidth * LAYOUT.contentRatio);
    var dw = Math.round(LAYOUT.maxWidth * LAYOUT.detailRatio);

    var cur = vp.displayed[vp.cursor];
    var curDetail = cur ? formatDetail(cur) : '<span style="color:#6e7681">select an item</span>';

    var html = [];
    html.push('<div class="hvp-wrap" style="width:' + LAYOUT.maxWidth + 'px;max-height:' + LAYOUT.maxHeight + 'px">');

    // Header
    html.push('<div class="hvp-head">');
    html.push('<span class="hvp-back" title="back">' + (viewportStack.length > 1 ? '← ' : '') + '</span>');
    html.push('<span class="hvp-title">' + esc(vp.title) + '</span>');
    html.push('<span class="hvp-budget" title="π' + sup(pb.scale) + ' = ' + pb.budget.toFixed(3) + '">');
    html.push('π' + sup(pb.scale) + ' ' + vp.displayed.length + '/' + pb.cap);
    html.push(' <span style="color:#d2a8ff">∞' + pb.rem.toFixed(3) + '</span>');
    html.push('</span>');
    html.push('<span class="hvp-close" title="close">✕</span>');
    html.push('</div>');

    // Progress bar — fill ratio (never full because π is irrational)
    var fillPct = ((vp.displayed.length + (vp.uniqueSlot ? pb.rem : 0)) / pb.budget * 100);
    html.push('<div class="hvp-progress"><div class="hvp-fill" style="width:' + Math.min(fillPct, 99.9).toFixed(1) + '%"></div></div>');

    // Body: golden ratio split
    html.push('<div class="hvp-body">');

    // LEFT: content list (61.8%)
    html.push('<div class="hvp-content" style="width:' + cw + 'px">');

    // Sort header
    html.push('<div class="hvp-sort-bar">');
    html.push('<span class="hvp-sort-btn" data-key="name">name ' + (vp.sortKey === 'name' ? (vp.sortDir > 0 ? '↑' : '↓') : '') + '</span>');
    html.push('<span class="hvp-sort-btn" data-key="class">class ' + (vp.sortKey === 'class' ? (vp.sortDir > 0 ? '↑' : '↓') : '') + '</span>');
    html.push('<span class="hvp-sort-btn" data-key="depth">depth ' + (vp.sortKey === 'depth' ? (vp.sortDir > 0 ? '↑' : '↓') : '') + '</span>');
    html.push('</div>');

    // Items
    html.push('<div class="hvp-items">');
    vp.displayed.forEach(function(item, i) {
      var active = i === vp.cursor ? ' hvp-active' : '';
      var sortDot = sortClassDot(item.sortClass || item.classification);
      html.push('<div class="hvp-item' + active + '" data-idx="' + i + '">');
      html.push(sortDot + ' <span class="hvp-item-name">' + esc(itemName(item)) + '</span>');
      if (item.sub && item.sub.length) {
        html.push(' <span class="hvp-sub-ct" title="' + item.sub.length + ' sub-items">▸' + item.sub.length + '</span>');
      }
      html.push('</div>');
    });

    // Unique slot (the irrational remainder — always one special item)
    if (vp.uniqueSlot) {
      html.push('<div class="hvp-item hvp-unique" data-idx="unique" title="π-remainder slot: the novel item that doesn\'t fit the integer budget">');
      html.push('∞ <span class="hvp-item-name">' + esc(itemName(vp.uniqueSlot)) + '</span>');
      html.push('</div>');
    }
    html.push('</div>');

    // Navigation
    html.push('<div class="hvp-nav">');
    html.push('<span class="hvp-prev" title="← previous">◂</span>');
    html.push('<span class="hvp-cursor">' + (vp.cursor + 1) + '/' + vp.displayed.length + '</span>');
    html.push('<span class="hvp-next" title="→ next">▸</span>');
    html.push('</div>');
    html.push('</div>');

    // RIGHT: detail panel (38.2%)
    html.push('<div class="hvp-detail" style="width:' + dw + 'px">');
    html.push(curDetail);
    html.push('</div>');

    html.push('</div>');

    // Footer — golden ratio indicator
    html.push('<div class="hvp-foot">');
    html.push('<span style="color:#6e7681;font-size:7px">');
    html.push('φ = ' + PHI.toFixed(3) + ' · content ' + (INV_PHI * 100).toFixed(1) + '% · detail ' + ((1 - INV_PHI) * 100).toFixed(1) + '%');
    html.push(' · stack: ' + viewportStack.length);
    html.push('</span>');
    html.push('</div>');

    html.push('</div>');
    panel.innerHTML = html.join('');
    panel.style.display = 'block';

    // Attach events
    attachViewportEvents(id);
  }

  function attachViewportEvents(id) {
    var panel = document.getElementById('hud-viewport');
    if (!panel) return;
    var vp = viewportData[id];
    if (!vp) return;

    // Close
    var close = panel.querySelector('.hvp-close');
    if (close) close.onclick = function() { closeViewport(); };

    // Back
    var back = panel.querySelector('.hvp-back');
    if (back) back.onclick = function() { popStack(); };

    // Items — click to select, double-click to drill in
    var items = panel.querySelectorAll('.hvp-item');
    items.forEach(function(el) {
      el.onclick = function() {
        var idx = el.getAttribute('data-idx');
        if (idx === 'unique') {
          vp.cursor = -1;
          renderViewport(id);
          return;
        }
        vp.cursor = parseInt(idx);
        renderViewport(id);
      };
      el.ondblclick = function() {
        var idx = el.getAttribute('data-idx');
        if (idx === 'unique') return;
        var item = vp.displayed[parseInt(idx)];
        if (!item) return;
        drillIn(item, id);
      };
    });

    // Sort buttons
    var sorts = panel.querySelectorAll('.hvp-sort-btn');
    sorts.forEach(function(btn) {
      btn.onclick = function() {
        var key = btn.getAttribute('data-key');
        if (vp.sortKey === key) {
          vp.sortDir *= -1;
        } else {
          vp.sortKey = key;
          vp.sortDir = 1;
        }
        subSort(id);
      };
    });

    // Prev/Next
    var prev = panel.querySelector('.hvp-prev');
    var next = panel.querySelector('.hvp-next');
    if (prev) prev.onclick = function() { moveCursor(id, -1); };
    if (next) next.onclick = function() { moveCursor(id, 1); };
  }

  // ═══ SUB-SORT ═══
  function subSort(id) {
    var vp = viewportData[id];
    if (!vp) return;
    var key = vp.sortKey;
    var dir = vp.sortDir;

    vp.displayed.sort(function(a, b) {
      var va = getSortVal(a, key), vb = getSortVal(b, key);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    vp.cursor = 0;
    renderViewport(id);
  }

  function getSortVal(item, key) {
    if (key === 'name') return (item.name || item.entity || '').toLowerCase();
    if (key === 'class') return item.sortClass || item.classification || 'null';
    if (key === 'depth') return item.depth || item.r || 0;
    return '';
  }

  // ═══ ITERATION ═══
  function moveCursor(id, delta) {
    var vp = viewportData[id];
    if (!vp || !vp.displayed.length) return;
    vp.cursor = (vp.cursor + delta + vp.displayed.length) % vp.displayed.length;
    renderViewport(id);
  }

  // ═══ DRILL IN — sub-viewport ═══
  function drillIn(item, parentId) {
    var sub = item.sub || [];
    var name = itemName(item);

    if (sub.length === 0) {
      // Navigate to entity page if available
      navigateToEntity(item);
      return;
    }

    // Open sub-viewport at one scale lower
    var parentVp = viewportData[parentId];
    var newScale = Math.max(1, (parentVp ? parentVp.piBudget.scale : 2) - 1);
    createViewport('sub-' + name, name + ' ▸', sub, {
      scale: newScale,
      parent: parentId,
    });
  }

  // ═══ NAVIGATE TO ENTITY ═══
  function navigateToEntity(item) {
    var name = itemName(item);
    // Check for a page
    var slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Try data JSON first
    fetch('/data/' + slug + '.json').then(function(r) {
      if (r.ok) return r.json();
      throw new Error('no data');
    }).then(function(data) {
      // Show data in detail panel
      var vp = viewportData[activeViewport];
      if (vp) {
        var cur = vp.displayed[vp.cursor];
        if (cur) {
          cur._detail = data;
          renderViewport(activeViewport);
        }
      }
    }).catch(function() {
      // Try an HTML page
      var testUrl = '/' + slug + '.html';
      fetch(testUrl, { method: 'HEAD' }).then(function(r) {
        if (r.ok) window.location.href = testUrl;
      }).catch(function() {});
    });
  }

  // ═══ CLOSE ═══
  function closeViewport() {
    var panel = document.getElementById('hud-viewport');
    if (panel) panel.style.display = 'none';
    activeViewport = null;
    viewportStack = [];
  }

  // ═══ HELPERS ═══
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function sup(n) {
    var chars = { '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵' };
    return chars['' + n] || '' + n;
  }

  function itemName(item) {
    return (item.name || item.entity || item.title || '?').replace(/_/g, ' ');
  }

  function sortClassDot(sc) {
    if (sc === 'self') return '<span style="color:#3fb950">●</span>';
    if (sc === 'non-self' || sc === 'non_self') return '<span style="color:#f0883e">●</span>';
    if (sc === 'partial') return '<span style="color:#d29922">●</span>';
    return '<span style="color:#6e7681">○</span>';
  }

  function formatDetail(item) {
    if (!item) return '';
    var lines = [];
    lines.push('<div style="color:#e6edf3;font-size:11px;margin-bottom:6px;font-weight:bold">' + esc(itemName(item)) + '</div>');

    // If we fetched detail data
    if (item._detail) {
      var d = item._detail;
      if (d.title) lines.push('<div style="color:#58a6ff;font-size:9px">' + esc(d.title) + '</div>');
      if (d.description) lines.push('<div style="color:#8b949e;font-size:9px;margin-top:4px">' + esc(d.description) + '</div>');
      if (d.role) lines.push('<div style="color:#d2a8ff;font-size:9px;margin-top:4px">' + esc(d.role) + '</div>');
      return lines.join('');
    }

    if (item.sortClass || item.classification) {
      lines.push('<div style="font-size:9px">' + sortClassDot(item.sortClass || item.classification) +
        ' ' + esc(item.sortClass || item.classification) + '</div>');
    }
    if (item.depth || item.r) {
      lines.push('<div style="font-size:9px;color:#8b949e">depth: ' + (item.depth || item.r || 0).toFixed ? (item.depth || item.r).toFixed(2) : (item.depth || item.r) + '</div>');
    }
    if (item.sub && item.sub.length) {
      lines.push('<div style="font-size:9px;color:#d29922;margin-top:4px">' + item.sub.length + ' sub-items — double-click to drill in</div>');
    }
    if (item.entity) {
      lines.push('<div style="font-size:8px;color:#6e7681;margin-top:4px">entity: ' + esc(item.entity) + '</div>');
    }
    lines.push('<div style="font-size:8px;color:#6e7681;margin-top:8px;cursor:pointer" onclick="window._hudNav.navigate(' + JSON.stringify(item).replace(/"/g, '&quot;') + ')">→ go to page</div>');
    return lines.join('');
  }

  // ═══ STYLE ═══
  function injectStyle() {
    var s = document.createElement('style');
    s.textContent = [
      '#hud-viewport{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:900;' +
        'background:rgba(13,17,23,0.96);backdrop-filter:blur(12px);' +
        'border:1px solid rgba(88,166,255,0.2);border-radius:12px;' +
        'padding:0;display:none;font-family:"SF Mono","Fira Code",monospace;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.6)}',

      '.hvp-wrap{overflow:hidden;border-radius:12px}',

      '.hvp-head{display:flex;align-items:center;padding:8px 10px;' +
        'border-bottom:1px solid #21262d;gap:8px}',
      '.hvp-back{color:#58a6ff;font-size:11px;cursor:pointer;min-width:16px}',
      '.hvp-back:hover{text-decoration:underline}',
      '.hvp-title{color:#e6edf3;font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.hvp-budget{color:#8b949e;font-size:9px;white-space:nowrap}',
      '.hvp-close{color:#8b949e;font-size:12px;cursor:pointer;padding:0 4px}',
      '.hvp-close:hover{color:#f85149}',

      '.hvp-progress{height:2px;background:#161b22;margin:0}',
      '.hvp-fill{height:100%;background:linear-gradient(90deg,#3fb950,#58a6ff,#d2a8ff);' +
        'transition:width 0.6s ease;border-radius:0 1px 1px 0}',

      '.hvp-body{display:flex;overflow:hidden}',

      '.hvp-content{border-right:1px solid #21262d;display:flex;flex-direction:column;overflow:hidden}',

      '.hvp-sort-bar{display:flex;gap:2px;padding:4px 6px;border-bottom:1px solid #161b22;background:rgba(22,27,34,0.5)}',
      '.hvp-sort-btn{color:#6e7681;font-size:8px;cursor:pointer;padding:1px 4px;border-radius:3px}',
      '.hvp-sort-btn:hover{color:#58a6ff;background:rgba(88,166,255,0.1)}',

      '.hvp-items{overflow-y:auto;max-height:' + (LAYOUT.maxHeight - 100) + 'px;padding:2px 0}',
      '.hvp-item{padding:3px 8px;font-size:9px;color:#8b949e;cursor:pointer;' +
        'display:flex;align-items:center;gap:4px;border-left:2px solid transparent;' +
        'transition:background 0.15s,border-color 0.15s}',
      '.hvp-item:hover{background:rgba(88,166,255,0.06)}',
      '.hvp-item.hvp-active{background:rgba(88,166,255,0.1);border-left-color:#58a6ff;color:#e6edf3}',
      '.hvp-item.hvp-unique{background:rgba(210,168,255,0.06);border-left-color:#d2a8ff;font-style:italic}',
      '.hvp-item-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}',
      '.hvp-sub-ct{color:#d29922;font-size:8px}',

      '.hvp-nav{display:flex;align-items:center;justify-content:center;gap:12px;' +
        'padding:4px;border-top:1px solid #161b22}',
      '.hvp-prev,.hvp-next{color:#58a6ff;cursor:pointer;font-size:12px;padding:2px 6px}',
      '.hvp-prev:hover,.hvp-next:hover{background:rgba(88,166,255,0.1);border-radius:4px}',
      '.hvp-cursor{color:#8b949e;font-size:9px}',

      '.hvp-detail{padding:8px;overflow-y:auto;max-height:' + (LAYOUT.maxHeight - 60) + 'px;' +
        'font-size:9px;color:#8b949e;line-height:1.5}',

      '.hvp-foot{padding:3px 8px;border-top:1px solid #21262d;text-align:center}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ═══ HOOK INTO EXISTING HUD ELEMENTS ═══

  // Make membrane bubbles clickable
  function hookBubbles() {
    var svg = document.querySelector('#membrane-focal-svg svg') ||
              document.querySelector('#membrane-canvas svg');
    if (!svg) return;

    svg.addEventListener('click', function(e) {
      var t = e.target;
      if (t.tagName === 'circle' && t.closest('#mg-bubbles')) {
        // Find which bubble
        var cx = parseFloat(t.getAttribute('cx'));
        var cy = parseFloat(t.getAttribute('cy'));
        var vis = window._chipmunkVis;

        // Get entity data from topology
        fetch('/topology.json').then(function(r) { return r.json(); }).then(function(topo) {
          var ents = (topo.entities || []).map(function(e) {
            return typeof e === 'string' ? { entity: e, name: e } : e;
          });

          // Find nearby entity (by angle/radius mapping)
          var items = ents.map(function(e, i) {
            return {
              name: e.entity || e.name,
              entity: e.entity || e.name,
              sortClass: e.sort_class || e.classification || 'null',
              depth: e.depth || (i / ents.length),
              sub: e.connections || [],
            };
          });

          createViewport('topo', 'topology · ' + items.length + ' entities', items, { scale: 3 });
        }).catch(function() {});
      }
    });
  }

  // Make bingo cells clickable for navigation
  function hookBingo() {
    document.addEventListener('click', function(e) {
      var cell = e.target.closest && e.target.closest('.bc-cell');
      if (!cell) return;
      var entity = cell.getAttribute('title');
      if (!entity || entity === '???' || entity === '🐿️ FREE') return;

      navigateToEntity({ entity: entity, name: entity });
    });
  }

  // Keyboard navigation
  function hookKeyboard() {
    document.addEventListener('keydown', function(e) {
      if (!activeViewport) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveCursor(activeViewport, -1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveCursor(activeViewport, 1);
      } else if (e.key === 'Enter') {
        var vp = viewportData[activeViewport];
        if (vp && vp.displayed[vp.cursor]) {
          drillIn(vp.displayed[vp.cursor], activeViewport);
        }
      } else if (e.key === 'Escape') {
        if (viewportStack.length > 1) popStack();
        else closeViewport();
      } else if (e.key === 'Backspace' && !e.target.closest('input,textarea')) {
        e.preventDefault();
        popStack();
      }
    });
  }

  // ═══ PUBLIC API ═══
  window._hudNav = {
    open: createViewport,
    close: closeViewport,
    back: popStack,
    navigate: navigateToEntity,
    sort: subSort,
    move: moveCursor,
    state: function() {
      return {
        active: activeViewport,
        stack: viewportStack.slice(),
        viewports: Object.keys(viewportData),
        phi: PHI,
        layout: LAYOUT,
      };
    },
  };

  // ═══ INIT ═══
  injectStyle();

  function boot() {
    hookBubbles();
    hookBingo();
    hookKeyboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 1500);
  }
})();
