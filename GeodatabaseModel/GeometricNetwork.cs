using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Carto;
using ESRI.ArcGIS.DataSourcesGDB;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class GeometricNetwork
    {
        private static IGeometricNetwork geomNet;
        private static ISet geomErrs;
        private static ISet VerifyErrs;
        private static bool internalInconsistencies;
        #region Description
        // Reconcile a version
        // Test for GN error  
        // If GN error occurs, capture OID
        // Continue reconciling to test for error.
        #endregion

        public static void GetErrorTable(IWorkspace workspace)
        {
            IEnumDataset enumDataset = workspace.Datasets[esriDatasetType.esriDTFeatureDataset];
            enumDataset.Reset();

            IDataset dataset;
            
            
            while ((dataset = enumDataset.Next()) != null)
            {
                if (dataset.Name == "sde105.SDE.Water_Net")
                {
                    Console.WriteLine(dataset.Name);
                    INetworkCollection networkCollection = dataset as INetworkCollection;

                    try
                    {
                        if (networkCollection != null)
                        {
                            geomNet = networkCollection.get_GeometricNetworkByName("GIS.Water_Net");
                            //geomNet = networkCollection.GeometricNetworkByName["Water_GeometricNetwork"];
                            IFeatureWorkspace featureWorkspace = (IFeatureWorkspace)workspace;
                            IFeatureClass featureClass = featureWorkspace.OpenFeatureClass("GIS.Water_Net_Junctions");
                            IGeoDataset fcGeoDataset = (IGeoDataset) featureClass;
                            
                            IGeometricNetworkErrorDetection ged = (IGeometricNetworkErrorDetection)geomNet;
                            ITable errTable;
                            ged.CreateErrorTable("GN_Err2", out errTable);

                            ged.DetectNetworkErrors(esriNetworkErrorType.esriNETConnectivity, fcGeoDataset.Extent,VerifyErrs, out geomErrs);
                            while ((geomErrs.Next()) != null)
                            {
                                Console.WriteLine(geomErrs.Next().ToString());
                            }
                            //IGeometricNetworkConnectivity2 geomConnectivity2 = (IGeometricNetworkConnectivity2)geomNet;
                            //geomConnectivity2.CheckAndRepairConnectivity(false, @"C:\Temp\rebuildConnectivity.log", out geomErrs, out internalInconsistencies, null);


                            Query.QueryStandaloneTable(errTable, "test");
                        }
                            
                        

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }
                
            }
        }

        public static void GeometricNetworkInfo(IWorkspace workspace, String datasetName, String gnName)
        {
            IEnumDataset enumDataset = workspace.Datasets[esriDatasetType.esriDTFeatureDataset];
            enumDataset.Reset();
            IDataset dataset;

            while ((dataset = enumDataset.Next()) != null)
            {
                INetworkCollection networkCollection = dataset as INetworkCollection;

                if (dataset.Name.ToLower() == datasetName.ToLower())
                {
                    try
                    {
                        if (networkCollection != null) geomNet = networkCollection.get_GeometricNetworkByName(gnName);
                        IFeatureWorkspace featureWorkspace = (IFeatureWorkspace) workspace;
                        IFeatureClass featureClass = featureWorkspace.OpenFeatureClass("SDE.Water_Net_Junctions");
                        IGeoDataset fcGeoDataset = (IGeoDataset) featureClass;

                        IGeometricNetworkConnectivity2 geomConn2 = (IGeometricNetworkConnectivity2) geomNet;
                        geomConn2.CheckAndRepairConnectivity(true, @"C:\Temp\checkGN_Info.log", out geomErrs,
                            out internalInconsistencies, null);
                        Console.WriteLine("Finished rebuilding connectivity.  Check log.");

                       
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error from GeometricNetworkInfo: " + ex.Message);
                    }
                }
            }

            while ((geomErrs.Next()) != null)
            {
                Console.WriteLine("\t" + geomErrs.Next().ToString());
            }
        }

    }
}
