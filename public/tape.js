class Tape {
  constructor() {
    this.buffer;
    this.revBuffer;
    this.source;
    this.playing = false;
    this.duration;
    this.currentPosition = 0;
    this.currentPlaybackRate = 1;
    this.startTime;
    this.warbleTimeout;
    this.wowDepth = 0.03;
    this.wowSpeed = 2; //in Hz
    this.flutterDepth = 0.03;
    this.flutterSpeed = 20 //in Hz

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
        this.currentPlaybackRate = 1.5;
        this.source.playbackRate.value = this.currentPlaybackRate;
        this.mouseDownTime = context.currentTime;
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.play(this.buffer);
        this.currentPlaybackRate = 1.5;
        this.source.playbackRate.value = this.currentPlaybackRate;
        this.mouseDownTime = context.currentTime;
      }
      else { //If no song is loaded
        console.error('Error: No sound loaded');
      }
    });
    this.forwardBtn.addEventListener('mouseup', () => {
      if (this.playing && this.buffer != null) { //If song is playing
        this.startTime = context.currentTime;
        this.currentPlaybackRate = 1;
        this.source.playbackRate.value = this.currentPlaybackRate;
        this.currentPosition += (context.currentTime - this.mouseDownTime) * 1.5; //Updates the position after the fast forward
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.source.stop();
        clearTimeout(this.warbleTimeout);
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
        clearTimeout(this.warbleTimeout);
        this.updatePosition(); //Updates the position until this moment
        this.play(this.revBuffer);
        this.currentPlaybackRate = 1.5;
        this.source.playbackRate.value = this.currentPlaybackRate;
        this.mouseDownTime = context.currentTime;
      }
      else if (!this.playing && this.buffer != null) { //If song is not playing
        this.play(this.revBuffer);
        this.currentPlaybackRate = 1.5;
        this.source.playbackRate.value = this.currentPlaybackRate;
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

    //Wow Depth Slider
    this.wowDepthSlider = document.getElementById('wow-depth');
    this.wowDepthSlider.addEventListener('input', () => {
      console.log(this.wowDepthSlider.value);
      this.wowDepth = parseFloat(this.wowDepthSlider.value);
    });

    //Wow Speed Slider
    this.wowSpeedSlider = document.getElementById('wow-speed');
    this.wowSpeedSlider.addEventListener('input', () => {
      console.log(this.wowSpeedSlider.value);
      this.wowSpeed = this.wowSpeedSlider.value;
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
        console.log(this.buffer);
        console.log('download complete');
      });
      context.decodeAudioData(reverse, decoded => { //Decode and reverse channel data
        this.revBuffer = decoded;
        if (this.revBuffer.numberOfChannels === 1) {
          this.revBuffer.getChannelData(0).reverse();
        }
        else if (this.revBuffer.numberOfChannels === 2) {
        this.revBuffer.getChannelData(0).reverse();
        this.revBuffer.getChannelData(1).reverse();
        }
        else {
          console.error('Error: Something went wrong when decoding audio');
        }
      });
    });
  }

  play(buffer) {
    if (buffer === this.buffer) { //If playing forward
      this.source = context.createBufferSource();
      this.source.buffer = buffer;
      this.currentPlaybackRate = 1;
      this.source.playbackRate.value = this.currentPlaybackRate;
      this.source.connect(context.destination);
      this.source.start(context.currentTime, this.currentPosition);
      this.startTime = context.currentTime; //Keep track of when play was pressed
      
      this.source.onended = function() { //In case song comes to an end
        this.updatePosition();
        if (this.currentPosition >= this.buffer.duration - 0.01) {
          console.log(this.currentPosition);
          console.log('ended');
          clearTimeout(this.warbleTimeout);
          this.currentPosition = 0;
          this.playing = false;
          this.playBtnIcon.className = "fas fa-play";
        }
      }.bind(this);

      this.warble();
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
    clearTimeout(this.warbleTimeout);
    // this.updatePosition();
  }

  //Responsible for updating the global currentPosition value, needed to track position in song
  updatePosition() {
    this.currentPosition += context.currentTime - this.startTime;
  }

  randomFlutter() {
    return Math.random() * (2 * this.flutterDepth) - this.flutterDepth;
  }

  warble() {
    this.warbleTimeout = setTimeout(() => {
      this.source.playbackRate.value = this.currentPlaybackRate + (this.wowDepth) * Math.sin(this.wowSpeed * Math.PI * context.currentTime);
      this.warble();
    }, 5);
  }

  // warble(shape) {
  //   if (shape === 'square') {
  //     this.warbleTimeout = setTimeout(() => {
  //       if (this.warbleCycle) { 
  //         this.source.playbackRate.value = this.currentPlaybackRate + this.warbleDepth;
  //         this.warbleCycle = false;
  //         this.warble('square');
  //       }
  //       else {
  //         this.source.playbackRate.value = this.currentPlaybackRate - this.warbleDepth;
  //         this.warbleCycle = true;
  //         this.warble('square');
  //       }
  //     }, 1000 / this.warbleSpeed);
  //   }
  //   else if (shape === 'sine') {
  //     this.warbleTimeout = setTimeout(() => {
  //       //sin('rate in Hz' * 'pi' * 'current time') * 'amplitude aka warble depth'
  //       this.source.playbackRate.value = this.currentPlaybackRate + Math.sin(this.warbleSpeed * Math.PI * context.currentTime) * (this.warbleDepth);
  //       this.warble('sine');
  //     }, 100);
  //   }
  //   else if (shape === 'random') {
  //     this.warbleTimeout = setTimeout(() => {
  //       this.source.playbackRate.value = this.currentPlaybackRate + this.randomFlux();
  //       this.warble('random');
  //     }, 1000 / this.warbleSpeed); 
  //   }
  //   else if (shape === 'sinerandom') {
  //     this.warbleTimeout = setTimeout(() => {
  //       this.source.playbackRate.value = this.currentPlaybackRate + Math.sin(this.warbleSpeed * Math.PI * context.currentTime) * (this.warbleDepth + this.randomFlux());
  //       this.warble('sinerandom');
  //     }, 50)
  //   }
  // }
}