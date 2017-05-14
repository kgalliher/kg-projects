<?php
//error_reporting(0);
require("Database.php");
date_default_timezone_set("America/Los_Angeles");
ini_set('memory_limit', '1024M');
register_shutdown_function("shutdown");
function shutdown($message = "") 
 { 
     $a=error_get_last(); 
     if($a==null){   
         echo "No errors"; 
     }
     else {
        $filename = basename($a['file']);
        echo "oops...<br />";
        $body =  "Error: " . $a['message'];
        $body .=  " in file " . $filename . " on line " . $a['line'];
        $body = htmlentities($body);
        echo "An error occurred causing the upload to fail.<br />";
        echo "Error: " . $a['message'] . "<br />";
        echo " in file " . $filename . " on line " . $a['line']  . "<br />";
        echo "Please <a href='mailto:natas333x2@gmail.com?Subject=SDE%20Fatal%20error&Body={$body}'>
            send this error message here</a>";
     }
 } 

$database = new Database();
$date = new DateTime(null, new DateTimeZone('America/Los_Angeles'));
$timestamp = $date->format("Y-m-d h:i:s");
//echo "timestamp: " . $timestamp;
$empno = htmlentities($_POST['empno']);
$incno = htmlentities($_POST['incno']);
$trcno = htmlentities($_POST['trcno']);
$file = htmlentities($_FILES['filename']['name']);
$tmpname = $_FILES['filename']['tmp_name'];
$desctiption = htmlentities($_POST['description']);

if(!isset($empno) || !isset($trcno) || !isset($trcno)){
    
    shutdown();
}
else {
    $table_name = "intercept_" . $empno . "_" . $incno . "_" . $trcno;
}

$params = array();
array_push($params, $empno, $incno, $trcno, $table_name, $file, $timestamp, $desctiption);
//$file = "C:\Temp\ci_25.001";
//$file = "C:/Temp/client_intercept.045";
$lines = file($tmpname);
//echo "created file";
//create the file info table but drop if it exists.
$top_table_name = "top_" . $table_name;
$com_table_name = "com_" . $table_name;
$inf_table_name = "inf_" . $table_name;
$database->dropTable($top_table_name);
$database->dropTable($com_table_name);
$database->dropTable($inf_table_name);
$database->createTopTable($top_table_name);
$database->createComTable($com_table_name);
$database->createInfTable($inf_table_name);
$com_sql = array();
$inf_sql = array();
$cmd_time = "";
$line_id = 1;

//Start processing...;
foreach ($lines as $line_num => $line) {
	if($line_num < 15) {
		if(strpos($line, "File:") !== false){
			prepareTop($top_table_name, "File", $line, "-", 1);
			//echo "INSERTED:  File, " . substr($line, strrpos($line, ":")-1) . "<br />";
		}
		if(strpos($line, "Mode:") !== false){
			prepareTop($top_table_name, "Mode", $line, "+", 2);
			// echo "Mode, " . substr($line, strrpos($line, ":")+2) . "<br />";
		}
		if(strpos($line, "Time:") !== false){
			prepareTop($top_table_name, "Time", $line, "", 5);
			// echo "Time, " . substr($line, 5) . "<br />";
		}
		if(strpos($line, "\tRelease_Ver:  1") !== false){
			prepareTop($top_table_name, "GDB Version", $line, "+", 2);
			// echo "Geodatabase Version:, " . substr($line, strrpos($line, ":")+1) . "<br />";
		}
		if(strpos($line, "\tDescription:  \"1") !== false){
			prepareTop($top_table_name, "Description", $line, "+", 2);
			// echo "Description:, " . substr($line, strrpos($line, ":")+2) . "<br />";
		}
    }
	
    //check for missing timestamps
    if(strncmp($line, "[", strlen("]")) == 0){
        $cmd_timestamp = between($line, "[", "]");
        if($cmd_timestamp == "R" || $cmd_timestamp == "W"){
            $cmd_timestamp = "00:00:00.000";
        }
	    
	$cmd_time = "[" . $cmd_timestamp . "]";
	$stamp = substr($cmd_timestamp,2);
		
        //Add 1 to each line number to acconut for removing the ========================='s;
        if(strpos($line, "Command:") !== false){
            $line_id += 1;
            //array_push($com_sql, array($line_num +1, $line_id, $stamp, $cmd_time, substr($line, strrpos($line, ":")+2)));
            prepareComInf($com_table_name, $line_num +1, $line_id, $stamp, $cmd_time, trim(substr($line, strrpos($line, ":")+2)));
            //echo "Line: " . $line_num . "  Command: " . substr($line, strrpos($line, ":")+2) . "<br />";
        }
        else {
            //array_push($inf_sql, array($line_num +1, $line_id, $stamp, $cmd_time, trim(substr($line, strrpos($line, ":")+2))));
            prepareComInf($inf_table_name, $line_num +1, $line_id, $stamp, $cmd_time, trim(substr($line, strrpos($line, "]")+2)));
            //echo "Line: " . $line_num . "  Info: " . substr($line, strrpos($line, "]")+2) . "<br />";
        }
    }
    if(strncmp($line, "=", strlen("=")) != 0){
        if($line_num > 15){
            if(!strncmp($line, "[", strlen("]")) == 0){
				//array_push($inf_sql, array($line_num +1, $line_id, $stamp, $cmd_time, trim(substr($line, strrpos($line, ":")+2))));
                echo "Line: " . $line;
                prepareComInf($inf_table_name, $line_num + 1, $line_id, "00:00:00.000", "", $line);
            }
        }
    }
}

//Create indexes on the com and inf tables
$database->createComInfIndex("com_" . $table_name);
$database->createComInfIndex("inf_" . $table_name);
$database->insertTraceProperties($params);

function prepareTop($table_name, $desctiptor, $line, $line_adustment_operator, $line_adjustment_qty){
    global $database;
    if($line_adustment_operator == "-"){
        $line_desc = substr($line, strrpos($line, ":") - $line_adjustment_qty);
    }
    elseif($line_adustment_operator == "+") {
        $line_desc = substr($line, strrpos($line, ":") + $line_adjustment_qty);
    }
    else {
        $line_desc = substr($line, $line_adjustment_qty);
    }
	
    $params = array();
    array_push($params, $desctiptor, $line_desc);
    $database->insertTop($table_name, $params);
    unset($params);
}

function prepareComInf($table_name, $line_num, $line_id, $stamp, $cmd_time, $line){
    global $database;
    $params = array();
    array_push($params, $line_num, $line_id, $stamp, $cmd_time, $line);
    $database->insertComInf($table_name, $params);
    unset($params);
}

// Helper function for finding strings between strings.  Stolen from SO
function between($string, $start, $end){
    $string = ' ' . $string;
    $ini = strpos($string, $start);
    if ($ini == 0) return '';
    $ini += strlen($start);
    $len = strpos($string, $end, $ini) - $ini;
    return substr($string, $ini, $len);
}
