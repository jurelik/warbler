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
        this.updatePosition(); //Updates the position until this moment
        this.source.playbackRate.value = 2;
        this.mouseDownTime = context.currentTime;
      }
    });
    this.forwardBtn.addEventListener('mouseup', () => {
      if (this.playing) {
        this.startTime = context.currentTime;
        this.source.playbackRate.value = 1;
        this.currentPosition += (context.currentTime - this.mouseDownTime) * 2; //Updates the position after the fast forward
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
    console.log('current position:' + this.currentPosition);
  }

  pause() {
    this.source.stop();
    this.updatePosition();
    console.log(this.currentPosition);
  }

  //Responsible for updating the global currentPosition value, needed to track position in song
  updatePosition() {
    this.currentPosition += context.currentTime - this.startTime;
  }
}