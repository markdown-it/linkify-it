__!!! Coming soon !!!__

linkify-it
==========

[![Build Status](https://img.shields.io/travis/markdown-it/linkify-it/master.svg?style=flat)](https://travis-ci.org/markdown-it/linkify-it)
[![NPM version](https://img.shields.io/npm/v/linkify-it.svg?style=flat)](https://www.npmjs.org/package/linkify-it)
[![Coverage Status](https://img.shields.io/coveralls/markdown-it/linkify-it/master.svg?style=flat)](https://coveralls.io/r/markdown-it/linkify-it?branch=master)


> Links recognition library with FULL unicode support.
> Focused on high quality link patterns detection in plain text.

Why it's awesome:

- Full unicode support, _with astral characters_!
- International domains support.
- Allows rules extension & custom normalizers.


Install
-------

```bash
npm install linkify-it --save
```

Browserification is also supported.


Use
---

```js
var linkify = require('linkify-it')();

linkify
  .tlds(require('tlds')) // load full tlds list
  .tlds('.onion', true);

linkify.test("Search at google.com.");
linkify.match("Search at google.com.");

```


API
---

### new LinkifyIt(schemas)

Creates new instance with optional additional schemas. By default understands:

- __protocols__
  - `http(s):`
  - `ftp(s):`
  - `mailto:`
- __fuzzy__
  - links
  - emails

`schemas` is an object, where each key/value describes protocol/rule:

- __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
  for example). `linkify-it` makes shure that prefix is not preceeded with
  alphanumeric char.
- __value__ - rule to check tail after link prefix
  - _String_ - just alias to existing rule
  - _RegExp_ - regexp to match string tail after prefix
  - _Object_
    - _validate_ - validator function (should return matched length on success),
      or `RegExp`.
    - _normalize_ - optional function to normalize text & url of matched result
      (for example, for twitter mentions).


### .test(text)

Searches linkifiable pattern and returns `true` on success or `false` on fail.


### .testSchemaAt(text, name, offset)

Similar to `.test()` but checks only specific protocol tail exactly at given
position. Returns length of found pattern (0 on fail).


### .match(text)

Returns `Array` of found link matches or null if nothing found.

Each match has:

- __schema__ - link schema, can be empty for fuzzy links, or `//` for
  protocol-neutral  links.
- __index__ - offset of matched text
- __lastIndex__ - index of next char after mathch end
- __raw__ - matched text
- __text__ - normalized text
- __url__ - link, generated from matched text


### .tlds(list[, keepOld])

Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
to avoid false positives. By default this algorythm used:

- hostname with any 2-letter root zones are ok.
- biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
  are ok.
- encoded (`xn--...`) root zones are ok.

If list is replaced, then exact match for 2-chars root zones will be checked.


### .add(schema, definition)

Add new rule with `schema` prefix. For definition details see constructor
description. To disable existing rule use `.add(name, null)`


## License

[MIT](https://github.com/markdown-it/linkify-it/blob/master/LICENSE)
