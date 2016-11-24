'use strict';

var help = {

  init: function () {
  },

  isActive: function () {
    return !!document.getElementById('help').style.display && document.getElementById('help').style.display !== 'none';
  },

  open: function () {
    menu.close();
    about.close();
    groups.close();

    document.getElementById('help').style.display = 'flex';
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
