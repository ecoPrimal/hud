// search-redirect.js — search bars recycle to detroit landing page
// Wave 178: all search → detroit.primals.eco (the evidence library)
// Opens in new tab by default. Inside HUD/membrane = same window.
(function(){
  var HOST = 'https://detroit.primals.eco';

  // Detect if we're inside HUD/membrane iframe or overlay
  function isInsideHud() {
    try { return window.self !== window.top; } catch(e) { return true; }
  }

  function redirectSearch(query) {
    var url = HOST + (query ? '/?q=' + encodeURIComponent(query) : '/');
    if (isInsideHud()) {
      // Inside HUD overlay → same window navigation
      window.location.href = url;
    } else {
      // Standalone page → new tab
      window.open(url, '_blank', 'noopener');
    }
  }

  // Intercept tuebor search bar
  var tueboSearch = document.getElementById('tuebor-search');
  if (tueboSearch) {
    // Replace the local search with detroit redirect
    tueboSearch.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        redirectSearch(tueboSearch.value.trim());
      }
    });
    // Click on search input shows hint
    tueboSearch.addEventListener('focus', function() {
      var results = document.getElementById('tuebor-search-results');
      if (results) {
        results.style.display = 'block';
        results.innerHTML = '<div style="padding:8px 12px;color:#8b949e;font-size:.85em">'
          + '🔍 Search opens <strong>detroit.primals.eco</strong> in a new tab'
          + '</div>';
      }
    });
    // Update placeholder
    tueboSearch.placeholder = 'Search → detroit.primals.eco';
  }

  // Intercept detroit search bar (keep local search but add Enter = new tab behavior)
  var detSearch = document.getElementById('search-input');
  if (detSearch && window.location.hostname !== 'detroit.primals.eco') {
    detSearch.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        redirectSearch(detSearch.value.trim());
      }
    });
  }

  // Generic: any input[data-search-detroit] on any page
  document.querySelectorAll('input[data-search-detroit]').forEach(function(el) {
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        redirectSearch(el.value.trim());
      }
    });
    el.addEventListener('focus', function() {
      el.placeholder = 'Search → detroit (new tab)';
    });
  });
})();
