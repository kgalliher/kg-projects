<?php
require("Database.php");
$database = new Database();

if(isset($_GET['delete'])){
	$trace_name = htmlentities($_GET['trace_name']);
	$id = htmlentities($_GET['id']);
	$database->deleteTraces($trace_name, $id);
	echo "deleted " . $trace_name;
}

?>

