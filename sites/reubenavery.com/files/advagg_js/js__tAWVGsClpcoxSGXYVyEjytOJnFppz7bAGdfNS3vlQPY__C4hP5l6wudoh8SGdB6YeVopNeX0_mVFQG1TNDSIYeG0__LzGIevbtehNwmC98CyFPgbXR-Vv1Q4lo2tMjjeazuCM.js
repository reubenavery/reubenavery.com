
(function ($) {

Drupal.behaviors.tokenTree = {
  attach: function (context, settings) {
    $('table.token-tree', context).once('token-tree', function () {
      $(this).treeTable();
    });
  }
};

Drupal.behaviors.tokenDialog = {
  attach: function (context, settings) {
    $('a.token-dialog', context).once('token-dialog').click(function() {
      var url = $(this).attr('href');
      var dialog = $('<div style="display: none" class="loading">' + Drupal.t('Loading token browser...') + '</div>').appendTo('body');

      // Emulate the AJAX data sent normally so that we get the same theme.
      var data = {};
      data['ajax_page_state[theme]'] = Drupal.settings.ajaxPageState.theme;
      data['ajax_page_state[theme_token]'] = Drupal.settings.ajaxPageState.theme_token;

      dialog.dialog({
        title: $(this).attr('title') || Drupal.t('Available tokens'),
        width: 700,
        close: function(event, ui) {
          dialog.remove();
        }
      });
      // Load the token tree using AJAX.
      dialog.load(
        url,
        data,
        function (responseText, textStatus, XMLHttpRequest) {
          dialog.removeClass('loading');
        }
      );
      // Prevent browser from following the link.
      return false;
    });
  }
}

Drupal.behaviors.tokenInsert = {
  attach: function (context, settings) {
    // Keep track of which textfield was last selected/focused.
    $('textarea, input[type="text"]', context).focus(function() {
      Drupal.settings.tokenFocusedField = this;
    });

    $('.token-click-insert .token-key', context).once('token-click-insert', function() {
      var newThis = $('<a href="javascript:void(0);" title="' + Drupal.t('Insert this token into your form') + '">' + $(this).html() + '</a>').click(function(){
        if (typeof Drupal.settings.tokenFocusedField == 'undefined') {
          alert(Drupal.t('First click a text field to insert your tokens into.'));
        }
        else {
          var myField = Drupal.settings.tokenFocusedField;
          var myValue = $(this).text();

          //IE support
          if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
          }

          //MOZILLA/NETSCAPE support
          else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                          + myValue
                          + myField.value.substring(endPos, myField.value.length);
          } else {
            myField.value += myValue;
          }

          $('html,body').animate({scrollTop: $(myField).offset().top}, 500);
        }
        return false;
      });
      $(this).html(newThis);
    });
  }
};

})(jQuery);
;/**/
/*jslint browser: true */ /*global jQuery: true */

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// TODO JsDoc

/**
 * Create a cookie with the given key and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String key The key of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given key.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String key The key of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function (key, value, options) {

    // key and value given, set cookie...
    if (arguments.length > 1 && (value === null || typeof value !== "object")) {
        options = jQuery.extend({}, options);

        if (value === null) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? String(value) : encodeURIComponent(String(value)),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};
;/**/

Drupal.wysiwyg = Drupal.wysiwyg || { 'instances': {} };

Drupal.wysiwyg.editor = Drupal.wysiwyg.editor || { 'init': {}, 'attach': {}, 'detach': {}, 'instance': {} };

Drupal.wysiwyg.plugins = Drupal.wysiwyg.plugins || {};

(function ($) {
  // Determine support for queryCommandEnabled().
  // An exception should be thrown for non-existing commands.
  // Safari and Chrome (WebKit based) return -1 instead.
  try {
    document.queryCommandEnabled('__wysiwygTestCommand');
    $.support.queryCommandEnabled = false;
  }
  catch (error) {
    $.support.queryCommandEnabled = true;
  }
})(jQuery);
;/**/
/**
 * @file
 * Attaches behaviors for the Contextual module.
 */

(function ($) {

Drupal.contextualLinks = Drupal.contextualLinks || {};

/**
 * Attaches outline behavior for regions associated with contextual links.
 */
Drupal.behaviors.contextualLinks = {
  attach: function (context) {
    $('div.contextual-links-wrapper', context).once('contextual-links', function () {
      var $wrapper = $(this);
      var $region = $wrapper.closest('.contextual-links-region');
      var $links = $wrapper.find('ul.contextual-links');
      var $trigger = $('<a class="contextual-links-trigger" href="#" />').text(Drupal.t('Configure')).click(
        function () {
          $links.stop(true, true).slideToggle(100);
          $wrapper.toggleClass('contextual-links-active');
          return false;
        }
      );
      // Attach hover behavior to trigger and ul.contextual-links.
      $trigger.add($links).hover(
        function () { $region.addClass('contextual-links-region-active'); },
        function () { $region.removeClass('contextual-links-region-active'); }
      );
      // Hide the contextual links when user clicks a link or rolls out of the .contextual-links-region.
      $region.bind('mouseleave click', Drupal.contextualLinks.mouseleave);
      $region.hover(
        function() { $trigger.addClass('contextual-links-trigger-active'); },
        function() { $trigger.removeClass('contextual-links-trigger-active'); }
      );
      // Prepend the trigger.
      $wrapper.prepend($trigger);
    });
  }
};

/**
 * Disables outline for the region contextual links are associated with.
 */
Drupal.contextualLinks.mouseleave = function () {
  $(this)
    .find('.contextual-links-active').removeClass('contextual-links-active')
    .find('ul.contextual-links').hide();
};

})(jQuery);
;/**/
