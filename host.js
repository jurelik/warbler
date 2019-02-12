const async = require('async');
const express = require('express');
const send = require('send');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');

const server = express();

server.use(express.static('./public'));

let queue = async.queue((task, callback) => {
  let stream = ytdl(`https://www.youtube.com/watch?v=${task.id}`);

  ffmpeg(stream)
  .audioCodec('libmp3lame')
  .audioBitrate(128)
  .toFormat('mp3')
  .save(`public/downloads/${task.id}.mp3`)
  .on('error', err => {
    console.log(err);
    callback(err)
  })
  .on('end', () => {
    send(task.req, `public/downloads/${task.id}.mp3`).pipe(task.res);
    callback('file sucessfully downloaded');
  });
}, 2);

queue.drain = function() {
  console.log('all items downloaded');
}

server.get('/download/:id', (req, res) => {
  queue.push({req: req, id: req.params.id, res: res}, err => {
    console.log(err);
  });

  //OLD CODE THAT CAN ONLY HANDLE ONE SIMULTANEOUS CONVERSION

  // const id = req.params.id;
  // let stream = ytdl(`https://www.youtube.com/watch?v=${id}`);

  // ffmpeg(stream)
  //   .audioCodec('libmp3lame')
  //   .audioBitrate(128)
  //   .toFormat('mp3')
  //   .save(`public/downloads/${id}.mp3`)
  //   .on('error', err => {
  //     console.log(err);
  //   })
  //   .on('end', () => {
  //     console.log('file downloaded');
  //     send(req, `public/downloads/${id}.mp3`).pipe(res);
  //   });
});

server.listen(3000, () => {
  console.log('listening to 3000');
})
