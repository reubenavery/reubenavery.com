<?php
// $Id: node.tpl.php,v 3.0.6.9 2008/06/21 00:00:00 hass Exp $
?>
<div id="node-<?php print $node->nid; ?>" class="node<?php if ($sticky) { print " sticky"; } ?><?php if (!$status) { print " node-unpublished"; } ?> node-<?php print $node->type; ?>">
  <div class="clearfix">
  <?php /* page var presence indicates this is not just a single node view */
  if ($page == 0): ?>
    <h3 class="title"><a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a></h3>
    <?php print $picture ?>
    <?php if ($submitted): ?>
      <div class="submitted submitted-top"><?php print $submitted ?></div>
    <?php endif; ?>
    <div class="content"><?php print $content ?></div>
  <?php else: ?>
    <div class="content"><?php print $content ?></div>
    <?php if ($submitted): ?>
      <div class="submitted submitted-bottom"><?php print $submitted ?></div>
    <?php endif; ?>
  <?php endif; ?>

  </div>
  <?php if($links || $terms): ?>
  <div class="links-taxonomy clearfix">
    <?php if ($links) { ?><?php print $links; ?><?php } ?>
    <?php if ($terms) { ?><div class="terms">in <?php print $terms ?></div><?php } ?>
  </div>
  <?php endif; ?>
</div>
