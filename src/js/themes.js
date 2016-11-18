'use strict';

var themes = {

  all: {},

  init: function () {

    sync.getThemes();
  },

  isActive: function () {
    return !!document.getElementById('themes').style.display && document.getElementById('themes').style.display !== 'none';
  },

  open: function () {
    document.getElementById('themes').style.display = 'flex';
    menu.close();
  },

  close: function () {
    document.getElementById('themes').style.display = 'none';
  },

  isClicked: function (event) {
    return document.getElementById('themes').contains(event.target);
  },

  add: function (key, theme) {
    var container = document.getElementById('themes-column');

    var element = document.createElement('div');
    element.className = 'theme';
    element.innerHTML = theme.title;
    element.setAttribute('data-title', theme.title);
    element.setAttribute('data-color', theme.color);
    element.setAttribute('data-key', key);

    container.insertBefore(element, container.firstChild);

    themes.all[key] = theme;
  },

  update: function (key, data) {
    if ( !!themes.all[key] ) {
      themes.all[key] = data;
    }
  },

  remove: function (key) {
    delete themes.all[key];
  },

};
