(function ($) {
  var qMark = '<div class="filter-help"><a></a></div>';
  function changeGuidelines(select) {
    var wrapper = select.closest('.form-item').siblings('.filter-wrapper');
    $('.filter-guidelines-item', wrapper).css('display', 'none');
    $('.filter-guidelines-' + select.val(), wrapper).css('display', 'block');
  }
  // Change the text that is displayed based on the select box.
  function formatChangeHandler() {
    changeGuidelines($(this));
  }
  // Toggle the guidelines text being visible.
  function qMarkClickHandler() {
    $(this).closest('.form-item').siblings('.filter-wrapper').toggleClass('element-invisible');
  }

  Drupal.behaviors.simplifiedFormatsFormatField = {
    attach: function (context, settings) {
      // Once is used with context because otherwise all the question marks are removed on every AJAX call
      $('.text-format-wrapper .filter-list', context).once('simpleFormat')
        .each(function () {
          // Attach change handler to manage showing only the relevant guideline.
          $(this).bind('change', formatChangeHandler);
          changeGuidelines($(this));

          // Append question mark that toggles the display of filter-help.
          $(this).parent().append(qMark);
          $(this).siblings('.filter-help').children().bind('click', qMarkClickHandler);
      });
    }
  };
})(jQuery);
