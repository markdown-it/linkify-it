#!/usr/bin/env node
'use strict';

/*eslint-disable max-len*/

var fs   = require('fs');
var path = require('path');
var XR   = require('xregexp').XRegExp;

var esc = JSON.stringify;

XR.install('astral');

/*
var out = '';

out += 'exports.alpha    = ' + esc((new XR('\\p{Alphabetic}')).source) + ';\n';
out += 'exports.num      = ' + esc((new XR('\\p{\N}')).source) + ';\n';
out += 'exports.sym      = ' + esc((new XR('\\p{\S}')).source) + ';\n';
out += "exports.alphanum = '(?:' + exports.alpha.slice(3, -1) + '|' + exports.num.slice(3, -1) + ')';\n";
out += "exports.alphasym = '(?:' + exports.alpha.slice(3, -1) + '|' + exports.sym.slice(3, -1) + ')';\n";
out += "exports.alphanumsym = '(?:' + exports.alpha.slice(3, -1) + '|' + exports.num.slice(3, -1) + '|' + exports.sym.slice(3, -1) + ')';\n";
out += 'exports.punct    = ' + esc((new XR('\\p{\P}')).source) + ';\n';
// out += 'exports.ws       = ' + JSON.stringify((new XR('\\p{White_Space}')).source) + ';\n';
out += 'exports.ws       = ' + esc('[\\x09-\\x0D\\x20\\x85\\xA0\\u1680\\u180E\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]') + ';\n';

fs.writeFileSync(path.join('__dirname', '../re.js'), out, 'utf8');
*/
var out;

out = 'module.exports = ' + esc((new XR('\\p{\P}')).source.slice(3, -1)) + ';\n';

fs.writeFileSync(path.join('__dirname', '../lib/generated/re_punctuation.js'), out, 'utf8');

/*var tlds = require('tlds').filter(function (el) { return el.length === 4; })
                          .sort();

console.log(require('util').inspect(tlds));

out = require('util').inspect(tlds);

fs.writeFileSync(path.join('__dirname', '../lib/generated/tlds_mini.js'), out, 'utf8');*/
