<?php
/**
 * @file
 * ra_staff_profiles.features.user_permission.inc
 */

/**
 * Implements hook_user_default_permissions().
 */
function ra_staff_profiles_user_default_permissions() {
  $permissions = array();

  // Exported permission: 'edit any staff profile'.
  $permissions['edit any staff profile'] = array(
    'name' => 'edit any staff profile',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'profile2',
  );

  // Exported permission: 'edit own staff profile'.
  $permissions['edit own staff profile'] = array(
    'name' => 'edit own staff profile',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'profile2',
  );

  // Exported permission: 'show format selection for profile2'.
  $permissions['show format selection for profile2'] = array(
    'name' => 'show format selection for profile2',
    'roles' => array(
      'administrator' => 'administrator',
    ),
    'module' => 'better_formats',
  );

  // Exported permission: 'view any staff profile'.
  $permissions['view any staff profile'] = array(
    'name' => 'view any staff profile',
    'roles' => array(
      'anonymous user' => 'anonymous user',
      'authenticated user' => 'authenticated user',
      'untrusted user' => 'untrusted user',
    ),
    'module' => 'profile2',
  );

  // Exported permission: 'view own staff profile'.
  $permissions['view own staff profile'] = array(
    'name' => 'view own staff profile',
    'roles' => array(
      'authenticated user' => 'authenticated user',
      'untrusted user' => 'untrusted user',
    ),
    'module' => 'profile2',
  );

  return $permissions;
}
