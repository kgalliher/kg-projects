# Sqlite with Esri ST_Geometry
- Creates a new Sqlite database
- Enables the ability to use load_extension()
- Installs the stgeometry_sqlite lib
- Creates the OGC tables

#### stgeometry_sqlite.dll
This file can be found in the database_support folder in your ArcGIS Desktop installation

```python
import sqlite3

def createSqliteGdb(path_to_gdb):
    conn = sqlite3.connect(path_to_gdb)
    addStGeom(path_to_gdb)
  
  

def addStGeom(database_path):
    sqlite_database_path = database_path
    
    #arcpy.gp.CreateSQLiteDatabase(sqlite_database_path, "ST_GEOMETRY")
    #print("Created {}".format(sqlite_database_path))
    
    conn = sqlite3.Connection(sqlite_database_path)
    
    print("Connected")
    
    conn.enable_load_extension(True)
    print("Enabled load_extension")
    
    #query to create type.  Place the proper 32/64 bit st_gometry.dll in a good place.  
    #This example has the st_geometry.dll in the same folder as the database
    conn.execute('''SELECT load_extension('D:\\Data\\sqlite\\stgeometry_sqlite_64.dll','SDE_SQL_funcs_init')''')
    
    #Run the query to create the OGC tables.
    conn.execute("SELECT CreateOGCTables()")
    
    #Show me it's done'
    print("Fin")

if __name__ == '__main__':
    createSqliteGdb(r"D:\Data\sqlite\aarthi2.sqlite")
```
