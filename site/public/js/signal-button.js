// signal-button.js — THE BUTTON entropy collection + doorbell ring + sovereign identity
// Wave 178: wired through chipmunk/note (port 9761) → sovereign identity flow
// Reusable: any primals.eco site with the nft-section HTML structure
(function(){
  // Live contribution counter — try multiple sources
  var countEl=document.getElementById('nft-count-display');
  if(countEl){
    fetch('/chipmunk.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
      if(d.fermentations>0) countEl.textContent=d.fermentations;
      else if(d.human_count>0) countEl.textContent=d.human_count;
    }).catch(function(){});
  }
  var btn=document.getElementById('nft-btn');
  if(!btn)return;
  var fill=document.getElementById('nft-fill'),
      counter=document.getElementById('nft-counter'),
      result=document.getElementById('nft-result'),
      receipt=document.getElementById('nft-receipt'),
      nameInput=document.getElementById('nft-name'),
      events=[], startTime=Date.now(), needed=30, pressed=false;

  function addEvent(t,v){
    if(pressed)return;
    events.push({t:t,v:v,ts:Date.now()-startTime});
    var pct=Math.min(100, events.length/needed*100);
    fill.style.width=pct+'%';
    counter.textContent=events.length+' entropy events';
    if(events.length>=needed && !btn.disabled) return;
    if(events.length>=needed){
      btn.disabled=false;
      btn.style.background='#cc0000';
      btn.style.borderColor='#ff3333';
      btn.style.color='#fff';
      btn.style.cursor='pointer';
      btn.innerHTML='PRESS<br>THE<br>BUTTON';
      btn.onmouseenter=function(){btn.style.background='#ff0000';btn.style.boxShadow='0 0 60px rgba(255,0,0,0.5)';btn.style.transform='scale(1.05)';};
      btn.onmouseleave=function(){btn.style.background='#cc0000';btn.style.boxShadow='none';btn.style.transform='';};
    }
  }

  document.addEventListener('mousemove',function(e){addEvent('m',e.clientX^e.clientY);});
  document.addEventListener('keydown',function(e){addEvent('k',e.keyCode||0);});
  document.addEventListener('scroll',function(){addEvent('s',window.scrollY);});

  // Generate fermentation hash from entropy
  function fermentHash(entropy) {
    var h = 0x811c9dc5;
    for (var i = 0; i < entropy.length; i++) {
      h ^= entropy.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return ((h >>> 0).toString(16)).padStart(8, '0');
  }

  // Generate the fermentation transcript locally (P, not NP)
  function generateTranscript(name, entropyStr, hash) {
    var ts = new Date().toISOString();
    var lines = [
      '// ═══════════════════════════════════════════════════════════',
      '// NOVEL FERMENTATION TRANSCRIPT',
      '// ═══════════════════════════════════════════════════════════',
      '//',
      '// artisan:    ' + name,
      '// hash:       ferment_' + hash + '()',
      '// entropy:    ' + events.length + ' events in ' + Math.round((Date.now()-startTime)/1000) + 's',
      '// timestamp:  ' + ts,
      '// source:     ' + window.location.hostname,
      '// wave:       178',
      '//',
      '// This function exists once. It has never existed before.',
      '// It will never exist again. Your entropy made it real.',
      '// ═══════════════════════════════════════════════════════════',
      '',
      '/// Novel fermentation — one of one.',
      '/// Entropy source: ' + events.length + ' human interaction events.',
      '/// The fleet generates 13 requests/second.',
      '/// You generated one receipt that matters more than all of them.',
      'pub fn ferment_' + hash + '() -> &\'static str {',
      '    // Shannon entropy of your movements: irreducible',
      '    let seed: [u8; 8] = [' + hash.match(/.{2}/g).map(function(h){return '0x'+h;}).join(', ') + '];',
      '    let artisan = "' + name.replace(/"/g, '\\"') + '";',
      '    let ts = "' + ts + '";',
      '',
      '    // The fermentation: your entropy × time × identity',
      '    // P ≠ NP. You are in P. The fleet is not.',
      '    "ferment_' + hash + '"',
      '}',
      '',
      '// ── PROVENANCE ──',
      '// doorbell:  chipmunk heard you ring',
      '// membrane:  ' + window.location.hostname,
      '// identity:  ' + (localStorage.getItem('membrane-pubkey') || 'sovereign identity available at /identity'),
      '',
      '// 🛡️ claim your sovereign identity: ' + window.location.origin + '/identity',
      '// 🍌 you proved you\'re not a banana. the next step is yours.',
    ];
    return lines.join('\n');
  }

  btn.addEventListener('click',function(){
    if(btn.disabled||pressed)return;
    pressed=true;
    btn.style.background='#663300';
    btn.style.borderColor='#884400';
    btn.style.color='#ffaa00';
    btn.style.cursor='wait';
    btn.innerHTML='fermenting...';

    var name = (nameInput&&nameInput.value.trim())||'anonymous artisan';
    var entropyStr = events.map(function(e){return e.v;}).join(',');
    var hash = fermentHash(entropyStr + name + Date.now());
    var transcript = generateTranscript(name, entropyStr, hash);

    // Ring the doorbell — chipmunk hears you
    // gate-msg format: {body, from, to} on /api/gate-msg (port 9761)
    var doorbellPayload = JSON.stringify({
      body: 'THE BUTTON — ferment_' + hash + '() — ' + name + ' — ' + events.length + ' entropy events in ' + Math.round((Date.now()-startTime)/1000) + 's',
      from: 'signal-button:' + hash,
      to: 'chipmunk'
    });

    // Try doorbell on current domain first, then water, then signal
    var doorbellUrls = [
      '/api/gate-msg',
      'https://water.primals.eco/api/gate-msg',
      'https://signal.primals.eco/api/gate-msg'
    ];

    var doorbellSent = false;
    function tryDoorbell(i) {
      if (i >= doorbellUrls.length) return;
      fetch(doorbellUrls[i], {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: doorbellPayload
      }).then(function(r) {
        if (r.ok || r.status === 200 || r.status === 201) doorbellSent = true;
      }).catch(function(){}).finally(function() {
        if (!doorbellSent) tryDoorbell(i + 1);
      });
    }
    tryDoorbell(0);

    // Show transcript immediately (generated locally — P, not NP)
    receipt.textContent = transcript;
    result.style.display = 'block';
    btn.innerHTML = '✓';
    btn.style.background = '#1a4a1a';
    btn.style.borderColor = '#3fb950';
    btn.style.color = '#3fb950';

    // Add sovereign identity link
    var idLink = document.createElement('div');
    idLink.style.cssText = 'margin-top:1em;padding:1em;background:#0a1a0a;border:1px solid #3fb950;border-radius:6px;text-align:center';
    idLink.innerHTML = '<p style="color:#3fb950;font-size:1em;margin:0 0 .5em">🛡️ You proved you\'re human.</p>'
      + '<p style="color:#888;font-size:.85em;margin:0 0 .8em">The chipmunk heard you ring the doorbell. Your entropy is real.</p>'
      + '<a href="https://water.primals.eco/identity" style="color:#FFE135;font-size:1.1em;font-weight:bold;text-decoration:none">claim your sovereign identity →</a>'
      + '<p style="color:#555;font-size:.75em;margin:.5em 0 0">no email · no password · just a keypair and a handshake</p>';
    result.appendChild(idLink);

    // Store fermentation locally
    localStorage.setItem('ferment-hash', hash);
    localStorage.setItem('ferment-name', name);
    localStorage.setItem('ferment-ts', new Date().toISOString());

    // PROTON PULSE — the fermentation has mass
    if (typeof window.__addProtonMass === 'function') {
      var mass = window.__addProtonMass(hash, events.length, Date.now()-startTime);
      var massEl = document.createElement('p');
      massEl.style.cssText = 'color:#58a6ff;font-size:.8em;margin-top:.5em';
      massEl.textContent = '⚛ proton mass: ' + mass.total_events + ' entropy events across '
        + mass.fermentations + ' fermentation' + (mass.fermentations !== 1 ? 's' : '');
      result.appendChild(massEl);
    }
  });
})();
