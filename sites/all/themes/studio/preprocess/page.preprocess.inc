<?php

/**
 * Implements hook_preprocess_page().
 */
function studio_preprocess_page(&$vars) {
  // Customize the user login/register/password page titles
  if (arg(0) == 'user' && arg(1) == 'register') {
    drupal_set_title(t('Account registration'));
  } elseif (arg(0) == 'user' && arg(1) == 'password') {
    drupal_set_title(t('Reset password'));
  } elseif (arg(0) == 'user' && arg(1) == 'login') {
    drupal_set_title(t('Account login'));
  } elseif (arg(0) == 'user' && arg(1) == '' && user_is_anonymous()) {
    $vars['title'] = t('User login');
  }
}
