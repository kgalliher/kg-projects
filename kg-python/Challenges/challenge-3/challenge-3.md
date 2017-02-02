##Print the following output for a geodatabase feature class (values may vary per feature class).
	
Feature Class: SDE.Curbs_Layer
Feature Class Properties:
	Shape Column: Shape
	Storage Type: MSSQLGeometry
	Length Column Name: Shape.STLength()
	Feature Type: Simple
	Shape Type: Polyline
	Has Spatial Index: True
	Has Z Column: False
	Has M Column: False

	Requirements:
	- Connection to a geodatabase
	- Make a feature layer (to access feature class properties)
	- arcpy Describe
- String formatting and concatenation

Documentation:
http://desktop.arcgis.com/en/arcmap/latest/analyze/arcpy-functions/describe.htm 
http://desktop.arcgis.com/en/arcmap/latest/analyze/arcpy-functions/featureclass-properties.htm
http://desktop.arcgis.com/en/arcmap/latest/analyze/arcpy-functions/gdb-featureclass-properties.htm
http://desktop.arcgis.com/en/arcmap/latest/analyze/arcpy-functions/layer-properties.htm
