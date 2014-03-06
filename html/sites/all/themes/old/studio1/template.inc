<?php
// $Id: template.inc,v 3.2.1.13 2010/05/14 00:00:00 hass Exp $

/**
 * "Yet Another Multicolumn Layout" for Drupal
 *
 * (en) Central template for global theme functions
 * (de) Zentrales Template für globale Theme-Funktionen
 *
 * @copyright       Copyright 2006-2010, Alexander Hass
 * @license         http://www.yaml-fuer-drupal.de/en/terms-of-use
 * @link            http://www.yaml-for-drupal.com
 * @package         yaml-for-drupal
 * @version         6.x-3.2.1.13
 * @lastmodified    2010-05-14
 */

/**
 * !!! Enable ONLY in development mode !!!
 *
 * This function will avoid caching issues when adding or removing theme
 * functions and templates. Editing existing functions and templates does
 * not require a registry rebuild.
 *
 * See http://drupal.org/node/173880#theme-registry for more information.
 */
//drupal_rebuild_theme_registry();

/**
 * Add the YAML project backlinks to the footer region.
 *
 * (en) CC licenses annotations:
 * For the free use of YAML for Drupal, a backlink to the
 * YAML for Drupal homepage (http://www.yaml-fuer-drupal.de)
 * and YAML homepage (http://www.yaml.de) in a suitable place
 * (e.g.: footer of the website or in the imprint) is required.
 *
 * For more information read the "YAML" and "YAML for Drupal" license, please.
 *
 * (de) Anmerkung zu den CC Lizenzen:
 * Für die kostenfreie Nutzung von YAML für Drupal ist die
 * Namensnennung der Autoren/Rechtsinhaber bzw. eine Rückverlinkung
 * zur YAML für Drupal-Homepage (http://www.yaml-fuer-drupal.de)
 * und YAML-Homepage (http://www.yaml.de) an geeigneter Stelle
 * (z.B.: Fußzeile der Website oder im Impressum) vorgeschrieben.
 *
 * Nähere Informationen befinden sich in der "YAML" und "YAML für Drupal" Lizenz.
 *
 * Licenses:
 * YAML - http://www.yaml.de
 * YAML for Drupal - http://www.yaml-for-drupal.com
 */
function _yaml_preprocess_footer($output = '', $delimiter = ' | ', $leftcab = '', $rightcab = '') {

  $footer_items = array();

  // If you don't like the validation links, simply uncheck on theme settings page.
  if (theme_get_setting('yaml_display_link_validation_xhtml') !== 0) {
    $footer_items[] = t('<a href="http://validator.w3.org/check/referer" title="Validate XHTML">XHTML</a>');
  }

  if (theme_get_setting('yaml_display_link_validation_css') !== 0) {
    $footer_items[] = t('<a href="http://jigsaw.w3.org/css-validator/check/referer" title="Validate CSS">CSS</a>');
  }

//  /**
//   * Make sure your site comply with the CC license rules of
//   * the YAML CSS Framework data, if you change/remove the below backlink.
//   * URL: http://www.yaml.de/
//   */
//  if (theme_get_setting('yaml_display_link_license_yaml') !== 0) {
//    $footer_items[] = t('Layout based on <a href="http://www.yaml.de/">YAML</a>');
//  }
//
//  /**
//   * Make sure your site comply with the CC license rules of
//   * the YAML for Drupal data, if you change/remove the below backlink.
//   * URL: http://www.yaml-for-drupal.com/
//   */
//  if (theme_get_setting('yaml_display_link_license_yamlfd') !== 0) {
//    $footer_items[] = t('<a href="http://www.yaml-fuer-drupal.de/" title="YAML for Drupal Theme">YAML for Drupal</a> Theme');
//  }

  // Build footer and links if exists
  $footer_links_output = '';
  if (!empty($footer_items)) {
    $footer_links_output = implode($delimiter, $footer_items);
  }

  $footer_output = '';
  if (!empty($output) && !empty($footer_links_output)) {
    $footer_output = $output .'<br />'. $leftcab . $footer_links_output . $rightcab;
  }
  elseif (empty($output) && !empty($footer_links_output)) {
    $footer_output = $leftcab . $footer_links_output . $rightcab;
  }
  else {
    $footer_output = $output;
  }

  // Return footer
  return $footer_output;
}

/**
 * We will detect if client is Internet Explorer. Then we are able to add
 * the XML prolog for XHTML Standard Compliance Mode for other browsers.
 *
 * Today IE is the only known software we need to workaround and therefor we
 * only detect IE browser and suppose all other browsers render correctly with
 * XML prolog.
 */
function _yaml_browser_xml_prolog_compliant() {
  $ua = $_SERVER['HTTP_USER_AGENT'];

  if (preg_match('/msie/i', $ua) && !preg_match('/opera/i', $ua)) {
    // This is not an Opera pose as IE.
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
    // All other browsers
    $xml_prolog_compliant = TRUE;
  }

  return $xml_prolog_compliant;
}
