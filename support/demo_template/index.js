(function () {
  'use strict';

  /*eslint-env browser*/
  /*global $, _*/

  var linkify, permalink;

  function escape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function linkifyInit() {
    linkify = window.linkifyit();
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

    try {
      if (source) {
        // serialize state - source and options
        permalink.href = '#md64=' + window.btoa(JSON.stringify({
          source: source
        }));
      } else {
        permalink.href = '';
      }
    } catch (__) {
      permalink.href = '';
    }
  }


  //////////////////////////////////////////////////////////////////////////////
  // Init on page load
  //
  $(function() {

    // Restore content if opened by permalink
    if (location.hash && /^(#md=|#md64=)/.test(location.hash)) {
      try {
        var cfg;

        if (/^#md64=/.test(location.hash)) {
          cfg = JSON.parse(window.atob(location.hash.slice(6)));
        } else {
          // Legacy mode for old links. Those become broken in github posts,
          // so we switched to base64 encoding.
          cfg = JSON.parse(decodeURIComponent(location.hash.slice(4)));
        }

        if (_.isString(cfg.source)) {
          $('.source').val(cfg.source);
        }

      } catch (__) {}
    }

    // Activate tooltips
    $('._tip').tooltip({ container: 'body' });

    linkifyInit();
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
