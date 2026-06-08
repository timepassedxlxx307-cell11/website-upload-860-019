(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMobileNavigation();
        initHeroCarousel();
        initRails();
        initFilters();
        initPlayer();
    });

    function initMobileNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
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

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initRails() {
        var sections = document.querySelectorAll(".section-rail");
        sections.forEach(function (section) {
            var rail = section.querySelector("[data-rail]");
            var prev = section.querySelector("[data-rail-prev]");
            var next = section.querySelector("[data-rail-next]");
            if (!rail) {
                return;
            }
            var amount = function () {
                return Math.max(320, Math.floor(rail.clientWidth * 0.85));
            };
            if (prev) {
                prev.addEventListener("click", function () {
                    rail.scrollBy({ left: -amount(), behavior: "smooth" });
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    rail.scrollBy({ left: amount(), behavior: "smooth" });
                });
            }
        });
    }

    function initFilters() {
        var roots = document.querySelectorAll("[data-filter-root]");
        roots.forEach(function (root) {
            var input = root.querySelector("[data-card-search]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
            var empty = root.querySelector("[data-empty]");
            var query = new URLSearchParams(window.location.search).get("q") || "";
            if (input && query) {
                input.value = query;
            }

            function valueOf(element) {
                return element ? String(element.value || "").trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = valueOf(input);
                var yearValue = valueOf(year);
                var typeValue = valueOf(type);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    var cardYear = String(card.getAttribute("data-year") || "").toLowerCase();
                    var cardType = String(card.getAttribute("data-type") || "").toLowerCase();
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector("[data-player-start]");
        var loaded = false;
        if (!video) {
            return;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function playVideo() {
            var stream = video.getAttribute("data-stream");
            if (!stream) {
                return;
            }
            hideCover();
            if (loaded) {
                video.play().catch(function () {});
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = stream;
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                playVideo();
            }
        });
    }
})();
