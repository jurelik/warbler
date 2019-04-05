const async = require('async');
const fs = require('fs');
const express = require('express');
const send = require('send');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const retainFileTime = 10000; //How long to keep the file on the server in ms

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');
const server = express();

server.use(express.static('./public'));

server.get('/download/:id', (req, res) => {
  const id = req.params.id;
  let stream = ytdl(`https://www.youtube.com/watch?v=${id}`);
  
  ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`, (err, info) => {
    let noRepeat = true;

    fs.readdirSync('public/downloads').forEach(file => {
      if (file === `${info.title}.mp3`) {
        noRepeat = false;
        send(req, `public/downloads/${info.title}.mp3`).pipe(res);
      }
    });

    if (!err && noRepeat) {
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

      setTimeout(() => { // Delete file after x amount of time
        fs.unlink(`public/downloads/${info.title}.mp3`, err => {
          if(!err) {
            console.log(`file deleted: ${info.title}.mp3`);
          }
          else {
            console.log(err);
          }
        });
      }, retainFileTime);
    }
    else if (!err && !noRepeat) {
      console.log(`file already exists: ${info.title}.mp3`);
    }
    else { //Error handler
      console.log(err.message);
      res.status(400).end(err.message);
    }   
  });

  stream.on('error', err => { //Error handler
    console.log(err.message);
    res.status(400).end(err.message);
  });

});

server.listen(3000, () => {
  console.log('listening to 3000');
})
