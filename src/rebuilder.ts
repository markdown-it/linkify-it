// @ts-nocheck
/* eslint-disable no-return-assign, prefer-regex-literals */

import { Any, Cc, Z, P } from 'uc.micro'

function escapeRE (str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') }

export class REBuilder {
  constructor (opts = {}) {
    this.src_Any = Any.source
    this.src_Cc = Cc.source
    this.src_Z = Z.source
    this.src_P = P.source
    // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
    this.src_ZPCc = [this.src_Z, this.src_P, this.src_Cc].join('|')
    // \p{\Z\Cc} (white spaces + control)
    this.src_ZCc = [this.src_Z, this.src_Cc].join('|')

    this.opts = Object.assign({ schema_names: [] }, opts)
    this.cache = {}
  }

  set (opts = {}) {
    Object.assign(this.opts, opts)

    this.cache = {}
    return this
  }

  // Partials

  get_text_separators () {
    // Experimental. List of chars, completely prohibited in links
    // because can separate it from other part of text
    return this.cache.text_separators ??= /[><\uff5c]/
  }

  get_pseudo_letter () {
    return this.cache.src_pseudo_letter ??= new RegExp(
      // All possible word characters (everything without punctuation, spaces & controls)
      // Defined via punctuation & spaces to save space
      // Should be something like \p{\L\N\S\M} (\w but without `_`)
      `(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`
    )
  }

  get_ip4 () {
    return this.cache.src_ip4 ??= new RegExp(

      '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
    )
  }

  get_auth () {
    return this.cache.src_auth ??= new RegExp(
      // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
      // Length is capped to exclude possible rescans till the end and avoid O(n^2)
      // DoS. No standard limit, just take something reasonable.
      `(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`
    )
  }

  get_port () {
    return this.cache.src_port ??= new RegExp(

      '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?'
    )
  }

  get_host_terminator () {
    return this.cache.src_host_terminator ??= new RegExp(

      `(?=$|${this.get_text_separators().source}|${this.src_ZPCc})` +
      `(?!${this.opts['---'] ? '-(?!--)|' : '-|'}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`
    )
  }

  get_path () {
    return this.cache.src_path ??= new RegExp(

      '(?:' +
        '[/?#]' +
          '(?:' +
            `(?!${this.src_ZCc}|${this.get_text_separators().source}|[()[\\]{}.,"'?!\\-;]).|` +
            `\\[(?:(?!${this.src_ZCc}|\\]).)*\\]|` +
            `\\((?:(?!${this.src_ZCc}|[)]).)*\\)|` +
            `\\{(?:(?!${this.src_ZCc}|[}]).)*\\}|` +
            `\\"(?:(?!${this.src_ZCc}|["]).)+\\"|` +
            `\\'(?:(?!${this.src_ZCc}|[']).)+\\'|` +

            // allow `I'm_king` if no pair found
            `\\'(?=${this.get_pseudo_letter().source}|[-])|` +

            // google has many dots in "google search" links (#66, #81).
            // github has ... in commit range links,
            // Restrict to
            // - english
            // - percent-encoded
            // - parts of file path
            // - params separator
            // until more examples found.
            '\\.{2,}[a-zA-Z0-9%/&]|' +

            `\\.(?!${this.src_ZCc}|[.]|$)|` +
            (this.opts['---']
              ? '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
              : '\\-+|'
            ) +
            // allow `,,,` in paths
            `,(?!${this.src_ZCc}|$)|` +

            // allow `;` if not followed by space-like char
            `;(?!${this.src_ZCc}|$)|` +

            // allow `!!!` in paths, but not at the end
            `\\!+(?!${this.src_ZCc}|[!]|$)|` +

            `\\?(?!${this.src_ZCc}|[?]|$)` +
          ')+' +
        '|\\/' +
      ')?'
    )
  }

  get_email_name () {
    return this.cache.src_email_name ??= new RegExp(

      // Allow anything in markdown spec, forbid quote (") at the first position
      // because emails enclosed in quotes are far more common
      // Max name length capped to 64 chars (RFC 5321). This also prevents O(n^2)
      // rescans to the end on inputs like `mailto:mailto:...`
      '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]{0,63}'
    )
  }

  get_xn () {
    return this.cache.src_xn ??= new RegExp(

      'xn--[a-z0-9\\-]{1,59}'
    )
  }

  get_tld () {
    return this.cache.tld ??= new RegExp(

      `${this.opts.tlds_src}|${this.get_xn().source}`
    )
  }

  get_domain_root () {
    return this.cache.src_domain_root ??= new RegExp(

      // More to read about domain names
      // http://serverfault.com/questions/638260/

      // Allow letters & digits (http://test1)
      '(?:' +
        this.get_xn().source +
        '|' +
        `${this.get_pseudo_letter().source}{1,63}` +
      ')'
    )
  }

  get_domain () {
    return this.cache.src_domain ??= new RegExp(

      '(?:' +
        this.get_xn().source +
        '|' +
        `(?:${this.get_pseudo_letter().source})` +
        '|' +
        `(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source})` +
      ')'
    )
  }

  get_host () {
    return this.cache.src_host ??= new RegExp(

      '(?:' +
      // Don't need IP check, because digits are already allowed in normal domain names
      //   src_ip4 +
      // '|' +
        `(?:(?:(?:${this.get_domain().source})\\.)*${this.get_domain().source})`/* _root */ +
      ')'
    )
  }

  get_host_fuzzy () {
    return this.cache.host_fuzzy ??= new RegExp(

      '(?:' +
        this.get_ip4().source +
      '|' +
        `(?:(?:(?:${this.get_domain().source})\\.)+(?:${this.get_tld().source}))` +
      ')'
    )
  }

  get_host_no_ip_fuzzy () {
    return this.cache.host_no_ip_fuzzy ??= new RegExp(

      `(?:(?:(?:${this.get_domain().source})\\.)+(?:${this.get_tld().source}))`
    )
  }

  get_host_strict () {
    return this.cache.src_host_strict ??= new RegExp(

      this.get_host().source + this.get_host_terminator().source
    )
  }

  get_host_fuzzy_strict () {
    return this.cache.host_fuzzy_strict ??= new RegExp(

      this.get_host_fuzzy().source + this.get_host_terminator().source
    )
  }

  get_host_port_strict () {
    return this.cache.src_host_port_strict ??= new RegExp(

      this.get_host().source + this.get_port().source + this.get_host_terminator().source
    )
  }

  get_host_port_fuzzy_strict () {
    return this.cache.host_port_fuzzy_strict ??= new RegExp(

      this.get_host_fuzzy().source + this.get_port().source + this.get_host_terminator().source
    )
  }

  get_host_port_no_ip_fuzzy_strict () {
    return this.cache.host_port_no_ip_fuzzy_strict ??= new RegExp(

      this.get_host_no_ip_fuzzy().source + this.get_port().source + this.get_host_terminator().source
    )
  }

  // Main rules

  get_host_fuzzy_test () {
    return this.cache.host_fuzzy_test ??= new RegExp(

      // Rude test fuzzy links by host, for quick deny
      `localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:${this.get_tld().source})(?:${this.src_ZPCc}|>|$))`,
      'i'
    )
  }

  get_email_fuzzy () {
    return this.cache.email_fuzzy ??= new RegExp(

        `(^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})` +
        `(${this.get_email_name().source}@${this.get_host_fuzzy_strict().source})`,
        'i'
    )
  }

  get_email_fuzzy_global () {
    return this.cache.email_fuzzy_global ??= new RegExp(

      this.get_email_fuzzy().source,
      'ig'
    )
  }

  get_link_fuzzy () {
    return this.cache.link_fuzzy ??= new RegExp(
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        `(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uff5c]|${this.src_ZPCc}))` +
        `((?![$+<=>^\`|\uff5c])${this.get_host_port_fuzzy_strict().source}${this.get_path().source})`,
        'i'
    )
  }

  get_link_fuzzy_global () {
    return this.cache.link_fuzzy_global ??= new RegExp(

      this.get_link_fuzzy().source,
      'ig'
    )
  }

  get_link_no_ip_fuzzy () {
    return this.cache.link_no_ip_fuzzy ??= new RegExp(
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        `(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uff5c]|${this.src_ZPCc}))` +
        `((?![$+<=>^\`|\uff5c])${this.get_host_port_no_ip_fuzzy_strict().source}${this.get_path().source})`,
        'i'
    )
  }

  get_link_no_ip_fuzzy_global () {
    return this.cache.link_no_ip_fuzzy_global ??= new RegExp(

      this.get_link_no_ip_fuzzy().source,
      'ig'
    )
  }

  get_http_validator () {
    return this.cache.http_validator ??= new RegExp(

      `\\/\\/${this.get_auth().source}${this.get_host_port_strict().source}${this.get_path().source}`,
      'iy'
    )
  }

  get_relative_proto_validator () {
    return this.cache.relative_proto_validator ??= new RegExp(

      this.get_auth().source +
      // Don't allow single-level domains, because of false positives like '//test'
      // with code comments.
      `(?:localhost|(?:(?:${this.get_domain().source})\\.)+${this.get_domain_root().source})` +
      this.get_port().source +
      this.get_host_terminator().source +
      this.get_path().source,

      'iy'
    )
  }

  get_mailto_validator () {
    return this.cache.mailto_validator ??= new RegExp(

      `${this.get_email_name().source}@${this.get_host_strict().source}`,
      'iy'
    )
  }

  get_schema_names_src () {
    return this.cache.schema_names_src ??= this.opts.schema_names.map(escapeRE).join('|')
  }

  get_schema_test () {
    return this.cache.schema_test ??= new RegExp(

      `(^|(?!_)(?:[><\uff5c]|${this.src_ZPCc}))(${this.get_schema_names_src()})`,
      'i'
    )
  }

  get_schema_search () {
    return this.cache.schema_search ??= new RegExp(

      this.get_schema_test().source,
      'ig'
    )
  }

  get_schema_at_start () {
    return this.cache.schema_at_start ??= new RegExp(

      `^${this.get_schema_search().source}`,
      'i'
    )
  }

  get_pretest () {
    return this.cache.pretest ??= new RegExp(

      `(${this.get_schema_test().source})|(${this.get_host_fuzzy_test().source})|@`,
      'i'
    )
  }
}
