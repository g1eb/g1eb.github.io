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
    var element = document.getElementById('themes-input--add');
    if ( !!element.value ) {
      sync.addTheme(element.value, 'red');
      element.value = '';
    }
  },

  select: function (event) {
    var key = event.target.dataset.key;
    if ( !!key && event.target.className === 'theme-btn--del' ) {
      sync.removeTheme(key);
      themes.remove(key);
    } else {
      // open selected theme and related frames
    }
  },

  add: function (key, theme) {
    var container = document.getElementById('themes-column');
    var element = document.createElement('div');
    element.append(themes.getThemeButton(key, theme.title));
    element.append(themes.getDelButton(key));
    element.setAttribute('id', 'theme-'+key);
    element.className = 'theme';
    container.append(element);

    themes.all[key] = theme;
  },

  getThemeButton: function (key, title) {
    var button = document.createElement('button');
    button.setAttribute('data-key', key);
    button.className = 'theme-btn';
    button.innerHTML = title;
    button.type = 'button';
    return button;
  },

  getDelButton: function (key) {
    var button = document.createElement('button');
    button.setAttribute('data-key', key);
    button.className = 'theme-btn--del';
    button.innerHTML = '&times;';
    button.type = 'button';
    return button;
  },

  update: function (key, data) {
    if ( !!themes.all[key] ) {
      themes.all[key] = data;
    }
  },

  remove: function (key) {
    var element = document.getElementById('theme-'+key);
    if ( !!element ) {
      element.parentNode.removeChild(element);
    }
    delete themes.all[key];
  },

};
