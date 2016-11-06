'use strict';

var dev = {

  stats: undefined,

  init: function () {

    dev.stats = new Stats();
    document.body.appendChild(dev.stats.dom);
  },

  updateStats: function () {
    dev.stats.update();
  },
};
