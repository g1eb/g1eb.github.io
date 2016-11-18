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
    events.bindThemesButtons();
    menu.close();
  },

  close: function () {
    document.getElementById('themes').style.display = 'none';
    events.unbindThemesButtons();
  },

  isClicked: function (event) {
    return document.getElementById('themes').contains(event.target);
  },

  create: function (event) {
    var title = document.getElementById('themes-input--add').value;
    if ( !!title ) {
      sync.addTheme(title, 'red');
    }
  },

  select: function (event) {
    var key = event.target.dataset.key;
    if ( !!key ) {
    }
  },

  add: function (key, theme) {
    var container = document.getElementById('themes-column');

    var element = document.createElement('div');
    element.className = 'theme';
    element.innerHTML = theme.title;
    element.setAttribute('data-title', theme.title);
    element.setAttribute('data-color', theme.color);
    element.setAttribute('data-key', key);

    container.append(element);

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
