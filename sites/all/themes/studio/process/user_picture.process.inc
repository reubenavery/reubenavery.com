<?php

/**
 * Process variables for user-picture.tpl.php.
 *
 * The $variables array contains the following arguments:
 * - $account: A user, node or comment object with 'name', 'uid' and 'picture'
 *   fields.
 *
 * @see user-picture.tpl.php
 */
function studio_process_user_picture(&$variables) {
  if (empty($variables['user_picture_style'])) {
    return;
  }

  if (variable_get('user_pictures', 0) && module_exists('gravatar')) {
    // Load the full user object since it is not provided with nodes, comments,
    // or views displays.
    $account = _gravatar_load_account($variables['account']);
    $filepath = _gravatar_get_account_user_picture($account);

    // Grab a local filename from the Gravatar URL.
    $uri = drupal_parse_url($filepath);
    $filename = basename($uri['path']);

    // Create a local cache filename.
    $cache = GRAVATAR_CACHE . '/' . $filename;

    // Test if the cache file exists. If so, and it is less than a week
    // old, do not re-fetch it.
    if (file_exists(drupal_realpath($cache))) {
      $interval = time() - filemtime(drupal_realpath($cache));
      $refresh = ($interval > GRAVATAR_EXPIRE);
    }
    else {
      $refresh = TRUE;
    }

    // Copy the gravatar to a local path OR set the local path to the
    // cached file.
    if ($refresh) {
      $filepath = system_retrieve_file($filepath, GRAVATAR_CACHE . '/' . $filename, FALSE, FILE_EXISTS_REPLACE);
    }
    else {
      $filepath = $cache;
    }

    // Continue as if nothing happened.
    if (!empty($filepath)) {
      $alt = t("@user's picture", array('@user' => format_username($account)));
      if (module_exists('image') && file_valid_uri($filepath) && $style = $variables['user_picture_style']) {
        $variables['user_picture'] = theme('image_style', array('style_name' => $style, 'path' => $filepath, 'alt' => $alt, 'title' => $alt));
      }
      elseif (module_exists('image') && file_valid_uri($filepath) && $style = variable_get('user_picture_style', '')) {
        $variables['user_picture'] = theme('image_style', array('style_name' => $style, 'path' => $filepath, 'alt' => $alt, 'title' => $alt));
      }
      else {
        $variables['user_picture'] = theme('image', array('path' => $filepath, 'alt' => $alt, 'title' => $alt));
      }
      if ($account->uid && user_access('access user profiles')) {
        // Create link to the user's profile.
        $attributes = array('title' => t('View user profile.'));
        $variables['user_picture'] = l($variables['user_picture'], 'user/' . $account->uid, array('attributes' => $attributes, 'html' => TRUE));
      }
      elseif (!empty($account->homepage)) {
        // If user is anonymous, create link to the commenter's homepage.
        $attributes = array(
            'title' => t('View user website.'),
            'rel' => 'external nofollow',
        );
        $variables['user_picture'] = l($variables['user_picture'], $account->homepage, array('attributes' => $attributes, 'html' => TRUE));
      }
    }
  }
}
