'use strict';

var about = {

  init: function () {
  },

  isActive: function () {
    return !!document.getElementById('about').style.display && document.getElementById('about').style.display !== 'none';
  },

  open: function () {
    document.getElementById('about').style.display = 'flex';
    menu.close();
  },

  close: function () {
    document.getElementById('about').style.display = 'none';
  },

  toggle: function () {
    about.isActive() ? about.close() : about.open();
  },

  isClicked: function (event) {
    return document.getElementById('about').contains(event.target);
  },

};
