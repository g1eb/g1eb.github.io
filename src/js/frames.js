'use strict';

var frames = {

  list: [],

  settings: {
    width: 1024,
    height: 1024,
    segments: 1,
    slices: 1,
    ambientColor: 0xffffff,
    diffuseColor: 0xf5f5f5,
    transparent: true,
    opacity: 0.25,
    positionX: 0,
    positionY: 50000,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    distance: 3000,
    variance: 1000,
  },

  active: undefined,

  geometry: undefined,
  material: undefined,

  init: function () {
    frames.getGeometry();
    frames.getMaterial();

    sync.getFrames();
  },

  getGeometry: function () {
    frames.geometry = new THREE.PlaneGeometry(
      frames.settings.width,
      frames.settings.height,
      frames.settings.segments,
      frames.settings.slices
    );
  },

  getMaterial: function () {
    frames.material = new THREE.MeshPhongMaterial({
      color: frames.settings.ambientColor,
      emissive: frames.settings.diffuseColor,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading,
      transparent: frames.settings.transparent,
      opacity: frames.settings.opacity,
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
    var angleX = -1 * vsf * yoffset / (window.innerHeight * vfov);

    return {
      xpos: frames.settings.distance * Math.cos(Math.PI / 2 * 3 - angleY),
      ypos: frames.settings.positionY + angleX,
      zpos: frames.settings.distance * Math.sin(Math.PI / 2 * 3 - angleY),
      yrot: angleY,
    };
  },

  add: function (key, data) {
    var frame = new THREE.Mesh(frames.geometry, frames.material);
    frame.position.x = data.xpos;
    frame.position.y = data.ypos;
    frame.position.z = data.zpos;
    frame.rotation.y = data.yrot;

    frame.key = key;
    frame.data = data;
    app.scene.add(frame);
    frames.drawText(frame);
    frames.list.push(frame);
  },

  drawText: function (frame) {
    if ( !!frame.text ) {
      app.scene.remove(frame.text);
    }

    var frameTextCanvas = document.createElement('canvas');
    frameTextCanvas.width = frames.settings.width;
    frameTextCanvas.height = frames.settings.height;
    var frameTextContext = frameTextCanvas.getContext('2d');
    frameTextContext.font = 'Normal 50px Arial';
    frameTextContext.textAlign = 'left';
    frameTextContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
    frameTextContext.fillText(frame.data.title, 100, 125);

    for ( var j = 0; j < 10; j++ ) {
      frameTextContext.fillText(frame.data['c'+(j+1)] || '', 100, (275 + 75*j));
    }

    var frameTextTexture = new THREE.Texture(frameTextCanvas);
    frameTextTexture.needsUpdate = true;
    var frameTextMaterial = new THREE.MeshBasicMaterial({
      map: frameTextTexture,
      side: THREE.DoubleSide,
    });
    frameTextMaterial.transparent = true;
    frameTextMaterial.opacity = 1;
    var frameTextGeometry = new THREE.PlaneGeometry(frames.settings.width, frames.settings.height);
    var frameText = new THREE.Mesh(frames.geometry, frameTextMaterial);
    frameText.position.copy(frame.position);
    frameText.rotation.copy(frame.rotation);

    frame.text = frameText;
    app.scene.add(frameText);
    app.dirty = true;
  },

  prefillInputs: function (data) {
    document.getElementById('frame-edit--title').value = data.title;
    for ( var j = 0; j < 10; j++ ) {
      document.getElementById('frame-edit--c'+(j+1)).value = data['c'+(j+1)] || '';
    }
  },

  open: function (frame) {
    frames.prefillInputs(frames.active.data);
    document.getElementById('frame-edit').style.display = 'flex';
    events.bindFrameEditButtons();
    app.dirty = true;
  },

  close: function (frame) {
    document.getElementById('frame-edit').style.display = 'none';
    events.unbindFrameEditButtons();
    delete frames.active;
    app.dirty = true;
  },

  update: function (key, data) {
    for ( var i = 0; i < frames.list.length; i++ ) {
      if ( frames.list[i].key === key ) {
        frames.list[i].data.title = data.title;
        for ( var j = 0; j < 10; j++ ) {
          frames.list[i].data['c'+(j+1)] = data['c'+(j+1)];
        }
        frames.drawText(frames.list[i]);
      }
    }

    if ( !!frames.active && frames.active.key === key ) {
      frames.active.data = data;
      frames.prefillInputs(frames.active.data);
    }
  },

  updateActive: function () {
    frames.active.data.title = document.getElementById('frame-edit--title').value;
    for ( var j = 0; j < 10; j++ ) {
      frames.active.data['c'+(j+1)] = document.getElementById('frame-edit--c'+(j+1)).value;
    }
    sync.updateFrame(frames.active);
    frames.drawText(frames.active);
    frames.close();
  },

  remove: function (key) {
    for ( var i = 0; i < frames.list.length; i++ ) {
      if ( frames.list[i].key === key ) {
        app.scene.remove(frames.list[i].text);
        app.scene.remove(frames.list[i]);
        frames.list.splice(i, 1);
        app.dirty = true;
      }
    }
  },

  removeActive: function () {
    sync.removeFrame(frames.active.key);
    frames.close();
  },

  select: function (event) {
    if ( !document.getElementById('frame-edit').contains(event.target) ) {
      var clickedFrame = events.getClicked(event, frames.list);
      if ( !!clickedFrame ) {
        if ( clickedFrame === frames.active ) {
          frames.close();
        } else {
          frames.close();
          frames.active = clickedFrame;
          frames.open(frames.active);
        }
      } else {
        if ( !!frames.active ) {
          frames.close();
        } else {
          sync.addFrame(frames.calcPosition(event));
        }
      }
    }
  },

  reset: function () {
    for ( var i = 0; i < frames.list.length; i++ ) {
      frames.list[i].material.transparent = frames.settings.transparent;
      frames.list[i].material.opacity = frames.settings.opacity;
    }
    app.dirty = true;
  },

};
