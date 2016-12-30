'use strict';

var progressBar = {

  element: undefined,

  init: function () {
    if ( !progressBar.element ) {
      progressBar.create();
    }
  },

  create: function () {
    progressBar.element = document.createElement('div');
    progressBar.element.setAttribute('id', 'progress-bar');
    progressBar.element.className = 'progress-bar';
    document.body.appendChild(progressBar.element);
  },

  remove: function () {
    progressBar.element.parentNode.removeChild(progressBar.element);
  },

  set: function (value) {
    progressBar.element.style.right = value;
  },

};
