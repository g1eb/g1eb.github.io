'use strict';

var sounds = {

  buffers: [
    'src/sounds/fx.mp3',
    'src/sounds/piano1.mp3',
    'src/sounds/piano2.mp3',
    'src/sounds/piano3.mp3',
    'src/sounds/organ.mp3',
    'src/sounds/synth1.mp3',
    'src/sounds/synth2.mp3',
    'src/sounds/pad.mp3',
    'src/sounds/beat1.mp3',
    'src/sounds/beat2.mp3',
  ],

  sources: {},

  context: undefined,

  init: function () {
    sounds.context = new (window.AudioContext || window.webkitAudioContext)();
    sounds.fetchSoundBuffers();
  },

  play: function (id) {
    if ( !!sounds.sources[id] ) {
      sounds.sources[id].loop = false;
      delete sounds.sources[id];
    } else {
      var source = sounds.context.createBufferSource();
      source.connect(sounds.context.destination);
      source.buffer = sounds.buffers[id-48];
      source.loop = true;
      source.start(0);
      sounds.sources[id] = source;
    }
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
