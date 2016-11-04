'use strict';

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var controls, scene, renderer;
var ambientLight;
var camera, cameraSettings;
var touchX, touchY;
var stats;
var guiControls, guiControlsSkyBox, guiControlsFlare, guiControlsFrames, guiControlsCamera;
var frames, selectedFrame, openFrame, frameSettings;
var lensFlare, flareSettings;
var skyBox, skyBoxSettings;
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

  cameraSettings = {
    positionX: 0,
    positionY: 50000,
    positionZ: 0,
    rotationX: 0,
    rotationY: Math.PI,
    rotationZ: 0,
  }

  camera.position.x = cameraSettings.positionX;
  camera.position.y = cameraSettings.positionY;
  camera.position.z = cameraSettings.positionZ;
  camera.rotation.x = cameraSettings.rotationX;
  camera.rotation.y = cameraSettings.rotationY;
  camera.rotation.z = cameraSettings.rotationZ;

  ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add(ambientLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  stats = new Stats();
  document.body.appendChild(stats.dom);

  initSkyBox();
  initFlare();
  initFrames();
  initGuiControls();
  initIdleAnimation();

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

  document.addEventListener('keydown', onKeyDown, false)

  window.addEventListener( 'resize', onWindowResize, false ); 
}

function updateCamera () {
  camera.position.x = cameraSettings.positionX;
  camera.position.y = cameraSettings.positionY;
  camera.position.z = cameraSettings.positionZ;
  camera.rotation.x = cameraSettings.rotationX;
  camera.rotation.y = cameraSettings.rotationY;
  camera.rotation.z = cameraSettings.rotationZ;

  camera.updateProjectionMatrix();

  render();
}

function initSkyBox () {
  skyBoxSettings = {
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
  }
  loadSkyBox();
}

function loadSkyBox (cb) {
  var cubeMap = new THREE.CubeTexture( [] );
  cubeMap.format = THREE.RGBFormat;

  var loader = new THREE.ImageLoader();
  loader.load(skyBoxSettings.texture, function ( image ) {

    var getSide = function ( x, y ) {
      var size = 1024;
      var canvas = document.createElement( 'canvas' );
      canvas.width = size;
      canvas.height = size;
      var context = canvas.getContext( '2d' );
      context.drawImage( image, - x * size, - y * size );
      return canvas;
    };

    cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
    cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
    cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
    cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
    cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
    cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
    cubeMap.needsUpdate = true;
  });

  var cubeShader = THREE.ShaderLib[ 'cube' ];
  cubeShader.uniforms[ 'tCube' ].value = cubeMap;

  var skyBoxMaterial = new THREE.ShaderMaterial({
    fragmentShader: cubeShader.fragmentShader,
    vertexShader: cubeShader.vertexShader,
    uniforms: cubeShader.uniforms,
    side: THREE.BackSide,
    depthWrite: false,
  });

  skyBox = new THREE.Mesh(
    new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
    skyBoxMaterial
  );

  scene.add( skyBox );

  if ( !!cb && typeof cb === 'function' ) {
    cb();
  }
}

function updateSkyBox () {
  if ( !!skyBox ) {
    scene.remove(skyBox);
  }
  loadSkyBox(function () {
    render();
  });
}

function initFlare () {
  flareSettings = {
    visible: false,
    positionX: -1000000,
    positionY: 500000,
    positionZ: -1000000,
  }

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
  lensFlare.position.x = flareSettings.positionX;
  lensFlare.position.y = flareSettings.positionY;
  lensFlare.position.z = flareSettings.positionZ;
  lensFlare.visible = flareSettings.visible;

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

function updateFlare () {
  lensFlare.position.x = flareSettings.positionX;
  lensFlare.position.y = flareSettings.positionY;
  lensFlare.position.z = flareSettings.positionZ;
  lensFlare.visible = flareSettings.visible;

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

function updateFrames () {
  var frame;
  for ( var i = 0; i < frames.length; i++ ) {
    frames[i].material.transparent = frameSettings.transparent;
    frames[i].material.opacity = frameSettings.opacity;
  }
  render();
}

function initGuiControls () {
  guiControls = new dat.GUI();
  guiControls.close();

  guiControlsSkyBox = guiControls.addFolder('SkyBox');
  guiControlsSkyBox.add( skyBoxSettings, 'texture', skyBoxSettings.textures).onChange( updateSkyBox );

  guiControlsFlare = guiControls.addFolder('Lensflare');
  guiControlsFlare.add( flareSettings, 'visible' ).onChange( updateFlare );
  guiControlsFlare.add( flareSettings, 'positionX', -1000000, 1000000).onChange( updateFlare );
  guiControlsFlare.add( flareSettings, 'positionY', -1000000, 1000000).onChange( updateFlare );
  guiControlsFlare.add( flareSettings, 'positionZ', -1000000, 1000000).onChange( updateFlare );

  guiControlsFrames = guiControls.addFolder('Frames');
  guiControlsFrames.add(frameSettings, 'transparent').onChange(updateFrames);
  guiControlsFrames.add(frameSettings, 'opacity', 0, 1).onChange(updateFrames);

  guiControlsCamera = guiControls.addFolder('Camera');
  guiControlsCamera.add(cameraSettings, 'positionX', 0, 100000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionY', 0, 100000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionZ', 0, 100000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationX', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationY', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationZ', 0, Math.PI * 2).onChange(updateCamera);
}

function initIdleAnimation () {
  branding.cancel();
  window.clearTimeout(idleTimeoutId);
  window.clearInterval(idleIntervalId);
  idleTimeoutId = window.setTimeout(function () {
    updateFrames();
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
    updateFrames();
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

function onDocumentMouseDown ( event ) {
  initIdleAnimation();
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );

  mouseDownTimeoutId = window.setTimeout(function () {
    selectFrame(event);
  }, 150);
}

function onDocumentMouseUp ( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove );
  document.removeEventListener( 'mouseup', onDocumentMouseUp );
}

function onDocumentMouseMove ( event ) {
  window.clearTimeout(mouseDownTimeoutId);
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  camera.rotation.y += movementX * 0.01;
  render();
}

function onDocumentTouchStart ( event ) {
  initIdleAnimation();
  var touch = event.touches[0];
  touchX = touch.screenX;

  touchMoveTimeoutId = window.setTimeout(function () {
    selectFrame(event);
  }, 150);
}

function onDocumentTouchMove ( event ) {
  window.clearTimeout(touchMoveTimeoutId);
  event.preventDefault();
  var touch = event.touches[0];
  camera.rotation.y += (touch.screenX - touchX) * 0.01;
  touchX = touch.screenX;
  render();
}

function onDocumentMouseWheel ( event ) {
  initIdleAnimation();
  camera.rotation.y += event.deltaY * 0.001;
  render();
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function onKeyDown ( event ) {
  if ( event.keyCode == 37 ) {
    camera.rotation.y += 0.0125;
  } else if ( event.keyCode == 39 ) {
    camera.rotation.y -= 0.0125;
  }
  render();
}

function render () {
  renderer.render(scene, camera);
  stats.update();
};
