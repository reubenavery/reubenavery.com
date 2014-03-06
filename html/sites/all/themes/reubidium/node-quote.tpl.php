<div id="node-<?php print $node->nid; ?>" class="node<?php if ($sticky) { print " sticky"; } ?><?php if (!$status) { print " node-unpublished"; } ?> node-quote">
  <div class="clearfix">
    <div class="content">
      <blockquote>
        <div class="quote"><?php print str_replace("\n", '<br/>', $node->field_quotation[0]['value']); ?></div>
        <div class="attribution"><?php print $node->field_attribution[0]['value']; ?></div>
        <?php if(user_access('edit quote content')): ?>
          <div class="links"><?php print l('edit', 'node/'.$node->nid.'/edit'); ?></div>
        <?php endif; ?>
      </blockquote>
    </div>
  </div>
</div>
