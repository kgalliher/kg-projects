using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Geodatabase;
using ESRI.ArcGIS.Geometry;

namespace GeodatabaseModel
{
    class Register
    {
        /// <summary>
        /// Register a table created with SQL with a geodatabase.  
        /// </summary>
        /// <param name="workspace"></param>
        /// <param name="tableName"></param>
        /// <param name="srid"></param>
        public static void RegisterSpatialTable(IWorkspace workspace, string tableName, int srid)
        {
            try
            {
                IEnvelope env = new EnvelopeClass();
                env.XMax = 513486.325739993;
                env.XMin = 503102.592954323;
                env.YMax = 513486.325739993;
                env.YMin = 680330.926477545;


                IFeatureWorkspace fws = (IFeatureWorkspace) workspace;
                ITable table = fws.OpenTable(tableName);


                IClassSchemaEdit5 se5 = (IClassSchemaEdit5) table;

                se5.RegisterAsObjectClass("OBJECTID", "DEFAULTS");
                Console.WriteLine("Registered as object class...");
                Console.WriteLine("");
                se5.RegisterWithGeodatabase("", "SHAPE", esriGeometryType.esriGeometryPolygon,
                    SpatialReference.GetSpatialReferenceFromWkid(srid), env, "DEFAULTS");
                Console.WriteLine("Registered with gdb");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

    }
}
