'use strict';

var groups = {

  all: {},

  height: 5000,

  init: function () {
    sync.getGroups();
  },

  isActive: function () {
    return !!document.getElementById('groups').style.display && document.getElementById('groups').style.display !== 'none';
  },

  open: function () {
    menu.close();
    help.close();
    about.close();

    document.getElementById('groups').style.display = 'flex';
    events.bindGroupsButtons();
  },

  close: function () {
    document.getElementById('groups').style.display = 'none';
    events.unbindGroupsButtons();
  },

  toggle: function () {
    groups.isActive() ? groups.close() : groups.open();
  },

  isClicked: function (event) {
    return document.getElementById('groups').contains(event.target);
  },

  create: function (event) {
    var element = document.getElementById('groups-input--add');
    if ( !!element.value ) {
      sync.addGroup(element.value);
      element.value = '';
    }
  },

  select: function (event) {
    var key = event.target.dataset.key;
    if ( !!key ) {
      groups.switchTo(key);
    }
  },

  add: function (key, group) {
    var container = document.getElementById('groups-column');
    var element = document.createElement('div');
    element.append(groups.getGroupButton(key, group.title));
    element.setAttribute('id', 'group-'+key);
    element.className = 'group';
    container.insertBefore(element, container.childNodes[0]);

    groups.all[key] = group;
  },

  getGroupButton: function (key, title) {
    var button = document.createElement('button');
    button.setAttribute('data-key', key);
    button.className = 'group-btn';
    button.innerHTML = title;
    button.type = 'button';
    return button;
  },

  update: function (key, data) {
    if ( !!groups.all[key] ) {
      groups.all[key] = data;
    }
  },

  remove: function (key) {
    var element = document.getElementById('group-'+key);
    if ( !!element ) {
      element.parentNode.removeChild(element);
    }
    delete groups.all[key];
  },

  moveUp: function () {
if ( index == 5 ) { debugger};
    var index = app.camera.position.y / groups.height;
    if ( index === Object.keys(groups.all).length-1 ) {
      groups.switchTo(Object.keys(groups.all)[0]);
    } else {
      groups.switchTo(Object.keys(groups.all)[index+1]);
    }
  },

  moveDown: function () {
    var index = app.camera.position.y / groups.height;
    if  ( index === 0 ) {
      groups.switchTo(Object.keys(groups.all)[Object.keys(groups.all).length-1]);
    } else {
      groups.switchTo(Object.keys(groups.all)[index-1]);
    }
  },

  switchTo: function (key) {
    if ( !!groups.switchIntervalId ) {
      return;
    }

    var duration = 500; //ms
    var interval = 100; //ms

    // group position (based on groups reserved height)
    var position = groups.height * Object.keys(groups.all).indexOf(key);

    new TWEEN.Tween(app.camera.position).to({
      y: position,
    }, duration).easing(TWEEN.Easing.Quadratic.Out).start();

    groups.switchIntervalId = window.setInterval(function () {
      TWEEN.update();
      app.dirty = true;
    }, interval);

    window.setTimeout(function () {
      groups.switchIntervalId = window.clearInterval(groups.switchIntervalId);
    }, duration);
  },

};
