'use strict';

var events = {

  raycaster: undefined,

  ctrlKeyTimeoutId: undefined,
  ctrlKeyTimeoutDuration: 1000,

  dragThresholdTimeoutId: undefined,
  dragThresholdDuration: 150,

  moveThresholdTimeoutId: undefined,
  moveThresholdDuration: 150,

  init: function () {
    events.raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', events.onDocumentMouseDown, false);
    document.addEventListener('wheel', events.onDocumentMouseWheel, false);
    document.addEventListener('touchstart', events.onDocumentTouchStart, false);
    document.addEventListener('keydown', events.onKeyDown, false);
    document.addEventListener('keyup', events.onKeyUp, false);
    window.addEventListener('resize', events.onWindowResize, false);
  },

  getClicked: function (event, list) {
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / app.renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / app.renderer.domElement.clientHeight ) * 2 + 1;

    events.raycaster.setFromCamera( mouse, app.camera );
    var intersects = events.raycaster.intersectObjects(list);
    if ( !!intersects.length ) {
      return intersects[0].object;
    }
  },

  onDocumentMouseDown: function (event) {
    document.addEventListener('mousemove', events.onDocumentMouseMove, false);
    document.addEventListener('mouseup', events.onDocumentMouseUp, false);

    // Toggle menu on long press, close menu when clicked outside
    if ( event.button === 0 ) {
      animation.reset();
      if ( menu.isActive() ) {
        if ( !menu.isClicked(event) ) {
          menu.close();
        }
      } else if ( about.isActive() ) {
        if ( !about.isClicked(event) ) {
          about.close();
        }
      } else if ( help.isActive() ) {
        if ( !help.isClicked(event) ) {
          help.close();
        }
      } else if ( themes.isActive() ) {
        if ( !themes.isClicked(event) ) {
          themes.close();
        }
      } else {
        events.clickedNote = events.getClicked(event, notes.list);
        events.dragThresholdTimeoutId = window.setTimeout(function () {
          if ( !notes.isClicked(event) ) {
            notes.select(event, events.clickedNote);
          }
        }, events.dragThresholdDuration);
      }
    }
  },

  onDocumentMouseUp: function (event) {
    document.removeEventListener('mousemove', events.onDocumentMouseMove);
    document.removeEventListener('mouseup', events.onDocumentMouseUp);

    if ( !!events.clickedNote ) {
      sync.updateNotePosition(events.clickedNote);
    }
  },

  onDocumentMouseMove: function (event) {
    window.clearTimeout(events.dragThresholdTimeoutId);

    if ( !menu.isActive() && !themes.isActive() && !about.isActive() && !help.isActive() && !notes.active ) {
      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      if ( !!events.clickedNote ) {
        var data = notes.calcPosition(event);
        events.clickedNote.position.x = data.xpos;
        events.clickedNote.position.y = data.ypos;
        events.clickedNote.position.z = data.zpos;
        events.clickedNote.rotation.y = data.yrot;
        events.clickedNote.text.position.copy(events.clickedNote.position);
        events.clickedNote.text.rotation.copy(events.clickedNote.rotation);
        sync.updateNotePosition(events.clickedNote);
      } else {
        app.camera.rotation.y += movementX * 0.01;
      }
      app.dirty = true;
    }
  },

  onDocumentMouseWheel: function (event) {
    if ( !menu.isActive() && !themes.isActive() && !about.isActive() && !help.isActive() && !notes.active ) {
      animation.reset();
      app.camera.rotation.y += event.deltaY * 0.001;
      app.dirty = true;
    }
  },

  touchX: undefined,

  onDocumentTouchStart: function (event) {
    document.addEventListener('touchmove', events.onDocumentTouchMove, false);
    document.addEventListener('touchend', events.onDocumentTouchEnd, false);

    animation.reset();
    if ( menu.isActive() ) {
      if ( !menu.isClicked(event) ) {
        menu.close();
      }
    } else {
      var touch = event.touches[0];
      events.touchX = touch.screenX;
      events.moveThresholdTimeoutId = window.setTimeout(function () {
        notes.select(event);
      }, events.moveThresholdDuration);
    }
  },

  onDocumentTouchEnd: function (event) {
    document.removeEventListener( 'touchmove', events.onDocumentTouchMove );
    document.removeEventListener( 'touchend', events.onDocumentTouchEnd );
  },

  onDocumentTouchMove: function (event) {
    window.clearTimeout(events.moveThresholdTimeoutId);

    var touch = event.touches[0];
    app.camera.rotation.y += (touch.screenX - events.touchX) * 0.01;
    events.touchX = touch.screenX;
    app.dirty = true;
  },

  onKeyDown: function (event) {
    if ( event.ctrlKey ) {
      events.ctrlKeyTimeoutId = window.setTimeout(function () {
        // open ctrl module
      }, events.ctrlKeyTimeoutDuration);
    }

    if ( !notes.active ) {
      if ( event.keyCode == 37 ) {
        app.camera.rotation.y += 0.0125;
      } else if ( event.keyCode == 39 ) {
        app.camera.rotation.y -= 0.0125;
      }
    }
    app.dirty = true;
  },

  onKeyUp: function (event) {
    window.clearTimeout(events.ctrlKeyTimeout);
    if ( event.keyCode === 27 ) {
      if ( !!notes.active ) {
        notes.close();
      } else if ( about.isActive() ) {
        about.close();
      } else if ( help.isActive() ) {
        help.close();
      } else if ( themes.isActive() ) {
        themes.close();
      } else {
        menu.toggleMenu();
      }
    } else if ( event.keyCode === 13 ) {
      if ( !!notes.active ) {
        notes.updateActive();
      } else if ( themes.isActive() ) {
        themes.create();
      }
    } else if ( event.keyCode >= 48 && event.keyCode <= 57 ) {
      if ( themes.isActive() ) {
        themes.switchTo(Object.keys(themes.all)[event.keyCode-48]);
      } else if ( !notes.active && !themes.isActive() ) {
        sounds.play(event.keyCode);
      }
    } else if ( event.shiftKey && event.keyCode === 191 ) {
      if ( !notes.active ) {
        help.toggle();
      }
    } else if ( event.keyCode === 84 && !notes.active ) {
      themes.toggle();
    } else if ( event.keyCode === 38 && !notes.active ) {
      themes.moveUp();
    } else if ( event.keyCode === 40 && !notes.active ) {
      themes.moveDown();
    }
  },

  onWindowResize: function () {
    app.camera.aspect = window.innerWidth / window.innerHeight;
    app.camera.updateProjectionMatrix();
    app.renderer.setSize( window.innerWidth, window.innerHeight );
    app.dirty = true;
  },

  bindNoteEditButtons: function () {
    document.getElementById('note-edit-btn--save').addEventListener('click', notes.updateActive, false);
    document.getElementById('note-edit-btn--delete').addEventListener('click', notes.removeActive, false);
  },

  unbindNoteEditButtons: function () {
    document.getElementById('note-edit-btn--save').removeEventListener('click', notes.updateActive, false);
    document.getElementById('note-edit-btn--delete').removeEventListener('click', notes.removeActive, false);
  },

  bindMenuButtons: function () {
    document.getElementById('menu-btn--themes').addEventListener('click', themes.open, false);
    document.getElementById('menu-btn--about').addEventListener('click', about.open, false);
    document.getElementById('menu-btn--help').addEventListener('click', help.open, false);
  },

  unbindMenuButtons: function () {
    document.getElementById('menu-btn--themes').removeEventListener('click', themes.open, false);
    document.getElementById('menu-btn--about').removeEventListener('click', about.open, false);
    document.getElementById('menu-btn--help').removeEventListener('click', help.open, false);
  },

  bindThemesButtons: function () {
    document.getElementById('themes-column').addEventListener('click', themes.select, false);
    document.getElementById('themes-btn--add').addEventListener('click', themes.create, false);
  },

  unbindThemesButtons: function () {
    document.getElementById('themes-column').removeEventListener('click', themes.select, false);
    document.getElementById('themes-btn--add').removeEventListener('click', themes.create, false);
  },

};
