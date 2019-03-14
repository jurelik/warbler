class Tape {
  constructor() {
    this.buffer; //buffer for the loaded song
    this.revBuffer; //reversed buffer for the loaded song
    this.source; //buffer source global variable
    this.playing = false; //playing status
    this.duration; //song lengths in seconds
    this.currentPosition = 0; //current position of song in seconds
    this.currentPlaybackRate = 1; //speed of playback
    this.currentWowPosition = 0; //keeps track of how the wow changes the playbackRate
    this.startTime; //updates whenever the play() method is called
    this.wowTimeout; //setTimeout for the wow() method
    this.flutterTimeout; //setTimout for the flutter method
    this.wowDepth = 0; //amount of wow
    this.wowSpeed = 0; //in Hz
    this.flutterDepth = 0; //amount of flutter
    this.flutterSpeed = 0; //in Hz

    this.flutterTempSpeed = 0;
    this.flutterTempDepth = 0;

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
        clearTimeout(this.wowTimeout);
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
        clearTimeout(this.wowTimeout);
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
      this.wowDepth = this.wowDepthSlider.value;
    });

    //Wow Speed Slider
    this.wowSpeedSlider = document.getElementById('wow-speed');
    this.wowSpeedSlider.addEventListener('input', () => {
      console.log(this.wowSpeedSlider.value);
      this.wowSpeed = this.wowSpeedSlider.value;
    });

    //Flutter Depth Slider
    this.flutterDepthSlider = document.getElementById('flutter-depth');
    this.flutterDepthSlider.addEventListener('input', () => {
      this.flutterDepth = this.flutterDepthSlider.value;
    });

    //Flutter Speed Slider
    this.flutterSpeedSlider = document.getElementById('flutter-speed');
    this.flutterSpeedSlider.addEventListener('input', () => {
      this.flutterSpeed = this.flutterSpeedSlider.value;
      console.log(this.flutterSpeedSlider.value);
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
    })
    .catch(error => {
      console.error(error);
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
          clearTimeout(this.wowTimeout);
          this.currentPosition = 0;
          this.playing = false;
          this.playBtnIcon.className = "fas fa-play";
        }
      }.bind(this);

      this.wow();
      this.flutter();
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
    if (this.playing) {
      this.source.stop();
      clearTimeout(this.wowTimeout);
      clearTimeout(this.flutterTimeout);
    }
    else {
      console.error('Error: Nothing is playing');
    }
  }

  //Responsible for updating the global currentPosition value, needed to track position in song
  updatePosition() {
    this.currentPosition += context.currentTime - this.startTime;
  }

  randomFlutterDepth() {
    return Math.random() * (2 * this.flutterDepth) - this.flutterDepth;
  }

  randomFlutterSpeed() {
    let random = this.flutterSpeed + (Math.random() * (2* this.flutterSpeed) - this.flutterSpeed);
    console.log(random);
    return random;
  }

  randomFlutterRefresh() {
    let random = Math.abs(1000 / this.flutterTempSpeed);
    // console.log(random);
    return random;
  }

  wow() {
    this.wowTimeout = setTimeout(() => {
      this.currentWowPosition = this.currentPlaybackRate + (this.wowDepth) * Math.sin(this.wowSpeed * Math.PI * context.currentTime) + this.flutterTempDepth * Math.sin(this.flutterTempSpeed * Math.PI * context.currentTime);
      this.source.playbackRate.value = this.currentWowPosition;
      this.wow();
    }, 5);
  }

  // flutter() {
  //   this.flutterTimeout = setTimeout(() => {
  //     console.log('sup');
  //     this.source.playbackRate.value = this.currentWowPosition + this.randomFlutterDepth() * Math.sin(this.randomFlutterSpeed() * Math.PI * context.currentTime);
  //     this.flutter();
  //   }, 1000 / this.randomFlutterSpeed());
  // }

  flutter() {
    this.flutterTimeout = setTimeout(() => {
      this.flutterTempDepth = this.randomFlutterDepth();
      this.flutterTempSpeed = this.randomFlutterSpeed();
      this.flutter();
    }, this.randomFlutterRefresh());
  }
  
}