<?php
/**
 * @file
 * ra_livereload.features.user_permission.inc
 */

/**
 * Implements hook_user_default_permissions().
 */
function ra_livereload_user_default_permissions() {
  $permissions = array();

  // Exported permission: 'use livereload'.
  $permissions['use livereload'] = array(
    'name' => 'use livereload',
    'roles' => array(
      'administrator' => 'administrator',
      'anonymous user' => 'anonymous user',
      'authenticated user' => 'authenticated user',
      'untrusted user' => 'untrusted user',
    ),
    'module' => 'livereload',
  );

  return $permissions;
}
