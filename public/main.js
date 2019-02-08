const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

class Tape {
  constructor() {
    this.buffer;
    this.revBuffer;
  }

  load(id) {
    fetch(`http://localhost:3000/download/${id}`)
    .then(res => {
      console.log(res);
    })
    // .then(res => {
    //   return res.arrayBuffer();
    // })
    // .then(res => {
    //   context.decodeAudioData(res, decoded => {
    //     this.buffer = decoded;
    //     console.log('audio decoded');
    //     console.log(this.buffer);
    //   });
    // })
    .catch(err => {
      console.log(err);
    });





    // fetch(`http://localhost:3000/download/${id}`)
    // .then(res => {
    //   return res.arrayBuffer();
    // })
    // .then(res => {
    //   context.decodeAudioData(res, decoded => {
    //     this.buffer = decoded;
    //     console.log('audio decoded');
    //     console.log(this.buffer);
    //   });
    // })
    // .catch(err => {
    //   console.log(err);
    // });

    // let request = new XMLHttpRequest();
    // request.open('GET', `http://localhost:3000/download/${id}`, true);
    // // request.responseType = 'arraybuffer';
    // request.onload = function() {
    //   console.log(request.response);
    //   // context.decodeAudioData(request.response, decoded => {
    //   //   console.log('audio decoded');
    //   // });
    // };
    // request.send();
  }
}

let tape = new Tape();
