if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var controls, scene, renderer;
var ambientLight;
var camera, cameraSettings;
var target, lon, lat, phi, theta, touchX, touchY;
var guiControls, guiControlsSky, guiControlsFrames, guiControlsCamera;
var frameSettings, frameGeometry, frameMaterial;
var skySetting, sky, sunSphere, sunDistance;

init();
render();

function init () {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  //renderer.setClearColor( 0x000000, 1 );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog( 0x000000, 3500, 15000 );
  //scene.fog.color.setHSL( 0.51, 0.4, 0.01 );

  target = new THREE.Vector3();
  lon = 90;
  lat = 60;
  phi = 0;
  theta = 0;

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 5000000 );
  camera.eulerOrder = "YXZ"

  cameraSettings = {
    positionX: 1250,
    positionY: 550,
    positionZ: 3000,
    rotationX: 1,
    rotationY: 1,
    rotationZ: 0,
  }

  camera.position.x = cameraSettings.positionX;
  camera.position.y = cameraSettings.positionY;
  camera.position.z = cameraSettings.positionZ;
  camera.rotation.x = cameraSettings.rotationX;
  camera.rotation.y = cameraSettings.rotationY;
  camera.rotation.z = cameraSettings.rotationZ;

  //camera.setLens(20);

  //controls = new THREE.OrbitControls( camera, renderer.domElement );
  //controls.addEventListener('change', render);
  //controls.enableDamping = true;
  //controls.dampingFactor = 0.25;
  //controls.enableZoom = true;
  //controls.enablePan = true;
  //controls.maxPolarAngle = Math.PI / 2;

  var helper = new THREE.GridHelper( 5000, 100, 0xffffff, 0xffffff );
  scene.add( helper );

  ambientLight = new THREE.AmbientLight( 0x000000 );
  scene.add(ambientLight);

  initSky();
  initFrames();
  initGuiControls();

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

  window.addEventListener( 'resize', onWindowResize, false ); 
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

function initFrames () {
  frameSettings = {
    width: 250,
    height: 250,
    segments: 1,
    slices: 1,
    ambientColor: 0xffffff,
    diffuseColor: 0xff4500,
    transparent: true,
    opacity: 0.5,
    positionY: 500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    numFrames: 20,
    distance: 1000,
  };

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

  addFrames();
}

function addFrames () {
  var angle = THREE.Math.degToRad(360 / frameSettings.numFrames);
  for ( var i = 0; i < frameSettings.numFrames; i++ ) {
    var mesh = new THREE.Mesh(frameGeometry, frameMaterial);
    mesh.position.x = frameSettings.distance * Math.cos(angle * i);
    mesh.position.y = frameSettings.positionY;
    mesh.position.z = frameSettings.distance * Math.sin(angle * i);
    mesh.rotation.y = (angle * i + 90) * -1;
    scene.add( mesh );
  }
}

function updateFrames () {
  var frame;
  for ( var i = 0; i < scene.children.length; i++ ) {
    frame = scene.children[i];
    if ( frame.type === 'Mesh' ) {
      frame.material.transparent = frameSettings.transparent;
      frame.material.opacity = frameSettings.opacity;
    }
  }

  render();
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

function initGuiControls () {
  guiControls = new dat.GUI();

  guiControlsSky = guiControls.addFolder('Sky');
  guiControlsSky.add( skySettings, 'turbidity', 1.0, 20.0, 0.1 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'reileigh', 0.0, 4, 0.001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'luminance', 0.0, 2 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'inclination', 0, 1, 0.0001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'azimuth', 0, 1, 0.0001 ).onChange( updateSky );
  guiControlsSky.add( skySettings, 'sun' ).onChange( updateSky );

  guiControlsFrames = guiControls.addFolder('Frames');
  guiControlsFrames.add(frameSettings, 'transparent').onChange(updateFrames);
  guiControlsFrames.add(frameSettings, 'opacity', 0, 1).onChange(updateFrames);

  guiControlsCamera = guiControls.addFolder('Camera');
  guiControlsCamera.add(cameraSettings, 'positionX', 0, 10000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionY', 0, 10000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionZ', 0, 10000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationX', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationY', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationZ', 0, Math.PI * 2).onChange(updateCamera);
}

function onDocumentMouseDown( event ) {
  event.preventDefault();

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
}

function onDocumentMouseUp( event ) {
  document.removeEventListener( 'mousemove', onDocumentMouseMove );
  document.removeEventListener( 'mouseup', onDocumentMouseUp );
}

function onDocumentMouseMove( event ) {
  var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  lon -= movementX;
  lat += movementY;

  render();
}

function onDocumentMouseWheel( event ) {
  camera.fov += event.deltaY * 0.05;
  camera.updateProjectionMatrix();

  render();
}

function onDocumentTouchStart( event ) {
  event.preventDefault();

  var touch = event.touches[ 0 ];

  touchX = touch.screenX;
  touchY = touch.screenY;

  render();
}

function onDocumentTouchMove( event ) {
  event.preventDefault();

  var touch = event.touches[ 0 ];

  lon -= ( touch.screenX - touchX ) * 0.1;
  lat += ( touch.screenY - touchY ) * 0.1;

  touchX = touch.screenX;
  touchY = touch.screenY;

  render();
}

function render () {
  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );

  target.x = Math.sin( phi ) * Math.cos( theta );
  target.y = Math.cos( phi );
  target.z = Math.sin( phi ) * Math.sin( theta );

  camera.lookAt( target );

  //requestAnimationFrame( render );
  renderer.render( scene, camera );
};

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}
