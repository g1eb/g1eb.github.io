'use strict';

var sync = {

  init: function () {
    var firebaseConfig = {
      apiKey: "AIzaSyA3gqIafZqld758_sYF1aCaaTSxbOsWxIM",
      authDomain: "frames-5a6a9.firebaseapp.com",
      databaseURL: "https://frames-5a6a9.firebaseio.com",
      storageBucket: "frames-5a6a9.appspot.com",
      messagingSenderId: "890296336721"
    };
    firebase.initializeApp(firebaseConfig);
  },

  getThemes: function () {
    return firebase.database().ref('/themes/').once('value').then(function(snapshot) {
    });
  },

  addTheme: function (title, color) {
    var themeData = {
      title: title,
      color: color,
      locked: false,
    };
  
    var newThemeKey = firebase.database().ref().child('themes').push().key;
  
    var updates = {};
    updates['/themes/' + newThemeKey] = themeData;
  
    return firebase.database().ref().update(updates);
  },

  getFrames: function () {
    return firebase.database().ref('/frames/').once('value').then(function(snapshot) {
      var data = snapshot.val();
      var ids = Object.keys(data);
      for ( var i = 0; i < ids.length; i++ ) {
        frames.add(null, data[ids[i]]);
      }
    });
  },

  addFrame: function (frame) {
    var frameData = {
      title: frame.title,
      xpos: frame.xpos,
      ypos: frame.ypos,
      angle: frame.angle,
    };
  
    var newFrameKey = firebase.database().ref().child('frames').push().key;
  
    var updates = {};
    updates['/frames/' + newFrameKey] = frameData;
  
    firebase.database().ref().update(updates);
    return newFrameKey;
  },


};
