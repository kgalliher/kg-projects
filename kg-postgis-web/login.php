<?php
	require_once("includes/config.php");
	if(isset($_POST['submit'])){
	$username = $_POST['username'];
	$password = $_POST['password'];
	$server = $_POST['server'];
	$database = $_POST['database'];
	$port = $_POST['port'];
}
?>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=7,IE=9">
<meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
<title>ArcGIS GeoJSON Layer</title>
<link rel="shortcut icon" href="//esri.github.io/quickstart-map-js/images/favicon.ico">
<!-- ArcGIS API for JavaScript CSS-->
<link rel="stylesheet" href="//js.arcgis.com/3.10/js/esri/css/esri.css">
<!-- Web Framework CSS - Bootstrap (getbootstrap.com) and Bootstrap-map-js (github.com/esri/bootstrap-map-js) -->
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="//esri.github.io/bootstrap-map-js/src/css/bootstrapmap.css">
<link rel="stylesheet" href="css/style.css">

<!-- ArcGIS API for JavaScript library references -->
<script src="//js.arcgis.com/3.10"></script>

<script>
    require(["esri/map",
        "./src/geojsonlayer.js",
        "esri/renderers/SimpleRenderer",
        "dojo/on",
        "dojo/query",
        "dojo/dom",
		"dojo/parser",
        "dojo/domReady!"],
      function (Map, GeoJsonLayer, SimpleRenderer, on, query, dom, parser) {
		parser.parse();

        // Toggle panel
        on(query(".panel-heading")[0], "click", function () {
            if (query(".glyphicon.glyphicon-chevron-up")[0]) {
                query(".glyphicon").replaceClass("glyphicon-chevron-down", "glyphicon-chevron-up");
                query(".panel-body.collapse").removeClass("in");
            } else {
                query(".glyphicon").replaceClass("glyphicon-chevron-up", "glyphicon-chevron-down");
                query(".panel-body.collapse").addClass("in");
            }
        });
    });
	
	
</script>
</head>
<body>




    <div class="panel panel-primary panel-fixed">
        <div class="panel-heading">
            <h3 class="panel-title">PostgresGIS</h3>
            <button id="chevron" class="btn btn-primary btn-xs btn-absolute">
                <span class="glyphicon glyphicon-chevron-up"></span>
            </button>
        </div>
        <div class="panel-body collapse in">
            <p>Connect to a PostgreSQL Database</p>
            <div class="form text-left">
                <div class="form-group">
                    <form id="form_id" method="post" name="myform">
						<table>
							<tr><td><label>Username :</label></td><td><input type="text" name="username" id="username" required="true"/><td><tr>
							<tr><td><label>Password :</label></td><td><input type="password" name="password" id="password" required="true"/><td><tr>
							<tr><td><label>Server :</label></td><td><input type="text" name="server" id="server" required="true"/><td><tr>
							<tr><td><label>Database :</label></td><td><input type="text" name="database" id="database" required="true"/><td><tr>
							<tr><td><label>Port :</label></td><td><input type="text" name="port" id="port" required="true"/><td><tr>
						</table>
						</form>
                </div>
                <div class="form-group text-center">
                    <a href="http://keng:82/oop/index.php" style="cursor: pointer;"><button id="btnRemove" class="btn btn-default btn-block">GO!</button></a>
                </div>
            </div>
        </div>
    </div>
	
	<!--http://designscrazed.org/css-html-login-form-templates/Transparent Login Form-->
	<div id="image">
    <div id="mapDiv"
	<div class="body"></div>
	
		<div class="grad"></div>
		<div class="header">
			<div>PostgesGIS<span>Connect</span></div>
		</div>
		<br>
		<br>
		<title>Login Page</title>
		
	<div class="container">
	<div class="main">
	</div>
	</div>
	</div>
	</div>
	</div>
</body>
</html>