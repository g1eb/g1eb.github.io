'use strict';

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var camera, light, scene, renderer;
var frames, frameSettings, selectedFrame;
var lensFlare;
var raycaster, mouse;
var idleTimeoutId, idleIntervalId;
var mouseDownTimeoutId, touchMoveTimeoutId;

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

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  dev.init();
  gui.init();
  events.init();
  skybox.init();

  initFlare();
  initFrames();
  initCamera();
  initIdleAnimation();
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

function initFlare () {
  var textureLoader = new THREE.TextureLoader();
  var textureFlare0 = textureLoader.load( "src/textures/lensflare0.png" );
  var textureFlare2 = textureLoader.load( "src/textures/lensflare2.png" );
  var textureFlare3 = textureLoader.load( "src/textures/lensflare3.png" );

  var flareColor = new THREE.Color( 0xffffff );
  flareColor.setHSL( 0.55, 0.9, 0.5 + 0.5 );
  lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

  lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
  lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
  lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

  lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
  lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
  lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
  lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

  lensFlare.customUpdateCallback = lensFlareUpdateCallback;
  lensFlare.position.x = -1000000;
  lensFlare.position.y = 500000;
  lensFlare.position.z = -1000000;

  scene.add( lensFlare );
  render();
}

function lensFlareUpdateCallback( object ) {
  var flare;
  var f, fl = object.lensFlares.length;
  var vecX = -object.positionScreen.x * 2;
  var vecY = -object.positionScreen.y * 2;

  for( f = 0; f < fl; f++ ) {
    flare = object.lensFlares[ f ];

    flare.x = object.positionScreen.x + vecX * flare.distance;
    flare.y = object.positionScreen.y + vecY * flare.distance;

    flare.rotation = 0;
  }

  object.lensFlares[ 2 ].y += 0.025;
  object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
}

function updateFlare (settings) {
  lensFlare.position.x = settings.positionX;
  lensFlare.position.y = settings.positionY;
  lensFlare.position.z = settings.positionZ;
  lensFlare.visible = settings.visible;
  render();
}

function initFrames () {
  frames = [];

  frameSettings = {
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
  };
}

function addFrame (event) {
  var frame, frameGeometry, frameMaterial;
  var frameText, frameTextCanvas, frameTextContext, frameTextTexture, frameTextMaterial, frameTextGeometry;

  frameGeometry = new THREE.PlaneGeometry(
    frameSettings.width,
    frameSettings.height,
    frameSettings.segments,
    frameSettings.slices
  );

  frameMaterial = new THREE.MeshPhongMaterial({
    color: frameSettings.ambientColor,
    emissive: frameSettings.diffuseColor,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
    transparent: frameSettings.transparent,
    opacity: frameSettings.opacity,
  });

  var hsf = 1.75;
  var vsf = hsf * 1900;
  var hfov = camera.fov / 180 * Math.PI;
  var vfov = hfov / window.innerWidth * window.innerHeight;
  var xoffset = event.clientX - window.innerWidth / 2;
  var yoffset = event.clientY - window.innerHeight / 2;
  var angleY = camera.rotation.y - hsf * xoffset / (window.innerWidth * hfov);
  var angleX = -1 * vsf * yoffset / (window.innerHeight * vfov);

  frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.x = frameSettings.distance * Math.cos(Math.PI / 2 * 3 - angleY);
  frame.position.y = frameSettings.positionY + angleX;
  frame.position.z = frameSettings.distance * Math.sin(Math.PI / 2 * 3 - angleY);
  frame.rotation.y = angleY;

  frameTextCanvas = document.createElement('canvas');
  frameTextCanvas.width = frameSettings.width;
  frameTextCanvas.height = frameSettings.height;
  frameTextContext = frameTextCanvas.getContext('2d');
  frameTextContext.font = 'Normal 75px Arial';
  frameTextContext.textAlign = 'left';
  frameTextContext.fillStyle = 'rgba(50, 50, 50, 0.75)';
  frameTextContext.fillText('Frame ' + (frames.length + 1), 100, 150);

  frameTextTexture = new THREE.Texture(frameTextCanvas);
  frameTextTexture.needsUpdate = true;
  frameTextMaterial = new THREE.MeshBasicMaterial({
    map: frameTextTexture,
    side: THREE.DoubleSide,
  });
  frameTextMaterial.transparent = true;
  frameTextMaterial.opacity = 1;
  frameTextGeometry = new THREE.PlaneGeometry( frameSettings.width, frameSettings.height );
  frameText = new THREE.Mesh( frameGeometry, frameTextMaterial );
  frameText.position.copy(frame.position);
  frameText.rotation.copy(frame.rotation);

  scene.add(frame);
  scene.add(frameText);
  frames.push(frame);
  render();
}

function resetFrames () {
  var frame;
  for ( var i = 0; i < frames.length; i++ ) {
    frames[i].material.transparent = frameSettings.transparent;
    frames[i].material.opacity = frameSettings.opacity;
  }
  render();
}

function updateFrames (settings) {
  var frame;
  for ( var i = 0; i < frames.length; i++ ) {
    frames[i].material.transparent = settings.transparent;
    frames[i].material.opacity = settings.opacity;
  }
  render();
}

function initIdleAnimation () {
  branding.cancel();
  window.clearTimeout(idleTimeoutId);
  window.clearInterval(idleIntervalId);
  idleTimeoutId = window.setTimeout(function () {
    resetFrames();
    closeSelectedFrame();
    branding.init();
    idleIntervalId = window.setInterval(function () {
      camera.rotation.y -= 0.0015;
      render();
    }, 100);
  }, 1000 * 60);
}

function openSelectedFrame() {
}

function closeSelectedFrame () {
}

function highlightSelectedFrame () {
  selectedFrame.material.transparent = frameSettings.transparent;
  selectedFrame.material.opacity = frameSettings.activeOpacity;
  render();
}

function selectFrame ( event ) {
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( frames );

  if ( !!intersects.length ) {
    resetFrames();
    closeSelectedFrame();
    if ( intersects[0].object === selectedFrame ) {
      selectedFrame = undefined;
    } else {
      selectedFrame = intersects[0].object;
      highlightSelectedFrame();
      openSelectedFrame();
    }
  } else {
    addFrame(event);
  }
}

function render () {
  renderer.render(scene, camera);
  dev.updateStats();
};
