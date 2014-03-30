<?php
/**
 * @file
 * ra_cron.strongarm.inc
 */

/**
 * Implements hook_strongarm().
 */
function ra_cron_strongarm() {
  $export = array();

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'elysia_cron_alert_interval';
  $strongarm->value = '60';
  $export['elysia_cron_alert_interval'] = $strongarm;

  $strongarm = new stdClass();
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'elysia_cron_default_rules';
  $strongarm->value = array(
    '*/15 * * * *' => 'Every 15 minutes',
    '*/30 * * * *' => 'Every 30 minutes',
    '0 * * * *' => 'Every hour',
    '0 */6 * * *' => 'Every 6 hours',
    '4 0 * * *' => 'Once a day',
    '4 0 * * 0' => 'Once a week',
    '4 0 1 * *' => 'Once a month',
  );
  $export['elysia_cron_default_rules'] = $strongarm;

  return $export;
}
