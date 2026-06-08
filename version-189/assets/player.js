(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var source = video && video.querySelector("source");
      var overlay = player.querySelector(".player-overlay");
      var src = source && source.getAttribute("src");
      var hls = null;

      if (!video || !src) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function showOverlay() {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      }

      function playVideo() {
        hideOverlay();
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showOverlay();
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      video.addEventListener("play", hideOverlay);
      video.addEventListener("pause", function () {
        if (!video.ended) {
          showOverlay();
        }
      });
      video.addEventListener("ended", showOverlay);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
