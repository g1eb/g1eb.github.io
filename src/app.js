if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var guiControls, guiControlsSky, guiControlsFrames;
var ambientLight;
var camera, controls, scene, renderer;
var frameSettings, frameGeometry, frameMaterial, frame;
var skySetting, sky, sunSphere;

init();
render();

function init () {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  //renderer.setClearColor( 0x000000, 1 );
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 100, 5000000 );
  camera.position.x = 250;
  camera.position.y = 150;
  camera.position.z = 500;

  //camera.setLens(20);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.addEventListener('change', render);
  //controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = true;
  controls.enablePan = false;

  scene = new THREE.Scene();

  var helper = new THREE.GridHelper( 1000, 100, 0xffffff, 0xffffff );
  scene.add( helper );

  ambientLight = new THREE.AmbientLight( 0x000000 );
  scene.add(ambientLight);

  guiControls = new dat.GUI();
  guiControlsSky = guiControls.addFolder('Sky');
  guiControlsFrames = guiControls.addFolder('Frames');

  initSky();
  initFrames();
  initGuiControls();

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

  var distance = 400000;

  function guiChanged() {
    var uniforms = sky.uniforms;
    uniforms.turbidity.value = skySettings.turbidity;
    uniforms.reileigh.value = skySettings.reileigh;
    uniforms.luminance.value = skySettings.luminance;
    uniforms.mieCoefficient.value = skySettings.mieCoefficient;
    uniforms.mieDirectionalG.value = skySettings.mieDirectionalG;

    var theta = Math.PI * ( skySettings.inclination - 0.5 );
    var phi = 2 * Math.PI * ( skySettings.azimuth - 0.5 );

    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

    sunSphere.visible = skySettings.sun;

    sky.uniforms.sunPosition.value.copy( sunSphere.position );

    render();
  }

  guiControlsSky.add( skySettings, 'turbidity', 1.0, 20.0, 0.1 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'reileigh', 0.0, 4, 0.001 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'luminance', 0.0, 2 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'inclination', 0, 1, 0.0001 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'azimuth', 0, 1, 0.0001 ).onChange( guiChanged );
  guiControlsSky.add( skySettings, 'sun' ).onChange( guiChanged );

  guiChanged();
}

function initFrames () {
  frameSettings = {
    width: 100,
    height: 100,
    segments: 1,
    slices: 1,
    ambientColor: 0xffffff,
    diffuseColor: 0xff4500,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
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
  });

  frame = new THREE.Mesh(frameGeometry, frameMaterial);
  scene.add( frame );
}

function initGuiControls () {
  guiControlsFrames.add(frameSettings, 'rotationX', 0, 1);
  guiControlsFrames.add(frameSettings, 'rotationY', 0, 1);
  guiControlsFrames.add(frameSettings, 'rotationZ', 0, 1);
}

function render () {
  console.log(camera.position.x, camera.position.y, camera.position.z);

  //requestAnimationFrame( render );
  renderer.render( scene, camera );
};

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}
