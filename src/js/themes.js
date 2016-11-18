'use strict';

var themes = {

  list: [],

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
    element.setAttribute('data-theme-title', theme.title);

    container.insertBefore(element, container.firstChild);

    themes.list.push(theme);
  },

  update: function (key, data) {
    for ( var i = 0; i < themes.list.length; i++ ) {
      if ( themes.list[i].key === key ) {
        themes.list[i] = data;
      }
    }
  },

  remove: function (key) {
    for ( var i = 0; i < themes.list.length; i++ ) {
      if ( themes.list[i].key === key ) {
        themes.list.splice(i, 1);
      }
    }
  },

};
