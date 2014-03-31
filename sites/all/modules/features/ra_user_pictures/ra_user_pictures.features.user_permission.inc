<?php
/**
 * @file
 * ra_user_pictures.features.user_permission.inc
 */

/**
 * Implements hook_user_default_permissions().
 */
function ra_user_pictures_user_default_permissions() {
  $permissions = array();

  // Exported permission: 'administer gravatar'.
  $permissions['administer gravatar'] = array(
    'name' => 'administer gravatar',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'gravatar',
  );

  // Exported permission: 'disable own gravatar'.
  $permissions['disable own gravatar'] = array(
    'name' => 'disable own gravatar',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'gravatar',
  );

  // Exported permission: 'use gravatar'.
  $permissions['use gravatar'] = array(
    'name' => 'use gravatar',
    'roles' => array(
      'authenticated user' => 'authenticated user',
      'untrusted user' => 'untrusted user',
    ),
    'module' => 'gravatar',
  );

  return $permissions;
}
