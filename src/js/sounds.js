'use strict';

var sounds = {

  source: undefined,
  context: undefined,

  init: function () {
    sounds.context = new (window.AudioContext || window.webkitAudioContext)();
  },

  play: function (id) {
    sounds.source = sounds.context.createBufferSource();
    sounds.source.connect(sounds.context.destination);
    sounds.getSoundBuffer(sounds.getSoundUrl(id));
  },

  getSoundBuffer: function (url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      sounds.context.decodeAudioData(request.response, function(buffer) {
        sounds.source.buffer = buffer;
        sounds.source.start(0);
      }, function () {});
    }
    request.send();
  },

  getSoundUrl: function (id) {
    if ( id === 48 ) {
      return 'src/sounds/0_gun.mp3';
    } else if ( id === 49 ) {
      return 'src/sounds/1_khaled.mp3';
    } else if ( id === 50 ) {
      return 'src/sounds/2_chicken.mp3';
    } else if ( id === 51 ) {
      return 'src/sounds/3_cops.mp3';
    } else if ( id === 52 ) {
      return 'src/sounds/4_airhorn.mp3';
    } else if ( id === 53 ) {
      return 'src/sounds/5_laser.mp3';
    } else if ( id === 54 ) {
      return 'src/sounds/6_snare.mp3';
    } else if ( id === 55 ) {
      return 'src/sounds/7_snap.mp3';
    } else if ( id === 56 ) {
      return 'src/sounds/8_clap.mp3';
    } else if ( id === 57 ) {
      return 'src/sounds/9_kick.mp3';
    }
  },

};
