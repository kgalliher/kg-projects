import arcpy
from arcpy import env

workspace = r"C:\path\to\gdbconnection.sde"
env.workspace = workspace
feature_class = "SDO_Points"

# Create a polyline geometry
array = arcpy.Array([arcpy.Point(459111.6681, 5010433.1285),
                     arcpy.Point(472516.3818, 5001431.0808),
                     arcpy.Point(477710.8185, 4986587.1063)])
polyline = arcpy.Polyline(array)

# Open an InsertCursor and insert the new geometry
cursor = arcpy.da.InsertCursor(feature_class, ['SHAPE@'])
cursor.insertRow([polyline])

# Delete cursor object
del cursor
