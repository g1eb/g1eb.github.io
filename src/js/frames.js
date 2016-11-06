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
    activeOpacity: 0.5,
    positionX: 0,
    positionY: 50000,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    distance: 5000,
    variance: 1000,
  },

  active: undefined,

  raycaster: undefined,

  init: function () {
    frames.raycaster = new THREE.Raycaster();

    sync.getFrames();
  },

  add: function (event, data) {
    if ( !event && !data ) {
      return;
    }

    data = data || {
      title: 'New Frame',
      xpos: event.clientX,
      ypos: event.clientY,
      angle: app.camera.rotation.y,
    };

    var frame, frameGeometry, frameMaterial;
    var frameText, frameTextCanvas, frameTextContext, frameTextTexture, frameTextMaterial, frameTextGeometry;

    frameGeometry = new THREE.PlaneGeometry(
      frames.settings.width,
      frames.settings.height,
      frames.settings.segments,
      frames.settings.slices
    );

    frameMaterial = new THREE.MeshPhongMaterial({
      color: frames.settings.ambientColor,
      emissive: frames.settings.diffuseColor,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading,
      transparent: frames.settings.transparent,
      opacity: frames.settings.opacity,
    });

    var hsf = 1.75;
    var vsf = hsf * 1900;
    var hfov = app.camera.fov / 180 * Math.PI;
    var vfov = hfov / window.innerWidth * window.innerHeight;
    var xoffset = data.xpos - window.innerWidth / 2;
    var yoffset = data.ypos - window.innerHeight / 2;
    var angleY = data.angle - hsf * xoffset / (window.innerWidth * hfov);
    var angleX = -1 * vsf * yoffset / (window.innerHeight * vfov);

    frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.x = frames.settings.distance * Math.cos(Math.PI / 2 * 3 - angleY);
    frame.position.y = frames.settings.positionY + angleX;
    frame.position.z = frames.settings.distance * Math.sin(Math.PI / 2 * 3 - angleY);
    frame.rotation.y = angleY;

    frameTextCanvas = document.createElement('canvas');
    frameTextCanvas.width = frames.settings.width;
    frameTextCanvas.height = frames.settings.height;
    frameTextContext = frameTextCanvas.getContext('2d');
    frameTextContext.font = 'Normal 75px Arial';
    frameTextContext.textAlign = 'left';
    frameTextContext.fillStyle = 'rgba(50, 50, 50, 0.75)';
    frameTextContext.fillText(data.title, 100, 150);

    frameTextTexture = new THREE.Texture(frameTextCanvas);
    frameTextTexture.needsUpdate = true;
    frameTextMaterial = new THREE.MeshBasicMaterial({
      map: frameTextTexture,
      side: THREE.DoubleSide,
    });
    frameTextMaterial.transparent = true;
    frameTextMaterial.opacity = 1;
    frameTextGeometry = new THREE.PlaneGeometry( frames.settings.width, frames.settings.height );
    frameText = new THREE.Mesh( frameGeometry, frameTextMaterial );
    frameText.position.copy(frame.position);
    frameText.rotation.copy(frame.rotation);

    app.scene.add(frame);
    app.scene.add(frameText);
    frames.list.push(frame);

    if ( !!event ) {
      sync.addFrame(data);
    }

    app.dirty = true;
  },

  open: function (frame) {
  },

  close: function (frame) {
  },

  closeAll: function () {
  },

  select: function (event) {
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / app.renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / app.renderer.domElement.clientHeight ) * 2 + 1;

    frames.raycaster.setFromCamera( mouse, app.camera );
    var intersects = frames.raycaster.intersectObjects(frames.list);

    frames.reset();
    if ( !!intersects.length ) {
      if ( intersects[0].object === frames.active ) {
        frames.active = undefined;
      } else {
        frames.active = intersects[0].object;
        frames.highlight(frames.active);
        frames.open(frames.active);
      }
    } else {
      if ( !!frames.active ) {
        frames.active = undefined;
      } else {
        frames.add(event);
      }
    }
  },

  highlight: function (frame) {
    frame.material.transparent = frames.settings.transparent;
    frame.material.opacity = frames.settings.activeOpacity;
    app.dirty = true;
  },

  reset: function () {
    for ( var i = 0; i < frames.list.length; i++ ) {
      frames.list[i].material.transparent = frames.settings.transparent;
      frames.list[i].material.opacity = frames.settings.opacity;
    }
    app.dirty = true;
  },

  update: function (settings) {
    for ( var i = 0; i < frames.list.length; i++ ) {
      frames.list[i].material.transparent = settings.transparent;
      frames.list[i].material.opacity = settings.opacity;
    }
    app.dirty = true;
  },

};
