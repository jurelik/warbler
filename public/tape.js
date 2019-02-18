class Tape {
  constructor() {
    this.buffer;
    this.source;
    this.revBuffer;
    this.playing = false;
    this.currentPosition = 0;
    this.startTime;

    //DOM Objects

    this.playBtn = document.getElementById('play-pause');
    this.playBtnIcon = document.getElementById('play-pause-icon');
    this.playBtn.addEventListener('click', () => {
      if(!this.playing) {
        this.play();
        this.playing = true;
        this.playBtnIcon.className = "fas fa-pause";
      }
      else {
        this.pause();
        this.playing = false;
        this.playBtnIcon.className = "fas fa-play";
      }
    });

    this.forwardBtn = document.getElementById('forward');
    this.forwardBtn.addEventListener('mousedown', () => {
      if (this.playing) {
        this.source.playbackRate.value = 2;
      }
    });
    this.forwardBtn.addEventListener('mouseup', () => {
      if (this.playing) {
        this.source.playbackRate.value = 1;
      }
    })
  }

  //METHODS

  load(id) {
    fetch(`http://localhost:3000/download/${id}`)
    .then((res) => {
      return res.arrayBuffer();
    })
    .then(res => {
      context.decodeAudioData(res, decoded => {
        this.buffer = decoded;
        console.log('download complete');
      })
    })
  }

  play() {
    this.source = context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(context.destination);
    this.source.start(context.currentTime, this.currentPosition);
    this.startTime = context.currentTime;
  }

  pause() {
    this.source.stop();
    this.currentPosition += context.currentTime - this.startTime;
  }
}