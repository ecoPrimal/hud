// desk-weave.js — weave tab renderer, cube face, π inversion, progressive trust
// Sweep: 725→compressed, renderWeave(287) → 5 section builders + HTML helpers.
(function(){
var D = window.Desk;

var EP_SUBS = {
  PHYSICS:['wave','lattice','spectral'], TOPOLOGY:['graph','mesh','braid'],
  PHILOSOPHY:['ethics','commons','atlas'], METHOD:['tools','tufte','evolution'],
  INVESTIGATION:['evidence','actors','charter'], IMMUNE:['membrane','scatter','antidote'],
  SCIENCE:['biology','genomics','data'], SIGNAL:['channel','beacon','transit'],
};

// ── Storage helpers ──
function getCubeArrangement(L) { try { var s = localStorage.getItem('eco_cube_arrange_' + L); return s ? JSON.parse(s) : null; } catch(e) { return null; } }
function saveCubeArrangement(L, arr) { try { localStorage.setItem('eco_cube_arrange_' + L, JSON.stringify(arr)); } catch(e) {} }

function defaultArrangement3(sorted) {
  var pos = [0,1,2,3,5,6,7,8], arr = new Array(9);
  for (var i = 0; i < 8 && i < sorted.length; i++) arr[pos[i]] = { type:'epitope', key:sorted[i] };
  arr[4] = { type:'center' };
  return arr;
}

function defaultArrangement5(sorted, shape) {
  var arr = new Array(25);
  arr[12] = { type:'center' };
  var blocks = [[0,1,5],[2,3,7],[4,9,14],[6,11,16],[8,13,18],[10,15,20],[17,21,22],[19,23,24]];
  for (var i = 0; i < 8 && i < sorted.length; i++) {
    var subs = EP_SUBS[sorted[i]] || ['a','b','c'];
    for (var j = 0; j < 3; j++) arr[blocks[i][j]] = { type:'sub', key:sorted[i], sub:subs[j], subIdx:j };
  }
  for (var k = 0; k < 25; k++) if (!arr[k]) arr[k] = { type:'empty' };
  return arr;
}

// ── HTML helpers ──
function sect(title, body) { return '<div class="weave-section"><h3>' + title + '</h3><div class="card"><div class="card-body">' + body + '</div></div></div>'; }
function roundHtml(num, title, body) {
  return '<div class="weave-section"><h3>round ' + num + ' — ' + title + '</h3><div class="weave-round">' +
    '<div class="weave-round-header"><span class="round-num">' + num + '</span> ' + title + '</div>' + body + '</div></div>';
}

// ── Cube face renderer ──
function renderCubeFace(shape, sorted, L) {
  var container = document.getElementById('cube-face-container');
  if (!container) return;
  var arr = getCubeArrangement(L) || (L === 3 ? defaultArrangement3(sorted) : defaultArrangement5(sorted, shape));
  saveCubeArrangement(L, arr);

  var grid = document.createElement('div');
  grid.className = 'cube-face L' + L;
  grid.id = 'cube-face-grid';
  var maxVal = shape[sorted[0]] || 1;

  arr.forEach(function(cell, idx) {
    var d = document.createElement('div');
    d.className = 'cube-cell' + (L === 5 ? ' L5' : '');
    d.dataset.idx = idx;
    d.draggable = true;

    if (cell.type === 'center') {
      d.classList.add('center-cell');
      var dEff = sorted.filter(function(k) { return shape[k] > 0; }).length;
      d.style.background = 'var(--bg-alt)';
      d.innerHTML = '<div class="cell-val" style="color:var(--accent)">★</div><div class="cell-label" style="color:var(--fg-dim)">d=' + dEff + '</div>';
    } else if (cell.type === 'epitope' || cell.type === 'sub') {
      var ep = cell.key, val = shape[ep] || 0, color = D.EP_COLORS[ep] || '#8b949e';
      var intensity = maxVal > 0 ? val / maxVal : 0;
      var isSub = cell.type === 'sub';
      var bgAlpha = Math.max(isSub ? 0.05 : 0.08, intensity * (isSub ? 0.25 : 0.35));
      d.style.background = D.hexToRgba(color, bgAlpha);
      d.style.borderColor = D.hexToRgba(color, isSub ? 0.15 : 0.3);
      var fillH = Math.round(intensity * (isSub ? 80 : 100));
      d.innerHTML = '<div class="cell-fill" style="height:' + fillH + '%;background:' + D.hexToRgba(color, isSub ? 0.15 : 0.25) + '"></div>' +
        '<div class="cell-val" style="color:' + color + (isSub ? ';font-size:10px' : '') + '">' + (isSub ? (cell.sub || '') : (val * 100).toFixed(0)) + '</div>' +
        '<div class="cell-label" style="color:' + (isSub ? D.hexToRgba(color, 0.7) : color) + '">' + ep.slice(0, isSub ? 4 : 5) + '</div>';
    } else {
      d.style.background = 'var(--surface)';
      d.innerHTML = '<div class="cell-label" style="color:var(--fg-dim)">·</div>';
    }

    // Drag handlers (mouse)
    d.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', idx); this.classList.add('dragging'); });
    d.addEventListener('dragend', function() { this.classList.remove('dragging'); });
    d.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('drag-over'); });
    d.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
    d.addEventListener('drop', function(e) {
      e.preventDefault(); this.classList.remove('drag-over');
      var from = parseInt(e.dataTransfer.getData('text/plain')), to = parseInt(this.dataset.idx);
      if (from !== to && !isNaN(from) && !isNaN(to)) { var t = arr[from]; arr[from] = arr[to]; arr[to] = t; saveCubeArrangement(L, arr); renderCubeFace(shape, sorted, L); }
    });
    grid.appendChild(d);
  });

  container.innerHTML = '';
  container.appendChild(grid);

  // Touch drag support
  var touchFrom = null;
  function swapAt(touch) {
    grid.querySelectorAll('.cube-cell').forEach(function(c) { c.classList.remove('dragging', 'drag-over'); });
    if (touchFrom === null) return;
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var cell = el ? el.closest('.cube-cell') : null;
    if (cell) {
      var to = parseInt(cell.dataset.idx);
      if (touchFrom !== to && !isNaN(touchFrom) && !isNaN(to)) { var t = arr[touchFrom]; arr[touchFrom] = arr[to]; arr[to] = t; saveCubeArrangement(L, arr); renderCubeFace(shape, sorted, L); }
    }
    touchFrom = null;
  }
  grid.addEventListener('touchstart', function(e) { var c = e.target.closest('.cube-cell'); if (c) { touchFrom = parseInt(c.dataset.idx); c.classList.add('dragging'); } }, { passive: true });
  grid.addEventListener('touchend', function(e) { swapAt(e.changedTouches[0]); });
  grid.addEventListener('touchmove', function(e) {
    if (touchFrom === null) return;
    var el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    var cell = el ? el.closest('.cube-cell') : null;
    grid.querySelectorAll('.cube-cell').forEach(function(c) { c.classList.remove('drag-over'); });
    if (cell && parseInt(cell.dataset.idx) !== touchFrom) cell.classList.add('drag-over');
  }, { passive: true });
}

// ── Export cube as PNG ──
function exportCubeFace() {
  var grid = document.getElementById('cube-face-grid');
  if (!grid) return;
  var cells = grid.querySelectorAll('.cube-cell');
  var L = grid.classList.contains('L5') ? 5 : 3;
  var cellSize = L === 3 ? 90 : 64, gap = 4, pad = 16;
  var totalSize = L * cellSize + (L - 1) * gap + 2 * pad;

  var canvas = document.createElement('canvas');
  canvas.width = totalSize; canvas.height = totalSize + 30;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  cells.forEach(function(cell, i) {
    var row = Math.floor(i / L), col = i % L;
    var x = pad + col * (cellSize + gap), y = pad + row * (cellSize + gap);
    ctx.fillStyle = getComputedStyle(cell).backgroundColor || 'rgba(33,38,45,0.5)';
    ctx.beginPath(); ctx.roundRect(x, y, cellSize, cellSize, 6); ctx.fill();
    var bc = getComputedStyle(cell).borderColor;
    if (bc && bc !== 'rgba(0, 0, 0, 0)') { ctx.strokeStyle = bc; ctx.lineWidth = 2; ctx.stroke(); }
    var valEl = cell.querySelector('.cell-val'), labelEl = cell.querySelector('.cell-label');
    if (valEl) { ctx.fillStyle = getComputedStyle(valEl).color || '#c9d1d9'; ctx.font = (L === 3 ? '16' : '12') + 'px -apple-system,system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(valEl.textContent, x + cellSize/2, y + cellSize/2); }
    if (labelEl) { ctx.fillStyle = getComputedStyle(labelEl).color || '#8b949e'; ctx.font = (L === 3 ? '9' : '7') + 'px -apple-system,system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(labelEl.textContent, x + cellSize/2, y + cellSize/2 + 14); }
  });
  ctx.fillStyle = '#484f58'; ctx.font = '10px -apple-system,system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('bingoCube face · primals.eco', canvas.width/2, canvas.height - 8);
  canvas.toBlob(function(blob) { var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'bingocube-face-' + L + 'x' + L + '.png'; a.click(); setTimeout(function() { URL.revokeObjectURL(url); }, 1000); });
}

// ── π inversion table ──
function buildPiTable(shape, sorted, PP, focal, piCost, H_shape) {
  var PIV = Math.PI, logPi = Math.log(PIV);
  var inversions = [
    { label:'sites on ring', integer:10, desc:'N surfaces' },
    { label:'epitope categories', integer:8, desc:'k receptors' },
    { label:'3×3 board', integer:9, desc:'L² cells' },
    { label:'5×5 board', integer:25, desc:'L² cells' },
    { label:'7×7 board', integer:49, desc:'L² cells (future)' },
  ];
  if (PP > 0) {
    inversions.push({ label:'your PP (perplexity)', integer:null, val:PP, desc:'effective axes' });
    inversions.push({ label:'your focal distance', integer:null, val:focal, desc:'f' });
    inversions.push({ label:'your entropy H', integer:null, val:H_shape, desc:'nats' });
    if (piCost > 0) inversions.push({ label:'your observation cost', integer:null, val:piCost, desc:'π^(PP/2)' });
  }

  var candidates = [];
  for (var i = -4; i <= 5; i++) { candidates.push({ x:i, label:''+i }); candidates.push({ x:i+0.5, label:i+'½' }); }
  [{ x:1/PIV, l:'1/π' },{ x:PIV/2, l:'π/2' },{ x:PIV, l:'π' },{ x:Math.E, l:'e' },{ x:Math.E/2, l:'e/2' },{ x:2/PIV, l:'2/π' },
   { x:Math.log(2)/logPi, l:'logπ(2)' },{ x:Math.log(Math.E)/logPi, l:'logπ(e)' }].forEach(function(c) { candidates.push({ x:c.x, label:c.l }); });

  var h = '<table style="width:100%;font-size:12px;border-collapse:collapse">';
  h += '<tr style="border-bottom:1px solid var(--border);color:var(--fg-dim)"><th style="text-align:left;padding:4px">quantity</th><th style="text-align:right;padding:4px">value</th><th style="text-align:right;padding:4px">π<sup>x</sup></th><th style="text-align:right;padding:4px">x</th><th style="text-align:left;padding:4px">nearest clean x</th><th style="text-align:right;padding:4px">π<sup>clean</sup></th><th style="text-align:right;padding:4px">Δ</th></tr>';

  inversions.forEach(function(inv) {
    var v = inv.integer !== null ? inv.integer : inv.val;
    if (v <= 0) return;
    var x = Math.log(v) / logPi;
    var best = candidates[0], bestDist = Math.abs(x - candidates[0].x);
    candidates.forEach(function(c) { var d = Math.abs(x - c.x); if (d < bestDist) { best = c; bestDist = d; } });
    var piClean = Math.pow(PIV, best.x), delta = v - piClean, closeness = Math.abs(delta / v);
    var color = closeness < 0.02 ? '#3fb950' : closeness < 0.1 ? '#d29922' : 'var(--fg-dim)';
    h += '<tr style="border-bottom:1px solid rgba(48,54,61,0.3)"><td style="padding:4px;color:var(--fg-dim)">' + inv.label + '</td><td style="padding:4px;text-align:right;font-weight:600">' + (inv.integer !== null ? inv.integer : v.toFixed(3)) + '</td><td style="padding:4px;text-align:right;color:var(--fg-muted)">π<sup>' + x.toFixed(3) + '</sup></td><td style="padding:4px;text-align:right;font-family:monospace">' + x.toFixed(4) + '</td><td style="padding:4px;color:' + color + '">π<sup>' + best.label + '</sup></td><td style="padding:4px;text-align:right;color:' + color + '">' + piClean.toFixed(3) + '</td><td style="padding:4px;text-align:right;color:' + color + '">' + (delta >= 0 ? '+' : '') + delta.toFixed(3) + ' (' + (closeness * 100).toFixed(1) + '%)</td></tr>';
  });
  h += '</table>';
  return h;
}

// ── Hyperlocalized π ──
function buildLocalPi(shape, sorted) {
  var PIV = Math.PI, k = 8, bhattSum = 0;
  sorted.forEach(function(ep) { bhattSum += Math.sqrt(shape[ep] * k); });
  bhattSum /= k;
  var fisherDist = 2 * Math.acos(Math.min(1, bhattSum)), R = 2;
  var piLocal = fisherDist > 0.001 ? PIV * R * Math.sin(fisherDist / R) / fisherDist : PIV;
  var piDev = piLocal - PIV;
  var h = '<p style="margin-top:6px">Your distance from the centroid (Fisher metric): <strong>' + fisherDist.toFixed(4) + '</strong></p>';
  h += '<p>π<sub>local</sub> at your position: <strong style="color:var(--accent)">' + piLocal.toFixed(6) + '</strong> (deviation: ' + (piDev >= 0 ? '+' : '') + piDev.toFixed(6) + ')</p>';
  if (piDev < -0.001) h += '<p style="color:var(--fg-dim)">Your π is smaller than flat π. You are on a positively curved region of the simplex — concentrated shape, contracted angular measure.</p>';
  else if (piDev > 0.001) h += '<p style="color:var(--fg-dim)">Your π is larger than flat π. Unusual — this would indicate negative curvature.</p>';
  else h += '<p style="color:var(--fg-dim)">Your π is near-flat. You are close to the centroid of the simplex — broad, uniform engagement.</p>';
  return h;
}

// ── Event binding ──
function bindWeaveHandlers(shape, sorted, top2, cubeLevel) {
  function btn(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }

  btn('cube-evolve', function() { try { localStorage.setItem('eco_cube_level', '5'); } catch(e) {} D.switchTab('weave'); });
  btn('cube-devolve', function() { try { localStorage.setItem('eco_cube_level', '3'); } catch(e) {} D.switchTab('weave'); });
  btn('cube-shuffle', function() {
    var arr = cubeLevel === 3 ? defaultArrangement3(sorted) : defaultArrangement5(sorted, shape);
    var center = cubeLevel === 3 ? 4 : 12, indices = [];
    for (var i = 0; i < arr.length; i++) if (i !== center) indices.push(i);
    for (var k = indices.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = arr[indices[k]]; arr[indices[k]] = arr[indices[j]]; arr[indices[j]] = t; }
    saveCubeArrangement(cubeLevel, arr);
    renderCubeFace(shape, sorted, cubeLevel);
  });
  btn('cube-export-img', exportCubeFace);

  // SHA-256 commitment
  var shapeArr = sorted.map(function(k) { return shape[k].toFixed(6); });
  var nonce = new Uint8Array(16); crypto.getRandomValues(nonce);
  var nonceHex = Array.from(nonce).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(shapeArr.join(',') + '|' + nonceHex)).then(function(buf) {
    var el = document.getElementById('weave-commitment-hash');
    if (el) el.textContent = Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
  });

  btn('weave-copy-commit', function() { var el = document.getElementById('weave-commitment-hash'); if (el && navigator.clipboard) navigator.clipboard.writeText(el.textContent); });
  btn('weave-copy-shape', function() {
    var str = sorted.filter(function(k) { return shape[k] > 0; }).map(function(k) { return k + ':' + (shape[k] * 100).toFixed(1); }).join(', ');
    if (navigator.clipboard) navigator.clipboard.writeText(str);
  });

  // Round 1: coarse alignment
  btn('weave-r1-compare', function() {
    var input = document.getElementById('weave-r1-input').value.trim().toUpperCase();
    var theirs = input.split(/[,\s]+/).filter(function(s) { return s.length > 0; }).slice(0, 2);
    var r = document.getElementById('weave-r1-result');
    if (theirs.length < 1) { r.innerHTML = '<p style="color:var(--fg-dim)">Enter at least one category.</p>'; return; }
    var overlap = top2.filter(function(t) { return theirs.indexOf(t) >= 0; });
    if (overlap.length === 2) r.innerHTML = '<div class="weave-result match">Both top categories match: <strong>' + overlap.join(', ') + '</strong>. Strong alignment. Proceed to round 2.</div>';
    else if (overlap.length === 1) r.innerHTML = '<div class="weave-result partial">One overlap: <strong>' + overlap[0] + '</strong>. Partial alignment.</div>';
    else r.innerHTML = '<div class="weave-result none">No overlap in top 2. Different angles — complementary shapes can be valuable.</div>';
  });

  // Round 2: gradient
  btn('weave-r2-compare', function() {
    var theirRatio = parseFloat(document.getElementById('weave-r2-input').value.trim());
    var r = document.getElementById('weave-r2-result');
    if (isNaN(theirRatio) || theirRatio <= 0) { r.innerHTML = '<p style="color:var(--fg-dim)">Enter a positive number.</p>'; return; }
    var myRatio = top2.length >= 2 && shape[top2[1]] > 0 ? shape[top2[0]] / shape[top2[1]] : Infinity;
    var relDiff = Math.abs(myRatio - theirRatio) / Math.max(myRatio, theirRatio);
    if (relDiff < 0.15) r.innerHTML = '<div class="weave-result match">Gradients close (yours: ' + myRatio.toFixed(2) + ', theirs: ' + theirRatio.toFixed(2) + '). Proceed to full shape exchange.</div>';
    else if (relDiff < 0.4) r.innerHTML = '<div class="weave-result partial">Same range (yours: ' + myRatio.toFixed(2) + ', theirs: ' + theirRatio.toFixed(2) + '). Same lean, different intensity.</div>';
    else r.innerHTML = '<div class="weave-result none">Different gradients (yours: ' + myRatio.toFixed(2) + ', theirs: ' + theirRatio.toFixed(2) + ').</div>';
  });

  // Round 3: the mirror
  btn('weave-r3-compare', function() {
    var EP_KEYS = Object.keys(D.EP_COLORS);
    var input = document.getElementById('weave-r3-input').value.trim();
    var r = document.getElementById('weave-r3-result');
    var them = {};
    EP_KEYS.forEach(function(k) { them[k] = 0; });
    input.split(/[,\s]+/).forEach(function(chunk) {
      var p = chunk.split(':');
      if (p.length === 2) { var cat = p[0].toUpperCase().trim(), val = parseFloat(p[1]); if (EP_KEYS.indexOf(cat) >= 0 && !isNaN(val)) them[cat] = val / 100; }
    });
    var total = 0; EP_KEYS.forEach(function(k) { total += them[k]; });
    if (total === 0) { r.innerHTML = '<p style="color:var(--fg-dim)">Could not parse shape. Use: CATEGORY:value, CATEGORY:value</p>'; return; }
    EP_KEYS.forEach(function(k) { them[k] /= total; });

    function barRows(s, srt, maxV, label) {
      var h = '<div class="weave-mirror-half"><h4>' + label + '</h4>';
      srt.forEach(function(ep) {
        if (s[ep] === 0 && (label === 'you' ? them[ep] : shape[ep]) === 0) return;
        h += '<div class="shape-bar-row"><div class="shape-bar-label" style="color:' + D.EP_COLORS[ep] + ';width:70px;font-size:10px">' + ep.slice(0,5) + '</div>';
        h += '<div class="shape-bar-track"><div class="shape-bar-fill" style="width:' + Math.round(s[ep] / maxV * 100) + '%;background:' + D.EP_COLORS[ep] + '"></div></div>';
        h += '<div class="shape-bar-val">' + (s[ep] * 100).toFixed(1) + '</div></div>';
      });
      return h + '</div>';
    }
    var theirSorted = EP_KEYS.slice().sort(function(a,b) { return them[b] - them[a]; });
    var mirrorHtml = '<div class="weave-mirror">' + barRows(shape, sorted, shape[sorted[0]] || 1, 'you') + barRows(them, theirSorted, them[theirSorted[0]] || 1, 'the other') + '</div>';

    var dot = 0, mA = 0, mB = 0;
    EP_KEYS.forEach(function(k) { dot += shape[k] * them[k]; mA += shape[k] * shape[k]; mB += them[k] * them[k]; });
    var cos = (mA > 0 && mB > 0) ? dot / (Math.sqrt(mA) * Math.sqrt(mB)) : 0;
    var cls = cos > 0.8 ? 'match' : cos > 0.5 ? 'partial' : 'none';
    var narrative = '<div class="weave-result ' + cls + '">Cosine similarity: <strong>' + cos.toFixed(3) + '</strong>. ' +
      (cos > 0.95 ? 'Nearly same shape. Rare alignment.' : cos > 0.8 ? 'Strong alignment. Complementary.' : cos > 0.5 ? 'Moderate overlap. Different angles.' : 'Different shapes. What they see, you might be missing.') + '</div>';

    var diffs = EP_KEYS.map(function(k) { return { ep:k, diff:them[k] - shape[k] }; }).sort(function(a,b) { return Math.abs(b.diff) - Math.abs(a.diff); });
    var insight = '<p style="font-size:12px;margin-top:12px"><strong>The mirror shows:</strong></p><ul style="font-size:12px;margin-top:4px;padding-left:20px">';
    diffs.slice(0, 3).forEach(function(d) {
      if (Math.abs(d.diff) < 0.01) return;
      insight += '<li>' + (d.diff > 0 ? 'Their' : 'Your') + ' <strong style="color:' + D.EP_COLORS[d.ep] + '">' + d.ep + '</strong> is stronger (+' + (Math.abs(d.diff)*100).toFixed(1) + '%) — ' + (d.diff > 0 ? 'they see something there' : 'you bring something they lack') + '</li>';
    });
    r.innerHTML = mirrorHtml + narrative + insight + '</ul>';
  });
}

// ═══ Main render ═══
D.renderWeave = function() {
  var shape = D.computeShape(), EP_KEYS = Object.keys(D.EP_COLORS);
  if (shape._total === 0) {
    return '<div class="empty-state"><h3>no shape yet</h3><p>Explore the membrane. Visit pages. Mark what matters. Your shape forms from what you touch.</p>' +
      '<p><a href="https://sporeprint.primals.eco/science/">start exploring →</a></p></div>';
  }

  var sorted = EP_KEYS.slice().sort(function(a,b) { return shape[b] - shape[a]; });
  var top2 = sorted.slice(0, 2).filter(function(k) { return shape[k] > 0; });
  var activeEps = sorted.filter(function(k) { return shape[k] > 0; }).length;
  var cubeLevel = activeEps >= 6 ? 5 : 3;
  try { var sl = parseInt(localStorage.getItem('eco_cube_level')); if (sl === 5 && activeEps >= 6) cubeLevel = 5; if (sl === 3) cubeLevel = 3; } catch(e) {}

  var H = 0;
  sorted.forEach(function(k) { if (shape[k] > 0) H -= shape[k] * Math.log(shape[k]); });
  var PP = Math.exp(H), focal = 1 / Math.pow(Math.PI, PP / 2), piCost = Math.pow(Math.PI, PP / 2);
  var PIV = Math.PI;

  // THE FACE
  var faceBody = '';
  if (top2.length >= 2) {
    faceBody += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px">Your axes: <strong style="color:' + D.EP_COLORS[top2[0]] + '">' + top2[0] + '</strong> × <strong style="color:' + D.EP_COLORS[top2[1]] + '">' + top2[1] + '</strong>. Drag to rearrange — the fidget is the sort.</p>';
  } else {
    faceBody += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px">Your bingoCube face. Drag cells to rearrange.</p>';
  }
  faceBody += '<div class="cube-level-indicator" style="margin-bottom:12px;justify-content:center">';
  [3,5,7,11,13].forEach(function(p) { faceBody += '<span class="prime-dot ' + (p === cubeLevel ? 'active' : (p <= cubeLevel ? '' : 'locked')) + '">' + p + '</span>'; });
  faceBody += '<span style="margin-left:4px">prime chain · ' + PP.toFixed(1) + ' active axes</span></div>';
  faceBody += '<div id="cube-face-container"></div><div class="cube-controls">';
  if (activeEps >= 6 && cubeLevel === 3) faceBody += '<button class="weave-btn primary" id="cube-evolve">evolve to 5×5</button>';
  else if (cubeLevel === 5) faceBody += '<button class="weave-btn" id="cube-devolve">simplify to 3×3</button>';
  faceBody += '<button class="weave-btn" id="cube-shuffle">shuffle</button><button class="weave-btn" id="cube-export-img">export face</button></div>';

  // COMPRESSION CHAIN
  var compBody = '<div style="font-family:monospace;font-size:12px;line-height:2;text-align:center">' +
    '<div style="color:var(--fg-dim)">∞ dimensions of experience</div><div style="color:var(--fg-muted)">↓ epitope sort</div>' +
    '<div><strong style="color:var(--fg)">8</strong> <span style="color:var(--fg-dim)">categories (the shape)</span></div>' +
    '<div style="color:var(--fg-muted)">↓ entropy compression</div>' +
    '<div><strong style="color:var(--accent)">' + PP.toFixed(2) + '</strong> <span style="color:var(--fg-dim)">effective axes (perplexity e<sup>H</sup>)</span></div>' +
    '<div style="color:var(--fg-muted)">↓ π prices the observation</div>' +
    '<div>f = 1/π<sup>' + (PP/2).toFixed(1) + '</sup> = <strong style="color:var(--accent)">' + (focal < 0.001 ? focal.toExponential(2) : focal.toFixed(4)) + '</strong></div></div>' +
    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:12px">' +
    '<p style="color:var(--fg-dim);margin-bottom:4px">The cost of your point of view: <strong style="color:var(--fg)">π<sup>' + (PP/2).toFixed(1) + '</sup> ≈ ' + piCost.toFixed(2) + '</strong></p>' +
    '<p style="color:var(--fg-dim)">Each axis costs √π. One receptor = √π ≈ 1.77. Two = π ≈ 3.14. The minimum cost of seeing is √π.</p></div>';

  // π INVERSION
  var piBody = '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">Every integer in the system expressed as π<sup>x</sup>.</p>' +
    buildPiTable(shape, sorted, PP, focal, piCost, H) +
    '<div style="margin-top:12px;padding:10px;background:rgba(63,185,80,0.08);border:1px solid rgba(63,185,80,0.2);border-radius:4px;font-size:12px">' +
    '<p><strong style="color:#3fb950">π² ≈ 9.870</strong> — the ring has <strong>10</strong> sites. The gap is ' + (10 - PIV*PIV).toFixed(3) + '. The fractional surface is the curvature of the observation space.</p>' +
    '<p style="margin-top:6px">10 − π² = ' + (10 - PIV*PIV).toFixed(4) + '. Compare: π − 3 = ' + (PIV - 3).toFixed(4) + '. Both are remainders when an integer rounds a π-quantity.</p></div>' +
    '<div style="margin-top:12px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:4px;font-size:12px">' +
    '<p><strong>Hyperlocalized π</strong>: on the probability simplex, the effective value of π changes with position.</p>' + buildLocalPi(shape, sorted) + '</div>';

  // SHAPE BARS
  var barBody = '';
  sorted.forEach(function(ep) {
    if (shape[ep] === 0) return;
    var barW = shape[sorted[0]] > 0 ? Math.round((shape[ep] / shape[sorted[0]]) * 100) : 0;
    barBody += '<div class="shape-bar-row"><div class="shape-bar-label" style="color:' + D.EP_COLORS[ep] + '">' + ep + '</div><div class="shape-bar-track"><div class="shape-bar-fill" style="width:' + barW + '%;background:' + D.EP_COLORS[ep] + '"></div></div><div class="shape-bar-val">' + (shape[ep] * 100).toFixed(1) + '%</div></div>';
  });

  // COMMITMENT
  var commitBody = '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">A cryptographic commitment proves you have a shape without revealing it.</p>' +
    '<div class="weave-commitment" id="weave-commitment-hash">computing...</div>' +
    '<button class="weave-btn" style="margin-top:8px" id="weave-copy-commit">copy commitment</button>';

  // ROUNDS
  var r1Body = '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">Your top 2: <strong style="color:' + D.EP_COLORS[top2[0]] + '">' + top2[0] + '</strong>';
  if (top2.length > 1) r1Body += ' + <strong style="color:' + D.EP_COLORS[top2[1]] + '">' + top2[1] + '</strong>';
  r1Body += '.</p><div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg-dim)">enter the other's top 2:</label></div>' +
    '<input class="weave-input" id="weave-r1-input" placeholder="e.g. INVESTIGATION, PHILOSOPHY" style="margin-bottom:8px"/>' +
    '<button class="weave-btn primary" id="weave-r1-compare">compare</button><div id="weave-r1-result"></div>';

  var r2Body = '';
  if (top2.length >= 2 && shape[top2[1]] > 0) {
    var myRatio = (shape[top2[0]] / shape[top2[1]]).toFixed(2);
    r2Body = '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">Your ratio: <strong>' + top2[0] + ' / ' + top2[1] + ' = ' + myRatio + '</strong>.</p>' +
      '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg-dim)">enter the other's ratio:</label></div>' +
      '<input class="weave-input" id="weave-r2-input" placeholder="e.g. 1.35" style="margin-bottom:8px"/>' +
      '<button class="weave-btn primary" id="weave-r2-compare">compare</button><div id="weave-r2-result"></div>';
  } else {
    r2Body = '<p style="font-size:12px;color:var(--fg-dim)">Need at least 2 active categories. Keep exploring.</p>';
  }

  var myShapeStr = sorted.filter(function(k) { return shape[k] > 0; }).map(function(k) { return k + ':' + (shape[k] * 100).toFixed(1); }).join(', ');
  var r3Body = '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px">Your full shape:</p>' +
    '<div class="weave-commitment" style="font-size:12px;margin-bottom:12px">' + myShapeStr + '</div>' +
    '<button class="weave-btn" id="weave-copy-shape" style="margin-bottom:16px">copy your shape</button>' +
    '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg-dim)">paste the other's shape:</label></div>' +
    '<input class="weave-input" id="weave-r3-input" placeholder="e.g. INVESTIGATION:45.0, TOPOLOGY:28.0" style="margin-bottom:8px"/>' +
    '<button class="weave-btn primary" id="weave-r3-compare">compare — see the mirror</button><div id="weave-r3-result"></div>';

  var html = sect('your face', faceBody) + sect('the compression', compBody) + sect('the π inversion', piBody) +
    sect('shape vector (private) · ' + activeEps + ' axes active', barBody) + sect('your commitment', commitBody) +
    roundHtml(1, 'coarse alignment', r1Body) + roundHtml(2, 'gradient', r2Body) + roundHtml(3, 'the mirror', r3Body) +
    '<div class="card"><div class="card-body"><p style="font-size:12px;color:var(--fg-dim)"><strong>Others are the mirror.</strong> You do not know your own shape until you see how it differs from someone else's. No accounts. No profiles. No identity. Just shapes meeting shapes.</p></div></div>';

  setTimeout(function() { renderCubeFace(shape, sorted, cubeLevel); bindWeaveHandlers(shape, sorted, top2, cubeLevel); }, 50);
  return html;
};
})();
