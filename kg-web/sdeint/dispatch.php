<?php
require("Database.php");
$database = new Database();

$table_name = $_GET['trace_name'];


if(isset($_GET['start']) && isset($_GET['end'])){
    $start = $_GET['start'];
	$end = $_GET['end'];
    $commands = $database->retrieveCommandsByFilter($table_name, $start, $end);
	$title = "Commands ~ From Line {$start} To {$end}";
}
elseif(isset($_GET['line_num'])){
	$linenum = htmlentities($_GET['line_num']);
	$title_check = htmlentities($_GET['title']);
	$commands = $database->retrieveSingleCommand($table_name, $linenum);
	if($title_check == "return_code"){
		$title = "Return Code at Line {$linenum}";
	}
	else {
		$title = "Long duration Found at line {$linenum}";
	}
}
else {
    $commands = $database->retrieveCommands($table_name);
	$title = "Full SDE Intercept";
}

if(isset($_GET['delete'])){
	$trace_name = htmlentities($_GET['trace_name']);
	$id = htmlentities($_GET['id']);
	$database->deleteTraces($trace_name, $id);
}

function returnTraceTable($table_name, $database, $commands){
	global $title;
	$html = "<h3>$title</h3>";
    $html .=  "<table class='table table-bordered' id='intercept-table' style='width:450px;'>";
	$html .= "<thead><tr><th>Line</th><th>Time</th><th>Command</th></tr></thead>";
	$html .= "<tbody>";
    for($i = 0; $i < count($commands); $i++){
		$info = $database->retrieveInfo($table_name, $commands[$i]['line_id']);
        $html .=  "<tr class='active'><td>" . $commands[$i]['line_num'] . "</td><td>" . $commands[$i]['stamp'] . "</td><td> " . trim($commands[$i]['command']) . "</td></tr>";

        for($j = 0; $j < count($info); $j++){
           if($info[$j]['stamp'] != "00:00:00.00"){
               $inf_stamp = $info[$j]['stamp'];
           }
           else {
               $inf_stamp = "";
			}
			//if(strstr($info[$j]['command'], "Long:         -") &&  !strstr($info[$j]['command'], "Long:         -1")){
			if(strstr($info[$j]['command'], "Long:         -") &&  strlen($info[$j]['command']) > 16){
				$html .=  "<tr class='danger'><td>" . $info[$j]['line_num'] . "</td><td>" . $inf_stamp . "</td><td> " . trim($info[$j]['command']) . "</td></tr>";
			}
			else {
				$html .=  "<tr><td>" . $info[$j]['line_num'] . "</td><td>" . $inf_stamp . "</td><td> " . trim($info[$j]['command']) . "</td></tr>";
			}
            
        }
        
    }
	$html .=  "</tbody></table>";
    return $html;
}

echo returnTraceTable($table_name, $database, $commands);