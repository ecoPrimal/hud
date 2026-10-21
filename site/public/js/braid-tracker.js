// braid-tracker.js — delegates to braid-mailbox.js
// External pages (signal, detroit) load this name.
(function(){
  if(window.__braidLoaded) return;
  window.__braidLoaded = true;
  var s = document.createElement("script");
  s.src = (document.currentScript && document.currentScript.src
    ? document.currentScript.src.replace("braid-tracker.js","braid-mailbox.js")
    : "https://hud.primals.eco/js/braid-mailbox.js");
  s.defer = true;
  document.body.appendChild(s);
})();
