    using System;
using System.Collections.Generic;
using System.Text;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.GeoDatabaseDistributed;
using ESRI.ArcGIS.Geometry;
using Array = System.Array;

namespace GeodatabaseModel
{
    class Program
    {
        private static LicenseInitializer m_AOLicenseInitializer = new GeodatabaseModel.LicenseInitializer();
    
        [STAThread()]
        static void Main(string[] args)
        {
            //ESRI License Initializer generated code.
            m_AOLicenseInitializer.InitializeApplication(new esriLicenseProductCode[] { esriLicenseProductCode.esriLicenseProductCodeAdvanced },
            new esriLicenseExtensionCode[] { });
            //ESRI License Initializer generated code.

            try
            {
                #region LinqToSQL

                //LinqToSQL.CheckConnection();

                #endregion

                #region SDEGeodatabaseConnections

                //var gdbPath = @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.6\ArcCatalog\KENG2_SQL2016_SDE106_sde.sde";
                var sourceConnFile = @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.6\ArcCatalog\KENG2_SQL2016_SDE106_sde.sde";
                var parentConnFile = @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.6\ArcCatalog\KENG_SQL2016_PARENT_sde.sde";
                var relativeConnFile = @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.6\ArcCatalog\KENG_SQL2016_CHILD_sde.sde";

                #endregion

                #region Workspaces

                //string fgdbPath = @"D:\IncidentFiles\01985856_Douglass_Accuracy\FabricTest.gdb";
                //IWorkspace fgdbWorkspace = Connections.ConnectToFgdb(fgdbPath);
                //IFeatureWorkspace featureWorkspace = (IFeatureWorkspace) fgdbWorkspace;

                IWorkspace editRelativeWorkspace = Connections.connectToSDE_cf(relativeConnFile);
                IWorkspace editParentWorkspace = Connections.connectToSDE_cf(parentConnFile);
                Replica.UnregisterAllReplicas(parentConnFile);
                Replica.UnregisterAllReplicas(relativeConnFile);

                Geoprocessing.RunPythonScript(@"D:\Support\Geodata_Docs\Python\gp_tools\Py32bit27\Python27-103\ArcGIS\DataManagement\arcpy\CreateReplica.py");
                #endregion

                #region validate topology

                //string gdbPath = @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.5\ArcCatalog\KENG-SQL2016-SQLSRV1051_sde.sde";
                //IWorkspace workspace = Connections.connectToSDE_cf(gdbPath);
                //IFeatureWorkspace featureWorkspace = workspace as IFeatureWorkspace;
                //IFeatureDataset topologyFds = featureWorkspace.OpenFeatureDataset("TestFDS2");
                //ITopologyContainer2 topologyContainer2 = (ITopologyContainer2)topologyFds;
                //ITopology topology = topologyContainer2.get_Topology(0);
                //TopologyUtility.ValidateTopology(topology);

                #endregion

                #region Describe fields


                //ITable table = featureWorkspace.OpenTable("Export_Output");
                //Describe.ReportSchema(table);

                #endregion

                #region hide comments

                //IGeoDataServer gdsService = GeodataService.InitGeoDataServerFromInternetServer();
                //GeodataService.doStuffWithGDS(gdsService);
                //Replica.UnregisterAllReplicas(gdbPath);

                //GeodataService.AGSConnection();
                //List<string> replicas = Replica.GetReplicaNames(gdbPath);
                //foreach (var replica in replicas)
                //{
                //    Console.WriteLine(replica);
                //}
                //GeometricNetwork.GetErrorTable(workspace);

                //IFeatureClass featureClass = featureWorkspace.OpenFeatureClass("threedpts");
                #endregion

                #region Query
                /* Simple query of a table or feature class */

                //Console.WriteLine("Using: " + featureClass.AliasName);
                //Geodatabase.RecreateVersionedView(featureClass);
                //Query.QueryWithFilter(featureClass);


                //Query.GetColDef(workspace, "Bloomfield_Lines");
                //Query.QueryFeatureClassCoords(featureClass);

                //ITable table = featureWorkspace.OpenTable("test_table");
                //Query.QueryStandaloneTable(table, "description");

                #endregion

                #region Copy Paste Replica Worflow

                /* Add feature class to parent and child replica, register it, add a point, sync with child */
                var featureClassName = "sde.cities";
                DataCreation.CopyDatasets(sourceConnFile, parentConnFile, featureClassName);
                DataCreation.CopyDatasets(sourceConnFile, relativeConnFile, featureClassName);

                IDataset parentCopiedFeatureClass = DataCreation.GetDatasetFromFeatureClass(parentConnFile, featureClassName);
                IDataset relativeCopiedFeatureClass = DataCreation.GetDatasetFromFeatureClass(relativeConnFile, featureClassName);

                if(parentCopiedFeatureClass != null)
                    Versioning.RegisterAsVersioned(parentCopiedFeatureClass);
                else
                {
                    Console.WriteLine("Parent IDataset was null");
                    Environment.Exit(1);
                }
                    
                if (relativeCopiedFeatureClass != null)
                    Versioning.RegisterAsVersioned(relativeCopiedFeatureClass);
                else
                {
                    Console.WriteLine("Parent IDataset was null");
                    Environment.Exit(1);
                }

                Replica.AddDatasetToReplica(Connections.connectToSDE_cf(parentConnFile), "AOTest", featureClassName, "parent106", "sde",
                    esriDatasetType.esriDTFeatureClass, esriRowsType.esriRowsTypeAll, true, "", false);

                Replica.AddDatasetToReplica(Connections.connectToSDE_cf(relativeConnFile), "AOTest", featureClassName, "child106", "sde",
                    esriDatasetType.esriDTFeatureClass, esriRowsType.esriRowsTypeAll, true, "", false);

                Console.WriteLine("Registered Parent feature classes: ");
                Replica.ListReplicaFeatureClasses(Connections.connectToSDE_cf(parentConnFile), "AOTest");

                Console.WriteLine("Registered Child feature classes: ");
                Replica.ListReplicaFeatureClasses(Connections.connectToSDE_cf(relativeConnFile), "AOTest");

                //Make an edit to the child
                IPoint p1 = new PointClass();
                p1.SpatialReference = SpatialReference.GetSpatialReferenceFromWkid(4326);
                p1.PutCoords(-105.3202, -15.0203);

                IPoint[] ptArr = { p1 };
                DataCreation.InsertFeature(editRelativeWorkspace, featureClassName, ptArr);

                IGeoDataServer parentGDS = new GeoDataServerClass();
                IGeoDataServerInit parentGeoDataServerInit = (IGeoDataServerInit)parentGDS;
                parentGeoDataServerInit.InitWithWorkspace(editParentWorkspace);

                IGeoDataServer relativeGDS = new GeoDataServerClass();
                IGeoDataServerInit relativeGeoDataServerInit = (IGeoDataServerInit)relativeGDS;
                relativeGeoDataServerInit.InitWithWorkspace(editRelativeWorkspace);

                try
                {
                    Replica.SynchronizeReplica(parentGDS, relativeGDS, "AOTest", esriReplicationAgentReconcilePolicy.esriRAResolveConflictsNone, esriReplicaSynchronizeDirection.esriReplicaSynchronizeFromReplica2ToReplica1, true);
                }
                catch(Exception ex)
                {
                    Console.WriteLine("Sync failed: " + ex.Message);
                }
                #endregion
                #region Other
                //DataCreation.InsertRow(table);

                //Register.RegisterSpatialTable(workspace, "GIS.AA3", 4326);
                //Versioning.reconcileOnly(workspace, "editor1", "default");
                //GeometricNetwork.GeometricNetworkInfo(workspace, "SDE105.SDE.Water", "sde105.SDE.Water_Net");

                //string versionDiffPath =
                //    @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\KENG-SQL2014_KENG2014.sde";
                //string parentConnFile =
                //    @"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\KENG-SQL2014-ND-PF-Parent-sde.sde";
                //string relativeReplicaPath =
                //@"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.4\ArcCatalog\KENG-SQL2014-ND_PF_Child-sde.sde";
                //Geodatabase.ListVersions(workspace);
                //Geodatabase.findVersionDifferences(false, Connections.connectToSDE_cf(args[0]), "SDE.DEFAULT", "SDE.editor1", "Cities");

                //Geodatabase.findVersionDifferences(true, Connections.connectToSDE_cf(versionDiffPath), "SDE.DEFAULT", "SDE.editor1", "Cities");

                //Geodatabase.UpdateExtent(workspace);


                //IVersionedWorkspace versionedWorkspace = (IVersionedWorkspace)workspace;
                //IVersion version = versionedWorkspace.FindVersion("editor1");
                //Versioning.reconcileOnly(workspace, "editor1", "default");


                //Data creation
                //string fcName_string = "gdb_model_ao";
                //DataCreation.CreateFeatureClass(workspace, fcName_string, "Shape");



                //Index.RebuildSpatialIndex(featureClass);
                //IDataset dataset = (IDataset)featureClass;
                //SpatialOperator.compareGeometry(featureClass);
                //FeatureClassCalculation.CalculateAreaOfShape(featureClass);
                //Geodatabase.registerAsVersioned(dataset);
                //Geoprocessing.createSDEConnectionFile_gp(@"C:\Temp", "DotNetConn.sde", "ORACLE", "SUPT00568/sde1041", "DATABASE_AUTH", "sde", "sde" + "", "SAVE_USERNAME");

                //string includeSystem = "NO_SYSTEM";
                //string[] featureClasses = { "gdb_model_ao", "Curbs" };
                //string deltaOnly = "ALL";
                //Geoprocessing.RebuildIndexes_GP(gdbPath, includeSystem, featureClasses, deltaOnly);

                #endregion
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            //Do not make any call to ArcObjects after ShutDownApplication()
            m_AOLicenseInitializer.ShutdownApplication();

            Console.WriteLine("Press any key to continue...");
            Console.ReadKey();
        }
    }
}
