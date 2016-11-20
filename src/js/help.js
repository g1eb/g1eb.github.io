'use strict';

var help = {

  init: function () {
  },

  isActive: function () {
    return !!document.getElementById('help').style.display && document.getElementById('help').style.display !== 'none';
  },

  open: function () {
    document.getElementById('help').style.display = 'flex';
    menu.close();
    about.close();
    themes.close();
  },

  close: function () {
    document.getElementById('help').style.display = 'none';
  },

  toggle: function () {
    help.isActive() ? help.close() : help.open();
  },

  isClicked: function (event) {
    return document.getElementById('help').contains(event.target);
  },

};
