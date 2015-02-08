var re = require('./re_unicode_parts');

// Any valid usc-2 sequence
var src_valid = re.src_valid;

// \p{\Z} (\s white spaces)
var src_Z = re.src_Z;

// \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
var src_ZPCcCf = exports.src_ZPCcCf = [ re.src_Z, re.src_P, re.src_Cc, re.src_Cf ].join('|');

// All possible word characters (everything without punctuation, spaces & controls)
// Defined via punctuation & spaces to save space
// Should be something like \p{\L\N\S\M} (\w but without `_`)
var src_pseudo_letter       = '(?:(?!' + src_ZPCcCf + ')' + src_valid + ')';
// The same as abothe but without [0-9]
var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCcCf + ')' + src_valid + ')';

////////////////////////////////////////////////////////////////////////////////

exports.src_xn      = 'xn--[a-z0-9\\-]{1,59}';
exports.src_ip4     = '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
exports.src_auth    = '(?:(?:(?!' + src_Z + ').)+@)?';
exports.src_port    = '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

exports.src_host_terminator = '(?=$|' + src_ZPCcCf + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + src_ZPCcCf + '))';


exports.src_domain  = '(?:(?:' + src_pseudo_letter + '+-?){0,62}(?:' + src_pseudo_letter_non_d + '){1,63})';

exports.src_path    = '(?:' +
                    '[/?#]' +
                      '(?:' +
                        '(?!' + src_Z + '|[\\(\\)\\[\\]\\{\\}\\.\\,\\"\\\'\\?]).|' +
                        '\\[(?:(?!' + src_Z + '|\\]).)*\\]|' +
                        '\\((?:(?!' + src_Z + '|[)]).)*\\)|' +
                        '\\{(?:(?!' + src_Z + '|[}]).)*\\}|' +
                        '\\"(?:(?!' + src_Z + '|["]).)+\\"|' +
                        '\\.(?!' + src_Z + '|[.]).|' +
                        '\\,(?!' + src_Z + '|[,]).|' +
                        '\\?(?!' + src_Z + '|[?]).' +
                      ')+' +
                    '|\\/' +
                  ')?';

exports.src_mail_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_]+';
