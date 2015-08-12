'''
Ken Galliher - 08/12/15
Multiple functions using arcpy to create feature classes or tables with an excessive amount of columns.  

This was initially needed to test ArcGIS feature class and table column limitations.
'''
import arcpy

######## Using SQL to create a database table
def create_lotsa_sql_cols(sde_conn_file, new_table_name, num_cols):
    conn = arcpy.ArcSDESQLExecute(sde_conn_file)
    sql = lotsa_sql_cols(new_table_name, num_cols)
    conn.execute(sql)
    print("Finished creating table: {} with {} columns").format(new_table_name, num_cols)

def lotsa_sql_cols(new_table_name, num_cols):
    sql = "CREATE TABLE {} ".format(new_table_name)
    sql += "("
    for i in range(1,num_cols):
        sql += "col_{} varchar(20),\r".format(i)
    sql += ")"
    return sql[:-3] + ");"
#################################

######### Using Arcpy to create a table(.dbf) in a file geodatabase
def create_lotsa_fgdb_table(path_to_fgdb, table_name):
    print(table_name)
    arcpy.CreateTable_management(path_to_fgdb, table_name)
    print("Finished creating table {}".format(table_name))
    return table_name

def lotsa_fgdb_cols(path_to_fgdb, table_name, num_cols):
    table = create_lotsa_fgdb_table(path_to_fgdb, table_name)
    for i in range(1, num_cols):
        col_name = "col_{}".format(i)
        new_table_name = r"{}\{}.dbf".format(path_to_fgdb,table)
        arcpy.AddField_management(new_table_name, col_name, "DOUBLE" , 5)
    print("Finished adding columns to {}".format(table_name))
###################################

######### Using Arcpy to create a feature class in a file geodatabase
def create_sde_fc(path_to_sde, table_name):
    arcpy.CreateFeatureclass_management(path_to_sde, table_name, "POLYGON")
    print("Finished creating table {}".format(table_name))
    return table_name

def lotsa_cols_sde_fc(path_to_fgdb, table_name, num_cols):
    table = create_sde_fc(path_to_fgdb, table_name)
    for i in range(1, num_cols):
        col_name = "col_{}".format(i)
        new_table_name = r"{}\{}.dbf".format(path_to_fgdb,table)
        arcpy.AddField_management(new_table_name, col_name, "TEXT" , 5)
    print("Finished adding columns to {}".format(table_name))
###################################

######### Using Arcpy to create a table in an database.
def create_lotsa_sde_table(path_to_fgdb, table_name):
    arcpy.CreateTable_management(path_to_fgdb, table_name)
    print("Finished creating table {}".format(table_name))
    return table_name

def lotsa_sde_cols(path_to_fgdb, table_name, num_cols):
    table = create_lotsa_sde_table(path_to_fgdb, table_name)
    for i in range(1, num_cols):
        col_name = "col_{}".format(i)
        new_table_name = r"{}\{}.dbf".format(path_to_fgdb,table)
        arcpy.AddField_management(new_table_name, col_name, "TEXT" , 5)
    print("Finished adding columns to {}".format(table_name))
###################################

if __name__== "__main__":
    #lotsa_fgdb_cols(r"D:\IncidentFiles\01614212_Josh_04043\fgdb_499_cols.gdb", "table_499", 499)
    lotsa_fgdb_cols(r"D:\IncidentFiles\01614212_Josh_04043\fgdb_501_cols.gdb", "table_501", 501)
    #lotsa_cols_sde_fc(r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.2\ArcCatalog\DEI-LINUX_SDE102.sde", "fc_600_2", 600)
    #lotsa_sde_cols(r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.2\ArcCatalog\DEI-LINUX_SDE102.sde", "lotsa_sde2", 600)
    #create_lotsa_sql_cols(r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.2\ArcCatalog\KENG_ADDRESS.sde", "myLotsaCols", 500)