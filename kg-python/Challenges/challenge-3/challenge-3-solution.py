import arcpy
from arcpy import env

wkspc = r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\KENG-SQL2016-SDE104_sde.sde"
env.workspace = wkspc

feature_class = arcpy.MakeFeatureLayer_management(wkspc + "/" + "SDE104.SDE.Curbs")

desc = arcpy.Describe(feature_class)

print("Feature Class: " + desc.nameString)
print("Feature Class Properties:")
print("\tShape Column: " + desc.shapeFieldName) 
print("\tStorage Type: " + desc.featureClass.geometryStorage) 
print("\tLength Column Name: " + desc.featureClass.lengthFieldName) 
print("\tFeature Type: " + desc.featureType)
print("\tShape Type: " + desc.shapeType)

print("\tHas Spatial Index: {0}".format(desc.hasSpatialIndex))
print("\tHas Z Column: {0}".format(desc.hasZ))
print("\tHas M Column: {0}".format(desc.hasM))