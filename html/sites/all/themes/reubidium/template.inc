<?php
// $Id$

/**
 * Returns the rendered local tasks. The default implementation renders them as tabs.
 */
function phptemplate_menu_local_tasks() {
  $output = '';

  if ($primary = menu_primary_local_tasks()) {
    $output .= "<ul class=\"tabs primary clear-block\">\n". $primary ."</ul>\n";
  }
  if ($secondary = menu_secondary_local_tasks()) {
    $output .= "<ul class=\"tabs secondary clear-block\">\n". $secondary ."</ul>\n";
  }

  return $output;
}


/**
 * Generate the HTML output for a single local task link.
 */
function phptemplate_menu_item_link($link) {
  if (empty($link['localized_options'])) {
    $link['localized_options'] = array();
  }

  if ($tab = ($link['type'] & MENU_IS_LOCAL_TASK)) {
    $link['title'] = '<span class="tab">'. check_plain($link['title']) .'</span>';
    $link['localized_options']['html'] = TRUE;
  }

  return l($link['title'], $link['href'], $link['localized_options']);
}


/**
 * Theme the loggedinblock that shows for logged-in users.
 */
function phptemplate_lt_loggedinblock(){
  global $user;
  return l( check_plain($user->name), 'user') .' | ' . l(t('logout'), 'logout');
}


/**
 * Custom theme function for the login/register link.
 */
function phptemplate_lt_login_link() {
  // Only display register text if registration is allowed.
  if (variable_get('user_register', 1)) {
    return t('Login/Register');
  }
  else {
    return t('Login');
  }
}

