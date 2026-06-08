(function() {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (navButton && nav) {
        navButton.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var searchForm = document.querySelector('[data-site-search-form]');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            var input = searchForm.querySelector('input[type="search"]');
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = searchForm.getAttribute('action') + '?q=' + encodeURIComponent(input.value.trim());
            }
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;
        var show = function(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        var play = function() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        };
        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                play();
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        show(0);
        play();
    }

    var normalize = function(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
    };

    document.querySelectorAll('[data-filter-root]').forEach(function(root) {
        var input = root.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.searchable-card'));
        var empty = root.querySelector('[data-empty-result]');
        var activeFilters = {};
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        var apply = function() {
            var query = input ? normalize(input.value) : '';
            var visible = 0;
            cards.forEach(function(card) {
                var text = normalize(card.getAttribute('data-search'));
                var matched = !query || text.indexOf(query) >= 0;
                Object.keys(activeFilters).forEach(function(key) {
                    var filterValue = normalize(activeFilters[key]);
                    if (filterValue && normalize(card.getAttribute('data-' + key)).indexOf(filterValue) < 0) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        if (input) {
            input.addEventListener('input', apply);
        }
        root.querySelectorAll('[data-filter-key]').forEach(function(button) {
            button.addEventListener('click', function() {
                var key = button.getAttribute('data-filter-key');
                var value = button.getAttribute('data-filter-value');
                var shouldActivate = activeFilters[key] !== value;
                root.querySelectorAll('[data-filter-key="' + key + '"]').forEach(function(item) {
                    item.classList.remove('is-active');
                });
                if (shouldActivate) {
                    activeFilters[key] = value;
                    button.classList.add('is-active');
                } else {
                    delete activeFilters[key];
                }
                apply();
            });
        });
        var clearButton = root.querySelector('[data-clear-filter]');
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                activeFilters = {};
                if (input) {
                    input.value = '';
                }
                root.querySelectorAll('[data-filter-key]').forEach(function(item) {
                    item.classList.remove('is-active');
                });
                apply();
            });
        }
        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var sourceUrl = player.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;
        var startPlayer = function() {
            if (!video || !sourceUrl) {
                return;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            if (started) {
                video.play().catch(function() {});
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                video.load();
                video.play().catch(function() {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(function() {});
                });
                return;
            }
            video.src = sourceUrl;
            video.load();
            video.play().catch(function() {});
        };
        if (button) {
            button.addEventListener('click', startPlayer);
        }
        if (video) {
            video.addEventListener('click', startPlayer);
            video.addEventListener('play', function() {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function() {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
