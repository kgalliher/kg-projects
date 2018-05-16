using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class DataCreation
    {
        /// <summary>
        /// Get the IDataset object that contains a given feature class
        /// </summary>
        /// <param name="connFile"></param>
        /// <param name="fcName"></param>
        /// <returns></returns>
        public static IDataset GetDatasetFromFeatureClass(string connFile, string fcName)
        {
            try
            {
                IWorkspace workspace = Connections.connectToSDE_cf(connFile);
                IFeatureWorkspace featureWorkspace = (IFeatureWorkspace)workspace;

                IWorkspace relativeWorkspace = Connections.connectToSDE_cf(connFile);
                IFeatureWorkspace relativeFeatureWorkspace = (IFeatureWorkspace)relativeWorkspace;
                IFeatureClass fc = featureWorkspace.OpenFeatureClass("sde.cities");
                IDataset ds = (IDataset)fc;
                return ds;
            }
            catch(Exception ex)
            {
                Console.WriteLine("Error getting IDataset from feature class: " + ex.Message);
            }

            return null;
        }

        /// <summary>
        /// From online sample - copy feature classes/datasets from one workspace to another.
        /// </summary>
        /// <param name="sourceWorkspace"></param>
        /// <param name="targetWorkspace"></param>
        /// <param name="fcName"></param>
        public static void CopyDatasets(string sourceWorkspace, string targetWorkspace, string fcName)
        {
            IWorkspaceName sourceWorkspaceName = new WorkspaceNameClass();
            IWorkspaceName targetWorkspaceName = new WorkspaceNameClass();
            IName targetName = (IName)targetWorkspaceName;

            // Set the workspace name properties.
            sourceWorkspaceName.PathName = sourceWorkspace;
            sourceWorkspaceName.WorkspaceFactoryProgID = "esriDataSourcesGDB.SdeWorkspaceFactory";

            targetWorkspaceName.PathName = targetWorkspace;
            targetWorkspaceName.WorkspaceFactoryProgID = "esriDataSourcesGDB.SdeWorkspaceFactory";

            // Create a name object for the source feature class.
            IFeatureClassName featureClassName = new FeatureClassNameClass();

            // Set the featureClassName properties.
            IDatasetName sourceDatasetName = (IDatasetName)featureClassName;
            sourceDatasetName.WorkspaceName = sourceWorkspaceName;
            sourceDatasetName.Name = fcName;
            IName sourceName = (IName)sourceDatasetName;

            // Create an enumerator for source datasets.
            IEnumName sourceEnumName = new NamesEnumeratorClass();
            IEnumNameEdit sourceEnumNameEdit = (IEnumNameEdit)sourceEnumName;

            // Add the name object for the source class to the enumerator.
            sourceEnumNameEdit.Add(sourceName);

            // Create a GeoDBDataTransfer object and a null name mapping enumerator.
            IGeoDBDataTransfer geoDBDataTransfer = new GeoDBDataTransferClass();
            IEnumNameMapping enumNameMapping = null;

            // Use the data transfer object to create a name mapping enumerator.
            bool conflictsFound = geoDBDataTransfer.GenerateNameMapping(sourceEnumName, targetName, out enumNameMapping);
            enumNameMapping.Reset();

            // Check for conflicts.
            if (conflictsFound)
            {
                // Iterate through each name mapping.
                INameMapping nameMapping = null;
                while ((nameMapping = enumNameMapping.Next()) != null)
                {
                    // Resolve the mapping's conflict (if there is one).
                    if (nameMapping.NameConflicts)
                    {
                        nameMapping.TargetName = nameMapping.GetSuggestedName(targetName);
                    }

                    // See if the mapping's children have conflicts.
                    IEnumNameMapping childEnumNameMapping = nameMapping.Children;
                    if (childEnumNameMapping != null)
                    {
                        childEnumNameMapping.Reset();

                        // Iterate through each child mapping.
                        INameMapping childNameMapping = null;
                        while ((childNameMapping = childEnumNameMapping.Next()) != null)
                        {
                            if (childNameMapping.NameConflicts)
                            {
                                childNameMapping.TargetName = childNameMapping.GetSuggestedName
                                    (targetName);
                            }
                        }
                    }
                }
            }

            // Start the transfer.
            geoDBDataTransfer.Transfer(enumNameMapping, targetName);

        }

        /// <summary>
        /// Simple creation of an empty feature dataset
        /// </summary>
        /// <param name="fdsName"></param>
        /// <param name="gdb"></param>
        /// <param name="spatialReference"></param>
        public static void CreateFeatureDataset(string fdsName, IWorkspace gdb, ISpatialReference spatialReference)
        {
            try
            {
                IFeatureWorkspace fws = gdb as IFeatureWorkspace;
                IFeatureDataset fds = fws.CreateFeatureDataset(fdsName, spatialReference);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error creating feature dataset: " + ex.Message);
            }
        }

        /// <summary>
        /// Simple creation of a feature class
        /// </summary>
        /// <param name="workspace"></param>
        /// <param name="featureClassName"></param>
        /// <param name="shapeFieldName"></param>
        /// <returns>IFeatureClass</returns>
        public static IFeatureClass CreateFeatureClass(IWorkspace workspace, String featureClassName,
            String shapeFieldName)
        {
            IFields fields = CreateFieldsCollection();

            IFeatureWorkspace featureWorkspace = (IFeatureWorkspace) workspace;
            IFeatureClass featureClass = featureWorkspace.CreateFeatureClass(featureClassName, fields, null, null,
                esriFeatureType.esriFTSimple, shapeFieldName, "");

            return featureClass;
        }

        /// <summary>
        /// Column definition for feature classes or tables
        /// </summary>
        /// <returns>IFields</returns>
        public static IFields CreateFieldsCollection()
        {

            IFields fields = new FieldsClass();

            // Cast to IFieldsEdit to modify the properties of the fields collection.
            IFieldsEdit fieldsEdit = (IFieldsEdit)fields;

            // Create the ObjectID field.
            IField oidField = new FieldClass();

            // Cast to IFieldEdit to modify the properties of the new field.
            IFieldEdit oidFieldEdit = (IFieldEdit)oidField;
            oidFieldEdit.Name_2 = "ObjectID";
            oidFieldEdit.AliasName_2 = "FID";
            oidFieldEdit.Type_2 = esriFieldType.esriFieldTypeOID;

            // Add the new field to the fields collection.
            fieldsEdit.AddField(oidField);

            // Create the text field.
            IField textField = new FieldClass();
            IFieldEdit textFieldEdit = (IFieldEdit)textField;
            textFieldEdit.Length_2 = 30;
            // Only string fields require that you set the length.
            textFieldEdit.Name_2 = "Name";
            textFieldEdit.Type_2 = esriFieldType.esriFieldTypeString;

            // Add the new field to the fields collection.
            fieldsEdit.AddField(textField);

            IGeometryDef geomDef = new GeometryDefClass();
            IGeometryDefEdit geomDefEdit = (IGeometryDefEdit) geomDef;
            geomDefEdit.GeometryType_2 = esriGeometryType.esriGeometryPoint;
            geomDefEdit.SpatialReference_2 = SpatialReference.GetSpatialReferenceFromWkid(4326);
            
            IField geomField = new FieldClass();
            IFieldEdit geomFieldEdit = (IFieldEdit) geomField;
            geomFieldEdit.Type_2 = esriFieldType.esriFieldTypeGeometry;
            geomFieldEdit.Name_2 = "Shape";
            geomFieldEdit.GeometryDef_2 = geomDef;
            fieldsEdit.AddField(geomField);

            return fields;
        }

        /// <summary>
        /// Insert one or more features into a feature class
        /// </summary>
        /// <param name="featureClass"></param>
        /// <param name="points"></param>
        public static void InsertFeature(IFeatureClass featureClass, IPoint[] points)
        {
            int cnt = 0;
           
            try
            {
                Console.WriteLine("Begin inserting points...");
                foreach (var point in points)
                {
                    IFeature feature = featureClass.CreateFeature();
                    feature.Shape = point;

                    feature.Store();
                    cnt++;
                }

                Console.WriteLine(string.Format("Finished inserting {0} points", cnt));
            }

            catch (Exception ex)
            {
                Console.WriteLine("Error occurred...\n\t" + ex.Message);
            }
        }

        public static void InsertFeature(IWorkspace workspace, string fcName, IPoint[] points)
        {
            int cnt = 0;
            
            IWorkspaceEdit wkspEdit = (IWorkspaceEdit)workspace;
            IFeatureWorkspace featureWorkspace = (IFeatureWorkspace)workspace;
            IFeatureClass featureClass = featureWorkspace.OpenFeatureClass(fcName);
            wkspEdit.StartEditing(false);

            try
            {
                wkspEdit.StartEditOperation();
                Console.WriteLine("Begin inserting points...");
                foreach (var point in points)
                {
                    IFeature feature = featureClass.CreateFeature();
                    feature.Shape = point;

                    feature.Store();
                    cnt++;
                }
                wkspEdit.StopEditOperation();
                Console.WriteLine(string.Format("Finished inserting {0} points", cnt));
            }

            catch (Exception ex)
            {
                Console.WriteLine("Error occurred...\n\t" + ex.Message);
            }
        }

        public static void InsertRow(ITable table)
        {
            try
            {
                IRow row = table.CreateRow();
                row.Value[1] = 4;
                row.Store();
                Console.WriteLine("1 row inserted");
            }

            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public static void TruncateTable(ITable table)
        {
            IQueryFilter2 qf2 = new QueryFilterClass();
            qf2.WhereClause = "OBJECTID NOT IS NULL";
            table.DeleteSearchedRows(qf2);

            Console.WriteLine("Finished");
        }

    }
}
