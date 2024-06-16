const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const cd = $(".cd");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const preBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
  currentIndexSong: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  prevIndexSong: undefined,

  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  songs: [
    {
      name: "Dreams",
      singer: "Lost sky",
      path: "./assets/music/song1.mp3",
      image: "./assets/img/song1.jpg",
    },
    {
      name: "Thời gian sẽ trả lời",
      singer: "Tác giả: TGSTL",
      path: "./assets/music/song2.mp3",
      image: "./assets/img/song2.jpg",
    },
    {
      name: "Vợ Yêu",
      singer: "Vũ Duy Khánh",
      path: "./assets/music/song3.mp3",
      image: "./assets/img/song3.jpg",
    },
    {
      name: "Quên Tên Rồi",
      singer: "Quên Tên Rồi",
      path: "./assets/music/song4.mp3",
      image: "./assets/img/",
    },
    {
      name: "Super Idol",
      singer: "Thế Phương",
      path: "./assets/music/song5.m4a",
      image: "./assets/img/song5.jpg",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div data-index = ${index} class="song">
                <div
                  class="thumb"
                  style="
                    background-image: url('${song.image}');
                  "
                ></div>
                <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
                </div>
              </div>`;
    });
    playList.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndexSong];
      },
    });
  },

  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    // xử lí CD quay / dừng
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000,
        interations: Infinity,
      }
    );

    // xử lí phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      console.log(newCdWidth);

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // xử lí khi click play
    playBtn.onclick = () => {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }

      // khi song đang phát
      audio.onplay = function () {
        _this.isPlaying = true;
        player.classList.add("playing");
        cdThumbAnimate.play();
      };

      // khi song đang dừng
      audio.onpause = function () {
        _this.isPlaying = false;
        player.classList.remove("playing");
        cdThumbAnimate.pause();
      };

      // khi tiến độ bài hát thay đổi
      audio.ontimeupdate = () => {
        let progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      };

      // xử lí khi tua song
      progress.oninput = (e) => {
        let timeWhenChanged = (audio.duration / 100) * e.target.value;
        audio.currentTime = timeWhenChanged;
      };

      // xử lí click bài tiếp theo
      nextBtn.onclick = () => {
        if (this.isRandom) {
          _this.playRandomSong();
        } else {
          _this.nextSong();
        }
        audio.play();
      };

      // xử lí click bài phía trước
      preBtn.onclick = () => {
        if (this.isRandom) {
          _this.playRandomSong();
        } else {
          _this.prevSong();
        }
        audio.play();
      };

      // random
      randomBtn.onclick = (e) => {
        if (_this.isRepeat) {
          _this.isRepeat = !_this.isRepeat;
          repeatBtn.classList.toggle("active", _this.isRepeat);
        }
        _this.isRandom = !_this.isRandom;
        randomBtn.classList.toggle("active", _this.isRandom);
        _this.playRandomSong();
        _this.setConfig("isRandom", _this.isRandom);
      };

      // khi kết thúc bài hát thì next bài hát
      audio.onended = () => {
        if (_this.isRepeat) {
          audio.play();
        } else {
          nextBtn.click();
        }
      };

      // button lặp lại
      repeatBtn.onclick = (e) => {
        if (_this.isRandom) {
          _this.isRandom = !_this.isRandom;
          randomBtn.classList.toggle("active", _this.isRandom);
        }
        _this.isRepeat = !_this.isRepeat;
        repeatBtn.classList.toggle("active", _this.isRepeat);
        _this.setConfig("isRepeat", _this.isRepeat);
      };

      // playlist onclick
      playList.onclick = (e) => {
        const songNodeNotActive = e.target.closest(".song:not(.active)");
        const songOptions = e.target.closest(".option");
        if (songNodeNotActive) {
          _this.currentIndexSong = Number(songNodeNotActive.dataset.index);
          _this.loadCurrentSong();
          audio.play();
        }
      };
    };
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndexSong);
    this.currentIndexSong = newIndex;
    this.loadCurrentSong();
    audio.play();
  },

  // bài tiếp theo
  nextSong: function () {
    this.currentIndexSong++;
    if (this.currentIndexSong >= this.songs.length) {
      this.currentIndexSong = 0;
    }
    this.loadCurrentSong();
  },

  // bài phía trước
  prevSong: function () {
    this.currentIndexSong--;
    if (this.currentIndexSong < 0) {
      this.currentIndexSong = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;

    this.loadActiveSong();
    this.scrollToActiveSong();
  },

  loadActiveSong: function () {
    const songNodeList = $$(".song");

    if (this.prevIndexSong !== undefined) {
      const preIndexSongNode = songNodeList[this.prevIndexSong];
      preIndexSongNode.classList.remove("active");
    }

    const currentSongNode = songNodeList[this.currentIndexSong];
    currentSongNode.classList.add("active");
    this.prevIndexSong = this.currentIndexSong;
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  start: function () {
    // gắn cấu hình từ app vào ứng dụng
    this.loadConfig();

    // định nghĩa các thuộc tính
    this.defineProperties();

    // lắng nghe / xử lí các sự kiện ( DOM events )
    this.handleEvents();

    // render playlist
    this.render();

    // tải thông bài hát đầu tiên
    this.loadCurrentSong();
  },
};

app.start();
