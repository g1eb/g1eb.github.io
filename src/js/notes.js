'use strict';

var notes = {

  list: [],

  settings: {
    width: 1024,
    height: 1024,
    ambientColor: 0xffffff,
    diffuseColor: 0xf5f5f5,
    distance: 3000,
  },

  active: undefined,

  geometry: undefined,
  material: undefined,

  init: function () {
    notes.getGeometry();
    notes.getMaterial();

    sync.getNotes();
  },

  getGeometry: function () {
    notes.geometry = new THREE.PlaneGeometry(notes.settings.width, notes.settings.height, 1, 1);
  },

  getMaterial: function () {
    notes.material = new THREE.MeshPhongMaterial({
      color: notes.settings.ambientColor,
      emissive: notes.settings.diffuseColor,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 0.25,
    });
  },

  calcPosition: function (event) {
    var hsf = 1.75;
    var vsf = hsf * 1000;
    var hfov = app.camera.fov / 180 * Math.PI;
    var vfov = hfov / window.innerWidth * window.innerHeight;
    var xoffset = event.clientX - window.innerWidth / 2;
    var yoffset = event.clientY - window.innerHeight / 2;
    var angleY = app.camera.rotation.y - hsf * xoffset / (window.innerWidth * hfov);
    angleY = angleY - (Math.floor(angleY / (2 * Math.PI)) * 2 * Math.PI);
    var angleX = -1 * vsf * yoffset / (window.innerHeight * vfov);

    return {
      xpos: notes.settings.distance * Math.cos(Math.PI / 2 * 3 - angleY),
      ypos: app.camera.position.y + angleX,
      zpos: notes.settings.distance * Math.sin(Math.PI / 2 * 3 - angleY),
      yrot: angleY,
    };
  },

  add: function (key, data) {
    var note = new THREE.Mesh(notes.geometry, notes.material);
    note.position.x = data.xpos;
    note.position.y = data.ypos;
    note.position.z = data.zpos;
    note.rotation.y = data.yrot;

    note.key = key;
    note.data = data;
    app.scene.add(note);
    notes.drawText(note);
    notes.list.push(note);
  },

  drawText: function (note) {
    if ( !!note.text ) {
      app.scene.remove(note.text);
    }

    var noteTextCanvas = document.createElement('canvas');
    noteTextCanvas.width = notes.settings.width;
    noteTextCanvas.height = notes.settings.height;
    var noteTextContext = noteTextCanvas.getContext('2d');
    noteTextContext.font = 'Normal 50px Arial';
    noteTextContext.textAlign = 'left';
    noteTextContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
    noteTextContext.fillText(note.data.title, 100, 125);

    for ( var j = 0; j < 10; j++ ) {
      noteTextContext.fillText(note.data['c'+(j+1)] || '', 100, (275 + 75*j));
    }

    var noteTextTexture = new THREE.Texture(noteTextCanvas);
    noteTextTexture.needsUpdate = true;
    var noteTextMaterial = new THREE.MeshBasicMaterial({
      map: noteTextTexture,
      side: THREE.DoubleSide,
    });
    noteTextMaterial.transparent = true;
    noteTextMaterial.opacity = 1;
    var noteTextGeometry = new THREE.PlaneGeometry(notes.settings.width, notes.settings.height);
    var noteText = new THREE.Mesh(notes.geometry, noteTextMaterial);
    noteText.position.copy(note.position);
    noteText.rotation.copy(note.rotation);

    note.text = noteText;
    app.scene.add(noteText);
    app.dirty = true;
  },

  prefillInputs: function (data) {
    document.getElementById('note-edit--title').value = data.title;
    for ( var j = 0; j < 10; j++ ) {
      document.getElementById('note-edit--c'+(j+1)).value = data['c'+(j+1)] || '';
    }
  },

  open: function (note) {
    notes.prefillInputs(notes.active.data);
    document.getElementById('note-edit').style.display = 'flex';
    events.bindNoteEditButtons();
    app.dirty = true;
  },

  close: function (note) {
    document.getElementById('note-edit').style.display = 'none';
    events.unbindNoteEditButtons();
    delete notes.active;
    app.dirty = true;
  },

  update: function (key, data) {
    for ( var i = 0; i < notes.list.length; i++ ) {
      if ( notes.list[i].key === key ) {
        var updatedNote = notes.list[i];
        updatedNote.position.x = data.xpos;
        updatedNote.position.y = data.ypos;
        updatedNote.position.z = data.zpos;
        updatedNote.rotation.y = data.yrot;
        for ( var j = 0; j < 10; j++ ) {
          updatedNote.data['c'+(j+1)] = data['c'+(j+1)];
        }
        updatedNote.data.title = data.title;
        notes.drawText(updatedNote);
      }
    }

    if ( !!notes.active && notes.active.key === key ) {
      notes.active.data = data;
      notes.prefillInputs(notes.active.data);
    }
  },

  updateActive: function () {
    notes.active.data.title = document.getElementById('note-edit--title').value;
    for ( var j = 0; j < 10; j++ ) {
      notes.active.data['c'+(j+1)] = document.getElementById('note-edit--c'+(j+1)).value;
    }
    sync.updateNoteText(notes.active);
    notes.drawText(notes.active);
    notes.close();
  },

  remove: function (key) {
    for ( var i = 0; i < notes.list.length; i++ ) {
      if ( notes.list[i].key === key ) {
        app.scene.remove(notes.list[i].text);
        app.scene.remove(notes.list[i]);
        notes.list.splice(i, 1);
        app.dirty = true;
      }
    }
  },

  removeActive: function () {
    sync.removeNote(notes.active.key);
    notes.close();
  },

  select: function (event, note) {
    if ( !!note ) {
      if ( !note.data.locked ) {
        notes.close();
        notes.active = note;
        notes.open(notes.active);
      }
    } else {
      if ( !!notes.active ) {
        notes.close();
      } else {
        sync.addNote(notes.calcPosition(event));
      }
    }
  },

  isClicked: function (event) {
    return document.getElementById('note-edit').contains(event.target);
  },

  getGroup: function () {
    var arr = [];
    for ( var i = 0; i < notes.list.length; i++ ) {
      var note = notes.list[i];
      if ( note.position.y < app.camera.position.y + groups.height / 2 &&
        note.position.y > app.camera.position.y - groups.height / 2 ) {
        arr.push(note);
      }
    }
    return arr.sort(function(a, b) { return a.rotation.y < b.rotation.y;})
  },

  getClosest: function (group) {
    return group.reduce(function (prev, curr) {
      return (Math.abs(curr.rotation.y - app.camera.rotation.y) < Math.abs(prev.rotation.y - app.camera.rotation.y) ? curr : prev);
    });
  },

  getPrev: function () {
    var group = notes.getGroup();
    var closest = group.indexOf(notes.getClosest(group));
    return group[closest == 0 ? group.length-1 : closest-1];
  },

  getNext: function () {
    var group = notes.getGroup();
    var closest = group.indexOf(notes.getClosest(group));
    return group[closest == group.length-1 ? 0 : closest+1];
  },

  switchTo: function (note) {
    if ( !!notes.switchIntervalId ) {
      return;
    }

    var duration = 500; //ms
    var interval = 100; //ms

    new TWEEN.Tween(app.camera.rotation).to({
      y: note.rotation.y,
    }, duration).easing(TWEEN.Easing.Quadratic.Out).start();

    notes.switchIntervalId = window.setInterval(function () {
      TWEEN.update();
      app.dirty = true;
    }, interval);

    window.setTimeout(function (note) {
      notes.switchIntervalId = window.clearInterval(notes.switchIntervalId);

      // reset camera rotation to original note rotation
      app.camera.rotation.y = note.rotation.y;
    }, duration, note);
  },

};
