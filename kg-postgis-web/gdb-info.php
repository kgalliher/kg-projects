<?php require("includes/config.php"); ?>
<?php require("includes/database.php"); ?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=7,IE=9">
	<meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
	<title>ArcGIS GeoJSON Layer</title>
	<link rel="shortcut icon" href="//esri.github.io/quickstart-map-js/images/favicon.ico">
	<!-- ArcGIS API for JavaScript CSS-->
	<link rel="stylesheet" href="http://js.arcgis.com/3.14/esri/css/esri.css">
	<!-- Web Framework CSS - Bootstrap (getbootstrap.com) and Bootstrap-map-js (github.com/esri/bootstrap-map-js) -->
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" href="//esri.github.io/bootstrap-map-js/src/css/bootstrapmap.css">
	<style>
		.panel {
			max-width: 400px;
		}
		#mapDiv {
			height: 400px;
		}
	</style>
	<script src="http://js.arcgis.com/3.14/"></script>
	<!-- Terraformer reference -->
	<script src="./geojson-layer/vendor/terraformer/terraformer.min.js"></script>
	<script src="./geojson-layer/vendor/terraformer-arcgis-parser/terraformer-arcgis-parser.min.js"></script>
	<script src="js/map.js"></script>
</head>
<body>
<div class="panel panel-primary">
	<div class="panel-heading">
		<h3 class="panel-title">Spatial Properties for <?php echo strtoupper(DB_NAME); ?></h3>
	</div>
	<div class="panel panel-primary">
		<table class='table table-striped'><caption><strong>Spatial Tables</strong></caption><th>Table Name</th><th>Spatial Column</th>
			<?php foreach(PGDatabase::get_geom_table_info() as $table => $shape){ echo  "<tr><td>{$table}</td><td>{$shape}</td></tr>";} ?>
		</table>
	</div>
	<div class="panel panel-primary">
		<?php echo PGDatabase::get_pg_version(); ?>
	</div>
	<div class="panel panel-primary">
		<div class="form-group">				
			<label class="control-label">Spatial Table Extent</label>
			<select class="form-control" id="selGeoJson">
				<?php foreach(PGDatabase::layer_url() as $layer => $url){ echo "<option value='{$url}&get_bbox=Y'>{$layer}</option>"; } ?>
			</select>
		<br />
		<div id="mapDiv"></div>
		</div>
		<div class="form-group text-center">
            <button id="btnRemove" class="btn btn-default btn-block">Clear All</button>
        </div>
		<div class="form-group text-center">
			<a href='./index.php'><button id="btnRemove" class="btn btn-default btn-block">Back to Map</button></a>
		</div>
	</div>
</div>
</body>
</html>