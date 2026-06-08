(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var next = carousel.querySelector("[data-slide-next]");
      var prev = carousel.querySelector("[data-slide-prev]");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
      }

      function start() {
        if (slides.length < 2) {
          return;
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
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

      show(0);
      start();
    });

    var searchInput = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var genreFilter = document.querySelector("[data-genre-filter]");
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-empty-state]");

    function filterCards() {
      if (!list) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var genre = genreFilter ? genreFilter.value : "";
      var visible = 0;
      list.querySelectorAll("[data-title]").forEach(function (card) {
        var content = [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.year || "",
          card.dataset.genre || "",
          card.dataset.tags || ""
        ].join(" ").toLowerCase();
        var ok = true;
        if (query && content.indexOf(query) === -1) {
          ok = false;
        }
        if (year && (card.dataset.year || "") !== year) {
          ok = false;
        }
        if (genre && (card.dataset.genre || "").indexOf(genre) === -1 && (card.dataset.tags || "").indexOf(genre) === -1) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", filterCards);
    }
    if (genreFilter) {
      genreFilter.addEventListener("change", filterCards);
    }
    filterCards();
  });
})();
