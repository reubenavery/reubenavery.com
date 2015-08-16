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
