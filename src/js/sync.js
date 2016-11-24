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
    var themesRef = firebase.database().ref().child('themes');
    themesRef.on('child_added', function(snapshot) {
      themes.add(snapshot.key, snapshot.val());
    });
    themesRef.on('child_changed', function(snapshot) {
      themes.update(snapshot.key, snapshot.val());
    });
    themesRef.on('child_removed', function(snapshot) {
      themes.remove(snapshot.key);
    });
  },

  addTheme: function (title, color) {
    var themeData = {
      created_at: new Date(),
      title: title,
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

  getNotes: function () {
    var notesRef = firebase.database().ref().child('notes');
    notesRef.on('child_added', function(snapshot) {
      notes.add(snapshot.key, snapshot.val());
    });
    notesRef.on('child_changed', function(snapshot) {
      notes.update(snapshot.key, snapshot.val());
    });
    notesRef.on('child_removed', function(snapshot) {
      notes.remove(snapshot.key);
    });
  },

  addNote: function (note) {
    var noteData = {
      created_at: new Date(),
      title: 'New Note',
      xpos: note.xpos,
      ypos: note.ypos,
      zpos: note.zpos,
      yrot: note.yrot,
    };

    var newNoteKey = firebase.database().ref().child('notes').push().key;

    var updates = {};
    updates['/notes/' + newNoteKey] = noteData;

    firebase.database().ref().update(updates);
    return newNoteKey;
  },

  updateNoteText: function (note) {
    firebase.database().ref().child('notes').child(note.key).update({
      updated_at: new Date(),
      title: note.data.title,
      c1: note.data.c1,
      c2: note.data.c2,
      c3: note.data.c3,
      c4: note.data.c4,
      c5: note.data.c5,
      c6: note.data.c6,
      c7: note.data.c7,
      c8: note.data.c8,
      c9: note.data.c9,
      c10: note.data.c10,
    });
  },

  updateNotePosition: function (note) {
    firebase.database().ref().child('notes').child(note.key).update({
      updated_at: new Date(),
      xpos: note.position.x,
      ypos: note.position.y,
      zpos: note.position.z,
      yrot: note.rotation.y,
    });
  },

  removeNote: function (key) {
    firebase.database().ref().child('notes').child(key).remove();
  },

};
