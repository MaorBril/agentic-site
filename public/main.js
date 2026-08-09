// agentic marketing site — minimal progressive enhancement.
(function () {
  'use strict';

  var INSTALL =
    'curl -fsSL https://raw.githubusercontent.com/maorbril/agentic/main/install.sh | sh';

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- copy-to-clipboard for install blocks ---- */
  var toast = document.getElementById('toast');
  function flash() {
    if (!toast) return;
    // Clear then re-set the text so screen readers re-announce the
    // aria-live region on every click, not just the first.
    toast.textContent = '';
    toast.classList.add('show');
    window.requestAnimationFrame(function () {
      toast.textContent = 'Copied';
    });
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

  /* ---- media: fall back to poster/CSS-terminal only if a video can't play,
     and respect prefers-reduced-motion by never autoplaying at all. Same
     treatment for every ".hero-media" block on the page (hero, context demo,
     eval demo, ...) — each just needs its own <video> child. ---- */
  document.querySelectorAll('.hero-media').forEach(function (media) {
    var video = media.querySelector('video');
    if (!video) return;

    function fallback() {
      media.classList.add('video-failed');
    }
    video.addEventListener('error', fallback);
    // A <source> failing to decode doesn't always bubble to the <video>
    // error event in every browser — listen on each source too.
    video.querySelectorAll('source').forEach(function (s) {
      s.addEventListener('error', fallback);
    });

    if (prefersReducedMotion) {
      // Show the static poster/fallback and never touch playback.
      media.classList.add('reduced-motion');
      return;
    }

    var isDemo = media.classList.contains('media-demo');

    function attemptPlay() {
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          if (isDemo) return; // below-the-fold demos: wait for a click instead
          document.body.addEventListener(
            'click',
            function () {
              video.play().catch(fallback);
            },
            { once: true }
          );
        });
      }
    }

    if (!isDemo) {
      // Hero video: autoplay as soon as it can.
      video.addEventListener('canplay', attemptPlay, { once: true });
      return;
    }

    // Below-the-fold demo videos: only play while scrolled into view, so we
    // aren't decoding video the visitor never looks at. Click toggles
    // play/pause too, since these have no visible controls.
    var hasPlayed = false;
    var observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                  hasPlayed = true;
                  attemptPlay();
                } else {
                  video.pause();
                }
              });
            },
            { threshold: 0.4 }
          )
        : null;
    if (observer) {
      observer.observe(media);
    } else {
      // No IntersectionObserver support: just try to play once visible.
      video.addEventListener('canplay', attemptPlay, { once: true });
    }
    media.addEventListener('click', function () {
      if (video.paused) {
        hasPlayed = true;
        attemptPlay();
      } else {
        video.pause();
      }
    });
  });
})();
