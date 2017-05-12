<?php

require("database.php");

function cleanup($kill){
    $database = new Database();
    $sql = "select table_name from information_schema.tables where table_name like '%_intercept_%'";
    $drops = $database->fetchAllRows($sql);
    if($kill == "y"){
    foreach($drops as $drop){
        $database->dropTable($drop['table_name']);
        echo "dropped " . $drop['table_name'] . "<br />";
        }
    }
    else {
        echo "Here's what you are deleting:<br />";
        foreach($drops as $drop){
            echo $drop['table_name'] . "<br />";
         }
    }
}

if(isset($_GET['kill'])){
    echo $_GET['kill'] . "<br />";
    cleanup($_GET['kill']);
}

?>