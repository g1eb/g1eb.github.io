'use strict';

var menu = {

  helpActive: false,

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
    events.bindMenuButtons();
  },

  closeMenu: function () {
    document.getElementById('menu').style.display = 'none';
    events.unbindMenuButtons();
  },

  isClicked: function (event) {
    return document.getElementById('menu').contains(event.target);
  },

};
