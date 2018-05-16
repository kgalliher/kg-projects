using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.Carto;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.GeoDatabaseDistributed;
using ESRI.ArcGIS.GISClient;

namespace GeodatabaseModel
{

    class GeodataService
    {
        public static string gdsURL = @"http://sampleserver6.arcgisonline.com/arcgis/rest/services";
        public static string gdsName = "911CallsHotspot";

        /// <summary>
        /// Connect to AGS geodata service.  Partially from online sample
        /// </summary>
        /// <returns></returns>
        public static IGeoDataServer InitGeoDataServerFromInternetServer()
        {
            IPropertySet propertySet = new PropertySetClass();
            propertySet.SetProperty("URL", gdsURL);

            IAGSServerConnectionFactory agsServerConnectionFactory = new AGSServerConnectionFactoryClass();
            IAGSServerConnection agsServerConnection = agsServerConnectionFactory.Open(propertySet, 0);

            IAGSEnumServerObjectName enumServerObjectName = agsServerConnection.ServerObjectNames;
            enumServerObjectName.Reset();

            IAGSServerObjectName serverObjectName = null;
            IGeoDataServer geoDataServer = null;
            while ((serverObjectName = enumServerObjectName.Next()) != null)
            {
                if (serverObjectName.Name == gdsName)
                {
                    IName name = (IName) serverObjectName;
                    geoDataServer = (IGeoDataServer) name.Open();
                    break;
                }
            }
            return geoDataServer;
        }

        /// <summary>
        /// Get properties of a MapService layer
        /// </summary>
        /// <returns></returns>
        public static IMapServerLayer InitMapServerFromInternetServer()
        {
            IPropertySet propertySet = new PropertySetClass();
            propertySet.SetProperty("URL", gdsURL);

            IAGSServerConnectionFactory agsServerConnectionFactory = new AGSServerConnectionFactoryClass();
            IAGSServerConnection agsServerConnection = agsServerConnectionFactory.Open(propertySet, 0);

            IAGSEnumServerObjectName enumServerObjectName = agsServerConnection.ServerObjectNames;
            enumServerObjectName.Reset();

            IAGSServerObjectName serverObjectName = null;
            IMapServerLayer mapServerLayer = null;
            while ((serverObjectName = enumServerObjectName.Next()) != null)
            {
                if (serverObjectName.Name == gdsName)
                {
                    IName name = (IName)serverObjectName;
                    mapServerLayer = (IMapServerLayer)name.Open();
                    break;
                }
            }
            return mapServerLayer;
        }

        /// <summary>
        /// Describe a geodata service connection
        /// </summary>
        /// <param name="gdsServer"></param>
        public static void doStuffWithGDS(IGeoDataServer gdsServer)
        {
            Console.WriteLine(String.Format("GDS - Default Working Version: {0}", gdsServer.DefaultWorkingVersion));
            Console.WriteLine(String.Format("GDS - Max Record Count: {0}", gdsServer.MaxRecordCount));
        }

        public static void doStuffWithMps(IMapServerLayer gdsServer)
        {
           // Console.WriteLine(String.Format("GDS - Default Working Version: {0}", gdsServer.GetConnectionInfo(gdsServer.)));
        }

        /// <summary>
        /// Connect to AGS with IAGSServerConnectionFactory2
        /// </summary>
        public static void AGSConnection()
        {
            IAGSServerConnectionFactory2 agsConnectionFactory2 = new AGSServerConnectionFactoryClass();
            IPropertySet propsSet = new PropertySet();
            propsSet.SetProperty("URL", @"http://sampleserver6.arcgisonline.com/arcgis/rest/services");

            IAGSServerConnection agsConnection = agsConnectionFactory2.Open(propsSet, 0);
            IAGSEnumServerObjectName enumSOName = agsConnection.ServerObjectNames;
            IAGSServerObjectName soName = null;
            soName = enumSOName.Next();

            while (soName != null)
            {
                Console.WriteLine(soName.Name + ": " + soName.Type);
                //mapServerLayer.ServerConnect();
                soName = enumSOName.Next();
            }
        }

    }
}
