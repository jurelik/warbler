class Tape {
  constructor() {
    this.buffer; //buffer for the loaded song
    this.revBuffer; //reversed buffer for the loaded song
    this.source; //buffer source global variable
    this.playing = false; //playing status
    this.duration; //song lengths in seconds
    this.currentPosition = 0; //current position of song in seconds
    this.currentPlaybackRate = 1; //speed of playback
    this.startTime; //updates whenever the play() method is called
    this.wowTimeout; //setTimeout for the wow() method
    this.flutterTimeout; //setTimout for the flutter method
    this.wowDepth = 0; //amount of wow
    this.wowSpeed = 0; //in Hz
    this.flutterAmount = 0; //amount of flutter
    this.flutterSine = 0; //sine function of flutter
    this.compressorState = false;
    this.reverseState = false;

    //
    //AUDIO NODES
    //

    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = -30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.1;
    this.compressor.release.value = 0.02;

    this.lowpassFilter = context.createBiquadFilter();
    this.lowpassFilter.type = "lowpass";
    this.lowpassFilter.frequency.value = 5000;

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

    //Flutter Slider
    this.flutterSlider = document.getElementById('flutter');
    this.flutterSlider.addEventListener('input', () => {
      this.flutterAmount = this.flutterSlider.value;
    });
  }

  //
  //METHODS
  //

  load(id) {
    let error;
    fetch(`http://localhost:3000/download/${id}`)
    .then((res) => {
      if (res.ok) { //Check if there was an error on the server
        return res.arrayBuffer(); //If not, continue as planned
      }
      else {
        return res.text(); //Else, server sends an error message that needs to be sent forward
      } 
    })
    .then(res => {
      if (typeof res != 'string') { // Check if the response is a string (meaning there was an error)
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
      }
      else {
        throw new Error(res);
      }  
    })
    .catch(err => {
      console.log(err.message);
    });
  }

  play(buffer) {
    if (buffer === this.buffer) { //If playing forward
      this.source = context.createBufferSource();
      this.source.buffer = buffer;
      this.currentPlaybackRate = 1;
      this.source.playbackRate.value = this.currentPlaybackRate;
      this.reverseState = false;
      if (!this.compressorState) {
        this.source.connect(context.destination);
      }
      else {
        this.source.connect(this.compressor);
      }
      this.source.start(context.currentTime, this.currentPosition);
      this.startTime = context.currentTime; //Keep track of when play was pressed
      
      this.source.onended = function() { //In case song comes to an end
        if(!this.reverseState) { //Only do this if song is playing forwards
          this.updatePosition();
          if (this.currentPosition >= this.buffer.duration - 0.01) {
            console.log(this.currentPosition);
            console.log('ended');
            clearTimeout(this.wowTimeout);
            this.currentPosition = 0;
            this.playing = false;
            this.playBtnIcon.className = "fas fa-play";
          }
        }
      }.bind(this);

      this.wow();
      this.flutter();
      console.log('current position:' + this.currentPosition);
    }
    else if (buffer === this.revBuffer) { //If playing backwards
      this.source = context.createBufferSource();
      this.source.buffer = buffer;
      this.reverseState = true;

      if (!this.compressorState) {
        this.source.connect(context.destination);
      }
      else {
        this.source.connect(this.compressor);
      }
      
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

  //Wow effect
  wow() {
    this.wowTimeout = setTimeout(() => {
      this.source.playbackRate.value = this.currentPlaybackRate + (this.wowDepth) * Math.sin(this.wowSpeed * Math.PI * context.currentTime) + this.flutterSine;
      this.wow();
    }, 5);
  }

  //Flutter effect
  flutter() {
    this.flutterTimeout = setTimeout(() => {
      this.flutterSine = this.randomFlutterDepth() * Math.sin(this.randomFlutterSpeed() * Math.PI * context.currentTime);
      this.flutter();
    }, 1000 / this.randomFlutterChange());
  }

  randomFlutterChange() {
    return Math.random() * 20 + 20;
  }

  randomFlutterDepth() {
    return Math.random() * this.flutterAmount;
  }

  randomFlutterSpeed() {
    return Math.random() * 190 + 10;
  }

  //Compressor Toggle
  compressorToggle() {
    if (!this.compressorState && this.playing) {
      this.source.disconnect(context.destination);
      this.source.connect(this.compressor);
      this.compressor.connect(this.lowpassFilter);
      this.lowpassFilter.connect(context.destination);
      this.compressorState = true;
    }
    else if (this.compressorState && this.playing) {
      this.source.disconnect(this.compressor);
      this.source.connect(context.destination);
      this.compressorState = false;
    }
  }
  
}