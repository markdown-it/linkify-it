'use strict';

/*eslint-env browser*/
/*global $, _*/

var linkify = require('../../')({ fuzzyIP: true });
var mdurl   = require('mdurl');
var permalink;

function escape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setLinkifiedContent(selector, content) {
  var out     = escape(content),
      matches = linkify.match(content),
      result  = [],
      last;

  if (matches) {
    last = 0;
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

function updateResult() {
  var source = $('.source').val();

  setLinkifiedContent('.result-html', source);

  if (source) {
    permalink.href = '#t1=' + mdurl.encode(source, mdurl.encode.componentChars);
  } else {
    permalink.href = '';
  }
}


//////////////////////////////////////////////////////////////////////////////
// Init on page load
//
$(function() {

  // Restore content if opened by permalink
  if (location.hash && /^(#t1=)/.test(location.hash)) {
    $('.source').val(mdurl.decode(location.hash.slice(4), mdurl.decode.componentChars));
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
