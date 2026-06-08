(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (header && toggle) {
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var activate = function (index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activate(index);
        });
      });
      window.setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }

    var homeSearch = document.getElementById("homeSearchForm");
    if (homeSearch) {
      homeSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = homeSearch.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var input = filterRoot.querySelector("[data-search-input]");
      var typeSelect = filterRoot.querySelector("[data-type-select]");
      var regionSelect = filterRoot.querySelector("[data-region-select]");
      var yearSelect = filterRoot.querySelector("[data-year-select]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-keywords]"));
      var controls = Array.prototype.slice.call(document.querySelectorAll(".filter-control"));
      var activeTag = "all";
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial && input) {
        input.value = initial;
      }
      var applyFilter = function () {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "all";
        var region = regionSelect ? regionSelect.value : "all";
        var year = yearSelect ? yearSelect.value : "all";
        cards.forEach(function (card) {
          var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
          var matchQuery = !query || keywords.indexOf(query) !== -1;
          var matchType = type === "all" || card.getAttribute("data-type") === type;
          var matchRegion = region === "all" || card.getAttribute("data-region") === region;
          var matchYear = year === "all" || card.getAttribute("data-year") === year;
          var matchTag = activeTag === "all" || keywords.indexOf(activeTag.toLowerCase()) !== -1;
          card.classList.toggle("hidden-card", !(matchQuery && matchType && matchRegion && matchYear && matchTag));
        });
      };
      [input, typeSelect, regionSelect, yearSelect].forEach(function (node) {
        if (node) {
          node.addEventListener("input", applyFilter);
          node.addEventListener("change", applyFilter);
        }
      });
      controls.forEach(function (control) {
        control.addEventListener("click", function () {
          controls.forEach(function (item) {
            item.classList.remove("active");
          });
          control.classList.add("active");
          activeTag = control.getAttribute("data-filter") || "all";
          applyFilter();
        });
      });
      applyFilter();
    }
  });

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      target.classList.add("image-missing");
    }
  }, true);

  window.initMoviePlayer = function (videoId, overlayId, mediaUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !mediaUrl) {
      return;
    }
    var attached = false;
    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    };
    var play = function () {
      attach();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
    video.addEventListener("click", function () {
      if (!attached) {
        play();
      }
    });
  };
})();
