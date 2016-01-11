require(["esri/map",
        "./geojson-layer/src/geojsonlayer.js",
        "esri/renderers/SimpleRenderer",
        "dojo/on",
        "dojo/query",
        "dojo/dom",
		"dojo/dom-construct",
        "dojo/domReady!"],
	function (Map, GeoJsonLayer, SimpleRenderer, on, query, dom, domConstruct) {
	  // Create map
	  var map = new Map("mapDiv", {
		  basemap: "gray",
		  center: [-122.5, 45.5],
		  zoom: 5
	  });
	  map.infoWindow.domNode.className += " light";
	  map.on("load", function () {
		  addGeoJsonLayer("geoprocessing/postgis.php?geotable=cacounties&geomfield=shape");
	  });
	  
	function selectGeoJsonData(e) {
		  var url;
		  // Get the user input
		  if (e.target.nodeName === "SELECT" && e.target.id === "selGeoJson") {
			  //url = dom.byId("geoJsonUrl").value = e.target.options[e.target.selectedIndex].value;
			  var x = document.getElementById("selGeoJson").value;
			  url = x;
			  console.log(" SelGeojson: " + url);
		  }
		  else if(e.target.id === "btnAdd") {
			  var x = document.getElementById("geoJsonUrl").value;
			  url = x;
			  console.log("BtnAdd: " + url);

		  } else {
			  var x = document.getElementById("selGeoJsonHighlight").value;
			  url = x;
			  console.log("Else: " + url);
			  
		  }
		  // Add the layer
		  addGeoJsonLayer(url);
	  }
	  
	/**TODO:
	 * Need to check to see if the underlying features are in the map before adding function results.
	 *  If not, add the underlying data as well.
	 */
	function bufferSelectedLayer(e) {
		  var url;
		  var buffDist;
		  // Get the user input
		  if (e.target.id === "SELECT") {
			  buffDist = dom.byId("buffDist").value = e.target.options[e.target.selectedIndex].value;
			  console.log(buffDist);
			  console.log(url + "&buff_dist=" + buffDist);
		  } else {
			  buffDist = dom.byId("buffDist").value;
			  buffItem = document.getElementById("buffItem").innerHTML;
			  url = dom.byId("selGeoJsonBuff").value + "&buff_dist=" + buffDist;
		  }
		  // Add the layer to the layer list and the graphics to the map.
		  dojo.place("<option value='" + url + "'>" + buffItem + " buffer</option>", "selGeoJson");
		  addGeoJsonLayer(url);
	  }

	function intersectSelectedLayer(e) {
		  var input1_vals = dom.byId("selGeoJsonIntersect1").value.split(",");
		  var input1_table = input1_vals[0];
		  var input1_geom = input1_vals[1];
		  
		  var input2_vals = dom.byId("selGeoJsonIntersect2").value.split(",");
		  var input2_table = input2_vals[0];
		  var input2_geom = input2_vals[1];
			
		  if (input1_table == undefined || input2_table == undefined) {
			alert("Please make a selection for the missing intersecting table(s).");
		  }
		  else {
			url = "geoprocessing/postgis.php?geotable=" + input1_table + "&geomfield=" + input1_geom + "&intersect_table=" + input2_table + "&intersect_geomfield=" + input2_geom;
			console.log(url);
		  }
		  dojo.place("<option value='" + url + "'>" + input1_table + "-" + input2_table + "-intersect</option>", "selGeoJson");
		  addGeoJsonLayer(url);
	  }
	  
	function addGeoJsonLayer(url) {
		  // Create the layer
		  var geoJsonLayer = new GeoJsonLayer({
			  url: url // ./data/dc-schools.json
		  });
		  geoJsonLayer.on("update-end", function (e) {
			  map.setExtent(e.target.extent.expand(1.6));
		  });
		  // Add to map
		  map.addLayer(geoJsonLayer);
		  var lys = map.getLayersVisibleAtScale(map.getScale());
	  }
	  
	function removeAllLayers() {
		var i, lyr, ids = map.graphicsLayerIds;
		for (i = ids.length -1; i > -1; i--) {
			lyr = map.getLayer(ids[i]);
			map.removeLayer(lyr);
		}
		map.infoWindow.hide();
	  }
	  
	  // Wire UI events
	  on(dom.byId("selGeoJson"), "change", selectGeoJsonData);
	  on(dom.byId("selGeoJsonHighlight"), "change", selectGeoJsonData);
	  on(dom.byId("btnAdd"), "click", selectGeoJsonData);
	  on(dom.byId("btnRemove"), "click", removeAllLayers);
	  on(dom.byId("btnBuff"), "click", bufferSelectedLayer);
	  on(dom.byId("btnIntersect"), "click", intersectSelectedLayer);
	  
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
