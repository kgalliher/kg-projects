### Change Version in Pro Map

Each feature layer must be changed individually. There is currently no method to change the data source directly at the TOC.

Using the following:

1. Get the fully qualified branch version name and its GUID
2. Loop through each feature layer (flatten out the layers in the TOC from their groups and containers)
3. Get the current `connectionProperties` of the layer. This is a Dict{}
4. Create a copy of the current `connectionProperties and replace the version name and GUID
3. Use `<Layer>.updateConnectionProperties()` to replace the original connection properties with the updated copy

```
for lyr in layers:
    if not lyr.isBasemapLayer and not lyr.isGroupLayer:
        conn_props = lyr.connectionProperties
        updated_props = lyr.connectionProperties
        updated_props["connection_info"]["version"] = new_branch_version["versionInfo"]["versionName"]
        updated_props["connection_info"]["versionguid"] = new_branch_version["versionInfo"]["versionGuid"]

        lyr.updateConnectionProperties(lyr.connectionProperties, updated_props, validate=False)
```

`arcpy.mp.Layer`
https://pro.arcgis.com/en/pro-app/latest/arcpy/mapping/layer-class.htm
