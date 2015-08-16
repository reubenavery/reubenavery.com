(function($) {

/**
 * jQuery debugging helper.
 *
 * Invented for Dreditor.
 *
 * @usage
 *   $.debug(var [, name]);
 *   $variable.debug( [name] );
 */
jQuery.extend({
  debug: function () {
    // Setup debug storage in global window. We want to look into it.
    window.debug = window.debug || [];

    args = jQuery.makeArray(arguments);
    // Determine data source; this is an object for $variable.debug().
    // Also determine the identifier to store data with.
    if (typeof this == 'object') {
      var name = (args.length ? args[0] : window.debug.length);
      var data = this;
    }
    else {
      var name = (args.length > 1 ? args.pop() : window.debug.length);
      var data = args[0];
    }
    // Store data.
    window.debug[name] = data;
    // Dump data into Firebug console.
    if (typeof console != 'undefined') {
      console.log(name, data);
    }
    return this;
  }
});
// @todo Is this the right way?
jQuery.fn.debug = jQuery.debug;

})(jQuery);
;/**/
/*
	--------------------------------------------------------------------------
	(c) 2007 Lawrence Akka
	 - jquery version of the spamspan code (c) 2006 SpamSpan (www.spamspan.com)

	This program is distributed under the terms of the GNU General Public
	Licence version 2, available at http://www.gnu.org/licenses/gpl.txt
	--------------------------------------------------------------------------
*/

(function ($) { //Standard drupal jQuery wrapper.  See http://drupal.org/update/modules/6/7#javascript_compatibility
// load SpamSpan
Drupal.behaviors.spamspan = {
  attach: function(context, settings) {
// get each span with class spamspan
       $("span.spamspan", context).each(function (index) {
// for each such span, set mail to the relevant value, removing spaces
	    var _mail = ($("span.u", this).text() +
	    	"@" +
	    	$("span.d", this).text())
	    	.replace(/\s+/g, '')
	    	.replace(/\[dot\]/g, '.');
// Find the header text, and remove the round brackets from the start and end
	    var _headerText = $("span.h", this).text().replace(/^ ?\((.*)\) ?$/, "$1");
	    // split into individual headers, and return as an array of header=value pairs
	    var _headers = $.map(_headerText.split(/, /), function(n, i){
            return (n.replace(/: /,"="));
          });
// Find the anchor text, and remove the round brackets from the start and end
	    var _anchorText = $("span.t", this).text().replace(/^ \((.*)\)$/, "$1");
// Build the mailto URI
  var _mailto = "mailto:" + encodeURIComponent(_mail);
  var _headerstring = _headers.join('&');
  _mailto += _headerstring ? ("?" + _headerstring) : '';
// create the <a> element, and replace the original span contents
   	    $(this).after(
		$("<a></a>")
		.attr("href", _mailto)
		.html(_anchorText ? _anchorText : _mail)
		.addClass("spamspan")
		).remove();
	} );
}
};
}) (jQuery);;/**/
(function ($) {

function extlinkAttach(context) {
  // Strip the host name down, removing ports, subdomains, or www.
  var pattern = /^(([^\/:]+?\.)*)([^\.:]{4,})((\.[a-z]{1,4})*)(:[0-9]{1,5})?$/;
  var host = window.location.host.replace(pattern, '$3$4');
  var subdomain = window.location.host.replace(pattern, '$1');

  // Determine what subdomains are considered internal.
  if (Drupal.settings.extlink.extSubdomains) {
    var subdomains = "([^/]*\\.)?";
  }
  else if (subdomain == 'www.' || subdomain == '') {
    var subdomains = "(www\\.)?";
  }
  else {
    var subdomains = subdomain.replace(".", "\\.");
  }

  // Build regular expressions that define an internal link.
  var internal_link = new RegExp("^https?://" + subdomains + host, "i");

  // Extra internal link matching.
  var extInclude = false;
  if (Drupal.settings.extlink.extInclude) {
    extInclude = new RegExp(Drupal.settings.extlink.extInclude.replace(/\\/, '\\'));
  }

  // Extra external link matching.
  var extExclude = false;
  if (Drupal.settings.extlink.extExclude) {
    extExclude = new RegExp(Drupal.settings.extlink.extExclude.replace(/\\/, '\\'));
  }

  // Extra external link CSS selector exclusion.
  var extCssExclude = false;
  if (Drupal.settings.extlink.extCssExclude) {
    extCssExclude = Drupal.settings.extlink.extCssExclude;
  }

  // Extra external link CSS selector explicit.
  var extCssExplicit = false;
  if (Drupal.settings.extlink.extCssExplicit) {
    extCssExplicit = Drupal.settings.extlink.extCssExplicit;
  }

  // Find all links which are NOT internal and begin with http (as opposed
  // to ftp://, javascript:, etc. other kinds of links.
  // When operating on the 'this' variable, the host has been appended to
  // all links by the browser, even local ones.
  // In jQuery 1.1 and higher, we'd use a filter method here, but it is not
  // available in jQuery 1.0 (Drupal 5 default).
  var external_links = new Array();
  var mailto_links = new Array();
  $("a:not(." + Drupal.settings.extlink.extClass + ", ." + Drupal.settings.extlink.mailtoClass + "), area:not(." + Drupal.settings.extlink.extClass + ", ." + Drupal.settings.extlink.mailtoClass + ")", context).each(function(el) {
    try {
      var url = this.href.toLowerCase();
      if (url.indexOf('http') == 0 
            && (!url.match(internal_link) || (extInclude && url.match(extInclude))) 
            && !(extExclude && url.match(extExclude)) 
            && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
            && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
        external_links.push(this);
      }
      // Do not include area tags with begin with mailto: (this prohibits
      // icons from being added to image-maps).
      else if (this.tagName != 'AREA' 
            && url.indexOf('mailto:') == 0 
	    && !(extCssExclude && $(this).parents(extCssExclude).length > 0)
	    && !(extCssExplicit && $(this).parents(extCssExplicit).length < 1)) {
        mailto_links.push(this);
      }
    }
    // IE7 throws errors often when dealing with irregular links, such as:
    // <a href="node/10"></a> Empty tags.
    // <a href="http://user:pass@example.com">example</a> User:pass syntax.
    catch(error) {
      return false;
    }
  });

  if (Drupal.settings.extlink.extClass) {
    // Apply the "ext" class to all links not containing images.
    if (parseFloat($().jquery) < 1.2) {
      $(external_links).not('[img]').addClass(Drupal.settings.extlink.extClass).each(function() { if ($(this).css('display') == 'inline') $(this).after('<span class=' + Drupal.settings.extlink.extClass + '></span>'); });
    }
    else {
      $(external_links).not($(external_links).find('img').parents('a')).addClass(Drupal.settings.extlink.extClass).each(function() { if ($(this).css('display') == 'inline') $(this).after('<span class=' + Drupal.settings.extlink.extClass + '></span>'); });
    }
  }

  if (Drupal.settings.extlink.mailtoClass) {
    // Apply the "mailto" class to all mailto links not containing images.
    if (parseFloat($().jquery) < 1.2) {
      $(mailto_links).not('[img]').addClass(Drupal.settings.extlink.mailtoClass).each(function() { if ($(this).css('display') == 'inline') $(this).after('<span class=' + Drupal.settings.extlink.mailtoClass + '></span>'); });
    }
    else {
      $(mailto_links).not($(mailto_links).find('img').parents('a')).addClass(Drupal.settings.extlink.mailtoClass).each(function() { if ($(this).css('display') == 'inline') $(this).after('<span class=' + Drupal.settings.extlink.mailtoClass + '></span>'); });
    }
  }

  if (Drupal.settings.extlink.extTarget) {
    // Apply the target attribute to all links.
    $(external_links).attr('target', Drupal.settings.extlink.extTarget);
  }

  if (Drupal.settings.extlink.extAlert) {
    // Add pop-up click-through dialog.
    $(external_links).click(function(e) {
     return confirm(Drupal.settings.extlink.extAlertText);
    });
  }

  // Work around for Internet Explorer box model problems.
  if (($.support && !($.support.boxModel === undefined) && !$.support.boxModel) || ($.browser.msie && parseInt($.browser.version) <= 7)) {
    $('span.ext, span.mailto').css('display', 'inline-block');
  }
}

Drupal.behaviors.extlink = {
  attach: function(context){
    extlinkAttach(context);
  }
}

})(jQuery);
;/**/
(function ($) {

Drupal.behaviors.auto_nodetitleFieldsetSummaries = {
  attach: function (context) {
    $('fieldset#edit-auto-nodetitle', context).drupalSetSummary(function (context) {

      // Retrieve the value of the selected radio button
      var ant = $("input[@name=#edit-auto-nodetitle-ant]:checked").val();

      if (ant==0) {
        return Drupal.t('Disabled')
      }
      else if (ant==1) {
        return Drupal.t('Automatic (hide title field)')
      }
      else if (ant==2) {
        return Drupal.t('Automatic (if title empty)')
      }
    });
  }
};

})(jQuery);
;/**/
(function ($) {

  // Drupal Ipsum settings summary.
  Drupal.behaviors.drupal_ipsumFieldsetSummeries = {
    attach: function (context) {
      $('fieldset.drupal_ipsum-form', context).drupalSetSummary(function (context) {
        // If we add more settings we will have to refactor this.
        if ($('.form-checkbox', context).is(':checked')) {
          return Drupal.t('Drupal Ipsum is enabled.');
        }
        else {
          return Drupal.t('Drupal Ipsum is disabled.');
        }
      });
    }
  }
})(jQuery);;/**/
(function ($) {

Drupal.behaviors.menuChangeParentItems = {
  attach: function (context, settings) {
    $('fieldset#edit-menu input').each(function () {
      $(this).change(function () {
        // Update list of available parent menu items.
        Drupal.menu_update_parent_list();
      });
    });
  }
};

/**
 * Function to set the options of the menu parent item dropdown.
 */
Drupal.menu_update_parent_list = function () {
  var values = [];

  $('input:checked', $('fieldset#edit-menu')).each(function () {
    // Get the names of all checked menus.
    values.push(Drupal.checkPlain($.trim($(this).val())));
  });

  var url = Drupal.settings.basePath + 'admin/structure/menu/parents';
  $.ajax({
    url: location.protocol + '//' + location.host + url,
    type: 'POST',
    data: {'menus[]' : values},
    dataType: 'json',
    success: function (options) {
      // Save key of last selected element.
      var selected = $('fieldset#edit-menu #edit-menu-parent :selected').val();
      // Remove all exisiting options from dropdown.
      $('fieldset#edit-menu #edit-menu-parent').children().remove();
      // Add new options to dropdown.
      jQuery.each(options, function(index, value) {
        $('fieldset#edit-menu #edit-menu-parent').append(
          $('<option ' + (index == selected ? ' selected="selected"' : '') + '></option>').val(index).text(value)
        );
      });
    }
  });
};

})(jQuery);
;/**/
(function ($) {

Drupal.behaviors.contentTypes = {
  attach: function (context) {
    // Provide the vertical tab summaries.
    $('fieldset#edit-submission', context).drupalSetSummary(function(context) {
      var vals = [];
      vals.push(Drupal.checkPlain($('#edit-title-label', context).val()) || Drupal.t('Requires a title'));
      return vals.join(', ');
    });
    $('fieldset#edit-workflow', context).drupalSetSummary(function(context) {
      var vals = [];
      $("input[name^='node_options']:checked", context).parent().each(function() {
        vals.push(Drupal.checkPlain($(this).text()));
      });
      if (!$('#edit-node-options-status', context).is(':checked')) {
        vals.unshift(Drupal.t('Not published'));
      }
      return vals.join(', ');
    });
    $('fieldset#edit-display', context).drupalSetSummary(function(context) {
      var vals = [];
      $('input:checked', context).next('label').each(function() {
        vals.push(Drupal.checkPlain($(this).text()));
      });
      if (!$('#edit-node-submitted', context).is(':checked')) {
        vals.unshift(Drupal.t("Don't display post information"));
      }
      return vals.join(', ');
    });
  }
};

})(jQuery);
;/**/
(function ($) {

Drupal.behaviors.datePopupAuthoredFieldsetSummaries = {
  attach: function (context) {
    // Provide the vertical tab summaries.
    $('fieldset#edit-date-popup-authored', context).drupalSetSummary(function(context) {
      var vals = [];
      if ($('#edit-date-popup-authored-enabled', context).is(':checked')) {
        vals.unshift(Drupal.t('Enabled'));

        // Date format.
        var format = $('.form-item-date-popup-authored-format select option:selected', context).text();
        vals.push(Drupal.t('Date format: @format', {'@format': format}));

        // Date range.
        var range = $('#edit-date-popup-authored-year-range', context).val();
        vals.push(Drupal.t('Display &#x00B1;@range years', {'@range': range}));
      }
      else {
        vals.unshift(Drupal.t('Disabled'));
      }
      return vals.join(', ');
    });
  }
};

})(jQuery);;/**/
