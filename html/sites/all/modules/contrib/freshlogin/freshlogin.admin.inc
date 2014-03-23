<?php

/**
 * Admin settings for Freshlogin.
 * @param $form
 * @param $form_state
 * @return mixed
 */
function freshlogin_admin_settings_form($form, &$form_state) {
  $form['freshlogin_user_login_header'] = array(
    '#type' => 'textfield',
    '#title' => 'User login form header',
    '#description' => 'Short message that appears under the site name on the user login form.',
    '#maxlength' => 120,
    '#default_value' => variable_get('freshlogin_user_login_header', 'Log in to your account below.'),
  );

  $form['freshlogin_user_register_header'] = array(
    '#type' => 'textfield',
    '#title' => 'User registration form header',
    '#description' => 'Short message that appears under the site name on the user register form.',
    '#maxlength' => 120,
    '#default_value' => variable_get('freshlogin_user_register_header', 'Register an account!'),
  );

  $form['freshlogin_user_password_header'] = array(
    '#type' => 'textfield',
    '#title' => 'User forgot password form header',
    '#description' => 'Short message that appears under the site name on the user password form.',
    '#maxlength' => 120,
    '#default_value' => variable_get('freshlogin_user_password_header', 'Request new password.'),
  );

  return system_settings_form($form);
}