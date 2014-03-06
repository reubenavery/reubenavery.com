<?php
// $Id: block.tpl.php,v 3.2.1.13 2010/05/14 00:00:00 hass Exp $
?>
<div id="block-<?php print $block->module .'-'. $block->delta; ?>" class="clearfix block block-<?php print $block->module ?>">
  <?php if ($block->subject): ?><h3><?php print $block->subject ?></h3><?php endif;?>
  <div class="content"><?php print $block->content ?></div>
</div>
