// bingo-sort-all.js — unified into bingo-seed.js
// This file exists for backward compatibility.
// The real bingo logic is in bingo-seed.js now.
(function() {
  if (document.querySelector("script[src*=\"bingo-seed\"]")) return;
  var s = document.createElement("script");
  s.src = "/js/bingo-seed.js?v=1";
  s.defer = true;
  document.head.appendChild(s);
})();
