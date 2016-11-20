'use strict';

var themes = {

  all: {},

  height: 5000,

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

  toggle: function () {
    themes.isActive() ? themes.close() : themes.open();
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
    if ( !!key ) {
      if ( event.target.className === 'theme-btn--del' ) {
        sync.removeTheme(key);
      } else {
        themes.switchTo(key);
      }
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

  moveUp: function () {
if ( index == 5 ) { debugger};
    var index = app.camera.position.y / themes.height;
    if ( index === Object.keys(themes.all).length-1 ) {
      themes.switchTo(Object.keys(themes.all)[0]);
    } else {
      themes.switchTo(Object.keys(themes.all)[index+1]);
    }
  },

  moveDown: function () {
    var index = app.camera.position.y / themes.height;
    if  ( index === 0 ) {
      themes.switchTo(Object.keys(themes.all)[Object.keys(themes.all).length-1]);
    } else {
      themes.switchTo(Object.keys(themes.all)[index-1]);
    }
  },

  switchTo: function (key) {
    if ( !!themes.switchIntervalId ) {
      return;
    }

    var duration = 500; //ms
    var interval = 100; //ms

    // theme position (based on themes reserved height)
    var position = themes.height * Object.keys(themes.all).indexOf(key);

    new TWEEN.Tween(app.camera.position).to({
      y: position,
    }, duration).easing(TWEEN.Easing.Quadratic.Out).start();

    themes.switchIntervalId = window.setInterval(function () {
      TWEEN.update();
      app.dirty = true;
    }, interval);

    window.setTimeout(function () {
      themes.switchIntervalId = window.clearInterval(themes.switchIntervalId);
    }, duration);
  },

};
