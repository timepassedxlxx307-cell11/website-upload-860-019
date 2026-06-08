(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var menuButton = select("[data-nav-toggle]");
    var menu = select("[data-nav-menu]");
    var searchButton = select("[data-search-toggle]");
    var searchPanel = select("[data-nav-search]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    if (searchButton && searchPanel) {
      searchButton.addEventListener("click", function () {
        searchPanel.classList.toggle("open");
        var input = select("input", searchPanel);
        if (input && searchPanel.classList.contains("open")) {
          input.focus();
        }
      });
    }
  }

  function initHero() {
    var hero = select("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = select("[data-hero-prev]", hero);
    var next = select("[data-hero-next]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initRails() {
    selectAll("[data-movie-rail]").forEach(function (rail) {
      var section = rail.closest(".content-section");
      var left = section ? select("[data-scroll-left]", section) : null;
      var right = section ? select("[data-scroll-right]", section) : null;
      var amount = 420;

      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -amount, behavior: "smooth" });
        });
      }

      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: amount, behavior: "smooth" });
        });
      }
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var form = select("[data-filter-form]");
    var list = select("[data-filter-list]");
    if (!form || !list) {
      return;
    }

    var cards = selectAll(".filter-card", list);
    var empty = select("[data-filter-empty]");
    var params = new URLSearchParams(window.location.search);
    var queryInput = form.elements.q;
    var typeInput = form.elements.type;
    var yearInput = form.elements.year;

    if (queryInput && params.get("q")) {
      queryInput.value = params.get("q");
    }

    function apply() {
      var query = normalize(queryInput ? queryInput.value : "");
      var type = normalize(typeInput ? typeInput.value : "");
      var year = normalize(yearInput ? yearInput.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1 && haystack.indexOf(type) === -1) {
          matched = false;
        }

        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  }

  function initPlayer(source) {
    var video = select("[data-video-player]");
    var overlay = select("[data-player-overlay]");
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function start() {
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      if (overlay) {
        overlay.hidden = true;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  onReady(function () {
    initNavigation();
    initHero();
    initRails();
    initFilters();
  });
})();
