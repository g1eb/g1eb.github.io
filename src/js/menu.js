'use strict';

var menu = {

  toggleMenu: function () {
    if ( !!menu.isActive() ) {
      menu.close();
    } else {
      menu.open();
    }
  },

  isActive: function () {
    return !!document.getElementById('menu').style.display && document.getElementById('menu').style.display !== 'none';
  },

  open: function () {
    document.getElementById('menu').style.display = 'flex';
    events.bindMenuButtons();
  },

  close: function () {
    document.getElementById('menu').style.display = 'none';
    events.unbindMenuButtons();
  },

  isClicked: function (event) {
    return document.getElementById('menu').contains(event.target);
  },

};
