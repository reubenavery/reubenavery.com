<?php
// $Id: enabled_modules_handler_field_code.inc,v 1.1.2.1 2010/04/08 22:33:11 juliangb Exp $
/**
 * @function
 * Field handler to show whether module code is present
 */
class enabled_modules_handler_field_code extends views_handler_field {
  function render($values) {
    if(file_exists($values->{$this->field_alias})) {
      return 'present';
    } else {
      return 'missing';
    }
  }
}

