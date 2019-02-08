const fs = require('fs');
const express = require('express');
const send = require('send');
const ytmp3 = require('youtube-mp3-downloader');

const server = express();

server.use(express.static('./public'));

server.get('/download/', (req, res) => {
  console.log('req made');
  send(req, 'public/downloads/comp 250.mp3').pipe(res);
})

server.listen(3000, () => {
  console.log('listening to 3000');
})
