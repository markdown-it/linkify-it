'use strict';

var linkify = require('../../../')();

linkify.test('');

exports.run = function (data) {
  return linkify.match(data);
};
