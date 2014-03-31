<?php
/**
 * @file
 * ra_formats.features.filter.inc
 */

/**
 * Implements hook_filter_default_formats().
 */
function ra_formats_filter_default_formats() {
  $formats = array();

  // Exported format: Feed Content.
  $formats['feed_content'] = array(
    'format' => 'feed_content',
    'name' => 'Feed Content',
    'cache' => 1,
    'status' => 1,
    'weight' => 0,
    'filters' => array(
      'filter_html' => array(
        'weight' => -10,
        'status' => 1,
        'settings' => array(
          'allowed_html' => '<div><p><h2><h3><h4><h5><h6><img><a> <em> <strong> <cite> <blockquote> <code> <ul> <ol> <li> <dl> <dt> <dd>',
          'filter_html_help' => 1,
          'filter_html_nofollow' => 1,
        ),
      ),
      'filter_htmlcorrector' => array(
        'weight' => 10,
        'status' => 1,
        'settings' => array(),
      ),
    ),
  );

  // Exported format: HTML.
  $formats['full_html'] = array(
    'format' => 'full_html',
    'name' => 'HTML',
    'cache' => 1,
    'status' => 1,
    'weight' => -9,
    'filters' => array(
      'image_resize_filter' => array(
        'weight' => -46,
        'status' => 1,
        'settings' => array(
          'link' => 0,
          'link_class' => '',
          'link_rel' => '',
          'image_locations' => array(
            'local' => 'local',
            'remote' => 0,
          ),
        ),
      ),
      'filter_dopl' => array(
        'weight' => -45,
        'status' => 1,
        'settings' => array(),
      ),
      'filter_url' => array(
        'weight' => -44,
        'status' => 1,
        'settings' => array(
          'filter_url_length' => 72,
        ),
      ),
      'spamspan' => array(
        'weight' => -41,
        'status' => 1,
        'settings' => array(
          'spamspan_at' => ' [at] ',
          'spamspan_use_graphic' => 0,
        ),
      ),
      'filter_autop' => array(
        'weight' => -40,
        'status' => 1,
        'settings' => array(),
      ),
      'filter_htmlcorrector' => array(
        'weight' => -39,
        'status' => 1,
        'settings' => array(),
      ),
      'wysiwyg' => array(
        'weight' => -37,
        'status' => 1,
        'settings' => array(
          'valid_elements' => 'a[!href|target<_blank|title],
div[align<center?justify?left?right],
p[align<center?justify?left?right],
img[*],
br,span,em,strong,cite,pre,code,samp,kbd,var,blockquote,ul,ol,li,dl,dt,dd,hr,
h2,h3,h4,h5,h6,
@[class]',
          'allow_comments' => 0,
          'nofollow_policy' => 'whitelist',
          'nofollow_domains' => array(
            0 => 'reubenavery.local',
            2 => 'reubenavery.com',
          ),
          'style_color' => array(
            'color' => 0,
            'background' => 0,
            'background-color' => 0,
            'background-image' => 0,
            'background-repeat' => 0,
            'background-attachment' => 0,
            'background-position' => 0,
          ),
          'style_font' => array(
            'font' => 0,
            'font-family' => 0,
            'font-size' => 0,
            'font-size-adjust' => 0,
            'font-stretch' => 0,
            'font-style' => 0,
            'font-variant' => 0,
            'font-weight' => 0,
          ),
          'style_text' => array(
            'text-align' => 0,
            'text-decoration' => 0,
            'text-indent' => 0,
            'text-transform' => 0,
            'letter-spacing' => 0,
            'word-spacing' => 0,
            'white-space' => 0,
            'direction' => 0,
            'unicode-bidi' => 0,
          ),
          'style_box' => array(
            'margin' => 0,
            'margin-top' => 0,
            'margin-right' => 0,
            'margin-bottom' => 0,
            'margin-left' => 0,
            'padding' => 0,
            'padding-top' => 0,
            'padding-right' => 0,
            'padding-bottom' => 0,
            'padding-left' => 0,
          ),
          'style_border-1' => array(
            'border' => 0,
            'border-top' => 0,
            'border-right' => 0,
            'border-bottom' => 0,
            'border-left' => 0,
            'border-width' => 0,
            'border-top-width' => 0,
            'border-right-width' => 0,
            'border-bottom-width' => 0,
            'border-left-width' => 0,
          ),
          'style_border-2' => array(
            'border-color' => 0,
            'border-top-color' => 0,
            'border-right-color' => 0,
            'border-bottom-color' => 0,
            'border-left-color' => 0,
            'border-style' => 0,
            'border-top-style' => 0,
            'border-right-style' => 0,
            'border-bottom-style' => 0,
            'border-left-style' => 0,
          ),
          'style_dimension' => array(
            'height' => 0,
            'line-height' => 0,
            'max-height' => 0,
            'max-width' => 0,
            'min-height' => 0,
            'min-width' => 0,
            'width' => 0,
          ),
          'style_positioning' => array(
            'bottom' => 0,
            'clip' => 0,
            'left' => 0,
            'overflow' => 0,
            'right' => 0,
            'top' => 0,
            'vertical-align' => 0,
            'z-index' => 0,
          ),
          'style_layout' => array(
            'clear' => 0,
            'display' => 0,
            'float' => 0,
            'position' => 0,
            'visibility' => 0,
          ),
          'style_list' => array(
            'list-style' => 0,
            'list-style-image' => 0,
            'list-style-position' => 0,
            'list-style-type' => 0,
          ),
          'style_table' => array(
            'border-collapse' => 0,
            'border-spacing' => 0,
            'caption-side' => 0,
            'empty-cells' => 0,
            'table-layout' => 0,
          ),
          'style_user' => array(
            'cursor' => 0,
            'outline' => 0,
            'outline-width' => 0,
            'outline-style' => 0,
            'outline-color' => 0,
            'zoom' => 0,
          ),
          'rule_valid_classes' => array(
            0 => 'code',
            2 => 'title',
          ),
          'rule_valid_ids' => array(),
          'rule_style_urls' => array(),
        ),
      ),
    ),
  );

  // Exported format: Markdown.
  $formats['markdown'] = array(
    'format' => 'markdown',
    'name' => 'Markdown',
    'cache' => 1,
    'status' => 1,
    'weight' => -8,
    'filters' => array(
      'filter_markdown' => array(
        'weight' => -48,
        'status' => 1,
        'settings' => array(),
      ),
      'codefilter' => array(
        'weight' => -46,
        'status' => 1,
        'settings' => array(),
      ),
      'spamspan' => array(
        'weight' => -45,
        'status' => 1,
        'settings' => array(
          'spamspan_at' => ' [at] ',
          'spamspan_use_graphic' => 0,
        ),
      ),
      'filter_dopl' => array(
        'weight' => -40,
        'status' => 1,
        'settings' => array(),
      ),
      'filter_url' => array(
        'weight' => -39,
        'status' => 1,
        'settings' => array(
          'filter_url_length' => 72,
        ),
      ),
      'demote_filter_headings' => array(
        'weight' => 0,
        'status' => 1,
        'settings' => array(
          'add_class' => 'demoted',
        ),
      ),
    ),
  );

  // Exported format: PHP code *.
  $formats['php_code'] = array(
    'format' => 'php_code',
    'name' => 'PHP code *',
    'cache' => 0,
    'status' => 1,
    'weight' => -6,
    'filters' => array(
      'php_code' => array(
        'weight' => 0,
        'status' => 1,
        'settings' => array(),
      ),
    ),
  );

  // Exported format: Plain text.
  $formats['plain_text'] = array(
    'format' => 'plain_text',
    'name' => 'Plain text',
    'cache' => 1,
    'status' => 1,
    'weight' => -10,
    'filters' => array(
      'filter_html_escape' => array(
        'weight' => -46,
        'status' => 1,
        'settings' => array(),
      ),
      'spamspan' => array(
        'weight' => -45,
        'status' => 1,
        'settings' => array(
          'spamspan_at' => ' [at] ',
          'spamspan_use_graphic' => 0,
        ),
      ),
      'filter_dopl' => array(
        'weight' => -44,
        'status' => 1,
        'settings' => array(),
      ),
      'filter_url' => array(
        'weight' => -40,
        'status' => 1,
        'settings' => array(
          'filter_url_length' => 72,
        ),
      ),
      'filter_autop' => array(
        'weight' => -39,
        'status' => 1,
        'settings' => array(),
      ),
    ),
  );

  return $formats;
}
