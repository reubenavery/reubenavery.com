<?php
// $Id: search-theme-form.tpl.php,v 3.2.1.13 2010/05/14 00:00:00 hass Exp $
?>
<div id="search" class="container-inline">
  <?php
  $search['search_theme_form'] = preg_replace('/<label(.*)>(.*)<\/label>\n/i', '', $search['search_theme_form']);
  print $search['search_theme_form'];
  print $search['submit'];
  print $search['hidden'];
  ?>
</div>
