<?php
/**
 * @file
 * Default Freshlogin module template
 * @ingroup freshlogin
 */
?>
<!DOCTYPE html>
<html lang="en-us" dir="ltr">
<head>
  <?php print $page['head']; ?>
  <title><?php print $page['title']; ?></title>
  <?php print $page['scripts']; ?>
  <?php print $page['favicon']; ?>
  <?php print $page['css']; ?>
</head>
<body id="freshlogin">
  <section id="container">
    <section id="form-header">
      <div class="site-information">
        <div class="site-name">
          <h2><?php print $page['site_name']; ?></h2>
        </div>
        <div class="header-message">
          <?php print $page['header_message']; ?>
        </div>
      </div>
      <?php if ($page['site_secure']) : ?>
      <div class="site-secure">
        <p>SSL message would go here</p>
      </div>
      <?php endif; ?>
    </section>
    <div class="clear"></div>
    <section id="login-form">
      <div id="site-logo">
        logo
      </div>

      <div id="page-form">
        <?php print $page['message']; ?>
        <?php print $page['form']; ?>
      </div>
    </section>
    <footer>
      <p>Small credit/help link</p>
    </footer>
  </section>
</body>
</html>
