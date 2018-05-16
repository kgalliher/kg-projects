
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ESRI.ArcGIS.esriSystem;
using ESRI.ArcGIS.Geodatabase;

namespace GeodatabaseModel
{
    class Connections
    {
        public static IWorkspace connectToSDE_ps()
        {
            Guid sdeGuid = new Guid("D9B4FA40-D6D9-11D1-AA81-00C04FA33A15");
            Type factoryType = Type.GetTypeFromCLSID(sdeGuid);
            IWorkspaceFactory wsf = Activator.CreateInstance(factoryType) as IWorkspaceFactory;

            IPropertySet pSet = new PropertySetClass();
            pSet.SetProperty("Server", @"KENG");
            pSet.SetProperty("Instance", @"sde:sqlserver:KENG\SQL2014");
            pSet.SetProperty("Database", "keng2014");
            pSet.SetProperty("User", "sde");
            pSet.SetProperty("Password", "sde");
            //pSet.SetProperty("Version", "SDE.Default");

            IWorkspace ws = wsf.Open(pSet, 0);
            return ws;
        }

        public static IWorkspace connectToSDE_cf(string connectionFile)
        {
            Guid sdeGuid = new Guid("D9B4FA40-D6D9-11D1-AA81-00C04FA33A15");
            Type factoryType = Type.GetTypeFromProgID("esriDataSourcesGdb.SdeWorkspaceFactory");
            IWorkspaceFactory wsf = Activator.CreateInstance(factoryType) as IWorkspaceFactory;
            string sdeConnFile = @connectionFile;
            IWorkspace ws = wsf.OpenFromFile(sdeConnFile, 0);
            return ws;
        }

        public static IWorkspace ConnectToFgdb(string path)
        {
            Type factoryType = Type.GetTypeFromProgID(
                "esriDataSourcesGDB.FileGDBWorkspaceFactory");
            IWorkspaceFactory workspaceFactory = (IWorkspaceFactory)Activator.CreateInstance
                (factoryType);
            return workspaceFactory.OpenFromFile(path, 0);
        }


    }
}
