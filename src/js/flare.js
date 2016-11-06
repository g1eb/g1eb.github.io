'use strict';

var flare = {

  lensFlare: undefined,

  init: function () {
    var textureLoader = new THREE.TextureLoader();
    var textureFlare0 = textureLoader.load( "src/textures/lensflare0.png" );
    var textureFlare2 = textureLoader.load( "src/textures/lensflare2.png" );
    var textureFlare3 = textureLoader.load( "src/textures/lensflare3.png" );

    var flareColor = new THREE.Color( 0xffffff );
    flareColor.setHSL( 0.55, 0.9, 0.5 + 0.5 );
    flare.lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

    flare.lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    flare.lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    flare.lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

    flare.lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
    flare.lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
    flare.lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
    flare.lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

    flare.lensFlare.customUpdateCallback = flare.lensFlareUpdateCallback;
    flare.lensFlare.position.x = -1000000;
    flare.lensFlare.position.y = 500000;
    flare.lensFlare.position.z = -1000000;

    scene.add( flare.lensFlare );
    render();
  },

  lensFlareUpdateCallback: function ( object ) {
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
  },

  update: function (settings) {
    flare.lensFlare.position.x = settings.positionX;
    flare.lensFlare.position.y = settings.positionY;
    flare.lensFlare.position.z = settings.positionZ;
    flare.lensFlare.visible = settings.visible;
    render();
  },

};
