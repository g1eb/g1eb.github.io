'use strict';

var gui = {

  controls: undefined,

  skyBoxControls: undefined,
  skyBoxSettings: {
    texture: 'src/textures/skybox_desert.png',
    textures: {
      desert: 'src/textures/skybox_desert.png',
      office: 'src/textures/skybox_office.png',
      beach1: 'src/textures/skybox_beach1.png',
      beach2: 'src/textures/skybox_beach2.png',
      beach3: 'src/textures/skybox_beach3.png',
      dunes: 'src/textures/skybox_dunes.png',
      garden: 'src/textures/skybox_garden.png',
      park: 'src/textures/skybox_park.png',
      meadow: 'src/textures/skybox_meadow.png',
      snow: 'src/textures/skybox_snow.png',
    }
  },

  frameControls: undefined,
  frameSettings: {
    transparent: true,
    opacity: 0.25,
  },

  cameraControls: undefined,
  cameraSettings: {
    positionX: 0,
    positionY: 50000,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0.5,
    rotationZ: 0,
  },

  init: function () {
    gui.controls = new dat.GUI();
    gui.controls.close();

    gui.skyBoxControls = gui.controls.addFolder('SkyBox');
    gui.skyBoxControls.add(gui.skyBoxSettings, 'texture', gui.skyBoxSettings.textures).onChange(gui.updateSkyBox);

    gui.frameControls = gui.controls.addFolder('Frames');
    gui.frameControls.add(gui.frameSettings, 'transparent').onChange(gui.updateFrames);
    gui.frameControls.add(gui.frameSettings, 'opacity', 0, 1).onChange(gui.updateFrames);

    gui.cameraControls = gui.controls.addFolder('Camera');
    gui.cameraControls.add(gui.cameraSettings, 'positionX', 0, 100000).onChange(gui.updateCamera);
    gui.cameraControls.add(gui.cameraSettings, 'positionY', 0, 100000).onChange(gui.updateCamera);
    gui.cameraControls.add(gui.cameraSettings, 'positionZ', 0, 100000).onChange(gui.updateCamera);
    gui.cameraControls.add(gui.cameraSettings, 'rotationX', 0, Math.PI * 2).onChange(gui.updateCamera);
    gui.cameraControls.add(gui.cameraSettings, 'rotationY', 0, Math.PI * 2).onChange(gui.updateCamera);
    gui.cameraControls.add(gui.cameraSettings, 'rotationZ', 0, Math.PI * 2).onChange(gui.updateCamera);
  },

  updateSkyBox: function () {
    skybox.load(gui.skyBoxSettings.texture);
  },

  updateFrames: function () {
    for ( var i = 0; i < frames.list.length; i++ ) {
      frames.list[i].material.transparent = gui.frameSettings.transparent;
      frames.list[i].material.opacity = gui.frameSettings.opacity;
    }
    app.dirty = true;
  },

  updateCamera: function () {
    app.camera.position.x = gui.cameraSettings.positionX;
    app.camera.position.y = gui.cameraSettings.positionY;
    app.camera.position.z = gui.cameraSettings.positionZ;
    app.camera.rotation.x = gui.cameraSettings.rotationX;
    app.camera.rotation.y = gui.cameraSettings.rotationY;
    app.camera.rotation.z = gui.cameraSettings.rotationZ;
    app.camera.updateProjectionMatrix();
    app.dirty = true;
  },

};
