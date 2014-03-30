<?php

function studio_preprocess_node(&$vars) {
  $node = $vars['elements']['#node'];

  $vars['created_date'] = format_date($node->created, 'long');
  $vars['updated_date'] = format_date($node->changed, 'long');

  // Display post information only on certain node types.
  if (variable_get('node_submitted_' . $node->type, TRUE)) {
    $vars['display_submitted'] = TRUE;
    $vars['submitted'] = t('Submitted by !username on !datetime', array('!username' => $vars['name'], '!datetime' => $vars['created_date']));
    if ($node->changed > $node->created) {
      $vars['updated'] = t('Updated !datetime', array('!datetime' => $vars['updated_date']));
    }
    else {
      $vars['updated'] = '';
    }
    $vars['user_picture'] = theme_get_setting('toggle_node_user_picture') ? theme('user_picture', array('account' => $node, 'user_picture_style' => 'user_icon')) : '';
  }
  else {
    $vars['display_submitted'] = FALSE;
    $vars['submitted'] = '';
    $vars['updated'] = '';
    $vars['user_picture'] = '';
  }
}
