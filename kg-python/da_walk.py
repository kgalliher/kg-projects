'''
Ken Galliher - 08/12/15

Using da.walk to list feature classes.  Additionally using os.path.join to get the full path.

'''
import os
import arcpy

def do_something(strings):
    print strings
    
def inventory_data(workspace, datatypes):
    """
    Generates full path names under a catalog tree for all requested
    datatype(s).

    Parameters:
    workspace: string
        The top-level workspace that will be used.
    datatypes: string | list | tuple
        Keyword(s) representing the desired datatypes. A single
        datatype can be expressed as a string, otherwise use
        a list or tuple. See arcpy.da.Walk documentation 
        for a full list.
    """
    for path, path_names, data_names in arcpy.da.Walk(
            workspace, datatype=datatypes):
        for data_name in data_names:
            yield os.path.join(path, data_name)


for feature_class in inventory_data(r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.3\ArcCatalog\KENG_BBOXTEST_sde.sde", "FeatureClass"):
    do_something(feature_class)
