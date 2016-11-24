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
      } else if ( groups.isActive() ) {
        if ( !groups.isClicked(event) ) {
          groups.close();
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

    if ( !!events.clickedNote && !events.clickedNote.data.locked ) {
      sync.updateNotePosition(events.clickedNote);
    }
  },

  onDocumentMouseMove: function (event) {
    window.clearTimeout(events.dragThresholdTimeoutId);

    if ( !menu.isActive() && !groups.isActive() && !about.isActive() && !help.isActive() && !notes.active ) {
      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      if ( !!events.clickedNote ) {
        if ( !events.clickedNote.data.locked ) {
          var data = notes.calcPosition(event);
          events.clickedNote.position.x = data.xpos;
          events.clickedNote.position.y = data.ypos;
          events.clickedNote.position.z = data.zpos;
          events.clickedNote.rotation.y = data.yrot;
          events.clickedNote.text.position.copy(events.clickedNote.position);
          events.clickedNote.text.rotation.copy(events.clickedNote.rotation);
          sync.updateNotePosition(events.clickedNote);
        }
      } else {
        app.camera.rotation.y += movementX * 0.01;
      }
      app.dirty = true;
    }
  },

  onDocumentMouseWheel: function (event) {
    if ( !menu.isActive() && !groups.isActive() && !about.isActive() && !help.isActive() && !notes.active ) {
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
      } else if ( groups.isActive() ) {
        groups.close();
      } else {
        menu.toggleMenu();
      }
    } else if ( event.keyCode === 13 ) {
      if ( !!notes.active ) {
        notes.updateActive();
      } else if ( groups.isActive() ) {
        groups.create();
      }
    } else if ( event.keyCode >= 48 && event.keyCode <= 57 ) {
      if ( groups.isActive() ) {
        groups.switchTo(Object.keys(groups.all)[event.keyCode-48]);
      } else if ( !notes.active && !groups.isActive() ) {
        sounds.play(event.keyCode);
      }
    } else if ( event.shiftKey && event.keyCode === 191 ) {
      if ( !notes.active ) {
        help.toggle();
      }
    } else if ( event.keyCode === 71 && !notes.active ) {
      groups.toggle();
    } else if ( event.keyCode === 38 && !notes.active ) {
      groups.moveUp();
    } else if ( event.keyCode === 40 && !notes.active ) {
      groups.moveDown();
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
    document.getElementById('menu-btn--groups').addEventListener('click', groups.open, false);
    document.getElementById('menu-btn--about').addEventListener('click', about.open, false);
    document.getElementById('menu-btn--help').addEventListener('click', help.open, false);
  },

  unbindMenuButtons: function () {
    document.getElementById('menu-btn--groups').removeEventListener('click', groups.open, false);
    document.getElementById('menu-btn--about').removeEventListener('click', about.open, false);
    document.getElementById('menu-btn--help').removeEventListener('click', help.open, false);
  },

  bindGroupsButtons: function () {
    document.getElementById('groups-column').addEventListener('click', groups.select, false);
    document.getElementById('groups-btn--add').addEventListener('click', groups.create, false);
  },

  unbindGroupsButtons: function () {
    document.getElementById('groups-column').removeEventListener('click', groups.select, false);
    document.getElementById('groups-btn--add').removeEventListener('click', groups.create, false);
  },

};
