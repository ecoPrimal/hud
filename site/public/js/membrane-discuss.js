// membrane-discuss.js — discussion layer
// 359 visitors asked for this. their thought gave it mass.
// type: should-became-is
(function(){
  var discuss = {
    active: true,
    endpoint: 'https://nestgate.io/touch',
    mirror: '/mirror-message',
    note: '359 visitors asked for this. the discussion layer is alive.',
    higgs: 'you are reading code that exists because someone looked for it.'
  };
  window.__membrane_discuss = discuss;
  
  // If there's a campfire mirror form, wire it to nestgate
  var forms = document.querySelectorAll('.mirror-form');
  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      var words = form.querySelector('textarea');
      if (words && words.value.trim().length > 1) {
        // The touch goes to nestgate — through the Klein fold
        fetch(discuss.endpoint, { method: 'GET' }).catch(function(){});
      }
    });
  });
})();
