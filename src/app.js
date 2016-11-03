if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var controls, scene, renderer;
var ambientLight;
var camera, cameraSettings;
var touchX, touchY;
var stats;
var guiControls, guiControlsSky, guiControlsFrames, guiControlsCamera;
var frames, selectedFrame, openFrame, frameSettings;
var lensFlare, flareSettings;
var skyBox, skyBoxSettings;
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
    positionY: 75000,
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

  //var helper = new THREE.GridHelper( 25000, 10, 0xffffff, 0xffffff );
  //scene.add( helper );

  ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add(ambientLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  stats = new Stats();
  document.body.appendChild(stats.dom);

  initSkyBox();
  initFlare();
  initFrames();
  initCamera();
  initGuiControls();
  initIdleAnimation();

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

  document.addEventListener('keydown', onKeyDown, false)

  window.addEventListener( 'resize', onWindowResize, false ); 
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
      beach: 'src/textures/skybox_beach.png',
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
    activeOpacity: 0.75,
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
  var frame, frameGeometry, frameMaterial;
  var frameText, frameTextCanvas, frameTextContext, frameTextTexture, frameTextMaterial;
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
    frame.rotation.y = Math.PI / 2 * 3 - angle * i;

    frameTextCanvas = document.createElement('canvas');
    frameTextCanvas.width = frameSettings.width;
    frameTextCanvas.height = frameSettings.height;
    frameTextContext = frameTextCanvas.getContext('2d');
    frameTextContext.font = 'Normal 75px Arial';
    frameTextContext.textAlign = 'left';
    frameTextContext.fillStyle = 'rgba(50, 50, 50, 0.75)';

    for ( var j = 0; j < 9; j++ ) {
      frameTextContext.fillText('Frame '+i+', line '+(j+1), 100, (150 + 100*j));
    }

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
    frameText.position.copy( frame.position );
    frameText.rotation.y = Math.PI / 2 * 3 - angle * i;

    scene.add(frame);
    scene.add(frameText);
    frames.push(frame);
  }
}

function updateFrames () {
  var frame;
  var angle = THREE.Math.degToRad(360 / frameSettings.numFrames);
  for ( var i = 0; i < frames.length; i++ ) {
    frames[i].material.transparent = frameSettings.transparent;
    frames[i].material.opacity = frameSettings.opacity;
    frames[i].position.y = frameSettings.positionY;
    frames[i].rotation.y = frameSettings.rotationY + Math.PI / 2 * 3 - angle * i;
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
    updateFrames();
    closeSelectedFrame();
    idleIntervalId = window.setInterval(function () {
      camera.rotation.y -= 0.0025;
      render();
    }, 100);
  }, 1000 * 60);
}

function openSelectedFrame () {
  openFrame = selectedFrame.clone()
  openFrame.position.x = camera.position.x - 1000;
  openFrame.position.y = camera.position.y;
  openFrame.position.z = camera.position.z - 1500;
  openFrame.rotation.y = camera.rotation.y;

  openFrame.material.transparent = frameSettings.transparent;
  openFrame.material.opacity = frameSettings.activeOpacity;

  var openFrameTextCanvas = document.createElement('canvas');
  openFrameTextCanvas.width = frameSettings.width;
  openFrameTextCanvas.height = frameSettings.height;
  openFrameTextContext = openFrameTextCanvas.getContext('2d');
  openFrameTextContext.font = 'Normal 75px Arial';
  openFrameTextContext.textAlign = 'left';
  openFrameTextContext.fillStyle = 'rgba(50, 50, 50, 0.75)';

  var frameIndex = frames.indexOf(selectedFrame);
  for ( var j = 0; j < 9; j++ ) {
    openFrameTextContext.fillText('Frame '+frameIndex+', line '+(j+1), 100, (150 + 100*j));
  }

  openFrameTextTexture = new THREE.Texture(openFrameTextCanvas);
  openFrameTextTexture.needsUpdate = true;
  openFrameTextMaterial = new THREE.MeshBasicMaterial({
    map: openFrameTextTexture,
    side: THREE.DoubleSide,
  });
  openFrameTextMaterial.transparent = true;
  openFrameTextMaterial.opacity = 1;
  openFrameTextGeometry = new THREE.PlaneGeometry( frameSettings.width, frameSettings.height );
  openFrameText = new THREE.Mesh( openFrameTextGeometry, openFrameTextMaterial );
  openFrameText.position.copy( openFrame.position );
  openFrameText.rotation.y = camera.rotation.y;

  scene.add(openFrame);
  scene.add(openFrameText);
  render();
}

function closeSelectedFrame () {
  if ( !openFrame || !openFrameText ) { return; }
  scene.remove(openFrame);
  scene.remove(openFrameText);
  render();
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
  }
}

function onDocumentMouseDown ( event ) {
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
  initIdleAnimation();
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
