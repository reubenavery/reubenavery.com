
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
/**
 * @file
 * JavaScript for the Disqus Drupal module.
 */

// The Disqus global variables.
var disqus_shortname = '';
var disqus_url = '';
var disqus_title = '';
var disqus_identifier = '';
var disqus_developer = 0;
var disqus_def_name = '';
var disqus_def_email = '';
var disqus_config;

(function ($) {

/**
 * Drupal Disqus behavior.
 */
Drupal.behaviors.disqus = {
  attach: function (context, settings) {
    $('body').once('disqus', function() {
      // Load the Disqus comments.
      if (settings.disqus || false) {
        // Setup the global JavaScript variables for Disqus.
        disqus_shortname = settings.disqus.domain;
        disqus_url = settings.disqus.url;
        disqus_title = settings.disqus.title;
        disqus_identifier = settings.disqus.identifier;
        disqus_developer = settings.disqus.developer || 0;
        disqus_def_name = settings.disqus.name || '';
        disqus_def_email = settings.disqus.email || '';

        // Language and SSO settings are passed in through disqus_config().
        disqus_config = function() {
          if (settings.disqus.language || false) {
            this.language = settings.disqus.language;
          }
          if (settings.disqus.remote_auth_s3 || false) {
            this.page.remote_auth_s3 = settings.disqus.remote_auth_s3;
          }
          if (settings.disqus.api_key || false) {
            this.page.api_key = settings.disqus.api_key;
          }
          if (settings.disqus.sso || false) {
            this.sso = settings.disqus.sso;
          }
          if (settings.disqus.callbacks || false) {
            for (var key in settings.disqus.callbacks) {
              for (var i = 0; i < settings.disqus.callbacks[key].length; i++) {
                var callback = settings.disqus.callbacks[key][i].split('.');
                var fn = window;
                for (var j = 0; j < callback.length; j++) {
                  fn = fn[callback[j]];
                }
                if(typeof fn === 'function') {
                  this.callbacks[key].push(fn);
                }
              }
            }
          }
        };

        // Make the AJAX call to get the Disqus comments.
        jQuery.ajax({
          type: 'GET',
          url: '//' + disqus_shortname + '.disqus.com/embed.js',
          dataType: 'script',
          cache: false
        });
      }

      // Load the comment numbers JavaScript.
      if (settings.disqusComments || false) {
        disqus_shortname = settings.disqusComments;
        // Make the AJAX call to get the number of comments.
        jQuery.ajax({
          type: 'GET',
          url: '//' + disqus_shortname + '.disqus.com/count.js',
          dataType: 'script',
          cache: false
        });
      }
    });
  }
};

})(jQuery);
;/**/
(function ($) {

$(document).ready(function() {

  // Expression to check for absolute internal links.
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");

  // Attach onclick event to document only and catch clicks on all elements.
  $(document.body).click(function(event) {
    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      var ga = Drupal.settings.googleanalytics;
      // Expression to check for special links like gotwo.module /go/* links.
      var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
      // Expression to check for download links.
      var isDownload = new RegExp("\\.(" + ga.trackDownloadExtensions + ")$", "i");

      // Is the clicked URL internal?
      if (isInternal.test(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox')) {
          // Do nothing here. The custom event will handle all tracking.
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (ga.trackDownload && isDownload.test(this.href)) {
          // Download link clicked.
          var extension = isDownload.exec(this.href);
          _gaq.push(["_trackEvent", "Downloads", extension[1].toUpperCase(), this.href.replace(isInternal, '')]);
        }
        else if (isInternalSpecial.test(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          _gaq.push(["_trackPageview", this.href.replace(isInternal, '')]);
        }
      }
      else {
        if (ga.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          _gaq.push(["_trackEvent", "Mails", "Click", this.href.substring(7)]);
        }
        else if (ga.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (ga.trackDomainMode == 2 && isCrossDomain(this.hostname, ga.trackCrossDomains)) {
            // Top-level cross domain clicked. document.location is handled by _link internally.
            event.preventDefault();
            _gaq.push(["_link", this.href]);
          }
          else {
            // External link clicked.
            _gaq.push(["_trackEvent", "Outbound links", "Click", this.href]);
          }
        }
      }
    });
  });

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  $(document).bind("cbox_complete", function() {
    var href = $.colorbox.element().attr("href");
    if (href) {
      _gaq.push(["_trackPageview", href.replace(isInternal, '')]);
    }
  });

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
function isCrossDomain(hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, http://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
}

})(jQuery);
;/**/
