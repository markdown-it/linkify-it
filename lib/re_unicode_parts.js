/*eslint-disable no-octal-escape,max-len*/
exports.src_Cc = '[\0-\x1F\x7F-\x9F]';
exports.src_Cf = '[\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uDB40[\uDC01\uDC20-\uDC7F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uD804\uDCBD';
exports.src_Z  = '[\\x09-\\x0D\\x20\\x85\\xA0\\u1680\\u180E\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]';

exports.src_P  = require('./generated/re_punctuation.js');

exports.src_valid = '[^\\uD800-\\uDFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]';
