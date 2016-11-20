'use strict';

var animation = {

  chars: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],

  htmlColorCodes: [
    'indianred', 'lightcoral', 'salmon', 'darksalmon', 'lightsalmon', 'crimson', 'red', 'firebrick', 'darkred',
    'pink', 'lightpink', 'hotpink', 'deeppink', 'mediumvioletred', 'palevioletred',
    'lightsalmon', 'coral', 'tomato', 'orangered', 'darkorange', 'orange',
    'gold', 'yellow', 'lightyellow', 'lemonchiffon', 'lightgoldenrodyellow', 'papayawhip', 'moccasin', 'peachpuff', 'palegoldenrod', 'khaki', 'darkkhaki',
    'lavender', 'thistle', 'plum', 'violet', 'orchid', 'fuchsia', 'magenta', 'mediumorchid', 'mediumpurple', 'rebeccapurple', 'blueviolet', 'darkviolet',
    'darkorchid', 'darkmagenta', 'purple', 'indigo', 'slateblue', 'darkslateblue', 'mediumslateblue',
    'greenyellow', 'chartreuse', 'lawngreen', 'lime', 'limegreen', 'palegreen', 'lightgreen', 'mediumspringgreen', 'springgreen', 'mediumseagreen',
    'seagreen', 'forestgreen', 'green', 'darkgreen', 'yellowgreen', 'olivedrab', 'olive', 'darkolivegreen',
    'mediumaquamarine', 'darkseagreen', 'lightseagreen', 'darkcyan', 'teal',
    'aqua', 'cyan', 'lightcyan', 'paleturquoise', 'aquamarine', 'turquoise', 'mediumturquoise', 'darkturquoise', 'cadetblue',
    'steelblue', 'lightsteelblue', 'powderblue', 'lightblue', 'skyblue', 'lightskyblue', 'deepskyblue', 'dodgerblue', 'cornflowerblue',
    'mediumslateblue', 'royalblue', 'blue', 'mediumblue', 'darkblue', 'navy', 'midnightblue',
    'cornsilk', 'blanchedalmond', 'bisque', 'navajowhite', 'wheat', 'burlywood', 'tan', 'rosybrown', 'sandybrown',
    'goldenrod', 'darkgoldenrod', 'peru', 'chocolate', 'saddlebrown', 'sienna', 'brown', 'maroon',
    'white', 'snow', 'honeydew', 'mintcream', 'azure', 'aliceblue', 'ghostwhite', 'whitesmoke', 'seashell',
    'beige', 'oldlace', 'floralwhite', 'ivory', 'antiquewhite', 'linen', 'lavenderblush', 'mistyrose',
    'gainsboro', 'lightgray', 'silver', 'darkgray', 'gray', 'dimgray', 'lightslategray', 'slategray', 'darkslategray', 'black',
  ],

  container: undefined,

  idleTimeoutId: undefined,

  idleTimeoutDuration: 1000 * 60,

  textAnimationIntervalId: undefined,

  cameraPanIntervalId: undefined,

  init: function () {
    animation.initContainer();
    animation.initCamera();
    animation.reset();
  },

  initContainer: function () {
    animation.container = document.createElement('div');
    animation.container.className = 'animation-container';
    document.body.appendChild(animation.container);
  },

  initCamera: function () {
    var duration = 3000; //ms
    var interval = 100; //ms

    new TWEEN.Tween( app.camera.position ).to( {
      y: 0,
    }, duration ).easing( TWEEN.Easing.Quadratic.Out).start();

    new TWEEN.Tween( app.camera.rotation ).to( {
      y: Math.PI / 2,
    }, duration ).easing( TWEEN.Easing.Quadratic.Out).start();

    var initCameraInterval = window.setInterval(function () {
      TWEEN.update();
      app.dirty = true;
    }, interval);

    window.setTimeout(function () {
      window.clearInterval(initCameraInterval);
    }, duration);
  },

  reset: function () {
    animation.cancelAll();
    window.clearTimeout(animation.idleTimeoutId);
    animation.idleTimeoutId = window.setTimeout(function () {
      animation.start();
    }, animation.idleTimeoutDuration);
  },

  start: function () {
    frames.reset();
    animation.startTextAnimation();
    animation.startCameraPanAnimation();
  },

  startTextAnimation: function () {
    animation.textAnimationIntervalId = window.setInterval(function () {
      for ( var i = 0; i < Math.floor(Math.random() * 5); i++ ) {
        var element = document.createElement('span');
        animation.container.appendChild(element);
        var character = animation.chars[Math.floor(Math.random() * animation.chars.length)];
        var duration = Math.floor(Math.random() * 15);
        var offset = Math.floor(Math.random() * (30 - duration * 2)) + 3;
        var size = 10 + (15 - duration);
        element.className = 'text-animation';
        element.style.cssText = 'right:'+offset+'vw; font-size: '+size+'px; animation-duration:'+duration+'s';
        element.innerHTML = character;
        window.setTimeout(function (element) {
          element.parentNode.removeChild(element);
        }, duration * 1000, element);
      }
    }, 250);
  },

  startCameraPanAnimation: function () {
    animation.cameraPanIntervalId = window.setInterval(function () {
      app.camera.rotation.y -= 0.0015;
      app.dirty = true;
    }, 100);
  },

  cancelAll: function () {
    window.clearInterval(animation.textAnimationIntervalId);
    window.clearInterval(animation.cameraPanIntervalId);
  },

};
