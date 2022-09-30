### Change Version in Pro Map

Each feature layer must be changed individually. There is currently no method to change the data source directly at the TOC.

Using the following:

1. Get the fully qualified branch version name and its GUID
2. Loop through each feature layer (flatten out the layers in the TOC from their groups and containers)
3. Get the current `connectionProperties` of the layer. This is a Dict{}
4. Create a copy of the current `connectionProperties and replace the version name and GUID
3. Use `<Layer>.updateConnectionProperties()` to replace the original connection properties with the updated copy

```
for l in layers:
    if not l.isBasemapLayer and not l.isGroupLayer:
        conn_props = l.connectionProperties
        updated_props = l.connectionProperties
        updated_props["connection_info"]["version"] = new_branch_version["versionInfo"]["versionName"]
        updated_props["connection_info"]["versionguid"] = new_branch_version["versionInfo"]["versionGuid"]

        l.updateConnectionProperties(l.connectionProperties, updated_props, validate=False)
```

`arcpy.mp.Layer`
https://pro.arcgis.com/en/pro-app/latest/arcpy/mapping/layer-class.htm
