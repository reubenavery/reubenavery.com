<?php
// $Id: template.php,v 3.0.6.9 2008/06/21 00:00:00 hass Exp $

/**
 * "Yet Another Multicolumn Layout" for Drupal
 *
 * (en) Central template for theme specific functions
 * (de) Zentrales Template für theme spezifische Funktionen
 *
 * @copyright       Copyright 2006-2008, Alexander Hass
 * @license         http://www.yaml-fuer-drupal.de/en/terms-of-use
 * @link            http://www.yaml-for-drupal.com
 * @package         yaml-for-drupal
 * @version         5.x-3.0.6.9
 * @lastmodified    2008-02-28
 */

/**
 * Include the central template.inc with global theme functions
 */
include_once(realpath(dirname(__FILE__) .'/template.inc'));


/**
 * Alter some Drupal variables required by Theme
 */
function reubidium_preprocess_page(&$vars) {
    global $user;

    /*
     * sIFR 3 implementation:
     */
    drupal_add_css( path_to_theme(). '/sifr3/css/sifr.css', 'module', 'all' );
    drupal_add_js( path_to_theme(). '/sifr3/js/sifr.js' );
    drupal_add_js( path_to_theme(). '/sifr3/js/sifr-config.js' );

    /* borrowing tabs from zen */
    drupal_add_css( path_to_theme(). '/css/navigation/tabs.css', 'theme', 'screen' );

    /* also, block editing */
    drupal_add_css( path_to_theme() .'/css/block-editing.css', 'theme', 'all');

    /* disable IE image toolbar */
    drupal_set_html_head('<meta http-equiv="imagetoolbar" content="no" />');


    // Load the XML prolog for standard compliant browsers if caching is inactive.
    // The function page_set_cache() does not cache pages if $user->uid has a value.
    // Additional the XML prolog can only added to YAML for Drupal if a user is
    // logged into Drupal (caching inactive) or caching is globaly disabled on the site.
    if ((_browser_xml_prolog_compliant() && $vars['logged_in']) || (_browser_xml_prolog_compliant() && !(variable_get('cache', 0)))) {
      $vars['xml_prolog'] = '<?xml version="1.0" encoding="utf-8"?>' . "\n";
    }

    // Adding graphical border around content
    $vars['border_top'] = '<div id="border-top"><div id="edge-tl"> </div><div id="edge-tr"> </div></div>' . "\n";
    $vars['border_bottom'] = '<div id="border-bottom"><div id="edge-bl"> </div><div id="edge-br"> </div></div>' . "\n";

    // Load region content assigned via drupal_set_content().
    if (module_exists('fontsize')) {
      foreach (array('fontsize_init', 'fontsize_links') as $region) {
        $vars[$region] = drupal_get_content($region);
      }
    }

    // D6 Backport:
    // Compile a list of classes that are going to be applied to the body element.
    // This allows advanced theming based on context (home page, node of certain type, etc.).
    $body_classes = array();
    // Add a class that tells us whether we're on the front page or not.
    $body_classes[] = $vars['is_front'] ? 'front' : 'not-front';
    // Add a class that tells us whether the page is viewed by an authenticated user or not.
    $body_classes[] = $vars['logged_in'] ? 'logged-in' : 'not-logged-in';
    // Add arg(0) to make it possible to theme the page depending on the current page
    // type (e.g. node, admin, user, etc.). To avoid illegal characters in the class,
    // we're removing everything disallowed. We are not using 'a-z' as that might leave
    // in certain international characters (e.g. German umlauts).
    $body_classes[] = preg_replace('![^abcdefghijklmnopqrstuvwxyz0-9-_]+!s', '', 'page-'. form_clean_id(drupal_strtolower(arg(0))));
    // If on an individual node page, add the node type.
    if (isset($vars['node']) && $vars['node']->type) {
      $body_classes[] = 'node-type-'. form_clean_id($vars['node']->type);
    }
    // Add information about the number of sidebars.
    if ($vars['layout'] == 'both') {
      $body_classes[] = 'two-sidebars';
    }
    elseif ($vars['layout'] == 'none') {
      $body_classes[] = 'no-sidebars';
      // Set additional YAML hide columns class.
      $body_classes[] = 'hideboth';
    }
    else {
      $body_classes[] = 'one-sidebar sidebar-'. $vars['layout'];
      // Set additional YAML hide column class.
      if ($vars['layout'] == 'left') {
        $body_classes[] = 'hidecol2';
      }
      elseif ($vars['layout'] == 'right') {
        $body_classes[] = 'hidecol1';
      }
    }
    // Implode with spaces.
    $vars['body_classes'] = implode(' ', $body_classes);

    // Add YAML Theme styles
    $vars['css'] = _yaml_simple_add_css($vars);
    $vars['styles'] = _yaml_simple_add_styles($vars);

    return $vars;
}


function reubidium_preprocess_block(&$vars) {
  $block = $vars['block'];

  // Special classes for blocks
  $block_classes = array();
  $block_classes[] = 'block-'. $block->module;
  $block_classes[] = 'region-'. $block->region;
  $block_classes[] = $vars['zebra'];
  $block_classes[] = 'region-count-'. $vars['block_id'];
  $block_classes[] = 'count-'. $vars['id'];
  $vars['block_classes'] = implode(' ', $block_classes);

  $vars['edit_links'] = '';
  if (user_access('administer blocks')) {
    // Display 'edit block' for custom blocks
    if ($block->module == 'block') {
      $edit_links[] = l('<span>'. t('edit block') .'</span>', 'admin/build/block/configure/'. $block->module .'/'. $block->delta, array('title' => t('edit the content of this block'), 'class' => 'block-edit'), drupal_get_destination(), NULL, FALSE, TRUE);
    }
    // Display 'configure' for other blocks
    else {
      $edit_links[] = l('<span>'. t('configure') .'</span>', 'admin/build/block/configure/'. $block->module .'/'. $block->delta, array('title' => t('configure this block'), 'class' => 'block-config'), drupal_get_destination(), NULL, FALSE, TRUE);
    }

    // Display 'administer views' for views blocks
    if ($block->module == 'views' && user_access('administer views')) {
      $edit_links[] = l('<span>'. t('edit view') .'</span>', 'admin/build/views/'. $block->delta .'/edit', array('title' => t('edit the view that defines this block'), 'class' => 'block-edit-view'), drupal_get_destination(), 'edit-block', FALSE, TRUE);
    }
    // Display 'edit menu' for menu blocks
    elseif (($block->module == 'menu' || ($block->module == 'user' && $block->delta == 1)) && user_access('administer menu')) {
      $edit_links[] = l('<span>'. t('edit menu') .'</span>', 'admin/build/menu', array('title' => t('edit the menu that defines this block'), 'class' => 'block-edit-menu'), drupal_get_destination(), NULL, FALSE, TRUE);
    }
    $vars['edit_links_array'] = $edit_links;
    $vars['edit_links'] = '<div class="edit">'. implode(' ', $edit_links) .'</div>';
  }

  return $vars;
}



/**
 * Theme CSS files
 *
 * Workaround for CSS aggregate and compress feature in Drupal 5.x
 */
function _yaml_simple_add_css($vars = array()) {

  $base_theme_directory = $vars['directory'];

  // Add core and layout specific styles
  drupal_add_css($base_theme_directory .'/yaml/core/base.css', 'theme');
  drupal_add_css($base_theme_directory .'/css/screen/basemod.css', 'theme');
  drupal_add_css($base_theme_directory .'/css/screen/basemod_drupal.css', 'theme');

  // graphical borders
  drupal_add_css($base_theme_directory .'/css/screen/basemod_gfxborder.css', 'theme');

  // Add horizontal navigations
  drupal_add_css($base_theme_directory .'/css/navigation/nav_shinybuttons.css', 'theme');
  //drupal_add_css($base_theme_directory .'/css/navigation/nav_slidingdoor.css', 'theme');

  // Add vertical navigations
  drupal_add_css($base_theme_directory .'/css/navigation/nav_vlist_drupal.css', 'theme');

  // Content CSS files
  drupal_add_css($base_theme_directory .'/css/screen/content.css', 'theme');

  // Add custom module styles
  _yaml_add_css_modules($base_theme_directory);

  // Add print CSS files
  drupal_add_css($base_theme_directory .'/yaml/core/print_base.css', 'theme');
  drupal_add_css($base_theme_directory .'/css/print/print_003.css', 'theme');
  drupal_add_css($base_theme_directory .'/css/print/print_drupal.css', 'theme');

  // Remove the style.css added as first array item and move it to the end
  // of the styles array. This allows to use themes style.css and keep
  // the required CSS cascading order intact for CSS overriding.
  $css = drupal_add_css();
  if (isset($css['all']['theme'][$vars['directory'] .'/style.css'])) {
    unset($css['all']['theme'][$vars['directory'] .'/style.css']);
    $css['all']['theme'][$vars['directory'] .'/style.css'] = TRUE;
  }

  // Return CSS array
  return $css;
}

/**
 * This snippet will add module styles if module is installed and active.
 * TODO: Add CSS only if page requires file.
 */
function _yaml_add_css_modules($base_theme_directory = '') {

  // Add module styles if modules exists
  // The unique modules directory name should be used as CSS filename.
  if (module_exists('menu_block_split')) {
    drupal_add_css($base_theme_directory .'/css/modules/menu_block_split.css', 'theme');
  }
  if (module_exists('jrating')) {
    drupal_add_css($base_theme_directory .'/css/modules/jrating.css', 'theme');
  }
  if (module_exists('service_links')) {
    drupal_add_css($base_theme_directory .'/css/modules/service_links.css', 'theme');
  }
  if (module_exists('site_map') && arg(0) == 'sitemap') {
    drupal_add_css($base_theme_directory .'/css/modules/site_map.css', 'theme');
  }

  // Add non Drupal modules here.
  // To avoid naming conflicts an underscore should be added as prefix
  // to CSS filenames of modules not contributed on drupal.org.
  // if (foo == bar) {
  //   drupal_add_css($base_theme_directory .'/css/modules/_example.css', 'theme');
  // }

}


function _yaml_simple_add_styles($vars = array()) {

  // Theme-Settings based on css/screen/basemod.css setting.
  $yaml_layout_page_width_min = '740px';
  $yaml_layout_page_width_max = '80em';

  $base_theme_directory = $vars['directory'];
  $styles = drupal_get_css($vars['css']);

  // The styles array is complete, get the styled css and append the
  // IE Hacks. Additional this allows to dynamically add packed or other iehacks.
  $styles .= "<!--[if lte IE 7]>\n";
  $styles .= '<style type="text/css" media="all">@import "'. base_path() . $base_theme_directory .'/yaml/core/iehacks'. (variable_get('preprocess_css', FALSE) ? '.pack' : '') .'.css";</style>' . "\n";
  $styles .= '<style type="text/css" media="all">@import "'. base_path() . $base_theme_directory .'/css/patches/patch_nav_vlist_drupal.css";</style>' . "\n";
  $styles .= '<style type="text/css" media="all">@import "'. base_path() . $base_theme_directory .'/css/patches/patch_3col_standard.css";</style>' . "\n";
  $styles .= '<style type="text/css" media="all">@import "'. base_path() . $base_theme_directory .'/css/patches/patch_drupal.css";</style>' . "\n";
  $styles .= "<![endif]-->\n";

  // IE 6 settings and styles.
  $styles .= "<!--[if lte IE 6]>\n";
  $styles .= '<style type="text/css">';
  $styles .= 'img, .pngtrans { behavior: url('. base_path() . $base_theme_directory .'/images/pngfix/iepngfix.htc) }';
  // Example for flexible layouts.
  $styles .= '* html #page_margins { width: '. $yaml_layout_page_width_max .'; width: expression((document.documentElement && document.documentElement.clientHeight) ? ((document.documentElement.clientWidth < '. preg_replace('/[\D]+/', '', $yaml_layout_page_width_min) .') ? "'. $yaml_layout_page_width_min .'" : ((document.documentElement.clientWidth > (80 * 16 * (parseInt(this.parentNode.currentStyle.fontSize) / 100))) ? "'. $yaml_layout_page_width_max .'" : "auto" )) : ((document.body.clientWidth < '. preg_replace('/[\D]+/', '', $yaml_layout_page_width_min) .') ? "'. $yaml_layout_page_width_min .'" : ((document.body.clientWidth > (80 * 16 * (parseInt(this.parentNode.currentStyle.fontSize) / 100))) ? "'. $yaml_layout_page_width_max .'" : "auto" )));';
  // Example for fixed layouts.
  // $styles .= '* html #page_margins { width: '. $yaml_layout_page_width_max .';}';
  $styles .= "</style>\n";
  $styles .= "<![endif]-->\n";

  // Return themed styles.
  return $styles;
}


/**
 * We will detect if client is Internet Explorer. Then we are able to add
 * the XML prolog for XHTML Standard Compliance Mode for other browsers.
 *
 * Today IE is the only known software we need to workaround and therefor we
 * only detect IE browser and suppose all other browsers render correctly with
 * XML prolog.
 */
function _browser_xml_prolog_compliant() {
  $ua = $_SERVER['HTTP_USER_AGENT'];

  if (eregi('msie', $ua) && !eregi('opera', $ua)) {
    // This is not a Opera pose as IE
    $clientdata = explode(' ', stristr($ua, 'msie'));
    $client['version'] = $clientdata[1];

    if ($client['version'] >= 7) {
      // IE >= 7.0: http://blogs.msdn.com/ie/archive/2005/09/15/467901.aspx
      $xml_prolog_compliant = TRUE;
    }
    else {
      // IE <= 6.0
      $xml_prolog_compliant = FALSE;
    }
  }
  else {
    // all other browsers
    $xml_prolog_compliant = TRUE;
  }

  return $xml_prolog_compliant;
}
