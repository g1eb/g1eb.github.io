'use strict';

var menu = {

  helpActive: false,
  settingsActive: false,

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

  openThemes: function () {
  },

  openSettings: function () {
    document.getElementById('settings').style.display = 'flex';
    menu.settingsActive = true;
    menu.closeMenu();
  },

  closeSettings: function () {
    menu.settingsActive = false;
    document.getElementById('settings').style.display = 'none';
  },

  openHelp: function () {
    document.getElementById('help').style.display = 'flex';
    menu.helpActive = true;
    menu.closeMenu();
  },

  closeHelp: function () {
    menu.helpActive = false;
    document.getElementById('help').style.display = 'none';
  },

  isClicked: function (event) {
    return document.getElementById('menu').contains(event.target);
  },

};
