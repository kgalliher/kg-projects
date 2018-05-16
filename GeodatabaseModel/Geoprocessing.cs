using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geoprocessing;

namespace GeodatabaseModel
{
    class Geoprocessing
    {
        public static void CreateDatabaseView_GP(string inputConnString, string fcName, string viewName)
        {
            string viewDefinition = string.Format("SELECT * FROM {0}", fcName);

            IGeoProcessor2 geoProcessor = new GeoProcessorClass();
            IVariantArray parameters = new VarArrayClass();
            parameters.Add(inputConnString);
            parameters.Add(viewName);
            parameters.Add(viewDefinition);

            geoProcessor.Execute("CreateDatabaseView_management", parameters, null);
            Console.WriteLine(String.Format("Successfully created {0}", viewName));

        }

        /// <summary>
        /// Recreate the default Parcel Fabric Accuracy table.
        /// </summary>
        /// <param name="featureWorkspace"></param>
        /// <param name="connectionString"></param>
        /// <param name="fabricName"></param>
        /// <returns>ITable</returns>
        /// In progress - Not complete
        public static ITable MakeParcelFabricAccuracyTable(IFeatureWorkspace featureWorkspace, string connectionString, string fabricName)
        {
            IVariantArray parameters = new VarArrayClass();
            string parcelFabric = connectionString + "/" + fabricName;
            parameters.Add(parcelFabric);
            parameters.Add("ACCURACY");
            parameters.Add("temp_Accuracy");
            IGeoProcessor2 geoProcessor = new GeoProcessorClass();
            geoProcessor.Execute("MakeParcelFabricTableView_fabric", parameters, null);

            ITable table = null;
            return table;
        }

        /// <summary>
        /// Create an SDE connection file using parameters
        /// </summary>
        /// <param name="outFolderPath"></param>
        /// <param name="fileName"></param>
        /// <param name="dbmsPlatform"></param>
        /// <param name="instance"></param>
        /// <param name="authType"></param>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <param name="savePassword"></param>
        public static void createSDEConnectionFile_gp(String outFolderPath, String fileName, 
			String dbmsPlatform, String instance, String authType, String username, 
			String password, String savePassword)
	    {
		    GeoProcessor geoProcessor = new GeoProcessor();
		
		    IVariantArray parameters = new VarArrayClass();
		    parameters.Add(outFolderPath);
		    parameters.Add(fileName);
		    parameters.Add(dbmsPlatform);
		    parameters.Add(instance);
		    parameters.Add(authType);
		    parameters.Add(username);
		    parameters.Add(password);
		    parameters.Add(savePassword);
		
		    try
		    {
		        geoProcessor.Execute("CreateDatabaseConnection_management", parameters, null);
		    }
		    catch (Exception ex){
		        Console.WriteLine(ex.Message);
		    }
		
		    Console.WriteLine("Finished creating SDE Connection file: " + outFolderPath);
	    }

        public static void RebuildIndexes_GP(string gdbPath, string includeSystem, string[] featureClassList,
            string deltaOnly)
        {
            GeoProcessor geoProcessor = new GeoProcessorClass();
            IVariantArray parameters = new VarArrayClass();
            object sev = null;
            try
            {
                parameters.Add(gdbPath);
                parameters.Add(includeSystem);
                parameters.Add("Sami_Parcel");
                parameters.Add(deltaOnly);

                Console.WriteLine("Rebuilding indexes on feature classes:");
                foreach (var fcName in featureClassList)
                {
                    Console.WriteLine(fcName);
                    geoProcessor.Execute("RebuildIndexes_management", parameters, null);
                    Console.WriteLine("Finished rebuilding index.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(geoProcessor.GetMessages(ref sev));
                Console.WriteLine(ex.Message);
            }
        }

        public static void RunPythonScript(string file)
        {
            Process process = new Process();
            process.StartInfo.FileName = @"C:\Python27\ArcGIS10.6\python.exe";
            process.StartInfo.Arguments = file;
            try
            {
                process.Start();
                process.WaitForExit();
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR!!!!!!  " + ex.Message);
            }
        }
    }
}
