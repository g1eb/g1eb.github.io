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
    firebase.database().ref('/themes/').once('value').then(function(snapshot) {
    });
  },

  addTheme: function (title, color) {
    var themeData = {
      created_at: new Date(),
      title: title,
      color: color,
      locked: false,
    };

    var newThemeKey = firebase.database().ref().child('themes').push().key;

    var updates = {};
    updates['/themes/' + newThemeKey] = themeData;

    firebase.database().ref().update(updates);
    return newThemeKey;
  },

  getFrames: function () {
    firebase.database().ref('/frames/').once('value').then(function(snapshot) {
      var data = snapshot.val();
      if ( !data ) { return; }
      var ids = Object.keys(data);
      for ( var i = 0; i < ids.length; i++ ) {
        frames.add(null, ids[i], data[ids[i]]);
      }
    });
  },

  addFrame: function (frame) {
    var frameData = {
      created_at: new Date(),
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

  updateFrame: function (frame) {
    firebase.database().ref().child('frames').child(frame.key).update({
      updated_at: new Date(),
      title: frame.data.title,
      c1: frame.data.c1,
      c2: frame.data.c2,
      c3: frame.data.c3,
      c4: frame.data.c4,
      c5: frame.data.c5,
      c6: frame.data.c6,
      c7: frame.data.c7,
      c8: frame.data.c8,
      c9: frame.data.c9,
      c10: frame.data.c10,
    });
   },

  removeFrame: function (key) {
    firebase.database().ref().child('frames').child(key).remove();
  },

};
