<?php

/**
 * @file
 * Template overrides as well as (pre-)process and alter hooks for the
 * Studio theme.
 */

function studio_wysiwyg_editor_settings_alter(&$settings, $context) {
  if ($context['editor']['name'] == 'epiceditor') {
    $settings['theme'] = 'epic-light';
    $settings['autogrow'] = (Object) Array(
      'minHeight' => 300
    );
  }
}

/**
 * Implements hook_theme_status_messages().
 */
function studio_status_messages($variables) {
  $counter = &drupal_static(__FUNCTION__, 0);

  $display = $variables['display'];
  $output = '';

  $status_heading = array(
    'status' => t('Status message'),
    'error' => t('Error message'),
    'warning' => t('Warning message'),
  );
  foreach (drupal_get_messages($display) as $type => $messages) {
    $counter++;
    $extra_class = ($counter === 1) ? ' first' : '';

    $output .= '<div class="messages messages--' . $type . $extra_class . '"><div class="inner">';
    if (!empty($status_heading[$type])) {
      $output .= '<h2 class="element-invisible">' . $status_heading[$type] . "</h2>";
    }
    if (count($messages) > 1) {
      $output .= '<ul>';
      foreach ($messages as $message) {
        $output .= '  <li>' . $message . '</li>';
      }
      $output .= '</ul>';
    }
    else {
      $output .= $messages[0];
    }
    $output .= '</div></div>';
  }

  return $output;
}
