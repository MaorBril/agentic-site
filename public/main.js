// agentic marketing site — minimal progressive enhancement.
(function () {
  'use strict';

  var INSTALL =
    'curl -fsSL https://raw.githubusercontent.com/maorbril/agentic/main/install.sh | sh';

  /* ---- copy-to-clipboard for install blocks ---- */
  var toast = document.getElementById('toast');
  function flash() {
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 1400);
  }
  function copy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(INSTALL).then(flash, flash);
    } else {
      var ta = document.createElement('textarea');
      ta.value = INSTALL;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(ta);
      flash();
    }
  }
  document.querySelectorAll('#copy-btn, .copy-btn2').forEach(function (b) {
    b.addEventListener('click', copy);
  });

  /* ---- hero video: fall back to the CSS terminal only if it can't play ---- */
  var media = document.getElementById('hero-media');
  var video = document.getElementById('hero-video');
  if (!media || !video) return;

  function fallback() {
    media.classList.add('video-failed');
  }
  video.addEventListener('error', fallback);
  // If autoplay is blocked entirely (rare with muted+playsinline, but some
  // in-app browsers still refuse), retry once on first user interaction.
  video.addEventListener(
    'canplay',
    function () {
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          document.body.addEventListener(
            'click',
            function () {
              video.play().catch(fallback);
            },
            { once: true }
          );
        });
      }
    },
    { once: true }
  );
})();
