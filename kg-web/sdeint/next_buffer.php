<?php
require("database.php");
$database = new Database();

$table_name = $_GET['trace_name'];
$get_full = $_GET['full'];

$rowvals = array();
if(isset($_GET['trace_name'])){
	//select all the commands that contain ExecuteSpatialQuery (ESQ) and CloseStream
	// ordered by line_num. 
	$esq = $database->fetchOneRow("SELECT command FROM com_{$table_name} WHERE command = 'ExecuteSpatialQuery' LIMIT 1");
	if($esq['command']){
		$result = $database->retrieveNextBufferRowQtyAlt($table_name);
	}
	else {
		echo "<h3 style='color:red'>This trace does not contain ExecuteSpatialQuery commands!</h3>";
		break;
	}
}

//Go through the command results and find commands that start with
// ESQ and end with CloseStream.  Pull out the line numbers
// that surround each NextBuffer command.
foreach($result as $key => $row){
	if($result[$key]['command'] == "ExecuteSpatialQuery"){
		$buff_start = $row['line_num'] + 4;
		continue;
	}
	if($result[$key]['command'] == "CloseStream"){
		$buff_end = $row['line_num'] - 2;
		array_push($rowvals, array($buff_start, $buff_end));
	}	
}
$rowvals = array_unique($rowvals, SORT_REGULAR);
$buff_rows = array();
$nb_row_qty = 0;
$nb_row_total = 0;

// Use each pair of line numbers as a filter to fetch each set of NextBuffers.
function generateNbTable($start, $end){
	global $database, $table_name, $nb_row_total;
	$nb_row_total = array();
	$result = $database->retrieveInfoByFilter($table_name, $start, $end);
	$html .= "<table class='table table-hover' id='intercept-table' style='width:450px;'>";
	$html .= "<thead><tr><th>Line Number</th><th>Time</th><th>Row Qty.</th></tr></thead><tbody>";
	foreach($result as $key => $row){
		if($result[$key]['command'] === "Block:"){			
			$nb_row_qty = trim(substr($result[$key-4]['command'], strpos($row['command'], ":") +6));
			array_push($nb_row_total, $nb_row_qty);
			$html .= "<tr><td>{$row['line_num']}</td><td>{$row['command_time']}</td><td>{$nb_row_qty}</td></tr>";	
		}
	}
	$html .= "</tbody>";
	$html .= "</table>";
	return $html;
}

function generateNbSummary($start, $end){
	global $database, $table_name, $nb_row_total;
	$nb_row_total = array();
	$result = $database->retrieveInfoByFilter($table_name, $start, $end);
	foreach($result as $key => $row){
		if($result[$key]['command'] === "Block:"){
			$nb_row_qty = trim(substr($result[$key-4]['command'], strpos($row['command'], ":") +6));
			array_push($nb_row_total, $nb_row_qty);	
			$cmd_time = $row['command_time'];	
		}
	}
	
	$html .= "<table class='table table-hover' id='intercept-table' style='width:450px;'><thead><tr><th>Start Time</th><th>Command Start</th><th>Command End</th><th>Total Rows</th></tr></thead>";
	$html .= "<tbody>";
	$html .= "<tr><td>{$cmd_time}</td><td>{$start}</td><td>{$end}</td><td>" . number_format(array_sum($nb_row_total)) . "</td></tr>";
	$html .= "</tbody></table>";
	echo $html;
}

echo "<h3>Next Buffer Row Count Summary</h3>";
echo "<button id='next-buffer-full'>Click to See All NextBuffer Commands</button>";
echo "<p></p>";

if(!isset($get_full)){
	foreach($rowvals as $key => $row){
		echo generateNbSummary($row[0], $row[1]);
	}
}
else {
	foreach($rowvals as $key => $row){
		echo generateNbTable($row[0], $row[1]);
	}
}


