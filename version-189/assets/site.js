(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function setSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function startTimer() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 5600);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(index - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setSlide(index + 1);
          startTimer();
        });
      }

      carousel.addEventListener("mouseenter", function () {
        if (timer) {
          window.clearInterval(timer);
        }
      });

      carousel.addEventListener("mouseleave", startTimer);
      setSlide(0);
      startTimer();
    }

    var searchInput = document.querySelector("[data-filter-search]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category")
        ].join(" "));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && normalize(card.getAttribute("data-year")) !== year) {
          matched = false;
        }

        if (type && normalize(card.getAttribute("data-type")) !== type) {
          matched = false;
        }

        if (category && normalize(card.getAttribute("data-category")) !== category) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && searchInput) {
      searchInput.value = query;
    }

    [searchInput, yearSelect, typeSelect, categorySelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });

    if (cards.length && (searchInput || yearSelect || typeSelect || categorySelect)) {
      applyFilters();
    }
  });
})();
