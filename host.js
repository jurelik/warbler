const async = require('async');
const express = require('express');
const send = require('send');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');

const server = express();

server.use(express.static('./public'));

let queue = async.queue((task, callback) => {
  setTimeout(() => {
    console.log('done!');
    callback();
  }, 1000);
}, 2);

server.get('/test', (req, res) => {
  queue.push({name: req.params.id}, err => {
    console.log(err);
  });
  res.end();
})

server.get('/download/:id', (req, res) => {
  const id = req.params.id;
  let stream = ytdl(`https://www.youtube.com/watch?v=${id}`);

  ffmpeg(stream)
    .audioCodec('libmp3lame')
    .audioBitrate(128)
    .toFormat('mp3')
    .save(`public/downloads/${id}.mp3`)
    .on('error', err => {
      console.log(err);
    })
    .on('end', () => {
      console.log('file downloaded');
      send(req, `public/downloads/${id}.mp3`).pipe(res);
    });
});

server.listen(3000, () => {
  console.log('listening to 3000');
})
