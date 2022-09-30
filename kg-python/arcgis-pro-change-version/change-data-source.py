import arcgisscripting
import arcpy, os
from arcgis import GIS
from arcgis.features._version import VersionManager

# map name and version to change to
_map = "ChangeVersionTemplate"
_version = "api_parcelrecord002"

# Access feature service and version manager with Python API
base_server_url = "https://dev0016752.esri.com/server/rest/services/Redlands/"
gis = GIS("https://dev0016752.esri.com/portal/", "admin", "esri.agp", verify_cert=False)

# ArcGIS Python API - VersionManagementServer - Create version and get its properties
version_management_server_url = f"{base_server_url}/VersionManagementServer"
vms = VersionManager(version_management_server_url, gis)
new_branch_version = vms.create(_version, "public", "New version for editing")

# Pro project and map objects
default_project_location = r"C:\Users\ken6574\Documents\ArcGIS\Projects"
project_path = os.path.join(default_project_location, "ChangeVersionTest")
pro_project = arcpy.mp.ArcGISProject(os.path.join(project_path, "ChangeVersionTest.aprx"))

pro_map = pro_project.listMaps(_map)
layers = pro_map[0].listLayers()

# update all feature layers to use new version
for l in layers:
    try:
        if not l.isBasemapLayer and not l.isGroupLayer:
            conn_props = l.connectionProperties
            updated_props = l.connectionProperties
            updated_props["connection_info"]["version"] = new_branch_version["versionInfo"]["versionName"]
            updated_props["connection_info"]["versionguid"] = new_branch_version["versionInfo"]["versionGuid"]
            l.updateConnectionProperties(l.connectionProperties, updated_props, validate=False)

    except AttributeError as ar:
        print(ar)
    except arcgisscripting.ExecuteError as se:
        print(se)
    except Exception as ex:
        print(ex)
print("Processed layers...")

try:
    # Save a copy of the project using the version name
    pro_project.saveACopy(os.path.join(r"E:\temp\project_py", f"{_version}.aprx"))
    print("Saved project")

    # # Map in same project... has issues
    # export .mapx for import into project
    # out_project_path = os.path.join(project_path, _version)
    # map_export = pro_map[0].exportToMAPX(f"{out_project_path}.mapx")
    # # import the .mapx into the project
    # if os.path.exists(f"{out_project_path}.mapx"):
    #     pro_project.importDocument(f"{out_project_path}.mapx")
    #     print("Imported map...")
    # pro_project.save()

except Exception as ex:
    print(ex)
