<?php
/**
 * @file
 * ra_staff_profiles.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function ra_staff_profiles_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_views_api().
 */
function ra_staff_profiles_views_api($module = NULL, $api = NULL) {
  return array("api" => "3.0");
}

/**
 * Implements hook_default_profile2_type().
 */
function ra_staff_profiles_default_profile2_type() {
  $items = array();
  $items['staff'] = entity_import('profile2_type', '{
    "userCategory" : false,
    "userView" : false,
    "type" : "staff",
    "label" : "Staff Bio",
    "weight" : "0",
    "data" : { "registration" : 0, "use_page" : 1 }
  }');
  return $items;
}
