<?php
// $Id: enabled_modules_handler_field_administer.inc,v 1.1.2.1 2010/04/09 01:18:21 juliangb Exp $
/**
 * @function
 * Field handler to show whether module code is present
 */
class enabled_modules_handler_field_administer extends views_handler_field {
  function access() {
    return user_access('administer site configuration');
  }

  function render($values) {
    if(file_exists($values->{$this->field_alias})) {
      $module = basename($values->{$this->field_alias}, '.module');
      
      // Load admin tasks links
      $admin_tasks = system_get_module_admin_tasks($module);
      
      // Check for help links.
      if (module_invoke($module, 'help', "admin/help#$module", array())) {
        $admin_tasks[100] = l(t('Get help'), "admin/help/$module");
      }
      
      // Only display a section if there are any available tasks.
      if (count($admin_tasks)) {
        // Sort.
        ksort($admin_tasks);
        return theme('item_list', $admin_tasks);
      }
      else {
        // No available tasks
        return '';
      }
    }
    else {
      // Code not present
      return '';
    }
  }
}

