(function () {
  'use strict';

  var Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;

  var Cc = /[\0-\x1F\x7F-\x9F]/;

  var P = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;

  var Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

  function reFactory (opts) {
    const re = {};
    opts = opts || {};

    re.src_Any = Any.source;
    re.src_Cc = Cc.source;
    re.src_Z = Z.source;
    re.src_P = P.source;

    // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
    re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join('|');

    // \p{\Z\Cc} (white spaces + control)
    re.src_ZCc = [re.src_Z, re.src_Cc].join('|');

    // Experimental. List of chars, completely prohibited in links
    // because can separate it from other part of text
    const text_separators = '[><\uff5c]';

    // All possible word characters (everything without punctuation, spaces & controls)
    // Defined via punctuation & spaces to save space
    // Should be something like \p{\L\N\S\M} (\w but without `_`)
    re.src_pseudo_letter = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
    // The same as abothe but without [0-9]
    // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

    re.src_ip4 =

      '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

    // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
    re.src_auth = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

    re.src_port =

      '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

    re.src_host_terminator =

      '(?=$|' + text_separators + '|' + re.src_ZPCc + ')' +
      '(?!' + (opts['---'] ? '-(?!--)|' : '-|') + '_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

    re.src_path =

      '(?:' +
        '[/?#]' +
          '(?:' +
            '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-;]).|' +
            '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
            '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
            '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
            '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
            "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +

            // allow `I'm_king` if no pair found
            "\\'(?=" + re.src_pseudo_letter + '|[-])|' +

            // google has many dots in "google search" links (#66, #81).
            // github has ... in commit range links,
            // Restrict to
            // - english
            // - percent-encoded
            // - parts of file path
            // - params separator
            // until more examples found.
            '\\.{2,}[a-zA-Z0-9%/&]|' +

            '\\.(?!' + re.src_ZCc + '|[.]|$)|' +
            (opts['---']
              ? '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
              : '\\-+|'
            ) +
            // allow `,,,` in paths
            ',(?!' + re.src_ZCc + '|$)|' +

            // allow `;` if not followed by space-like char
            ';(?!' + re.src_ZCc + '|$)|' +

            // allow `!!!` in paths, but not at the end
            '\\!+(?!' + re.src_ZCc + '|[!]|$)|' +

            '\\?(?!' + re.src_ZCc + '|[?]|$)' +
          ')+' +
        '|\\/' +
      ')?';

    // Allow anything in markdown spec, forbid quote (") at the first position
    // because emails enclosed in quotes are far more common
    re.src_email_name =

      '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';

    re.src_xn =

      'xn--[a-z0-9\\-]{1,59}';

    // More to read about domain names
    // http://serverfault.com/questions/638260/

    re.src_domain_root =

      // Allow letters & digits (http://test1)
      '(?:' +
        re.src_xn +
        '|' +
        re.src_pseudo_letter + '{1,63}' +
      ')';

    re.src_domain =

      '(?:' +
        re.src_xn +
        '|' +
        '(?:' + re.src_pseudo_letter + ')' +
        '|' +
        '(?:' + re.src_pseudo_letter + '(?:-|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
      ')';

    re.src_host =

      '(?:' +
      // Don't need IP check, because digits are already allowed in normal domain names
      //   src_ip4 +
      // '|' +
        '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/* _root */ + ')' +
      ')';

    re.tpl_host_fuzzy =

      '(?:' +
        re.src_ip4 +
      '|' +
        '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
      ')';

    re.tpl_host_no_ip_fuzzy =

      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

    re.src_host_strict =

      re.src_host + re.src_host_terminator;

    re.tpl_host_fuzzy_strict =

      re.tpl_host_fuzzy + re.src_host_terminator;

    re.src_host_port_strict =

      re.src_host + re.src_port + re.src_host_terminator;

    re.tpl_host_port_fuzzy_strict =

      re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

    re.tpl_host_port_no_ip_fuzzy_strict =

      re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;

    //
    // Main rules
    //

    // Rude test fuzzy links by host, for quick deny
    re.tpl_host_fuzzy_test =

      'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

    re.tpl_email_fuzzy =

        '(^|' + text_separators + '|"|\\(|' + re.src_ZCc + ')' +
        '(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

    re.tpl_link_fuzzy =
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
        '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

    re.tpl_link_no_ip_fuzzy =
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
        '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

    return re
  }

  //
  // Helpers
  //

  // Merge objects
  //
  function assign (obj /* from1, from2, from3, ... */) {
    const sources = Array.prototype.slice.call(arguments, 1);

    sources.forEach(function (source) {
      if (!source) { return }

      Object.keys(source).forEach(function (key) {
        obj[key] = source[key];
      });
    });

    return obj
  }

  function _class (obj) { return Object.prototype.toString.call(obj) }
  function isString (obj) { return _class(obj) === '[object String]' }
  function isObject (obj) { return _class(obj) === '[object Object]' }
  function isRegExp (obj) { return _class(obj) === '[object RegExp]' }
  function isFunction (obj) { return _class(obj) === '[object Function]' }

  function escapeRE (str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') }

  //

  const defaultOptions = {
    fuzzyLink: true,
    fuzzyEmail: true,
    fuzzyIP: false
  };

  function isOptionsObj (obj) {
    return Object.keys(obj || {}).reduce(function (acc, k) {
      /* eslint-disable-next-line no-prototype-builtins */
      return acc || defaultOptions.hasOwnProperty(k)
    }, false)
  }

  const defaultSchemas = {
    'http:': {
      validate: function (text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.http) {
          // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.http = new RegExp(
            '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
          );
        }
        if (self.re.http.test(tail)) {
          return tail.match(self.re.http)[0].length
        }
        return 0
      }
    },
    'https:': 'http:',
    'ftp:': 'http:',
    '//': {
      validate: function (text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.no_http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
          self.re.no_http = new RegExp(
            '^' +
            self.re.src_auth +
            // Don't allow single-level domains, because of false positives like '//test'
            // with code comments
            '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
            self.re.src_port +
            self.re.src_host_terminator +
            self.re.src_path,

            'i'
          );
        }

        if (self.re.no_http.test(tail)) {
          // should not be `://` & `///`, that protects from errors in protocol name
          if (pos >= 3 && text[pos - 3] === ':') { return 0 }
          if (pos >= 3 && text[pos - 3] === '/') { return 0 }
          return tail.match(self.re.no_http)[0].length
        }
        return 0
      }
    },
    'mailto:': {
      validate: function (text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.mailto) {
          self.re.mailto = new RegExp(
            '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
          );
        }
        if (self.re.mailto.test(tail)) {
          return tail.match(self.re.mailto)[0].length
        }
        return 0
      }
    }
  };

  // RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
  /* eslint-disable-next-line max-len */
  const tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

  // DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
  const tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

  function resetScanCache (self) {
    self.__index__ = -1;
    self.__text_cache__ = '';
  }

  function createValidator (re) {
    return function (text, pos) {
      const tail = text.slice(pos);

      if (re.test(tail)) {
        return tail.match(re)[0].length
      }
      return 0
    }
  }

  function createNormalizer () {
    return function (match, self) {
      self.normalize(match);
    }
  }

  // Schemas compiler. Build regexps.
  //
  function compile (self) {
    // Load & clone RE patterns.
    const re = self.re = reFactory(self.__opts__);

    // Define dynamic patterns
    const tlds = self.__tlds__.slice();

    self.onCompile();

    if (!self.__tlds_replaced__) {
      tlds.push(tlds_2ch_src_re);
    }
    tlds.push(re.src_xn);

    re.src_tlds = tlds.join('|');

    function untpl (tpl) { return tpl.replace('%TLDS%', re.src_tlds) }

    re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), 'i');
    re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), 'i');
    re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
    re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

    //
    // Compile each schema
    //

    const aliases = [];

    self.__compiled__ = {}; // Reset compiled data

    function schemaError (name, val) {
      throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val)
    }

    Object.keys(self.__schemas__).forEach(function (name) {
      const val = self.__schemas__[name];

      // skip disabled methods
      if (val === null) { return }

      const compiled = { validate: null, link: null };

      self.__compiled__[name] = compiled;

      if (isObject(val)) {
        if (isRegExp(val.validate)) {
          compiled.validate = createValidator(val.validate);
        } else if (isFunction(val.validate)) {
          compiled.validate = val.validate;
        } else {
          schemaError(name, val);
        }

        if (isFunction(val.normalize)) {
          compiled.normalize = val.normalize;
        } else if (!val.normalize) {
          compiled.normalize = createNormalizer();
        } else {
          schemaError(name, val);
        }

        return
      }

      if (isString(val)) {
        aliases.push(name);
        return
      }

      schemaError(name, val);
    });

    //
    // Compile postponed aliases
    //

    aliases.forEach(function (alias) {
      if (!self.__compiled__[self.__schemas__[alias]]) {
        // Silently fail on missed schemas to avoid errons on disable.
        // schemaError(alias, self.__schemas__[alias]);
        return
      }

      self.__compiled__[alias].validate =
        self.__compiled__[self.__schemas__[alias]].validate;
      self.__compiled__[alias].normalize =
        self.__compiled__[self.__schemas__[alias]].normalize;
    });

    //
    // Fake record for guessed links
    //
    self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

    //
    // Build schema condition
    //
    const slist = Object.keys(self.__compiled__)
      .filter(function (name) {
        // Filter disabled & fake schemas
        return name.length > 0 && self.__compiled__[name]
      })
      .map(escapeRE)
      .join('|');
    // (?!_) cause 1.5x slowdown
    self.re.schema_test = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
    self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');
    self.re.schema_at_start = RegExp('^' + self.re.schema_search.source, 'i');

    self.re.pretest = RegExp(
      '(' + self.re.schema_test.source + ')|(' + self.re.host_fuzzy_test.source + ')|@',
      'i'
    );

    //
    // Cleanup
    //

    resetScanCache(self);
  }

  /**
   * class Match
   *
   * Match result. Single element of array, returned by [[LinkifyIt#match]]
   **/
  function Match (self, shift) {
    const start = self.__index__;
    const end = self.__last_index__;
    const text = self.__text_cache__.slice(start, end);

    /**
     * Match#schema -> String
     *
     * Prefix (protocol) for matched string.
     **/
    this.schema = self.__schema__.toLowerCase();
    /**
     * Match#index -> Number
     *
     * First position of matched string.
     **/
    this.index = start + shift;
    /**
     * Match#lastIndex -> Number
     *
     * Next position after matched string.
     **/
    this.lastIndex = end + shift;
    /**
     * Match#raw -> String
     *
     * Matched string.
     **/
    this.raw = text;
    /**
     * Match#text -> String
     *
     * Notmalized text of matched string.
     **/
    this.text = text;
    /**
     * Match#url -> String
     *
     * Normalized url of matched string.
     **/
    this.url = text;
  }

  function createMatch (self, shift) {
    const match = new Match(self, shift);

    self.__compiled__[match.schema].normalize(match, self);

    return match
  }

  /**
   * class LinkifyIt
   **/

  /**
   * new LinkifyIt(schemas, options)
   * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Creates new linkifier instance with optional additional schemas.
   * Can be called without `new` keyword for convenience.
   *
   * By default understands:
   *
   * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
   * - "fuzzy" links and emails (example.com, foo@bar.com).
   *
   * `schemas` is an object, where each key/value describes protocol/rule:
   *
   * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
   *   for example). `linkify-it` makes shure that prefix is not preceeded with
   *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
   * - __value__ - rule to check tail after link prefix
   *   - _String_ - just alias to existing rule
   *   - _Object_
   *     - _validate_ - validator function (should return matched length on success),
   *       or `RegExp`.
   *     - _normalize_ - optional function to normalize text & url of matched result
   *       (for example, for @twitter mentions).
   *
   * `options`:
   *
   * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
   * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
   *   like version numbers. Default `false`.
   * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
   *
   **/
  function LinkifyIt (schemas, options) {
    if (!(this instanceof LinkifyIt)) {
      return new LinkifyIt(schemas, options)
    }

    if (!options) {
      if (isOptionsObj(schemas)) {
        options = schemas;
        schemas = {};
      }
    }

    this.__opts__ = assign({}, defaultOptions, options);

    // Cache last tested result. Used to skip repeating steps on next `match` call.
    this.__index__ = -1;
    this.__last_index__ = -1; // Next scan position
    this.__schema__ = '';
    this.__text_cache__ = '';

    this.__schemas__ = assign({}, defaultSchemas, schemas);
    this.__compiled__ = {};

    this.__tlds__ = tlds_default;
    this.__tlds_replaced__ = false;

    this.re = {};

    compile(this);
  }

  /** chainable
   * LinkifyIt#add(schema, definition)
   * - schema (String): rule name (fixed pattern prefix)
   * - definition (String|RegExp|Object): schema definition
   *
   * Add new rule definition. See constructor description for details.
   **/
  LinkifyIt.prototype.add = function add (schema, definition) {
    this.__schemas__[schema] = definition;
    compile(this);
    return this
  };

  /** chainable
   * LinkifyIt#set(options)
   * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
   *
   * Set recognition options for links without schema.
   **/
  LinkifyIt.prototype.set = function set (options) {
    this.__opts__ = assign(this.__opts__, options);
    return this
  };

  /**
   * LinkifyIt#test(text) -> Boolean
   *
   * Searches linkifiable pattern and returns `true` on success or `false` on fail.
   **/
  LinkifyIt.prototype.test = function test (text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__ = -1;

    if (!text.length) { return false }

    let m, ml, me, len, shift, next, re, tld_pos, at_pos;

    // try to scan for link with schema - that's the most simple rule
    if (this.re.schema_test.test(text)) {
      re = this.re.schema_search;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        len = this.testSchemaAt(text, m[2], re.lastIndex);
        if (len) {
          this.__schema__ = m[2];
          this.__index__ = m.index + m[1].length;
          this.__last_index__ = m.index + m[0].length + len;
          break
        }
      }
    }

    if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
      // guess schemaless links
      tld_pos = text.search(this.re.host_fuzzy_test);
      if (tld_pos >= 0) {
        // if tld is located after found link - no need to check fuzzy pattern
        if (this.__index__ < 0 || tld_pos < this.__index__) {
          if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {
            shift = ml.index + ml[1].length;

            if (this.__index__ < 0 || shift < this.__index__) {
              this.__schema__ = '';
              this.__index__ = shift;
              this.__last_index__ = ml.index + ml[0].length;
            }
          }
        }
      }
    }

    if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
      // guess schemaless emails
      at_pos = text.indexOf('@');
      if (at_pos >= 0) {
        // We can't skip this check, because this cases are possible:
        // 192.168.1.1@gmail.com, my.in@example.com
        if ((me = text.match(this.re.email_fuzzy)) !== null) {
          shift = me.index + me[1].length;
          next = me.index + me[0].length;

          if (this.__index__ < 0 || shift < this.__index__ ||
              (shift === this.__index__ && next > this.__last_index__)) {
            this.__schema__ = 'mailto:';
            this.__index__ = shift;
            this.__last_index__ = next;
          }
        }
      }
    }

    return this.__index__ >= 0
  };

  /**
   * LinkifyIt#pretest(text) -> Boolean
   *
   * Very quick check, that can give false positives. Returns true if link MAY BE
   * can exists. Can be used for speed optimization, when you need to check that
   * link NOT exists.
   **/
  LinkifyIt.prototype.pretest = function pretest (text) {
    return this.re.pretest.test(text)
  };

  /**
   * LinkifyIt#testSchemaAt(text, name, position) -> Number
   * - text (String): text to scan
   * - name (String): rule (schema) name
   * - position (Number): text offset to check from
   *
   * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
   * at given position. Returns length of found pattern (0 on fail).
   **/
  LinkifyIt.prototype.testSchemaAt = function testSchemaAt (text, schema, pos) {
    // If not supported schema check requested - terminate
    if (!this.__compiled__[schema.toLowerCase()]) {
      return 0
    }
    return this.__compiled__[schema.toLowerCase()].validate(text, pos, this)
  };

  /**
   * LinkifyIt#match(text) -> Array|null
   *
   * Returns array of found link descriptions or `null` on fail. We strongly
   * recommend to use [[LinkifyIt#test]] first, for best speed.
   *
   * ##### Result match description
   *
   * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
   *   protocol-neutral  links.
   * - __index__ - offset of matched text
   * - __lastIndex__ - index of next char after mathch end
   * - __raw__ - matched text
   * - __text__ - normalized text
   * - __url__ - link, generated from matched text
   **/
  LinkifyIt.prototype.match = function match (text) {
    const result = [];
    let shift = 0;

    // Try to take previous element from cache, if .test() called before
    if (this.__index__ >= 0 && this.__text_cache__ === text) {
      result.push(createMatch(this, shift));
      shift = this.__last_index__;
    }

    // Cut head if cache was used
    let tail = shift ? text.slice(shift) : text;

    // Scan string until end reached
    while (this.test(tail)) {
      result.push(createMatch(this, shift));

      tail = tail.slice(this.__last_index__);
      shift += this.__last_index__;
    }

    if (result.length) {
      return result
    }

    return null
  };

  /**
   * LinkifyIt#matchAtStart(text) -> Match|null
   *
   * Returns fully-formed (not fuzzy) link if it starts at the beginning
   * of the string, and null otherwise.
   **/
  LinkifyIt.prototype.matchAtStart = function matchAtStart (text) {
    // Reset scan cache
    this.__text_cache__ = text;
    this.__index__ = -1;

    if (!text.length) return null

    const m = this.re.schema_at_start.exec(text);
    if (!m) return null

    const len = this.testSchemaAt(text, m[2], m[0].length);
    if (!len) return null

    this.__schema__ = m[2];
    this.__index__ = m.index + m[1].length;
    this.__last_index__ = m.index + m[0].length + len;

    return createMatch(this, 0)
  };

  /** chainable
   * LinkifyIt#tlds(list [, keepOld]) -> this
   * - list (Array): list of tlds
   * - keepOld (Boolean): merge with current list if `true` (`false` by default)
   *
   * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
   * to avoid false positives. By default this algorythm used:
   *
   * - hostname with any 2-letter root zones are ok.
   * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
   *   are ok.
   * - encoded (`xn--...`) root zones are ok.
   *
   * If list is replaced, then exact match for 2-chars root zones will be checked.
   **/
  LinkifyIt.prototype.tlds = function tlds (list, keepOld) {
    list = Array.isArray(list) ? list : [list];

    if (!keepOld) {
      this.__tlds__ = list.slice();
      this.__tlds_replaced__ = true;
      compile(this);
      return this
    }

    this.__tlds__ = this.__tlds__.concat(list)
      .sort()
      .filter(function (el, idx, arr) {
        return el !== arr[idx - 1]
      })
      .reverse();

    compile(this);
    return this
  };

  /**
   * LinkifyIt#normalize(match)
   *
   * Default normalizer (if schema does not define it's own).
   **/
  LinkifyIt.prototype.normalize = function normalize (match) {
    // Do minimal possible changes by default. Need to collect feedback prior
    // to move forward https://github.com/markdown-it/linkify-it/issues/1

    if (!match.schema) { match.url = 'http://' + match.url; }

    if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
      match.url = 'mailto:' + match.url;
    }
  };

  /**
   * LinkifyIt#onCompile()
   *
   * Override to modify basic RegExp-s.
   **/
  LinkifyIt.prototype.onCompile = function onCompile () {
  };

  /* eslint-disable no-bitwise */

  const decodeCache = {};

  function getDecodeCache (exclude) {
    let cache = decodeCache[exclude];
    if (cache) { return cache }

    cache = decodeCache[exclude] = [];

    for (let i = 0; i < 128; i++) {
      const ch = String.fromCharCode(i);
      cache.push(ch);
    }

    for (let i = 0; i < exclude.length; i++) {
      const ch = exclude.charCodeAt(i);
      cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
    }

    return cache
  }

  // Decode percent-encoded string.
  //
  function decode (string, exclude) {
    if (typeof exclude !== 'string') {
      exclude = decode.defaultChars;
    }

    const cache = getDecodeCache(exclude);

    return string.replace(/(%[a-f0-9]{2})+/gi, function (seq) {
      let result = '';

      for (let i = 0, l = seq.length; i < l; i += 3) {
        const b1 = parseInt(seq.slice(i + 1, i + 3), 16);

        if (b1 < 0x80) {
          result += cache[b1];
          continue
        }

        if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
          // 110xxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);

          if ((b2 & 0xC0) === 0x80) {
            const chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

            if (chr < 0x80) {
              result += '\ufffd\ufffd';
            } else {
              result += String.fromCharCode(chr);
            }

            i += 3;
            continue
          }
        }

        if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
          // 1110xxxx 10xxxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          const b3 = parseInt(seq.slice(i + 7, i + 9), 16);

          if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
            const chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

            if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
              result += '\ufffd\ufffd\ufffd';
            } else {
              result += String.fromCharCode(chr);
            }

            i += 6;
            continue
          }
        }

        if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
          // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
          const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
          const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
          const b4 = parseInt(seq.slice(i + 10, i + 12), 16);

          if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
            let chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

            if (chr < 0x10000 || chr > 0x10FFFF) {
              result += '\ufffd\ufffd\ufffd\ufffd';
            } else {
              chr -= 0x10000;
              result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
            }

            i += 9;
            continue
          }
        }

        result += '\ufffd';
      }

      return result
    })
  }

  decode.defaultChars = ';/?:@&=+$,#';
  decode.componentChars = '';

  const encodeCache = {};

  // Create a lookup array where anything but characters in `chars` string
  // and alphanumeric chars is percent-encoded.
  //
  function getEncodeCache (exclude) {
    let cache = encodeCache[exclude];
    if (cache) { return cache }

    cache = encodeCache[exclude] = [];

    for (let i = 0; i < 128; i++) {
      const ch = String.fromCharCode(i);

      if (/^[0-9a-z]$/i.test(ch)) {
        // always allow unencoded alphanumeric characters
        cache.push(ch);
      } else {
        cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
      }
    }

    for (let i = 0; i < exclude.length; i++) {
      cache[exclude.charCodeAt(i)] = exclude[i];
    }

    return cache
  }

  // Encode unsafe characters with percent-encoding, skipping already
  // encoded sequences.
  //
  //  - string       - string to encode
  //  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
  //  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
  //
  function encode (string, exclude, keepEscaped) {
    if (typeof exclude !== 'string') {
      // encode(string, keepEscaped)
      keepEscaped = exclude;
      exclude = encode.defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
      keepEscaped = true;
    }

    const cache = getEncodeCache(exclude);
    let result = '';

    for (let i = 0, l = string.length; i < l; i++) {
      const code = string.charCodeAt(i);

      if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
          result += string.slice(i, i + 3);
          i += 2;
          continue
        }
      }

      if (code < 128) {
        result += cache[code];
        continue
      }

      if (code >= 0xD800 && code <= 0xDFFF) {
        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
          const nextCode = string.charCodeAt(i + 1);
          if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
            result += encodeURIComponent(string[i] + string[i + 1]);
            i++;
            continue
          }
        }
        result += '%EF%BF%BD';
        continue
      }

      result += encodeURIComponent(string[i]);
    }

    return result
  }

  encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
  encode.componentChars = "-_.!~*'()";

  /* eslint-env browser */
  /* global $, _ */

  const linkify = LinkifyIt({ fuzzyIP: true });
  let permalink;

  function escape (str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function setLinkifiedContent (selector, content) {
    let out = escape(content);
    const matches = linkify.match(content);

    if (matches) {
      const result = [];
      let last = 0;
      matches.forEach(function (match) {
        if (last < match.index) {
          result.push(escape(content.slice(last, match.index)).replace(/\r?\n/g, '<br>'));
        }
        result.push('<a target="_blank" href="');
        result.push(escape(match.url));
        result.push('">');
        result.push(escape(match.text));
        result.push('</a>');
        last = match.lastIndex;
      });
      if (last < content.length) {
        result.push(escape(content.slice(last)).replace(/\r?\n/g, '<br>'));
      }
      out = result.join('');
    }

    $(selector).html(out);
  }

  function updateResult () {
    const source = $('.source').val();

    setLinkifiedContent('.result-html', source);

    if (source) {
      permalink.href = '#t1=' + encode(source, encode.componentChars);
    } else {
      permalink.href = '';
    }
  }

  //
  // Init on page load
  //
  $(function () {
    // Restore content if opened by permalink
    if (location.hash && /^(#t1=)/.test(location.hash)) {
      $('.source').val(decode(location.hash.slice(4), decode.componentChars));
    }

    // Activate tooltips
    $('._tip').tooltip({ container: 'body' });

    permalink = document.getElementById('permalink');

    // Setup listeners
    $('.source').on('keyup paste cut mouseup', _.debounce(updateResult, 300, { maxWait: 500 }));

    $('.source-clear').on('click', function (event) {
      $('.source').val('');
      updateResult();
      event.preventDefault();
    });

    updateResult();
  });

})();
