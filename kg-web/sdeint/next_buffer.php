<?php
require("database.php");
$database = new Database();
$table_name = $_GET['trace_name'];
$rowvals = array();

if(isset($_GET['trace_name'])){
	//select all the commands that contain ExecuteSpatialQuery (ESQ) and CloseStream
	// ordered by line_num. 
	$result = $database->retrieveNextBufferRowQty($table_name);
}

//Go through the command results and find commands that start with
// ESQ and end with CloseStream.  Pull out the line numbers
// that surround each NextBuffer command.
foreach($result as $key => $row){
	if($result[$key]['command'] == "ExecuteSpatialQuery"){
		$buff_start = $row['line_num'];
		continue;
	}
	if($result[$key]['command'] == "CloseStream"){
		$buff_end = $row['line_num'];
	}
	
	array_push($rowvals, array($buff_start +1, $buff_end -1));
}

$buff_rows = array();
$nb_row_qty = 0;
$nb_command_count = count($rowvals);
$nb_row_total = 0;

// Use each pair of line numbers as a filter to fetch each set of NextBuffers. 
foreach($rowvals as $key => $row){
	$result = $database->retrieveInfoByFilter($table_name, $row[0], $row[1]);
	$nb_row_qty = trim(substr($result[5]['command'], strpos($row['command'], ":") +6));
	$nb_row_total += $nb_row_qty;
	array_push($buff_rows, array($result[0]['line_num']-1, $result[0]['command_time'], $nb_row_qty));
}

$html = "<table class='table table-hover' id='intercept-table' style='width:450px;'><thead><tr><th>Total NextBuffer Commands</th><th>Total Rows Processed</th></tr></thead><tbody>";
$html .= "<tr><td>" . number_format($nb_command_count) . "</td><td>" . number_format($nb_row_total) . "</td></tr></tbody></table>";
$html .= "<table class='table table-hover table-striped' id='intercept-table' style='width:450px;'>";
$html .= "<thead><tr><th>Line Number</th><th>Time</th><th>Row Qty.</th></tr></thead><tbody>";
	foreach($buff_rows as $key => $row){
		$html .= "<tr><td>{$row[0]}</td><td>{$row[1]}</td><td>{$row[2]}</td></tr>";
	}
$html .= "</tbody>";
$html .= "</table>";

echo $html;