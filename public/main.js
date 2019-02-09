const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

class Tape {
  constructor() {
    this.buffer;
    this.revBuffer;
  }

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
    const source = context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(context.destination);
    source.start();
  }
}

let tape = new Tape();
