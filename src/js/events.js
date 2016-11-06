'use strict';

var events = {

  moving: false,

  dragThresholdTimeoutId: undefined,
  dragThresholdDuration: 150,

  moveThresholdTimeoutId: undefined,
  moveThresholdDuration: 150,

  init: function () {
    document.addEventListener( 'mousedown', events.onDocumentMouseDown, false );
    document.addEventListener( 'wheel', events.onDocumentMouseWheel, false );
    document.addEventListener( 'touchstart', events.onDocumentTouchStart, false );
    document.addEventListener('keydown', events.onKeyDown, false);
    document.addEventListener('keyup', events.onKeyUp, false);
    window.addEventListener( 'resize', events.onWindowResize, false ); 
  },

  onDocumentMouseDown: function (event) {
    document.addEventListener( 'mousemove', events.onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', events.onDocumentMouseUp, false );

    // Toggle menu on long press, close menu when clicked outside
    if ( event.button === 0 ) {
      animation.reset();
      if ( menu.isActive() ) {
        if ( !menu.isClicked(event) ) {
          menu.closeMenu();
        }
      } else {
        events.dragThresholdTimeoutId = window.setTimeout(function () {
          frames.select(event);
        }, events.dragThresholdDuration);
      }
    }
  },

  onDocumentMouseUp: function (event) {
    document.removeEventListener( 'mousemove', events.onDocumentMouseMove );
    document.removeEventListener( 'mouseup', events.onDocumentMouseUp );

    events.moving = false;
  },

  onDocumentMouseMove: function (event) {
    window.clearTimeout(events.dragThresholdTimeoutId);

    events.moving = true;
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    camera.rotation.y += movementX * 0.01;
    render();
  },

  onDocumentMouseWheel: function (event) {
    if ( !menu.isActive() ) {
      animation.reset();
      camera.rotation.y += event.deltaY * 0.001;
      render();
    }
  },

  touchX: undefined,

  onDocumentTouchStart: function (event) {
    document.addEventListener( 'touchmove', events.onDocumentTouchMove, false );
    document.addEventListener( 'touchend', events.onDocumentTouchEnd, false );

    animation.reset();
    if ( menu.isActive() ) {
      if ( !menu.isClicked(event) ) {
        menu.closeMenu();
      }
    } else {
      var touch = event.touches[0];
      events.touchX = touch.screenX;
      events.moveThresholdTimeoutId = window.setTimeout(function () {
        frames.select(event);
      }, events.moveThresholdDuration);
    }
  },

  onDocumentTouchEnd: function (event) {
    document.removeEventListener( 'touchmove', events.onDocumentTouchMove );
    document.removeEventListener( 'touchend', events.onDocumentTouchEnd );

    events.moving = false;
  },

  onDocumentTouchMove: function (event) {
    window.clearTimeout(events.moveThresholdTimeoutId);

    events.moving = true;

    var touch = event.touches[0];
    camera.rotation.y += (touch.screenX - events.touchX) * 0.01;
    events.touchX = touch.screenX;
    render();
  },

  onKeyDown: function (event) {
    if ( event.keyCode == 37 ) {
      camera.rotation.y += 0.0125;
    } else if ( event.keyCode == 39 ) {
      camera.rotation.y -= 0.0125;
    }
    render();
  },

  onKeyUp: function (event) {
    if ( event.keyCode === 27 ) {
      menu.toggleMenu();
    }
  },

  onWindowResize: function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  },

};
