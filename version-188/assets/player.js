(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector("[data-cover]");
      var button = box.querySelector("[data-play-button]");
      var url = box.getAttribute("data-play");
      var started = false;
      var instance = null;

      function attach() {
        if (started || !video || !url) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(url);
          instance.attachMedia(video);
        } else {
          video.src = url;
        }
        video.setAttribute("controls", "controls");
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("hidden");
        }
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            play();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  });
})();
