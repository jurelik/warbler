const fs = require('fs');
const express = require('express');
const send = require('send');
const ytmp3 = require('youtube-mp3-downloader');

const server = express();
const YD = new ytmp3({
  'ffmpegPath': '/usr/local/bin/ffmpeg',
  'outputPath': 'public/downloads',
  'youtubeVideoQuality': 'highest'
});

server.use(express.static('./public'));

server.get('/download/:id', (req, res) => {
  console.log('request made');
  const id = req.params.id;

  YD.download(id, `${id}.mp3`);
  YD.on('finished', (err, data) => {
    console.log('file downloaded');
    res.end('sup');
  });

  // send(req, `public/downloads/${id}.mp3`).pipe(res);
})

server.listen(3000, () => {
  console.log('listening to 3000');
})
