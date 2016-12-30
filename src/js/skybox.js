'use strict';

var skybox = {

  texture: 'src/textures/skybox_sea3.png',

  init: function () {
    skybox.load();
  },

  load: function () {
    progressBar.init();

    var loader = new THREE.ImageLoader();
    loader.load(skybox.texture, function ( image ) {

      var size = 1024;
      var canvas, context, texture;
      var getSide = function (x, y) {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        canvas.height = size;
        canvas.width = size;
        context.drawImage(image, x*size, y*size, size, size, 0, 0, size, size);
        texture = new THREE.Texture();
        texture.image = canvas;
        texture.needsUpdate = true;
        return new THREE.MeshBasicMaterial({map: texture});
      }

      var materials = [];
      materials.push(getSide(2, 1)); // posx
      materials.push(getSide(0, 1)); // negx
      materials.push(getSide(1, 0)); // posy
      materials.push(getSide(1, 2)); // negy
      materials.push(getSide(1, 1)); // posz
      materials.push(getSide(3, 1)); // negz

      var skyboxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(size*1000, size*1000, size*1000),
        new THREE.MultiMaterial(materials)
      );
      skyboxMesh.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
      app.scene.add(skyboxMesh);
      app.dirty = true;

      progressBar.remove();
    }, function (xhr) {
      progressBar.set((100 - (xhr.loaded / xhr.total * 100)) + 'vw');
    });

  },

};
