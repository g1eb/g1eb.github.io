'use strict';

var menu = {

  toggleMenu: function () {
    if ( !!menu.isActive() ) {
      menu.closeMenu();
    } else {
      menu.openMenu();
    }
  },

  isActive: function () {
    return !!document.getElementById('menu').style.display && document.getElementById('menu').style.display !== 'none';
  },

  openMenu: function () {
    document.getElementById('menu').style.display = 'flex';
  },

  closeMenu: function () {
    document.getElementById('menu').style.display = 'none';
  },

  isClicked: function (event) {
    return document.getElementById('menu').contains(event.target);
  },

};
