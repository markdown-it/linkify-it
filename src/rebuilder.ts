/* eslint-disable no-return-assign, prefer-regex-literals */

import { Any, Cc, Z, P } from 'uc.micro'

/**
 * @category types
 */
export interface REBuilderOptions {
  '---'?: boolean
  fuzzyIP?: boolean
  schema_names?: string[]
  tlds?: string[]
  maxLength?: number
}

export class REBuilder {
  src_Any = Any.source
  src_Cc = Cc.source
  src_Z = Z.source
  src_P = P.source
  // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
  src_ZPCc = [this.src_Z, this.src_P, this.src_Cc].join('|')
  // \p{\Z\Cc} (white spaces + control)
  src_ZCc = [this.src_Z, this.src_Cc].join('|')
  cache: Record<string, RegExp | undefined> = {}
  opts: REBuilderOptions = { maxLength: 10000, schema_names: [] }

  constructor (opts: REBuilderOptions = {}) {
    this.opts = { ...this.opts, ...opts }
  }

  set (opts: REBuilderOptions = {}) {
    this.opts = { ...this.opts, ...opts }

    this.cache = {}
    return this
  }

  escapeRE (str: string) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') }

  nestedPairRE (open: string, close: string, depth = 4) {
    const openRE = this.escapeRE(open)
    const closeRE = this.escapeRE(close)
    const atom = `(?:(?!${this.src_ZCc}|${openRE}|${closeRE}).)`

    let pair = `${openRE}${atom}{0,1000}${closeRE}`

    for (let level = 2; level <= depth; level++) {
      pair = `${openRE}(?:${atom}|${pair}){0,1000}${closeRE}`
    }

    return pair
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

  get_ipv4_addr () {
    return this.cache.src_ip4 ??= new RegExp(
      '(?:' +
        '(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]' +
      '){3}' +
      '(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])'
    )
  }

  get_ipv6_addr () {
    const h16 = '[0-9A-Fa-f]{1,4}'
    const ls32 = `(?:(?:${h16}:${h16})|${this.get_ipv4_addr().source})`

    return this.cache.src_ip6_addr ??= new RegExp(
      '(?:' +
        `(?:${h16}:){6}${ls32}|` +
        `::(?:${h16}:){5}${ls32}|` +
        `(?:${h16})?::(?:${h16}:){4}${ls32}|` +
        `(?:(?:${h16}:){0,1}${h16})?::(?:${h16}:){3}${ls32}|` +
        `(?:(?:${h16}:){0,2}${h16})?::(?:${h16}:){2}${ls32}|` +
        `(?:(?:${h16}:){0,3}${h16})?::${h16}:${ls32}|` +
        `(?:(?:${h16}:){0,4}${h16})?::${ls32}|` +
        `(?:(?:${h16}:){0,5}${h16})?::${h16}|` +
        `(?:(?:${h16}:){0,6}${h16})?::` +
      ')'
    )
  }

  get_ipv6_url_host () {
    return this.cache.src_ip6_host ??= new RegExp(
      `\\[${this.get_ipv6_addr().source}\\]`
    )
  }

  get_ipv6_mail_host () {
    return this.cache.src_ipv6_mail_host ??= new RegExp(
      `\\[IPv6:${this.get_ipv6_addr().source}\\]`
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
    // Force greedy fetch, we should not stop earlier than host part is fully fetched.
    return this.cache.src_host_terminator ??= new RegExp(
      `(?=$|${this.get_text_separators().source}|${this.src_ZPCc})` +
      `(?!${this.opts['---'] ? '-(?!--)|' : '-|'}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`
    )
  }

  get_path_terminator () {
    return this.cache.src_path_terminator ??= new RegExp(
      `${this.src_ZPCc}|${this.get_text_separators().source}`
      // `${this.src_ZCc}|${this.get_text_separators().source}|[()[\\]{}.,"'?!\\-;]`
    )
  }

  get_path () {
    return this.cache.src_path ??= new RegExp(
      '(?:' +
        '[/?#]' +
          '(?:' +
            `${this.nestedPairRE('[', ']')}|` +
            `${this.nestedPairRE('(', ')')}|` +
            `${this.nestedPairRE('{', '}')}|` +
            `\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|` +
            `\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|` +

            // allow `I'm_king` if no pair found
            `\\'(?=${this.get_pseudo_letter().source}|[-])|` +

            // 1. google has many dots in "google search" links (#66, #81).
            // github has ... in commit range links,
            // Restrict to
            // - english
            // - percent-encoded
            // - parts of file path
            // - params separator
            // until more examples found.
            //
            // 2. Allow `..:XX` for Odysee links (optional `:`), #100
            // This may be narrowed down later via separate rule.
            '\\.{2,20}[:]?[a-zA-Z0-9%/&]|' +

            `\\.(?!${this.src_ZCc}|[.]|$)|` +
            (this.opts['---']
              ? '\\-(?!--(?:[^-]|$))(?:-{0,19})|' // `---` => long dash, terminate
              : '\\-{1,20}|'
            ) +
            // allow `,,,` in paths
            `,(?!${this.src_ZCc}|$)|` +

            // allow `;` if not followed by space-like char
            `;(?!${this.src_ZCc}|$)|` +

            // allow `!!!` in paths, but not at the end
            `\\!{1,20}(?!${this.src_ZCc}|[!]|$)|` +

            `\\?(?!${this.src_ZCc}|[?]|$)|` +

            this.get_path_extra().source +

            // allowed punctuation chars in path.
            '[\\\\/:%@#&=_~*]|' +

            // if no special rules matched, consume all chars except terminators.
            `(?!${this.get_path_terminator().source}).` +
          `){1,${this.opts.maxLength}}` +
        '|\\/' +
      ')?'
    )
  }

  get_mail_name () {
    return this.cache.src_mail_name ??= new RegExp(
      // RFC 5321 dot-string only (no quoted-string), max 64 ASCII characters.
      "[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}"
    )
  }

  get_xn () {
    return this.cache.src_xn ??= new RegExp(
      'xn--[a-z0-9\\-]{1,59}'
    )
  }

  get_tld () {
    if (this.cache.tld) return this.cache.tld

    const tlds_src = [...new Set(this.opts.tlds || [])].sort().reverse()
      .join('|')

    this.cache.tld = new RegExp(
      `${tlds_src || '$#none#$'}|${this.get_xn().source}`
    )
    return this.cache.tld
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

  // Host rules, depending on the type

  get_url_host_port () {
    return this.cache.url_host_port ??= new RegExp(
      '(?:' +
        // Don't need IP v4 check, because digits are already allowed
        // in normal domain names
        this.get_ipv6_url_host().source +
        '|' +
        `(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source})`/* _root */ +
      ')' +
      this.get_port().source +
      this.get_host_terminator().source
    )
  }

  get_fuzzy_url_host_port () {
    // - TLD as anchor
    // - No local domains
    return this.cache.fuzzy_url_host_port ??= new RegExp(
      '(?:' +
        (this.opts.fuzzyIP ? this.get_ipv4_addr().source + '|' : '') +
        `(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source}))` +
      ')' +
      // No port in fuzzy links to reduce search
      this.get_host_terminator().source
    )
  }

  get_mail_host () {
    // Similar to normal url host, but
    // - with different ipv6 format (and without port).
    // - with reduced max subdomains
    return this.cache.src_mail_host ??= new RegExp(
      '(?:' +
        this.get_ipv6_mail_host().source +
        '|' +
        `(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source})` +
      ')' +
      this.get_host_terminator().source
    )
  }

  get_fuzzy_mail_host () {
    // Similar to normal mail host, but without local domains.
    return this.cache.src_fuzzy_mail_host ??= new RegExp(
      '(?:' +
        this.get_ipv6_mail_host().source +
        '|' +
        `(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source})` +
      ')' +
      this.get_host_terminator().source
    )
  }

  // Hooks

  get_path_extra () {
    return this.cache.src_path_extra ??= new RegExp('')
  }

  // "Public" rules

  get_fuzzy_mail_host_search () {
    return this.cache.mail_fuzzy_host_search ??= new RegExp(
      `@${this.get_fuzzy_mail_host().source}`,
      'ig'
    )
  }

  get_fuzzy_link_search () {
    return this.cache.link_fuzzy_search ??= new RegExp(
        // Fuzzy link can't be prepended with .:/\- and non punctuation.
        // but can start with > (markdown blockquote)
        `(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uff5c]|${this.src_ZPCc}))` +
        `(?:(?![$+<=>^\`|\uff5c])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`,
      'ig'
    )
  }

  get_http_validator () {
    return this.cache.http_validator ??= new RegExp(
      `\\/\\/${this.get_auth().source}${this.get_url_host_port().source}${this.get_path().source}`,
      'iy'
    )
  }

  get_relative_proto_validator () {
    return this.cache.relative_proto_validator ??= new RegExp(
      this.get_auth().source +
      // Don't allow single-level domains, because of false positives like '//test'
      // with code comments.
      `(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})` +
      this.get_port().source +
      this.get_host_terminator().source +
      this.get_path().source,

      'iy'
    )
  }

  get_mail_name_validator () {
    return this.cache.mail_name_validator ??= new RegExp(
      `(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})` +
      `(${this.get_mail_name().source})$`
    )
  }

  get_mailto_validator () {
    return this.cache.mailto_validator ??= new RegExp(
      `${this.get_mail_name().source}@${this.get_mail_host().source}`,
      'iy'
    )
  }

  get_schema_names () {
    return this.cache.schema_names ??= new RegExp((this.opts.schema_names || []).map(name => this.escapeRE(name)).join('|'))
  }

  get_schema_search () {
    return this.cache.schema_search ??= new RegExp(
      `(^|(?!_)(?:[><\uff5c]|${this.src_ZPCc}))(${this.get_schema_names().source})`,
      'ig'
    )
  }

  get_schema_at_start () {
    return this.cache.schema_at_start ??= new RegExp(
      `^${this.get_schema_search().source}`,
      'i'
    )
  }
}
