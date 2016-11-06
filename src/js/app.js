'use strict';

var app = {

  scene: undefined,
  camera: undefined,
  controls: undefined,
  renderer: undefined,

  init: function () {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    app.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    app.renderer.setPixelRatio( window.devicePixelRatio );
    app.renderer.setSize( window.innerWidth, window.innerHeight );
    app.renderer.setClearColor( 0x000000, 0 );
    document.body.appendChild( app.renderer.domElement );
  
    app.scene = new THREE.Scene();
    app.scene.fog = new THREE.Fog( 0xf5f5f5, 1, 25000 );
  
    app.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000000 );
    app.camera.position.y = 100000;
    app.camera.rotation.y = Math.PI;
  
    if ( device.isMobile() ) {
      app.controls = new THREE.DeviceOrientationControls( app.camera );
    }

    var light = new THREE.AmbientLight( 0xffffff );
    app.scene.add(light);
  
    dev.init();
    gui.init();
    events.init();
    skybox.init();
    flare.init();
    frames.init();
    animation.init();
  
    app.render();
  },
  
  render: function () {
    if ( !!app.controls ) {
      requestAnimationFrame(app.render);
      app.controls.update();
    }
    app.renderer.render(app.scene, app.camera);
    dev.updateStats();
  },

};

document.addEventListener('DOMContentLoaded', app.init);
