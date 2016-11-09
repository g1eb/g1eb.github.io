'use strict';

var settings = {

  data: {},

  init: function () {
    sync.getSettings();
  },

  isActive: function () {
    return !!document.getElementById('settings').style.display && document.getElementById('settings').style.display !== 'none';
  },

  open: function () {
    document.getElementById('settings').style.display = 'flex';
    document.getElementById('settings--color').value = settings.data.color || '';
    document.getElementById('settings--background').value = settings.data.background || '';
    document.getElementById('settings--branding').value = settings.data.branding || '';
    events.bindSettingsButtons();
    menu.close();
  },

  update: function () {
    settings.data.color = document.getElementById('settings--color').value;
    settings.data.background = document.getElementById('settings--background').value;
    settings.data.branding = document.getElementById('settings--branding').value;
    sync.updateSettings(settings.data);
    settings.setBranding();
    settings.close();
  },

  close: function () {
    document.getElementById('settings').style.display = 'none';
    events.unbindSettingsButtons();
  },

  isClicked: function (event) {
    return document.getElementById('settings').contains(event.target);
  },

  setBackground: function () {
    if ( !device.isMobile() ) {
      skybox.load(settings.data.background);
    }
  },

  setBranding: function () {
    document.getElementById('branding').src = settings.data.branding || 'src/images/icon.png';
  },

};
