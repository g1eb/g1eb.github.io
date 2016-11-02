if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var controls, scene, renderer;
var ambientLight;
var camera, cameraSettings;
var touchX, touchY;
var stats;
var guiControls, guiControlsSky, guiControlsFrames, guiControlsCamera;
var frames, frameSettings, skySetting, sky, sunSphere, sunDistance, lensFlare, flareSettings;
var raycaster, mouse;
var idleTimeoutId, idleIntervalId;

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
    rotationY: 0.5,
    rotationZ: 0,
  }

  camera.position.x = cameraSettings.positionX;
  camera.position.y = cameraSettings.positionY;
  camera.position.z = cameraSettings.positionZ;
  camera.rotation.x = cameraSettings.rotationX;
  camera.rotation.y = cameraSettings.rotationY;
  camera.rotation.z = cameraSettings.rotationZ;

  //var helper = new THREE.GridHelper( 25000, 10, 0xffffff, 0xffffff );
  //scene.add( helper );

  ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add(ambientLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  stats = new Stats();
  document.body.appendChild(stats.dom);

  initSky();
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

function initSky () {
  sky = new THREE.Sky();
  scene.add( sky.mesh );

  // Add Sun Helper
  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 20000, 16, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff } )
  );
  sunSphere.position.y = -700000;
  sunSphere.visible = false;
  scene.add(sunSphere);

  skySettings  = {
    turbidity: 10,
    reileigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    luminance: 0.7,
    inclination: 0.49, // elevation / inclination
    azimuth: 0.25, // Facing front,
    sun: ! true
  };

  sunDistance = 400000;

  var uniforms = sky.uniforms;
  uniforms.turbidity.value = skySettings.turbidity;
  uniforms.reileigh.value = skySettings.reileigh;
  uniforms.luminance.value = skySettings.luminance;
  uniforms.mieCoefficient.value = skySettings.mieCoefficient;
  uniforms.mieDirectionalG.value = skySettings.mieDirectionalG;

  var theta = Math.PI * ( skySettings.inclination - 0.5 );
  var phi = 2 * Math.PI * ( skySettings.azimuth - 0.5 );

  sunSphere.position.x = sunDistance * Math.cos( phi );
  sunSphere.position.y = sunDistance * Math.sin( phi ) * Math.sin( theta );
  sunSphere.position.z = sunDistance * Math.sin( phi ) * Math.cos( theta );

  sunSphere.visible = skySettings.sun;

  sky.uniforms.sunPosition.value.copy( sunSphere.position );
}

function updateSky() {
  var uniforms = sky.uniforms;
  uniforms.turbidity.value = skySettings.turbidity;
  uniforms.reileigh.value = skySettings.reileigh;
  uniforms.luminance.value = skySettings.luminance;
  uniforms.mieCoefficient.value = skySettings.mieCoefficient;
  uniforms.mieDirectionalG.value = skySettings.mieDirectionalG;

  var theta = Math.PI * ( skySettings.inclination - 0.5 );
  var phi = 2 * Math.PI * ( skySettings.azimuth - 0.5 );

  sunSphere.position.x = sunDistance * Math.cos( phi );
  sunSphere.position.y = sunDistance * Math.sin( phi ) * Math.sin( theta );
  sunSphere.position.z = sunDistance * Math.sin( phi ) * Math.cos( theta );

  sunSphere.visible = skySettings.sun;

  sky.uniforms.sunPosition.value.copy( sunSphere.position );

  render();
}

function initFlare () {
  flareSettings = {
    lensflare: false,
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
  lensFlare.position.copy( sunSphere.position );
  lensFlare.visible = false;

  scene.add( lensFlare );

  render();
}

function lensFlareUpdateCallback( object ) {
  var f, fl = object.lensFlares.length;
  var flare;
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
  lensFlare.visible = flareSettings.lensflare;
  render();
}

function initFrames () {
  frames = [];

  frameSettings = {
    width: 1000,
    height: 1000,
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
    numFrames: 25,
    distance: 5000,
    variance: 1000,
  };

  addFrames();
}

function addFrames () {
  var frameGeometry, frameMaterial, frame;
  var angle = THREE.Math.degToRad(360 / frameSettings.numFrames);
  for ( var i = 0; i < frameSettings.numFrames; i++ ) {
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

    frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.x = frameSettings.distance * Math.cos(angle * i);
    frame.position.y = frameSettings.positionY;
    frame.position.z = frameSettings.distance * Math.sin(angle * i);
    frame.rotation.y = Math.PI / 2 - angle * i;

    frames.push(frame);
    scene.add(frame);
  }
}

function updateFrames () {
  var frame;
  var angle = THREE.Math.degToRad(360 / frameSettings.numFrames);
  for ( var i = 0; i < frames.length; i++ ) {
    frames[i].material.transparent = frameSettings.transparent;
    frames[i].material.opacity = frameSettings.opacity;
    frames[i].position.y = frameSettings.positionY;
    frames[i].rotation.y = frameSettings.rotationY + Math.PI / 2 - angle * i;
  }
  render();
}

function initGuiControls () {
  guiControls = new dat.GUI();
  guiControls.close();

  guiControlsSky = guiControls.addFolder('Sky');
  guiControlsSky.add( skySettings, 'turbidity', 1.0, 20.0, 0.1 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'reileigh', 0.0, 4, 0.001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'luminance', 0.0, 2 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'inclination', 0, 1, 0.0001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'azimuth', 0, 1, 0.0001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'sun' ).onChange( updateSky );

  guiControlsFlare = guiControls.addFolder('Lensflare');
  guiControlsFlare.add( flareSettings, 'lensflare' ).onChange( updateFlare );

  guiControlsFrames = guiControls.addFolder('Frames');
  guiControlsFrames.add(frameSettings, 'transparent').onChange(updateFrames);
  guiControlsFrames.add(frameSettings, 'opacity', 0, 1).onChange(updateFrames);
  guiControlsFrames.add(frameSettings, 'positionY', 0, 100000).onChange(updateFrames);
  guiControlsFrames.add(frameSettings, 'rotationY', 0, Math.PI * 2).onChange(updateFrames);

  guiControlsCamera = guiControls.addFolder('Camera');
  guiControlsCamera.add(cameraSettings, 'positionX', 0, 100000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionY', 0, 100000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionZ', 0, 100000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationX', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationY', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationZ', 0, Math.PI * 2).onChange(updateCamera);
}

function initIdleAnimation () {
  window.clearTimeout(idleTimeoutId);
  window.clearInterval(idleIntervalId);
  idleTimeoutId = window.setTimeout(function () {
    idleIntervalId = window.setInterval(function () {
      camera.rotation.y -= 0.0025;
      render();
    }, 100);
  }, 1000 * 60);
}

function selectFrame ( event ) {
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( frames );

  updateFrames();
  if ( !!intersects.length ) {
    intersects[0].object.material.transparent = true;
    intersects[0].object.material.opacity = 0.75;
    render();
  }
}

function onDocumentMouseDown ( event ) {
  event.preventDefault();
  initIdleAnimation();
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );

  selectFrame(event);
}

function onDocumentMouseUp ( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove );
  document.removeEventListener( 'mouseup', onDocumentMouseUp );
}

function onDocumentMouseMove ( event ) {
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  camera.rotation.y += movementX * 0.01;
  render();
}

function onDocumentTouchStart ( event ) {
  event.preventDefault();
  initIdleAnimation();
  var touch = event.touches[0];
  touchX = touch.screenX;
}

function onDocumentTouchMove ( event ) {
  event.preventDefault();
  var touch = event.touches[0];
  camera.rotation.y += (touch.screenX - touchX) * 0.01;
  touchX = touch.screenX;
  render();
}

function onDocumentMouseWheel ( event ) {
  camera.rotation.y += event.deltaY * 0.01;
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
    camera.rotation.y += 0.05;
  } else if ( event.keyCode == 39 ) {
    camera.rotation.y -= 0.05;
  }
  render();
}

function render () {
  renderer.render(scene, camera);
  stats.update();
};
