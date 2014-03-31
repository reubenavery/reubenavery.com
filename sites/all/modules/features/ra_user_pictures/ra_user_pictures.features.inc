<?php
/**
 * @file
 * ra_user_pictures.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function ra_user_pictures_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_image_default_styles().
 */
function ra_user_pictures_image_default_styles() {
  $styles = array();

  // Exported image style: user_icon.
  $styles['user_icon'] = array(
    'name' => 'user_icon',
    'label' => 'User Icon',
    'effects' => array(
      3 => array(
        'label' => 'Scale and crop',
        'help' => 'Scale and crop will maintain the aspect-ratio of the original image, then crop the larger dimension. This is most useful for creating perfectly square thumbnails without stretching the image.',
        'effect callback' => 'image_scale_and_crop_effect',
        'dimensions callback' => 'image_resize_dimensions',
        'form callback' => 'image_resize_form',
        'summary theme' => 'image_resize_summary',
        'module' => 'image',
        'name' => 'image_scale_and_crop',
        'data' => array(
          'width' => 55,
          'height' => 55,
        ),
        'weight' => 1,
      ),
    ),
  );

  return $styles;
}
