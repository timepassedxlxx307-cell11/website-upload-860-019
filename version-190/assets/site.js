(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

    filterInputs.forEach(function (input) {
        var form = input.closest('[data-filter-form]');
        var container = document.querySelector('[data-card-container]') || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') || card.textContent || '').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        input.addEventListener('input', applyFilter);
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
            applyFilter();
        }
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('[data-play]');
        var mediaUrl = video ? video.getAttribute('data-media') : '';
        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (!video || !mediaUrl || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }

            loaded = true;
        }

        function playVideo() {
            if (!video) {
                return;
            }
            loadVideo();
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                frame.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                frame.classList.remove('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
