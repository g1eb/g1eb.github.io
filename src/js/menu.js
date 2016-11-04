'use strict';

var menu = {

  init: function () {
    menu.setClickListeners();
    menu.setTouchListeners();
  },

  setClickListeners: function () {
    var timeoutId;
    document.body.addEventListener('mousedown', function (e) {
      if ( e.button === 0 ) {
        timeoutId = window.setTimeout(function () {
          menu.toggleMenu();
        }, 500);
      }
      if ( menu.isActive() ) {
        if ( !document.getElementById('menu').contains(e.target) ) {
          menu.toggleMenu();
          window.clearTimeout(timeoutId);
        }
      }
    });
    document.body.addEventListener('mouseup', function () {
      window.clearTimeout(timeoutId);
    });
    document.body.addEventListener('keyup', function (e) {
      if ( e.keyCode === 27 ) {
        menu.toggleMenu();
      }
    });
  },

  setTouchListeners: function () {
    var timeoutId;
    document.body.addEventListener('touchstart', function (e) {
      timeoutId = window.setTimeout(function () {
        menu.toggleMenu();
      }, 500);
      if ( menu.isActive() ) {
        if ( !document.getElementById('menu').contains(e.target) ) {
          menu.toggleMenu();
          window.clearTimeout(timeoutId);
        }
      }
    });
    document.body.addEventListener('touchend', function () {
      window.clearTimeout(timeoutId);
    });
  },

  toggleMenu: function () {
    if ( !!menu.isActive() ) {
      menu.closeMenu();
    } else {
      menu.openMenu();
    }
  },

  isActive: function () {
    return document.getElementById('menu').style.display !== 'none';
  },

  openMenu: function () {
    document.getElementById('menu').style.display = 'flex';
  },

  closeMenu: function () {
    document.getElementById('menu').style.display = 'none';
  },

};
