<?php
$sql = "select distinct c.line_num, i.line_num as inum, c.command, i.command as icmd from com_intercept_6574_01899352_444 c
		right join inf_intercept_6574_01899352_444 i
		ON c.line_id = i.line_id
		where c.command IN ('ExecuteSpatialQuery', 'NextBuffer', 'CloseStream')
		order by i.line_num";
$conn = new PDO("pgsql:dbname=sdeinterceptor;host=localhost;port=5433", "billybob", "billybob");
$stmt = $conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

// echo "<pre>";
// print_r($result);
// echo "</pre>";

$isBuffer = false;
$rowvals = array();
foreach($result as $key => $row){
	if($row['command'] == "ExecuteSpatialQuery"){
		echo "Key: {$key} -- Line #: {$row['line_num']}<br />";
	}
	// if($isBuffer ){
	// 	array_push($rowvals, trim(substr($result[$key -4]['icmd'], strpos($row['icmd'], ":"))));
	// }
	// echo "<pre>";
	// print_r($rowvals);
	// echo "</pre>";
}
