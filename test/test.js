'use strict';

/*eslint-env node,mocha*/

var fs      = require('fs');
var path    = require('path');
var assert  = require('chai').assert;

var linkify = require('../');

var lines;


describe('links', function () {

  var l = linkify();

  lines = fs.readFileSync(path.join(__dirname, 'fixtures/links.txt'), 'utf8').split(/\r?\n/g);

  var skipNext = false;

  lines.forEach(function (line, idx) {
    if (skipNext) {
      skipNext = false;
      return;
    }

    line = line.replace(/^%.*/, '');

    var next = (lines[idx + 1] || '').replace(/^%.*/, '');

    if (!line.trim()) { return; }

    if (next.trim()) {
      it('line ' + (idx + 1), function () {
        assert.ok(l.test(line), '(link not found in `' + line + '`)');
        assert.equal(l.match(line)[0].url, next);
      });
      skipNext = true;
    } else {
      it('line ' + (idx + 1), function () {
        assert.ok(l.test(line), '(link not found in `' + line + '`)');
        assert.equal(l.match(line)[0].url, line);
      });
    }
  });

});


describe('not links', function () {

  var l = linkify();

  lines = fs.readFileSync(path.join(__dirname, 'fixtures/not_links.txt'), 'utf8').split(/\r?\n/g);

  lines.forEach(function (line, idx) {
    line = line.replace(/^%.*/, '');

    if (!line.trim()) { return; }

    it('line ' + (idx + 1), function () {
      assert.notOk(l.test(line),
       '(should not find link in `' + line + '`, but found `' +
       JSON.stringify((l.match(line) || [])[0]) + '`)');
    });
  });

});

describe('API', function () {

  it('extend tlds', function () {
    var l = linkify();

    assert.notOk(l.test('google.myroot'));

    l.tlds('myroot', true);

    assert.ok(l.test('google.myroot'));
    assert.notOk(l.test('google.xyz'));

    l.tlds(require('tlds'));

    assert.ok(l.test('google.xyz'));
    assert.notOk(l.test('google.myroot'));
  });


  it('add rule as regex', function () {
    var l = linkify().add('my:', /^\/\/[a-z]+/);

    var match = l.match('my:// my://asdf! google.com.');

    assert.equal(match[0].text, 'my://asdf');
    assert.equal(match[1].text, 'google.com');
  });


  it('add rule as object (regexp)', function () {
    var l = linkify().add('my:', {
      validate: /^\/\/[a-z]+/
    });

    var match = l.match('google.com. my:// my://asdf!');

    assert.equal(match[0].text, 'google.com');
    assert.equal(match[1].text, 'my://asdf');
  });

  it('add rule with normalizer', function () {
    var l = linkify().add('my:', {
      validate: /^\/\/[a-z]+/,
      normalize: function (m) {
        m.text = m.text.replace(/^my:\/\//, '').toUpperCase();
        m.url  = m.url.toUpperCase();
      }
    });

    var match = l.match('google.com. my:// my://asdf!');

    assert.equal(match[1].text, 'ASDF');
    assert.equal(match[1].url, 'MY://ASDF');
  });

  it('disable rule', function () {
    var l = linkify();

    assert.ok(l.test('http://google.com'));
    assert.ok(l.test('foo@bar.com'));
    l.add('http:', null);
    l.add('mailto:', null);
    assert.notOk(l.test('http://google.com'));
    assert.notOk(l.test('foo@bar.com'));
  });


  it('add bad definition', function () {
    var l;

    l = linkify().add('test:', []);

    assert.throw(function () { l.test('123'); });

    l = linkify().add('test:', {
      validate: []
    });

    assert.throw(function () { l.test('123'); });

    l = linkify().add('test:', {
      validate: function () { return false; },
      normalize: 'bad'
    });

    assert.throw(function () { l.test('123'); });
  });


  it('test at position', function () {
    var l = linkify();

    assert.ok(l.testSchemaAt('http://google.com', 'http:', 5));
    assert.notOk(l.testSchemaAt('http://google.com', 'http:', 6));
  });


  it('correct cache value', function () {
    var l = linkify();

    var match = l.match('.com. http://google.com google.com ftp://google.com');

    assert.equal(match[0].text, 'http://google.com');
    assert.equal(match[1].text, 'google.com');
    assert.equal(match[2].text, 'ftp://google.com');
  });

});
