(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var input = form.querySelector('[data-search-input]');
        var year = form.querySelector('[data-year-filter]');
        var category = form.querySelector('[data-category-filter]');
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');

        if (input && queryParam) {
            input.value = queryParam;
        }

        function apply() {
            if (!list) {
                return;
            }
            var q = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var selectedCategory = category ? category.value : '';
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var ok = true;

                if (q && search.indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    ok = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        if (category) {
            category.addEventListener('change', apply);
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });
        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var hls = null;

        function startPlayback() {
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-m3u8') || '';
            if (!source) {
                return;
            }
            shell.classList.add('is-playing');
            if (video.getAttribute('data-ready') !== 'true') {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute('data-ready', 'true');
            }
            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== 'true') {
                    startPlayback();
                }
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
