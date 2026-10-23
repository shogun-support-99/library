/* AR Smart Library
   The page's idea is that its numbers are physical: they roll into place, and the
   clock in the headline keeps rolling all night.

   Everything here is progressive. Hidden states live behind `html.anim`, which is
   only added once these observers exist, and the hero's load sequence is gated on
   `html.fonts`. With no script, or a broken one, the page is simply a static page. */

(function () {
  "use strict";

  var root = document.documentElement;
  var hasIO = "IntersectionObserver" in window;

  /* ---------------------------------------------------------------- helpers */

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ------------------------------------------------------------ rolling digits */

  var DIGITS = "0123456789".split("");

  /**
   * Replace an element's text with a column per character, each column holding
   * 0-9 stacked. The visible digit is chosen by --d, so "rolling" is one
   * transform transition on the track. Screen readers get the real value once.
   */
  function buildRoll(el, value) {
    var chars = String(value).split("");
    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = value;

    var box = document.createElement("span");
    box.className = "roll";
    box.setAttribute("aria-hidden", "true");

    var tracks = [];

    chars.forEach(function (ch, i) {
      var col = document.createElement("span");
      col.className = "roll__col";
      col.style.setProperty("--i", i);

      if (DIGITS.indexOf(ch) === -1) {
        // A decimal point or similar: set it, don't roll it.
        col.classList.add("roll__col--static");
        col.setAttribute("data-sep", ch);
      } else {
        var track = document.createElement("span");
        track.className = "roll__track";
        DIGITS.forEach(function (d) {
          var cell = document.createElement("span");
          cell.className = "roll__d";
          // the glyph is drawn by CSS `content`, so the stacked digits never
          // pollute innerText, copy-paste or a crawler's reading of the page
          cell.setAttribute("data-d", d);
          track.appendChild(cell);
        });
        col.appendChild(track);
        tracks.push({ track: track, digit: Number(ch) });
      }

      box.appendChild(col);
    });

    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(box);

    return tracks;
  }

  function settle(tracks) {
    tracks.forEach(function (t) {
      t.track.style.setProperty("--d", t.digit);
    });
  }

  var rolls = []; // tracks still waiting for their section to arrive

  function registerRolls(scope) {
    each(scope.querySelectorAll("[data-roll]"), function (el) {
      if (el.hasAttribute("data-rolled")) return;
      el.setAttribute("data-rolled", "1");
      var tracks = buildRoll(el, el.getAttribute("data-roll"));
      rolls.push({ el: el, tracks: tracks });
    });
  }

  function settleWithin(scope) {
    rolls = rolls.filter(function (r) {
      if (!scope.contains(r.el)) return true;
      settle(r.tracks);
      return false;
    });
  }

  /* ------------------------------------------------------------------- clock */

  var clockEl = document.getElementById("clock");
  var clockTracks = null;
  var clockDigits = null;
  var lastTime = "";

  var timeFormat = null;
  try {
    // h23, not hour12:false: some engines render midnight as 24:00 otherwise.
    timeFormat = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata"
    });
  } catch (err) {
    timeFormat = null;
  }

  function timeInRanchi(now) {
    if (timeFormat) return timeFormat.format(now);
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  }

  function buildClock() {
    if (!clockEl) return;
    var plate = clockEl.querySelector(".clock__js");
    if (!plate) return;

    var box = document.createElement("span");
    box.className = "roll";
    box.setAttribute("aria-hidden", "true");

    clockTracks = [];
    clockDigits = [];

    // Two hours, a colon, two minutes. Every slot exists from the start so the
    // plate never changes width.
    [0, 1, 2, 3, 4].forEach(function (i) {
      var col = document.createElement("span");
      col.className = "roll__col";
      col.style.setProperty("--i", i);

      if (i === 2) {
        col.classList.add("roll__col--static");
        col.setAttribute("data-sep", ":");
      } else {
        var track = document.createElement("span");
        track.className = "roll__track";
        DIGITS.forEach(function (d) {
          var cell = document.createElement("span");
          cell.className = "roll__d";
          cell.setAttribute("data-d", d);
          track.appendChild(cell);
        });
        col.appendChild(track);
        clockTracks.push(track);
      }
      box.appendChild(col);
    });

    plate.textContent = "";
    plate.appendChild(box);
  }

  function renderClock(first) {
    if (!clockTracks) return;

    var text = timeInRanchi(new Date());
    if (text === lastTime) return;
    lastTime = text;

    var digits = text.replace(":", "").split("");
    clockDigits = digits;

    // Only the digits that changed roll; at 16:47 -> 16:48 one column moves.
    clockTracks.forEach(function (track, i) {
      track.style.setProperty("--d", Number(digits[i]));
    });

    if (first) {
      // The plate lands already showing the right time. It is read before it is
      // watched: the page must be readable on the first frame, and a figure that
      // tumbles for a second on arrival is a delay, not a flourish.
      clockTracks.forEach(function (track) {
        track.style.setProperty("transition", "none");
      });
      window.requestAnimationFrame(function () {
        clockTracks.forEach(function (track) {
          track.style.removeProperty("transition");
        });
      });
    }
  }

  function scheduleClock() {
    var now = new Date();
    // land just after the minute turns, not before it
    var delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 60;
    window.setTimeout(function () {
      renderClock(false);
      scheduleClock();
    }, delay);
  }

  function startClock() {
    if (!clockEl) return;
    buildClock();
    renderClock(true);
    // The plate only replaces the words once there are digits behind it. If
    // anything above returned early, `clock-ready` is never set and the
    // headline keeps reading "any hour" instead of "--:--".
    if (clockTracks && clockTracks.length) root.classList.add("clock-ready");
    scheduleClock();
    // a backgrounded tab can miss timers; catch up on return
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) renderClock(false);
    });
  }

  /* ------------------------------------------------------- headings, by line */

  function splitHeadline(el) {
    if (el.hasAttribute("data-split")) return;
    var html = el.innerHTML;
    var parts = html.split(/<br\s*\/?>/i);

    if (parts.length < 2) {
      // one line: still mask it, so it rises the same way
      parts = [html];
    }

    el.innerHTML = parts
      .map(function (part, i) {
        return '<span class="lines__row" style="--i:' + i + '"><span>' + part + "</span></span>";
      })
      .join("");

    el.setAttribute("data-split", "1");
  }

  /* ------------------------------------------------------------------- setup */

  function init() {
    // 1. Headings become lines before anything is observed, so the observer
    //    measures the final layout.
    each(document.querySelectorAll("[data-lines]"), splitHeadline);

    // 2. Staggered children read their own index.
    each(document.querySelectorAll("[data-stagger]"), function (el) {
      each(el.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    });

    // 3. Figures get their rolling columns.
    registerRolls(document.body);

    // 4. The hidden state was already set in <head>, before the first paint, so
    //    nothing is painted fully formed and then snatched away. All that is left
    //    is to claim the gate. If the <head> fallback has already stood it down
    //    (this script was slow to arrive), the page is simply shown.
    var gated = root.classList.contains("anim");

    var io = null;
    var ioSpoke = false; // has the observer delivered a single record yet?

    function reveal(el) {
      if (el.classList.contains("is-in")) return;
      el.classList.add("is-in");
      settleWithin(el);
    }

    function showEverything() {
      root.classList.remove("anim");
      each(document.querySelectorAll("[data-reveal]"), reveal);
      rolls.forEach(function (r) { settle(r.tracks); });
      rolls = [];
    }

    if (gated && hasIO) {
      root.classList.add("anim-live"); // tell <head> not to drop the gate
      io = new IntersectionObserver(
        function (entries) {
          ioSpoke = true;
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
      );

      // The -12% margin is there so a section reveals once it is properly in
      // view rather than the moment its first pixel clears the fold. The cost is
      // that a strip sitting *at* the fold — the facts row, on a laptop — is on
      // screen but never counts as intersecting, so it stayed blank until the
      // visitor nudged the page. Anything already in the viewport when the
      // hidden state lands is shown on the next frame instead, after that hidden
      // state has been committed, so its stagger still plays.
      var vh = window.innerHeight;
      each(document.querySelectorAll("[data-reveal]"), function (el) {
        if (el.getBoundingClientRect().top < vh) {
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () { reveal(el); });
          });
        } else {
          io.observe(el);
        }
      });
    } else {
      // No observer, or a gate already dropped: show the page rather than hide it.
      showEverything();
    }

    startClock();

    // 5. The masthead answers the scroll: solid once it leaves the top, and
    //    inverted while the dark closing section sits under it.
    var header = document.querySelector("[data-header]");
    if (header) {
      // Both header states are computed from the scroll position on each frame.
      // An IntersectionObserver would only fire when the relationship *changes*,
      // which leaves a stale colour once the page is scrolled back up.
      //
      // Everything measurable is measured once and cached: reading offsetHeight
      // inside the scroll handler forces a layout on every frame, which is what
      // makes a long page stutter on a laptop. The cache is refreshed when the
      // document actually changes size (a FAQ opening, the viewport turning).
      var dark = document.querySelector(".close");
      var ticking = false;
      var headerH = 0;
      var darkTop = 0;
      var wasStuck = null;
      var wasDark = null;

      var measure = function () {
        headerH = header.offsetHeight;
        if (dark) darkTop = dark.getBoundingClientRect().top + window.scrollY;
      };

      var paint = function () {
        ticking = false;
        var y = window.scrollY;

        var stuck = y > 8;
        if (stuck !== wasStuck) {
          header.classList.toggle("is-stuck", stuck);
          wasStuck = stuck;
        }

        if (dark) {
          // The dark field starts at .close and runs to the end of the page, so
          // there is no lower bound to check: past the top of .close the header
          // is over dark ground until the document ends. The old version ended
          // the state at the bottom of .close, which turned the sticky header
          // sand-coloured while it sat over the dark footer.
          var isDark = darkTop - y <= headerH;
          if (isDark !== wasDark) {
            header.classList.toggle("is-dark", isDark);
            wasDark = isDark;
          }
        }
      };

      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(paint);
      };

      var remeasure = function () {
        measure();
        onScroll();
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", remeasure, { passive: true });

      if ("ResizeObserver" in window) {
        new ResizeObserver(remeasure).observe(document.body);
      }

      measure();
      paint();
    }

    // 6. The band stops moving when it is off screen.
    var band = document.querySelector("[data-band]");
    if (band && hasIO) {
      new IntersectionObserver(
        function (entries) {
          band.classList.toggle("is-off", !entries[0].isIntersecting);
        },
        { threshold: 0 }
      ).observe(band);
    }

    // 7. The compact menu: Escape closes it, and so does a tap outside.
    var menu = document.querySelector("[data-menu]");
    if (menu) {
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.open) {
          menu.open = false;
          var btn = menu.querySelector("summary");
          if (btn) btn.focus();
        }
      });
      document.addEventListener("click", function (e) {
        if (menu.open && !menu.contains(e.target)) menu.open = false;
      });
      // following a link inside the panel should not leave it hanging open
      each(menu.querySelectorAll("a"), function (a) {
        a.addEventListener("click", function () { menu.open = false; });
      });
    }

    // 8. The motion switch. A device can ask for less motion, and a media query
    //    can only be obeyed or ignored: this gives the visitor the choice back,
    //    without a reload. Hidden in the markup, revealed here, so it is never a
    //    dead control when the script does not run.
    var motionWrap = document.querySelector("[data-motion]");
    var motionBtn = motionWrap && motionWrap.querySelector("[data-motion-toggle]");
    if (motionWrap && motionBtn) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      var motionText = motionWrap.querySelector("[data-motion-text]");

      var motionOn = function () {
        return root.classList.contains("motion-on");
      };

      var syncSwitch = function () {
        var on = motionOn();
        // The label states the action, so this is a plain button: aria-pressed
        // on a button whose name changes announces itself as
        // "Turn them off, pressed", which contradicts the name.
        motionBtn.textContent = on ? "Turn them off" : "Turn them on";
        if (motionText) {
          motionText.textContent = on
            ? "Animations are on."
            : mq.matches
              ? "Animations are off to match your device."
              : "Animations are off.";
        }
        motionWrap.hidden = false;
      };

      motionBtn.addEventListener("click", function () {
        var next = motionOn() ? "off" : "on";
        root.classList.remove("motion-on", "motion-off");
        root.classList.add("motion-" + next);
        try {
          localStorage.setItem("arsl-motion", next);
        } catch (err) {
          /* private mode: the choice lasts for this page only */
        }
        syncSwitch();
      });

      if (mq.addEventListener) mq.addEventListener("change", syncSwitch);
      syncSwitch();
    }

    // 9. Safety net, for an observer that is broken rather than merely quiet.
    //
    //    This used to ask "has anything revealed itself yet?" three seconds in,
    //    and treat "no" as proof of failure. But nothing below the fold *can*
    //    have revealed itself before the visitor scrolls, so on any page whose
    //    first reveal clears the fold the answer was legitimately no: the gate
    //    was dropped, every scroll reveal was cancelled for the rest of the
    //    visit, and the pending digit rolls were settled early on top of it.
    //    Silence only means failure when the observer never spoke at all — it
    //    always delivers one initial record per target, intersecting or not.
    //    A background tab is the one honest reason for silence, so wait for it.
    function safetyCheck() {
      if (!hasIO || ioSpoke) return;

      if (document.hidden) {
        document.addEventListener("visibilitychange", function again() {
          document.removeEventListener("visibilitychange", again);
          window.setTimeout(safetyCheck, 1200);
        });
        return;
      }

      showEverything();
    }

    window.setTimeout(safetyCheck, 3000);
  }

  /* The load sequence waits for the webfont, so the lines rise in the real face
     rather than swapping mid-rise. The timeout means a slow font never blocks it. */
  function start() {
    var begun = false;
    function go() {
      if (begun) return;
      begun = true;
      root.classList.add("fonts");
      init();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go);
      window.setTimeout(go, 900);
    } else {
      go();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
