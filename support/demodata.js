#!/usr/bin/env node

// Build demo data for embedding into html

/*eslint no-console:0*/

'use strict';

var fs   = require('fs');
var path = require('path');

function isComment(str) { return /^%.*/.test(str); }
function isEmpty(str) { return !(str && str.trim()); }

var result = [], lines, line, i;

// Read links fixture
lines = fs.readFileSync(path.join(__dirname, '../test/fixtures/links.txt'), 'utf8').split(/\r?\n/g);

// Cleanup
for (i = 0; i < lines.length; i++) {
  line = lines[i];

  if (isComment(line)) {
    result.push(line);
    continue;
  }

  if (isEmpty(line)) {
    if (isComment(lines[i + 1])) {
      result.push('');
    }
    continue;
  }

  result.push(line);

  if (!isComment(lines[i + 1]) && !isEmpty(lines[i + 1])) {
    i++;
  }
}

result.push('');
result.push('');

// Read non-links fixture
lines = fs.readFileSync(path.join(__dirname, '../test/fixtures/not_links.txt'), 'utf8').split(/\r?\n/g);

result = result.concat(lines);

// Join lines
result = result.join('\n');

console.log(JSON.stringify({
  self: {
    demo: {
      source: result
    }
  }
}, null, 2));
