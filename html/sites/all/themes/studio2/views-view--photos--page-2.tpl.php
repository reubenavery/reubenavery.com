<?php
// $Id: views-view.tpl.php,v 1.13.2.2 2010/03/25 20:25:28 merlinofchaos Exp $
/**
 * @file views-view.tpl.php
 * Main view template
 *
 * Variables available:
 * - $classes_array: An array of classes determined in
 *   template_preprocess_views_view(). Default classes are:
 *     .view
 *     .view-[css_name]
 *     .view-id-[view_name]
 *     .view-display-id-[display_name]
 *     .view-dom-id-[dom_id]
 * - $classes: A string version of $classes_array for use in the class attribute
 * - $css_name: A css-safe version of the view name.
 * - $css_class: The user-specified classes names, if any
 * - $header: The view header
 * - $footer: The view footer
 * - $rows: The results of the view query, if any
 * - $empty: The empty text to display if the view is empty
 * - $pager: The pager next/prev links to display, if any
 * - $exposed: Exposed widget form/info to display
 * - $feed_icon: Feed icon to display, if any
 * - $more: A link to view more, if any
 * - $admin_links: A rendered list of administrative links
 * - $admin_links_raw: A list of administrative links suitable for theme('links')
 *
 * @ingroup views_templates
 */

drupal_add_js(path_to_theme().'/js/jquery.localscroll-1.2.7-min.js');
drupal_add_js(path_to_theme().'/js/jquery.scrollTo-1.4.2-min.js');
$js = "
$(document).ready(function () {
$.localScroll.defaults.axis = 'x';
$.localScroll();
});
";
drupal_add_js($js, 'inline');

$buttons = "<ul>\n";
$counter = 0;
foreach ($view->result as $r) {
  $counter++;
  $buttons .= '<li><a href="#'. drupal_get_path_alias('node/'.$r->nid) .'">'. $counter ."</a></li>\n";
}
$buttons .= "</ul>\n";
?>
<div id="photos_scroller">
  <?php print $rows; ?>
  <div id="buttons">
    <?php print $buttons; ?>
  </div>
</div>

