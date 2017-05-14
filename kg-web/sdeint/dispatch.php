<?php
require("Database.php");
$database = new Database();
$table_name = $_GET['trace_name'];

if(isset($_GET['start']) && isset($_GET['end']) && !isset($_GET['long_query'])){
    $start = $_GET['start'];
	$end = $_GET['end'];
	//echo $start . " " . $end . "<br />";
	if($start <= 16){
		$start += 16;
		$end += $start;
	}
    $commands = $database->retrieveCommandsByFilter($table_name, $start, $end);
	$title = "Commands ~ From Line {$start} To {$end}";
}
elseif(isset($_GET['long_query'])){
	$start = $_GET['start'];
	$end = $_GET['end'];
	$commands = $database->retrieveCommandsByFilter($table_name, $start, $end);
	$title = "Long duration Found at line {$linenum}";
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

function returnTraceTable($table_name, $database, $commands){
	global $title;
	$html = "<h3>$title</h3>";
    $html .=  "<table class='table table-hover' id='intercept-table' style='width:450px;'>";
	$html .= "<thead><tr><th>Line</th><th class='col-xs-3'>Time</th><th>Command</th></tr></thead>";
	$html .= "<tbody>";
    for($i = 0; $i < count($commands); $i++){
		$info = $database->retrieveInfo($table_name, $commands[$i]['line_id']);
        $html .=  "<tr class='active'><td>" . $commands[$i]['line_num'] . "</td><td>" . $commands[$i]['command_time'] . "</td><td> " . trim($commands[$i]['command']) . "</td></tr>";
        for($j = 0; $j < count($info); $j++){
           if($info[$j]['stamp'] != "00:00:00.00"){
               $inf_stamp = $info[$j]['stamp'];
           }
           else {
               $inf_stamp = "";
			}
			if(strstr($info[$j]['command'], "Long:         -") &&  strlen($info[$j]['command']) > 16){
				$html .=  "<tr class='danger'><td>" . $info[$j]['line_num'] . "</td><td>" . trim($info[$j]['command_time']) . "</td><td> " . trim($info[$j]['command']) . "</td></tr>";
			}
			if(!empty($info[$j]['command_time'])){
				$html .=  "<tr class='warning'><td>" . $info[$j]['line_num'] . "</td><td>" . trim($info[$j]['command_time']) . "</td><td> " . trim($info[$j]['command']) . "</td></tr>";
			}
			else {
				$html .=  "<tr><td>" . $info[$j]['line_num'] . "</td><td class='command' colspan='2'>" . $info[$j]['command'] . "</td></tr>";
			}
            
        }
        
    }
	$html .=  "</tbody></table>";
    return $html;
}
echo returnTraceTable($table_name, $database, $commands);