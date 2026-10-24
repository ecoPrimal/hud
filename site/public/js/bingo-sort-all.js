// bingo-sort-all.js — loads bingo-seed.js (progressive reveal / opacity curtain)
(function() {
  if (document.querySelector("script[src*=\"bingo-seed\"]")) return;
  var s = document.createElement("script");
  s.src = "/js/bingo-seed.js?v=2";
  s.defer = true;
  document.head.appendChild(s);
})();
