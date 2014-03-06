<?php
// $Id: page.tpl.php,v 3.0.6.9 2008/06/21 00:00:00 hass Exp $
?><?php print $xml_prolog ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php print $language->language ?>" lang="<?php print $language->language ?>">

<head>
  <title><?php print $head_title ?></title>
  <?php print $head ?>
  <?php print $styles ?>
  <script type="text/javascript">
    var sifrFontUnivers72Black = { src: '<?php print base_path().path_to_theme() ?>/sifr3/flash/Univers75Black.swf' };
    var sifrFontHelveticaNeue = { src: '<?php print base_path().path_to_theme() ?>/sifr3/flash/HelveticaNeue.swf' };
  </script>
  <?php print $scripts ?>
</head>

<body class="<?php print $body_classes; ?>">
<?php print $fontsize_init ?>

<div id="page_margins">
  <?php print $border_top ?>
  <div id="page">

    <div id="header" class="clearfix">
      <div id="topnav">
        <a class="skip" href="#navigation" title="<?php print t('Skip to the navigation') ?>"><?php print t('Skip to the navigation') ?></a><span class="hideme">.</span>
        <a class="skip" href="#content" title="<?php print t('Skip to the content') ?>"><?php print t('Skip to the content') ?></a><span class="hideme">.</span>
          <?php if (isset($secondary_links)) : ?>
            <div id="secondary-links"><?php print theme('links', $secondary_links, array('class' => 'links secondary-links')) ?></div>
          <?php endif; ?>
      </div>
      <?php if ($header) { ?><div class="blocks"><?php print $header ?></div><?php } ?>
      <?php if ($logo) { ?><a href="<?php print $base_path ?>" title="<?php print t('Home') ?>"><img id="site-logo" class="_trans" src="<?php print $logo ?>" alt="<?php print t('Home') ?>" /></a><?php } ?>
      <?php if ($site_name) { ?><h1 id="site-name"><a href="<?php print $base_path ?>" title="<?php print t('Home') ?>"><span><?php print $site_name ?></span></a></h1><?php } ?>
      <?php if ($site_slogan) { ?><h3 id="site-slogan"><?php print $site_slogan ?></h3><?php } ?>
      <?php print $search_box ?>
    </div>

    <!-- begin: main navigation #nav -->
    <div id="nav"> <a id="navigation" name="navigation"></a> <!-- skip anchor: navigation -->
      <?php if (isset($primary_links)) : ?>
      <div id="nav_main">
        <?php print theme('links', $primary_links, array('class' => 'links primary-links')) ?>
      </div>
      <?php endif; ?>
    </div>
    <?php if ($breadcrumb || $fontsize_links): ?>
    <div id="nav-bar" class="clearfix">
      <?php print $breadcrumb ?>
      <?php print $fontsize_links ?>
    </div>
    <?php endif; ?>
    <!-- end: main navigation -->

    <!-- begin: main content area #main -->
    <div id="main">

      <?php if ($mission) { ?>
      <!-- #mission: between main navigation and content -->
      <div id="mission" class="clearfix">
        <?php print $mission ?>
      </div>
      <?php } ?>

      <?php if ($left): ?>
      <!-- begin: #col1 - first float column -->
      <div id="col1">
        <div id="col1_content" class="clearfix">
          <div id="col1_inside" class="floatbox">
            <?php print $left ?>
          </div>
        </div>
      </div>
      <!-- end: #col1 -->
      <?php endif; ?>

      <?php if ($right): ?>
      <!-- begin: #col2 second float column -->
      <div id="col2">
        <div id="col2_content" class="clearfix">
          <div id="col2_inside" class="floatbox">
            <?php print $right ?>
          </div>
        </div>
      </div>
      <!-- end: #col2 -->
      <?php endif; ?>

      <!-- begin: #col3 static column -->
      <div id="col3">
        <div id="col3_content" class="clearfix"> <a id="content" name="content"></a> <!-- skip anchor: content -->
          <div id="col3_inside" class="floatbox">
            <?php if ($title) { ?><h2 class="title"><?php print $title ?></h2><?php } ?>
            <?php if ($tabs) { ?><div class="tabs"><?php print $tabs ?></div><?php } ?>
            <?php print $help ?>
            <?php print $messages ?>
            <?php print $content ?>

            <?php if ($feed_icons): ?>
              <div class="feed-icons"><?php print $feed_icons; ?></div>
            <?php endif; ?>
          </div>
        </div>
        <div id="ie_clearing">&nbsp;</div>
        <!-- end: IE Column Clearing -->
      </div>
      <!-- end: #col3 -->

    </div>
    <!-- end: #main -->

    <!-- begin: #footer -->
    <div id="footer">
      <div class="clearfix">
        <?php print $footer ?>
        <?php print $footer_message ?>
      </div>
    </div>
    <!-- end: #footer -->

  </div>
  <?php print $border_bottom ?>
</div>
<?php print $closure ?>
</body>
</html>
