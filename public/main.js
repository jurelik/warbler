const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

let tape = new Tape();

function testRegex(id) {
  let string = id.split('v=');
  console.log(string);
}