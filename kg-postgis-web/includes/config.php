<?php
//require_once("database.php");
defined('DB_SERVER') ? null : define("DB_SERVER", "localhost");
defined('DB_USER')   ? null : define("DB_USER", "billybob");
defined('DB_PASS')   ? null : define("DB_PASS", "billybob");
defined('DB_NAME')   ? null : define("DB_NAME", "sdkwam");
defined('DB_PORT')   ? null : define("DB_PORT", "5432");


function redirect_to( $location = NULL ) {
  if ($location != NULL) {
    header("Location: {$location}");
    exit;
  }
}

?>