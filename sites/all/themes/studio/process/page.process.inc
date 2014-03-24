<?php

/**
 * Implements hook_process_page().
 */
function studio_process_page(&$vars) {
  if ($vars['is_front']) {
    unset($vars['title']);
  }

  // Customize the user login/register/password page titles
  if (arg(0) == 'user' && arg(1) == 'register') {
    $vars['title'] = t('Create a new account');
  } elseif (arg(0) == 'user' && arg(1) == 'password') {
    $vars['title'] = t('Retrieve lost password');
  } elseif (arg(0) == 'user' && arg(1) == 'login') {
    $vars['title'] = t('User login');
  } elseif (arg(0) == 'user' && arg(1) == '' && user_is_anonymous()) {
    $vars['title'] = t('User login');
  }
}
