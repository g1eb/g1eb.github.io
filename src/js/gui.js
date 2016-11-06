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

  flareControls: undefined,
  flareSettings: {
    visible: true,
    positionX: -1000000,
    positionY: 500000,
    positionZ: -1000000,
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

    gui.flareControls = gui.controls.addFolder('Lensflare');
    gui.flareControls.add(gui.flareSettings, 'visible').onChange( gui.updateFlare );
    gui.flareControls.add(gui.flareSettings, 'positionX', -1000000, 1000000).onChange( gui.updateFlare );
    gui.flareControls.add(gui.flareSettings, 'positionY', -1000000, 1000000).onChange( gui.updateFlare );
    gui.flareControls.add(gui.flareSettings, 'positionZ', -1000000, 1000000).onChange( gui.updateFlare );

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

  updateFlare: function () {
    flare.update(gui.flareSettings);
  },

  updateFrames: function () {
    frames.update(gui.frameSettings);
  },

  updateCamera: function () {
    camera.position.x = gui.cameraSettings.positionX;
    camera.position.y = gui.cameraSettings.positionY;
    camera.position.z = gui.cameraSettings.positionZ;
    camera.rotation.x = gui.cameraSettings.rotationX;
    camera.rotation.y = gui.cameraSettings.rotationY;
    camera.rotation.z = gui.cameraSettings.rotationZ;
    camera.updateProjectionMatrix();
    render();

  },

};
