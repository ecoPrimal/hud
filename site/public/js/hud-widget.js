// hud-widget.js — loader that delegates to hud-core.js
// Signal page loads this externally. Keep it thin.
(function(){
  if(window.__hudLoaded) return;
  window.__hudLoaded = true;
  var s = document.createElement("script");
  s.src = (document.currentScript && document.currentScript.src
    ? document.currentScript.src.replace("hud-widget.js","hud-core.js")
    : "https://hud.primals.eco/js/hud-core.js");
  s.defer = true;
  document.body.appendChild(s);
})();
