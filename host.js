const async = require('async');
const fs = require('fs');
const express = require('express');
const send = require('send');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');
const server = express();

server.use(express.static('./public'));

server.get('/download/:id', (req, res) => {
  const id = req.params.id;
  let title = 'poop';
  let stream = ytdl(`https://www.youtube.com/watch?v=${id}`);
  ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`, (err, info) => {
    if (err) {
      console.log(err.message);
      res.status(400).end(err.message);
    }
    else {
      ffmpeg(stream)
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .toFormat('mp3')
      .save(`public/downloads/${info.title}.mp3`)
      .on('error', err => {
        console.log(err.message);
      })
      .on('end', () => {
        console.log('file downloaded');
        send(req, `public/downloads/${info.title}.mp3`).pipe(res);
      });
    }   
  });

  stream.on('error', err => {
    console.log(err.message);
    res.status(400).end(err.message);
  });

});

server.listen(3000, () => {
  console.log('listening to 3000');
})
