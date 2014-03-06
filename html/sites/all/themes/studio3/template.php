<?php // $Id: template.php,v 1.1.2.6 2009/12/24 01:47:01 jmburnz Exp $
// adaptivethemes.com

/**
 * @file template.php
 */

// Don't include custom functions if the database is inactive.
if (db_is_active()) {
  // Include base theme custom functions.
  include_once(drupal_get_path('theme', 'adaptivetheme') .'/inc/template.custom-functions.inc');
}

/**
 * Add the color scheme stylesheet if color_enable_schemes is set to 'on'.
 * Note: you must have at minimum a color-default.css stylesheet in /css/theme/
 */
if (theme_get_setting('color_enable_schemes') == 'on') {
  drupal_add_css(drupal_get_path('theme', 'studio3') .'/css/theme/'. get_at_colors(), 'theme');
}

/**
 * USAGE
 * 1. Rename each function to match your subthemes name,
 *    e.g. if you name your theme "themeName" then the function
 *    name will be "themeName_preprocess_hook".
 * 2. Uncomment the required function to use. You can delete the
 *    "sample_variable".
 */

/**
 * Override or insert variables into all templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered.
 */
/*
function studio3_preprocess(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
*/

/**
 * Override or insert variables into the page templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered.
 */
function studio3_preprocess_page(&$vars, $hook) {
  // No title for front page
  if ($vars['is_front']) {
    unset($vars['title']);
  }
  
  $vars['logo'] = url(path_to_theme() .'/images/logo-default.png');
  
  if (strstr($vars['classes'], 'section-webdev')) {
    $vars['section_title'] = l(t('Web Development'), 'webdev');
    $vars['logo'] = url(path_to_theme() .'/images/logo-webdev.png');

  }

  if (strstr($vars['classes'], 'section-creative')) {
    $vars['section_title'] = l(t('Selected Works'), 'creative');
    $vars['logo'] = url(path_to_theme() .'/images/logo-creative.png');
  }
  
  if (strstr($vars['classes'], 'section-contact')) {
    $vars['logo'] = url(path_to_theme() .'/images/logo-contact.png');
  }
  
  $vars['logo_img'] = $vars['logo'] ? '<img src="'. check_url($vars['logo']) .'" alt="'. $vars['logo_alt_text'] .'" title="'. t('Home page') .'"/>' : '';
  $vars['linked_site_logo'] = $vars['logo_img'] ? l($vars['logo_img'], '<front>', array('attributes' => array('rel' => 'home'), 'title' => t('Home page'), 'html' => TRUE)) : '';
  

}


/**
 * Override or insert variables into the node templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered.
 */
/*
function studio3_preprocess_node(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
*/

/**
 * Override or insert variables into the comment templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered.
 */
/*
function studio3_preprocess_comment(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
*/

/**
 * Override or insert variables into the block templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered.
 */
/*
function studio3_preprocess_block(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
*/
