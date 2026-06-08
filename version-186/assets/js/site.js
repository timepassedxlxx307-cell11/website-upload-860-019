(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list] .movie-card"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    var activeFilter = "all";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var searchText = (card.getAttribute("data-search") || "").toLowerCase();
        var genre = card.getAttribute("data-genre") || "";
        var category = card.getAttribute("data-category") || "";
        var filterMatch = activeFilter === "all" || activeFilter === genre || activeFilter === category;
        var queryMatch = !query || searchText.indexOf(query) !== -1;
        var shouldShow = filterMatch && queryMatch;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeFilter = button.getAttribute("data-filter-button") || "all";
        apply();
      });
    });

    apply();
  }

  window.initMoviePlayer = function (address) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var cover = document.getElementById("player-cover");
      if (!video || !address) {
        return;
      }
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = address;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(address);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = address;
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
