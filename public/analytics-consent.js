/* First-party consent gate. Counter requests require explicit consent. */
(function (w, d) {
  'use strict';
  if (w.beregAnalytics) return;
  var key = 'bereg:analytics-consent:v1';
  var choice = null;
  var started = false;
  var needsReload = false;
  try {
    var stored = w.localStorage.getItem(key);
    if (stored === 'accepted' || stored === 'denied') choice = stored;
  } catch (_) {}

  function load(id, src) {
    if (d.getElementById(id)) return;
    var script = d.createElement('script');
    script.id = id; script.async = true; script.src = src;
    d.head.appendChild(script);
  }
  function start() {
    if (choice !== 'accepted' || started || needsReload) return;
    started = true;
    w.disableYaCounter113661127 = false;
    w.dataLayer = w.dataLayer || [];
    w.ym = w.ym || function () { (w.ym.a = w.ym.a || []).push(arguments); };
    w.ym.l = Date.now();
    try {
      w.ym(113661127, 'init', {ssr:true, webvisor:false, clickmap:false, ecommerce:'dataLayer', referrer:d.referrer, url:w.location.href, accurateTrackBounce:true, trackLinks:true});
      load('bereg-metrika', 'https://mc.yandex.ru/metrika/tag.js?id=113661127');
    } catch (_) {}
    var queue = w._tmr || (w._tmr = []);
    try {
      queue.push({id:'3805761', type:'pageView', start:Date.now()});
      load('tmr-code', 'https://top-fwz1.mail.ru/js/code.js');
    } catch (_) {}
  }
  function choose(next) {
    if (next !== 'accepted' && next !== 'denied') throw new Error('Invalid consent choice');
    var persisted = false;
    try { w.localStorage.setItem(key, next); persisted = w.localStorage.getItem(key) === next; } catch (_) {}
    // A loaded third-party SDK cannot be unloaded reliably. The UI offers a
    // deliberate reload, preserving the current case before that reload.
    if (started && next !== choice) {
      needsReload = true;
      w.disableYaCounter113661127 = true;
      try { w.ym(113661127, 'destruct'); } catch (_) {}
    }
    choice = next;
    if (choice === 'accepted') start();
    else w.disableYaCounter113661127 = true;
    return {persisted:persisted, needsReload:needsReload};
  }
  w.beregAnalytics = {
    get allowed() { return choice === 'accepted' && !needsReload; },
    getChoice: function () { return choice; },
    choose: choose
  };
  w.disableYaCounter113661127 = choice !== 'accepted';
  start();
  w.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    // Another tab's consent change must not leave this tab sending app events.
    needsReload = started;
    choice = null;
    try { var next = w.localStorage.getItem(key); if (next === 'accepted' || next === 'denied') choice = next; } catch (_) {}
    if (choice !== 'accepted') {
      w.disableYaCounter113661127 = true;
      if (started) { try { w.ym(113661127, 'destruct'); } catch (_) {} }
    } else start();
    w.dispatchEvent(new CustomEvent('bereg:consent-changed', {detail:{needsReload:needsReload}}));
  });
})(window, document);
