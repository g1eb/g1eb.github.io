'use strict';

var sync = {

  init: function () {
    var config = {
      apiKey: "AIzaSyDQay2T6KjsxnwmnSTh08TmUS74riTrTwY",
      authDomain: "g1eb-ec7d8.firebaseapp.com",
      databaseURL: "https://g1eb-ec7d8.firebaseio.com",
      storageBucket: "g1eb-ec7d8.appspot.com",
      messagingSenderId: "1048759821961"
    };
    firebase.initializeApp(firebaseConfig);
  },

  getGroups: function () {
    var groupsRef = firebase.database().ref().child('groups');
    groupsRef.on('child_added', function(snapshot) {
      groups.add(snapshot.key, snapshot.val());
    });
    groupsRef.on('child_changed', function(snapshot) {
      groups.update(snapshot.key, snapshot.val());
    });
    groupsRef.on('child_removed', function(snapshot) {
      groups.remove(snapshot.key);
    });
  },

  addGroup: function (title) {
    var groupData = {
      created_at: new Date(),
      title: title,
    };

    var newGroupKey = firebase.database().ref().child('groups').push().key;

    var updates = {};
    updates['/groups/' + newGroupKey] = groupData;

    firebase.database().ref().update(updates);
    return newGroupKey;
  },

  updateGroup: function (group) {
    firebase.database().ref().child('groups').child(groups.key).update({
      updated_at: new Date(),
      title: group.title,
    });
  },

  removeGroup: function (key) {
    firebase.database().ref().child('groups').child(key).remove();
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
