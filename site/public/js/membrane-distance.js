// membrane-distance.js — selective permeability for human conversations
//
// not a mute. not a block. DISTANCE.
// your W parameter for each voice. the community has its own.
// close = bright. far = dim. gone = transparent.
// you moved YOUR membrane. not theirs.
//
// the easel, the palette, the canvas. this is art.

(function() {
  'use strict';

  var DISTANCE_KEY = 'membrane-distance-v1';

  // Load personal distances (your W per author)
  function loadDistances() {
    try { return JSON.parse(localStorage.getItem(DISTANCE_KEY) || '{}'); }
    catch(e) { return {}; }
  }

  function saveDistances(d) {
    localStorage.setItem(DISTANCE_KEY, JSON.stringify(d));
  }

  // W to opacity: low W = bright (close), high W = dim (far)
  function wToOpacity(w) {
    if (w === undefined || w === null) return 1;     // no distance set = full
    if (w <= 0) return 1;                             // closest
    if (w >= 10) return 0.03;                         // almost gone (but never invisible)
    return Math.max(0.03, 1 / (1 + w * 0.4));        // smooth falloff
  }

  // W to font size: closer = normal, further = smaller
  function wToSize(w) {
    if (!w || w <= 0) return '1em';
    if (w >= 8) return '0.7em';
    return (1 - w * 0.03) + 'em';
  }

  // Apply distance to a comment element
  function applyDistance(el, author) {
    var distances = loadDistances();
    var w = distances[author];
    var opacity = wToOpacity(w);
    var size = wToSize(w);

    el.style.opacity = opacity;
    el.style.fontSize = size;
    el.style.transition = 'opacity 0.5s, font-size 0.3s';

    // If very distant, collapse but keep a trace
    if (w >= 8) {
      el.style.maxHeight = '1.5em';
      el.style.overflow = 'hidden';
      el.style.cursor = 'pointer';
      el.title = 'distant voice (click to expand)';
      el.onclick = function() {
        if (el.style.maxHeight === '1.5em') {
          el.style.maxHeight = 'none';
          el.style.opacity = '0.5';
        } else {
          el.style.maxHeight = '1.5em';
          el.style.opacity = String(opacity);
        }
      };
    }
  }

  // Create the distance control (the W dial)
  function createDial(author, parentEl) {
    var distances = loadDistances();
    var currentW = distances[author] || 0;

    var dial = document.createElement('span');
    dial.className = 'w-dial';
    dial.style.cssText = 'display:inline-flex;gap:2px;margin-left:8px;font-size:9px;opacity:0.4;cursor:pointer;';
    dial.title = 'adjust distance (your membrane, not theirs)';

    // 5 dots: closer ← · · · · · → further
    for (var i = 0; i <= 4; i++) {
      var dot = document.createElement('span');
      var w = i * 2.5; // 0, 2.5, 5, 7.5, 10
      dot.textContent = w <= currentW ? '●' : '○';
      dot.style.cssText = 'color:' + (i === 0 ? '#3fb950' : i <= 2 ? '#58a6ff' : i <= 3 ? '#d29922' : '#8b949e') + ';cursor:pointer;padding:0 1px;';
      dot.dataset.w = String(w);
      dot.dataset.author = author;
      dot.onclick = function(e) {
        var newW = parseFloat(e.target.dataset.w);
        var a = e.target.dataset.author;
        var d = loadDistances();
        d[a] = newW;
        saveDistances(d);
        refreshAll();
      };
      dial.appendChild(dot);
    }

    parentEl.appendChild(dial);
  }

  // Refresh all visible comments with current distances
  function refreshAll() {
    var comments = document.querySelectorAll('[data-comment-author]');
    comments.forEach(function(el) {
      var author = el.dataset.commentAuthor;
      applyDistance(el, author);
      // Update dial dots
      var distances = loadDistances();
      var w = distances[author] || 0;
      var dots = el.querySelectorAll('.w-dial span');
      dots.forEach(function(dot) {
        var dotW = parseFloat(dot.dataset.w || 0);
        dot.textContent = dotW <= w ? '●' : '○';
      });
    });
  }

  // Hook into discuss/campfire rendering
  // Watch for new comment elements and apply distance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;

        // Look for comment elements (adapt selector to match HUD's discuss rendering)
        var comments = node.querySelectorAll ? node.querySelectorAll('.comment, .discuss-comment, [data-author]') : [];
        if (node.classList && (node.classList.contains('comment') || node.classList.contains('discuss-comment') || node.dataset.author)) {
          comments = [node];
        }

        comments.forEach(function(el) {
          var author = el.dataset.author || el.querySelector('.author')?.textContent || 'anonymous';
          el.dataset.commentAuthor = author;
          applyDistance(el, author);
          createDial(author, el);
        });
      });
    });
  });

  // Start observing when DOM is ready
  function init() {
    observer.observe(document.body, { childList: true, subtree: true });

    // Also process existing comments
    var existing = document.querySelectorAll('.comment, .discuss-comment, [data-author]');
    existing.forEach(function(el) {
      var author = el.dataset.author || el.querySelector('.author')?.textContent || 'anonymous';
      el.dataset.commentAuthor = author;
      applyDistance(el, author);
      createDial(author, el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 1000);
  }

  // Expose for other scripts
  window._membraneDistance = {
    setDistance: function(author, w) {
      var d = loadDistances();
      d[author] = w;
      saveDistances(d);
      refreshAll();
    },
    getDistance: function(author) {
      return loadDistances()[author] || 0;
    },
    reset: function(author) {
      var d = loadDistances();
      delete d[author];
      saveDistances(d);
      refreshAll();
    },
    resetAll: function() {
      localStorage.removeItem(DISTANCE_KEY);
      refreshAll();
    }
  };
})();
