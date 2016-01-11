<?php require("includes/config.php");
      require("includes/database.php");
	  //require("includes/session.php");
	  
	 // if(!$session->is_logged_in()) { redirect_to("login.php"); }
	  
	  
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
<link rel="stylesheet" href="http://js.arcgis.com/3.14/esri/css/esri.css">
<!-- Web Framework CSS - Bootstrap (getbootstrap.com) and Bootstrap-map-js (github.com/esri/bootstrap-map-js) -->
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="//esri.github.io/bootstrap-map-js/src/css/bootstrapmap.css">
<link rel="stylesheet" href="css/style.css">

<!-- ArcGIS API for JavaScript library references -->

<script src="http://js.arcgis.com/3.14/"></script>

<!-- Terraformer reference -->
<script src="./geojson-layer/vendor/terraformer/terraformer.min.js"></script>
<script src="./geojson-layer/vendor/terraformer-arcgis-parser/terraformer-arcgis-parser.min.js"></script>
<script>
function popup(mylink, windowname) { if (! window.focus)return true; var href; if (typeof(mylink) == 'string') href=mylink; else href=mylink.href; window.open(href, windowname, 'width=405,height=800,scrollbars=yes'); return false; }
</script>
</head>
<body>
    <div class="panel panel-primary panel-fixed">
        <div class="panel-heading">
            <h3 class="panel-title">PostgreSQL GeoJSON Layers</h3>
            <button id="chevron" class="btn btn-primary btn-xs btn-absolute">
                <span class="glyphicon glyphicon-chevron-up"></span>
            </button>
        </div>
        <div class="panel-body collapse in" id = "panel">
            <p>Load GeoJSON directly from Postgres into the map as a layer. <a href="https://github.com/esri/Terraformer">Terraformer</a> is used to convert GeoJSON to ArcGIS JSON.</p>
            <div class="form text-left">
                <div class="form-group">
					
                    <label class="control-label">Available Layers</label>
					<select class="form-control" id="selGeoJson">
						<option></option>
						<?php foreach(PGDatabase::layer_url() as $layer => $url){ echo "<option value={$url}>{$layer}</option>"; } ?>
					</select>
                </div>
                <div class="form-group">
                    <label class="control-label">Your Data <a target="_blank" href="https://developers.arcgis.com/javascript/jshelp/ags_proxy.html">(URL/File/CORS Server)</a></label>
                    <div class="input-group">
                      <input type="text" class="form-control" id="geoJsonUrl" value="geojson-files/airports.geojson" placeholder="geojson-files/airports.geojson">
                      <span class="input-group-btn">
							<button id="btnAdd" class="btn btn-success" type="button">Load</button>
                      </span>
                    </div>
				</div>
				<div class="form-group">
					<label class="control-label">View Layer Extent</label>
					<div class="input-group">
						<select class="form-control" id="selGeoJsonHighlight">
							<option></option>
							<?php foreach(PGDatabase::layer_url() as $layer => $url){ echo "<option value='{$url}&get_bbox=Y'>{$layer}</option>"; } ?>
						</select>
					</div>
                </div>
				<br />
				<div class="form-group">
					<label class="control-label">Buffer a point layer</label>
					<div class="input-group">
						<select class="form-control" id="selGeoJsonBuff">
							<option></option>
							<?php foreach(PGDatabase::layer_url() as $layer => $url){ echo "<option id='buffItem' name='{$layer}' value={$url}>{$layer}</option>"; } ?>
						</select>
						<label class="control-label">Enter a buffer distance:</label>
						<div class="input-group">
						<input type="text" class="form-control" id="buffDist" value="0.05" placeholder="0.05">
						<span class="input-group-btn">
							<button id="btnBuff" class="btn btn-success" type="button">Buffer</button>
					  </span>
						</div>
					</div>
				</div>
					<br />
					<div class="form-group">
						<label class="control-label">Intersection</label>
						<div class="input-group">
							<select class="form-control" id="selGeoJsonIntersect1">
								<option></option>
								<?php foreach(PGDatabase::get_geom_table_info() as $table => $shape){ echo  "<option id='input2' value='{$table},{$shape}'>{$table}</option>";} ?>
							</select>
							<label class="control-label">Enter a layer to intersect:</label>
							<div class="input-group">
							<select class="form-control" id="selGeoJsonIntersect2">
								<option></option>
								<?php foreach(PGDatabase::get_geom_table_info() as $table => $shape){ echo  "<option id='input2' value='{$table},{$shape}'>{$table}</option>";} ?>
							</select>
							<span class="input-group-btn">
								<button id="btnIntersect" class="btn btn-success" type="button">Intersect</button>
							</span>
							</div>
							<br />
						</div>
					</div>
                <div class="form-group text-center">
                    <button id="btnRemove" class="btn btn-default btn-block">Clear All</button>
                </div>
				<div class="form-group text-center">
                    <a href="./gdb-info.php" onClick="return popup(this, 'notes')"><button id="btnRemove" class="btn btn-default btn-block">View Geodatabase Information</button></a>
                </div>
            </div>
        </div>
    </div>
    <div id="mapDiv"></div>
</body>
<script src="js/map.js"></script>
</html>