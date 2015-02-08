#!/usr/bin/env node
/*eslint-disable no-console*/
'use strict';

var fs = require('fs');
var path = require('path');

var linkify = require('../')();

// Forse compilation
linkify.test('');

var data = fs.readFileSync(path.join(__dirname, '/samples/lorem1.txt'), 'utf8');

for (var i = 0; i < 20; i++) {
  console.log(linkify.match(data));
}
