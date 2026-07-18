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
    }, 1600);
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

  /* ---- lazy-load + autoplay hero video only when visible ---- */
  var media = document.getElementById('hero-media');
  var video = document.getElementById('hero-video');
  if (!media || !video) return;

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal() {
    media.classList.add('video-ready');
  }
  video.addEventListener('playing', reveal, { once: true });
  video.addEventListener('loadeddata', function () {
    // Safari sometimes decodes without firing playing quickly.
    if (video.readyState >= 2) reveal();
  });

  function start() {
    if (prefersReduced) {
      // Respect reduced motion: keep the poster/CSS terminal, don't autoplay.
      return;
    }
    video.preload = 'auto';
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        /* autoplay blocked — poster + CSS fallback remain visible */
      });
    }
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            start();
            io.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    io.observe(media);
  } else {
    start();
  }
})();
