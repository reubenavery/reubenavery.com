
// Global Killswitch
if (Drupal.jsEnabled) {
$(document).ready(function() {
    $("body").append($("#memcache-devel"));
  });
}
;/**/

(function ($) {

Drupal.behaviors.shortener = {
  attach: function (context) {
    //Make sure we can run context.find().
    var ctxt = $(context);
    ctxt.find('.shortener-link').not('.shortener-strict').each(function() {
      $(this).after('<a class="shortener-toggle">'+ ($(this).hasClass('shortener-short') ? Drupal.t('expand') : Drupal.t('shorten')) +'</a>');
    });
    ctxt.find('.shortener-toggle').click(function() {
      $a = $(this).prev();
      var newURL = $a.attr('title');
      var oldURL = $a.attr('href');
      $a.attr('title', oldURL);
      $a.attr('href', newURL);
      var urlLen = $a.attr('class').split(' ')[0].split('-')[2];
      if (urlLen && newURL.length > urlLen) {
        newURL = newURL.substring(0, urlLen-1) + '&hellip;';
      }
      $a.html(newURL);
      if ($a.hasClass('shortener-short')) {
        $(this).html(Drupal.t('shorten'));
      }
      else {
        $(this).html(Drupal.t('expand'));
      }
      $a.toggleClass('shortener-short shortener-long');
    });
  }
}

})(jQuery);
;/**/
(function ($) {

/**
 * Attaches double-click behavior to toggle full path of Krumo elements.
 */
Drupal.behaviors.devel = {
  attach: function (context, settings) {

    // Add hint to footnote
    $('.krumo-footnote .krumo-call').once().before('<img style="vertical-align: middle;" title="Click to expand. Double-click to show path." src="' + settings.basePath + 'misc/help.png"/>');

    var krumo_name = [];
    var krumo_type = [];

    function krumo_traverse(el) {
      krumo_name.push($(el).html());
      krumo_type.push($(el).siblings('em').html().match(/\w*/)[0]);

      if ($(el).closest('.krumo-nest').length > 0) {
        krumo_traverse($(el).closest('.krumo-nest').prev().find('.krumo-name'));
      }
    }

    $('.krumo-child > div:first-child', context).dblclick(
      function(e) {
        if ($(this).find('> .krumo-php-path').length > 0) {
          // Remove path if shown.
          $(this).find('> .krumo-php-path').remove();
        }
        else {
          // Get elements.
          krumo_traverse($(this).find('> a.krumo-name'));

          // Create path.
          var krumo_path_string = '';
          for (var i = krumo_name.length - 1; i >= 0; --i) {
            // Start element.
            if ((krumo_name.length - 1) == i)
              krumo_path_string += '$' + krumo_name[i];

            if (typeof krumo_name[(i-1)] !== 'undefined') {
              if (krumo_type[i] == 'Array') {
                krumo_path_string += "[";
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += krumo_name[(i-1)];
                if (!/^\d*$/.test(krumo_name[(i-1)]))
                  krumo_path_string += "'";
                krumo_path_string += "]";
              }
              if (krumo_type[i] == 'Object')
                krumo_path_string += '->' + krumo_name[(i-1)];
            }
          }
          $(this).append('<div class="krumo-php-path" style="font-family: Courier, monospace; font-weight: bold;">' + krumo_path_string + '</div>');

          // Reset arrays.
          krumo_name = [];
          krumo_type = [];
        }
      }
    );
  }
};

})(jQuery);
;/**/
/**
 * Attaches the calendar behavior to all required fields
 */
(function ($) {
Drupal.behaviors.date_popup = {
  attach: function (context) {
  for (var id in Drupal.settings.datePopup) {
    $('#'+ id).bind('focus', Drupal.settings.datePopup[id], function(e) {
      if (!$(this).hasClass('date-popup-init')) {
        var datePopup = e.data;
        // Explicitely filter the methods we accept.
        switch (datePopup.func) {
          case 'datepicker':
            $(this)
              .datepicker(datePopup.settings)
              .addClass('date-popup-init')
            $(this).click(function(){
              $(this).focus();
            });
            break;

          case 'timeEntry':
            $(this)
              .timeEntry(datePopup.settings)
              .addClass('date-popup-init')
            $(this).click(function(){
              $(this).focus();
            });
            break;
          case 'timepicker':
            // Translate the PHP date format into the style the timepicker uses.
            datePopup.settings.timeFormat = datePopup.settings.timeFormat
              // 12-hour, leading zero,
              .replace('h', 'hh')
              // 12-hour, no leading zero.
              .replace('g', 'h')
              // 24-hour, leading zero.
              .replace('H', 'HH')
              // 24-hour, no leading zero.
              .replace('G', 'H')
              // AM/PM.
              .replace('A', 'p')
              // Minutes with leading zero.
              .replace('i', 'mm')
              // Seconds with leading zero.
              .replace('s', 'ss');

            datePopup.settings.startTime = new Date(datePopup.settings.startTime);
            $(this)
              .timepicker(datePopup.settings)
              .addClass('date-popup-init');
            $(this).click(function(){
              $(this).focus();
            });
            break;
        }
      }
    });
  }
  }
};
})(jQuery);
;/**/
(function ($) {

/**
 * Attaches the autocomplete behavior to all required fields.
 */
Drupal.behaviors.autocomplete = {
  attach: function (context, settings) {
    var acdb = [];
    $('input.autocomplete', context).once('autocomplete', function () {
      var uri = this.value;
      if (!acdb[uri]) {
        acdb[uri] = new Drupal.ACDB(uri);
      }
      var $input = $('#' + this.id.substr(0, this.id.length - 13))
        .attr('autocomplete', 'OFF')
        .attr('aria-autocomplete', 'list');
      $($input[0].form).submit(Drupal.autocompleteSubmit);
      $input.parent()
        .attr('role', 'application')
        .append($('<span class="element-invisible" aria-live="assertive"></span>')
          .attr('id', $input.attr('id') + '-autocomplete-aria-live')
        );
      new Drupal.jsAC($input, acdb[uri]);
    });
  }
};

/**
 * Prevents the form from submitting if the suggestions popup is open
 * and closes the suggestions popup when doing so.
 */
Drupal.autocompleteSubmit = function () {
  return $('#autocomplete').each(function () {
    this.owner.hidePopup();
  }).length == 0;
};

/**
 * An AutoComplete object.
 */
Drupal.jsAC = function ($input, db) {
  var ac = this;
  this.input = $input[0];
  this.ariaLive = $('#' + this.input.id + '-autocomplete-aria-live');
  this.db = db;

  $input
    .keydown(function (event) { return ac.onkeydown(this, event); })
    .keyup(function (event) { ac.onkeyup(this, event); })
    .blur(function () { ac.hidePopup(); ac.db.cancel(); });

};

/**
 * Handler for the "keydown" event.
 */
Drupal.jsAC.prototype.onkeydown = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 40: // down arrow.
      this.selectDown();
      return false;
    case 38: // up arrow.
      this.selectUp();
      return false;
    default: // All other keys.
      return true;
  }
};

/**
 * Handler for the "keyup" event.
 */
Drupal.jsAC.prototype.onkeyup = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 16: // Shift.
    case 17: // Ctrl.
    case 18: // Alt.
    case 20: // Caps lock.
    case 33: // Page up.
    case 34: // Page down.
    case 35: // End.
    case 36: // Home.
    case 37: // Left arrow.
    case 38: // Up arrow.
    case 39: // Right arrow.
    case 40: // Down arrow.
      return true;

    case 9:  // Tab.
    case 13: // Enter.
    case 27: // Esc.
      this.hidePopup(e.keyCode);
      return true;

    default: // All other keys.
      if (input.value.length > 0 && !input.readOnly) {
        this.populatePopup();
      }
      else {
        this.hidePopup(e.keyCode);
      }
      return true;
  }
};

/**
 * Puts the currently highlighted suggestion into the autocomplete field.
 */
Drupal.jsAC.prototype.select = function (node) {
  this.input.value = $(node).data('autocompleteValue');
};

/**
 * Highlights the next suggestion.
 */
Drupal.jsAC.prototype.selectDown = function () {
  if (this.selected && this.selected.nextSibling) {
    this.highlight(this.selected.nextSibling);
  }
  else if (this.popup) {
    var lis = $('li', this.popup);
    if (lis.length > 0) {
      this.highlight(lis.get(0));
    }
  }
};

/**
 * Highlights the previous suggestion.
 */
Drupal.jsAC.prototype.selectUp = function () {
  if (this.selected && this.selected.previousSibling) {
    this.highlight(this.selected.previousSibling);
  }
};

/**
 * Highlights a suggestion.
 */
Drupal.jsAC.prototype.highlight = function (node) {
  if (this.selected) {
    $(this.selected).removeClass('selected');
  }
  $(node).addClass('selected');
  this.selected = node;
  $(this.ariaLive).html($(this.selected).html());
};

/**
 * Unhighlights a suggestion.
 */
Drupal.jsAC.prototype.unhighlight = function (node) {
  $(node).removeClass('selected');
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Hides the autocomplete suggestions.
 */
Drupal.jsAC.prototype.hidePopup = function (keycode) {
  // Select item if the right key or mousebutton was pressed.
  if (this.selected && ((keycode && keycode != 46 && keycode != 8 && keycode != 27) || !keycode)) {
    this.input.value = $(this.selected).data('autocompleteValue');
  }
  // Hide popup.
  var popup = this.popup;
  if (popup) {
    this.popup = null;
    $(popup).fadeOut('fast', function () { $(popup).remove(); });
  }
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Positions the suggestions popup and starts a search.
 */
Drupal.jsAC.prototype.populatePopup = function () {
  var $input = $(this.input);
  var position = $input.position();
  // Show popup.
  if (this.popup) {
    $(this.popup).remove();
  }
  this.selected = false;
  this.popup = $('<div id="autocomplete"></div>')[0];
  this.popup.owner = this;
  $(this.popup).css({
    top: parseInt(position.top + this.input.offsetHeight, 10) + 'px',
    left: parseInt(position.left, 10) + 'px',
    width: $input.innerWidth() + 'px',
    display: 'none'
  });
  $input.before(this.popup);

  // Do search.
  this.db.owner = this;
  this.db.search(this.input.value);
};

/**
 * Fills the suggestion popup with any matches received.
 */
Drupal.jsAC.prototype.found = function (matches) {
  // If no value in the textfield, do not show the popup.
  if (!this.input.value.length) {
    return false;
  }

  // Prepare matches.
  var ul = $('<ul></ul>');
  var ac = this;
  for (key in matches) {
    $('<li></li>')
      .html($('<div></div>').html(matches[key]))
      .mousedown(function () { ac.select(this); })
      .mouseover(function () { ac.highlight(this); })
      .mouseout(function () { ac.unhighlight(this); })
      .data('autocompleteValue', key)
      .appendTo(ul);
  }

  // Show popup with matches, if any.
  if (this.popup) {
    if (ul.children().length) {
      $(this.popup).empty().append(ul).show();
      $(this.ariaLive).html(Drupal.t('Autocomplete popup'));
    }
    else {
      $(this.popup).css({ visibility: 'hidden' });
      this.hidePopup();
    }
  }
};

Drupal.jsAC.prototype.setStatus = function (status) {
  switch (status) {
    case 'begin':
      $(this.input).addClass('throbbing');
      $(this.ariaLive).html(Drupal.t('Searching for matches...'));
      break;
    case 'cancel':
    case 'error':
    case 'found':
      $(this.input).removeClass('throbbing');
      break;
  }
};

/**
 * An AutoComplete DataBase object.
 */
Drupal.ACDB = function (uri) {
  this.uri = uri;
  this.delay = 300;
  this.cache = {};
};

/**
 * Performs a cached and delayed search.
 */
Drupal.ACDB.prototype.search = function (searchString) {
  var db = this;
  this.searchString = searchString;

  // See if this string needs to be searched for anyway.
  searchString = searchString.replace(/^\s+|\s+$/, '');
  if (searchString.length <= 0 ||
    searchString.charAt(searchString.length - 1) == ',') {
    return;
  }

  // See if this key has been searched for before.
  if (this.cache[searchString]) {
    return this.owner.found(this.cache[searchString]);
  }

  // Initiate delayed search.
  if (this.timer) {
    clearTimeout(this.timer);
  }
  this.timer = setTimeout(function () {
    db.owner.setStatus('begin');

    // Ajax GET request for autocompletion. We use Drupal.encodePath instead of
    // encodeURIComponent to allow autocomplete search terms to contain slashes.
    $.ajax({
      type: 'GET',
      url: db.uri + '/' + Drupal.encodePath(searchString),
      dataType: 'json',
      success: function (matches) {
        if (typeof matches.status == 'undefined' || matches.status != 0) {
          db.cache[searchString] = matches;
          // Verify if these are still the matches the user wants to see.
          if (db.searchString == searchString) {
            db.owner.found(matches);
          }
          db.owner.setStatus('found');
        }
      },
      error: function (xmlhttp) {
        alert(Drupal.ajaxError(xmlhttp, db.uri));
      }
    });
  }, this.delay);
};

/**
 * Cancels the current autocomplete request.
 */
Drupal.ACDB.prototype.cancel = function () {
  if (this.owner) this.owner.setStatus('cancel');
  if (this.timer) clearTimeout(this.timer);
  this.searchString = '';
};

})(jQuery);
;/**/
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;/**/
/**
 * @file
 * Provides JavaScript additions to the managed file field type.
 *
 * This file provides progress bar support (if available), popup windows for
 * file previews, and disabling of other file fields during Ajax uploads (which
 * prevents separate file fields from accidentally uploading files).
 */

(function ($) {

/**
 * Attach behaviors to managed file element upload fields.
 */
Drupal.behaviors.fileValidateAutoAttach = {
  attach: function (context, settings) {
    if (settings.file && settings.file.elements) {
      $.each(settings.file.elements, function(selector) {
        var extensions = settings.file.elements[selector];
        $(selector, context).bind('change', {extensions: extensions}, Drupal.file.validateExtension);
      });
    }
  },
  detach: function (context, settings) {
    if (settings.file && settings.file.elements) {
      $.each(settings.file.elements, function(selector) {
        $(selector, context).unbind('change', Drupal.file.validateExtension);
      });
    }
  }
};

/**
 * Attach behaviors to the file upload and remove buttons.
 */
Drupal.behaviors.fileButtons = {
  attach: function (context) {
    $('input.form-submit', context).bind('mousedown', Drupal.file.disableFields);
    $('div.form-managed-file input.form-submit', context).bind('mousedown', Drupal.file.progressBar);
  },
  detach: function (context) {
    $('input.form-submit', context).unbind('mousedown', Drupal.file.disableFields);
    $('div.form-managed-file input.form-submit', context).unbind('mousedown', Drupal.file.progressBar);
  }
};

/**
 * Attach behaviors to links within managed file elements.
 */
Drupal.behaviors.filePreviewLinks = {
  attach: function (context) {
    $('div.form-managed-file .file a, .file-widget .file a', context).bind('click',Drupal.file.openInNewWindow);
  },
  detach: function (context){
    $('div.form-managed-file .file a, .file-widget .file a', context).unbind('click', Drupal.file.openInNewWindow);
  }
};

/**
 * File upload utility functions.
 */
Drupal.file = Drupal.file || {
  /**
   * Client-side file input validation of file extensions.
   */
  validateExtension: function (event) {
    // Remove any previous errors.
    $('.file-upload-js-error').remove();

    // Add client side validation for the input[type=file].
    var extensionPattern = event.data.extensions.replace(/,\s*/g, '|');
    if (extensionPattern.length > 1 && this.value.length > 0) {
      var acceptableMatch = new RegExp('\\.(' + extensionPattern + ')$', 'gi');
      if (!acceptableMatch.test(this.value)) {
        var error = Drupal.t("The selected file %filename cannot be uploaded. Only files with the following extensions are allowed: %extensions.", {
          // According to the specifications of HTML5, a file upload control
          // should not reveal the real local path to the file that a user
          // has selected. Some web browsers implement this restriction by
          // replacing the local path with "C:\fakepath\", which can cause
          // confusion by leaving the user thinking perhaps Drupal could not
          // find the file because it messed up the file path. To avoid this
          // confusion, therefore, we strip out the bogus fakepath string.
          '%filename': this.value.replace('C:\\fakepath\\', ''),
          '%extensions': extensionPattern.replace(/\|/g, ', ')
        });
        $(this).closest('div.form-managed-file').prepend('<div class="messages error file-upload-js-error">' + error + '</div>');
        this.value = '';
        return false;
      }
    }
  },
  /**
   * Prevent file uploads when using buttons not intended to upload.
   */
  disableFields: function (event){
    var clickedButton = this;

    // Only disable upload fields for Ajax buttons.
    if (!$(clickedButton).hasClass('ajax-processed')) {
      return;
    }

    // Check if we're working with an "Upload" button.
    var $enabledFields = [];
    if ($(this).closest('div.form-managed-file').length > 0) {
      $enabledFields = $(this).closest('div.form-managed-file').find('input.form-file');
    }

    // Temporarily disable upload fields other than the one we're currently
    // working with. Filter out fields that are already disabled so that they
    // do not get enabled when we re-enable these fields at the end of behavior
    // processing. Re-enable in a setTimeout set to a relatively short amount
    // of time (1 second). All the other mousedown handlers (like Drupal's Ajax
    // behaviors) are excuted before any timeout functions are called, so we
    // don't have to worry about the fields being re-enabled too soon.
    // @todo If the previous sentence is true, why not set the timeout to 0?
    var $fieldsToTemporarilyDisable = $('div.form-managed-file input.form-file').not($enabledFields).not(':disabled');
    $fieldsToTemporarilyDisable.attr('disabled', 'disabled');
    setTimeout(function (){
      $fieldsToTemporarilyDisable.attr('disabled', false);
    }, 1000);
  },
  /**
   * Add progress bar support if possible.
   */
  progressBar: function (event) {
    var clickedButton = this;
    var $progressId = $(clickedButton).closest('div.form-managed-file').find('input.file-progress');
    if ($progressId.length) {
      var originalName = $progressId.attr('name');

      // Replace the name with the required identifier.
      $progressId.attr('name', originalName.match(/APC_UPLOAD_PROGRESS|UPLOAD_IDENTIFIER/)[0]);

      // Restore the original name after the upload begins.
      setTimeout(function () {
        $progressId.attr('name', originalName);
      }, 1000);
    }
    // Show the progress bar if the upload takes longer than half a second.
    setTimeout(function () {
      $(clickedButton).closest('div.form-managed-file').find('div.ajax-progress-bar').slideDown();
    }, 500);
  },
  /**
   * Open links to files within forms in a new window.
   */
  openInNewWindow: function (event) {
    $(this).attr('target', '_blank');
    window.open(this.href, 'filePreview', 'toolbar=0,scrollbars=1,location=1,statusbar=1,menubar=0,resizable=1,width=500,height=550');
    return false;
  }
};

})(jQuery);
;/**/
// ----------------------------------------------------------------------------
// markItUp! Universal MarkUp Engine, JQuery plugin
// v 1.1.x
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2007-2012 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
(function($) {
	$.fn.markItUp = function(settings, extraSettings) {
		var method, params, options, ctrlKey, shiftKey, altKey; ctrlKey = shiftKey = altKey = false;

		if (typeof settings == 'string') {
			method = settings;
			params = extraSettings;
		} 

		options = {	id:						'',
					nameSpace:				'',
					root:					'',
					previewHandler:			false,
					previewInWindow:		'', // 'width=800, height=600, resizable=yes, scrollbars=yes'
					previewInElement:		'',
					previewAutoRefresh:		true,
					previewPosition:		'after',
					previewTemplatePath:	'~/templates/preview.html',
					previewParser:			false,
					previewParserPath:		'',
					previewParserVar:		'data',
					resizeHandle:			true,
					beforeInsert:			'',
					afterInsert:			'',
					onEnter:				{},
					onShiftEnter:			{},
					onCtrlEnter:			{},
					onTab:					{},
					markupSet:			[	{ /* set */ } ]
				};
		$.extend(options, settings, extraSettings);

		// compute markItUp! path
		if (!options.root) {
			$('script').each(function(a, tag) {
				miuScript = $(tag).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);
				if (miuScript !== null) {
					options.root = miuScript[1];
				}
			});
		}

		// Quick patch to keep compatibility with jQuery 1.9
		var uaMatch = function(ua) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
				/(webkit)[ \/]([\w.]+)/.exec(ua) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
				/(msie) ([\w.]+)/.exec(ua) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};
		var matched = uaMatch( navigator.userAgent );
		var browser = {};

		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version;
		}
		if (browser.chrome) {
			browser.webkit = true;
		} else if (browser.webkit) {
			browser.safari = true;
		}

		return this.each(function() {
			var $$, textarea, levels, scrollPosition, caretPosition, caretOffset,
				clicked, hash, header, footer, previewWindow, template, iFrame, abort;
			$$ = $(this);
			textarea = this;
			levels = [];
			abort = false;
			scrollPosition = caretPosition = 0;
			caretOffset = -1;

			options.previewParserPath = localize(options.previewParserPath);
			options.previewTemplatePath = localize(options.previewTemplatePath);

			if (method) {
				switch(method) {
					case 'remove':
						remove();
					break;
					case 'insert':
						markup(params);
					break;
					default: 
						$.error('Method ' +  method + ' does not exist on jQuery.markItUp');
				}
				return;
			}

			// apply the computed path to ~/
			function localize(data, inText) {
				if (inText) {
					return 	data.replace(/("|')~\//g, "$1"+options.root);
				}
				return 	data.replace(/^~\//, options.root);
			}

			// init and build editor
			function init() {
				id = ''; nameSpace = '';
				if (options.id) {
					id = 'id="'+options.id+'"';
				} else if ($$.attr("id")) {
					id = 'id="markItUp'+($$.attr("id").substr(0, 1).toUpperCase())+($$.attr("id").substr(1))+'"';

				}
				if (options.nameSpace) {
					nameSpace = 'class="'+options.nameSpace+'"';
				}
				$$.wrap('<div '+nameSpace+'></div>');
				$$.wrap('<div '+id+' class="markItUp"></div>');
				$$.wrap('<div class="markItUpContainer"></div>');
				$$.addClass("markItUpEditor");

				// add the header before the textarea
				header = $('<div class="markItUpHeader"></div>').insertBefore($$);
				$(dropMenus(options.markupSet)).appendTo(header);

				// add the footer after the textarea
				footer = $('<div class="markItUpFooter"></div>').insertAfter($$);

				// add the resize handle after textarea
				if (options.resizeHandle === true && browser.safari !== true) {
					resizeHandle = $('<div class="markItUpResizeHandle"></div>')
						.insertAfter($$)
						.bind("mousedown.markItUp", function(e) {
							var h = $$.height(), y = e.clientY, mouseMove, mouseUp;
							mouseMove = function(e) {
								$$.css("height", Math.max(20, e.clientY+h-y)+"px");
								return false;
							};
							mouseUp = function(e) {
								$("html").unbind("mousemove.markItUp", mouseMove).unbind("mouseup.markItUp", mouseUp);
								return false;
							};
							$("html").bind("mousemove.markItUp", mouseMove).bind("mouseup.markItUp", mouseUp);
					});
					footer.append(resizeHandle);
				}

				// listen key events
				$$.bind('keydown.markItUp', keyPressed).bind('keyup', keyPressed);
				
				// bind an event to catch external calls
				$$.bind("insertion.markItUp", function(e, settings) {
					if (settings.target !== false) {
						get();
					}
					if (textarea === $.markItUp.focused) {
						markup(settings);
					}
				});

				// remember the last focus
				$$.bind('focus.markItUp', function() {
					$.markItUp.focused = this;
				});

				if (options.previewInElement) {
					refreshPreview();
				}
			}

			// recursively build header with dropMenus from markupset
			function dropMenus(markupSet) {
				var ul = $('<ul></ul>'), i = 0;
				$('li:hover > ul', ul).css('display', 'block');
				$.each(markupSet, function() {
					var button = this, t = '', title, li, j;
					title = (button.key) ? (button.name||'')+' [Ctrl+'+button.key+']' : (button.name||'');
					key   = (button.key) ? 'accesskey="'+button.key+'"' : '';
					if (button.separator) {
						li = $('<li class="markItUpSeparator">'+(button.separator||'')+'</li>').appendTo(ul);
					} else {
						i++;
						for (j = levels.length -1; j >= 0; j--) {
							t += levels[j]+"-";
						}
						li = $('<li class="markItUpButton markItUpButton'+t+(i)+' '+(button.className||'')+'"><a href="" '+key+' title="'+title+'">'+(button.name||'')+'</a></li>')
						.bind("contextmenu.markItUp", function() { // prevent contextmenu on mac and allow ctrl+click
							return false;
						}).bind('click.markItUp', function(e) {
							e.preventDefault();
						}).bind("focusin.markItUp", function(){
                            $$.focus();
						}).bind('mouseup', function() {
							if (button.call) {
								eval(button.call)();
							}
							setTimeout(function() { markup(button) },1);
							return false;
						}).bind('mouseenter.markItUp', function() {
								$('> ul', this).show();
								$(document).one('click', function() { // close dropmenu if click outside
										$('ul ul', header).hide();
									}
								);
						}).bind('mouseleave.markItUp', function() {
								$('> ul', this).hide();
						}).appendTo(ul);
						if (button.dropMenu) {
							levels.push(i);
							$(li).addClass('markItUpDropMenu').append(dropMenus(button.dropMenu));
						}
					}
				}); 
				levels.pop();
				return ul;
			}

			// markItUp! markups
			function magicMarkups(string) {
				if (string) {
					string = string.toString();
					string = string.replace(/\(\!\(([\s\S]*?)\)\!\)/g,
						function(x, a) {
							var b = a.split('|!|');
							if (altKey === true) {
								return (b[1] !== undefined) ? b[1] : b[0];
							} else {
								return (b[1] === undefined) ? "" : b[0];
							}
						}
					);
					// [![prompt]!], [![prompt:!:value]!]
					string = string.replace(/\[\!\[([\s\S]*?)\]\!\]/g,
						function(x, a) {
							var b = a.split(':!:');
							if (abort === true) {
								return false;
							}
							value = prompt(b[0], (b[1]) ? b[1] : '');
							if (value === null) {
								abort = true;
							}
							return value;
						}
					);
					return string;
				}
				return "";
			}

			// prepare action
			function prepare(action) {
				if ($.isFunction(action)) {
					action = action(hash);
				}
				return magicMarkups(action);
			}

			// build block to insert
			function build(string) {
				var openWith 			= prepare(clicked.openWith);
				var placeHolder 		= prepare(clicked.placeHolder);
				var replaceWith 		= prepare(clicked.replaceWith);
				var closeWith 			= prepare(clicked.closeWith);
				var openBlockWith 		= prepare(clicked.openBlockWith);
				var closeBlockWith 		= prepare(clicked.closeBlockWith);
				var multiline 			= clicked.multiline;
				
				if (replaceWith !== "") {
					block = openWith + replaceWith + closeWith;
				} else if (selection === '' && placeHolder !== '') {
					block = openWith + placeHolder + closeWith;
				} else {
					string = string || selection;

					var lines = [string], blocks = [];
					
					if (multiline === true) {
						lines = string.split(/\r?\n/);
					}
					
					for (var l = 0; l < lines.length; l++) {
						line = lines[l];
						var trailingSpaces;
						if (trailingSpaces = line.match(/ *$/)) {
							blocks.push(openWith + line.replace(/ *$/g, '') + closeWith + trailingSpaces);
						} else {
							blocks.push(openWith + line + closeWith);
						}
					}
					
					block = blocks.join("\n");
				}

				block = openBlockWith + block + closeBlockWith;

				return {	block:block, 
							openBlockWith:openBlockWith,
							openWith:openWith, 
							replaceWith:replaceWith, 
							placeHolder:placeHolder,
							closeWith:closeWith,
							closeBlockWith:closeBlockWith
					};
			}

			// define markup to insert
			function markup(button) {
				var len, j, n, i;
				hash = clicked = button;
				get();
				$.extend(hash, {	line:"", 
						 			root:options.root,
									textarea:textarea, 
									selection:(selection||''), 
									caretPosition:caretPosition,
									ctrlKey:ctrlKey, 
									shiftKey:shiftKey, 
									altKey:altKey
								}
							);
				// callbacks before insertion
				prepare(options.beforeInsert);
				prepare(clicked.beforeInsert);
				if ((ctrlKey === true && shiftKey === true) || button.multiline === true) {
					prepare(clicked.beforeMultiInsert);
				}			
				$.extend(hash, { line:1 });

				if ((ctrlKey === true && shiftKey === true)) {
					lines = selection.split(/\r?\n/);
					for (j = 0, n = lines.length, i = 0; i < n; i++) {
						if ($.trim(lines[i]) !== '') {
							$.extend(hash, { line:++j, selection:lines[i] } );
							lines[i] = build(lines[i]).block;
						} else {
							lines[i] = "";
						}
					}

					string = { block:lines.join('\n')};
					start = caretPosition;
					len = string.block.length + ((browser.opera) ? n-1 : 0);
				} else if (ctrlKey === true) {
					string = build(selection);
					start = caretPosition + string.openWith.length;
					len = string.block.length - string.openWith.length - string.closeWith.length;
					len = len - (string.block.match(/ $/) ? 1 : 0);
					len -= fixIeBug(string.block);
				} else if (shiftKey === true) {
					string = build(selection);
					start = caretPosition;
					len = string.block.length;
					len -= fixIeBug(string.block);
				} else {
					string = build(selection);
					start = caretPosition + string.block.length ;
					len = 0;
					start -= fixIeBug(string.block);
				}
				if ((selection === '' && string.replaceWith === '')) {
					caretOffset += fixOperaBug(string.block);
					
					start = caretPosition + string.openBlockWith.length + string.openWith.length;
					len = string.block.length - string.openBlockWith.length - string.openWith.length - string.closeWith.length - string.closeBlockWith.length;

					caretOffset = $$.val().substring(caretPosition,  $$.val().length).length;
					caretOffset -= fixOperaBug($$.val().substring(0, caretPosition));
				}
				$.extend(hash, { caretPosition:caretPosition, scrollPosition:scrollPosition } );

				if (string.block !== selection && abort === false) {
					insert(string.block);
					set(start, len);
				} else {
					caretOffset = -1;
				}
				get();

				$.extend(hash, { line:'', selection:selection });

				// callbacks after insertion
				if ((ctrlKey === true && shiftKey === true) || button.multiline === true) {
					prepare(clicked.afterMultiInsert);
				}
				prepare(clicked.afterInsert);
				prepare(options.afterInsert);

				// refresh preview if opened
				if (previewWindow && options.previewAutoRefresh) {
					refreshPreview(); 
				}
																									
				// reinit keyevent
				shiftKey = altKey = ctrlKey = abort = false;
			}

			// Substract linefeed in Opera
			function fixOperaBug(string) {
				if (browser.opera) {
					return string.length - string.replace(/\n*/g, '').length;
				}
				return 0;
			}
			// Substract linefeed in IE
			function fixIeBug(string) {
				if (browser.msie) {
					return string.length - string.replace(/\r*/g, '').length;
				}
				return 0;
			}
				
			// add markup
			function insert(block) {	
				if (document.selection) {
					var newSelection = document.selection.createRange();
					newSelection.text = block;
				} else {
					textarea.value =  textarea.value.substring(0, caretPosition)  + block + textarea.value.substring(caretPosition + selection.length, textarea.value.length);
				}
			}

			// set a selection
			function set(start, len) {
				if (textarea.createTextRange){
					// quick fix to make it work on Opera 9.5
					if (browser.opera && browser.version >= 9.5 && len == 0) {
						return false;
					}
					range = textarea.createTextRange();
					range.collapse(true);
					range.moveStart('character', start); 
					range.moveEnd('character', len); 
					range.select();
				} else if (textarea.setSelectionRange ){
					textarea.setSelectionRange(start, start + len);
				}
				textarea.scrollTop = scrollPosition;
				textarea.focus();
			}

			// get the selection
			function get() {
				textarea.focus();

				scrollPosition = textarea.scrollTop;
				if (document.selection) {
					selection = document.selection.createRange().text;
					if (browser.msie) { // ie
						var range = document.selection.createRange(), rangeCopy = range.duplicate();
						rangeCopy.moveToElementText(textarea);
						caretPosition = -1;
						while(rangeCopy.inRange(range)) {
							rangeCopy.moveStart('character');
							caretPosition ++;
						}
					} else { // opera
						caretPosition = textarea.selectionStart;
					}
				} else { // gecko & webkit
					caretPosition = textarea.selectionStart;

					selection = textarea.value.substring(caretPosition, textarea.selectionEnd);
				} 
				return selection;
			}

			// open preview window
			function preview() {
				if (typeof options.previewHandler === 'function') {
					previewWindow = true;
				} else if (options.previewInElement) {
					previewWindow = $(options.previewInElement);
				} else if (!previewWindow || previewWindow.closed) {
					if (options.previewInWindow) {
						previewWindow = window.open('', 'preview', options.previewInWindow);
						$(window).unload(function() {
							previewWindow.close();
						});
					} else {
						iFrame = $('<iframe class="markItUpPreviewFrame"></iframe>');
						if (options.previewPosition == 'after') {
							iFrame.insertAfter(footer);
						} else {
							iFrame.insertBefore(header);
						}	
						previewWindow = iFrame[iFrame.length - 1].contentWindow || frame[iFrame.length - 1];
					}
				} else if (altKey === true) {
					if (iFrame) {
						iFrame.remove();
					} else {
						previewWindow.close();
					}
					previewWindow = iFrame = false;
				}
				if (!options.previewAutoRefresh) {
					refreshPreview(); 
				}
				if (options.previewInWindow) {
					previewWindow.focus();
				}
			}

			// refresh Preview window
			function refreshPreview() {
 				renderPreview();
			}

			function renderPreview() {
				var phtml;
				if (options.previewHandler && typeof options.previewHandler === 'function') {
					options.previewHandler( $$.val() );
				} else if (options.previewParser && typeof options.previewParser === 'function') {
					var data = options.previewParser( $$.val() );
					writeInPreview(localize(data, 1) ); 
				} else if (options.previewParserPath !== '') {
					$.ajax({
						type: 'POST',
						dataType: 'text',
						global: false,
						url: options.previewParserPath,
						data: options.previewParserVar+'='+encodeURIComponent($$.val()),
						success: function(data) {
							writeInPreview( localize(data, 1) ); 
						}
					});
				} else {
					if (!template) {
						$.ajax({
							url: options.previewTemplatePath,
							dataType: 'text',
							global: false,
							success: function(data) {
								writeInPreview( localize(data, 1).replace(/<!-- content -->/g, $$.val()) );
							}
						});
					}
				}
				return false;
			}
			
			function writeInPreview(data) {
				if (options.previewInElement) {
					$(options.previewInElement).html(data);
				} else if (previewWindow && previewWindow.document) {			
					try {
						sp = previewWindow.document.documentElement.scrollTop
					} catch(e) {
						sp = 0;
					}	
					previewWindow.document.open();
					previewWindow.document.write(data);
					previewWindow.document.close();
					previewWindow.document.documentElement.scrollTop = sp;
				}
			}
			
			// set keys pressed
			function keyPressed(e) { 
				shiftKey = e.shiftKey;
				altKey = e.altKey;
				ctrlKey = (!(e.altKey && e.ctrlKey)) ? (e.ctrlKey || e.metaKey) : false;

				if (e.type === 'keydown') {
					if (ctrlKey === true) {
						li = $('a[accesskey="'+((e.keyCode == 13) ? '\\n' : String.fromCharCode(e.keyCode))+'"]', header).parent('li');
						if (li.length !== 0) {
							ctrlKey = false;
							setTimeout(function() {
								li.triggerHandler('mouseup');
							},1);
							return false;
						}
					}
					if (e.keyCode === 13 || e.keyCode === 10) { // Enter key
						if (ctrlKey === true) {  // Enter + Ctrl
							ctrlKey = false;
							markup(options.onCtrlEnter);
							return options.onCtrlEnter.keepDefault;
						} else if (shiftKey === true) { // Enter + Shift
							shiftKey = false;
							markup(options.onShiftEnter);
							return options.onShiftEnter.keepDefault;
						} else { // only Enter
							markup(options.onEnter);
							return options.onEnter.keepDefault;
						}
					}
					if (e.keyCode === 9) { // Tab key
						if (shiftKey == true || ctrlKey == true || altKey == true) {
							return false; 
						}
						if (caretOffset !== -1) {
							get();
							caretOffset = $$.val().length - caretOffset;
							set(caretOffset, 0);
							caretOffset = -1;
							return false;
						} else {
							markup(options.onTab);
							return options.onTab.keepDefault;
						}
					}
				}
			}

			function remove() {
				$$.unbind(".markItUp").removeClass('markItUpEditor');
				$$.parent('div').parent('div.markItUp').parent('div').replaceWith($$);
				$$.data('markItUp', null);
			}

			init();
		});
	};

	$.fn.markItUpRemove = function() {
		return this.each(function() {
				$(this).markItUp('remove');
			}
		);
	};

	$.markItUp = function(settings) {
		var options = { target:false };
		$.extend(options, settings);
		if (options.target) {
			return $(options.target).each(function() {
				$(this).focus();
				$(this).trigger('insertion', [options]);
			});
		} else {
			$('textarea').trigger('insertion', [options]);
		}
	};
})(jQuery);
;/**/
(function($) {

/**
 * Attach this editor to a target element.
 */
Drupal.wysiwyg.editor.attach.markitup = function(context, params, settings) {
  $('#' + params.field, context).markItUp(settings);

  // Adjust CSS for editor buttons.
  $.each(settings.markupSet, function (button) {
    $('.' + settings.nameSpace + ' .' + this.className + ' a')
      .css({ backgroundImage: 'url(' + settings.root + 'sets/default/images/' + button + '.png' + ')' })
      .parents('li').css({ backgroundImage: 'none' });
  });
};

/**
 * Detach a single or all editors.
 */
Drupal.wysiwyg.editor.detach.markitup = function (context, params, trigger) {
  if (trigger == 'serialize') {
    return;
  }
  if (typeof params != 'undefined') {
    $('#' + params.field, context).markItUpRemove();
  }
  else {
    $('.markItUpEditor', context).markItUpRemove();
  }
};

Drupal.wysiwyg.editor.instance.markitup = {
  insert: function (content) {
    $.markItUp({ replaceWith: content });
  },

  setContent: function (content) {
    $('#' + this.field).val(content);
  },

  getContent: function () {
    return $('#' + this.field).val();
  }
};

})(jQuery);
;/**/
(function($) {

/**
 * Attach this editor to a target element.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   An object containing input format parameters. Default parameters are:
 *   - editor: The internal editor name.
 *   - theme: The name/key of the editor theme/profile to use.
 *   - field: The CSS id of the target element.
 * @param settings
 *   An object containing editor settings for all enabled editor themes.
 */
Drupal.wysiwyg.editor.attach.none = function(context, params, settings) {
  if (params.resizable) {
    var $wrapper = $('#' + params.field).parents('.form-textarea-wrapper:first');
    $wrapper.addClass('resizable');
    if (Drupal.behaviors.textarea) {
      Drupal.behaviors.textarea.attach();
    }
  }
};

/**
 * Detach a single or all editors.
 *
 * The editor syncs its contents back to the original field before its instance
 * is removed.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   (optional) An object containing input format parameters. If defined,
 *   only the editor instance in params.field should be detached. Otherwise,
 *   all editors should be detached and saved, so they can be submitted in
 *   AJAX/AHAH applications.
 * @param trigger
 *   A string describing why the editor is being detached.
 *   Possible triggers are:
 *   - unload: (default) Another or no editor is about to take its place.
 *   - move: Currently expected to produce the same result as unload.
 *   - serialize: The form is about to be serialized before an AJAX request or
 *     a normal form submission. If possible, perform a quick detach and leave
 *     the editor's GUI elements in place to avoid flashes or scrolling issues.
 * @see Drupal.detachBehaviors
 */
Drupal.wysiwyg.editor.detach.none = function (context, params, trigger) {
  if (typeof params != 'undefined' && (trigger != 'serialize')) {
    var $wrapper = $('#' + params.field).parents('.form-textarea-wrapper:first');
    $wrapper.removeOnce('textarea').removeClass('.resizable-textarea')
      .find('.grippie').remove();
  }
};

/**
 * Instance methods for plain text areas.
 */
Drupal.wysiwyg.editor.instance.none = {
  insert: function(content) {
    var editor = document.getElementById(this.field);

    // IE support.
    if (document.selection) {
      editor.focus();
      var sel = document.selection.createRange();
      sel.text = content;
    }
    // Mozilla/Firefox/Netscape 7+ support.
    else if (editor.selectionStart || editor.selectionStart == '0') {
      var startPos = editor.selectionStart;
      var endPos = editor.selectionEnd;
      editor.value = editor.value.substring(0, startPos) + content + editor.value.substring(endPos, editor.value.length);
    }
    // Fallback, just add to the end of the content.
    else {
      editor.value += content;
    }
  },

  setContent: function (content) {
    $('#' + this.field).val(content);
  },

  getContent: function () {
    return $('#' + this.field).val();
  }
};

})(jQuery);
;/**/

(function ($) {

/**
 * Auto-hide summary textarea if empty and show hide and unhide links.
 */
Drupal.behaviors.textSummary = {
  attach: function (context, settings) {
    $('.text-summary', context).once('text-summary', function () {
      var $widget = $(this).closest('div.field-type-text-with-summary');
      var $summaries = $widget.find('div.text-summary-wrapper');

      $summaries.once('text-summary-wrapper').each(function(index) {
        var $summary = $(this);
        var $summaryLabel = $summary.find('label');
        var $full = $widget.find('.text-full').eq(index).closest('.form-item');
        var $fullLabel = $full.find('label');

        // Create a placeholder label when the field cardinality is
        // unlimited or greater than 1.
        if ($fullLabel.length == 0) {
          $fullLabel = $('<label></label>').prependTo($full);
        }

        // Setup the edit/hide summary link.
        var $link = $('<span class="field-edit-link">(<a class="link-edit-summary" href="#">' + Drupal.t('Hide summary') + '</a>)</span>').toggle(
          function () {
            $summary.hide();
            $(this).find('a').html(Drupal.t('Edit summary')).end().appendTo($fullLabel);
            return false;
          },
          function () {
            $summary.show();
            $(this).find('a').html(Drupal.t('Hide summary')).end().appendTo($summaryLabel);
            return false;
          }
        ).appendTo($summaryLabel);

        // If no summary is set, hide the summary field.
        if ($(this).find('.text-summary').val() == '') {
          $link.click();
        }
        return;
      });
    });
  }
};

})(jQuery);
;/**/
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;/**/
