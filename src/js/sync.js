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

  getSettings: function () {
    var settingsRef = firebase.database().ref().child('settings');
    settingsRef.once('value').then(function(snapshot) {
      settings.data = snapshot.val();
      settings.setBranding();
    });
  },

  updateSettings: function (data) {
    var settingsRef = firebase.database().ref().child('settings');
    settingsRef.update({
      color: data.color,
      background: data.background,
      branding: data.branding,
    });
  },

  getThemes: function () {
    var framesRef = firebase.database().ref().child('themes');
    framesRef.on('child_added', function(snapshot) {
      themes.add(snapshot.key, snapshot.val());
    });
    framesRef.on('child_changed', function(snapshot) {
      themes.update(snapshot.key, snapshot.val());
    });
    framesRef.on('child_removed', function(snapshot) {
      themes.remove(snapshot.key);
    });
  },

  addTheme: function (title, color) {
    var themeData = {
      created_at: new Date(),
      title: title,
      locked: false,
    };

    var newThemeKey = firebase.database().ref().child('themes').push().key;

    var updates = {};
    updates['/themes/' + newThemeKey] = themeData;

    firebase.database().ref().update(updates);
    return newThemeKey;
  },

  updateTheme: function (theme) {
    firebase.database().ref().child('themes').child(themes.key).update({
      updated_at: new Date(),
      title: theme.title,
      color: theme.color,
      lat: theme.lat,
      lng: theme.lng,
    });
  },

  removeTheme: function (key) {
    firebase.database().ref().child('themes').child(key).remove();
  },

  getFrames: function () {
    var framesRef = firebase.database().ref().child('frames');
    framesRef.on('child_added', function(snapshot) {
      frames.add(snapshot.key, snapshot.val());
    });
    framesRef.on('child_changed', function(snapshot) {
      frames.update(snapshot.key, snapshot.val());
    });
    framesRef.on('child_removed', function(snapshot) {
      frames.remove(snapshot.key);
    });
  },

  addFrame: function (frame) {
    var frameData = {
      created_at: new Date(),
      title: 'New Frame',
      xpos: frame.xpos,
      ypos: frame.ypos,
      zpos: frame.zpos,
      yrot: frame.yrot,
    };

    var newFrameKey = firebase.database().ref().child('frames').push().key;

    var updates = {};
    updates['/frames/' + newFrameKey] = frameData;

    firebase.database().ref().update(updates);
    return newFrameKey;
  },

  updateFrameText: function (frame) {
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

  updateFramePosition: function (frame) {
    firebase.database().ref().child('frames').child(frame.key).update({
      updated_at: new Date(),
      xpos: frame.position.x,
      ypos: frame.position.y,
      zpos: frame.position.z,
      yrot: frame.rotation.y,
    });
  },

  removeFrame: function (key) {
    firebase.database().ref().child('frames').child(key).remove();
  },

};
