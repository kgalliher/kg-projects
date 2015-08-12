'''
Ken Galliher - 08/12/15

This script will identify relationship classes in a geodatabase, list its properties then assign privileges
to another user.

The bulk of the work is done by the XML SQL query to identify all realtionship classes.

SELECT ITEMS.Definition.value('(/DERelationshipClassInfo/CatalogPath)[1]', 'nvarchar(max)') AS Relationship_Class_and_dataset,
       ITEMS.Definition.value('(/DERelationshipClassInfo/Cardinality)[1]', 'nvarchar(max)') AS Relationship_Class_Cardinality,
       ITEMS.Definition.value('(/DERelationshipClassInfo/OriginClassNames/Name)[1]', 'nvarchar(max)') AS Origin_Class, 
       ITEMS.Definition.value('(/DERelationshipClassInfo/DestinationClassNames/Name)[1]', 'nvarchar(max)') AS Destination_Class 
FROM SDE.GDB_ITEMS AS ITEMS INNER JOIN SDE.GDB_ITEMTYPES AS ITEMTYPES 
    ON ITEMS.Type = ITEMTYPES.UUID 
WHERE 
     ITEMTYPES.Name = 'Relationship Class';

'''
import arcpy, sys, pyodbc, pprint
from arcpy import env

pp = pprint.PrettyPrinter(indent=4)

cnxn = pyodbc.connect('DRIVER={SQL Server};SERVER=KENG;DATABASE=SDE103')
cursor = cnxn.cursor()

wkspc = r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.3\ArcCatalog\KENG_SDE103_sde.sde"
env.workspace = wkspc

fc_list = []

def getManyToMany(schema):
    sql_statement = ("SELECT ITEMS.Definition.value('(/DERelationshipClassInfo/CatalogPath)[1]', 'nvarchar(max)') AS \"Relationship_Class_and_dataset\", "
            "ITEMS.Definition.value('(/DERelationshipClassInfo/Cardinality)[1]', 'nvarchar(max)') AS \"Relationship_Class_Cardinality\", "
             "ITEMS.Definition.value('(/DERelationshipClassInfo/OriginClassNames/Name)[1]', 'nvarchar(max)') AS \"Origin_Class\", "
              "ITEMS.Definition.value('(/DERelationshipClassInfo/DestinationClassNames/Name)[1]', 'nvarchar(max)') AS \"Destination_Class\" "
              "FROM "
               "{0}.GDB_ITEMS AS ITEMS INNER JOIN {0}.GDB_ITEMTYPES AS ITEMTYPES "
                "ON ITEMS.Type = ITEMTYPES.UUID "
                 "WHERE "
                  "ITEMTYPES.Name = 'Feature Class';") .format(schema)
    
    cursor.execute(sql_statement)
    row = cursor.fetchall()
    for r in row:
        if str(r[1]) == "esriRelCardinalityOneToOne":
            print "Feature classes defined as {0}".format(r[1])
            #print("Origin Class Name --> {0} \t\t Destination Class Name --> {1}".format(r[2], r[3]))
            fc_list.append(r[2])
            fc_list.append(r[3])
        else:
            print("No relationship classes to work on or Relationship Classes do not meet criteria.")
    print "+++++++++++++++++++++++++++"        
    return fc_list
        
def updateRCPrivileges(array):
    for fc in array:
        datasetName = wkspc + "/" + fc
        print datasetName
        try:
            arcpy.ChangePrivileges_management(datasetName, "gisadmin", "GRANT", "GRANT")
            print arcpy.GetMessages()
        except:
            print "An error occurred setting privileges:"
            print arcpy.GetMessages()
            

updateRCPrivileges(getManyToMany("sde"))
    
