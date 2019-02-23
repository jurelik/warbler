class Tape {
  constructor() {
    this.buffer;
    this.revBuffer;
    this.source;
    this.playing = false;
    this.duration;
    this.currentPosition = 0;
    this.startTime;

    //
    //DOM OBJECTS
    //

    //Play Button
    this.playBtn = document.getElementById('play-pause');
    this.playBtnIcon = document.getElementById('play-pause-icon');
    this.playBtn.addEventListener('click', () => {
      if(!this.playing && this.buffer != null) { //If song is not playing
        this.play(this.buffer);
        this.playing = true;
        this.playBtnIcon.className = "fas fa-pause";
      }
      else if (this.playing && this.buffer != null){ //If song is playing
        this.pause();
        this.playing = false;
        this.playBtnIcon.className = "fas fa-play";
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded');
      }
    });

    //Forward Button
    this.forwardBtn = document.getElementById('forward');
    this.forwardBtn.addEventListener('mousedown', () => {
      if (this.playing && this.buffer != null) { //If song is playing
        this.updatePosition(); //Updates the position until this moment
        this.source.playbackRate.value = 1.5;
        this.mouseDownTime = context.currentTime;
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.play(this.buffer);
        this.source.playbackRate.value = 1.5;
        this.mouseDownTime = context.currentTime;
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded');
      }
    });
    this.forwardBtn.addEventListener('mouseup', () => {
      if (this.playing && this.buffer != null) { //If song is playing
        this.startTime = context.currentTime;
        this.source.playbackRate.value = 1;
        this.currentPosition += (context.currentTime - this.mouseDownTime) * 1.5; //Updates the position after the fast forward
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.source.stop();
        this.currentPosition += (context.currentTime - this.mouseDownTime) * 1.5;
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded');
      }
    });

    //Rewind Button
    this.rewindBtn = document.getElementById('rewind');
    this.rewindBtn.addEventListener('mousedown', () => {
      if (this.playing && this.buffer != null) { //If song is playing
        this.source.stop();
        this.updatePosition(); //Updates the position until this moment
        this.play(this.revBuffer);
        this.source.playbackRate.value = 1.5;
        this.mouseDownTime = context.currentTime;
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.play(this.revBuffer);
        this.source.playbackRate.value = 1.5;
        this.mouseDownTime = context.currentTime;
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded')
      }
    });
    this.rewindBtn.addEventListener('mouseup', () => {
      if(this.playing && this.buffer != null) { //If song is playing
        this.source.stop();
        this.currentPosition -= (context.currentTime - this.mouseDownTime) * 1.5; //Updates the position until this moment
        if (this.currentPosition < 0) { //Make sure currentPosition doesn't go below 0
          this.currentPosition = 0;
        }
        this.play(this.buffer);
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.source.stop();
        this.currentPosition -= (context.currentTime - this.mouseDownTime) * 1.5;
        if (this.currentPosition < 0) {
          this.currentPosition = 0;
        }
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded');
      }
    });

    //Rewind-Full Button
    this.rewindFullBtn = document.getElementById('rewind-full');
    this.rewindFullBtn.addEventListener('click', () => {
      if (this.playing && this.buffer != null) { //If song is playing
        this.source.stop();
        this.currentPosition = 0;
        this.play(this.buffer);
      }
      else if (!this.playing && this.buffer != null){ //If song is not playing
        this.currentPosition = 0;
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded')
      }
    });
  }

  //
  //METHODS
  //

  load(id) {
    fetch(`http://localhost:3000/download/${id}`)
    .then((res) => {
      return res.arrayBuffer();
    })
    .then(res => {
      let reverse = res.slice(); //Making a copy of the array buffer in order to store a reverse version
      context.decodeAudioData(res, decoded => {
        this.buffer = decoded;
        this.duration = this.buffer.duration;
        console.log('download complete');
      });
      context.decodeAudioData(reverse, decoded => { //Decode and reverse channel data
        this.revBuffer = decoded;
        this.revBuffer.getChannelData(0).reverse();
        this.revBuffer.getChannelData(1).reverse();
      });
    });
  }

  play(buffer) {
    if (buffer === this.buffer) { //If playing forward
      this.source = context.createBufferSource();
      this.source.buffer = buffer;
      this.source.connect(context.destination);
      this.source.start(context.currentTime, this.currentPosition);
      this.startTime = context.currentTime;
    console.log('current position:' + this.currentPosition);
    }
    else if (buffer === this.revBuffer) { //If playing backwards
      this.source = context.createBufferSource();
      this.source.buffer = buffer;
      this.source.connect(context.destination);
      this.source.start(context.currentTime, this.duration - this.currentPosition);
    }
    else {
      console.error('Error: No buffer found in the play method');
    }
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