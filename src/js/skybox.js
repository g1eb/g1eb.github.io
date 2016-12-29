'use strict';

var skybox = {

  texture: 'src/textures/skybox_sea3.png',

  init: function () {
    skybox.load();
  },

  load: function () {
    // Add a progress bar
    var progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);

    var materials = [];
    var loader = new THREE.ImageLoader();
    loader.load(skybox.texture, function ( image ) {

      var canvas, context, texture;
      var size = image.height;

      for ( var i = 0; i < 6; i++ ) {
        canvas = document.createElement( 'canvas' );
        context = canvas.getContext( '2d' );
        canvas.height = size;
        canvas.width = size;
        context.drawImage(image, size*i, 0, size, size, 0, 0, size, size);
        texture = new THREE.Texture();
        texture.image = canvas;
        texture.needsUpdate = true;
        materials.push(new THREE.MeshBasicMaterial({map: texture}));
      }

      var skyboxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(size*1000, size*1000, size*1000),
        new THREE.MultiMaterial(materials)
      );
      skyboxMesh.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
      app.scene.add(skyboxMesh);

      // Remove progress bar
      progressBar.parentNode.removeChild(progressBar);
      app.dirty = true;
    }, function (xhr) {
      progressBar.style.right = (100 - (xhr.loaded / xhr.total * 100)) + 'vw';
    });

  },

};
