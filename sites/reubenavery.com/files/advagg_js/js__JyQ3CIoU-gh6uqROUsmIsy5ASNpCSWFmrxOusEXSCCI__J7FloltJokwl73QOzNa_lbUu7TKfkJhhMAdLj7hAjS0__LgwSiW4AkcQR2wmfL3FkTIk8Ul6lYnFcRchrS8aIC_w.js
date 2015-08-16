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
/**
 * jQuery Autosave 1.1.0
 *
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Written by Stan Lemon <stosh1985@gmail.com>
 * Last updated: 2010.03.08
 *
 * jQuery Autosave monitors the state of a form and detects when changes occur.
 * When changes take place to the form it then triggers an event which allows for
 * a develop to integrate hooks for autosaving content.
 *
 * Changes in 1.1.0:
 * - Simplified plugin by eliminating additional monitor.
 * - Added isDirty() method
 * - Uses serialization from jQuery 1.4.2 and no longer needs the form plugin.
 */
(function($) {

	$.fn.autosave = function(o) {
		var o = $.extend({}, $.fn.autosave.defaults, o);
		var saver;
		var self = this;

		$(this).addClass('autosave');

		this.bind('autosave.setup', function(){
			o.setup.apply( self.element , [self.element,o] );

			// Start by recording the current state of the form for comparison later
			$(this).trigger('autosave.record');

			// Fire off the autosave at an interval
			saver = setInterval( function() {
				$(self).trigger('autosave.save');
			}, o.interval);

		}).bind('autosave.shutdown', function() {
			o.shutdown.apply( this.element , [this.element,o] );

			clearInterval(saver);

		    // We'll call a synchronous ajax request to autosave the form before we move on.
		    // It's synchronous so that the browser will not move on without first completing
		    // the autosave request.
			if ( $(this).data('autosave.dirty') == true )
			    $(this).trigger('autosave.save', [false]);
		
			$(this).removeClass('autosave').unbind('autosave');
			$(this).data('autosave.form', null);
			$(this).data('autosave.dirty', null);

		}).bind('autosave.reset', function() {
			$(this).trigger('autosave.shutdown');
			$(this).trigger('autosave.setup');

		}).bind('autosave.record', function() {
			o.record.apply( this.element , [this.element,o] );

			$(this).data('autosave.dirty', false);
 			$(this).data('autosave.form', $(this).find(o.data).not('.autosave\-ignore').serializeArray());

		}).bind('autosave.save', function(e, async) {
			if ( !o.before.apply( self , [self,o]) )
				return;

			if ( !o.validate.apply( self , [self,o]) )
				return;

			var data = $(this).find(o.data).not('.autosave\-ignore').serializeArray();

			// If the form is dirty and there is not already an active execution of the autosaver.
			if ( $.param(data) != $.param($(this).data('autosave.form')) && $(this).data('autosave.active') != true ) {
				$(this).data('autosave.active', true);

				var callback = function(response){
					$(self).data('autosave.active', false);
					$(self).trigger('autosave.record');
					
					o.save.apply( self , [self,o,response] );
				};

				if (o.url != undefined && $.isFunction(o.url)) {
					o.url.apply( self.element , [self.element,o,data,callback] );
				} else {
					$.ajax({
					    async: 	(async == undefined) ? true : async,
						url: 	(o == undefined || o.url == undefined) ? $(this).attr('action') : o.url,
						type: 	'post',
						data: 	data,
						success: callback
					});
				}
			}
		}).trigger('autosave.setup');

		return this;
	};

	$.fn.isDirty = function() {
		if ( $(this).data('autosave.dirty') == true ) {
			return true;
		} else {
			if ( $(this).data('autosave.form') == undefined )
				return false;
			return !( $.param($(this).data('autosave.form')) == $.param($(this).find('input,select,textarea').not('.autosave\-ignore').serializeArray()) );
		}
	};

	$.fn.autosave.defaults = {
		/** Saving **/
		//url : function(e,o,callback) {} <-- If not defined, uses standard AJAX call on the form.
		/** Selector for Choosing Data to Save **/
		data: 	'input,select,textarea',
		/** Timer durations **/
		interval: 	120000,
		/** Callbacks **/
		setup: 		function(e,o) {},
		record: 	function(e,o) {},
		before: 	function(e,o) { 
			return true; 
		},
		validate: 	function(e,o) {
			return $.isFunction($.fn.validate) && !$(this).is('.ignore-validate') ? $(this).valid() : true; 
		},
		save: 		function(e,o) {},
		shutdown: 	function(e,o) {},
		dirty: 		function(e,o) {}
	};

	window.onbeforeunload = function() {
		$('form.autosave').trigger('autosave.shutdown');
	};

})(jQuery);;/**/
(function ($) {

var showingRestoreCommand;

Drupal.behaviors.autosave = {};
Drupal.behaviors.autosave.attach = function (context, settings) {
  var autosaveSettings;

  if ($('#autosave-status').size() == 0) {
   // Add a div for us to put messages in.
    $('body').append('<div id="autosave-status"><span id="status"></span></div>');
  }

  autosaveSettings = settings.autosave;

  $('#' + autosaveSettings.formid).not('.autosave-processed').addClass('autosave-processed').autosave({
    interval: autosaveSettings.period * 1000, // Time in ms
    url: autosaveSettings.url,
    setup: function (e, o) {
      var ignoreLink, restoreLink, callbackPath;

      // If there is a saved form for this user, let him know so he can reload it
      // if desired.
      if (autosaveSettings.savedTimestamp) {
        showingRestoreCommand = true;

        ignoreLink = $('<a>').attr('href', '#').attr('title', Drupal.t('Ignore/Delete saved form')).html(Drupal.t('Ignore')).click(function (e) {
          Drupal.behaviors.autosave.hideMessage();
          return false;
        });

        callbackPath = Drupal.settings.basePath + 'autosave/restore/' + autosaveSettings.formid + '/' + autosaveSettings.savedTimestamp + '/' + autosaveSettings.formToken + '/' + autosaveSettings.theme;
        restoreLink = $('<a>').attr('href', callbackPath).addClass('use-ajax').attr('title', Drupal.t('Restore saved form')).html(Drupal.t('Restore')).click(function (e) {
          Drupal.behaviors.autosave.hideMessage();
        });

        Drupal.behaviors.autosave.displayMessage(Drupal.t('This form was autosaved on ' + autosaveSettings.savedDate), {
          // Show the message for 30 seconds, or hide it when the user starts
          // editing the form.
          timeout: 30000,
          extra: $('<span id="operations">').append(ignoreLink).append(restoreLink)
        });
      }

      // Wire up TinyMCE to autosave.
      if (typeof(tinymce) !== 'undefined') {
        setInterval(function() {
          // Save text data from the tinymce area back to the original form element.
          // Once it's in the original form element, autosave will notice it
          // and do what it needs to do.
          // Note: There seems to be a bug where after a form is restored,
          // everything works fine but tinyMCE keeps reporting an undefined
          // error internally.  As its code is compressed I have absolutely no
          // way to debug this.  If you can figure it out, please file a patch.

          var triggers = Drupal.settings.wysiwyg.triggers;
          var id;
          var field;
          for (id in triggers) {
            field = triggers[id].field;
            $('#' + field).val(tinymce.get(field).getContent());
          }
        }, autosaveSettings.period * 1000);
      }

      // Wire up CKEditor to autosave.
      // @todo This does not yet support CKEditor 4.
      if (typeof(CKEDITOR) !== 'undefined') {
        CKEDITOR.on('instanceReady', function (eventInfo) {
          var editor = eventInfo.editor;
          editor.on('saveSnapshot', function () {
            editor.updateElement();
          });
        });
      }

    },
    save: function (e, o) {
      if (!autosaveSettings.hidden) {
        Drupal.behaviors.autosave.displayMessage(Drupal.t('Form autosaved.'));
      }
    },
    dirty: function (e, o) {
      if (showingRestoreCommand) {
        Drupal.behaviors.autosave.hideMessage();
      }
    }
  });
};

Drupal.behaviors.autosave.hideMessage = function() {
  $('#autosave-status').fadeOut('slow');
};

Drupal.behaviors.autosave.displayMessage = function(message, settings) {
  settings = settings || {};
  settings.timeout = settings.timeout || 3000;
  settings.extra = settings.extra || '';
  //settings = $.extend({}, {timeout: 3000, extra: ''}, settings);
  var status = $('#autosave-status');
  status.empty().append('<span id="status">' + message + '</span>');
  if (settings.extra) {
    status.append(settings.extra);
  }
  Drupal.attachBehaviors(status);

  $('#autosave-status').slideDown();
  setTimeout(Drupal.behaviors.autosave.hideMessage, settings.timeout);
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
