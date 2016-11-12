'use strict';

var sounds = {

  buffers: [
    'src/sounds/0_kick.mp3',
    'src/sounds/1_chicken.mp3',
    'src/sounds/2_click.mp3',
    'src/sounds/3_gun.mp3',
    'src/sounds/4_cops.mp3',
    'src/sounds/5_khaled.mp3',
    'src/sounds/6_laser.mp3',
    'src/sounds/7_airhorn.mp3',
    'src/sounds/8_snare.mp3',
    'src/sounds/9_clap.mp3',
  ],

  context: undefined,

  init: function () {
    sounds.context = new (window.AudioContext || window.webkitAudioContext)();
    sounds.fetchSoundBuffers();
  },

  play: function (id) {
    var source = sounds.context.createBufferSource();
    source.connect(sounds.context.destination);
    source.buffer = sounds.buffers[id-48];
    source.start(0);
  },

  fetchSoundBuffers: function () {
    for ( var i = 0; i < 10; i++ ) {
      (function(i) {
        var request = new XMLHttpRequest();
        request.open('GET', sounds.buffers[i], true);
        request.responseType = 'arraybuffer';
        request.onload = function (data) {
          sounds.context.decodeAudioData(request.response, function(buffer) {
            sounds.buffers[i] = buffer;
          }, function (err) {
            console.log('sounds err: ', err);
          });
        }
        request.send();
      })(i);
    }
  },

};
