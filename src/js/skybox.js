'use strict';

var skybox = {

  mesh: undefined,

  texture: 'src/textures/skybox_sea3.png',

  init: function () {
    skybox.load();
  },

  load: function (texture) {
    // Add a progress bar for loading indication
    var progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);

    var cubeMap = new THREE.CubeTexture( [] );
    cubeMap.format = THREE.RGBFormat;

    var loader = new THREE.ImageLoader();
    loader.load(texture || skybox.texture, function ( image ) {

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

      // Remove progress bar
      progressBar.parentNode.removeChild(progressBar);
      app.dirty = true;
    }, function (xhr) {
      progressBar.style.right = (100 - (xhr.loaded / xhr.total * 100)) + 'vw';
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

    skybox.mesh = new THREE.Mesh(
      new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
      skyBoxMaterial
    );

    app.scene.add(skybox.mesh);
  },

  remove: function () {
    if ( !!skyBox.mesh ) {
      app.scene.remove(skybox.mesh);
    }
  },

};
