<?php

/**
 * Implements hook_process_page().
 */
function studio_process_page(&$vars) {
  if ($vars['is_front']) {
    unset($vars['title']);
  }
}
