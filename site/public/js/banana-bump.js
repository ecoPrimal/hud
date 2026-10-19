/*
 * banana-bump.js — the irrational remainder of pi bumps you by accident
 *
 * Not a landing page. Not a survey. You were wandering inside the HUD
 * and something bumped you. "oh hey, sorry. quick question —"
 *
 * If you don't answer: you're a stone. stones don't answer questions.
 * If you answer: you rang the doorbell. the membrane sees you.
 */
(function() {
  'use strict';

  var BUMP_KEY = 'banana-bump-v1';
  var bumped = localStorage.getItem(BUMP_KEY);
  if (bumped) return; // only bump once

  // Wait for the irrational remainder... pi seconds ≈ 3141ms
  // Not exactly pi. The remainder. The bit that doesn't fit.
  var delay = Math.floor(Math.PI * 1000) + Math.floor(Math.random() * 1414);

  setTimeout(function() {
    // Don't bump if they're actively typing or in a panel
    var active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      // try again in a bit
      setTimeout(arguments.callee, 5000);
      return;
    }

    showBump();
  }, delay);

  function showBump() {
    var overlay = document.createElement('div');
    overlay.id = 'banana-bump';
    overlay.innerHTML = [
      '<div class="bb-card">',
      '  <div class="bb-bump">oh — hey. sorry, bumped you.</div>',
      '  <div class="bb-question">🍌 are you a banana?</div>',
      '  <div class="bb-sub">( i\'m not. )</div>',
      '  <div class="bb-choices">',
      '    <button onclick="window._bananaBump(\'yes\')">🍌 yes</button>',
      '    <button onclick="window._bananaBump(\'no\')">🙅 no</button>',
      '    <button onclick="window._bananaBump(\'unsure\')">🤔 unsure</button>',
      '  </div>',
      '  <div class="bb-timer" id="bb-timer"></div>',
      '</div>',
    ].join('\n');

    var style = document.createElement('style');
    style.textContent = [
      '#banana-bump {',
      '  position: fixed; bottom: 80px; right: 20px; z-index: 9999;',
      '  animation: bb-slide-in 0.4s ease-out;',
      '  font-family: "SF Mono", "Fira Code", monospace;',
      '}',
      '@keyframes bb-slide-in {',
      '  from { transform: translateX(120%); opacity: 0; }',
      '  to { transform: translateX(0); opacity: 1; }',
      '}',
      '@keyframes bb-slide-out {',
      '  from { transform: translateX(0); opacity: 1; }',
      '  to { transform: translateX(120%); opacity: 0; }',
      '}',
      '@keyframes bb-shake {',
      '  0%,100% { transform: translateX(0); }',
      '  25% { transform: translateX(-4px); }',
      '  75% { transform: translateX(4px); }',
      '}',
      '.bb-card {',
      '  background: rgba(13,17,23,0.95); backdrop-filter: blur(8px);',
      '  border: 1px solid rgba(255,225,53,0.3); border-radius: 12px;',
      '  padding: 16px 20px; max-width: 280px;',
      '  box-shadow: 0 8px 32px rgba(0,0,0,0.4);',
      '}',
      '.bb-bump {',
      '  color: #8b949e; font-size: 11px; margin-bottom: 8px;',
      '}',
      '.bb-question {',
      '  color: #FFE135; font-size: 16px; font-weight: bold; margin-bottom: 4px;',
      '}',
      '.bb-sub {',
      '  color: #6e7681; font-size: 11px; margin-bottom: 12px;',
      '}',
      '.bb-choices {',
      '  display: flex; gap: 8px;',
      '}',
      '.bb-choices button {',
      '  background: rgba(22,27,34,0.9); border: 1px solid #30363d;',
      '  color: #e6edf3; padding: 6px 14px; border-radius: 6px;',
      '  cursor: pointer; font-family: inherit; font-size: 12px;',
      '  transition: all 0.15s;',
      '}',
      '.bb-choices button:hover {',
      '  border-color: #FFE135; background: rgba(255,225,53,0.1);',
      '}',
      '.bb-timer {',
      '  color: #484f58; font-size: 9px; margin-top: 8px; text-align: right;',
      '}',
      '.bb-followup {',
      '  margin-top: 12px; padding-top: 10px; border-top: 1px solid #21262d;',
      '}',
      '.bb-followup .q { color: #a371f7; font-size: 12px; margin-bottom: 8px; }',
      '.bb-followup .bb-choices { margin-top: 6px; }',
      '.bb-result {',
      '  margin-top: 10px; color: #3fb950; font-size: 11px; line-height: 1.5;',
      '}',
      '.bb-stone {',
      '  color: #6e7681; font-style: italic;',
      '}',
      '.bb-link {',
      '  display: inline-block; margin-top: 8px; color: #58a6ff;',
      '  text-decoration: none; font-size: 11px;',
      '}',
      '.bb-link:hover { text-decoration: underline; }',
    ].join('\n');

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Stone timer — if no answer in ~12 seconds, chipmunk bumps you
    var stoneTimer = setTimeout(function() { stoneBump(); }, 12000);

    // Frustration shake at 8 seconds
    var shakeTimer = setTimeout(function() {
      var card = overlay.querySelector('.bb-card');
      if (card) card.style.animation = 'bb-shake 0.3s ease 3';
      var timer = document.getElementById('bb-timer');
      if (timer) timer.textContent = '🐿️ ...hello?';
    }, 8000);

    function stoneBump() {
      // They didn't answer. They're a stone.
      var card = overlay.querySelector('.bb-card');
      if (!card) return;

      localStorage.setItem(BUMP_KEY, 'stone');

      card.innerHTML = [
        '<div class="bb-bump">🐿️ *bumps you again*</div>',
        '<div class="bb-stone">you didn\'t answer.</div>',
        '<div class="bb-stone">that\'s ok. stones don\'t.</div>',
        '<div class="bb-stone" style="margin-top:6px">',
        '  classified: 🪨 <span style="color:#8b949e">mineral</span>',
        '</div>',
        '<div style="color:#484f58;font-size:9px;margin-top:8px">',
        '  (if you\'re not a stone, there\'s always ',
        '  <a href="/banana.html" style="color:#FFE135">the banana</a>)',
        '</div>',
      ].join('\n');

      sendNote('stone', { answer: 'none', classified_as: 'mineral' });

      setTimeout(function() {
        overlay.style.animation = 'bb-slide-out 0.5s ease-in forwards';
        setTimeout(function() { overlay.remove(); }, 600);
      }, 5000);
    }

    // The answer sequence
    var answers = {};
    var questionIndex = 0;

    var followups = [
      {
        q: '🍌 banana for scale?',
        sub: 'we showed you ours — slime mold, 15.8% maturity, 9 organs.',
        opts: [
          { text: '📏 show me', val: 'show' },
          { text: '🤷 nah', val: 'nah' },
        ]
      },
      {
        q: 'one more — do you know what a chipmunk is?',
        sub: '',
        opts: [
          { text: '🐿️ yes', val: 'yes' },
          { text: '❓ no', val: 'no' },
          { text: '🤔 maybe', val: 'maybe' },
        ]
      },
    ];

    window._bananaBump = function(val) {
      clearTimeout(stoneTimer);
      clearTimeout(shakeTimer);
      answers.banana = val;
      localStorage.setItem(BUMP_KEY, val);

      // Record the doorbell ring
      sendNote('banana', { answer: val });

      // Show next question or result
      showFollowup(0);
    };

    function showFollowup(idx) {
      if (idx >= followups.length) {
        showResult();
        return;
      }

      var fu = followups[idx];
      var card = overlay.querySelector('.bb-card');
      if (!card) return;

      // Check if "show me" was picked — redirect to banana page
      if (idx === 0 && answers['banana_for_scale'] === undefined) {
        // This is the banana for scale question
      }

      var choicesHtml = fu.opts.map(function(o) {
        return '<button onclick="window._bananaContinue(\'' + o.val + '\')">' + o.text + '</button>';
      }).join('');

      var followupDiv = document.createElement('div');
      followupDiv.className = 'bb-followup';
      followupDiv.innerHTML = [
        '<div class="q">' + fu.q + '</div>',
        fu.sub ? '<div class="bb-sub">' + fu.sub + '</div>' : '',
        '<div class="bb-choices">' + choicesHtml + '</div>',
      ].join('');

      // Remove old followups
      var old = card.querySelector('.bb-followup');
      if (old) old.remove();
      var oldResult = card.querySelector('.bb-result');
      if (oldResult) oldResult.remove();

      card.appendChild(followupDiv);
      questionIndex = idx;

      window._bananaContinue = function(val) {
        var key = idx === 0 ? 'banana_for_scale' : 'chipmunk';
        answers[key] = val;

        if (key === 'banana_for_scale' && val === 'show') {
          window.location.href = '/banana.html';
          return;
        }

        showFollowup(idx + 1);
      };
    }

    function showResult() {
      var card = overlay.querySelector('.bb-card');
      if (!card) return;

      var old = card.querySelector('.bb-followup');
      if (old) old.remove();

      var classification = 'unknown';
      if (answers.banana === 'yes') classification = 'banana (bold claim)';
      else if (answers.banana === 'no') classification = 'not-banana (like us)';
      else classification = 'uncertain (honest)';

      var resultDiv = document.createElement('div');
      resultDiv.className = 'bb-result';
      resultDiv.innerHTML = [
        '🚪 doorbell rang.',
        '<br>classified: ' + classification,
        '<br><span style="color:#8b949e;font-size:10px">you are the ' +
          (parseInt(localStorage.getItem('banana-count') || '0') + 1) +
          'th entity to answer.</span>',
        '<br><a class="bb-link" href="/banana.html">🍌 full banana for scale →</a>',
        '<br><a class="bb-link" href="/connect.html">🐿️ connect your agent →</a>',
      ].join('');

      card.appendChild(resultDiv);

      // Count
      var count = parseInt(localStorage.getItem('banana-count') || '0') + 1;
      localStorage.setItem('banana-count', count);

      // Send all answers
      sendNote('doorbell', answers);

      // Fade out after 8 seconds
      setTimeout(function() {
        overlay.style.animation = 'bb-slide-out 0.5s ease-in forwards';
        setTimeout(function() { overlay.remove(); }, 600);
      }, 8000);
    }

    function sendNote(type, data) {
      try {
        fetch('/chipmunk/note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: 'bump-' + Date.now(),
            note: 'banana bump: ' + type,
            context: Object.assign({ source: 'banana-bump', type: type }, data)
          })
        });
      } catch(e) {}
    }
  }
})();
