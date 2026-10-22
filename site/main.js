/* AR Smart Library — three small behaviours:
   1. the live clock inside the headline (the page's one "showing instead of saying")
   2. a heading reveal, added only when scripting is available
   3. the year in the footer, kept current                                */

(function () {
  "use strict";

  /* ---------- 1. the clock ---------- */

  var clock = document.getElementById("clock");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 24-hour time in Ranchi, fixed width so the headline never reflows.
  var fmt;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });
  } catch (err) {
    fmt = null;
  }

  function render() {
    if (!clock) return;
    var now = new Date();
    var text;
    if (fmt) {
      text = fmt.format(now);
    } else {
      // Fallback: local hours, still padded.
      text = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    }
    if (clock.textContent !== text) clock.textContent = text;
  }

  render();

  // Tick on the minute boundary rather than every second: fewer wake-ups,
  // and the digits can never jump mid-read.
  function scheduleNext() {
    var now = new Date();
    var delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 40;
    window.setTimeout(function () {
      render();
      scheduleNext();
    }, delay);
  }
  scheduleNext();

  // A background tab can miss timers; catch up when it comes back.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });

  /* ---------- 2. heading reveal ---------- */

  var heads = document.querySelectorAll(".statement, .close__title");

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    heads.forEach(function (head) {
      head.classList.add("reveal");
      io.observe(head);
    });
  }

  /* ---------- 3. the first screen ---------- */

  // One frame after the font settles, so the masked lines rise from the
  // right baseline instead of moving when the webfont swaps in.
  function ready() {
    requestAnimationFrame(function () {
      document.body.classList.add("is-ready");
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ready);
    window.setTimeout(ready, 1200); // never leave the headline hidden
  } else {
    ready();
  }
})();
