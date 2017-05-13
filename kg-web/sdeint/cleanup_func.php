<?php

require("database.php");

function cleanup($kill){
    $database = new Database();
    $sql = "select table_name from information_schema.tables where table_name like '%_intercept_%'";
    $drops = $database->fetchAllRows($sql);
    if($kill == "y"){
    foreach($drops as $drop){
        $delete_sql = "truncate table trace_storage";
        $database->dropTable($drop['table_name']);
        $database->executeStmt($delete_sql);
        echo "dropped " . $drop['table_name'] . "<br />";
        echo "deleted " . substr($drop['table_name'],4) . "<br />";
        }
    }
    else {
        echo "Here's what you are deleting:<br />";
        foreach($drops as $drop){
            $delete_sql = "DELETE FROM trace_storage WHERE trace_name ='" . substr($drop['table_name'],4) . "'";
            echo $drop['table_name'] . "<br />";
            echo $delete_sql . "<br />";
         }
    }
}

if(isset($_GET['kill'])){
    echo $_GET['kill'] . "<br />";
    cleanup($_GET['kill']);
}

?>