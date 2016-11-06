'use strict';

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var camera, light, scene, renderer;

init();
render();

function init () {

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x000000, 0 );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xf5f5f5, 1, 25000 );

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000000 );
  camera.position.y = 50000;

  light = new THREE.AmbientLight( 0xffffff );
  scene.add(light);

  dev.init();
  gui.init();
  events.init();
  skybox.init();
  flare.init();
  frames.init();
  animation.init();

  initCamera();
}

function initCamera () {
  var duration = 3000; //ms
  var interval = 100; //ms

  new TWEEN.Tween( camera.position ).to( {
    y: 50000,
  }, duration ).easing( TWEEN.Easing.Quadratic.Out).start();

  new TWEEN.Tween( camera.rotation ).to( {
    y: 0.5
  }, duration ).easing( TWEEN.Easing.Quadratic.Out).start();

  var initCameraInterval = window.setInterval(function () {
    TWEEN.update();
    render();
  }, interval);

  window.setTimeout(function () {
    window.clearInterval(initCameraInterval);
  }, duration);
}

function updateCamera (settings) {
  camera.position.x = settings.positionX;
  camera.position.y = settings.positionY;
  camera.position.z = settings.positionZ;
  camera.rotation.x = settings.rotationX;
  camera.rotation.y = settings.rotationY;
  camera.rotation.z = settings.rotationZ;
  camera.updateProjectionMatrix();
  render();
}

function render () {
  renderer.render(scene, camera);
  dev.updateStats();
};
