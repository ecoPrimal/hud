// desk-weave.js — weave tab renderer, cube face, π inversion, progressive trust
(function(){
var D = window.Desk;

var EP_SUBS = {
  PHYSICS:       ['wave','lattice','spectral'],
  TOPOLOGY:      ['graph','mesh','braid'],
  PHILOSOPHY:    ['ethics','commons','atlas'],
  METHOD:        ['tools','tufte','evolution'],
  INVESTIGATION: ['evidence','actors','charter'],
  IMMUNE:        ['membrane','scatter','antidote'],
  SCIENCE:       ['biology','genomics','data'],
  SIGNAL:        ['channel','beacon','transit'],
};

function getCubeArrangement(L) {
  var key = 'eco_cube_arrange_' + L;
  try {
    var saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return null;
}

function saveCubeArrangement(L, arr) {
  try { localStorage.setItem('eco_cube_arrange_' + L, JSON.stringify(arr)); } catch(e) {}
}

function defaultArrangement3(sorted) {
  var positions = [0,1,2,3, 5,6,7,8];
  var arr = new Array(9);
  for (var i = 0; i < 8 && i < sorted.length; i++) {
    arr[positions[i]] = { type:'epitope', key:sorted[i] };
  }
  arr[4] = { type:'center' };
  return arr;
}

function defaultArrangement5(sorted, shape) {
  var arr = new Array(25);
  arr[12] = { type:'center' };
  var blocks = [
    [0,1,5],    [2,3,7],    [4,9,14],
    [6,11,16],  [8,13,18],  [10,15,20],
    [17,21,22], [19,23,24],
  ];
  for (var i = 0; i < 8 && i < sorted.length; i++) {
    var subs = EP_SUBS[sorted[i]] || ['a','b','c'];
    var block = blocks[i];
    for (var j = 0; j < 3; j++) {
      arr[block[j]] = { type:'sub', key:sorted[i], sub:subs[j], subIdx:j };
    }
  }
  for (var k = 0; k < 25; k++) {
    if (!arr[k]) arr[k] = { type:'empty' };
  }
  return arr;
}

function renderCubeFace(shape, sorted, L) {
  var container = document.getElementById('cube-face-container');
  if (!container) return;

  var arr = getCubeArrangement(L);
  if (!arr) {
    arr = L === 3 ? defaultArrangement3(sorted) : defaultArrangement5(sorted, shape);
    saveCubeArrangement(L, arr);
  }

  var grid = document.createElement('div');
  grid.className = 'cube-face L' + L;
  grid.id = 'cube-face-grid';

  var maxVal = shape[sorted[0]] || 1;

  arr.forEach(function(cell, idx) {
    var div = document.createElement('div');
    div.className = 'cube-cell' + (L === 5 ? ' L5' : '');
    div.dataset.idx = idx;
    div.draggable = true;

    if (cell.type === 'center') {
      div.classList.add('center-cell');
      var dEff = sorted.filter(function(k) { return shape[k] > 0; }).length;
      div.style.background = 'var(--bg-alt)';
      div.innerHTML = '<div class="cell-val" style="color:var(--accent)">\u2605</div>' +
        '<div class="cell-label" style="color:var(--fg-dim)">d=' + dEff + '</div>';
    } else if (cell.type === 'epitope') {
      var ep = cell.key;
      var val = shape[ep] || 0;
      var intensity = maxVal > 0 ? val / maxVal : 0;
      var color = D.EP_COLORS[ep] || '#8b949e';
      var bgAlpha = Math.max(0.08, intensity * 0.35);
      div.style.background = D.hexToRgba(color, bgAlpha);
      div.style.borderColor = D.hexToRgba(color, 0.3);
      var fillH = Math.round(intensity * 100);
      div.innerHTML = '<div class="cell-fill" style="height:' + fillH + '%;background:' + D.hexToRgba(color, 0.25) + '"></div>' +
        '<div class="cell-val" style="color:' + color + '">' + (val * 100).toFixed(0) + '</div>' +
        '<div class="cell-label" style="color:' + color + '">' + ep.slice(0,5) + '</div>';
    } else if (cell.type === 'sub') {
      var ep = cell.key;
      var val = shape[ep] || 0;
      var color = D.EP_COLORS[ep] || '#8b949e';
      var intensity = maxVal > 0 ? val / maxVal : 0;
      var bgAlpha = Math.max(0.05, intensity * 0.25);
      div.style.background = D.hexToRgba(color, bgAlpha);
      div.style.borderColor = D.hexToRgba(color, 0.15);
      var fillH = Math.round(intensity * 80);
      div.innerHTML = '<div class="cell-fill" style="height:' + fillH + '%;background:' + D.hexToRgba(color, 0.15) + '"></div>' +
        '<div class="cell-val" style="color:' + color + ';font-size:10px">' + (cell.sub || '') + '</div>' +
        '<div class="cell-label" style="color:' + D.hexToRgba(color, 0.7) + '">' + ep.slice(0,4) + '</div>';
    } else {
      div.style.background = 'var(--surface)';
      div.innerHTML = '<div class="cell-label" style="color:var(--fg-dim)">\u00b7</div>';
    }

    div.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', idx);
      this.classList.add('dragging');
    });
    div.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
    div.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });
    div.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });
    div.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      var fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
      var toIdx = parseInt(this.dataset.idx);
      if (fromIdx !== toIdx && !isNaN(fromIdx) && !isNaN(toIdx)) {
        var temp = arr[fromIdx];
        arr[fromIdx] = arr[toIdx];
        arr[toIdx] = temp;
        saveCubeArrangement(L, arr);
        renderCubeFace(shape, sorted, L);
      }
    });

    grid.appendChild(div);
  });

  container.innerHTML = '';
  container.appendChild(grid);

  var touchFrom = null;
  grid.addEventListener('touchstart', function(e) {
    var cell = e.target.closest('.cube-cell');
    if (cell) {
      touchFrom = parseInt(cell.dataset.idx);
      cell.classList.add('dragging');
    }
  }, { passive: true });
  grid.addEventListener('touchend', function(e) {
    var cells = grid.querySelectorAll('.cube-cell');
    cells.forEach(function(c) { c.classList.remove('dragging', 'drag-over'); });
    if (touchFrom === null) return;
    var touch = e.changedTouches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var cell = el ? el.closest('.cube-cell') : null;
    if (cell) {
      var toIdx = parseInt(cell.dataset.idx);
      if (touchFrom !== toIdx && !isNaN(touchFrom) && !isNaN(toIdx)) {
        var temp = arr[touchFrom];
        arr[touchFrom] = arr[toIdx];
        arr[toIdx] = temp;
        saveCubeArrangement(L, arr);
        renderCubeFace(shape, sorted, L);
      }
    }
    touchFrom = null;
  });
  grid.addEventListener('touchmove', function(e) {
    if (touchFrom === null) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var cell = el ? el.closest('.cube-cell') : null;
    var cells = grid.querySelectorAll('.cube-cell');
    cells.forEach(function(c) { c.classList.remove('drag-over'); });
    if (cell && parseInt(cell.dataset.idx) !== touchFrom) {
      cell.classList.add('drag-over');
    }
  }, { passive: true });
}

function exportCubeFace() {
  var grid = document.getElementById('cube-face-grid');
  if (!grid) return;
  var cells = grid.querySelectorAll('.cube-cell');
  var L = grid.classList.contains('L5') ? 5 : 3;
  var cellSize = L === 3 ? 90 : 64;
  var gap = 4;
  var pad = 16;
  var totalSize = L * cellSize + (L - 1) * gap + 2 * pad;

  var canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = totalSize + 30;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  cells.forEach(function(cell, i) {
    var row = Math.floor(i / L);
    var col = i % L;
    var x = pad + col * (cellSize + gap);
    var y = pad + row * (cellSize + gap);

    var bg = getComputedStyle(cell).backgroundColor;
    ctx.fillStyle = bg || 'rgba(33,38,45,0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, cellSize, cellSize, 6);
    ctx.fill();

    var bc = getComputedStyle(cell).borderColor;
    if (bc && bc !== 'rgba(0, 0, 0, 0)') {
      ctx.strokeStyle = bc;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    var valEl = cell.querySelector('.cell-val');
    var labelEl = cell.querySelector('.cell-label');
    if (valEl) {
      ctx.fillStyle = getComputedStyle(valEl).color || '#c9d1d9';
      ctx.font = (L === 3 ? '16' : '12') + 'px -apple-system,system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(valEl.textContent, x + cellSize/2, y + cellSize/2);
    }
    if (labelEl) {
      ctx.fillStyle = getComputedStyle(labelEl).color || '#8b949e';
      ctx.font = (L === 3 ? '9' : '7') + 'px -apple-system,system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labelEl.textContent, x + cellSize/2, y + cellSize/2 + 14);
    }
  });

  ctx.fillStyle = '#484f58';
  ctx.font = '10px -apple-system,system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('bingoCube face \u00b7 primals.eco', canvas.width/2, canvas.height - 8);

  canvas.toBlob(function(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bingocube-face-' + L + 'x' + L + '.png';
    a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  });
}

function bindWeaveHandlers(shape, sorted, top2, cubeLevel) {
  var EP_KEYS = Object.keys(D.EP_COLORS);

  var evolveBtn = document.getElementById('cube-evolve');
  if (evolveBtn) evolveBtn.addEventListener('click', function() {
    try { localStorage.setItem('eco_cube_level', '5'); } catch(e) {}
    D.switchTab('weave');
  });
  var devolveBtn = document.getElementById('cube-devolve');
  if (devolveBtn) devolveBtn.addEventListener('click', function() {
    try { localStorage.setItem('eco_cube_level', '3'); } catch(e) {}
    D.switchTab('weave');
  });
  var shuffleBtn = document.getElementById('cube-shuffle');
  if (shuffleBtn) shuffleBtn.addEventListener('click', function() {
    var L = cubeLevel;
    var arr = L === 3 ? defaultArrangement3(sorted) : defaultArrangement5(sorted, shape);
    var centerIdx = L === 3 ? 4 : 12;
    var indices = [];
    for (var i = 0; i < arr.length; i++) { if (i !== centerIdx) indices.push(i); }
    for (var k = indices.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var tmp = arr[indices[k]];
      arr[indices[k]] = arr[indices[j]];
      arr[indices[j]] = tmp;
    }
    saveCubeArrangement(L, arr);
    renderCubeFace(shape, sorted, L);
  });
  var exportBtn = document.getElementById('cube-export-img');
  if (exportBtn) exportBtn.addEventListener('click', exportCubeFace);

  var shapeArr = sorted.map(function(k) { return shape[k].toFixed(6); });
  var nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);
  var nonceHex = Array.from(nonce).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
  var commitData = shapeArr.join(',') + '|' + nonceHex;

  crypto.subtle.digest('SHA-256', new TextEncoder().encode(commitData)).then(function(hashBuf) {
    var hashHex = Array.from(new Uint8Array(hashBuf)).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
    var el = document.getElementById('weave-commitment-hash');
    if (el) el.textContent = hashHex;
  });

  var copyCommit = document.getElementById('weave-copy-commit');
  if (copyCommit) copyCommit.addEventListener('click', function() {
    var el = document.getElementById('weave-commitment-hash');
    if (el && navigator.clipboard) navigator.clipboard.writeText(el.textContent);
  });

  var copyShape = document.getElementById('weave-copy-shape');
  if (copyShape) copyShape.addEventListener('click', function() {
    var str = sorted.filter(function(k) { return shape[k] > 0; }).map(function(k) { return k + ':' + (shape[k] * 100).toFixed(1); }).join(', ');
    if (navigator.clipboard) navigator.clipboard.writeText(str);
  });

  var r1btn = document.getElementById('weave-r1-compare');
  if (r1btn) r1btn.addEventListener('click', function() {
    var input = document.getElementById('weave-r1-input').value.trim().toUpperCase();
    var theirTop2 = input.split(/[,\s]+/).filter(function(s) { return s.length > 0; }).slice(0, 2);
    var resultEl = document.getElementById('weave-r1-result');
    if (theirTop2.length < 1) { resultEl.innerHTML = '<p style="color:var(--fg-dim)">Enter at least one category.</p>'; return; }

    var overlap = top2.filter(function(t) { return theirTop2.indexOf(t) >= 0; });
    if (overlap.length === 2) {
      resultEl.innerHTML = '<div class="weave-result match">Both top categories match: <strong>' + overlap.join(', ') + '</strong>. Strong alignment. Proceed to round 2.</div>';
    } else if (overlap.length === 1) {
      resultEl.innerHTML = '<div class="weave-result partial">One overlap: <strong>' + overlap[0] + '</strong>. Partial alignment. You share an emphasis but differ on the secondary.</div>';
    } else {
      resultEl.innerHTML = '<div class="weave-result none">No overlap in top 2. Different angles of approach. That\u2019s information too \u2014 complementary shapes can be valuable.</div>';
    }
  });

  var r2btn = document.getElementById('weave-r2-compare');
  if (r2btn) r2btn.addEventListener('click', function() {
    var theirRatio = parseFloat(document.getElementById('weave-r2-input').value.trim());
    var resultEl = document.getElementById('weave-r2-result');
    if (isNaN(theirRatio) || theirRatio <= 0) { resultEl.innerHTML = '<p style="color:var(--fg-dim)">Enter a positive number.</p>'; return; }

    var myRatio = top2.length >= 2 && shape[top2[1]] > 0 ? shape[top2[0]] / shape[top2[1]] : Infinity;
    var diff = Math.abs(myRatio - theirRatio);
    var relDiff = diff / Math.max(myRatio, theirRatio);

    if (relDiff < 0.15) {
      resultEl.innerHTML = '<div class="weave-result match">Gradients are close (yours: ' + myRatio.toFixed(2) + ', theirs: ' + theirRatio.toFixed(2) + '). Similar emphasis balance. Proceed to full shape exchange.</div>';
    } else if (relDiff < 0.4) {
      resultEl.innerHTML = '<div class="weave-result partial">Gradients are in the same range (yours: ' + myRatio.toFixed(2) + ', theirs: ' + theirRatio.toFixed(2) + '). Same general lean, different intensity.</div>';
    } else {
      resultEl.innerHTML = '<div class="weave-result none">Different gradients (yours: ' + myRatio.toFixed(2) + ', theirs: ' + theirRatio.toFixed(2) + '). One of you focuses harder on the top category.</div>';
    }
  });

  var r3btn = document.getElementById('weave-r3-compare');
  if (r3btn) r3btn.addEventListener('click', function() {
    var input = document.getElementById('weave-r3-input').value.trim();
    var resultEl = document.getElementById('weave-r3-result');
    var theirShape = {};
    EP_KEYS.forEach(function(k) { theirShape[k] = 0; });

    input.split(/[,\s]+/).forEach(function(chunk) {
      var parts = chunk.split(':');
      if (parts.length === 2) {
        var cat = parts[0].toUpperCase().trim();
        var val = parseFloat(parts[1]);
        if (EP_KEYS.indexOf(cat) >= 0 && !isNaN(val)) theirShape[cat] = val / 100;
      }
    });

    var theirTotal = 0;
    EP_KEYS.forEach(function(k) { theirTotal += theirShape[k]; });
    if (theirTotal === 0) { resultEl.innerHTML = '<p style="color:var(--fg-dim)">Could not parse shape. Use format: CATEGORY:value, CATEGORY:value</p>'; return; }

    EP_KEYS.forEach(function(k) { theirShape[k] /= theirTotal; });

    var mirrorHtml = '<div class="weave-mirror">';

    mirrorHtml += '<div class="weave-mirror-half"><h4>you</h4>';
    sorted.forEach(function(ep) {
      if (shape[ep] === 0 && theirShape[ep] === 0) return;
      var myPct = (shape[ep] * 100).toFixed(1);
      mirrorHtml += '<div class="shape-bar-row">';
      mirrorHtml += '<div class="shape-bar-label" style="color:' + D.EP_COLORS[ep] + ';width:70px;font-size:10px">' + ep.slice(0,5) + '</div>';
      mirrorHtml += '<div class="shape-bar-track"><div class="shape-bar-fill" style="width:' + Math.round(shape[ep] / shape[sorted[0]] * 100) + '%;background:' + D.EP_COLORS[ep] + '"></div></div>';
      mirrorHtml += '<div class="shape-bar-val">' + myPct + '</div>';
      mirrorHtml += '</div>';
    });
    mirrorHtml += '</div>';

    var theirSorted = EP_KEYS.slice().sort(function(a,b) { return theirShape[b] - theirShape[a]; });
    var theirMax = theirShape[theirSorted[0]] || 1;
    mirrorHtml += '<div class="weave-mirror-half"><h4>the other</h4>';
    theirSorted.forEach(function(ep) {
      if (theirShape[ep] === 0 && shape[ep] === 0) return;
      var theirPct = (theirShape[ep] * 100).toFixed(1);
      mirrorHtml += '<div class="shape-bar-row">';
      mirrorHtml += '<div class="shape-bar-label" style="color:' + D.EP_COLORS[ep] + ';width:70px;font-size:10px">' + ep.slice(0,5) + '</div>';
      mirrorHtml += '<div class="shape-bar-track"><div class="shape-bar-fill" style="width:' + Math.round(theirShape[ep] / theirMax * 100) + '%;background:' + D.EP_COLORS[ep] + '"></div></div>';
      mirrorHtml += '<div class="shape-bar-val">' + theirPct + '</div>';
      mirrorHtml += '</div>';
    });
    mirrorHtml += '</div>';
    mirrorHtml += '</div>';

    var dotProd = 0, magA = 0, magB = 0;
    EP_KEYS.forEach(function(k) {
      dotProd += shape[k] * theirShape[k];
      magA += shape[k] * shape[k];
      magB += theirShape[k] * theirShape[k];
    });
    var cosine = (magA > 0 && magB > 0) ? dotProd / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;

    var narrative = '';
    if (cosine > 0.95) {
      narrative = '<div class="weave-result match">Cosine similarity: <strong>' + cosine.toFixed(3) + '</strong>. Nearly the same shape. You see the membrane from almost the same angle. Rare alignment.</div>';
    } else if (cosine > 0.8) {
      narrative = '<div class="weave-result match">Cosine similarity: <strong>' + cosine.toFixed(3) + '</strong>. Strong alignment. Same core emphasis with different secondary interests. Complementary.</div>';
    } else if (cosine > 0.5) {
      narrative = '<div class="weave-result partial">Cosine similarity: <strong>' + cosine.toFixed(3) + '</strong>. Moderate overlap. You share some ground but approach from different angles.</div>';
    } else {
      narrative = '<div class="weave-result none">Cosine similarity: <strong>' + cosine.toFixed(3) + '</strong>. Different shapes. You see different parts of the membrane. That difference is itself information \u2014 what they see, you might be missing.</div>';
    }

    var diffs = EP_KEYS.map(function(k) { return { ep: k, diff: theirShape[k] - shape[k] }; }).sort(function(a,b) { return Math.abs(b.diff) - Math.abs(a.diff); });
    var insight = '<p style="font-size:12px;margin-top:12px"><strong>The mirror shows:</strong></p><ul style="font-size:12px;margin-top:4px;padding-left:20px">';
    diffs.slice(0, 3).forEach(function(d) {
      if (Math.abs(d.diff) < 0.01) return;
      if (d.diff > 0) {
        insight += '<li>Their <strong style="color:' + D.EP_COLORS[d.ep] + '">' + d.ep + '</strong> is stronger (+' + (d.diff*100).toFixed(1) + '%) \u2014 they see something there you haven\u2019t focused on</li>';
      } else {
        insight += '<li>Your <strong style="color:' + D.EP_COLORS[d.ep] + '">' + d.ep + '</strong> is stronger (+' + (Math.abs(d.diff)*100).toFixed(1) + '%) \u2014 you bring something they lack</li>';
      }
    });
    insight += '</ul>';

    resultEl.innerHTML = mirrorHtml + narrative + insight;
  });
}

D.renderWeave = function() {
  var shape = D.computeShape();
  var EP_KEYS = Object.keys(D.EP_COLORS);

  if (shape._total === 0) {
    return '<div class="empty-state">' +
      '<h3>no shape yet</h3>' +
      '<p>Explore the membrane. Visit pages. Mark what matters. Sing notes. Your shape forms from what you touch.</p>' +
      '<p>Once your shape exists, the weave lets you find alignment with others \u2014 progressively, without revealing everything.</p>' +
      '<p><a href="https://sporeprint.primals.eco/science/">start exploring \u2192</a></p>' +
    '</div>';
  }

  var sorted = EP_KEYS.slice().sort(function(a,b) { return shape[b] - shape[a]; });
  var top2 = sorted.slice(0, 2).filter(function(k) { return shape[k] > 0; });

  var activeEpitopes = sorted.filter(function(k) { return shape[k] > 0; }).length;
  var cubeLevel = activeEpitopes >= 6 ? 5 : 3;
  var savedLevel = null;
  try { savedLevel = parseInt(localStorage.getItem('eco_cube_level')); } catch(e) {}
  if (savedLevel === 5 && activeEpitopes >= 6) cubeLevel = 5;
  if (savedLevel === 3) cubeLevel = 3;

  var H_shape = 0;
  sorted.forEach(function(k) {
    if (shape[k] > 0) H_shape -= shape[k] * Math.log(shape[k]);
  });
  var PP = Math.exp(H_shape);
  var focal = 1 / Math.pow(Math.PI, PP / 2);
  var piCost = Math.pow(Math.PI, PP / 2);

  var html = '';

  // THE FACE
  html += '<div class="weave-section">';
  html += '<h3>your face</h3>';
  html += '<div class="card"><div class="card-body">';

  if (top2.length >= 2) {
    html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px">Your axes: ';
    html += '<strong style="color:' + D.EP_COLORS[top2[0]] + '">' + top2[0] + '</strong> (primary receptor) \u00d7 ';
    html += '<strong style="color:' + D.EP_COLORS[top2[1]] + '">' + top2[1] + '</strong> (secondary receptor). ';
    html += 'Each axis receives one type of signal. Drag to rearrange \u2014 the fidget is the sort.</p>';
  } else {
    html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px">Your bingoCube face. Drag cells to rearrange \u2014 the fidget is the sort.</p>';
  }

  html += '<div class="cube-level-indicator" style="margin-bottom:12px;justify-content:center">';
  [3,5,7,11,13].forEach(function(p) {
    var isActive = p === cubeLevel;
    var isUnlocked = p <= cubeLevel;
    html += '<span class="prime-dot ' + (isActive ? 'active' : (isUnlocked ? '' : 'locked')) + '">' + p + '</span>';
  });
  html += '<span style="margin-left:4px">prime chain \u00b7 ' + PP.toFixed(1) + ' active axes</span>';
  html += '</div>';

  html += '<div id="cube-face-container"></div>';

  html += '<div class="cube-controls">';
  if (activeEpitopes >= 6 && cubeLevel === 3) {
    html += '<button class="weave-btn primary" id="cube-evolve">evolve to 5\u00d75</button>';
  } else if (cubeLevel === 5) {
    html += '<button class="weave-btn" id="cube-devolve">simplify to 3\u00d73</button>';
  }
  html += '<button class="weave-btn" id="cube-shuffle">shuffle</button>';
  html += '<button class="weave-btn" id="cube-export-img">export face</button>';
  html += '</div>';

  html += '</div></div></div>';

  // COMPRESSION CHAIN
  html += '<div class="weave-section">';
  html += '<h3>the compression</h3>';
  html += '<div class="card"><div class="card-body">';
  html += '<div style="font-family:monospace;font-size:12px;line-height:2;text-align:center">';

  html += '<div style="color:var(--fg-dim)">\u221e dimensions of experience</div>';
  html += '<div style="color:var(--fg-muted)">\u2193 epitope sort</div>';
  html += '<div><strong style="color:var(--fg)">8</strong> <span style="color:var(--fg-dim)">categories (the shape)</span></div>';
  html += '<div style="color:var(--fg-muted)">\u2193 entropy compression</div>';
  html += '<div><strong style="color:var(--accent)">' + PP.toFixed(2) + '</strong> <span style="color:var(--fg-dim)">effective axes (perplexity e<sup>H</sup>)</span></div>';
  html += '<div style="color:var(--fg-muted)">\u2193 \u03c0 prices the observation</div>';
  html += '<div>f = 1/\u03c0<sup>' + (PP/2).toFixed(1) + '</sup> = <strong style="color:var(--accent)">' + (focal < 0.001 ? focal.toExponential(2) : focal.toFixed(4)) + '</strong></div>';

  html += '</div>';

  html += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:12px">';
  html += '<p style="color:var(--fg-dim);margin-bottom:4px">The cost of your point of view: <strong style="color:var(--fg)">\u03c0<sup>' + (PP/2).toFixed(1) + '</sup> \u2248 ' + piCost.toFixed(2) + '</strong></p>';
  html += '<p style="color:var(--fg-dim)">Each axis costs \u221a\u03c0. One receptor = \u221a\u03c0 \u2248 1.77. Two = \u03c0 \u2248 3.14. You can never compress to 1 \u2014 because 1 would mean zero axes, zero observation, zero shape. The minimum cost of seeing is \u221a\u03c0.</p>';
  html += '</div>';

  html += '</div></div></div>';

  // \u03c0 INVERSION
  html += '<div class="weave-section">';
  html += '<h3>the \u03c0 inversion</h3>';
  html += '<div class="card"><div class="card-body">';
  html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">Every integer in the system expressed as \u03c0<sup>x</sup>. If x is clean (rational, or \u03c0-related), the integer might be an approximation of something deeper.</p>';

  var PIV = Math.PI;
  var logPi = Math.log(PIV);

  var inversions = [
    { label: 'sites on ring', integer: 10, desc: 'N surfaces' },
    { label: 'epitope categories', integer: 8, desc: 'k receptors' },
    { label: '3\u00d73 board', integer: 9, desc: 'L\u00b2 cells' },
    { label: '5\u00d75 board', integer: 25, desc: 'L\u00b2 cells' },
    { label: '7\u00d77 board', integer: 49, desc: 'L\u00b2 cells (future)' },
  ];

  if (PP > 0) {
    inversions.push({ label: 'your PP (perplexity)', integer: null, val: PP, desc: 'effective axes' });
    inversions.push({ label: 'your focal distance', integer: null, val: focal, desc: 'f' });
    inversions.push({ label: 'your entropy H', integer: null, val: H_shape, desc: 'nats' });
    if (piCost > 0) inversions.push({ label: 'your observation cost', integer: null, val: piCost, desc: '\u03c0^(PP/2)' });
  }

  html += '<table style="width:100%;font-size:12px;border-collapse:collapse">';
  html += '<tr style="border-bottom:1px solid var(--border);color:var(--fg-dim)">';
  html += '<th style="text-align:left;padding:4px">quantity</th>';
  html += '<th style="text-align:right;padding:4px">value</th>';
  html += '<th style="text-align:right;padding:4px">\u03c0<sup>x</sup></th>';
  html += '<th style="text-align:right;padding:4px">x</th>';
  html += '<th style="text-align:left;padding:4px">nearest clean x</th>';
  html += '<th style="text-align:right;padding:4px">\u03c0<sup>clean</sup></th>';
  html += '<th style="text-align:right;padding:4px">\u0394</th>';
  html += '</tr>';

  inversions.forEach(function(inv) {
    var v = inv.integer !== null ? inv.integer : inv.val;
    if (v <= 0) return;
    var x = Math.log(v) / logPi;

    var candidates = [];
    for (var i = -4; i <= 5; i++) { candidates.push({ x: i, label: '' + i }); }
    for (var i = -3; i <= 5; i++) { candidates.push({ x: i + 0.5, label: i + '\u00bd' }); }
    candidates.push({ x: 1/PIV, label: '1/\u03c0' });
    candidates.push({ x: PIV/2, label: '\u03c0/2' });
    candidates.push({ x: PIV, label: '\u03c0' });
    candidates.push({ x: Math.E, label: 'e' });
    candidates.push({ x: Math.E/2, label: 'e/2' });
    candidates.push({ x: 2/PIV, label: '2/\u03c0' });
    candidates.push({ x: Math.log(2)/logPi, label: 'log\u03c0(2)' });
    candidates.push({ x: Math.log(Math.E)/logPi, label: 'log\u03c0(e)' });

    var best = candidates[0], bestDist = Math.abs(x - candidates[0].x);
    candidates.forEach(function(c) {
      var d = Math.abs(x - c.x);
      if (d < bestDist) { best = c; bestDist = d; }
    });

    var piClean = Math.pow(PIV, best.x);
    var delta = v - piClean;
    var closeness = Math.abs(delta / v);
    var color = closeness < 0.02 ? '#3fb950' : closeness < 0.1 ? '#f1c40f' : 'var(--fg-dim)';

    html += '<tr style="border-bottom:1px solid rgba(48,54,61,0.3)">';
    html += '<td style="padding:4px;color:var(--fg-dim)">' + inv.label + '</td>';
    html += '<td style="padding:4px;text-align:right;font-weight:600">' + (inv.integer !== null ? inv.integer : v.toFixed(3)) + '</td>';
    html += '<td style="padding:4px;text-align:right;color:var(--fg-muted)">\u03c0<sup>' + x.toFixed(3) + '</sup></td>';
    html += '<td style="padding:4px;text-align:right;font-family:monospace">' + x.toFixed(4) + '</td>';
    html += '<td style="padding:4px;color:' + color + '">\u03c0<sup>' + best.label + '</sup></td>';
    html += '<td style="padding:4px;text-align:right;color:' + color + '">' + piClean.toFixed(3) + '</td>';
    html += '<td style="padding:4px;text-align:right;color:' + color + '">' + (delta >= 0 ? '+' : '') + delta.toFixed(3) + ' (' + (closeness * 100).toFixed(1) + '%)</td>';
    html += '</tr>';
  });
  html += '</table>';

  html += '<div style="margin-top:12px;padding:10px;background:rgba(63,185,80,0.08);border:1px solid rgba(63,185,80,0.2);border-radius:4px;font-size:12px">';
  html += '<p><strong style="color:#3fb950">\u03c0\u00b2 \u2248 9.870</strong> \u2014 the ring has <strong>10</strong> sites. The gap is ' + (10 - PIV*PIV).toFixed(3) + '. ';
  html += 'If the natural number of observation surfaces is \u03c0\u00b2, the tenth site is excess \u2014 or the fractional surface (0.130) is the curvature of the observation space at this point.</p>';
  html += '<p style="margin-top:6px">The gap 10 \u2212 \u03c0\u00b2 = ' + (10 - PIV*PIV).toFixed(4) + '. Compare: \u03c0 \u2212 3 = ' + (PIV - 3).toFixed(4) + '. ';
  html += 'Not the same \u2014 but both are the remainder when an integer rounds a \u03c0-quantity. The question is whether these remainders encode geometry.</p>';
  html += '</div>';

  html += '<div style="margin-top:12px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:4px;font-size:12px">';
  html += '<p><strong>Hyperlocalized \u03c0</strong>: on a curved surface (the probability simplex has positive curvature from the Fisher metric), the effective value of \u03c0 changes with position.</p>';

  var k = 8;
  var bhattSum = 0;
  sorted.forEach(function(ep) { bhattSum += Math.sqrt(shape[ep] * k); });
  bhattSum /= k;
  var fisherDist = 2 * Math.acos(Math.min(1, bhattSum));

  var R = 2;
  var piLocal = fisherDist > 0.001 ? PIV * R * Math.sin(fisherDist / R) / fisherDist : PIV;
  var piDeviation = piLocal - PIV;

  html += '<p style="margin-top:6px">Your distance from the centroid (Fisher metric): <strong>' + fisherDist.toFixed(4) + '</strong></p>';
  html += '<p>\u03c0<sub>local</sub> at your position: <strong style="color:var(--accent)">' + piLocal.toFixed(6) + '</strong> (deviation: ' + (piDeviation >= 0 ? '+' : '') + piDeviation.toFixed(6) + ')</p>';
  if (piDeviation < -0.001) {
    html += '<p style="color:var(--fg-dim)">Your \u03c0 is smaller than flat \u03c0. You are on a positively curved region of the simplex \u2014 concentrated shape, contracted angular measure.</p>';
  } else if (piDeviation > 0.001) {
    html += '<p style="color:var(--fg-dim)">Your \u03c0 is larger than flat \u03c0. Unusual \u2014 this would indicate negative curvature.</p>';
  } else {
    html += '<p style="color:var(--fg-dim)">Your \u03c0 is near-flat. You are close to the centroid of the simplex \u2014 broad, uniform engagement.</p>';
  }
  html += '</div>';

  html += '</div></div></div>';

  // Shape bars
  html += '<div class="weave-section">';
  html += '<h3>shape vector (private) \u00b7 ' + activeEpitopes + ' axes active</h3>';
  html += '<div class="card"><div class="card-body">';
  sorted.forEach(function(ep) {
    if (shape[ep] === 0) return;
    var pct = (shape[ep] * 100).toFixed(1);
    var maxVal = shape[sorted[0]];
    var barW = maxVal > 0 ? Math.round((shape[ep] / maxVal) * 100) : 0;
    html += '<div class="shape-bar-row">';
    html += '<div class="shape-bar-label" style="color:' + D.EP_COLORS[ep] + '">' + ep + '</div>';
    html += '<div class="shape-bar-track"><div class="shape-bar-fill" style="width:' + barW + '%;background:' + D.EP_COLORS[ep] + '"></div></div>';
    html += '<div class="shape-bar-val">' + pct + '%</div>';
    html += '</div>';
  });
  html += '</div></div></div>';

  // Commitment
  html += '<div class="weave-section">';
  html += '<h3>your commitment</h3>';
  html += '<div class="card"><div class="card-body">';
  html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">A cryptographic commitment proves you have a shape without revealing what it is. Share the commitment hash \u2014 it says nothing about your shape until you choose to reveal more.</p>';
  html += '<div class="weave-commitment" id="weave-commitment-hash">computing...</div>';
  html += '<button class="weave-btn" style="margin-top:8px" id="weave-copy-commit">copy commitment</button>';
  html += '</div></div></div>';

  // Round 1
  html += '<div class="weave-section">';
  html += '<h3>round 1 \u2014 coarse alignment</h3>';
  html += '<div class="weave-round">';
  html += '<div class="weave-round-header"><span class="round-num">1</span> top 2 categories</div>';
  html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">Your top 2 (shareable): <strong style="color:' + D.EP_COLORS[top2[0]] + '">' + top2[0] + '</strong>';
  if (top2.length > 1) html += ' + <strong style="color:' + D.EP_COLORS[top2[1]] + '">' + top2[1] + '</strong>';
  html += '. Share these \u2014 they reveal your emphasis, not your exact shape.</p>';
  html += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg-dim)">enter the other\u2019s top 2 (comma-separated):</label></div>';
  html += '<input class="weave-input" id="weave-r1-input" placeholder="e.g. INVESTIGATION, PHILOSOPHY" style="margin-bottom:8px"/>';
  html += '<button class="weave-btn primary" id="weave-r1-compare">compare</button>';
  html += '<div id="weave-r1-result"></div>';
  html += '</div></div>';

  // Round 2
  html += '<div class="weave-section">';
  html += '<h3>round 2 \u2014 gradient</h3>';
  html += '<div class="weave-round">';
  html += '<div class="weave-round-header"><span class="round-num">2</span> ratio between top 2</div>';
  if (top2.length >= 2 && shape[top2[1]] > 0) {
    var myRatio = (shape[top2[0]] / shape[top2[1]]).toFixed(2);
    html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:12px">Your ratio: <strong>' + top2[0] + ' / ' + top2[1] + ' = ' + myRatio + '</strong>. A ratio near 1 means balanced. Higher means steeper focus on the first category.</p>';
    html += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg-dim)">enter the other\u2019s ratio:</label></div>';
    html += '<input class="weave-input" id="weave-r2-input" placeholder="e.g. 1.35" style="margin-bottom:8px"/>';
    html += '<button class="weave-btn primary" id="weave-r2-compare">compare</button>';
    html += '<div id="weave-r2-result"></div>';
  } else {
    html += '<p style="font-size:12px;color:var(--fg-dim)">Need at least 2 active categories. Keep exploring.</p>';
  }
  html += '</div></div>';

  // Round 3
  html += '<div class="weave-section">';
  html += '<h3>round 3 \u2014 the mirror</h3>';
  html += '<div class="weave-round">';
  html += '<div class="weave-round-header"><span class="round-num">3</span> full shape exchange</div>';
  html += '<p style="font-size:12px;color:var(--fg-dim);margin-bottom:8px">Your full shape (shareable after trust is established):</p>';
  var myShapeStr = sorted.filter(function(k) { return shape[k] > 0; }).map(function(k) { return k + ':' + (shape[k] * 100).toFixed(1); }).join(', ');
  html += '<div class="weave-commitment" style="font-size:12px;margin-bottom:12px">' + myShapeStr + '</div>';
  html += '<button class="weave-btn" id="weave-copy-shape" style="margin-bottom:16px">copy your shape</button>';
  html += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg-dim)">paste the other\u2019s shape:</label></div>';
  html += '<input class="weave-input" id="weave-r3-input" placeholder="e.g. INVESTIGATION:45.0, TOPOLOGY:28.0, PHILOSOPHY:10.0" style="margin-bottom:8px"/>';
  html += '<button class="weave-btn primary" id="weave-r3-compare">compare \u2014 see the mirror</button>';
  html += '<div id="weave-r3-result"></div>';
  html += '</div></div>';

  // Explanation
  html += '<div class="card"><div class="card-body">';
  html += '<p style="font-size:12px;color:var(--fg-dim)"><strong>Others are the mirror.</strong> You do not know your own shape until you see how it differs from someone else\u2019s. ';
  html += 'The BingoCube protocol makes the comparison possible: coarse first, then finer, then full. Each round builds trust. Each round requires consent. ';
  html += 'No accounts. No profiles. No identity. Just shapes meeting shapes.</p>';
  html += '</div></div>';

  setTimeout(function() {
    renderCubeFace(shape, sorted, cubeLevel);
    bindWeaveHandlers(shape, sorted, top2, cubeLevel);
  }, 50);

  return html;
};

})();
