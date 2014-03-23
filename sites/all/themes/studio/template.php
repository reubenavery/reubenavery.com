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
