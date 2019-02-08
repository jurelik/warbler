const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

class Tape {
  constructor() {
    this.buffer;
    this.revBuffer;
  }

  load(id) {
    fetch(`http://localhost:3000/download/${id}`)
    .then(() => {
      fetch(`http://localhost:3000/stream/${id}`)
      .then(res => {
        return res.arrayBuffer();
      })
      .then(res => {
        context.decodeAudioData(res, decoded => {
          this.buffer = decoded;
          console.log('audio decoded');
        });
      })
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });
  }
}

let tape = new Tape();
