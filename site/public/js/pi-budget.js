// pi-budget.js v1 — the budget is π
//
// A set where the budget is π. You can never fill it exactly.
// π ≈ 3.14159... — holds 3 whole slots + an irrational remainder.
// That remainder is where the UNIQUE goes. The system always has space for surprise.
//
// Split: 31 objects ≈ π × 10. Stack them. Known pushes to sides. Unique stays center.
//
// The topology:
//   CENTER — unique, unclassified, novel (the irrational remainder)
//   SIDES — known, classified, interesting-but-resolved (the integer part)
//   BUDGET — π itself. Never exceeded. Always has remainder.
//
// At each scale:
//   π¹ ≈ 3.14   → 3 whole + 0.14159... remainder
//   π² ≈ 9.87   → 9 whole + 0.8696... remainder
//   π³ ≈ 31.0   → 31 whole + 0.006... remainder (tightest — almost fills!)
//   π⁴ ≈ 97.4   → 97 whole + 0.409... remainder
//   π⁵ ≈ 306.0  → 306 whole + 0.019... remainder
//
// The remainder oscillates — never zero. Sometimes large (π² remainder = 0.87),
// sometimes tiny (π³ remainder = 0.006). But never zero. Never full. Always room.
//
// Kevin Mok / Tamison / ecoPrimal / attsi
// ORCID 0009-0004-2141-0321
(function() {
  'use strict';

  var PI = Math.PI;

  // ═══════════════════════════════════════════════════════════
  // THE π-BUDGET SET — capacity is always irrational
  // ═══════════════════════════════════════════════════════════

  function PiBudgetSet(scale) {
    // scale: which power of π is the budget
    // scale=1 → budget=π≈3.14, scale=2 → π²≈9.87, scale=3 → π³≈31.0
    this.scale = scale || 1;
    this.budget = Math.pow(PI, this.scale);
    this.capacity = Math.floor(this.budget);         // integer part (known slots)
    this.remainder = this.budget - this.capacity;     // irrational part (unique slot)

    this.center = [];    // unique/novel items (lives in the remainder)
    this.sides = [];     // known/classified items (lives in the integer capacity)
    this.gas = [];       // overflow — pushed OUT, vented
  }

  // How much space is left?
  PiBudgetSet.prototype.space = function() {
    return this.capacity - this.sides.length;
  };

  // The remainder — always > 0, always irrational
  PiBudgetSet.prototype.remainderSpace = function() {
    // The center can hold items as long as their total "weight" < remainder
    // For simplicity: center holds 1 item if remainder > 0 (it always is)
    // But if the item is "heavy" (known), it should be in sides instead
    return this.center.length === 0 ? this.remainder : 0;
  };

  // Add an item. Returns where it went: 'center', 'sides', or 'gas'
  PiBudgetSet.prototype.add = function(item) {
    // Is it unique/novel/unclassified?
    if (item.unique || item.classification === 'null' || item.novel) {
      // Unique goes to center (the irrational slot)
      if (this.center.length === 0) {
        this.center.push(item);
        return 'center';
      }
      // Center already has one — compare. More unique stays, less unique goes to sides.
      var existing = this.center[0];
      if ((item.novelty || 0) > (existing.novelty || 0)) {
        // New item is MORE unique — it takes center, old goes to sides
        this.center[0] = item;
        return this._addToSides(existing) ? 'center' : 'center';
      }
      // Less unique — try sides
      return this._addToSides(item) ? 'sides' : 'gas';
    }

    // Known/classified — goes to sides
    return this._addToSides(item) ? 'sides' : 'gas';
  };

  PiBudgetSet.prototype._addToSides = function(item) {
    if (this.sides.length < this.capacity) {
      this.sides.push(item);
      // Sort sides: most known/boring to the edges, more interesting toward center
      this.sides.sort(function(a, b) {
        return (a.interest || 0) - (b.interest || 0);
      });
      return true;
    }
    // Full — vent to gas
    this.gas.push(item);
    return false;
  };

  // The sort: known/uninteresting pushes to sides, unique stays center
  PiBudgetSet.prototype.sort = function() {
    // Re-evaluate: has anything in sides become unique? Or center become known?
    var centerItem = this.center[0];
    if (!centerItem) return;

    // Check if any side item is now more novel than center
    for (var i = 0; i < this.sides.length; i++) {
      if ((this.sides[i].novelty || 0) > (centerItem.novelty || 0)) {
        // Swap
        this.center[0] = this.sides[i];
        this.sides[i] = centerItem;
        centerItem = this.center[0];
      }
    }

    // Re-sort sides (boring to edges)
    this.sides.sort(function(a, b) {
      return (a.interest || 0) - (b.interest || 0);
    });
  };

  // Get the full budget state
  PiBudgetSet.prototype.state = function() {
    return {
      scale: this.scale,
      budget: this.budget,
      capacity: this.capacity,
      remainder: this.remainder,
      center: this.center.length,
      sides: this.sides.length,
      gas: this.gas.length,
      fill_ratio: (this.sides.length + this.center.length) / this.budget,
      never_full: true  // π is irrational — budget can never be exactly filled
    };
  };

  // ═══════════════════════════════════════════════════════════
  // SCALES — the natural scales where π-budget governs
  // ═══════════════════════════════════════════════════════════

  var SCALES = [
    { power: 1, budget: PI,                    cap: 3,   rem: PI - 3,
      note: '3 whole + 0.142 — room for one unique thing among three known' },
    { power: 2, budget: PI * PI,               cap: 9,   rem: PI * PI - 9,
      note: '9 whole + 0.870 — almost a full extra slot of unique space' },
    { power: 3, budget: PI * PI * PI,          cap: 31,  rem: PI * PI * PI - 31,
      note: '31 whole + 0.006 — tightest! barely any room. but still never zero.' },
    { power: 4, budget: Math.pow(PI, 4),       cap: 97,  rem: Math.pow(PI, 4) - 97,
      note: '97 whole + 0.409 — comfortable remainder. 97 known, 1 surprise.' },
    { power: 5, budget: Math.pow(PI, 5),       cap: 306, rem: Math.pow(PI, 5) - 306,
      note: '306 whole + 0.020 — tight again. 342 entities would need scale 5+.' }
  ];

  // ═══════════════════════════════════════════════════════════
  // MEMBRANE APPLICATION — govern the feeds
  // ═══════════════════════════════════════════════════════════

  // The membrane has 132 feeds. Which π-scale governs?
  // π⁴ = 97.4 (too small). π⁵ = 306.0 (too big). 
  // Between π⁴ and π⁵. Use composite: π⁴ × (132/97.4) ≈ π⁴ × 1.355
  // Or: use two nested budgets. π⁴ = 97 core feeds. π³ = 31 overflow feeds. 
  // 97 + 31 = 128 ≈ 132. The 4 remainder feeds are the UNIQUE ones.

  var FEED_BUDGET = {
    core: new PiBudgetSet(4),    // π⁴ ≈ 97 core feeds
    overflow: new PiBudgetSet(3), // π³ ≈ 31 overflow feeds  
    total_budget: Math.pow(PI, 4) + Math.pow(PI, 3), // 97.4 + 31.0 = 128.4
    total_capacity: 97 + 31,     // 128 known slots
    total_remainder: (Math.pow(PI, 4) - 97) + (Math.pow(PI, 3) - 31), // 0.409 + 0.006 = 0.415
    note: 'π⁴ + π³ = 128.4 → 128 known + 0.415 unique space'
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER — show the budget in HUD
  // ═══════════════════════════════════════════════════════════

  function renderBudget() {
    var el = document.getElementById('pi-budget');
    if (!el) return;

    // Get current Klein state
    var klein = {};
    if (typeof window.__kleinState === 'function') {
      klein = window.__kleinState();
    }

    var feeds_fresh = klein.feeds_read || 0;
    var gas = klein.gas_ratio || 1;
    var piR = klein.pi_ratio || 0;

    // Map feeds to budget
    var scale = SCALES[3]; // π⁴ for the main view
    var used = Math.min(feeds_fresh, scale.cap);
    var remaining = scale.cap - used;
    var fill = used / scale.budget;

    // The remainder bar — always non-zero, always shows
    var remPct = (scale.rem / 1) * 100; // scale to visible

    el.innerHTML =
      '<div style="font-family:monospace;font-size:10px;color:#8b949e">' +
        '<div style="color:#58a6ff;margin-bottom:4px">π-budget: ' + scale.budget.toFixed(3) + '</div>' +
        // Budget bar
        '<div style="background:#161b22;border-radius:3px;height:8px;width:100%;position:relative;overflow:hidden">' +
          // Used (sides — known/classified)
          '<div style="background:#3fb950;height:100%;width:' + (fill * 100).toFixed(1) + '%;position:absolute;left:0;transition:width .5s"></div>' +
          // Remainder (center — always visible, always irrational)
          '<div style="background:#d2a8ff;height:100%;width:' + Math.max(remPct, 2) + '%;position:absolute;right:0;opacity:.7" title="remainder: ' + scale.rem.toFixed(6) + ' (always > 0)"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:2px">' +
          '<span>sides: ' + used + '/' + scale.cap + '</span>' +
          '<span style="color:#d2a8ff">∞ ' + scale.rem.toFixed(3) + '</span>' +
        '</div>' +
      '</div>';
  }

  // ═══ EXPOSE ═══
  window._piBudget = {
    Set: PiBudgetSet,
    SCALES: SCALES,
    FEED_BUDGET: FEED_BUDGET,
    render: renderBudget
  };

  // Render on load, then every π³ seconds ≈ 31s
  setTimeout(renderBudget, 800);
  setInterval(renderBudget, Math.round(PI * PI * PI * 1000));
})();
