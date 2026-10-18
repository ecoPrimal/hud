// desk-boot.js — tab switching and initialization (loaded last)
// Wave 188: cockpit convergence tab added as home position
(function(){
"use strict";
var D = window.Desk;

var tabs = document.querySelectorAll(".desk-tab");
var panels = {
  cockpit: document.getElementById("panel-cockpit"),
  study: document.getElementById("panel-study"),
  write: document.getElementById("panel-write"),
  draw:  document.getElementById("panel-draw"),
  play:  document.getElementById("panel-play"),
  create:document.getElementById("panel-create"),
  gaia:  document.getElementById("panel-gaia"),
  weave: document.getElementById("panel-weave"),
  campfire: document.getElementById("panel-campfire"),
  globe: document.getElementById("panel-globe"),
  helix: document.getElementById("panel-helix"),
  map: document.getElementById("panel-map"),
  atlas: document.getElementById("panel-atlas"),
  neutron: document.getElementById("panel-neutron")
};
var renderers = {
  cockpit: function() {
    var el = panels.cockpit;
    if (el && D.renderConvergence) {
      D.renderConvergence(el);
    }
    return null;
  },
  study: D.renderStudy,
  write: D.renderWrite,
  draw:  D.renderDraw,
  play:  D.renderPlay,
  create:D.renderCreate,
  gaia:  D.renderGaia,
  weave: D.renderWeave,
  campfire: D.renderCampfire,
  globe: function() { return null; },
  helix: function() { return null; },
  map: D.renderMap,
  atlas: D.renderAtlas,
  neutron: D.renderNeutron
};

D.switchTab = function(name) {
  tabs.forEach(function(t) { t.classList.toggle("active", t.dataset.tab === name); });
  var keys = Object.keys(panels);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (!panels[k]) continue;
    if (k === name) {
      panels[k].style.display = "";
      var html = renderers[k] ? renderers[k]() : null;
      if (html !== null && html !== undefined) {
        panels[k].innerHTML = html;
      }
    } else {
      panels[k].style.display = "none";
    }
  }
  setTimeout(function() {
    var expMd = document.getElementById("export-md");
    if (expMd) expMd.addEventListener("click", D.exportMarkdown);
    var expBMd = document.getElementById("export-braid-md");
    if (expBMd) expBMd.addEventListener("click", D.exportBraidMd);
    var expBJ = document.getElementById("export-braid-json");
    if (expBJ) expBJ.addEventListener("click", D.exportBraidJson);
  }, 50);
};

tabs.forEach(function(t) {
  t.addEventListener("click", function() { D.switchTab(this.dataset.tab); });
});

// Cockpit is home position
D.switchTab("cockpit");

})();
