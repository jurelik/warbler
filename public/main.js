const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

class Tape {
  constructor() {
    this.buffer;
  }

  test() {
    this.buffer = 'sup';
    console.log(this.buffer);
  }
}

let tape = new Tape();