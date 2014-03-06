<?php
// $Id: block.tpl.php,v 1.2 2009/03/17 05:04:14 andregriffin Exp $
?>
<div id="block-<?php print $block->module .'-'. $block->delta; ?>" class="block block-<?php print $block->module ?>">

  <?php if (!empty($block->subject)): ?>
    <h3><?php print $block->subject ?></h3>
  <?php endif;?>

  <div class="content">
    <?php print $block->content ?>
  </div>

</div>
