<?php

/**
 * Implements hook_preprocess_page().
 */
function studio_preprocess_field(&$vars) {
  if ($vars['element']['#field_name'] == 'field_author_name') {
//    dpm($vars);
  }
}
