(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = qs("[data-mobile-toggle]");
    var menu = qs("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
    });
  }

  function initHeaderSearch() {
    qsa("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var keyword = input ? input.value.trim() : "";
        if (keyword) {
          window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function applyFilter(keyword) {
    var value = normalize(keyword);
    var cards = qsa("[data-movie-card]");
    if (!cards.length) {
      return;
    }

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].join(" "));
      card.classList.toggle("hidden-card", value && haystack.indexOf(value) === -1);
    });
  }

  function initPageFilter() {
    var form = qs("[data-page-filter]");
    var input = form ? qs("input", form) : qs("[data-filter-input]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (input && q) {
      input.value = q;
      applyFilter(q);
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter(input ? input.value : "");
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    }

    qsa("[data-filter-keyword]").forEach(function (button) {
      button.addEventListener("click", function () {
        var keyword = button.getAttribute("data-filter-keyword") || "";
        if (input) {
          input.value = keyword;
        }
        applyFilter(keyword);
      });
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var next = qs("[data-hero-next]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (box) {
      var video = qs("video", box);
      var source = video ? qs("source", video) : null;
      var overlay = qs("[data-play-overlay]", box);
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function start() {
        var src = source.getAttribute("src");
        if (!src) {
          return;
        }

        if (src.indexOf(".m3u8") !== -1) {
          var nativeHls = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");

          if (!nativeHls && window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
              hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
              });
              hlsInstance.loadSource(src);
              hlsInstance.attachMedia(video);
            }
          } else if (!video.getAttribute("src")) {
            video.setAttribute("src", src);
          }
        } else if (!video.getAttribute("src")) {
          video.setAttribute("src", src);
        }

        if (overlay) {
          overlay.classList.add("is-hidden");
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
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeaderSearch();
    initPageFilter();
    initHero();
    initPlayers();
  });
})();
