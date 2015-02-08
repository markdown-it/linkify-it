#!/usr/bin/env node
'use strict';

/*eslint-disable no-console*/

var linkify = require('../')();
var inspect = require('util').inspect;

var text = [].concat(process.argv.slice(2)).join(' ');

console.log(text);
console.log(linkify.test(text));
console.log('----------------');
console.log(inspect(linkify, { depth: 0 }));
console.log('----------------');
console.log(inspect(linkify.match(text)));
console.log('----------------');
console.log(inspect(linkify, { depth: 0 }));
