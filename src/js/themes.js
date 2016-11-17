'use strict';

var themes = {


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

};
