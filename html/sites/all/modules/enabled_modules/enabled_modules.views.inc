<?php
// $Id: enabled_modules.views.inc,v 1.1.2.3 2010/04/09 01:18:21 juliangb Exp $

function enabled_modules_views_data() {
  return array(
    'system' => array(
      'table' => array(
        'group' => t('System'),
        'base' => array(
          'field' => 'filename',
          'title' => t('System'),
          'help' => t('Information about modules, themes and theme engines.'),
        ),
      ),
      'filename' => array(
        'title' => t('Filename'),
        'help' => t('Location of the module/theme.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',          
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'name' => array(
        'title' => t('Name'),
        'help' => t('Machine name of the module/theme'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'type' => array(
        'title' => t('Type'),
        'help' => t('Module / theme / theme engine'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'owner' => array(
        'title' => t('Owner'),
        'help' => t('The parent component (for themes)'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'status' => array(
        'title' => t('Status'),
        'help' => t('Whether the module / theme is enabled'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field_boolean',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_boolean_operator',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'throttle' => array(
        'title' => t('Throttle'),
        'help' => t('Whether the module has been selected for throttling'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field_boolean',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_boolean_operator',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'bootstrap' => array(
        'title' => t('Bootstrap'),
        'help' => t('Whether the module runs at an early stage of Drupal bootstrapping.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'schema_version' => array(
        'title' => t('Schema Version'),
        'help' => t('Version of database schema, used to determine when a database update is required.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'weight' => array(
        'title' => t('Weight'),
        'help' => t("The priority that Drupal gives to this module (modules only)."),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field_numeric',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_numeric',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      //deliberately not including the "info" field, as the contents of that field are available unserialized in the {enabled_modules_system} table.
    ), //end table
    'enabled_modules_system' => array(
      'table' => array(
        'group' => t('System'),
        'join' => array(
          'system' => array(
            'left_field' => 'filename',
            'field' => 'filename',
          ),
        ),
      ),
      'name' => array(
        'title' => t('Name'),
        'help' => t('Human name of the module/theme'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'description' => array(
        'title' => t('Description'),
        'help' => t('Description of the module/theme'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'package' => array(
        'title' => t('Package'),
        'help' => t('Category that the module falls into for the modules page.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'version' => array(
        'title' => t('Version'),
        'help' => t('Version of the module/theme'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'core' => array(
        'title' => t('Core'),
        'help' => t('The compatible core version for the module / theme.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'project' => array(
        'title' => t('Project'),
        'help' => t('The project that the module / theme belongs to.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'datestamp' => array(
        'title' => t('Datestamp'),
        'help' => t('The date and time that the project was released.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field_date',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'dependencies' => array(
        'title' => t('Dependencies'),
        'help' => t('A serialized array containing dependencies of the module. A specific handler should be written for this field to use it properly.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      'dependents' => array(
        'title' => t('Dependents'),
        'help' => t('A serialized array containing dependents of the module. A specific handler should be written for this field to use it properly.'),
        'field' => array(
          'click sortable' => TRUE,
          'handler' => 'views_handler_field',
        ),
        'filter' => array(
          'handler' => 'views_handler_filter_string',
        ),
        'sort' => array(
          'handler' => 'views_handler_sort',
        ),
      ),
      // PSEUDO FIELDS
      'code' => array(
        'title' => t('Code'),
        'help' => t('Whether or not the code is present or not.'),
        'real field' => 'filename',
        'field' => array(
          'handler' => 'enabled_modules_handler_field_code',
        ),
      ),
      'administer' => array(
        'title' => t('Administer'),
        'help' => t('Administration links for the module.'),
        'real field' => 'filename',
        'field' => array(
          'handler' => 'enabled_modules_handler_field_administer',
        ),
      ),
    ), //end table
  );
}

/**
 * @function
 * Implementation of hook_views_handlers
 */
function enabled_modules_views_handlers() {
  return array(
    'info' => array(
      'path' => drupal_get_path('module', 'enabled_modules'),
    ),
    'handlers' => array(
      'enabled_modules_handler_field_code' => array(
        'parent' => 'views_handler_field',
      ),
      'enabled_modules_handler_field_administer' => array(
        'parent' => 'views_handler_field',
      ),
    ),
  );
}

