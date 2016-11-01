if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var controls, scene, renderer;
var ambientLight;
var camera, cameraSettings;
var target, lon, lat, phi, theta, touchX, touchY;
var guiControls, guiControlsSky, guiControlsFrames, guiControlsCamera;
var frameSettings, skySetting, sky, sunSphere, sunDistance;

init();
render();

function init () {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x000000, 1 );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xf5f5f5, 1, 25000 );

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000000 );

  cameraSettings = {
    positionX: 0,
    positionY: 5000,
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

  //var helper = new THREE.GridHelper( 15000, 10, 0xffffff, 0xffffff );
  //scene.add( helper );

  ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add(ambientLight);

  initSky();
  initFrames();
  initGuiControls();

  //document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  //document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  //document.addEventListener( 'touchmove', onDocumentTouchMove, false );

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

function initFrames () {
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
    positionY: 5000,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    numFrames: 25,
    distance: 10000,
    variance: 1000,
  };

  addFrames();
}

function addFrames () {
  var frameGeometry, frameMaterial, frame;
  var angle = THREE.Math.degToRad(360 / frameSettings.numFrames);
  for ( var i = 0; i < frameSettings.numFrames; i++ ) {
    frameGeometry = new THREE.PlaneGeometry(
      frameSettings.width + Math.floor(Math.random() * frameSettings.variance),
      frameSettings.height + Math.floor(Math.random() * frameSettings.variance),
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
    frame.position.x = frameSettings.distance * Math.cos(angle * i) + Math.floor(Math.random() * frameSettings.variance);
    frame.position.y = frameSettings.positionY + Math.floor(Math.random() * frameSettings.variance);
    frame.position.z = frameSettings.distance * Math.sin(angle * i);
    frame.rotation.y = Math.PI / 2 - angle * i;
    scene.add(frame);
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
  guiControlsCamera.add(cameraSettings, 'positionX', 0, 50000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionY', 0, 50000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'positionZ', 0, 50000).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationX', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationY', 0, Math.PI * 2).onChange(updateCamera);
  guiControlsCamera.add(cameraSettings, 'rotationZ', 0, Math.PI * 2).onChange(updateCamera);
}

function onDocumentMouseWheel( event ) {
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
}

function render () {
  renderer.render( scene, camera );
};
