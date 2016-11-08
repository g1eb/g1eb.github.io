'use strict';

var settings = {

  init: function () {

    dev.stats = new Stats();
    document.body.appendChild(dev.stats.dom);
  },

  update: function () {
  },

  isActive: function () {
    return !!document.getElementById('settings').style.display && document.getElementById('settings').style.display !== 'none';
  },

  open: function () {
    document.getElementById('settings').style.display = 'flex';
    events.bindSettingsButtons();
    menu.closeMenu();
  },

  close: function () {
    document.getElementById('settings').style.display = 'none';
    events.unbindSettingsButtons();
  },

  isClicked: function (event) {
    return document.getElementById('settings').contains(event.target);
  },


};
