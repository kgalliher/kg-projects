<?php
$myfile = fopen("newfile.txt", "w") or die("Unable to open file!");

$lines = file("C:\Users\ken6574\Documents\My Received Files\brent_pro_modify_hang.txt");
array_pop($lines[0]);
$lines[0] = "========================================";
foreach ($lines as $line_num => $line) {
	echo $line_num . ": " . $line . "<br />";
}


echo "<pre>";
print_r($lines);
echo "</pre>";

?>
